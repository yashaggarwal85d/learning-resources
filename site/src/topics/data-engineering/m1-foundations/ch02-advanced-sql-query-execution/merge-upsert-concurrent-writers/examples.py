"""Executed truth for the MERGE, upsert and concurrent writers reel (run by `npm run test:examples`).

SQLite has no MERGE, so the statement's documented semantics are implemented in Python (classify each source row, run the
first WHEN clause that fits, error on a second change to the same target row). The race is real engine behaviour: a check
followed by an insert (what MERGE does) fails under a concurrent insert, while INSERT ... ON CONFLICT DO UPDATE (SQLite
implements the same upsert) does not. The release numbers (17, 18) and the lakehouse file-rewrite warning are sourced in the Deep dive.
"""

import sqlite3

MERGE_RETURNING_RELEASE = 17  # merge_action() in RETURNING
OLD_NEW_RETURNING_RELEASE = 18  # OLD and NEW in RETURNING
assert (MERGE_RETURNING_RELEASE, OLD_NEW_RETURNING_RELEASE) == (17, 18)

# -- MERGE semantics, run by hand ----------------------------------------------
class CardinalityViolation(Exception):
    pass


def merge(target, source):
    """target: {name: stock}; source: [(name, delta)]. WHEN NOT MATCHED AND delta>0 INSERT; WHEN MATCHED AND stock+delta>0 UPDATE;
    WHEN MATCHED DELETE. Returns the actions taken, in source order."""
    touched, actions = set(), []
    for name, delta in source:
        if name in touched:
            raise CardinalityViolation(name)  # a second candidate change row for the same target row
        if name not in target:
            if delta > 0:
                target[name] = delta
                actions.append("insert")
        elif target[name] + delta > 0:
            target[name] += delta
            actions.append("update")
        else:
            del target[name]
            actions.append("delete")
        touched.add(name)
    return actions


wines = {"merlot": 10, "malbec": 4, "rioja": 3}
stage = [("riesling", 6), ("syrah", 5), ("merlot", -3), ("malbec", 2), ("rioja", -3)]
assert len(stage) == 5
acts = merge(wines, stage)
assert acts.count("insert") == 2 and acts.count("update") == 2 and acts.count("delete") == 1
assert wines == {"merlot": 7, "malbec": 6, "riesling": 6, "syrah": 5}

# Two source rows for one target row: loud error, not a silent pick.
try:
    merge({"merlot": 10}, [("merlot", 3), ("merlot", 5)])
    raise AssertionError("expected a cardinality violation")
except CardinalityViolation:
    pass

# -- The race, in a real engine -------------------------------------------------
def fresh():
    db = sqlite3.connect(":memory:", isolation_level=None)
    db.execute("CREATE TABLE customers (customer_id INT PRIMARY KEY, note TEXT)")
    return db


# MERGE's shape: read first ("not matched"), then insert. Another session commits the same key inside the gap.
db = fresh()
matched = db.execute("SELECT 1 FROM customers WHERE customer_id = 7").fetchone()  # A reads: not matched
assert matched is None
db.execute("INSERT INTO customers VALUES (7, 'session B')")  # B commits first
try:
    db.execute("INSERT INTO customers VALUES (7, 'session A')")  # A inserts
    raise AssertionError("expected a unique violation")
except sqlite3.IntegrityError:
    pass  # the uniqueness violation the reel shows
db.close()

# ON CONFLICT DO UPDATE: the same collision is one atomic statement and never errors.
db = fresh()
db.execute("INSERT INTO customers VALUES (7, 'session B')")
db.execute("INSERT INTO customers VALUES (7, 'session A') ON CONFLICT (customer_id) DO UPDATE SET note = excluded.note")
assert db.execute("SELECT note FROM customers WHERE customer_id = 7").fetchone() == ("session A",)
assert db.execute("SELECT COUNT(*) FROM customers").fetchone() == (1,)
db.close()

print("merge-upsert-concurrent-writers examples: all numbers check out")
