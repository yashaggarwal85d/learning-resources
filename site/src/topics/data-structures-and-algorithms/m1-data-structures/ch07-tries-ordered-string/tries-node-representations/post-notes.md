---
id: dsa.tries-node-representations
title: Tries and node representations
---

<section data-section="outcomes">

## After this topic you can

- Build a trie over a small dictionary using each of four node representations, and trace a lookup through each one.
- State and justify the O(key length) lookup bound, independent of n, and contrast it with an earlier chapter's own O(log n)-style bound.
- Measure and explain the real memory cost of each node representation on the identical dictionary, and name which later, skipped design each one's own weakness motivates.

</section>

<section data-section="internals">

## Into the internals

### Why a ternary search tree still fits the O(key length) bound

A TST node's lo and hi children compare against the *same* character position — they don't advance the string index. Only the equal (middle) child does that. So a lookup can take more total pointer-follows than the key's own length when several lo/hi comparisons happen at one position, but it never revisits a position it has already resolved: the number of distinct character positions consumed stays bounded by the key's own length. `examples.py`'s own step counter confirms this stays proportional to the key, never to how many other keys share the tree.

### Why the measured memory ratio doesn't match either source's own number

Princeton's own null-link example (1035 vs. 155 null links) is that source's specific count on its own key set. `examples.py` measures a different 21-word dictionary and finds the array representation uses 4.48x the ternary search tree's total memory, with 96.3% of the array's own child slots sitting null. Same direction — the array wastes by far the most — a different exact number, because it's a different dictionary measured honestly rather than the source's own figure copied onto this topic.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds the identical 21-word dictionary four ways — array, hash, sorted-list (binary search via `bisect`), and ternary search tree — and measures real bytes per representation with `sys.getsizeof`, recursively summing every node and its own child-storage container. It also counts real lookup steps per key for the array, hash, and sorted-list representations and asserts the count equals the key's own length every time, and counts the array representation's own total child slots versus how many are actually filled.

</section>

<section data-section="production">

## In production

The array representation's own measured memory blow-up is the exact problem every later, skipped variant this syllabus names exists to fix: Patricia trees compress long unary chains of single-child nodes into one edge, and adaptive radix trees size each node's own child storage to its real fanout instead of allocating a fixed R slots up front. Neither fix is taught here — this topic measures the exact cost that motivates them.

</section>

<section data-section="frontier">

## The frontier

Radix and Patricia trees, longest-prefix-match lookup, and adaptive radix trees (ART) are named here only in passing — this chapter's own syllabus marks all three as skipped, along with finite-state transducers (§7.2). This topic is the chapter's only surviving topic.

</section>

<section data-section="questions">

## More questions

- The hash-children representation measured less memory than the array here, but a hash table's own per-node overhead doesn't shrink to zero either. At what dictionary size would a sparse hash table start costing more than a well-chosen array?
- A ternary search tree's own lo/hi comparisons depend on insertion order, the same way an unbalanced binary search tree does. What would happen to this topic's own measured numbers if the 21 words were inserted in a much less favorable order?

</section>

<section data-section="next">

## Where this goes next

Tries answered where a string lives, independent of how many strings are stored — a question about a key's own characters. The next chapter asks a different question about position instead: given a long sequence of numbers, how do you answer a running sum, or update a single value, without re-scanning everything each time it's asked? Fenwick trees, next.

</section>
