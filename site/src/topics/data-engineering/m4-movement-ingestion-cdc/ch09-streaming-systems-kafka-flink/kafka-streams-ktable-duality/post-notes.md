<section data-section="outcomes">

## Outcomes

A real toy task-assignment model confirms parallelism is capped at the input partition count,
with excess application instances sitting genuinely idle rather than taking on partial work. A
real stream-aggregated-to-table model confirms the table reconstructs exactly from its own stream
read back out, both directions of the duality agreeing. A real recovery-time comparison confirms
a warm standby cuts recovery by a large, measured factor compared to replaying a changelog from
scratch. All measured directly against the models' own state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic has no lab of its own (CHAPTER.md).

</section>

<section data-section="production">

## Production failures this topic warns about

**Starting more application instances than input partitions, expecting more throughput.** Beyond
the partition count, every additional instance sits idle — it adds failover readiness, not
processing capacity, and provisioning for throughput that way wastes real resources.

**Running a stateful application with no standby replicas configured, assuming recovery is fast
regardless.** Without a standby, a failed task's state has to be rebuilt entirely by replaying its
changelog topic from scratch — a cost that scales with how much state that task held.

**Treating ksqlDB's Confluent Community License as equivalent to Apache Kafka's own Apache 2.0
license.** It permits reading, modifying, and redistributing the source, but specifically excludes
offering it as a competing SaaS product — a real, narrow restriction worth checking before betting
an architecture on it.

</section>

<section data-section="frontier">

## Frontier

The Streams rebalance protocol is GA but still filling in real feature gaps (warmup task support,
named directly in its own current docs, isn't implemented yet) — its exact current scope for
stateful task placement is a currency fact to reconfirm, not settled, finished behavior.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every engine in this chapter eventually has to put its output somewhere a person, or another
system, can actually query. The next two topics are those two destinations: the lakehouse, and a
real-time OLAP store.

</section>
