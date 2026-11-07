# REVIEW: Strongly connected components

## Pass 1 — content, self-review

Read cold against the previous topic's reel (`dsa.topological-sort`), its own handoff line, and this chapter's own `CHAPTER.md`, then every file of this topic in order.

- **Flow:** the bridge is topic 61's handoff word for word; no concept is used before it is taught (Tarjan's low-link mechanism in step 3 before Kosaraju's contrasting two-pass version in step 4; the condensation-DAG predict in step 2 before its own proof in step 5, which reuses topic 60's cycle test directly rather than inventing a new one; the 2-SAT reduction in step 6 only after both SCC algorithms and the condensation idea are already on screen).
- **Pre-notes:** four terms, all recap vocabulary the reel assumes (strongly connected, satisfiability, implication, maximal set) and none it teaches; under the word limit.
- **Gap hunt against the syllabus line:** all three clauses covered (`coverage.json`) — Tarjan's vs Kosaraju's (steps 3–4), the condensation DAG (steps 2 and 5), 2-SAT via SCCs (step 6). Against the expert list: no `out` items.
- **Expert reader:** the condensation-is-a-DAG proof is a maximality argument stated in `post-notes.md`'s internals section, not merely demonstrated by example; the two SCC algorithms are confirmed to find the identical partition (not merely each independently plausible), since the SCC partition is mathematically unique regardless of which algorithm finds it.
- **Engagement:** step 1 hooks on telling full reachability apart from clustered reachability at scale; two predicts (steps 2 and 6, the first within the first four steps); three takeaways (steps 4, 5, 7); the recap (step 7) closes the chapter's own running claim (every structural fact cost one traversal) and hands off to Chapter 18.
- **Narration teaches:** each step explains the reasoning (why a cycle among contracted components would contradict their own maximality, why Tarjan's low-link rule pops a component the instant it catches up to a vertex's own index, why Kosaraju's second pass needs the transpose specifically, why a shared SCC between a literal and its negation is logically impossible to satisfy) rather than restating the caption.

All claims in `FACT-CHECK.md`'s table are confirmed, either by word-for-word source quote (`SOURCES.md`, `sources.mjs check`: 10/10 quotes pass across three sources, with two footnote-merge splits caught and fixed before the first check attempt, following the same pattern as topics 59–60's own recurring footnote-merge bug) or by direct computation in `examples.py` (`python3 examples.py`: all assertions pass, including an explicit `tarjan_components == kosaraju_components` equality check and a constructed satisfiable/unsatisfiable 2-SAT pair).

## Pass 2 — looks and mechanics, self-review

- `reel.tsx`: seven steps; two literal digits ("60" in a file-header comment referencing the previous topic by number, "16" in a step title referencing a chapter by number) caught by the build's digit check and fixed before this final run by rewording both to avoid digits entirely, rather than trying to pin them to `examples.py`. "2-SAT" was also rewritten to "two-SAT" throughout `reel.tsx` and `scenes.tsx`, matching the house spelling already used in `dsa.recognizing-reductions-known-problems`.
- `narration.json`: seven steps matching the reel exactly; `answer` present on both predict steps (2 and 6) and nowhere else; no digit spoken, "two-SAT" avoided entirely in favour of describing the formula shape in words.
- `coverage.json`: all three syllabus clauses copied word for word from `syllabus/data-structures-and-algorithms.md`'s own topic line; three sources mapped with items; a ten-item independent expert list, one pointing at the post-notes "The frontier" heading.
- `prerequisites.mdx`: all three linked titles ("Depth-first search and edge classification", "Topological sort", "Stacks, queues and deques") verified against `registry.ts` by exact grep before use.
- `scenes.tsx`: seven visual functions sharing one `POS`/`EDGES` graph layout matching `examples.py`'s own `SCC_ADJ` (a 3-cycle, a 2-cycle, a singleton, chained together), so the low-link mechanism, the condensation and the recap all visibly operate on the identical graph.

Build (`npm run build`, 556 pages including this topic's own) and the full `node scripts/check-all.mjs --skip narration --changed` sweep both ran clean: locked, docs, sources, build and links all pass. The sweep's first attempt failed on the two literal-digit violations above, both fixed before this clean run. The `reels` check's own `test:editor` sub-step fails, as it does on a clean, unmodified `main` in this sandbox (a pre-existing environment issue, not a regression from this topic); the reel smoke test itself passes.

This closes Chapter 17 (Graph Traversal and Connectivity): all four topics (breadth-first search, depth-first search and edge classification, topological sort, strongly connected components) are now written, built and shipped.
