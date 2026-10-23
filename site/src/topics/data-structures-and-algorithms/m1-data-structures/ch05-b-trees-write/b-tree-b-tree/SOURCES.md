## CMU 15-445/645 Database Systems, Lecture 8: Tree Indexes

URL: https://15445.courses.cs.cmu.edu/spring2024/slides/08-trees.pdf
Version: Spring 2024 (Carnegie Mellon, taught by Jignesh Patel; slide deck credits Chris Re for the insert/delete algorithm slides)

> A B+Tree is a self-balancing, ordered tree data structure that allows searches, sequential access, insertions, and deletions in O(logf n).

> f is the fanout of the tree.

> A B+Tree is an M-way search tree with the following properties:

> It is perfectly balanced (i.e., every leaf node is at the same depth in the tree)

> Every node other than the root is at least half-full M/2-1 ≤ #keys ≤ M-1

> Every inner node with k keys has k+1 non-null children

> The original B-Tree from 1972 stored keys and values in all nodes in the tree.

> A B+Tree only stores values in leaf nodes. Inner nodes only guide the search process.

> Find correct leaf node L.

> Insert data entry into L in sorted order.

> If L has enough space, done!

> Otherwise, split L keys into L and a new node L2

> Redistribute entries evenly, copy up middle key.

> Insert index entry pointing to L2 into parent of L.

> To split inner node, redistribute entries evenly, but push up middle key.

> Start at root, find leaf L where entry belongs.

> Remove the entry.

> If L is at least half-full, done!

> If L has only M/2-1 entries,

> Try to re-distribute, borrowing from sibling (adjacent node with same parent as L).

> If re-distribution fails, merge L and sibling.

> If merge occurred, must delete entry (pointing to L or sibling) from parent of L.

> Traverse to the left-most leaf page and then retrieve tuples from all leaf pages.

Contents (item by item, this topic's scope):
1. The B+Tree's own self-balancing, ordered, O(log_f n) definition, with f as fanout.
2. The M-way search tree properties: perfect balance, every non-root node at least half-full, every inner node's children count is one more than its key count.
3. The 1972 B-tree vs. B+Tree distinction: values in every node vs. values only in leaves.
4. The insert algorithm: find leaf, insert in sorted order, split on overflow (leaf: redistribute and copy up the middle key; inner node: redistribute and push up the middle key).
5. The delete algorithm: remove, re-distribute from a sibling on underflow, merge with a sibling if re-distribution fails, delete the now-orphaned parent entry on a merge.
6. The clustered B+Tree range-scan pattern: traverse to the left-most leaf, then read across leaf pages.

## Stanford CS145, Module 3B: B+Tree Indexes

URL: https://cs145.stanford.edu/Module3B-Indexing/btree-indexes.html
Version: "Run · Modern Data Systems" course site, fetched 2026-10-23

> A B+Tree index stores keys in sorted order in a balanced tree. It supports both point lookups and range scans (WHERE rating BETWEEN 4.0 AND 5.0) by scanning leaf pages in key order.

> A B+Tree indexes a table's data pages. Three layers of index nodes (root, internal, leaf) route a lookup down to the right page, and the leaves are linked left-to-right so a range scan can stream across them without going back to the root.

> With no pages cached, the lookup reads three index pages and one data page: four IOs.

> The B+Tree finds the starting leaf, then streams across leaves until it passes the end key.

> The result is mostly sequential IO once the descent reaches the starting leaf, which makes range scans cheap on a B+Tree.

> Fanout is the number of children per internal page. Higher fanout means fewer levels.

> N = number of indexable keys; h = approximate number of index levels.

> For 1 trillion keys and 8-byte pointers, ignoring headers and unused space:

> Reads: High fanout keeps the tree shallow. Point queries follow one path; range queries continue through sorted leaves.

> Writes: Inserts update pages. Full pages split, and splits can propagate upward. Maintaining balance adds work under heavy writes.

> The height estimate assumes similar internal-node and leaf capacities and full pages; occupancy and page overhead affect the actual height.

Contents (item by item, this topic's scope):
1. The sibling-link range-scan mechanism, stated concretely: leaves linked left-to-right, a scan streams across them without returning to the root.
2. A worked point-lookup I/O count (three index pages and one data page, four I/Os for a specific tree shape).
3. The fanout/height relationship f ≈ page size / (key size + pointer size), h ≈ ⌈log_f N⌉, with a worked table (e.g. 64 KB pages, 8-byte keys and pointers → fanout ≈ 4,096 → height 4 for 1 trillion keys).
4. The read/write trade-off: high fanout keeps reads cheap and shallow; every insert risks a split that can propagate upward.

## PostgreSQL nbtree README (Lehman & Yao B-tree, canonical source tree)

URL: https://raw.githubusercontent.com/postgres/postgres/master/src/backend/access/nbtree/README
Version: `master` branch, fetched 2026-10-23

> This directory contains a correct implementation of Lehman and Yao's high-concurrency B-tree management algorithm (P. Lehman and S. Yao, Efficient Locking for Concurrent Operations on B-Trees, ACM Transactions on Database Systems, Vol 6, No. 4, December 1981, pp 650-670).

> Compared to a classic B-tree, L&Y adds a right-link pointer to each page, to the page's right sibling.

Contents (item by item, this topic's scope):
1. A real, current production B+Tree implementation (PostgreSQL's `nbtree`) naming its own right-link-to-sibling mechanism directly, corroborating the CMU/Stanford leaf-sibling-link claim in a shipped system rather than only in course material.
