import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, chapter 37): crema = the textbook structure as drawn earlier, and
// data in memory; latte = secondary labels; taupe = data on disk, not yet read back; caramel =
// the thing to look at; cinnamon (rare) = the system's modification set against the textbook;
// cherry/cherryText = the bad outcome.
//
// Every printed number is examples.py's: key 4001 and its heap TIDs (0,0) to (0,4); a leaf of
// capacity 4 splitting 4 and 1; order:4001:status written at sequence numbers 10, 20, 30 and
// deleted at 40, the snapshot at 25 reading "shipped"; level sizes 4, 40, 400 and 4,000 MB; a
// 5 MB filter block against a 4 KB data block, 1,280 times; a 0.05 MB top-level index; block
// reads 2, 2, 1 and 2.

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** Which of n beats spread over [a, b] has started: -1 before a, then 0 to n - 1. */
const stepIdx = (x: number, a: number, b: number, n: number) => (x < a ? -1 : Math.min(n - 1, Math.floor(((x - a) / (b - a)) * n)));

/** Question opacity: shown until the reveal starts, then gone at once. */
const rev = (ask: number, r: number) => (r > 0 ? 0 : ask);

/** One leaf entry: a key cell, and (when tid is given) the heap TID riding beside it. */
function Entry({ x, y, k = '4001', tid, o = 1, tidO = 1, hot = false }: { x: number; y: number; k?: string; tid?: string; o?: number; tidO?: number; hot?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={64} height={24} fill={C.roast} stroke={hot ? C.caramel : C.crema} strokeWidth={1.5} />
      <T x={x + 32} y={y + 17} s={12} a="middle" f={C.crema}>{k}</T>
      {tid && (
        <g opacity={tidO}>
          <rect x={x + 64} y={y} width={64} height={24} fill={C.roast} stroke={C.cinnamon} strokeWidth={1.5} />
          <T x={x + 96} y={y + 17} s={12} a="middle" f={C.cinnamon}>{tid}</T>
        </g>
      )}
    </g>
  );
}

// 1 · Hook: a filter block far larger than the data block it protects
export function FilterHook({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.8));
  const fill = seg(t, 1.0, 3.0);
  const ask = easeOut(seg(t, 3.2, 3.9));
  const cut = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  const idx = answered ? easeOut(seg(s, 1.0, 1.8)) : 0;
  const pick = answered ? easeOut(seg(s, 1.9, 2.6)) : 0;
  const cols = 64;
  const rows = 20;
  const shown = Math.floor(fill * cols * rows);
  return (
    <Svg label="A 4 KB data block, one small square, beside a 5 MB filter block, 1,280 squares. After answering: the filter is cut into partitions, a tiny top-level index points at them, and a lookup loads only one partition" h={290}>
      <g opacity={a}>
        <rect x={30} y={60} width={7} height={7} fill={C.crema} />
        <T x={30} y={44} s={12} f={C.crema}>data block: 4 KB</T>
      </g>
      <T x={300} y={24} s={12} f={C.latte} o={fill > 0 ? 1 : 0}>filter block: 5 MB</T>
      {Array.from({ length: Math.min(shown, cols * rows) }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const part = Math.floor(c / 8);
        return <rect key={i} x={70 + c * 7 + part * 4 * cut} y={90 + r * 7} width={5.5} height={5.5} fill={pick > 0 && part === 5 ? C.caramel : answered ? C.taupe : C.latte} opacity={pick > 0 && part !== 5 ? 0.5 : 1} />;
      })}
      <T x={300} y={256} s={13} a="middle" f={C.caramel} o={rev(ask, cut)}>1,280 times the data block: now what?</T>
      <g opacity={idx}>
        <rect x={290} y={48} width={22} height={14} fill={C.cinnamon} />
        <T x={320} y={60} s={12} f={C.cinnamon}>top-level index</T>
        {Array.from({ length: 8 }, (_, p) => (
          <line key={p} x1={301} y1={62} x2={70 + p * 60 + 28} y2={88} stroke={C.cinnamon} strokeWidth={1} opacity={pick > 0 && p !== 5 ? 0.3 : 1} />
        ))}
      </g>
      <T x={300} y={256} s={13} a="middle" f={C.caramel} o={pick}>the filter, paged: one partition on demand</T>
    </Svg>
  );
}

// 2 · The B+-tree leaf: the textbook key alone, and the engine's key with a second value
export function BTreeTwoColumn({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const tree = easeOut(seg(t, 0.6, 1.6));
  const b = easeOut(seg(t, 2.0, 2.8));
  const slide = easeInOut(seg(t, 2.8, 3.8));
  return (
    <Svg label="Left: the Chapter 5 B+-tree, three levels, a leaf entry just a key. Right: the engine's leaf entry, the key 4001 with a heap TID riding beside it" h={260}>
      <g opacity={a}>
        <T x={140} y={26} s={12} a="middle" f={C.latte}>Chapter 5: key only</T>
        <line x1={300} y1={20} x2={300} y2={230} stroke={C.mocha} />
      </g>
      <g opacity={tree}>
        <rect x={115} y={44} width={50} height={20} fill={C.roast} stroke={C.crema} />
        {[0, 1].map((i) => (
          <g key={i}>
            <line x1={140} y1={64} x2={80 + i * 120} y2={96} stroke={C.mocha} />
            <rect x={55 + i * 120} y={96} width={50} height={20} fill={C.roast} stroke={C.crema} />
            {[0, 1].map((j) => (
              <line key={j} x1={80 + i * 120} y1={116} x2={50 + i * 120 + j * 60} y2={148} stroke={C.mocha} />
            ))}
          </g>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={30 + i * 60} y={148} width={40} height={18} fill={i === 1 ? C.caramel : C.roast} stroke={C.crema} />
        ))}
        <Entry x={108} y={188} />
      </g>
      <g opacity={b}>
        <T x={450} y={26} s={12} a="middle" f={C.cinnamon}>the engine's leaf entry</T>
        <Entry x={386} y={110} tid="(0,0)" tidO={slide} />
        <T x={450} y={170} s={12} a="middle" f={C.latte} o={slide}>key, plus a second value</T>
      </g>
    </Svg>
  );
}

// 3 · PostgreSQL: the heap TID breaks every tie, duplicates sorted in TID order
export function TidTiebreaker({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const tid = easeOut(seg(t, 1.2, 2.0));
  const sort = easeInOut(seg(t, 2.6, 3.8));
  const done = easeOut(seg(t, 4.0, 4.7));
  const start = [2, 0, 1]; // the order the three duplicates are drawn in before sorting
  return (
    <Svg label="Three entries with the same key 4001 cannot be told apart. Each gets its heap TID, (0,2), (0,0), (0,1); sorted by TID they become (0,0), (0,1), (0,2), and no two entries are identical" h={260}>
      <T x={300} y={26} s={12} a="middle" f={C.latte} o={a}>every btree key must be unique</T>
      {start.map((n, i) => (
        <Entry key={n} x={236} y={lerp(56 + i * 36, 56 + n * 36, sort)} tid={`(0,${n})`} tidO={tid} o={a} hot={done > 0.5} />
      ))}
      <T x={120} y={92} s={13} a="middle" f={C.cherryText} o={a * (1 - tid)}>a tie, three times</T>
      <T x={300} y={192} s={13} a="middle" f={C.cinnamon} o={tid * (1 - done)}>the heap TID breaks the tie</T>
      <T x={300} y={192} s={13} a="middle" f={C.caramel} o={done}>sorted in heap-TID order</T>
      <T x={300} y={220} s={12} a="middle" f={C.latte} o={done}>no two entries truly identical</T>
    </Svg>
  );
}

// 4 · Measured: five rows, one key, five unique entries
export function DuplicateEntries({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.7));
  const k = stepIdx(t, 0.8, 3.0, 5);
  const done = easeOut(seg(t, 3.3, 4.0));
  return (
    <Svg label="Five order rows for customer 4001 become five leaf entries: the key repeats five times, the TIDs (0,0) to (0,4) differ, so every entry is unique and sorted" h={270}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>five order rows, one customer</T>
      {[0, 1, 2, 3, 4].map((i) => (
        <Entry key={i} x={236} y={40 + i * 32} tid={`(0,${i})`} o={i <= k ? 1 : 0} hot={i === k && done === 0} />
      ))}
      <T x={226} y={57} s={12} a="end" f={C.latte} o={k >= 0 ? 1 : 0}>key ×5</T>
      <T x={384} y={57} s={12} f={C.cinnamon} o={k >= 4 ? 1 : 0}>TIDs differ</T>
      <T x={300} y={226} s={13} a="middle" f={C.caramel} o={done}>five entries, all unique, order holds</T>
    </Svg>
  );
}

// 5 · Predict: a leaf full of one key must split; half and half?
export function PredictSplit({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.8));
  const over = easeOut(seg(t, 1.0, 1.8));
  const ask = easeOut(seg(t, 2.2, 3.0));
  const sp = answered ? easeInOut(seg(s, 0.2, 1.4)) : 0;
  const lab = answered ? easeOut(seg(s, 1.5, 2.1)) : 0;
  return (
    <Svg label="A leaf of capacity 4 holds four entries of key 4001 and a fifth arrives. After answering: the split leaves four on the left page, full, and one on the right" h={270}>
      <g opacity={a}>
        <T x={300} y={24} s={12} a="middle" f={C.latte}>leaf page, capacity 4</T>
        <rect x={lerp(150, 40, sp) - 6} y={40} width={4 * 66 + 12} height={36} fill="none" stroke={C.mocha} />
      </g>
      {[0, 1, 2, 3, 4].map((i) => {
        const sx = 150 + i * 66;
        const tx = i < 4 ? 40 + i * 66 : 420;
        const ty = i < 4 ? 46 : 120;
        return (
          <g key={i} opacity={i < 4 ? a : over}>
            <rect x={lerp(i < 4 ? sx : 300, tx, sp)} y={lerp(i < 4 ? 46 : 96, ty, sp)} width={58} height={24} fill={i === 4 ? C.cherry : C.roast} stroke={C.crema} strokeWidth={1.5} />
            <T x={lerp(i < 4 ? sx : 300, tx, sp) + 29} y={lerp(i < 4 ? 46 : 96, ty, sp) + 17} s={12} a="middle" f={C.crema}>4001</T>
          </g>
        );
      })}
      <rect x={414} y={114} width={4 * 66 - 90} height={36} fill="none" stroke={C.mocha} opacity={sp} />
      <T x={300} y={200} s={13} a="middle" f={C.caramel} o={rev(ask, sp)}>split half and half, like distinct keys?</T>
      <g opacity={lab}>
        <T x={170} y={110} s={12} a="middle" f={C.crema}>left: 4, full</T>
        <T x={300} y={200} s={13} a="middle" f={C.caramel}>no: four left, one right</T>
        <T x={300} y={228} s={12} a="middle" f={C.latte}>a bet on ascending-TID inserts</T>
      </g>
    </Svg>
  );
}

// 6 · Measured: the lopsided split
export function LopsidedSplit({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const r = easeOut(seg(t, 2.0, 2.8));
  const note = easeOut(seg(t, 3.2, 4.0));
  const W = 200;
  // The duplicate rows drop into the left page one by one until it is full; the fifth has nowhere to go and is pushed
  // out sideways, across the gap, into the new right page. Then each page's fill gauge runs out to its share.
  const drop = (i: number) => easeOutBack(seg(t, 0.8 + i * 0.3, 1.1 + i * 0.3));
  const push = easeInOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="After the split: the left page holds 4 of 4 slots, full; the right page holds 1 of 4, a quarter full" h={260}>
      <g opacity={a}>
        <T x={180} y={40} s={12} a="middle" f={C.latte}>left page</T>
        <T x={420} y={40} s={12} a="middle" f={C.latte}>right page</T>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={80 + i * 50} y={60} width={44} height={60} fill={C.cocoa} />
            <rect x={320 + i * 50} y={60} width={44} height={60} fill={C.cocoa} />
          </g>
        ))}
      </g>
      {[0, 1, 2, 3].map((i) => {
        const k = drop(i);
        return k > 0 ? <rect key={i} x={80 + i * 50} y={lerp(20, 60, k)} width={44} height={60} fill={C.crema} opacity={clamp(k * 2)} /> : null;
      })}
      {t >= 1.9 && (
        <rect x={lerp(280, 320, push)} y={lerp(20, 60, easeOut(seg(t, 1.9, 2.2))) - Math.sin(Math.PI * push) * 14} width={44} height={60} fill={C.cinnamon} opacity={lerp(0.6, 1, r)} />
      )}
      <T x={180} y={146} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 1.9, 2.2))}>4 of 4: full</T>
      <T x={420} y={146} s={13} a="middle" f={C.cinnamon} o={r}>1 of 4</T>
      {note > 0 && <rect x={80} y={170} width={Math.max(2, W * note)} height={10} fill={C.crema} />}
      {note > 0 && <rect x={320} y={170} width={Math.max(2, W * 0.25 * note)} height={10} fill={C.cinnamon} />}
      <rect x={80} y={170} width={W} height={10} fill="none" stroke={C.line} opacity={note} />
      <rect x={320} y={170} width={W} height={10} fill="none" stroke={C.line} opacity={note} />
      <T x={300} y={224} s={13} a="middle" f={C.caramel} o={note}>the fallback's own assumption, measured</T>
    </Svg>
  );
}

// 7 · The LSM tree: the textbook entry, and RocksDB's key with a sequence number
export function LsmTwoColumn({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const b = easeOut(seg(t, 2.3, 3.0));
  const seq = easeOut(seg(t, 3.0, 3.8));
  const sizes = [4, 40, 400, 4000];
  // The levels build downward, each one wider than the last as it lands. On the right the stored key slides in, and
  // the sequence number slides out from behind it and locks on beside it: the extra field riding with every key.
  const lv = (i: number) => easeOut(seg(t, 0.6 + i * 0.35, 1.0 + i * 0.35));
  return (
    <Svg label="Left: the Chapter 5 LSM tree, levels of 4, 40, 400 and 4,000 MB, each entry a user key and a value. Right: RocksDB's stored key, the user key with a sequence number beside it" h={260}>
      <T x={140} y={26} s={12} a="middle" f={C.latte} o={a}>Chapter 5: key and value</T>
      {sizes.map((mb, i) => {
        const k = lv(i);
        return (
          <g key={mb} opacity={k > 0 ? 1 : 0}>
            <rect x={30} y={44 + i * 34} width={Math.max(2, (30 + i * 40) * k)} height={22} fill={C.roast} stroke={C.crema} />
            <T x={70 + i * 40} y={60 + i * 34} s={12} f={C.latte} o={k}>{`${mb.toLocaleString('en-US')} MB`}</T>
          </g>
        );
      })}
      <line x1={300} y1={20} x2={300} y2={230} stroke={C.mocha} opacity={a} />
      <g opacity={b}>
        <T x={450} y={26} s={12} a="middle" f={C.cinnamon}>RocksDB's stored key</T>
        <g opacity={seq}>
          <rect x={lerp(450, 510, seq)} y={90} width={60} height={26} fill={C.roast} stroke={C.cinnamon} strokeWidth={1.5} />
          <T x={lerp(480, 540, seq)} y={108} s={12} a="middle" f={C.cinnamon}>seq</T>
          <T x={450} y={lerp(166, 156, seq)} s={12} a="middle" f={C.latte}>user key, plus a sequence number</T>
        </g>
        <g transform={`translate(${((1 - b) * 30).toFixed(2)} 0)`}>
          <rect x={320} y={90} width={190} height={26} fill={C.roast} stroke={C.crema} strokeWidth={1.5} />
          <T x={415} y={108} s={12} a="middle" f={C.crema}>order:4001:status</T>
        </g>
      </g>
      <Reticle x={540} y={103} w={70} h={36} t={t} at={3.8} color={C.cinnamon} />
    </Svg>
  );
}

const VERSIONS: [number, string][] = [
  [10, 'placed'],
  [20, 'shipped'],
  [30, 'delivered'],
];

// 8 · RocksDB's comparator: same key, sequence number descending, newest on top
export function SequenceOrder({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const k = stepIdx(t, 0.6, 2.0, 3);
  const flip = easeInOut(seg(t, 2.4, 3.6));
  const note = easeOut(seg(t, 3.9, 4.6));
  return (
    <Svg label="Three writes of order:4001:status at sequence numbers 10, 20 and 30 arrive in time order, then the comparator stacks them sequence-descending: 30, delivered, on top" h={270}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>order:4001:status, three writes</T>
      {VERSIONS.map(([seq, v], i) => {
        const x = lerp(20 + i * 190, 205, flip);
        const y = lerp(80, 60 + (2 - i) * 40, flip);
        return (
          <g key={seq} opacity={i <= k ? 1 : 0}>
            <rect x={x} y={y} width={190} height={30} fill={C.roast} stroke={i === 2 && flip > 0.5 ? C.caramel : C.crema} strokeWidth={1.5} />
            <T x={x + 12} y={y + 20} s={12} f={C.cinnamon}>{`seq ${seq}`}</T>
            <T x={x + 180} y={y + 20} s={12} a="end" f={C.crema}>{v}</T>
          </g>
        );
      })}
      <T x={300} y={150} s={12} a="middle" f={C.taupe} o={k >= 0 ? 1 - flip : 0}>time →</T>
      <T x={404} y={80} s={12} f={C.caramel} o={flip}>← newest first</T>
      <g opacity={note}>
        <T x={300} y={218} s={13} a="middle" f={C.crema}>user key ascending, seq descending</T>
        <T x={300} y={246} s={12} a="middle" f={C.latte}>the latest value is the first one found</T>
      </g>
    </Svg>
  );
}

const STACK: [number, string][] = [
  [40, 'delete ✝'],
  [30, 'delivered'],
  [20, 'shipped'],
  [10, 'placed'],
];

function VersionStack({ x, y, o = 1, hit, dim }: { x: number; y: number; o?: number; hit?: number; dim?: (i: number) => number }) {
  return (
    <g opacity={o}>
      {STACK.map(([seq, v], i) => (
        <g key={seq} opacity={dim ? dim(i) : 1}>
          <rect x={x} y={y + i * 34} width={180} height={28} fill={hit === i ? (seq === 40 ? C.cherry : C.roast) : C.roast} stroke={hit === i ? (seq === 40 ? C.cherryText : C.caramel) : C.crema} strokeWidth={hit === i ? 2.5 : 1.5} />
          <T x={x + 12} y={y + i * 34 + 19} s={12} f={C.cinnamon}>{`seq ${seq}`}</T>
          <T x={x + 170} y={y + i * 34 + 19} s={12} a="end" f={seq === 40 ? C.cherryText : C.crema}>{v}</T>
        </g>
      ))}
    </g>
  );
}

// 9 · Measured: a snapshot at 25 reads "shipped"; a live read sees the delete
export function SnapshotRead({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const scan = stepIdx(t, 1.0, 2.8, 3); // 0: seq 40 skipped, 1: seq 30 skipped, 2: lands on 20
  const live = easeOut(seg(t, 3.6, 4.4));
  const y0 = 50;
  return (
    <Svg label="The stack: seq 40 delete, 30 delivered, 20 shipped, 10 placed. A snapshot at 25 skips 40 and 30 and lands on 20, shipped. A live read lands on 40 first: the delete" h={270}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>written 10, 20, 30, deleted at 40</T>
      <VersionStack x={210} y={y0} o={a} hit={scan === 2 ? 2 : undefined} dim={(i) => (live > 0.5 && i === 0 ? 1 : i < scan ? 0.4 : 1)} />
      <rect x={208} y={y0 - 2} width={184} height={32} fill="none" stroke={C.cherryText} strokeWidth={2.5} opacity={live} />
      <g opacity={scan >= 0 ? 1 : 0}>
        <T x={196} y={y0 + Math.max(0, scan) * 34 + 19} s={12} a="end" f={C.caramel}>snapshot 25 →</T>
      </g>
      <T x={400} y={y0 + 2 * 34 + 19} s={13} f={C.caramel} o={scan === 2 ? 1 : 0}>reads "shipped"</T>
      <g opacity={live}>
        <T x={400} y={y0 + 19} s={12} f={C.cherryText}>← live read: deleted</T>
      </g>
      <T x={300} y={252} s={12} a="middle" f={C.latte} o={live}>nothing written after 25 reaches the snapshot</T>
    </Svg>
  );
}

// 10 · A seek, not a scan
export function SeekNotScan({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const jump = easeInOut(seg(t, 1.0, 2.0));
  const land = easeOut(seg(t, 2.0, 2.6));
  const reuse = easeOut(seg(t, 3.2, 4.0));
  const y0 = 50;
  return (
    <Svg label="One seek lands directly on the first version at or before the snapshot, seq 20; the versions above it are never read one by one. A later topic's merging iterator reads the same ordering" h={270}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>seek(order:4001:status, at or before 25)</T>
      <VersionStack x={240} y={y0} o={a} hit={land > 0.5 ? 2 : undefined} dim={(i) => (land > 0.5 && i !== 2 ? 0.35 : 1)} />
      <path d={`M 120 ${y0 - 10} Q 180 ${y0 - 10} ${lerp(120, 236, jump)} ${lerp(y0 - 10, y0 + 2 * 34 + 14, jump)}`} fill="none" stroke={C.caramel} strokeWidth={2} opacity={jump > 0 ? 1 : 0} />
      <T x={60} y={y0 - 6} s={12} f={C.caramel} o={a}>seek</T>
      <T x={300} y={208} s={13} a="middle" f={C.caramel} o={land}>one landing, no scan of history</T>
      <T x={300} y={236} s={12} a="middle" f={C.latte} o={reuse}>the merging iterator reuses this order</T>
    </Svg>
  );
}

// 11 · The filter competes with the data it protects
export function FilterCompetesWithData({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const load = easeInOut(seg(t, 1.2, 2.6));
  const evict = easeOut(seg(t, 2.4, 3.4));
  const note = easeOut(seg(t, 3.8, 4.6));
  const n = 40;
  return (
    <Svg label="A block cache full of small data blocks. One filter block, 5 MB against 4 KB data blocks, loads and pushes most of the data blocks out" h={270}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>block cache</T>
      <rect x={60} y={40} width={480} height={100} fill="none" stroke={C.mocha} opacity={a} />
      {Array.from({ length: n }, (_, i) => {
        const c = i % 20;
        const r = Math.floor(i / 20);
        const out = c < 16 ? evict : 0;
        return <rect key={i} x={68 + c * 23.5} y={50 + r * 44 + out * (90 - r * 30)} width={18} height={34} fill={out > 0.3 ? C.cherry : C.crema} opacity={a * (1 - 0.5 * out)} />;
      })}
      <rect x={68} y={50} width={370 * load} height={78} fill={C.taupe} opacity={load > 0 ? 0.95 : 0} />
      <T x={250} y={95} s={13} a="middle" f={C.ink} o={load > 0.7 ? 1 : 0}>filter block, 5 MB</T>
      <T x={300} y={226} s={13} a="middle" f={C.cherryText} o={evict}>data blocks kicked out of the cache</T>
      <T x={300} y={254} s={12} a="middle" f={C.latte} o={note}>the protector competes with what it protects</T>
    </Svg>
  );
}

// 12 · The fix: a tiny top-level index over filter partitions, one loaded on demand
export function PartitionedFilter({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const cut = easeInOut(seg(t, 0.8, 1.8));
  const idx = easeOut(seg(t, 2.0, 2.7));
  const look = easeInOut(seg(t, 3.0, 3.8));
  const load = easeOut(seg(t, 3.8, 4.5));
  const P = 8;
  return (
    <Svg label="The 5 MB filter cut into partitions on disk. A top-level index of 0.05 MB, about 1% of the filter, is loaded once; a lookup follows it to one partition and loads only that one" h={280}>
      <g opacity={idx}>
        <rect x={270} y={34} width={60} height={22} fill={C.cinnamon} />
        <T x={340} y={50} s={12} f={C.cinnamon}>top-level index: 0.05 MB</T>
        {Array.from({ length: P }, (_, p) => (
          <line key={p} x1={300} y1={56} x2={60 + p * 62 + 25} y2={100} stroke={C.cinnamon} strokeWidth={1} opacity={look > 0 && p !== 2 ? 0.3 : 1} />
        ))}
      </g>
      {Array.from({ length: P }, (_, p) => (
        <rect key={p} x={lerp(60 + p * 60, 60 + p * 62, cut)} y={100 + (p === 2 ? 60 * load : 0)} width={lerp(60, 50, cut)} height={40} fill={p === 2 && load > 0.5 ? C.caramel : C.taupe} opacity={a} />
      ))}
      <T x={300} y={164} s={12} a="middle" f={C.latte} o={a * (1 - load)}>filter partitions, on disk</T>
      <g opacity={look}>
        <circle cx={lerp(30, 300, Math.min(1, look * 2))} cy={lerp(240, 46, Math.min(1, look * 2))} r={6} fill={C.caramel} />
        <T x={30} y={262} s={12} f={C.caramel}>lookup</T>
      </g>
      <T x={300} y={226} s={13} a="middle" f={C.caramel} o={load}>one partition loaded, the rest stay on disk</T>
    </Svg>
  );
}

const CASES: { label: string; index: number; filter: number; data: number }[] = [
  { label: 'hit', index: 1, filter: 0, data: 1 },
  { label: 'miss, no filter', index: 1, filter: 0, data: 1 },
  { label: 'miss, filter cached', index: 1, filter: 0, data: 0 },
  { label: 'miss, partition not cached', index: 1, filter: 1, data: 0 },
];

// 13 · Predict, then measured: block reads for four point lookups
export function BlockReadCounts({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.9));
  const ask = easeOut(seg(t, 1.4, 2.2));
  const same = answered ? easeOut(seg(s, 2.5, 3.1)) : 0;
  const U = 100;
  const x0 = 290;
  // Before the answer the four cases line up. After it, each lookup is run: its reads stack up one block at a time
  // (index, then filter, then data) and its total counts up. Then a dashed line carries the no-filter miss's length
  // down to the uncached-partition miss: exactly as long, and the lock-on lands there.
  const grow = (i: number) => (answered ? clamp((s - 0.2 - i * 0.5) / 0.45) : 0);
  const reach = (c: (typeof CASES)[number]) => (c.index + c.filter + c.data) * U;
  return (
    <Svg label="Block reads per lookup: a hit 2, index and data; a miss with no filter 2; a miss against a cached whole filter 1; a miss whose filter partition is not cached 2, index and partition, the same as no filter" h={290}>
      <g opacity={a}>
        <T x={300} y={22} s={12} a="middle" f={C.latte}>block reads per point lookup</T>
      </g>
      {CASES.map((c, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.2, 0.6 + i * 0.2));
        return (
          <g key={c.label} opacity={k} transform={`translate(${((1 - k) * -16).toFixed(2)} 0)`}>
            <T x={x0 - 12} y={66 + i * 44} s={12} a="end" f={i === 3 ? C.caramel : C.crema}>{c.label}</T>
          </g>
        );
      })}
      {CASES.map((c, i) => {
        const g = grow(i);
        if (g <= 0) return null;
        const parts: [number, string][] = [
          [c.index, C.crema],
          [c.filter, C.cinnamon],
          [c.data, C.taupe],
        ];
        const total = c.index + c.filter + c.data;
        const len = reach(c) * easeOut(g);
        let x = x0;
        return (
          <g key={c.label}>
            {parts.map(([n, col], j) => {
              const w = Math.min(n * U, Math.max(0, x0 + len - x));
              const r = n > 0 && w > 0 ? <rect key={j} x={x + 1} y={50 + i * 44} width={Math.max(2, w - 2)} height={22} fill={col} /> : null;
              x += n * U;
              return r;
            })}
            <T x={x0 + len + 10} y={66 + i * 44} s={13} f={C.caramel}>{`${Math.max(1, Math.ceil(total * easeOut(g) - 1e-6))}`}</T>
          </g>
        );
      })}
      {answered && <Draw pts={[[x0 + reach(CASES[1]), 74 + 44], [x0 + reach(CASES[1]), 50 + 3 * 44]]} t={s} from={2.3} to={2.8} stroke={C.cherryText} w={1.2} dash="3 3" />}
      {answered && <Reticle x={x0 + reach(CASES[3]) / 2} y={61 + 3 * 44} w={reach(CASES[3]) + 40} h={34} t={s} at={2.8} color={C.cherryText} />}
      <g opacity={a}>
        <T x={x0} y={236} s={12} f={C.crema}>index</T>
        <T x={x0 + 70} y={236} s={12} f={C.cinnamon}>filter</T>
        <T x={x0 + 150} y={236} s={12} f={C.taupe}>data</T>
      </g>
      <T x={300} y={272} s={13} a="middle" f={C.caramel} o={rev(ask, answered ? 1 : 0)}>which miss costs the most?</T>
      <T x={300} y={272} s={13} a="middle" f={C.cherryText} o={same}>uncached partition: same as no filter</T>
    </Svg>
  );
}

// 14 · Recap: three patches, one shape; next, which machine holds a key
export function Recap({ t }: StepCtx) {
  const p = [0, 1, 2].map((i) => easeOut(seg(t, 0.2 + i * 0.9, 0.9 + i * 0.9)));
  const next = easeOut(seg(t, 3.2, 4.0));
  const spread = easeInOut(seg(t, 3.6, 4.8));
  return (
    <Svg label="A key with a TID, a key with a sequence number, a filter cut into pages: each bolted onto one machine's structure. Next: the keys spread across several machines" h={270}>
      <g opacity={p[0]}>
        <Entry x={40} y={50} tid="TID" />
        <T x={104} y={100} s={12} a="middle" f={C.latte}>tiebreaker</T>
      </g>
      <g opacity={p[1]}>
        <Entry x={236} y={50} k="key" tid="seq" />
        <T x={300} y={100} s={12} a="middle" f={C.latte}>newest first</T>
      </g>
      <g opacity={p[2]}>
        <rect x={470} y={50} width={30} height={12} fill={C.cinnamon} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={440 + i * 24} y={70} width={20} height={14} fill={C.taupe} />
        ))}
        <T x={485} y={100} s={12} a="middle" f={C.latte}>paged filter</T>
      </g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={lerp(270 + i * 12, 150 + (i % 3) * 150, spread)} cy={lerp(150, 190, spread)} r={6} fill={C.crema} opacity={next} />
      ))}
      {[0, 1, 2].map((m) => (
        <rect key={m} x={110 + m * 150} y={172} width={80} height={36} fill="none" stroke={C.mocha} opacity={spread} />
      ))}
      <T x={300} y={248} s={13} a="middle" f={C.caramel} o={next}>next: which machine holds a key at all</T>
    </Svg>
  );
}
