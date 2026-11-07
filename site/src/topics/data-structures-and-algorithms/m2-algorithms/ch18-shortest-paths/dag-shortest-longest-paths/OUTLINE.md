# Outline — DAG shortest and longest paths

## Learning outcomes

- Compute shortest distances on a DAG by relaxing every edge once, in topological order, in a single linear pass, and confirm the result against Bellman-Ford's own answer on the identical graph.
- Explain why relaxing in any order other than a topological one can give a wrong answer with no warning at all.
- Compute the longest path in the same DAG by negating every edge weight, and explain why this trick is only valid because the graph has no cycle.
- Build a small task-dependency DAG and read its critical path off directly as the longest path from start to end.

## Reel steps (storyboard)

1. **Opening.** A project schedule where some tasks wait on several others finishing first. Hook: the single number that decides how fast the whole project can finish is just the longest path through a graph already built earlier this chapter.
2. **PredictCycleRequired.** Does the single-pass, topological-order relaxation work correctly on a graph with even one cycle? Answer: no — without a topological order, a vertex could be relaxed before one of its own predecessors has its final distance.
3. **TopoRelaxation.** The mechanism itself: relax every outgoing edge of each vertex exactly once, strictly in topological order. Confirmed against Bellman-Ford's slower, more general answer on the identical graph.
4. **WhyOrderMatters.** The same graph, relaxed in a non-topological order, gives a wrong distance with no error, no crash, no warning — takeaway: the order is not an optimization, it is the correctness argument itself.
5. **PredictLongestPathGeneral.** Second predict: does negating every weight and re-running the identical pass correctly find the longest path on any graph, or only an acyclic one? Answer: only acyclic — on a general graph the longest path problem is NP-hard, and negating weights would create negative cycles that make shortest-path algorithms themselves fail.
6. **CriticalPath.** A task-dependency DAG, longest path computed via negation, read off directly as the project's own critical path and its minimum completion time.
7. **Recap.** Handoff to Chapter 19 (minimum spanning trees). Takeaway: the single cheapest algorithm in the whole chapter also carries the strongest precondition.

## Engagement arc

- Hook (step 1): a project schedule, one number, one graph already built.
- First predict (step 2, within first four steps): whether the single-pass trick needs an acyclic graph.
- Second predict (step 5): whether the longest-path trick generalizes beyond DAGs.
- Takeaways: steps 4, 6, 7 (three).
- Recap (step 7): the chapter's own punchline — cheapest algorithm, strongest precondition — handed off to Chapter 19.

## Narrator's line of thought, by step

1. Names the schedule question and the one number (critical path length) before any mechanism.
2. Poses the cycle-requirement predict directly, framing the whole topic's precondition as a single question.
3. Shows the single-pass mechanism itself, and the cross-check against Bellman-Ford that proves it correct on this graph.
4. Explains why the order is not merely convenient but load-bearing, by showing the same graph fail silently under a non-topological order.
5. Poses the generalization predict, then explains the NP-hardness fact (stated, not proven) and the negative-cycle reason the negation trick breaks outside a DAG.
6. Connects the longest-path mechanism directly to the critical-path method's own definition, on this topic's own worked task schedule.
7. Closes on the chapter's own framing (cheapest algorithm, strongest precondition) and hands off to Chapter 19's first topic, whose own bridge already quotes this handoff verbatim.

## Post-notes headings

- Internals: why negating weights to find a longest path only works on an acyclic graph (negative cycles on any other graph).
- Lab: `examples.py`'s checks (DAG relaxation vs. Bellman-Ford, the wrong-order counterexample, longest path via negation, the critical-path worked example).
- Production: build systems, task schedulers, and project-management tools that are, under the hood, running this exact single pass over a DAG.
- Frontier: none newly introduced this chapter (topic 63's own frontier section already covers A*, bidirectional search, and contraction hierarchies, the only skipped syllabus items in this chapter).
- Where this goes next: handoff to Chapter 19 (minimum spanning trees), reusing `dsa.cut-property-kruskal-s`'s own bridge wording verbatim.

## Examples to execute and what each asserts

- `topological_order` on this topic's own 6-vertex DAG matches the structural precondition it needs (every edge going forward in the computed order).
- `dag_shortest_paths` run in the correct topological order matches `brute_force_all_paths_shortest` (Bellman-Ford's own relaxation-round approach) exactly; the reconstructed shortest path is confirmed against the predecessor chain.
- `dag_shortest_paths_wrong_order` run in a non-topological order on the identical graph gives a strictly worse (larger) distance to at least one vertex than the correct topological-order pass — demonstrating the failure directly, not merely asserting the restriction.
- `dag_longest_paths` (negation plus the identical relaxation pass) finds a longest path strictly longer than the shortest one between the same two vertices, confirmed against a hand-traceable predecessor chain.
- A 7-task dependency DAG's critical path (`start -> design -> build-frame -> paint -> ship`) is read directly off `dag_longest_paths`'s own result, with its total duration confirmed by summing the individual task durations along that exact path.

## Bridge and handoff

- Bridge: topic 65's handoff, word for word.
- Handoff: to `dsa.cut-property-kruskal-s` (Chapter 19's first topic), word for word as stated in CHAPTER.md, and already quoted verbatim in that topic's own bridge on `main`.

## Concept ledger

- Introduces: `dag-relaxation`, `dag-longest-path`, `critical-path`.
- Uses: `topological-sort` (topic 61), `relaxation` (topic 63), `directed-acyclic-graph` (Chapter 10).
- Declared: none.

## Claims list

1. An algorithm using topological sorting solves the single-source shortest path problem in linear time on a directed acyclic graph with arbitrary weights — Wikipedia "Shortest path problem", quoted; `examples.py` (`dag_shortest_paths`), confirmed against `brute_force_all_paths_shortest`.
2. The topological ordering can be used to quickly compute shortest paths through a weighted DAG, in Θ(n + m) time — Wikipedia "Topological sorting", quoted (two separate sentences); restates claim 1 from an independent source.
3. The longest path problem is NP-hard on general graphs, but has a linear-time solution on directed acyclic graphs — Wikipedia "Longest path problem", quoted (two sentences); stated, not proven, per this topic's own scope.
4. A longest path in a weighted graph is the same thing as a shortest path in the graph with every weight negated, and this substitution is only safe on an acyclic graph because negating weights elsewhere would create a negative cycle — Wikipedia "Longest path problem", quoted (two sentences); `examples.py` (`dag_longest_paths`, via `negate`).
5. The longest path ending at each vertex of a DAG can be computed directly, without negation, by processing vertices in topological order and taking the maximum over each vertex's incoming neighbours — Wikipedia "Longest path problem", quoted (the two-step procedure).
6. In a project's milestone-and-activity DAG, the longest path from the first milestone to the last is the critical path, describing the total time to complete the project — Wikipedia "Longest path problem" and "Critical path method", quoted; `examples.py`'s 7-task worked example.
7. The critical path method was developed in the late 1950s by Morgan R. Walker of DuPont and James E. Kelley Jr. of Remington Rand — Wikipedia "Critical path method", quoted.

## Changes from the chapter plan

CHAPTER.md's suggested primary sources (CLRS 4th ed. for the DAG shortest-path algorithm and its O(n+m) proof; Kelley & Walker 1959's original operations-research paper for the critical-path framing) are a paywalled/non-freely-fetchable textbook and a paywalled 1959 conference paper, respectively, so Wikipedia's "Shortest path problem", "Topological sorting", "Longest path problem", and "Critical path method" articles were used instead — each quotes or restates the same claims directly and verifiably, consistent with topics 63-65's own handling of their own suggested-but-unfetchable sources. The critical path method's attribution sentence itself states only "the late 1950s," not the specific year 1959 (which appears only in the article's own citation to Kelley & Walker's paper); this topic follows the attribution sentence's own wording rather than asserting a year it cannot verify from the lead text.
