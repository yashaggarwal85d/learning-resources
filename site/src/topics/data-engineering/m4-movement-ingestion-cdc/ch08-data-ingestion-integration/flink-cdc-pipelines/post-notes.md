<section data-section="outcomes">

## Outcomes

Write a Flink CDC YAML pipeline from a source database to a lakehouse or OLAP sink. Explain its
parallel lock-free snapshot as topic 14's watermark idea. Choose between Flink CDC and Debezium
plus Kafka for a given set of consumers and say what is given up.

</section>

<section data-section="internals">

## Internals: sourced only, against Flink CDC's own 3.7 documentation

This topic has no lab of its own. Flink CDC's own documentation states directly that its
MySQL source can read a snapshot in parallel, checkpoint at chunk granularity, and needs no
global read lock before snapshot reading — the same watermark idea topic 14 already measured
directly against this sandbox's own real PostgreSQL cluster, generalised here to parallel
readers, each needing its own `server-id` range for MySQL. PostgreSQL's own incremental
snapshot reading is marked experimental and off by default, unlike MySQL's. A YAML pipeline's
`source`, `sink` and `pipeline` blocks are submitted with `flink-cdc.sh`, and its documented
sink list spans Paimon, Fluss, Kafka, Doris, StarRocks, Elasticsearch, Iceberg and Hudi. Schema
changes are handled by one of five named modes — Exception, Evolve, TryEvolve, Lenient, Ignore
— a declarative alternative to the manual handling topic 16 measured by hand. None of this is
reproduced directly, since running a real Flink cluster needs Flink itself, which this sandbox
doesn't have.

</section>

<section data-section="production">

## Production failures this topic warns about

**Choosing Flink CDC for a pipeline that already has, or will soon need, a second consumer.**
The hook's own incident runs the other direction (too much machinery for one consumer), but the
same tradeoff cuts the other way: a Flink CDC job gives no shared durable log, so a second
consumer, a replay of history, or a different sink later means reading the source database
again — another slot, another load on production.

**Assuming PostgreSQL's incremental snapshot behaves the same as MySQL's.** A team that copies
a MySQL CDC configuration onto a PostgreSQL source can be surprised that the parallel,
lock-free snapshot path is experimental and off by default there, confirmed directly from
Postgres CDC Source's own documentation.

</section>

<section data-section="frontier">

## Frontier

Flink's own runtime, checkpoints, state and Flink SQL, and Paimon and Fluss as streaming
storage, are each named only here, since they are Chapter 9's own subject.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Whichever way the changes get here, they arrive as inserts, updates and deletes, and an
analytical table has to apply them. The last topic of this section is how, and what that costs
the lakehouse and the warehouse.

</section>
