# Review — de.lineage-driven-impact-analysis

## Content review, self-review, 2026-11-02

1. **No real catalog/lineage stack built; a toy graph instead.** `examples.py` builds the
   table-level/column-level/owner graph directly as Python dataclasses rather than standing up
   OpenLineage + Marquez or DataHub, for the same build-cost-vs-scope reason prior chapter-13
   topics gave (see `FACT-CHECK.md`'s "Abandoned approaches" section).
2. **All five primary sources fetched cleanly on the first try** -- openlineage.io, the OpenLineage
   facet spec page, marquezproject.ai, docs.datahub.com and sre.google all resolved without a
   raw.githubusercontent.com-style substitution.
3. **A quote-accuracy mistake caught before the checker ran:** the DIRECT/INDIRECT definitions
   were first drafted from memory of an earlier topic's similar-but-different phrasing; caught by
   re-reading the freshly fetched facet-page text directly and rewritten to match verbatim.
4. **Gap hunt against the syllabus clause:** blast-radius scoring, stale propagation, owner
   notification and deprecation are each mapped across the reel's 9 steps in `coverage.json`;
   incident triage (§11.3) and contract enforcement (§11.4) are both carried as cross-chapter
   `uses` entries and named in `prerequisites.mdx`'s "Before this" section rather than retaught.
5. **declared: []** -- this topic introduces no term CHAPTER.md marks as declared-only.
6. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic -- the last 7 topics of
   chapter 13 shipped the same way and will go live together once the build cursor reaches them.
7. **Engagement:** hook at step 1 (index 0); predicts at steps 3 and 7 (indices 2 and 6); three
   takeaways at steps 4, 6 and 9 (indices 3, 5, 8 -- Recap), none on the step immediately after
   either predict and none on the smoke test's own "from" step.
8. **Phone-layout overflow on five scenes, one round:** `scenes.tsx` Row values on the Hook,
   stale-propagation, planted-truth predict, and planted-truth-answer scenes packed too much text
   onto one row at phone width. Fixed by shortening each value to one or two words (e.g. "far
   more, plus an unwired reader" to "far more, one unwired"; "missed -- no event ever existed" to
   "missed, never recorded").
9. **Prerequisites.mdx stayed links-only from the start** -- both the "Before this" section
   (topics 10, 11, 13 of this chapter plus Chapter 11's incident-response and
   contract-enforcement topics) and the sources section are wrapped entirely in `Resource` tags,
   following the pattern fixed into place on the two prior topics.

## Checks run

- `node scripts/sources.mjs check .`: one quote-mismatch caught and fixed before the first run
  (see item 3); 11 quotes found word for word, 0 problems on the corrected check.
- `python3 -I examples.py`: "all claims verified" -- table-level vs. column-level blast radius,
  owner deduplication, and the uninstrumented reader's permanent invisibility -- after removing a
  leftover dead `if False else` assert line found during review.
- `node scripts/check-all.mjs --topic .../lineage-driven-impact-analysis --only build`: one
  failure on the first run ("2 takeaway(s)", needed 3), fixed by adding a third takeaway to the
  owner-notification elaboration step; 238 pages built clean on the second run.
- `node scripts/check-all.mjs --topic .../lineage-driven-impact-analysis --skip reels,links`:
  locked, docs, sources, build, narration all pass.
- `PREVIEW_HELD=1 npx astro build` (522 pages, all held topics included) and `PREVIEW_HELD=1
  node tests/reels.mjs http://127.0.0.1:4321/learning-resources/
  lineage-driven-impact-analysis`: reel smoke test failed once (phone overflow on five rows
  across four scenes), fixed per item 8, then passed at desktop and phone sizes.

## Looks review, self-review, 2026-11-02

Hit a phone-overflow failure on five label/value rows across four scenes packing a longer value
onto one row -- fixed by shortening each value to one or two words rather than a full phrase.
Reel smoke test covered both desktop and phone sizes across all 9 steps, including both predict
panels (steps 3 and 7) and the blast-radius, column-narrowing, stale-propagation,
owner-notification, planted-truth-answer and Recap scenes, with no overflow or swipe-caption
failures after the fix.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
