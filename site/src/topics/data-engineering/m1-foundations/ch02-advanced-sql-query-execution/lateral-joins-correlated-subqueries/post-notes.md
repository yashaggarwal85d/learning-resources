---
id: de.lateral-joins-correlated-subqueries
title: LATERAL joins and correlated subqueries
---

<section data-section="outcomes">

## After this topic you can

- Say exactly what `LATERAL` changes about how a `FROM` item is evaluated, and why a non-`LATERAL` subquery can't reference an earlier `FROM` item at all.
- Write a top-N-per-group query with `LATERAL` + `ORDER BY` + `LIMIT`, something a plain join cannot express.
- Translate between PostgreSQL's `LATERAL` and SQL Server's `CROSS APPLY`/`OUTER APPLY`.
- State which correlated subqueries the planner can flatten into an ordinary join (decorrelation, in full in topic 17) and which — like a per-row top-N — it structurally cannot.

</section>

<section data-section="internals">

## Into the internals

Every join so far combined two tables using a condition that doesn't care about row order *within* the match — "same customer_id," "same product_id." Some real questions aren't like that: "this customer's three most recent orders" needs the outer row's identity *before* it can even decide which three rows to pick. `LATERAL` is the keyword that allows exactly this.

### What `LATERAL` actually changes

"Subqueries appearing in `FROM` can be preceded by the key word `LATERAL`. This allows them to reference columns provided by preceding `FROM` items. (Without `LATERAL`, each subquery is evaluated independently and so cannot cross-reference any other `FROM` item.)" (PostgreSQL 18 docs, §7.2.1.5, "LATERAL Subqueries"). The evaluation model is explicit: "for each row of the `FROM` item providing the cross-referenced column(s)... the `LATERAL` item is evaluated using that row... [and] the resulting row(s) are joined as usual with the rows they were computed from. This is repeated for each row... from the column source table(s)" (same source). A `LATERAL` item is, mechanically, a per-row computation — table functions after `LATERAL` even make the keyword optional, "but for functions the key word is optional; the function's arguments can contain references to columns provided by preceding `FROM` items in any case."

The documentation is candid that `LATERAL` buys nothing over a plain join for a simple equality: `SELECT * FROM foo, LATERAL (SELECT * FROM bar WHERE bar.id = foo.bar_id) ss` "has exactly the same result as the more conventional `SELECT * FROM foo, bar WHERE bar.id = foo.bar_id`." `LATERAL`'s actual value shows up once the per-row computation can't be expressed as a join predicate at all — most commonly, when it has its own `ORDER BY`/`LIMIT`.

### Top-N-per-group, the pattern a plain join can't express

"This customer's three most recent orders, for every customer" needs a *different* top three per customer — not a global top three, and not expressible as `WHERE` on a joined row, because "is this row in the top three for its own customer" depends on comparing it to the *other* rows of that same customer, something `WHERE` can't see one row at a time.

```sql
SELECT c.customer_id, recent.*
FROM customers c
CROSS JOIN LATERAL (
  SELECT order_id, event_time, amount
  FROM orders o
  WHERE o.customer_id = c.customer_id
  ORDER BY event_time DESC
  LIMIT 3
) AS recent;
```

For each row of `customers`, the `LATERAL` subquery reruns with that row's `customer_id` substituted in, sorts just that customer's orders, and keeps three. (Topic 12 shows the other standard way to write top-N-per-group, with `ROW_NUMBER() OVER (PARTITION BY ...)` and a filter — the two aren't the same plan shape, and which one the planner prefers depends on whether there's an index that makes the `LATERAL` version's per-row `ORDER BY ... LIMIT` cheap, versus a window function's single sort of the whole joined set.)

### `LEFT JOIN LATERAL ... ON TRUE`: keeping the outer row even with no match

An anti-join (topic 3) can tell you a customer has no orders, but it can't hand back *any columns from the almost-match* because, by definition, there wasn't one. `LATERAL` can, because it is still a per-row computation that may legitimately return zero rows for a given outer row — paired with `LEFT JOIN`, the outer row survives anyway, with NULLs. PostgreSQL's own example states the pattern directly: "it is often particularly handy to `LEFT JOIN` to a `LATERAL` subquery, so that source rows will appear in the result even if the `LATERAL` subquery produces no rows for them" — their example finds manufacturers with no products via `LEFT JOIN LATERAL get_product_names(m.id) pname ON true WHERE pname IS NULL`. Mapped onto the shop: "every customer, with their most recent order if they have one, and NULL if they don't" —

```sql
SELECT c.customer_id, recent.order_id, recent.event_time
FROM customers c
LEFT JOIN LATERAL (
  SELECT order_id, event_time FROM orders o
  WHERE o.customer_id = c.customer_id
  ORDER BY event_time DESC
  LIMIT 1
) AS recent ON true;
```

— every customer appears exactly once, referred-or-not, ordered-or-not, with the matched columns alongside when there is a match. An anti-join only ever answers yes/no; `LATERAL` answers yes/no *and* brings back the best match's own columns.

### `CROSS APPLY` / `OUTER APPLY`: the same idea, a different name

SQL Server (and Sybase before it) spell the identical mechanism `APPLY` instead of `LATERAL`: "`CROSS APPLY`... returns only rows from the outer table that produce a result set from the table-valued function" (equivalent to `LATERAL` with a plain, inner-join-like `FROM`), while "if you want the query to produce rows for those [outer rows] without [matches]... use `OUTER APPLY` instead" (Microsoft Learn, "FROM clause plus JOIN, APPLY, PIVOT") — a direct match for `LEFT JOIN LATERAL ... ON true`. The translation is mechanical: `CROSS APPLY` ↔ `, LATERAL (...)` (or `JOIN LATERAL`), `OUTER APPLY` ↔ `LEFT JOIN LATERAL ... ON true`.

### What the planner can and can't flatten

A correlated subquery that only expresses a simple equality — the `bar.id = foo.bar_id` example above — can be *pulled up* by the planner into a genuine join, after which it's just as reorderable as any other join (topic 1's commutativity/associativity). PostgreSQL's planner source states the exact boundary (`src/backend/optimizer/prep/prepjointree.c`, `is_simple_subquery()`): "Can't pull up a subquery involving grouping, aggregation, SRFs, **sorting**, **limiting**, or `WITH`" — checked directly against the subquery's `sortClause`, `limitOffset` and `limitCount` fields. A top-N-per-group `LATERAL` subquery fails that test on purpose (it has both an `ORDER BY` and a `LIMIT`), so it is never flattened: it stays a genuinely per-row computation, planned as a nested-loop-shaped execution where the inner side is literally re-run (or re-sought, if an index on `orders (customer_id, event_time)` makes each run a cheap index scan) once per outer row. This is the sharpest possible preview of topic 17's full subject — subquery rewriting and decorrelation — and the general technique for the equality case (turning an arbitrary correlated subquery into an equivalent join) is exactly what Neumann & Kemper's unnesting work (named there in full) generalizes well past the cases the planner above can flatten on its own.

</section>

<section data-section="lab">

## Build, break, measure

### Try it · Two plans for the same top-N question

1. **Compare `LATERAL` against the window-function alternative.** Run `EXPLAIN` on the top-three-recent-orders `LATERAL` query above, and on an equivalent `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY event_time DESC)` query filtered to rank at most three (topic 12's technique, usable here ahead of its own full treatment). Confirm the `LATERAL` plan shows a nested-loop shape with a `Limit` on its inner side, while the window-function plan shows one big sort of the whole joined set followed by a filter. Compare total cost with and without an index on `orders (customer_id, event_time DESC)` (*measure in build* — the crossover depends on customer and order counts, but the plan *shapes* are guaranteed by the mechanism above, not by the data).
2. **Confirm the pull-up boundary.** Rewrite the simple `foo`/`bar` style example (a `LATERAL` subquery with no `ORDER BY`/`LIMIT` of its own, just an equality filter) and confirm its `EXPLAIN` plan is identical to the equivalent plain join — then add a `LIMIT 1` inside the subquery and confirm the plan changes to a nested-loop shape, directly observing the `is_simple_subquery` boundary from the source.

</section>

<section data-section="production">

## In production — a review checklist

- **Reach for `LATERAL` only when the per-row computation genuinely can't be a join predicate** (it has its own `ORDER BY`/`LIMIT`, calls a set-returning function with an outer-row argument, or needs to short-circuit per row) — a plain equality belongs in an ordinary join, which the planner can freely reorder.
- **Index the correlated column(s) for a top-N-per-group `LATERAL` query.** The whole performance case for this pattern over a window function rests on each per-row `ORDER BY ... LIMIT` being a cheap index scan, not a full sort of that group every time.
- **Use `LEFT JOIN LATERAL ... ON true` when you need the almost-match's columns, not just a yes/no.** Reach for the anti-join (topic 3) only when existence alone is the question.
- **When porting from SQL Server, map `CROSS APPLY` to `LATERAL`/`JOIN LATERAL` and `OUTER APPLY` to `LEFT JOIN LATERAL ... ON true`,** and double check which side's columns are expected to be NULL-able in the result.

</section>
