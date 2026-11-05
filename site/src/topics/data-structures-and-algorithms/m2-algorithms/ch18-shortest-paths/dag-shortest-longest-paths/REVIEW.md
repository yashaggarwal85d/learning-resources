# Review — DAG shortest and longest paths

## Pass 1 — content

- Scope: both syllabus clauses (relaxation in topological order in O(n + m); longest path and critical path in schedules) delivered and mapped in `coverage.json`.
- Sources: Wikipedia's "Shortest path problem" and "Topological sorting" both independently state the linear-time, topological-order DAG shortest-path algorithm; "Longest path problem" covers the general NP-hardness fact (stated, not proven, per this topic's own scope), the negation argument restricted to acyclic graphs, and the direct topological-order longest-path procedure; "Critical path method" covers the method's own definition and historical attribution. All 16 quotes verified verbatim.
- `examples.py`: `dag_shortest_paths` run in the correct topological order matches an independently-coded `brute_force_all_paths_shortest` (a full Bellman-Ford-style relaxation sweep) exactly on a 6-vertex graph; `dag_shortest_paths_wrong_order`, run on the identical graph in a deliberately non-topological order, produces a strictly larger (wrong) distance at vertex five (nine versus the correct five) — demonstrating the ordering requirement directly, not merely asserting it. `dag_longest_paths` (via negation) finds a strictly longer path than the shortest one between the same endpoints, confirmed against a hand-traceable predecessor chain. A 7-task dependency DAG's critical path is read directly off the same longest-path computation and confirmed by hand-summing every candidate path's own duration.
- Fact-check: 7 claims, all confirmed; no claim found incorrect. One drafting error (a miscounted hand-expectation for `dag_dist[5]`, originally asserted as eight instead of five) was caught by `python3 examples.py` failing on first run, traced by hand, and corrected before any build attempt.
- Bridge is topic 65's handoff verbatim; handoff is this topic's own CHAPTER.md-stated handoff to `dsa.cut-property-kruskal-s`, verbatim — confirmed byte-identical against that topic's own live bridge field on `main`.

## Pass 2 — looks and mechanics

- `reel.tsx`: 7 steps, 2 predicts (PredictCycleRequired within the first four steps, PredictLongestPathGeneral), 3 takeaways, each ≤20 words after two were shortened from 22 and 29 words on the build's own takeaway-length check.
- `scenes.tsx`: 7 functions on one shared 6-vertex graph layout plus a separate task-name row for the critical-path scene; no leftover code artifacts. One early draft misused a colour constant as graph-label text (`WhyOrderMatters`) — caught and fixed before any build attempt.
- No literal digits in `reel.tsx` outside `duration:` lines; no escaped apostrophes (all apostrophes are plain, inside double-quoted strings).
- `narration.json`: one line (step 5) exceeded the fifty-word-per-line limit on first build; split into two lines without changing the content.
- `prerequisites.mdx`: all four linked titles ("Topological sort", "Dijkstra's algorithm", "Bellman–Ford and negative cycles", "Floyd–Warshall and Johnson's algorithm") verified byte-identical against `registry.ts`, including both en-dashes, before writing.
- `registry.ts`: title/syllabusTitle is the syllabus's own plain-ASCII title ("DAG shortest and longest paths" — no en-dash needed here, confirmed by reading the syllabus line directly); `chapter.section` included from the first draft.

## Checks run

- `python3 examples.py` — all assertions pass (after correcting one hand-miscounted expected value, caught by the script's own first run).
- `node scripts/sources.mjs check` — 16/16 quotes verified.
- `npm run build` (from `site/`) — passes, 525 pages built (after fixing one overlong narration line and two overlong takeaways on the build's own topic-file checks).
- `npx tsc --noEmit` — no errors from `registry.ts` or this topic's files.
- `node scripts/check-all.mjs --skip narration --changed` — run; see commit for final status.

This closes topic 66, and Chapter 18 (Dijkstra's algorithm, Bellman-Ford and negative cycles, Floyd-Warshall and Johnson's algorithm, DAG shortest and longest paths) in full.
