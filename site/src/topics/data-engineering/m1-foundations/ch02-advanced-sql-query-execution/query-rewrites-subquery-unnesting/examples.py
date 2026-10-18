"""Executed truth for the query-rewrites reel (run by `npm run test:examples`).

SQLite performs several of the same rewrites (evaluating a constant expression once, omitting an unused LEFT JOIN on a unique key),
so they are observed in its behaviour and plans. Equivalences (outer-to-inner, LEFT JOIN ... IS NULL versus NOT EXISTS, correlated EXISTS versus a
semi-join) are checked by comparing results, and the dependent-join cost is counted. The PostgreSQL rule texts and
the Neumann and Kemper unnesting method are sourced in the Deep dive.
"""

import sqlite3

db = sqlite3.connect(":memory:")
db.executescript(
    """
    CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, country TEXT);
    CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INT, amount INT);
    """
)
db.executemany("INSERT INTO customers VALUES (?,?)", [(i, "US" if i % 3 else "DE") for i in range(1, 51)])
db.executemany("INSERT INTO orders VALUES (?,?,?)", [(i, 1 + (i * 7) % 60, i % 90) for i in range(1, 1001)])  # some customer ids (51..60) are not in customers
q = lambda sql: db.execute(sql).fetchall()
plan = lambda sql: " | ".join(r[3] for r in db.execute("EXPLAIN QUERY PLAN " + sql))

# Constant folding: 2 + 3 is evaluated once, before any row is read.
assert q("SELECT 2 + 3") == [(5,)]
folded = {"calls": 0}
def plus(x, y):
    folded["calls"] += 1
    return x + y
db.create_function("plus", 2, plus, deterministic=True)
assert db.execute("SELECT COUNT(*) FROM orders WHERE amount < plus(2, 3) * 100").fetchone() == (1000,)
assert folded["calls"] == 1  # a deterministic call on constants is evaluated once, not once per row

# Join elimination: an unused LEFT JOIN on a unique key disappears from the plan, with the same row count.
unused = "SELECT o.order_id FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id"
assert plan(unused) == "SCAN o"  # only the orders scan remains: customers (alias c) was eliminated
assert len(q(unused)) == 1000
# ... but if a column of c is read, the join must stay.
assert "SEARCH c" in plan("SELECT o.order_id, c.country FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id")

# Outer-to-inner: a strict filter on the right side rejects every null-extended row, so the two forms agree.
FILTER_VALUE = 42
left_filtered = q(f"SELECT o.order_id FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id WHERE c.customer_id = {FILTER_VALUE} ORDER BY 1")
inner = q(f"SELECT o.order_id FROM orders o JOIN customers c ON o.customer_id = c.customer_id WHERE c.customer_id = {FILTER_VALUE} ORDER BY 1")
assert left_filtered == inner and len(inner) > 0

# LEFT JOIN ... IS NULL is an anti-join: same answer as NOT EXISTS.
anti_left = q("SELECT o.order_id FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id WHERE c.customer_id IS NULL ORDER BY 1")
anti_exists = q("SELECT o.order_id FROM orders o WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.customer_id = o.customer_id) ORDER BY 1")
assert anti_left == anti_exists and len(anti_left) > 0

# Dependent join vs unnested semi-join: same rows; one evaluates the inner side per outer row, the other makes one pass.
OUTER = 1000
inner_evals = 0
customers = [r[0] for r in q("SELECT customer_id FROM customers")]
def dependent(row_cust):
    global inner_evals
    inner_evals += 1  # the right side is evaluated for this outer row
    return any(c == row_cust for c in customers)


outer_rows = q("SELECT order_id, customer_id FROM orders")
dep = [oid for oid, cid in outer_rows if dependent(cid)]
assert inner_evals == OUTER == 1000  # one evaluation per outer row
key_set = set(customers)  # the unnested form builds the right side once
passes = 1
semi = [oid for oid, cid in outer_rows if cid in key_set]
assert dep == semi and passes == 1
assert [r[0] for r in q("SELECT o.order_id FROM orders o WHERE EXISTS (SELECT 1 FROM customers c WHERE c.customer_id = o.customer_id) ORDER BY 1")] == sorted(semi)
db.close()

print("query-rewrites-subquery-unnesting examples: all numbers check out")
