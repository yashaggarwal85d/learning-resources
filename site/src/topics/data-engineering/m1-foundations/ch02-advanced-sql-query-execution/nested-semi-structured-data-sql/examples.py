"""Executed truth for the nested and semi-structured data reel (run by `npm run test:examples`).

SQLite's JSON functions (json_each) stand in for unnest. The two behaviours the reel shows, a Cartesian product from two
separate unnest items and a positional zip from one call, are standard row-set semantics and run the same way.
PostgreSQL specifics (JSON_TABLE added in 17, multi-argument unnest NULL padding) are sourced in the Deep dive.
"""

import json
import sqlite3

ORDER_ID = 42
TAGS = ["bogo", "winter", "vip"]
DISCOUNTS = [5, 10, 15]
METADATA = {"device": "ios", "utm": {"source": "email"}}
JSON_TABLE_RELEASE = 17  # JSON_TABLE() arrived in PostgreSQL 17
assert JSON_TABLE_RELEASE == 17 and ORDER_ID == 42

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (order_id INT, tags TEXT, discount_amounts TEXT, metadata TEXT)")
db.execute("INSERT INTO orders VALUES (?,?,?,?)", (ORDER_ID, json.dumps(TAGS), json.dumps(DISCOUNTS), json.dumps(METADATA)))
db.execute("INSERT INTO orders VALUES (43, ?, ?, '{}')", (json.dumps(TAGS + ["new"]), json.dumps(DISCOUNTS)))
q = lambda sql: db.execute(sql).fetchall()

# One unnest: one row per element, in order.
assert len(q("SELECT j.value FROM orders o, json_each(o.tags) j WHERE o.order_id = 42")) == 3

# Two unnest calls as two FROM items: every tag pairs with every discount.
product = q("SELECT t.value, d.value FROM orders o, json_each(o.tags) t, json_each(o.discount_amounts) d WHERE o.order_id = 42")
assert len(product) == 9 == 3 * 3
assert ("bogo", 15) in product  # a wrong pairing

# One call over both arrays: zipped by position (join on the array index).
zip42 = q("SELECT t.value, d.value FROM orders o JOIN json_each(o.tags) t JOIN json_each(o.discount_amounts) d ON d.key = t.key WHERE o.order_id = 42 ORDER BY t.key")
assert zip42 == [("bogo", 5), ("winter", 10), ("vip", 15)]
assert len(zip42) == 3

# Mismatched lengths: 4 tags, 3 discounts. The multi-argument form pads the shorter side with NULL, so 4 rows.
zip43 = q("SELECT t.value, d.value FROM orders o JOIN json_each(o.tags) t LEFT JOIN json_each(o.discount_amounts) d ON d.key = t.key WHERE o.order_id = 43 ORDER BY t.key")
assert len(zip43) == 4
assert zip43[-1] == ("new", None)
assert len(q("SELECT 1 FROM orders o, json_each(o.tags) t, json_each(o.discount_amounts) d WHERE o.order_id = 43")) == 12  # the product for 43

# WITH ORDINALITY: the position, counted from 1 (json_each's key counts from 0).
assert [k + 1 for (k,) in q("SELECT t.key FROM orders o, json_each(o.tags) t WHERE o.order_id = 42 ORDER BY t.key")] == [1, 2, 3]

# Arrow operators: -> keeps JSON, ->> returns text.
assert q("SELECT metadata -> '$.utm' FROM orders WHERE order_id = 42") == [('{"source":"email"}',)]
assert q("SELECT metadata ->> '$.utm.source' FROM orders WHERE order_id = 42") == [("email",)]
assert q("SELECT metadata ->> '$.device' FROM orders WHERE order_id = 42") == [("ios",)]
db.close()

print("nested-semi-structured-data-sql examples: all numbers check out")
