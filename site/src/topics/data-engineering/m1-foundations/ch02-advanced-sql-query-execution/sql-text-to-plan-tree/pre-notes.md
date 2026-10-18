- **Catalog (system tables)**: the database's own tables describing its tables, columns, functions and types. *Where you meet it:* `information_schema` or `pg_catalog`.
- **View**: a stored query used like a table. *Where you meet it:* `CREATE VIEW paid_orders AS SELECT …`.
- **Index**: a structure that lets the database find rows by a column without scanning the whole table. *Where you meet it:* `CREATE INDEX` on a column you filter by often.
- **Cost estimate**: the planner's guess at the work a plan will do, in internal units. *Where you meet it:* `cost=0.00..35.50` in `EXPLAIN`.

**Check yourself:** can a SQL parser, which does no catalog lookups, tell that `SELECT * FROM missing` is wrong? (Answer: no, the grammar is fine; the missing table is found when names are resolved.)
