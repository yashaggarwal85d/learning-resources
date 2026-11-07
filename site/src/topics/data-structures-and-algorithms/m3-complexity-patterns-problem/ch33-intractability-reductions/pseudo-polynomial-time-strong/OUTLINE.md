# Storyboard — dsa.pseudo-polynomial-time-strong

**Learning outcomes** (from CHAPTER.md):
1. Explain why knapsack's O(n·W) dynamic program is "pseudo-polynomial" — polynomial in the
   value of the numbers in the input, exponential in the number of bits it takes to write them.
2. Say what weak and strong NP-hardness mean, give an example of each, and say why a strongly
   NP-hard problem has no pseudo-polynomial algorithm unless P equals NP.
3. Read an input's encoding carefully enough to tell whether "polynomial" means polynomial in
   the numbers' values or polynomial in their length.

**Running data** (all computed/asserted in `examples.py`):
- The knapsack O(n·W) dynamic program's cell count for a hundred items as the capacity's bit
  length climbs: about a hundred thousand cells at ten bits, about a hundred million at twenty,
  over a hundred trillion at forty — matching the chapter plan's own figures, computed fresh.
- A timed run of that same dynamic program as the bit length climbs from twelve to seventeen,
  showing the measured time roughly doubling with each bit appended.
- A small, correct knapsack instance checked against brute force across twenty random cases.
- The unary-against-binary encoding-length gap for one concrete capacity: a binary string of a
  few bits against a tally strip a million marks long.
- A three-partition instance whose backtracking solver's call count grows sharply (from a
  handful of calls to several dozen) as more triples are added, with every single number in the
  instance kept small throughout.
- The bin-packing table size for a fixed, small number of bins, growing geometrically with the
  bin capacity but not with the number of bins itself once that count is fixed.

**Engagement arc:** 14 steps, full topic, about 14 min. Two predicts (steps 2 and 8; the first
within the first four). Four takeaways (steps 7, 11, 12, 14; none on step 3, the first
non-predict step after the hook and first predict).

## Per-step storyboard

1. **Opening/hook.** A hundred-item knapsack with its capacity written in bits: the table fills
   in a blink, about a hundred thousand cells. Append ten more bits and it is a hundred million.
   Thirty more, and it passes a hundred trillion — the input itself grew by only thirty bits.
2. **Predict.** Bin packing is also NP-complete and also has numbers in it. Does the same kind
   of table-shrinking trick rescue it too? Options: yes, the same trick works; no, its table
   depends on every bin's load at once; no, it has no table at all; yes, but only for few items.
   (Correct: no, its table depends on every bin's load at once — exponential in the bin count.)
3. **Reveal — knapsack is NP-complete, and has a table anyway.** The decision form of knapsack
   is NP-complete, yet a dynamic program with one row per item and one column per unit of
   capacity answers it in a single pass.
4. **Cells against bits.** The table's size is the item count times the capacity's *value*, not
   the length of the capacity written down: ten bits, a hundred thousand cells; twenty bits, a
   hundred million; forty bits, over a hundred trillion.
5. **Unary against binary.** The same capacity, as a short bit string or as one tally mark per
   unit of value. The table's size tracks the tally strip's length, which is what
   "pseudo-polynomial" means: polynomial in the number, exponential in how compactly it is
   written.
6. **Weak NP-hardness, defined.** Hard only in the compact, binary encoding; a pseudo-polynomial
   algorithm may still exist. Partition is the standard example: shrink its numbers and the hard
   instances vanish.
7. **The dynamic program, timed for real.** Running it as the bit length climbs one bit at a
   time, its measured time roughly doubles with each bit — exactly what a table with that many
   more cells should cost. Takeaway here.
8. **Predict.** Three-partition's hardest instances already keep every number small by design.
   Does that smallness rescue it the way it rescued partition? Options: yes, small numbers make
   it easy; no, it stays hard even with tiny numbers; yes, but only with few triples; it depends
   on the numbers chosen. (Correct: no, it stays hard — there is no compact encoding to blame.)
9. **Reveal — strong NP-hardness, defined.** Stays NP-hard even with every number bounded by a
   polynomial in the input's length — the same as staying hard in unary. Three-partition is the
   standard example.
10. **Three-partition's blow-up, run for real.** A backtracking solver's search tree still fans
    out sharply as more triples are added, with every number in the instance kept small the
    whole time.
11. **The no-escape argument.** If a strongly NP-hard problem had a pseudo-polynomial algorithm,
    bounding its numbers by a polynomial would make that algorithm run in ordinary polynomial
    time — contradicting the problem's own hardness on exactly those bounded instances. Takeaway
    here.
12. **Bin packing, with K bins fixed.** Fix the number of bins and the problem becomes
    pseudo-polynomial in the capacity; fix the bin capacity instead and it becomes polynomial
    outright. The strong hardness lives in the interaction of many bins and many sizes together.
    Takeaway here.
13. **What strong hardness also rules out.** No fully polynomial-time approximation scheme
    either, unless P equals NP; knapsack's own such scheme, built on its weak hardness, is named
    once as a later topic's story.
14. **Recap and handoff.** Knapsack's table shrinks away with its numbers; bin packing's
    hardness does not, because it never lived in the numbers to begin with. Takeaway here.

**Post-notes headings:** outcomes; internals (why the DP's cost is polynomial in the value and
exponential in the bit length, stated as one formula; why the no-escape argument generalizes to
any strongly NP-hard problem, not just bin packing); lab (the knapsack DP timed as the bit
length grows, the three-partition call-count blow-up, and the K-fixed bin-packing table, all
from `examples.py`); production (the practical form of "read the encoding carefully": why a
capacity in dollars-and-cents or a weight in milligrams can turn a fine pseudo-polynomial
algorithm slow); frontier (Garey and Johnson's original strong/weak distinction, named not read;
fine-grained complexity, named once as the next layer beyond classical hardness); next (topic
109, approximation ratios and greedy set cover).

**Bridge:** word for word, Chapter 33 topic 107's handoff, from `registry.ts`: "A reduction
transfers hardness in one direction, and the whole subject is knowing which. But every problem
so far had numbers in it that were harmless: a vertex count, a clause count. Give a problem real
numbers (a capacity, a size, a weight) and a new question appears that this reel could not ask:
the same word 'polynomial' means two different things depending on whether you measure a number
by its value or by how many digits it takes to write. That is why one NP-complete problem,
knapsack, has a dynamic program that looks fast, and another, bin packing, can never have one
unless P equals NP. Pseudo-polynomial time and strong NP-hardness, next."

**Handoff** (word for word, from CHAPTER.md's Chapter 34 note): "Approximation ratios and greedy
set cover, next."

**Concept ledger:** introduces `weak-np-hardness`, `strong-np-hardness`,
`unary-vs-binary-encoding`, `three-partition`. Declares `knapsack-dynamic-program` (Chapter 22
topic 75, "Knapsack and coin change," is not yet live in the registry at build time, so this
topic builds the O(n·W) dynamic program itself in one frame and declares the id, per CHAPTER.md's
explicit fallback instruction). Uses `pseudo-polynomial` (Chapter 1 topic 1: used, not
introduced again — this topic extends it with the hardness side only), `big-o-theta-omega`
(Chapter 1), `complexity-class-np`, `np-hard-np-complete`, `karp-reduction`, `reduction-direction`,
`decision-problem`, `optimization-problem` (all from topic 107).

**Changes from the chapter plan:**
- Chapter 22 topic 75 ("Knapsack and coin change") is not live in the registry as of this
  topic's build, so the O(n·W) dynamic program is built fresh in `examples.py` and the concept id
  `knapsack-dynamic-program` is declared here rather than copied, exactly as CHAPTER.md's
  "Inherits" section anticipated for this case.
- The chapter plan's hook figures (a hundred items, a hundred thousand cells at ten bits, a
  hundred million at twenty, over a hundred trillion at forty) are recomputed fresh in
  `examples.py` rather than copied from the plan's own planning-time arithmetic, and match.
- The syllabus's two clauses ("why knapsack has an O(nW) DP while bin packing has no
  pseudo-polynomial algorithm unless P = NP" and "reading input encodings carefully") are both
  built in full; neither is deferred.
