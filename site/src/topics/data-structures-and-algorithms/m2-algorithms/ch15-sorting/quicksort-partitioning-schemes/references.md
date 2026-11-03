Last verified: 2026-11-03.

- OpenJDK `DualPivotQuicksort.java`, `jdk-21-ga` tag — the real system's own depth limit, run-merging pre-check, heapsort fallback and counting sort for small primitive types. [source](https://raw.githubusercontent.com/openjdk/jdk/jdk-21-ga/src/java.base/share/classes/java/util/DualPivotQuicksort.java)
- Wild & Nebel, "Average Case Analysis of Java 7's Dual Pivot Quicksort" (ESA 2012, Best Paper) — the first rigorous average-case comparison and swap counts for dual-pivot quicksort. [source](https://arxiv.org/abs/1310.7409)
- Kushagra, López-Ortiz, Munro & Qiao, "Multi-Pivot Quicksort: Theory and Experiments" (ALENEX 2014 preprint) — the measured gap between a 3-pivot scheme and Yaroslavskiy's shipped 2-pivot scheme. [source](https://cs.uwaterloo.ca/~skushagr/multipivotQuicksort.pdf)
- Edelkamp & Weiß, "BlockQuicksort: How Branch Mispredictions don't affect Quicksort" (arXiv:1604.06697, ESA 2016) — the proven misprediction bound and the measured speedup over `std::sort`. [source](https://arxiv.org/abs/1604.06697)
- Wikipedia, "Quicksort" — used only to find the Dutch national flag attribution and the random-pivot/median-of-three comparison-count figures' own citation, per `CHAPTER.md`'s own permission. [source](https://en.wikipedia.org/wiki/Quicksort)

Hoare's original 1961/1962 papers and Bentley & McIlroy's "Engineering a sort function" (1993) are citation-only this session (paywalled, not attempted), per `CHAPTER.md`'s own "to verify" framing. McIlroy's "A Killer Adversary for Quicksort" could not be fetched this session (SSL error, then HTTP 503); this topic's own `examples.py` builds and verifies its own median-of-three adversary instead. CLRS and Sedgewick & Wayne are citation-only; the Lomuto, Hoare and three-way partition mechanics are verified directly in `examples.py`.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=quicksort-partitioning-schemes:%20).
