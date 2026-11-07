import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This chapter's second topic: the other path out of memory from the prior topic's hash batching.
// This one spills sorted runs to disk and merges them back, inside sorts, sort-merge joins and
// aggregations. Every number is computed in examples.py; every system claim is a word-for-word
// quote in SOURCES.md.

const reel: Reel = {
  steps: [
    {
      title: "Order twenty million rows by amount, with room for only two hundred thousand at once. The textbook answer: sort runs, merge them. Predict: how many sorted runs does this make, and how many merge passes does it take if the engine can hold every run's read buffer open at once?",
      body: <>Twenty million rows, room for two hundred thousand. How many runs, how many passes?</>,
      duration: 5.5,
      fig: 'OrderByHook',
      predict: {
        options: [
          { label: 'A handful of runs, and several merge passes no matter what' },
          { label: 'A hundred runs, and a single pass if every run stays open at once', correct: true },
          { label: 'Two hundred thousand runs, and one pass regardless' },
        ],
        explain: (
          <>
            A hundred sorted runs come out of the budget alone. With every run's buffer held
            open at once, the balanced merge needs only a single pass over the data.
          </>
        ),
      },
      Visual: S.OrderByHook,
    },
    {
      title: "Run generation absorbs rows into an array until the budget is hit, sorts the array in place with an ordinary comparison sort, and writes it out as one run. On a small instance this produces exactly as many runs as the row count divided by the budget predicts, each one verified sorted.",
      body: <>Each run is just an ordinary in-memory sort, written out whole.</>,
      duration: 5,
      fig: 'RunGeneration',
      Visual: S.RunGeneration,
    },
    {
      title: "PostgreSQL's own header comment names four departures from the textbook algorithm, each with its reason: a balanced merge replaced polyphase once tape drives stopped being scarce; quicksort replaced replacement selection for run generation; the merge prereads a fair share of the budget from each tape at once, to stay sequential; and the final merge, when nothing after it needs random access, is done on the fly.",
      body: <>Four real departures from the textbook algorithm, each with its own reason.</>,
      duration: 6,
      fig: 'FourDepartures',
      takeaway: "A balanced merge replaced polyphase once a tape's real cost was a few kilobytes of buffer, not a physical drive.",
      Visual: S.FourDepartures,
    },
    {
      title: "Predict: at this hook's scale, if the engine instead holds open only a small, realistic number of tapes at a time rather than every run at once, does the number of merge passes change, and by how much?",
      body: <>With far fewer tapes open at once, how many merge passes does it take now?</>,
      duration: 4.5,
      fig: 'PredictMergeOrder',
      predict: {
        options: [
          { label: 'It stays at one pass regardless of how many tapes are open' },
          { label: 'It rises to several passes, because fewer tapes means repeated merging', correct: true },
        ],
        explain: (
          <>
            With only a handful of tapes open at once, the hundred runs cannot all merge in one
            step; it takes several passes, each one folding the run count down by the merge
            order, before one sorted sequence remains.
          </>
        ),
      },
      Visual: S.PredictMergeOrder,
    },
    {
      title: "Measured: a hundred runs at this budget, confirmed by the same run-count formula already validated on a small, fully simulated instance. One merge pass with every run's buffer open at once; three passes at a realistic, much smaller number of open tapes.",
      body: <>A hundred runs; one pass wide open, three passes at a realistic width.</>,
      duration: 5.5,
      fig: 'PassesMeasured',
      takeaway: "The same formula gives a hundred runs, and one or three merge passes depending on how many tapes stay open.",
      Visual: S.PassesMeasured,
    },
    {
      title: "A sort-merge join buffers every row on one side that shares the current key. Past a row-count threshold or a byte-size threshold that buffer spills to disk, and the operator reports its own spill size: a key repeating heavily on both sides, not the sort itself, is where a sort-merge join's memory actually goes.",
      body: <>A repeating key, not the sort, is where a sort-merge join's memory goes.</>,
      duration: 5.5,
      fig: 'SortMergeJoinSpill',
      Visual: S.SortMergeJoinSpill,
    },
    {
      title: "On the reduce side of a shuffle, when the data must arrive in key order, the reader builds an external sorter over the blocks it fetches from every map task. A shuffle read, seen this way, is itself an external sort: the identical spill-and-merge shape, over blocks instead of rows from one source.",
      body: <>A shuffle read that needs key order is itself an external sort over fetched blocks.</>,
      duration: 5,
      fig: 'ShuffleReadSort',
      Visual: S.ShuffleReadSort,
    },
    {
      title: "PostgreSQL's hash aggregation spills by partitioning: once the in-memory table is full, a row for a new group is hashed to one of between four and a thousand and twenty-four logical tapes and written as-is, exactly as a hash join batches its own overflow. Nothing is sorted; the partitioning alone is what keeps the spill correct.",
      body: <>Overflow groups are hashed to tapes and written as-is, never sorted.</>,
      duration: 6,
      fig: 'HashPartitionedSpill',
      Visual: S.HashPartitionedSpill,
    },
    {
      title: "Spark answers the identical problem a different way. Once its hash map cannot get more memory, it sorts the map's own entries by key, spills them, and from that point on behaves as a sort-based aggregation, merging the sorted spill back in with an external sorter: a hash structure that turns itself into a sort once memory runs out.",
      body: <>Spark's hash table turns itself into a sort once memory runs out.</>,
      duration: 6,
      fig: 'SortBasedFallback',
      takeaway: "A hash aggregation can spill by hash-partitioning the overflow or by turning into a sort; both see identical overflow rows.",
      Visual: S.SortBasedFallback,
    },
    {
      title: "Measured on the same skewed stream: both designs spill the identical rows, about forty-three percent of the stream, once the table's group budget is exceeded. What differs is only what happens to those rows afterward: hashed into unsorted partitions, or sorted once before the final merge.",
      body: <>Both designs spill the same forty-three percent. Only what happens next differs.</>,
      duration: 5,
      fig: 'SpillComparisonMeasured',
      Visual: S.SpillComparisonMeasured,
    },
    {
      title: "A sort's run generation and a hash aggregation's sort fallback both end in the identical operation: merge several sorted sequences by always taking the smallest available element next. Whichever structure picks that element, a heap or a tree of losers, is the same kernel this chapter meets again inside LSM compaction and a shuffle read's own merge.",
      body: <>Every path here ends in the same merge kernel: pick the next-smallest element.</>,
      duration: 5,
      fig: 'MergeKernelRecap',
      Visual: S.MergeKernelRecap,
    },
    {
      title: "A sort's spill path and a hash aggregation's sort fallback both end in a merge of sorted runs, one element at a time, with the next-smallest picked by a heap or a tree of losers. That merge is not confined to operators: it runs inside LSM compaction and shuffle reads, and a bounded copy of the same heap answers a query with a limit.",
      body: <>Next: the same merge kernel, inside compaction, shuffle reads and top-N.</>,
      duration: 5.5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
