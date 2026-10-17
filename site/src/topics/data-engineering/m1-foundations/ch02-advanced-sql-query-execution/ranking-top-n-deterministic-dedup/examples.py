"""Executed truth for the ranking, top-N and deterministic dedup reel (run by `npm run test:examples`).

SQLite (3.25 and later) has ROW_NUMBER, RANK and DENSE_RANK with the standard semantics, so the numbering on screen comes
from a real engine. QUALIFY is not in SQLite (nor in the ISO standard); the CTE form that replaces it is run instead.
The list of engines that support QUALIFY is sourced in the Deep dive.
"""

import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE s (id INT PRIMARY KEY, score INT)")
db.executemany("INSERT INTO s VALUES (?,?)", [(1, 90), (2, 80), (3, 80), (4, 70)])
q = lambda sql: db.execute(sql).fetchall()

# Three numberings of scores 90, 80, 80, 70.
r = q("SELECT score, ROW_NUMBER() OVER w, RANK() OVER w, DENSE_RANK() OVER w FROM s WINDOW w AS (ORDER BY score DESC, id) ORDER BY id")
assert [x[1] for x in r] == [1, 2, 3, 4]
# RANK and DENSE_RANK ignore the tie-breaker column (they rank peers on score alone):
r2 = q("SELECT RANK() OVER (ORDER BY score DESC), DENSE_RANK() OVER (ORDER BY score DESC) FROM s ORDER BY id")
assert [x[0] for x in r2] == [1, 2, 2, 4]
assert [x[1] for x in r2] == [1, 2, 2, 3]

# Three customers tied for first: the next rank is 4 for RANK, 2 for DENSE_RANK.
db.execute("CREATE TABLE t (c TEXT, orders INT)")
db.executemany("INSERT INTO t VALUES (?,?)", [("a", 9), ("b", 9), ("c", 9), ("d", 5)])
rk = q("SELECT c, RANK() OVER (ORDER BY orders DESC), DENSE_RANK() OVER (ORDER BY orders DESC) FROM t ORDER BY c")
assert rk[3] == ("d", 4, 2)

# ROW_NUMBER among ties depends on the order rows arrive in: insert the same rows in a different physical order.
def numbering(rows, order):
    d = sqlite3.connect(":memory:")
    d.execute("CREATE TABLE s (id INT, score INT)")
    d.executemany("INSERT INTO s VALUES (?,?)", rows)
    out = dict(d.execute(f"SELECT id, ROW_NUMBER() OVER (ORDER BY {order}) FROM s").fetchall())
    d.close()
    return out


rows = [(1, 90), (2, 80), (3, 80), (4, 70)]
a1 = numbering(rows, "score DESC")
a2 = numbering(list(reversed(rows)), "score DESC")
assert a1 != a2  # the tied rows swapped numbers: not reproducible
b1 = numbering(rows, "score DESC, id")
b2 = numbering(list(reversed(rows)), "score DESC, id")
assert b1 == b2 == {1: 1, 2: 2, 3: 3, 4: 4}  # a unique tie-breaker makes it reproducible

# Dedup: five records for three customers, keep the newest per customer (ROW_NUMBER = 1), via the portable CTE form.
db.execute("CREATE TABLE rec (record_id INT PRIMARY KEY, customer TEXT, updated_at INT)")
db.executemany("INSERT INTO rec VALUES (?,?,?)", [(1, "c1", 1), (2, "c1", 2), (3, "c2", 1), (4, "c3", 5), (5, "c3", 5)])
kept = q("WITH n AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY customer ORDER BY updated_at DESC, record_id DESC) rn FROM rec) SELECT record_id FROM n WHERE rn = 1 ORDER BY record_id")
assert len(kept) == 3 and kept == [(2,), (3,), (5,)]  # c3's tie at updated_at 5 resolved by record_id
# RANK would keep both tied records, so the 'dedup' would keep duplicates.
ranked = q("WITH n AS (SELECT *, RANK() OVER (PARTITION BY customer ORDER BY updated_at DESC) rk FROM rec) SELECT COUNT(*) FROM n WHERE rk = 1")
assert ranked == [(4,)]

# WHERE cannot filter on a window function; a CTE (or QUALIFY where it exists) does.
try:
    q("SELECT * FROM s WHERE ROW_NUMBER() OVER (ORDER BY id) <= 3")
    raise AssertionError("expected an error")
except sqlite3.OperationalError:
    pass
assert len(q("WITH n AS (SELECT *, ROW_NUMBER() OVER (ORDER BY id) rn FROM s) SELECT * FROM n WHERE rn <= 3")) == 3
db.close()

print("ranking-top-n-deterministic-dedup examples: all numbers check out")
