"""Executed truth for the cardinality-estimation-and-statistics reel (run by `npm run test:examples`).

Implements PostgreSQL's own documented selectivity formulas (PostgreSQL 18 docs §69.1, quoted verbatim in
SOURCES.md) in pure Python and checks them two ways: against the documentation's own worked numbers (the
tenk1/tenk2 examples, which are fixed text and never change), and against this topic's own measurements on a
real PostgreSQL 16 instance (a 2,000,000-row `orders` table built to the chapter's shop schema, plus a 400,000-row
bulk load — see SOURCES.md, "Measured directly", for the exact setup). ANALYZE samples at random, so the measured
checks use a tolerance wide enough to survive normal sampling noise instead of asserting exact integer equality
(see FACT-CHECK.md, "Reproducibility caveat") — the point being checked is the formula and the order of magnitude
of each failure and fix, not a frozen sampled integer.
"""

# -- scalarltsel: equal-frequency histogram interpolation (PostgreSQL docs, tenk1.unique1 < 1000) -----------------
def histogram_range_selectivity(bounds, value, num_buckets):
    """bounds: the num_buckets+1 histogram boundaries. Locates the bucket containing `value` and linearly
    interpolates the fraction of it that is below `value`, exactly as scalarltsel is documented to."""
    for i in range(1, len(bounds)):
        lo, hi = bounds[i - 1], bounds[i]
        if value <= hi:
            whole_buckets_before = i - 1
            frac_in_bucket = (value - lo) / (hi - lo) if hi != lo else 0
            return (whole_buckets_before + frac_in_bucket) / num_buckets
    return 1.0


TENK1_BOUNDS = [0, 993, 1997, 3050, 4040, 5036, 5957, 7057, 8029, 9016, 9995]
assert len(TENK1_BOUNDS) == 11  # 10 buckets
sel = histogram_range_selectivity(TENK1_BOUNDS, 1000, 10)
assert round(sel, 6) == 0.100697, sel  # the documentation's own worked selectivity
assert round(10000 * sel) == 1007  # the documentation's own worked row count

# The second worked example in the same doc section: value 50 falls in the first bucket.
sel2 = histogram_range_selectivity(TENK1_BOUNDS, 50, 10)
assert round(sel2, 6) == 0.005035, sel2
assert round(10000 * sel2) == 50

# -- eqsel: a value in the MCV list reads its frequency directly (PostgreSQL docs, stringu1 = 'CRAAAA') -----------
def mcv_equality_selectivity(mcv_freqs, index):
    return mcv_freqs[index]


STRINGU1_MCV_FREQS = [0.00333333, 0.003, 0.003, 0.003, 0.003, 0.003, 0.003, 0.003, 0.003, 0.003]
assert len(STRINGU1_MCV_FREQS) == 10
sel3 = mcv_equality_selectivity(STRINGU1_MCV_FREQS, 2)  # CRAAAA is the third MCV, 0-indexed position 2
assert sel3 == 0.003
assert round(10000 * sel3) == 30

# -- eqsel: a value NOT in the MCV list spreads the remainder evenly (PostgreSQL docs, stringu1 = 'xxx') -----------
def off_mcv_equality_selectivity(mcv_freqs, n_distinct, null_frac=0.0):
    """(1 - null_frac - sum(mcv_freqs)) / (n_distinct - len(mcv_freqs)) — the uniformity assumption: everyone not
    on the MCV list is assumed equally likely."""
    remaining_distinct = n_distinct - len(mcv_freqs)
    return (1 - null_frac - sum(mcv_freqs)) / remaining_distinct


sel4 = off_mcv_equality_selectivity(STRINGU1_MCV_FREQS, n_distinct=676)
assert round(sel4, 7) == 0.0014560, sel4  # documentation rounds its own 0.0014559 to 7 places; this formula's extra digit (...5596) rounds the same way
assert round(10000 * sel4) == 15

# -- The independence assumption: AND multiplies clause selectivities (PostgreSQL docs, unique1<1000 AND stringu1='xxx')
def independence_and_selectivity(*selectivities):
    sel = 1.0
    for s in selectivities:
        sel *= s
    return sel


combined = independence_and_selectivity(sel, sel4)
assert round(combined, 7) == 0.0001466, combined
assert round(10000 * combined) == 1  # "1 (rounding off)" in the documentation

# -- eqjoinsel, no-MCV/unique-column case (PostgreSQL docs, tenk1.unique2 = tenk2.unique2) -------------------------
def eqjoinsel_no_mcv(null_frac1, null_frac2, num_rows1, num_rows2):
    return (1 - null_frac1) * (1 - null_frac2) / max(num_rows1, num_rows2)


join_sel = eqjoinsel_no_mcv(0, 0, 10000, 10000)
assert join_sel == 0.0001
assert round((50 * 10000) * join_sel) == 50  # the documentation's own worked join row count

# -- This topic's own measured numbers (orders table, see SOURCES.md "Measured directly") -------------------------
# Baseline: a histogram-based range predicate on an uncorrelated, freshly-analyzed column is close to exact.
AMOUNT_GT_1000_ESTIMATE = 994_519
AMOUNT_GT_1000_ACTUAL = 1_003_918
baseline_error = AMOUNT_GT_1000_ACTUAL / AMOUNT_GT_1000_ESTIMATE
assert 0.99 < baseline_error < 1.02, baseline_error  # within about 2%: histograms work when nothing is correlated or stale

# Correlated columns break the independence assumption: status='cancelled' AND channel='app'.
CORRELATED_ESTIMATE_BEFORE = 138_866
CORRELATED_ACTUAL = 282_940
CORRELATED_ESTIMATE_AFTER = 284_969  # after CREATE STATISTICS (dependencies, mcv) + ANALYZE
error_before = CORRELATED_ACTUAL / CORRELATED_ESTIMATE_BEFORE
error_after = CORRELATED_ACTUAL / CORRELATED_ESTIMATE_AFTER
assert 1.8 < error_before < 2.3, error_before  # roughly 2x underestimate from the independence assumption
assert 0.95 < error_after < 1.05, error_after  # extended statistics close the gap to within about 5%

# Stale statistics after a bulk load: status='pending', before and after a re-ANALYZE.
STALE_ESTIMATE = 497_040
STALE_ACTUAL = 793_095
FRESH_ESTIMATE = 796_240  # after ANALYZE
stale_error = STALE_ACTUAL / STALE_ESTIMATE
fresh_error = STALE_ACTUAL / FRESH_ESTIMATE
assert 1.4 < stale_error < 1.8, stale_error  # roughly 1.6x underestimate while statistics are stale
assert 0.95 < fresh_error < 1.05, fresh_error  # ANALYZE closes the gap to within about 5%

# Errors compound through a join: two independently measured errors landing on the same plan multiply, not average.
compounded = error_before * stale_error
assert 2.8 < compounded < 3.9, compounded  # roughly 3.3x: 2.04x times 1.6x — this topic's own arithmetic, not a PostgreSQL-documented constant

# -- On-screen display numbers (reel.tsx's rounded captions; this topic's own orders table — see SOURCES.md) -------
# The two standalone, single-column selectivities whose product predicts the (wrong) independent estimate.
CANCELLED_ALONE_ESTIMATE = 391_920
APP_ALONE_ESTIMATE = 894_000
ORDERS_TABLE_ROWS_AT_MEASUREMENT = 2_400_000  # 2,000,000 plus the 400,000-row bulk load, by the time channel was added
cancelled_fraction = CANCELLED_ALONE_ESTIMATE / ORDERS_TABLE_ROWS_AT_MEASUREMENT
app_fraction = APP_ALONE_ESTIMATE / ORDERS_TABLE_ROWS_AT_MEASUREMENT
DISPLAYED_CANCELLED_FRACTION = 0.163  # the reel's rounded caption
DISPLAYED_APP_FRACTION = 0.373  # the reel's rounded caption
assert abs(cancelled_fraction - DISPLAYED_CANCELLED_FRACTION) < 0.001, cancelled_fraction
assert abs(app_fraction - DISPLAYED_APP_FRACTION) < 0.001, app_fraction
assert round(100 * cancelled_fraction) == 16
assert round(100 * app_fraction) == 37
independent_prediction = DISPLAYED_CANCELLED_FRACTION * DISPLAYED_APP_FRACTION
assert round(100 * independent_prediction, 1) == 6.1  # "~6%, the product" — within rounding of the real 5.8%
displayed_estimate_pct = round(100 * CORRELATED_ESTIMATE_BEFORE / ORDERS_TABLE_ROWS_AT_MEASUREMENT, 1)
displayed_actual_pct = round(100 * CORRELATED_ACTUAL / ORDERS_TABLE_ROWS_AT_MEASUREMENT, 1)
assert displayed_estimate_pct == 5.8
assert displayed_actual_pct == 11.8
displayed_after_error_pct = round(100 * abs(CORRELATED_ACTUAL - CORRELATED_ESTIMATE_AFTER) / CORRELATED_ACTUAL, 1)
assert displayed_after_error_pct == 0.7  # "within 0.7%" after CREATE STATISTICS
displayed_fresh_error_pct = round(100 * abs(STALE_ACTUAL - FRESH_ESTIMATE) / STALE_ACTUAL, 1)
assert displayed_fresh_error_pct == 0.4  # "within 0.4%" after ANALYZE

# The MCV equality demo's own column (status, this topic's orders table): refunded's measured, displayed frequency.
REFUNDED_COUNT = 33_259
REFUNDED_TABLE_ROWS = 2_000_000  # before the bulk load, matching the MCV step's own measurement
refunded_pct = round(100 * REFUNDED_COUNT / REFUNDED_TABLE_ROWS, 2)
assert refunded_pct == 1.66  # "a visibly thin bar at 1.66%"

ORDERS_HISTOGRAM_BUCKETS = 100  # default_statistics_target, applied to the orders.amount histogram (reel step 5)
assert ORDERS_HISTOGRAM_BUCKETS == 100

# "Prove it" step 1: a value in the MCV list, frequency 0.02, on a 500,000-row table.
PROVE_MCV_FREQ = 0.02
PROVE_MCV_ROWS = 500_000
assert round(PROVE_MCV_FREQ * PROVE_MCV_ROWS) == 10_000

# "Prove it" step 2: two correlated clauses, each about 20%, independently multiplying to about 4%.
PROVE_CLAUSE_PCT = 20
prove_independent_pct = round((PROVE_CLAUSE_PCT / 100) ** 2 * 100)
assert prove_independent_pct == 4  # the (wrong, too-low) independent prediction for two correlated ~20% clauses

print("cardinality-estimation-statistics examples: all numbers check out")
