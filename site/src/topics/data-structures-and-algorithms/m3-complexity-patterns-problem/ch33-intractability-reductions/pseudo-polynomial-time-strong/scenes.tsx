import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = an instance, a table, a certificate; latte = secondary
// labels (a count, a bit length); taupe = the part not yet reached; caramel (focus) = the thing
// to look at — the cell count climbing, the table that stays small; cherry/cherryText (rare) =
// the bad outcome — a search tree fanning out despite small numbers, hardness that does not go
// away.

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a1 = easeOut(seg(t, 0.1, 0.4));
  const a2 = easeOut(seg(t, 0.4, 0.7));
  const a3 = easeOut(seg(t, 0.7, 1));
  return (
    <Svg label="A knapsack table grows fast as bits are appended to its capacity" h={230}>
      <T x={30} y={30} s={12} f={C.latte}>a hundred items, a capacity written in bits</T>
      <Bar x={30} y={50} w={60} h={14} full={60} fill={C.crema} />
      <T x={100} y={62} s={12} f={C.crema} o={a1}>about a hundred thousand cells</T>
      <Bar x={30} y={80} w={160} h={14} full={160} fill={C.crema} o={a2} />
      <T x={200} y={92} s={12} f={C.crema} o={a2}>ten more bits: a hundred million</T>
      <Bar x={30} y={110} w={360} h={14} full={360} fill={C.caramel} o={a3} />
      <T x={30} y={145} s={12} f={C.caramel} o={a3}>thirty bits more: over a hundred trillion</T>
      <T x={30} y={175} s={11} f={C.latte} o={a3}>same hundred items, one number thirty bits longer</T>
    </Svg>
  );
}

// 2 · PredictBinPacking
export function PredictBinPacking({ answer }: StepCtx) {
  const opts = [
    'Yes, the same trick shrinks its table too',
    'No, its table depends on every bin at once',
    'No, bin packing has no table at all',
    'Yes, but only for very few items',
  ];
  return (
    <Svg label="Bin packing also has numbers in it — does it have the same kind of table?" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={380} height={28} rx={4} fill="none" stroke={answer !== null && i === 1 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 1 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 1 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · KnapsackNPCompleteAndDP
export function KnapsackNPCompleteAndDP({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Knapsack is NP-complete, yet a table fills it in one pass" h={240}>
      <T x={30} y={30} s={12} f={C.latte}>can value at least V fit under weight W?</T>
      <rect x={30} y={50} width={200} height={100} rx={4} fill="none" stroke={C.crema} strokeWidth={1.3} />
      <T x={40} y={70} s={12} f={C.crema}>one row per item</T>
      <T x={40} y={90} s={12} f={C.crema}>one column per weight up to W</T>
      <T x={40} y={120} s={12} f={C.caramel} o={a}>n times W cells, filled once</T>
      <T x={30} y={180} s={12} f={C.latte} o={a}>decision form: NP-complete</T>
      <T x={30} y={205} s={12} f={C.latte} o={a}>yet this table solves it</T>
    </Svg>
  );
}

// 4 · CellsVsBits
export function CellsVsBits({ t }: StepCtx) {
  const rows = [
    { label: 'ten bits of capacity', words: 'about a hundred thousand cells', frac: 0.15 },
    { label: 'twenty bits of capacity', words: 'about a hundred million cells', frac: 0.45 },
    { label: 'forty bits of capacity', words: 'over a hundred trillion cells', frac: 0.95 },
  ];
  return (
    <Svg label="Cell count against the bit length of the capacity, same items" h={230}>
      {rows.map((r, i) => {
        const o = easeOut(seg(t, 0.1 + i * 0.25, 0.4 + i * 0.25));
        return (
          <g key={r.label}>
            <T x={30} y={35 + i * 60} s={12} f={C.latte} o={o}>{r.label}</T>
            <Bar x={30} y={45 + i * 60} w={360 * r.frac * o} h={14} full={360} fill={i === 2 ? C.caramel : C.crema} />
            <T x={30} y={78 + i * 60} s={11} f={i === 2 ? C.caramel : C.crema} o={o}>{r.words}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · UnaryVsBinary
export function UnaryVsBinary({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="The same capacity, written two ways" h={220}>
      <T x={30} y={30} s={12} f={C.latte}>binary: a short string of bits</T>
      <Bar x={30} y={45} w={40} h={14} full={40} fill={C.crema} />
      <T x={30} y={90} s={12} f={C.latte} o={a}>unary: one tally per unit of value</T>
      <Bar x={30} y={105} w={380 * a} h={14} full={380} fill={C.cherryText} o={a} />
      <T x={30} y={145} s={11} f={C.caramel} o={a}>the table is only as big as this strip is long</T>
    </Svg>
  );
}

// 6 · WeakNPHardness
export function WeakNPHardness({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Weak NP-hardness: hard only because the numbers are written compactly" h={210}>
      <T x={30} y={30} s={12} f={C.crema}>weakly NP-hard:</T>
      <T x={40} y={55} s={12} f={C.latte}>hard in binary encoding</T>
      <T x={40} y={78} s={12} f={C.latte}>a pseudo-polynomial algorithm may still exist</T>
      <T x={30} y={115} s={12} f={C.caramel} o={a}>example: the partition problem</T>
      <T x={40} y={140} s={11} f={C.latte} o={a}>shrink the numbers, and the table shrinks with them</T>
    </Svg>
  );
}

// 7 · TimedGrowthDoublingPerBit
export function TimedGrowthDoublingPerBit({ t }: StepCtx) {
  const bars = [0.1, 0.16, 0.24, 0.36, 0.5, 0.7, 0.95];
  return (
    <Svg label="Measured running time as one more bit is appended to the capacity" h={210}>
      {bars.map((frac, i) => {
        const o = easeOut(seg(t, 0.05 * i, 0.05 * i + 0.3));
        return <Bar key={i} x={30 + i * 50} y={160 - 120 * frac} w={30} h={120 * frac} full={120} fill={i === bars.length - 1 ? C.caramel : C.crema} o={o} />;
      })}
      <T x={30} y={185} s={12} f={C.latte}>one more bit on the capacity, each bar to the right</T>
      <T x={30} y={30} s={12} f={C.caramel}>time roughly doubles with every bit</T>
    </Svg>
  );
}

// 8 · PredictThreePartition
export function PredictThreePartition({ answer }: StepCtx) {
  const opts = [
    'Yes, small numbers make it easy, like partition',
    'No, it stays hard even with tiny numbers',
    'Yes, but only if there are few triples',
    'It depends on the specific numbers chosen',
  ];
  return (
    <Svg label="Three-partition's numbers are small by design — does that make it easy?" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={380} height={28} rx={4} fill="none" stroke={answer !== null && i === 1 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 1 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 1 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 9 · StrongNPHardnessDefinition
export function StrongNPHardnessDefinition({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Strong NP-hardness: hard even when every number is kept small" h={220}>
      <T x={30} y={30} s={12} f={C.crema}>strongly NP-hard:</T>
      <T x={40} y={55} s={12} f={C.latte}>stays NP-hard even bounded by a polynomial in n</T>
      <T x={40} y={78} s={12} f={C.latte}>the same as hard even written in unary</T>
      <T x={30} y={115} s={12} f={C.caramel} o={a}>example: the three-partition problem</T>
      <T x={40} y={140} s={11} f={C.latte} o={a}>shrinking the numbers changes nothing here</T>
    </Svg>
  );
}

// 10 · ThreePartitionBlowUp
export function ThreePartitionBlowUp({ t }: StepCtx) {
  const depths = [1, 2, 3, 4, 5];
  return (
    <Svg label="Every number here stays small; the search tree still fans out wide" h={220}>
      {depths.map((d, i) => {
        const branches = Math.min(2 ** i, 10);
        const o = easeOut(seg(t, 0.1 * i, 0.1 * i + 0.3));
        return (
          <g key={d}>
            {Array.from({ length: branches }, (_, j) => (
              <circle key={j} cx={40 + j * (360 / branches)} cy={40 + i * 35} r={4} fill={i === depths.length - 1 ? C.cherryText : C.crema} opacity={o} />
            ))}
          </g>
        );
      })}
      <T x={30} y={200} s={12} f={C.cherryText}>small triples, more triples to place: the tree still explodes</T>
    </Svg>
  );
}

// 11 · NoEscapeArgument
export function NoEscapeArgument({ t }: StepCtx) {
  const a1 = easeOut(seg(t, 0.15, 0.4));
  const a2 = easeOut(seg(t, 0.45, 0.7));
  const a3 = easeOut(seg(t, 0.75, 1));
  return (
    <Svg label="Why strong hardness rules out a pseudo-polynomial algorithm" h={220}>
      <T x={30} y={35} s={12} f={C.latte} o={a1}>suppose a pseudo-polynomial algorithm existed</T>
      <T x={30} y={75} s={12} f={C.latte} o={a2}>bound every number by a polynomial in the input</T>
      <T x={30} y={115} s={12} f={C.caramel} o={a3}>then it runs in polynomial time outright</T>
      <T x={30} y={155} s={12} f={C.cherryText} o={a3}>contradicting hardness on exactly those bounded instances</T>
    </Svg>
  );
}

// 12 · BinPackingKFixed
export function BinPackingKFixed({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Fix the number of bins, or fix their capacity, and hardness lifts" h={220}>
      <T x={30} y={30} s={12} f={C.latte}>bin count fixed: pseudo-polynomial in the capacity</T>
      <rect x={30} y={45} width={28} height={28} fill="none" stroke={C.crema} strokeWidth={1.2} />
      <rect x={66} y={45} width={28} height={28} fill="none" stroke={C.crema} strokeWidth={1.2} />
      <rect x={102} y={45} width={28} height={28} fill="none" stroke={C.crema} strokeWidth={1.2} />
      <T x={150} y={64} s={11} f={C.latte}>a fixed, small count of bins</T>
      <T x={30} y={110} s={12} f={C.caramel} o={a}>bin capacity fixed: polynomial outright</T>
      <T x={30} y={150} s={11} f={C.cherryText} o={a}>the hard case: many bins, many sizes, together</T>
    </Svg>
  );
}

// 13 · WhatThisRulesOut
export function WhatThisRulesOut({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Strong hardness rules out more than an exact algorithm" h={200}>
      <T x={30} y={30} s={12} f={C.latte}>no pseudo-polynomial algorithm, unless P equals NP</T>
      <T x={30} y={60} s={12} f={C.latte} o={a}>and no fully polynomial-time approximation scheme either</T>
      <T x={30} y={95} s={12} f={C.caramel} o={a}>knapsack's own such scheme is weak hardness's reward</T>
      <T x={30} y={125} s={11} f={C.latte} o={a}>a separate topic's story, named once here</T>
    </Svg>
  );
}

// 14 · Recap
export function Recap({ t }: StepCtx) {
  const a1 = easeOut(seg(t, 0.1, 0.35));
  const a2 = easeOut(seg(t, 0.4, 0.65));
  const a3 = easeOut(seg(t, 0.7, 1));
  return (
    <Svg label="Weak hardness fades with small numbers; strong hardness never does" h={220}>
      <T x={30} y={35} s={12} f={C.crema} o={a1}>knapsack: a table, polynomial in the value</T>
      <T x={30} y={75} s={12} f={C.crema} o={a2}>bin packing: no table escapes the bin count</T>
      <T x={30} y={115} s={12} f={C.caramel} o={a3}>small numbers save one, not the other</T>
      <T x={30} y={150} s={11} f={C.latte} o={a3}>next: approximation ratios and greedy set cover</T>
    </Svg>
  );
}
