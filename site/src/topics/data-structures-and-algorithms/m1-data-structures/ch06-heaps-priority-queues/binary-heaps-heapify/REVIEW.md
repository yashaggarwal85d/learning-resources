## Content review, self-review, 2026-10-23

- Claims traced to sources: sift-up and sift-down's own procedures, the zero-indexed implicit array formula (children at 2i+1, 2i+2; parent at floor((i−1)/2)), Williams' O(n log n) one-at-a-time build, and the reason Floyd's bottom-up build is faster (most heapification work happens in the lower levels, where a node's height is small) are all quoted directly from Wikipedia's "Binary heap" article. The one-indexed equivalent of the index arithmetic and the named proposition "Sink-based heap construction is linear time" are quoted directly from Sedgewick & Wayne's algs4 "Priority Queues" page. All 18 quote-check passes (`sources.mjs check`) pass.
- `examples.py` was run twice. The first run, on a random permutation, measured only a ~1.7x gap between one-at-a-time and bottom-up build swap counts — technically a real measurement, but misleading: a random insertion's expected sift-up distance is close to constant, so random input understates the worst-case bound. The script was rewritten to build from a decreasing-order input instead, the adversarial case for a min-heap (every insertion is a new global minimum, so it swims the full root-ward path every time), which measured the real ~10x gap (39,917 swaps one-at-a-time vs. 3,990 bottom-up, on 4,000 elements) consistent with the n log n vs. n bound. Both builds are checked for a valid heap at every node, and a full pop-everything-off extraction is checked against `sorted()`.
- Gap hunt (`coverage.json` → `gapReview`): no open items. The full closed-form sum-of-heights proof is named and sourced, not re-derived symbol by symbol; d-ary heaps, monotone integer priority queues, binomial/pairing/Fibonacci heaps are named only in the frontier section per the chapter plan's skip list; heapsort's sortdown phase is named only as where the bottom-up build is used, not taught as its own mechanism.
- The syllabus clause (sift-up/sift-down, O(n) bottom-up build, implicit array) is mapped in `coverage.json` against four reel steps; both sources are mapped to the specific claims they support. Ten expert items were written blind, from the syllabus line and the two fetched sources alone.
- `FACT-CHECK.md`'s red team specifically checked that sift-up never touches more than one root-ward path (verified directly in `examples.py` by asserting a single insertion's swap count never exceeds the tree's own height), that the predict step's three wrong options are each ruled out by the sources' own wording, and that the 1-indexed and 0-indexed index formulas describe the identical relationship once the indexing convention is accounted for.
- Narration (all seven steps) was written as the professor's own reasoning, distinct from each step's on-screen caption/body, and verified clean with `scripts/narration-teaches.mjs` on the first run: no description-verbatim overlap above 1% on any step, no unspeakable-character hits, and no line over the fifty-word limit.
- One predict step (step 3, SiftUpPredict: what has to happen before an array with one value appended past its own end is a valid heap again) satisfies the refresher's one-predict-in-the-first-four-steps requirement, with a matching `answer` array in `narration.json`.
- Three takeaways (steps 4, 5, 6) satisfy the three-minimum rule; this refresher's own single-predict, shorter arc is consistent with its `kind: 'refresher'` in the registry.
- No build failures after fixing: scenes.tsx initially named `fontFamily="monospace"` directly on raw `<text>` elements instead of using the kit's `T` component — fixed by replacing every raw `<text>` with `T`. `pre-notes.md` initially had only 3 bold-term bullets (needs 4-14) — fixed by adding a fourth. `coverage.json`'s syllabus clause initially paraphrased the syllabus instead of quoting it word for word, and had only 6 expert items (needs 10) — both fixed.
- This topic opens Chapter 6: its bridge is the chapter's own opening line from Chapter 5's closing handoff, and its handoff is `CHAPTER.md`'s own entry for topic 31 (tournament and loser trees), both quoted word for word.

## Looks review, self-review, 2026-10-23

`npm run build` is clean. `node scripts/sources.mjs check` and
`node scripts/check-all.mjs --only reels --topic dsa.binary-heaps-heapify` both pass, with the reel
smoke test confirming zero live-reel regressions (the topic ships `held`, as every new topic does).

- Step 1 (Opening): the loose scatter of values settling into one highlighted minimum renders without overlap at both sizes.
- Step 2 (ArrayTree): the array drawn flat, then redrawn as the implicit tree beneath it, fits the frame without the tree and the index-arithmetic caption crowding each other.
- Step 3 (SiftUpPredict): the freshly appended value and its pulsing question mark, plus the predict/answer text, are legible at both sizes.
- Step 4 (SiftUpReveal): the new value's walk up the tree, one swap position at a time, renders cleanly against the undisturbed rest of the heap.
- Step 5 (SiftDownReveal): the root refill and walk-down renders without the moving node overlapping the fixed tree edges.
- Step 6 (BuildReveal): the two side-by-side swap-count bars (one-at-a-time, bottom-up) render at clearly different widths, matching the real cost gap.
- Step 7 (ProveIt): the measured swap-count bars and their captions (39,917 vs. 3,990 swaps) fit cleanly at both sizes.

Final reel check (`npm run build`, `sources.mjs check`, `check-all.mjs --only reels`): all pass.
This is the first topic of Chapter 6 (Heaps and Priority Queues).
