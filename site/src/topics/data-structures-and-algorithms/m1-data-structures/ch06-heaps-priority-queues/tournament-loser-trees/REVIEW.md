## Content review, self-review, 2026-10-23

- Claims traced to sources: the naive scan's Θ(k) cost, the heap's own "approximately 2*log(k)" per-step cost, the tournament tree's elimination-bracket structure, the loser tree's loser-storage mechanic and its leaf-to-root replay, and the external-sorting connection are all quoted directly from Wikipedia's "K-way merge algorithm" article. A second, independent statement of the loser tree's own leaf-to-root repair advantage is quoted from TutorialsPoint. All 14 quote-check passes (`sources.mjs check`) pass.
- `examples.py` builds a naive scan, a real instrumented binary-heap-based merge, and a real instrumented loser tree, and runs all three at k=8 (a power of two) and k=6 (padded to 8 with sentinel runs). All three produce the identical fully-sorted output on every run — correctness is independent of which structure did the merging. The loser tree's own comparisons-per-output is asserted to equal ⌈log₂(m)⌉ exactly (m = next power of two ≥ k) on every single output, both k values.
- **Honest finding, not assumed**: the source's own "approximately 2*log(k)" heap cost is a rough estimate for a sift-down that sinks the full tree depth. The actual measured heap-to-loser-tree ratio came out to 1.45x (k=8) and 1.19x (k=6), not 2x — because a k-way merge's replacement values are usually close in rank to what was just removed, so a sift-down often stops before reaching the bottom. `OUTLINE.md`, `FACT-CHECK.md`, `reel.tsx`, `narration.json` and `post-notes.md` were all written (or, for `reel.tsx`'s predict options, revised after the first `examples.py` run) to state this honestly — the loser tree still wins on every run measured, but the reel never claims the specific "2x"/"half" figure as the measured result, only as the source's own rough per-level estimate.
- Gap hunt (`coverage.json` → `gapReview`): no open items. The precise ⌈log₂ k⌉ ceiling notation is this topic's own exact statement of what both sources phrase informally; the LSM-compaction connection rests on topic 29's own already-verified content, not a new source; binomial/pairing/Fibonacci heaps are named only in the frontier section per the chapter plan's skip list.
- The syllabus clause (the full sentence naming the ⌈log₂ k⌉ bound, root-to-leaf replay, and the external-sorting/LSM-compaction connection) is mapped in `coverage.json` against three reel steps; both sources are mapped to the specific claims they support. Ten expert items were written blind, from the syllabus line and the two fetched sources alone.
- `FACT-CHECK.md`'s red team specifically checked that the ceiling notation isn't a verbatim source quote (it follows from the sentinel-padding construction both sources do describe), that the heap-vs-loser-tree gap doesn't overstate the source's rough estimate as a measured fact, and that no fabricated source claims a dedicated LSM-compaction/loser-tree connection.
- Narration (all nine steps) was written as the professor's own reasoning, distinct from each step's on-screen caption/body, and verified clean with `scripts/narration-teaches.mjs` on the first run: no description-verbatim overlap above 16% on any step, no unspeakable-character hits, and no line over the fifty-word limit.
- Two predict steps (step 3: what a heap-based merge actually costs per output; step 5: can a tournament tree beat a heap's own cost) satisfy the full topic's predict requirement, both within the first five steps as planned, both with matching `answer` arrays in `narration.json`.
- Three takeaways (steps 4, 7, 9) satisfy the three-minimum rule.
- This topic opens with topic 30's own handoff as its bridge, and closes Chapter 6: its handoff is `CHAPTER.md`'s own chapter-closing entry to Chapter 7 (tries), both quoted word for word.

## Looks review, self-review, 2026-10-23

`npm run build` is clean. `node scripts/sources.mjs check` and
`node scripts/check-all.mjs --only reels --topic dsa.tournament-loser-trees` both pass, with the
reel smoke test confirming zero live-reel regressions (the topic ships `held`, as every new topic
does).

- Step 1 (Opening): the four sealed runs feeding into one output stream render without overlap at both sizes.
- Step 2 (NaiveReveal): the sweep across four heads, with the smallest highlighted, is legible at both sizes.
- Step 3 (HeapPredict) and its answer state: the small heap and the predict/answer text render cleanly.
- Step 4 (HeapReveal): the two-level sift-down path, with both children highlighted at each level, fits the frame without the two levels overlapping.
- Step 5 (TournamentPredict) and its answer state: the first-round bracket pairs and the predict/answer text are legible at both sizes.
- Step 6 (TournamentReveal): the bracket's games resolving round by round up to one winner renders cleanly without crowding.
- Step 7 (LoserTreeReveal): the one-leaf-refilled, one-path-lit-up visual clearly distinguishes the active path from the untouched rest of the bracket.
- Step 8 (ExternalSortReveal): the four on-disk runs merging into one output run render without overlap.
- Step 9 (ProveIt): the three comparisons-per-output bars (naive, heap, loser tree) and their captions fit cleanly at both sizes, with visibly different widths matching the real measured gap.

Final reel check (`npm run build`, `sources.mjs check`, `check-all.mjs --only reels`): all pass.
This is the second and final topic of Chapter 6 (Heaps and Priority Queues), closing the chapter.
