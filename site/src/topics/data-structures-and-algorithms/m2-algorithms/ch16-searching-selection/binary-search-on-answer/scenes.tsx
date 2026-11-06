import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Eq } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 16): crema = a candidate at rest; latte = secondary
// labels; taupe = the eliminated region; caramel = the thing to look at this beat (the
// candidate capacity, the predicate lamp); cherry/cherryText = the bad outcome (a wrong
// answer from a broken precondition). This topic's own packages (examples.py): [7,2,5,10,8]
// in two trips, minimum capacity 18.
const WEIGHTS = [7, 2, 5, 10, 8];

function CapacityLine({ lo, hi, mid, min = 10, max = 32 }: { lo: number; hi: number; mid?: number; min?: number; max?: number }) {
  const scale = (v: number) => 20 + ((v - min) / (max - min)) * 560;
  return (
    <g>
      <line x1={20} y1={60} x2={580} y2={60} stroke={C.mocha} strokeWidth={1.5} />
      <rect x={scale(min)} y={54} width={scale(lo) - scale(min)} height={12} fill={C.quiet} opacity={0.35} />
      <rect x={scale(hi)} y={54} width={scale(max) - scale(hi)} height={12} fill={C.quiet} opacity={0.35} />
      <rect x={scale(lo)} y={54} width={Math.max(2, scale(hi) - scale(lo))} height={12} fill={C.crema} opacity={0.6} />
      {mid !== undefined && <circle cx={scale(mid)} cy={60} r={6} fill={C.caramel} />}
      {lo === hi ? (
        <T x={scale(lo)} y={44} s={11} f={C.latte} a="middle">{lo}</T>
      ) : (
        <>
          <T x={scale(lo)} y={44} s={11} f={C.latte} a="middle">{lo}</T>
          <T x={scale(hi)} y={44} s={11} f={C.latte} a="middle">{hi}</T>
        </>
      )}
    </g>
  );
}

// 1 · Opening: a courier's packages, a question of minimum capacity.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="Five packages of different weights, with the question of the smallest truck capacity that lets them ship in two trips" h={240}>
      {WEIGHTS.map((w, i) => (
        <rect key={i} x={40 + i * 70} y={120 - w * 6} width={50} height={w * 6} fill="none" stroke={C.crema} strokeWidth={1.2} />
      ))}
      <T x={300} y={160} s={13} f={C.latte} a="middle" o={a}>smallest capacity that ships all of this in two trips?</T>
      <T x={300} y={200} s={18} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>?</T>
    </Svg>
  );
}

// 2 · PredictMonotone: what if the feasibility check weren't monotone?
export function PredictMonotone({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A line of capacities with a false-true boundary, and a question of what happens if that boundary isn't really there" h={260}>
      <CapacityLine lo={18} hi={18} />
      <T x={30} y={110} s={13} f={C.latte} o={a}>the predicate here is false below 18, true at and above it</T>
      {answer !== null && (
        <>
          <T x={30} y={160} s={14} f={C.crema}>if it weren't monotone, the search would</T>
          <T x={30} y={182} s={14} f={C.crema}>still run — and still answer</T>
        </>
      )}
    </Svg>
  );
}

// 3 · Reframe: capacities instead of indices, a feasibility check instead of a lookup.
export function Reframe({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="A capacity line narrowing exactly as an array range did, lo and hi now capacities, mid now a candidate capacity to test" h={280}>
      <T x={300} y={16} s={12} f={C.quiet} a="middle">candidates: capacities, not indices</T>
      <CapacityLine lo={10} hi={32} mid={21} />
      <T x={30} y={150} s={13} f={C.latte} o={a}>feasible(mid) — a greedy packing pass,</T>
      <T x={30} y={168} s={13} f={C.latte} o={a}>not an array comparison</T>
      <T x={30} y={200} s={13} f={C.latte} o={a}>same half-open loop, same overflow-safe midpoint</T>
    </Svg>
  );
}

// 4 · BrokenPrecondition: a non-monotone predicate, confidently wrong.
export function BrokenPrecondition({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  const vals = [true, false, true, true, false];
  return (
    <Svg label="Five positions, true false true true false, with the search landing on index two while the first true position is index zero" h={280}>
      {vals.map((v, i) => (
        <g key={i}>
          <rect x={40 + i * 100} y={50} width={70} height={30} rx={3} fill="none" stroke={v ? C.caramel : C.quiet} strokeWidth={1.3} />
          <T x={40 + i * 100 + 35} y={70} s={13} f={v ? C.caramel : C.quiet} a="middle">{v ? 'true' : 'false'}</T>
        </g>
      ))}
      <T x={40 + 2 * 100 + 35} y={110} s={12} f={C.crema} a="middle" o={a}>search returns index 2</T>
      <T x={300} y={140} s={12} f={C.cherryText} a="middle" o={a}>but index 0 is also true —</T>
      <T x={300} y={158} s={12} f={C.cherryText} a="middle" o={a}>the real first true position</T>
    </Svg>
  );
}

// 5 · RealValuedBisection: converging on the square root of two.
export function RealValuedBisection({ t }: StepCtx) {
  const steps = [[1, 2], [1, 1.5], [1.25, 1.5], [1.375, 1.5], [1.375, 1.4375]];
  return (
    <Svg label="A real-valued range from one to two narrowing step by step toward the square root of two" h={250}>
      {steps.map(([lo, hi], i) => {
        const k = easeOut(seg(t, 0.15 + i * 0.25, 0.6 + i * 0.25));
        return (
          <g key={i} opacity={k}>
            <T x={30} y={50 + i * 34} s={12} f={C.latte}>[{lo}, {hi}]</T>
            <rect x={160} y={40 + i * 34} width={(hi - lo) * 300} height={14} fill={C.crema} opacity={0.5} />
          </g>
        );
      })}
      <T x={30} y={212} s={13} f={C.latte}>no "next" real number to converge to exactly —</T>
      <T x={30} y={230} s={13} f={C.latte}>stop at a precision bound</T>
    </Svg>
  );
}

// 6 · PredictDoubling: does doubling the precision double the iterations?
export function PredictDoubling({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A precision bound shrinking by half, with a question of how much that costs in iterations" h={220}>
      <Eq x={300} y={90} a="middle">hi − lo &lt; ε</Eq>
      <T x={30} y={140} s={13} f={C.latte} o={a}>halve ε — how many more iterations?</T>
      {answer !== null && (
        <T x={300} y={180} s={16} f={C.caramel} a="middle">one — not two</T>
      )}
    </Svg>
  );
}

// 7 · IterationCountIndependent: the halving argument, indifferent to the predicate's cost.
export function IterationCountIndependent({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The iteration count formula, with a note that it never depends on how expensive the predicate itself is to evaluate" h={240}>
      <Eq x={30} y={70}>iterations = ⌈log₂(span / ε)⌉</Eq>
      <T x={30} y={120} s={13} f={C.latte} o={a}>halving ε once more costs exactly one more iteration</T>
      <T x={30} y={150} s={13} f={C.crema} o={a}>the formula never mentions what the predicate computes</T>
    </Svg>
  );
}

// 8 · ParametricSearch: Megiddo's own framing.
export function ParametricSearch({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="A decision procedure feeding an outer binary search, labelled as Megiddo's parametric search pattern" h={260}>
      <T x={300} y={40} s={13} f={C.latte} a="middle">decision: "is value v feasible?"</T>
      <T x={300} y={58} s={13} f={C.latte} a="middle">+ outer binary search over v</T>
      <T x={300} y={110} s={14} f={C.caramel} a="middle">= an optimisation algorithm</T>
      <T x={30} y={170} s={12} f={C.quiet} o={a}>Megiddo, 1983 — not always the fastest route,</T>
      <T x={30} y={192} s={12} f={C.quiet} o={a}>often the best known one</T>
    </Svg>
  );
}

// 9 · Recap.
export function Recap({ t }: StepCtx) {
  const panels = [
    { l1: 'capacity', l2: 'the answer space' },
    { l1: 'ε bound', l2: 'real-valued search' },
    { l1: 'decision + search', l2: 'parametric search' },
  ];
  return (
    <Svg label="Three panels recapping the topic: the answer space, the precision bound, and parametric search" h={260}>
      {panels.map((p, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.2 + i * 0.25, 0.8 + i * 0.25))}>
          <circle cx={100 + i * 200} cy={90} r={34} fill="none" stroke={C.crema} strokeWidth={1.4} />
          <T x={100 + i * 200} y={95} s={11} f={C.crema} a="middle">{p.l1}</T>
          <T x={100 + i * 200} y={150} s={13} f={C.latte} a="middle">{p.l2}</T>
        </g>
      ))}
      <T x={300} y={230} s={13} f={C.latte} a="middle">search in rotated and sorted matrices, next</T>
    </Svg>
  );
}
