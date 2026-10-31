## Spark SQL Reference — EXPLAIN (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/sql-ref-syntax-qry-explain.html
Version: 4.3.0 (current "latest" docs at fetch time; the four plan stages are unchanged since 4.0)

> Generates parsed logical plan, analyzed logical plan, optimized logical plan and physical plan.

> Parsed Logical plan is a unresolved plan that extracted from the query.

> Analyzed logical plans transforms which translates unresolvedAttribute and unresolvedRelation into fully typed objects.

> The optimized logical plan transforms through a set of optimization rules, resulting in the physical plan.

> Generates two sections: a physical plan outline and node details.

Contents (item by item):
1. `EXPLAIN EXTENDED` names the four-stage pipeline this topic's `examples.py` measures directly: parsed, analyzed, optimized, physical.
2. The parsed plan is unresolved — the exact fact this topic's own measurement confirms via Catalyst's leading-tick marker on every not-yet-resolved node.
3. Analysis is specifically catalog resolution of attributes and relations — the step that turns an unresolved reference into a fully typed, resolved one.
4. Optimization is rule application over the analyzed plan, producing the plan physical planning then consumes.
5. `EXPLAIN FORMATTED`'s own two-section output (plan outline, then per-node detail) is the format CHAPTER.md's own outcome names reading from directly.

## Spark SQL Performance Tuning docs — spark.sql.autoBroadcastJoinThreshold (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/sql-performance-tuning.html
Version: 4.3.0 (current "latest" docs at fetch time; unchanged since 4.0)

> Configures the maximum size in bytes for a table that will be broadcast to all worker nodes when performing a join. By setting this value to -1, broadcasting can be disabled.

Default value (from the same table row): `10485760` (10 MB).

Contents (item by item):
1. Join strategy selection is cost-based on a concrete, named threshold: a side's estimated size against this single config.
2. Setting the threshold to -1 disables broadcast eligibility entirely — the exact lever this topic's `examples.py` uses to force the same join shape into a SortMergeJoin instead.

## Spark SQL Reference — ANALYZE TABLE (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/sql-ref-syntax-aux-analyze-table.html
Version: 4.3.0 (current "latest" docs at fetch time; unchanged since 4.0)

> The ANALYZE TABLE statement collects statistics about one specific table or all the tables in one specified database, that are to be used by the query optimizer to find a better query execution plan. These statistics are stored in the catalog.

Contents (item by item):
1. Cost-based plan reordering is explicitly gated on statistics existing in the catalog, collected only by running `ANALYZE TABLE` — not a default, always-on behaviour.
2. Named and quoted directly; not independently measured in `examples.py` (disclosed in FACT-CHECK.md — demonstrating an actual join-order change from CBO statistics needs a multi-way join and a stable row-count estimate this topic's small, synthetic `range()`-based data doesn't reliably produce).
