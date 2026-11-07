import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, chapter 37): crema = the textbook structure as drawn earlier, and
// data in memory; latte = secondary labels (M, k, a count); taupe = data on disk (spilled), not
// yet read back; caramel = the thing to look at; cinnamon (rare) = the system's modification set
// against the textbook; cherry/cherryText = the bad outcome (budget exceeded, a false positive).

// 1 · Hook: a compaction's 20-file merge and a top-10-of-400M query, both a heap
export function MergeHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.2));
  return (
    <Svg label="Twenty sorted files merge into one output; four hundred million rows reduce to ten" h={240}>
      <g opacity={a}>
        <T x={300} y={75} s={13} a="middle" f={C.crema}>twenty files, four billion keys, one merged output</T>
        <T x={300} y={103} s={12} a="middle" f={C.latte}>never more than one key per file resident</T>
      </g>
      <g opacity={b}>
        <T x={300} y={155} s={13} a="middle" f={C.crema}>top ten of four hundred million orders</T>
      </g>
      <T x={300} y={195} s={12} a="middle" f={C.caramel} o={b}>how many rows actually replace something in the heap?</T>
    </Svg>
  );
}

// 2 · Chapter 6's picture recapped in one frame
export function Chapter6Recap({ t }: StepCtx) {
  const files = 6;
  const shown = Math.min(files, Math.floor(seg(t, 0.2, 1.8) * files) + 1);
  const a = easeOut(seg(t, 1.9, 2.6));
  return (
    <Svg label="File streams feed one heap of cursors; the winner pops and the heap re-sifts" h={250}>
      {Array.from({ length: files }).map((_, i) => (
        <T key={i} x={70 + i * 85} y={70} s={13} a="middle" f={i < shown ? C.crema : C.mocha}>▸</T>
      ))}
      <T x={300} y={110} s={12} a="middle" f={C.latte}>one heap of cursors, one per stream</T>
      <T x={300} y={165} s={13} a="middle" f={C.caramel} o={a}>pop the winner, advance, sift — once per output</T>
    </Svg>
  );
}

// 3 · Pebble's mergingIter: one heap, min-heap forward / max-heap reverse
export function PebbleHeap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.2));
  return (
    <Svg label="Pebble's mergingIter: one heap of child iterators, min-heap or max-heap by direction" h={250}>
      <g opacity={a}>
        <T x={300} y={75} s={13} a="middle" f={C.crema}>mergingIter: one heap of child iterators</T>
      </g>
      <T x={180} y={130} s={12} a="middle" f={C.cinnamon} o={b}>min-heap: Next</T>
      <T x={420} y={130} s={12} a="middle" f={C.cinnamon} o={b}>max-heap: Prev</T>
      <T x={300} y={185} s={11} a="middle" f={C.latte} o={b}>pop, advance, "fix" the heap property</T>
    </Svg>
  );
}

// 4 · RocksDB's comparator: ties broken by decreasing sequence number
export function RocksDBComparator({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.2));
  return (
    <Svg label="RocksDB breaks ties on the user key by decreasing sequence number" h={260}>
      <g opacity={a}>
        <T x={300} y={70} s={12} a="middle" f={C.latte}>same user key, three versions</T>
        <T x={180} y={115} s={13} a="middle" f={C.mocha}>seq 5</T>
        <T x={300} y={115} s={13} a="middle" f={C.mocha}>seq 12</T>
        <T x={420} y={115} s={13} a="middle" f={C.caramel}>seq 30</T>
      </g>
      <T x={300} y={165} s={13} a="middle" f={C.cinnamon} o={b}>decreasing sequence number orders ties</T>
      <T x={300} y={193} s={11} a="middle" f={C.latte} o={b}>the newest version surfaces first, no special case</T>
    </Svg>
  );
}

// 5 · A compaction's own input iterator, and dropping shadowed versions
export function CompactionDrop({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.2));
  const c = easeOut(seg(t, 2.3, 3.0));
  return (
    <Svg label="A compaction merges every input file, then drops versions a newer one has shadowed" h={260}>
      <g opacity={a}>
        <T x={300} y={65} s={12} a="middle" f={C.latte}>every input file, one level at a time</T>
        <T x={300} y={93} s={13} a="middle" f={C.crema}>MakeInputIterator: one merging iterator over all of them</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.caramel} o={b}>CompactionIterator walks the merge</T>
      <T x={300} y={168} s={12} a="middle" f={C.cherryText} o={c}>shadowed versions and tombstones: dropped</T>
    </Svg>
  );
}

// 6 · Predict: tree-of-losers shape for 12 streams
export function PredictTreeShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const leaves = 8, inner = 4;
  const shown = Math.min(leaves, Math.floor(seg(t, 1.2, 2.2) * leaves) + 1);
  return (
    <Svg label="Twelve streams: does the tree of losers come out perfectly balanced?" h={250}>
      <g opacity={a}>
        <T x={300} y={65} s={12} a="middle" f={C.latte}>twelve streams to merge</T>
      </g>
      <T x={300} y={105} s={11} a="middle" f={C.latte}>{inner} become inner nodes, {leaves} stay leaves</T>
      {Array.from({ length: leaves }).map((_, i) => (
        <T key={i} x={110 + i * 55} y={160} s={13} a="middle" f={i < shown ? C.crema : C.mocha}>●</T>
      ))}
      <T x={300} y={200} s={12} a="middle" f={C.caramel} o={shown >= leaves ? 1 : 0}>not every level is completely full</T>
    </Svg>
  );
}

// 7 · Spark's two heaps: empty-reader guard, and a reversed-comparator max-heap
export function SparkTwoHeaps({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="UnsafeSorterSpillMerger guards empty readers; ExternalSorter reverses its comparator" h={260}>
      <g opacity={a}>
        <T x={300} y={75} s={12} a="middle" f={C.crema}>UnsafeSorterSpillMerger: never enqueue an empty reader</T>
      </g>
      <g opacity={b}>
        <T x={300} y={130} s={12} a="middle" f={C.cinnamon}>ExternalSorter.mergeSort: comparator reversed</T>
        <T x={300} y={158} s={11} a="middle" f={C.latte}>dequeuing the "maximum" is dequeuing the minimum key</T>
      </g>
    </Svg>
  );
}

// 8 · Measured, reused from Chapter 6: heap vs loser tree comparisons per output
export function HeapVsLoserMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 2.2));
  return (
    <Svg label="At a fan-in of eight: a heap costs 4.35 comparisons per output, a loser tree 3.00" h={260}>
      <T x={300} y={55} s={12} a="middle" f={C.latte}>comparisons per output, fan-in eight (Chapter 6's lab)</T>
      <Bar x={160} y={90} w={280} h={22} full={280} fill={C.cocoa} o={a} />
      <Bar x={160} y={90} w={280 * (4.35 / 6)} h={22} full={280} fill={C.crema} o={a} />
      <T x={450} y={106} s={11} a="start" f={C.crema} o={a}>heap: 4.35</T>
      <Bar x={160} y={122} w={280} h={22} full={280} fill={C.cocoa} o={a} />
      <Bar x={160} y={122} w={280 * (3.0 / 6)} h={22} full={280} fill={C.cinnamon} o={a} />
      <T x={450} y={138} s={11} a="start" f={C.cinnamon} o={a}>loser tree: 3.00</T>
      <T x={300} y={180} s={12} a="middle" f={C.caramel}>1.45x more comparisons for the heap</T>
      <T x={300} y={205} s={11} a="middle" f={C.latte}>three of four engines read here still choose it</T>
    </Svg>
  );
}

// 9 · The bounded heap, upside down: worst kept row at the root
export function BoundedHeapRoot({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A bounded top-N heap keeps the worst kept row at the root, to discard cheaply" h={250}>
      <g opacity={a}>
        <T x={300} y={75} s={13} a="middle" f={C.crema}>root: the worst of the N rows kept so far</T>
      </g>
      <T x={300} y={125} s={12} a="middle" f={C.caramel} o={b}>switch: input over 2N, or workMem full with enough rows</T>
      <T x={300} y={155} s={11} a="middle" f={C.latte} o={b}>a row that can't beat the root: one comparison, discarded</T>
    </Svg>
  );
}

// 10 · Spark's bounded top-N for ORDER BY ... LIMIT: per-partition, then merged
export function SparkBoundedTopN({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A bounded top-K per partition, shuffled, then one more bounded top-K over the result" h={260}>
      <g opacity={a}>
        <T x={300} y={70} s={12} a="middle" f={C.crema}>each partition: its own bounded top-K</T>
      </g>
      <T x={300} y={115} s={13} a="middle" f={C.cinnamon} o={b}>shuffled to one partition</T>
      <T x={300} y={150} s={12} a="middle" f={C.caramel} o={b}>one more bounded top-K finishes it</T>
      <T x={300} y={178} s={11} a="middle" f={C.latte} o={b}>takeOrdered: the opposite of top</T>
    </Svg>
  );
}

// 11 · The arithmetic and the surprising number
export function ReplacementArithmetic({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.1));
  const c = easeOut(seg(t, 2.2, 3.1));
  return (
    <Svg label="n log N beats n log n; about 175 of 400 million rows replace something" h={270}>
      <g opacity={a}>
        <T x={300} y={65} s={12} a="middle" f={C.latte}>full sort: n log n — bounded heap: n log N</T>
      </g>
      <T x={300} y={110} s={13} a="middle" f={C.crema} o={b}>k · (Hₙ − H_k), derived and checked by simulation</T>
      <T x={300} y={160} s={15} a="middle" f={C.caramel} o={c}>n = 400,000,000, k = 10 → ≈ 175 replacements</T>
      <T x={300} y={188} s={11} a="middle" f={C.latte} o={c}>almost every row costs one comparison and is thrown away</T>
    </Svg>
  );
}

// 12 · Recap and handoff to topological sort
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A heap picks the next-ready element among streams; next, among tasks and dependencies" h={240}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>a heap picks the next-ready element among streams</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.caramel} o={b}>next: streams become tasks, order becomes dependency</T>
    </Svg>
  );
}
