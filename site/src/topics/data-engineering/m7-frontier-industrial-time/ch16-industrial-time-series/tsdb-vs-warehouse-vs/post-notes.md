<section data-section="outcomes">

## Outcomes

A four-access-path decision matrix (last value, range scan, cross-series aggregation, join to
business data) measured directly on DuckDB/Parquet against a synthetic week of the plant's own
series count. Prometheus's own documented local-storage limitation, ClickHouse's granule-based
primary key, QuestDB's three-tier architecture, and InfluxDB 3's Last/Distinct Value Caches, each
named and quoted for their own access-path shortcut. A capacity-and-cost chain, priced at a dated
object-storage unit cost, comparing a two-week hot tier against a three-year lakehouse tier. The
tier-boundary failure modes — duplicated points on export overlap, a late reading reaching only the
hot tier — checked directly.

</section>

<section data-section="lab">

## Lab

`examples.py` builds a synthetic week of the plant's own 1297-series count in DuckDB, using DuckDB's
own set-generating SQL rather than a Python row-by-row loop, then measures a last-value lookup, a
single-series range scan, a cross-series aggregation, and a join against a synthetic work-order
table — all four access paths, on the same data. A `CapacityEstimate` chain multiplies series count,
sampling interval, retention and a per-point byte cost into a monthly dollar figure, priced at
Thanos's own documented $0.02/GB object-storage rate, for both a 14-day hot tier and a three-year
lakehouse tier (the lakehouse tier's bytes-per-point figure is measured from DuckDB's actual Parquet
output, not assumed). `simulate_tier_overlap` and `simulate_late_reading_reaches_only_hot_tier`
check the two boundary failure modes CHAPTER.md names, both directions.

</section>

<section data-section="production">

## Production failures this topic warns about

**Picking one engine for every access path because a demo showed it doing everything.** The hook's
vendor demo is the production shape of this failure: a demo query shape is not the plant's actual
mixed workload, and an engine that wins one row of the matrix can lose badly on another.

**Treating a hot/lakehouse tiering pipeline as a clean cutover instead of an overlapping, lossy
boundary.** A team that assumes every point moves to the lakehouse tier exactly once, on time, will
miss both the overlap window's duplicated points and the late readings that never leave the hot tier.

</section>

<section data-section="frontier">

## Frontier

None of the named engines (Prometheus, ClickHouse, QuestDB, InfluxDB 3, a live Iceberg/Delta
lakehouse) is installed in this environment; every vendor-specific claim is named and quoted from
its own documentation rather than measured directly. DuckDB stands in as the measurement engine for
the decision matrix and the capacity chain, consistent with its role in topics 11-13 and with
CHAPTER.md's own explicit allowance for this topic. The lakehouse tier's measured bytes-per-point
figure comes from DuckDB's default Parquet writer on synthetic, effectively-random values —
deliberately not flattering — so it very likely understates what real, more-compressible plant data
would achieve in production.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The decision made, the next topics turn to the data itself: what a sensor actually reports, and the
protocols (OPC UA, MQTT/Sparkplug) that carry it to whichever tier this topic chose.

</section>
