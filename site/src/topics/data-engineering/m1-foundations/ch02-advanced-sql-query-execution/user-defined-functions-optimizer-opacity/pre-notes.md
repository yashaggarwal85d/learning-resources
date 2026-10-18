- **Query planner / optimizer**: the part of a database that picks how to run a query, using cost estimates. *Where you meet it:* it is the reason `EXPLAIN` output differs from your query's shape.
- **Pushdown**: applying a filter or projection as early as possible in the plan. *Where you meet it:* the earlier "filter before the join" rewrite.
- **Constant folding**: replacing an expression of constants by its value before execution. *Where you meet it:* `WHERE x > 2 + 3` is planned as `x > 5`.
- **Parallel workers**: extra processes that split one query's scan or aggregation. *Where you meet it:* `Gather` and `Workers Planned` in a PostgreSQL plan.
- **Serialization**: converting a value to a byte form to send it across a boundary. *Where you meet it:* passing data between a JVM and a Python process.

**Check yourself:** why can the planner evaluate `2 + 3` once but not `random()`? (Answer: the sum never changes; `random()` may return a different value on every call.)
