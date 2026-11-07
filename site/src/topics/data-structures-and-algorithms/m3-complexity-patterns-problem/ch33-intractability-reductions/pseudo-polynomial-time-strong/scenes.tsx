import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = something that exists; latte = secondary labels; taupe = not yet reached or
// discarded; caramel (focus) = the thing to look at right now; cinnamon = the alternative being compared;
// cherry/cherryText = the bad outcome.
//
// Every printed number is examples.py's: a hundred items and knapsack tables of 102,400, 104,857,600 and
// 109,951,162,777,600 cells at 10, 20 and 40 bits; a capacity of 1,000,000, 20 bits against 1,000,000 tally marks;
// three-partition numbers kept at most 30; bin packing's table of 11, 121, 1,331, 14,641 and 161,051 states for 1 to 5
// bins of capacity 10. The DP timings (machine-dependent) and the backtracking call counts (seeded) are drawn as shape
// only; the tables and searches shown filling are illustrations and print nothing.

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

const ROWS = [
  { bits: 10, cells: '102,400', lg: Math.log10(102400) },
  { bits: 20, cells: '104,857,600', lg: Math.log10(104857600) },
  { bits: 40, cells: '109,951,162,777,600', lg: Math.log10(109951162777600) },
];

// 1 · Opening. Three rows: a capacity written in 10, then 20, then 40 bits (a short strip of bit boxes), and the
// table's cell count on a log scale beside it, the bar leaping each time the strip grows a little.
export function Opening({ t }: StepCtx) {
  const X0 = 220, X1 = 560;
  const lx = (lg: number) => X0 + (lg / 15) * (X1 - X0);
  return (
    <Svg label="Three rows: a hundred items with a capacity written in ten, then twenty, then forty bits, a short strip of bit boxes. Beside each, the table's cell count on a log scale: 102,400, then 104,857,600, then 109,951,162,777,600" h={290}>
      <T x={20} y={24} s={12} f={C.latte}>capacity, in bits</T>
      <T x={X0} y={24} s={12} f={C.latte}>table cells, log scale</T>
      {ROWS.map((r, i) => {
        const a = easeOut(seg(t, 0.3 + i * 1.5, 0.8 + i * 1.5));
        const b = easeInOut(seg(t, 0.8 + i * 1.5, 1.6 + i * 1.5));
        const y = 50 + i * 80;
        return (
          <g key={r.bits} opacity={a}>
            {Array.from({ length: r.bits }, (_, k) => <rect key={k} x={20 + k * 4.4} y={y} width={3.4} height={18} fill={k >= (i === 0 ? 0 : ROWS[i - 1].bits) ? C.caramel : C.latte} />)}
            <T x={20} y={y + 38} s={12} f={C.crema}>{r.bits} bits</T>
            <rect x={X0} y={y} width={(lx(r.lg) - X0) * b} height={18} fill={i === 2 ? C.cherry : C.caramel} stroke={i === 2 ? C.cherryText : 'none'} />
            <T x={X0} y={y + 38} s={12} f={i === 2 ? C.cherryText : C.crema} o={b >= 1 ? 1 : 0}>{r.cells}</T>
          </g>
        );
      })}
      <T x={20} y={282} s={12} f={C.latte} o={easeOut(seg(t, 4.6, 5.1))}>same 100 items: a few more bits, a vastly bigger table</T>
    </Svg>
  );
}

// 2 · PredictBinPacking. Left: knapsack's table, a flat grid, items by capacity. Right: bin packing's state space,
// one axis per bin. After answering, a third bin's axis appears and the box of states multiplies.
export function PredictBinPacking({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const ax3 = answered ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  const cap = answered ? easeOut(seg(s, 1.2, 1.8)) : 0;
  const a = easeOut(seg(t, 0.2, 0.9));
  const O = { x: 380, y: 200 };
  return (
    <Svg label="Left, knapsack's table: a flat grid of items by capacity. Right, bin packing's states: one axis for each bin's load. After answering, a third bin's axis appears and the box of states multiplies again" h={290}>
      <g opacity={a}>
        <T x={30} y={40} s={12} f={C.crema}>knapsack: items × capacity</T>
        {Array.from({ length: 5 }, (_, r) => Array.from({ length: 10 }, (_, c) => <rect key={`${r}-${c}`} x={30 + c * 18} y={60 + r * 18} width={15} height={15} fill={C.latte} opacity={0.45} />))}
        <T x={330} y={40} s={12} f={C.crema}>bin packing: a load per bin</T>
        <line x1={O.x} y1={O.y} x2={O.x + 160} y2={O.y} stroke={C.caramel} strokeWidth={1.8} />
        <line x1={O.x} y1={O.y} x2={O.x} y2={O.y - 120} stroke={C.caramel} strokeWidth={1.8} />
        <T x={O.x + 160} y={O.y + 18} s={12} f={C.caramel} a="end">bin 1</T>
        <T x={O.x - 8} y={O.y - 110} s={12} f={C.caramel} a="end">bin 2</T>
        <rect x={O.x} y={O.y - 110} width={150} height={110} fill={C.caramel} opacity={0.15} />
      </g>
      <g opacity={ax3}>
        <line x1={O.x} y1={O.y} x2={O.x - 70 * ax3} y2={O.y + 50 * ax3} stroke={C.cherryText} strokeWidth={1.8} />
        <T x={O.x - 78} y={O.y + 64} s={12} f={C.cherryText} a="end">bin 3</T>
        {[1, 2, 3].map((k) => <rect key={k} x={O.x - k * 18 * ax3} y={O.y - 110 + k * 13 * ax3} width={150} height={110} fill="none" stroke={C.cherryText} strokeWidth={0.8} opacity={0.6} />)}
      </g>
      <T x={30} y={284} s={12} f={C.cherryText} o={cap}>one dimension per bin: grows with the bin count</T>
    </Svg>
  );
}

// 3 · KnapsackNPCompleteAndDP. "NP-complete" stamped on the decision question; then a table, one row per item and one
// column per unit of capacity, fills row by row in a single pass, and its last cell lights: the answer.
export function KnapsackNPCompleteAndDP({ t }: StepCtx) {
  const stamp = easeOut(seg(t, 0.2, 0.8));
  const fill = seg(t, 1.0, 4.0);
  const ans = easeOut(seg(t, 4.0, 4.5));
  const R = 5, Cn = 16;
  return (
    <Svg label="NP-complete is stamped on knapsack's decision question. Then a table with one row per item and one column per unit of capacity fills row by row in a single pass, and its last cell lights: the answer" h={290}>
      <rect x={30} y={24} width={250} height={34} rx={5} fill="none" stroke={C.cherryText} opacity={stamp} />
      <T x={155} y={46} s={13} f={C.cherryText} a="middle" o={stamp}>decision knapsack: NP-complete</T>
      {Array.from({ length: R }, (_, r) => Array.from({ length: Cn }, (_, c) => {
        const k = r * Cn + c;
        const on = fill * R * Cn > k;
        const last = r === R - 1 && c === Cn - 1;
        return <rect key={k} x={60 + c * 30} y={90 + r * 30} width={26} height={26} rx={2} fill={last && ans > 0 ? C.caramel : on ? C.latte : 'none'} opacity={on ? (last && ans > 0 ? 1 : 0.55) : 1} stroke={C.mocha} strokeWidth={0.8} />;
      }))}
      <T x={60} y={256} s={12} f={C.latte}>columns: one per unit of capacity</T>
      <T x={52} y={110} s={12} f={C.latte} a="end">item 1</T>
      <T x={556} y={256} s={12} f={C.caramel} a="end" o={ans}>answer</T>
    </Svg>
  );
}

// 4 · CellsVsBits. Cells against bits on a log axis: the three points 102,400 (10 bits), 104,857,600 (20) and
// 109,951,162,777,600 (40) sit on one straight line: each bit doubles the table.
export function CellsVsBits({ t }: StepCtx) {
  const X0 = 80, X1 = 540, Y0 = 240, Y1 = 40;
  const px = (b: number) => X0 + (b / 40) * (X1 - X0);
  const py = (lg: number) => Y0 - ((lg - 2) / 13) * (Y0 - Y1);
  const line = easeInOut(seg(t, 0.4, 3.4));
  return (
    <Svg label="Table cells against capacity bits, on a log axis. The three points, 102,400 at ten bits, 104,857,600 at twenty and 109,951,162,777,600 at forty, sit on one straight line: every added bit doubles the table" h={290}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={C.line} />
      {[0, 10, 20, 30, 40].map((b) => <T key={b} x={px(b)} y={Y0 + 18} s={12} f={C.latte} a="middle">{b}</T>)}
      <T x={X1} y={Y0 + 40} s={12} f={C.latte} a="end">capacity bits, 100 items</T>
      <T x={X0 - 8} y={Y1 + 4} s={12} f={C.latte} a="end">cells</T>
      <line x1={px(0)} y1={py(2)} x2={lerp(px(0), px(40), line)} y2={lerp(py(2), py(Math.log10(100 * 2 ** 40)), line)} stroke={C.caramel} strokeWidth={1.4} strokeDasharray="4 3" />
      {ROWS.map((r, i) => {
        const on = line * 40 >= r.bits;
        return (
          <g key={r.bits} opacity={on ? 1 : 0}>
            <circle cx={px(r.bits)} cy={py(r.lg)} r={6} fill={i === 2 ? C.cherryText : C.caramel} />
            <T x={i === 2 ? px(r.bits) - 10 : px(r.bits) + 10} y={py(r.lg) + (i === 2 ? -12 : 4)} s={12} f={i === 2 ? C.cherryText : C.crema} a={i === 2 ? 'end' : 'start'}>{r.cells}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · UnaryVsBinary. The capacity 1,000,000 written twice: as 20 bits, a short strip; as 1,000,000 tally marks, a
// strip that runs out of the frame. The table's width slides along beside the tally strip, not the bit strip.
export function UnaryVsBinary({ t }: StepCtx) {
  const bits = easeOut(seg(t, 0.3, 1.0));
  const tally = easeInOut(seg(t, 1.2, 3.0));
  const tab = easeInOut(seg(t, 3.2, 4.4));
  return (
    <Svg label="The capacity one million written twice: as twenty bits, a short strip, and as one million tally marks, a strip that runs out of the frame. The table's width grows alongside the tally strip, not the bit strip" h={290}>
      <T x={30} y={40} s={12} f={C.crema}>1,000,000 in binary: 20 bits</T>
      {Array.from({ length: 20 }, (_, k) => <rect key={k} x={30 + k * 8} y={52} width={6} height={18} fill={C.crema} opacity={bits} />)}
      <T x={30} y={110} s={12} f={C.caramel}>in unary: 1,000,000 marks</T>
      {Array.from({ length: 80 }, (_, k) => <rect key={k} x={30 + k * 6.6} y={122} width={2} height={18} fill={C.caramel} opacity={k / 80 <= tally ? 1 : 0} />)}
      <path d="M566 131 l-10 -8 l0 16 Z" fill={C.caramel} opacity={tally >= 1 ? 1 : 0} />
      <T x={30} y={186} s={12} f={C.latte} o={tab > 0 ? 1 : 0}>the table's width</T>
      <rect x={30} y={198} width={530 * tab} height={24} fill={C.latte} opacity={0.5} />
      <T x={30} y={262} s={12} f={C.caramel} o={tab >= 1 ? 1 : 0}>pseudo-polynomial: fast in the value, not the length</T>
    </Svg>
  );
}

// 6 · WeakNPHardness. Partition: numbers as bars split into two piles of equal total. Then every number shrinks, and
// the table beside them shrinks with them: the hard instances need big numbers.
const PART = [9, 14, 6, 11, 4, 8]; // bar lengths, an illustration
export function WeakNPHardness({ t }: StepCtx) {
  const split = easeInOut(seg(t, 0.4, 1.6));
  const shrink = easeInOut(seg(t, 2.2, 3.6));
  const cap = easeOut(seg(t, 3.8, 4.4));
  const sc = lerp(14, 4, shrink);
  const left = [0, 2, 3]; // the first pile: 9 + 6 + 11 = 26 = 14 + 4 + 8 (bar lengths only, never printed)
  return (
    <Svg label="Partition: numbers as bars, split into two piles of equal total. Then every number shrinks, and the table that solves it shrinks with them: the hard instances need big numbers" h={290}>
      <T x={30} y={30} s={12} f={C.crema}>partition: two piles, equal sums</T>
      {PART.map((v, i) => {
        const pile = left.includes(i) ? 0 : 1;
        const k = (pile === 0 ? left : PART.map((_, j) => j).filter((j) => !left.includes(j))).indexOf(i);
        const y = lerp(50 + i * 22, 60 + k * 24 + pile * 90, split);
        return <rect key={i} x={30} y={y} width={v * sc} height={18} fill={pile === 0 ? C.caramel : C.crema} opacity={0.85} />;
      })}
      <T x={400} y={60} s={12} f={C.latte}>its table</T>
      <rect x={400} y={70} width={lerp(160, 50, shrink)} height={lerp(150, 46, shrink)} fill="none" stroke={C.latte} />
      <T x={30} y={262} s={12} f={C.caramel} o={cap}>small numbers: the hard cases vanish</T>
      <T x={30} y={284} s={12} f={C.latte} o={cap}>weakly NP-hard</T>
    </Svg>
  );
}

// 7 · TimedGrowthDoublingPerBit. examples.py's measured DP times for 12 to 17 bits on a log axis (machine-dependent:
// shape only), beside a dashed line that doubles per bit; they climb together.
const TIMES = [0.0024757, 0.0061485, 0.0100356, 0.0261555, 0.0400136, 0.0921008]; // seconds, shape only
export function TimedGrowthDoublingPerBit({ t }: StepCtx) {
  const X0 = 90, X1 = 520, Y0 = 230, Y1 = 50;
  const px = (b: number) => X0 + ((b - 12) / 5) * (X1 - X0);
  const lo = Math.log2(TIMES[0]) - 0.5, hi = Math.log2(TIMES[5]) + 0.5;
  const py = (v: number) => Y0 - ((Math.log2(v) - lo) / (hi - lo)) * (Y0 - Y1);
  const k = stepIdx(t, 0.4, 3.0, 6);
  const ref = easeInOut(seg(t, 3.2, 4.0));
  return (
    <Svg label="Measured run times of the knapsack table for twelve to seventeen capacity bits, on a log axis, beside a dashed line that doubles with every bit: they climb together" h={290}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={C.line} />
      {[12, 13, 14, 15, 16, 17].map((b) => <T key={b} x={px(b)} y={Y0 + 18} s={12} f={C.latte} a="middle">{b}</T>)}
      <T x={X1} y={Y0 + 40} s={12} f={C.latte} a="end">capacity bits</T>
      <T x={X0 - 8} y={Y1 + 4} s={12} f={C.latte} a="end">time</T>
      <polyline points={TIMES.filter((_, i) => i <= k).map((v, i) => `${px(12 + i)},${py(v)}`).join(' ')} fill="none" stroke={C.caramel} strokeWidth={2} />
      {TIMES.map((v, i) => <circle key={i} cx={px(12 + i)} cy={py(v)} r={5} fill={C.caramel} opacity={i <= k ? 1 : 0} />)}
      <line x1={px(12)} y1={py(TIMES[0])} x2={lerp(px(12), px(17), ref)} y2={lerp(py(TIMES[0]), py(TIMES[0] * 32), ref)} stroke={C.crema} strokeDasharray="5 4" strokeWidth={1.4} />
      <T x={X1} y={py(TIMES[0] * 32) - 12} s={12} f={C.crema} a="end" o={ref}>dashed: ×2 per bit</T>
    </Svg>
  );
}

// 8 · PredictThreePartition. Nine small numbers (bars, all short) waiting to be grouped into triples of equal sum.
// After answering, the search for the grouping fans out into a wide tree anyway.
export function PredictThreePartition({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const fan = answered ? easeOut(seg(s, 0.2, 1.6)) : 0;
  const a = easeOut(seg(t, 0.2, 0.9));
  const NUMS = [7, 3, 9, 5, 8, 4, 6, 2, 9]; // bar lengths, an illustration
  return (
    <Svg label="Nine small numbers, short bars, waiting to be grouped into triples of equal sum. After answering, the search for that grouping fans out into a wide tree anyway" h={290}>
      {NUMS.map((v, i) => <rect key={i} x={40 + i * 56} y={50} width={v * 4} height={16} fill={C.crema} opacity={a} />)}
      <T x={40} y={36} s={12} f={C.latte} o={a}>every number small</T>
      {answered && Array.from({ length: 3 }, (_, i) => Array.from({ length: 3 }, (_, j) => Array.from({ length: 3 }, (_, k) => {
        const x1 = 300, y1 = 100, x2 = 120 + i * 180, y2 = 150, x3 = x2 - 60 + j * 60, y3 = 200, x4 = x3 - 18 + k * 18, y4 = 250;
        return (
          <g key={`${i}${j}${k}`} opacity={fan}>
            {j === 0 && k === 0 && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.cherryText} strokeWidth={1.2} />}
            {k === 0 && <line x1={x2} y1={y2} x2={x3} y2={y3} stroke={C.cherryText} strokeWidth={1} />}
            <line x1={x3} y1={y3} x2={x4} y2={y4} stroke={C.cherryText} strokeWidth={0.8} />
          </g>
        );
      })))}
      <circle cx={300} cy={100} r={6} fill={C.caramel} opacity={a} />
    </Svg>
  );
}

// 9 · StrongNPHardnessDefinition. Each number drawn with a cap line above it, "at most a polynomial in n"; then each
// number written in unary, a short tally, the input barely longer. The stamp: still NP-hard.
export function StrongNPHardnessDefinition({ t }: StepCtx) {
  const capL = easeOut(seg(t, 0.4, 1.2));
  const un = easeInOut(seg(t, 1.6, 3.0));
  const stamp = easeOut(seg(t, 3.4, 4.0));
  const NUMS = [7, 3, 9, 5, 8, 4];
  return (
    <Svg label="Each number is drawn with a cap line above it: at most a polynomial in the input's length. Then each number is written in unary, a short tally, and the input grows only a little. The stamp: still NP-hard" h={290}>
      <line x1={30} y1={60} x2={560} y2={60} stroke={C.cinnamon} strokeDasharray="5 4" opacity={capL} />
      <T x={560} y={50} s={12} f={C.cinnamon} a="end" o={capL}>cap: a polynomial in n</T>
      {NUMS.map((v, i) => (
        <g key={i}>
          <rect x={40 + i * 86} y={150 - v * 9} width={30} height={v * 9} fill={C.crema} opacity={0.8} />
          {Array.from({ length: v }, (_, k) => <rect key={k} x={40 + i * 86 + k * 5} y={176} width={2} height={14} fill={C.caramel} opacity={k / v <= un ? 1 : 0} />)}
        </g>
      ))}
      <T x={30} y={214} s={12} f={C.caramel} o={un}>written in unary: still short</T>
      <rect x={30} y={234} width={280} height={34} rx={5} fill="none" stroke={C.cherryText} opacity={stamp} />
      <T x={170} y={256} s={13} f={C.cherryText} a="middle" o={stamp}>still NP-hard: strongly</T>
    </Svg>
  );
}

// 10 · ThreePartitionBlowUp. Triples from 2 to 6: the largest number stays capped at 30 (a flat line), while the
// backtracking solver's call count climbs (examples.py's seeded runs, shape only).
const CALLS = [3, 4, 5, 9, 38]; // seeded: shape only
export function ThreePartitionBlowUp({ t }: StepCtx) {
  const X0 = 90, X1 = 520, Y0 = 230;
  const px = (m: number) => X0 + ((m - 2) / 4) * (X1 - X0);
  const k = stepIdx(t, 0.4, 3.2, 5);
  const flat = easeOut(seg(t, 0.4, 1.0));
  const cap = easeOut(seg(t, 3.4, 4.0));
  return (
    <Svg label="Triples from two to six. The largest number in each instance stays capped at thirty, a flat line, while the backtracking solver's call count climbs sharply" h={290}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      {[2, 3, 4, 5, 6].map((m) => <T key={m} x={px(m)} y={Y0 + 18} s={12} f={C.latte} a="middle">{m}</T>)}
      <T x={X1} y={Y0 + 40} s={12} f={C.latte} a="end">triples</T>
      <line x1={px(2)} y1={Y0 - 30} x2={lerp(px(2), px(6), flat)} y2={Y0 - 30} stroke={C.cinnamon} strokeWidth={2} />
      <T x={X0} y={Y0 - 12} s={12} f={C.cinnamon} o={flat}>largest number: at most 30</T>
      {CALLS.map((c, i) => (
        <rect key={i} x={px(2 + i) - 16} y={Y0 - 50 - c * 3.6} width={32} height={c * 3.6} fill={i === 4 ? C.cherry : C.caramel} stroke={i === 4 ? C.cherryText : 'none'} opacity={i <= k ? 1 : 0} />
      ))}
      <T x={X0} y={40} s={12} f={C.cherryText} o={cap}>search calls: climbing</T>
    </Svg>
  );
}

// 11 · NoEscapeArgument. A chain of boxes: strongly NP-hard, plus a pseudo-polynomial algorithm, on numbers capped by
// a polynomial, gives polynomial time; but those capped instances are still NP-hard: a red cross on the chain.
export function NoEscapeArgument({ t }: StepCtx) {
  const steps = ['strongly NP-hard', '+ pseudo-poly algorithm', 'numbers capped', 'polynomial time'];
  const k = stepIdx(t, 0.3, 3.0, 4);
  const x = easeOut(seg(t, 3.4, 4.0));
  return (
    <Svg label="A chain of boxes: a strongly NP-hard problem, plus a pseudo-polynomial algorithm, run on numbers capped by a polynomial, gives polynomial time. But those capped instances are still NP-hard, so the chain breaks: a contradiction" h={290}>
      {steps.map((s2, i) => (
        <g key={s2} opacity={i <= k ? 1 : 0}>
          <rect x={150} y={20 + i * 52} width={300} height={36} rx={5} fill="none" stroke={i === 3 ? C.caramel : C.crema} />
          <T x={300} y={43 + i * 52} s={12} f={i === 3 ? C.caramel : C.crema} a="middle">{s2}</T>
          {i > 0 && <line x1={300} y1={4 + i * 52} x2={300} y2={18 + i * 52} stroke={C.latte} />}
        </g>
      ))}
      <g opacity={x}>
        <line x1={420} y1={180} x2={470} y2={230} stroke={C.cherryText} strokeWidth={3} />
        <line x1={470} y1={180} x2={420} y2={230} stroke={C.cherryText} strokeWidth={3} />
        <T x={300} y={250} s={12} f={C.cherryText} a="middle">but capped instances are still NP-hard</T>
        <T x={300} y={274} s={12} f={C.cherryText} a="middle">so no such algorithm, unless P = NP</T>
      </g>
    </Svg>
  );
}

// 12 · BinPackingKFixed. Bin packing's table with capacity 10 against the bin count: 11, 121, 1,331, 14,641, 161,051
// states for 1 to 5 bins, on a log axis, multiplying by 11 each bin. Fixing the bin count leaves it pseudo-polynomial.
const BP = [
  { k: 1, s: '11', v: 11 },
  { k: 2, s: '121', v: 121 },
  { k: 3, s: '1,331', v: 1331 },
  { k: 4, s: '14,641', v: 14641 },
  { k: 5, s: '161,051', v: 161051 },
];
export function BinPackingKFixed({ t }: StepCtx) {
  const X0 = 110, X1 = 520;
  const k = stepIdx(t, 0.3, 2.8, 5);
  const fixK = easeOut(seg(t, 3.0, 3.6));
  const fixC = easeOut(seg(t, 3.9, 4.5));
  return (
    <Svg label="Bin packing's table with bin capacity ten, against the number of bins: 11, 121, 1,331, 14,641 and 161,051 states for one to five bins, multiplying by eleven with each bin. Fix the bin count and it is pseudo-polynomial; fix the capacity instead and it is polynomial" h={290}>
      <T x={30} y={24} s={12} f={C.latte}>states, capacity 10, log scale</T>
      {BP.map((b, i) => (
        <g key={b.k} opacity={i <= k ? 1 : 0}>
          <T x={X0 - 12} y={54 + i * 34} s={12} f={C.latte} a="end">{b.k === 1 ? '1 bin' : `${b.k} bins`}</T>
          <rect x={X0} y={40 + i * 34} width={(Math.log10(b.v) / 5.3) * (X1 - X0)} height={20} fill={C.caramel} />
          <T x={X0 + (Math.log10(b.v) / 5.3) * (X1 - X0) + 8} y={55 + i * 34} s={12} f={C.crema}>{b.s}</T>
        </g>
      ))}
      <T x={30} y={240} s={12} f={C.caramel} o={fixK}>fix the bins: pseudo-polynomial</T>
      <T x={30} y={264} s={12} f={C.cinnamon} o={fixC}>fix the capacity: polynomial</T>
      <T x={30} y={286} s={12} f={C.cherryText} o={fixC}>both free: strongly NP-hard</T>
    </Svg>
  );
}

// 13 · WhatThisRulesOut. Left: strongly NP-hard, with a bounded objective: an exact pseudo-polynomial algorithm and a
// fully polynomial approximation scheme are both crossed out (unless P = NP). Right: knapsack, weakly hard, keeps its
// scheme, an arrow to a later topic.
export function WhatThisRulesOut({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const x1 = easeOut(seg(t, 1.0, 1.5));
  const x2 = easeOut(seg(t, 1.8, 2.3));
  const b = easeOut(seg(t, 2.8, 3.5));
  const cross = (x: number, y: number, o: number) => (
    <g opacity={o}>
      <line x1={x} y1={y - 10} x2={x + 240} y2={y + 4} stroke={C.cherryText} strokeWidth={2} />
    </g>
  );
  return (
    <Svg label="Left, a strongly NP-hard problem with a bounded objective: an exact pseudo-polynomial algorithm and a fully polynomial-time approximation scheme are both crossed out, unless P equals NP. Right, knapsack, only weakly hard, keeps its scheme, with an arrow to a later topic" h={290}>
      <g opacity={a}>
        <T x={30} y={36} s={13} f={C.cherryText}>strongly NP-hard</T>
        <T x={30} y={80} s={12} f={C.crema}>pseudo-poly exact algorithm</T>
        <T x={30} y={120} s={12} f={C.crema}>FPTAS</T>
        {cross(26, 76, x1)}
        {cross(26, 116, x2)}
        <T x={30} y={156} s={12} f={C.latte} o={x2}>unless P = NP</T>
      </g>
      <g opacity={b}>
        <T x={340} y={36} s={13} f={C.caramel}>knapsack: weakly</T>
        <T x={340} y={80} s={12} f={C.caramel}>has an FPTAS</T>
        <line x1={340} y1={110} x2={540} y2={110} stroke={C.cinnamon} strokeWidth={1.6} />
        <path d="M546 110 l-10 -6 l0 12 Z" fill={C.cinnamon} />
        <T x={340} y={136} s={12} f={C.cinnamon}>a later topic</T>
      </g>
    </Svg>
  );
}

// 14 · Recap. Shrink the numbers: knapsack's table shrinks with them; bin packing's box of loads, one axis per bin,
// keeps its dimensions and stays large.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const sh = easeInOut(seg(t, 1.2, 3.0));
  const cap = easeOut(seg(t, 3.4, 4.0));
  const O = { x: 400, y: 200 };
  return (
    <Svg label="Shrink the numbers: knapsack's table shrinks with them, while bin packing's box of loads, one axis per bin, keeps all its dimensions and stays large" h={290}>
      <g opacity={a}>
        <T x={30} y={36} s={12} f={C.caramel}>knapsack's table</T>
        <rect x={30} y={50} width={lerp(240, 60, sh)} height={lerp(140, 50, sh)} fill={C.caramel} opacity={0.3} stroke={C.caramel} />
        <T x={330} y={36} s={12} f={C.cherryText}>bin packing's loads</T>
        <line x1={O.x} y1={O.y} x2={O.x + 140} y2={O.y} stroke={C.cherryText} strokeWidth={1.6} />
        <line x1={O.x} y1={O.y} x2={O.x} y2={O.y - 120} stroke={C.cherryText} strokeWidth={1.6} />
        <line x1={O.x} y1={O.y} x2={O.x - 60} y2={O.y + 40} stroke={C.cherryText} strokeWidth={1.6} />
        {[0, 1, 2].map((k) => <rect key={k} x={O.x - k * 20} y={O.y - lerp(110, 90, sh) + k * 13} width={lerp(130, 110, sh)} height={lerp(110, 90, sh)} fill="none" stroke={C.cherryText} strokeWidth={0.8} opacity={0.6} />)}
      </g>
      <T x={30} y={262} s={12} f={C.caramel} o={cap}>shrink the numbers: the table goes</T>
      <T x={30} y={284} s={12} f={C.cherryText} o={cap}>the bins' interaction stays</T>
    </Svg>
  );
}
