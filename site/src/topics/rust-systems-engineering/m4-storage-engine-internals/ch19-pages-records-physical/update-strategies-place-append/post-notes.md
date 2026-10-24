---
title: "Update strategies: in-place, append, copy-on-write"
---

## Outcomes

- Apply the same sequence of updates to one logical record three genuinely different real ways: overwriting it in place, appending each new version to a growing log, and copying a whole page with the new version swapped in.
- Measure that overwriting in place leaves the record's own footprint flat, with no garbage ever accumulating.
- Measure that appending each new version grows the log's own footprint with every update, and that compaction has to discard every version but the newest to reclaim that growth.
- Measure that copying the whole page on every update grows the structure's own footprint by a whole page each time.
- Measure that, on the same workload, copy-on-write's own garbage is strictly larger than append-only's.
- State, from PostgreSQL's, LevelDB's, and LMDB's own documentation, why each real system made a different, deliberate choice among these strategies.

## Internals

The copy-on-write strategy's own page size is deliberately set many times larger than one record's own size, matching a real system's own page being far larger than any single small record, so the measured per-update growth genuinely reflects a whole-page cost rather than an artifact of a page sized close to the record itself. The append-only strategy's own `compact()` keeps only the single newest version — the simplest possible real compaction policy, deliberately chosen over a time-windowed or reference-counted one, since the claim under test is that compaction can reclaim the growth at all.

## In production

PostgreSQL's own heap update is, in its full form, closer to an in-place-with-versioning hybrid than a pure overwrite: the HOT optimization keeps the old row's own item identifier as a redirect rather than purely overwriting or purely appending. This topic's own in-place strategy is deliberately the simpler, pure-overwrite end of that spectrum, since the claim under test is the simplest case's own zero-garbage property, not HOT's own more nuanced redirect mechanism.

## The frontier

This topic's own three implementations are deliberately minimal analogues of PostgreSQL's heap, an LSM's append, and LMDB's copy-on-write B-tree — not ports of any one real system's own full code — since the claim under test is each strategy's own fragmentation and compaction trade-off, not a specific system's own implementation details. All four of this topic's own measured claims run entirely on in-memory Rust structures, with no file, network, or root access needed.

## Where this goes next

All three update strategies still produce pages that need to be cached in memory. The next question is which pages are actually resident at all, and who gets to decide which one is evicted.
