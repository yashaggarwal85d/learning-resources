import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against each named engine's own current documentation (Apache
// Spark, Apache Flink, Trino, DuckDB, Snowflake, Google BigQuery, Amazon Redshift -- both their
// Iceberg and Delta Lake support pages) and three vendors' own June 2024 press releases
// (Databricks acquiring Tabular, Databricks open-sourcing Unity Catalog, Snowflake unveiling
// Polaris Catalog) -- plus a real support matrix and decision framework, built and run in this
// sandbox, applied to this chapter's own `analytics.events` table. No query engine is actually
// run here; the matrix is sourced data and the decision framework over it is real, executed code.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Every mechanism this section needed now exists, real or precisely sourced. This topic
          closes it by asking the question all of it was really in service of: which format do
          you actually pick, built from a real current support matrix, not brand preference.
        </>
      ),
      duration: 4.8,
      fig: 'every mechanism this section needed now exists. this topic closes it: which format do you actually pick?',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which format do more engines write?',
      body: (
        <>
          Two table formats, seven named engines. More of them can write one format today than
          the other. Which one?
        </>
      ),
      duration: 4.8,
      fig: 'more engines can write one of these two formats today than the other. which one?',
      predict: {
        options: [
          { label: 'Delta' },
          { label: 'Iceberg', correct: true },
        ],
        explain: (
          <>
            Iceberg's writer support is broader across these seven engines, per each one's own
            current documentation.
          </>
        ),
      },
      Visual: S.PredictMoreWriters,
    },
    {
      title: "Reveal: a real matrix",
      body: (
        <>
          A real matrix, built from each named engine's own current documentation: most of them
          can write Iceberg; several can only read Delta, or write it in a narrower way.
        </>
      ),
      duration: 4.8,
      fig: "a real matrix, built from each engine's own current docs. most write iceberg; several only read delta.",
      Visual: S.RevealMatrix,
    },
    {
      title: 'Reveal: two cloud warehouses write Iceberg for real',
      body: (
        <>
          Snowflake and BigQuery both genuinely write Iceberg today, by their own docs -- not a
          read-only external table bolted on the side.
        </>
      ),
      duration: 4.8,
      fig: 'snowflake and bigquery both genuinely write iceberg today. not a read-only external table.',
      takeaway: "Snowflake and BigQuery both genuinely write Iceberg today -- cloud warehouses aren't limited to reading open formats.",
      Visual: S.RevealCloudWritesReal,
    },
    {
      title: 'Predict: does Delta survive this workload?',
      body: (
        <>
          This chapter's own `analytics.events` table needs Snowflake, BigQuery, and DuckDB to
          all write it, upsert-heavy. Does Delta survive that requirement in the real matrix?
        </>
      ),
      duration: 4.8,
      fig: "this chapter's own table needs snowflake, bigquery, and duckdb to all write it, upsert-heavy. does delta survive?",
      predict: {
        options: [
          { label: 'Yes, Delta still works' },
          { label: 'No, Delta gets ruled out', correct: true },
        ],
        explain: (
          <>
            Snowflake and BigQuery can't write Delta at all, and DuckDB's Delta write can't do
            upserts -- all three rule it out.
          </>
        ),
      },
      Visual: S.PredictWorkloadSurvives,
    },
    {
      title: 'Reveal: Delta blocked, for real',
      body: (
        <>
          No -- all three writer engines block Delta here, for real. The decision framework rules
          it out mechanically, by running the actual matrix against this actual workload.
        </>
      ),
      duration: 4.8,
      fig: 'no. all three writer engines block delta here, for real -- the framework rules it out mechanically.',
      takeaway: 'Delta is blocked by all three writer engines here -- ruled out mechanically, not by preference.',
      Visual: S.RevealDeltaBlocked,
    },
    {
      title: "Reveal: DuckDB's two write paths, opposite directions",
      body: (
        <>
          DuckDB writing Iceberg needs a catalog, then has no limit. DuckDB writing Delta needs no
          catalog, but stays append-only -- no updates, merges, or replaces.
        </>
      ),
      duration: 4.8,
      fig: "duckdb's two write paths run opposite directions: iceberg needs a catalog, delta needs none but stays append-only.",
      Visual: S.RevealDuckdbNuance,
    },
    {
      title: 'Reveal: three real announcements, one month',
      body: (
        <>
          Databricks agreeing to acquire Tabular, the company behind Iceberg. Databricks
          open-sourcing Unity Catalog. Snowflake unveiling Polaris Catalog. All three, the same
          month.
        </>
      ),
      duration: 4.8,
      fig: 'three real announcements, the same month: tabular, unity catalog, polaris -- all june.',
      Visual: S.RevealJuneTimeline,
    },
    {
      title: 'Reveal: the convergence, named precisely',
      body: (
        <>
          The market's convergence on Iceberg REST as the interop contract isn't a trend line --
          it's three named vendor decisions in one month, plus the real matrix this topic just
          built.
        </>
      ),
      duration: 4.8,
      fig: "the market's convergence on iceberg rest isn't a trend line -- it's three named decisions, one month, plus this matrix.",
      takeaway: "The market's convergence on Iceberg REST isn't a trend line -- it's three named vendor decisions in one month.",
      Visual: S.RevealConvergence,
    },
    {
      title: 'Recap',
      body: (
        <>
          A real matrix, a real decision framework, applied to this chapter's own table: Iceberg,
          over a REST catalog -- from evidence, not preference.
        </>
      ),
      duration: 4.8,
      fig: "a real matrix, a real framework, applied to this chapter's own table: iceberg, over a rest catalog. next: trino.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
