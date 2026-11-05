# OUTLINE: Max-flow min-cut and Ford–Fulkerson

Thirteen steps, following `CHAPTER.md`'s own plan for topic 69.

1. **Hook.** A network of six depots with pipe capacities, nine units of room across the
   narrowest section, and a greedy dispatcher that keeps sending units down any route with
   spare room. It stops at seven and reports "no more routes." There is a way to ship two
   more, but only by pulling back some of what was already sent. How does an algorithm take
   back what it did, and how does it know when it is truly finished rather than merely stuck?
2. **The flow network.** A directed graph with a source and a sink, a capacity on every edge,
   and a conservation rule at every other vertex: what comes in must go out. The chapter's own
   graph, now read as pipes.
3. **Predict: can the greedy dispatcher's own count of seven ever be beaten without undoing
   anything it already sent?** Before naming the residual graph, ask directly.
4. **The stuck run.** The greedy dispatcher's own four routes, in order, reach seven and then
   find no route with spare capacity left. Shown filling the pipes.
5. **The residual graph.** Every edge keeps a second, undo-shaped number: how much flow could
   be pushed back the way it came. The stuck network's own residual graph, drawn underneath.
6. **The rescue.** A path through the residual graph that the greedy dispatcher's own forward-only
   view could never see, because it crosses one edge backwards: pulling back exactly what was
   sent through it. Pushing it reaches nine.
7. **Ford–Fulkerson, stated as a loop.** Find any augmenting path in the residual graph, push its
   bottleneck, repeat until none exists. The five-augmentation order that reaches nine directly,
   with its own last step the same backward crossing.
8. **The cut that proves it.** When no augmenting path remains, the vertices reachable from the
   source form one side of a cut; every edge crossing it is full, every edge crossing back
   carries nothing; the flow's value equals the cut's capacity. Shown locking onto nine.
9. **The max-flow min-cut theorem.** The value of a maximum flow equals the capacity of a
   minimum cut, always, proved by exactly the argument the algorithm just carried out. Checked
   against the chapter's own network and against a second, independently sourced network with
   a different answer.
10. **Integrality.** Every augmentation's bottleneck is a whole number when every capacity is;
    the algorithm ends with a flow that is whole-number everywhere. The consequence used next:
    a network with every capacity one gives a flow that is zero or one on every edge.
11. **Predict: is a maximum flow always acyclic?** Before naming the running-time bound, ask
    whether a maximum flow could ever send flow around in a circle for no gain.
12. **Why the loop can be slow, and why that is fixable.** The running time for integer
    capacities is proportional to the edge count times the flow's own final value, which can be
    exponential in the size of the input; the Edmonds–Karp network that forces this; rational
    capacities still finish; irrational capacities can loop forever, named only. The fix (choose
    the augmenting path by breadth-first search instead of arbitrarily) is named, not built.
13. **Handoff.** Ford–Fulkerson ends with a flow and a cut that prove each other optimal, and
    integrality guarantees that with whole-number capacities the flow is made of whole units.
    That is exactly what a pairing problem needs. Bipartite matching and Hopcroft–Karp, next.

## Changes from the chapter plan

- `CHAPTER.md`'s own hook and the Edmonds–Karp-network step name a count of two million
  augmentations (X = one million, a twenty-bit network) and a breadth-first finish of two;
  `examples.py` runs the identical qualitative demonstration at a far smaller X (two thousand)
  so the script finishes in seconds, per the established "the hook's own scale is never the
  measurement's own scale" pattern from earlier topics. `reel.tsx` itself states both the
  hook's own large count and the measured run's own smaller count, each correctly scoped to
  which one it is.
- Step 11's predict (whether a maximum flow must be acyclic) is answered using the flow
  decomposition fact named in Erickson's own text (any flow cycle can be cancelled without
  changing the flow's value) stated in one line, not built or simulated; `examples.py` builds
  only acyclic flows by the order its own paths are chosen, which this topic's post-notes flags
  as a property of the example, not a theorem about every maximum flow.
- Zwick's own non-terminating network (irrational capacities) is drawn and named only, per
  `CHAPTER.md`'s own instruction, never simulated to a number; the Edmonds and Karp "fattest
  path" running-time bound is stated in this topic's own words rather than quoted directly,
  because the sentence containing it did not survive this source's own PDF extraction cleanly
  (see `SOURCES.md`'s own dropped-extraction note).
- The reverse-residual-edge implementation detail (storing each edge with its reverse partner
  so an update is two array writes) is named on screen per `CHAPTER.md`'s own instruction, shown
  on the Chapter 10 two-array layout already built there, not re-derived here.
