# Review — de.schema-evolution-column-ids

## Fixes made during the ship sequence

- **Reel smoke test, phone, text overflow (first run):** step 5's and step 8's `TallRow` values
  in `scenes.tsx` ("the rename survives; the new column reads missing" and "the data file's bytes
  stay byte-for-byte identical") ran outside the drawing on phone. Shortened both to "rename
  survives; new column reads missing" and "data file's bytes stay identical".
- **Reel smoke test, phone, swipe failure (first and second run):** "swipe from the caption on
  step 3 went to 3" — a known gotcha (`learning-resources-scenes-reel-gotchas` memory): a
  `takeaway` on the test's `from` step (the first non-predict step at dot index ≥1 — here step 3,
  "Reveal: reproduced for real — position-based matching corrupts the table") squeezes the phone
  Visual pane and breaks the caption swipe test regardless of text length. Fixed per the
  documented remedy: removed step 3's takeaway, folded its sentence into step 3's body, and added
  a new takeaway to step 4 instead (which isn't the `from` step) to keep the reel's total takeaway
  count at 3. Reran the full build/narration/reel checks after the edit — all clean.
- Proactively checked `reel.tsx` for escaped apostrophes in single-quoted strings (the topic
  14/15 gotcha) before any checks ran — zero matches, all apostrophe-bearing strings already
  double-quoted.

## Checks

- `node scripts/sources.mjs check <folder>` — 8/8 quotes verified word-for-word.
- `python3 examples.py` — verified via 3 consecutive identical clean runs (no flakiness risk: pure
  logic plus small deterministic local file I/O, no timing assertions).
- `node scripts/narration-teaches.mjs <folder>` — clean (0-5% description overlap, longest line 31
  words).
- `node scripts/check-all.mjs --skip reels,links,narration --topic <slug>` — pass (locked, docs,
  sources, build).
- `node scripts/check-links.mjs` — 0 broken links.
- `node scripts/check-all.mjs --only reels --topic <slug>` — pass on the third run, after the two
  fixes above (desktop and phone).
- All 24 screenshots (12 desktop incl. 2 `-q` predict-state variants, 12 phone incl. 2 `-q`
  variants) reviewed clean via the Read tool: no text overflow, no overlap, no layout breakage.

## Design notes

- This topic reuses topic 3's own rename-plus-insert schema change (same field names, same field
  IDs) on a real on-disk file, for both an Iceberg-style field-ID-tagged CSV and a Delta-style
  column-mapping CSV, verified via raw byte comparison — directly answering topic 3's own
  corruption with the real table-format fix, per CHAPTER.md's own visual idea for this topic.
- `declared: []` matches CHAPTER.md's "none beyond topic 3 and topics 10–12" note (those are
  already covered by `uses`/the prerequisites panel, not separate declared terms).
