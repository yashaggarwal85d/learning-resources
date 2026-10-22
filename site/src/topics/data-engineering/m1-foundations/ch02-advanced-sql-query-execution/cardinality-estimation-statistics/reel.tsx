import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: the chapter's `orders` table, measured for real at 2,000,000 rows (then +400,000 in one bulk
// load) with the chapter's real columns (status, amount, tags) plus `channel` (new, this topic's own addition).
// Every number below is in examples.py and SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'Two numbers that are supposed to agree',
      body: (
        <>
          <code>EXPLAIN</code> prints a row estimate before a query runs; <code>EXPLAIN ANALYZE</code> prints the real count once it has. Usually they roughly
          agree. Here, on the same table and the same planner machinery, one pair lands within 1% — and one pair is off by more than 2×.
        </>
      ),
      duration: 4,
      fig: 'estimated vs. actual, two plans',
      Visual: S.TwoNumbers,
    },
    {
      title: 'Predict: if these two were independent…',
      body: (
        <>
          <code>status=&apos;cancelled&apos;</code> matches about 16% of orders. <code>channel=&apos;app&apos;</code> matches about 37%. If the planner treats
          the two conditions as independent, what fraction does it predict for both at once?
        </>
      ),
      duration: 1.8,
      fig: '16% and 37%, multiplied',
      predict: {
        options: [
          { label: '~6%, the product', correct: true },
          { label: '~16%, the smaller one' },
          { label: '~37%, the larger one' },
          { label: '~53%, the sum' },
        ],
        explain: (
          <>
            ~6% (0.163 × 0.373). Multiplying is exactly what the planner's independence assumption does — the question is whether that assumption is true for
            these two columns.
          </>
        ),
      },
      Visual: S.PredictIndependence,
    },
    {
      title: 'Reveal: independence, measured',
      body: (
        <>
          The real combined estimate is 138,866 rows (≈5.8%) — almost exactly the product. The real actual count is 282,940 rows (≈11.8%) — more than double.
          The arithmetic wasn&apos;t wrong. The assumption was: these two columns are correlated.
        </>
      ),
      duration: 4.2,
      fig: 'the real estimate lands on the product',
      takeaway: 'Multiplying selectivities is the independence assumption, not a law — it is only as good as the columns are unrelated.',
      Visual: S.RevealIndependence,
    },
    {
      title: 'Where the two numbers come from',
      body: (
        <>
          <code>pg_class</code> keeps <code>reltuples</code>/<code>relpages</code>: a cheap total row count, rescaled to the table&apos;s current size without a
          scan. <code>pg_statistic</code> (read via <code>pg_stats</code>) keeps each column&apos;s shape — &quot;always approximate even when freshly
          updated.&quot;
        </>
      ),
      duration: 4.4,
      fig: 'pg_class vs pg_statistic',
      Visual: S.TwoCatalogs,
    },
    {
      title: 'A histogram: equal-frequency buckets',
      body: (
        <>
          <code>amount &gt; 1000</code> on 2,000,000 orders: 100 equal-frequency buckets, PostgreSQL finds the one 1000 falls in, and interpolates linearly
          inside it. Estimate: 994,519. Actual: 1,003,918 — about 1% off, the healthy case.
        </>
      ),
      duration: 4.6,
      fig: 'amount > 1000, bucket by bucket',
      takeaway: 'A histogram turns "how many rows match" into "how much of one bucket is covered."',
      Visual: S.Histogram,
    },
    {
      title: "A most-common-value list: read, don't guess",
      body: (
        <>
          <code>status</code> has six values; five sit near a sixth each, and <code>refunded</code> is thin at 1.66%. For a value on the most-common-value
          list, the selectivity is just its measured frequency — no bucket, no formula.
        </>
      ),
      duration: 4,
      fig: 'status, six bars, one thin one',
      Visual: S.MCVBars,
    },
    {
      title: 'Off the list: spread the rest evenly',
      body: (
        <>
          A value <i>not</i> on the MCV list gets <code>sel = (1 − Σmcv_freq) / (n_distinct − num_mcv)</code>: whatever frequency is left over, split evenly
          across every other distinct value. That even split is an assumption too — the uniformity assumption.
        </>
      ),
      duration: 4.6,
      fig: 'the remainder, divided evenly',
      takeaway: "Off the list means \"assume everyone else is equally likely\" — a guess standing in for a measurement.",
      Visual: S.OffMCV,
    },
    {
      title: 'CREATE STATISTICS: a real joint measurement',
      body: (
        <>
          <code>CREATE STATISTICS ... (dependencies, mcv) ON status, channel FROM orders</code>, then <code>ANALYZE</code>. The same query&apos;s estimate
          moves from 138,866 to 284,969 — within 0.7% of the real 282,940.
        </>
      ),
      duration: 4.6,
      fig: 'before and after, same query',
      takeaway: "Extended statistics don't make the independence assumption smarter — they replace it with a real measurement.",
      Visual: S.CreateStatistics,
    },
    {
      title: 'Predict: a bulk load lands with no ANALYZE yet',
      body: (
        <>
          400,000 new orders arrive in one batch, every one <code>status = &apos;pending&apos;</code>, and nobody runs <code>ANALYZE</code> yet. Does the
          planner&apos;s row estimate for <code>status=&apos;pending&apos;</code> notice the new rows at all?
        </>
      ),
      duration: 1.8,
      fig: '400,000 new rows, same statistics',
      predict: {
        options: [
          { label: 'Yes — both the count and the mix update' },
          { label: 'No — nothing updates until ANALYZE' },
          { label: "The count updates; the mix doesn't", correct: true },
        ],
        explain: (
          <>
            Split answer. PostgreSQL rescales <code>reltuples</code> to the table&apos;s current physical size automatically — but the MCV frequency for{' '}
            <code>pending</code> is still the pre-load proportion, because only <code>ANALYZE</code> re-measures the shape.
          </>
        ),
      },
      Visual: S.PredictStale,
    },
    {
      title: "Reveal: the count rescales, the shape doesn't",
      body: (
        <>
          Before <code>ANALYZE</code>: estimate 497,040, actual 793,095 — about 1.6× under. After one <code>ANALYZE</code>: estimate 796,240 — within 0.4% of
          actual.
        </>
      ),
      duration: 4,
      fig: '497,040 vs. 793,095, then corrected',
      takeaway: 'Row counts rescale on their own; the shape of the data only updates when ANALYZE looks again.',
      Visual: S.RevealStale,
    },
    {
      title: "Errors don't average out — they multiply",
      body: (
        <>
          A join&apos;s input cardinality is itself an estimate. Line up this topic&apos;s two measured misses — 2.0× from correlation, 1.6× from stale
          statistics — on the same plan, and they compound to roughly 3.3×, not back toward 1×.
        </>
      ),
      duration: 4.6,
      fig: 'two misses, one plan',
      takeaway: "An estimate that feeds another estimate doesn't average its error away — it multiplies it.",
      Visual: S.Compounding,
    },
    {
      title: 'The frontier: learn it instead of assuming it',
      body: (
        <>
          A model trained on the real data and real queries (Kipf et al.&apos;s &quot;MSCN,&quot; CIDR 2019) targets exactly the cases that just broke:
          correlated columns and join-crossing correlation. Out of scope here — continued in the Deep dive.
        </>
      ),
      duration: 3.6,
      fig: 'a trained model, not a formula',
      Visual: S.Frontier,
    },
    {
      title: 'Before you trust the first number',
      body: (
        <>
          Are the <code>WHERE</code> columns related? When did <code>ANALYZE</code> last run? Is this estimate itself feeding another join? The estimate is
          only useful once it&apos;s compared against the alternatives — which is what decides a plan&apos;s cost, next.
        </>
      ),
      duration: 4,
      fig: 'three questions',
      Visual: S.Recap,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>A value is in the MCV list with frequency 0.02. The table has 500,000 rows. How many rows does the planner estimate match it?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '100' }, { label: '1,000' }, { label: '10,000', correct: true }],
        explain: <>10,000 (500,000 × 0.02). An in-list equality predicate reads the MCV frequency directly and multiplies by the row count.</>,
      },
      Visual: S.ProveMCV,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>Two WHERE clauses on correlated columns are estimated independently, each matching about 20% of rows. What is the real risk?</>,
      duration: 1.2,
      predict: {
        options: [
          { label: 'The estimate (~4%) is too high' },
          { label: 'The estimate (~4%) is too low', correct: true },
          { label: 'No risk — independence always holds' },
        ],
        explain: (
          <>
            Too low. Correlated columns overlap more than independence predicts, so the multiplied estimate (~4%) typically undershoots the real, larger
            overlap — exactly this topic's measured 2× miss.
          </>
        ),
      },
      Visual: S.ProveCorrelation,
    },
  ],
};

export default reel;
