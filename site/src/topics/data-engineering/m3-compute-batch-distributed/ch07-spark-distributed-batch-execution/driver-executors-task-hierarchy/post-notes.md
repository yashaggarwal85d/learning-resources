<section data-section="outcomes">

## Outcomes

Name what each of application, job, stage and task actually scopes: an application is the whole
running program; a job is spawned by one action and only one action, regardless of whether the
data behind it changed; a stage is a set of tasks the DAG scheduler can run without a shuffle
between them; a task is one unit of work per partition, so a stage's task count equals its
partition count, never the row count. Say precisely what a driver and an executor each are: the
driver is the single process running the application's `main()` and owning the `SparkContext`; an
executor is one of a separate set of processes, one set per application, that actually run the
tasks the driver sends.

</section>

<section data-section="internals">

## Local mode collapses the process boundary, not the mechanism

Every measurement in this topic's `examples.py` runs in `local[4]`: one JVM, with four worker
threads standing in for the slot pool a real cluster would give four separate executor processes.
The job/stage/task counts are the real DAGScheduler and TaskScheduler doing real work — nothing
about counting jobs, stages or tasks changes between local mode and a cluster. What local mode
cannot show is the part of "executor" that is a separate process: on a real cluster, killing one
executor leaves the driver and every other executor running, while killing the driver takes the
whole application down with it, because the driver is the only process holding the job's state
and the only one the cluster manager launched to coordinate the others (Spark's own Cluster Mode
Overview, quoted in `SOURCES.md`).

The driver doesn't allocate its own executors; it asks a **cluster manager** to, and Spark 4.x
supports three: its own **standalone** manager, **YARN** (Hadoop's resource manager) and
**Kubernetes**. A fourth, **Mesos**, was dropped in Spark 4.0 (`SPARK-44442`) — a syllabus detail
this chapter's own engine-of-record note already relies on. Whichever manager is in charge, an
executor's real capacity is its **slot pool**: the number of concurrent tasks it can run equals
its core count, and an application's total parallelism is that core count multiplied by however
many executors it was granted (`cores × executors`) — `local[4]` in this topic's `examples.py` is
the one-executor, four-core case of exactly that formula.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a job's id as if it tracked data, not actions.** This topic's own measurement shows a
second `count()` on an unchanged DataFrame getting a brand new job id. A team debugging "why did
job 47 run twice" from logs alone, without checking whether two actions were actually called, will
chase a ghost: nothing is wrong, two actions ran, so there were two jobs.

**Assuming more partitions always means more parallelism, free.** The task count in this topic
follows partition count exactly (four, then eight) — but every one of those tasks still has to be
scheduled, and scheduling and serialisation overhead is real. The chapter's next topic opens
exactly this trade-off: too many partitions costs overhead, too few costs memory pressure.

</section>

<section data-section="frontier">

## Frontier

Spark Connect (Spark's client-server architecture, where a thin client builds an unresolved plan
and ships it over gRPC to a long-lived server-side driver) changes where the driver physically
runs relative to the client code, without changing anything this topic measured about jobs,
stages or tasks. It is a real, current (GA since Spark 3.4, expanded through 4.x) architecture
this chapter's own syllabus marks *(skipped)* — named here, sourced only, and not built as a reel.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A stage is "a set of tasks with no shuffle between them" — but what exactly decides where that
cut happens, and why a shuffle specifically is the thing that forces it, is the next topic's own
question: narrow versus wide dependencies, and the DAG scheduler's precise cut rule.

</section>
