"""Executed truth for the window-frame-semantics reel (run by `npm run test:examples`).

SQLite (3.28 and later) implements the standard window frames: ROWS, RANGE, GROUPS, EXCLUDE and named windows, so every
running total on screen is computed by a real engine. The PostgreSQL wording (default RANGE frame, no nested window calls)
is sourced in the Deep dive.
"""

import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (order_id INT, event_time INT, amount INT)")
# One customer's four orders: amounts 100, 50, 25, 10; the 50 and the 25 share event_time 2 (they are peers).
db.executemany("INSERT INTO orders VALUES (?,?,?)", [(1, 1, 100), (2, 2, 50), (3, 2, 25), (4, 3, 10)])
q = lambda sql: db.execute(sql).fetchall()

# Default frame with an ORDER BY: RANGE ... up to the current row's last peer. Tied rows show the same total.
default = [r[0] for r in q("SELECT SUM(amount) OVER (ORDER BY event_time) FROM orders ORDER BY order_id")]
assert default == [100, 175, 175, 185]

# A unique ORDER BY plus ROWS advances once per row.
rows = [r[0] for r in q("SELECT SUM(amount) OVER (ORDER BY event_time, order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM orders ORDER BY order_id")]
assert rows == [100, 150, 175, 185]

# ROWS ignores ties even without the tie-break key; the order among tied rows is then unspecified, so it is not asserted.
assert q("SELECT SUM(amount) OVER (ORDER BY event_time ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM orders ORDER BY order_id")[0] == (100,)

# GROUPS counts peer groups: the four orders form 3 peer groups.
groups = q("SELECT COUNT(*) FROM (SELECT DISTINCT event_time FROM orders)")
assert groups == [(3,)]
g = [r[0] for r in q("SELECT SUM(amount) OVER (ORDER BY event_time GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW) FROM orders ORDER BY order_id")]
assert g == [100, 175, 175, 85]  # t2 rows see t1 + t2; the t3 row sees t2's group and itself

# EXCLUDE CURRENT ROW: the average of the others.
avg = [r[0] for r in q("SELECT AVG(amount) OVER (ORDER BY event_time, order_id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING EXCLUDE CURRENT ROW) FROM orders ORDER BY order_id")]
assert avg[0] == (50 + 25 + 10) / 3

# Named windows: one definition, two calls.
named = q("SELECT SUM(amount) OVER w, COUNT(*) OVER w FROM orders WINDOW w AS (ORDER BY event_time, order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) ORDER BY order_id")
assert named == [(100, 1), (150, 2), (175, 3), (185, 4)]

# Staging a window of a window through a subquery works; a single level is the only thing a function may hold.
ranked = q("SELECT order_id, RANK() OVER (ORDER BY running DESC) FROM (SELECT order_id, SUM(amount) OVER (ORDER BY event_time, order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running FROM orders) ORDER BY order_id")
assert ranked == [(1, 4), (2, 3), (3, 2), (4, 1)]
db.close()

print("window-frame-semantics examples: all numbers check out")
