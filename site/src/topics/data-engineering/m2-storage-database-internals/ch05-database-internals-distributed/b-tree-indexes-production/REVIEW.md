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
