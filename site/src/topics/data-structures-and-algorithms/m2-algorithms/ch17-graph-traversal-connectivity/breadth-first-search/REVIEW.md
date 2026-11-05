# REVIEW: Breadth-first search

## Pass 1 — content, self-review

Read cold against the previous topic's reel (`dsa.quickselect-median-medians`), its own handoff line, and this chapter's own `CHAPTER.md`, then every file of this topic in order.

- **Flow:** the bridge is topic 58's handoff word for word; no concept is used before it is taught (the FIFO-order proof in step 3 only after the predict in step 2 poses the question; multi-source and 0-1 BFS as direct extensions, not new mechanisms; bipartiteness's predict in step 6 before its own mechanism in step 7; direction-optimizing BFS last, as a genuinely different, production concern).
- **Pre-notes:** five terms, all recap vocabulary the reel assumes (graph, vertex/edge, directed/undirected, queue, neighbour) and none it teaches; under the word limit.
- **Gap hunt against the syllabus line:** all six clauses covered (`coverage.json`) — level-by-level frontier and unweighted shortest paths (steps 2–3), multi-source BFS (step 4), 0-1 BFS with a deque (step 5), bipartiteness and odd-cycle detection (steps 6–7), direction-optimizing BFS (step 8). Against the expert list: no `out` items.
- **Expert reader:** the shortest-path guarantee is proved from the FIFO queue's own invariant, not merely asserted; the bipartiteness witness is constructive (the actual odd cycle, not just a verdict), matching the Wikipedia source's own construction exactly.
- **Engagement:** step 1 hooks on the billion-edge claim; two predicts (steps 2 and 6, the first within the first four steps); four takeaways (steps 3, 4, 7, 8); the recap (step 9) names the chapter's own closing idea (distance, from a widening frontier) against the next topic's different shape (depth, from a single path).
- **Narration teaches:** each step explains the reasoning (why the FIFO order itself proves the guarantee, why seeding several sources costs one pass not several, why a deque suffices only for 0/1 weights, why the odd-cycle witness is constructive, why switching scan direction saves work) rather than restating the caption.

All claims in `FACT-CHECK.md`'s table are confirmed, either by word-for-word source quote (`SOURCES.md`, `sources.mjs check`: 11/11 quotes pass across three sources, including a substituted-but-stated extended journal version of the Beamer et al. paper, since the SC12 conference PDF itself sits behind an IEEE paywall) or by direct computation in `examples.py` (`python3 examples.py`: all assertions pass).

## Pass 2 — looks and mechanics, self-review

- `reel.tsx`: nine steps; every literal number (the shortest-path length, the multi-source edge-count ratio, the 0-1 BFS/Dijkstra match, the odd/even cycle colouring outcomes, the top-down/hybrid edge-count ratio) traced to `examples.py`. Two takeaways initially over the 20-word limit (steps 4 and 7), both shortened before the first build attempt, having learned from topics 57–58's own pattern of catching this at build time instead.
- `narration.json`: nine steps matching the reel exactly; `answer` present on both predict steps (2 and 6) and nowhere else; no digit spoken (CHAPTER.md's own rule), numbers described by magnitude rather than read as figures.
- `coverage.json`: all six syllabus clauses copied word for word from `syllabus/data-structures-and-algorithms.md`'s own topic line; three sources mapped with items; a ten-item independent expert list.
- `prerequisites.mdx`: the linked title ("Adjacency lists, matrices and edge lists") verified against `registry.ts` by exact grep before use.
- `scenes.tsx`: a shared ring-plus-chord graph layout (`ringPos`, `RING_EDGES`) reused across the opening, predict and mechanism scenes rather than redrawn per step, so the frontier's expansion reads as the same graph throughout, not a new picture each time.

Build (`npm run build`, 549 pages including this topic's own) and the full `node scripts/check-all.mjs --skip narration --changed` sweep both ran clean: locked, docs, sources, build and links all pass. The `reels` check's own `test:editor` sub-step fails, as it does on a clean, unmodified `main` in this sandbox (a pre-existing environment issue, not a regression from this topic); the reel smoke test itself passes with 0 live reels affected.
