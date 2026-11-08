import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = stored entries; latte = labels; taupe = empty; caramel = the thing to
// look at (the write in flight, the copy a read returns, the run actually opened); cinnamon = the compared
// alternative (in-place updates, the unfiltered read, memory-side structures); cherryText = the crash, the
// tombstone, the stale copy. Keys are letters (illustrations, not measurements); every printed number is
// printed by examples.py.

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

type Pt = [number, number];
const CW = 34; // one entry cell's width

/** A row of entry cells: labels[i] is the key letter (or '' for empty). */
function Cells({ x, y, labels, f = C.crema, hot = -1, hotC = C.caramel, o = 1, w = CW }: { x: number; y: number; labels: string[]; f?: string; hot?: number; hotC?: string; o?: number; w?: number }) {
  return (
    <g opacity={o}>
      {labels.map((l, i) => (
        <g key={i}>
          <rect x={x + i * w} y={y} width={w - 4} height={24} rx={3} fill={l ? C.mocha : C.roast} stroke={i === hot ? hotC : l ? f : C.taupe} strokeWidth={i === hot ? 2 : 1.1} />
          {l && <T x={x + i * w + (w - 4) / 2} y={y + 17} s={13} f={i === hot ? hotC : f === C.taupe ? C.latte : f} a="middle">{l}</T>}
        </g>
      ))}
    </g>
  );
}

function Check({ x, y, t, at, f = C.caramel }: { x: number; y: number; t: number; at: number; f?: string }) {
  return <Draw pts={[[x - 6, y], [x - 2, y + 5], [x + 7, y - 6]]} t={t} from={at} to={at + 0.25} stroke={f} w={2} pen={false} />;
}
function Cross({ x, y, o = 1, f = C.cherryText }: { x: number; y: number; o?: number; f?: string }) {
  return (
    <g opacity={o} stroke={f} strokeWidth={2}>
      <line x1={x - 5} y1={y - 5} x2={x + 5} y2={y + 5} />
      <line x1={x + 5} y1={y - 5} x2={x - 5} y2={y + 5} />
    </g>
  );
}
function Lock({ x, y, o = 1 }: { x: number; y: number; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x - 6} y={y - 1} width={12} height={9} rx={1.5} fill={C.latte} />
      <path d={`M ${x - 4} ${y - 1} v -3 a 4 4 0 0 1 8 0 v 3`} fill="none" stroke={C.latte} strokeWidth={1.6} />
    </g>
  );
}

// 1 · Two ways to pay. Left: every write seeks to its own page somewhere in a grid and overwrites it in place
// (a red seek arc, a flash). Right: the same writes simply append to the end of one growing strip.
export function Opening({ t }: StepCtx) {
  const N = 6;
  const pages = [5, 10, 2, 7, 0, 9];
  const at = (i: number) => 0.4 + i * 0.35;
  return (
    <Svg label="Updating pages in place sends every write to its own spot, paid immediately; this structure appends every write sequentially and pays later" h={300}>
      <T x={30} y={24} s={13} f={C.cinnamon}>so far: in place, pay now</T>
      {Array.from({ length: 12 }, (_, p) => {
        const i = pages.indexOf(p);
        const hit = i >= 0 && t >= at(i) + 0.25;
        const flash = i >= 0 ? clamp(1 - (t - at(i) - 0.25) / 0.5) : 0;
        return <rect key={p} x={30 + (p % 4) * 64} y={44 + Math.floor(p / 4) * 40} width={56} height={30} rx={3} fill={hit && flash > 0 ? C.cherry : C.roast} stroke={hit ? C.cinnamon : C.mocha} strokeWidth={1.4} />;
      })}
      {pages.map((p, i) => {
        const k = easeInOut(seg(t, at(i), at(i) + 0.25));
        if (k <= 0 || t > at(i) + 0.8) return null;
        const to: Pt = [58 + (p % 4) * 64, 59 + Math.floor(p / 4) * 40];
        return <path key={i} d={`M 150 180 Q ${(150 + to[0]) / 2} 200 ${lerp(150, to[0], k)} ${lerp(180, to[1], k)}`} fill="none" stroke={C.cherryText} strokeWidth={1.3} strokeDasharray="3 3" />;
      })}
      <T x={320} y={24} s={13} f={C.caramel}>here: append, pay later</T>
      <rect x={320} y={44} width={250} height={30} rx={3} fill={C.roast} stroke={C.mocha} strokeWidth={1.2} />
      {Array.from({ length: N }, (_, i) => {
        const k = easeOutBack(seg(t, at(i), at(i) + 0.3));
        return k > 0 ? <rect key={i} x={326 + i * 40} y={50} width={34 * clamp(k)} height={18} rx={2} fill={C.caramel} /> : null;
      })}
      <path d={`M 326 90 H ${326 + Math.min(N, Math.floor(clamp(seg(t, 0.4, 2.5)) * N + 1e-9)) * 40}`} stroke={C.caramel} strokeWidth={1.6} />
      <T x={320} y={112} s={13} f={C.latte} o={easeOut(seg(t, 0.6, 1.0))}>one direction, never back</T>
      <T x={30} y={250} s={13} f={C.crema} o={easeOut(seg(t, 2.7, 3.1))}>the cost doesn&apos;t vanish: it&apos;s paid back later,</T>
      <T x={30} y={272} s={13} f={C.crema} o={easeOut(seg(t, 2.9, 3.3))}>on the structure&apos;s own schedule</T>
    </Svg>
  );
}

// 2 · The write-ahead log. Five writes each append to the log on disk first, then land in the memtable in
// memory. A crash wipes memory (red flash); then the log replays, in order, rebuilding the memtable exactly.
export function WAL({ t }: StepCtx) {
  const W = ['d', 'b', 'f', 'a', 'e'];
  const at = (i: number) => 0.3 + i * 0.32;
  const crash = easeOut(seg(t, 2.0, 2.2));
  const wiped = t >= 2.2;
  const replay = clamp(seg(t, 2.5, 3.5)) * W.length;
  const memSorted = (n: number) => [...W.slice(0, n)].sort();
  const memN = wiped ? Math.floor(replay + 1e-9) : W.filter((_, i) => t >= at(i) + 0.3).length;
  const mem = memSorted(memN);
  return (
    <Svg label="Each write is appended to the log on disk before it lands in the in-memory table; after a crash wipes memory, replaying the log in order rebuilds the table" h={320}>
      <T x={30} y={30} s={13} f={C.cinnamon}>memtable (memory)</T>
      <rect x={30} y={40} width={230} height={40} rx={5} fill="none" stroke={C.cinnamon} strokeWidth={1.4} strokeDasharray="4 3" />
      <Cells x={38} y={48} labels={[...mem, ...Array(5 - mem.length).fill('')]} />
      {crash > 0 && !(replay >= W.length) && <rect x={26} y={36} width={238} height={48} rx={6} fill={C.cherry} opacity={0.35 * crash * (wiped ? clamp(1 - (t - 2.2) / 0.4) : 1)} />}
      <T x={300} y={68} s={14} f={C.cherryText} o={crash * (1 - easeOut(seg(t, 2.6, 2.9)))}>crash: memory gone</T>
      <T x={30} y={200} s={13} f={C.crema}>log (disk), in arrival order</T>
      <rect x={30} y={210} width={540} height={36} rx={4} fill={C.roast} stroke={C.mocha} strokeWidth={1.2} />
      {W.map((k, i) => {
        const a = easeOut(seg(t, at(i), at(i) + 0.15));
        const up = easeInOut(seg(t, at(i) + 0.15, at(i) + 0.3));
        const r = wiped ? clamp(replay - i) : 0;
        return (
          <g key={i}>
            <g opacity={a}>
              <rect x={38 + i * 40} y={216} width={34} height={24} rx={3} fill={C.mocha} stroke={r > 0 ? C.caramel : C.crema} strokeWidth={r > 0 ? 2 : 1.1} />
              <T x={55 + i * 40} y={233} s={13} f={r > 0 ? C.caramel : C.crema} a="middle">{k}</T>
            </g>
            {up > 0 && up < 1 && <rect x={lerp(38 + i * 40, 38 + i * 34, up)} y={lerp(216, 48, up)} width={30} height={24} rx={3} fill="none" stroke={C.crema} strokeWidth={1.2} />}
            {r > 0 && r < 1 && <rect x={lerp(38 + i * 40, 160, r)} y={lerp(216, 90, r)} width={30} height={24} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.6} />}
          </g>
        );
      })}
      <T x={30} y={290} s={13} f={C.caramel} o={easeOut(seg(t, 3.4, 3.8))}>replay the log in order: nothing lost</T>
    </Svg>
  );
}

// 3 · The memtable. Writes arrive out of order (d, b, f, a, e) and each slides into its sorted place in memory.
// Then a read for e arrives: it checks the memtable first and finds the newest copy there; the runs on disk
// below are never asked.
export function Memtable({ t }: StepCtx) {
  const W = ['d', 'b', 'f', 'a', 'e'];
  const at = (i: number) => 0.3 + i * 0.36;
  const n = W.filter((_, i) => t >= at(i)).length;
  const sorted = [...W.slice(0, n)].sort();
  const posOf = (k: string, upto: number) => [...W.slice(0, upto)].sort().indexOf(k);
  const read = easeInOut(seg(t, 2.3, 2.9));
  const found = t >= 2.9;
  return (
    <Svg label="Writes arriving in any order slide into sorted position in the in-memory memtable; a read checks the memtable first and finds the newest value there" h={320}>
      <T x={30} y={30} s={13} f={C.cinnamon}>memtable: sorted, in memory</T>
      <rect x={30} y={40} width={250} height={40} rx={5} fill="none" stroke={C.cinnamon} strokeWidth={1.4} strokeDasharray="4 3" />
      {sorted.map((k) => {
        const i = W.indexOf(k);
        const prev = posOf(k, Math.max(i + 1, n - 1));
        const now = sorted.indexOf(k);
        const slide = easeInOut(seg(t, at(n - 1), at(n - 1) + 0.25));
        const p = n - 1 > i ? lerp(prev, now, slide) : now;
        const drop = i === n - 1 ? easeOutBack(seg(t, at(i), at(i) + 0.3)) : 1;
        const hot = found && k === 'e';
        return (
          <g key={k} transform={`translate(0 ${(1 - clamp(drop)) * -30})`} opacity={clamp(drop)}>
            <rect x={38 + p * 46} y={48} width={40} height={24} rx={3} fill={C.mocha} stroke={hot ? C.caramel : C.crema} strokeWidth={hot ? 2 : 1.1} />
            <T x={58 + p * 46} y={65} s={13} f={hot ? C.caramel : C.crema} a="middle">{k}</T>
          </g>
        );
      })}
      <T x={30} y={150} s={13} f={C.latte}>older runs (disk)</T>
      {[0, 1].map((r) => <Cells key={r} x={30} y={162 + r * 34} labels={['a', 'c', 'e', 'g']} f={C.taupe} o={found ? 0.35 : 0.8} />)}
      <g opacity={read > 0 ? 1 : 0}>
        <rect x={lerp(470, 300, read)} y={50} width={60} height={22} rx={11} fill="none" stroke={C.caramel} strokeWidth={1.8} />
        <T x={lerp(500, 330, read)} y={66} s={13} f={C.caramel} a="middle">read e</T>
      </g>
      <Check x={400} y={60} t={t} at={2.9} />
      <T x={30} y={270} s={13} f={C.caramel} o={easeOut(seg(t, 3.0, 3.4))}>every read checks here first</T>
      <T x={30} y={294} s={13} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>or it would miss the newest write</T>
    </Svg>
  );
}

// 4 · Predict: the memtable is full. Every slot is taken and the outline turns red. After the answer the whole
// table drops to disk as one locked run and a fresh empty memtable appears in its place.
export function FlushPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const drop = answered ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  const fresh = answered ? easeOut(seg(s, 1.0, 1.3)) : 0;
  const keys = ['a', 'b', 'd', 'e', 'f', 'h'];
  return (
    <Svg label="The memtable has reached its size limit; after answering, it is written to disk whole as a new immutable run and an empty memtable takes over" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>the memtable hit its size limit</T>
      <rect x={30} y={40} width={220} height={40} rx={5} fill="none" stroke={answered ? C.cinnamon : C.cherryText} strokeWidth={1.6} strokeDasharray="4 3" opacity={answered ? fresh : 0.6 + 0.4 * Math.sin(t * 4)} />
      <g transform={`translate(0 ${drop * 130})`}>
        <Cells x={38} y={48} labels={keys} f={drop > 0 ? C.caramel : C.crema} />
        <Lock x={262} y={58} o={drop >= 1 ? 1 : 0} />
      </g>
      <T x={570} y={156} s={13} f={C.latte} a="end" o={easeOut(seg(t, 0.2, 0.5))}>disk</T>
      <line x1={30} y1={164} x2={570} y2={164} stroke={C.mocha} strokeWidth={1.2} />
      {!answered && <T x={30} y={270} s={15} f={C.cherryText} o={0.7 + 0.3 * Math.sin(t * 3)}>full: what happens to it?</T>}
      {answered && <T x={30} y={246} s={13} f={C.caramel} o={easeOut(seg(s, 1.1, 1.5))}>written out whole, as one new run</T>}
      {answered && <T x={30} y={270} s={13} f={C.latte} o={easeOut(seg(s, 1.4, 1.8))}>never modified again</T>}
    </Svg>
  );
}

// 5 · The flush. The full memtable drops to the top of the stack of runs (newest on top) and locks; a fresh
// memtable takes over; the log segment behind the flushed table is struck out and removed; new writes land in
// the new memtable straight away.
export function FlushReveal({ t }: StepCtx) {
  const drop = easeInOut(seg(t, 0.3, 1.3));
  const fresh = easeOut(seg(t, 1.4, 1.8));
  const strike = easeOut(seg(t, 2.0, 2.4));
  const gone = easeOut(seg(t, 2.5, 2.9));
  const nw = clamp(seg(t, 3.0, 3.6)) * 2;
  const keys = ['a', 'b', 'd', 'e', 'f', 'h'];
  return (
    <Svg label="The full memtable becomes a new immutable run on disk, an empty memtable takes over, and the log behind the flushed table is discarded" h={320}>
      <T x={30} y={24} s={13} f={C.cinnamon}>memtable</T>
      <rect x={30} y={34} width={220} height={40} rx={5} fill="none" stroke={C.cinnamon} strokeWidth={1.4} strokeDasharray="4 3" />
      {fresh > 0 && <Cells x={38} y={42} labels={['c', 'g'].slice(0, Math.floor(nw + 1e-9)).concat(Array(6 - Math.floor(nw + 1e-9)).fill(''))} o={fresh} />}
      <g transform={`translate(0 ${drop * 120})`} opacity={1}>
        <Cells x={38} y={42} labels={keys} f={drop > 0 ? C.caramel : C.crema} />
        <Lock x={262} y={52} o={drop >= 1 ? 1 : 0} />
      </g>
      <T x={300} y={24} s={13} f={C.latte}>log</T>
      <rect x={300} y={34} width={270} height={40} rx={4} fill={C.roast} stroke={C.mocha} strokeWidth={1.2} />
      <g opacity={1 - gone}>
        {keys.map((_, i) => <rect key={i} x={306 + i * 26} y={44} width={20} height={20} rx={2} fill={C.latte} />)}
        <line x1={302} y1={54} x2={lerp(302, 462, strike)} y2={54} stroke={C.cherryText} strokeWidth={2.2} />
      </g>
      {Array.from({ length: Math.floor(nw + 1e-9) }, (_, i) => <rect key={i} x={306 + i * 26} y={44} width={20} height={20} rx={2} fill={C.caramel} />)}
      <T x={30} y={140} s={13} f={C.latte}>runs on disk, newest on top</T>
      {[0, 1].map((r) => <Cells key={r} x={38} y={196 + r * 32} labels={r ? ['b', 'c', 'g', 'h', 'k', ''] : ['a', 'd', 'j', 'm', '', '']} f={C.taupe} />)}
      <T x={300} y={174} s={13} f={C.caramel} o={easeOut(seg(t, 1.2, 1.5))}>the new run, sealed</T>
      <T x={300} y={110} s={13} f={C.latte} o={strike}>its log, no longer needed</T>
      <T x={30} y={300} s={13} f={C.crema} o={easeOut(seg(t, 3.5, 3.9))}>from now on: read it, or compact it</T>
    </Svg>
  );
}

const RUNS: { name: string; v: string }[] = [
  { name: 'memtable', v: 'v3' },
  { name: 'newer run', v: 'v2' },
  { name: 'oldest run', v: 'v1' },
];

// 6 · Predict: three copies. Key k has a value in the memtable and in two older runs, each labelled by when it
// was written. After the answer the memtable's copy lights and the other two dim, marked as shadowed.
export function ReadPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const lit = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  // The copies land in the order they were written, oldest first, so the one thing that tells them apart is visible
  // before the reveal. After it, a read walks in at the newest copy, locks on, and the older copies are struck out.
  const land = (i: number) => easeOutBack(seg(t, 0.15 + (2 - i) * 0.4, 0.55 + (2 - i) * 0.4));
  const probe = answered ? easeInOut(seg(s, 0.05, 0.5)) : 0;
  return (
    <Svg label="The same key has a value in the memtable and in two older runs; after answering, the newest copy, in the memtable, is the one a read returns" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>the same key, three copies</T>
      {RUNS.map((r, i) => {
        const hot = answered && i === 0;
        const k = land(i);
        const y = 48 + i * 56;
        return (
          <g key={r.name} opacity={clamp(k * 2) * (answered && i > 0 ? lerp(1, 0.4, lit) : 1)} transform={`translate(${((1 - k) * 60).toFixed(2)} 0)`}>
            <T x={30} y={66 + i * 56} s={13} f={i === 0 ? C.cinnamon : C.latte}>{r.name}</T>
            <rect x={200} y={y} width={110} height={28} rx={4} fill={C.mocha} stroke={hot ? C.caramel : C.crema} strokeWidth={hot ? 2.2 : 1.2} />
            <T x={255} y={67 + i * 56} s={13} f={hot ? C.caramel : C.crema} a="middle">k = {r.v}</T>
            {answered && i > 0 && <Draw pts={[[196, y + 14], [314, y + 14]]} t={s} from={0.6 + i * 0.15} to={0.9 + i * 0.15} stroke={C.cherryText} w={2} />}
            {answered && i > 0 && <T x={330} y={67 + i * 56} s={13} f={C.cherryText} o={lit}>shadowed</T>}
          </g>
        );
      })}
      <Draw pts={[[470, 172], [470, 52]]} t={t} from={0.2} to={1.4} stroke={C.taupe} w={1.5} />
      <path d="M464 60 L470 50 L476 60" fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={easeOut(seg(t, 1.3, 1.5))} />
      <T x={486} y={58} s={13} f={C.taupe} o={easeOut(seg(t, 1.2, 1.6))}>newer</T>
      <T x={486} y={172} s={13} f={C.taupe} o={easeOut(seg(t, 0.2, 0.6))}>older</T>
      {answered && probe < 1 && <circle cx={lerp(130, 200, probe)} cy={62} r={5} fill={C.caramel} />}
      {answered && <Reticle x={255} y={62} w={126} h={42} t={s} at={0.45} />}
      {!answered && <T x={30} y={262} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>which one does a read return?</T>}
      {answered && <T x={30} y={262} s={13} f={C.caramel} o={easeOut(seg(s, 1.0, 1.4))}>the newest copy wins, always</T>}
    </Svg>
  );
}

// 7 · The read path. A lookup for key j checks the memtable (miss), the newest run (miss), the next run (hit:
// stop). The oldest run, which also holds a copy of j, is never opened.
export function ReadReveal({ t }: StepCtx) {
  const rows = [
    { name: 'memtable', keys: ['c', 'g', 'm'], hit: false },
    { name: 'run 3 (newest)', keys: ['a', 'e', 'k'], hit: false },
    { name: 'run 2', keys: ['b', 'j', 'p'], hit: true },
    { name: 'run 1 (oldest)', keys: ['d', 'j', 'q'], hit: false },
  ];
  const at = (i: number) => 0.4 + i * 0.6;
  const stopped = t >= at(2) + 0.4;
  const cur = Math.min(2, Math.floor(clamp(seg(t, 0.4, 2.2)) * 3 + 1e-9));
  return (
    <Svg label="A read checks the memtable, then each run from newest to oldest, and stops at the first one holding the key; older copies are never reached" h={320}>
      <T x={30} y={24} s={13} f={C.caramel}>read j: newest first</T>
      {rows.map((r, i) => {
        const y = 50 + i * 54;
        const checked = t >= at(i) + 0.3 && i <= 2;
        const skipped = i === 3 && stopped;
        const hotIdx = r.hit && checked ? 1 : -1;
        return (
          <g key={r.name} opacity={skipped ? 0.35 : 1}>
            <T x={30} y={y + 17} s={13} f={i === 0 ? C.cinnamon : C.latte}>{r.name}</T>
            <Cells x={200} y={y} labels={r.keys} f={C.crema} hot={hotIdx} />
            {checked && !r.hit && <Cross x={330} y={y + 12} />}
            {r.hit && <Check x={330} y={y + 10} t={t} at={at(2) + 0.3} />}
          </g>
        );
      })}
      {t > 0.4 && !stopped && <rect x={192} y={42 + cur * 54} width={118} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />}
      <T x={360} y={272} s={13} f={C.latte} o={easeOut(seg(t, 1.9, 2.2))}>never opened</T>
      <T x={30} y={300} s={13} f={C.crema} o={easeOut(seg(t, 2.9, 3.3))}>order is how it knows which copy is current</T>
    </Svg>
  );
}

// 8 · Skipping work. Five runs, each with a small Bloom filter held in memory. A lookup asks every filter:
// four answer "definitely not" and their runs are never read; one answers "maybe". That run's fence pointers
// (one first-key per block) narrow the read to a single block, which alone is read from disk.
export function SkipWork({ t }: StepCtx) {
  const ask = (i: number) => 0.3 + i * 0.25;
  const maybe = 2;
  const fence = easeInOut(seg(t, 2.0, 2.8));
  const read = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="A Bloom filter per run, kept in memory, rules out four of five runs without a disk read; fence pointers narrow the remaining run to one block" h={320}>
      <T x={30} y={24} s={13} f={C.cinnamon}>filters, in memory</T>
      <T x={300} y={24} s={13} f={C.latte}>runs, on disk</T>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 40 + i * 40;
        const asked = t >= ask(i) + 0.15;
        const no = i !== maybe;
        return (
          <g key={i}>
            {Array.from({ length: 8 }, (_, b) => <rect key={b} x={30 + b * 16} y={y + 4} width={12} height={16} rx={1} fill={(b * 7 + i * 3) % 5 < 2 ? C.cinnamon : C.cocoa} stroke={C.cinnamon} strokeWidth={0.8} />)}
            {asked && <T x={170} y={y + 17} s={13} f={no ? C.latte : C.caramel}>{no ? 'no' : 'maybe'}</T>}
            <g opacity={asked && no ? 0.25 : 1}>
              <rect x={300} y={y} width={270} height={24} rx={3} fill={C.roast} stroke={!no && asked ? C.caramel : C.mocha} strokeWidth={!no && asked ? 1.8 : 1.1} />
              {[0, 1, 2, 3, 4].map((b) => <line key={b} x1={300 + b * 54} y1={y} x2={300 + b * 54} y2={y + 24} stroke={C.mocha} strokeWidth={1} />)}
            </g>
          </g>
        );
      })}
      <g opacity={fence > 0 ? 1 : 0}>
        {[0, 1, 2, 3, 4].map((b) => <path key={b} d={`M ${300 + b * 54 + 4} ${120 + 30} v -6`} stroke={C.crema} strokeWidth={1.4} />)}
        <rect x={lerp(300, 354, fence)} y={118} width={lerp(270, 54, fence)} height={28} rx={3} fill="none" stroke={C.caramel} strokeWidth={2.2} />
      </g>
      <rect x={356} y={122} width={50} height={20} rx={2} fill={C.caramel} opacity={read} />
      <T x={30} y={262} s={13} f={C.cinnamon} o={easeOut(seg(t, 1.6, 1.9))}>filter: definitely not, or maybe</T>
      <T x={30} y={286} s={13} f={C.caramel} o={easeOut(seg(t, 2.6, 2.9))}>fence pointers: one block worth reading</T>
      <T x={30} y={310} s={13} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>one block read, out of five runs</T>
    </Svg>
  );
}

// 9 · The tombstone. An older, locked run holds k = v1. A delete writes a red tombstone for k into the
// memtable; a read for k meets the tombstone first and answers "not found", while v1 still sits on disk.
// Later a compaction sweeps both away together.
export function Tombstone({ t }: StepCtx) {
  const del = easeOutBack(seg(t, 0.5, 0.9));
  const read = easeInOut(seg(t, 1.3, 2.0));
  const nf = easeOut(seg(t, 2.0, 2.3));
  const sweep = easeInOut(seg(t, 3.0, 3.7));
  return (
    <Svg label="A delete writes a tombstone into the memtable; reads hit it first and report not found while the old value still sits in an immutable run, until a compaction removes both" h={320}>
      <T x={30} y={24} s={13} f={C.cinnamon}>memtable</T>
      <rect x={30} y={34} width={220} height={40} rx={5} fill="none" stroke={C.cinnamon} strokeWidth={1.4} strokeDasharray="4 3" />
      <g opacity={(1 - sweep) * clamp(del)} transform={`translate(${38 + 15} ${42 + 12}) scale(${clamp(del)}) translate(${-(38 + 15)} ${-(42 + 12)})`}>
        <rect x={38} y={42} width={60} height={24} rx={3} fill={C.cherry} stroke={C.cherryText} strokeWidth={1.8} />
        <T x={68} y={59} s={13} f={C.crema} a="middle">k &dagger;</T>
      </g>
      <T x={110} y={59} s={13} f={C.cherryText} o={easeOut(seg(t, 0.8, 1.1)) * (1 - sweep)}>tombstone</T>
      <T x={30} y={140} s={13} f={C.latte}>older run, sealed</T>
      <Lock x={214} y={132} />
      <g opacity={lerp(1, 0, sweep)}>
        <rect x={38} y={150} width={60} height={24} rx={3} fill={C.mocha} stroke={read > 0 ? C.taupe : C.crema} strokeWidth={1.2} />
        <T x={68} y={167} s={13} f={read > 0 ? C.taupe : C.crema} a="middle">k = v1</T>
      </g>
      <Cells x={104} y={150} labels={['m', 'p']} f={C.taupe} />
      <T x={110} y={200} s={13} f={C.latte} o={nf * (1 - sweep)}>still physically there</T>
      <g opacity={read > 0 ? 1 - easeOut(seg(t, 2.6, 2.9)) : 0}>
        <rect x={lerp(470, 280, read)} y={44} width={70} height={22} rx={11} fill="none" stroke={C.caramel} strokeWidth={1.8} />
        <T x={lerp(505, 315, read)} y={60} s={13} f={C.caramel} a="middle">read k</T>
      </g>
      <T x={300} y={110} s={14} f={C.caramel} o={nf}>not found</T>
      <rect x={20} y={lerp(30, 190, sweep)} width={260} height={4} fill={C.caramel} opacity={sweep > 0 && sweep < 1 ? 1 : 0} />
      <T x={30} y={262} s={13} f={C.caramel} o={easeOut(seg(t, 3.0, 3.3))}>a later compaction drops both together</T>
      <T x={30} y={290} s={13} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>until then, the tombstone must outrank v1</T>
    </Svg>
  );
}

// 10 · Prove it, from examples.py: 50 log records replayed to an exact match; a 9.9-bit-per-key filter's
// observed false positives (0.900%) against RocksDB's ~1%; 500 run reads unfiltered against 55 with filters and
// fence pointers (89% fewer); a tombstone hiding an older value with zero compactions.
export function ProveIt({ t }: StepCtx) {
  const o = (a: number) => easeOut(seg(t, a, a + 0.3));
  const g = easeInOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="Measured: 50 log records replayed exactly; a 9.9 bits-per-key Bloom filter gave 0.900 per cent false positives against a predicted 1 per cent; 500 run reads fell to 55; a tombstone hid a value with zero compactions" h={320}>
      <T x={30} y={26} s={13} f={C.crema} o={o(0.2)}>log replay: 50 records, exact match</T>
      <Check x={414} y={21} t={t} at={0.5} />
      <T x={30} y={60} s={13} f={C.crema} o={o(0.7)}>filter, 9.9 bits/key: 0.900% false positives</T>
      <T x={30} y={82} s={13} f={C.latte} o={o(0.9)}>RocksDB&apos;s own table predicts ~1%</T>
      <T x={30} y={126} s={13} f={C.crema} o={o(1.3)}>100 lookups over 5 runs: runs opened</T>
      <rect x={30} y={138} width={520 * g} height={18} rx={2} fill={C.cinnamon} />
      <T x={30} y={176} s={13} f={C.cinnamon} o={o(2.4)}>500 blind</T>
      <rect x={30} y={186} width={(55 / 500) * 520 * g} height={18} rx={2} fill={C.caramel} />
      <T x={30 + (55 / 500) * 520 + 8} y={200} s={13} f={C.caramel} o={o(2.5)}>55 with filter and fences: 89% fewer</T>
      <T x={30} y={248} s={13} f={C.crema} o={o(2.9)}>tombstone: value hidden, zero compactions</T>
      <Check x={444} y={243} t={t} at={3.2} />
      <T x={30} y={300} s={13} f={C.latte} o={o(3.5)}>every number from one run of examples.py</T>
    </Svg>
  );
}
