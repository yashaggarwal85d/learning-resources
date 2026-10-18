"""Executed truth for the SQL-text-to-plan-tree reel (run by `npm run test:examples`).

SQLite shows the same pipeline behaviour in miniature: a grammar error is found before any catalog lookup, a missing table
only when names are resolved, a view disappears from the plan, and an index that provides an ordering removes the sort.
The five-stage description and the path/property vocabulary are PostgreSQL's, sourced in the Deep dive.
"""

import sqlite3

STAGES = ["parse", "bind", "rewrite", "plan", "execute"]
assert len(STAGES) == 5
SCAN_PATHS = ["sequential", "index"]  # at least 2 paths for a scan
JOIN_PATHS = ["nested loop", "merge", "hash"]  # at least 3 for a join
assert len(SCAN_PATHS) == 2 and len(JOIN_PATHS) == 3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (order_id INT, status TEXT, event_time INT, amount INT)")
db.executemany("INSERT INTO orders VALUES (?,?,?,?)", [(i, "paid" if i % 2 else "new", i, 100 - i) for i in range(1, 301)])

def error_of(sql):
    try:
        db.execute(sql)
    except sqlite3.Error as e:
        return str(e)
    return None

# Parse: grammar only, no catalog needed. Bind: the name is looked up in the catalog.
assert "syntax error" in error_of("SELECT FROM")
assert "no such table" in error_of("SELECT * FROM no_such_table WHERE x = 1")
assert "syntax error" not in error_of("SELECT * FROM no_such_table WHERE x = 1")  # it parsed fine; only binding failed

# Rewrite: a query over a view is planned against the base table; the view does not appear in the plan.
db.execute("CREATE VIEW paid_orders AS SELECT * FROM orders WHERE status = 'paid'")
plan = " ".join(r[3] for r in db.execute("EXPLAIN QUERY PLAN SELECT * FROM paid_orders WHERE amount > 50"))
assert "orders" in plan and "paid_orders" not in plan

# Paths: a scan with and without an index are two different plans for the same result.
seq = " ".join(r[3] for r in db.execute("EXPLAIN QUERY PLAN SELECT * FROM orders WHERE event_time = 7"))
assert "SCAN" in seq
db.execute("CREATE INDEX idx_time ON orders (event_time)")
idx = " ".join(r[3] for r in db.execute("EXPLAIN QUERY PLAN SELECT * FROM orders WHERE event_time = 7"))
assert "SEARCH" in idx and "idx_time" in idx
assert db.execute("SELECT * FROM orders WHERE event_time = 7").fetchall() == [(7, "paid", 7, 93)]

# Physical properties: the index provides event_time order, so ORDER BY event_time needs no sort; ORDER BY amount does.
LIMIT = 100
ordered = " ".join(r[3] for r in db.execute(f"EXPLAIN QUERY PLAN SELECT * FROM orders ORDER BY event_time LIMIT {LIMIT}"))
assert "TEMP B-TREE" not in ordered
unordered = " ".join(r[3] for r in db.execute(f"EXPLAIN QUERY PLAN SELECT * FROM orders ORDER BY amount LIMIT {LIMIT}"))
assert "TEMP B-TREE" in unordered
assert len(db.execute(f"SELECT * FROM orders ORDER BY event_time LIMIT {LIMIT}").fetchall()) == 100
db.close()

print("sql-text-to-plan-tree examples: all numbers check out")
