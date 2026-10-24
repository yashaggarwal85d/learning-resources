# Outline — de.pages-slotted-pages-tuple

## Learning outcomes

1. Describe a real Postgres page's own layout (header, line-pointer array, tuple data) read
   directly from this sandbox's cluster.
2. Explain why a slot indirection lets a row move within a page while its logical identity
   (`ctid`) stays stable to anything pointing at it.
3. State when a value is stored out of line (TOAST) and why, and contrast it with InnoDB's own
   overflow-page mechanism for the identical fixed-page-size problem.

## Reel steps (storyboard)

1. **Hook: every acceleration this course has built still assumed a database engine already
   existed underneath. What's the one physical thing every one of those engines actually reads
   and writes?**
   - `fig`: "every engine this course has used — Postgres, RocksDB, Polars reading Parquet — reads and writes the exact same physical unit. What is it?"
   - Visual: "every engine, so far" / "assumed, not opened" vs. "the one physical unit" / "not yet named".
   - Narrator's line: names the real handoff (Chapter 4 built a native extension by hand but never opened the engine itself; this topic opens it, starting from the page).

2. **Reveal: a page's own five parts, read directly off a real table**
   - `fig`: "a real page, read directly from this sandbox's own Postgres cluster — what are its five parts, and which direction does each one grow?"
   - Visual: "the header" / "24 bytes, fixed" vs. "line pointers, then item data" / "grow toward each other".
   - Takeaway: a page's own header, line-pointer array and item data are real, measured regions read directly off a live page, not a diagram.

3. **Reveal: a line pointer, decoded**
   - `fig`: "the line-pointer array's own entries, read directly — what does each one actually store?"
   - Visual: "each line pointer" / "an offset and a length" vs. "4 bytes, fixed" / "one per row".
   - Takeaway: a line pointer is a real (offset, length) pair, not an abstract "pointer" — this is the whole mechanism the next step's predict question turns on.

4. **Predict: if VACUUM physically moves a surviving row to a new offset inside the page, does
   that row's own CTID change too?** (within first four ✓)
   - `fig`: "VACUUM physically moves a surviving row to a new offset inside the page — does that row's own CTID change along with it, or stay exactly where it was?"
   - Options: "Yes — a CTID names a byte offset, so moving the row must change it" / "No — a CTID names a line-pointer index, and the line pointer itself never moves" (correct).
   - Explain: no, a CTID is (page number, line-pointer index) — not a byte offset. The line pointer stays put at its own index and is simply updated to point at the row's new offset, so nothing that referenced this row's CTID (an index entry, a client holding it) ever has to notice the move.

5. **Reveal: the identical row, moved by a real VACUUM, CTID unchanged**
   - `fig`: "a real row, deleted neighbors reclaimed by a real VACUUM — does its CTID survive the move, or does the move break it?"
   - Visual: "before VACUUM" / "offset A" vs. "after VACUUM" / "offset B, same CTID".
   - Takeaway: a real VACUUM run in this sandbox moves a surviving row to a new physical offset while its CTID — the line-pointer index — stays exactly the same.

6. **Reveal: the null bitmap, read off a real inserted row**
   - `fig`: "a row with one null column, read directly — does the bitmap actually mark which column is missing?"
   - Visual: "a row with no nulls" / "no bitmap at all" vs. "a row with one null" / "one bit, off".
   - Takeaway: the null bitmap isn't stored at all unless a row actually has a null column, and when it is, the real bit pattern names the exact missing column.

7. **Reveal: a large value, moved out of line by a real TOAST**
   - `fig`: "an incompressible value far past the TOAST threshold, inserted for real — how much smaller is the row that's actually left in the main table?"
   - Visual: "a short value" / "stored inline" vs. "a large value" / "a pointer, chunks elsewhere".
   - Takeaway: TOAST doesn't shrink a large value — it moves it, measurably, into a separate table of real chunks, leaving a tiny pointer behind in the row everyone actually scans.

8. **Reveal: InnoDB's own overflow pages, the same problem solved differently**
   - `fig`: "InnoDB's own documentation, on the identical fixed-page problem — does it solve it the same way TOAST does, or differently?"
   - Visual: "Postgres" / "a separate TOAST table" vs. "InnoDB" / "overflow pages, same row".
   - No takeaway on this step (named-not-run disclosure step, matching the pattern from Chapters 1–4; sourced directly rather than run, since this sandbox has no InnoDB instance).

9. **Recap**
10. **Prove it** — a production scenario: an index-maintenance script holds a row's CTID across a
    batch of unrelated updates elsewhere in the table, assuming it still points at the same row
    when the batch finishes. A VACUUM runs in between. Does the script's assumption hold, and
    why or why not?

## Engagement arc

- Hook names the real open question: every engine this course used was taken on faith; this topic opens the one physical thing underneath all of them.
- Predict at step 4, within the first four, tests the tempting-but-wrong intuition that a CTID is a plain byte offset.
- Steps 2–3 build the page/line-pointer vocabulary the predict question needs.
- Steps 5–7 build the slot-indirection and TOAST claims with real, run evidence from this sandbox's own Postgres cluster.
- Step 8 is the one honestly disclosed, sourced-only step (InnoDB has no instance to run here).
- Recap ties every claim back to its own real evidence; Prove It makes the CTID-stability guarantee concrete for a real maintenance-script scenario.

## Post-notes headings

- Outcomes
- Lab
- Production failures this topic warns about
- Frontier
- Where this goes next

## Claims (drawn from the four verified sources)

1. A page has five parts: header, line-pointer array, free space, items, special space. (Database Page Layout)
2. A line pointer (ItemIdData) is a 4-byte (offset, length) pair that never moves until freed, even when the item it points to is physically relocated. (Database Page Layout)
3. A CTID (page number + line-pointer index) is what makes a line pointer usable as a long-term reference to an item. (Database Page Layout)
4. The heap tuple header has a fixed size followed by an optional null bitmap, present only if the row has a null column. (Database Page Layout)
5. A fixed page size forces a large value to be compressed and/or broken into multiple physical rows (TOAST), triggered once a row crosses roughly 2 kB. (TOAST)
6. TOAST chunks an out-of-line value into a separate table (chunk_id, chunk_seq, chunk_data). (TOAST)
7. `get_raw_page` and `heap_page_items` are the real functions this topic uses to read a live page directly. (pageinspect)
8. InnoDB solves the identical fixed-page problem with its own overflow pages, with different row formats storing different amounts of data out of line. (InnoDB Row Formats Overview)

## Progress

Research done (SOURCES.md, 15/15 quotes), expert list written (coverage.json → expert, 10
items), examples.py written and run repeatedly for stability (page's five parts; slot
indirection surviving a real VACUUM; the null bitmap on a real row; TOAST triggered on a real
incompressible value). Next: FACT-CHECK.md, finish coverage.json's syllabus/sources maps,
reel.tsx/scenes.tsx, narration.json.
