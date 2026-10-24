# Outline: Update strategies: in-place, append, copy-on-write (`rust.update-strategies-place-append`)

Chapter 19, topic 50 (third of four). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Apply the same sequence of updates to one logical record three genuinely different real ways: overwriting it in place, appending each new version to a growing log, and copying a whole page with the new version swapped in.
2. Measure that overwriting in place leaves the record's own footprint flat, with no garbage ever accumulating, since no old version survives anywhere.
3. Measure that appending each new version grows the log's own footprint with every update, and that a real compaction pass has to discard every version but the newest to reclaim that growth.
4. Measure that copying the whole page on every update grows the structure's own footprint by a whole page each time, not just the record's own bytes, and that its own garbage is sized in whole pages too.
5. Measure that, on the exact same workload, copy-on-write's own garbage is strictly larger than append-only's, because it copies a whole page per update rather than one record.
6. State, from PostgreSQL's, LevelDB's, and LMDB's own documentation, why each of the three real systems made a different, deliberate choice among these strategies.

## Changes from the chapter plan

None. All four of this topic's own claims are measured directly by applying the same sequence of updates to each of three real, explicit implementations; nothing here needs root access or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Apply the exact same sequence of updates to one logical record three different real ways: overwrite it in place, append each new version to a growing log, or copy a whole page with the new version swapped in. Does overwriting in place ever leave behind any garbage to clean up later?"** (predict, hook) — `fig`: the same five updates, about to be applied three ways. Options: yes, a little garbage accumulates every time / no, overwriting in place leaves nothing behind at all (correct) / only if the new value is a different length than the old one.
2. **"Measured: overwriting the record in place, five times, left its own footprint exactly as it started, with no garbage at all"** — `fig`: the real, measured footprint before and after five in-place updates. NO takeaway (the reel's swipe-test "from" step).
3. **"Now apply those same five updates by appending each new version to a growing log instead, never overwriting the old one. Does the log's own footprint grow with every update?"** (predict) — `fig`: the same five updates, appended one after another. Options: no, only the newest version is ever actually kept on disk / yes, the log's own footprint grows with every single update (correct) / it only grows once the log reaches a certain size.
4. **"Measured: the append-only log's own footprint genuinely grew with every update; compacting it afterward discarded every version but the newest to reclaim that growth"** — `fig`: the real, measured growth, then the real, measured compaction. Takeaway: "Appending each new version keeps every old one around until a real compaction pass goes and discards it."
5. **"Apply the same five updates one more way: copy the whole page the record lives on, write the new version into the copy, and swap it in. Does this grow the structure by just the record's own few bytes each time, the same as the log did?"** (predict) — `fig`: a whole page, copied for one small update. Options: yes, only the record's own bytes are ever duplicated / no, a whole page is copied every time, not just the record's own bytes (correct) / it depends on how much of the page the record actually uses.
6. **"Measured: copying the whole page on every update grew the structure by a whole page each time, not just the record's own bytes"** — `fig`: the real, measured per-update growth, in whole pages. Takeaway: "Copy-on-write own unit of work is the whole page, so its footprint grows by a page each time."
7. **"Compare the real garbage left behind by append-only and by copy-on-write, on the exact same five updates. Which one leaves more behind for a compaction pass to reclaim?"** (predict) — `fig`: the two real garbage totals, side by side. Options: append-only leaves more, since it keeps every version / copy-on-write leaves more, since every discarded copy is a whole page (correct) / they leave back exactly the same amount.
8. **"Measured: on the exact same five updates, copy-on-write's own garbage was strictly larger than append-only's own garbage"** — `fig`: the real, measured comparison. NO takeaway (a connecting step restating the measured comparison directly, not a new kind of claim).
9. **"Three real systems made three different, deliberate choices here. LMDB's own documentation: copying a page instead of overwriting it means no active data page is ever touched, so a crash can't leave a page half-written, and there's no special recovery procedure needed at all"** — `fig`: LMDB's own words on copy-on-write and crash safety, shown directly. Takeaway: "Copy-on-write's larger footprint buys crash safety: a page never overwritten can't be left half-written."
10. **Recap** — overwriting in place is the cheapest in space, but destroys the old version outright. Appending keeps every version until a real compaction pass discards the old ones. Copying the whole page costs the most in space, a page at a time, but that's exactly what buys crash safety with no special recovery procedure. Three real systems — PostgreSQL's heap, LevelDB's log, LMDB's copy-on-write pages — each made a different, deliberate choice among these three. Handoff: all three still produce pages that need to be cached in memory; the next question is which pages are actually resident at all, and who decides which one gets evicted.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 9 (LMDB's own crash-safety claim, quoted directly, setting up the handoff to buffer pools and durability).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| PostgreSQL uses MVCC to store rows for high concurrency; updates require new versions of rows to be added to tables | PostgreSQL docs (quoted) |
| a LevelDB log file stores a sequence of recent updates, with each update appended to the current log file; a compaction's old files are discarded and the new files are added to the serving state | LevelDB docs (quoted) |
| LMDB's own data pages use a copy-on-write strategy so no active data page is ever overwritten, providing resistance to corruption and eliminating the need for any special recovery procedure after a crash | LMDB docs (quoted) |
| write-ahead loggers and append-only databases both require periodic checkpointing and/or compaction of their log or database files, or they grow without bound | LMDB docs (quoted) |
| overwriting a real record in place, five times, leaves its own footprint exactly flat, with no garbage accumulating at all | `examples/runtime-demo/src/update_strategy_changes_the_fragmentation_cost.rs` (executed, measured) |
| appending each new version of a real record to a growing log genuinely grows the log's own footprint with every update, and a real compaction pass discards every version but the newest | `examples/runtime-demo/src/update_strategy_changes_the_fragmentation_cost.rs` (executed, measured) |
| copying a whole page on every update of a real record grows the structure's own footprint by a whole page each time, not just the record's own bytes | `examples/runtime-demo/src/update_strategy_changes_the_fragmentation_cost.rs` (executed, measured) |
| on the exact same workload, copy-on-write's own garbage is strictly larger than append-only's own garbage | `examples/runtime-demo/src/update_strategy_changes_the_fragmentation_cost.rs` (executed, measured) |

## Concept ledger

- `introduces`: `update-strategy-fragmentation-tradeoff` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `slot-indirection-stable-identity` (topic 49)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A record with a stable logical identity can now be updated three genuinely different ways, and each way trades off fragmentation, concurrency support, and compaction cost differently."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "All three update strategies still produce pages that need to be cached in memory; the next question is which pages are resident at all, and who gets to decide which one is evicted."
