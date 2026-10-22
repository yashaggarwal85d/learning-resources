# Sources — Cardinality estimation and statistics (`de.cardinality-estimation-statistics`)

## PostgreSQL 18 Documentation, §14.2 "Statistics Used by the Planner"

URL: https://www.postgresql.org/docs/18/planner-stats.html
Version: PostgreSQL 18 (current stable, released September 2025)

> As we saw in the previous section, the query planner needs to estimate the number of rows retrieved by a query in order to make good choices of query plans.

> One component of the statistics is the total number of entries in each table and index, as well as the number of disk blocks occupied by each table and index. This information is kept in the table pg_class, in the columns reltuples and relpages.

> For efficiency reasons, reltuples and relpages are not updated on-the-fly, and so they usually contain somewhat out-of-date values. They are updated by VACUUM, ANALYZE, and a few DDL commands such as CREATE INDEX.

> Most queries retrieve only a fraction of the rows in a table, due to WHERE clauses that restrict the rows to be examined. The planner thus needs to make an estimate of the selectivity of WHERE clauses, that is, the fraction of rows that match each condition in the WHERE clause. The information used for this task is stored in the pg_statistic system catalog. Entries in pg_statistic are updated by the ANALYZE and VACUUM ANALYZE commands, and are always approximate even when freshly updated.

> The amount of information stored in pg_statistic by ANALYZE, in particular the maximum number of entries in the most_common_vals and histogram_bounds arrays for each column, can be set on a column-by-column basis using the ALTER TABLE SET STATISTICS command, or globally by setting the default_statistics_target configuration variable. The default limit is presently 100 entries.

> It is common to see slow queries running bad execution plans because multiple columns used in the query clauses are correlated. The planner normally assumes that multiple conditions are independent of each other, an assumption that does not hold when column values are correlated. Regular statistics, because of their per-individual-column nature, cannot capture any knowledge about cross-column correlation. However, PostgreSQL has the ability to compute multivariate statistics, which can capture such information.

> Statistics objects are created using the CREATE STATISTICS command. Creation of such an object merely creates a catalog entry expressing interest in the statistics. Actual data collection is performed by ANALYZE (either a manual command, or background auto-analyze).

> The simplest kind of extended statistics tracks functional dependencies, a concept used in definitions of database normal forms. We say that column b is functionally dependent on column a if knowledge of the value of a is sufficient to determine the value of b, that is there are no two rows having the same value of a but different values of b.

> The existence of functional dependencies directly affects the accuracy of estimates in certain queries. If a query contains conditions on both the independent and the dependent column(s), the conditions on the dependent columns do not further reduce the result size; but without knowledge of the functional dependency, the query planner will assume that the conditions are independent, resulting in underestimating the result size.

> Functional dependencies are currently only applied when considering simple equality conditions that compare columns to constant values, and IN clauses with constant values. They are not used to improve estimates for equality conditions comparing two columns or comparing a column to an expression, nor for range clauses, LIKE or any other type of condition.

> Single-column statistics store the number of distinct values in each column. Estimates of the number of distinct values when combining more than one column (for example, for GROUP BY a, b) are frequently wrong when the planner only has single-column statistical data, causing it to select bad plans.

> Another type of statistic stored for each column are most-common value lists. This allows very accurate estimates for individual columns, but may result in significant misestimates for queries with conditions on multiple columns.

Contents: 14.2.1 single-column stats (pg_class reltuples/relpages, pg_statistic/pg_stats, default_statistics_target = 100); 14.2.2 extended statistics (why correlation breaks the independence assumption; CREATE STATISTICS catalogs an object, ANALYZE fills it); 14.2.2.1 functional dependencies (definition, scope limited to simple equality/IN, underestimation when ignored); 14.2.2.2 multivariate n-distinct; 14.2.2.3 multivariate MCV lists.

## PostgreSQL 18 Documentation, §69.1 "Row Estimation Examples"

URL: https://www.postgresql.org/docs/18/row-estimation-examples.html
Version: PostgreSQL 18

> The planner examines the WHERE clause condition and looks up the selectivity function for the operator < in pg_operator. This is held in the column oprrest, and the entry in this case is scalarltsel. The scalarltsel function retrieves the histogram for unique1 from pg_statistic.

> Next the fraction of the histogram occupied by "< 1000" is worked out. This is the selectivity. The histogram divides the range into equal frequency buckets, so all we have to do is locate the bucket that our value is in and count part of it and all of the ones before. The value 1000 is clearly in the second bucket (993–1997). Assuming a linear distribution of values inside each bucket, we can calculate the selectivity as:

> selectivity = (1 + (1000 - bucket[2].min)/(bucket[2].max - bucket[2].min))/num_buckets
> = (1 + (1000 - 993)/(1997 - 993))/10
> = 0.100697

> Again the planner examines the WHERE clause condition and looks up the selectivity function for =, which is eqsel. For equality estimation the histogram is not useful; instead the list of most common values (MCVs) is used to determine the selectivity.

> Since CRAAAA appears in the list of MCVs, the selectivity is merely the corresponding entry in the list of most common frequencies (MCFs):

> selectivity = mcf[3]
> = 0.003

> This is quite a different problem: how to estimate the selectivity when the value is not in the MCV list. The approach is to use the fact that the value is not in the list, combined with the knowledge of the frequencies for all of the MCVs:

> selectivity = (1 - sum(mcv_freqs))/(num_distinct - num_mcv)

> That is, add up all the frequencies for the MCVs and subtract them from one, then divide by the number of other distinct values. This amounts to assuming that the fraction of the column that is not any of the MCVs is evenly distributed among all the other distinct values.

> For a non-unique column, there will normally be both a histogram and an MCV list, and the histogram does not include the portion of the column population represented by the MCVs. We do things this way because it allows more precise estimation.

> selectivity = mcv_selectivity + histogram_selectivity * histogram_fraction

> The planner assumes that the two conditions are independent, so that the individual selectivities of the clauses can be multiplied together:

> selectivity = selectivity(unique1 < 1000) * selectivity(stringu1 = 'xxx')

> The restriction for the join is t2.unique2 = t1.unique2. The operator is just our familiar =, however the selectivity function is obtained from the oprjoin column of pg_operator, and is eqjoinsel.

> In this case there is no MCV information for unique2 and all the values appear to be unique (n_distinct = -1), so we use an algorithm that relies on the row count estimates for both relations (num_rows, not shown, but "tenk") together with the column null fractions (zero for both):

> selectivity = (1 - null_frac1) * (1 - null_frac2) / max(num_rows1, num_rows2)

> Had there been MCV lists for the two columns, eqjoinsel would have used direct comparison of the MCV lists to determine the join selectivity within the part of the column populations represented by the MCVs.

> If everything is working well then the two ways of estimating the join size will produce about the same answer, but due to round-off error and other factors they sometimes diverge significantly.

Contents: range selectivity via equal-frequency histogram interpolation (scalarltsel); equality selectivity via MCV lookup (eqsel, in-list case); equality selectivity for a value absent from the MCV list (uniform-remainder assumption); combining MCV and histogram portions of a column's population; the independence assumption multiplying clause selectivities for AND; join selectivity (eqjoinsel) for the no-MCV/unique case and the MCV-comparison case; the planner's own caveat that its two ways of estimating a join's size can diverge.

## PostgreSQL 18 Documentation, CREATE STATISTICS

URL: https://www.postgresql.org/docs/18/sql-createstatistics.html
Version: PostgreSQL 18

> CREATE STATISTICS will create a new extended statistics object tracking data about the specified table, foreign table or materialized view.

> A multivariate statistics kind to be computed in this statistics object. Currently supported kinds are ndistinct, which enables n-distinct statistics, dependencies, which enables functional dependency statistics, and mcv which enables most-common values lists.

Contents: CREATE STATISTICS syntax and purpose; the three supported kinds (dependencies, ndistinct, mcv) and when each is appropriate.

## PostgreSQL 18 Documentation, §53.29 "pg_stats"

URL: https://www.postgresql.org/docs/18/view-pg-stats.html
Version: PostgreSQL 18

> If greater than zero, the estimated number of distinct values in the column. If less than zero, the negative of the number of distinct values divided by the number of rows. (The negated form is used when ANALYZE believes that the number of distinct values is likely to increase as the table grows; the positive form is used when the column seems to have a fixed number of possible values.) For example, -1 indicates a unique column in which the number of distinct values is the same as the number of rows.

Contents: n_distinct's sign convention (absolute count vs. fraction-of-rows) and why ANALYZE picks one or the other; most_common_vals/most_common_freqs; histogram_bounds as the equal-frequency bucket boundaries.

## arXiv:1809.00677 — Kipf, Kipf, Radke, Leis, Renz, Kemper, "Learned Cardinalities: Estimating Correlated Joins with Deep Learning" (CIDR 2019)

URL: https://arxiv.org/abs/1809.00677
Version: v2 (as retrieved)

> We describe a new deep learning approach to cardinality estimation. MSCN is a multi-set convolutional network, tailored to representing relational query plans, that employs set semantics to capture query features and true cardinalities. MSCN builds on sampling-based estimation, addressing its weaknesses when no sampled tuples qualify a predicate, and in capturing join-crossing correlations.

Contents: a trained model (not fixed histograms/MCVs/independence) estimating cardinalities directly from query structure and sample data, specifically targeting the correlated-column and join-crossing-correlation weaknesses this topic's independence assumption exposes. Frontier only; out of scope for mechanism depth.

## Measured directly (this topic's own Postgres 16 instance, reel's "Build, break, measure")

URL: n/a — executed locally, not a web source
Version: PostgreSQL 16.15 (the CI/sandbox build available to this session; the chapter's engine of record is PostgreSQL 18, and every quoted behaviour above is unchanged in PostgreSQL 16-18 for the mechanisms this topic covers — the histogram/MCV/independence/extended-statistics machinery described in §14.2 and §69.1 is the same algorithm across these releases)

Notes (not quotes — these are this topic's own executed measurements, recorded here so the coverage map can point at them): a 2,000,000-row `orders` table built to the chapter's shop schema (status, amount, tags, channel) reproduces every number the reel and examples.py use. See `examples.py` for the exact SQL and the asserted rows.

Contents: real histogram-based range estimate (amount > 1000: estimated 994,519 rows, actual 1,003,918 — about 1% off, independence and freshness both hold); real MCV-based equality estimate for a skewed status column; real independence-assumption failure on two correlated plain columns (status='cancelled' AND channel='app': estimated 138,866, actual 282,940 — about 2.0× under); the same query after `CREATE STATISTICS ... (dependencies, mcv)` and a re-`ANALYZE` (estimated 284,969, actual 282,940 — about 0.7% off); stale statistics after a 400,000-row bulk load changing the status mix without a re-`ANALYZE` (status='pending': estimated 497,040, actual 793,095 — about 1.6× under) and the same query corrected by `ANALYZE` (estimated 796,240, actual 793,095 — about 0.4% off).
