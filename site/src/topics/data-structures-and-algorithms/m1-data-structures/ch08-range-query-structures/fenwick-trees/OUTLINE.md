# Outline — Fenwick trees (topic 33, dsa.fenwick-trees, full)

## Learning outcomes

- Compute a Fenwick tree's own point-update and prefix-sum-query index sequences by hand, using lowest-set-bit arithmetic, and explain why each is O(log n).
- Derive a range-sum query from two prefix sums, and extend a single Fenwick tree to a range-update/range-query pair using two trees.
- State what a 2D Fenwick tree computes and why its own indexing is the 1D case applied along two dimensions at once.

## Engagement arc (full topic: 3 predicts, ~13 min)

- **Hook** (step 1): every structure in Chapters 3–7 answered "is this key here, and where" — one key, one answer. This chapter asks what's true about a whole range of positions, right now, as individual positions keep changing.
- **Predict 1** (step 3, "UpdatePredict"): how many of 15 array slots does one point update actually touch?
- **Predict 2** (step 5, "QueryPredict"): does the prefix-sum query's own jump count match the update's?
- **Predict 3** (step 8, "TwoDPredict"): does a 2D Fenwick tree need a new mechanism, or the same arithmetic nested?
- **Surprising number**: `examples.py`'s own measured workload cost — 97 naive slot-touches against 47 Fenwick index-jumps, over the identical ten updates and ten queries.
- **Takeaways** (steps 4, 7, 9, 10).
- **Recap** (step 10, "ProveIt").

## 10-step reel storyboard

1. **Opening.** *Title:* "Every structure in Chapters 3 through 7 answered 'is this key here, and where' — one key, one answer. This chapter asks a different question about a changing array: what's true about positions i through j, right now, as individual positions keep getting updated?" *Body:* "Scan the range for an answer and it costs O(n). Cache a running total and rebuild it after an update, and that costs O(n) too." *Visual:* a row of 15 per-minute event-count slots; a cached running-total bar lights up, then an edit to one slot invalidates it end to end.

2. **LowBitReveal.** *Title:* "A Fenwick tree stores, at index i, a partial sum whose own range is set by i's own lowest set bit — one array, no explicit tree, index arithmetic only." *Body:* "Index 11 is 1011 in binary; its lowest set bit is 1. Index 8 is 1000; its lowest set bit is the whole value, 8." *Visual:* several indices (5, 6, 8, 11) drawn in binary, the lowest set bit of each highlighted.

3. **UpdatePredict.** *Title:* "A point update at minute 5 has to fix every Fenwick slot whose own stored range includes minute 5. Over 15 slots, how many slots does one update actually touch?" *Predict options:* (a) "1 — only minute 5's own slot" (b) "3 — one jump per step, walking forward by the lowest set bit", correct (c) "15 — every slot downstream has to shift" (d) "8 — half the array, on average." *Visual:* the 15-slot array with minute 5 highlighted, the four candidate touch-counts shown as options.

4. **UpdateReveal.** *Title:* "The real jump sequence: minute 5 (0101) adds its own lowest set bit to reach 6 (0110), adds again to reach 8 (1000), and stops there once the index runs past the array — three slots touched, not fifteen." *Body:* "Each jump adds the current index's own lowest set bit." *Visual:* the index path 5 → 6 → 8 drawn as three jumps, each labeled with its binary form and the bit that moved.
   *Takeaway (step 4):* "A point update walks forward by its own lowest set bit — three slots touched here, not all fifteen."

5. **QueryPredict.** *Title:* "A prefix-sum query through minute 11 jumps backward the same way, subtracting a lowest set bit each time instead of adding one. How many slots does it visit?" *Predict options:* (a) "3 — the same jump count as the update, by the same arithmetic", correct (b) "11 — one slot per minute up to 11" (c) "1 — the whole prefix is cached in one slot" (d) "4 — one more jump than the update needed." *Visual:* index 11 shown in binary, three faint candidate jump paths sketched beside it.

6. **QueryReveal.** *Title:* "Minute 11 (1011) subtracts its own lowest set bit to reach 10 (1010), subtracts again to reach 8 (1000), and stops — the same three-slot walk, run backward." *Body:* "Add the three visited slots' own stored partial sums together and the running total through minute 11 falls out directly." *Visual:* the index path 11 → 10 → 8 drawn as three jumps, each slot's own partial sum shown being added into the running total.

7. **RangeReveal.** *Title:* "A range sum from minute 5 through minute 11 needs exactly two of these queries — the prefix through 11, minus the prefix through 4 — and the same two-tree trick extends a single Fenwick tree to a range-wide update." *Body:* "Add 10 to every minute from 5 through 11 using two Fenwick trees together, and a later range-sum query still answers correctly without touching each of the seven minutes one at a time." *Visual:* two highlighted prefix bars (through 11, through 4) subtracted into one range-sum bar; a second small diagram showing the two-tree range-add.
   *Takeaway (step 7):* "Any range sum costs exactly two prefix-sum queries; two Fenwick trees together extend that to a range-wide update."

8. **TwoDPredict.** *Title:* "The same lowest-set-bit arithmetic extends along a second dimension. Does a 2D Fenwick tree need a genuinely new mechanism, or the same index jumps run twice?" *Predict options:* (a) "The same index jumps, nested along a second dimension", correct (b) "A fundamentally different structure — the 1D trick doesn't extend" (c) "The same jumps, but only for square grids" (d) "A new structure that no longer needs lowest-set-bit arithmetic at all." *Visual:* a small 4-by-4 grid drawn beside the 1D array, both using the same jump-arrow visual language.

9. **TwoDReveal.** *Title:* "A 2D Fenwick tree updates and queries by jumping in two dimensions at once — the identical lowest-set-bit arithmetic, nested, on a grid measured directly: a 4-by-4 grid's own full prefix sum came out to 73, checked against a brute-force sum of every cell." *Body:* "Named and measured at this small scale — the same mechanism carries to a production-scale grid without changing." *Visual:* the 4-by-4 grid with a nested jump path lit across both axes, arriving at the measured total.
   *Takeaway (step 9):* "A 2D Fenwick tree is the identical index-jump arithmetic, nested along a second dimension — not a new mechanism."

10. **ProveIt.** *Title:* "Prove it." *Body:* "Measured, not assumed: ten point updates and ten prefix-sum queries over this exact 15-slot array cost a naive cached running total 97 slot-touches in total — rebuilding every prefix at and after each updated index — against 47 for the Fenwick tree's own index jumps." *Visual:* two bars, naive 97 against Fenwick 47, built directly from `examples.py`'s own measured counts.
    *Takeaway (step 10):* "Across ten updates and ten queries on the same array, the naive approach touched 97 slots; the Fenwick tree touched 47."

## Narrator's line of thought (one bullet per step)

1. Every earlier chapter answered a one-key question. Here the question is about a whole range, and it keeps changing underneath you — worth framing as a genuinely different problem, not a variation on lookup.
2. The one piece of arithmetic the whole chapter runs on: a position's own lowest set bit decides exactly which range that slot is responsible for.
3. Before the reveal: a learner's first guess is usually "it depends on how far the update has to propagate." Ask what "propagate" even means here before answering.
4. The jump count is the whole point — name it as index arithmetic, not as "walking a tree," since there's no tree object anywhere in memory.
5. Before this reveal: the update walked forward by adding a bit. Ask out loud whether the query should walk the same direction or the opposite one, before showing which.
6. Worth naming directly: this is the same three jumps as the update, run in reverse, because g and h are inverses of the same bit operation.
7. The subtraction is the trick worth dwelling on: two absolute answers, differenced, becomes a relative one — and the same pairing of two trees turns one relative operation (range-add) into another.
8. Before this reveal: resist the pull toward "surely a grid needs something smarter." Ask what actually changes if you just run the 1D loop twice, once per axis.
9. The measured number matters here specifically because a 2D structure is easy to hand-wave — say the real total, 73, and that it was checked against a brute-force sum of all sixteen cells, not assumed.
10. This is the one place every claimed saving gets checked against a real count — name both totals and let the ratio speak for itself.

## Post-notes headings

- **Internals**: the one-based indexing identity (`i & (i+1)` for the owning range, `i | (i+1)` for the next index to touch on an update) as cp-algorithms derives it, and why zero-based and one-based Fenwick layouts are equivalent in cost even though their own bit tricks look different.
- **Lab**: `examples.py`'s own measured workload — ten point updates and ten prefix-sum queries over the identical 15-slot array, naive rebuild cost (97 slot-touches) against the Fenwick tree's own index-jump cost (47), plus the two-Fenwick-tree range-update/range-query extension verified against a brute-force array.
- **Production**: named in passing — a Fenwick tree's own O(log n) bound and O(n) memory make it the standard choice for a running count or sum behind a counter or a histogram bucket that updates often and is queried often, in contrast to a cached prefix-sum array that is cheap to query but expensive to keep current.
- **Frontier**: segment trees as the fully general structure this chapter's own next topic builds, for any associative combine function and any range update, not just a running sum — named as what a Fenwick tree can't do, not taught here.
- **Where this goes next**: this topic's own handoff — what a Fenwick tree can't answer (a range minimum, or a range-wide update without the two-tree extension) is exactly the gap segment trees and lazy propagation exist to close.

## Examples-to-execute list

1. Build a Fenwick tree over the chapter's own running example (15 per-minute event counts), verify every prefix sum against a naive scan of the raw array.
2. Compute and assert the exact lowest-set-bit values the reel shows (`lowbit(5) == 1`, `lowbit(6) == 2`, `lowbit(8) == 8`).
3. Record and assert the real index-jump sequence for a point update at minute 5 (`[5, 6, 8]`) and for a prefix-sum query through minute 11 (`[11, 10, 8]`), and assert the worst-case jump count over 15 slots equals `floor(log2(15)) + 1 == 4`.
4. Derive a range sum (minutes 5 through 11) from two prefix-sum queries and assert it against a direct slice sum of the raw array.
5. Build the range-update/range-query two-Fenwick-tree extension, apply a real range-wide correction, and assert the result against a brute-force corrected array at every index.
6. Build a small 4-by-4 2D Fenwick tree, assert every prefix sum against a brute-force double sum over the grid.
7. Run a fixed workload of ten point updates and ten prefix-sum queries over the same 15-slot array; assert the naive cached-running-total cost (97 slot-touches) against the Fenwick tree's own measured index-jump cost (47).

## Bridge (Chapter 7's own handoff, quoted word for word)

"Tries answered where a string lives, independent of how many strings are stored — a question about a key's own characters. The next chapter asks a different question about position instead: given a long sequence of numbers, how do you answer a running sum, or update a single value, without re-scanning everything each time it's asked? Fenwick trees, next."

## Handoff (this topic's own, quoted word for word from `CHAPTER.md`)

"A Fenwick tree answers one specific aggregate — a running sum — in O(log n) for both a point update and a prefix-sum query, using nothing but one array and lowest-set-bit arithmetic. It can't answer a range minimum, and it can't apply one update to an entire range without extending it. Segment trees, next: the fully general structure, built to answer any associative aggregate over any range, with a range-wide update costing no more than a single point update does here."

## Concept ledger

- **Introduces:** `fenwick-tree`, `lowest-set-bit-indexing`, `prefix-sum-query`.
- **Uses:** none from an earlier chapter as a reused mechanism (the plain array is assumed background, per `CHAPTER.md`, not a reused technique).
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. A Fenwick tree calculates the value of an associative function over a range in O(log n), updates an element in O(log n), and requires O(n) memory → cp-algorithms "Fenwick Tree".
2. The Fenwick tree is also called a Binary Indexed Tree (BIT), first described by Peter M. Fenwick in a 1994 paper → cp-algorithms.
3. The index-owning function g(i) is computed by replacing all trailing 1 bits of i's binary representation with 0 bits; the next index to touch is found by flipping the last unset bit → cp-algorithms.
4. A range sum over [l, r] is found by computing two prefix sums, [0, r] and [0, l-1], and subtracting them → cp-algorithms.
5. A range update [l, r] by x, with point queries, is done with two point updates, add(l, x) and add(r+1, -x) → cp-algorithms.
6. A range update and range query together need two Fenwick trees (B1, B2); the range sum is recovered as `sum(B1, i) * i - sum(B2, i)` → cp-algorithms; independently corroborated (same capability, a suffix-add/prefix-sum framing instead) by USACO Guide "Range Update Range Query": "Binary Indexed Trees can support range increments and range sum queries."
7. A 2D Fenwick tree is built by nesting the same update/query loop along a second dimension → cp-algorithms ("As claimed before, it is very easy to implement Fenwick Tree for multidimensional array."); independently corroborated by USACO Guide "2D Range Queries": "Essentially, we just nest the loops that one would find in a 1D BIT to get N-dimensional BITs."
8. The structure now commonly called a "Fenwick tree" was proposed by Boris Ryabko in 1989, five years before Peter Fenwick's own 1994 paper that gave it its common name → Wikipedia "Fenwick tree".

## Claims not made

- This topic's own naming does not claim Peter Fenwick invented the structure from nothing — Wikipedia's own sourced history (Boris Ryabko, 1989, with a 1992 modification, predating Fenwick's 1994 paper by five years) is recorded in `SOURCES.md` and in claim 8 above, and the post-notes mention it in passing rather than asserting an uncomplicated single-inventor story the reel's narration does not have room to unpack.
- cp-algorithms' own min-query variant of a Fenwick tree (a second, harder-to-build structure needed because `min` has no inverse) is read and understood but not taught: this topic's chapter plan scopes the structure to the sum operation, with segment trees (topic 34) generalizing to an arbitrary associative combine function including min. No claim is made here about a single-tree Fenwick range-minimum query.
- The paper cp-algorithms cites for a harder arbitrary-range-minimum Fenwick variant ("Efficient Range Minimum Queries using Binary Indexed Trees") is named by cp-algorithms but was not independently fetched or verified by this topic, since it is explicitly out of this topic's own scope; no claim from it appears anywhere in this topic's files.
- `examples.py`'s own workload comparison (97 naive slot-touches vs. 47 Fenwick index-jumps, on a fixed sequence of 10 updates and 10 queries over 15 slots) is this topic's own measured result on its own chosen workload, not a number taken from any source — no source gives a numeric update/query-count comparison on this topic's own running example, so the ratio is reported as measured, not sourced.

## Progress

Research, content plan and storyboard complete. Next: fact-check (section 5), coverage map (section 6), remaining topic files (section 7).
