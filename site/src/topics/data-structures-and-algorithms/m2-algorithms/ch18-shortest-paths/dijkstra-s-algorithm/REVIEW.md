# Review — Dijkstra's algorithm

## Pass 1 — content

- Scope: all four syllabus clauses (label-setting with a priority queue, why non-negative weights are required, lazy deletion vs decrease-key, O((m+n)log n) with a binary heap) delivered and mapped in `coverage.json`.
- Sources: 2 Wikipedia sources, 6 quotes, all verified word-for-word by `sources.mjs check` (fixed one invisible-Unicode-character mismatch in the complexity-bound quote along the way).
- `examples.py`: Dijkstra's distances confirmed against brute-force relaxation; Wikipedia's own exact negative-edge counterexample reproduced directly (fixed a missing `visited` guard that was silently "correcting" the wrong answer instead of reproducing it); lazy deletion vs. decrease-key compared with an assertion that genuinely demonstrates lazy deletion's extra bookkeeping cost (stale pops), not a trivially-true tie.
- Fact-check: 6 claims, all confirmed; two implementation bugs found and fixed during fact-checking (documented in `FACT-CHECK.md`'s red team), no claim itself found incorrect.
- Bridge is topic 62's handoff verbatim; handoff is this topic's own CHAPTER.md-stated handoff to topic 64, verbatim.

## Pass 2 — looks and mechanics

- `reel.tsx`: 6 steps, 2 predicts (PredictNegative within the first four steps, LazyVsDecreaseKey), 3 takeaways (DijkstraMechanism, NegativeFailure, Recap), each ≤20 words.
- `scenes.tsx`: 6 functions on a shared `POS`/`EDGES` layout matching `WEIGHTED_ADJ`; no leftover code artifacts.
- No literal digits in `reel.tsx` outside pinned contexts (`duration:` lines, the 1959 attribution is not stated in-reel, no bare years present).
- `narration.json`: every line ≤50 words after splitting two over-length lines found by the build.
- `prerequisites.mdx`: both linked titles ("Breadth-first search", "Binary heaps and heapify") verified byte-identical against `registry.ts`.

## Checks run

- `python3 examples.py` — all assertions pass.
- `node scripts/sources.mjs check` — 6/6 quotes verified.
- `npm run build` (from `site/`) — passes.
- `node scripts/check-all.mjs --skip narration --changed` — locked/docs/sources/build/reels/links all pass except the pre-existing `test:editor` sandbox failure (unrelated to this topic, documented repo-wide).

This closes topic 63 and Chapter 18's first topic. Next: topic 64, Bellman-Ford and negative cycles.
