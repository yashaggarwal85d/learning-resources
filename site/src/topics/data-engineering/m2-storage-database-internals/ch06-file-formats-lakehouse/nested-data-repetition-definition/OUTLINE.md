# Outline — de.nested-data-repetition-definition

10 steps, `kind: full`. Predict steps: 2 and 5 (first within the first 4). Takeaways: steps 4, 7, 9 (≥3, ≤20 words each).

1. **Hook** — a real nested record, one order with 3 items, one with none, one with 1 — shredded into two flat columns and reassembled, matching byte for byte.
2. **Predict: the sku column, 5 rows from 3 orders — in what order?** (predict) — order 200 has no items at all. Does its own row just vanish?
3. **Reveal: a repetition level per value, not per row** — level 0 starts a new record, level 1 means "the same repeated field fired again": 0, 1, 1, 0, 0 across all 5 sku entries.
4. **Reveal: a NULL still needs a definition level** (takeaway) — order 200's empty item list gets one marker row, definition level 0, so the reader knows the list was there and simply empty.
5. **Predict: note is optional inside item — how many definition levels does it need?** (predict) — note can be missing on its own, and so can the whole item.
6. **Reveal: definition level 2 vs 1 vs 0** — 2 means item and note both present, 1 means item present but note missing, 0 means no item at all: one integer carries both ancestors' presence.
7. **Reveal: reassembly walks both streams in lock-step** (takeaway) — repetition level 0 is the only signal a reader needs to know a new record has started.
8. **Reveal: Arrow's answer — offsets, not levels** — the same 3 records as one offsets buffer (0, 3, 3, 4) plus a validity bitmap, one buffer pair per nesting level instead of one shared stream.
9. **Reveal: ORC's answer — present and length** — the same structure again, as a present stream and a length stream (3, 0, 1) — the same counts Arrow's offsets implied, organized as lengths instead of cumulative sums.
10. **Recap** — Dremel's levels, Arrow's offsets, and ORC's present/length streams all encode the identical structural fact; the cost of nesting is that every record pays for at least one entry per leaf field, real data or not.
