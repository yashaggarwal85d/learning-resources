---
id: de.scd-type-2-implementation
title: SCD Type 2 implementation
---

<section data-section="outcomes">

## After this topic you can

- Build an SCD Type 2 dimension with effective/expiry timestamps and a current flag.
- Detect a real change with a hash-diff rather than a column-by-column comparison.
- Write an idempotent MERGE-based load, and prove idempotency by running it twice.
- Keep SCD2 correct when a change feed arrives out of order or with duplicates.

</section>

<section data-section="internals">

## A little deeper

Both halves of this topic are run against real, disclosed throwaway tables built on this session's
sandbox, not described hypotheticals. The MERGE half builds one real customer dimension starting
with a single current address row, then loads a real address change with a single MERGE statement
that combines a `WHEN NOT MATCHED BY SOURCE` clause (expiring the row the new source no longer
matches) and a `WHEN NOT MATCHED` clause (inserting the version that didn't exist in the old
target) — both firing from the same statement, confirmed by the exact row count it reports
changing. Running that identical statement again immediately afterward changes zero rows, which is
idempotency demonstrated rather than assumed: the second run's source already matches the current
row's own hash, so no WHEN clause has anything left to do.

The replay half builds a fresh customer's real three-event address history, fed as four rows (one
event duplicated) in a deliberately scrambled order. The load deduplicates by the exact content of
each event and rebuilds the effective/expiry chain purely from each event's own timestamp, which is
why the final chain comes out correct — three distinct versions, properly ordered — regardless of
the order the rows happened to arrive in. An as-of query for a date inside the middle version's own
window recovers that exact version, and rebuilding the identical chain a second time from the same
raw feed produces byte-identical output, confirming the rebuild itself is idempotent too.

</section>
