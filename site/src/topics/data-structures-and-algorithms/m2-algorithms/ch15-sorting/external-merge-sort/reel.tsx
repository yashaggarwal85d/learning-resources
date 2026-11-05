import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// External merge sort. A full topic: run generation by the simple block-sort method and by
// replacement selection (the "snowplow"), the multi-way merge built on Chapter 6's loser tree,
// the merge-pass-count and block-transfer formula on the chapter's own running example and a
// small worked instance, a threshold table of memory against pass count, and the spill-path
// pointer to Data Engineering and LSM compaction. Every count is exact and asserted in
// examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A file ten times the size of memory cannot be loaded, so no sort earlier in this chapter applies as written. Sorting it still costs only a handful of passes: with sixteen runs and memory for thousands of buffers, one merge pass finishes it, and every byte is read twice and written twice in total.",
      body: <>A file too big for memory, sorted in one merge pass. How?</>,
      duration: 4.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Halve the memory and keep the file the same size. Do the number of merge passes double?',
      body: <>Halve the memory, same file. Do the merge passes double?</>,
      duration: 2.5,
      fig: 'PredictHalve',
      predict: {
        options: [
          { label: 'Yes, the pass count always doubles when memory halves' },
          { label: 'Usually not at all, until memory crosses a threshold', correct: true },
          { label: 'No, the pass count never depends on memory' },
          { label: 'It depends only on the block size, not the memory size' },
        ],
        explain: (
          <>
            The pass count is a logarithm in base roughly memory-over-block-size, not a
            straight line in memory, so it only moves when the run count crosses a power of
            that base — most of the time, halving memory changes nothing at all.
          </>
        ),
      },
      Visual: S.PredictHalve,
    },
    {
      title: "The simple way to turn an unsorted file into sorted runs: read as many items as fit in memory, sort them with any of this chapter's in-memory sorts, write the sorted block out as a run, repeat. Measured directly: one million keys at a memory limit of four thousand give exactly two hundred fifty runs.",
      body: <>Read a block, sort it, write it as a run. Repeat until the file is gone.</>,
      duration: 4.5,
      fig: 'SimpleRuns',
      Visual: S.SimpleRuns,
    },
    {
      title: "Replacement selection, Knuth's own snowplow technique: keep a heap's worth of items in memory, repeatedly output the smallest key not smaller than the last key already written to the current run, replace it with the next input item, and hold back anything too small for the current run until the next one. Measured directly on two hundred thousand random keys at a memory limit of one thousand: interior runs average almost exactly twice the memory limit.",
      body: <>A heap outputs the smallest key not smaller than the last one written. Runs grow past the memory limit.</>,
      duration: 5,
      fig: 'Snowplow',
      Visual: S.Snowplow,
    },
    {
      title: "The same heap adapts to order on the input it is given. Ten thousand already-sorted keys at a memory limit of one hundred give exactly one run: nothing is ever too small for the current run. Ten thousand reverse-sorted keys at the same limit give exactly one hundred runs of one hundred: every new key is always too small, so replacement selection does no better than the simple method.",
      body: <>Sorted input: one giant run. Reversed input: no better than the simple method.</>,
      duration: 4.5,
      fig: 'OrderedInput',
      takeaway: 'Replacement selection halves the runs on random input and never does worse than the simple method.',
      Visual: S.OrderedInput,
    },
    {
      title: "Pass one and onward merges up to k runs at a time, keeping the next key of each run in a tournament. Chapter 6's own loser tree gives ceiling of log base two of k comparisons per output item, used here, not rebuilt: a fan-in of up to sixteen thousand three hundred eighty-three costs only fourteen comparisons per item.",
      body: <>A loser tree picks the next output key from k runs in about log k comparisons, not k.</>,
      duration: 4.5,
      fig: 'LoserTreeMerge',
      Visual: S.LoserTreeMerge,
    },
    {
      title: "Fan-in is bounded by block buffers: one input buffer per run plus one for output, so k is at most memory over block size, minus one. A larger fan-in means smaller buffers and, on a disk, more seeks per item. DuckDB's own post states the contrast plainly: k-way merge is traditionally used for external sorting because it minimizes I/O, while cascade (two-way) merge is used for in-memory sorting because it is more efficient.",
      body: <>Fan-in is bought with buffers. In memory, DuckDB merges two at a time instead.</>,
      duration: 4.5,
      fig: 'FanInLimit',
      Visual: S.FanInLimit,
    },
    {
      title: "On the chapter's own running example, N over M gives sixteen runs, and a fan-in up to sixteen thousand three hundred eighty-three merges them all in one pass. Measured directly: one million forty-eight thousand five hundred seventy-six block transfers in all, run generation and the one merge pass together, against two hundred sixty-two thousand one hundred forty-four for a single scan — four times a scan.",
      body: <>Sixteen runs, one merge pass: one million forty-eight thousand five hundred seventy-six block transfers, four times a single scan.</>,
      duration: 5,
      fig: 'RunningExample',
      takeaway: "The total I/O cost is a small constant times a scan: the number of merge passes, usually tiny.",
      Visual: S.RunningExample,
    },
    {
      title: "A small instance, worked in full: sixteen runs, three different fan-ins. A fan-in of two needs four merge passes; a fan-in of four needs two; a fan-in of sixteen finishes in one. The formula and the worked numbers agree exactly, every time.",
      body: <>Sixteen runs: fan-in two takes four passes, four takes two, sixteen takes one.</>,
      duration: 4,
      fig: 'SmallInstance',
      Visual: S.SmallInstance,
    },
    {
      title: 'Holding the file size and the block size fixed, memory is halved again and again, six times over. Does the merge-pass count move every time, some of the time, or only once?',
      body: <>Halve memory six times over, file and block size fixed. How often does the pass count change?</>,
      duration: 3,
      fig: 'PredictTable',
      predict: {
        options: [
          { label: 'It changes every single time memory halves' },
          { label: 'It never changes no matter how far memory shrinks' },
          { label: 'It stays the same for most steps, then jumps once a threshold is crossed', correct: true },
          { label: 'It changes only on the very first halving' },
        ],
        explain: (
          <>
            The run count and the fan-in both shrink as memory shrinks, but the pass count is
            their logarithm — it only climbs when the run count actually crosses the fan-in's
            own threshold, which most single halvings do not reach.
          </>
        ),
      },
      Visual: S.PredictTable,
    },
    {
      title: "The table, computed: across six steps of halving memory, the merge-pass count stays at one for five of them, then jumps to two only on the last step, once the fan-in finally drops below the run count. The pass count is a logarithm, not a line — memory can shrink a long way before the number of passes actually changes.",
      body: <>Five steps with no change, then one jump: the pass count is a logarithm, not a line.</>,
      duration: 4.5,
      fig: 'ThresholdTable',
      Visual: S.ThresholdTable,
    },
    {
      title: "This same mechanism runs inside real systems for real reasons, each named, not reimplemented here: a query engine's sort operator, a sort-merge join, and a spilling aggregation all generate runs and merge them exactly this way. DuckDB's own buffer manager spills by unloading blocks to disk and swizzling pointers to the heap blocks during the merge. Spark's shuffle merges and LSM compaction run the identical k-way merge; the Data Engineering reel on this exact topic covers the engine-side detail by name.",
      body: <>A sort operator, a sort-merge join, a spilling aggregation, an LSM compaction: the same merge, every time.</>,
      duration: 5,
      fig: 'WhereItRuns',
      takeaway: "Run generation and pass count are the one mechanism behind a sort spill, a sort-merge join and LSM compaction alike.",
      Visual: S.WhereItRuns,
    },
    {
      title: "A file ten times the size of memory is sorted at the cost of a handful of passes over the disk, and the price is worth paying because of what a sorted sequence makes cheap: finding one key in a million takes about twenty steps if the keys are in order, and a million if they are not. Binary search invariants and boundaries, next.",
      body: <>A sorted file makes one search cheap. Binary search, next.</>,
      duration: 4,
      fig: 'Handoff',
      Visual: S.Handoff,
    },
  ],
};

export default reel;
