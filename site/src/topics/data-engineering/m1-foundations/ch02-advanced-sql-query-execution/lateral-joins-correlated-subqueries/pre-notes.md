- **Subquery in FROM**: a `SELECT` used like a table, with an alias. *Where you meet it:* `FROM (SELECT … ) AS recent`.
- **Correlated**: referring to a column of an outer query. *Where you meet it:* `WHERE o.customer_id = c.customer_id` inside a subquery.
- **ORDER BY … LIMIT n**: sort and keep the first n rows. *Where you meet it:* "latest five orders" in a dashboard query.
- **Table function (set-returning function)**: a function that returns rows rather than one value. *Where you meet it:* `generate_series(1, 10)` in PostgreSQL.
- **Nested loop**: a join method that, for each row of one side, searches the other. *Where you meet it:* `Nested Loop` in `EXPLAIN` output.

**Check yourself:** what does `SELECT * FROM orders ORDER BY event_time DESC LIMIT 3` return? (Answer: the three most recent orders in the whole table, not per customer.)
