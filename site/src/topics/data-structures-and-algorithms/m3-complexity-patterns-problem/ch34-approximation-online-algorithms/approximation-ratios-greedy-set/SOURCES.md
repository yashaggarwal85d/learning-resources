# Sources: Approximation ratios and greedy set cover

## Set cover problem (Wikipedia)

URL: https://en.wikipedia.org/wiki/Set_cover_problem
Version: fetched 2026-11-05

> There is a greedy algorithm for polynomial time approximation of set covering that chooses sets according to one rule: at each stage, choose the set that contains the largest number of uncovered elements.

> This method can be implemented in time linear in the sum of sizes of the input sets, using a bucket queue to prioritize the sets.

The page states the greedy algorithm's approximation ratio as H(s), the s-th harmonic
number, where s is the size of the covered set — the ratio statement itself renders as
stripped MathML in the plain-text fetch (the equations don't survive HTML-to-text
extraction), so this topic takes the ratio's *value* from the rendered page by eye and
derives and checks the bound itself directly in `examples.py` (the harmonic-number sum
on the growing-ratio family, verified against the greedy picks measured there), rather
than quoting the stripped formula.

Contents (for the coverage map): the greedy algorithm's rule (largest number of
uncovered elements), its running time (linear in the sum of input-set sizes via a
bucket queue), its approximation ratio H(s) where s is the covered set's size, the
harmonic number definition H(n) = sum 1/k <= ln(n) + 1, a tight example where greedy's
ratio approaches log2(n), and the Feige 1998 inapproximability result (no polynomial
algorithm beats (1 - epsilon)ln(n) unless P = NP, cited below from its own listing).

> Feige, Uriel (1998), "A threshold of ln n for approximating set cover", Journal of the ACM, 45 (4): 634–652, doi:10.1145/285055.285059, ISSN 0004-5411, S2CID 52827488.

> 1 2 Chvatal, V. (August 1979), "A Greedy Heuristic for the Set-Covering Problem", Mathematics of Operations Research, 4 (3): 233–235, Bibcode:1979MatOR...4..233C, doi:10.1287/moor.4.3.233, JSTOR 3689577

## Vertex cover (Wikipedia)

URL: https://en.wikipedia.org/wiki/Vertex_cover
Version: fetched 2026-11-05

> It is NP-hard, so it cannot be solved by a polynomial-time algorithm if P ≠ NP. Moreover, it is hard to approximate – it cannot be approximated up to a factor smaller than 2 if the unique games conjecture is true. On the other hand, it has several simple 2-factor approximations.

> The endpoints of any maximal matching form a vertex cover.

> One can find a factor-2 approximation by repeatedly taking both endpoints of an edge into the vertex cover, then removing them from the graph. Put otherwise, we find a maximal matching M with a greedy algorithm and construct a vertex cover C that consists of all endpoints of the edges in M.

> The set C constructed this way is a vertex cover: suppose that an edge e is not covered by C; then M ∪ {e} is a matching and e ∉ M, which is a contradiction with the assumption that M is maximal. Furthermore, if e = {u, v} ∈ M, then any vertex cover – including an optimal vertex cover – must contain u or v (or both); otherwise the edge e is not covered. That is, an optimal cover contains at least one endpoint of each edge in M; in total, the set C is at most 2 times as large as the optimal vertex cover.

> No better constant-factor approximation algorithm than the above one is known.

Contents (for the coverage map): NP-hardness and the unique-games inapproximability-below-2 result, the maximal-matching-to-cover construction, the proof that C covers every edge (maximality of M) and that C is at most 2*OPT (M's edges are disjoint, so an optimal cover needs at least one distinct vertex per edge of M), and the statement that no better constant factor is known for general graphs.

## Matching (graph theory) (Wikipedia)

URL: https://en.wikipedia.org/wiki/Matching_(graph_theory)
Version: fetched 2026-11-05

> A maximal matching is a matching M of a graph G that is not a subset of any other matching. A matching M of a graph G is maximal if every edge in G has a non-empty intersection with at least one edge in M.

> A maximum matching (also known as maximum-cardinality matching[3]) is a matching that contains the largest possible number of edges. There may be many maximum matchings.

> Every maximum matching is maximal, but not every maximal matching is a maximum matching.

Contents (for the coverage map): the maximal-vs-maximum distinction the vertex cover proof depends on (the algorithm only needs *a* maximal matching, found by a cheap greedy scan — it never needs the harder maximum matching).

## Approximation algorithm (Wikipedia)

URL: https://en.wikipedia.org/wiki/Approximation_algorithm
Version: fetched 2026-11-05

> approximation algorithms are efficient algorithms that find approximate solutions to optimization problems (in particular NP-hard problems) with provable guarantees on the distance of the returned solution to the optimal one.

> In an overwhelming majority of the cases, the guarantee of such algorithms is a multiplicative one expressed as an approximation ratio or approximation factor i.e., the optimal solution is always guaranteed to be within a (predetermined) multiplicative factor of the returned solution.

> The design and analysis of approximation algorithms crucially involves a mathematical proof certifying the quality of the returned solutions in the worst case.[1] This distinguishes them from heuristics such as annealing or genetic algorithms, which find reasonably good solutions on some inputs, but provide no clear indication at the outset on when they may succeed or fail.

Contents (for the coverage map): the definition of an approximation algorithm (polynomial time, provable worst-case ratio), the multiplicative-ratio convention this chapter uses throughout, and the explicit contrast with a heuristic that has no such proof — the distinction topic 111 (local search and metaheuristics) is built on.
