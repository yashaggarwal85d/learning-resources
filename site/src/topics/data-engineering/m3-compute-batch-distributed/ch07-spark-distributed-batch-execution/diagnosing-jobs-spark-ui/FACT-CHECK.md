# Fact-check: de.diagnosing-jobs-spark-ui

## Claims table

| Claim | Basis | Check |
|---|---|---|
| Skew shows up as one task running far longer than the rest in the same stage | Measured (`examples.py`) | `python3 examples.py` assertions, passing |
| A skewed sort's spill (memory and disk) is isolated to the one task handling the oversized partition | Measured | same |
| Object-heavy RDD code pays real JVM GC time where the equivalent DataFrame aggregation pays zero | Measured | same |
| With thousands of tiny partitions, a task's own scheduler delay exceeds its own CPU time | Measured | same |
| Driver-side post-processing after `collect()` produces a stretch of time no stage accounts for | Measured | same |
| GC time, scheduler delay, and shuffle spill (memory/disk) are each defined as specific per-task metrics in the Spark UI | Sourced, Spark "Web UI" docs | `sources.mjs check`, word for word |
| The SQL tab's plan graph annotates physical operators with per-operator metrics, including spill size | Sourced, Spark "Web UI" docs | same |
| The History Server reconstructs an application's UI from its persisted event log after the application has finished | Sourced, Spark "Monitoring and Instrumentation" docs | same |

## Red team

- **Could the skew measurement be an artifact of how the probe assigns keys, rather than a
  general property of skewed data?** Checked directly: the design assigns 99.75% of rows to
  one key and spreads the rest across seven others, then forces the aggregation through
  `groupByKey` (no map-side combine) so every row's own per-value cost lands in the task that
  owns its key — not an artifact of partitioning mechanics, but the direct, unavoidable
  consequence of one key carrying almost all the data.
- **Is the "scheduler delay exceeds CPU time" signature specific to small files, or would any
  tiny task show it regardless of cause?** It's specific to the *combination*: a tiny task
  with its own trivial CPU time next to a comparable or larger scheduler delay is exactly what
  "too many tiny partitions" means — the fix (fewer, larger partitions) directly targets that
  ratio, unlike skew or spill, where more partitions wouldn't help.
- **Does the driver-bottleneck measurement actually distinguish "driver is slow" from "the
  REST API just lags behind real time"?** Checked directly: the assertion compares the
  driver-only wall-clock gap against the *sum* of every task's own `executorRunTime` across
  the *entire* application, not just one stage — a gap that exceeds total executor work across
  the whole job, measured after a `time.sleep(1)` settling period, isn't API lag.
- **Is the SQL tab / History Server half of this topic's own claim demonstrable locally, or
  only sourced?** Not independently measured here — the topic's own `examples.py` reads the
  REST API directly rather than rendering the SQL tab's plan graph or restarting a History
  Server process, which would need a separate, longer-running setup outside this script's own
  scope; both are sourced and named with an exact quote instead, consistent with this
  chapter's own established pattern for UI-rendering behaviors not worth a dedicated probe.

## Abandoned approaches

An initial skew probe used a DataFrame `groupBy().agg(sum(udf(v)))` with a skewed key, expecting
the reduce-side task to carry the hot key's cost. It didn't: Spark's own hash-aggregate
performs a map-side partial aggregation before the shuffle, so the heavy per-row UDF work ran
during the *map* stage, which itself showed no skew either, since the input range API splits
rows positionally (by id), not by the skewed key — nearly every map partition ended up with a
near-identical mix of hot- and cold-key rows. Switched to an RDD `groupByKey` (no combiner),
which forces every row's own cost into the single downstream task owning its key, producing a
clean, dramatic skew signature instead. An early version of the small-files scenario compared
summed per-task run time against the job's own wall-clock time, expecting overhead to show up
as "sum exceeds wall time" -- it failed, because four cores running concurrently can rack up
more summed task-seconds than wall-clock seconds even with zero overhead. Replaced with a
direct comparison already present in the REST API: each task's own `schedulerDelay` against
its own `executorCpuTime`, which isolates overhead from parallelism entirely.
