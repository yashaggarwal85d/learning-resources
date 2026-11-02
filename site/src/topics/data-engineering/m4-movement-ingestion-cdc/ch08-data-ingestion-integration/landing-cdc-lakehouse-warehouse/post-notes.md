<section data-section="outcomes">

## Outcomes

Land a change stream in a table by append-then-MERGE and by streaming upsert, and say what each
costs in freshness, write and read amplification. Make the landing order-independent by choosing
the winner by source LSN. Describe BigQuery's and Snowpipe's native CDC paths and what each
requires. Pick a landing strategy for a given update rate and freshness SLO.

</section>

<section data-section="internals">

## Internals: measured directly, against a real Postgres change stream landed into a real DuckDB database

A real logical-decoding change stream (inserts, updates, deletes with their own true LSNs) is
produced against this sandbox's own PostgreSQL cluster exactly as topics 10-21 of this chapter
do directly. The landing itself runs on a real DuckDB database rather than an Iceberg or Paimon
table: Chapter 6's own table-format ids are introduced by a live topic that itself runs on
SQLite, not a real lakehouse table format, and this sandbox has no JVM and no `pyiceberg`
(confirmed directly before writing `examples.py`). A real DuckDB `MERGE INTO` statement, not a
simulation, lands the append-only raw log into a current-state table by picking, per key, the
row with the greatest LSN. A hand-built data-file/delete-marker table pair stands in for a
merge-on-read table's own file layout, measured directly to show a read-time merge sees the
correct current value immediately after each write, with the superseded row still physically
present until a real compaction step rewrites it away. The same real change stream, fed to a
fresh LSN-ordered MERGE in its true order and then in deliberately reversed order, lands on the
identical final table both times — and a naive arrival-order merge with no LSN comparison is
shown landing the wrong, older value when fed the reversed order, reproducing the Hook's own
failure directly. Twenty keys updated once each against the same twenty keys updated five times
each show compaction's own superseded-row count growing by exactly the same factor as the
update count, while the append-then-MERGE landing's own current-state table stays at twenty rows
regardless of rate. BigQuery's `_CHANGE_TYPE`-based CDC ingestion and Snowpipe Streaming's Named
Channels are named and quoted from their own documentation rather than reproduced, since neither
warehouse is reachable from this sandbox.

</section>

<section data-section="production">

## Production failures this topic warns about

**Merging by arrival order instead of by source LSN.** The Hook's own incident is the production
failure directly: a replayed batch and a live event for the same key arrive in the wrong order,
and an arrival-order merge keeps the older value as the final answer — measured directly here as
the one real divergence between the naive merge and the LSN-ordered one.

**Choosing streaming upserts for a high-update table without planning for compaction.**
Measured directly here: a merge-on-read table's own superseded-row count scales with update
rate, not with key count, so a table whose rows change often needs compaction to keep pace or
every read pays an ever-growing merge cost.

</section>

<section data-section="frontier">

## Frontier

Flink's or Spark's own streaming sink mechanics, commit frequency and small files, table
maintenance (compaction, expiry) as a scheduled job, the medallion layers, and SCD2 history
built from a CDC stream are each named only here, since they are Chapter 6, Chapter 3 or Chapter
9's own subject.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Transport is solved: a row and every change to it reach the analytical side, in order, once in
effect. The harder question is whether two systems' rows describe the same customer, and which
one is right. That is not a transport problem, and it starts with who owns the truth.

</section>
