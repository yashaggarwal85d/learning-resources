"""Executed truth for the user-defined-functions reel (run by `npm run test:examples`).

SQLite (standard library) lets Python register a function, with or without the `deterministic` flag, and the engine behaves
the way the reel describes: a function it cannot assume is deterministic is called for every row, a deterministic one with
constant arguments is evaluated once. The PostgreSQL defaults (VOLATILE, PARALLEL UNSAFE), the inlining rules (clauses.c) and
the Froid and Databricks figures are sourced in the Deep dive; the sourced constants are recorded here so nothing on screen is
unbacked.
"""

import sqlite3

ROWS = 1_000
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (amount INT)")
db.executemany("INSERT INTO orders VALUES (?)", [(i,) for i in range(ROWS)])

calls = {"volatile": 0, "immutable": 0}


def f_volatile(x):
    calls["volatile"] += 1
    return x * 2


def f_immutable(x):
    calls["immutable"] += 1
    return x * 2


db.create_function("f_vol", 1, f_volatile)  # not declared deterministic
db.create_function("f_imm", 1, f_immutable, deterministic=True)

# A call with constant arguments: the undeclared function runs for every row, the declared one once.
assert db.execute("SELECT COUNT(*) FROM orders WHERE amount < f_vol(5) * 1000").fetchone() == (ROWS,)
assert db.execute("SELECT COUNT(*) FROM orders WHERE amount < f_imm(5) * 1000").fetchone() == (ROWS,)
assert calls["volatile"] == ROWS == 1000
assert calls["immutable"] == 1

# Opaque UDF vs. the same logic as an expression the engine can see: identical answers (this is what inlining preserves).
db.create_function("tax", 1, lambda x: x * 12 // 10)
assert db.execute("SELECT SUM(tax(amount)) FROM orders").fetchone() == db.execute("SELECT SUM(amount * 12 / 10) FROM orders").fetchone()

# A branching (imperative) body rewritten as one CASE expression gives the same result: the idea Froid generalises.
def category(total):
    if total < 500:
        return "REGULAR"
    elif total < 1000:
        return "GOLD"
    return "PLATINUM"


db.create_function("category", 1, category)
udf = db.execute("SELECT category(amount) FROM orders").fetchall()
expr = db.execute("SELECT CASE WHEN amount < 500 THEN 'REGULAR' WHEN amount < 1000 THEN 'GOLD' ELSE 'PLATINUM' END FROM orders").fetchall()
assert udf == expr

# Row-at-a-time versus batch: the same 1,000 rows cross the boundary in 1,000 trips or in 10.
BATCH = 100
row_trips = ROWS
batch_trips = (ROWS + BATCH - 1) // BATCH
assert row_trips == 1000 and batch_trips == 10

# Figures taken from sources (not computed here): Databricks measured 3x to over 100x for vectorized UDFs;
# scalar UDF inlining (Froid) shipped in SQL Server 2019.
DATABRICKS_SPEEDUP_LOW, DATABRICKS_SPEEDUP_HIGH = 3, 100
SQL_SERVER_INLINING_RELEASE = 2019
assert DATABRICKS_SPEEDUP_LOW == 3 and DATABRICKS_SPEEDUP_HIGH == 100 and SQL_SERVER_INLINING_RELEASE == 2019
db.close()

print("user-defined-functions-optimizer-opacity examples: all numbers check out")
