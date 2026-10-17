"""Executed truth for the semi-joins, anti-joins and existence reel (run by `npm run test:examples`).

The reel's tiny worked example (five customers; orders reference c1 three times and c3 once) is run in a real SQL
engine (SQLite, standard library). The planner behaviour (Semi/Anti join types, the NOT NULL proof) is PostgreSQL's and
is sourced to its docs and source code in the Deep dive, not reproduced here.
"""

import sqlite3

db = sqlite3.connect(":memory:")
db.executescript(
    """
    CREATE TABLE customers (customer_id TEXT PRIMARY KEY);
    INSERT INTO customers VALUES ('c1'),('c2'),('c3'),('c4'),('c5');
    CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id TEXT NOT NULL, referred_by TEXT);
    INSERT INTO orders VALUES (1,'c1',NULL),(2,'c1','c2'),(3,'c1',NULL),(4,'c3',NULL);
    """
)
q = lambda sql: db.execute(sql).fetchall()

# A plain join returns a customer once per matching order: 4 rows for 5 customers.
join_rows = q("SELECT c.customer_id FROM customers c JOIN orders o ON o.customer_id = c.customer_id")
assert len(join_rows) == 4
assert sum(1 for (c,) in join_rows if c == "c1") == 3

# A semi-join (EXISTS) keeps each matching customer exactly once: 2 rows.
semi = q("SELECT c.customer_id FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id) ORDER BY 1")
assert semi == [("c1",), ("c3",)]
assert len(semi) == 2
assert q("SELECT c.customer_id FROM customers c WHERE c.customer_id IN (SELECT customer_id FROM orders) ORDER BY 1") == semi
# join + DISTINCT gives the same answer, but only after producing the duplicates.
assert q("SELECT DISTINCT c.customer_id FROM customers c JOIN orders o ON o.customer_id = c.customer_id ORDER BY 1") == semi

# An anti-join keeps the customers with no match: 3 of the 5, by three different spellings.
anti = [("c2",), ("c4",), ("c5",)]
assert len(anti) == 3
assert q("SELECT c.customer_id FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id) ORDER BY 1") == anti
assert q("SELECT c.customer_id FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id WHERE o.order_id IS NULL ORDER BY 1") == anti
assert q("SELECT customer_id FROM customers WHERE customer_id NOT IN (SELECT customer_id FROM orders) ORDER BY 1") == anti  # orders.customer_id is NOT NULL: safe

# NOT IN over a nullable column (referred_by has NULLs) returns nothing at all.
assert q("SELECT customer_id FROM customers WHERE customer_id NOT IN (SELECT referred_by FROM orders)") == []
# NOT EXISTS over the same data returns the customers that were never referred (c2 was referred once).
assert q("SELECT c.customer_id FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.referred_by = c.customer_id) ORDER BY 1") == [("c1",), ("c3",), ("c4",), ("c5",)]

# A customer with three matching orders appears once under a semi-join.
assert q("SELECT COUNT(*) FROM customers c WHERE c.customer_id = 'c1' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)") == [(1,)]
assert q("SELECT COUNT(*) FROM orders WHERE customer_id = 'c1'") == [(3,)]

# The reel names the PostgreSQL release that added Right Semi Join.
POSTGRES_RELEASE = 18
assert POSTGRES_RELEASE == 18
db.close()

print("semi-joins-anti-joins-existence examples: all numbers check out")
