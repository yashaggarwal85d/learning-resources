# OUTLINE: Merge sort

A full topic, about 14 minutes. Second topic of Chapter 15. No compiled benchmark needed —
every number is a small, exact count or a direct measurement, computed and asserted in
`examples.py`.

## Storyboard

1. **Hook.** Two sorted lists of eight keys each, merged: how many comparisons? It depends
   entirely on how the keys interleave — anywhere from eight to fifteen. Merge sort never
   uses more than seventeen comparisons on eight keys, against an unbreakable floor of
   sixteen.
2. **Predict.** Merging one through eight with nine through sixteen: how many comparisons?
3. **The merge procedure.** Two sorted ranges, two pointers, one comparison per step; the
   left list used up first costs the fewest comparisons, a perfect interleaving costs the
   most — between the smaller range's own size and one less than their combined size.
4. **Top-down.** Split at the midpoint, sort both halves, merge — the recursion tree from
   the chapter on recurrences, a merge at every node, cited rather than re-derived.
5. **Bottom-up.** The identical result with no recursion and no call stack: merge adjacent
   runs of width one, then two, then four, doubling until one run remains.
   *Takeaway (step 5, not step 3 — the first non-predict step after hook+predict has
   repeatedly squeezed the phone caption in this project's other Chapter 15 topics):*
   "Top-down recurses to build the merge order; bottom-up sweeps fixed widths to the
   identical result."
6. **When they agree, and when they don't.** At a power-of-two size, every split is exact
   for both strategies, so the counts match exactly; off a power of two, the two
   strategies can split differently, and the counts can differ.
7. **Stability, shown directly.** A tie keeps the left key first — the tagged deck's own
   two equal keys come out in their original order. One character, the comparison's own
   `<=` becoming `<`, breaks it.
   *Takeaway:* "A merge's own stability lives in one comparison: take the left key on a
   tie, not the right."
8. **Predict.** Does a sort that is stable, in place, and always Θ(n log n) exist, all
   three together?
9. **The buffer, three ways.** The simple version copies the whole input; the usual
   refinement copies only the left half; Timsort's refinement copies only the shorter
   run. Why no real library ships stable, in place, and Θ(n log n) all three at once —
   merge sort gives up in-place-ness for its guarantee.
10. **Natural merge sort.** Instead of splitting blindly, find the runs already there —
    maximal ascending stretches — then merge adjacent runs pairwise. On already-sorted
    input, one run, no merging at all.
    *Takeaway:* "A natural merge sort adapts to the runs an input already has; a plain
    merge sort never looks for them."
11. **Five shapes.** Random input has close to half as many runs as elements; sorted
    input has one; reversed input has as many runs as elements — the worst case for a
    run detector that only looks for ascending stretches.
12. **The worst case, checked, not assumed.** Brute force over every permutation at small
    sizes confirms the formula exactly; at eight keys, merge sort's own worst case is one
    comparison above the floor; at a thousand and twenty-four, about five percent above
    it; the gap grows only linearly, never ballooning as the input grows.
13. **Recap and handoff.** Merge sort guarantees n log n comparisons and keeps equal keys
    in order, and pays for both with a second array. The next topic splits first instead,
    so the two halves never need to be merged at all. Quicksort and partitioning schemes,
    next.

## Why no compiled benchmark

Every outcome here — comparison counts, the worst-case formula, the buffer sizes, the run
counts — is a small, exact, deterministic computation, checked directly in Python; no
timing claim is made anywhere in this topic.

## Changes from the chapter plan

The worst-case formula and the recurrence's own Θ(n log n) bound are verified directly in
`examples.py` (brute force over every permutation for n = 4..8, matching the formula
exactly, and the formula's own values checked against the information-theoretic bound via
`math.lgamma`) rather than against Knuth's own stated page (*TAOCP* vol. 3 §5.2.4), which
stays citation-only per `CHAPTER.md`'s own instruction ("not opened"). This is a stronger
check than a citation would give: the claim is confirmed computationally for every possible
input at those sizes, not read off a single source's stated formula.
