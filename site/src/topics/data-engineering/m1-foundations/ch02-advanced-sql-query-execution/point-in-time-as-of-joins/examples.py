"""Executed truth for the point-in-time (as-of) joins reel (run by `npm run test:examples`).

SQLite runs the three hand-built forms (equi-join, inequality join, and the closest-wins correlated subquery) and a window-based
as-of join; the native ASOF JOIN spellings (DuckDB, ClickHouse, Snowflake) are sourced in the Deep dive. The leakage example is
computed: joining to the current price instead of the as-of price changes the answer for early orders.
"""

import sqlite3

PRICES = [(1, 10), (10, 12), (20, 11)]  # (valid_from day, price) for one product
ORDERS = [5, 9, 12, 25]  # order days

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE price_history (product_id INT, valid_from INT, price INT)")
db.executemany("INSERT INTO price_history VALUES (7,?,?)", PRICES)
db.execute("CREATE TABLE orders (order_id INT, product_id INT, event_time INT)")
db.executemany("INSERT INTO orders VALUES (?,7,?)", list(enumerate(ORDERS, 1)))
q = lambda sql: db.execute(sql).fetchall()

# Equality on the product alone: every order pairs with every price.
assert len(ORDERS) * len(PRICES) == 12
assert len(q("SELECT 1 FROM orders o JOIN price_history p ON p.product_id = o.product_id")) == 12

# Add the inequality: every price that started on or before the order still matches.
ineq = q("SELECT o.order_id FROM orders o JOIN price_history p ON p.product_id = o.product_id AND p.valid_from <= o.event_time")
assert len(ineq) == 7 == 1 + 1 + 2 + 3

# Closest wins: the correlated subquery with ORDER BY ... DESC LIMIT 1.
asof = q("SELECT o.event_time, (SELECT p.price FROM price_history p WHERE p.product_id = o.product_id AND p.valid_from <= o.event_time ORDER BY p.valid_from DESC LIMIT 1) FROM orders o ORDER BY o.order_id")
assert asof == [(5, 10), (9, 10), (12, 12), (25, 11)]
assert len(asof) == 4

# The same answer with a window function (keep the row_number = 1 of the matches).
win = q("""SELECT event_time, price FROM (
             SELECT o.order_id, o.event_time, p.price, ROW_NUMBER() OVER (PARTITION BY o.order_id ORDER BY p.valid_from DESC) rn
             FROM orders o JOIN price_history p ON p.product_id = o.product_id AND p.valid_from <= o.event_time)
           WHERE rn = 1 ORDER BY order_id""")
assert win == asof

# An order before the first price: an inner as-of join drops it, a left as-of join returns a NULL price.
db.execute("INSERT INTO orders VALUES (9, 7, 0)")
inner = q("SELECT COUNT(*) FROM orders o JOIN price_history p ON p.product_id = o.product_id AND p.valid_from <= o.event_time WHERE o.order_id = 9")
assert inner == [(0,)]
left = q("SELECT (SELECT p.price FROM price_history p WHERE p.product_id = o.product_id AND p.valid_from <= o.event_time ORDER BY p.valid_from DESC LIMIT 1) FROM orders o WHERE o.order_id = 9")
assert left == [(None,)]
db.execute("DELETE FROM orders WHERE order_id = 9")

# Temporal leakage: joining to the current price instead of the as-of price changes the answer for the day-5 order.
CURRENT_PRICE = PRICES[-1][1]
assert CURRENT_PRICE == 11
assert asof[0][1] == 10 and asof[0][1] != CURRENT_PRICE  # the day-5 order was priced at 10, not at today's 11
db.close()

print("point-in-time-as-of-joins examples: all numbers check out")
