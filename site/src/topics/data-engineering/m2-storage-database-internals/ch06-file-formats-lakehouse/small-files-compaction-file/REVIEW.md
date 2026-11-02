# Review — de.small-files-compaction-file

## Checks

- `node scripts/sources.mjs check` — 17 quote(s) found word for word, 0 problems (after one fix:
  the Delta bin-packing quote's exact wording is "but not necessarily number of tuples per file",
  with no "the").
- `python3 examples.py` × 3 — byte-identical output every run, exit code 0. 20x reduction in both
  manifest bytes (40,000 → 2,000) and open/LIST overhead (10,000 → 500), by construction (both
  scale linearly with file count, which drops from 200 to 10 by design). Real zlib compression
  comparison: 5,400 bytes split across 200 files vs. 1,084 bytes as one stream.
- `node scripts/narration-teaches.mjs` — clean (after shortening one over-50-word narration line).
- `node scripts/check-all.mjs --skip reels,links,narration --topic de.small-files-compaction-file`
  — locked/docs/sources/build all pass. One fix needed: the build's digit-provenance check flagged
  128/512/64/20 shown on screen without an executed-truth basis in `examples.py` — fixed by
  removing those figures from reel.tsx's top comment (Delta's 128 MB and S3 Tables' 512MB/64MB
  figures) and rephrasing "20x" as "the same factor" / "collapse together" throughout
  reel.tsx/scenes.tsx, since 20 is a ratio, not a literal `examples.py` computes or asserts.
- Also fixed by the same build run: a missing syllabus-coverage mapping for the "Spark-side output
  control in §7.2" clause (added to coverage.json, pointing at a Frontier deep note explaining the
  deferral), only 1 predict step (full topics need ≥2 — added a second predict, "is compacting a
  partition a streaming job is still actively writing to a free action?", as reel step 8, with a
  matching scenes.tsx visual and narration.json answer block), and a takeaway over the 20-word
  limit (shortened from 27 to 18 words).
- `node scripts/check-all.mjs --only links,narration --topic de.small-files-compaction-file` —
  both pass (0 broken links; narration clean).
- `node scripts/check-all.mjs --only reels --topic .../small-files-compaction-file` — passed on
  the first run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes." No
  takeaway-squeeze or phone text-overflow issues this time — `TallRow` values were kept to 5-9
  words from the start, and no takeaway was placed on step 3 (the test's "from" step), applying
  both lessons already documented from topics 16 and 17.
- `test:editor` — fails with the known, pre-existing sandbox limitation ("a save did not open a
  new GitHub issue"), unrelated to this topic's content; documented in project memory and seen on
  every topic in this cloud sandbox.
- All 26 screenshots (desktop 01-11 incl. `-q` on 02 and 08; phone 01-11 incl. `-q` on 02 and 08)
  reviewed manually via the Read tool — all clean, no overflow, no clipped text, correct takeaway
  styling, correct predict-answer highlighting.

## Design notes

- Reuses topic 17's real-local-directory-tree substitution pattern. Four real demonstrations: a
  streaming micro-batch pattern producing 200 real small files; a real fixed-width manifest and a
  deterministic open/LIST cost-model proxy measuring 40,000 manifest bytes and 10,000 overhead
  units before compaction; a real byte-for-byte bin-pack compaction into 10 target-sized files;
  and a real zlib compression comparison showing the same bytes compress worse split than whole.
- The "open/LIST overhead" figure is deliberately a deterministic cost-model proxy (a fixed cost
  per file touched), not a timed wall-clock measurement, to avoid the flaky-timing risk a real
  `os.listdir`/`open()` benchmark on 200 vs. 10 files would carry in this sandbox — consistent
  with the project's standing no-flaky-timing rule and topic 17's own retention-race disclosure.
- Both the manifest-byte reduction and the open-cost reduction are exactly 20x by construction
  (both scale linearly with file count, 200 → 10), which is itself a deliberate pedagogical choice:
  it makes visible that these two separate costs — bookkeeping and per-file overhead — are driven
  by the same one variable.
- `declared: []`, matching CHAPTER.md's "none beyond topics 10-14" note for this topic.
- Prerequisites panel lists topics 10-14 and 17, matching CHAPTER.md's own note.
