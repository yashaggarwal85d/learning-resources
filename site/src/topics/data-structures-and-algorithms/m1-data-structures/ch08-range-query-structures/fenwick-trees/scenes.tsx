import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the array's own live state; latte = labels; caramel = the thing to look at
// (the slots a jump lands on, the range being answered); cinnamon = the compared alternative (the naive scan, the
// cached running total, the prefix being subtracted); cherryText = the cost the naive approach pays. The array,
// grid and workload are examples.py's own; each Fenwick slot's stored partial sum is drawn as the span it covers,
// never printed, and every printed number is printed by examples.py.

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

const A = [3, 5, 2, 8, 1, 4, 6, 2, 9, 3, 5, 7, 1, 2, 4];
const N = 15;
const IDX = Array.from({ length: N }, (_, i) => i + 1);
const X = (i: number) => 40 + (i - 1) * 35;
const CW = 32;
const lowbit = (i: number) => i & -i;
const lvl = (i: number) => Math.log2(lowbit(i));
const bin = (i: number) => i.toString(2).padStart(4, '0');

/** The 15 minute cells; `label` picks index or value inside. */
function Cells({ y, label = 'index', hot = [], hotC = C.caramel, o = 1, under = false }: { y: number; label?: 'index' | 'value'; hot?: number[]; hotC?: string; o?: number; under?: boolean }) {
  return (
    <g opacity={o}>
      {IDX.map((i) => {
        const h = hot.includes(i);
        return (
          <g key={i}>
            <rect x={X(i)} y={y} width={CW} height={26} rx={3} fill={C.roast} stroke={h ? hotC : C.latte} strokeWidth={h ? 2 : 1} />
            <T x={X(i) + CW / 2} y={y + 18} s={13} f={h ? hotC : C.crema} a="middle">{label === 'index' ? i : A[i - 1]}</T>
            {under && <T x={X(i) + CW / 2} y={y + 44} s={12} f={C.taupe} a="middle">{i}</T>}
          </g>
        );
      })}
    </g>
  );
}

/** Slot i's stored span, drawn as a bar over the minutes it covers, on the row for its lowest set bit. */
function Span({ i, top, c = C.mocha, fill = false, k = 1, o = 1, dy = 30 }: { i: number; top: number; c?: string; fill?: boolean; k?: number; o?: number; dy?: number }) {
  const x0 = X(i - lowbit(i) + 1);
  const x1 = X(i) + CW;
  const y = top - lvl(i) * dy;
  const w = (x1 - x0) * k;
  return <rect x={x1 - w} y={y} width={Math.max(0, w)} height={16} rx={3} fill={fill ? c : C.roast} stroke={c} strokeWidth={fill ? 0 : 1.2} opacity={o} />;
}

/** A hop marker: a dot jumping from cell a to cell b (or off an end) along an arc under the cells. */
function hop(a: number, b: number, k: number, y: number): [number, number] {
  const xa = X(a) + CW / 2;
  const xb = b < 1 ? X(1) - 30 : b > N ? X(N) + CW + 30 : X(b) + CW / 2;
  return [lerp(xa, xb, k), y + Math.sin(Math.PI * k) * 22];
}

/** Binary digits with the lowest set bit picked out, as spans inside one text line (so phones scale it whole). */
function bits(n: number) {
  const b = bin(n);
  const low = b.lastIndexOf('1');
  return (
    <>
      {b.slice(0, low)}
      <tspan fill={C.caramel}>{b[low]}</tspan>
      {b.slice(low + 1)}
    </>
  );
}

// 1 · Opening. The 15 minute counts. A scan over minutes 5 to 11 touches each one (a tick per minute). Below, a
// cached running total (bars, growing left to right); then minute 5 changes and every cached total from 5 on
// flashes as it is rebuilt: the cost just moved.
export function Opening({ t }: StepCtx) {
  const scan = (i: number) => easeOut(seg(t, 0.4 + (i - 5) * 0.16, 0.55 + (i - 5) * 0.16));
  const cache = easeOut(seg(t, 1.8, 2.2));
  const upd = easeOut(seg(t, 2.4, 2.6));
  const pre = IDX.map((i) => A.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <Svg label="Fifteen per-minute counts; scanning minutes 5 to 11 touches each one; a cached running total answers fast, but one change at minute 5 forces every total from 5 on to be rebuilt" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>minutes 1 to 15, a count each</T>
      <Cells y={40} label="value" hot={IDX.filter((i) => i >= 5 && i <= 11 && scan(i) > 0)} hotC={C.cinnamon} under />
      {IDX.filter((i) => i >= 5 && i <= 11).map((i) => <rect key={i} x={X(i) + 11} y={100} width={10} height={12} rx={2} fill={C.cinnamon} opacity={scan(i)} />)}
      <T x={30} y={110} s={12} f={C.cinnamon} o={scan(5)}>scan</T>
      <T x={30} y={150} s={13} f={C.latte} o={cache}>cached running totals</T>
      {IDX.map((i) => {
        const h = 70 * (pre[i - 1] / pre[N - 1]) * cache;
        const flash = i >= 5 ? clamp(1 - Math.abs(t - (2.7 + (i - 5) * 0.09)) / 0.25) : 0;
        const done = i >= 5 && t > 2.7 + (i - 5) * 0.09;
        return <rect key={i} x={X(i) + 4} y={240 - h} width={CW - 8} height={h} rx={2} fill={flash > 0 ? C.cherryText : done ? C.cinnamon : C.mocha} opacity={0.6 + 0.4 * flash} />;
      })}
      <rect x={X(5) - 2} y={38} width={CW + 4} height={30} rx={4} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={upd * (t < 3.9 ? 1 : 0.5)} />
      <T x={30} y={276} s={13} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.4))}>change minute 5: rebuild 5 to 15</T>
    </Svg>
  );
}

// 2 · The lowest set bit. Each slot's span grows out from its own index, row by row: odd indices own one minute,
// 2, 6, 10, 14 own two, 4 and 12 own four, 8 owns eight. Then 11 (1011) and 8 (1000) are picked out.
export function LowBitReveal({ t }: StepCtx) {
  const grow = (i: number) => easeOut(seg(t, 0.3 + lvl(i) * 0.45, 0.7 + lvl(i) * 0.45));
  const p11 = easeOut(seg(t, 2.3, 2.6));
  const p8 = easeOut(seg(t, 2.9, 3.2));
  return (
    <Svg label="Each index owns a span set by its lowest set bit: odd indices one minute, 2, 6, 10 and 14 two, 4 and 12 four, 8 eight; 11 is 1011 and owns one, 8 is 1000 and owns eight" h={300}>
      {IDX.map((i) => (
        <Span key={i} i={i} top={210} c={(i === 11 && p11 > 0) || (i === 8 && p8 > 0) ? C.caramel : C.latte} fill={(i === 11 && p11 > 0) || (i === 8 && p8 > 0)} k={grow(i)} />
      ))}
      <Cells y={240} hot={[...(p11 > 0 ? [11] : []), ...(p8 > 0 ? [8] : [])]} />
      <T x={330} y={30} s={14} f={C.crema} o={p11}>11 = {bits(11)}: owns 1</T>
      <T x={330} y={58} s={14} f={C.crema} o={p8}>8 = {bits(8)}: owns 8</T>
    </Svg>
  );
}

// 3 · Predict. All 15 spans; minute 5 pulses red. How many spans cover it? After answering: the three that do,
// 5, 6 and 8, fill caramel.
export function UpdatePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const lit = [5, 6, 8];
  return (
    <Svg label="All fifteen spans above the minutes, minute 5 pulsing; after answering, the three spans that cover it, at 5, 6 and 8, fill" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>update minute 5</T>
      {IDX.map((i) => {
        const on = answered && lit.includes(i);
        return <Span key={i} i={i} top={210} c={on ? C.caramel : C.latte} fill={on} o={on ? easeOut(seg(s, 0.2 + lit.indexOf(i) * 0.25, 0.45 + lit.indexOf(i) * 0.25)) * 0.8 + 0.2 : 1} />;
      })}
      <Cells y={240} hot={[5]} hotC={answered ? C.caramel : C.cherryText} />
      <rect x={X(5) - 3} y={237} width={CW + 6} height={32} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.6} opacity={answered ? 0 : pulse} />
      {!answered && <T x={330} y={24} s={15} f={C.cherryText} o={pulse}>how many spans?</T>}
      {answered && <T x={330} y={24} s={13} f={C.caramel} o={easeOut(seg(s, 1.0, 1.4))}>3 of the 15</T>}
    </Svg>
  );
}

// 4 · The update walk. A marker hops 5 -> 6 -> 8 -> past 15, each landing filling that slot's span; the binary
// sums appear top right as each jump lands: add the lowest set bit.
export function UpdateReveal({ t }: StepCtx) {
  const path = [5, 6, 8, 16];
  const at = (j: number) => 0.4 + j * 0.8;
  const k = (j: number) => easeInOut(seg(t, at(j), at(j) + 0.55));
  const landed = (i: number) => {
    const j = path.indexOf(i);
    return j === 0 ? t >= 0.2 : t >= at(j - 1) + 0.55;
  };
  let dot: [number, number] = [X(5) + CW / 2, 234];
  for (let j = 0; j < 3; j++) if (t >= at(j)) dot = hop(path[j], path[j + 1], k(j), 234);
  const eqs: [number, number, string][] = [[5, 1, '6'], [6, 2, '8'], [8, 8, '16: past 15']];
  return (
    <Svg label="A marker hops from minute 5 to 6 to 8 and then past the end, adding the lowest set bit each time; the spans of slots 5, 6 and 8 fill as it lands" h={320}>
      {IDX.map((i) => {
        const on = [5, 6, 8].includes(i) && landed(i);
        return <Span key={i} i={i} top={176} c={on ? C.caramel : C.latte} fill={on} />;
      })}
      <Cells y={206} hot={[5, 6, 8].filter(landed)} />
      <circle cx={dot[0]} cy={dot[1] + 10} r={6} fill={C.caramel} opacity={t > at(2) + 0.55 ? 1 - easeOut(seg(t, at(2) + 0.55, at(2) + 0.9)) : 1} />
      {eqs.map(([from, lb, rest], j) => (
        <T key={j} x={300} y={24 + j * 22} s={13} f={C.crema} o={easeOut(seg(t, at(j) + 0.4, at(j) + 0.7))}>
          {bits(from)} <tspan fill={C.caramel}>+{lb}</tspan> &rarr; {rest}
        </T>
      ))}
      <T x={30} y={300} s={13} f={C.caramel} o={easeOut(seg(t, 2.9, 3.3))}>3 slots touched, not 15</T>
    </Svg>
  );
}

// 5 · Predict. Minutes 1 to 11 bracketed: the prefix to answer. How many jumps back? After answering: spans 11,
// 10 and 8 fill.
export function QueryPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const lit = [11, 10, 8];
  return (
    <Svg label="Minutes 1 through 11 bracketed for a prefix-sum query; after answering, the spans of slots 11, 10 and 8 fill" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>sum of minutes 1 to 11</T>
      {IDX.map((i) => {
        const on = answered && lit.includes(i);
        return <Span key={i} i={i} top={210} c={on ? C.caramel : C.latte} fill={on} o={on ? easeOut(seg(s, 0.2 + lit.indexOf(i) * 0.25, 0.45 + lit.indexOf(i) * 0.25)) * 0.8 + 0.2 : 1} />;
      })}
      <Cells y={240} />
      <path d={`M ${X(1)} 278 L ${X(1)} 286 L ${X(11) + CW} 286 L ${X(11) + CW} 278`} fill="none" stroke={answered ? C.caramel : C.cherryText} strokeWidth={1.6} opacity={answered ? 1 : pulse} />
      {!answered && <T x={330} y={24} s={15} f={C.cherryText} o={pulse}>how many jumps?</T>}
      {answered && <T x={330} y={24} s={13} f={C.caramel} o={easeOut(seg(s, 1.0, 1.4))}>3 again, here</T>}
    </Svg>
  );
}

// 6 · The query walk. A marker hops 11 -> 10 -> 8 -> 0, subtracting the lowest set bit; each landing fills a span.
// Then the three spans drop into one row under the cells: 8 covers 1-8, 10 covers 9-10, 11 covers 11. Together
// they tile minutes 1 to 11 exactly, so their stored sums add up to the running total.
export function QueryReveal({ t }: StepCtx) {
  const path = [11, 10, 8, 0];
  const at = (j: number) => 0.3 + j * 0.65;
  const k = (j: number) => easeInOut(seg(t, at(j), at(j) + 0.45));
  const landed = (i: number) => {
    const j = path.indexOf(i);
    return j === 0 ? t >= 0.15 : t >= at(j - 1) + 0.45;
  };
  let dot: [number, number] = [X(11) + CW / 2, 234];
  for (let j = 0; j < 3; j++) if (t >= at(j)) dot = hop(path[j], path[j + 1], k(j), 234);
  const drop = easeInOut(seg(t, 2.4, 3.1));
  const eqs: [number, number, string][] = [[11, 1, '10'], [10, 2, '8'], [8, 8, '0: stop']];
  return (
    <Svg label="A marker hops from 11 to 10 to 8 to zero, subtracting the lowest set bit; the three filled spans drop into one row and tile minutes 1 to 11 exactly" h={330}>
      {IDX.map((i) => {
        const on = [11, 10, 8].includes(i) && landed(i);
        if (on) {
          const y0 = 176 - lvl(i) * 30;
          const y = lerp(y0, 272, drop);
          const x0 = X(i - lowbit(i) + 1);
          return <rect key={i} x={x0} y={y} width={X(i) + CW - x0} height={16} rx={3} fill={C.caramel} opacity={0.9} />;
        }
        return <Span key={i} i={i} top={176} c={C.latte} />;
      })}
      <Cells y={206} hot={[11, 10, 8].filter(landed)} />
      <circle cx={dot[0]} cy={dot[1] + 8} r={6} fill={C.caramel} opacity={t > at(2) + 0.45 ? 1 - easeOut(seg(t, at(2) + 0.45, at(2) + 0.8)) : 1} />
      {eqs.map(([from, lb, rest], j) => (
        <T key={j} x={330} y={24 + j * 22} s={13} f={C.crema} o={easeOut(seg(t, at(j) + 0.3, at(j) + 0.6))}>
          {bits(from)} <tspan fill={C.caramel}>&minus;{lb}</tspan> &rarr; {rest}
        </T>
      ))}
      <T x={30} y={310} s={13} f={C.caramel} o={easeOut(seg(t, 3.1, 3.5))}>3 spans tile minutes 1 to 11</T>
    </Svg>
  );
}

// 7 · Ranges. Prefix through 11 (caramel strip) minus prefix through 4 (cinnamon strip): the 1-4 part cancels,
// leaving minutes 5 to 11: 30. Then a range-wide +10 on 5 to 11, done with two trees, each getting a mark at 5
// and a cancelling mark at 12; the range sum after it: 100.
export function RangeReveal({ t }: StepCtx) {
  const g11 = easeOut(seg(t, 0.3, 0.8));
  const g4 = easeOut(seg(t, 0.9, 1.3));
  const cancel = easeInOut(seg(t, 1.5, 2.1));
  const res = easeOut(seg(t, 2.2, 2.5));
  const trees = easeOut(seg(t, 2.8, 3.2));
  const marks = (j: number) => easeOutBack(seg(t, 3.3 + j * 0.25, 3.55 + j * 0.25));
  const plus = easeOut(seg(t, 4.0, 4.4));
  return (
    <Svg label="Prefix through 11 minus prefix through 4 leaves minutes 5 to 11, sum 30; a +10 on minutes 5 to 11 becomes two marks in each of two trees, at 5 and 12, and the range then sums to 100" h={330}>
      <Cells y={30} label="value" hot={plus > 0 ? [5, 6, 7, 8, 9, 10, 11] : []} under />
      <rect x={X(1)} y={92} width={(X(11) + CW - X(1)) * g11} height={14} rx={2} fill={C.caramel} opacity={1} />
      <rect x={X(1)} y={92} width={(X(4) + CW - X(1)) * cancel} height={14} rx={2} fill={C.espresso} opacity={cancel > 0 ? 0.85 : 0} />
      <rect x={X(1)} y={lerp(112, 92, cancel)} width={(X(4) + CW - X(1)) * g4} height={14} rx={2} fill={C.cinnamon} opacity={1 - cancel} />
      <T x={X(11) + CW + 8} y={104} s={12} f={C.caramel} o={g11 * (1 - res)}>to 11</T>
      <T x={X(4) + CW + 8} y={124} s={12} f={C.cinnamon} o={g4 * (1 - cancel)}>minus to 4</T>
      <T x={X(11) + CW + 8} y={104} s={13} f={C.caramel} o={res}>= 30</T>
      <g opacity={trees}>
        <T x={30} y={170} s={13} f={C.latte}>+10 on 5 to 11, with two trees</T>
        {[0, 1].map((r) => (
          <g key={r}>
            {IDX.map((i) => <rect key={i} x={X(i) + 6} y={186 + r * 34} width={CW - 12} height={20} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} />)}
            {[5, 12].map((i, j) => {
              const m = marks(r * 2 + j);
              return m > 0.001 ? <T key={i} x={X(i) + CW / 2} y={201 + r * 34} s={15} f={j === 0 ? C.caramel : C.cinnamon} a="middle" o={clamp(m)}>{j === 0 ? '+' : '−'}</T> : null;
            })}
          </g>
        ))}
      </g>
      <T x={30} y={300} s={13} f={C.caramel} o={easeOut(seg(t, 4.3, 4.7))}>minutes 5 to 11 now sum to 100</T>
    </Svg>
  );
}

// examples.py's 4x4 grid.
const GRID = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 1, 2, 3], [4, 5, 6, 7]];
const GS = 44;

// 8 · Predict. A one-dimensional strip (four slots) with its jumps 1 -> 2 -> 4 above a 4x4 grid. Does a grid need
// a new trick? After answering: the same jumps appear down the grid's side and across its top, one per axis.
export function TwoDPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const GX = 200;
  const GY = 90;
  const hops: [number, number][] = [[1, 2], [2, 4]];
  return (
    <Svg label="A strip's jumps 1 to 2 to 4 beside a 4 by 4 grid; after answering, the same jumps run down the rows and across the columns" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>1D: jumps 1 &rarr; 2 &rarr; 4</T>
      {[1, 2, 3, 4].map((i) => <rect key={i} x={30 + (i - 1) * 30} y={40} width={26} height={20} rx={2} fill="none" stroke={C.latte} strokeWidth={1} />)}
      {hops.map(([a, b], j) => <path key={j} d={`M ${43 + (a - 1) * 30} 40 Q ${43 + ((a + b - 2) / 2) * 30} 22 ${43 + (b - 1) * 30} 40`} fill="none" stroke={C.caramel} strokeWidth={1.6} />)}
      {GRID.map((row, r) => row.map((v, c) => (
        <g key={`${r}-${c}`}>
          <rect x={GX + c * GS} y={GY + r * GS} width={GS - 4} height={GS - 4} rx={3} fill={C.roast} stroke={C.latte} strokeWidth={1} opacity={answered ? 1 : pulse} />
          <T x={GX + c * GS + 20} y={GY + r * GS + 25} s={13} f={C.crema} a="middle">{v}</T>
        </g>
      )))}
      {answered && hops.map(([a, b], j) => (
        <g key={j}>
          <Draw pts={[[GX + (a - 1) * GS + 20, GY - 6], [GX + ((a + b - 2) / 2) * GS + 20, GY - 26], [GX + (b - 1) * GS + 20, GY - 6]]} t={s} from={0.2 + j * 0.3} to={0.5 + j * 0.3} stroke={C.caramel} w={1.8} pen={false} />
          <Draw pts={[[GX - 6, GY + (a - 1) * GS + 20], [GX - 26, GY + ((a + b - 2) / 2) * GS + 20], [GX - 6, GY + (b - 1) * GS + 20]]} t={s} from={0.8 + j * 0.3} to={1.1 + j * 0.3} stroke={C.caramel} w={1.8} pen={false} />
        </g>
      ))}
      {!answered && <T x={30} y={300} s={15} f={C.cherryText} o={pulse}>a grid: a new trick?</T>}
      {answered && <T x={30} y={300} s={13} f={C.caramel} o={easeOut(seg(s, 1.5, 1.9))}>same jumps, once per axis</T>}
    </Svg>
  );
}

// 9 · Two walks, nested. Left: the grid's values. Right: the 2D tree's cells. An update at (1, 1): the outer walk
// takes rows 1, 2, 4; inside each, the inner walk takes columns 1, 2, 4; nine cells light in that order. Then the
// whole-grid prefix sum, 73, checked against every cell added by brute force: 73.
export function TwoDReveal({ t }: StepCtx) {
  const LX = 40;
  const RX = 330;
  const GY = 60;
  const order: [number, number][] = [];
  [1, 2, 4].forEach((r) => [1, 2, 4].forEach((c) => order.push([r, c])));
  const at = (j: number) => 0.4 + j * 0.2;
  const brute = (r: number, c: number) => easeOut(seg(t, 2.5 + (r * 4 + c) * 0.05, 2.65 + (r * 4 + c) * 0.05));
  const res = easeOut(seg(t, 3.5, 3.9));
  return (
    <Svg label="An update at row 1, column 1 walks rows 1, 2 and 4, and inside each, columns 1, 2 and 4: nine tree cells; the whole-grid prefix sum is 73, the same as adding every cell" h={320}>
      <T x={LX} y={40} s={13} f={C.latte}>grid</T>
      <T x={RX} y={40} s={13} f={C.latte}>2D tree: update (1, 1)</T>
      {GRID.map((row, r) => row.map((v, c) => (
        <g key={`l${r}-${c}`}>
          <rect x={LX + c * GS} y={GY + r * GS} width={GS - 4} height={GS - 4} rx={3} fill={brute(r, c) > 0 ? C.mocha : C.roast} stroke={r === 0 && c === 0 ? C.caramel : C.latte} strokeWidth={1} />
          <T x={LX + c * GS + 20} y={GY + r * GS + 25} s={13} f={C.crema} a="middle">{v}</T>
        </g>
      )))}
      {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => {
        const j = order.findIndex(([a, b]) => a === r + 1 && b === c + 1);
        const k = j >= 0 ? easeOutBack(seg(t, at(j), at(j) + 0.2)) : 0;
        return (
          <g key={`r${r}-${c}`}>
            <rect x={RX + c * GS} y={GY + r * GS} width={GS - 4} height={GS - 4} rx={3} fill={C.roast} stroke={C.latte} strokeWidth={1} />
            {k > 0.001 && <rect x={RX + c * GS + 20 - 16 * clamp(k, 0, 1.2)} y={GY + r * GS + 20 - 16 * clamp(k, 0, 1.2)} width={32 * clamp(k, 0, 1.2)} height={32 * clamp(k, 0, 1.2)} rx={3} fill={C.caramel} opacity={0.85} />}
          </g>
        );
      }))}
      {[1, 2, 4].map((r, j) => <T key={r} x={RX - 10} y={GY + (r - 1) * GS + 25} s={12} f={C.caramel} a="end" o={easeOut(seg(t, at(j * 3), at(j * 3) + 0.2))}>{r}</T>)}
      <T x={30} y={270} s={13} f={C.crema} o={res}>whole-grid prefix: 73</T>
      <T x={30} y={296} s={13} f={C.latte} o={easeOut(seg(t, 3.8, 4.1))}>every cell added by hand: 73</T>
      <Draw pts={[[340, 290], [346, 296], [358, 282]]} t={t} from={4.1} to={4.35} stroke={C.caramel} w={2} pen={false} />
    </Svg>
  );
}

// 10 · Prove it. examples.py's workload, 10 updates and 10 queries on the 15 minutes: naive 97 slot touches,
// Fenwick 47. Each bar splits into its update part (solid) and query part (faded), drawn as lengths: the naive
// cost is nearly all rebuilding after updates.
export function ProveIt({ t }: StepCtx) {
  const S = 4;
  const a = easeInOut(seg(t, 0.4, 1.4));
  const b = easeInOut(seg(t, 1.5, 2.3));
  return (
    <Svg label="Ten updates and ten queries on the same fifteen minutes: the naive cached total touched 97 slots, nearly all of it rebuilding after updates; the Fenwick tree touched 47" h={260}>
      <T x={30} y={24} s={13} f={C.crema}>10 updates + 10 queries</T>
      <T x={30} y={66} s={13} f={C.cinnamon}>naive</T>
      <rect x={120} y={52} width={87 * S * a} height={20} rx={2} fill={C.cinnamon} />
      <rect x={120 + 87 * S} y={52} width={10 * S * a} height={20} rx={2} fill={C.cinnamon} opacity={0.45} />
      <T x={120 + 97 * S + 10} y={67} s={13} f={C.cinnamon} o={easeOut(seg(t, 1.3, 1.6))}>97</T>
      <T x={30} y={116} s={13} f={C.caramel}>Fenwick</T>
      <rect x={120} y={102} width={24 * S * b} height={20} rx={2} fill={C.caramel} />
      <rect x={120 + 24 * S * b} y={102} width={23 * S * b} height={20} rx={2} fill={C.caramel} opacity={0.45} />
      <T x={120 + 47 * S + 10} y={117} s={13} f={C.caramel} o={easeOut(seg(t, 2.2, 2.5))}>47</T>
      <T x={30} y={170} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>solid: updates; faded: queries</T>
      <T x={30} y={210} s={13} f={C.crema} o={easeOut(seg(t, 3.0, 3.4))}>slot touches, measured</T>
    </Svg>
  );
}
