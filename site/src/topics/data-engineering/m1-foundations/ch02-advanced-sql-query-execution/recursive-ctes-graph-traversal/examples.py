"""Executed truth for the recursive-CTEs reel (run by `npm run test:examples`).

The reel's bill of materials runs in a real SQL engine (SQLite, standard library, WITH RECURSIVE). Product 1 is a bundle of
kits 2 and 3; kit 2 holds 2 x mic (4) and 1 x stand (5); kit 3 holds 1 x mic (4) and 3 x cable (6). The PostgreSQL-specific
claims (SEARCH/CYCLE since PostgreSQL 14, the documented evaluation loop) are sourced in the Deep dive.
"""

import sqlite3

POSTGRES_CYCLE_RELEASE = 14  # SEARCH and CYCLE arrived in PostgreSQL 14
assert POSTGRES_CYCLE_RELEASE == 14

BOM = [(1, 2, 1), (1, 3, 1), (2, 4, 2), (2, 5, 1), (3, 4, 1), (3, 6, 3)]

# -- The fixpoint loop, run by hand: working table sizes 2, 4, 0 ---------------
children = {}
for p, c, q in BOM:
    children.setdefault(p, []).append((c, q))
work = [(c, q) for c, q in children[1]]
sizes = [len(work)]
result = list(work)
while work:
    work = [(c2, q * q2) for (c, q) in work for (c2, q2) in children.get(c, [])]
    sizes.append(len(work))
    result += work
assert sizes == [2, 4, 0]  # seed 2 rows, one pass gives 4, the next gives 0: the loop stops
assert len(result) == 6
assert len({c for c, _ in result}) == 5  # distinct components: kit A, kit B, mic, stand, cable
assert sum(q for c, q in result if c == 4) == 3  # the shared mic: 2 via kit A + 1 via kit B
assert (2, 1) in [(q, 1) for c, q in result if c == 4] or sorted(q for c, q in result if c == 4) == [1, 2]

# -- The same thing in SQL ----------------------------------------------------
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE product_components (product_id INT, component_product_id INT, quantity INT)")
db.executemany("INSERT INTO product_components VALUES (?,?,?)", BOM)
q = lambda sql: db.execute(sql).fetchall()

EXPLODE = """
WITH RECURSIVE exploded(component_product_id, quantity) AS (
  SELECT component_product_id, quantity FROM product_components WHERE product_id = 1
  UNION ALL
  SELECT pc.component_product_id, e.quantity * pc.quantity
  FROM exploded e JOIN product_components pc ON pc.product_id = e.component_product_id
)
SELECT component_product_id, quantity FROM exploded
"""
rows = q(EXPLODE)
assert len(rows) == 6
assert sorted(q(f"SELECT component_product_id, SUM(quantity) FROM ({EXPLODE}) GROUP BY 1")) == [(2, 1), (3, 1), (4, 3), (5, 1), (6, 3)]

# -- A planted cycle: kit 3 now contains bundle 1 ------------------------------
db.execute("INSERT INTO product_components VALUES (3, 1, 1)")
# UNION ALL never stops: only the LIMIT ends it, and the table is still growing when it does.
assert len(q(EXPLODE + " LIMIT 100")) == 100
# Adding a depth column and using UNION does not help: every trip round the loop is a different row.
UNION_DEPTH = """
WITH RECURSIVE d(component_product_id, depth) AS (
  SELECT component_product_id, 1 FROM product_components WHERE product_id = 1
  UNION
  SELECT pc.component_product_id, d.depth + 1 FROM d JOIN product_components pc ON pc.product_id = d.component_product_id
)
SELECT * FROM d LIMIT 500
"""
assert len(q(UNION_DEPTH)) == 500  # still going when the LIMIT stops it

# A path guard terminates: carry the visited ids as text and refuse to step onto one already there.
GUARDED = """
WITH RECURSIVE g(component_product_id, path, is_cycle) AS (
  SELECT component_product_id, ',1,' || component_product_id || ',', 0 FROM product_components WHERE product_id = 1
  UNION ALL
  SELECT pc.component_product_id, g.path || pc.component_product_id || ',',
         instr(g.path, ',' || pc.component_product_id || ',') > 0
  FROM g JOIN product_components pc ON pc.product_id = g.component_product_id
  WHERE g.is_cycle = 0
)
SELECT component_product_id, is_cycle FROM g
"""
guarded = q(GUARDED)
assert len(guarded) < 100  # terminates on its own
assert sum(1 for _, c in guarded if c) >= 1  # and flags the row that re-entered the bundle
db.close()

print("recursive-ctes-graph-traversal examples: all numbers check out")
