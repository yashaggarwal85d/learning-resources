## Wikipedia — "Binary heap"

URL: https://en.wikipedia.org/wiki/Binary_heap
Version: fetched 2026-10-23

> Steps 2 and 3, which restore the heap property by comparing and possibly swapping a node with its parent, are called the up-heap operation (also known as bubble-up, percolate-up, sift-up, trickle-up, swim-up, heapify-up, cascade-up, or fix-up).

> Compare the added element with its parent; if they are in the correct order, stop.

> If not, swap the element with its parent and return to the previous step.

> Steps 2 and 3, which restore the heap property by comparing and possibly swapping a node with one of its children, are called the down-heap (also known as bubble-down, percolate-down, sift-down, sink-down, trickle down, heapify-down, cascade-down, fix-down, extract-min or extract-max, or simply heapify) operation.

> Compare the new root with its children; if they are in the correct order, stop.

> If not, swap the element with one of its children and return to the previous step. (Swap with its smaller child in a min-heap and its larger child in a max-heap.)

> Let n be the number of elements in the heap and i be an arbitrary valid index of the array storing the heap. If the tree root is at index 0, with valid indices 0 through n − 1, then each element a at index i has

> children at indices 2i + 1 and 2i + 2

> its parent at index floor((i − 1) / 2).

> Building a heap from an array of n input elements can be done by starting with an empty heap, then successively inserting each element.

> This approach, called Williams' method after the inventor of binary heaps, is easily seen to run in O(n log n) time: it performs n insertions at O(log n) cost each.

> However, Williams' method is suboptimal.

> Then starting from the lowest level and moving upwards, sift the root of each subtree downward as in the deletion algorithm until the heap property is restored.

> operations (swaps) per node. In this method most of the heapification takes place in the lower levels.

### Contents (item by item, this topic's scope)

- The exact sift-up ("up-heap") and sift-down ("down-heap") procedures, each named with its own common synonyms.
- The implicit array index formula for a zero-indexed binary heap: children at 2i+1 and 2i+2, parent at floor((i-1)/2).
- Williams' one-at-a-time insertion method as the naive O(n log n) build, and Floyd's bottom-up sift-down method as the faster alternative, with the stated reason it's faster: most of the heapification work happens in the lower levels, where a node's height (and so its sift-down cost) is small.

## Sedgewick & Wayne — "Priority Queues" (Algorithms, 4th ed. booksite)

URL: https://algs4.cs.princeton.edu/24pq/
Version: fetched 2026-10-23

> In a heap, the parent of the node in position k is in position k/2; and,
conversely, the two children of the node in position k are in positions 2k and 2k + 1.

> A clever method that is much more efficient is to proceed from right 
to left, using sink() to make subheaps as we go.

> Every position in the array is the root of a small subheap;
sink() works or such subheaps, as well. If the two children 
of a node are heaps, then calling sink()
on that node makes the subtree rooted there a heap.

> Sink-based heap construction is linear time.

### Contents (item by item, this topic's scope)

- A second, independent confirmation of the heap's index arithmetic (1-indexed variant: parent at k/2, children at 2k and 2k+1 — the same relationship topic's own zero-indexed convention restates).
- The bottom-up build method stated the other way: proceed right to left through the array, sinking each position's own subheap, confirming every position is the root of a valid subheap once its own children are heaps.
- A direct, named proposition: "Sink-based heap construction is linear time" — the O(n) bound this topic measures directly in `examples.py`.
