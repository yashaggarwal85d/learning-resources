import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against a real local Apache Spark 4.0.1 (PySpark, local[4]) session (examples.py):
// a fact table (1,000,000 rows, 100 partitions by region_id) joined to a dimension table
// filtered to 3 of 100 regions on a non-key column (tier = 'gold', so the matching region_id
// values are only knowable by reading the dimension table's real rows, not foldable at plan
// time). With DPP on, the plan contains `dynamicpruningexpression` and reads 12 files / 3
// partitions; forced off, the identical query reads 400 files / 100 partitions, with the same
// correct answer either way. `EXPLAIN FORMATTED` shows a `Subqueries` section with its own
// `Scan parquet` of the dimension table, separate from the join's own `ReusedExchange` — the
// literal subquery duplicate. Writing the same fact table unpartitioned produces no
// `dynamicpruningexpression` anywhere, confirming the partitioned-fact-table precondition.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A million-row fact table, partitioned by region. A dimension table's filter only
          wants a handful of those regions. How much of the fact table does the join actually
          have to touch?
        </>
      ),
      duration: 4.5,
      fig: 'a fact table partitioned by region; a dimension filter wants just a few. How much gets read?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the baseline, DPP forced off',
      body: (
        <>
          Measured, with the optimization forced off: the join reads every one of the hundred
          partitions and every one of the four hundred files, no matter how selective the
          dimension side's filter is.
        </>
      ),
      duration: 4.8,
      fig: 'DPP forced off: all 400 files, all 100 partitions, filter or no filter.',
      Visual: S.RevealBaseline,
    },
    {
      title: "Predict: does partitioning by the join column guarantee pruning?",
      body: (
        <>
          The fact table is partitioned by exactly the column the join uses. That sounds like
          everything pruning would need. Is it enough, on its own?
        </>
      ),
      duration: 2.8,
      fig: 'partitioned by the exact join column. Enough on its own?',
      predict: {
        options: [
          { label: 'Yes — the partition column lining up with the join key is the whole requirement' },
          { label: "No — Spark also has to plan the join itself as a broadcast hash join", correct: true },
        ],
        explain: (
          <>
            Pruning needs somewhere to get its filter values from at runtime. That somewhere is
            the dimension side's own broadcast, which only exists if the join is planned that way.
          </>
        ),
      },
      Visual: S.PredictPartitionAlone,
    },
    {
      title: 'Reveal: no — the join has to be a broadcast hash join',
      body: (
        <>
          Measured: partitioning alone changes nothing. Pruning only activates once the plan
          actually chooses to broadcast the dimension side — the second condition, not an
          automatic consequence of the first.
        </>
      ),
      duration: 4.8,
      fig: 'partitioning alone: no pruning. A broadcast join has to be the chosen plan too.',
      Visual: S.RevealNeedsBroadcast,
    },
    {
      title: "Elaborate: the plan reuses the join's own broadcast",
      body: (
        <>
          Nothing about the dimension table gets scanned twice for the join's sake. It's
          broadcast once, and the pruning filter reuses that exact same broadcast result to
          decide which fact partitions to skip.
        </>
      ),
      duration: 4.8,
      fig: "the dimension table's own broadcast, reused directly as the pruning filter.",
      takeaway: "Dynamic partition pruning reuses the dimension side's own broadcast; it never scans that side twice for one join.",
      Visual: S.ElaborateReuse,
    },
    {
      title: "Predict: without a partitioned fact table, does pruning still help?",
      body: (
        <>
          Flip the other condition instead. The fact table was never partitioned by anything at
          all. Does the same selective filter still cut down what gets scanned?
        </>
      ),
      duration: 2.8,
      fig: 'fact table not partitioned at all. Does the filter still help?',
      predict: {
        options: [
          { label: "Yes — a selective enough filter helps regardless of how the table is stored" },
          { label: "No — there's no partition boundary for a pruning filter to act on", correct: true },
        ],
        explain: (
          <>
            Pruning works by skipping whole partitions. Without partitions to skip, the filter
            has nothing to apply to before the scan, no matter how selective it is.
          </>
        ),
      },
      Visual: S.PredictUnpartitioned,
    },
    {
      title: 'Reveal: no partitions, nothing to prune',
      body: (
        <>
          Measured: no dynamic pruning expression anywhere in the plan. The fact table gets
          scanned in full, exactly as if the dimension side's filter didn't exist.
        </>
      ),
      duration: 4.8,
      fig: 'unpartitioned fact table: no pruning expression in the plan at all.',
      Visual: S.RevealNoPartitionsToPrune,
    },
    {
      title: 'Elaborate: the Subqueries section names the duplicate filter',
      body: (
        <>
          Open the plan in its formatted view, and there's a whole section just for this: a
          Subqueries block, naming exactly which operator hosts the pruning expression, with its
          own copy of the dimension side's scan underneath it.
        </>
      ),
      duration: 5,
      fig: "EXPLAIN FORMATTED's own Subqueries section, naming the filter and its scan directly.",
      takeaway: 'The mechanism is visible in the plan: a Subqueries section naming the operator and the filter it reuses.',
      Visual: S.ElaborateSubqueryDuplicate,
    },
    {
      title: 'Reveal: both conditions together, confirmed side by side',
      body: (
        <>
          Measured, with both conditions actually met this time: twelve files instead of four
          hundred, three partitions instead of a hundred. The same correct total either way — just
          far less of the fact table ever gets touched.
        </>
      ),
      duration: 5,
      fig: 'both conditions met: files 400 to 12, partitions 100 to 3. Same answer.',
      Visual: S.RevealBothConditions,
    },
    {
      title: 'Recap',
      body: (
        <>
          Two conditions have to hold together: a fact table partitioned by the join column, and
          a join Spark actually plans as a broadcast. Meet both, and the plan's own Subqueries
          section is where to go check.
        </>
      ),
      duration: 5,
      fig: 'two conditions, one mechanism, one place in the plan to check it.',
      takeaway: 'Dynamic partition pruning needs a partitioned fact table and a broadcast join together — check the plan to confirm both.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
