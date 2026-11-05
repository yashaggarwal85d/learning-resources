## Erickson — *Algorithms* (2019), Chapter 10 "Maximum Flows & Minimum Cuts"

URL: https://jeffe.cs.illinois.edu/teaching/algorithms/book/10-maxflow.pdf
Version: fetched 2026-11-05, the author's own posted PDF copy

> In English, the total flow into v is equal to the total flow out of v.

> Intuitively, the minimum cut is the cheapest way to disrupt all flow from s to t.

> The Maxflow-Mincut Theorem. In every flow network with source s and target t, the value of the maximum (s, t)-flow is equal to the capacity of the minimum (s, t)-cut.

> Intuitively, the residual capacity of an edge indicates how much more flow can be pushed through that edge.

> Ford and Fulkerson's proof of the Maxflow-Mincut Theorem immediately suggests an algorithm to compute maximum flows: Starting with the zero flow, repeatedly augment the flow along any path from s to t in the residual graph, until there is no such path.

> Integrality Theorem. If all capacities in a flow network are integers, then there is a maximum flow such that the flow through every edge is an integer.

> Choose the augmenting path with the smallest number of edges.

> The shortest augmenting path can be found in O(E) time by running breadth-first search in the residual graph. Surprisingly, the resulting algorithm halts after a polynomial number of iterations, independent of the actual edge capacities!

> However, if we allow irrational capacities, the algorithm can actually loop forever, always finding smaller and smaller augmenting paths.

> Maximum flows can be computed in O(V E) time.

### Contents (item by item, this topic's scope)

- The flow-conservation definition and the "total in equals total out" reading of it, used for this topic's own flow-network setup.
- The (s, t)-cut definition and the intuition that a cut is the cheapest way to disconnect s from t, used for this topic's own cut setup.
- The Maxflow-Mincut Theorem's own statement, word for word, used as this topic's central correctness claim.
- The residual-graph intuition (how much more flow an edge can still carry), used to introduce the residual graph before the augmenting-path algorithm.
- Ford and Fulkerson's own one-sentence description of their algorithm, quoted directly as this topic's statement of the algorithm itself.
- The Integrality Theorem, word for word, used for this topic's claim that integer capacities give an integer-valued maximum flow.
- Edmonds and Karp's own two rules for choosing an augmenting path: the "fattest path" rule (not quoted directly; this topic states its O(E^2 log E log|f*|) bound in its own words, since the sentence containing it did not survive extraction cleanly) and the "shortest path" rule, quoted directly, with the accompanying claim that it gives a running time independent of the edge capacities — this topic's source for Edmonds-Karp's pathological-network contrast between the fattest-path and shortest-path rules.
- The one-sentence statement that irrational capacities can make the raw Ford-Fulkerson algorithm loop forever without converging — this topic's source for Zwick's own non-terminating example, which is drawn and named only, per `CHAPTER.md`'s own instruction, and not simulated to a number.
- The closing "cite this on your homework" sentence giving O(V E) as the running time to cite for maximum flow in general — used for this topic's own closing statement of the state of the art, without walking through Orlin's own algorithm.

### Dropped-extraction note

This PDF drops every digit and several mathematical symbols during text extraction (confirmed on topics 67 and 68 for Erickson's book; confirmed again here) — vertex/edge counts, years, and the exact value of Zwick's irrational capacity (the golden-ratio expression) are all missing their digits in the raw extracted text. This topic never quotes a sentence that depends on a dropped digit or symbol; every number this topic states (the running-example's capacities, the Edmonds-Karp 2X-vs-2 contrast, Zwick's own golden-ratio value) is stated in this topic's own prose, sourced from the chapter's own structure and from independent reference values (the golden ratio itself), not quoted from the PDF.

## SciPy Documentation — `scipy.sparse.csgraph.maximum_flow`

URL: https://docs.scipy.org/doc/scipy/reference/generated/scipy.sparse.csgraph.maximum_flow.html
Version: fetched 2026-11-05, SciPy v1.18.0 Manual (current)

> By the max-flow min-cut theorem, the maximal value of the flow is also the total weight of the edges in a minimum cut.

> The maximum flow problem is usually defined with real valued capacities, but we require that all capacities are integral to ensure convergence.

### Contents (item by item, this topic's scope)

- SciPy's own restatement of the max-flow min-cut theorem, used as independent confirmation of Erickson's own statement.
- SciPy's own worked example network (a six-vertex graph with capacities 16, 13, 10, 12, 4, 14, 9, 20, 7, 4, credited there to CLRS 2nd ed., Chapter 26.1, with a documented maximum flow value of 23), reused directly in this topic's own `examples.py` as a cross-check network independent of the chapter's own running example.
- SciPy's own note that it requires integral capacities "to ensure convergence," used as independent confirmation of the chapter's own irrational/real-capacity non-termination claim.

## NetworkX Documentation — `maximum_flow`

URL: https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.flow.maximum_flow.html
Version: fetched 2026-11-05, NetworkX 3.7 documentation (current)

> Note that the resulting maximum flow may contain flow cycles, back-flow to the source, or some flow exiting the sink.

### Contents (item by item, this topic's scope)

- NetworkX's own note that a maximum flow need not be acyclic by construction, used in this topic's post-notes to flag that this topic's own examples build acyclic flows by convention, not because every maximum flow must be acyclic.

### Red team

1. **L. R. Ford Jr. and D. R. Fulkerson's own 1956 paper ("Maximal flow through a network," *Canadian Journal of Mathematics* 8, pp. 399–404) is cited bibliographically only** — confirmed against the Crossref API at planning time (title, container-title, volume, page range and year all match), not independently opened or quoted. This topic's statement of the theorem and the augmenting-path algorithm comes from Erickson's own restatement, quoted above.
2. **P. Elias, A. Feinstein, and C. E. Shannon's own 1956 paper ("Note on maximum flow through a network," *IRE Transactions on Information Theory* 2(4), pp. 117–119) is cited bibliographically only**, as the theorem's independent co-discoverers per Erickson's own account, confirmed against Crossref, not opened.
3. **J. Edmonds and R. M. Karp's own 1972 paper ("Theoretical improvements in algorithmic efficiency for network flow problems," *Journal of the ACM* 19(2), pp. 248–264) is cited bibliographically only**, confirmed against Crossref (and independently listed in the SciPy reference list quoted above), not opened; this topic's statement of the fattest-path and shortest-path rules and their running times comes from Erickson's own text.
4. **U. Zwick's own 1995 paper ("The smallest networks on which the Ford–Fulkerson maximum flow procedure may fail to terminate," *Theoretical Computer Science* 148(1), pp. 165–170) is cited bibliographically only**, per `CHAPTER.md`'s own instruction — its own exact network is named and drawn only (via Erickson's own retelling, quoted above), never simulated to a number in `examples.py`. `CHAPTER.md` itself marks this paper's exact network as "to verify" against the original before drawing it; this topic draws only the shape Erickson's own text gives (a six-node network whose three horizontal residual capacities shrink forever) and does not claim to reproduce Zwick's own figure exactly.
5. **A. Schrijver's own 2002 paper ("On the history of the transportation and maximum flow problems," *Mathematical Programming* 91(3), pp. 437–445) is cited bibliographically only**, as Erickson's own named source for the declassified Harris-Ross story used in this topic's hook, not independently opened; this topic's hook retells only the two facts Erickson's own text states (a declassified Cold War-era rail-network study, and that the report named the minimum cut "the bottleneck"), not any further detail from Schrijver's own paper.
6. **CLRS's own maximum-flow chapter is not opened this session** (paywalled) — this topic's only use of CLRS is the network and flow value SciPy's own documentation already attributes to it and reproduces directly, quoted above; no claim here rests on CLRS's own wording or section numbers.
7. **Dinitz's own blocking-flow algorithm and the further-progress table of faster algorithms (Figure 10.10 in Erickson's book, Orlin's O(V E) algorithm among them) are named only, per `CHAPTER.md`'s own scope** — this topic states the final O(V E) headline bound Erickson's own text gives as "the sentence to cite," and does not derive or simulate any of the faster algorithms themselves.
8. **Y. Boykov and V. Kolmogorov's own 2004 paper ("An experimental comparison of min-cut/max-flow algorithms for energy minimization in vision," *IEEE TPAMI* 26(9), pp. 1124–1137) is cited bibliographically only**, named once in post-notes for the computer-vision use of max-flow/min-cut, not opened or quoted.
