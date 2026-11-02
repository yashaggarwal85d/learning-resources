import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This chapter's capstone: one real measurement (a real DuckDB-over-Iceberg EXPLAIN ANALYZE
// bytes-scanned figure, against a real local Iceberg table examples.py builds itself), with two
// sourced warehouse rates applied to it, plus a five-dimension comparison matrix sourced word for
// word from each engine's own current documentation (SOURCES.md). No Snowflake, BigQuery, or
// Redshift account exists in this sandbox, and no real multi-node Trino or ClickHouse cluster
// runs here -- the same constraint as the warehouse topics earlier in this section, disclosed throughout.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Three proprietary engines have now been taught the same way as the open ones before
          them: on their own terms, from their own current documentation. One question was left
          open for all six.
        </>
      ),
      duration: 4.8,
      fig: 'three proprietary engines, now taught on their own terms. one question was left for all of them.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: measure it, or look up its price?',
      body: (
        <>
          A real local Iceberg table already sits in this sandbox. No warehouse account exists
          here to query against it. Which approach gives a number worth acting on today: running
          a real query, or reading a published price?
        </>
      ),
      duration: 4.8,
      fig: 'a real local iceberg table sits in this sandbox. a real query, or a published price -- which gives a usable number today?',
      predict: {
        options: [
          { label: 'Only the published price can be trusted' },
          { label: 'Both -- one real, one sourced, side by side', correct: true },
        ],
        explain: (
          <>
            This lab runs a real query against a real table for the one number this sandbox can
            measure, then prices that same number at each warehouse's own published rate for the
            numbers it cannot.
          </>
        ),
      },
      Visual: S.PredictMeasureOrLookup,
    },
    {
      title: 'Reveal: six engines, two sides',
      body: (
        <>
          Trino, ClickHouse and DuckDB were built and run directly earlier in this chapter.
          Snowflake, BigQuery and Redshift were taught entirely from their own documentation.
          Both sides now meet in one comparison.
        </>
      ),
      duration: 4.8,
      fig: 'three open engines this chapter built; three warehouses this chapter sourced. six engines, one comparison.',
      Visual: S.RevealSixEngines,
    },
    {
      title: 'Reveal: workload isolation and concurrency',
      body: (
        <>
          BigQuery shares roughly two thousand slots across a project's queries on demand.
          ClickHouse Cloud caps a single replica at one thousand concurrent queries and adds
          replicas past that. Both are solving the same problem from opposite directions.
        </>
      ),
      duration: 4.8,
      fig: 'open engines scale by adding nodes or replicas; warehouses scale concurrency with multi-cluster and slot pools.',
      takeaway: 'Open engines buy concurrency by adding nodes or replicas; warehouses buy it by pooling clusters or slots across tenants.',
      Visual: S.RevealIsolationConcurrency,
    },
    {
      title: 'Reveal: cost-based tuning',
      body: (
        <>
          Trino's optimizer picks join order and join strategy from connector statistics, but
          nothing in Trino touches how a table is physically laid out. A warehouse's automatic
          clustering or automatic table optimization reaches further, into the storage itself.
        </>
      ),
      duration: 4.8,
      fig: 'open engines optimize the query plan only; warehouses also tune storage layout automatically, no admin needed.',
      Visual: S.RevealCostTuning,
    },
    {
      title: "Predict: whose rate prices it higher?",
      body: (
        <>
          DuckDB is about to scan the real Iceberg table this script built, for real. The same
          byte count will then be priced at BigQuery's and at Redshift's own published rate.
          Which one comes out higher for that identical number?
        </>
      ),
      duration: 4.8,
      fig: "duckdb scans a real iceberg table for real. which warehouse's own published rate prices that same scan higher?",
      predict: {
        options: [
          { label: "Redshift Spectrum's rate" },
          { label: "BigQuery's on-demand rate", correct: true },
        ],
        explain: (
          <>
            BigQuery's published on-demand rate is six dollars twenty-five cents per tebibyte;
            Redshift Spectrum's is five dollars per terabyte -- a smaller unit at a lower price,
            so BigQuery's estimate comes out larger for the same bytes scanned.
          </>
        ),
      },
      Visual: S.PredictBigQueryVsRedshift,
    },
    {
      title: 'Reveal: the real scan, two sourced rates',
      body: (
        <>
          DuckDB's own EXPLAIN ANALYZE reports a real number of bytes read from the real table.
          That number, priced at $6.25 per TiB and at $5 per TB, becomes two sourced cost
          estimates built on one executed measurement -- not a rerun of either vendor's billing.
        </>
      ),
      duration: 4.8,
      fig: "one real duckdb scan, two sourced warehouse rates applied to it. snowflake bills compute time, not bytes, so no third figure.",
      takeaway: 'A real bytes-scanned number plus a published rate is a sourced estimate -- grounded in a measurement, not a guess.',
      Visual: S.RevealRealMeasurement,
    },
    {
      title: 'Reveal: data gravity, egress and governance',
      body: (
        <>
          An open engine queries files wherever they already sit, with no catalog that locks it
          in. A warehouse adds a real egress cost the moment its compute and its external storage
          sit in different regions, in exchange for governance built into the same account.
        </>
      ),
      duration: 4.8,
      fig: 'open engines query data where it sits, no catalog lock-in; warehouses add egress across regions and their own governance.',
      Visual: S.RevealGravityGovernance,
    },
    {
      title: 'Reveal: when each one wins',
      body: (
        <>
          A managed warehouse earns its price when pooled concurrency and built-in governance are
          worth paying for by the byte or by the hour. An open lakehouse engine wins when the
          workload just needs compute that's already being paid for, against data already owned.
        </>
      ),
      duration: 4.8,
      fig: 'a warehouse wins when its governance and pooled concurrency are worth paying for; a lakehouse engine wins on compute you already own.',
      takeaway: 'The choice is not open versus proprietary -- it is whether this workload is paying for pooled concurrency and governance.',
      Visual: S.RevealSynthesis,
    },
    {
      title: 'Recap',
      body: (
        <>
          Six engines, five comparison dimensions, one real DuckDB-over-Iceberg measurement with
          two sourced warehouse rates applied on top of it. The chapter closes having taught every
          one of them on its own terms.
        </>
      ),
      duration: 4.8,
      fig: 'six engines, five dimensions, one real measurement and two sourced estimates on top of it. next: turning stored data into more stored data.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
