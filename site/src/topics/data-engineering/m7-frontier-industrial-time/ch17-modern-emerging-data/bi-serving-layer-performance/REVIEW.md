# Review — de.bi-serving-layer-performance

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): pre-aggregated rollup tables and
  materialized views (Reveal: rollup tables and materialized views); result caching (Reveal:
  result caching); acceleration engines, BigQuery BI Engine and Databricks SQL (Reveal: BigQuery BI
  Engine; Reveal: Databricks SQL's disk cache); extract-refresh scheduling and concurrency limits
  (Reveal: concurrency ceilings and queueing).
- Sourcing: both vendor sources fetched cleanly on the first URL tried. One wrinkle: BI Engine's
  documentation used to be split across a separate "limitations" page (as CHAPTER.md's own
  phrasing assumes); Google has since merged that content into the single "Introduction to BI
  Engine" page, which still carries every specific claim CHAPTER.md asks for (the four-dimension
  join limit, the named exclusions) — documented in FACT-CHECK.md's Problem Solving section.
- No vendor pricing model or capacity-unit dollar figure is quoted anywhere, per CHAPTER.md's own
  "Leaves out" line; the topic sizes a concurrency ceiling against a stated usage pattern in
  prose, not against either vendor's specific billing unit.
- This topic has no lab by design (CHAPTER.md: "its examples are a sized, worked scenario rather
  than a chapter lab leg") — the hook and Prove It steps are reasoned entirely from the documented
  mechanism of a concurrency ceiling, deliberately isolating "query speed" from "concurrent
  demand" as two independent variables.
- The reel's engagement arc holds: two predicts (step 2, and the closing "Prove it"), no takeaway
  on step 3 (the reel test's reference step, "Reveal: rollup tables and materialized views"),
  takeaways on steps 4, 5, 6, 7.
- Narration (verified via `narration-teaches.mjs`): all nine steps clean on first pass, zero lines
  over the 50-word floor, description-overlap low across every step (0–20%).
- Takeaways: one initial 22-word takeaway (step 4's result-caching line) trimmed to 18 words before
  being written into reel.tsx by removing a redundant "a" and "is what"; the remaining four were
  all under 20 words on first draft.
- Bridge answers topic 9's handoff verbatim per CHAPTER.md; handoff leads into topic 11 (zero-ETL
  replication), which closes the chapter.

## Looks review (self-review, 2026-10-30)

Checked via the topic-scoped reel smoke test (`tests/reels.mjs`) at desktop and phone sizes.

- First run failed on phone with one overflow issue: step 5's "a large fact table + up to four
  small dimension tables" caption ran past the drawing's right edge at phone's larger text scale
  as a single `<T>` line.
- Fixed by splitting it into two `<T>` lines at separate y-offsets, then shifting the scene's
  remaining three elements (the "what it can't accelerate" group and the fallback line) down by
  24px each to keep their spacing, and increasing the scene's `Svg h` from 240 to 264 to fit the
  now-taller block — the same split-caption-then-reflow-downstream-elements pattern used on
  earlier topics' single-caption overflow bugs.
- Second run passed cleanly at both sizes with no further issues.

Final `node scripts/check-all.mjs --only reels --topic bi-serving-layer-performance` run:
`test:reels` passed ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes").
`test:editor` still fails with "a save did not open a new GitHub issue" — the same known,
pre-existing, topic-independent Playwright/Chromium sandbox limitation documented on every prior
topic's REVIEW.md in this chapter, not caused by this topic and not a shipping blocker.
