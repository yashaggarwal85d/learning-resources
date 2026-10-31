<section data-section="outcomes">

## Outcomes

Pre-aggregation, a materialized serving table and a cube are explained as three real techniques
for the same underlying move: doing aggregation work ahead of a read instead of during one.
A real, measured freshness-vs-concurrency-vs-cost trade-off is used to decide when plain
warehouse queries stop being enough and a real-time OLAP store earns its own cost, naming Druid,
Pinot and ClickHouse as real reference points without building their own engine internals.

</section>

<section data-section="internals">

## Internals

A materialized view shifts aggregation's own cost from query time to insert time: an incremental
materialized view keeps itself updated as writes happen, while a refreshable one instead re-runs
its query periodically over the full dataset, so its results are only as fresh as the last
refresh — both in ClickHouse's own words. A cube generalizes a single materialized table into
every combination of a fixed set of dimensions at once, trading more storage for being ready for
any of those questions rather than just one. A real-time OLAP store (Druid, Pinot, ClickHouse)
pushes pre-aggregation to ingestion time itself — Druid's own documentation names the real cost
directly: once rolled up, an individual event can no longer be queried on its own.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a materialized table is always correct just because it's fast.** The real, measured
freshness gap in this topic's own lab is real production risk: a materialized table can be
confidently wrong about anything written since its last refresh, which is a different failure
mode than a warehouse scan (always correct, just slower) and needs to be reasoned about
separately.

**Reaching for a real-time OLAP store before the simpler options are actually insufficient.**
Standing up and operating Druid, Pinot or ClickHouse is a real, ongoing cost, not a free upgrade;
this topic's own "Prove it" step names the specific freshness-and-volume combination that
actually justifies paying it, rather than treating it as a default choice.

</section>

<section data-section="frontier">

## Frontier

Druid, Pinot and ClickHouse each make different real engineering trade-offs beyond the shared
rollup idea this topic names (ingestion architecture, query language, operational model), which
is exactly the engine-level detail this topic's own syllabus defers to later sections (§6.4 and
§9.3) rather than building here.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every read-side pattern so far assumed a reader pulling from a store. The next topic is the
opposite direction entirely — a consumer reading what a producer wrote, through a queue or a log.

</section>
