# Outline — de.representative-data-workload-skew

## Outcomes (from CHAPTER.md)

Generate a uniform baseline dataset and confirm it shows no hot-key effect; replace it with a
seeded Zipfian generator and reproduce a visible hot-key latency tail on the same query; reproduce
a cardinality-estimator misestimate from a correlated column pair and contrast it against the same
join on independent columns; state an explicit scale factor for a generated dataset; commit a
seeded generator function that reproduces byte-identical data from the same seed.

## 9-step storyboard (full, ~15 min)

1. **Hook.** The shop's order-lookup benchmark from the last topic reported a clean, flat latency
   distribution with no visible hot spots, while the shop's actual production traffic, the same
   week, shows one percent of customers generating nearly a third of all lookups.
2. **Predict: what did the benchmark's own data get wrong, and what single change would fix it.**
   (Correct: the benchmark generated customer ids uniformly at random; switching to a Zipfian
   distribution, matching YCSB's own default, reproduces the real hot-key shape.)
3. **Reveal: the uniform baseline, confirmed flat.** The same query, same load shape, uniform
   customer id, shows no hot-key effect. No takeaway (reel test's reference step).
4. **Reveal: Zipfian key generation, reproduced.** Replacing the uniform generator with a seeded
   Zipfian one reproduces a visible hot-key latency tail on the identical query. Takeaway.
5. **Reveal: correlated columns breaking a cardinality estimator.** A query planner that assumes
   column independence misestimates a join's row count once a correlated column pair is
   introduced, contrasted against the same join on independent columns. Takeaway.
6. **Reveal: an explicit scale factor.** The dataset's own row count is stated as a number, not
   left implicit, following TPC's own convention. Takeaway.
7. **Reveal: the seeded generator as a committed artifact.** The Zipfian-and-correlated generator,
   given the same seed, reproduces byte-identical data every run, committed as a reusable
   function. Takeaway.
8. **Recap.**
9. **Prove it.** A benchmark reports a clean result on synthetic data generated with independent,
   uniformly random columns. Should that result be trusted for a production workload with
   correlated, skewed real columns? (Correct: not without re-running on representative data — a
   clean result on independent, uniform data says nothing about what happens once real skew and
   correlation are present, which is exactly what this topic just reproduced.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (YCSB's own Zipfian default and generator, Postgres's own column-independence
assumption and extended-statistics feature); Lab (the seeded generator, built and committed in
examples.py, run for real against this sandbox's Postgres); Production (the hook's benchmark-vs-
production mismatch, resolved); Frontier (why a correlated-column misestimate and a hot-key
latency tail are two distinct causes, not one); Where this goes next (the industry-scale suites
built from exactly this method).

## Bridge / handoff

Bridge (answers topic 2's handoff verbatim): "Every number in the last topic came from requests
generated against the shop's real schema with a uniform customer id — data far tidier than any
real traffic actually is. This topic is what changes once the data looks the way real data looks:
a few customers dominating the traffic under a Zipfian key, correlated columns breaking a
cardinality estimator that assumes independence, and a seeded generator that makes both
reproducible instead of a one-off."

Handoff: "A single query, on one table, measured honestly with a realistic key distribution, is
still one benchmark built by hand for one chapter. The last topic names the suites an entire
industry built the same way, at a scale this course's own harness cannot reach, and the trap the
method gets built to resist: a vendor choosing which true number to publish."

## Concept ledger

Introduces: `uniform-vs-zipfian-key-generation`, `cross-column-correlation-cardinality-miss`,
`explicit-scale-factor`, `seeded-generator-as-artifact`.
Uses: `closed-loop-vs-constant-rate-generator`, `fanout-tail-amplification` (topic 2);
`steady-state-detection` (topic 1).
Declared: basic familiarity with a power-law distribution and a database query planner's
row-count estimate. Builds on Chapter 5's cardinality-estimation material (not yet live) in prose
only.

## Claims list (for FACT-CHECK.md)

1. PostgreSQL's own documentation: the planner normally assumes multiple conditions are
   independent of each other, an assumption that does not hold when column values are correlated;
   regular per-column statistics cannot capture cross-column correlation.
2. YCSB's own project repository: Workload A ("update heavy") ships with its request distribution
   configured as Zipfian.
3. YCSB's own ZipfianGenerator source: a Zipfian generator produces a sequence of items such that
   some items are more popular than others according to a Zipfian distribution.
4. TPC-H's own standard specification: a table's cardinality is factored by SF, the Scale Factor,
   to obtain the chosen database size; scale factor 1 is defined as approximately one gigabyte.
5. (This course) a uniform baseline dataset, run through topic 2's own query and load shape, shows
   no hot-key latency effect — measured directly in examples.py.
6. (This course) replacing the uniform key generator with a seeded Zipfian one, at the same query
   and load shape, reproduces a visible hot-key latency tail — measured directly in examples.py.
7. (This course) a join over a correlated column pair is misestimated by Postgres's own query
   planner more severely than the same join over an independent column pair — measured directly
   in examples.py via `EXPLAIN`'s own estimated-vs-actual row counts.
8. (This course) a seeded generator function, given the same seed, reproduces byte-identical data
   across repeated runs — verified directly in examples.py.
