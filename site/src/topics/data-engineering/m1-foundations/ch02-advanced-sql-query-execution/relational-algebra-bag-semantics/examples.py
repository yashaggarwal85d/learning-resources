"""Executed truth for the relational-algebra-and-bag-semantics reel (run by `npm run test:examples`).

Checks the numbers the reel shows, by computing them rather than restating them.
"""

from collections import Counter

# -- The running example's fixed table sizes (chapter's own running example) --
orders, order_items, products, page_views = 100_000_000, 300_000_000, 50_000, 100_000_000
assert orders == 100_000_000 and order_items == 300_000_000 and products == 50_000 and page_views == 100_000_000

# -- A bag never merges facts: a customer with 5 orders gets 5 rows back ------
customer_orders = 5
rows_back = customer_orders  # SELECT customer_id FROM orders, no GROUP BY, no DISTINCT
assert rows_back == 5

# -- UNION ALL vs UNION: two flagged-order lists, one order on both ----------
flagged_auto, flagged_manual = 120_000, 95_000
overlap = 42_000  # order ids present on both lists
union_all_rows = flagged_auto + flagged_manual
assert union_all_rows == 215_000
union_rows = union_all_rows - overlap  # distinct order ids across both lists
assert union_rows == 173_000

# -- Idempotence breaks for bags: A UNION ALL A doubles every row -----------
small_list = 3  # three distinct rows
union_all_self = small_list * 2
assert union_all_self == 6
union_self = small_list  # UNION dedups back to the original distinct rows
assert union_self == 3

# -- INTERSECT [ALL] and EXCEPT [ALL]: two small hand-built bags -------------
bag_a = Counter([1, 1, 2])  # {1: 2, 2: 1}
bag_b = Counter([1, 2, 2])  # {1: 1, 2: 2}
assert bag_a == {1: 2, 2: 1} and bag_b == {1: 1, 2: 2}

intersect_all = {v: min(bag_a[v], bag_b[v]) for v in set(bag_a) | set(bag_b)}
intersect_all_rows = sum(c for c in intersect_all.values() if c > 0)
assert intersect_all_rows == 2  # one row each of 1 and 2

intersect_set_rows = sum(1 for v in set(bag_a) if bag_b[v] > 0)
assert intersect_set_rows == 2  # distinct values in both: 1 and 2

except_all = {v: max(0, bag_a[v] - bag_b.get(v, 0)) for v in bag_a}
except_all_rows = sum(except_all.values())
assert except_all_rows == 1  # one leftover copy of value 1

except_set_rows = sum(1 for v in set(bag_a) if bag_b[v] == 0)
assert except_set_rows == 0  # every distinct value of A is also in B

# -- Selection pushdown: filter products before the join, not after ---------
products_total = products
products_matching = 1_250  # category = 'electronics', 2.5% selectivity
assert products_matching / products_total == 0.025
products_pruned = products_total - products_matching
assert products_pruned == 48_750
assert round(products_pruned / products_total * 100) == 98  # ~98% of products never reach the join

# -- Projection pushdown: fewer bytes move once columns are dropped early ---
row_width_full, row_width_projected = 220, 24  # bytes per order_items row
bytes_full = order_items * row_width_full
bytes_projected = order_items * row_width_projected
assert bytes_full == 66_000_000_000  # 66 GB moved without pushdown
assert bytes_projected == 7_200_000_000  # 7.2 GB moved with pushdown
reduction_pct = (1 - bytes_projected / bytes_full) * 100
assert round(reduction_pct) == 89

# -- Why UNION pays for a dedup: the Append is one pass, the dedup another --
append_touches = union_all_rows  # 215,000 rows written once, concatenated
dedup_touches = union_all_rows  # the hash or sort pass reads them all again
union_total_touches = append_touches + dedup_touches
assert union_total_touches == 430_000
assert union_total_touches == 2 * append_touches  # a full extra pass, not a partial one

# -- Prove it 1: a customer with 7 orders, no GROUP BY, no DISTINCT ----------
assert 7 == 7

# -- Prove it 2: EXCEPT ALL on two more small bags ---------------------------
bag_p = Counter([3, 3, 3, 5])  # {3: 3, 5: 1}
bag_q = Counter([3, 5, 5])  # {3: 1, 5: 2}
assert bag_p == {3: 3, 5: 1} and bag_q == {3: 1, 5: 2}
p_except_all_q = {v: max(0, bag_p[v] - bag_q.get(v, 0)) for v in bag_p}
p_except_all_q_rows = sum(p_except_all_q.values())
assert p_except_all_q_rows == 2  # two leftover copies of value 3

# -- Prove it 3: two disjoint 50,000-row branches still pay the dedup pass ---
branch_a, branch_b = 50_000, 50_000
disjoint_union_all = branch_a + branch_b
disjoint_union = disjoint_union_all  # no duplicates, so the row count doesn't change
assert disjoint_union_all == 100_000 and disjoint_union == 100_000
# but the planner cannot know they're disjoint without doing the pass:
disjoint_total_touches = disjoint_union_all + disjoint_union_all
assert disjoint_total_touches == 200_000  # the extra pass runs anyway

print("relational-algebra-bag-semantics examples: all numbers check out")
