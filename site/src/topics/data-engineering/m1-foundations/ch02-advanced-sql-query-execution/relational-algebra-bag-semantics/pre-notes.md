- **Table, row, column**: a table is a collection of rows, each row has the same named columns. *Where you meet it:* `orders` has a row per order and columns such as `customer_id` and `amount`.
- **Query result**: what a `SELECT` returns is itself a table, which another query can read. *Where you meet it:* a subquery in `FROM`, or a CTE.
- **Join key**: the column(s) two tables are matched on. *Where you meet it:* `orders.customer_id = customers.customer_id`.
- **Tree**: nodes connected by edges, with one root and no cycles; each node has children below it. *Where you meet it:* a file-system directory listing.
- **Query plan (`EXPLAIN`)**: the engine's printed description of how it will run a query. *Where you meet it:* `EXPLAIN SELECT ...` in PostgreSQL.

**Check yourself:** can you say what `SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id` returns? (Answer: one row per customer, with the number of that customer's orders.)
