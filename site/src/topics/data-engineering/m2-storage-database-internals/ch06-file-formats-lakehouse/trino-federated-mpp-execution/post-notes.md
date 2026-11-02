<section data-section="outcomes">

## Outcomes

This topic models four of Trino's own documented coordinator/worker mechanisms with real,
executed code: a coordinator scheduling tasks onto worker threads, a dynamic filter built from a
real join build side pruning a real probe-side scan, cost-based build-side selection from real
row-count statistics, and TASK-retry spooling that reuses completed work instead of recomputing
it. No real Trino cluster runs in this sandbox (no Docker daemon available), so every mechanism is
modeled with real Python and real threading, not Trino's own source, over real in-memory data --
disclosed throughout SOURCES.md and `examples.py`'s own docstring.

</section>

<section data-section="deep-dive">

## Deep-dive

The four mechanisms aren't independent party tricks -- they compound. Dynamic filtering only
works because the coordinator already knows the query's shape as a tree of stages before any
worker starts; cost-based join enumeration only works because connectors (like this chapter's own
Iceberg connector) can answer "how many rows" before a single row is scanned; and TASK retry only
helps because exchanges are already a first-class, spoolable unit of work, not an implementation
detail hidden inside a single process.

</section>

<section data-section="production">

## Production

Trino's own docs are explicit that TASK retry is a tradeoff, not a free upgrade: it needs an
external exchange manager for spooled data, and it's recommended specifically for long batch
queries, not the high-volume short queries QUERY retry is built for -- running one cluster with
TASK retry for batch work and a separate one for interactive queries is the documented best
practice, not an afterthought.

</section>

<section data-section="frontier">

## Frontier

Prestissimo's own story -- a from-scratch C++ worker swapped in under an unchanged Java
coordinator -- is a pattern this chapter's next two topics revisit from the opposite direction:
ClickHouse and DuckDB were both built as single native-code engines from day one, with no
JVM-to-native seam to bridge at all.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Trino owns no storage of its own -- every byte it reads belongs to someone else's table format,
reached through a connector. Next, an engine that answers the opposite question: what if the
engine owned the storage directly? ClickHouse.

</section>
