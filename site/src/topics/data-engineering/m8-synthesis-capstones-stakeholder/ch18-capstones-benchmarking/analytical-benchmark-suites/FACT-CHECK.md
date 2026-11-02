# Fact-check — de.analytical-benchmark-suites

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | TPC-H's own specification: the TPC-H database is defined to consist of eight separate and individual Base Tables; TPC-H's own query clause describes twenty-two decision support queries. | TPC-H Standard Specification, Rev. 3.0.1 | Verified, quoted |
| 2 | TPC-DS's own specification: the TPC-DS schema is a snowflake schema with multiple dimension and fact tables; a TPC-DS query stream consists of the 99 queries defined in the specification. | TPC-DS Standard Specification, v3.2.0 | Verified, quoted |
| 3 | ClickBench's own README: the workload consists of 43 queries testing full scan, filtered scan, index lookups and the main relational operations; the dataset is a single flat table, different from the normalized star or snowflake model classical data warehouses use, which the README itself states may give classical warehouses an unfair disadvantage in this specific benchmark. | ClickBench README | Verified, quoted |
| 4 | Leis et al. (PVLDB 2015): the paper introduces the Join Order Benchmark, based on the IMDB data set, specifically because cardinality estimates are usually computed on simplifying assumptions like uniformity and independence. | Leis et al., "How Good Are Query Optimizers, Really?" | Verified, quoted |
| 5 | TPC's own current specifications page: TPC-DI is listed under TPC's own "Obsolete Workloads" table, alongside TPC-A, TPC-APP, TPC-B, TPC-D and TPC-R. | TPC Current Specifications listing | Verified, quoted |
| 6 | Wikipedia's "David DeWitt" article: several commercial database vendors include a licence provision, the DeWitt Clause, prohibiting publication of unsanctioned benchmark results; the clause originated from Oracle's response to a 1982 benchmark study by David DeWitt. | Wikipedia, "David DeWitt" | Verified, quoted |
| 7 | (This course) joining a large items table to a large transactions table in full, before a selective country/currency filter narrows them, is measurably slower than filtering the transactions table first and joining only the surviving rows. | This topic's own examples.py (measured) | Measured in this sandbox |
| 8 | (This course) the chapter's own three other committed scripts (topics one, two and three's examples.py) re-run clean end to end from this topic's own script, with no manual steps. | This topic's own examples.py (measured) | Measured in this sandbox |

## Currency check

- The TPC-H and TPC-DS quotes are read from each specification's own current published revision
  at research time (3.0.1 and 3.2.0 respectively); a ratified standard's own stated schema and
  query count is not something that changes between readings.
- The ClickBench quote is read from the project's own current `main` branch README at research
  time (2026-10-30); its own stated shape (one flat table, forty-three queries) and its own stated
  trade-off are long-standing, documented design properties.
- The Leis et al. paper is dated 2015 (PVLDB Vol. 9, No. 3); it is cited for its own stated
  purpose and motivation in introducing the benchmark, not a result that could go stale.
- TPC's own current specifications listing was fetched directly at research time (2026-10-30)
  rather than assumed from memory, confirming TPC-DI's current obsolete status as of that date.
- The Wikipedia quote describes a long-documented historical practice (the clause's own 1980s
  origin); it is cited as a reputable tertiary description of the mechanism and its name, not a
  claim about any vendor's current licence text.

## Red team

1. **Is citing a correlated-column schema and calling the resulting query "in the spirit of the
   Join Order Benchmark" an overclaim, given that JOB's own IMDB-based schema and queries are
   nowhere reproduced here?** No — CHAPTER.md's own "Leaves out" line and this topic's own lab
   description state plainly that examples.py reproduces only a *shape* (a join whose cost
   depends on filter-before-join ordering, over a small correlated schema), explicitly disclosed
   as a classroom-scale stand-in, never presented as JOB's own IMDB workload or claimed to match
   JOB's own measured results.
2. **Does using a MATERIALIZED CTE fence to force join order, rather than Postgres's own
   `join_collapse_limit` setting, change what the demonstration actually proves?** No — the
   mechanism under test is the same one a query optimizer's join-ordering decision controls
   (whether a selective filter is applied before or after an expensive join), and a materialized
   CTE fence is a standard, documented Postgres technique for controlling exactly that ordering
   directly and reliably; an earlier version of this topic's own examples.py tried
   `join_collapse_limit` directly over a schema with only tiny dimension tables and found no
   measurable difference, because Postgres pushes a filter down to a small base table regardless
   of join-reordering settings — the fence was adopted specifically because it isolates the cost
   difference this topic actually wants to show, documented in this file's Problem Solving
   section below.
3. **Could the hook's own benchmarketing scenario (a vendor's every published number true, a
   customer's own workload still slower) be read as a cited real incident?** It is explicitly a
   hook-framing scenario illustrating the mechanism named in claim 6 (a licence term and a
   vendor's own choice of which queries to publish), not a cited specific case; it does not
   appear in coverage.json's expert items or this fact-check's claims table as an independent
   sourced claim about any named vendor.
4. **Does naming TPC-DI as "the only TPC ETL specification" risk overclaiming, given this topic
   does not exhaustively enumerate every TPC specification?** The claim is drawn directly from
   CHAPTER.md's own planning, cross-checked here against TPC's own current specifications listing
   (claim 5), which shows no other TPC benchmark among its ETL-shaped offerings; TPC-DI's own
   specification is, by its own stated scope, aimed at data-integration/ETL workloads specifically,
   distinguishing it from every other listed TPC benchmark's query-execution focus.
5. **Does re-running the other three topics' own examples.py as "this topic's own published
   artifact" risk double-counting those topics' own claims as this topic's claims?** No — claim 8
   is scoped narrowly to the mechanical fact that the three scripts re-run clean together from one
   command, not to re-asserting any of those topics' own measured claims (hot keys, percentile
   behavior, warm-up detection), which remain each of those topics' own, separately fact-checked
   claims.

## Problem Solving

All six sources fetched and quoted cleanly on the first try, including the TPC-H and TPC-DS PDFs
(already fetched once for an earlier topic in this chapter, reused directly) and TPC's own current
specifications listing, confirming TPC-DI's "Obsolete Workloads" status directly rather than
trusting CHAPTER.md's own planning note. The join-order demonstration itself needed a real
redesign: the first implementation tried forcing a literal join order with Postgres's own
`join_collapse_limit` setting over a schema with three-row dimension tables, and found no
measurable latency difference between orders, because Postgres's planner pushes a selective
filter down to a small base table's scan regardless of `join_collapse_limit`, which only restricts
*join-tree reordering*, not predicate pushdown. The fix was to switch to a `MATERIALIZED` CTE
fence, a documented Postgres technique that explicitly prevents the planner from reordering past
the fence, over a schema where the fact table (jo_items) is five times the row count of the table
being filtered — this reliably reproduces the real cost difference between joining before
filtering and filtering before joining, confirmed stable (roughly a two-to-one latency ratio) over
two separate runs.
