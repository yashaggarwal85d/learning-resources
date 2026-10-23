# Sources — Red-black trees

## "Red–black tree," Wikipedia (current article)

URL: https://en.wikipedia.org/wiki/Red%E2%80%93black_tree
Version: current article, fetched 2026-10-23

> A red node does not have a red child.

> All null nodes are considered black.

> Every path from a given node to any of its leaf nodes (that is, to any descendant null node) goes through the same number of black nodes.

> These 2–3–4 nodes correspond to black node – red children groups in red-black trees, as shown in figure 1. It is not a 1-to-1 correspondence, because 3-nodes have two equivalent representations: the red child may lie either to the left or right.

> Rotations occur in cases I6 and I5 + I6 – outside the loop. Therefore, at most two rotations occur in total.

> Rotations occur in cases 6 and 5 + 6 and 3 + 5 + 6 – all outside the loop. Therefore, at most three rotations occur in total.

Contents:
- The red-black invariants used in this topic: every node red or black; null nodes counted as black; a red node never has a red child; every root-to-leaf path has the same number of black nodes.
- The 2-3-4 correspondence: a black node together with its red children stands for one 2-3-4 node, with the two-representations caveat for 3-nodes (resolved only by the left-leaning variant, which this topic does not use).
- The exact rotation bound this topic claims: at most two rotations total to fix an insertion, at most three to fix a deletion.

## "Red-black Trees (rbtree) in Linux," The Linux Kernel documentation (current)

URL: https://www.kernel.org/doc/html/latest/core-api/rbtree.html
Version: current kernel documentation, fetched 2026-10-23

> worst case performance for insertion and deletion (at most two rotations and three rotations, respectively, to balance the tree), with slightly slower

> The deadline and CFQ I/O schedulers employ rbtrees to track requests; the packet CD/DVD driver does the same. The high-resolution timer code uses an rbtree to organize outstanding timer requests. The ext3 filesystem tracks directory entries in a red-black tree. Virtual memory areas (VMAs) are tracked with red-black trees, as are epoll file descriptors, cryptographic keys, and network packets in the "hierarchical token bucket" scheduler.

Contents:
- The kernel's own documentation corroborating the two-rotation/three-rotation bound (independent confirmation of the Wikipedia figure, from a primary implementation source).
- The production-use claim: named Linux kernel subsystems (I/O schedulers, high-resolution timers, ext3, virtual memory areas, epoll, cryptographic keys, the HTB packet scheduler) that track data with rbtree, this topic's own red-black tree.

## "TreeMap," Java SE 21 & JDK 21 API documentation

URL: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html
Version: Java SE 21 API docs, fetched 2026-10-23

> A Red-Black tree based NavigableMap implementation.

> Algorithms are adaptations of those in Cormen, Leiserson, and Rivest's Introduction to Algorithms.

Contents:
- The production-use claim for Java's own ordered map: `TreeMap`'s own Javadoc states directly that it is a red-black tree implementation, adapting the algorithms from the standard CLRS reference.

## "std::map," cppreference.net (mirror of cppreference.com)

URL: https://cppreference.net/cpp/container/map.html
Version: current mirror of the cppreference.com page, fetched 2026-10-23

> Maps are usually implemented as Red–black trees.

Contents:
- The production-use claim for C++'s own ordered map: the C++ standard doesn't mandate an implementation, but cppreference's own page states that maps are usually implemented as red-black trees in practice.
