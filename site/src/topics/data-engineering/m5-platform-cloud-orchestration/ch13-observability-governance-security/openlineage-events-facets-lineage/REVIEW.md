# Review — de.openlineage-events-facets-lineage

## Content review, self-review, 2026-11-02

1. **This topic's own lab (a real Spark job wired into a local Marquez server) is out of
   scope for this sandbox** -- no Marquez deployment or Spark-with-listener cluster is
   available. Per CHAPTER.md's own disclosed fallback, `examples.py` builds a toy
   `RunEventEmitter` and a toy SQL-text-parser/plan-walker pair that reproduce the exact
   mechanisms OpenLineage's own specification documents (the additive event model, the
   SQL-parse-vs-runtime-plan gap for column lineage), rather than fabricating a measurement
   from a system that isn't actually running.
2. **Build check caught a narration-reads-the-description violation on step 2:** the first
   draft paraphrased the Job/Run/Dataset definitions too close to `reel.tsx`'s own wording.
   Rewrote it as the professor's own framing, deliberately not naming "job," "run" or
   "dataset" by their exact terms in that line, to force genuine paraphrase.
3. **Build check caught a 59-word narration line on step 6:** split into two lines.
4. **Phone-layout overflow on the object-model scene:** `scenes.tsx`'s `RevealObjectModel`
   packed "Run, Dataset" and a long value onto one row, which overflowed on phone. Fixed by
   splitting into three separate rows (Job / Run / Dataset) and increasing the scene's height
   to fit them.
5. **Gap hunt against the syllabus line:** the single clause (the run/job/dataset event model,
   facets, integrations, consumers, SQL-parse-vs-runtime column lineage, and the gaps static
   lineage misses) is mapped across 7 of the reel's 11 steps in `coverage.json`; no part of
   the clause left unmapped.
6. **`declared: []`** matches CHAPTER.md's own "Declared: none" for this topic.
7. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic.
8. **Engagement:** hook at step 1; predicts at steps 3 and 6; three takeaways at steps 5, 8 and
   11 (Recap), each under the 20-word limit on the first draft.
9. **Narration teaches, not reads:** rewrote every line as the professor's own framing rather
   than restating `reel.tsx`'s body sentences, with the two exceptions caught and fixed per
   items 2 and 3. No raw digits anywhere.
10. **Numbers checked against `examples.py`:** the START-has-no-output/COMPLETE-adds-it claim
    and the SQL-text-misses-the-UDF's-hidden-input/dynamic-table-name claim both trace to
    asserted values from the toy run-event and SQL-parse-vs-plan models, not an unverified or
    hypothetical claim.

### Checks run

- `node scripts/sources.mjs check`: 15 quotes found word for word, 0 problems.
- `python3 examples.py`: "all claims verified" against the toy run-event emitter and the toy
  SQL-text-parser/plan-walker pair.
- `node scripts/check-all.mjs --topic .../openlineage-events-facets-lineage --only build`: 2
  fixes during the build (step 2's narration reading the description, step 6's 59-word line);
  clean on rebuild, 238 pages built.
- `node scripts/check-all.mjs --topic .../openlineage-events-facets-lineage --skip reels,links`:
  locked, docs, sources, build, narration all pass.
- `PREVIEW_HELD=1 npx astro build` (515 pages, all held topics included) and `PREVIEW_HELD=1
  node tests/reels.mjs http://localhost:4321/learning-resources/
  openlineage-events-facets-lineage`: reel smoke test failed once (step 2 phone overlap on the
  Job/Run/Dataset scene), fixed per item 4 above, then passed at desktop and phone sizes.

## Looks review, self-review, 2026-11-02

Hit a phone-overflow failure on the one scene packing three concepts (Job, Run, Dataset) into
two rows -- fixed by giving each its own row rather than trying to fit two short labels on one
line. Reel smoke test covered both desktop and phone sizes across all 11 steps, including both
predict panels (steps 3 and 6) and the three-row Recap scene, with no overflow or
swipe-caption failures after the fix.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
