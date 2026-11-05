Last verified: 2026-11-05.

- Dean and Ghemawat, "MapReduce: Simplified Data Processing on Large Clusters" (OSDI 2004) —
  the map/shuffle/reduce pattern, the partitioning function, the combiner's own justification,
  and backup tasks. [source](https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf)
- Beame, Koutris and Suciu, "Communication Steps for Parallel Query Processing" (arXiv:1306.5972) —
  the Massively Parallel Communication model's own definition, the one-round lower bound, and
  the transitive-closure consequence. [source](https://arxiv.org/abs/1306.5972)
- Goodrich, Sitchinava and Zhang, "Sorting, Searching, and Simulation in the MapReduce Framework"
  (arXiv:1101.1902) — constant-round sorting and simulation results, abstract only. [source](https://arxiv.org/abs/1101.1902)
- Apache Spark, `PairRDDFunctions.scala` (master branch) — `reduceByKey`'s and `groupByKey`'s
  own documented contracts. [source](https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/rdd/PairRDDFunctions.scala)
- Apache Hadoop 3.3.5, MapReduce Tutorial — a second, independent implementation's partitioner
  and combiner. [source](https://hadoop.apache.org/docs/stable/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html)

Named for attribution only, not read directly (per the chapter plan): Karloff, Suri and
Vassilvitskii, "A model of computation for MapReduce" (SODA 2010) — its homepage was unreachable
at research time; Malewicz et al., "Pregel: A System for Large-Scale Graph Processing" (SIGMOD
2010); McSherry, Isard and Murray, "Scalability! But at what COST?" (HotOS 2015).

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=mapreduce-as-algorithmic-pattern:%20).
