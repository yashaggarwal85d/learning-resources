import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This topic is disclosed as sourced-only throughout: this sandbox has no BigQuery or GCP
// account, so nothing here is a real execution, the same pattern as the Snowflake topic earlier
// in this section. Every architectural claim is a word-for-word quote from Google's own current
// documentation and the Dremel retrospective paper (SOURCES.md).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Snowflake's immutability was one proprietary storage design, on infrastructure this
          sandbox could only read about. This topic turns to a second one, built on genuinely
          different infrastructure: the system behind the Dremel paper's own nested-columnar
          model.
        </>
      ),
      duration: 4.8,
      fig: "snowflake's immutability was one proprietary design. here's a second, on genuinely different infrastructure.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: did storage and compute split apart?',
      body: (
        <>
          Dremel once stored a table's data and ran the query against it, as one system. Is that
          still true today, or did those two jobs separate?
        </>
      ),
      duration: 4.8,
      fig: 'one engine once stored the data and ran the query. still true today, or did those jobs split?',
      predict: {
        options: [
          { label: 'Still one combined job' },
          { label: 'Storage and compute split apart', correct: true },
        ],
        explain: (
          <>
            Google's own account: compute is a separate multi-tenant Dremel cluster, storage is
            Colossus, and the two now talk over a dedicated network between them.
          </>
        ),
      },
      Visual: S.PredictStorageComputeSplit,
    },
    {
      title: 'Reveal: Capacitor on Colossus, Dremel on Borg',
      body: (
        <>
          Capacitor, a columnar storage format, holds the data on Colossus. A separate
          multi-tenant Dremel cluster, orchestrated by Borg, runs the query -- the two joined by
          the Jupiter network and an in-memory shuffle tier.
        </>
      ),
      duration: 4.8,
      fig: 'they split: capacitor storage on colossus, dremel compute on borg, joined by the jupiter network.',
      Visual: S.RevealCapacitorColossusBorg,
    },
    {
      title: 'Reveal: partitioning and clustering',
      body: (
        <>
          Partitioning narrows a scan to the segments a filter can match. Clustering sorts a
          table's rows into blocks a filter can skip outright -- a second layer of the same
          pruning idea.
        </>
      ),
      duration: 4.8,
      fig: 'partitioning narrows the scan to matching segments; clustering sorts rows into blocks a filter can skip.',
      takeaway: 'Partitioning skips whole segments and clustering skips whole blocks -- two layers of the same pruning idea, over disaggregated storage.',
      Visual: S.RevealPartitioningClustering,
    },
    {
      title: 'Reveal: materialized views',
      body: (
        <>
          A materialized view is precomputed once, then kept current automatically as its base
          table changes -- no person triggers the refresh by hand.
        </>
      ),
      duration: 4.8,
      fig: 'a materialized view stays current on its own, in the background, as the base table changes.',
      Visual: S.RevealMaterializedViews,
    },
    {
      title: 'Predict: can a query skip running at all?',
      body: (
        <>
          Pruning and a precomputed view both speed up a query that still has to run against the
          engine. Is there anything that skips running a repeated query entirely?
        </>
      ),
      duration: 4.8,
      fig: 'pruning and precomputed views both speed up a query that still has to run. can one skip running it at all?',
      predict: {
        options: [
          { label: 'No, every query still runs' },
          { label: 'Yes, a caching service can', correct: true },
        ],
        explain: (
          <>
            Google's own docs: an in-memory analysis service accelerates queries by caching the
            data a project uses most frequently -- sitting in front of the engine itself.
          </>
        ),
      },
      Visual: S.PredictRepeatedQuery,
    },
    {
      title: 'Reveal: BI Engine',
      body: (
        <>
          An in-memory caching service sits in front of the query engine, accelerating the exact
          queries a project runs most often, without that project changing anything.
        </>
      ),
      duration: 4.8,
      fig: 'an in-memory caching service sits in front of the engine, speeding up the exact queries run most often.',
      takeaway: 'A caching layer in front of the engine skips re-running a project’s most frequent queries, with nothing in it changed.',
      Visual: S.RevealBiEngine,
    },
    {
      title: 'Reveal: batch load jobs vs a streaming write path',
      body: (
        <>
          Loading splits two ways: a single batch job that fills a table once from cloud storage,
          or a streaming write path that keeps writing new rows into it continuously.
        </>
      ),
      duration: 4.8,
      fig: 'loading splits two ways: one batch job that fills a table once, or a stream that keeps writing rows.',
      Visual: S.RevealLoadPaths,
    },
    {
      title: 'Reveal: exactly-once streaming replaces legacy streaming',
      body: (
        <>
          The modern streaming path guarantees exactly-once delivery using stream offsets. It
          replaces an older, legacy streaming method that only promised best-effort delivery.
        </>
      ),
      duration: 4.8,
      fig: 'the modern streaming path guarantees exactly-once delivery with stream offsets, replacing an older best-effort method.',
      takeaway: "The modern streaming path's stream offsets buy exactly-once delivery; the legacy method it replaced only promised best effort.",
      Visual: S.RevealExactlyOnceStreaming,
    },
    {
      title: 'Recap',
      body: (
        <>
          Storage and compute split apart, then joined back together over a network -- pruning,
          caching and both load paths all read from that same disaggregated design.
        </>
      ),
      duration: 4.8,
      fig: 'storage and compute split apart, joined over a network -- pruning, caching and two load paths all follow. next: redshift.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
