import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A sized, worked scenario rather than a chapter lab leg (CHAPTER.md: "its examples are a sized,
// worked scenario rather than a chapter lab leg"). No executable lab file for this reason.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A dashboard that was fast all quarter suddenly queues for thirty seconds every Monday
          morning. Nothing about the dashboard's query itself changed.
        </>
      ),
      duration: 2.8,
      fig: 'same query. Same dashboard. A new queue, every Monday.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: two numbers outside the query, and which lever fixes it',
      body: (
        <>
          What two numbers, both outside the query itself, explain this, and which lever actually
          fixes a concurrency ceiling being hit, as opposed to a slow query?
        </>
      ),
      duration: 2.6,
      fig: 'the query was never the bottleneck.',
      predict: {
        options: [
          { label: 'The query has gotten slower over the quarter and needs to be optimized' },
          { label: "Monday's usage spike plus a fixed concurrency ceiling; only a bigger reservation or spreading the load fixes a ceiling problem", correct: true },
        ],
        explain: (
          <>
            A concurrency ceiling and a slow query are two different failure modes. When usage
            spikes past a fixed reservation size, queries queue no matter how fast each one runs
            on its own — optimizing the query's own speed does nothing for a ceiling that's
            already full.
          </>
        ),
      },
      Visual: S.PredictConcurrencyVsSpeed,
    },
    {
      title: 'Reveal: rollup tables and materialized views',
      body: (
        <>
          The oldest lever: compute the expensive aggregation once, on a schedule, and let every
          dashboard query the small result instead of the large source.
        </>
      ),
      duration: 4.0,
      fig: 'pay for the aggregation once. Every dashboard reads the cheap answer.',
      Visual: S.RevealRollupsAndMaterializedViews,
    },
    {
      title: 'Reveal: result caching',
      body: (
        <>
          Caching a query's exact result for reuse by an identical or near-identical later query —
          a cached result is only as fresh as its invalidation policy accounts for.
        </>
      ),
      duration: 4.0,
      fig: 'fast is easy. Fast and correct needs an invalidation policy.',
      takeaway: "Tying invalidation to the source's own freshness SLA, not a fixed timer, keeps fast from quietly becoming wrong.",
      Visual: S.RevealResultCaching,
    },
    {
      title: 'Reveal: BigQuery BI Engine',
      body: (
        <>
          A fast, in-memory analysis service that caches a reservation's preferred tables,
          accelerating a large fact table joined with up to four small dimension tables, and
          falling back to standard execution slots, without failing the query, for anything it
          can't accelerate.
        </>
      ),
      duration: 4.5,
      fig: 'what it caches, what it joins, and what it quietly hands off instead.',
      takeaway: "An unsupported query under BI Engine doesn't fail; it just runs unaccelerated, which is a different thing to diagnose.",
      Visual: S.RevealBigQueryBIEngine,
    },
    {
      title: "Reveal: Databricks SQL's disk cache",
      body: (
        <>
          The comparable warehouse-native layer: an automatic local-disk cache of remote reads
          that Databricks itself invalidates the moment an underlying data file changes.
        </>
      ),
      duration: 4.0,
      fig: 'cached automatically. Invalidated automatically. No manual step either way.',
      takeaway: "Automatic invalidation on file change is Databricks' own answer to the same correctness problem result caching raises generally.",
      Visual: S.RevealDatabricksSQL,
    },
    {
      title: 'Reveal: concurrency ceilings and queueing',
      body: (
        <>
          Every one of these engines has a concurrency limit — a reservation size, a capacity unit
          count — past which queries queue or fail, regardless of how fast any individual query
          runs.
        </>
      ),
      duration: 4.0,
      fig: 'a fixed number of lanes. Past them, everyone waits.',
      takeaway: 'A concurrency ceiling and a slow query produce the same symptom but need completely different fixes.',
      Visual: S.RevealConcurrencyCeilings,
    },
    {
      title: 'Recap',
      body: (
        <>
          Rollups, materialized views and result caching are the same lever at different
          granularities, chosen by how often the data changes versus how often the query repeats.
          BI Engine and Databricks SQL are two named engines with their own documented limits. A
          concurrency ceiling queues regardless of query speed.
        </>
      ),
      duration: 4.5,
      fig: 'three levers, two engines, one ceiling.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team doubles its dashboard refresh frequency, and queries start queueing even though
          each individual query runs exactly as fast as it did before.
        </>
      ),
      duration: 2.8,
      fig: 'no query got slower. Something else changed.',
      predict: {
        options: [
          { label: "The warehouse's underlying query engine has degraded and needs tuning" },
          { label: 'Nothing about query speed changed; more concurrent queries are now hitting the same reservation at once', correct: true },
        ],
        explain: (
          <>
            Doubling refresh frequency doubles how many queries arrive at the reservation
            concurrently, not how fast any one of them runs. That's a concurrency-ceiling problem,
            the same failure mode the hook opened with, now caused by a scheduling change instead
            of a usage spike.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
