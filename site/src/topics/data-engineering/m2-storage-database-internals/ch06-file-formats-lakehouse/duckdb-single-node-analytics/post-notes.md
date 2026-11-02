<section data-section="outcomes">

## Outcomes

This topic runs real DuckDB 2.0.0 mechanics entirely in-process, with no Docker daemon and no
server: a real measured wall-clock speedup from morsel-driven parallelism across threads, a real
out-of-core sort that spills to disk under a configured memory limit and still finishes correctly,
real direct queries over live Pandas and Polars DataFrames with no export step, a real local
Iceberg table and a real local Delta table each queried directly through DuckDB's own extensions
with a real pushed-down filter visible in the query plan, and a real DuckLake catalog whose
version history lives in ordinary SQL tables rather than a REST protocol.

</section>

<section data-section="deep-dive">

## Deep-dive

The Iceberg filter pushdown this topic shows directly is the same idea topic 7 (Parquet's
page-level statistics) introduced for a single file: deciding what to skip before reading it.
DuckDB's `EXPLAIN ANALYZE` makes that decision visible as a real, measured bytes-read figure
rather than a claim -- the same proof-by-execution this chapter has used throughout for every
engine that can actually run here.

</section>

<section data-section="production">

## Production

DuckDB's own documentation is explicit that larger-than-memory workloads are a first-class,
supported mode, not a failure path -- a production pipeline can size a query past available RAM
on purpose and rely on spilling rather than provisioning for worst-case memory up front. The
Quack client-server protocol, now shipped as of DuckDB 2.0, extends the same single-process
engine into a lightweight client-server setup without switching to a different database entirely.

</section>

<section data-section="frontier">

## Frontier

MotherDuck's Dual Execution model takes DuckDB's own in-process engine and splits a single
query's operators between a local client and a remote cloud session, with the optimizer deciding
which side runs which operator -- the same engine this topic ran entirely locally, now spanning
two machines when the data's location calls for it.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every engine so far reads a table this chapter built and owns itself. The next three topics turn
to engines this sandbox can't run directly at all: the cloud data warehouses, starting with
Snowflake's own proprietary storage design.

</section>
