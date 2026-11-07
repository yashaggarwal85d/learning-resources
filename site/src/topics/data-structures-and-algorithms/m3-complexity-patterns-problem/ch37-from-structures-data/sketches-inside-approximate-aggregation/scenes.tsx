import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the textbook structure, and exact data in memory; latte =
// secondary labels (a count, a weight, a bound); taupe = data on disk or not yet merged; caramel
// = the thing to look at (the merged sketch, the correct answer); cinnamon (rare) = the system's
// modification set against the textbook; cherry/cherryText = the bad outcome (an over-count, a
// wrong average).

function box(x: number, y: number, label: string, colour: string = C.crema, w = 90) {
  return (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={w} height={36} rx={4} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + w / 2} y={y + 23} s={12} a="middle" f={colour}>{label}</T>
    </g>
  );
}

function arrow(x1: number, y: number, x2: number, colour: string = C.latte) {
  return <line key={`${x1}-${x2}-${y}`} x1={x1} y1={y} x2={x2} y2={y} stroke={colour} strokeWidth={1.4} markerEnd="url(#arrow)" />;
}

// 1 · Eight partitions, one wrong average
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const b = easeOut(seg(t, 1.5, 2.6));
  const heights = [40, 48, 50, 60, 66, 74, 100, 160];
  return (
    <Svg label="Eight partition-median bars, a plain average line far off, and the true median line inside the ordinary bars' own range" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>each partition's own median order amount</T>
      <g opacity={a}>
        {heights.map((h, i) => (
          <Bar key={i} x={60 + i * 48} y={260 - h} w={34} h={h} full={1} fill={i === 7 ? C.cinnamon : C.crema} />
        ))}
      </g>
      <g opacity={b}>
        <line x1={50} y1={150} x2={430} y2={150} stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="4 3" />
        <line x1={50} y1={210} x2={430} y2={210} stroke={C.caramel} strokeWidth={1.6} strokeDasharray="4 3" />
        <T x={30} y={285} s={11} f={C.cherryText}>average of the eight medians</T>
        <T x={30} y={305} s={11} f={C.caramel}>true median of the whole stream</T>
      </g>
    </Svg>
  );
}

// 2 · What a mergeable aggregate already is
export function PartialAggregation({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const c = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="Two subsets, each reduced to a partial state, combined by one function into the same result a single pass would give" h={300}>
      <g opacity={a}>
        {box(60, 60, 'subset A → partial state', C.crema, 180)}
        {box(60, 150, 'subset B → partial state', C.crema, 180)}
      </g>
      <g opacity={c}>
        {arrow(250, 78, 360, C.latte)}
        {arrow(250, 168, 360, C.latte)}
        {box(360, 110, 'combine', C.caramel, 110)}
        {arrow(470, 128, 540, C.latte)}
      </g>
    </Svg>
  );
}

// 3 · The same contract, for a harder question
export function MergeLaw({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const c = easeOut(seg(t, 1.4, 2.3));
  return (
    <Svg label="Two partial sketches merging into one combined sketch, labelled exactly or within a stated error" h={300}>
      <g opacity={a}>
        {box(60, 70, 'partial sketch A', C.crema, 170)}
        {box(60, 150, 'partial sketch B', C.crema, 170)}
      </g>
      <g opacity={c}>
        {arrow(240, 88, 350, C.latte)}
        {arrow(240, 168, 350, C.latte)}
        {box(350, 110, 'merge', C.caramel, 100)}
        <T x={300} y={230} s={12} a="middle" f={C.latte}>exactly, or within a stated error</T>
      </g>
    </Svg>
  );
}

// 4 · A register that only ever grows
export function HllRegisters({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.6));
  const cells = [2, 5, 1, 7, 3, 4, 6, 2, 1, 5, 3, 8, 2, 4, 1, 6];
  return (
    <Svg label="A row of registers, each holding the longest run of leading zero bits any hash landing there has produced" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>register array, one longest run per index</T>
      <g opacity={a}>
        {cells.map((v, i) => (
          <Bar key={i} x={50 + i * 32} y={240 - v * 18} w={22} h={v * 18} full={1} fill={C.crema} />
        ))}
      </g>
    </Svg>
  );
}

// 5 · Summed, or merged?
export function SumVsMerge({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="One customer appearing in two partitions; summing the partitions' own estimates counts that customer twice" h={300}>
      <g opacity={a}>
        {box(60, 70, 'partition A: sees customer X', C.crema, 220)}
        {box(60, 150, 'partition B: sees customer X', C.crema, 220)}
      </g>
      <g opacity={b}>
        {box(320, 70, 'sum the estimates', C.cherry, 150)}
        <T x={395} y={126} s={12} a="middle" f={C.cherryText}>customer X counted twice</T>
        {box(320, 170, 'merge the registers', C.caramel, 150)}
        <T x={395} y={226} s={12} a="middle" f={C.caramel}>customer X counted once</T>
      </g>
    </Svg>
  );
}

// 6 · Measured: exact at the register, wrong by the shortcut
export function RegisterMergeMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const b = easeOut(seg(t, 1.5, 2.6));
  return (
    <Svg label="Merged registers exactly matching a single pass, set against a summed estimate several times too high" h={320}>
      <g opacity={a}>
        <T x={60} y={60} s={12} a="start" f={C.latte}>merged registers</T>
        <Bar x={220} y={48} w={120} h={20} full={1} fill={C.crema} />
        <T x={60} y={95} s={12} a="start" f={C.latte}>single pass</T>
        <Bar x={220} y={83} w={120} h={20} full={1} fill={C.crema} />
        <T x={360} y={63} s={11} f={C.caramel}>identical, bit for bit</T>
      </g>
      <g opacity={b}>
        <T x={60} y={180} s={12} a="start" f={C.latte}>true distinct customers</T>
        <Bar x={220} y={168} w={100} h={20} full={1} fill={C.crema} />
        <T x={60} y={225} s={12} a="start" f={C.latte}>summed per-partition estimates</T>
        <Bar x={220} y={213} w={300} h={20} full={1} fill={C.cherry} />
      </g>
    </Svg>
  );
}

// 7 · A summary that is only approximately mergeable
export function QuantileSketch({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.6));
  const marks = [20, 70, 130, 170, 230, 280, 330, 390, 430, 470];
  const kept = new Set([70, 170, 280, 390]);
  return (
    <Svg label="Every value on a line, most faded out, a small kept sample standing in for the whole set" h={300}>
      <T x={30} y={30} s={13} f={C.latte}>a bounded sample stands in for every value</T>
      <line x1={40} y1={150} x2={520} y2={150} stroke={C.mocha} strokeWidth={1.4} />
      <g opacity={a}>
        {marks.map((x, i) => (
          <circle key={i} cx={x + 40} cy={150} r={kept.has(x) ? 6 : 3} fill={kept.has(x) ? C.caramel : C.taupe} />
        ))}
      </g>
    </Svg>
  );
}

// 8 · Measured: averaging medians is wrong
export function AveragingWrong({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.6));
  return (
    <Svg label="Naive average far from the true median, a merged weighted sample close to it" h={300}>
      <g opacity={a}>
        <T x={60} y={60} s={12} a="start" f={C.latte}>true median</T>
        <Bar x={240} y={48} w={120} h={20} full={1} fill={C.crema} />
        <T x={60} y={110} s={12} a="start" f={C.latte}>naive average of medians</T>
        <Bar x={240} y={98} w={220} h={20} full={1} fill={C.cherry} />
        <T x={60} y={160} s={12} a="start" f={C.latte}>merged weighted sample</T>
        <Bar x={240} y={148} w={128} h={20} full={1} fill={C.caramel} />
      </g>
    </Svg>
  );
}

// 9 · Where the weighting comes from
export function WeightedSampling({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Each partition's own small reservoir sample, carrying a weight equal to the rows it stands for" h={300}>
      <g opacity={a}>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            {box(60, 60 + i * 70, `partition ${['one', 'two', 'three'][i]}`, C.crema, 150)}
            {arrow(210, 78 + i * 70, 300, C.latte)}
            {box(300, 60 + i * 70, 'sample, its own weight', C.caramel, 180)}
          </g>
        ))}
      </g>
    </Svg>
  );
}

// 10 · Measured: boundaries chosen from samples alone
export function RangeBoundaries({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.6));
  const sampled = [120, 260, 400];
  const truth = [128, 268, 392];
  return (
    <Svg label="Sampled boundary marks landing close to the true boundaries a full sort would have chosen" h={300}>
      <line x1={40} y1={150} x2={520} y2={150} stroke={C.mocha} strokeWidth={1.4} />
      <g opacity={a}>
        {truth.map((x, i) => <line key={`t${i}`} x1={x} y1={120} x2={x} y2={180} stroke={C.crema} strokeWidth={1.6} />)}
        {sampled.map((x, i) => <line key={`s${i}`} x1={x} y1={130} x2={x} y2={170} stroke={C.caramel} strokeWidth={2.4} strokeDasharray="3 3" />)}
        <T x={60} y={210} s={11} f={C.crema}>solid: true boundary</T>
        <T x={260} y={210} s={11} f={C.caramel}>dashed: sampled boundary</T>
      </g>
    </Svg>
  );
}

// 11 · Named once: a filter that merges too
export function BloomMerge({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.4, 2.4));
  const rowA = [true, false, true, false, false, true, false, true];
  const rowB = [false, true, false, false, true, false, true, false];
  const merged = rowA.map((v, i) => v || rowB[i]);
  return (
    <Svg label="Two partitions' own filters, OR'd bit by bit into one merged filter that keeps every membership answer either one gave" h={300}>
      <g opacity={a}>
        <T x={30} y={30} s={12} f={C.latte}>partition A's filter</T>
        {rowA.map((on, i) => (
          <rect key={i} x={30 + i * 30} y={44} width={22} height={22} rx={3} fill="none" stroke={on ? C.crema : C.taupe} strokeWidth={1.6} />
        ))}
        <T x={30} y={94} s={12} f={C.latte}>partition B's filter</T>
        {rowB.map((on, i) => (
          <rect key={i} x={30 + i * 30} y={108} width={22} height={22} rx={3} fill="none" stroke={on ? C.crema : C.taupe} strokeWidth={1.6} />
        ))}
      </g>
      <g opacity={b}>
        <T x={30} y={168} s={12} f={C.caramel}>merged, by bitwise OR</T>
        {merged.map((on, i) => (
          <rect key={i} x={30 + i * 30} y={182} width={22} height={22} rx={3} fill="none" stroke={on ? C.caramel : C.taupe} strokeWidth={1.8} />
        ))}
      </g>
    </Svg>
  );
}

// 12 · Where a sketch travels
export function WhereItTravels({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.4, 2.3));
  const c = easeOut(seg(t, 2.5, 3.4));
  return (
    <Svg label="A sketch built on each machine, shuffled as bytes, merged once at the end" h={280}>
      <g opacity={a}>{box(40, 110, 'built, per machine', C.crema, 160)}</g>
      <g opacity={b}>
        {arrow(200, 128, 280, C.latte)}
        {box(280, 110, 'shuffled, as bytes', C.cinnamon, 150)}
      </g>
      <g opacity={c}>
        {arrow(430, 128, 500, C.latte)}
        {box(500, 110, 'merged, once', C.caramel, 110)}
      </g>
    </Svg>
  );
}

// 13 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.8));
  const labels = ['hash table that spills', 'sort that spills', 'heap that merges', 'queue that schedules', 'union–find that clusters', 'tree that indexes', 'ring that places', 'sketch that merges'];
  return (
    <Svg label="Eight structures recapped, the last one — a sketch that merges — picked out" h={340}>
      <g opacity={a}>
        {labels.map((l, i) => (
          <T key={i} x={40} y={40 + i * 34} s={13} f={i === labels.length - 1 ? C.caramel : C.latte}>{l}</T>
        ))}
      </g>
    </Svg>
  );
}

// 14 · Reading them was half of the skill
export function Handoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.4, 2.2));
  return (
    <Svg label="From reading eight structures inside real systems to building one from scratch" h={280}>
      <g opacity={a}>{box(80, 120, 'reading real systems', C.crema, 200)}</g>
      <g opacity={b}>
        {arrow(280, 138, 360, C.latte)}
        {box(360, 120, 'building one from scratch', C.caramel, 210)}
      </g>
    </Svg>
  );
}
