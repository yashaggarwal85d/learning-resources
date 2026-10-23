# Sources — Order-statistic trees

## Charles E. Leiserson, MIT 6.046J/18.401J (Fall 2005), Lecture 11: "Augmenting Data Structures"

URL: https://www.ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/eebc00db28f8650591e3be446a31f1cf_lec11.pdf
Version: the course's own lecture slides, fetched 2026-10-23

> IDEA: Use a red-black tree for the set S, but keep subtree sizes in the nodes.

> size[x] = size[left[x]] + size[right[x]] + 1

> k ← size[left[x]] + 1 ⊳ k = rank(x) if i = k then return x if i < k then return OS-SELECT(left[x], i ) else return OS-SELECT(right[x], i – k )

> Running time = O(h) = O(lg n) for red-black trees.

> Recolorings: no effect on subtree sizes.

> Rotations: fix up subtree sizes in O(1) time.

> ∴RB-INSERT and RB-DELETE still run in O(lg n) time.

> 1. Choose an underlying data structure (redblack trees). 2. Determine additional information to be stored in the data structure (subtree sizes). 3. Verify that this information can be maintained for modifying operations (RBINSERT, RB-DELETE — don't forget rotations). 4. Develop new dynamic-set operations that use the information (OS-SELECT and OS-RANK).

Contents:
- The subtree-size augmentation itself, on top of a red-black tree (this topic's own red-black tree from topic 24): the size field's recurrence, the OS-SELECT algorithm that walks down comparing the target rank against the left subtree's size, and the O(h) = O(log n) running time this gives select on a balanced tree.
- The direct statement that recolourings don't touch subtree sizes at all, and a rotation fixes up the affected sizes in O(1) time — which is why augmenting a red-black tree with sizes doesn't change its O(log n) insert/delete bound.
- The four-step augmentation methodology (choose a structure, choose a field, verify the field survives every modifying operation including rotations, build new operations on top) — the general process this topic's own augmentation (and any other) follows, stated explicitly as guidelines rather than a rigid rule.

## csce750 (Fall 2020), Lecture Notes: "Augmenting Data Structures" (University of South Carolina, after CLRS Ch. 14)

URL: https://www.cse.sc.edu/~fenner/csce750/OKane-Fall-2020/notes-augmenting.pdf
Version: current course lecture notes, fetched 2026-10-23

> Each rotation changes the size for only two nodes: The two nodes incident to the edge being rotated.

> 1. Choose an underlying data structure. 2. Determine additional information to maintain in that data structure. 3. Modify the operations of that data structure to maintain that information. 4. Develop new operations using that information.

Contents:
- The precise statement of which two nodes a rotation's size fixup actually touches — the two nodes incident to the rotated edge, not a wider recomputation — corroborating the MIT lecture's O(1)-per-rotation claim with the exact mechanism.
- The same four-step augmentation methodology, independently stated, following CLRS Chapter 14 directly, confirming this isn't one course's own idiosyncratic framing.
