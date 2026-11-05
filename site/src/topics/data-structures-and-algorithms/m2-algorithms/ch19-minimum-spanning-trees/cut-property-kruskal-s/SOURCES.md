## Wikipedia — "Minimum spanning tree" (English Wikipedia)

URL: https://en.wikipedia.org/wiki/Minimum_spanning_tree
Version: fetched 2026-11-05, the current page

> For any cycle C in the graph, if the weight of an edge e of C is larger than any of the individual weights of all other edges of C, then this edge cannot belong to an MST.

> For any cut C of the graph, if the weight of an edge e in the cut-set of C is strictly smaller than the weights of all other edges of the cut-set of C, then this edge belongs to all MSTs of the graph.

> By a similar argument, if more than one edge is of minimum weight across a cut, then each such edge is contained in some minimum spanning tree.

> A MST is necessarily a MBST (provable by the cut property), but a MBST is not necessarily a MST.

### Contents (item by item, this topic's scope)

- The cut property's and cycle property's own stated conditions, used as this topic's primary, independently fetchable source for the two properties by their own names (the exact phrasing CLRS itself uses is not opened this session — see Red team), with both proofs sketched (exchange via an added/removed edge around the cut or cycle) reproduced in this topic's own prose, not copied from the page's proof text.
- The bottleneck-spanning-tree ("MBST") remark, named only, matching `CHAPTER.md`'s own "named only" framing for the bottleneck property.

## Erickson — *Algorithms* (2019), Chapter 7 "Minimum Spanning Trees"

URL: https://jeffe.cs.illinois.edu/teaching/algorithms/book/07-mst.pdf
Version: fetched 2026-11-05, the author's own posted PDF copy

> The minimum spanning tree of G contains every safe edge.

> An edge is safe if it is the minimum-weight edge with exactly one endpoint in some component of F.

> The minimum spanning tree contains no useless edge.

### Contents (item by item, this topic's scope)

- Erickson's own "safe edge" lemma, attributed by him to Prim (not named "the cut property" in his own text — see Red team), used as independent corroboration of the same fact the cut property states (a lightest edge crossing a respecting cut is in the MST), stated in a different, equivalent vocabulary ("safe"/"useless" edges over an evolving forest rather than "cuts").
- The generic algorithm framing (repeatedly add a safe edge to a growing forest F, until F is one spanning tree) this topic's own generic-algorithm step reproduces in its own words.

## SciPy Documentation — `scipy.sparse.csgraph.minimum_spanning_tree`

URL: https://docs.scipy.org/doc/scipy/reference/generated/scipy.sparse.csgraph.minimum_spanning_tree.html
Version: fetched 2026-11-05, SciPy v1.18.0 Manual (current)

> This is computed using the Kruskal algorithm.

### Contents (item by item, this topic's scope)

- SciPy's own stated choice of algorithm (Kruskal's), named as a real system's own documented choice, not a claim about SciPy's present-day performance or any implementation detail beyond what this one sentence states.

## NetworkX Documentation — `minimum_spanning_tree`

URL: https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.tree.mst.minimum_spanning_tree.html
Version: fetched 2026-11-05, NetworkX 3.7 documentation (current)

> The algorithm to use when finding a minimum spanning tree. Valid choices are 'kruskal', 'prim', or 'boruvka'. The default is 'kruskal'.

### Contents (item by item, this topic's scope)

- NetworkX's own documented set of algorithm choices and its own default, named as a second real system offering a choice among all three algorithms this chapter and its skipped syllabus topic name, not a claim about which one a caller should prefer.

### Reused from Chapter 11 topic 38's own `examples.py` (`dsa.union-find`)

Topic 38's own `examples.py` already runs the identical Chapter 10 ten-edge graph through union-find in Kruskal's sorted-by-weight order, asserting the accepted edges are exactly `CD, AC, DE, BC, EF` (five edges, the same split this topic's own `examples.py` recomputes independently from scratch with its own Kruskal implementation, not copied). Not a quote; a pointer to a figure this topic's own simulation reproduces and is expected to match exactly, per `CHAPTER.md`'s "Seams to check at release" instruction.

### Red team

1. **CLRS 4th ed.'s own minimum-spanning-trees chapter is not opened this session** (not independently accessible; paywalled), per `CHAPTER.md`'s own "section numbers to verify against the book itself" framing. This topic cites Wikipedia's own, independently fetchable statements of the cut property and cycle property by name instead, and does not claim CLRS's own section numbers or exact wording.
2. **Erickson's own chapter never uses the phrase "cut property"** — he states the identical fact (a lightest edge crossing a respecting partition is in the MST) as a "safe edge" lemma attributed to Prim, over an evolving forest rather than a named cut. This topic treats Erickson as independent corroboration of the fact, not as a second source for the name "cut property," which is attributed to Wikipedia's own usage and the common terminology CLRS is known (from outside this session) to use.
3. **The bottleneck-spanning-tree ("MBST") property is named only**, per `CHAPTER.md`'s own "named only" framing; no claim in this topic proves or restates it beyond Wikipedia's own one-sentence mention.
4. **Jarník's 1930 priority**, the Fredman–Tarjan 1987 Fibonacci-heap bound, and the Karger–Klein–Tarjan/Chazelle/Pettie–Ramachandran frontier results belong to topic 68's own `SOURCES.md`, not this one; this topic does not cite any of them.
5. **Kruskal's 1956 paper and Graham & Hell's 1985 history paper are cited only bibliographically** (title, venue, volume, pages, year — each confirmed against Crossref: Kruskal, *Proc. AMS* 7(1), pp. 48–50, 1956; Graham & Hell, *IEEE Annals of the History of Computing* 7(1), pp. 43–57, 1985), not opened or quoted verbatim, per `CHAPTER.md`'s own "checked at planning time against Crossref" framing.
6. **Erickson's own PDF loses most mathematical symbols during text extraction** (set-difference, subset and inequality symbols render as stray glyphs like "�.�" or vanish entirely, e.g. "T \ T 0" for "T \ T′"). Worked around by quoting only the handful of short, symbol-free prose sentences that survive extraction cleanly (the three sentences quoted above), and describing the proof's own mechanism in this topic's own prose rather than inside a quote.
