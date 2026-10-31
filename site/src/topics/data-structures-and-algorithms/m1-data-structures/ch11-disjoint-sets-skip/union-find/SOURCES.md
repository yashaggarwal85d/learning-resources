## Jeff Erickson, *Algorithms*, Lecture 11: Disjoint Sets

URL: https://jeffe.cs.illinois.edu/teaching/algorithms/notes/11-unionfind.pdf
Version: Fa'13 revision, © 2018 Jeff Erickson, CC BY-NC-SA 4.0 (fetched 2026-10-31; the 2026-10-31 jeffe.cs.illinois.edu/teaching/algorithms/notes/08-unionfind.pdf path from this chapter's plan 404s — the current filename is 11-unionfind.pdf)

> Disjoint set data structures have lots of applications. For instance, Kruskal's minimum spanning tree algorithm relies on such a data structure to maintain the components of the intermediate spanning forest. Another application is maintaining the connected components of a graph as new vertices and edges are added.

> It is not hard to come up with a sequence of operations that results in a tree that is a long chain of nodes, so that Find takes Θ(n) time in the worst case.

> With this new rule in place, it's not hard to prove by induction that for any set leader x, the size of x's set is at least 2depth(x) , as follows.

> Since there are only n elements altogether, the maximum depth of any set is lg n. We conclude that if we use union by depth, both Find and Union run in Θ(log n) time in the worst case.

Theorem 1 (weighted union by size, no compression): "A sequence of m MakeWeightedSet operations and n WeightedUnion operations takes O(m + n log n) time in the worst case."

> Whenever the leader of an object x is changed by a WeightedUnion, the size of the set containing x increases by at least a factor of two.

> Find still runs in O(log n) time in the worst case; path compression increases the cost by only

> we use union by rank, Find with path compression runs in O(α(n)) amortized time.

> O(α(m, n)) is actually a tight upper bound for the amortized cost of path compression; there are no more tricks that will improve the analysis further. More surprisingly, this is the best amortized bound we obtain for any pointer-based data structure for maintaining disjoint sets; the amortized cost of every Find algorithm is at least Ω(α(m, n)). The proof of the matching lower bound is, unfortunately, far beyond the scope of this class.

(Footnote on the lower bound names Robert E. Tarjan, "A class of algorithms which require non-linear time to maintain disjoint sets", J. Comput. Syst. Sci. — confirming the lower-bound citation from the chapter plan; the footnote text itself is cut off by the page break in the extracted text, so only the author/title/journal is quoted here, not the full citation line.)

> The function α(n) grows much more slowly than log∗ n for any fixed c; we have α(n) ≤ 3 for all even remotely imaginable values of n. Nevertheless, the function α(n) is eventually larger than any constant, so it is not O(1).

Contents (Lecture 11, in order): disjoint-set operations (MakeSet/Find/Union) and their two named applications (Kruskal, incremental connected components); "reversed trees" (parent-pointer forest, naive union builds a Θ(n) chain); union by depth (the rank idea under a different name) with its Θ(log n) worst-case proof by induction on 2^depth; "shallow threaded trees" (every node points straight at the leader; Union walks and relabels a thread, worst case Θ(n) per call); weighted union by size with its O(log n) amortized bound (Theorem 1, aggregate method); path compression layered on top; the O(α(n)) amortized bound via Seidel and Sharir's top-down analysis; the Ackermann hierarchy and why α(n) ≤ 3 for any size n a machine could hold; the matching Ω(α(m,n)) lower bound, citing Tarjan 1979, with the proof itself out of scope of the lecture.

## Sedgewick and Wayne, *Algorithms, 4th edition*, booksite §1.5 "Case Study: Union-Find"

URL: https://algs4.cs.princeton.edu/15uf/
Version: booksite page fetched 2026-10-31 (4th edition online companion)

> Note: The amortized cost per operation for this algorithm is known to be bounded by a function known as the inverse Ackermann function and is less than 5 for any conceivable value of n that arises in practice.

> Modify QuickUnionUF.java to include path compression, by adding a loop to find() that links every sie on the path from p to the root.

> Note: the amortized cost per operation for this algorithm is known to be logarithmic.

Contents: the quick-find/quick-union/weighted-quick-union progression, the exercise statements for path compression layered on quick-union (plain, logarithmic amortized cost) and on weighted quick-union (compression plus union by size, less-than-5 inverse-Ackermann amortized cost "for any conceivable value of n that arises in practice" — the number this topic uses for its on-screen bound, since it is the one stated as a specific constant rather than Erickson's "≤ 3" under a slightly different exact definition of α).

### Not fetched (paywalled; claims about them limited to what the chapter plan can attribute without a primary quote)

- Tarjan, "Efficiency of a good but not linear set union algorithm" (J. ACM 22(2), 1975): ACM Digital Library, no free full text found. The original O(m log* n) / later full inverse-Ackermann result is not quoted from this paper; this topic sources the bound and its proof sketch from Erickson's notes (which independently derive it from Seidel and Sharir 2005) instead.
- Tarjan and van Leeuwen, "Worst-case analysis of set union algorithms" (J. ACM 31(2), 1984): ACM Digital Library, no free full text found. Path halving and path splitting are described in this topic from their standard textbook definition (each node on the find path points to its grandparent, in one pass) without a paper citation for their shared O(α(n)) bound; the claim "halving and splitting carry the same bound" from the chapter plan is cut per the "if it can't be verified, leave it out" rule — see FACT-CHECK.md.
- Galler and Fischer, "An improved equivalence algorithm" (CACM 7(5), 1964): behind an ACM paywall; not quoted. The structure it introduced is the same parent-pointer forest Erickson's notes present directly, so it is named once in post-notes as the structure's origin without a quote.
- Tarjan, "A class of algorithms which require nonlinear time to maintain disjoint sets" (J. Comput. Syst. Sci. 18(2), 1979) and Fredman and Saks, "The cell probe complexity of dynamic data structures" (STOC 1989): both named only as the lower-bound citations Erickson's own footnote points to (quoted above), not independently fetched.
