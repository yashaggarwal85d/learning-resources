# Review — de.storage-layout-lifecycle-decisions

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 3's handoff, this topic's own files in order
(reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`), then topic 5's syllabus line (processing and serving choices).

1. **Flow.** The bridge answers topic 3's handoff verbatim, and the handoff to topic 5 matches
   `CHAPTER.md`'s own bridge text exactly. `uses` is limited to ids confirmed live in `registry.ts`
   (checked by grep): `data-flow-shape-decision`, `capacity-estimate-chain` (this chapter),
   `fact-grain`, `fact-table-types-...` and `medallion-bronze-silver-gold` (Chapter 3),
   `partition-pruning-plan-vs-run-time`, `partition-overhead`, `block-range-summary-pruning`,
   `composite-index-column-order` (Chapter 2), `object-storage-billing-model` (Chapter 1).
   Chapter 6 and Chapter 13 ids were moved to `declared`, same pattern as topics 1-3.
2. **Pre-notes.** 6 bullets, under 400 words, no links.
3. **Gap hunt.** The storyboard draft initially covered three of the four syllabus clauses and
   folded "table format and file layout" into the access-path reveal without naming it. Caught
   during the gap hunt (confirmed again independently when the build's own two-source coverage
   rule was not the blocker here, but the clause-union check would have been) — fixed by adding a
   dedicated step ("Reveal: a table format, picked by its one decisive cost") rather than stretching
   an existing step's clause mapping to cover text it didn't actually teach. Logged in
   `OUTLINE.md`'s "Changes from the chapter plan." The four clauses now union to the entire
   syllabus line with nothing left over.
4. **Expert reader.** The red team's finding (`FACT-CHECK.md`) confirmed the storage-limitation and
   design-by-default claims trace to the actual GDPR article text rather than a paraphrase drifting
   from it, and that the table-format claim is `CHAPTER.md`'s own framing, not an independent
   citation this topic lacks a source for.
5. **Engagement.** Hook (step 1, two symptoms from one cause); predict within the first four steps
   (step 2); three takeaways (steps 4, 7, 9 after the added step shifted later numbering); recap
   (step 10); "Prove it" (step 11) applies the same two-part check to a new access path (point
   lookup by session id) rather than restating the hook's own partition key.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 0-8% description
   overlap on every step, longest line 32 words. Spot-checked step 5 (the table-format reveal):
   the narrator argues for *why* interoperability is the decisive cost, not just naming formats.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened every screenshot in `site/test-results/` for this topic after the `PREVIEW_HELD=1` reel
test run.

1. Applied topic 3's lesson up front this time: every `scenes.tsx` row was written to 1-3 words
   per side from the start, with generous row gaps (70-75px) and taller `Svg` heights, rather than
   as a fixup pass. No overlap was found on the first `--only reels` run for this topic.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or surviving-option highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. The unrelated `test:editor` check again fails in
this sandbox on its own hardcoded, unrelated topic (`de.b-trees-vs-lsm`) with "a save did not
open a new GitHub issue" — unrelated to anything this topic touches, same as noted in topics 1-3's
reviews.
