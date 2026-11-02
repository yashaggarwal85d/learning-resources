<section data-section="outcomes">

## Outcomes

Explain, by mechanism, why a scheduled task on a real cluster sometimes waits rather than running
immediately at a worse locality level: delay scheduling trades a short wait for a better (more
local) placement, betting the throughput gain is worth the fairness it sacrifices. Distinguish
`spark.default.parallelism` (a core-count-driven default for RDDs with no parent and no explicit
count) from `spark.sql.shuffle.partitions` (a SQL-layer setting, default 200, governing only
shuffle output), and say confidently which one a given stage actually obeys.

</section>

<section data-section="internals">

## Dynamic allocation and the shuffle-tracking requirement

Dynamic allocation (`spark.dynamicAllocation.enabled`) lets Spark scale the number of executors up
and down with a job's actual workload, rather than holding a fixed executor count for the whole
application. Since Spark 3.0, removing an executor safely requires either an external shuffle
service or `spark.dynamicAllocation.shuffleTracking.enabled`, so that an executor holding shuffle
files other tasks still need isn't torn down before those files have been read. Local mode has
exactly one executor and nothing to scale, so this is named from Spark's own configuration docs
rather than demonstrated.

## FIFO and FAIR scheduling pools

Spark's scheduler runs jobs in FIFO order by default inside one `SparkContext`: the first job
submitted gets priority on every available resource until it genuinely runs out of tasks to
launch, then the next job gets priority. FAIR scheduling, opt-in via `spark.scheduler.mode`, shares
resources across several concurrently running jobs instead of queueing them strictly — the real
production case is several users or applications sharing one long-running `SparkContext`, such as
a notebook server, not a single batch pipeline.

## Delay scheduling, named from Spark's own source

Spark's `TaskSchedulerImpl.scala` describes delay scheduling directly as an optimisation that
sacrifices job fairness for data locality to improve cluster and workload throughput: a task set
holds off launching a task immediately at a worse locality level, betting that a brief wait buys a
better one. Local mode's single JVM is always the best possible locality the instant a task is
offered, so this wait is never actually observable here — named and quoted, not measured.

</section>

<section data-section="production">

## Production failures this topic warns about

**Scaling up cores expecting shuffle output to shrink.** Adding executors raises
`spark.default.parallelism`, but it does nothing to `spark.sql.shuffle.partitions` — a job already
suffering from too many small shuffle partitions sees no relief just from more cores, because the
setting that actually produced those partitions never moved.

**Assuming a notebook server's jobs run fairly by default.** FIFO is Spark's own default inside one
`SparkContext`. A team running shared, long-lived notebook sessions without enabling FAIR
scheduling will see one user's long job starve everyone else's, by design, not by bug.

</section>

<section data-section="frontier">

## Frontier

AQE's `coalescePartitions` feature, deliberately disabled in this topic's own `examples.py` to keep
the `spark.sql.shuffle.partitions` measurement clean, is itself this chapter's own later topic: it
can shrink a shuffle's actual runtime partition count below the configured default based on real
data volume, the mirror of AQE's skew-join splitting that can raise it instead.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This topic placed and sized the tasks a plan already decided to run. The next two topics go one
level up, into the planner itself: how Catalyst turns a query into that plan in the first place,
starting with the pipeline from an unresolved logical plan to a physical one.

</section>
