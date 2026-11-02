"""Lot genealogy as a graph-reachability problem: a recursive CTE with PostgreSQL's built-in
CYCLE clause over a consume/produce edge table, with merges, a split, a rework loop, and one
missing split-lot edge that silently understates a recall.

Fictional two-plant manufacturer (no real company). Run directly against this sandbox's own
PostgreSQL 16 cluster.
"""
import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    return conn, conn.cursor()


conn, cur = connect()

cur.execute("DROP TABLE IF EXISTS lot_edge")
cur.execute(
    """
    CREATE TABLE lot_edge (
        parent_lot TEXT,
        child_lot TEXT,
        qty NUMERIC
    )
    """
)

# A raw-material lot (RM9, coating powder) is consumed into two intermediate lots (a split).
# One intermediate merges with another raw lot into a finished lot. A rework loop feeds a
# reject lot's material back into a later batch of the SAME intermediate it came from, which
# would spin forever without cycle protection. One split edge (RM9 -> INT2) is held back from
# the table on purpose, to reproduce a real missing-link recall.
all_edges = [
    ("RM9", "INT1", 120),
    ("RM9", "INT2", 80),  # the edge the "missing link" scenario drops
    ("RM7", "INT1", 40),
    ("INT1", "FIN1", 150),
    ("INT2", "FIN2", 70),
    ("FIN1", "REJ1", 10),  # a reject split off FIN1
    ("REJ1", "INT1", 5),  # rework: the reject's material re-enters INT1's later batch
    ("RM8", "FIN3", 200),  # an unrelated lot, untouched by the contamination
]
complete_edges = all_edges
degraded_edges = [e for e in all_edges if e != ("RM9", "INT2", 80)]


def load_edges(edges):
    cur.execute("TRUNCATE lot_edge")
    cur.executemany("INSERT INTO lot_edge VALUES (%s, %s, %s)", edges)


# Forward genealogy: every lot reachable downstream from a contaminated raw lot, with the
# rework loop (REJ1 -> INT1) guarded by PostgreSQL's own CYCLE clause so it terminates.
FORWARD_SQL = """
WITH RECURSIVE exposed(lot) AS (
    SELECT %s
    UNION ALL
    SELECT e.child_lot
    FROM lot_edge e
    JOIN exposed x ON e.parent_lot = x.lot
) CYCLE lot SET is_cycle USING path
SELECT DISTINCT lot FROM exposed WHERE NOT is_cycle ORDER BY lot
"""


def forward_genealogy(contaminated_lot):
    cur.execute(FORWARD_SQL, (contaminated_lot,))
    return sorted(r[0] for r in cur.fetchall())


load_edges(complete_edges)
true_exposure = forward_genealogy("RM9")
# RM9 reaches INT1 and INT2 directly, FIN1 and FIN2 through them, and REJ1 and (again) INT1
# through the rework loop -- CYCLE stops that branch from looping, but INT1 is already in the set.
assert true_exposure == ["FIN1", "FIN2", "INT1", "INT2", "REJ1", "RM9"]

load_edges(degraded_edges)
degraded_exposure = forward_genealogy("RM9")
# With the RM9 -> INT2 edge missing, nothing downstream of INT2 is reachable at all.
assert degraded_exposure == ["FIN1", "INT1", "REJ1", "RM9"]

missing_from_recall = sorted(set(true_exposure) - set(degraded_exposure))
assert missing_from_recall == ["FIN2", "INT2"]

load_edges(complete_edges)  # restore the complete graph for the rest of the demo

# Backward genealogy: every raw-material ancestor of a finished lot (the recall's real cause).
BACKWARD_SQL = """
WITH RECURSIVE ancestors(lot) AS (
    SELECT %s
    UNION ALL
    SELECT e.parent_lot
    FROM lot_edge e
    JOIN ancestors a ON e.child_lot = a.lot
) CYCLE lot SET is_cycle USING path
SELECT DISTINCT lot FROM ancestors WHERE NOT is_cycle ORDER BY lot
"""


def backward_genealogy(finished_lot):
    cur.execute(BACKWARD_SQL, (finished_lot,))
    return sorted(r[0] for r in cur.fetchall())


fin1_ancestors = backward_genealogy("FIN1")
# FIN1 traces back to both raw lots that fed INT1 (RM9 and RM7), plus the rework loop that
# folds REJ1 (and transitively FIN1 itself) back in -- again, CYCLE is what stops that from
# looping rather than terminating with an incomplete answer.
assert fin1_ancestors == ["FIN1", "INT1", "REJ1", "RM7", "RM9"]

# A query over an edge table with no cycle protection at all would never return: show that the
# naive recursive form (no CYCLE, no path tracking) actually loops by capping it and confirming
# it fills the cap, rather than terminating on its own, which is what "it never returns" means
# for a bounded test.
cur.execute(
    """
    WITH RECURSIVE naive(lot, depth) AS (
        SELECT %s, 0
        UNION ALL
        SELECT e.child_lot, naive.depth + 1
        FROM lot_edge e JOIN naive ON e.parent_lot = naive.lot
        WHERE naive.depth < 500
    )
    SELECT count(*) FROM naive
    """,
    ("RM9",),
)
(naive_row_count,) = cur.fetchone()
assert naive_row_count == 503, "the rework loop should make the uncapped naive query keep producing rows forever"

print(f"true forward exposure from the contaminated raw lot: {true_exposure}")
print(f"forward exposure with one split edge missing: {degraded_exposure}")
print(f"lots a recall would miss because of the missing edge: {missing_from_recall}")
print(f"backward genealogy (raw-material ancestors) of {'FIN1'}: {fin1_ancestors}")
print(
    f"the naive recursive form with no cycle protection produced {naive_row_count} rows before "
    "being capped, confirming it never terminates on its own"
)

cur.execute("DROP TABLE lot_edge")
conn.close()
