# Sources: Bin packing and makespan scheduling

## Bin packing problem (Wikipedia)

URL: https://en.wikipedia.org/wiki/Bin_packing_problem
Version: fetched 2026-11-05

> Computationally, the problem is NP-hard, and the corresponding decision problem, deciding if items can fit into a specified number of bins, is NP-complete.

> The algorithm can be made much more effective by first sorting the list of items into decreasing order (sometimes known as the first-fit decreasing algorithm), although this still does not guarantee an optimal solution and for longer lists may increase the running time of the algorithm.

> First-fit-decreasing (FFD) orders the items by descending size, then calls First-Fit.

The page's own ratio statement ("FFD(I) ≤ 11/9 OPT(I) + 6/9") renders as stripped MathML
in the plain-text fetch (see `OUTLINE.md` → "Changes from the chapter plan"); the exact
bound is instead taken from the page's own citation title, which states it in full:

> Dósa, György (2007). "The Tight Bound of First Fit Decreasing Bin-Packing Algorithm Is FFD(I) ≤ 11/9\mathrm{OPT}(I) + 6/9". Combinatorics, Algorithms, Probabilistic and Experimental Methodologies. ESCAPE.

Contents (for the coverage map): NP-hardness of bin packing, First-Fit and First-Fit
Decreasing's rules, the FFD(I) ≤ 11/9·OPT(I) + 6/9 bound and its tightness (Dósa 2007),
and Modified-First-Fit-Decreasing's improved bound for large items (named, not built).

## Longest-processing-time-first scheduling (Wikipedia)

URL: https://en.wikipedia.org/wiki/Longest-processing-time-first_scheduling
Version: fetched 2026-11-05

> Order the jobs by descending order of their processing-time, such that the job with the longest processing time is first.

> Schedule each job in this sequence into a machine in which the current load (= total processing-time of scheduled jobs) is smallest.

> Step 2 of the algorithm is essentially the list-scheduling (LS) algorithm. The difference is that LS loops over the jobs in an arbitrary order, while LPT pre-orders them by descending processing time.

> LPT was first analyzed by Ronald Graham in the 1960s in the context of the identical-machines scheduling problem.

The page's own 4/3 − 1/(3m) ratio statement likewise renders as stripped MathML; the
value is taken from the rendered page and independently re-derived in `examples.py`
(Graham's own tight family, verified exactly against a brute-force optimum for m = 2
through 5).

> 1 2 Graham, R. L. (March 1969). "Bounds on Multiprocessing Timing Anomalies". SIAM Journal on Applied Mathematics. 17 (2): 416–429.

Contents (for the coverage map): LPT's rule (descending order, smallest-load machine),
its relation to plain list scheduling (order is the only difference), and Graham's 1969
origin and 4/3 − 1/(3m) bound.

## Identical-machines scheduling (Wikipedia, "Multiprocessor scheduling")

URL: https://en.wikipedia.org/wiki/Multiprocessor_scheduling
Version: fetched 2026-11-05

> is NP-hard even for identical machines, by reduction from the partition problem. Many exact and approximation algorithms are known.

> Graham proved that:

(the list-scheduling 2 − 1/m bound that follows this line renders as stripped MathML;
its value is re-derived directly in `examples.py` on the classical worst-case instance —
m(m−1) unit jobs followed by one job of size m, submitted in that order — verified
exactly against a brute-force optimum for m = 2 and m = 3.)

Contents (for the coverage map): NP-hardness of identical-machines scheduling, and
Graham's list-scheduling bound of 2 − 1/m for jobs processed in an arbitrary order
(as opposed to LPT's pre-sorted order).

## FilePartition.scala (Apache Spark, `master` branch)

URL: https://raw.githubusercontent.com/apache/spark/master/sql/core/src/main/scala/org/apache/spark/sql/execution/datasources/FilePartition.scala
Version: fetched 2026-11-05, `master` branch HEAD at fetch time

> // Assign files to partitions using "Next Fit Decreasing"

> partitionedFiles.foreach { file =>
> if (currentSize + file.length > maxSplitBytes) {
> closePartition()
> }
> // Add the given file to the current partition.
> currentSize += file.length + openCostInBytes
> currentFiles += file
> }

Contents (for the coverage map): Spark's own comment naming its algorithm "Next Fit
Decreasing," the exact close-partition condition (current size plus the next file would
exceed the max split size), and the per-file open cost added to the running size —
reproduced faithfully in `examples.py`'s `spark_next_fit_decreasing`, not reimplemented
as true First-Fit-Decreasing (the two are related but distinct algorithms, and the
11/9 guarantee is proved for First-Fit, not for this next-fit relative).
