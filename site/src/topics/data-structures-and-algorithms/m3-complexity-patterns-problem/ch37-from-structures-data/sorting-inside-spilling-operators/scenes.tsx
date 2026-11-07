import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, chapter 37): crema = the textbook structure as drawn earlier, and
// data in memory; latte = secondary labels; taupe = data on disk (spilled); caramel = the thing
// to look at; cinnamon (rare) = the system's modification set against the textbook; cherry /
// cherryText = the bad outcome.

// 1 · Hook: ORDER BY amount, 20M rows, room for 200K
export function OrderByHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.2));
  return (
    <Svg label="Ordering twenty million rows with room for only two hundred thousand at once" h={240}>
      <g opacity={a}>
        <T x={300} y={80} s={13} a="middle" f={C.crema}>order by amount, twenty million rows</T>
        <T x={300} y={108} s={12} a="middle" f={C.latte}>room for two hundred thousand at a time</T>
      </g>
      <T x={300} y={160} s={13} a="middle" f={C.caramel} o={b}>how many runs, how many merge passes?</T>
    </Svg>
  );
}

// 2 · Run generation
export function RunGeneration({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Rows fill the budget, sort in place, and are written out as one run" h={240}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>rows fill the budget, sorted in place</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.caramel} o={b}>written out whole, as one sorted run</T>
    </Svg>
  );
}

// 3 · Four departures from Knuth
export function FourDepartures({ t }: StepCtx) {
  const steps = ['balanced merge, not polyphase', 'quicksort generation, not replacement selection', 'preread a fair share per tape', 'merge on the fly, no extra write'];
  const shown = Math.min(steps.length, Math.floor(seg(t, 0.2, 3.0) * steps.length) + 1);
  return (
    <Svg label="Four real departures from the textbook algorithm, each with its own reason" h={260}>
      <T x={300} y={55} s={12} a="middle" f={C.latte}>what production changed, and why</T>
      {steps.slice(0, shown).map((s, i) => (
        <T key={s} x={300} y={95 + i * 32} s={12} a="middle" f={i === shown - 1 ? C.caramel : C.crema}>{s}</T>
      ))}
    </Svg>
  );
}

// 4 · Predict: merge order
export function PredictMergeOrder({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="With far fewer tapes open at once, does the merge-pass count change" h={230}>
      <g opacity={a}>
        <T x={300} y={90} s={13} a="middle" f={C.crema}>only a few tapes open at once this time</T>
      </g>
      <T x={300} y={150} s={13} a="middle" f={C.caramel}>does the number of passes change?</T>
    </Svg>
  );
}

// 5 · Passes measured
export function PassesMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 2.2));
  return (
    <Svg label="A hundred runs; one pass wide open, three passes at a realistic width" h={250}>
      <T x={300} y={55} s={12} a="middle" f={C.latte}>a hundred runs, two merge-order scenarios</T>
      <T x={200} y={120} s={13} a="middle" f={C.crema} o={a}>every run open: one pass</T>
      <T x={400} y={160} s={13} a="middle" f={C.caramel} o={a}>few tapes open: three passes</T>
    </Svg>
  );
}

// 6 · Sort-merge join spill
export function SortMergeJoinSpill({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A repeating key, not the sort, is where a sort-merge join's memory goes" h={240}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>matches for one key buffer in memory</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.cherryText} o={b}>past a threshold, that buffer spills</T>
    </Svg>
  );
}

// 7 · Shuffle read as external sort
export function ShuffleReadSort({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A shuffle read that needs key order is itself an external sort over fetched blocks" h={240}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>blocks fetched from every map task</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.caramel} o={b}>merged by an external sorter, key-ordered</T>
    </Svg>
  );
}

// 8 · Hash-partitioned spill
export function HashPartitionedSpill({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Overflow groups are hashed to tapes and written as-is, never sorted" h={240}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>a new group overflows the resident table</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.caramel} o={b}>hashed to a tape, written as-is, unsorted</T>
    </Svg>
  );
}

// 9 · Spark's sort-based fallback
export function SortBasedFallback({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Spark's hash table turns itself into a sort once memory runs out" h={240}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.cinnamon}>the map's entries are sorted by key</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.caramel} o={b}>then merged back as a sort-based aggregation</T>
    </Svg>
  );
}

// 10 · Spill comparison measured
export function SpillComparisonMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 2.2));
  return (
    <Svg label="Both designs spill the identical rows; only what happens next differs" h={250}>
      <T x={300} y={55} s={12} a="middle" f={C.latte}>same overflow rows, two designs</T>
      <Bar x={160} y={95} w={280} h={26} full={1} fill={C.taupe} o={a} />
      <Bar x={160} y={95} w={280 * 0.43} h={26} full={1} fill={C.crema} o={a} />
      <T x={300} y={150} s={13} a="middle" f={C.caramel}>the same forty-three percent, in both designs</T>
    </Svg>
  );
}

// 11 · Merge kernel recap
export function MergeKernelRecap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Every path here ends in the same merge kernel: pick the next-smallest element" h={230}>
      <g opacity={a}>
        <T x={300} y={90} s={13} a="middle" f={C.crema}>several sorted runs, one output</T>
      </g>
      <T x={300} y={150} s={13} a="middle" f={C.caramel} o={b}>a heap or a tree of losers picks what's next</T>
    </Svg>
  );
}

// 12 · Recap and handoff
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="The same merge kernel, next inside compaction, shuffle reads and top-N" h={230}>
      <g opacity={a}>
        <T x={300} y={90} s={13} a="middle" f={C.crema}>spilled runs, merged by the same kernel</T>
      </g>
      <T x={300} y={150} s={13} a="middle" f={C.caramel} o={b}>next: that kernel inside compaction and top-N</T>
    </Svg>
  );
}
