"""Executed truth for the CTE inlining-vs-materialization reel (run by `npm run test:examples`).

SQLite (3.35 and later) has the same MATERIALIZED / NOT MATERIALIZED switch, so the effect of the fence is observed in real
plans, and the cost of recomputation is observed by counting calls of an "expensive" function. PostgreSQL's default rule and
release history (12), and SQL Server's always-recompute behaviour, are sourced in the Deep dive.
"""

import sqlite3

POSTGRES_INLINING_RELEASE = 12
assert POSTGRES_INLINING_RELEASE == 12
KEY = 123
ROWS = 200
db = sqlite3.connect(":memory:")
db.executescript("CREATE TABLE big (key INT PRIMARY KEY, ref INT, val INT); CREATE INDEX i_ref ON big (ref);")
db.executemany("INSERT INTO big VALUES (?,?,?)", [(i, (i * 7) % ROWS, i) for i in range(1, ROWS + 1)])
plan = lambda q: " | ".join(r[3] for r in db.execute("EXPLAIN QUERY PLAN " + q))

# Inlined: the filter reaches the index on key through the CTE.
inlined = plan(f"WITH w AS NOT MATERIALIZED (SELECT * FROM big) SELECT * FROM w WHERE key = {KEY}")
assert "SEARCH big USING INDEX" in inlined and "MATERIALIZE" not in inlined
# Fenced: MATERIALIZED computes the whole CTE first, as a sealed intermediate result.
fenced = plan(f"WITH w AS MATERIALIZED (SELECT * FROM big) SELECT * FROM w WHERE key = {KEY}")
assert "MATERIALIZE" in fenced
fenced_scan = [r[3] for r in db.execute(f"EXPLAIN QUERY PLAN WITH w AS MATERIALIZED (SELECT * FROM big) SELECT * FROM w WHERE key = {KEY}")]
assert any(s.startswith("SCAN big") for s in fenced_scan)  # the whole table is read, the key index is not used to find 123
# Both give the same answer.
assert db.execute(f"WITH w AS MATERIALIZED (SELECT * FROM big) SELECT * FROM w WHERE key = {KEY}").fetchall() == db.execute(
    f"WITH w AS NOT MATERIALIZED (SELECT * FROM big) SELECT * FROM w WHERE key = {KEY}"
).fetchall()

# Referenced twice (self-join): NOT MATERIALIZED reaches the index inside both references.
twice = plan(f"WITH w AS NOT MATERIALIZED (SELECT * FROM big) SELECT * FROM w w1 JOIN w w2 ON w1.key = w2.ref WHERE w2.key = {KEY}")
assert twice.count("SEARCH big USING INDEX") == 2
mat_twice = plan(f"WITH w AS MATERIALIZED (SELECT * FROM big) SELECT * FROM w w1 JOIN w w2 ON w1.key = w2.ref WHERE w2.key = {KEY}")
assert "MATERIALIZE" in mat_twice

# The expensive function: a CTE referenced twice. MATERIALIZED runs it once per base row; NOT MATERIALIZED recomputes it per reference.
calls = {"n": 0}
def expensive(x):
    calls["n"] += 1
    return x * 2


db.create_function("expensive", 1, expensive)
def run(mode):
    calls["n"] = 0
    out = db.execute(f"WITH w AS {mode} (SELECT key, expensive(val) AS f FROM big) SELECT COUNT(*) FROM w w1 JOIN w w2 ON w1.f = w2.f").fetchone()
    return out, calls["n"]


out_m, n_m = run("MATERIALIZED")
out_n, n_n = run("NOT MATERIALIZED")
assert out_m == out_n == (ROWS,)  # the same answer either way
assert n_m == ROWS  # once per base row
assert n_n >= 2 * ROWS  # at least once per reference, so at least twice per base row
REFERENCES = 2
assert REFERENCES == 2
db.close()

print("cte-inlining-vs-materialization examples: all numbers check out")
