# Outline — ClickHouse MergeTree internals (topic 35, §6.4)

10 steps. Predicts at 2 and 5. Takeaways at 4, 6, 9.

1. **Hook.** Trino owns no storage of its own. This topic answers the opposite question:
   what if the engine owned the storage directly? ClickHouse's own MergeTree.
2. **Predict.** Two separate inserts land on a MergeTree table. Does ClickHouse rewrite
   one growing file, or create two separate files?
3. **Reveal.** Two separate, immutable parts -- real, via chdb. `OPTIMIZE TABLE` runs a
   real merge, collapsing them to one, without changing the row count.
4. **Reveal + takeaway.** The sparse primary index: an hour-wide range over 200,000 rows
   reads only 1 of 24 granules, for real, via a real `EXPLAIN indexes=1` trace.
5. **Predict.** A filter on a column that ISN'T the sort key -- does it scan every row,
   or can something still skip most of the data?
6. **Reveal + takeaway.** A real minmax data-skipping index prunes 33 of 37 granules on
   a non-sorted column, for real -- a second, independent skipping mechanism.
7. **Reveal.** A materialized view fires as a real insert trigger: inserting into the
   source table updates an AggregatingMergeTree target automatically, with no query.
8. **Reveal.** ReplacingMergeTree: two versions of the same row both remain visible until
   a real merge collapses them to the latest -- real, not eventual-in-theory.
9. **Reveal + takeaway.** A real lightweight `DELETE` drops the row count immediately,
   by marking rows, not by rewriting the table on the spot.
10. **Recap.** A real engine owning its own storage directly: immutable parts, two real
    skipping mechanisms, an insert-triggered view, real merge semantics. Handoff: the
    next engine runs with no server process at all -- DuckDB.
