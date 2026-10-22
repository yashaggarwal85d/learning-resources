"""Executed truth for the join-algorithms reel (run by `npm run test:examples`).

Every number below is this topic's own measurement on a real PostgreSQL 16 instance (`join_demo` schema,
`customers` 100,000 rows + `orders2` 2,000,000 rows, `customer_id` indexed on `orders2`) — see SOURCES.md,
"Measured directly". There is no formula to re-derive here (unlike topic 20's cost-formula arithmetic); this
file asserts the measured numbers are internally consistent (ratios, rounding) and fixes them as named
constants so reel.tsx and narration never drift from what was actually measured.
"""

# -- Highly selective filtered join: one customer, a handful of their orders out of 2,000,000 ------------------
FILTERED_NESTED_LOOP_MS = 9.681  # default planner's own choice
FILTERED_HASH_JOIN_MS = 141.187  # enable_nestloop=off, enable_mergejoin=off (forced)

filtered_slowdown = FILTERED_HASH_JOIN_MS / FILTERED_NESTED_LOOP_MS
assert 14 < filtered_slowdown < 15, filtered_slowdown  # "about 14.6x" in the reel
FILTERED_SLOWDOWN_DISPLAY = round(filtered_slowdown, 1)
assert FILTERED_SLOWDOWN_DISPLAY == 14.6

# -- Full, unfiltered join: every row of orders2 matched against customers ---------------------------------------
FULL_HASH_JOIN_MS_RUN1 = 339.6  # default planner, first measurement
FULL_HASH_JOIN_MS_RUN2 = 383.6  # default planner, second measurement
FULL_NESTED_LOOP_MS = 431.269  # enable_hashjoin=off, enable_mergejoin=off (forced)
FULL_MERGE_JOIN_MS = 543.876  # enable_hashjoin=off, enable_nestloop=off (forced)

# Both forced alternatives are slower than either default hash-join measurement.
assert FULL_NESTED_LOOP_MS > FULL_HASH_JOIN_MS_RUN2 > FULL_HASH_JOIN_MS_RUN1
assert FULL_MERGE_JOIN_MS > FULL_NESTED_LOOP_MS  # merge join measured as the most expensive, reported as is

# -- work_mem spill: same full join, forced to Hash Join, work_mem dropped from the 4MB default to 64kB ----------
SPILL_DEFAULT_WORK_MEM_MS = 383.577  # 1 batch (default work_mem, 4MB)
SPILL_REDUCED_WORK_MEM_MS = 413.237  # 64 batches (work_mem = 64kB)
BATCHES_DEFAULT = 1
BATCHES_REDUCED = 64
assert BATCHES_REDUCED / BATCHES_DEFAULT == 64  # clean power-of-two growth

spill_slowdown = (SPILL_REDUCED_WORK_MEM_MS - SPILL_DEFAULT_WORK_MEM_MS) / SPILL_DEFAULT_WORK_MEM_MS
assert 0.07 < spill_slowdown < 0.08, spill_slowdown  # "about 7.7%" in the reel
SPILL_SLOWDOWN_PERCENT_DISPLAY = round(spill_slowdown * 100, 1)
assert SPILL_SLOWDOWN_PERCENT_DISPLAY == 7.7

# -- Inequality predicate: nested loop measured unsuppressible even with enable_nestloop=off ----------------------
# No timing claim here (the point is which plan type the planner picks, not its speed) — see SOURCES.md and
# FACT-CHECK.md for how this was confirmed directly against a live EXPLAIN plan rather than assumed from the docs.
INEQUALITY_FORCED_PLAN_COST_ORDER = 1e10  # order of magnitude the alternative (disallowed) paths were priced at

# -- On-screen display numbers (reel.tsx's rounded captions and figures) ------------------------------------------
TABLE_CUSTOMERS_ROWS = 100_000
TABLE_ORDERS2_ROWS = 2_000_000
assert TABLE_ORDERS2_ROWS // TABLE_CUSTOMERS_ROWS == 20  # "20 orders per customer on average" framing, if used

WORK_MEM_DEFAULT_KB = 4 * 1024  # 4MB, in kB, matching how PostgreSQL itself reports/accepts the setting
WORK_MEM_REDUCED_KB = 64
assert WORK_MEM_DEFAULT_KB // WORK_MEM_REDUCED_KB == 64  # same 64x the batch count grew by

TWO_SORTED_INPUTS = 2  # merge join needs both inputs sorted on the join key
assert TWO_SORTED_INPUTS == 2

# A hypothetical "Prove it" batch count, distinct from this topic's own 64-batch measurement above, used only to
# check recognition of what a batch count greater than 1 means.
QUIZ_BATCH_COUNT = 12
assert QUIZ_BATCH_COUNT > BATCHES_DEFAULT

print("join-algorithms-nested-loop examples: all numbers check out")
