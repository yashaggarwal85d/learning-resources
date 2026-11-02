# OUTLINE: Elementary sorts and sorting networks

A refresher, about 5 minutes. First topic of Chapter 15 and of Milestone 2. No compiled
benchmark needed — every number is a small, exact count asserted in `examples.py`.

## Storyboard

1. **Hook.** Any mainstream standard library's `sort`, before doing anything clever, checks
   whether the range is short, and if so hands it to insertion sort — the algorithm from week
   one, which is quadratic. The slowest algorithm gets the last word in every fast sort.
2. **Predict.** Insertion sort on six given keys: how many comparisons, and how many are
   "wasted" on keys already in order?
3. **Insertion sort.** Shifts larger keys right, drops the next key into the gap; cost is the
   number of keys minus one, plus the number of inversions, with moves equal to inversions
   exactly. Traced on the planning example and on eight sorted/reversed keys.
4. **Selection sort.** Always scans the whole unsorted part for a minimum; always the same
   number of comparisons whatever the input, and at most one swap per position — why it is
   chosen when writes are expensive.
5. **Bubble sort, and instability.** Swaps adjacent out-of-order pairs; more moves than
   insertion sort for the same result. Selection sort's one swap per position can carry an equal
   key past its twin — the instability demonstration on five tagged records.
   *Takeaway (placed here, step 5, not step 3 — the first non-predict step after hook+predict
   has repeatedly squeezed the phone caption in this project's other Chapter 14 topics):*
   "Selection sort can swap two equal keys past each other; insertion sort never does."
6. **Stability and in-place, the four-cell table.** Named once, previewed: a sort can be stable
   and not in place, in place and not stable, or — rarely — both.
7. **Predict.** Why does a fast hybrid sort still bottom out in the slowest algorithm on tiny
   ranges?
8. **The small-sort cutoff, three real libraries.** libstdc++'s `_S_threshold = 16`; Rust's
   `sort13_optimal`/`sort9_optimal` cutoffs at thirteen and nine; no recursion, no function call,
   sequential memory, at most one mispredicted branch per element.
   *Takeaway:* "Below a small size, insertion sort's constant factors beat any asymptotically
   faster algorithm's overhead."
9. **Sorting networks.** A fixed sequence of compare-exchanges that never looks at the data to
   decide what to do next — no branch to mispredict, and the comparisons can run on parallel
   lanes. The four-input network of five compare-exchanges, drawn as wires.
10. **Checked, not assumed.** The network run against all twenty-four permutations and all
    sixteen zero-one inputs in `examples.py` — every one comes out sorted.
    *Takeaway:* "A sorting network's correctness is checked on every input it can see, not
    argued from one example."
11. **The bound, briefly.** The Ω(n log n) bound, quoted from the earlier topic that proved it:
    a sorting network is still a comparison algorithm, just an oblivious one, so the same bound
    applies — and at four inputs, the optimal network's size meets it exactly.
12. **Recap.** The slowest algorithm anchors every fast one; the next topic asks how far from
    the bound a real algorithm built from recursion gets.

## Why no compiled benchmark

Every outcome here is a small, exact count (comparisons, moves, a network's correctness on a
finite set of inputs) that a deterministic model computes and asserts directly — no timing
claim is made anywhere in this topic.

## Changes from the chapter plan

The four-input sorting network drawn in this topic, `(0,1),(2,3),(0,2),(1,3),(1,2)` (from
`CHAPTER.md`'s own planning value), is not the literal network Dobbelaere's page draws for four
inputs (`(0,2),(1,3)`, `(0,1),(2,3)`, `(1,2)`) — both are five-compare-exchange, three-layer
networks, and this topic's own is independently verified by brute force in `examples.py` rather
than copied from the page. See `SOURCES.md`'s Red team for the full note.
