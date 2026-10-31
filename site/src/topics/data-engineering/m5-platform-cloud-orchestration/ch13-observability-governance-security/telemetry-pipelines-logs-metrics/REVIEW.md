# Review — de.telemetry-pipelines-logs-metrics

## Content review, self-review, 2026-10-30

1. **`CHAPTER.md` cites `uses: quantile-sketches` from Chapter 5, but Chapter 5's own syllabus
   marks the one topic that would introduce it, "Streaming quantiles service" (§5.6),
   *(skipped)*.** No live or held topic introduces `quantile-sketches`; confirmed with a
   repo-wide search of `registry.ts`. **Fixed** by re-classifying the claim ("a quantile is an
   estimate; per-instance quantiles can't be averaged") as `declared` general statistical
   knowledge instead of a cross-chapter `uses` pointer, and logging the citation bug in
   `OUTLINE.md` → "Changes from the chapter plan" rather than silently guessing an id.
2. **Chapter 11 §11.3's freshness-as-SLI concept has no `registry.ts` id**, because Chapter 11
   is unplanned. Handled the same way `CHAPTER.md` itself anticipates: `declared`, not `uses`,
   with the gap logged in `OUTLINE.md` for a later seam pass once Chapter 11 ships.
3. **Flow check:** this topic is `status: 'held'`, so `live.ts`'s `checkFlow` (which enforces
   syllabus order and `uses`/`declared` resolution) does not run against it — confirmed by
   reading `live.ts` directly rather than assuming. Coverage and topic-file checks (which run
   regardless of status) both pass.
4. **Gap hunt against the syllabus line:** all four clauses (structured logs/correlation IDs,
   metric types, golden signals, push vs pull) mapped in `coverage.json`; no clause left
   unmapped.
5. **Expert reader pass:** the counter/gauge distinction is sharpened past the Prometheus docs'
   own "don't" framing into a structural one (`examples.py` forces a decrease through a
   counter's own interface and shows the only honest result is a reset to zero, not the real
   value) — this is a deliberate deepening, not scope creep, since it is the exact mechanism the
   syllabus clause asks for ("which question each can and cannot answer").
6. **Engagement:** hook and predict both on step 1 (within the first four steps); a second
   predict at step 12 ("Prove it") closes the loop by applying the same freshness idea to a new,
   unseen stage; three takeaways at steps 4, 7, 8 (all after the reel's own midpoint of step 6)
   plus a fourth at step 9; recap at step 11.
7. **Narration teaches, not reads:** `node scripts/narration-teaches.mjs` ran clean on every
   step after two line-length fixes (see below) — description overlap stayed under 10% on every
   step, meaning the narration is consistently saying something the on-screen description does
   not.
8. **Numbers checked against `examples.py`:** ninety-three (log-search), seventy and zero
   (counter/gauge), six hundred twenty and ninety (freshness), four and fifteen (push/pull), ten
   thousand (cardinality) — every number named in `reel.tsx` prose is a word, not a digit, and
   traces to an asserted value in `examples.py`.

### Checks run

- `node scripts/sources.mjs check`: 22 quotes found word for word, 0 problems.
- `node scripts/narration-teaches.mjs`: two fixes applied (step 9/"push vs pull" line reworded
  under 50 words; step 11/"Recap" split into two lines to drop a 51-word line to 31) — clean on
  re-run.
- `node scripts/check-all.mjs --skip reels,links,narration --topic telemetry-pipelines-logs-metrics`:
  one fix applied (a reel takeaway at 24 words, cut to under 20) — clean on re-run; `locked`,
  `docs`, `sources` and `build` all pass.
- `node scripts/check-all.mjs --only reels --topic telemetry-pipelines-logs-metrics`: one fix
  applied (`prerequisites.mdx`'s on-site `Resource` used the registry `title` instead of the
  syllabus-matching `syllabusTitle`, "Linux shell and process toolkit") — reel smoke test then
  passed: "1 live reel(s) at desktop and phone sizes." The same run's `test:editor` step failed
  with "a save did not open a new GitHub issue" — this is the pre-existing, already-tracked
  GitHub-token issue for the notes editor (see project memory "Notes editor token expired"),
  unrelated to this topic's content and not something this topic's files touch; not fixed here,
  since it needs the owner's own GitHub token action, not a topic-folder change.

## Looks review, self-review, 2026-10-30

Reviewed every screenshot in `site/test-results/*-telemetry-pipelines-logs-metrics-*.png`
(desktop and phone, all 12 steps plus both predict-question frames):

1. No label/value row overlap at either size, including the three-row layouts (steps 4, 6, 8,
   9).
2. Both predict panels (steps 2 and 12) render their option cards and explain text cleanly at
   both sizes.
3. Takeaway panels (steps 4, 7, 8, 9) render fully, italic, with clear separation from the body
   text above.
4. Every step's final frame stands on its own: the right-hand two-row readout states the
   step's point in words, not only through row brightness.
5. Colour used only where it means something: the focus/pale value colour marks the one row per
   step that resolves the step's own question (e.g. "620 min old" against "still green"),
   consistent with the chapter's own red-for-failure, pale-for-second-series convention (no red
   needed in this topic — nothing here is a failure state being flagged).
6. No clipped, crowded or under-size text found at phone width in any reviewed frame.

No further fixes needed after the checks-driven round above; re-ran
`check-all.mjs --only reels` once after the `prerequisites.mdx` fix and confirmed the reel test
passes.

**No independent reviewer ran this review or the content review above — both are self-reviews
by the same session that wrote the topic.**
