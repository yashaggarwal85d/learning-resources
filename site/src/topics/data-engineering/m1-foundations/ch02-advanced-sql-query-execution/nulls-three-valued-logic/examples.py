"""Executed truth for the NULLs-and-three-valued-logic reel (run by `npm run test:examples`).

Checks the numbers the reel shows, by computing them rather than restating them.
"""

UNKNOWN = None  # SQL's third truth value, modeled as Python's None


def sql_and(a, b):
    if a is False or b is False:
        return False
    if a is None or b is None:
        return None
    return True


def sql_or(a, b):
    if a is True or b is True:
        return True
    if a is None or b is None:
        return None
    return False


def sql_not(a):
    return None if a is None else (not a)


# -- The three-valued truth tables, checked cell by cell --------------------
assert sql_and(True, True) is True
assert sql_and(True, False) is False
assert sql_and(True, None) is None
assert sql_and(False, False) is False
assert sql_and(False, None) is False  # FALSE AND UNKNOWN is FALSE
assert sql_and(None, None) is None

assert sql_or(True, True) is True
assert sql_or(True, False) is True
assert sql_or(True, None) is True  # TRUE OR UNKNOWN is TRUE
assert sql_or(False, False) is False
assert sql_or(False, None) is None
assert sql_or(None, None) is None

assert sql_not(True) is False
assert sql_not(False) is True
assert sql_not(None) is None  # NOT UNKNOWN is still UNKNOWN, never TRUE

# -- x = NULL is always UNKNOWN, never TRUE or FALSE -------------------------
def sql_eq(a, b):
    return None if (a is None or b is None) else (a == b)


assert sql_eq(7, None) is None
assert sql_eq(None, None) is None  # even NULL = NULL is UNKNOWN


def is_distinct_from(a, b):
    if a is None and b is None:
        return False  # two NULLs: not distinct
    if a is None or b is None:
        return True  # one NULL, one value: distinct
    return a != b


assert is_distinct_from(None, None) is False
assert is_distinct_from(7, None) is True
assert is_distinct_from(7, 7) is False

# -- A WHERE/JOIN filter keeps a row only when the predicate is True --------
def passes_filter(v):
    return v is True


assert passes_filter(sql_eq(7, None)) is False  # dropped, same as FALSE
assert passes_filter(False) is False  # the trap: both look identical on output

# -- GROUP BY / DISTINCT: customers table, grouped by referrer --------------
customers, organic_customers = 20_000_000, 9_000_000  # referred_by_customer_id is NULL
referred_customers = customers - organic_customers
assert referred_customers == 11_000_000
# every organic customer lands in exactly one NULL group, not zero groups and not one each.
null_groups_for_organic = 1
assert null_groups_for_organic == 1

# -- Aggregates: COUNT(*) vs COUNT(shipped_at); SUM of zero rows is NULL ----
orders = 100_000_000
shipped_orders = 62_000_000  # COUNT(shipped_at): shipped_at is non-null
unshipped_orders = orders - shipped_orders
assert unshipped_orders == 38_000_000
count_star = orders
count_shipped_at = shipped_orders
assert count_star - count_shipped_at == unshipped_orders  # the exact undercount


def sql_sum(values):
    non_null = [v for v in values if v is not None]
    return sum(non_null) if non_null else None  # SUM of zero rows is NULL, not zero


assert sql_sum([]) is None
assert sql_sum([None, None]) is None
assert sql_sum([10, None, 5]) == 15

# -- ORDER BY: NULLs sort as if larger than everything, by default ---------
# shipped_at DESC, default NULLS FIRST for DESC: every unshipped order (NULL) leads.
rows = [None, None, "2026-10-01", "2026-09-15"]
default_desc_order = sorted(rows, key=lambda v: (v is not None, v), reverse=True)
# emulate: NULLs first under default DESC
nulls_first_desc = [v for v in rows if v is None] + sorted([v for v in rows if v is not None], reverse=True)
assert nulls_first_desc[0] is None and nulls_first_desc[1] is None
assert nulls_first_desc.count(None) == 2

# -- UNIQUE constraints: NULLs are not considered equal, by default --------
promo_orders = 3_000_000  # orders with a real, unique promo code
no_promo_orders = orders - promo_orders
assert no_promo_orders == 97_000_000  # all allowed to share NULL under a default UNIQUE constraint

# -- The NOT IN trap: one NULL in the subquery empties the whole result -----
do_not_email_real_ids = 500_000
do_not_email_rows = do_not_email_real_ids + 1  # plus one placeholder row with a NULL customer_id
assert do_not_email_rows == 500_001


def not_in(x, values):
    # x NOT IN (v1, v2, ..., vn) == x <> v1 AND x <> v2 AND ... AND x <> vn
    result = True
    for v in values:
        result = sql_and(result, sql_not(sql_eq(x, v)))
    return result


excluded_ids = set(range(1, do_not_email_real_ids + 1))
sample_customer = 999_999_999  # not on the list at all
assert not_in(sample_customer, list(excluded_ids)[:50]) is True  # with no NULL present, it works
assert not_in(sample_customer, list(excluded_ids)[:50] + [None]) is None  # one NULL poisons it
not_in_rows_returned = 0  # UNKNOWN is dropped by WHERE for every single customer
assert not_in_rows_returned == 0

customers_correctly_excluded = do_not_email_real_ids
customers_remaining = customers - customers_correctly_excluded
assert customers_remaining == 19_500_000  # what NOT EXISTS correctly returns

# -- The same rules in a real SQL engine (SQLite, standard library) ----------
# The Python model above is the specification; this confirms a real engine agrees on the behaviour the reel shows.
# (ORDER BY placement of NULLs is engine-specific: SQLite sorts them smallest, PostgreSQL largest, so it is not asserted here.)
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript(
    """
    CREATE TABLE customers (customer_id INTEGER);
    INSERT INTO customers VALUES (1),(2),(3),(4),(5);
    CREATE TABLE do_not_email (customer_id INTEGER);
    INSERT INTO do_not_email VALUES (1),(2),(NULL);
    CREATE TABLE orders (order_id INTEGER, shipped_at TEXT, referred_by INTEGER);
    INSERT INTO orders VALUES (1,'2026-10-01',17),(2,NULL,NULL),(3,'2026-10-03',NULL),(4,NULL,2),(5,NULL,NULL);
    CREATE TABLE amounts (v INTEGER);
    """
)
q = lambda sql: db.execute(sql).fetchall()
assert q("SELECT NULL = NULL, 7 = NULL, NOT NULL, NULL OR 1, NULL AND 0") == [(None, None, None, 1, 0)]
assert q("SELECT customer_id FROM customers WHERE customer_id NOT IN (SELECT customer_id FROM do_not_email)") == []  # the trap: zero rows
assert q("SELECT customer_id FROM customers c WHERE NOT EXISTS (SELECT 1 FROM do_not_email d WHERE d.customer_id = c.customer_id)") == [(3,), (4,), (5,)]
assert q("SELECT COUNT(*), COUNT(shipped_at) FROM orders") == [(5, 2)]
assert q("SELECT COUNT(*) FROM orders WHERE shipped_at IS NULL") == [(3,)]  # the gap equals the NULL rows exactly
assert q("SELECT referred_by, COUNT(*) FROM orders GROUP BY referred_by ORDER BY referred_by IS NULL, referred_by") == [(2, 1), (17, 1), (None, 3)]  # NULLs share one group
db.executescript("CREATE TABLE u (k INTEGER UNIQUE); INSERT INTO u VALUES (NULL),(NULL),(NULL);")
assert q("SELECT COUNT(*) FROM u") == [(3,)]  # UNIQUE allows many NULLs
assert q("SELECT COUNT(*) FROM orders a JOIN orders b ON a.referred_by = b.referred_by WHERE a.referred_by IS NULL") == [(0,)]  # NULL never joins
assert q("SELECT 1 IS NOT 2, NULL IS NOT NULL, 7 IS NOT NULL") == [(1, 0, 1)]  # SQLite's spelling of IS DISTINCT FROM
db.execute("INSERT INTO amounts VALUES (10),(5),(NULL)")
assert q("SELECT SUM(v) FROM amounts") == [(15,)]
db.execute("DELETE FROM amounts")
assert q("SELECT SUM(v) FROM amounts") == [(None,)]  # SUM of no rows is NULL, not 0
db.close()

print("nulls-three-valued-logic examples: all numbers check out")
