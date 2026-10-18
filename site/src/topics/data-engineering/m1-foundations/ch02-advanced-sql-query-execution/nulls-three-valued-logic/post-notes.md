---
id: de.nulls-three-valued-logic
title: NULLs and three-valued logic
---

<section data-section="outcomes">

## After this topic you can

- Write the three-valued truth tables for `AND`, `OR` and `NOT` from memory, and predict the truth value of a compound predicate that mixes known values with NULL.
- Use `IS [NOT] DISTINCT FROM` to compare possibly-null values without the three-valued trap, and explain why `x = NULL` never does what it looks like it does.
- Predict NULL's behaviour correctly in each of five different places — `WHERE`/`JOIN ON`, `GROUP BY`/`DISTINCT`, `ORDER BY`, aggregates, and `UNIQUE` constraints — because NULL is handled by a *different* rule in each one.
- Diagnose and fix the two classic silent bugs this causes: a `NOT IN` that quietly returns zero rows (vanishing rows), and a `COUNT(column)` that silently undercounts what a `COUNT(*)` would have reported.

</section>

<section data-section="internals">

## Into the internals

Every operator in the last topic assumed a value was simply there. In the shop's data it frequently isn't: `orders.shipped_at` is NULL until an order ships, and `orders.referred_by_customer_id` is NULL when nobody referred the customer. NULL means "unknown," and SQL's logic has a third truth value for exactly that — which is also the single largest source of SQL answers that are wrong without ever raising an error.

### The three-valued truth tables

SQL's comparison and logical operators don't return `TRUE`/`FALSE`; they return `TRUE`/`FALSE`/`UNKNOWN`, and PostgreSQL's own documentation states the tables plainly (PostgreSQL 18 docs, §9.1, "Logical Operators"):

| a | b | a AND b | a OR b |
|---|---|---|---|
| TRUE | TRUE | TRUE | TRUE |
| TRUE | FALSE | FALSE | TRUE |
| TRUE | NULL | NULL | TRUE |
| FALSE | FALSE | FALSE | FALSE |
| FALSE | NULL | FALSE | NULL |
| NULL | NULL | NULL | NULL |

| a | NOT a |
|---|---|
| TRUE | FALSE |
| FALSE | TRUE |
| NULL | NULL |

Two rows earn a second look. `TRUE OR NULL` is `TRUE` — one known-true branch is enough, no matter how unknown the other is — and `FALSE AND NULL` is `FALSE` for the same reason in reverse. But `NOT NULL` is `NULL`, never `TRUE`: "unknown" negated is still "unknown." This is why `NOT (x NOT IN (…))` is not a safe way to flip a predicate that might be `UNKNOWN` — negating `UNKNOWN` just gives `UNKNOWN` back.

A `WHERE`, `JOIN ON` or `HAVING` clause keeps a row only when its condition evaluates to the literal value `TRUE`. `UNKNOWN` is *not* `FALSE` — it is a different value that happens to produce the same outcome (the row is dropped) in a filter, which is exactly the trap: a predicate that is `UNKNOWN` for a row looks, from the output, identical to one that is `FALSE`, and the row vanishes silently either way.

### Ordinary comparisons: `x = NULL` is always wrong

"Ordinary comparison operators yield null (signifying 'unknown'), not true or false, when either input is null. For example, `7 = NULL` yields null, as does `7 <> NULL`" (PostgreSQL 18 docs, §9.2, "Comparison Functions and Operators"). This is not a special case to memorize — it falls directly out of what NULL means: if you don't know a value, you also don't know whether it equals seven. The docs are blunt about the fix: "Do not write `expression = NULL` because NULL is not 'equal to' NULL... use the predicates `expression IS NULL` / `expression IS NOT NULL`."

When you *do* need to compare two possibly-null values and get a real `TRUE`/`FALSE` back — "is this row's `shipped_at` the same as that one's, treating two NULLs as equal" — use `IS [NOT] DISTINCT FROM`: "For non-null inputs, `IS DISTINCT FROM` is the same as the `<>` operator. However, if both inputs are null it returns false, and if only one input is null it returns true... these predicates effectively act as though null were a normal data value, rather than 'unknown'" (same source, §9.2). `IS NOT DISTINCT FROM` is the equivalent drop-in replacement for `=` that never degrades to `UNKNOWN`.

### Five places, five different rules

NULL does not behave one way; it behaves *five* different ways depending on which clause is looking at it, and conflating them is where most of the damage happens.

1. **`WHERE` / `JOIN ON` — `UNKNOWN` is filtered out like `FALSE`.** A row with a NULL in a joined column (`orders.referred_by_customer_id`) never satisfies `orders.referred_by_customer_id = customers.customer_id` — the comparison is `UNKNOWN`, so an `INNER JOIN` on that column silently drops every order with no referrer. If that's not the intent, the fix is a `LEFT JOIN` (keeping the order with NULLs on the unmatched side), not a different comparison operator.
2. **`GROUP BY` / `DISTINCT` — NULLs are grouped together, by special-case rule.** This looks like it should contradict rule 1 — and it does, deliberately. The documentation is explicit: "two rows are considered distinct if they differ in at least one column value. Null values are considered equal in this comparison" (PostgreSQL 18 docs, §7.3.3, "DISTINCT"). `GROUP BY referred_by_customer_id` puts every organically-acquired order (NULL referrer) into one group, not into no group and not into one group per order. The SQL standard carves out this exception specifically so grouping and deduplication are usable at all; ordinary `=` comparison keeps its normal "unknown" rule everywhere else.
3. **`ORDER BY` — NULLs sort as if larger than everything.** "By default, null values sort as if larger than any non-null value; that is, `NULLS FIRST` is the default for `DESC` order, and `NULLS LAST` otherwise" (PostgreSQL 18 docs, §7.5, "Sorting Rows"). Sorting the shop's orders by `shipped_at DESC` to see the most recently shipped first puts every *unshipped* order (`shipped_at IS NULL`) at the very top by default — exactly backwards from "most recent" — unless the query says `ORDER BY shipped_at DESC NULLS LAST`.
4. **Aggregates — every one but `count(*)` ignores NULLs, and an aggregate over zero rows is NULL, not zero.** PostgreSQL's own function table draws the line precisely: `count(*)` "computes the number of input rows"; `count(expression)` "computes the number of input rows in which the input value is not null"; `sum(...)` "computes the sum of the non-null input values" (PostgreSQL 18 docs, §9.21, Table 9.62). And: "except for `count`, these functions return a null value when no rows are selected. In particular, `sum` of no rows returns null, not zero as one might expect" (same table's notes) — a `SUM(amount)` over a customer with zero orders is NULL, and `NULL + anything` is itself NULL, a second trap waiting in any later arithmetic.
5. **`UNIQUE` constraints — NULLs are *not* considered equal to each other, by default.** "For the purpose of a unique constraint, null values are not considered equal, unless `NULLS NOT DISTINCT` is specified" (PostgreSQL 18 docs, `CREATE TABLE`). A `UNIQUE` constraint on `referred_by_customer_id` would happily accept any number of orders with a NULL referrer — only *non-null* duplicates are rejected. `NULLS NOT DISTINCT`, added in PostgreSQL 15, flips this to the opposite rule when "at most one NULL" is actually what you mean (PostgreSQL 15 release notes, "Allow unique constraints and indexes to treat NULL values as not distinct").

Rules 1 and 3 treat NULL as "unknown, so push it to one end or drop it." Rules 2 and 5 treat NULL as "a value, for comparison purposes" — but rule 2 says all NULLs are the same value (one group) while rule 5, by default, says no two NULLs are the same value (both allowed to coexist). There is no single mental model that covers all five; the only reliable approach is to know which clause you're in and apply its specific rule.

### Vanishing rows: the `NOT IN` trap

This is rule 1's most damaging consequence, and it is specified, not accidental. PostgreSQL's documentation for subquery `IN`/`NOT IN` states it exactly: "Note that if the left-hand expression yields null, **or if there are no equal right-hand values and at least one right-hand row yields null**, the result of the `NOT IN` construct will be null, not true. This is in accordance with SQL's normal rules for Boolean combinations of null values" (PostgreSQL 18 docs, §9.24.3, "NOT IN"). Spelled out: `x NOT IN (v1, v2, …, NULL)` is really `x <> v1 AND x <> v2 AND … AND x <> NULL`, and that last conjunct is always `UNKNOWN`; by the `AND` table above, `UNKNOWN AND anything-not-FALSE` is `UNKNOWN`, which `WHERE` then drops. So one NULL anywhere in a `NOT IN` subquery's results turns *every non-matching row* of the outer query into a dropped row — not an error, not a warning, just an empty or near-empty result where a real answer was expected.

Suppose the shop keeps a `do_not_email` list of `customer_id`s that includes a placeholder row with a NULL `customer_id` (a bad data load, or a legitimately "unknown customer" sentinel row):

```sql
-- Looks reasonable. If do_not_email.customer_id ever contains a NULL row,
-- this returns ZERO rows — every single customer "fails" the NOT IN.
SELECT customer_id FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM do_not_email);
```

The fix is `NOT EXISTS`, which never has this failure mode because it tests row existence, not a chain of `<>` comparisons against possibly-null values:

```sql
SELECT c.customer_id FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM do_not_email d WHERE d.customer_id = c.customer_id
);
```

(`NOT EXISTS` and its relationship to `NOT IN` as an anti-join is topic 3's subject in full; here it is the fix, not yet the mechanism.) A cheaper patch that keeps `NOT IN` is to filter the NULL out of the subquery explicitly: `... NOT IN (SELECT customer_id FROM do_not_email WHERE customer_id IS NOT NULL)` — correct, but it depends on remembering to add that filter every time, which `NOT EXISTS` doesn't require.

### `COUNT(column)` vs `COUNT(*)`: the silent undercount

Both are "correct" SQL; the bug is using the one that doesn't match the question. `COUNT(*)` counts rows. `COUNT(column)` counts rows where that specific column is non-null. Over the `orders` table, `COUNT(*)` is "how many orders exist," and `COUNT(shipped_at)` is "how many orders have shipped" — a materially smaller number whenever any order is `pending`, `paid`, `refunded` or `cancelled` rather than `shipped`/`delivered`. Written as "total orders," `COUNT(shipped_at)` silently reports a *different, smaller* quantity with no error and no warning — it is a perfectly valid aggregate, just not an answer to the question asked. The fix is not a rule to memorize so much as a habit: read every `COUNT(x)` in review and ask "is `x` ever NULL on a row I meant to count?"

</section>

<section data-section="lab">

## Build, break, measure

### Lab · The SQL semantics trap suite, part one

This hosts the first two traps of the §2.1 chapter lab; topic 4 adds the recursive-CTE cycle trap and topic 9 the concurrent-`MERGE` trap, and this topic closes the suite with a cross-dialect check.

1. **Plant the `NOT IN` trap.** Build a `do_not_email` table from `customers` with one deliberately NULL `customer_id` row inserted. Run the `NOT IN` query above and confirm it returns zero rows against a `customers` table that is clearly not all on the exclusion list. Then run the `NOT EXISTS` rewrite and confirm it returns the expected (near-complete) set. Report the row counts side by side — *measure in build*, since the exact count depends on the exclusion list's size, but the structural result (zero vs non-zero) is guaranteed by the mechanism above, not by chance.
2. **Plant the `COUNT` trap.** Over the 100,000,000-row `orders` table, run `SELECT COUNT(*), COUNT(shipped_at) FROM orders;` and confirm the two numbers differ by exactly the count of orders whose `status` is not `shipped` or `delivered`. Cross-check with `SELECT COUNT(*) FROM orders WHERE shipped_at IS NULL;` — the gap between the first two counts must equal this third number exactly, which is a correctness assertion your lab code should check, not just display (*measure in build* for the actual figures, which depend on the generated data's status mix).
3. **Transpile and diff with SQLGlot.** Take the fixed (`NOT EXISTS`) query and run it through [SQLGlot](https://github.com/tobymao/sqlglot) to translate it from the PostgreSQL dialect to the DuckDB dialect (`sqlglot.transpile(sql, read="postgres", write="duckdb")`); run both the original and the transpiled query against equivalent PostgreSQL and DuckDB tables and diff the results. They should match exactly — this closes the suite by confirming the NULL-handling rules above are not a PostgreSQL idiosyncrasy but standard SQL semantics that a faithful transpiler preserves across engines.

</section>

<section data-section="production">

## In production — a review checklist

- **Never write `x = NULL` or `x <> NULL`.** Use `IS [NOT] NULL` for a null test, and `IS [NOT] DISTINCT FROM` when you need a real `TRUE`/`FALSE` out of a comparison that might involve NULL on either side.
- **Treat every `NOT IN (subquery)` as a landmine until proven safe.** Either prove the subquery's column is declared `NOT NULL`, filter NULLs out of it explicitly, or default to `NOT EXISTS` / an anti-join, which has no NULL failure mode at all.
- **Review every `COUNT(x)` for which `x` you meant.** `COUNT(*)` and `COUNT(column)` are both "correct" syntax; only one of them answers the question in the ticket. State in a comment which one you intend when it's not obvious from the column name.
- **State `NULLS FIRST`/`NULLS LAST` explicitly wherever "most recent" or "lowest" matters and the sorted column can be NULL.** The default (NULLs sort last ascending, first descending) is easy to get backwards from the intended "where do incomplete rows belong" answer.
- **Decide on purpose whether a `UNIQUE` constraint should allow several NULLs.** The default does; add `NULLS NOT DISTINCT` (PostgreSQL 15+) the moment "at most one NULL" is actually a business rule, rather than discovering duplicate NULLs in production.
- **Remember `SUM`/`AVG` of zero rows is NULL, not zero.** Wrap aggregates that feed further arithmetic in `COALESCE(..., 0)` when "no rows" and "zero" need to mean the same downstream number.

</section>
