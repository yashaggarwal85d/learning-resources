# Outline: Slotted pages and record identity (`rust.slotted-pages-record-identity`)

Chapter 19, topic 49 (second of four). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real slotted page as an explicit byte buffer: a slot array of (offset, length) entries, growing from just after the header, with tuple data growing from the end of the page downward.
2. Measure that several variable-length records, inserted into the page, read back correctly through their own slot index alone.
3. Measure that compacting the page after a deletion genuinely moves a surviving record's own physical offset, while that same record's own slot index never changes.
4. Measure that reading a record by its slot index after compaction still returns the exact original content, even though its physical location moved.
5. Measure that a record too large for the page's own remaining free space is rejected cleanly, with every existing record on the page left genuinely intact — the real trigger for moving a value out of line in a real system.
6. State, from PostgreSQL's own documentation, the item identifier's own permanence guarantee, and why a fixed page size makes very large values need to live somewhere else entirely.

## Changes from the chapter plan

None. All four of this topic's own claims are measured directly against a real slot array and a real compaction pass over an explicit byte buffer; nothing here needs root access or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Add a real slot array to the page: each slot holds a physical offset and a length, and a record's own identity is its slot index, never its offset. Delete a record in the middle of the page and compact it, physically closing the gap. Does the record's own identity survive that move?"** (predict, hook) — `fig`: a slotted page, one record deleted, about to be compacted. Options: no, moving a record changes its own identity too / yes, its slot index stays exactly the same even though its physical offset changes (correct) / it depends on which record moved.
2. **"Measured: three variable-length records, inserted into the page, all read back correctly through their own slot index; after deleting the middle one and compacting, the surviving records' own physical offsets genuinely changed"** — `fig`: the real, measured round-trip, then the real, measured compaction. NO takeaway (the reel's swipe-test "from" step).
3. **"The surviving records' own slot indices: did compacting the page change them at all?"** (predict) — `fig`: the same two records, slot index called out directly. Options: yes, the slot indices shifted to fill the gap / no, each record's own slot index stayed exactly what it was before the deletion (correct) / only the record immediately after the gap kept its own index.
4. **"Measured: the surviving records' own slot indices never changed — only their physical offsets did"** — `fig`: the real, measured pair: offset changed, slot index unchanged. Takeaway: "A slot index is a record's own stable name; its offset is just where it sits right now."
5. **"Read each surviving record back by its own slot index, after the compaction that physically moved it. Does it still return the exact same content it held before?"** (predict) — `fig`: reading by slot index, after the move. Options: no, the content is now subtly wrong, since the bytes moved / yes, the exact same content comes back, since the slot index was never tied to the old offset (correct) / only for the record that didn't move.
6. **"Measured: reading by slot index after compaction returned the exact same content as before, for every surviving record"** — `fig`: the real, measured pair of reads. Takeaway: "Decoupling identity from location means a caller holding only a slot index never notices a record moved."
7. **"Try to insert one more record, too large to fit in whatever free space is left on the page. What happens?"** (predict) — `fig`: an oversized record, about to be inserted. Options: it's written anyway, overflowing into the next page's own bytes / the insert is rejected cleanly, and every record already on the page stays exactly as it was (correct) / the page silently drops an existing record to make room.
8. **"Measured: the oversized insert was rejected cleanly, and every record already on the page, read back by its own slot index, was still exactly intact"** — `fig`: the real, measured rejection, then the real, measured intact read-back. NO takeaway (a connecting step restating the measured finding directly, not a new kind of claim).
9. **"PostgreSQL's own documentation makes a stronger claim still: because a page's own size is fixed, a value too large to fit can't just overflow onto another page — it has to be compressed, or broken up and stored somewhere else entirely. That's the real reason TOAST exists"** — `fig`: the documentation's own words on the fixed page size and the item identifier's own permanence, shown directly. Takeaway: "A fixed page size is not a limitation; it's why a large value needs a different kind of home."
10. **Recap** — a slotted page's whole point is that a record's own identity (its slot index) and its physical offset are two different things, deliberately: compacting the page moves the offset, and the slot index never has to know. A record too big for the page is rejected cleanly rather than corrupting it, which is exactly why a real system like PostgreSQL moves oversized values out of line entirely (TOAST). Handoff: a record now has a stable logical identity; the next question is what it actually means to update that same record's own content.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 9 (the fixed-page-size quote connecting directly to why TOAST exists, setting up the next topic's update strategies).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| an item identifier is never moved until it is freed, so its index can be used on a long-term basis to reference an item, even while the item itself moves to compact free space; every ItemPointer (CTID) consists of a page number and the index of an item identifier | PostgreSQL docs (quoted) |
| PostgreSQL uses a fixed page size and does not allow tuples to span multiple pages, so a very large field value has to be compressed and/or broken up into multiple physical rows | PostgreSQL docs (quoted) |
| heap_page_items shows all line pointers on a heap page, with tuple headers and raw data for the ones in use | PostgreSQL docs (quoted) |
| three variable-length records, inserted into a real slotted page, read back correctly through their own slot index alone | `examples/runtime-demo/src/slot_index_outlives_physical_compaction.rs` (executed, measured) |
| compacting a real page after a deletion genuinely moves a surviving record's own physical offset, while that record's own slot index never changes | `examples/runtime-demo/src/slot_index_outlives_physical_compaction.rs` (executed, measured) |
| reading a real record by its own slot index after compaction still returns the exact original content, even though its physical location moved | `examples/runtime-demo/src/slot_index_outlives_physical_compaction.rs` (executed, measured) |
| a record too large for a real page's own remaining free space is rejected cleanly, with every existing record left genuinely intact | `examples/runtime-demo/src/slot_index_outlives_physical_compaction.rs` (executed, measured) |

## Concept ledger

- `introduces`: `slot-indirection-stable-identity` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `self-describing-page-header` (topic 48)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A page that can describe itself is the foundation; the next question is how a record inside that page keeps a stable identity while its own physical location can still change."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A record with a stable logical identity can now be updated three genuinely different ways, and each way trades off fragmentation, concurrency support, and compaction cost differently."
