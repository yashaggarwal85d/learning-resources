---
id: de.numeric-representation-data-bugs
title: Numeric representation and its data bugs
---

<section data-section="outcomes">

## After this topic you can

- Predict when a fixed-width integer column overflows, and say what each engine does then: PostgreSQL and Spark 4.0 raise, NumPy wraps, Python's `int` never overflows.
- Explain and demonstrate why a floating-point sum depends on the order the rows arrive in, and why a shuffle, a SIMD reduction or a per-core partial aggregate can each change the total.
- Work out the precision and scale of a `DECIMAL` expression from the engine's rules, and pick a type for money that keeps the cents exact.
- Diagnose a timestamp that stops matching after a round trip through Parquet, and say why nanosecond timestamps run out of range in the 2260s.
- State the one rule that prevents most of these bugs: never store currency as a binary float.

</section>

<section data-section="internals">

## A little deeper

Storage returns your bytes intact. Their type decides whether a total, an amount or a timestamp is still right. The shop keeps an `orders` table of 100,000,000 rows: an integer `order_id`, a `status`, an `amount` stored as `DECIMAL(12,2)` in the warehouse, and an `event_time` timestamp at microsecond resolution. Four of those columns carry a numeric type, and each type has a sharp edge. All four bugs below come from the same fact: a machine number is a *fixed-width approximation* of an unbounded idea, and the approximation leaks in a different way for integers, for binary floats, for decimals and for timestamps.

### Integer width and overflow

An `n`-bit signed integer holds the range −2<sup>n−1</sup> … 2<sup>n−1</sup>−1. A 32-bit `order_id` therefore tops out at **2,147,483,647**; a 64-bit `bigint` at **9,223,372,036,854,775,807**. An unsigned 32-bit counter stops at 4,294,967,295. These are small numbers for a busy pipeline: an event counter at a few thousand per second crosses 2<sup>31</sup> in under two weeks, and an `INT` surrogate key crosses it after two billion inserts. The question is not *whether* a width is exceeded but *what happens at the edge*, and the answer is not the same anywhere:

| Where the arithmetic runs | What an overflow of a fixed-width integer does |
|---|---|
| PostgreSQL `smallint` / `integer` / `bigint` | Raises an error: *"Attempts to store values outside of the allowed range will result in an error."* `numeric` is exact and effectively unbounded. |
| Spark SQL 4.0+ (ANSI mode **on by default** since 4.0) | Raises `ARITHMETIC_OVERFLOW` at runtime for numeric and interval overflow; `try_add`, `try_multiply`, … return `NULL` instead. |
| Spark SQL 3.x, or 4.x with `spark.sql.ansi.enabled=false` | **Wraps** silently: non-decimal types behave "the same way as the corresponding operation in a Java/Scala program", so `MAX_INT + 1` becomes a negative number. |
| NumPy fixed-width integers (`np.int32`, `np.int64`, …) | **Wraps** modulo 2<sup>n</sup>, following C casting rules; `np.int8(300)` becomes 44. A 32-bit power like `np.power(100, 9, dtype=np.int32)` silently returns a wrong, wrapped value; the same call with `dtype=np.int64` has enough headroom and is exact. |
| Python `int` | **Never overflows** — it is arbitrary precision. This is why a bug that is invisible in a notebook reappears when the same logic runs in Spark or NumPy. |

The practical rule: choose a width with headroom (prefer `bigint`/`int64` for any identity or counter that grows with traffic), and know your engine's overflow policy. Silent wrapping is the dangerous one, because the row count keeps rising and the id quietly goes negative; a raised error at least pages someone. Spark's move to ANSI-by-default in 4.0 is exactly a shift from "wrap and hope" to "raise and stop".

### IEEE-754 binary64: a number line with uneven spacing

A `double` (PostgreSQL `double precision`, Spark `DOUBLE`, NumPy `float64`, Python `float`) is an IEEE 754 **binary64**: one sign bit, an 11-bit exponent, and a 52-bit fraction that, with the implied leading bit, gives a **53-bit significand** — about 15 to 17 significant decimal digits. The key picture is that the representable values are *not* evenly spaced. For a value whose exponent is `e`, consecutive doubles are 2<sup>e−52</sup> apart; this gap is the **unit in the last place**, the ulp. Near 1.0 the spacing is about 2.2 × 10<sup>−16</sup>; at 2<sup>52</sup> ≈ 4.5 × 10<sup>15</sup> the spacing is exactly 1.0; and above **2<sup>53</sup> = 9,007,199,254,740,992** the spacing is 2, so odd integers can no longer be represented. Hence the arresting fact `1e16 + 1 == 1e16`: the number line is so coarse at that magnitude that adding one lands you back on the same tick.

The second surprise is that most "round" decimals are not representable at all. The decimal 0.1 has no finite binary expansion, so the stored value is the nearest double, which Python's tutorial prints in full as `0.1000000000000000055511151231257827021181583404541015625`. Every literal cent you type, and every operation on it, can introduce a fresh rounding error of up to half an ulp. That is why

```python
>>> 0.1 + 0.2
0.30000000000000004
```

### Why a float sum depends on the order

Because each addition rounds to the nearest representable value, floating-point addition is **commutative but not associative**: `(a + b) + c` need not equal `a + (b + c)`. The smallest honest example uses the cents above:

```python
>>> (0.1 + 0.2) + 0.3
0.6000000000000001
>>> 0.1 + (0.2 + 0.3)
0.6
```

Same three numbers, two groupings, two answers. Scale this to the `amount` column and the consequence is concrete: **summing the same column in two different row orders can produce two different totals.** The error is largest when a large running total absorbs many small values — once the total dwarfs the next `amount` by more than an ulp, part or all of that amount rounds away, and how much is lost depends on the order the values arrived in.

This is not a hypothetical in a data system; it is the normal case, for three reasons rooted in earlier topics:

- **Shuffles.** In a distributed aggregation the rows for one group arrive from many machines in a *nondeterministic* order (a "shuffle" — the full mechanism is Chapter 7's). The reducer adds them as they land, so the same `SUM(amount)` can return a slightly different value on two runs of the same job over the same data. This is the single most common "the numbers moved and nothing changed" bug, and it is why a float `SUM` is not reproducible across runs.
- **Vectorized execution.** A columnar, batch-at-a-time engine (`simd`, `vectorized-execution` from the CPU-caches topic) sums several lanes of a SIMD register in parallel and combines them at the end — a different addition tree than a scalar left-to-right loop. NumPy's `np.sum` likewise uses *pairwise* summation within a block, which is more accurate than a naive loop but still order-dependent across block and thread boundaries.
- **Many cores and many processes.** When the aggregation is split into per-core or per-process partial sums (`processes-vs-threads` from the threads topic) and merged, the merge order is whatever the scheduler produced. Change the degree of parallelism and the total's last digits change.

The fix is to stop depending on order. **Compensated summation** keeps a second running term for the lost low-order bits: Kahan summation recovers most of them, and Python's `math.fsum` goes all the way, tracking enough partial sums to return a result "almost always correctly rounded to within 1/2 ulp" of the exact answer — order-independent by construction. The exact-arithmetic route (sum as `Fraction`, or as `decimal.Decimal`) is slower but exact. For money, the real answer is further down: don't use a binary float at all.

### DECIMAL for money: how precision and scale propagate

A **fixed-point decimal** stores an integer significand and a fixed scale, so `DECIMAL(12,2)` represents every cent from −9,999,999,999.99 to 9,999,999,999.99 *exactly*. There is no 0.1 problem. The subtlety is what happens to the **precision** (total digits, `P`) and **scale** (fractional digits, `S`) when you combine two decimals — because the result type is computed from the inputs, and it can overflow or silently lose scale even though each input was fine.

The rules differ by engine and must be read from the engine's own docs. Two worked examples for `amount DECIMAL(12,2)` times a `tax_rate DECIMAL(5,4)` (leading digits `L = P − S`):

| Engine | Rule for multiplication | Result type for `DECIMAL(12,2) * DECIMAL(5,4)` |
|---|---|---|
| PostgreSQL `numeric` | Arithmetic yields an **exact** result; the product's scale is the sum of the input scales, and precision grows to hold it (max declarable precision 1000). Rounding happens only when the value is stored into a column with a smaller declared scale (ties rounded **away from zero**). | Exact: scale 6, e.g. `numeric` holding `…​.######` |
| Snowflake | `L = L1 + L2`; `S = min(S1 + S2, max(S1, S2, 12))`; `P = L + S`, with `P` **capped at 38**. If leading digits would exceed the cap the operation can overflow. | `L = 10 + 1 = 11`, `S = min(6, max(2,4,12)) = 6` → `NUMBER(17,6)` |

Snowflake's addition rule is `L = max(L1,L2) + 1`, `S = max(S1,S2)`; its division rule adds up to 6 digits of scale to the numerator (`L = L1 + S2`, `S = max(S1, min(S1 + 6, 12))`) and rounds rather than truncates. The lesson is the same across engines: **multiplication grows precision fast**, and a chain of multiplications on a wide `DECIMAL` either hits the engine's precision ceiling (38 in Snowflake, Spark and most warehouses; 1000 in PostgreSQL `numeric`) or quietly rounds the scale down. Spark follows the same philosophy as its integers: a decimal operation that overflows the target type raises under ANSI mode (default on in 4.0) and returns `NULL` with ANSI off. Pick the money type with the final scale and the worst-case magnitude in mind, not just the column's own values.

### Timestamp resolution: ns, µs, and the round-trip mismatch

A timestamp is just an integer count of ticks since an epoch, and the **tick size** is a type parameter that different systems choose differently:

- PostgreSQL `timestamp` stores **microseconds**. The shop's `event_time` is µs for this reason.
- pandas historically used `datetime64[ns]` — an `int64` count of **nanoseconds** since 1970. An `int64` of nanoseconds spans only about **292 years**, so pandas timestamps are limited to roughly **1677-09-21 … 2262-04-11**; a date outside that window overflows. As of **pandas 3.0** (January 2026), parsing strings now **infers microsecond resolution by default**, "falling back to nanoseconds when the precision of the string requires it", instead of always producing nanoseconds. Code that assumed `datetime64[ns]` can now receive `datetime64[us]`.
- Apache Parquet stores a `TIMESTAMP` as an `int64` with an explicit **unit** of `MILLIS`, `MICROS` or `NANOS` and an `isAdjustedToUTC` flag.

Put these together and you get the classic join-key bug. Write `event_time` (µs) to Parquet as `MICROS`, then read it back in a tool that coerces to milliseconds, or compare it against a nanosecond timestamp from another source: the two integers no longer compare equal even though they name "the same" instant, and an equi-join on `event_time` silently drops rows. A timestamp used as a key must have the **same unit and UTC-adjustment on both sides**, pinned explicitly in the Parquet schema and in the reader — never left to a per-engine default. When precision is reduced on the way through (ns → µs → ms), the truncation is one-way, so the mismatch cannot be repaired after the fact; the lossy write has to be prevented.

### The rule: never store currency as a float

Everything above collapses to one sentence. A binary float cannot represent most cents exactly, its sums are not reproducible across orders, and its errors grow with magnitude — three independently fatal properties for money. Store currency as a `DECIMAL` with the scale you actually need, or as an integer number of the smallest unit (cents, or micros for sub-cent rates), and reserve `double` for quantities where a relative error of 10<sup>−15</sup> is genuinely harmless. The counter-example on screen is the point of the whole topic: the same `amount` column, summed as a float in two orders giving two totals, and summed as a `DECIMAL` giving one.

</section>

<section data-section="lab">

## Build, break, measure

This topic hosts the §1.2 lab line **"sum the same float column in two orders and show different totals."** It needs only Python's standard library; a seeded shuffle makes the result reproducible (QUALITY #12).

### 1 · Make a float SUM disagree with itself

```python
import random, math
from decimal import Decimal

rng = random.Random(1234)                      # seed: reproducible
# A big running total plus many small amounts: the absorbing case.
amounts = [10_000_000.0] + [rng.uniform(0.01, 2.00) for _ in range(1_000_000)]

order_a = amounts[:]
order_b = amounts[:]
rng.shuffle(order_b)                            # a different "shuffle" order

sum_a = sum(order_a)
sum_b = sum(order_b)
print("order A :", repr(sum_a))
print("order B :", repr(sum_b))
print("differ  :", sum_a != sum_b)             # expect True
```

Two orders of the *same* numbers print two totals. The exact low-order digits depend on your data and platform, so compare `sum_a` and `sum_b` to each other, not to a literal.

### 2 · Make it agree again

```python
fsum_a = math.fsum(order_a)
fsum_b = math.fsum(order_b)
print("fsum A == fsum B :", fsum_a == fsum_b)  # expect True: order-independent

dec = sum((Decimal("10000000.00"), *(Decimal(f"{x:.2f}") for x in order_a[1:])))
print("decimal total    :", dec)               # exact to the cent, any order
```

`math.fsum` is order-independent to within half an ulp; `Decimal` is exact. Either removes the dependence on arrival order; `Decimal` is the right choice for money.

### 3 · Break it the other way: integer overflow and a timestamp round trip

```python
import numpy as np
print(np.int32(2_147_483_647) + np.int32(1))   # wraps to -2147483648, no error
print(2_147_483_647 + 1)                        # Python int: 2147483648, exact

import pandas as pd                             # pandas >= 3.0
dt = pd.to_datetime(["2026-01-02 03:04:05.123456"])
print(dt.dtype)                                 # datetime64[us] in pandas 3.0
# Round-trip through Parquet pinning the unit, then join on event_time:
# write with unit="us" on both producer and consumer; a ms reader would
# truncate .123456 -> .123 and the equi-join would drop the row.
```

**What to measure / what to break.** Confirm the two float orders differ and that `fsum`/`Decimal` do not. Flip NumPy to `np.int64` and watch the overflow move out of range. Write the timestamp column to Parquet with `unit="us"` and again coerced to `"ms"`, read both back, and join: the millisecond copy loses the sub-millisecond rows. (Any wall-clock timing is *measure in build*; the correctness outcomes above are deterministic given the seed.)

</section>

<section data-section="production">

## In production

A review checklist for the numeric edges, with the question each one answers:

- **Money is never a binary float.** Use `DECIMAL`/`NUMBER` with an explicit scale, or integer minor units. The syllabus's own gate question — *"why can a float `SUM` over the same data return different results from two runs of the same distributed job, and what type do you store money in?"* — has one answer: non-associativity under shuffle, and `DECIMAL`.
- **Pin the integer width with headroom.** Prefer `bigint`/`int64` for ids and counters that grow with traffic; a 32-bit id is a two-week fuse at a few thousand events a second.
- **Make the overflow policy explicit, not accidental.** On Spark, know that ANSI mode is on by default from 4.0 (overflow and bad casts raise); reach for `try_*` only where a `NULL` is genuinely the right business answer. On NumPy, remember that fixed-width integers wrap silently — validate ranges before casting down.
- **Don't trust a reproducible-looking float total.** If a `SUM`, `AVG` or `STDDEV` must match across runs or across engines, aggregate in `DECIMAL`, or use compensated/exact summation. Property-based and golden-dataset tests for transforms (§4.2, §13.3) and data-diff regression tests (§4.2) must use **explicit float and timestamp tolerances**, not exact equality.
- **Pin timestamp units end to end.** Fix the Parquet `unit` (`MILLIS`/`MICROS`/`NANOS`) and `isAdjustedToUTC` on both writer and reader, and keep join keys at one unit. Watch for pandas 3.0 handing you `datetime64[us]` where older code expected `[ns]`, and for nanosecond timestamps near the 1677–2262 range limit.
- **Decimal precision has a ceiling.** A chain of `DECIMAL` multiplications grows precision until it hits the engine cap (38 in Snowflake/Spark, 1000 in PostgreSQL `numeric`) and then overflows or loses scale. Compute the result type for the worst case before shipping the query.

</section>

<section data-section="next">

## Where this goes next

That closes the hardware. Next: the algorithms that decide how many bytes a query moves, starting with the two index families most databases are built on.

</section>
