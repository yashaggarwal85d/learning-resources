"""Executed truth for the cost-models-and-join-order-search reel (run by `npm run test:examples`).

Implements PostgreSQL's own documented Seq Scan cost formula (PostgreSQL 18 docs §14.1, quoted verbatim in
SOURCES.md) and checks it against a real measurement (topic 19's `orders` table). Verifies the join-order-tree
count's closed form by brute-force enumeration before trusting it for larger n. The join_collapse_limit and
geqo_threshold numbers are this topic's own measurements on a real PostgreSQL 16 instance (`cost_demo` schema,
see SOURCES.md, "Measured directly") — fixed, already-observed numbers, not something that varies at test time.
"""

from itertools import combinations
from functools import lru_cache
import math

# -- Seq Scan cost formula (PostgreSQL docs §14.1): (disk pages * seq_page_cost) + (rows scanned * cpu_tuple_cost) -
SEQ_PAGE_COST = 1.0
CPU_TUPLE_COST = 0.01


def seq_scan_cost(pages, rows, seq_page_cost=SEQ_PAGE_COST, cpu_tuple_cost=CPU_TUPLE_COST):
    return pages * seq_page_cost + rows * cpu_tuple_cost


# The documentation's own worked example (tenk1: 345 pages, 10000 rows -> cost 445).
assert seq_scan_cost(345, 10000) == 445.0

# This topic's own measurement: topic 19's `orders` table, 2,400,000 rows after its bulk load.
ORDERS_PAGES = 46_484
ORDERS_ROWS = 2_400_000
ORDERS_SEQ_SCAN_COST = seq_scan_cost(ORDERS_PAGES, ORDERS_ROWS)
assert ORDERS_SEQ_SCAN_COST == 70484.0, ORDERS_SEQ_SCAN_COST
# EXPLAIN SELECT * FROM orders; -> "Seq Scan on orders  (cost=0.00..70484.00 rows=2400000 width=48)" -- exact match.

# -- Default planner cost constants (PostgreSQL docs §19.7.2) -------------------------------------------------------
RANDOM_PAGE_COST = 4.0
CPU_INDEX_TUPLE_COST = 0.005
CPU_OPERATOR_COST = 0.0025
assert RANDOM_PAGE_COST == 4.0 * SEQ_PAGE_COST  # "4x" is the documented default ratio, not an invented one

# -- Join-order tree count: verified by brute-force enumeration before trusting the closed form ---------------------
def join_trees_bruteforce(n):
    """Every way to fully join n labeled relations, where left and right side of a join are distinct (a join's
    build/probe side matters for later topics' algorithms, so sidedness is counted)."""

    @lru_cache(maxsize=None)
    def trees(s):
        if len(s) == 1:
            return 1
        total = 0
        for r in range(1, len(s)):
            for left in combinations(s, r):
                left_set = frozenset(left)
                right_set = frozenset(s) - left_set
                total += trees(tuple(sorted(left_set))) * trees(tuple(sorted(right_set)))
        return total

    return trees(tuple(range(n)))


def join_trees_formula(n):
    return math.factorial(2 * n - 2) // math.factorial(n - 1)


for n in range(2, 7):
    bf = join_trees_bruteforce(n)
    formula = join_trees_formula(n)
    assert bf == formula, (n, bf, formula)

# Only once the formula agrees with brute force for every small n above is it used for the larger counts on screen.
JOIN_TREES_8 = join_trees_formula(8)
JOIN_TREES_10 = join_trees_formula(10)
JOIN_TREES_12 = join_trees_formula(12)
JOIN_TREES_14 = join_trees_formula(14)
JOIN_TREES_16 = join_trees_formula(16)
assert JOIN_TREES_8 == 17_297_280
assert JOIN_TREES_10 == 17_643_225_600
assert JOIN_TREES_12 == 28_158_588_057_600
assert JOIN_TREES_14 == 64_764_752_532_480_000
assert JOIN_TREES_16 == 202_843_204_931_727_360_000

# -- join_collapse_limit: measured on cost_demo, same 9-table query, same data, only the limit (and literal written
#    order) changed. See SOURCES.md, "Measured directly". -----------------------------------------------------------
COLLAPSE_LIMIT_1_BAD_ORDER_COST = 23_837.70  # join_collapse_limit=1, literal order j9..j1 (filter j1.flag applied last)
COLLAPSE_LIMIT_20_COST = 1_697.40  # join_collapse_limit=20, same literal order, planner free to reorder
COLLAPSE_LIMIT_8_GOOD_ORDER_COST = 1_700.90  # join_collapse_limit=8 (default), literal order j1..j9 (already good)
collapse_ratio = COLLAPSE_LIMIT_1_BAD_ORDER_COST / COLLAPSE_LIMIT_20_COST
assert 13.5 < collapse_ratio < 14.5, collapse_ratio  # "~14x" in the reel
assert round(collapse_ratio, 1) == 14.0

# -- geqo_threshold: measured planning-time curve and cost comparison, same source. ---------------------------------
PLANNING_TIME_MS = {8: 36, 10: 224, 12: 1740, 13: 5141, 14: 36147}
EXHAUSTIVE_COST = {8: 1687.56, 10: 1714.24, 12: 1740.93, 13: 1754.27, 14: 1767.61}
GEQO_TIME_MS = {12: 132, 13: 125}
GEQO_COST = {12: 1740.92, 13: 1754.26}

# GEQO's plan cost here matches exhaustive search almost exactly (the two measurements round to one decimal apart,
# consistent with being read off independent EXPLAIN runs of the same query, not independently verified identical
# internal floats).
assert abs(GEQO_COST[12] - EXHAUSTIVE_COST[12]) < 0.1
assert abs(GEQO_COST[13] - EXHAUSTIVE_COST[13]) < 0.1

geqo_speedup_12 = PLANNING_TIME_MS[12] / GEQO_TIME_MS[12]
geqo_speedup_13 = PLANNING_TIME_MS[13] / GEQO_TIME_MS[13]
assert 12 < geqo_speedup_12 < 14, geqo_speedup_12  # "~13x" in the reel
assert 40 < geqo_speedup_13 < 42, geqo_speedup_13  # "~41x" in the reel

# The planning-time curve itself grows far faster than linearly: 8->14 FROM items is a ~1000x increase in time
# for less than a doubling of table count, consistent with the documented "grows exponentially" claim.
time_growth_ratio = PLANNING_TIME_MS[14] / PLANNING_TIME_MS[8]
assert 950 < time_growth_ratio < 1050, time_growth_ratio

# -- "Interesting orders": a scan whose own output order matches ORDER BY avoids an explicit Sort node. Measured on
#    orders (topic 19's table), SELECT order_id, amount FROM orders WHERE order_id < 1000 ORDER BY order_id. --------
NO_INDEX_COST = 60_084.45  # Gather Merge -> Sort -> Parallel Seq Scan
INDEXED_COST = 53.19  # Index Scan alone, no Sort node
interesting_order_ratio = NO_INDEX_COST / INDEXED_COST
assert 1100 < interesting_order_ratio < 1150, interesting_order_ratio  # same query, same table, >1000x from the Sort alone

# -- On-screen display numbers (reel.tsx's rounded captions, options and figures) -----------------------------------
COLLAPSE_DEMO_TABLE_ROWS = 100_000  # each of j1..j9's row count in the collapse-limit demo
COLLAPSE_DEMO_FILTERED_ROWS = 50  # rows of j1 matching flag=true (1 in 2,000 of 100,000)
assert COLLAPSE_DEMO_TABLE_ROWS // 2_000 == COLLAPSE_DEMO_FILTERED_ROWS

JOIN_TREES_8_DISPLAY = round(JOIN_TREES_8 / 1e6, 1)
assert JOIN_TREES_8_DISPLAY == 17.3  # "17.3 million" in the reel's TreeCounts scene
JOIN_TREES_12_DISPLAY = round(JOIN_TREES_12 / 1e12, 1)
assert JOIN_TREES_12_DISPLAY == 28.2  # "28.2 trillion" in the reel
JOIN_TREES_14_DISPLAY = round(JOIN_TREES_14 / 1e15, 1)
assert JOIN_TREES_14_DISPLAY == 64.8  # "64.8 quadrillion" in the reel

GEQO_PREDICT_LOW_N = 11  # below geqo_threshold, exhaustive search still runs automatically
assert GEQO_PREDICT_LOW_N < 12

EXHAUSTIVE_TIME_S_12 = round(PLANNING_TIME_MS[12] / 1000, 2)
assert EXHAUSTIVE_TIME_S_12 == 1.74  # "1.74 s at 12" in the reel
EXHAUSTIVE_TIME_S_14 = round(PLANNING_TIME_MS[14] / 1000, 1)
assert EXHAUSTIVE_TIME_S_14 == 36.1  # "36.1 s at 14" in the reel, and the fig's "36.1s"
GEQO_TIME_DISPLAY_APPROX = 130  # "~130ms" in the fig, rounding GEQO_TIME_MS[12]=132 and [13]=125 to one headline figure
assert abs(GEQO_TIME_DISPLAY_APPROX - GEQO_TIME_MS[12]) <= 5
assert abs(GEQO_TIME_DISPLAY_APPROX - GEQO_TIME_MS[13]) <= 5

# "Prove it" step 1: a second worked example of the Seq Scan formula, different numbers from the reveal.
PROVE_PAGES = 2_000
PROVE_ROWS = 50_000
PROVE_COST = seq_scan_cost(PROVE_PAGES, PROVE_ROWS)
assert PROVE_COST == 2_500.0

print("cost-models-join-order examples: all numbers check out")
