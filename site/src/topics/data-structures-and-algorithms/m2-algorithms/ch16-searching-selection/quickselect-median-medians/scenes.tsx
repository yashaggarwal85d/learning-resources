import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Eq } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 16): crema = a candidate at rest; latte = secondary
// labels; taupe = the eliminated region (discarded after a partition); caramel = the
// thing to look at this beat (the pivot, a group's median); cherry/cherryText = the bad
// outcome (the adversarial quadratic blow-up). This topic's own arrays (examples.py):
// quickselect/median-of-medians on random keys, an adversarial sorted input, groups of
// five with their medians.

function Bar({ x, y, h, fill = C.crema, o = 1 }: { x: number; y: number; h: number; fill?: string; o?: number }) {
  return <rect x={x} y={y - h} width={16} height={h} fill={fill} opacity={o} />;
}

// 1 · Opening: a million numbers, a question about only one of them.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const heights = [40, 70, 25, 55, 90, 15, 60, 35, 80, 45];
  return (
    <Svg label="A row of bars standing for a million unsorted numbers, with the question of finding only the median" h={240}>
      {heights.map((h, i) => <Bar key={i} x={40 + i * 50} y={160} h={h} />)}
      <T x={300} y={200} s={13} f={C.latte} a="middle" o={a}>finding the median shouldn't require sorting all of it</T>
    </Svg>
  );
}

// 2 · PredictComparisons.
export function PredictComparisons({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A million keys with three candidate comparison counts, n, n log n, and n squared, waiting to be ruled out" h={220}>
      <T x={30} y={50} s={13} f={C.latte} o={a}>1,000,000 random keys — find the median</T>
      <Eq x={300} y={110} a="middle">n ? n·log n ? n²?</Eq>
      {answer !== null && (
        <T x={300} y={170} s={16} f={C.caramel} a="middle">a small constant times n</T>
      )}
    </Svg>
  );
}

// 3 · Quickselect: one side kept, the other discarded.
export function Quickselect({ t }: StepCtx) {
  const heights = [40, 70, 25, 55, 90, 15, 60, 35, 80, 45];
  const pivotIdx = 4;
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="Bars partitioned around a pivot, one side coloured as discarded, the other kept for the next round" h={240}>
      {heights.map((h, i) => (
        <Bar key={i} x={40 + i * 50} y={160} h={h} fill={i === pivotIdx ? C.caramel : i < pivotIdx ? C.crema : C.taupe} />
      ))}
      <T x={300} y={200} s={13} f={C.latte} a="middle" o={a}>the discarded side is never sorted, never visited again</T>
    </Svg>
  );
}

// 4 · WorstCase: adversarial pivot, quadratic blow-up.
export function WorstCase({ t }: StepCtx) {
  const n = 14;
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="A row of ascending bars with the first element always chosen as pivot, shrinking the range by only one each round" h={260}>
      {Array.from({ length: n }, (_, i) => (
        <Bar key={i} x={30 + i * 36} y={160} h={20 + i * 8} fill={i === 0 ? C.cherry : C.quiet} />
      ))}
      <T x={300} y={200} s={13} f={C.cherryText} a="middle" o={a}>first-element pivot on sorted input —</T>
      <T x={300} y={218} s={13} f={C.cherryText} a="middle" o={a}>one element discarded per round</T>
    </Svg>
  );
}

// 5 · MedianOfMedians: groups of five collapsing to their median.
export function MedianOfMedians({ t }: StepCtx) {
  const groups = [[3, 1, 4, 1, 5], [9, 2, 6, 5, 3], [5, 8, 9, 7, 9]];
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="Three groups of five bars each collapsing to their own median, those medians collapsing again to the pivot" h={280}>
      {groups.map((g, gi) => (
        <g key={gi}>
          {g.map((v, i) => (
            <Bar key={i} x={40 + gi * 170 + i * 28} y={110} h={v * 8} fill={i === 2 ? C.caramel : C.crema} />
          ))}
          <T x={40 + gi * 170 + 2 * 28 + 8} y={130} s={10} f={C.caramel} a="middle">median</T>
        </g>
      ))}
      <T x={300} y={200} s={13} f={C.latte} a="middle" o={a}>median of the group-medians — at least</T>
      <T x={300} y={218} s={13} f={C.latte} a="middle" o={a}>three in ten below it, three in ten above</T>
    </Svg>
  );
}

// 6 · WhyNobodyUsesIt: measured comparison counts, side by side.
export function WhyNobodyUsesIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="Two bars comparing measured comparison counts, quickselect lower, median of medians higher, on the same input" h={260}>
      <Bar x={190} y={180} h={70} fill={C.caramel} />
      <Bar x={300} y={180} h={150} fill={C.quiet} />
      <T x={198} y={210} s={11} f={C.caramel} a="middle">quickselect</T>
      <T x={308} y={210} s={11} f={C.latte} a="middle">median of</T>
      <T x={308} y={228} s={11} f={C.latte} a="middle">medians</T>
      <T x={300} y={30} s={13} f={C.latte} a="middle" o={a}>same input, same target rank</T>
    </Svg>
  );
}

// 6b · FloydRivest: a small sample narrows the range before the usual partition.
export function FloydRivest({ t }: StepCtx) {
  const heights = [40, 70, 25, 55, 90, 15, 60, 35, 80, 45, 50, 65];
  const sampleIdx = new Set([1, 4, 7, 10]);
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="A full row of bars with a small random sample picked out, used to narrow the band the target rank must fall in" h={260}>
      {heights.map((h, i) => (
        <Bar key={i} x={30 + i * 40} y={160} h={h} fill={sampleIdx.has(i) ? C.caramel : C.quiet} />
      ))}
      <T x={300} y={200} s={13} f={C.latte} a="middle" o={a}>the sample estimates two bounds; only the</T>
      <T x={300} y={218} s={13} f={C.latte} a="middle" o={a}>band between them needs a full partition</T>
    </Svg>
  );
}

// 7 · PredictLibrary.
export function PredictLibrary({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A question mark over a standard library's own nth_element, asking whether it really falls back to median of medians" h={220}>
      <T x={30} y={60} s={13} f={C.latte} o={a}>std::nth_element promises a worst-case bound</T>
      <T x={300} y={120} s={16} f={C.caramel} a="middle">median-of-medians fallback?</T>
      {answer !== null && (
        <T x={300} y={170} s={14} f={C.crema} a="middle">not necessarily — check the actual header</T>
      )}
    </Svg>
  );
}

// 8 · Introselect: textbook vs this machine's own library.
export function Introselect({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="Two paths from quickselect once recursion runs too deep: the textbook's median of medians, and this machine's own heap-based fallback" h={300}>
      <T x={300} y={40} s={13} f={C.latte} a="middle">quickselect, recursing too deep</T>
      <T x={30} y={100} s={13} f={C.crema}>textbook (Musser, 1997):</T>
      <T x={30} y={120} s={13} f={C.caramel}>median of medians</T>
      <T x={30} y={160} s={13} f={C.crema}>this machine's libstdc++:</T>
      <T x={30} y={180} s={13} f={C.cherryText}>heap-based select</T>
      <T x={300} y={230} s={12} f={C.quiet} a="middle" o={a}>read directly from</T>
      <T x={300} y={246} s={12} f={C.quiet} a="middle" o={a}>/usr/include/c++/13/bits/stl_algo.h</T>
    </Svg>
  );
}

// 9 · Recap.
export function Recap({ t }: StepCtx) {
  const panels = [
    { l1: 'quickselect', l2: 'expected Θ(n)' },
    { l1: 'median of medians', l2: 'worst-case Θ(n)' },
    { l1: 'introselect', l2: 'textbook vs. real' },
  ];
  return (
    <Svg label="Three panels recapping the topic: quickselect, median of medians, and introselect" h={260}>
      {panels.map((p, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.2 + i * 0.25, 0.8 + i * 0.25))}>
          <circle cx={100 + i * 200} cy={90} r={34} fill="none" stroke={C.crema} strokeWidth={1.4} />
          <T x={100 + i * 200} y={95} s={11} f={C.crema} a="middle">{p.l1}</T>
          <T x={100 + i * 200} y={150} s={13} f={C.latte} a="middle">{p.l2}</T>
        </g>
      ))}
      <T x={300} y={230} s={13} f={C.latte} a="middle">breadth-first search, next</T>
    </Svg>
  );
}
