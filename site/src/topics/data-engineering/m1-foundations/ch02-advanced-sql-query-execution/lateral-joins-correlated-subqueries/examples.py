"""Executed truth for the LATERAL reel (run by `npm run test:examples`).

SQLite has no LATERAL, so the per-row evaluation the keyword defines is run literally in Python (for each outer row,
rerun the subquery with that row substituted) and compared with the equivalent window-function query run in SQLite.
The planner claims (pull-up boundary, CROSS APPLY mapping) are PostgreSQL's and SQL Server's, sourced in the Deep dive.
"""

import sqlite3

CAP = 3
# c1 has 5 orders, c2 has 2, c3 has none, c4 has 4.
ORDERS = [("c1", d) for d in range(1, 6)] + [("c2", d) for d in (1, 2)] + [("c4", d) for d in range(1, 5)]
CUSTOMERS = ["c1", "c2", "c3", "c4"]

# LATERAL, literally: for each outer row, run the subquery with that row's key; keep the newest CAP.
def lateral_top(customer):
    mine = sorted((d for c, d in ORDERS if c == customer), reverse=True)
    return mine[:CAP]


per_customer = {c: lateral_top(c) for c in CUSTOMERS}
assert [len(per_customer[c]) for c in CUSTOMERS] == [3, 2, 0, 3]
cross = [(c, d) for c in CUSTOMERS for d in per_customer[c]]  # CROSS JOIN LATERAL drops c3
assert len(cross) == 8 == 3 + 2 + 0 + 3
left = [(c, d) for c in CUSTOMERS for d in (per_customer[c] or [None])]  # LEFT JOIN LATERAL ... ON true keeps c3
assert len(left) == 9
assert ("c3", None) in left

# A cap is a ceiling, not a quota: a customer with 2 orders contributes 2 rows.
assert len(per_customer["c2"]) == 2

# The same answer from the window-function form, run in a real engine.
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE customers (customer_id TEXT)")
db.executemany("INSERT INTO customers VALUES (?)", [(c,) for c in CUSTOMERS])
db.execute("CREATE TABLE orders (customer_id TEXT, day INT)")
db.executemany("INSERT INTO orders VALUES (?,?)", ORDERS)
win = db.execute(
    "SELECT customer_id, day FROM (SELECT customer_id, day, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY day DESC) rn FROM orders) WHERE rn <= 3"
).fetchall()
assert sorted(win) == sorted(cross)
left_sql = db.execute(
    "SELECT c.customer_id, r.day FROM customers c LEFT JOIN (SELECT customer_id, day FROM (SELECT customer_id, day, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY day DESC) rn FROM orders) WHERE rn <= 3) r ON r.customer_id = c.customer_id"
).fetchall()
assert sorted(left_sql, key=str) == sorted(left, key=str)

# An anti-join only reports who has nothing; the LEFT form also returns everyone's newest order.
anti = db.execute("SELECT customer_id FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)").fetchall()
assert anti == [("c3",)]
newest = {c: lateral_top(c)[:1] for c in CUSTOMERS}  # LIMIT 1 per customer
assert newest["c1"] == [5] and newest["c3"] == []
db.close()

print("lateral-joins-correlated-subqueries examples: all numbers check out")
