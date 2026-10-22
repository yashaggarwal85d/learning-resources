---
id: de.cardinality-estimation-statistics
title: Cardinality estimation and statistics
---

<section data-section="outcomes">

## After this topic you can

- Read `pg_stats` (`histogram_bounds`, `most_common_vals`/`most_common_freqs`, `n_distinct`) and reconstruct, by hand, the row estimate PostgreSQL's planner would print for a range or equality predicate.
- State the independence assumption (clause selectivities multiply) and the uniformity assumption (a bucket's values, or the "everyone not on the MCV list," are spread evenly), and recognize when a real query breaks each one.
- Fix a correlated-columns misestimate with `CREATE STATISTICS` and tell it apart from a stale-statistics misestimate that only `ANALYZE` fixes.
- Explain why an estimation error on one join's input compounds rather than cancels at the next join, and name learned cardinality estimators as the current research response.

</section>

<section data-section="internals">

## Into the internals

### The dispatch: two catalog columns, one function per operator

Every operator in a `WHERE` clause has a selectivity function registered against it in `pg_operator`: `oprrest` for a single-table restriction, `oprjoin` for a join condition. `<` dispatches to `scalarltsel`; `=` dispatches to `eqsel` for a restriction and `eqjoinsel` for a join. All three, and the catalogs they read, are documented in PostgreSQL 18's Chapter 69, "How the Planner Uses Statistics" — "the operator-specific selectivity functions are mostly found in `src/backend/utils/adt/selfuncs.c`."

### The full histogram-plus-MCV combination, for a non-unique column

The reel's histogram step (`amount > 1000`) used a column with no MCVs worth separating out. For a skewed, non-unique column the real formula is a combination: the MCV entries that satisfy the condition are summed exactly (their frequency is known precisely), and the histogram — which the documentation is explicit does **not** include the portion of the population already counted in the MCVs — estimates the rest, then the two are added: `selectivity = mcv_selectivity + histogram_selectivity * histogram_fraction`. PostgreSQL's own worked example (`stringu1 < 'IAAAAA'`) gets `0.01833333 + 0.298387 * 0.96966667 = 0.307669`, for an estimate of 3,077 rows against an actual EXPLAIN output of exactly `rows=3077`.

### ALTER TABLE ... SET STATISTICS

`default_statistics_target` (100) sets the *global* ceiling on how many MCV entries and histogram buckets ANALYZE keeps per column. A single column that is unusually skewed, or unusually important to a slow query, can get its own larger (or smaller) target with `ALTER TABLE orders ALTER COLUMN status SET STATISTICS 500`, which only takes effect on the next `ANALYZE`. More buckets means a finer-grained histogram and a longer MCV list — better estimates for irregular distributions, at the cost of a larger `pg_statistic` row and a slightly slower `ANALYZE` and planning step.

### Why sampling, not a full scan

`ANALYZE` reads a random sample of the table's blocks rather than every row, which is why PostgreSQL's own documentation calls its statistics "always approximate even when freshly updated" — accuracy is traded for a cost that doesn't grow with the table's full size. The sample size scales with the statistics target, which is the other reason a higher target costs more to compute.

### eqjoinsel, the other case

The reel's join-error-compounding step quoted the no-MCV, unique-column case of `eqjoinsel` (`(1−null_frac1)(1−null_frac2)/max(num_rows1,num_rows2)`). When both sides of the join *do* have MCV lists, PostgreSQL instead directly compares the two MCV lists value by value, getting an exact match count for the common values and falling back to the same kind of uniform-remainder reasoning only for the rest — a more accurate, more expensive version of the same idea.

</section>

<section data-section="lab">

## Build, break, measure

### Try it · Reproduce every measured number

1. **Build the table.** Create a 2,000,000-row `orders` table with `status` (six values, `refunded` rare — about 1.6%), `amount` (a skewed numeric), and a `channel` column deliberately correlated with `status` (make `cancelled` orders disproportionately `channel='app'`). `ANALYZE` it.
2. **The healthy baseline.** `EXPLAIN SELECT * FROM orders WHERE amount > 1000` — confirm the estimate is within a percent or two of running `EXPLAIN ANALYZE` on the same query.
3. **Break independence.** `EXPLAIN SELECT * FROM orders WHERE status='cancelled' AND channel='app'` — confirm the estimate is noticeably below `EXPLAIN ANALYZE`'s actual count (this topic measured about 2.04×).
4. **Fix it.** `CREATE STATISTICS orders_stats (dependencies, mcv) ON status, channel FROM orders; ANALYZE orders;` then re-run the same `EXPLAIN` — confirm the gap closes to within a few percent.
5. **Break freshness.** Bulk-insert a large batch of rows all sharing one `status` value, *without* running `ANALYZE`. `EXPLAIN` a query on that status — confirm the estimate undershoots the real count (measure your own ratio; this topic saw about 1.6×). Run `ANALYZE` and confirm the gap closes.
6. **Measure the compounding.** With step 3's and step 5's misestimates both still live (don't fix either yet), construct a query whose plan would use both restrictions as inputs to the same join, and compare the planner's estimate for the join to `EXPLAIN ANALYZE`'s actual — confirm the combined error is close to the product of the two individual errors, not their average.

</section>

<section data-section="production">

## In production — a review checklist

- **Correlated `WHERE` columns are the single most common cause of a bad plan from a good query.** If two columns in the same `WHERE` clause (or the same `GROUP BY`) are known to move together, don't wait for a slow query — create extended statistics on them up front.
- **`CREATE STATISTICS` only helps simple equality (and `IN`) conditions on constants.** A range, a `LIKE`, an array-containment test or a column-to-column comparison gets no benefit from `dependencies` or `mcv` statistics — the documentation states this limitation directly.
- **Check `pg_stat_user_tables.last_analyze`/`last_autoanalyze` after any bulk load**, and run a manual `ANALYZE` rather than waiting for autovacuum's threshold-based trigger if a query that touches the new rows needs to run soon.
- **Don't create extended statistics speculatively on every column pair.** Each one costs `ANALYZE` time and catalog space; the documentation's own advice is to create them "only on combinations of columns that are actually used in conditions together, and for which misestimation ... is resulting in bad plans."
- **A join plan is only as good as its weakest input estimate.** When a query's actual run time is wildly worse than `EXPLAIN`'s cost suggested, check every restriction's estimated-vs-actual row count before assuming the join algorithm (topic 20) is at fault — the estimate feeding it may already be wrong.

</section>

<section data-section="frontier">

## The frontier

Every mechanism in this topic — histograms, MCV lists, the independence and uniformity assumptions, even extended statistics — is still a human-designed summary of the data, built from a sample, applied with a fixed formula. Learned cardinality estimators replace the formula with a model trained directly on the data (and sometimes the workload's own queries). Kipf et al.'s MSCN (CIDR 2019) is one well-known example: a multi-set convolutional network trained to predict a query's true cardinality from its structure, built specifically to address sampling-based estimation's weaknesses "when no sampled tuples qualify a predicate, and in capturing join-crossing correlations" — precisely the independence-assumption failure this topic measured. These systems are not (as of this topic's last verification) PostgreSQL's built-in estimator; they are an active research area, evaluated as drop-in or advisory replacements for the classical machinery described above.

</section>

<section data-section="next">

## Where this goes next

An estimate is a means, not an end: the planner's actual job is to compare the *cost* of different plans and pick the cheapest one, and cost formulas take row-count estimates as their input. Topic 20 picks up exactly here — the I/O and CPU cost formulas that turn this topic's row counts into a plan's price, and the join-order search (bottom-up dynamic programming vs. top-down transformation search) that explores enough of the plan space to find a cheap plan without exploring all of it.

</section>
