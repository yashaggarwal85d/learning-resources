Last verified: 2026-10-23. Expert sign-off: pending.

- Charles E. Leiserson, MIT 6.046J/18.401J (Fall 2005), "Lecture 11: Augmenting Data Structures" — the subtree-size field's recurrence, the OS-SELECT algorithm, the rotation/recolouring fixup claim, and the four-step augmentation methodology, from one of CLRS's own authors. [source](https://www.ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/eebc00db28f8650591e3be446a31f1cf_lec11.pdf)
- csce750 (Fall 2020), "Lecture Notes: Augmenting Data Structures" — the precise claim that a rotation changes the size of only the two nodes incident to the rotated edge, independently following CLRS Chapter 14. [source](https://www.cse.sc.edu/~fenner/csce750/OKane-Fall-2020/notes-augmenting.pdf)

Canonical numbers (a select and a rank query's comparison counts against the tree's own height,
and the number of subtree sizes one isolated rotation recomputes) are computed and asserted
directly in this topic's `examples.py`, on this machine, in one run.

Related tracks (see Prerequisites): topic 24 (Red-black trees) for the balanced tree this topic
augments directly, rather than building a fresh structure; B-tree and B+-tree mechanics (next)
for a search tree built around a completely different cost model.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=order-statistic-trees:%20).
