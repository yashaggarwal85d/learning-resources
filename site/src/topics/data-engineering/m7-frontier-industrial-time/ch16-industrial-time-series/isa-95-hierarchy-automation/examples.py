#!/usr/bin/env python3
"""The equipment hierarchy as a type-2 SCD: a reading joined as-of its own event time against
the identical reading joined to the equipment's current (latest) dimension row.

Fictional two-plant manufacturer (no real company): a press moves from line L4 to line L6
partway through the window. Every number the reel shows is computed here, with asserts.
"""
import random
import sqlite3
from datetime import date, timedelta

random.seed(95)

conn = sqlite3.connect(":memory:")
cur = conn.cursor()

cur.execute(
    """
    CREATE TABLE dim_equipment_scd (
        equipment_key INTEGER PRIMARY KEY,
        equipment_id TEXT,
        line TEXT,
        valid_from TEXT,
        valid_to TEXT
    )
    """
)

MOVE_DATE = date(2026, 3, 15)
START = date(2026, 1, 1)
END = date(2026, 5, 31)
FAR_FUTURE = "9999-12-31"

# press7 is the durable equipment key 1-then-2 version of one physical machine: it lived on
# line L4 from plant start, then was re-tooled onto line L6 on 2026-03-15. press12 and press9
# never move, so they are the control group the comparison is measured against.
dim_rows = [
    (1, "press7", "L4", START.isoformat(), MOVE_DATE.isoformat()),
    (2, "press7", "L6", MOVE_DATE.isoformat(), FAR_FUTURE),
    (3, "press12", "L4", START.isoformat(), FAR_FUTURE),
    (4, "press9", "L6", START.isoformat(), FAR_FUTURE),
]
cur.executemany("INSERT INTO dim_equipment_scd VALUES (?, ?, ?, ?, ?)", dim_rows)

cur.execute(
    """
    CREATE TABLE fact_count_event (
        equipment_id TEXT,
        event_time TEXT,
        good_count INTEGER
    )
    """
)


def drange(start, end):
    d = start
    while d < end:
        yield d
        d += timedelta(days=1)


events = []
for d in drange(START, MOVE_DATE):
    events.append(("press7", d.isoformat(), random.randint(140, 160)))  # press7 on L4, steady
for d in drange(MOVE_DATE, END):
    events.append(("press7", d.isoformat(), random.randint(95, 115)))  # press7 on L6, re-tooling ramp-up, slower
for d in drange(START, END):
    events.append(("press12", d.isoformat(), random.randint(150, 170)))  # always on L4
for d in drange(START, END):
    events.append(("press9", d.isoformat(), random.randint(130, 150)))  # always on L6
cur.executemany("INSERT INTO fact_count_event VALUES (?, ?, ?)", events)
conn.commit()

# The correct join: each event joins to the dim row valid AT THE EVENT'S OWN TIME.
AS_OF_SQL = """
SELECT d.line, SUM(f.good_count) AS good_count
FROM fact_count_event f
JOIN dim_equipment_scd d
  ON d.equipment_id = f.equipment_id
 AND f.event_time >= d.valid_from
 AND f.event_time <  d.valid_to
GROUP BY d.line
ORDER BY d.line
"""

# The bug: every event joins to the equipment's CURRENT (latest, open-ended) dim row, no matter
# when the event actually happened.
CURRENT_SQL = """
SELECT d.line, SUM(f.good_count) AS good_count
FROM fact_count_event f
JOIN dim_equipment_scd d
  ON d.equipment_id = f.equipment_id
 AND d.valid_to = ?
GROUP BY d.line
ORDER BY d.line
"""

as_of = dict(cur.execute(AS_OF_SQL).fetchall())
current = dict(cur.execute(CURRENT_SQL, (FAR_FUTURE,)).fetchall())

# press12's total never depends on which join is used, since it never moved: a clean control.
press12_total = cur.execute(
    "SELECT SUM(good_count) FROM fact_count_event WHERE equipment_id = 'press12'"
).fetchone()[0]
assert as_of["L4"] == press12_total + cur.execute(
    "SELECT SUM(good_count) FROM fact_count_event WHERE equipment_id = 'press7' AND event_time < ?",
    (MOVE_DATE.isoformat(),),
).fetchone()[0]

# The current-row join drops press7's entire pre-move period from L4 (it moved, so L4's current
# row for press7 doesn't exist) and instead folds that whole period into L6.
press7_pre_move = cur.execute(
    "SELECT SUM(good_count) FROM fact_count_event WHERE equipment_id = 'press7' AND event_time < ?",
    (MOVE_DATE.isoformat(),),
).fetchone()[0]
press7_post_move = cur.execute(
    "SELECT SUM(good_count) FROM fact_count_event WHERE equipment_id = 'press7' AND event_time >= ?",
    (MOVE_DATE.isoformat(),),
).fetchone()[0]

press9_total = cur.execute(
    "SELECT SUM(good_count) FROM fact_count_event WHERE equipment_id = 'press9'"
).fetchone()[0]
assert current["L4"] == press12_total, "the current-row join loses press7's whole L4 period"
assert current["L6"] == press9_total + press7_pre_move + press7_post_move

l4_understatement = as_of["L4"] - current["L4"]
l6_overstatement = current["L6"] - as_of["L6"]
assert l4_understatement == press7_pre_move
assert l6_overstatement == press7_pre_move
assert l4_understatement > 0 and l6_overstatement > 0

l4_pct_lost = round(100 * l4_understatement / as_of["L4"])
assert 25 <= l4_pct_lost <= 40  # sanity band; the exact figure is printed below

print("--- as-of join (correct: each reading joins the dimension row valid at its own time) ---")
for line in sorted(as_of):
    print(f"  line {line}: {as_of[line]} good parts")

print("--- current-row join (bug: every reading joins the equipment's latest row) ---")
for line in sorted(current):
    print(f"  line {line}: {current[line]} good parts")

print(
    f"\nL4 loses {l4_understatement} good parts ({l4_pct_lost} percent of its true total) to L6 "
    f"purely from the join choice, with zero change to any physical machine or reading."
)

# A durable key stays stable across the move; the natural key ("line") does not identify the
# equipment at all once it has moved, which is the whole reason the join needs valid_from/valid_to
# rather than a plain lookup by current line.
durable_key_for_press7_before = cur.execute(
    "SELECT equipment_key FROM dim_equipment_scd WHERE equipment_id = 'press7' AND line = 'L4'"
).fetchone()[0]
durable_key_for_press7_after = cur.execute(
    "SELECT equipment_key FROM dim_equipment_scd WHERE equipment_id = 'press7' AND line = 'L6'"
).fetchone()[0]
assert durable_key_for_press7_before != durable_key_for_press7_after
print(
    "\npress7's SCD rows have two different surrogate keys "
    f"({durable_key_for_press7_before} and {durable_key_for_press7_after}) for the same physical "
    "machine across its move; the equipment_id is the durable thing a fact table should key its "
    "lineage to, and the as-of join is what recovers the right row for a given event_time."
)

conn.close()
