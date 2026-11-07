## Erickson — *Algorithms* (2019), Chapter 11 "Applications of Flows and Cuts", §11.2 "Bipartite Matching"

URL: https://jeffe.cs.illinois.edu/teaching/algorithms/book/11-maxflowapps.pdf
Version: fetched 2026-11-05, the author's own posted PDF copy

> A matching is a subgraph in which every vertex has degree at most one, or equivalently, a collection of edges such that no two share a vertex.

> The problem is to find a matching with the maximum number of edges.

> we look for an alternating path in G

> If there is no alternating path, the maxflow-mincut theorem implies that M is a maximum matching, so the algorithm ends.

> Finding a single alternating path requires O(E) time, and the algorithm halts after at most V iterations, so the overall algorithm runs in O(V E) time.

> We can compute the maximum flow in O(V E) time using either Orlin's algorithm or off-the-shelf Ford-Fulkerson.

> This characterization of maximum bipartite matchings in terms of alternating paths was proved by Claude Berge

> by finding several disjoint alternating paths in each iteration.

### Contents (item by item, this topic's scope)

- The matching definition and the "maximum number of edges" framing, used for this topic's own matching setup.
- The reduction from a bipartite matching to a unit-capacity flow (orient every edge from L to R, add a source into L and a sink out of R, every edge capacity one) is this topic's own central construction; the chapter's own description of it is paraphrased in this topic's prose rather than quoted directly, because the sentence stating "the size of the maximum matching in G is equal to the value of the maximum flow in G′" did not survive this source's own PDF extraction cleanly (the prime mark on G′ is dropped, turning it into "G 0" — see this topic's own dropped-extraction note, same artifact class already confirmed on topics 67–69).
- The alternating-path reading of an augmenting path in the reduced network, quoted directly for the search itself and for the stopping condition (no alternating path implies a maximum matching, justified from the max-flow min-cut theorem).
- The O(V E) running-time bound for the one-augmentation-at-a-time algorithm, quoted directly, both via the edge-count-times-iteration-count argument and via the closing "either Orlin's algorithm or off-the-shelf Ford-Fulkerson" sentence.
- Claude Berge's own priority for the alternating-path characterization of a maximum matching, stated in this topic's own prose for the full sentence (which otherwise names Kuhn, König and Jacobi's own prior implicit uses, each with a year dropped by this source's own PDF extraction), quoting only the clean, year-free opening clause directly.
- Hopcroft and Karp's own improvement, named via the clean fragment "by finding several disjoint alternating paths in each iteration," which survives extraction; the exact O(√V · E) bound and publication year are stated in this topic's own prose, sourced from the Hopcroft–Karp paper's own citation and from SciPy's own documentation (both below), not quoted from this sentence, because the square-root symbol and the year are both dropped by this source's own PDF extraction here too.

### Dropped-extraction note

This PDF drops mathematical symbols (a prime mark on G′ becomes a bare "G 0"; a square-root sign over V is dropped entirely, leaving "O( V E)" where "O(√V E)" belongs) and every numeral giving a publication year, the identical artifact class already confirmed on Erickson's book for topics 67, 68 and 69. Every number and symbol this topic states that depends on a dropped character (the O(√V E) bound and every cited year) is sourced independently — from Hopcroft and Karp's own paper's citation, confirmed against Crossref, and from SciPy's and NetworkX's own current documentation, both fetched as clean HTML — never quoted from this PDF.

## SciPy Documentation — `scipy.sparse.csgraph.maximum_bipartite_matching`

URL: https://docs.scipy.org/doc/scipy/reference/generated/scipy.sparse.csgraph.maximum_bipartite_matching.html
Version: fetched 2026-11-05, SciPy v1.18.0 Manual (current)

> Returns a matching of a bipartite graph whose cardinality is at least that of any given matching of the graph.

> This function implements the Hopcroft–Karp algorithm

> By Konig's theorem, the cardinality of the matching is also the number of vertices appearing in a minimum vertex cover of the graph.

### Contents (item by item, this topic's scope)

- SciPy's own matching definition, used as independent confirmation of Erickson's own.
- SciPy's own confirmation that it ships the Hopcroft–Karp algorithm specifically (not a generic max-flow call), used in this topic's post-notes as the real-system payoff of building the phase-based algorithm rather than only the one-augmentation-at-a-time baseline.
- SciPy's own one-sentence statement of König's theorem, quoted directly and reused as this topic's own primary source for that theorem's exact relationship (matching cardinality equals minimum vertex cover size), independent of Erickson's book, which does not cover König's theorem in this chapter.

## NetworkX Documentation — `hopcroft_karp_matching`

URL: https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.bipartite.matching.hopcroft_karp_matching.html
Version: fetched 2026-11-05, NetworkX 3.7 documentation (current)

> Returns the maximum cardinality matching of the bipartite graph G.

> The functions hopcroft_karp_matching and maximum_matching are aliases of the same function.

> Unmatched nodes do not occur as a key in matches.

### Contents (item by item, this topic's scope)

- NetworkX's own confirmation that it ships a function literally named for the algorithm this topic builds, used alongside SciPy's own confirmation as this topic's "In production" evidence.
- NetworkX's own note that `hopcroft_karp_matching` and `maximum_matching` are aliases, used to state plainly that a general caller need not know which specific algorithm they are calling.

### Red team

1. **J. E. Hopcroft and R. M. Karp's own 1973 paper ("An n^{5/2} algorithm for maximum matchings in bipartite graphs," *SIAM Journal on Computing* 2(4), pp. 225–231) is cited bibliographically only** — confirmed against both SciPy's own reference list (quoted above, DOI 10.1137/0202019) and NetworkX's own reference list, not independently opened or quoted beyond its own title as both documentation pages state it. This topic's own O(E√V) bound and its own phase-count argument come from `CHAPTER.md`'s own framing of the paper's result, not from the paper itself.
2. **C. Berge's own 1957 paper ("Two theorems in graph theory," *PNAS* 43(9), pp. 842–844) is cited bibliographically only**, confirmed against Crossref at planning time, not opened; this topic's own statement of Berge's lemma comes from Erickson's own text (quoted above) and from `CHAPTER.md`'s own framing.
3. **D. König's own 1931 paper is named only, with its exact title, venue and year left unverified** — a Crossref search at planning time returned no record, and `CHAPTER.md`'s own "Sources to start from" list says explicitly that this citation is "to verify at research time" and that "no citation is given from memory." This topic repeats only the fact that König's theorem is named for him, per Erickson's own mention and SciPy's own direct statement of the theorem (quoted above), and makes no bibliographic claim about König's own paper beyond that.
4. **H. W. Kuhn's own 1955 paper ("The Hungarian method for the assignment problem," *Naval Research Logistics Quarterly* 2(1–2), pp. 83–97) is cited bibliographically only**, confirmed against Crossref, named once in post-notes for the weighted-assignment frontier (the Hungarian algorithm), not built in this topic.
5. **CLRS 4th ed.'s own bipartite-matching material is not opened this session** (paywalled, and per `CHAPTER.md`'s own note its exact chapter and section are themselves unconfirmed even bibliographically) — no claim in this topic rests on CLRS's own wording, section numbers, or presentation.
6. **Topic 69's own residual-graph machinery, the max-flow min-cut theorem and integrality are reused, not re-derived or re-quoted** — this topic's own `SOURCES.md` adds no new citation for any of them; see topic 69's own `SOURCES.md` for their sourcing.
7. **Dinitz's own blocking-flow algorithm, from which the layered shortest-augmenting-phase idea this topic builds is adapted, is not independently opened or cited here** — `CHAPTER.md`'s own framing states plainly that "Dinic's algorithm is skipped" for this chapter and that this topic builds only "the one piece of Dinic that matching needs," explained from the matching side, not from a citation to Dinitz's own paper.
