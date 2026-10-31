# Review — de.data-skipping-statistics-page

## Content review

- Sources: 3 sources (`parquet.thrift`, `PageIndex.md`, `BloomFilter.md`), 13 quotes, all verified
  word-for-word on the first full check after fixing 4 initial quote-matching problems (a
  Thrift `*`-continuation line split across two quotes; the "Blart Versenwald III" truncation
  example split across three `*`-continuation lines; a stray capitalization mismatch; a Markdown
  link prefix left inside a quote).
- `examples.py`: row-group and page-level min/max/null-count overlap pruning (sorted vs. shuffled
  1000-row dataset, 10 row groups of 100, 4 pages of 25 inside the surviving row group); a
  hand-rolled split-block Bloom filter built exactly to `BloomFilter.md`'s own pseudocode (1024
  blocks, 26,214 inserts, matching the spec's own "~1.26%" worked example); a reproduced
  truncated-statistics skipping bug based on `parquet.thrift`'s own "Blart Versenwald III"
  example. Every assertion runs and passes (`python3 examples.py` → "All assertions passed.").
- Real bug found and fixed while building the Bloom filter: a first implementation using a
  hand-rolled FNV-1a hash measured a 15.94% false-positive rate — over 10x the spec's own ~1.26%
  figure for the identical 1024-block/26,214-insert configuration. Traced to FNV-1a's poor
  upper-bit distribution on sequential string keys (`"session-0"`, `"session-1"`, …), which is
  exactly the bits the split-block filter uses to choose a block. Fixed by switching to a
  SHA-256-derived hash, which measured 1.25% — matching the spec's number. Disclosed in
  `examples.py`'s own comments, `FACT-CHECK.md`'s red-team section, `post-notes.md`'s Frontier
  section, and `coverage.json`'s expert items.
- `coverage.json`: 3 syllabus clauses copied verbatim (word-for-word, backticks stripped) from
  `syllabus/data-engineering.md` line 307; 10 expert items; `gapReview.open: []`.

## Build-check fixes

- Registry `title`/`syllabusTitle` didn't match the syllabus line's exact wording ("the page index
  and bloom filters" vs. the syllabus's "page indexes, bloom filters") — the Astro build's
  syllabus-match check failed until both fields were corrected to match
  `syllabus/data-engineering.md` line 307 exactly.
- `narration.json` step 10 had a 51-word line (limit 50) — split into two lines.
- Two `reel.tsx` takeaways (steps 4 and 9) were 21 and 22 words (limit 20) — trimmed both to fit.

## Looks review

All 10 steps reviewed at desktop and phone sizes via `check-all.mjs --only reels`. No text
overflow, clipping, or overlap on any screen; `TallRow` used throughout from the start (topic 5's
lesson applied proactively), so no Row-overlap issues arose. `test:editor`'s unrelated, known
sandbox-only failure (does not affect this topic) is the only non-reel failure in the run.

## Links

`check-links.mjs` on `prerequisites.mdx`: 1 ok, 2 "title mismatch (check by hand)" — both are the
expected GitHub repo-file page title suffix pattern ("… · apache/parquet-format · GitHub") on
correctly-linked source pages, not a broken or wrong link.
