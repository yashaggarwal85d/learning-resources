# Outline

## Scope mapped to steps

1. Hook: an equal-timestamp join between pressure and temperature returns almost nothing; an as-of join with no tolerance returns a match 41 minutes stale.
2. Reveal: the as-of join itself — for each dense-side row, the last sparse-side value at or before it, applied to telemetry rather than business facts.
3. Predict: whether a tolerance smaller than the known clock offset can ever help.
4. Reveal: it can't — a tolerance below the clock offset excludes correct matches, not just stale ones.
5. Reveal: the null rate against tolerance, and the DuckDB/pandas agreement on identical rows.
6. Reveal: a step approximation vs. an interpolated value on the same ramp, and the look-ahead cost of the second.
7. Reveal: the partition key — without it, equipment's rows can quietly borrow another equipment's nearest value.
8. Recap.
9. ProveIt.

## Why DuckDB and pandas, not ClickHouse or kdb+

Per CHAPTER.md: "the builder runs DuckDB and pandas and verifies the others from their documentation, sourced-only where not run." `examples.py` runs both DuckDB (2.0.0, installed this session) and pandas and asserts every row agrees between them. ClickHouse and kdb+ are named and quoted in `SOURCES.md` only — their own closest-match semantics (ClickHouse's `>=`/`<=` operators, kdb+'s `aj[c;t1;t2]` equality-then-latest-time rule) are consistent with what DuckDB and pandas actually compute, but neither was installed or run.

## What this topic leaves out (per CHAPTER.md)

The as-of join's logical plan shapes and `LATERAL`/range-join alternatives (Chapter 2, built on, not re-taught); resampling to a grid (topic 8, already covered); ML training sets, feature TTLs and leakage (Chapter 17 topic 21 — this topic states the identity between its own mechanism and the point-in-time feature join, and stops there); bitemporal joins (§3.2).

## Design note: the clock-offset-vs-tolerance example

CHAPTER.md asks for "the tolerance below which the clock offset makes a match wrong." `examples.py` encodes this as a fixed `CLOCK_OFFSET_SECONDS = 15` (from topic 7's device/gateway offset material) and shows the null rate at `offset - 1` seconds is at least as high as at `offset` seconds — a tolerance tighter than the clock's own uncertainty can only exclude matches that would have been correct, never recover a genuinely stale one.
