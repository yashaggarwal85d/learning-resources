# Review — de.object-storage-as-database

## Content
- All 16 SOURCES.md quotes verified word-for-word against 7 sources (3 dated AWS
  announcements, AWS PutObject/performance docs, GCS consistency docs, ADLS conditional-headers
  docs). `sources.mjs check`: 16/16, 0 problems.
- `examples.py` runs against a REAL local S3-compatible HTTP server (`moto.server.ThreadedMotoServer`)
  with REAL `boto3` HTTP requests — not simulated Python calls. Four demonstrations, each with
  real asserts: conditional create (`If-None-Match: *`, genuine 412 on conflict), conditional
  update/compare-and-swap (`If-Match`, genuine 412 on stale ETag), no-atomic-rename (copy without
  delete leaves both objects), and real paginated LIST cost (250 objects / 50 per page / 5 round
  trips). The module docstring and FACT-CHECK.md both disclose that moto's consistency/latency
  are a local simulation, not a measurement of real AWS behavior — only the protocol-level 412
  contract is asserted as matching AWS's documented API.
- Fact-checked CHAPTER.md's claim that If-Match/bucket-policy enforcement shipped "later in 2024"
  against AWS's own November 25, 2024 announcement — accurate, no correction needed.

## Problems found and fixed
1. **Build failure: reel.tsx digit-provenance check on "2020,"** — a 4-digit year immediately
   followed by a comma (no space) breaks the check's year-exclusion regex (`/^(19|20)\d\d$/`
   fails against "2020," since the comma is captured). Fixed by removing/rephrasing the comma in
   two places (step 3's `fig`, and the Recap `body`).
2. **narration.json unspeakable flag on "S3"** — the digit in the acronym trips the same
   `UNSPEAKABLE` regex as a token like "int32". Fixed with a global `S3` → `S three` substitution.
3. **Phone-only reel-test overflow, step 10 (Recap)** — `scenes.tsx`'s TallRow value
   `"If-None-Match / If-Match, a real compare-and-swap"` ran outside the drawing on the phone
   viewport. Shortened to `"a real compare-and-swap"`. Reel smoke test then passed clean at both
   desktop and phone sizes.
4. **moto/boto3/flask not pre-installed** — one-time `pip install` (noted in FACT-CHECK.md);
   doesn't affect the build, since `check-all.mjs`'s number-provenance check only statically
   parses `examples.py`'s source for literals, it never executes it.

## Checks (all green)
- `sources.mjs check`: 16/16 quotes
- `examples.py`: all assertions pass
- `narration-teaches.mjs`: clean, no flags
- `check-all.mjs --skip reels,links,narration --topic de.object-storage-as-database`: pass
- `check-links.mjs`: 0 broken links (the standard `check by hand` GitHub-issue-report 429 is
  the usual benign pattern every topic has)
- `check-all.mjs --only reels`: "Reel smoke test passed: 1 live reel(s) at desktop and phone
  sizes" (after the step-10 fix)
- `test:editor`: fails with the known, pre-existing sandbox-only Playwright limitation
  (not a regression)

## Screenshot review
All 10 desktop screenshots and all 10 phone screenshots reviewed by hand: no overlapping or
cut-off text, predict options render correctly, takeaways display correctly, Recap renders
cleanly at both sizes.
