import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every plan-text fact here is measured against a real local Apache Spark 4.0.1 (PySpark,
// local[4]) session (examples.py): a groupBy's own shuffle is tagged hashpartitioning; an
// orderBy's own shuffle is tagged rangepartitioning; two window steps partitioned by the same
// key, back to back, share one Exchange (count 1), while the same two steps on two different
// keys need two (count 2), confirming the sharing is a real decision, not an always-free pass;
// and a filter on a Hive-style partitioned column shows a real PartitionFilters entry in the
// scan node, while the identical filter against a flat layout shows an empty one. The
// HashPartitioning/RangePartitioning mechanisms and the DSv2 filter-pushdown interface are
// sourced and quoted from Spark's own code and docs.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Sizing decided how many pieces the work gets cut into. This topic decides something
          sharper: which row actually lands in which piece, and whether that choice can be reused.
        </>
      ),
      duration: 4.5,
      fig: 'a group-by, and a sort. Same partitioner underneath, or something different?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: two different partitioners, named in the plan',
      body: (
        <>
          Measured: a group-by's own shuffle is tagged one way in the plan. A sort's own shuffle,
          right next to it, is tagged in a completely different way.
        </>
      ),
      duration: 4.8,
      fig: "group-by's shuffle: hash partitioning. Sort's shuffle: range partitioning.",
      Visual: S.RevealTwoPartitioners,
    },
    {
      title: 'Predict: two steps, the same key',
      body: (
        <>
          Two separate steps run back to back, each one partitioned by the exact same key. Does
          the second step pay for its own shuffle too, or does something smarter happen here?
        </>
      ),
      duration: 2.8,
      fig: 'two steps, same key, back to back. Two shuffles, or one?',
      predict: {
        options: [
          { label: 'Two — each step asks for its own partitioning, so each one pays for it' },
          { label: 'One — the second step reuses the first one, since the requirement is already met', correct: true },
        ],
        explain: (
          <>
            Catalyst checks what a step actually needs before adding anything. If the data is
            already partitioned exactly the way the second step requires, there's nothing to redo.
          </>
        ),
      },
      Visual: S.PredictSameKeyWindows,
    },
    {
      title: 'Reveal: one shuffle, shared across both',
      body: (
        <>
          Measured: a single shuffle covers both steps completely. The second one's own
          requirement was already satisfied by the first, so nothing gets added on top of it.
        </>
      ),
      duration: 4.8,
      fig: 'two steps, one shared shuffle. The second step costs nothing extra.',
      takeaway: "A step whose required partitioning is already satisfied adds no shuffle of its own at all.",
      Visual: S.RevealSharedExchange,
    },
    {
      title: 'Predict: two steps, two different keys',
      body: (
        <>
          Same two steps, same shape, but now each one is partitioned by a genuinely different
          key. Does the same sharing still happen, or does something change here?
        </>
      ),
      duration: 2.8,
      fig: 'same two steps, different keys this time. Still shared, or not?',
      predict: {
        options: [
          { label: "Still shared — Catalyst reuses shuffles regardless of which key each step needs" },
          { label: "Not shared — two different keys genuinely need two separate, real shuffles", correct: true },
        ],
        explain: (
          <>
            Reuse only ever happens when a later step's requirement is already met. A different
            key is a genuinely different requirement, so there's nothing left to reuse here.
          </>
        ),
      },
      Visual: S.PredictDifferentKeyWindows,
    },
    {
      title: 'Reveal: two real shuffles this time',
      body: (
        <>
          Measured: this version carries two genuinely separate shuffles. The sharing seen a
          moment ago wasn't automatic — it only happens when the requirement is already met.
        </>
      ),
      duration: 4.8,
      fig: 'different keys: two separate shuffles. The sharing above was a real decision.',
      takeaway: 'Shuffle sharing only happens when a later step actually needs the same partitioning as an earlier one.',
      Visual: S.RevealTwoExchanges,
    },
    {
      title: 'Predict: filtering a Hive-style layout',
      body: (
        <>
          The data sits in directories, one per value of a column, the way a Hive-style table
          lays itself out. Filtering on that column: does it skip whole directories, or just rows?
        </>
      ),
      duration: 2.8,
      fig: 'one directory per value. Filtering: skip whole directories, or filter rows after?',
      predict: {
        options: [
          { label: 'Rows after reading — the engine still reads every directory, then filters' },
          { label: 'Whole directories — matching directories are the only ones touched at all', correct: true },
        ],
        explain: (
          <>
            The directory structure itself already encodes the value. There's no reason to open a
            directory the filter can already rule out before a single file inside it is read.
          </>
        ),
      },
      Visual: S.PredictDirectoryPruning,
    },
    {
      title: 'Reveal: named directly in the scan node',
      body: (
        <>
          Measured: the scan's own plan names the exact directory filter it applied. The
          identical filter against a flat layout has nothing to name — there's no structure to prune.
        </>
      ),
      duration: 4.8,
      fig: 'Hive-style layout: a real directory filter, named. Flat layout: nothing to name.',
      takeaway: 'Static partition pruning only exists where a directory layout gives the planner something to skip.',
      Visual: S.RevealPartitionFilters,
    },
    {
      title: 'Recap',
      body: (
        <>
          A group-by partitions by hash; a sort partitions by a global ordering. A later step
          reuses an earlier shuffle only when its own requirement is already met. And a Hive-style
          layout lets a filter skip whole directories before a single file inside them is read.
        </>
      ),
      duration: 4.8,
      fig: 'which partitioner, whether a shuffle is skipped, which directories are pruned.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
