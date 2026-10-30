# Review — de.opentelemetry-across-batch-streaming

## Content review, self-review, 2026-10-30

1. **Two cross-chapter `uses` ids `CHAPTER.md` cites don't resolve.** Chapter 5's `queues-vs-logs`
   is not in `registry.ts` under that id (Chapter 5's own tail is still mid-build by a sibling
   thread); Chapter 8/9's CDC and Kafka-records ids don't exist because both chapters have only a
   `CHAPTER.md` plan, no built topics, confirmed directly by listing their folders. **Fixed** by
   declaring all four rather than guessing, logged in `OUTLINE.md` → "Changes from the chapter
   plan."
2. **Gap hunt against the syllabus line:** all six clauses (signals/Collector, W3C propagation,
   span links, semantic conventions, CDC-to-warehouse, OTel vs OpenLineage) mapped in
   `coverage.json`; no clause left unmapped.
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic (confirmed same as topic 1).
   Coverage and topic-file checks both pass.
4. **Expert reader pass:** step 5's link-limit reveal is backed by a real number from the SDK
   spec (128, not an assumed round number) and a real worked batch size (one million) rather than
   a toy example, matching the syllabus's own "nightly aggregation that reads a million events"
   framing.
5. **Engagement:** hook and predict both on step 1 (within the first four); a second predict at
   step 11 ("Prove it") tests whether the learner can separate "the trace is incomplete" from
   "the data is wrong" — the exact confusion the production-failures section in `post-notes.md`
   warns about; three takeaways at steps 6, 8, 9 (all after the reel's own midpoint of step 6);
   recap at step 10.
6. **Narration teaches, not reads:** clean on first `narration-teaches.mjs` run, description
   overlap under 17% on every step.
7. **Numbers checked against `examples.py`:** one million and one hundred twenty-eight (link
   limit), five producer contexts collapsing to one versus five surviving as links — every number
   in `reel.tsx` prose is spelled out as a word and traces to an asserted value.

### Checks run

- `node scripts/sources.mjs check`: 17 quotes found word for word, 0 problems.
- `node scripts/narration-teaches.mjs`: clean on first run, no fixes needed.
- `node scripts/check-all.mjs --skip reels,links,narration --topic opentelemetry-across-batch-streaming`:
  clean on first run after two reel takeaways were tightened to 20 words or under during drafting
  (caught before the check ran, from the topic 1 lesson); `locked`, `docs`, `sources`, `build` all
  pass.
- `node scripts/check-all.mjs --only reels --topic opentelemetry-across-batch-streaming`: "1 live
  reel(s) at desktop and phone sizes" — passed on the first run, no fixes needed. `test:editor`
  failed with the same pre-existing, already-tracked GitHub-token issue noted in topic 1's
  `REVIEW.md`; unrelated to this topic's content.

## Looks review, self-review, 2026-10-30

Reviewed screenshots in `site/test-results/*-opentelemetry-across-batch-streaming-*.png` (desktop
and phone, spot-checked all three-row steps and both predict frames):

1. No label/value row overlap at either size, including the three-row layouts (steps 4, 6, 8, 9).
2. Both predict panels (steps 2 and 11) render their option cards and explain text cleanly.
3. Takeaway panels (steps 6, 8, 9) render fully, italic, clearly separated from the body text.
4. Every step's final frame states its point in words on the right-hand readout (e.g. "128" /
   "999,872" against "batch size 1,000,000"), not through brightness alone.
5. Colour used only where it means something: the focus colour marks the row that resolves each
   step's own question. No red needed — nothing in this topic is a failure state to flag.
6. No clipped, crowded or under-size text found at phone width in any reviewed frame.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
