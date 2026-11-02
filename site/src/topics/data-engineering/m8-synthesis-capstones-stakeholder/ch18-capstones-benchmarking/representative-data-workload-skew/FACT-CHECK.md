# Fact-check — de.representative-data-workload-skew

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | PostgreSQL's own documentation: the planner normally assumes multiple conditions are independent of each other, an assumption that does not hold when column values are correlated; regular per-column statistics cannot capture cross-column correlation. | PostgreSQL docs, 14.2.2 Extended Statistics | Verified, quoted |
| 2 | YCSB's own project repository: Workload A ("update heavy") ships with its request distribution configured as Zipfian. | YCSB `workloads/workloada` | Verified, quoted |
| 3 | YCSB's own ZipfianGenerator source: a Zipfian generator produces a sequence of items such that some items are more popular than others according to a Zipfian distribution. | YCSB `ZipfianGenerator.java` | Verified, quoted |
| 4 | TPC-H's own standard specification: a table's cardinality is factored by SF, the Scale Factor, to obtain the chosen database size; scale factor 1 is defined as approximately one gigabyte. | TPC-H Standard Specification, Rev. 3.0.1 | Verified, quoted |
| 5 | (This course) a uniform baseline dataset, run through this topic's own order-lookup query and load shape, shows no hot-key latency effect. | This topic's own examples.py (measured) | Measured in this sandbox |
| 6 | (This course) replacing the uniform key generator with a seeded Zipfian one, at the same query and load shape, reproduces a visible hot-key effect: the hottest customer carries a far larger share of orders and a measurably slower lookup than a typical cold customer. | This topic's own examples.py (measured) | Measured in this sandbox |
| 7 | (This course) a join over a correlated column pair is misestimated by Postgres's own query planner more severely than the same join over an independent column pair. | This topic's own examples.py (measured), via `EXPLAIN`'s own estimated-vs-actual row counts | Measured in this sandbox |
| 8 | (This course) a seeded generator function, given the same seed, reproduces byte-identical data across repeated runs. | This topic's own examples.py (measured) | Measured in this sandbox |

## Currency check

- The PostgreSQL quote is read from the current (version 18) documentation at research time
  (2026-10-30); the planner's independence assumption and the per-column nature of its statistics
  are long-standing, stable design properties, not something likely to have changed recently
  (the same limitation is why Postgres ships an opt-in extended-statistics feature at all).
- The YCSB quotes are read from the project's own current `master` branch at research time
  (2026-10-30); Workload A's distribution setting and the generator's own description are
  long-standing, unchanged parts of the benchmark's design.
- The TPC-H quote is read from the published Standard Specification, Revision 3.0.1, the
  current revision at research time; a scale-factor definition in a ratified standard is not
  something that changes between readings.

## Red team

1. **Does citing YCSB's Workload A as "the YCSB default" overclaim, given that
   `CoreWorkload.java`'s own code-level fallback default is `uniform`, not `zipfian`?** This was
   caught directly, by grepping the fetched Java source before writing anything into SOURCES.md.
   The claim here (claim 2) is scoped precisely to Workload A's own shipped configuration file,
   not to every possible YCSB invocation; SOURCES.md's "Used for" note states the nuance
   explicitly (the code-level fallback is `uniform`, used only when a workload file sets nothing),
   so the topic's own narration and post-notes avoid the word "default" in favor of citing
   Workload A's own setting directly.
2. **Is the correlated-vs-independent cardinality demonstration actually isolating column
   correlation, or could the gap be explained by something else (e.g. table size, row count)?**
   No — both tables (`correlated_pairs`, `independent_pairs`) have the identical row count (6000),
   the identical column types, and the identical queried condition shape
   (`country = 'US' AND currency = 'USD'`); the only difference is whether `currency` is a
   deterministic function of `country` or drawn independently. Both tables are freshly
   `ANALYZE`d before the comparison, so neither side suffers from stale statistics.
3. **Is the Zipfian generator used in examples.py YCSB's own exact algorithm, which would let a
   reader assume byte-identical behavior to a real YCSB run?** No — `zipfian_rank()`'s own
   docstring states plainly that it is "a simplified rejection-free approximation of the same
   documented shape, not YCSB's own exact algorithm"; the claim this topic makes (claim 6) is
   about the same qualitative hot-key shape YCSB's own Zipfian generator produces, not about
   numerically matching YCSB's own zeta-based computation.
4. **Does declaring "scale factor 1" for a 60,000-row, few-megabyte dataset conflict with TPC-H's
   own definition of scale factor 1 as approximately one gigabyte?** No — the topic's own
   `SCALE_FACTOR` constant is explicitly this topic's own declared multiple of its own base row
   count (`BASE_ROWS_PER_CUSTOMER * N_CUSTOMERS`), not a claim of TPC-H conformance; CHAPTER.md's
   own "Engine of record" note and this topic's post-notes.md state plainly that the lesson taken
   from TPC-H is the convention (state the scale factor explicitly, as a number, rather than
   leaving dataset size implicit), not a reproduction of TPC-H's own benchmark at TPC-H's own
   scale.
5. **Could the hook's "one percent of customers generating nearly a third of all lookups" framing
   be read as a cited production statistic?** It is explicitly a hook-framing scenario
   illustrating the uniform-vs-skewed mechanism this topic reproduces at its own, smaller scale
   (claim 6); it does not appear in coverage.json's expert items or this fact-check's claims table
   as an independent sourced claim.

## Problem Solving

All four sources fetched and quoted cleanly after two matching issues were caught and fixed
before anything shipped. First, grepping YCSB's fetched `CoreWorkload.java` directly (rather than
trusting the syllabus's own "(the YCSB default)" parenthetical at face value) revealed the
code-level fallback distribution is `uniform`, not `zipfian` — resolved by citing Workload A's own
shipped configuration file instead, and phrasing SOURCES.md's "Used for" note precisely to avoid
overclaiming a blanket default. Second, `node scripts/sources.mjs check` initially failed on the
`ZipfianGenerator.java` quote with "not found word for word"; the raw fetched source turned out to
wrap its Javadoc comment with a literal `" * "` prefix on every continuation line, so the second
line of the SOURCES.md quote needed to literally start with `"* "` to match the extracted text
byte-for-byte — fixed, then re-ran the checker to 5/5 quotes passing.
