# Outline: de.jvm-garbage-collection-symptoms

## Syllabus line (verbatim, `syllabus/data-engineering.md:435`)

> **JVM garbage-collection symptoms** — GC time in the executor tab, long G1 pauses causing heartbeat timeouts and lost executors; object-heavy RDD/UDF code vs Tungsten binary rows; Spark 4.x on Java 17/21 and the GC choices that matter.

## Learning outcomes

- Read the executor tab's GC-time column and judge whether GC is the bottleneck.
- Explain why Tungsten's binary row format reduces GC pressure compared with object-heavy RDD
  code.

## Reel steps (10, kind: full)

1. Hook — the same aggregation, run two ways: one built from everyday objects, one built from
   Spark's own compact binary rows. Which one makes the JVM clean up more?
2. Reveal: the baseline — the object-heavy run genuinely pays real GC time. (No takeaway —
   reel test's own "from" step.)
3. Predict (index 2, within first 4) — run the identical aggregation again, but built from
   Tungsten's own binary rows instead. Does the JVM still pay that same GC cost?
4. Reveal: zero — the binary-row run pays no measured GC time at all. (No takeaway —
   immediately after a predict.)
5. Elaborate — why: GC cost tracks the number of separate objects, and binary rows are
   deliberately built to need far fewer of them. **Takeaway 1.**
6. Predict (index 5) — the object-heavy run did pay real GC time. Does that make GC the actual
   bottleneck in this job?
7. Reveal: no — that GC time is a tiny sliver of the job's own total run time, nowhere close
   to dominating it. (No takeaway — immediately after a predict.)
8. Elaborate — why: a nonzero GC number isn't automatically a problem; it only matters next to
   how much total time the job spent running. **Takeaway 2.**
9. Reveal: the two runs and their own numbers, side by side — same aggregation, same data,
   one real GC cost and one none at all.
10. Recap. **Takeaway 3.**

Engagement arc: two predicts (≥2 required), the first at index 2 (≤4 required); three
takeaways, each on a step that is neither the reel test's "from" step (here step 2) nor
immediately after a predict (here steps 4 and 7) — same pattern as topics 16-19.

## Narrator's line of thought per step

1. Pose the concrete setup: the identical piece of work, built two different ways under the
   hood. Does the JVM's own cleanup notice the difference.
2. Name the baseline: built from everyday, familiar objects, the run genuinely makes the JVM
   clean up — a real, nonzero cost.
3. Invite a guess: build the identical piece of work from Spark's own compact row format
   instead. Does the JVM still pay that same cleanup cost.
4. It pays nothing measurable at all. Not a smaller amount — genuinely none.
5. Why: cleanup cost tracks how many separate little objects there are to look through, and
   the compact row format was built specifically to need far fewer of them.
6. A second guess: the first run did make the JVM pay a real cleanup cost. Does that mean
   cleanup is actually what's slowing that job down.
7. It barely registers at all against how long the whole job actually took.
8. Why: a real, nonzero cleanup cost isn't automatically a problem on its own — it only means
   something once you compare it against how much total time the job spent running.
9. Put both runs' own numbers side by side: the same work, one version paying a real cleanup
   cost, the other paying nothing measurable at all.
10. Pull the thread: how a piece of work is built decides how much cleanup it costs the JVM,
    and a nonzero cleanup cost only matters once it's measured against the whole job's time.

## Post-notes layers

- `outcomes`: reading the GC-time column against total task run time rather than reacting to
  any nonzero GC number by itself — this topic's own measured job genuinely pays real GC time
  and still isn't GC-bound.
- `long G1 pauses, heartbeat timeouts and lost executors`: a G1 pause long enough can exceed
  `spark.executor.heartbeatInterval`'s own reporting window and, if it also exceeds
  `spark.network.timeout`, the driver can mark that executor lost entirely — a cluster-scale
  failure mode this topic names and sources rather than reproduces, since local mode has no
  separate executor process to lose.
- `production failures`: object-heavy UDF or RDD code left in a hot path, where the fix is
  rewriting toward DataFrame operations (Tungsten's binary rows) rather than tuning GC flags
  around code that keeps generating unnecessary objects.
- `frontier`: this chapter's own next topic hands off from GC-induced slowdowns to GC-induced
  executor death specifically — what Spark does when a task or an executor actually dies.

## `examples.py` claims (all measured against real PySpark 4.0.1, local[2])

1. Object-heavy RDD code (`groupByKey` over per-row tuples) produces real, nonzero JVM GC
   time; the identical aggregation over the same data via a DataFrame (Tungsten binary rows)
   produces zero measured GC time.
2. The object-heavy run's own GC time, while real and nonzero, is less than 5% of that job's
   total executor run time — demonstrating that reading GC against total time, not reacting to
   any nonzero number alone, is what judging a bottleneck actually requires.

## Bridge / handoff (copied exactly from CHAPTER.md)

- Bridge: "Caching and spill are about Spark's own accounting of memory. This topic is what
  the JVM underneath it does when that memory fills with live objects: garbage collection, and
  the pauses it causes, which Tungsten's binary rows exist partly to avoid."
- Handoff: "GC pauses can make an executor miss its heartbeat and get declared dead. The next
  topic is exactly that: what Spark does when a task or an executor actually fails, GC-induced
  or otherwise."

## Concept ledger

- Introduces: `spark.gc-symptoms`.
- Uses: `spark.unified-memory-manager`, `spark.tungsten-unsaferow`.

## Claims list

| Claim | Source |
|---|---|
| GC can be a problem with large object "churn"; usually not a problem for programs reading an RDD once and running many operations on it | Spark "Tuning Spark" docs |
| GC cost is proportional to the number of Java objects | Spark "Tuning Spark" docs |
| Spark 4.0 uses JDK 17 by default, with G1GC as the resulting default collector | Spark "Tuning Spark" docs |
| Spark 4.0 drops JDK 8/11 support, making JDK 17 the default, and adds Java 21 support | Spark 4.0.0 release notes |

## Progress

Next topic: 21. `de.task-retry-fetch-failure-speculation` (re-verify exact scope when reached).
