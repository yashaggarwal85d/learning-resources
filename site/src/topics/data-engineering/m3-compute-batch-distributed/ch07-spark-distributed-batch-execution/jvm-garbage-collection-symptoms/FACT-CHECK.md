# Fact-check: de.jvm-garbage-collection-symptoms

## Claims table

| Claim | Basis | Check |
|---|---|---|
| Object-heavy RDD code (groupByKey over per-row tuples) produces real, nonzero JVM GC time | Measured (`examples.py`) | `python3 examples.py` assertions, passing |
| The identical aggregation via DataFrame/Tungsten over the same data produces zero measured GC time | Measured | same |
| The object-heavy run's own GC time is under 5% of its total executor run time | Measured | same |
| GC is a problem with large object churn, not usually for a single read-then-operate pattern | Sourced, Spark "Tuning Spark" docs | `sources.mjs check`, word for word |
| GC cost is proportional to the number of Java objects | Sourced, Spark "Tuning Spark" docs | same |
| Spark 4.0 uses JDK 17 by default, making G1GC the default collector | Sourced, Spark "Tuning Spark" docs | same |
| Spark 4.0 drops JDK 8/11, defaults to JDK 17, and adds Java 21 support | Sourced, Spark 4.0.0 release notes | same |

## Red team

- **Is the "zero measured GC" result for the DataFrame run really zero, or just below this
  particular sandbox's measurement resolution?** Checked directly against the REST API's own
  `/executors` endpoint, which reports `totalGCTime` as a plain millisecond integer, not a
  rounded or bucketed figure — the DataFrame run's own value came back as the literal integer
  `0` across repeated runs, not a small-but-nonzero number that happened to round down.
- **Could the GC contrast be explained by the RDD run simply doing more total work (more
  tasks, more data movement), rather than genuinely different per-object JVM overhead?** Both
  runs use the identical row count and the identical logical grouping key range, with the only
  difference being the API (RDD vs. DataFrame) used to express the same aggregation — ruling
  out a difference in the amount of data actually processed as the explanation.
- **Does more memory reliably reduce GC time for the same object-heavy job, which would be a
  natural follow-up claim?** Tested directly and abandoned: tripling the driver heap (700MB to
  1536MB) on the identical object-heavy job *increased* measured GC time rather than
  decreasing it, in a one-off comparison — almost certainly JVM heap-sizing noise (a larger
  heap changes G1's own default young-generation sizing and collection cadence in ways this
  topic doesn't control for) rather than a real, reproducible relationship. Dropped this as a
  claim entirely rather than report a result this topic can't actually stand behind.
- **Is the chosen workload's own 5% GC fraction representative of "not a bottleneck" in
  general, or just true for this one job?** The claim is scoped narrowly to this topic's own
  worked example, not a general threshold — the point demonstrated is the *reading practice*
  (compare GC time to total run time) rather than a universal percentage cutoff for what
  counts as GC-bound.

## Abandoned approaches

An early design attempt tried to show that reducing available heap for the same object-heavy
job would measurably increase GC time, as a third claim alongside the RDD-vs-DataFrame
contrast. Comparing a 700MB driver heap against a 1536MB heap on the identical job produced
the opposite of the expected direction (201ms vs. 355ms, smaller heap showing *less* GC time),
most likely because G1's own default region and young-generation sizing scale with total heap
size in ways that don't map cleanly onto a single before/after comparison at this job's scale.
Rather than report a noisy or misleading result, this claim was dropped entirely; the topic
keeps only the two measurements that reproduced cleanly and consistently.

A separate early attempt tried to reproduce "long G1 pauses causing heartbeat timeouts and
lost executors" directly, by forcing an extremely long GC pause under a tiny heap. This was
not attempted as a live measurement: `local[N]` mode runs the driver and the only "executor"
in the same JVM process, so there is no separate executor process for Spark to actually
declare lost — any pause long enough to trigger a real heartbeat timeout in this mode would
only ever crash the single JVM running the whole session, not demonstrate the cluster-level
failure and recovery the syllabus clause describes. This part of the clause is sourced and
named in `coverage.json`'s own `deep` pointer instead of measured.
