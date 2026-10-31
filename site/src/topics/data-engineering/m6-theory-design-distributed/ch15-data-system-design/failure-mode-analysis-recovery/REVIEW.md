# Review — de.failure-mode-analysis-recovery

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 6's handoff, this topic's own files in order
(reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`), then topic 8's syllabus line (cost model and dominant cost lever).

1. **Flow.** The bridge answers topic 6's handoff verbatim, and the handoff to topic 8 matches
   `CHAPTER.md`'s own bridge text exactly. `uses` is limited to ids confirmed live in
   `registry.ts`: this chapter's own `system-of-record-vs-derived`,
   `replay-backfill-as-first-class-path`, `correctness-as-specification`; Chapter 4's
   `resilient-client-patterns`; Chapter 5's `replication-ack-modes`. Chapter 5's `cap-pacelc`,
   Chapter 13's `blast-radius-scoring`/`stale-propagation-along-lineage`/`actionable-page-test`,
   and Chapter 14's `two-phase-commit-blocking-in-doubt`/`kafka-isr-non-majority-quorum` were moved
   to `declared`, same pattern as topics 1-6. `actionable-page-test` specifically looked live from
   topic 1's own concept ledger, but checking `registry.ts` directly showed it appears only inside
   topic 1's own `declared` array, never in anyone's `introduces` — caught before it was wrongly
   kept in `uses`.
2. **Pre-notes.** 8 bullets, under 400 words, no links.
3. **Gap hunt.** `CHAPTER.md`'s own clause-by-clause breakdown for this topic splits the syllabus
   line into five sub-clauses, not the four a naive semicolon count would give: "enumerate
   component failures", "and their blast radius", "RPO/RTO per data class", "degraded modes", and
   "DR mechanics live in §11.3" as a fifth, separately-scoped clause. `coverage.json`'s five
   clauses were checked against this breakdown directly, same lesson applied from topic 6's own
   gap-hunt catch, before writing the reel rather than after.
4. **Expert reader.** The red team's finding (`FACT-CHECK.md`) confirmed the cascading-failure,
   queue-latency, and retry/backoff claims trace to the actual quoted SRE-book and AWS-blog text,
   and that neither source is stretched to cover DR mechanics, incident response, or replication
   internals that `CHAPTER.md` explicitly leaves to Chapters 5, 11, 13 and 14.
5. **Engagement.** Hook (step 1, a poison record crash-looping while the dashboard reads fine);
   predict within the first four steps (step 2); three takeaways (steps 4, 6, 8); recap (step 9);
   "Prove it" (step 10) extends the chapter's own reasoning to a new failure (broker loss) rather
   than restating the hook's own numbers.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 0-9% description
   overlap on every step, longest line 36 words. Spot-checked step 6 (the RPO/RTO reveal): the
   narrator argues for *why* two separate questions hide inside what sounds like one promise, not
   just stating the distinction.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Every `scenes.tsx` row was written to 1-3 words per side from the start, with row gaps of
   65-75px and `Svg` heights sized to the row count — no overlap was found on the first
   `--only reels` run for this topic, same pattern as topics 4-6.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or amended-result highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. One build failure was caught and fixed before this
final run: a step-6 takeaway at 22 words (over the 20-word limit), shortened to 19. The unrelated
`test:editor` check again fails in this sandbox with "a save did not open a new GitHub issue" — a
known sandbox Playwright popup-handling limitation (see team memory
`learning-resources-editor-test-sandbox-limitation`), unrelated to anything this topic touches,
same as noted in topics 1-6's reviews.
