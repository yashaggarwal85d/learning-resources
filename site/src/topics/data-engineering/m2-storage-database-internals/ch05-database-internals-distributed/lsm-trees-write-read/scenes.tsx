import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

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

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}

/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}

/** The chapter's LSM stack: the memtable on top, then SST files below it, newest first; `labels` name each level. */
function Stack({ y, labels, o = 1, hl = -1 }: { y: number; labels: string[]; o?: number; hl?: number }) {
  return (
    <g opacity={o}>
      {labels.map((l, i) => (
        <Cell key={l + i} x={25} y={y + i * 36} w={180} h={28} label={l} stroke={i === hl ? C.focus : i === 0 ? C.second : C.mocha} f={i === hl ? C.focus : C.crema} />
      ))}
    </g>
  );
}

// 1 · Hook. MVCC's leftovers pile up for vacuum to clear; beside them, a structure that never edits anything in place stacks
// sealed files one on another.
export function Hook({ t }: StepCtx) {
  const n = Math.floor(clamp(seg(t, 1.4, 3.0)) * 4);
  return (
    <Svg label="MVCC pays vacuum later — what if a structure never updated in place, from the start?" h={220}>
      <Row y={40} label="never update in place" value="on purpose" k={easeOut(seg(t, 0.3, 0.8))} />
      <Cell x={25} y={70} w={220} label="MVCC: vacuum's bill" stroke={C.cherryText} f={C.latte} o={easeOut(seg(t, 0.5, 0.9))} />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={330} y={150 - i * 26} width={245} height={22} rx={3} fill={C.cocoa} stroke={i === n - 1 ? C.focus : C.mocha} strokeWidth={1.5} opacity={i < n ? 1 : 0} />
      ))}
      <T x={452} y={186} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.4, 1.7))}>
        sealed files, never edited
      </T>
    </Svg>
  );
}

// 2 · Write path. One write appends to the WAL, then lands in the sorted memtable; a flush turns the memtable into exactly one
// new SST at L0, holding 1 entry.
export function RevealMemtableFlush({ t }: StepCtx) {
  const w = easeOut(seg(t, 0.5, 1.0));
  const m = easeOut(seg(t, 1.2, 1.7));
  const f = easeInOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="a write goes to the WAL, then the memtable — a flush makes exactly one new file" h={230}>
      <Row y={40} label="one write" value="WAL, then memtable" k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={70} w={170} label="WAL: appended" stroke={C.second} f={C.second} o={w} />
      <Cell x={215} y={70} w={170} label="memtable, sorted" o={m} />
      <Cell x={lerp(215, 405, f)} y={lerp(70, 130, f)} w={170} label="1 entry" stroke={C.focus} f={C.focus} o={f > 0 ? 1 : 0} />
      <T x={490} y={180} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 2.9, 3.2))}>
        one new SST at L0
      </T>
      <Row y={215} label="after the flush" value="1 file, never edited" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 3 · Predict: does the read touch the file? k1 = 'A' sits flushed in an SST; k1 = 'B' sits unflushed in the memtable; a read
// for k1 arrives; then the question.
export function PredictNewestFirst({ t, answer }: StepCtx) {
  return (
    <Svg label="a key flushed to a file, then overwritten in memory — does the read have to open the file?" h={210}>
      <Row y={40} label="a read for k1" value="open the file?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={200} h={26} label="memtable: k1 = 'B'" stroke={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={25} y={92} w={200} h={26} label="SST: k1 = 'A'" o={easeOut(seg(t, 0.3, 0.6))} />
      <circle cx={lerp(560, 240, easeOut(seg(t, 0.6, 1.2)))} cy={73} r={6} fill={C.focus} />
      <AnswerRow y={150} label="check both" answer={answer} value="no, memtable only" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} y={190} text="newest first, and it stops there" />
    </Svg>
  );
}

// 4 · Point read, measured. The read descends the stack and stops at the memtable with 'B'; the counters land: memtable hit 1,
// L0 hit 0; the SST below stays dark.
export function RevealPointReadNewestFirst({ t }: StepCtx) {
  const r = easeOut(seg(t, 0.6, 1.2));
  return (
    <Svg label="RocksDB's own counters — memtable hit one, file hit zero" h={230}>
      <Stack y={60} labels={["memtable: k1 = 'B'", "SST: k1 = 'A'"]} hl={r > 0.9 ? 0 : -1} o={easeOut(seg(t, 0.2, 0.5))} />
      <circle cx={lerp(560, 220, r)} cy={74} r={6} fill={C.focus} />
      <Row y={40} label="db['k1']" value="'B'" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={150} label="rocksdb.memtable.hit" value="1" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={195} label="rocksdb.l0.hit" value="0" k={easeOut(seg(t, 2.6, 3.1))} />
      <T x={222} y={116} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        never opened
      </T>
    </Svg>
  );
}

// 5 · Range read merges. The SST's run k1–k5 'old' and the memtable's run k3, k6 'new' zip into one: k3 takes the memtable's copy,
// and the merged result reads k1 to k6.
export function RevealRangeReadMerge({ t }: StepCtx) {
  const sst = ['k1', 'k2', 'k3', 'k4', 'k5'];
  const mem: Record<string, number> = { k3: 2, k6: 5 };
  const m = easeInOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="a range read merges the file's sorted run with the memtable's, newest copy winning" h={240}>
      <Row y={40} label="a range read" value="merge, newest wins" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={82} s={11} f={C.second} o={easeOut(seg(t, 0.4, 0.7))}>
        memtable
      </T>
      {Object.entries(mem).map(([k, i]) => (
        <Cell key={k} x={110 + i * 76} y={lerp(66, 156, m)} w={70} h={24} label={`${k} new`} stroke={C.second} f={C.second} o={easeOut(seg(t, 0.5, 0.8))} />
      ))}
      <T x={25} y={122} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        SST
      </T>
      {sst.map((k, i) => (
        <Cell
          key={k}
          x={110 + i * 76}
          y={k === 'k3' ? 106 : lerp(106, 156, m)}
          w={70}
          h={24}
          label={`${k} old`}
          o={easeOut(seg(t, 0.9 + i * 0.08, 1.2 + i * 0.08)) * (k === 'k3' ? 1 - 0.65 * m : 1)}
        />
      ))}
      <T x={25} y={172} s={11} f={C.focus} o={m}>
        merged
      </T>
      <Row y={220} label="k3" value="the memtable's copy wins" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 6 · The Bloom filter. 500 lookups for absent keys stream at the file's filter; 494 are turned away at the gate, 6 slip through
// to a wasted block read, and none of them is a real match.
export function RevealBloomFilterGate({ t }: StepCtx) {
  const p = clamp(seg(t, 0.6, 2.8));
  const n = Math.floor(p * 500);
  const fp = Math.floor(p * 6.99);
  return (
    <Svg label="five hundred lookups for absent keys against a real Bloom filter — how many are rejected outright?" h={240}>
      <Row y={40} label="500 absent keys" value="10 bits per key" k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={290} y={64} width={14} height={80} rx={3} fill={C.second} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={297} y={160} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        filter
      </T>
      {Array.from({ length: 16 }, (_, i) => {
        const q = clamp(p * 16 - i);
        const through = i === 5 || i === 12;
        const x = through ? lerp(40, 540, q) : q < 0.6 ? lerp(40, 280, q / 0.6) : lerp(280, 220, (q - 0.6) / 0.4);
        const y = 74 + (i % 5) * 14;
        return q > 0 && q < 1 ? <circle key={i} cx={x} cy={y} r={4} fill={through ? C.cherryText : C.latte} /> : null;
      })}
      <Cell x={455} y={84} w={120} h={26} label="block read" o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={185} label="rejected at the filter" value={`${Math.min(494, n)}`} valueColor={C.focus} k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={225} label="false positives, 0 real" value={`${fp}`} valueColor={C.cherryText} k={easeOut(seg(t, 0.6, 1.0))} />
    </Svg>
  );
}

// 7 · The block index. A key the filter couldn't rule out goes to the file's index, which binary-searches its block boundaries and
// points at the one data block to load, not the whole file.
export function RevealBlockIndex({ t }: StepCtx) {
  const steps = [4, 2, 3];
  const s = Math.min(3, Math.floor(clamp(seg(t, 0.8, 2.4)) * 3.99));
  const range = [0, 8];
  let lo = range[0];
  let hi = range[1];
  for (let i = 0; i < s; i++) {
    const mid = steps[i];
    if (i === 0) hi = mid;
    else if (i === 1) lo = mid;
    else hi = mid;
  }
  const one = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="when the filter says maybe, the block index points at the one block that could hold the key" h={230}>
      <Row y={40} label="the filter says maybe" value="the index narrows it" k={easeOut(seg(t, 0.2, 0.7))} />
      {Array.from({ length: 8 }, (_, i) => {
        const inside = i >= lo && i < hi;
        const chosen = one > 0 && i === 2;
        return (
          <rect
            key={i}
            x={25 + i * 69}
            y={80}
            width={64}
            height={28}
            rx={3}
            fill={chosen ? C.focus : C.cocoa}
            stroke={inside ? C.second : C.mocha}
            strokeWidth={inside ? 2 : 1}
            opacity={chosen ? 0.85 : inside ? 1 : 0.4}
          />
        );
      })}
      <T x={25} y={130} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        data blocks, searched by the index
      </T>
      <T x={25 + 2 * 69 + 32} y={150} s={11} f={C.focus} a="middle" o={one}>
        load this one
      </T>
      <Row y={200} label="loaded" value="one block, not the file" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 8 · Tombstones. 500 keys flush to one 5,187-byte file; 250 are deleted and flushed; a second file of 250 tombstones appears
// beside the untouched first, and the total grows to 7,926 bytes.
export function RevealTombstoneGrowth({ t }: StepCtx) {
  const b = easeOut(seg(t, 1.4, 2.2));
  const size = Math.round(lerp(5187, 7926, easeOut(seg(t, 2.2, 3.0))));
  return (
    <Svg label="delete keys and flush — a second file of tombstones appears, and bytes on disk go up" h={230}>
      <Row y={40} label="500 keys, then 250 deleted" value={`${num(size)} bytes`} valueColor={size > 5187 ? C.cherryText : C.crema} k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={25} y={76} width={5187 / 16} height={26} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={35} y={94} s={12} f={C.crema} o={easeOut(seg(t, 0.4, 0.7))}>
        SST 1: 500 keys, untouched
      </T>
      <rect x={25} y={116} width={((7926 - 5187) / 16) * b} height={26} rx={3} fill={C.cocoa} stroke={C.cherryText} strokeWidth={1.5} />
      <T x={35} y={134} s={12} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.1))}>
        SST 2: 250 tombstones
      </T>
      <Row y={200} label="a delete" value="adds a file" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 9 · Recap. Four rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="never update a file in place — and every read decides how many of those files to check" h={240}>
      <Row y={40} label="a write" value="memtable, then a sealed file" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={95} label="a point read" value="newest first, stops early" valueColor={C.focus} k={easeOut(seg(t, 1.3, 1.8))} />
      <Row y={150} label="a range read" value="merges every run" k={easeOut(seg(t, 2.2, 2.7))} />
      <Row y={205} label="a delete" value="one more record" valueColor={C.cherryText} k={easeOut(seg(t, 3.1, 3.6))} />
    </Svg>
  );
}

// 10 · Prove: why doesn't the disk shrink? A tombstone over two stale copies in two files; after the answer a later merge sweeps
// all three away together.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const m = answer !== null ? easeInOut(seg(s, 0.1, 0.7)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="a tombstone and two stale copies in two files — why doesn't the disk shrink yet?" h={230}>
      <Row y={40} label="a tombstone, two stale copies" value="why still there?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the delete removed them" answer={answer} value="no, a later merge" k={easeOut(seg(t, 0.4, 0.9))} />
      {['tombstone', 'stale, file 2', 'stale, file 1'].map((l, i) => (
        <Cell
          key={l}
          x={lerp(25 + i * 190, 215, m)}
          y={112}
          w={170}
          h={26}
          label={l}
          stroke={i === 0 ? C.cherryText : C.mocha}
          f={i === 0 ? C.cherryText : C.latte}
          o={easeOut(seg(t, 0.6 + i * 0.1, 0.9 + i * 0.1)) * (1 - m)}
        />
      ))}
      <T x={300} y={130} s={12} f={C.focus} a="middle" o={easeOut(seg(s, 0.6, 0.9)) * (answer !== null ? 1 : 0)}>
        merged away together
      </T>
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            only compaction discards them
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
