# Fact-check — ClickHouse MergeTree internals (topic 35, §6.4)

| # | Claim | Verified? |
|---|---|---|
| 1 | Insert operations create table parts which are merged by a background process | Yes, quoted verbatim (SOURCES.md, MergeTree docs) |
| 2 | The primary key references blocks of 8192-row granules, not individual rows | Yes, quoted verbatim |
| 3 | ClickHouse merges data parts in the background for more efficient storage | Yes, quoted verbatim |
| 4 | A granule is the smallest indivisible data set ClickHouse reads when selecting data | Yes, quoted verbatim |
| 5 | A sparse index can read extra rows beyond the exact match (up to index_granularity * 2) | Yes, quoted verbatim |
| 6 | Sparse indexes fit in RAM even for very large tables | Yes, quoted verbatim |
| 7 | Two separate INSERTs create two separate, immutable parts | Yes, executed via chdb: `system.parts` shows 2 active parts after two INSERTs |
| 8 | `OPTIMIZE TABLE ... FINAL` runs a real merge, collapsing parts without changing row count | Yes, executed: 2 parts -> 1 part, row count unchanged (100,000) |
| 9 | A real `EXPLAIN indexes=1` trace shows the sparse primary index pruning granules | Yes, executed: an hour-wide range over 200,000 rows reads 1 of 24 granules |
| 10 | A minmax data-skipping index exists and is lightweight, requiring no parameters | Yes, quoted verbatim |
| 11 | A minmax skip index prunes granules on a non-sorted column, shown via EXPLAIN | Yes, executed: 4 of 37 granules read on a `status_code` filter, via a real minmax index |
| 12 | Skip indexes are only applied to newly inserted data, not retroactively | Yes, quoted verbatim |
| 13 | A materialized view is implemented as an insert trigger: inserting into the source table converts and inserts into the view | Yes, quoted verbatim, and executed: inserting into the source table updates the AggregatingMergeTree target with no query against the source |
| 14 | A materialized view's aggregation only applies to the freshly inserted batch, not existing data | Yes, quoted verbatim |
| 15 | Changes to existing source-table data (update/delete/drop partition) don't change the materialized view | Yes, quoted verbatim |
| 16 | AggregatingMergeTree replaces rows with the same sorting key with one row holding combined aggregate-function states | Yes, quoted verbatim |
| 17 | AggregatingMergeTree is used for incremental data aggregation, including aggregated materialized views | Yes, quoted verbatim |
| 18 | ReplacingMergeTree deduplication happens only during a merge, at an unscheduled, unknown time | Yes, quoted verbatim |
| 19 | `OPTIMIZE` is a usable-but-not-recommended way to force a merge (heavyweight, reads/writes a lot of data) | Yes, quoted verbatim |
| 20 | Without `ver`, the most recently inserted row wins deduplication | Yes, quoted verbatim, and executed: two inserted versions, surviving value matches the later insert |
| 21 | ReplacingMergeTree keeps both versions visible until a real merge collapses them | Yes, executed: 2 rows visible before `OPTIMIZE`, 1 after, matching the later insert's value |
| 22 | A lightweight DELETE is contrasted with the heavyweight `ALTER TABLE ... DELETE` | Yes, quoted verbatim |
| 23 | Lightweight DELETE is a mutation that marks rows as deleted without immediately physically deleting them | Yes, quoted verbatim |
| 24 | Physical deletion of marked rows happens only during the next merge | Yes, quoted verbatim |
| 25 | A real lightweight DELETE drops the queryable row count immediately | Yes, executed: 1000 rows -> 900 rows immediately after `DELETE FROM ... WHERE id < 100` |
| 26 | chdb genuinely embeds ClickHouse (not a simulation) | Yes — `chdb.query("SELECT version()")` returns a real ClickHouse version string (26.9.2.1) |

## Red team

- No Docker daemon or standalone `clickhouse-server` process is used anywhere in this
  topic -- chdb embeds real ClickHouse directly in the Python process, disclosed in
  `examples.py`'s own docstring and SOURCES.md's Red team section.
- "Background" merges in this script are triggered explicitly via `OPTIMIZE TABLE ...
  FINAL`, not ClickHouse's own unscheduled background process -- ReplacingMergeTree's
  own docs (quoted) explicitly warn `OPTIMIZE` is a heavyweight substitute, not
  equivalent to the real background schedule. Disclosed directly rather than implied.
- The minmax skip-index example's own granule numbers (4/37) are this script's own real
  measurement from its own 300,000-row dataset, not copied from the docs' differently-sized
  worked example ("dropped all but two granules", 6102/6104) -- that quote sources only
  the general mechanism, not this topic's specific numbers.
- Text/inverted indexes, projections, and TTL-based part expiry are named in the
  syllabus clause but not independently demonstrated in `examples.py`; sourced in
  SOURCES.md's quotes (skip index types) but not run as separate executable demos, to
  keep the script scoped to the mechanisms most central to this topic's syllabus line.

## Scope boundary

This topic covers MergeTree's immutable parts and background merges, the sparse primary
index over 8,192-row granules, data-skipping indexes (demonstrated with minmax),
materialized views as insert triggers, ReplacingMergeTree and AggregatingMergeTree
semantics, and lightweight deletes -- all run for real via chdb's embedded ClickHouse, or
sourced word-for-word from ClickHouse's own current documentation where not independently
executed. It does not cover ClickHouse's replication, sharding, distributed query
execution, or the serving-context cross-references in §5.5/§9.3, which the syllabus line
itself marks as out of scope for this topic.
