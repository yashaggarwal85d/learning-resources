Last verified: 2026-11-05.

- Wikipedia, "Reservoir sampling" — Algorithm R's history and correctness proof, Vitter's
  optimality result, and Algorithm L's skip-based pseudocode. [source](https://en.wikipedia.org/wiki/Reservoir_sampling)
- Efraimidis, "Weighted Random Sampling over Data Streams" (arXiv:1012.0256) — the u^(1/w) key
  construction (named "A-ES" in this source), and the two interpretations of item weight.
  [source](https://arxiv.org/abs/1012.0256)
- Apache Spark source, `SamplingUtils.scala` (branch `master`) — Algorithm R as implemented in
  a real distributed engine. [source](https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/util/random/SamplingUtils.scala)
- Apache Spark source, `Partitioner.scala` (branch `master`) — `RangePartitioner.sketch`,
  where a partition's sample travels with its item count. [source](https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/Partitioner.scala)
- Apache Spark source, `RDD.scala` (branch `master`) — `takeSample`, the count-fraction-retry
  method that is not a reservoir sample. [source](https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/rdd/RDD.scala)

Named for attribution only, not read directly (per the chapter plan): Vitter, "Random sampling
with a reservoir," ACM Transactions on Mathematical Software 11(1), 1985, pp. 37–57; Li,
"Reservoir-sampling algorithms of time complexity O(n(1 + log(N/n)))," ACM Transactions on
Mathematical Software 20(4), 1994, pp. 481–493; Efraimidis and Spirakis, "Weighted random
sampling with a reservoir," Information Processing Letters 97(5), 2006, pp. 181–185; Knuth,
*The Art of Computer Programming*, Vol. 2, §3.4.2.

This topic names the Efraimidis–Spirakis algorithm "A-ES," the name the fetched arXiv companion
paper actually uses, rather than "A-Res"/"A-ExpJ" (the names `CHAPTER.md` took from the unread
2006 paper) — see `SOURCES.md` §2 and `FACT-CHECK.md`'s red team for the full reasoning.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=reservoir-sampling:%20).
