# REVIEW: Topological sort

## Pass 1 — content, self-review

Read cold against the previous topic's reel (`dsa.depth-first-search-edge`), its own handoff line, and this chapter's own `CHAPTER.md`, then every file of this topic in order.

- **Flow:** the bridge is topic 60's handoff word for word; no concept is used before it is taught (Kahn's algorithm in step 3 named explicitly as BFS's own queue mechanics, pointed at in-degrees; reverse-DFS-finish-order in step 4 reusing topic 60's DFS directly; cycle detection in step 5 stated as each algorithm's own natural failure, after both algorithms are already on screen; the heap variant in step 6 only after the plain queue is established).
- **Pre-notes:** four terms, all recap vocabulary the reel assumes (in-degree, DAG, dependency order, queue) and none it teaches; under the word limit.
- **Gap hunt against the syllabus line:** all four clauses covered (`coverage.json`) — Kahn's vs reverse DFS (steps 3–4), cycle detection as a by-product (step 5), the lexicographic heap variant (step 6), critical-path scheduling pointer to Data Engineering Ch.11 (post-notes "In production"). Against the expert list: no `out` items.
- **Expert reader:** the two algorithms are demonstrated as independently valid without requiring identical output, matching the chapter's own stated non-uniqueness fact; the heap-vs-queue divergence is demonstrated on a graph specifically constructed to show it, not assumed from a graph where it happens not to matter.
- **Engagement:** step 1 hooks on a ten-thousand-target build system; two predicts (steps 2 and 6, the first within the first four steps); three takeaways (steps 4, 5, 7); the recap (step 7) names the chapter's closing idea (acyclicity as the only obstruction) and hands off to strongly connected components.
- **Narration teaches:** each step explains the reasoning (why a cycle rules out every order, why Kahn's queue is BFS's own mechanics repointed, why neither algorithm needs a bolted-on cycle check, why a heap's label order can diverge from a queue's arrival order) rather than restating the caption.

All claims in `FACT-CHECK.md`'s table are confirmed, either by word-for-word source quote (`SOURCES.md`, `sources.mjs check`: 5/5 quotes pass across two sources, one reused from topic 60's own fetch) or by direct computation in `examples.py` (`python3 examples.py`: all assertions pass, including a redesigned test graph after the first attempt failed to actually show the plain-queue-vs-heap divergence).

## Pass 2 — looks and mechanics, self-review

- `reel.tsx`: seven steps; no literal digits anywhere (numbers described by magnitude). Both predict steps have explicit `options`/`explain`. The ReverseDFS step's title initially used an escaped `\'` inside a single-quoted string — fixed to double-quoted before the first build attempt, proactively, having learned this from topics 59–60's own recurring pattern.
- `narration.json`: seven steps matching the reel exactly; `answer` present on both predict steps (2 and 6) and nowhere else; no digit spoken.
- `coverage.json`: all four syllabus clauses copied word for word from `syllabus/data-structures-and-algorithms.md`'s own topic line, including the full cross-domain arrow text (`→ Data Engineering Ch.11`) needed for the clause-coverage check to pass; two sources mapped with items; a ten-item independent expert list.
- `prerequisites.mdx`: all three linked titles ("Breadth-first search", "Depth-first search and edge classification", "Binary heaps and heapify") verified against `registry.ts` by exact grep before use.
- `scenes.tsx`: seven visual functions sharing one `POS`/`EDGES` graph layout matching `examples.py`'s own `DAG_ADJ`, so the in-degree queue, the DFS finish order and the heap variant all visibly operate on the identical graph.

Build (`npm run build`, 555 pages including this topic's own) and the full `node scripts/check-all.mjs --skip narration --changed` sweep both ran clean: locked, docs, sources, build and links all pass. The sweep initially failed twice before this clean run — first on a missing cross-domain-arrow clause text (fixed in `coverage.json`) and a 9-item expert list (added a 10th item), then on `pre-notes.md` having only 3 term bullets (added a 4th) — all three caught and fixed before this final run. The `reels` check's own `test:editor` sub-step fails, as it does on a clean, unmodified `main` in this sandbox (a pre-existing environment issue, not a regression from this topic); the reel smoke test itself passes.
