# Outline — de.data-quality-frameworks

## Syllabus clauses (7, each a literal substring of the syllabus line)

1. "where checks run (in-pipeline gates vs post-hoc scans) and what they cost at scale"
2. "dbt tests and unit tests"
3. "GX Core expectation suites (open source; Fivetran announced in May 2026 that it will become steward; GX Cloud went to FICO in 2026)"
4. "Soda 4 contracts-first engine"
5. "Deequ/PyDeequ metric-based checks"
6. "Databricks DQX"
7. "incremental metrics and sampling"

## Concept ledger

**Introduces:** `dq-gates-vs-posthoc-scans`, `dq-check-cost-incremental-metrics-sampling`,
`dq-framework-landscape`.

**Uses (confirmed live in `registry.ts`):** `dbt-tests-data-unit`, `dbt-models-ref-dag` (Chapter 3),
`data-contract-specification`, `open-data-contract-standard` (Chapter 3), `data-code-testing-layers`,
`runtime-schema-validation` (Chapter 4), `openlineage-facets` (topic 11 — a data-quality facet is
how this topic's checks attach a result to a dataset in the lineage graph).

**Declared, with the gap logged:** `hyperloglog-distinct-counting`, `probabilistic-membership-filters`
(Chapter 5 — checked directly: neither id exists anywhere in `registry.ts`, so the sampling-cost
analogy this topic draws from Chapter 5's sketches is named in prose, not claimed as a `uses`
dependency); `testing-pyramid-transformations`, `write-audit-publish-safe-deploys`,
`contract-enforcement-ci` (Chapter 11 §11.4 — checked directly: no `section: '11.4'` entry exists
anywhere in `registry.ts`, so §11.4 has not been built at all yet; this matches the same gap topic
11 logged for its own Chapter 11 §11.1/§11.4 dependencies).

## Storyboard (10 steps)

1. **Hook** — the shop adds twelve checks, the nightly pipeline's runtime doubles, and a bad
   partition still reaches the dashboard two weeks later because the one check that would have
   caught it ran after publication.
2. **Predict** (within the first four) — gate or post-hoc, for a not-null check, a freshness
   check and a distribution-drift check, and which one actually controls the added cost.
3. **Reveal: where a check runs, and what it costs** — a gate blocks before publish, cheap on
   data already in flight; a post-hoc scan runs after landing, can't block, and re-reads the table.
4. **Reveal: dbt's two kinds of test** — a data test queries built data for failing rows; a unit
   test checks a model's logic against fixed, mocked rows before anything is built. *Takeaway*,
   backed by a real `dbt build` run that fails one real data test on a planted null and passes a
   real unit test on mocked rows.
5. **Reveal: an expectation suite** — a named, declarative assertion, grouped with others, run
   against a batch of data; backed by a real Great Expectations Core suite catching the same null
   plus a range check dbt's four built-in generic tests don't cover.
6. **Reveal: the rest of the landscape, named** — Soda's contracts-first engine, Deequ's
   Spark-metric checks, Databricks DQX — each named and sourced from its own page, not run (no
   Spark, no live data platform connection in this environment). *Takeaway.*
7. **Reveal: incremental metrics** — compute a metric on each new partition and merge it with
   what's stored, instead of rescanning everything; backed by a real equality check against a full
   rescan.
8. **Reveal: sampling, and what it misses** — a cheap sample estimates a rate but can miss a
   single rare bad row entirely if it never lands in the sample; backed by a real sampled estimate
   on the shop's data that misses a known null completely. *Takeaway.*
9. **Recap.**
10. **Prove it** (second predict) — a gate check that scans every row of an ever-growing table
    before each publish: does its own cost per run stay flat, or grow, and why.

## Research note: what this topic runs for real

Per `CHAPTER.md`'s own lab table ("the frameworks' examples run on the shop's synthetic data (dbt
and GX and Deequ where available, Soda and DQX sourced from their documentation and disclosed)"):
this build machine has no Apache Spark (`import pyspark` fails, confirmed directly) and no live
data-platform connection, so Deequ/PyDeequ and Databricks DQX (both Spark-based) and Soda (whose
checks verify against a connected data source) are named and sourced from their own documentation,
never run. What *is* real: a genuine `dbt-core` 1.12.6 project with the `dbt-duckdb` 1.11.1 adapter
(both pip-installed, verified working), built with a seed table, one model, all four of dbt's
built-in generic data tests plus a unit test, run through the real `dbt build` command — and a
genuine Great Expectations Core 1.24.1 suite (also pip-installed, verified working, matching the
exact version `CHAPTER.md`'s own planning-time research cites) run against the same synthetic data
with `great_expectations`'s own `ExpectationSuite` and `Expectation` classes. Both tools are run as
subprocess/library calls against real synthetic data with two planted problems (a missing
`customer_id`, a negative `amount`), not simulated or hand-rolled to produce a desired answer.
