# REVIEW: Depth-first search and edge classification

## Pass 1 — content, self-review

Read cold against the previous topic's reel (`dsa.breadth-first-search`), its own handoff line, and this chapter's own `CHAPTER.md`, then every file of this topic in order.

- **Flow:** the bridge is topic 59's handoff word for word; no concept is used before it is taught (discovery/finish times and the parenthesis property in step 3 before any edge classification; the four edge types in step 4 built only from step 3's two timestamps; the undirected predict in step 5 after both directed cases are already on screen; both cycle tests in step 6 stated as consequences of edge classification, not a new mechanism; the iterative-stack conversion in step 7 as a memory fix, not a logic change).
- **Pre-notes:** four terms, all recap vocabulary the reel assumes (recursion/call stack, cycle, ancestor/descendant, stack) and none it teaches; under the word limit.
- **Gap hunt against the syllabus line:** all four clauses covered (`coverage.json`) — discovery/finish times (step 3), tree/back/forward/cross edges (steps 2 and 4), three-colour and parent-check cycle detection (step 6), iterative DFS with an explicit stack (step 7). Against the expert list: no `out` items.
- **Expert reader:** the parenthesis property is demonstrated directly on a graph large enough to exercise all ordered pairs, not asserted from the theorem alone; the forward-edge case needed a second constructed graph (`FORWARD_ADJ`), since the first graph has none — caught and fixed before any build attempt.
- **Engagement:** step 1 hooks on DFS as the structural opposite of BFS; two predicts (steps 2 and 5, the first within the first four steps — the second predict was inserted mid-build after re-reading `topic-checks.ts` directly and finding the original one-predict plan violated the full-topic minimum); five takeaways (steps 3, 4, 6, 7, 8); the recap (step 8) names the free byproduct (reversed finish order) that topic 61 builds on.
- **Narration teaches:** each step explains the reasoning (why an edge to an ancestor is logically a cycle, why the parenthesis property is a fact about ranges rather than a stated rule, why forward/cross edges are structurally impossible undirected, why the two cycle tests differ, why the crash is a resource limit and not a logic bug) rather than restating the caption.

All claims in `FACT-CHECK.md`'s table are confirmed, either by word-for-word source quote (`SOURCES.md`, `sources.mjs check`: all quotes pass across two sources, including the University of Crete CS-583 course notes as a `.gr`-domain substitute for CLRS's own treatment) or by direct computation in `examples.py` (`python3 examples.py`: all assertions pass, including a real `RecursionError` reproduced on a 50,000-vertex chain).

## Pass 2 — looks and mechanics, self-review

- `reel.tsx`: eight steps; every literal number (the five-vertex graph's edge count, the 50,000-vertex chain length, the lowered recursion limit) traced to `examples.py`. Three takeaways initially over the 20-word limit (steps 4, 6 and 7), all shortened before the build passed — the step 7 takeaway took three attempts to land under the limit while still naming the resource-limit-not-logic-bug point.
- `narration.json`: eight steps matching the reel exactly; `answer` present on both predict steps (2 and 5) and nowhere else; no digit spoken, numbers described by magnitude.
- `coverage.json`: all four syllabus clauses copied word for word from `syllabus/data-structures-and-algorithms.md`'s own topic line; two sources mapped with items; a ten-item independent expert list.
- `prerequisites.mdx`: the linked title ("Breadth-first search") verified against `registry.ts` by exact grep before use.
- `scenes.tsx`: eight visual functions, including the inserted `PredictUndirectedEdges` scene added alongside the reel-step fix, reusing the same directed/undirected graph layouts across steps rather than redrawing per step.

Build (`npm run build`, 525 pages including this topic's own) and the full `node scripts/check-all.mjs --skip narration --changed` sweep both ran clean: locked, docs, sources, build and links all pass (the sweep's `reels` failure during this same run was entirely `dsa.topological-sort`'s own in-progress coverage.json, a sibling topic's uncommitted work, not this topic's). The `reels` check's own `test:editor` sub-step fails, as it does on a clean, unmodified `main` in this sandbox (a pre-existing environment issue, not a regression from this topic).
