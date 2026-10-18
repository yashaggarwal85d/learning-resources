- **Correlated subquery**: a subquery that refers to a column of the outer query, so it is evaluated against each outer row. *Where you meet it:* `WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)`.
- **Foreign key and primary key**: a primary key uniquely identifies a row; a foreign key points at another table's key. *Where you meet it:* `orders.customer_id` refers to `customers.customer_id`.
- **NOT NULL constraint**: a declared rule that a column can never hold NULL. *Where you meet it:* `customer_id INTEGER NOT NULL` in a `CREATE TABLE`.
- **Planner and plan node**: the planner chooses how a query will run; each step of the chosen plan is a node. *Where you meet it:* the lines of `EXPLAIN` output.
- **Join (inner, left outer)**: an inner join keeps matched pairs; a left outer join also keeps unmatched left rows with NULLs on the right. *Where you meet it:* `LEFT JOIN` to find rows with no match.

**Check yourself:** after `customers LEFT JOIN orders ON …`, what do the order columns hold for a customer with no orders? (Answer: NULL in every order column.)
