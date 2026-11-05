import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This chapter's first topic: the chapter reads eight textbook structures inside real production
// systems, one bridge reel per structure. This one is the hash table inside a hash join, read
// from PostgreSQL's executor and from Spark's optimizer and sketch code. Every number is
// computed in examples.py; every system claim is a word-for-word quote in SOURCES.md.

const reel: Reel = {
  steps: [
    {
      title: "A hash join's build side is twenty times the memory budget. A textbook hash table cannot hold it, yet the join finishes, counting every row it must write to a temporary file before it is read back. Predict: with the budget at one twentieth of the build side, how many batches does the join need, what fraction of order rows goes to temporary files, and how many bits per customer does a runtime filter spend?",
      body: <>The build side does not fit. The join still finishes. What changed?</>,
      duration: 5.5,
      fig: 'JoinHook',
      predict: {
        options: [
          { label: 'A handful of batches, a small fraction spilled, about one bit per customer' },
          { label: 'Dozens of batches, almost all order rows spilled, about eight bits per customer', correct: true },
          { label: 'One batch, no spilling at all, zero bits per customer' },
        ],
        explain: (
          <>
            At this budget the join needs 32 batches, about 92 percent of order rows are written
            to a temporary file before they are read back, and the runtime Bloom filter spends
            about 8.4 bits per customer, the engine's own default.
          </>
        ),
      },
      Visual: S.JoinHook,
    },
    {
      title: "The textbook contract, and the system's addition, side by side: chapter three's chained hash table on the left, exactly as drawn there, and the join's own table on the right, boxed by a fixed memory budget it was never designed to respect.",
      body: <>The same table, now boxed by a budget it was never built to respect.</>,
      duration: 5,
      fig: 'TwoColumnStrip',
      Visual: S.TwoColumnStrip,
    },
    {
      title: "One 32-bit hash value answers two unrelated questions. Its low bits, masked against the bucket count, give the bucket inside the current batch. The same value, rotated right by the bucket count's log base two and masked against the batch count, gives the batch. Bucket and batch come from non-overlapping views of one hash.",
      body: <>Low bits choose the bucket; a rotation and a different mask choose the batch.</>,
      duration: 5.5,
      fig: 'BucketBatchSplit',
      takeaway: "A row's bucket and its batch come from independent bit ranges of one hash value.",
      Visual: S.BucketBatchSplit,
    },
    {
      title: "The executor starts with one batch and doubles the count whenever a batch outgrows the memory budget. On the shop's instance, at a budget of one twentieth of the build side, doubling runs from one batch to thirty-two before every batch finally fits.",
      body: <>Doubling runs to thirty-two batches before every batch fits the budget.</>,
      duration: 5,
      fig: 'BatchGrowth',
      Visual: S.BatchGrowth,
    },
    {
      title: "Predict: one customer places so many orders that their rows fill most of a batch by themselves. When that batch is split in two by hashing further, does doubling the batch count again actually spread that customer's rows out, or do they all land in the same half again?",
      body: <>Does splitting a batch again actually spread one very frequent key out?</>,
      duration: 4.5,
      fig: 'PredictStopCondition',
      predict: {
        options: [
          { label: "Yes, hashing further always spreads a key's rows across both halves" },
          { label: "No, a single key's rows all hash the same way and stay together", correct: true },
        ],
        explain: (
          <>
            No. Every row with the same key has the same hash value, so splitting the batch sends
            all of that key's rows to the same half every time. Doubling again cannot separate
            what one hash value cannot distinguish.
          </>
        ),
      },
      Visual: S.PredictStopCondition,
    },
    {
      title: "PostgreSQL watches for exactly this case: a split that leaves a batch keeping all, or none, of its tuples. When that happens the executor disables further growth in the number of batches globally, not only for that one batch, because the same key would defeat every later split just as it defeated this one.",
      body: <>One batch that cannot split again stops all further batch growth.</>,
      duration: 5.5,
      fig: 'SplitStopsGrowing',
      takeaway: "Growth in the number of batches stops entirely once a split keeps all or none of a batch's tuples.",
      Visual: S.SplitStopsGrowing,
    },
    {
      title: "Measured on the shop's instance: about ninety-two percent of order rows must be written to a temporary file before they can be probed, because their customer hashes to a batch other than the one batch that stays resident in memory throughout the build.",
      body: <>Ninety-two percent of order rows wait in a temporary file.</>,
      duration: 5,
      fig: 'SpillMeasured',
      Visual: S.SpillMeasured,
    },
    {
      title: "A separate skew table, capped at two percent of the memory budget, gives the handful of busiest customers a dedicated, always-resident bucket that batching never touches. On the shop's instance that is four customers, and they already carry about a sixth of every order placed.",
      body: <>Four always-resident customers already carry a sixth of all orders.</>,
      duration: 5,
      fig: 'SkewTable',
      takeaway: "A small skew table keeps the busiest keys resident and off disk, independent of how many batches exist.",
      Visual: S.SkewTable,
    },
    {
      title: "PostgreSQL's probe-side table chains tuples of any size in buckets sized for one tuple each on average. Spark's table for a single long-integer key is a different family entirely: open addressing, with quadratic probing and triangular numbers choosing the next slot, compact and cache-friendly because the key is one fixed-size number.",
      body: <>A fixed-size key gets a different table family than a variable-size tuple.</>,
      duration: 5.5,
      fig: 'OpenAddressedProbeSide',
      Visual: S.OpenAddressedProbeSide,
    },
    {
      title: "Before the join reads a single order, a Bloom filter built from the customers side, the side with a selective predicate, travels to the orders side's scan and drops any order whose customer cannot possibly match. The rule's own names: the customers side is the creation side, the orders side is the application side.",
      body: <>A filter built on customers prunes orders before the join ever runs.</>,
      duration: 5.5,
      fig: 'BloomPushdown',
      Visual: S.BloomPushdown,
    },
    {
      title: "Spark's default filter spends 8,388,608 bits on 1,000,000 expected items: 8.4 bits per item. The same ratio, run through the engine's own formula, chooses six hash functions. A filter actually built at this ratio and probed with keys it never inserted measures a false-positive rate matching what the formula predicts for those six hash functions.",
      body: <>8.4 bits per item, six hash functions, a measured rate matching the formula.</>,
      duration: 6,
      fig: 'FilterArithmetic',
      takeaway: "A runtime filter's false-positive rate is set entirely by its bits-per-item ratio and its hash count.",
      Visual: S.FilterArithmetic,
    },
    {
      title: "Trino's dynamic filter starts as the exact set of distinct keys on the build side. Past a size threshold it switches to collecting only a minimum and a maximum value per column, a coarser filter than a fixed-size Bloom filter, trading precision for a bound on how much the filter itself can cost to build and ship.",
      body: <>Past a size threshold, an exact filter becomes only a minimum and a maximum.</>,
      duration: 5,
      fig: 'TrinoContrast',
      Visual: S.TrinoContrast,
    },
    {
      title: "A hash join out of memory answers with three structures at once: batching by hash to spill in pieces, a tiny resident table for the keys too hot to batch, and a filter that prunes the other side before the join ever runs. The next structure takes the other path out of memory: a sort, whose spill becomes runs on disk instead of batches.",
      body: <>Next: the other path out of memory is a sort, not a batch.</>,
      duration: 5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
