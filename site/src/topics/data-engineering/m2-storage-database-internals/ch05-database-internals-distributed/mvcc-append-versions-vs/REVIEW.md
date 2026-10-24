# Review — de.mvcc-append-versions-vs

## Content review, self-review, 2026-10-24

Read in order: `b-tree-indexes-production/reel.tsx` + `b-tree-indexes-production/post-notes.md`
(previous topic's reel and Deep dive), then this topic's `reel.tsx`, `scenes.tsx`,
`narration.json`, `post-notes.md`, `pre-notes.md`, `prerequisites.mdx`, `registry.ts` entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, and the next topic's syllabus line
(`CHAPTER.md`, "7. Vacuum, bloat and transaction-ID wraparound").

1. **[Gap hunt] The "index maintenance" half of the syllabus clause was thin.** Step 6's original
   body only said the table and index "grow by a real number of pages" without ever saying *why*
   the index specifically needs new entries, not just the heap. **Fix applied:** added one
   sentence to step 6's body ("Every new heap tuple needs its own index entry too, not just the
   index's old one updated") so the clause is actually taught, not just measured. Severity:
   moderate (a mapped syllabus clause that wasn't really said).

2. **[Gap hunt] `coverage.json`'s InnoDB-clustered-PK source item pointed at a step that never
   mentions it.** The item was mapped to step 6 (Postgres-only measurement), but the actual claim
   — InnoDB's primary key is the clustered index itself — was never said anywhere in that step's
   body. **Fix applied:** added the fact to step 5's body (the step that's actually about
   InnoDB's and Oracle's own model) and moved the `coverage.json` mapping there to match.
   Severity: moderate (a real content gap caught by checking the mapping against the actual
   text, not just trusting the map).

3. **[Build] A takeaway exceeded the 20-word limit.** Step 8's takeaway was 21 words. **Fix
   applied:** shortened to 18 words ("Snapshot too old isn't a bug; it's a bounded, circular log
   outliving a reader that still needs it."). Severity: minor (build-blocking, caught before the
   build ran rather than by a failure).

4. **[Narration teaches] Checked `node scripts/narration-teaches.mjs` directly.** All ten steps
   passed on the first run: description-overlap between 0% and 7%, no verbatim flags. No fix
   needed — the earlier topics' pattern of writing narration from a genuinely different angle
   than the body held up here without iteration.

5. **[Flow] Continuity with the previous topic and the next topic's syllabus line, both
   checked.** This topic's Hook body opens directly from `b-tree-indexes-production`'s own
   handoff ("A B-tree index answers 'where is this row' fast, but says nothing about what
   happens when two transactions want to change the same row at once"), matched close to
   verbatim rather than paraphrased loosely. This topic's own handoff is the verbatim bridge
   `CHAPTER.md` gives for the next topic (vacuum), confirmed by reading that topic's own entry,
   which explicitly answers this topic's handoff ("Postgres's own append-only MVCC never
   overwrites a row in place, which means every update leaves an old version behind").

6. **[Pre-notes] Checked against the reel's own vocabulary assumptions.** All five bullets (heap
   tuple, `ctid`, transaction/XID, WAL, B-tree index) are terms the reel assumes rather than
   teaches; `xmin`/`xmax`, snapshot, and commit-log lookup are deliberately **not** in pre-notes
   since the reel itself teaches them (outcomes 1–2). No links present, 5 bullets (within the
   4–14 range). No fix needed.

7. **[Expert reader] Checked the depth of the "two families pay differently" claim.** The reel's
   own steps 6–8 state concrete, asymmetric costs (Postgres: write-time, measured page growth;
   undo-log family: read-time reconstruction plus a hard bound) rather than a vague "trade-offs
   exist" gesture, and `FACT-CHECK.md`'s red team specifically tried to find a scenario where
   this asymmetry doesn't hold (a statically-sized, permanently-fixed retention) and found the
   framing held for the scenario this topic actually poses. No further fix needed.

8. **[Engagement] Arc checked end to end.** Step 1 hooks with the handoff's own open question;
   two predicts (steps 4 and 10, satisfying the full-topic requirement); a surprising number
   (step 2's real proof that two full tuples exist on one page after a single update, not a
   diagram); three takeaways (steps 6, 7, 8); a recap (step 9) that pulls the two families,
   update cost, long-read behaviour and the undo family's own limit together. No fix needed.

`coverage.json → gapReview` recorded below.
