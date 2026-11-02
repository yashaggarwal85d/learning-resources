# Review — de.processing-serving-choices

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 4's handoff, this topic's own files in order
(reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`), then topic 6's syllabus line (correctness under replay and late
data).

1. **Flow.** The bridge answers topic 4's handoff verbatim, and the handoff to topic 6 matches
   `CHAPTER.md`'s own bridge text exactly. `uses` is limited to ids confirmed live in
   `registry.ts`: this chapter's own `data-flow-shape-decision`, `layout-from-dominant-access-
   path`, `system-of-record-vs-derived`, `capacity-estimate-chain`; Chapter 2's `incremental-view-
   maintenance`; Chapter 4's `arrow-columnar-format` and `polars-lazy-expressions`; and Chapter 5's
   `lsm-compaction-rum`, confirmed live by grep and moved out of `declared` (topic 2 had it
   declared; it's now resolvable). The remaining chapter-plan ids (Chapter 5's serving-layers and
   cache topics specifically, Chapters 6, 7, 9) were moved to `declared`, same pattern as topics
   1-4.
2. **Pre-notes.** 6 bullets, under 400 words, no links.
3. **Gap hunt.** Checked all four syllabus clauses against `coverage.json` word for word, matching
   the raw syllabus line (line 840 of `syllabus/data-engineering.md`) including the parenthetical
   "(point lookup, OLAP slice, search, vector)" verbatim. The four clauses union to the entire
   scope line with nothing left over — learned from topic 4's own gap-hunt catch, checked this
   explicitly before writing the reel this time rather than after.
4. **Expert reader.** The red team's finding (`FACT-CHECK.md`) confirmed the DuckDB and Kleppmann
   claims trace to the actual quoted text, and that Kleppmann's short talk abstract isn't stretched
   to claim a cost trade-off it doesn't explicitly state — the staleness/fixed-shape cost of
   pre-aggregation is logged as this topic's own addition, not Kleppmann's.
5. **Engagement.** Hook (step 1, three competing fixes); predict within the first four steps
   (step 2); three takeaways (steps 4, 6, 9); recap (step 10); "Prove it" (step 11) applies the
   amplification ledger to a new scenario (a changed breakdown) rather than restating the hook's
   own numbers.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 0-13% description
   overlap on every step, longest line 45 words (within the 50-word limit). Spot-checked step 8
   (the amplification-ledger reveal): the narrator walks the ledger's own logic (start from
   logical, multiply by replication, multiply by rewrite) rather than naming the three numbers.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened every screenshot in `site/test-results/` for this topic after the `PREVIEW_HELD=1` reel
test run.

1. Every `scenes.tsx` row was written to 1-3 words per side from the start (topic 3 and 4's own
   lesson), with row gaps of 65-75px and `Svg` heights sized to the row count. No overlap was
   found on the first `--only reels` run for this topic.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or decisive-driver highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. The unrelated `test:editor` check again fails in
this sandbox on its own hardcoded, unrelated topic (`de.b-trees-vs-lsm`) with "a save did not
open a new GitHub issue" — unrelated to anything this topic touches, same as noted in topics 1-4's
reviews.
