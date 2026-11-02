import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured directly (examples.py): a dbt-style data test flags a real bad row that a unit
// test on correct-looking transformation logic would never catch, and a planted logic bug is
// caught only by the unit test; an incremental metric merged partition by partition equals a
// full rescan exactly; and a small fixed-rate sample misses the one rare bad row a full scan
// always finds.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop adds a dozen data-quality checks to `orders`, and the nightly pipeline's
          runtime doubles. Two weeks later a bad partition still reaches the dashboard, because
          the one check that would have caught it ran after the data was already published.
          Where should each check have run, and how do you keep the cost from doubling again?
        </>
      ),
      duration: 5,
      fig: "a dozen checks, runtime doubles. a bad partition still ships anyway.",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: a gate runs inside the pipeline and can block publication; a post-hoc scan runs after landing and can only report',
      body: (
        <>
          A gate sits inside the pipeline, checking data still in flight, and can stop
          publication outright. A post-hoc scan runs on a schedule after the data has already
          landed -- it can be heavier and find drift, but it cannot stop what already shipped.
        </>
      ),
      duration: 5,
      fig: 'gate: in the pipeline, can block. post-hoc: after landing, reports only.',
      Visual: S.RevealGateVsPosthoc,
    },
    {
      title: "Predict: a not-null check, a freshness check, and a distribution-drift check -- which belongs in the gate, and which runs post-hoc?",
      body: (
        <>
          Place each of three checks -- a column that must never be null, a table that must
          arrive on time, and a column whose distribution must not suddenly shift -- into the
          gate or the post-hoc scan.
        </>
      ),
      duration: 2.8,
      fig: 'not-null, freshness, distribution drift: gate, or post-hoc?',
      predict: {
        options: [
          { label: 'All three are cheap enough to gate -- run every check before publishing' },
          { label: 'Only not-null gates; freshness and drift need a clock or history the gate lacks', correct: true },
        ],
        explain: (
          <>
            Only not-null gates cleanly. Freshness needs a clock outside the run itself to know
            whether data is late, and distribution drift needs a stored historical baseline to
            compare against -- both are naturally post-hoc, scheduled checks.
          </>
        ),
      },
      Visual: S.PredictGateChecks,
    },
    {
      title: 'Reveal: not-null gates because it is cheap and blocking-worthy; freshness and drift run post-hoc because each needs something the gate does not have',
      body: (
        <>
          Not-null is a cheap row-level check, so it gates. Freshness depends on an outside
          clock the pipeline run itself doesn't carry, and distribution drift depends on a
          stored baseline from history -- both run post-hoc instead.
        </>
      ),
      duration: 5,
      fig: 'not-null: gates. freshness, drift: post-hoc -- each needs a clock or history.',
      takeaway: 'A gate can only stop what it already knows at run time; a clock or a history belongs outside it.',
      Visual: S.RevealGateAnswer,
    },
    {
      title: "Elaborate: dbt's data tests check real built data; its unit tests check the transformation's own logic before any table is built",
      body: (
        <>
          A dbt data test is a select statement run against real, already-built data, looking
          for rows that disprove an assertion -- unique, not-null, accepted values, or a
          relationship. A dbt unit test instead runs the transformation's own logic against
          small, mocked inputs, before the model is ever materialized.
        </>
      ),
      duration: 5,
      fig: 'data test: checks real built rows. unit test: checks the logic, on mocked rows.',
      Visual: S.RevealDataVsUnitTest,
    },
    {
      title: 'Elaborate: the framework landscape -- GX Core, Soda 4, Deequ and Databricks DQX each check quality a different way',
      body: (
        <>
          GX Core is an open-source library of declarative expectation suites. Soda 4 leads
          with data contracts written as YAML, verified from the CLI. Deequ's VerificationSuite
          translates checks into Spark jobs that compute metrics, then evaluates assertions on
          those metrics. Databricks DQX defines checks directly in PySpark pipelines, for both
          batch and streaming.
        </>
      ),
      duration: 5,
      fig: 'GX Core: expectations. Soda 4: YAML contracts. Deequ: metrics. DQX: PySpark.',
      Visual: S.ElaborateFrameworkLandscape,
    },
    {
      title: "Elaborate: in May 2026 FICO acquired GX Cloud, and Fivetran became the new steward of the Great Expectations open-source community and the GX Core project",
      body: (
        <>
          Great Expectations's own announcement states it directly: FICO and GX completed a
          definitive agreement for FICO to acquire GX Cloud and fold it into the FICO
          platform. Separately, Fivetran became the new steward of the open-source community
          and the GX Core project, which continues as an open-source, community-driven effort.
        </>
      ),
      duration: 5,
      fig: 'GX Cloud: acquired by FICO. GX Core: open source, stewarded by Fivetran.',
      Visual: S.ElaborateGxStewardship,
    },
    {
      title: 'Predict: a full rescan, a per-partition incremental metric, and a small sample -- rank them by cost, and name what each can miss',
      body: (
        <>
          Checking everything means scanning everything. Rank a full rescan, an incremental
          metric updated per partition, and a small fixed-rate sample by cost -- and say what,
          if anything, each one can fail to catch.
        </>
      ),
      duration: 2.8,
      fig: 'full rescan, incremental metric, a small sample: cost, and what each can miss?',
      predict: {
        options: [
          { label: 'All three cost the same and catch the same things, since they check the same column' },
          { label: 'The rescan costs most and misses nothing; the sample costs least and can miss a rare row', correct: true },
        ],
        explain: (
          <>
            The full rescan costs the most because it reads every row again, but misses
            nothing. The incremental metric, merged partition by partition, matches the
            rescan's answer at a fraction of the cost. The sample costs least of all, but a
            single rare bad row can simply never land in it.
          </>
        ),
      },
      Visual: S.PredictCostLever,
    },
    {
      title: 'Reveal: measured directly -- a metric merged partition by partition equals the metric a full rescan of every partition produces',
      body: (
        <>
          Measured directly: merging each new partition's count into a running total, instead
          of rescanning every partition from the start, lands on the exact same number a full
          rescan computes. The incremental path isn't an approximation -- it's the same answer,
          computed cheaper.
        </>
      ),
      duration: 5,
      fig: 'incremental, merged per partition: equals the full rescan, measured, exactly.',
      Visual: S.RevealIncrementalEqualsFull,
    },
    {
      title: "Reveal: measured directly -- a small fixed-rate sample missed the one bad row a full scan always finds",
      body: (
        <>
          Measured directly: with one bad row planted among the rest, a full scan of every row
          finds it every time, but a small, evenly-spaced sample of the same data missed that
          exact row entirely, simply because it fell between the sampled positions.
        </>
      ),
      duration: 5,
      fig: 'one bad row, planted. full scan: always finds it. the sample: missed it.',
      takeaway: 'A sample trades completeness for cost -- and the row it trades away is never one you got to choose.',
      Visual: S.RevealSampleMisses,
    },
    {
      title: 'Recap',
      body: (
        <>
          Where a check runs decides whether it can stop bad data before anyone reads it, or
          only report on it afterward. How a check is computed decides what it costs --
          incrementally or on a sample, both trading some completeness for a lower price.
        </>
      ),
      duration: 5,
      fig: 'where: can it block? how it is computed: what does it cost, what can it miss?',
      takeaway: 'A check earns its place by where it runs and what it is willing to miss for a lower cost.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
