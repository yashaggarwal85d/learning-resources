"""Executed truth for the gaps-and-islands and sessionization reel (run by `npm run test:examples`).

SQLite window functions (LAG, ROW_NUMBER, running SUM) run the sessionization and the row-number-difference trick; the tie
check runs every row order of a small tied example. All numbers on screen come from here.
"""

import itertools
import sqlite3

TIMES = [0, 12, 25, 80, 95, 200, 202, 230]  # minutes
THRESHOLD = 30
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE e (id INT PRIMARY KEY, t INT)")
db.executemany("INSERT INTO e VALUES (?,?)", list(enumerate(TIMES, 1)))
q = lambda sql: db.execute(sql).fetchall()

GAPS = """SELECT id, t, t - LAG(t) OVER (ORDER BY t, id) AS gap FROM e"""
assert [g for _, _, g in q(GAPS + " ORDER BY id")] == [None, 12, 13, 55, 15, 105, 2, 28]  # first gap is NULL

FLAGS = f"SELECT id, t, CASE WHEN gap IS NULL OR gap > {THRESHOLD} THEN 1 ELSE 0 END AS f FROM ({GAPS})"
flags = [f for _, _, f in q(FLAGS + " ORDER BY id")]
assert flags == [1, 0, 0, 1, 0, 1, 0, 0]
assert sum(flags) == 3

SESS = f"SELECT id, t, SUM(f) OVER (ORDER BY t, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS s FROM ({FLAGS})"
sess = [s for _, _, s in q(SESS + " ORDER BY id")]
assert sess == [1, 1, 1, 2, 2, 3, 3, 3]
assert sess[3] == 2  # the fourth event is the first of visit 2
assert len(TIMES) == 8

# Compress to one row per session.
comp = q(f"SELECT s, MIN(t), MAX(t), COUNT(*) FROM ({SESS}) GROUP BY s ORDER BY s")
assert comp == [(1, 0, 25, 3), (2, 80, 95, 2), (3, 200, 230, 3)]
assert len(comp) == 3

# Gaps of 5, 45 and 10 after a first event: two sessions.
g = [5, 45, 10]
assert 1 + sum(1 for x in g if x > THRESHOLD) == 2

# Row-number-difference trick: runs of consecutive days.
days = [1, 2, 3, 5, 6, 9]
diffs = [d - r for r, d in enumerate(days, 1)]
assert diffs == [0, 0, 0, 1, 1, 3]
assert len(set(diffs)) == 3  # three islands: 1-3, 5-6, 9

# Ties: two events at the same time after a long gap give the same session ids in every row order and both frames.
def sessions(rows, frame):
    d = sqlite3.connect(":memory:")
    d.execute("CREATE TABLE e (id INT, t INT)")
    d.executemany("INSERT INTO e VALUES (?,?)", rows)
    out = dict(d.execute(
        f"""WITH g AS (SELECT id, t, t - LAG(t) OVER (ORDER BY t) gap FROM e),
            f AS (SELECT id, t, CASE WHEN gap IS NULL OR gap > 30 THEN 1 ELSE 0 END n FROM g)
            SELECT id, SUM(n) OVER (ORDER BY t {frame}) FROM f"""
    ).fetchall())
    d.close()
    return out


tied = [(1, 0), (2, 100), (3, 100), (4, 105)]
seen = {tuple(sorted(sessions(list(p), fr).items())) for p in itertools.permutations(tied) for fr in ("", "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW")}
assert seen == {((1, 1), (2, 2), (3, 2), (4, 2))}  # one possible answer, whatever the order or frame
db.close()

print("gaps-islands-sessionization examples: all numbers check out")
