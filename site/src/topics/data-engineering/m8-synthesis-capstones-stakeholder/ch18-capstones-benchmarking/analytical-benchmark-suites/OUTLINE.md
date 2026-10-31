# Outline — de.analytical-benchmark-suites

## Outcomes (from CHAPTER.md)

State what TPC-H, TPC-DS, ClickBench, the Join Order Benchmark and TPC-DI each specifically
stress, and what each deliberately does not; reproduce a small, disclosed-scale stand-in for one
suite's query shape (a join-order-sensitive query over topic 3's correlated schema, in the spirit
of the Join Order Benchmark) and say plainly that it is a shape, not the suite itself; name
benchmarketing and a DeWitt clause as the trap this chapter's method resists; publish the chapter
lab's harness (topic 2), seeded dataset generator (topic 3) and a measured baseline together as
one committed, reproducible artifact.

## 9-step storyboard (full, ~16 min)

1. **Hook.** A database vendor publishes a benchmark result showing their engine beats a
   competitor's by a wide margin, every number independently reproducible and true. A customer who
   adopts the engine on the strength of that report still finds it slower on their own real
   workload.
2. **Predict: how can every published number be true and the comparison still mislead, and what
   licence term could have stopped the competitor from publishing a correction.** (Correct: the
   published suite stressed exactly the query shapes the winning engine is strong on and avoided
   the ones it isn't — benchmarketing, not fabrication — and a DeWitt clause in the competitor's
   own licence may have forbidden them from publishing a rebuttal at all.)
3. **Reveal: TPC-H and TPC-DS, what each stresses.** TPC-H's own eight-table schema and
   twenty-two queries stress broad ad hoc analytical SQL over a comparatively simple schema;
   TPC-DS's own snowflake schema and ninety-nine queries extend that to a larger, more
   realistically structured retail warehouse. No takeaway (reel test's reference step).
4. **Reveal: ClickBench and its own stated blind spot.** One single flat table, forty-three
   queries, no joins — fast to run and easy to compare, at the cost (stated in ClickBench's own
   README) of testing nothing about join performance, an unfair advantage for a system with no
   normalized schema to pay for. Takeaway.
5. **Reveal: the Join Order Benchmark, for cardinality estimation and join ordering.** Built on a
   real, correlated IMDB data set specifically because uniformity-and-independence assumptions
   (topic 3's own subject) fail on real data — the named, industry-scale descendant of this
   chapter's own correlated-column demonstration. Takeaway.
6. **Reveal: TPC-DI, the only TPC ETL specification, now obsolete.** TPC's own current
   specifications page lists TPC-DI, the only TPC benchmark aimed at data-integration workloads
   rather than query execution, under its own "Obsolete Workloads" table. Takeaway.
7. **Reveal: benchmarketing and the DeWitt clause.** A vendor choosing which true number to
   publish is benchmarketing, not fabrication; a DeWitt clause, named for David DeWitt, is a
   licence term documented to forbid publishing unsanctioned benchmark results at all — the trap
   this chapter's whole method (an independently reproducible harness and baseline) exists to
   resist. Takeaway.
8. **Recap.**
9. **Prove it.** Closes the chapter lab: this topic's own small, disclosed-scale query over
   topic 3's correlated schema, run both with and without a join-order hint, is published
   alongside topic 2's harness and topic 3's generator as one committed artifact. Which claim
   about that artifact is correct? (Correct: it demonstrates the same method industry suites use,
   at classroom scale, honestly labeled as a stand-in — not a sixth suite and not evidence about
   any one database engine's real-world performance.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (each suite's own stated schema/query shape and its own stated or documented
blind spot; the DeWitt clause's own documented mechanism); Lab (the chapter-closing artifact:
topic 2's harness, topic 3's generator, and this topic's own small join-order-sensitive query,
published together with a one-command re-run); Production (the hook's benchmarketing-and-DeWitt
trap, resolved); Frontier (why a suite's own disclosed blind spot is not dishonest, but an
undisclosed one, or a vendor cherry-picking only the suite that flatters them, is); Where this
goes next (the chapter's own method applied to the pass bar and the capstones).

## Bridge / handoff

Bridge (answers topic 3's handoff verbatim): "A single query, on one table, measured honestly
with a realistic key distribution, is still one benchmark built by hand for one chapter. This
topic names the suites an entire industry built the same way, at a scale this course's own
harness cannot reach, and the trap the method gets built to resist: a vendor choosing which true
number to publish."

Handoff: "Every topic in this chapter built one piece of an honest benchmark: a warmed-up target,
a load generator that doesn't lie about its own worst case, data shaped like real data, and the
industry suites that apply all three at scale. None of that method decides, by itself, when a
capstone is actually done, or who outside engineering has to agree the numbers mean what the team
says they mean. The next chapter is that half of the job: writing the requirements and contracts
that decide what 'done' even means, and communicating the trade-off this chapter's own numbers
represent to someone who will never read a percentile."

## Concept ledger

Introduces: `tpc-h-tpc-ds-stress-profile`, `clickbench-join-free-blindspot`,
`join-order-benchmark-cardinality-stress`, `tpc-di-obsolete-status`,
`benchmarketing-and-dewitt-clause`.
Uses: `uniform-vs-zipfian-key-generation`, `cross-column-correlation-cardinality-miss`,
`seeded-generator-as-artifact` (topic 3); `closed-loop-vs-constant-rate-generator`,
`histogram-merge-vs-percentile-average` (topic 2); `steady-state-detection` (topic 1).
Declared: basic familiarity with SQL joins and a decision-support (star/snowflake) schema. Builds
on Chapter 18's own §18.2 pass bar (not a reel topic, named only as what this method is applied to
next) in prose only.

## Claims list (for FACT-CHECK.md)

1. TPC-H's own specification: the TPC-H database is defined to consist of eight separate and
   individual Base Tables; TPC-H's own query clause describes twenty-two decision support queries.
2. TPC-DS's own specification: the TPC-DS schema is a snowflake schema with multiple dimension and
   fact tables; a TPC-DS query stream consists of the 99 queries defined in the specification.
3. ClickBench's own README: the workload consists of 43 queries testing full scan, filtered scan,
   index lookups and the main relational operations; the dataset is a single flat table, different
   from the normalized star or snowflake model classical data warehouses use, which the README
   itself states may give classical warehouses an unfair disadvantage in this specific benchmark.
4. Leis et al. (PVLDB 2015): the paper introduces the Join Order Benchmark, based on the IMDB data
   set, specifically because cardinality estimates are usually computed on simplifying assumptions
   like uniformity and independence that are frequently wrong on real-world data.
5. TPC's own current specifications page: TPC-DI is listed under TPC's own "Obsolete Workloads"
   table, alongside TPC-A, TPC-APP, TPC-B, TPC-D and TPC-R.
6. Wikipedia's "David DeWitt" article: several commercial database vendors include a licence
   provision, the DeWitt Clause, prohibiting publication of unsanctioned benchmark results; the
   clause originated from Oracle's response to a 1982 benchmark study by David DeWitt.
7. (This course) a small, disclosed-scale join-order-sensitive query over topic 3's correlated
   schema, run with and without a join-order hint, measurably changes query latency — measured
   directly in examples.py.
8. (This course) the chapter's three artifacts (topic 2's load-generator harness, topic 3's
   seeded data generator, and this topic's own measured baseline) are published together and
   re-run end to end from one committed script — verified directly in examples.py.
