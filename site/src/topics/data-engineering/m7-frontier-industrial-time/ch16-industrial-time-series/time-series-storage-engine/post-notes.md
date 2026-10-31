<section data-section="outcomes">

## Outcomes

A head-block/WAL/block/compaction structure built and run at Prometheus's own documented two-hour
boundary, with the documented capacity formula computed against the plant's own actual series
count. Chunk-metadata pruning checked directly: a query outside a block's time range skips it, one
spanning everything can't skip any. The documented out-of-order accept/reject rule checked at its
default and at a widened window. A TimescaleDB-style chunk structure built and its own documented
chunk-exclusion behavior checked. An InfluxDB-3-style staged pipeline run at its own documented
second/fifteen-minute/ten-minute/five-minute timings. Thanos, Grafana Mimir and VictoriaMetrics
named and quoted for the shared pattern their own architecture descriptions converge on.

</section>

<section data-section="lab">

## Lab

`examples.py` runs every structure directly: a synthetic ingestion stream rolling into Prometheus-
style two-hour head blocks, compacted into fewer, larger blocks, with chunk-metadata pruning checked
against queries that fall entirely inside, entirely outside, and across block boundaries; the
documented capacity formula computed for the plant's own series count and a stated sampling
interval; the out-of-order accept/reject rule checked at a zero window and a widened one; a
TimescaleDB-style chunk structure built from synthetic rows and its chunk-exclusion behavior checked
against a single-day query and an all-days query; and a staged InfluxDB-3-style pipeline (write
buffer, WAL, queryable buffer, Parquet) run at the engine's own documented timings, checked to keep
no more than the documented five minutes in memory at any point past a persistence cycle.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a file-copy backup as equivalent to a WAL-aware one.** The hook's second server is the
production shape of this failure: copying files on disk captures whatever was already persisted,
but a head block's own contents — and anything the WAL hadn't yet been compacted past — were never
in a file a copy operation could see.

**Assuming a wider out-of-order window removes the rejection problem instead of relocating it.** A
team that widens the window and stops checking for rejected samples will miss exactly the samples
old enough to still fall outside the new, wider boundary.

</section>

<section data-section="frontier">

## Frontier

Prometheus itself is not installed in this environment — checked directly: no binary is available,
and the GitHub releases host this sandbox would need to download one from returns a blocked
response. Every Prometheus-specific number this topic checks comes from the documented constants
(two-hour blocks, 128MB WAL segments, the capacity formula, the out-of-order window rule), run
through a structure built to match them, not from a live instance. TimescaleDB, InfluxDB 3, Thanos,
Grafana Mimir and VictoriaMetrics are likewise not installed; TimescaleDB's hypercore/columnstore
compression percentage and InfluxDB 3's WAL/Parquet timings are named and quoted from their own
documentation and, for InfluxDB 3's timings, run as a simulation at the documented values — not
measured against a live instance in either case.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Four engines, four bets. The next topic is the decision: given a write rate, a query shape, a
retention and a budget, when do you want a time-series database, when a warehouse and when the
lakehouse?

</section>
