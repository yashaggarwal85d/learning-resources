# Review — de.cost-model-dominant-cost

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 7's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 9's syllabus line (trade-off
articulation and decision records).

1. **Flow.** The bridge answers topic 7's handoff verbatim, and the handoff to topic 9 matches
   `CHAPTER.md`'s own bridge text exactly. `uses` draws entirely from this chapter (topics 2, 4,
   5) and the already-live Chapter 1 and Chapter 3 ids, all confirmed live via `grep` on
   `registry.ts`'s own `introduces` arrays — `CHAPTER.md`'s own chapter-plan `uses` names Chapter
   10 §10.4 and Chapter 6 §6.5 as sources to look up, but neither chapter is live yet, so no ids
   from them are available; `declared` is empty since every id this topic needs is already live.
2. **Pre-notes.** 9 bullets, under 400 words, no links.
3. **Gap hunt.** The syllabus line splits cleanly into the three clauses `CHAPTER.md` itself names
   (per-unit pricing across five classes; identifying the dominating lever; the design change that
   moves it) — checked `coverage.json`'s three clauses union to the full raw syllabus line before
   finalizing.
4. **Expert reader.** The red team's finding (`FACT-CHECK.md`) confirmed the BigQuery bytes-
   processed and S3 cost-component claims trace to the actual quoted pricing-page text, and that
   neither source is stretched to cover FinOps practice, infrastructure as code, or autoscaling
   mechanics that `CHAPTER.md` explicitly leaves to Chapter 10 §10.4 and the skipped Chapter 12
   topic. Caught one build failure: the first `coverage.json` draft had only nine expert items,
   one short of the ten the coverage checker requires — fixed by adding a tenth item (the hook's
   own "effort spent is not evidence of where cost sits" lesson) before the ten-item rule was
   checked against the written file, not assumed from habit.
5. **Engagement.** Hook (step 1, a month of tuning saving little against one query's real share);
   predict within the first four steps (step 2); three takeaways (steps 4, 6, 8); recap (step 9);
   "Prove it" (step 10) extends the chapter's own reasoning to a new scenario (a provider price
   cut shifting the dominator) rather than restating the hook's own numbers.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 0-9% description
   overlap on every step, longest line 41 words. Spot-checked step 4 (the waterfall reveal): the
   narrator argues for *why* attacking the smaller categories first wastes effort, not just
   stating the ranking.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Every `scenes.tsx` row was written to 1-3 words per side from the start, with row gaps of
   65-75px and `Svg` heights sized to the row count — no overlap was found on the first
   `--only reels` run for this topic, same pattern as topics 4-7.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or amended-result highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. The unrelated `test:editor` check again fails in
this sandbox with "a save did not open a new GitHub issue" — a known sandbox Playwright
popup-handling limitation (see team memory `learning-resources-editor-test-sandbox-limitation`),
unrelated to anything this topic touches, same as noted in topics 1-7's reviews.
