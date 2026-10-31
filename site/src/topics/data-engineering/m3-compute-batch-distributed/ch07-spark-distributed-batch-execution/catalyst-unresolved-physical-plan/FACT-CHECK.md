# Fact-check: de.catalyst-unresolved-physical-plan

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | EXPLAIN EXTENDED names four stages: parsed, analyzed, optimized, physical | Confirmed | `sources/explain-syntax.txt`, quoted verbatim in `SOURCES.md`; `scripts/sources.mjs check` passes. |
| 2 | The parsed logical plan is unresolved | Confirmed | Same source, quoted exactly. |
| 3 | Analysis translates unresolved attributes/relations into fully typed objects | Confirmed | Same source, quoted exactly. |
| 4 | A real parsed plan marks every unresolved node with a leading tick (`'`) | Confirmed | Measured directly: `examples.py`, `"'Filter" in parsed`. |
| 5 | A real analyzed plan has no tick marker and carries resolved attribute ids (`#N`) | Confirmed | Measured directly: `examples.py`, `"'Filter" not in analyzed` and `"#" in analyzed`. |
| 6 | Predicate pushdown moves a written filter below a select in the optimized plan | Confirmed | Measured directly: `examples.py`, index comparison on `analyzed`/`optimized` plan text. |
| 7 | Constant folding collapses a literal `1 + 2` into `3` at optimisation time | Confirmed | Measured directly: `examples.py`, `"(1 + 2)" in analyzed_fold`, `"3 AS" in optimized_fold`. |
| 8 | `spark.sql.autoBroadcastJoinThreshold` configures the max broadcastable size (10MB default); -1 disables it | Confirmed | `sources/sql-performance-tuning.txt`, quoted verbatim. |
| 9 | A join against a small-enough table plans as BroadcastHashJoin with no shuffle on the large side | Confirmed | Measured directly: `examples.py`, `"BroadcastHashJoin" in broadcast_plan`, `"SortMergeJoin" not in broadcast_plan`. |
| 10 | The same join shape, with broadcasting disabled, plans as SortMergeJoin with a shuffle Exchange on both sides | Confirmed | Measured directly: `examples.py`, `"SortMergeJoin" in shuffle_plan`, `shuffle_plan.count("Exchange hashpartitioning") == 2`. |
| 11 | EXPLAIN FORMATTED generates a physical plan outline plus per-node detail | Confirmed | `sources/explain-syntax.txt`, quoted verbatim. |
| 12 | ANALYZE TABLE collects statistics the optimizer uses for a better plan, stored in the catalog | Confirmed, not independently measured | `sources/analyze-table.txt`, quoted verbatim; disclosed as sourced-only (see red team). |

## Red team

- **Why wasn't cost-based join reordering (not just strategy selection) actually measured?**
  Attempted during drafting with a three-way join and `ANALYZE TABLE` run against temp views, but
  the row-count estimates for `range()`-derived DataFrames without a backing table in the catalog
  didn't reliably trigger a reordering decision different from the written join order in this
  sandboxed single-run environment — a genuinely flaky measurement, not a deterministic one.
  Dropped in favour of the clean, sourced claim (same choice topic 4's FACT-CHECK made for
  FIFO/FAIR interleaving), rather than shipping a test that might pass or fail depending on
  incidental planner heuristics.
- **Is picking `1 + 2` as the constant-folding example too trivial to be convincing?** It's
  deliberately the simplest possible case specifically so the measurement is unambiguous: the
  analyzed plan's expression text and the optimized plan's expression text differ in exactly one
  way (two literals and an operator vs. one literal), with no other variable in play.
- **Could AQE have silently changed which join strategy "actually" ran, undermining the
  broadcast/shuffle measurement?** No — `spark.sql.adaptive.enabled` is explicitly set to `false`
  for the whole session (see `examples.py`'s own comment), specifically because AQE can convert a
  planned SortMergeJoin into a broadcast join at runtime based on actual shuffle statistics; this
  topic measures Catalyst's own up-front plan, disclosed as a methodology choice, with AQE's
  runtime override named as this chapter's own later topic in `post-notes.md`'s Frontier section.
- **Is the EXPLAIN and ANALYZE TABLE documentation current for Spark 4.x?** Both fetched at docs
  version 4.3.0 (the "latest" alias at fetch time); the four-stage pipeline and the statistics
  requirement are unchanged since Spark 4.0, and the measured plan text (tick markers, resolved
  ids, `BroadcastHashJoin`/`SortMergeJoin` node names) matches the documented `EXPLAIN EXTENDED`
  example's own plan shapes exactly.

No corrections were needed to `OUTLINE.md` beyond the cost-based-reordering scoping decision made
during drafting itself (measure strategy selection; disclose reordering as sourced-only).
