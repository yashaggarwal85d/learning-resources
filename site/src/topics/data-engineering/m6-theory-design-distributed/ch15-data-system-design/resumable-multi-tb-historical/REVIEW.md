# Review — de.resumable-multi-tb-historical

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 15's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 17's syllabus line (Lambda vs Kappa
for one pipeline).

1. **Flow.** The bridge answers topic 15's handoff verbatim, and the handoff to topic 17 matches
   `CHAPTER.md`'s own bridge text exactly. Checked each explicitly named `uses`/`declared` id via
   a Node.js script parsing `registry.ts` and checking each entry's own `introduces` array:
   every named Chapter 3 and Chapter 4 id, plus topic 15's own two introduced ids, are confirmed
   live. `at-least-once-plus-idempotence` is confirmed not live (Chapter 14 remains entirely
   unplanned), so it moves to `declared`, reusing the same placeholder id every prior topic this
   chapter has already used for the identical gap.
2. **Pre-notes.** 9 bullets (backfill, chunk, checkpoint, idempotent, throttle, shadow table,
   atomic swap, data diff, back-off — `CHAPTER.md`'s own "Pre-notes terms" list), each under the
   per-term format, no links.
3. **Gap hunt.** The syllabus line splits into five clauses by `CHAPTER.md`'s own breakdown
   (the production-protection framing; chunked/idempotent/checkpointed partitions; throttling;
   write-to-shadow then atomic swap; validation by data diff). Copied each clause byte-for-byte
   from the raw syllabus line and confirmed the five clauses union-cover every word of the line.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the chunked-partition and
   shadow-branch-promotion claims trace to Dagster's and Iceberg's own quoted documentation, and
   that neither source is stretched to cover the orchestrator's own backfill mechanics,
   write-audit-publish internals, or table-format branch mechanics beyond what each source's
   own quote states.
5. **Engagement.** Hook (step 1, a single backfill job that takes production down and dies with
   nothing saved); predict within the first four steps (step 2, the four decisions that prevent
   this); three takeaways (steps 4, 6, 8); recap (step 9); "Prove it" (step 10) extends the
   throttle's continuous-reaction framing to a second, already-running backfill rather than
   restating the hook's own single-job scenario.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 5-23% description
   overlap on every step, longest line 43 words. No digit or VERBATIM issues — this topic's own
   numbers (chunk counts, latency thresholds) stayed in `examples.py`'s lab and out of both the
   on-screen text and the narration, following the convention established after topic 10's
   literal-digit build failure.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Astro's build-time check (QUALITY.md #35, #50, #54, #59) initially flagged the first
   checkpoint-resume takeaway for exceeding the twenty-word limit, counting the em-dash as its
   own token — trimmed by one word rather than rewritten with a colon this time, since the dash
   itself was worth keeping for the sentence's structure.
2. Every `scenes.tsx` row was counted by hand against the 1-3-word guideline before running the
   smoke test; six rows across `Hook`, `Predict1`, `RevealChunkGrid`, `RevealThrottleSignal`,
   `Recap` and `ProveIt` were caught running to four or five words in the first draft and fixed
   in the same pre-check sweep, rather than discovered afterward from a failed smoke test.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. All ten step titles were written double-quoted
from the start with no embedded apostrophes or nested quote marks. The unrelated `test:editor`
check again fails in this sandbox with "a save did not open a new GitHub issue" — a known
sandbox Playwright popup-handling limitation (see team memory
`learning-resources-editor-test-sandbox-limitation`), unrelated to anything this topic touches,
same as noted in topics 1-15's reviews.
