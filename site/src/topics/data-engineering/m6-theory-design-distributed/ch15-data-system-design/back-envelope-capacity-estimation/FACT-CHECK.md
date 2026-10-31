# Fact-check — de.back-envelope-capacity-estimation

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | The LinkedIn 2014 benchmark's hardware: six-core 2.5GHz Xeon, six 7200RPM SATA drives (JBOD), 32GB RAM, 1Gb Ethernet, three machines. | Confirmed | `sources/linkedin-kafka-benchmark.txt`, quoted verbatim. |
| 2 | Single-producer, no-replication throughput: 821,557 records/sec. | Confirmed | `sources/linkedin-kafka-benchmark.txt`, quoted verbatim. |
| 3 | Single-producer, 3x async-replication throughput: 786,980 records/sec. | Confirmed | `sources/linkedin-kafka-benchmark.txt`, quoted verbatim. |
| 4 | Under 3x replication, total data written to network/disk is three times higher even though per-client throughput barely drops. | Confirmed | `sources/linkedin-kafka-benchmark.txt`, quoted verbatim. |
| 5 | AWS S3: at least 3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD requests/sec per partitioned prefix, no limit on prefixes/bucket. | Confirmed | `sources/aws-s3-performance.txt`, quoted verbatim. |
| 6 | AWS S3: ten prefixes can parallelize to 55,000 reads/sec. | Confirmed | `sources/aws-s3-performance.txt`, quoted verbatim, the guide's own worked example. |
| 7 | A measured in-memory DuckDB scan/aggregate rate of roughly 1.4 billion rows/sec on this sandbox's own CPU, summing a 64-bit column over 20 million generated rows. | Confirmed, direct measurement | `examples.py`; `measure_warehouse_scan_rate()`, run directly, disclosed as this machine's own in-memory ceiling. |
| 8 | Little's Law, `L = λW`. | Confirmed, framing only | Not independently re-derived; attributed to Little (1961) and used as a stated formula, consistent with `CHAPTER.md`'s own instruction that this is "framing only." |

## Red team

- **Is the LinkedIn number being used as a planning figure, which the chapter plan explicitly forbids?** Checked every place the number appears in `reel.tsx`/`narration.json`: it is always paired with "2014 hardware" and "upper-bound illustration," never offered as "your cluster will do this." Step 8 specifically builds a predict question around the wrong use of the number (claiming it as a direct cluster capacity) to make the distinction explicit rather than implicit.
- **Does "the total data written is three times higher" actually mean replication multiplies *storage*, or just *network* traffic?** The source's own wording is "written to network or disk," i.e. both — this topic's storage estimate therefore applies the replication multiplier to the stored-bytes total (not just a transient network figure), which is the correct reading; the claims list and `examples.py`'s `capacity_chain()` apply the multiplier to `storage_bytes`, not only to a bandwidth number.
- **Is the DuckDB measurement a fair "warehouse scan rate," or an unrepresentative best case?** It's disclosed explicitly as a best case: in-memory, single integer column, no disk I/O, no filtering, no network. The reel's own narration calls it "a ceiling on this one machine, not a promise about any real warehouse," matching `CHAPTER.md`'s instruction that a measured figure here must be run, not quoted — which it is, but the red team requires the disclosure to be unmistakable, checked directly in `narration.json` step 7's wording.
- **Peak-to-average ratio of five, and replication of three, applied to the hook's own round numbers — are these invented facts dressed up as findings?** `CHAPTER.md`'s own "Planning values" rule states explicitly that every such number is "the syllabus's or the planner's invented illustration, not a measurement and not a fact about any real system or company," and must be computed, not assumed, once chosen. This topic takes the hook's own illustrative numbers (two million orders, ten clicks, five-times peak, three-way replication — all from `CHAPTER.md`'s own hook text) and runs the actual multiplication in `examples.py`, which is exactly the required move; no claim is made that these are real shop figures.
- **Little's Law predict question (step 2) vs. the real cause.** The tempting wrong answer ("forgot to divide by seconds per day") is checked against the actual arithmetic in `examples.py`: the naive "twenty-three orders a second" reading *did* divide correctly by seconds per day — its error was stopping there, never multiplying by events per order, the peak ratio, or replication. The explain text in `reel.tsx` names this precisely rather than vaguely gesturing at "missing some multiplication."

## Problem Solving

The first draft of `measure_warehouse_scan_rate()` summed a column with a `WHERE` filter, which DuckDB's vectorized engine partially short-circuited in a way that made the "rows scanned" accounting ambiguous between planned and actual rows touched. Switched to an unfiltered full-column `SUM`, which has an unambiguous rows-processed count equal to the table's row count, making the measured rate a real, defensible number rather than one inflated by a predicate pushdown nobody accounted for.
