## Resilient Distributed Datasets (Zaharia et al., NSDI 2012)

URL: https://www.usenix.org/system/files/conference/nsdi12/nsdi12-final138.pdf
Version: NSDI 2012 (original RDD paper; the DAGScheduler's cut rule is unchanged in current Spark)

> We found it both sufficient and useful to classify dependencies into two types: narrow dependencies, where each partition of the parent RDD is used by at most one partition of the child RDD, wide dependencies, where multiple child partitions may depend on it. For example, map leads to a narrow dependency, while join leads to to wide dependencies (unless the parents are hash-partitioned).

> This distinction is useful for two reasons. First, narrow dependencies allow for pipelined execution on one cluster node, which can compute all the parent partitions. For example, one can apply a map followed by a filter on an element-by-element basis. In contrast, wide dependencies require data from all parent partitions to be available and to be shuffled across the nodes using a MapReducelike operation. Second, recovery after a node failure is more efficient with a narrow dependency, as only the lost parent partitions need to be recomputed, and they can be recomputed in parallel on different nodes.

> To run an action on RDD G, we build build stages at wide dependencies and pipeline narrow transformations inside each stage.

> Whenever a user runs an action (e.g., count or save) on an RDD, the scheduler examines that RDD's lineage graph to build a DAG of stages to execute, as illustrated in Figure 5. Each stage contains as many pipelined transformations with narrow dependencies as possible. The boundaries of the stages are the shuffle operations required for wide dependencies, or any already computed partitions that can shortcircuit the computation of a parent RDD. The scheduler then launches tasks to compute missing partitions from each stage until it has computed the target RDD.

> For wide dependencies (i.e., shuffle dependencies), we currently materialize intermediate records on the nodes holding parent partitions to simplify fault recovery, much like MapReduce materializes map outputs.

Contents (item by item):
1. Narrow dependency, precise definition: each parent partition used by at most one child partition (example: `map`).
2. Wide dependency, precise definition: a child partition may depend on multiple parent partitions (example: `join`, unless already co-partitioned).
3. Why the distinction matters: pipelining (narrow) vs. a MapReduce-like shuffle (wide); recovery cost (narrow recomputes only lost partitions; wide can force full recomputation of ancestors).
4. The scheduler's exact cut rule: stage boundaries are placed at wide/shuffle dependencies; narrow transformations are pipelined inside a stage.
5. Wide-dependency (shuffle) outputs are materialized on the nodes holding the parent partitions, for fault recovery — the same idea as MapReduce map-output materialization.

## Spark SQL, DataFrames and Datasets Guide — Shuffle operations (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/rdd-programming-guide.html
Version: 4.2.0 (current "latest" docs; the shuffle-triggering operation list is unchanged since 4.0)

> Certain operations within Spark trigger an event known as the shuffle. The shuffle is Spark's mechanism for re-distributing data so that it's grouped differently across partitions.

Contents (item by item):
1. The shuffle as the mechanism that redistributes data across partitions for operations like `repartition`, `reduceByKey`/`groupByKey` and joins — confirms the paper's "wide dependency" is what current Spark docs call a shuffle, in modern DataFrame terms.
