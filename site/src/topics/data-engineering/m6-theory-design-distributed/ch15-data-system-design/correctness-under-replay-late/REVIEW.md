# Review — de.correctness-under-replay-late

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 5's handoff, this topic's own files in order
(reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`), then topic 7's syllabus line (failure-mode analysis and recovery).

1. **Flow.** The bridge answers topic 5's handoff verbatim, and the handoff to topic 7 matches
   `CHAPTER.md`'s own bridge text exactly. `uses` is limited to ids confirmed live in
   `registry.ts`: this chapter's own `correctness-as-specification`, `data-flow-shape-decision`,
   `system-of-record-vs-derived`; Chapter 2's `merge-statement`, `upsert-atomicity`,
   `event-stream-compression`; Chapter 3's `idempotent-merge-load`, `bounded-reprocessing-window`.
   Chapter 6, 7, 9 and 14 ids were moved to `declared`, same pattern as topics 1-5.
2. **Pre-notes.** 6 bullets, under 400 words, no links.
3. **Gap hunt.** `CHAPTER.md`'s own clause-by-clause breakdown for this topic actually splits the
   syllabus line into five sub-clauses (not the four I'd assumed from a first read), since its
   comma-separated tail after the colon is itself broken into "idempotent writes, deterministic
   transforms," "watermarks and correction windows," and "versioned outputs" as three separate
   bullets. `coverage.json`'s five clauses were checked to union to the entire raw syllabus line
   (line 841) word for word, learned directly from topic 4's own gap-hunt catch — checked this
   split *before* writing the reel, not after.
4. **Expert reader.** The red team's finding (`FACT-CHECK.md`) confirmed the Dataflow Model and
   Iceberg claims trace to the actual quoted text, and that neither source is stretched to cover
   mechanics `CHAPTER.md` explicitly leaves to Chapters 6, 7, 9 and 14.
5. **Engagement.** Hook (step 1, a re-run disagreeing with itself); predict within the first four
   steps (step 2); three takeaways (steps 4, 6, 8); recap (step 9); "Prove it" (step 10) extends
   the chapter's own reasoning to a new scenario (an external side effect) rather than restating
   the hook's own numbers.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 0-6% description
   overlap on every step, longest line 37 words. Spot-checked step 7 (the window-sizing reveal):
   the narrator argues for *why* a wider window costs something, not just stating the trade-off.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened every screenshot in `site/test-results/` for this topic after the `PREVIEW_HELD=1` reel
test run.

1. Every `scenes.tsx` row was written to 1-3 words per side from the start, with row gaps of
   65-75px and `Svg` heights sized to the row count — no overlap was found on the first
   `--only reels` run for this topic, same pattern as topics 4-5.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or amended-result highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. The unrelated `test:editor` check again fails in
this sandbox on its own hardcoded, unrelated topic (`de.b-trees-vs-lsm`) with "a save did not
open a new GitHub issue" — a known sandbox Playwright popup-handling limitation (see team memory
`learning-resources-editor-test-sandbox-limitation`), unrelated to anything this topic touches,
same as noted in topics 1-5's reviews.
