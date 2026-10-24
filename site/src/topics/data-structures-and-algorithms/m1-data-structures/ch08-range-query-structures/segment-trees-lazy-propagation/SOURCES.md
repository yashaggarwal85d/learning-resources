## Segment Tree — Algorithms for Competitive Programming (cp-algorithms)

URL: https://cp-algorithms.com/data_structures/segment_tree.html
Version: page footer "Last update: October 4, 2026"; the primary technical reference this topic builds from (recursive segment tree, generalization to other merge operations, and lazy propagation for range updates, all on one page, each with runnable pseudocode).

> A Segment Tree is a data structure that stores information about array intervals as a tree.

> the merge operation that merges two siblings in a segment tree.

> it is enough to store the GCD / LCM of the corresponding vertex in each vertex of the tree.

> The time complexity of this construction is $O(n)$, assuming that the merge operation is constant time

> Therefore we visit at most $4 \log n$ vertices in total, and that is equal to a running time of $O(\log n)$.

> Thus only $O(\log n)$ vertices need to be updated.

> A marked vertex will mean, that every element of the corresponding segment is assigned to that value, and actually also the complete subtree should only contain this value.

> In this value we store the addends we haven't propagated to the child vertices.

> we should always push information from the current vertex into both of its children.

Contents (table of contents, item by item): Simplest form of a Segment Tree (Structure, Construction, Sum queries, Update queries, Implementation, Memory efficient implementation); Advanced versions of Segment Trees (More complex queries, including finding the maximum and computing GCD/LCM; Range updates (Lazy Propagation): Addition on segments, Assignment on segments, Adding on segments querying for maximum; Generalization to higher dimensions; Persistent Segment Tree; Dynamic segment tree).

## Iterative Segment Tree (Range Minimum Query) — GeeksforGeeks

URL: https://www.geeksforgeeks.org/dsa/iterative-segment-tree-range-minimum-query/
Version: page footer "Last Updated : 30 Aug, 2022"; a stable, settled algorithm (the iterative array layout itself, not a fast-moving API), used for the bottom-up, non-recursive array layout that cp-algorithms' own page does not cover (cp-algorithms' "Simplest form" is recursive throughout).

> The iterative version of the segment tree basically uses the fact, that for an index i, left child = 2 * i

> The parent for an index i in the segment tree array can be found by parent = i / 2.

> At first we compute the minimum in the ranges while constructing the tree starting from the leaf nodes

> climbing up through the levels one by one.

> we start updating the segment tree starting from the leaf nodes and update all those nodes which are affected

> by gradually moving up through the levels at every iteration.

> the left and right indices will move towards right and left respectively

> Since there are (log n) levels in the worst case, so querying takes log n time.

> Updation also takes log n time because there we have to update all the levels

Used to corroborate the recursive version's own O(log n) bound with an independently-derived layout, and for the specific leaf-at-array-position mechanic this topic's `examples.py` builds (confirmed directly in the page's own code, `segtree[n + i] = a[i]`, not stated as prose on the page).

## Range Update Range Query — USACO Guide (Platinum)

URL: https://usaco.guide/plat/RURQ
Version: page section "Generic Lazy Segment Tree" (fetched 2026-10-24; no publish/last-updated date shown on the page, consistent with topic 33's own use of this source).

> we store updates on the nodes that compose the range we are updating, and lazily apply the updates when we walk down the tree.

> It is crucial that we always push down all the previous updates when traversing down the tree.

> a total of four different
situations might take place after any update:

> a set update will override all previous add
updates.

Used specifically for the lazy-tag composability clause: this is the one source among the three that states directly what happens when a range-add tag and a range-assignment tag land on the same node (assignment overrides, discarding the pending add), which cp-algorithms' own page does not address (its addition and assignment sections are separate, non-interacting implementations — see the "Claims not made" note in `OUTLINE.md`).

Checked: 22 quote(s) found word for word, 0 problem(s) (`node scripts/sources.mjs check segment-trees-lazy-propagation`).
