# Review — de.row-vs-columnar-vs

## Content review, self-review

- Claims checked against FACT-CHECK.md's 10-row table; the PAX-paper claims are word-for-word
  quotes verified by `node scripts/sources.mjs check` (9/9 quotes found), the Parquet claims
  likewise. One quote (DSM's join cost) had to be split in two because a page-break footnote in
  the source PDF's extracted text interrupts the sentence — confirmed by reading the raw cached
  text directly, not an editing error.
- Every number on screen is the sandbox's own deterministic measurement from `examples.py`
  (real packed bytes via `struct`, sliced and counted — not timed, not estimated): NSM point
  lookup 32 bytes/1 read; NSM column scan 32,000 bytes; DSM point lookup 4 reads; DSM column scan
  8,000 bytes (75% less); PAX point lookup 1 page; PAX column scan 10 pages but 8,000 useful bytes
  (25%). `python3 examples.py` passes all asserts.
- Explicitly avoided putting the PAX paper's own headline percentages (75% stall-time reduction,
  17-25% faster range queries) on screen, to not imply a 2001 micro-benchmark describes 2026
  hardware — the reel only shows this sandbox's own byte-count measurements.
- No problem-solving example in this topic (refresher kind); documented as "None" in
  FACT-CHECK.md, matching topic 1's pattern.

## Looks review, self-review

Viewed all 16 screenshots in `site/test-results/` (8 steps × desktop and phone) plus the phone
predict-question frame. Judged against DESIGN.md's looks-review checks.

- Found and fixed three phone/desktop overflow bugs before this review pass: step 6's top caption
  text, step 7's bottom caption text, and step 8's (Recap) "the rule" value each ran outside the
  drawing at the automated reel-test's measured widths — fixed by splitting each into two shorter
  `T` lines instead of one long line, confirmed by rerunning `tests/reels.mjs` until it passed
  cleanly.
- Also found and fixed a reel-test "swipe from caption" failure on step 3 (the first reveal right
  after the predict step): removing step 3's takeaway and moving it to step 6 instead fixed it,
  matching the same gotcha documented from topic 1's build (a takeaway directly after an early
  predict step breaks the phone swipe interaction).
- After both fixes, all 8 steps read cleanly at both sizes in the current screenshots: no
  overlapping or clipped text, generous spacing, the byte-strip visualization reads clearly at
  phone width.
- `tests/reels.mjs` (Playwright smoke test) passes for this topic at both sizes.
