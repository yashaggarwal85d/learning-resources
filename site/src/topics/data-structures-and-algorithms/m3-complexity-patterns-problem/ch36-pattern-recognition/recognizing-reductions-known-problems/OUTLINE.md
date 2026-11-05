# Outline: Recognizing reductions to known problems (`dsa.recognizing-reductions-known-problems`)

Full topic, chapter 36 §36.1, ~16 minutes. Chapter 36's fourth and last topic, needing all three before it.

## Storyboard (12 steps)

1. **Hook.** Assign reviewers to papers under rules; reads like scheduling, is a flow problem.
2. **Predict.** Three pairing variants, only one NP-complete. (Predict step — within the first 4.)
3. **Flow and cut.** Capacities, source, sink; reviewer assignment solved and double-checked; near-miss: indivisible whole-unit routing.
4. **Matching.** Bipartite structural fact; two algorithms agree; near-miss: an odd cycle, one group.
5. **Two-SAT.** Implication graph + strongly connected components; near-miss: three choices per clause (three-SAT).
6. **Interval scheduling.** One resource, earliest-finish greedy; near-miss: several resources, setup time.
7. **DP on a DAG.** Topological relaxation finds the longest path; near-miss: a cycle, which is NP-hard (ties to topic 115's Hamiltonian near-miss).
8. **Pattern catalogue.** One page, six (of the syllabus's seven) patterns as a lookup from question to technique.
9. **Predict.** Setup time between jobs — still plain interval scheduling? (Second predict step.)
10. **Recognition procedure.** Five steps ending in a falsifier.
11. **The Lab.** Thirty unseen problems, five minutes each, scored on recognition, not the solve.
12. **Recap and handoff.**

## Outcomes

- For each of six shapes, state the structural fact the input must have and one near-miss that breaks it, and say which of the near-misses is NP-hard.
- Say in which direction a reduction runs when the goal is an algorithm and in which when the goal is a hardness proof, and why the two are the same idea.
- Given an unseen problem statement, write the recognised pattern, the target complexity, the key invariant and the one condition that would make the recognition wrong.

## Concept ledger

- **Introduces:** `reduction-to-known-problem`, `structural-precondition`, `near-miss-pattern`, `pattern-catalogue`, `recognition-procedure`, `recognition-falsifier`.
- **Uses (confirmed live at build time):** `monotonic-stack`, `next-greater-element`, `invariant-based-amortization` (Chapter 2); `binary-heap` (Chapter 6); `loser-tree`, `k-way-merge-bound` (Chapter 6); `earliest-finish-greedy`, `interval-depth`, `weighted-interval-scheduling`, `min-heap-of-end-times` (Chapter 28); `sweep-line` (Chapter 28); `approximation-ratio`, `lower-bound-on-opt` (Chapter 34 topic 109); `constraint-budget`, `signal-word-recognition` (topic 113); `operation-mix`, `structure-dispatch-table` (topic 114); `state-space-graph`, `implicit-graph`, `layered-graph-state-expansion` (topic 115).
- **Declared (no live introducing topic at build time):** `reduction-direction`, `np-hard-np-complete`, `flow-network`, `bipartite-matching`, `strongly-connected-components`, `fast-slow-pointers`, `dag-dp`. Chapters 17, 18, 20, 22, 24 and 33 are not live; every pointer to their topics is by syllabus title and number in prose, not a `<Resource>` link.

## Bridge / handoff

Bridge (word for word, topic 115's handoff): "Once a problem is a graph, the question is which graph problem. A shortest path was one answer. Others hide behind the same picture: a flow, a matching, a set of implications that must all hold, a longest chain in an acyclic graph. Each of those has an algorithm that is fast and correct, and a close cousin that looks identical and is NP-hard. Telling the real thing from the cousin, from the statement alone, is the skill that is left, and it needs a catalogue. Recognizing reductions to known problems, next."

Handoff: "That is the whole skill, and it is a habit more than a body of knowledge: read the size, read the operations, read the situation as a graph, match it to a shape and check what would break the match. Everything so far was the textbook object, in a textbook problem. The same objects do their work somewhere with more at stake: inside a database engine or a data pipeline, where a hash table is not a hash table but a build phase and a probe phase that must spill to disk when memory runs out, and where the choice of structure decides whether a query takes a second or a day. The next chapter takes each structure you have met and shows what it becomes there. Hash tables inside hash joins, next."

## Changes from the chapter plan

- **The chapter plan names six shapes and seven patterns in one scope line, and calls the right treatment "an index with falsifiers rather than thirteen mini-lessons."** This build takes that reading literally: each of the six shapes gets one storyboard step (structural fact, a minimal verified instance, the near-miss), and the pattern catalogue is one page covering six of the seven named patterns (binary search on the answer and matrix traversal, already built and verified in topics 113 and 115, are named on the catalogue page but not re-demonstrated with new code; the other four — fast and slow pointers, top-k via a heap, k-way merge, monotonic stack — get a fresh, small, independently verified instance each in `examples.py`, since no earlier topic in this chapter already demonstrated them).
- **The reviewer-to-paper instance is scaled down from the plan's placeholder (forty reviewers) to six reviewers and four papers**, small enough that a brute-force search over every valid assignment (4,096 subsets) can cross-check the max-flow answer directly, which is the whole point of showing two independent methods agree.
- **The general-matching near-miss (pairing within one group) is demonstrated only on a three-vertex odd cycle, not solved by the blossom algorithm itself.** The blossom algorithm is *(skipped)* in Chapter 20, so this topic does not build it; the odd cycle is used only to show the bipartite structural test correctly refusing the instance, and the small brute-force matching size (one, not two) confirms why a bipartite-style algorithm cannot be reused here.
- **Two-SAT's primary paper (Aspvall, Plass and Tarjan, 1979) is not read**, per the chapter plan's own caveat; the attribution and the satisfiability criterion are both sourced from the Wikipedia 2-satisfiability page, which states the paper's own citation directly.
- **Chapters 17, 18, 20, 22, 24, 27 and 33 are not live** at the time this topic was built (confirmed by checking `registry.ts`), so every algorithm this topic needs (max flow, bipartite matching via Kuhn's method, Tarjan's strongly connected components, topological relaxation on a DAG, fast and slow pointers) is implemented directly in `examples.py` rather than assumed from an earlier topic, and every pointer to a not-yet-built topic is named by syllabus title and number in prose only.
- **The Lab's thirty-problem practice protocol is described in post-notes as a protocol and a scoring sheet, with no actual problem set supplied** — the chapter plan is explicit that the builder chooses or writes its own thirty problems, and this build defers that content to a future narration/practice pass rather than inventing thirty placeholder problems for this reel.
