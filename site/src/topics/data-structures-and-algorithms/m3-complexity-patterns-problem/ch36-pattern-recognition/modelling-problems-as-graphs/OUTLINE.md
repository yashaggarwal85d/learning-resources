# Outline: Modelling problems as graphs (`dsa.modelling-problems-as-graphs`)

Full topic, chapter 36 §36.1, ~15 minutes.

## Storyboard (11 steps)

1. **Hook.** A word ladder: head, heal, teal, tell, tall, tail, each step swapping exactly one letter and landing on a real word. Lewis Carroll's own game, played by hand, with no mention yet that it is a graph.
2. **Predict.** The fifteen puzzle has about ten trillion arrangements. Can that many states be stored, and can a full search over them ever finish? (Predict step — within the first 4.)
3. **The implicit graph, counted two ways.** The eight puzzle's state count and max depth are found by a real breadth-first search (181,440 states, depth 31); the fifteen puzzle's state count is reached by arithmetic alone (16!/2), never enumerated, because it cannot be.
4. **The wildcard-bucket trick.** Finding word-ladder edges by bucketing on a blanked letter position, never by comparing one word against another — the practical answer to "the neighbour function must be cheap, since the graph is never stored."
5. **State too small.** A combination lock with forbidden codes: if the state is only the current combination, two different paths to it look identical even when one already crossed a forbidden code.
6. **The lock's graph, sized and solved.** Ten thousand states, eighty thousand edges, forbidden codes removed as vertices, a real shortest path of nine moves found by breadth-first search.
7. **Layered graphs introduced.** A count constraint ("at most k discounts") becomes part of the state itself: the vertex together with how many discounts have been spent, stacked into k+1 layers of the same map.
8. **Layered graph, sized and measured.** A direct route (cost 30, always available) against a discounted detour that only wins past three discounts (cost 25, then 20); at V=100,000, E=300,000, k=3, the layered graph has 400,000 vertices and 2,100,000 edges.
9. **Predict.** An Euler circuit (every edge once) is easy and linear-time. Does visiting every vertex exactly once stay just as easy? (Second predict step.)
10. **The near-miss.** Hamiltonian cycle (every vertex once) is NP-hard; Euler circuit (every edge once) is easy, linear-time, depth-first search — two problems that differ by one word in the statement.
11. **Recap and handoff.** State, move, question: writing those three down turns any situation into a graph question, whatever the surface story. Next: once it is a graph, which graph problem is it?

## Outcomes

- Given a puzzle or constrained-path problem, write down the state, the move and the question, and say which graph algorithm answers it.
- Explain why an implicit graph can be searched when it cannot be stored, and what the visited set costs.
- Build a layered graph for a count constraint, give its size in terms of V, E and k, and say when it stops being practical.

## Concept ledger

- **Introduces:** `state-space-graph`, `implicit-graph`, `neighbour-function`, `visited-set-cost`, `layered-graph-state-expansion`, `state-too-small-too-large`.
- **Uses:** `adjacency-list`, `edge-list` (Chapter 10, confirmed live); `constraint-budget`, `operation-count-budget` (topic 113, confirmed live). Breadth-first search, Dijkstra's algorithm and the P/NP/NP-hard vocabulary (Chapters 17, 18 and 33) are named in prose, since none of those chapters' topics are live in the registry at build time — the registry's own `uses` array lists only ids this topic's build could confirm.
- **Declared:** none new beyond its own; `breadth-first-search` and `np-hard` are used informally in prose without a `declared` entry, since neither chapter is live yet and this topic does not teach either algorithm from scratch (BFS is assumed from Chapter 1's own graph-traversal mentions and common knowledge; NP-hardness is used only for the single near-miss comparison, sourced directly rather than taught).

## Bridge / handoff

Bridge (word for word, topic 114's handoff): "A structure holds the data and answers questions about it. Some problems do not hand you data at all. They hand you a situation: a position, a set of legal moves, a goal. A word that can change into another by one letter, a puzzle board that can be turned into another by one slide, a lock whose wheels turn one notch at a time. There is no table to put in a structure, because the thing you are searching over is the set of situations, and it is usually too large to write down. Modelling problems as graphs, next."

Handoff: "Once a problem is a graph, the question is which graph problem. A shortest path was one answer. Others hide behind the same picture: a flow, a matching, a set of implications that must all hold, a longest chain in an acyclic graph. Each of those has an algorithm that is fast and correct, and a close cousin that looks identical and is NP-hard. Telling the real thing from the cousin, from the statement alone, is the skill that is left, and it needs a catalogue. Recognizing reductions to known problems, next."

## Changes from the chapter plan

- **The word-ladder dictionary in `examples.py` is the builder's own small, hand-written word list (sixty-odd common four-letter words), not Knuth's *Stanford GraphBase* list** named by the chapter plan as a possible source. This sidesteps any licensing question around redistributing Knuth's word list, and the hand-written list is large enough to produce a genuine six-word ladder from "head" to "tail" and a non-trivial wildcard-bucket demonstration, which is all the topic needs.
- **The fifteen-puzzle's state count (10,461,394,944,000) is computed arithmetically as 16! / 2, never enumerated** — the chapter plan's own framing already expects this ("too many to ever store"), and `examples.py` documents the formula directly rather than attempting any partial search.
- **The lock's forbidden-code example and the discount-graph example both use small, hand-built, deterministic instances** (a 4-wheel/10-digit lock; a 7-vertex road graph) rather than randomly generated ones, because early attempts at randomly generating a discount graph produced either disconnected graphs or ones where the discounted detour never paid off at any k, which told no story. Both hand-built instances are cross-checked against an independent brute-force search in `examples.py`.
- **Chapter 17's breadth-first search and Chapter 18's Dijkstra's algorithm, named by the chapter plan as prerequisites, are not live topics yet**, so this topic's own `examples.py` implements a plain BFS and a layered Dijkstra directly, and `prerequisites.mdx` names those future topics in prose rather than linking them as `<Resource>`s. Chapter 33's P/NP/NP-hard vocabulary is in the same position; the single near-miss comparison (Hamiltonian cycle vs. Euler circuit) is sourced directly from Erickson rather than assuming an earlier topic already taught the vocabulary.
