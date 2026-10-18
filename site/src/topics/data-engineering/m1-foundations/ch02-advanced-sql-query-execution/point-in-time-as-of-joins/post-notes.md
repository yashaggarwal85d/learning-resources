---
id: de.point-in-time-as-of-joins
title: Point-in-time and as-of joins
---

<section data-section="outcomes">

## After this topic you can

- Explain why "join each event to the latest reference value at or before its timestamp" is an inequality join, not an equi-join, and why that makes it a genuinely different problem.
- Write a point-in-time join three ways — correlated subquery, `LATERAL` + `LIMIT`, and native `ASOF JOIN` — and translate the native syntax between DuckDB, Snowflake and ClickHouse.
- Explain temporal leakage in a training set, and why an as-of join is the mechanism that prevents it.
- Say, at a boundary level, what makes a bitemporal as-of query a harder problem than the single-timestamp version covered here.

</section>

<section data-section="internals">

## Into the internals

This chapter's `price_history` table holds one row per *change* in a product's price (`product_id`, `price`, `valid_from`), not one row per order. "What price was actually in effect when this order was placed" needs each `orders` row matched to the *latest* `price_history` row whose `valid_from` is at or before that order's `event_time` — and that is not a question an equi-join (topic 1's `⋈` on equality) can answer at all.

### Why this is an inequality join

An ordinary join matches rows on equality: `orders.product_id = price_history.product_id`. That alone would match every order to *every* historical price for its product — exactly the Cartesian-style explosion topic 1 and topic 7 both warned about. The actual requirement adds an inequality — `price_history.valid_from <= orders.event_time` — and then a tiebreak: of all the historical prices that satisfy that inequality, keep only the single most recent one. This two-part shape (an equality to narrow the candidates, an inequality plus "closest wins" to pick exactly one) is what a **point-in-time** or **as-of** join is, and it needs real machinery beyond a plain join condition.

### Three ways to write it

**1. Correlated subquery** — direct, and exactly as fragile as topic 11 already warned a correlated subquery can be:

```sql
SELECT o.order_id, o.event_time,
  (SELECT ph.price FROM price_history ph
   WHERE ph.product_id = o.product_id AND ph.valid_from <= o.event_time
   ORDER BY ph.valid_from DESC LIMIT 1) AS price_at_order_time
FROM orders o;
```

**2. `LATERAL` + `ORDER BY ... LIMIT 1`** — topic 6's top-N-per-group pattern, applied here instead of there:

```sql
SELECT o.order_id, o.event_time, p.price
FROM orders o
CROSS JOIN LATERAL (
  SELECT price FROM price_history ph
  WHERE ph.product_id = o.product_id AND ph.valid_from <= o.event_time
  ORDER BY ph.valid_from DESC LIMIT 1
) p;
```

Both of these compute the identical answer, and both can be made fast with the right index — an index on `price_history (product_id, valid_from)` turns the inner "latest row at or before this timestamp" lookup into a cheap, bounded index seek per outer row, exactly as topic 6 argued for its own top-N-per-group case. Without that index, either form degrades toward the per-row re-scan topic 11 warned the self-join/correlated-subquery formulation always risks.

**3. A native `ASOF JOIN`** — purpose-built syntax for exactly this shape, implemented natively by several analytical engines, each with its own spelling:

```sql
-- DuckDB
SELECT o.order_id, o.event_time, p.price
FROM orders o ASOF JOIN price_history p
  ON o.product_id = p.product_id AND o.event_time >= p.valid_from;

-- ClickHouse
SELECT o.order_id, o.event_time, p.price
FROM orders o ASOF LEFT JOIN price_history p
  ON o.product_id = p.product_id AND p.valid_from <= o.event_time;

-- Snowflake
SELECT o.order_id, o.event_time, p.price
FROM orders o ASOF JOIN price_history p
  MATCH_CONDITION (o.event_time >= p.valid_from)
  ON o.product_id = p.product_id;
```

DuckDB's own documentation states the general shape plainly: "`ASOF` join requires at least one inequality condition on the ordering field... [it] joins each left side row with at most one right side row. It can be specified as an `OUTER` join to find unpaired rows" (DuckDB docs, "FROM Clauses"). ClickHouse's version separates the equality columns from "the `asof_column`," which is "always the last one in the `USING` clause" and matches on "the closest match condition... Equal timestamp values are the closest if available" (ClickHouse docs, "JOIN"). Snowflake's `MATCH_CONDITION` names the comparison explicitly and separately from the ordinary equality `ON` clause, and documents the same null-padding behavior for an unmatched left row: "when there is no match for a row in the left table, the columns from the right table are null-padded" (Snowflake SQL reference, "ASOF JOIN"). Three different spellings, the identical underlying operator: a single matching right-side row per left-side row, chosen by inequality-closeness rather than equality.

A native `ASOF JOIN` typically plans very differently from the hand-rolled versions above — because both sides are naturally processed in time order, the planner can often use a merge-style algorithm that walks both sorted streams together in one pass, rather than a nested loop re-seeking an index once per outer row. ClickHouse's own documentation notes `ASOF JOIN` is "supported only by [the] hash and full_sorting_merge join algo[rithms]" — a dedicated algorithmic path, not the general-purpose join machinery pressed into service.

### Leakage-free training sets

Machine learning features computed by joining each historical observation to "the current value" of some signal — rather than the value that was actually known *at the time of that observation* — commit a specific, insidious bug called **temporal leakage**: the model trains on information from the future relative to each training example, which can look like good offline accuracy and then fail in production, where the future genuinely isn't available yet. An as-of join is exactly the mechanism that prevents this by construction: joining each training example to the feature value whose own timestamp is at or before the example's own timestamp forces every feature to be something that was genuinely knowable when that example occurred. This earns the full treatment in Chapter 17 (feature stores, point-in-time correctness); here it is simply the single most common real-world reason a point-in-time join matters outside of time-series analytics proper.

### Bitemporal as-of queries: one more time axis

Everything above tracks one timestamp — when a fact was true in the real world (`valid_from`). A genuinely **bitemporal** system tracks a second, independent axis: when the database *learned about* that fact (its transaction/system time), which can differ from when the fact actually became true (a late-arriving correction, say). A bitemporal as-of query asks a two-part question — "as of transaction time T, what did we believe was true as of valid time V" — and needs both axes modeled explicitly to answer correctly, including the detail that a correction only known later should not retroactively change what an earlier report would have shown. This is a materially harder problem than the single-timestamp as-of join covered here, and it gets its own full treatment in §3.2.

</section>

<section data-section="lab">

## Build, break, measure

### Lab · Point-in-time join, three ways

This hosts the §2.2 chapter lab's final part.

1. **Build all three.** Implement the correlated-subquery, `LATERAL`, and (on DuckDB) native `ASOF JOIN` versions of the orders-to-price-at-order-time join, and confirm all three return byte-identical results.
2. **Compare plans and runtimes.** Run `EXPLAIN (ANALYZE)` on all three in PostgreSQL (correlated subquery and `LATERAL` only — no native `ASOF JOIN` there) and the native `ASOF JOIN` plus at least one hand-rolled version in DuckDB. Compare with and without an index on `price_history (product_id, valid_from)` (*measure in build* for the actual numbers, but expect the index to matter far more to the correlated-subquery/`LATERAL` plans than to the native `ASOF JOIN`, which is built to need it less).
3. **Reproduce a leakage bug on purpose.** Build a feature that joins each order to `products.current_price` instead of the as-of `price_history` value, confirm it silently returns a different (and, for any order placed before the most recent price change, wrong) number than the as-of join — the exact shape of a temporal-leakage bug, made visible deliberately.

</section>

<section data-section="production">

## In production — a review checklist

- **Reach for a native `ASOF JOIN` first on an engine that has one.** It's purpose-built, usually faster than a hand-rolled equivalent, and far more readable in a code review.
- **On an engine without native `ASOF JOIN` (PostgreSQL), use `LATERAL` with an index on the as-of columns, not a bare correlated subquery in the select list** — the two compute the same answer, but only the indexed `LATERAL` version reliably stays cheap at scale.
- **Audit every feature-engineering join for "current value" vs "as-of value."** A join to "the latest" anything, rather than "the value as of this observation's own timestamp," is the single most common source of temporal leakage in a training pipeline.
- **Don't reach for bitemporal modeling unless the requirement genuinely has two independent time axes.** Most point-in-time questions need only valid-time as-of correctness; conflating the two adds real complexity for no benefit when only one axis is actually in play.

</section>
