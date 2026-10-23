# Sources — BST operations and rotations

## Robert Sedgewick and Kevin Wayne, "Binary Search Trees" (Algorithms, 4th Edition, §3.2)

URL: https://algs4.cs.princeton.edu/32bst/
Version: the book's current companion site, fetched 2026-10-23

> is to delete a node x by replacing it with its successor.

> Because x has a right child, its successor is the node with the smallest key in its right subtree.

> The replacement preserves order in the tree because there are no keys between x.key and the successor's key.

> we begin with a basic recursive BST traversal method, known as inorder traversal.

Contents:
- The standard delete-by-successor method (first proposed by T. Hibbard in 1962, per the page's own note): replacing a deleted node with the smallest key in its right subtree, because no key lies between the deleted key and its successor's, so the BST property survives the swap.
- The definition of in-order traversal as the method that visits every key in sorted order, directly from the BST property (left subtree, then the node, then right subtree).

## Erik Demaine and Srini Devadas, MIT 6.006 (Spring 2020), Lecture 7: "Binary Trees, Part 2: AVL"

URL: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/a2c80596cf4a2b5fbc854afdd2f23dcb_MIT6_006S20_lec7.pdf
Version: the course's own lecture PDF, fetched 2026-10-23

> A rotation relinks O(1) pointers to modify tree structure and maintains traversal order

> O(n) rotations can transform a binary tree to any other with same traversal order.

Contents:
- The original statement of what a rotation actually is: a constant number of pointer relinks that change a tree's shape while provably preserving the in-order sequence of keys — this topic's own definition of the rotation primitive, with no balancing invariant yet attached.
- The claim (used only to frame the problem, not re-derived here) that enough rotations can reshape any BST into any other BST with the same key order, which is why later balancing schemes can rely on rotations alone to fix a shape problem.
