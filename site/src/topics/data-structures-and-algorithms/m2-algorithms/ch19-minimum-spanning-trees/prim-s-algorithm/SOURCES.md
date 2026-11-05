## NetworkX Documentation — `minimum_spanning_tree`

URL: https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.tree.mst.minimum_spanning_tree.html
Version: fetched 2026-11-05, NetworkX 3.7 documentation (current)

> The algorithm to use when finding a minimum spanning tree. Valid choices are 'kruskal', 'prim', or 'boruvka'. The default is 'kruskal'.

### Contents (item by item, this topic's scope)

- NetworkX's own documented inclusion of `'prim'` as a shipped, selectable algorithm choice, named as a real system that offers Prim's algorithm as an option, not a claim about which option a caller should prefer.

## Erickson — *Algorithms* (2019), Chapter 7 "Minimum Spanning Trees", §7.4 "Jarník's ('Prim's') Algorithm"

URL: https://jeffe.cs.illinois.edu/teaching/algorithms/book/07-mst.pdf
Version: fetched 2026-11-05, the author's own posted PDF copy

> In Jarník's algorithm, the intermediate forest F has only one nontrivial component T ; all the other components are isolated vertices.

### Contents (item by item, this topic's scope)

- Erickson's own account, in his book's §7.4 ("Jarník's ('Prim's') Algorithm"), that the algorithm was first described by the Czech mathematician Vojtěch Jarník in a letter to Borůvka, published by Jarník the following year, and independently rediscovered afterward by Kruskal, (arguably) Prim, Loberman and Weinberger, and finally Dijkstra, each of whom eventually knew of and cited Kruskal's own paper. This topic states that history in its own prose rather than as a direct quote, because this PDF drops the diacritics in "Vojtěch" and "Borůvka" and every numeral giving a year during text extraction (a known artifact on this source, confirmed on topic 67 for mathematical symbols and confirmed again here for names and years). The single cleanly-extracted sentence quoted above, about the shape of the forest Jarník's algorithm grows (one nontrivial component, the rest isolated vertices), is the only part of §7.4 this topic quotes directly.

### Reused from topic 67's own `SOURCES.md` (`dsa.cut-property-kruskal-s`)

Topic 67 already cites and quotes Erickson's own "safe edge" lemma and Wikipedia's own cut property; this topic does not re-fetch or re-quote either, and instead states correctness in one line as a corollary of topic 67's own cut property, per `CHAPTER.md`'s own instruction.

## Sedgewick & Wayne — *Algorithms*, 4th ed., booksite §4.3 "Minimum Spanning Trees"

URL: https://algs4.cs.princeton.edu/43mst/
Version: fetched 2026-11-05, the current booksite page

> We use a priority queue to hold the crossing edges and find one of minimal weight.

> The lazy implementation leaves such edges on the priority queue, deferring the ineligibility test to when we remove them.

> In short, we do not need to keep on the priority queue all of the edges from w to vertices tree—we just need to keep track of the minimum-weight edge and check whether the addition of v to the tree necessitates that we update that minimum (because of an edge v-w that has lower weight), which we can do as we process each edge in s adjacency list.

> The lazy version of Prim's algorithm uses space proportional to E and time proportional to E log E (in the worst case) to compute the MST of a connected edge-weighted graph with E edges and V vertices; the eager version uses space proportional to V and time proportional to E log V (in the worst case).

### Contents (item by item, this topic's scope)

- The lazy-versus-eager distinction (leave stale entries on the priority queue and discard them lazily, against tracking one best-known edge per outside vertex and updating it) and the stated costs for each, used as this topic's primary, independently fetchable source for both implementation variants and their big-O bounds with a heap-backed priority queue.

### Red team

1. **R. C. Prim's own 1957 paper ("Shortest connection networks and some generalizations," *Bell System Technical Journal* 36(6), pp. 1389–1401) and M. L. Fredman and R. E. Tarjan's own 1987 paper ("Fibonacci heaps and their uses in improved network optimization algorithms," *Journal of the ACM* 34(3), pp. 596–615) are both cited bibliographically only** — both confirmed against the Crossref API at planning time (title, container-title, volume, issue, page range and publication date all match exactly for each), neither independently opened or quoted this session. The Fibonacci-heap paper is cited only for the named O(m + n log n) bound this topic states as a frontier result, never derived or demonstrated.
2. **CLRS 4th ed.'s own Prim's-algorithm section and priority-queue cost analysis are not opened this session** (paywalled), per `CHAPTER.md`'s own "section numbers to verify against the book" framing. No claim here rests on CLRS's own exact section numbers or wording.
3. **Jarník's own 1930 paper (in Czech, in a regional journal) is not independently found or opened this session.** A Crossref search for it by title returns no match; its own exact title, venue and year are not claimed by this topic beyond what Erickson's own text states ("Jarník published his discovery the following year" after a letter to Borůvka). `CHAPTER.md`'s own framing marks this as "to verify," and this topic leaves it unverified rather than guessing a year.
4. **Whether Graham & Hell (1985) itself credits Jarník is not checked this session** — that paper is cited only bibliographically on topic 67, never opened here either; no claim in this topic rests on Graham & Hell's own treatment of Jarník.
5. **The Fibonacci-heap bound O(m + n log n) is named only, per `CHAPTER.md`'s own instruction** — this topic does not build a Fibonacci heap, does not derive the bound, and states only that Fredman and Tarjan's own 1987 paper proves it, cited bibliographically.
6. **Chapter 6's own binary heap (the only heap this topic actually builds and measures) is used, not re-derived**; its sift-up/sift-down costs are quoted from topic 30's own `SOURCES.md`, not re-fetched here.
7. **The post-notes frontier citations (Karger–Klein–Tarjan 1995, Chazelle 2000, Pettie–Ramachandran 2002) are named only**, each checked against Crossref at planning time for title, venue, volume, issue, pages and year, none opened or quoted; their own exact theorems are not claimed by this topic.
