# Review — Floyd-Warshall and Johnson's algorithm

## Pass 1 — content

- Scope: all three syllabus clauses (the O(n³) DP over intermediate vertices, transitive closure and path reconstruction, Johnson's potential reweighting for all-pairs on sparse graphs with negative edges) delivered and mapped in `coverage.json`.
- Sources: Wikipedia's "Floyd–Warshall algorithm" article covers the algorithm's own mechanism, its attribution (Floyd 1962, essentially Roy 1959 and Warshall 1962), the triple-nested-loop pseudocode, Warshall's own Boolean transitive-closure formulation, and path reconstruction via the penultimate-vertex `prev` matrix; "Johnson's algorithm" covers the added-vertex reweighting mechanism, the Bellman-Ford potentials pass, the per-vertex Dijkstra pass, and the sparse-graph trade-off claim. All 16 quotes verified verbatim after splitting three paragraphs at Wikipedia's footnote-merge points.
- `examples.py`: `floyd_warshall` matches an independently-coded brute-force all-pairs Bellman-Ford exactly on a 5-vertex graph with two negative edges and multiple route choices; `reconstruct_path` recovers a path strictly cheaper than the one direct edge between the same endpoints, with its weight checked against the distance matrix; `transitive_closure` matches an independent DFS-based reachability check; `johnsons` (its own separate Bellman-Ford-potentials-then-per-vertex-Dijkstra pipeline, with an explicit assertion that every reweighted edge is non-negative) matches `floyd_warshall`'s distances exactly — a cross-check between two independently implemented algorithms, not a shared computation.
- Fact-check: 7 claims, all confirmed; no claim found incorrect. The sparse-graph trade-off (claim 7) is documented as a stated, sourced asymptotic trade-off rather than a worked numerical comparison, since this topic's graph is too small for either algorithm's asymptotic behaviour to show a measurable difference — consistent with how the chapter plan scopes that clause.
- Bridge is topic 64's handoff verbatim; handoff is this topic's own CHAPTER.md-stated handoff to topic 66, verbatim.

## Pass 2 — looks and mechanics

- `reel.tsx`: 7 steps, 2 predicts (PredictSparse within the first four steps, JohnsonsMechanism), 3 takeaways, each ≤20 words. A step 6 draft that used a Unicode curly apostrophe to dodge the escaped-straight-apostrophe bug was caught before any build attempt and reworded to need no apostrophe at all.
- `scenes.tsx`: 7 functions plus one shared `Matrix` component (a 5×5 grid with a highlighted waypoint row/column); no leftover code artifacts.
- No literal digits in `reel.tsx` outside `duration:` lines — verified by grep before the first build attempt.
- `narration.json`: written teaching-not-reading from the start (learned directly from topic 64's build-time narration-quality failure); no restated-description lines found on review.
- `prerequisites.mdx`: linked titles ("Dijkstra's algorithm", "Bellman–Ford and negative cycles") verified byte-identical against `registry.ts`, including topic 64's en-dash, caught proactively before writing rather than after a build failure.
- `registry.ts`: title/syllabusTitle set to the syllabus's own en-dash "Floyd–Warshall and Johnson's algorithm" from the first draft, by grepping the syllabus file directly rather than retyping; `chapter.section` included from the first draft (learned from topic 63's `tsc`-only-caught omission).

## Checks run

- `python3 examples.py` — all assertions pass.
- `node scripts/sources.mjs check` — 16/16 quotes verified.
- `npm run build` (from `site/`) — passes, 525 pages built.
- `npx tsc --noEmit` — no errors from `registry.ts` or this topic's files (pre-existing, unrelated errors remain in chapter 15's sorting topics from another thread's work).
- `node scripts/check-all.mjs --skip narration --changed` — run; see commit for final status.

This closes topic 65. Next: topic 66, DAG shortest and longest paths.
