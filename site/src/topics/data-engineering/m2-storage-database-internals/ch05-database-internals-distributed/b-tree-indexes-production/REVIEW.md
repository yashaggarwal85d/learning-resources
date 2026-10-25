# Review — de.b-tree-indexes-production

## Content review, self-review, 2026-10-24

Read in order: `checkpoints-crash-recovery/reel.tsx` + `checkpoints-crash-recovery/post-notes.md`
(previous topic's reel and Deep dive), then this topic's `reel.tsx`, `scenes.tsx`,
`narration.json`, `post-notes.md`, `pre-notes.md`, `prerequisites.mdx`, `registry.ts` entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, and the next topic's syllabus line
(`CHAPTER.md`, "6. MVCC: append versions vs undo logs").

1. **[Narration teaches] Step 1's narration originally read the body almost verbatim**
   (`node scripts/narration-teaches.mjs` flagged a 59% description-overlap with a verbatim match
   on "what actually finds the right one fast instead of…"). **Fix applied:** reworded the
   narration's closing line to ask the question from a different angle ("checking every one of
   them in order would work, eventually. What's the structure that makes it unnecessary?")
   instead of restating the body's own wording. Re-ran the check: 30% overlap, no verbatim flag.
   Severity: moderate (a real narration-persona rule, not polish).

2. **[Expert reader / build] The syllabus coverage map was initially incomplete and the expert
   list initially too short**, both caught by `npm run build`'s own coverage check before this
   review stage: the "Build depth → Rust Systems Engineering Ch.21" clause of the syllabus line
   wasn't mapped to any step, and the expert list had only 7 items against the required minimum
   of 10. **Fix applied:** folded the "Build depth" clause into the final syllabus clause
   (matching the sibling topic `write-ahead-logging-fsync`'s own established pattern of
   appending it to the last clause rather than treating it as a separate one), and added four
   more expert items (the clustered-vs-heap-organized trade-off framing, the declared-background
   vs. newly-introduced distinction, and the Lehman-Yao algorithm's real, narrower scope of
   guarantee) to reach 11 total. Severity: moderate (build-blocking).

3. **[Gap hunt] Syllabus clause coverage confirmed against `coverage.json`.** All six clauses
   of the full syllabus line (fanout; splits/merges/fillfactor; Lehman-Yao; deduplication; skip
   scan; clustered vs. heap-organized) map to real reel steps, and every `coverage.json → expert`
   item maps to a real step. No further fix needed.

4. **[Flow] Continuity with the previous topic and the next topic's syllabus line, both
   checked.** This topic's Hook body opens directly from `checkpoints-crash-recovery`'s own
   handoff ("every mechanism so far assumed one path to a row: a direct page read") with no
   abrupt jump. This topic's own handoff is the verbatim bridge text `CHAPTER.md` gives for the
   next topic (MVCC), confirmed by reading that topic's own entry.

5. **[Pre-notes] Checked against the reel's own vocabulary assumptions.** All five bullets
   (B-tree/B+-tree, leaf/internal page, fanout, page split, index) are terms the reel actually
   uses; B-tree/B+-tree is explicitly marked as declared background rather than retaught, which
   matches `coverage.json → declared`. No links present. No fix needed.

6. **[Expert reader] Checked the depth of the clustered-vs-heap-organized claim.** The claim as
   originally drafted stated InnoDB's extra traversal cost without stating the Postgres side's
   own cost in equally concrete terms. Confirmed the reel's step 8 body already states both
   sides concretely ("a clustered table's own secondary lookup costs an extra tree traversal
   that a heap-organized table's doesn't"), and `FACT-CHECK.md`'s claim 12 traces the Postgres
   half directly to this chapter's own topic 1 rather than leaving it asserted without source.
   No further fix needed.

7. **[Engagement] Arc checked end to end.** Step 1 hooks with a real, concrete problem (what
   finds the right page without scanning every one); two predicts (steps 4 and 10, satisfying
   the ≥2 requirement for a full topic); a surprising number (deduplication to roughly a third
   the size; fillfactor growing by real pages vs. none at all under identical inserts); three
   takeaways (steps 5, 6, 7); a recap that pulls all four threads (fanout, fillfactor,
   deduplication, concurrency) together. No fix needed.

`coverage.json → gapReview` recorded below.

## Looks review, self-review, 2026-10-24

Opened every phone screenshot in `site/test-results/` (steps 01–10, plus the two `-q` predict-answer
frames for steps 4 and 10) and one desktop screenshot (step 5), against `DESIGN.md`'s checklist.

1. **[Phone text overlap] `tests/reels.mjs`'s automated check initially failed on three rows**
   (step 7's `RevealLehmanYao` row, and step 8's `RevealProductionFeatures` both rows) — label/value
   text too long for phone width, the recurring `Row`-overlap pattern from prior topics. **Fix
   applied:** shortened step 7's value from "follow the link, not a lock" to "follow the link", and
   step 8's label/value pairs to "a skipped column" / "PG18 still uses it" and "a secondary lookup" /
   "one engine's extra hop". Re-ran `node scripts/check-all.mjs --only reels --topic
   b-tree-indexes-production`: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes."
   Severity: moderate (a real rendering bug, not polish).

2. **[Point visible at a glance] Checked every step for more than just colour.** Each step's title,
   the bold value text, and (where present) the red/white predict-answer framing and the
   gold-highlighted focus value carry the point without relying on colour alone — e.g. step 5's
   "grew by real pages" vs. "grew by none" reads as the point from the words themselves, colour only
   reinforces it. No fix needed.

3. **[Motion and landing frame] Every step's rows fade/ease in** (`easeOut(seg(t, ...))`) and land on
   a settled final frame with both rows fully visible — confirmed in the phone screenshots, which all
   show the post-animation resting state with no mid-transition clipping. No fix needed.

4. **[Crowding / clipping / small text] Checked all ten phone frames and the desktop frame.** No
   crowded, clipped, or undersized text in any of them after the step 7/8 fix; row spacing (55px
   gaps, consistent with sibling topics) holds on phone width throughout, including the four-row
   `Recap` step and three-row `ProveIt` step. No fix needed.

5. **[Colour used only for meaning] Confirmed red is reserved for the wrong predict-answer option**
   (steps 4 and 10's `-q` frames) and the warm focus colour marks the step's actual takeaway value,
   never decorative. No fix needed.

6. **[Captions match the voice] Checked on-screen text against `narration.json` for steps 1, 5, 6,
   7, and 9.** The on-screen `Row` text stays terse (data labels), the narration explains and teaches
   around it rather than reading it aloud, consistent with the house rule. No fix needed.

All phone and desktop screenshots re-checked after the step 7/8 fix (the `-q` frames for steps 4 and
10 were captured before this fix and are unaffected, since neither overlap was on those two steps).
