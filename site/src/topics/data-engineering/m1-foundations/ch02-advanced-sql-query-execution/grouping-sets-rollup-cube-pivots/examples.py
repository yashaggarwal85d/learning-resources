"""Executed truth for the grouping-sets reel (run by `npm run test:examples`).

SQLite has no ROLLUP/CUBE, so the expansion is computed in Python (the definition) and each grouping set is run as a plain
GROUP BY in SQLite and stacked, which is exactly what the reel says grouping sets do in one pass. FILTER and CASE pivots run
unchanged in SQLite. PostgreSQL-specific wording (GROUPING(), GROUP BY DISTINCT) is sourced in the Deep dive.
"""

import sqlite3
from itertools import combinations

# -- Expansion of ROLLUP and CUBE into grouping sets -----------------------------
def rollup(cols):
    return [tuple(cols[:i]) for i in range(len(cols), -1, -1)]  # every prefix, down to ()


def cube(cols):
    return [s for n in range(len(cols), -1, -1) for s in combinations(cols, n)]  # every subset


assert rollup(["a", "b"]) == [("a", "b"), ("a",), ()]
assert len(rollup(["a", "b"])) == 3
assert len(cube(["a", "b"])) == 4
assert len(cube(["a", "b", "c"])) == 8 == 2**3
assert len(rollup(["a", "b", "c"])) == 4

# Two ROLLUP items in one GROUP BY multiply together: the grouping sets repeat.
def product(sets_a, sets_b):
    return [tuple(sorted(set(x) | set(y))) for x in sets_a for y in sets_b]


combined = product(rollup(["a", "b"]), rollup(["a", "c"]))
assert len(combined) == 9
assert len(set(combined)) == 5  # DISTINCT keeps one of each: (a,b,c), (a,b), (a,c), (a), ()
assert sorted(combined).count(("a",)) == 3  # the documented example lists (a) three times

# -- The reel's data: status x month, amounts ------------------------------------
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (status TEXT, month TEXT, amount INT, referred_by INT)")
db.executemany(
    "INSERT INTO orders VALUES (?,?,?,?)",
    [("paid", "Oct", 400, 17), ("paid", "Nov", 600, None), ("refunded", "Oct", 50, None), ("refunded", "Nov", 70, 17)],
)
q = lambda sql: db.execute(sql).fetchall()


def run_sets(sets, cols=("status", "month")):
    out = []
    for s in sets:
        sel = ", ".join(c if c in s else f"NULL AS {c}" for c in cols)
        grp = f" GROUP BY {', '.join(s)}" if s else ""
        bits = sum(1 << (len(cols) - 1 - i) for i, c in enumerate(cols) if c not in s)
        out += [(*r[:-1], r[-1], bits) for r in q(f"SELECT {sel}, SUM(amount) FROM orders{grp}")]
    return out


rolled = run_sets(rollup(["status", "month"]))
assert len(rolled) == 7  # 4 detail + 2 status subtotals + 1 grand total
assert sum(1 for r in rolled if r[3] == 0) == 4
assert sum(1 for r in rolled if r[3] == 1) == 2
assert [r for r in rolled if r[3] == 3] == [(None, None, 1120, 3)]  # grand total: both bits set = 3
assert (("paid", None, 1000, 1) in rolled) and (("refunded", None, 120, 1) in rolled)
assert len(run_sets(cube(["status", "month"]))) == 9
assert int("11", 2) == 3  # both GROUPING bits set is binary 11, which is 3

# -- GROUPING() separates a rollup NULL from a data NULL ---------------------------
by_ref = []
for s in rollup(["referred_by"]):
    sel = "referred_by" if s else "NULL"
    grp = " GROUP BY referred_by" if s else ""
    flag = 0 if s else 1
    by_ref += [(*r, flag) for r in q(f"SELECT {sel}, SUM(amount) FROM orders{grp}")]
assert sum(1 for r in by_ref if r[0] is None) == 2  # the data NULL AND the grand total both show NULL
naive = sum(1 for r in by_ref if r[0] is None)
correct = sum(1 for r in by_ref if r[0] is None and r[2] == 0)
assert naive - correct == 1  # the naive IS NULL count is off by exactly one

# -- Pivot: FILTER, CASE and the plain result all agree -----------------------------
filt = q("SELECT month, SUM(amount) FILTER (WHERE status='paid'), SUM(amount) FILTER (WHERE status='refunded') FROM orders GROUP BY month ORDER BY month DESC")
case = q("SELECT month, SUM(CASE WHEN status='paid' THEN amount END), SUM(CASE WHEN status='refunded' THEN amount END) FROM orders GROUP BY month ORDER BY month DESC")
assert filt == case == [("Oct", 400, 50), ("Nov", 600, 70)]
db.close()

print("grouping-sets-rollup-cube-pivots examples: all numbers check out")
