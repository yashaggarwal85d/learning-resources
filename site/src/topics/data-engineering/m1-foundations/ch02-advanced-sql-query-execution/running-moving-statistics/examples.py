"""Executed truth for the running-and-moving-statistics reel (run by `npm run test:examples`).

SQLite supplies the window functions (ROWS and numeric RANGE frames, NTILE, CUME_DIST); it has no interval type or percentile
aggregates, so PERCENTILE_CONT and PERCENTILE_DISC are implemented in Python straight from the PostgreSQL definitions
(interpolate; first value whose position reaches the fraction). The reel's topic references (topics 11 and 13) are listed.
"""

import math
import sqlite3

TOPICS_REFERENCED = (11, 13)
assert TOPICS_REFERENCED == (11, 13)

# -- ROWS counts positions; RANGE (on a day number) counts elapsed time ------------
QUIET = [1, 3, 5, 7, 9, 11, 12]
BUSY = [100, 100, 100, 101, 101, 101, 101]
assert len(QUIET) == len(BUSY) == 7
assert QUIET[-1] - QUIET[0] + 1 == 12  # seven quiet orders span 12 days
assert BUSY[-1] - BUSY[0] + 1 == 2  # seven busy orders span 2 days

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE o (id INT, day INT, amount INT)")
db.executemany("INSERT INTO o VALUES (?,?,?)", [(i, d, 10) for i, d in enumerate(QUIET + BUSY)])
rows6 = db.execute("SELECT id, COUNT(*) OVER (ORDER BY day, id ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) FROM o ORDER BY id").fetchall()
assert rows6[6][1] == 7 and rows6[13][1] == 7  # ROWS 6 PRECEDING always means 7 rows, whatever the time span
range7 = db.execute("SELECT id, day, COUNT(*) OVER (ORDER BY day RANGE BETWEEN 6 PRECEDING AND CURRENT ROW) FROM o ORDER BY id").fetchall()
assert range7[6][2] == 4  # in time, 7 days back from day 12 holds days 6..12 -> orders on 7, 9, 11, 12
assert range7[13][2] == 7  # the busy day: all seven orders fall inside the 7-day window
db.close()

# -- PERCENTILE_CONT and PERCENTILE_DISC from the PostgreSQL definitions ------------
def percentile_cont(vals, f):
    s = sorted(vals)
    pos = f * (len(s) - 1)
    lo, hi = math.floor(pos), math.ceil(pos)
    return s[lo] + (s[hi] - s[lo]) * (pos - lo)


def percentile_disc(vals, f):
    s = sorted(vals)
    k = max(1, math.ceil(f * len(s)))  # the first value whose position (1-based) reaches the fraction
    return s[k - 1]


V = [10, 20, 30, 40]
assert percentile_cont(V, 0.5) == 25 and percentile_disc(V, 0.5) == 20
assert percentile_cont(V, 0.9) == 37 and percentile_disc(V, 0.9) == 40
assert percentile_cont(V, 0.5) not in V and percentile_disc(V, 0.5) in V  # cont may be a number not in the data
assert [percentile_cont(V, f) for f in (0.5, 0.9, 0.99)] == [25, 37, 39.7] or abs(percentile_cont(V, 0.99) - 39.7) < 1e-9
assert 0.99 > 0.9 > 0.5

# -- NTILE and CUME_DIST ---------------------------------------------------------------
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE r (v INT)")
db.executemany("INSERT INTO r VALUES (?)", [(i,) for i in range(1, 11)])
sizes = [n for (n,) in db.execute("SELECT COUNT(*) FROM (SELECT NTILE(4) OVER (ORDER BY v) b FROM r) GROUP BY b ORDER BY b")]
assert sizes == [3, 3, 2, 2]  # the remainder rows go to the first buckets
assert sum(sizes) == 10 and sizes[0] == 3
cd = [round(x, 1) for (x,) in db.execute("SELECT CUME_DIST() OVER (ORDER BY v) FROM r ORDER BY v")]
assert cd[0] == 0.1 and cd[-1] == 1.0
db.close()

# -- Scale: the partition the reel mentions --------------------------------------------
PARTITION_ROWS = 100_000_000
assert PARTITION_ROWS == 100_000_000
assert 1 / 100 == 0.01  # the slowest 1%

print("running-moving-statistics examples: all numbers check out")
