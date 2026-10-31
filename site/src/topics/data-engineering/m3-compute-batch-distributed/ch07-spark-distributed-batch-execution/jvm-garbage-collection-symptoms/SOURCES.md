# Sources: de.jvm-garbage-collection-symptoms

## Spark "Tuning Spark" docs (garbage collection tuning section)

URL: https://spark.apache.org/docs/4.0.0/tuning.html
Version: Spark 4.0.0 documentation

> JVM garbage collection can be a problem when you have large “churn” in terms of the RDDs

> stored by your program.

> the cost of garbage collection is proportional to the number of Java objects, so using data
> structures with fewer objects (e.g. an array of Ints instead of a LinkedList) greatly lowers
> this cost.

> Since 4.0.0, Spark uses JDK 17 by default, which also makes the G1GC garbage collector the default. Note that with

### Contents (item by item):

1. The named condition for GC pressure: large object "churn," specifically calling out that
   programs reading an RDD once and running operations on it usually don't have the problem —
   object-heavy code with lots of short-lived objects is the pattern this topic's own claim 1
   demonstrates.
2. The docs' own direct, causal claim: GC cost is proportional to the number of Java objects —
   the mechanical reason object-heavy RDD code pays measurable GC time while Tungsten's binary
   row format, which minimizes per-row JVM object count, does not.
3. Spark 4.x's own default GC choice: JDK 17 by default, with G1GC as the resulting default
   collector — the exact "GC choices that matter" this topic's syllabus clause names.

## Apache Spark 4.0.0 release notes

URL: https://spark.apache.org/releases/spark-release-4-0-0.html
Version: Spark 4.0.0 release notes

> [SPARK-45315] Drop JDK 8/11 and make JDK 17 the default

> [SPARK-43831] Build and Run Spark on Java 21

### Contents (item by item):

4. The release's own two JIRA-titled changes: dropping JDK 8/11 support and making JDK 17 the
   default, and separately adding build/run support for Java 21 — the exact "Java 17/21" the
   syllabus clause names as the versions that matter for this chapter's own GC discussion.
