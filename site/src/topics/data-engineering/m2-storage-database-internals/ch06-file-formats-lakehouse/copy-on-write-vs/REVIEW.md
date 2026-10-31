# Review — de.copy-on-write-vs

## What this topic does

Performs a real 1%-row update under copy-on-write (every touched file fully rewritten) and under
merge-on-read (a small log file, merged at read time) on the same 48,000-row/12-file local table,
measuring real write and read latency for each, and shows real compaction converting
merge-on-read's accumulated read-cost debt back down toward copy-on-write's.

## Fixes made during the build

- **Flaky timing bug in `examples.py`.** The first working version measured total merge-on-read
  read time (base-file scan + merge) directly per round and asserted monotonic growth across 5
  rounds; this failed intermittently (1 of 3 consecutive runs) because the 48,000-row base-file
  scan's I/O noise swamped the small real merge-overhead signal. Fixed by splitting the read into
  `build_overlay_from_logs()` (the part copy-on-write never pays — isolated and timed with 21
  repeats/median) and `scan_base_with_overlay()` (the large, shared, noisier base scan), and
  basing the growth/shrink assertions on the isolated `build_overlay_from_logs` timings. Verified
  by running the full script 5 times consecutively post-fix — all 5 passed.
- **Escaped apostrophe in `reel.tsx`'s step-4 title.** `title: 'Reveal: reproduced for real —
  copy-on-write\'s real write cost'` (escaped apostrophe inside a single-quoted string) broke the
  build's raw-text coverage match against `coverage.json`'s `at.step` references, even though the
  two strings were logically identical — a known gotcha (escaped apostrophe in a single-quoted
  title breaks the raw-text match). Fixed by switching that title to a double-quoted string.

## Checks

- `sources.mjs check`: 13/13 quotes verified word-for-word on first try (3 Iceberg, 5 Hudi,
  5 Delta).
- `narration-teaches.mjs`: clean on first run — 0-2% description overlap per step, longest line
  29 words, all under the 50-word cap.
- `check-all.mjs --skip reels,links,narration`: failed once on the coverage/reel-title mismatch
  above; clean after the apostrophe fix.
- `check-links.mjs`: 0 broken (96 pre-existing blocked/title-mismatch entries across the site,
  unrelated to this topic).
- `check-all.mjs --only reels`: reel smoke test passed clean (desktop + phone) on first run after
  the apostrophe fix.

## Screenshot review

All 24 screenshots (12 desktop incl. 2 `-q` predict-state variants, 12 phone incl. 2 `-q`
variants) reviewed clean via the Read tool — text fits within the drawing, predict options render
correctly, takeaways appear only on steps 4, 7, 9, and the digit-provenance ("1%") traces to
`examples.py`'s `UPDATE_FRACTION = 0.01`. Phone step 1 shows the same "01/SW" vs "01/10" cosmetic
step-counter artifact seen on topics 12 and 13's own phone step 1 — pre-existing and benign, not
specific to this topic.

## Sourcing notes

Delta's deletion-vectors feature is documented as "in experimental support mode" as of Delta Lake
2.3.0+, and MERGE support for deletion vectors was only added in 3.1.0 — this topic treats it as
Delta's real, current MOR-equivalent mechanism, not a claim it has always been available or
stable-forever (documented in FACT-CHECK.md's currency note and red-team #6). Hudi is named only
as the third real system facing the identical COW/MOR choice; its own topics are skipped
elsewhere in this syllabus per CHAPTER.md's own note.
