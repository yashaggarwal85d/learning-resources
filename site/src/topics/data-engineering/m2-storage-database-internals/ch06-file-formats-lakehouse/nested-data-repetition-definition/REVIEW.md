# Review — de.nested-data-repetition-definition

## Content review

- Every claim traces to a quote in SOURCES.md: the Dremel paper's own repetition/definition level
  definitions (fetched from the original VLDB 2010 PDF), Parquet's confirmation that it implements
  Dremel's encoding directly, Arrow's List/Struct layout, and ORC's present/length streams — see
  FACT-CHECK.md's claims table.
- `examples.py` ran correctly on the first execution: the 3-record worked example (one order with
  3 items, one with 0, one with 1) shreds into the exact repetition/definition level values shown
  on screen, reassembles back to the original records, and the derived Arrow/ORC layouts for the
  same structure are checked against each other directly in code (`arrow_item_counts ==
  orc_length`, `orc_note_present == arrow_note_validity`), not just asserted to be analogous.
- Red-team items (FACT-CHECK.md): this topic's one-repeated-field schema is a deliberately
  shallower case of Dremel's own two-repeated-field example, using the identical level-counting
  rules; the reassembly code only ever sees the three flat streams, never the original nested
  structure, so the round-trip check is real; the Arrow/ORC equivalence is asserted in code, not
  claimed in prose; the "11% overhead" number comes from a fixed, stated 20%-empty-list synthetic
  dataset, not a tuned number.
- `numbersIn()` check initially failed: `reel.tsx`'s header comment listed `0,3,3,4` and `1,1,1`
  with no spaces after the commas, which the digit-checker's regex read as one run-together token
  (`03334`) instead of four separate numbers. Fixed by adding spaces after every comma in that
  comment, matching the spacing already used in the step body text.

## Looks review

- `--only reels` passed cleanly on the first attempt ("Reel smoke test passed: 1 live reel(s) at
  desktop and phone sizes") — no overlap/runs-into errors this time, having applied topic 5's own
  fix (every scene uses `TallRow`, stacked label over value, with short 1-4-word phrases) from the
  start rather than discovering it after a failed run.
- Manually reviewed all 20 screenshots (10 desktop, 10 phone): clean composition throughout, no
  overflow or contrast issues, predict-answer cards readable on both sizes, no swipe-from-caption
  risk (takeaways on steps 4, 7, 9 — none immediately after the predict steps at 2 and 5).

## Checks

- `node scripts/sources.mjs check nested-data-repetition-definition` — 13 quote(s) found word for
  word, 0 problems.
- `python3 examples.py` — all assertions passed on the first run, including the Arrow/ORC
  cross-checks and the 100-record synthetic overhead measurement.
- `node scripts/check-all.mjs --skip reels,links --topic nested-data-repetition-definition` —
  pass (after the numbersIn comment-spacing fix above).
- `node scripts/check-links.mjs .../prerequisites.mdx` — 4 link(s), 4 ok, 0 broken.
- `node scripts/check-all.mjs --only reels --topic nested-data-repetition-definition` — reel smoke
  test passed at desktop and phone (the separate `test:editor` failure is the known, pre-existing,
  sandbox-only popup-handling limitation unrelated to this topic).
