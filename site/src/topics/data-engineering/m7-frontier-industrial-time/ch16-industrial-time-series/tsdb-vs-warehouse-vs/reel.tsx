import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real four-access-path decision matrix (last value, range scan,
// cross-series aggregation, join to business data), measured directly on
// DuckDB/Parquet against a synthetic week of the plant's own series count,
// a capacity-and-cost chain priced at a dated unit cost, and a simulation of
// the tier-boundary failure modes (examples.py). Vendor-specific shortcuts
// (Prometheus's own limitation, ClickHouse's granules, QuestDB's tiers,
// InfluxDB 3's caches) are named and quoted, never asserted as this topic's
// own measured result.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a vendor demo does everything; the plant’s own traffic doesn’t',
      body: (
        <>
          A vendor demo shows one engine handling every query a plant could
          ask. The plant's own workload splits into very different access
          paths, and no single demo query shape covers all of them.
        </>
      ),
      duration: 5.6,
      fig: "a vendor demo shows one engine handling every query a plant could ask, but the plant's own workload splits into access paths no single demo query shape covers",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the decision matrix, measured on the same data',
      body: (
        <>
          A last-value lookup, a range scan, a cross-series aggregation, and
          a join to business data, all measured against the same synthetic
          week of the plant's own series count.
        </>
      ),
      duration: 5.8,
      fig: "a last-value lookup, a range scan, a cross-series aggregation, and a join to business data, all measured against the same synthetic week of the plant's own series count",
      Visual: S.RevealMatrix,
    },
    {
      title: 'Reveal: Prometheus-style wins the metrics row, and where it stops',
      body: (
        <>
          Prometheus-style engines are built for exactly this write rate and
          query shape. Their own documentation names the limitation: not
          clustered, not replicated, not durable against a node outage.
        </>
      ),
      duration: 5.8,
      fig: "Prometheus-style engines are built for this write rate and query shape, but their own documentation names the limitation: not clustered, not replicated, not durable against a node outage",
      Visual: S.RevealPrometheusRow,
    },
    {
      title: 'Predict: does the join get cheaper or pricier as history grows?',
      body: (
        <>
          A join to business data runs against one week of history today.
          As the plant keeps that history for years instead of weeks, does
          the join get cheaper, or more expensive, to run?
        </>
      ),
      duration: 4.8,
      fig: "a join to business data runs against one week of history today — as the plant keeps years of history instead of weeks, does the join get cheaper, or more expensive, to run?",
      predict: {
        options: [
          {
            label: 'More expensive on any engine, the longer the history',
          },
          {
            label: 'It depends which engine is doing it, not just how much history',
            correct: true,
          },
        ],
        explain: (
          <>
            It depends on the engine. An engine built for one access path at
            a bounded retention doesn't get a cheaper join by growing its
            history — it gets pushed outside the shape it was designed for.
          </>
        ),
      },
      Visual: S.PredictJoinCost,
    },
    {
      title: 'Reveal: three high-rate engines, each with its own shortcut',
      body: (
        <>
          ClickHouse's sparse primary key, QuestDB's three-tier storage, and
          InfluxDB 3's in-memory cache are three different names for the
          same bet: make the common lookup cheap.
        </>
      ),
      duration: 5.8,
      fig: "ClickHouse's sparse primary key, QuestDB's three-tier storage, and InfluxDB 3's in-memory cache are three different names for the same bet: make the common lookup cheap",
      Visual: S.RevealHighRateEngines,
    },
    {
      title: 'Reveal: the join is the lakehouse’s own case to make',
      body: (
        <>
          Measured directly: the join to a synthetic work-order table runs
          successfully against the full history in DuckDB, the same engine
          a table format over object storage would use underneath.
        </>
      ),
      duration: 5.6,
      fig: "the join to a synthetic work-order table runs successfully against the full history in DuckDB, the same engine a table format over object storage would use underneath",
      takeaway: 'A time-series engine never built for joins was never going to win that row of the matrix.',
      Visual: S.RevealLakehouseJoin,
    },
    {
      title: 'Reveal: a capacity-and-cost chain, priced at a dated unit cost',
      body: (
        <>
          Series count times sampling rate times retention times bytes per
          point, priced at a documented $0.02 per gigabyte: a two-week hot
          tier and a three-year lakehouse tier land at two different numbers.
        </>
      ),
      duration: 5.8,
      fig: "series count times sampling rate times retention times bytes per point, priced at a documented $0.02 per gigabyte, gives a two-week hot tier and a three-year lakehouse tier two different numbers",
      takeaway: 'Pricing two retention windows identically per gigabyte and still getting two different totals is what makes a forecast.',
      Visual: S.RevealCapacityChain,
    },
    {
      title: 'Reveal: tiering duplicates points, and a late reading can miss a tier',
      body: (
        <>
          Exporting the hot tier to the lakehouse after a lag leaves a
          window where a point sits in both tiers at once. A reading that
          arrives after its day's export already ran reaches only the hot tier.
        </>
      ),
      duration: 5.8,
      fig: "exporting the hot tier to the lakehouse after a lag leaves a window where a point sits in both tiers at once, and a reading that arrives after its day's export already ran reaches only the hot tier",
      takeaway: "A tiering boundary doesn't fail loudly — it fails as a point that exists twice, or one that never leaves.",
      Visual: S.RevealTierBoundary,
    },
    {
      title: 'Recap',
      body: (
        <>
          A decision matrix measured on the same data, Prometheus-style
          engines owning the metrics row, three high-rate engines sharing
          one shortcut, the lakehouse owning the join, a cost chain, and a
          tiering boundary that duplicates or drops instead of failing loudly.
        </>
      ),
      duration: 5.8,
      fig: "a decision matrix measured on the same data, Prometheus-style engines owning the metrics row, three high-rate engines sharing one shortcut, the lakehouse owning the join, a cost chain, and a tiering boundary that duplicates or drops",
      takeaway: "There's no single best time-series engine — only a best engine for a named access path at a named retention.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Given only an access path and a retention window, not a vendor
          name, can the matrix alone say which tier a workload belongs on,
          without guessing at any engine's marketing claim?
        </>
      ),
      duration: 4.8,
      fig: "given only an access path and a retention window, not a vendor name, can the matrix alone say which tier a workload belongs on, without guessing at any engine's marketing claim?",
      predict: {
        options: [
          { label: "No — it still comes down to which vendor's claims to trust" },
          {
            label: 'Yes — the matrix’s own rows already pick the tier',
            correct: true,
          },
        ],
        explain: (
          <>
            Yes. The matrix's rows are keyed on access path and retention,
            not on a vendor name — naming those two things is enough to read
            off which tier the workload belongs on.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
