---
id: dsa.modelling-problems-as-graphs
title: Modelling problems as graphs
---

<section data-section="outcomes">

## After this topic you can

- Given a puzzle or constrained-path problem, write down the state, the move and the question, and say which graph algorithm answers it.
- Explain why an implicit graph can be searched when it cannot be stored, and what the visited set costs.
- Build a layered graph for a count constraint, give its size in terms of V, E and k, and say when it stops being practical.

</section>

<section data-section="internals">

## Into the internals

### Why the fifteen puzzle's state count never needs a search to find

The fifteen puzzle has sixteen tiles, one of them blank, arranged in a four-by-four grid. There are sixteen factorial ways to arrange sixteen distinct objects in sixteen positions, but a sliding move can only ever reach half of those arrangements from a fixed start, because every move is a single swap with the blank, and a single swap changes the permutation's parity — so the reachable states split exactly in two by parity, and only one half is reachable from any given start. Dividing sixteen factorial by two gives the count directly, with no search of any kind. The eight puzzle, by contrast, is small enough (9! / 2 = 181,440 states) that a real breadth-first search can actually enumerate it, which is why this topic can show both: one counted by arithmetic, one counted by exhaustive search, and they agree with the formula where both apply.

### Why a count constraint multiplies the graph instead of complicating the move

Folding "at most k discounts" into the move itself (checking a counter and refusing to move if it is already at k) would make the move's legality depend on history the edge alone cannot see, which breaks the basic graph picture: an edge's cost and validity are supposed to depend only on its two endpoints. Folding the count into the vertex instead keeps every edge simple and local, at the cost of making k+1 complete copies of the state space, one per possible count so far, with edges that stay within a layer (using a non-discounted move) or cross into the next layer up (spending one discount). The size cost is explicit and linear in k, which is exactly why the topic states it as a formula rather than leaving it implicit.

</section>

<section data-section="lab">

## In the lab

Take the layered-graph example in `examples.py` and change k from three to zero: does the shortest path reduce to exactly the direct route's cost, with the discounted detour unreachable at any price? Then build your own small implicit graph (a different sliding puzzle, or a lock with a different number of wheels and digits) and time how long a real breadth-first search takes to enumerate it fully, against how fast the state count can be computed by a closed-form argument the way the fifteen puzzle's 16!/2 was — at what state-space size does enumeration stop being fast enough to bother with at all?

</section>

<section data-section="production">

## In production

Puzzle-solving code rarely looks like puzzle-solving code once it ships: a build system computing the shortest sequence of steps to produce a target artifact, a package manager resolving a dependency set under a version-count budget, a routing engine finding the cheapest path through a toll network with a limited number of toll-free passes, are all the identical picture — states, moves, a question — wearing a different name. The reason to always write the state, the move and the question down explicitly, rather than reach for code immediately, is that the state is where correctness bugs actually live: a state that is too small silently merges situations that needed to stay separate, and the bug it produces (a wrong shortest path, a cache hit that should have been a miss) can be far downstream of the line that's actually wrong.

</section>

<section data-section="frontier">

## The frontier

Some implicit graphs are so large that even generating one state's full neighbour list is itself expensive, which pushes toward heuristic search (A* and its relatives, guided by an estimate of remaining distance to the goal) rather than plain breadth-first search — the fifteen puzzle itself is the textbook example where A* with a good heuristic (Manhattan distance, or pattern databases) solves instances that plain BFS never could, because it never needs to look at most of the ten trillion states at all. A* and admissible heuristics are *(skipped)* in this syllabus and are named here only as the honest answer to "how is the fifteen puzzle actually solved in practice," with no claim beyond the pointer.

</section>

<section data-section="questions">

## More questions

- The lock example removes forbidden codes as vertices entirely, which works because a forbidden code is forbidden in every context. What changes if a code is only forbidden after visiting some other code first — does that constraint also fold into the state, the way the discount count does?
- The near-miss (Hamiltonian cycle versus Euler circuit) is one example of "two problems that differ by one word." What is the general warning sign in a problem statement that should make a modeller stop and check whether the natural-sounding graph question is the easy one or its NP-hard cousin, before committing to an algorithm?

</section>

<section data-section="next">

## Where this goes next

Once a problem is a graph, the question is which graph problem. A shortest path was one answer. Others hide behind the same picture: a flow, a matching, a set of implications that must all hold, a longest chain in an acyclic graph. Each of those has an algorithm that is fast and correct, and a close cousin that looks identical and is NP-hard. Telling the real thing from the cousin, from the statement alone, is the skill that is left, and it needs a catalogue. Recognizing reductions to known problems, next.

</section>
