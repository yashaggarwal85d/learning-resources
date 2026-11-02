# REVIEW — de.delta-dml-execution-merge

## What this topic builds

A real MERGE against a local-disk Delta-style table, choosing between two real rewrite
strategies: a full-file rewrite (measured at 17834 bytes to change 11 of 1000 rows) versus a
deletion-vector-mode rewrite (measured at 70.8x less, reusing the exact `DeletionVector`
array-container shape `de.deletion-vectors-across-formats` already built). A real conflict between
a MERGE and a concurrent compaction — the exact pair and exception (ConcurrentDeleteReadException)
Delta's own docs name — detected by a real read-set/remove-set intersection check and resolved by
a real successful retry. A real demonstration of Row Tracking's fresh-vs-stable Row ID split: the
same row's materialized ID survives a rewrite unchanged while its default generated ID (computed
only from file + position) comes out different. Low-shuffle merge and Change Data Feed are named
and sourced, not rebuilt — the former needs a real query engine's shuffle planner this sandbox
doesn't have, the latter was already built for real in topic 20.

## Fixes made during the build

- `reel.tsx`'s step 7 title used an escaped apostrophe (`doesn\'t`) inside a single-quoted string.
  The build's own title-extraction regex (`title: (['"\`])(.*?)\1`) isn't escape-aware, so it
  matched up to the *first* literal `'` character — the one inside the escaped apostrophe — and
  silently split the title differently from what `coverage.json` referenced, failing the coverage
  check with "points to reel step ..., which reel.tsx doesn't have." Renamed the step title to
  avoid any apostrophe entirely, in both `reel.tsx` and `coverage.json`.
- `reel.tsx`/`scenes.tsx` initially showed rounded/approximate numbers ("about 17.8 KB", "about
  70x less") that don't appear as literal tokens in `examples.py` (which computes and prints them
  via f-string interpolation, not as literal source text), failing the "every number on screen
  comes from executed truth" check. Fixed by showing the exact measured values (17834 bytes,
  70.8x) and adding matching literal `assert` statements in `examples.py` so those exact numbers
  appear as real source-code tokens, not just runtime output.

## Checks run

- `narration-teaches.mjs`: clean on the first try (0-18% description-overlap, max 42 words).
- `check-all.mjs --skip reels,links,narration --topic delta-dml-execution-merge`: failed twice
  (the coverage/title mismatch from the escaped apostrophe; the unbacked-number check on the
  rounded figures), passed clean after both fixes (locked 72.4-75.3s, docs 0.2-0.3s, sources 0.0s,
  build 16.7-51.1s).
- `check-all.mjs --only links,narration --topic delta-dml-execution-merge`: both pass (2149 links,
  0 broken, 94 pre-existing title mismatches across the whole site, unrelated to this topic).
- `check-all.mjs --only reels --topic .../delta-dml-execution-merge`: passed clean on the first
  try, at both desktop and phone sizes. `test:editor` fails with its known pre-existing sandbox
  limitation (confirmed by multiple prior topics; not a regression).

## Screenshot review

All 24 screenshots (desktop 01-10, phone 01-10, plus the four `-q` predict-wait variants:
desktop/phone × step02/step05) reviewed by hand, including the hook, both predict steps, the
renamed step 7 (to confirm the title fix rendered correctly), and the recap. No overflow, no
layout issues on either viewport.

## Sourcing

Three sources, 11 quotes verified word-for-word: Delta's Transaction Log Protocol (Row Tracking's
fresh vs. stable Row ID definitions), Delta's Concurrency control docs (the MERGE-vs-COMPACTION
conflict pair and ConcurrentDeleteReadException), and Databricks' Low shuffle merge documentation.
No `deltalake`/`delta-rs` library is used anywhere — the commit log, data files, and deletion
vector are all built and read by this script's own code, matching this chapter's established
from-scratch convention.

## Ships as

`status: 'held'`, §6.3.2 (continues the Delta arc). `registry.ts` and `renarration.json` entries
added. Next up: topic 30, `de.delta-lake-4-x` (the current 4.x release line and Delta Kernel).
