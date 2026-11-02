# Before you watch

- **Garbage collection (GC).** The JVM's own process for reclaiming memory held by objects no
  longer in use. Where you meet it: the cost this topic's entire worked example measures
  directly, in two different builds of the identical computation.
- **Object churn.** Creating and discarding many short-lived objects quickly. Where you meet
  it: the condition the sourced docs name as the actual trigger for GC becoming a real cost.
- **Tungsten.** Spark's own engine for representing rows as compact binary data rather than as
  ordinary JVM objects. Where you meet it: the format behind this topic's own zero-GC
  measurement.
- **Executor.** The JVM process that actually runs a Spark task. Where you meet it: the
  process whose own cleanup work this topic reads directly, via the Spark UI's REST API.
- **Bottleneck.** Whichever single resource is actually limiting a job's total running time.
  Where you meet it: the judgment call this topic's own second claim is built around — a real
  cost that still isn't one.
