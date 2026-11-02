<section data-section="outcomes">

## Outcomes

An engine choice rests on three honest drivers, not a reputation: whether the computation's own
state fits in memory, the latency floor the chosen data-flow shape already set, and whether the
team on call can actually operate and debug it — the last one counted as a real cost, the same
units as latency and compute. A serving store follows the shape of the question being asked
(point lookup, OLAP slice, full-text, similarity), never the shape of the raw data, and one
dataset commonly needs several such stores at once, each one clearly derived from a single
system of record. Pre-aggregation and on-query compute trade compute at write for compute at
read, decided by how often the query repeats and how fresh it must be. And every design is
compared honestly by its amplification ledger — the physical bytes actually moved, after
replication, rewriting and compaction — never by the logical volume it started from, which can
make the smallest-looking option the most expensive one once counted.

</section>

<section data-section="internals">

## Internals

None claimed independently here. Engine internals (plan execution in Chapter 2, the state
backends in Chapters 7 and 9) and serving-store internals (Chapter 5's caching and real-time
analytical layers, Chapter 6 §6.4's lakehouse engines, Chapter 9's real-time OLAP ingestion,
Chapter 17's vector and graph stores) are each named as a `uses` or `declared` concept, not
re-derived. This topic teaches only the *decision* those mechanics execute underneath.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` is the method's lab (topic 9 hosts the chapter's own assigned
lab). `real_time_olap_option()`, `clustering_key_option()` and `pre_aggregated_table_option()`
each compute a real amplification factor from the shop's own constants; `amplification_ledger()`
collects all three for a direct comparison. Try changing `AGGREGATE_LOGICAL_BYTES` smaller and
watch the pre-aggregated table's own amplification factor grow even further out of proportion to
its apparent size.

</section>

<section data-section="production">

## Production failures this topic warns about

**Reaching for a new, heavier store before measuring whether a cheaper fix already solves it.**
The shop's own hook is this failure exactly: a purpose-built real-time OLAP store is proposed
before anyone checks whether a two-line clustering key, costing far less to run and operate,
would have been enough. The fix isn't picking a different store by instinct — it's measuring the
amplification ledger for the cheap fix first.

**Judging a design by its logical data volume instead of its amplification factor.** The
pre-aggregated table looks tiny and cheap by its own logical size; counted honestly, through
replication and a full nightly rewrite, its physical cost dwarfs that apparent size. A design
that looks cheap on paper can be the most expensive one actually running.

</section>

<section data-section="frontier">

## Frontier

The single-node renaissance (DuckDB, Polars, and similar embedded, dependency-free engines) is
the one still-growing option here: as topic 2's own capacity estimates keep showing that many
real workloads fit comfortably on a single machine, teams increasingly justify skipping a
distributed engine entirely for jobs that, a decade ago, would have reflexively reached for one.
Everything else in this topic — the three-driver engine decision, question-shape-to-store
mapping, and amplification accounting — is settled, well-established practice.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A design chosen for the normal day works on the normal day. Real data arrives twice, arrives
late, and is sometimes replayed on purpose. The next topic is designing those paths first:
correctness under replay and late data.

</section>
