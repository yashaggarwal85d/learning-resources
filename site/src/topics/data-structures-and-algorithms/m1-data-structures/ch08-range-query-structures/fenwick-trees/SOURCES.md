## Fenwick Tree — Algorithms for Competitive Programming (cp-algorithms)

URL: https://cp-algorithms.com/data_structures/fenwick.html
Version: page footer "Last update: August 7, 2026"; translated from e-maxx.ru; the primary technical reference this topic builds from (point update/range query, range-update/point-query, range-update/range-query with two BITs, and the 2D extension, all on one page, each with runnable pseudocode).

> Let $f$ be some group operation (a binary associative function over a set with an identity element and inverse elements) and $A$ be an array of integers of length $N$.

> The Fenwick tree is also called a Binary Indexed Tree (BIT).
> It was first described in a paper titled "A new data structure for cumulative frequency tables" (Peter M. Fenwick, 1994).

> A Fenwick tree is just an array, $T[0 \dots N-1]$, where each element is equal to the sum of elements of $A$ in some range, $[g(i), i]$:

> The computation of $g(i)$ is defined using the following simple operation:
> we replace all trailing $1$ bits in the binary representation of $i$ with $0$ bits.

> It is easy to see that we can find all such $j$'s by starting with $i$ and flipping the last unset bit.

> Using simple tricks we can also do the reverse operations: increasing ranges and querying for single values.

> We make two point update operations on Fenwick tree which are add(l, x) and add(r+1, -x).

> To support both range updates and range queries we will use two BITs namely $B_1[]$ and $B_2[]$, initialized with zeros.

> We can write the range sum as difference of two terms, where we use $B_1$ for first term and $B_2$ for second term.

> As claimed before, it is very easy to implement Fenwick Tree for multidimensional array.

Contents (table of contents, item by item):
- Description: Overview; Definition of g(i)
- Implementation: Finding sum in one-dimensional array; Linear construction; Finding minimum of [0, r] in one-dimensional array; Finding sum in two-dimensional array; One-based indexing approach
- Range operations: 1. Point Update and Range Query; 2. Range Update and Point Query; 3. Range Update and Range Query

## 2D Range Queries — USACO Guide (Platinum)

URL: https://usaco.guide/plat/2DRQ?lang=cpp
Version: page section "2D BIT" / "Implementation", current USACO Guide Platinum module (fetched 2026-10-24).

> Essentially, we just nest the loops that one would find in a 1D BIT to get N-dimensional BITs. We can then use PIE to query subrectangles.

Used to corroborate cp-algorithms' own 2D-array section (both independently describe the 2D Fenwick tree as the 1D update/query loop nested along a second dimension, combined with inclusion–exclusion for a sub-rectangle sum).

## Range Update Range Query — USACO Guide (Platinum)

URL: https://usaco.guide/plat/RURQ
Version: page section "BIT Revisited" (fetched 2026-10-24).

> Binary Indexed Trees can support range increments and range sum queries.

> We can perform range addition and range summation queries by performing multiple suffix addition and prefix sum queries.

Used to corroborate the range-update/range-query clause independently of cp-algorithms' own two-BIT derivation (this source frames it as suffix-add/prefix-sum instead of cp-algorithms' $B_1 \cdot i - B_2$ framing — same result, different derivation, both checked against this topic's own `examples.py`).

## Fenwick tree — Wikipedia

URL: https://en.wikipedia.org/wiki/Fenwick_tree
Version: revision oldid=1371848142 (fetched 2026-10-24).

> A Fenwick tree or binary indexed tree (BIT) is a data structure that stores an array of values and can efficiently compute prefix sums of the values and update the values.

> This structure was proposed by Boris Ryabko in 1989

> It has subsequently become known under the name Fenwick tree after Peter Fenwick, who described this structure in his 1994 article.

Naming-history note (not a claim this topic makes on screen, recorded here for the fact-check): the structure now universally called a "Fenwick tree" was first proposed by Boris Ryabko in 1989, five years before Peter Fenwick's own 1994 paper that gave it its common name. This topic uses the common name ("Fenwick tree") throughout, as every other source here does, and does not claim Fenwick invented the structure from nothing.
