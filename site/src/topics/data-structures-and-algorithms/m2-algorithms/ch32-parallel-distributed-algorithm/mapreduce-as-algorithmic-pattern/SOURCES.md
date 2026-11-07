# Sources — dsa.mapreduce-as-algorithmic-pattern

Fetched at research time (2026-11-05) into `sources/`. Checked with
`node scripts/sources.mjs check mapreduce-as-algorithmic-pattern`.

## 1. Dean and Ghemawat, "MapReduce: Simplified Data Processing on Large Clusters" (OSDI 2004)

URL: https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf
Local copy: `sources/mapreduce-osdi04.txt`

> The map function emits each word plus an associated
> count of occurrences (just ‘1’ in this simple example).
> The reduce function sums together all counts emitted
> for a particular word.

> Data gets partitioned across these tasks using a partitioning function on

> the intermediate key. A default partitioning function is
> provided that uses hashing (e.g. "hash(key) mod R").

> In some cases, there is significant repetition in the intermediate keys produced by each map task, and the userspecified Reduce function is commutative and associative. A good example of this is the word counting example in Section 2.1. Since word frequencies tend to follow a Zipf distribution, each map task will produce hundreds or thousands of records of the form <the, 1>.

> The only difference between a reduce function and a combiner function is how the MapReduce library handles the output of the function. The output of a reduce function is written to the final output file. The output of a combiner function is written to an intermediate file that will be sent to a reduce task.

> One of the common causes that lengthens the total time taken for a MapReduce operation is a "straggler": a machine that takes an unusually long time to complete one of the last few map or reduce tasks in the computation.

> When a MapReduce operation is close to completion, the master schedules backup executions of the remaining in-progress tasks. The task is marked as completed whenever either the primary or the backup execution completes.

> We have tuned this mechanism so that it typically increases the computational resources used by the operation by no more than a few percent.

## 2. Beame, Koutris and Suciu, "Communication Steps for Parallel Query Processing" (arXiv:1306.5972)

URL: https://arxiv.org/abs/1306.5972
Local copy: `sources/bks-mpc-abs.txt`

> We consider the problem of computing a relational query $q$ on a large input database of size $n$, using a large number $p$ of servers. The computation is performed in rounds, and each server can receive only $O(n/p^{1-\varepsilon})$ bits of data, where $\varepsilon \in [0,1]$ is a parameter that controls replication.

> we show that any algorithm requires $\varepsilon \geq 1-1/\tau^*$, where $\tau^*$ is the fractional vertex cover of the hypergraph of $q$.

> Our results also imply that transitive closure cannot be computed in O(1) rounds of communication.

## 3. Goodrich, Sitchinava and Zhang, "Sorting, Searching, and Simulation in the MapReduce Framework" (arXiv:1101.1902)

URL: https://arxiv.org/abs/1101.1902
Local copy: `sources/goodrich-mapreduce-abs.txt`

> We describe efficient MapReduce algorithms for sorting, multi-searching, and simulations of parallel algorithms specified in the BSP and CRCW PRAM models.

> For the case when mappers and reducers have a memory/message-I/O size of $M=\Theta(N^\epsilon)$, for a small constant $\epsilon>0$, all of our MapReduce algorithms for these applications run in a constant number of rounds.

## 4. Apache Spark, `PairRDDFunctions.scala` (master branch)

URL: https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/rdd/PairRDDFunctions.scala
Local copy: `sources/spark-pairrdd.txt`

> Merge the values for each key using an associative and commutative reduce function. This will
 * also perform the merging locally on each mapper before sending results to a reducer, similarly
 * to a "combiner" in MapReduce.

> As currently implemented, groupByKey must be able to hold all the key-value pairs for any
 * key in memory. If a key has too many values, it can result in an `OutOfMemoryError`.

> groupByKey shouldn't use map side combine because map side combine does not
 * reduce the amount of data shuffled

## 5. Apache Hadoop 3.3.5, MapReduce Tutorial

URL: https://hadoop.apache.org/docs/stable/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html
Local copy: `sources/hadoop-tutorial.txt`

> Partitioner controls the partitioning of the keys of the intermediate map-outputs. The key (or a subset of the key) is used to derive the partition, typically by a hash function. The total number of partitions is the same as the number of reduce tasks for the job.

> HashPartitioner is the default Partitioner.

> Users can optionally specify a combiner, via Job.setCombinerClass(Class), to perform local aggregation of the intermediate outputs, which helps to cut down the amount of data transferred from the Mapper to the Reducer.

**Named, not read** (per the chapter plan): Karloff, Suri and Vassilvitskii, "A model of
computation for MapReduce" (SODA 2010) — named in the Beame-Koutris-Suciu paper's bibliography;
its homepage URL was unreachable at research time, so no definition of its model (the
p = Θ(N^(1−ε)) machines, Θ(N^(1−ε)) bits per step parameters) is stated on screen beyond the
one-sentence summary the Beame-Koutris-Suciu paper's own introduction gives, which is quoted
above via source 2. Pregel (Malewicz et al., SIGMOD 2010) and the COST argument (McSherry,
Isard and Murray, HotOS 2015) are named only in post-notes, per the chapter plan, with no claim
read from either beyond their existence.

**Within this repo, read directly (not "fetched," already on disk):**

- `dsa.work-span-model-work` (topic 105, this chapter): the work-span model's own vocabulary
  (work, span, parallelism; "each phase is embarrassingly parallel" reused as the reason map and
  reduce individually cost nothing beyond their own span of one task), read from that topic's
  own `reel.tsx` and `post-notes.md` for consistency, not re-derived.
