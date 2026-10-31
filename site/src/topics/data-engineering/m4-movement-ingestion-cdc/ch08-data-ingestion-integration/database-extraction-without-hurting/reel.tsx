import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this sandbox's own
// PostgreSQL sixteen cluster, database learnshop, table orders: fifty thousand rows, two thousand
// with low ids and forty-eight thousand clustered into a high range. A sixteen-partition parallel
// range read over that key puts two thousand rows in the first partition, zero in each of fourteen
// more, and forty-eight thousand in the last. A sixty-four-partition read over the same key still
// puts over sixteen thousand rows in its single busiest partition. An exported repeatable-read
// snapshot, imported by a second connection, shows the same fifty thousand rows even after a
// concurrent insert commits in between; a later, unrelated connection sees the new row. A row-by-
// row select over all fifty thousand rows measured slower than a copy-to over the same rows, every
// trial. And ten thousand rows updated while a long extract's snapshot stays open leave ten
// thousand dead tuples that a real vacuum run cannot reclaim until that extract commits, after
// which the next vacuum run reclaims all of them.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A nightly extract is configured with sixteen partitions. Fifteen finish in minutes. One
          is still running at hour three, and the production disk is quietly filling with rows
          nobody asked it to keep.
        </>
      ),
      duration: 4.8,
      fig: 'sixteen lanes, fifteen finished. One still running at hour three, while dead tuples climb underneath.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which partition does the real work',
      body: (
        <>
          The key is skewed — most of the rows sit in one narrow, recent range. With sixteen
          equal-width partitions across the whole range, which one actually does the work?
        </>
      ),
      duration: 2.8,
      fig: 'the key is skewed. With sixteen equal-width partitions, which one does the real work?',
      predict: {
        options: [
          { label: 'Each partition gets roughly a fiftieth-of-fifty-thousand share — that is what numPartitions is for' },
          { label: 'Nearly all the clustered rows land in one partition, because the stride is a fixed width, not a fixed row count', correct: true },
        ],
        explain: (
          <>
            The bounds that define a partition only set the width of its slice over the key range
            — they never filter a row out. A key clustered into one narrow range sends almost all
            of its rows into whichever slice covers that range, no matter how many slices there
            are.
          </>
        ),
      },
      Visual: S.PredictStride,
    },
    {
      title: 'Reveal: the bounds set a stride, not a filter',
      body: (
        <>
          Sixteen equal-width slices are cut across the full id range. The real histogram of the
          table's own ids sits almost entirely under the very last slice.
        </>
      ),
      duration: 4.8,
      fig: 'sixteen equal-width slices over the id range, with the real histogram underneath.',
      Visual: S.RevealStrideNotFilter,
    },
    {
      title: 'Reveal: the measured skew',
      body: (
        <>
          Run for real: the first partition gets two thousand rows. Fourteen partitions in the
          middle get zero. The last partition gets forty-eight thousand.
        </>
      ),
      duration: 4.8,
      fig: 'the real sixteen-partition count: two thousand rows, fourteen partitions at zero, forty-eight thousand in one.',
      takeaway: 'The bounds decide the stride, not a filter — a clustered key sends nearly every row into one slice.',
      Visual: S.RevealMeasuredSkew,
    },
    {
      title: 'Reveal: a consistent snapshot across workers',
      body: (
        <>
          One connection exports its snapshot. A second connection imports the identical snapshot.
          A completely separate connection commits a new row in between — and neither worker sees
          it. Only a later connection, with no snapshot, does.
        </>
      ),
      duration: 4.8,
      fig: 'one exported snapshot, imported by a second worker, unmoved by a concurrent insert.',
      Visual: S.RevealSnapshot,
    },
    {
      title: 'Reveal: COPY against row-by-row SELECT, measured',
      body: (
        <>
          The same fifty thousand rows, read two ways. A row-by-row fetch measured slower than a
          bulk copy over the identical rows, in every trial run this session.
        </>
      ),
      duration: 4.8,
      fig: 'the same fifty thousand rows, two ways: row-by-row SELECT against COPY TO, best of several trials.',
      takeaway: 'COPY measured faster than row-by-row SELECT over the same rows, every trial — reach for it first.',
      Visual: S.RevealCopyVsSelect,
    },
    {
      title: 'Reveal: a replica moves the cost, it does not remove it',
      body: (
        <>
          Reading from a standby offloads the primary — until a long query there risks
          cancellation. The documented fix stops that cancellation by holding back cleanup on the
          primary instead.
        </>
      ),
      duration: 4.8,
      fig: 'hot_standby_feedback stops the standby’s own query from being cancelled — by holding back cleanup on the primary instead.',
      Visual: S.RevealReplicaCost,
    },
    {
      title: 'Reveal: the vacuum cost, measured directly',
      body: (
        <>
          A long extract's own snapshot is left open while ten thousand rows are updated
          elsewhere. A real cleanup run, while that snapshot is still open, reclaims none of them.
          Only once the extract commits does the next cleanup run bring the count back to zero.
        </>
      ),
      duration: 4.8,
      fig: "a long extract's open snapshot, measured directly: VACUUM reclaims nothing while it's open.",
      takeaway: "A long extract's open snapshot pins cleanup on its table, measured directly — nothing reclaims it until the extract ends.",
      Visual: S.RevealVacuumMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          The bounds set a stride, not a filter. One exported snapshot holds across workers. COPY
          measured ahead of row-by-row reads. And a long extract leaves a vacuum cost behind it,
          measured, not assumed.
        </>
      ),
      duration: 4.8,
      fig: 'stride not filter. One shared snapshot. COPY ahead. A vacuum cost, measured.',
      takeaway: 'Reading a production database safely means knowing exactly what each choice costs it, not that any is free.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          The same skewed key, now split into sixty-four partitions instead of sixteen. Does
          quadrupling the partition count fix the imbalance?
        </>
      ),
      duration: 2.8,
      fig: 'the same skewed key, now with sixty-four partitions instead of sixteen.',
      predict: {
        options: [
          { label: 'Yes — four times the partitions shrinks the slowest share proportionally' },
          { label: 'Barely — the clustered rows still land mostly in whichever few narrow slices cover that range', correct: true },
        ],
        explain: (
          <>
            Measured for real: with sixty-four partitions, the single busiest partition still
            holds over sixteen thousand of the forty-eight thousand clustered rows. The skew lives
            in the data's own distribution, not in how many pieces the range is cut into.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
