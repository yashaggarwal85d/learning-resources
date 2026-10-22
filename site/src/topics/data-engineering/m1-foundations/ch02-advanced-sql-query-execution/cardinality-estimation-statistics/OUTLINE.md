# OUTLINE — Cardinality estimation and statistics (`de.cardinality-estimation-statistics`)

Chapter 2, §2.3, topic 19. Full topic, about 15 minutes.

## Learning outcomes

1. Read `pg_stats` (histogram_bounds, most_common_vals/freqs, n_distinct) and reconstruct, by hand, the row estimate PostgreSQL's planner would print for a range or equality predicate.
2. State the independence assumption (clause selectivities multiply) and the uniformity assumption (a bucket's values, or the "everything not in the MCV list" remainder, are spread evenly), and recognize when a real query breaks each one.
3. Fix a correlated-columns misestimate with `CREATE STATISTICS` and recognize a stale-statistics misestimate that only `ANALYZE` fixes.
4. Explain why an estimation error on one join's input does not cancel out at the next join — it multiplies — and name learned cardinality estimators as the current research response.

## Bridge (from topic 18's handoff, verbatim)

"Whether to look inside a query is settled. Next: the numbers the optimizer leans on to choose, and how it estimates them."

## Handoff (to topic 20, Cost models and join-order search)

"An estimate is only useful once it is compared against the alternatives. Next: the cost formulas that turn a row count into a plan's price, and the search that explores enough of the plan space without exploring all of it."

## Running example

The chapter's `orders` table, scaled down for a real, executed demonstration to 2,000,000 rows (then +400,000 in one bulk load), with the chapter's real columns (`status`, `amount`) plus two columns built for this topic's correlation and staleness stories: `tags` (already in the chapter schema from topic 7, used here for a `holiday_sale` tag) and `channel` (`web` / `app` / `store`, new, declared as this topic's own addition — not reused by a later topic in this chapter). Every number below was measured on a real PostgreSQL 16 instance built exactly as `examples.py`'s comments describe (see `SOURCES.md`, "Measured directly").

## Engagement arc

1. **Hook (step 1):** two real `EXPLAIN` plans against the same table and the same planner machinery — one where estimated and actual rows nearly agree (994,519 vs. 1,003,918), one where they are off by more than 2× (138,866 vs. 282,940). Same machinery, different outcome: why?
2. **Predict #1 (step 2, within the first four):** given the real, independently measured selectivities of `status='cancelled'` (≈16.3%) and `channel='app'` (≈37.3%), what fraction of orders match both, if the planner assumes the two conditions are independent? Reveal: the real combined estimate (138,866 rows, ≈5.8%) matches the independence multiplication almost exactly — and the real actual count (282,940 rows, ≈11.8%) does not, because the columns are correlated.
3. **The surprising numbers:** the 2× correlated-columns miss (step 2), the histogram's near-exact 1% miss (step 5, the healthy baseline), the 1.6× stale-statistics miss (step 9), and the two of them compounding to roughly 3.3× if they land on the same plan (step 11).
4. **Predict #2 (step 9):** a 400,000-row bulk load of all-`pending` orders lands with no `ANALYZE` yet — does the row-count estimate for `status='pending'` notice the new rows at all? Reveal: yes for the *count* (PostgreSQL rescales `reltuples` to the table's current physical size automatically) but no for the *shape* (the MCV frequency for `pending` is still the pre-load proportion), so the estimate undershoots by 1.6× until `ANALYZE` runs again.
5. **Takeaways** (at least one sentence, on steps 5, 6, 8, 11): see step list below.
6. **The recap (step 13):** back to the shop warehouse dashboard — what to check before trusting an `EXPLAIN` estimate.

## Reel steps (storyboard)

Colour grammar for this topic: `C.focus`/`C.primary` for the real numbers; `C.cherryText`/`C.bad` only for the actual count once it has diverged from the estimate (the failure); `C.second` only for the "after `CREATE STATISTICS`"/"after `ANALYZE`" corrected estimate, paired against the broken one.

1. **"Two numbers that are supposed to agree"** — fig: "estimated vs. actual, two plans". Visual: two small `EXPLAIN` panels side by side, each showing `rows=<estimate>` ticking up and then `(actual rows=<actual>)` landing next to it; the healthy pair lands close together in white, the broken pair's actual count lands far to the right in cherry, a visible gap opening between them. Narrator's line of thought: she doesn't read the numbers off the screen — she asks "the planner never ran the query to get the first number; where did it come from, and why does it sometimes miss by this much?"
2. **Predict: "If these two were independent…"** — fig: "16% and 37%, multiplied". Visual: two bars (16.3% cancelled, 37.3% app) sliding together into a single multiplied bar region at their product (~6%); options as in the arc above. Narrator asks the question before any reveal: "multiply, add, or something else?"
3. **Reveal: independence, measured** — fig: "the real estimate lands on the product". Visual: the predicted product bar (~5.8%, 138,866 rows) and the real `EXPLAIN` number appearing on top of it, decoding into place (`Decode`), then the real actual count (282,940, cherry) landing well past it, a visible second gap. Narrator: "the planner was never wrong about the arithmetic — multiplying was exactly its assumption. It was wrong about the assumption."
4. **"Where the two numbers come from"** — fig: "pg_class vs pg_statistic". Visual: the orders table icon splitting into two catalog cards — `pg_class` (`reltuples`, `relpages`, ticking without a scan, rescaled to the table's current size) and `pg_statistic`/`pg_stats` (per-column shape, "always approximate even when freshly updated"). Narrator: the first number (how many rows exist) is cheap and nearly exact; the second (how many rows match a condition) is the hard one, and it is what the rest of this reel is about.
5. **"A histogram: equal-frequency buckets"** — fig: "amount > 1000, bucket by bucket". Visual: a number line for `amount`, 100 equal-frequency buckets drawn thin, a pointer (`Draw`) sliding right to 1000 and landing inside the bucket spanning 994.22–1017.16; whole buckets before it fill solid, the landed bucket fills a linear fraction; the real selectivity (0.41438) and row count (994,519) decode next to the actual (1,003,918), landing close together. **Takeaway:** "A histogram turns 'how many rows match' into 'how much of one bucket is covered.'"
6. **"A most-common-value list: read, don't guess"** — fig: "status, six bars, one thin one". Visual: six bars for `status`, sized to their real sampled frequency (cancelled/pending/shipped/paid/delivered all near 16–20%, `refunded` a visibly thin bar at 1.66%); `Reticle` locks onto `refunded`'s bar and its MCV frequency number, which is the selectivity directly — no bucket, no formula, just the measured frequency.
7. **"Off the list: spread the rest evenly"** — fig: "the remainder, divided evenly". Visual: a pie-like strip where the MCV portion fills first (measured, solid), then the leftover strip divides into `n_distinct − num_mcv` equal slivers (the uniformity assumption, drawn as identical-width ticks) for a value that isn't on the list. `Eq`: `sel = (1 − Σmcv_freq) / (n_distinct − num_mcv)`. **Takeaway:** "Off the list means 'assume everyone else is equally likely' — a guess standing in for a measurement."
8. **"CREATE STATISTICS: a real joint measurement"** — fig: "before and after, same query". Visual: the step-2/3 broken pair recalled (138,866 vs. 282,940, cherry gap), then `CREATE STATISTICS ... (dependencies, mcv) ON status, channel` typing in (`Code`), then the same query's new estimate (284,969, in `C.second`) landing almost exactly on the actual (282,940) — the gap closes. **Takeaway:** "Extended statistics don't make the independence assumption smarter — they replace it with a measurement of exactly the columns you named."
9. **Predict: "A bulk load lands with no ANALYZE yet"** — fig: "400,000 new rows, same statistics". Visual: 400,000 new blocks sliding into the table (all tagged `pending`), the row-count card (`pg_class`) ticking up immediately, the MCV card staying frozen; options as in the arc above.
10. **Reveal: the count rescales, the shape doesn't** — fig: "497,040 vs. 793,095, then corrected". Visual: the stale estimate (497,040) appearing against the real actual (793,095, cherry, 1.6× away); `ANALYZE` runs (a short decode), the estimate jumps to 796,240 (`C.second`), landing on the actual. **Takeaway:** "Row counts rescale on their own; the shape of the data only updates when ANALYZE looks again."
11. **"Errors don't average out — they multiply"** — fig: "two misses, one plan". Visual: the 2.0× correlated-columns miss and the 1.6× stale-statistics miss (both already on screen from steps 3 and 10) sliding together into a single multiplied bar at ≈3.3×, with the documentation's own line appearing underneath: "due to round-off error and other factors they sometimes diverge significantly." Narrator explains this is the same independence multiplication from step 3, now applied to errors instead of selectivities: a join's input cardinality is itself an estimate, so a plan with several misestimated joins compounds every one of them. **Takeaway:** "An estimate that feeds another estimate doesn't average its error away — it multiplies it."
12. **"The frontier: learn it instead of assuming it"** — fig: "a trained model, not a formula". Visual: the histogram/MCV/independence pieces from steps 5–7 dissolving into a single small network icon; one real citation line (Kipf et al., CIDR 2019, MSCN) decoding in. One sentence: a model trained on the actual data and queries targets exactly the correlated and join-crossing cases that just broke — out of scope here, continued in the Deep dive.
13. **Recap: "Before you trust the first number"** — fig: "three questions". Visual: three short checklist lines locking on in turn: are the WHERE columns related (step 2–3, 8)? when did ANALYZE last run (step 9–10)? is this estimate itself feeding another join (step 11)? Narrator hands off: "the estimate is only useful once it's compared against the alternatives — which is what decides a plan's cost, next."

## Claims list

| Claim | Source |
|---|---|
| `pg_class.reltuples`/`relpages` hold the table's row/page counts, updated by VACUUM/ANALYZE/some DDL, and are rescaled to the table's current physical size by the planner | PostgreSQL 18 docs §14.2.1 |
| Per-column shape (histogram_bounds, most_common_vals/freqs, n_distinct) lives in `pg_statistic`, read via `pg_stats`; always approximate even freshly updated | PostgreSQL 18 docs §14.2.1 |
| `default_statistics_target` defaults to 100 entries, settable per column with `ALTER TABLE ... SET STATISTICS` | PostgreSQL 18 docs §14.2.1 |
| A histogram's buckets are equal-frequency; a range predicate's selectivity is the fraction of buckets covered, interpolating linearly inside the landed bucket | PostgreSQL 18 docs §69.1 (scalarltsel) |
| An equality predicate on a value in the MCV list reads that value's frequency directly (`eqsel`) | PostgreSQL 18 docs §69.1 |
| An equality predicate on a value not in the MCV list spreads the remaining frequency evenly over the remaining distinct values: `(1 − Σmcv_freq) / (n_distinct − num_mcv)` | PostgreSQL 18 docs §69.1 |
| `n_distinct`'s sign: positive is an absolute count (fixed-size domain), negative is `−(distinct/rows)` (grows with the table); `−1` means unique | PostgreSQL 18 docs §53.29 (pg_stats) |
| The planner assumes WHERE clauses are independent and multiplies their selectivities (the independence assumption) | PostgreSQL 18 docs §69.1 |
| Correlated columns break the independence assumption and PostgreSQL has no way to see the correlation from single-column statistics alone | PostgreSQL 18 docs §14.2.2 |
| `CREATE STATISTICS` with `dependencies`/`ndistinct`/`mcv` collects real multi-column statistics, filled in by the next `ANALYZE` | PostgreSQL 18 docs §14.2.2, CREATE STATISTICS |
| Functional-dependency and MCV extended statistics only apply to simple equality (and IN) conditions on constants, not ranges or cross-column comparisons | PostgreSQL 18 docs §14.2.2.1.1 |
| Join selectivity (`eqjoinsel`) for columns with no MCV and `n_distinct = −1` is `(1 − null_frac1)(1 − null_frac2) / max(num_rows1, num_rows2)`; with MCV lists present it compares them directly | PostgreSQL 18 docs §69.1 |
| The planner's two ways of sizing a join estimate can "sometimes diverge significantly" | PostgreSQL 18 docs §69.1 |
| Learned cardinality estimators (e.g. MSCN) train a model on query/data features instead of fixed histograms/independence, aimed at correlated and join-crossing cases | Kipf et al., "Learned Cardinalities" (arXiv:1809.00677, CIDR 2019) |
| Measured: `amount > 1000` on a 2,000,000-row `orders` table — estimate 994,519, actual 1,003,918 (healthy baseline, ≈1% off) | This topic, `examples.py` / SOURCES.md "Measured directly" |
| Measured: `status='cancelled' AND channel='app'` on a 2,400,000-row `orders` table — estimate 138,866, actual 282,940 (≈2.04× under) before `CREATE STATISTICS`; estimate 284,969 (≈0.7% off) after `CREATE STATISTICS (dependencies, mcv)` + `ANALYZE` | This topic, `examples.py` / SOURCES.md |
| Measured: a 400,000-row all-`pending` bulk load on a 2,000,000-row `orders` table — `status='pending'` estimate 497,040, actual 793,095 (≈1.6× under) before `ANALYZE`; estimate 796,240 (≈0.4% off) after `ANALYZE` | This topic, `examples.py` / SOURCES.md |

## Post-notes headings (the Deep dive)

- **Outcomes** (layer 1, required wrapper)
- **Into the internals**: `selfuncs.c`'s dispatch by operator (`oprrest`/`oprjoin` in `pg_operator`: `scalarltsel`, `eqsel`, `eqjoinsel`), the full worked histogram+MCV combination for a non-unique column (the `stringu1 < 'IAAAAA'` case from the docs, not shown in the reel), and `ALTER TABLE ... SET STATISTICS` as the per-column override of `default_statistics_target`.
- **Build, break, measure**: reproduce every measured number above on a real PostgreSQL instance, step by step.
- **In production**: a checklist — correlated WHERE columns, autovacuum/ANALYZE cadence after bulk loads, `pg_stat_user_tables.last_analyze`, when extended statistics are worth the ANALYZE/catalog overhead (only for column groups that actually appear together in slow queries), and the Join Order Benchmark lab topic 20 points back to this topic for.
- **The frontier**: learned estimators (MSCN and the broader line of sampling+ML hybrids), and PostgreSQL's own roadmap limits (no automatic extended statistics, no cross-table correlation).
- **Where this goes next**: topic 20 (cost models, join-order search) takes these row estimates as a given input and turns them into a plan's price.

## Examples to execute (examples.py)

Pure Python, no live database (CI-portable, matching this chapter's established convention — see `cte-inlining-vs-materialization/examples.py` and `sql-text-to-plan-tree/examples.py`): implement PostgreSQL's own documented formulas (equal-frequency histogram interpolation, MCV-list equality, the off-MCV uniform-remainder formula, the independence-assumption product, `eqjoinsel`'s no-MCV/unique-column case) directly from the quotes in `SOURCES.md`, and assert each against the real numbers measured on this topic's own PostgreSQL 16 instance (recorded as comments/constants, since the live database itself is not part of CI). Each formula implementation is checked against both the documentation's own worked numbers (the `tenk1` example: selectivity 0.100697, rows 1007) and this topic's own measured numbers.

## Concept ledger

- **Introduces:** `cardinality-estimation`, `histogram-selectivity`, `mcv-selectivity`, `independence-assumption`, `extended-statistics`.
- **Uses:** `planner-paths` (topic 16 — an estimate is attached to a path/plan, which is what topic 16 defined).
- **Declared:** `sql-select`.

## Changes from the chapter plan

`CHAPTER.md` does not yet have an entry for topic 18 or topic 19 (topic 18 shipped without one being appended — a pre-existing gap from an earlier session, not touched here since this topic's folder, registry fields and continuity are instead taken directly from topic 18's real registry entry, reel and post-notes, per section 1's instruction to read "the previous topic's registry entry, reel step titles, post-notes headings and REVIEW.md" when no entry exists). This topic's own scope, bridge and handoff follow the chapter's shared running example, shared constants table (which already names "Topic 19 (cardinality estimation)" against the `default_statistics_target = 100` constant) and lab-mapping table (which already names "Topic 19 (cardinality estimation)" as hosting "the JOB-and-statistics part" of the §2.3 lab — left for topic 20, which is where the lab is scoped, per the chapter's own lab-mapping row for §2.3).
