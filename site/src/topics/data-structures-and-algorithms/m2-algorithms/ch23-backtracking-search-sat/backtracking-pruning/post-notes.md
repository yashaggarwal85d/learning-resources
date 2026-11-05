---
id: dsa.backtracking-pruning
title: Backtracking with pruning
---

<section data-section="outcomes">

## After this topic you can

- Write the choose–explore–undo skeleton, and say for subsets, permutations and combinations how
  many leaves its tree has and why.
- Build N-queens with O(1) attack tests, explain why the prune is safe, and count nodes against
  the unpruned enumeration to show the gap.
- Solve a Sudoku by propagation plus search, and explain what propagation removes that a placement
  check cannot.
- Choose a branching variable by minimum remaining values, and explain from a measured
  distribution why a solver's median and worst-case run times can differ sharply.

</section>

<section data-section="internals">

## Into the internals

### Why a prune has to be sound, and what an unsound one costs

A node is pruned only by a check that can never discard a real solution. The N-queens attack test
is sound: a partial placement with two queens sharing a column or diagonal cannot be extended into
any solution, because later queens only add pairs, never remove the one already broken. A rule
that instead refuses a queen for being "too near the edge" is not implied by anything about
attacks, and `examples.py`'s own run shows the cost directly: at n equals eight, that single
unsound rule loses every one of the ninety-two real solutions, not just some of them.

### Why propagation is powerful and still not enough

Norvig's two rules — eliminate a decided square's digit from its peers, assign a digit where a
unit has only one place left for it — run to a fixed point and still leave sixty-one of
sixty-four empty squares uncertain on the chapter's hard grid, with over four times ten to the
thirty-eighth power candidate combinations remaining between them. That number is the whole
argument for why search is still needed on top of propagation: propagation alone decides a lot and
is nowhere near a complete solver.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds the three enumeration trees on a four-element set (sixteen subsets,
twenty-four permutations, six two-combinations), including the multiset case where a repeated
element is skipped at a shared depth to avoid double-counting. It runs the pruned N-queens search,
reproducing the four-billion-to-two-thousand-fifty-seven gap at n equals eight against OEIS A000170
and Wikipedia's own solution counts, the not-smooth first-solution node counts from n equals eight
through twenty-four, and the unsound-prune demonstration that loses every solution. It implements
Norvig's own Sudoku solver (`parse_grid`, `assign`, `eliminate`, `search`) and reproduces his own
sixty-one-uncertain-squares, twenty-five-possibilities and nine-branched-squares figures exactly on
his own hard grid. It then runs a separate, propagation-free plain checker to compare "first empty
square" against "fewest candidates first" ordering on identical terms, reproducing the chapter's
own three-million-placements-unsolved against four-hundred-eighty-one-placements-solved gap
exactly. Finally it runs its own seeded, randomized-value-order heavy-tail experiment on the same
grid (thirty seeds, every one solved, median and worst-case attempt counts reported honestly as a
real but modest spread) alongside Norvig's own quoted, much larger-scale figures.

</section>

<section data-section="production">

## In production

Every serious constraint-satisfaction solver and every production SAT solver is this chapter's
tree, with cleverer pruning and branching layered on top: Norvig's own Sudoku solver is the
chapter's own primary source for exactly that claim, reproduced number for number above.

</section>

<section data-section="frontier">

## The frontier

**Exact cover and Dancing Links**, Knuth's own data structure for backtracking over exact-cover
problems (of which Sudoku is one), changes only how the tree's branching and undo are implemented,
not the tree itself; named only, not built here. **Meet in the middle** halves a search's apparent
depth by meeting two half-searches from opposite ends; named only. **Branch and bound** adds a
numeric bound that prunes a whole subtree whenever its best possible outcome cannot beat the best
one already found; named only. **DPLL and CDCL SAT solvers** are this same backtracking tree
specialized to Boolean satisfiability, with propagation become unit propagation and, in CDCL,
pruning sharpened by learning a new clause from every failure; named only, including its use in
package-resolution and verification tools. **Minimum remaining values** is sometimes called "fail
first" in the constraint-satisfaction literature (Haralick and Elliott, 1980), a name this topic
does not use because that paper was not read to confirm the attribution directly. **Randomised
restarts** are the standard remedy for a heavy-tailed solver's worst runs (Gomes, Selman, Crato and
Kautz, 2000), named only; no sentence of that paper is quoted here, since it could not be retrieved
this session. Bit-vector tracking of the three N-queens attack sets, the same search with its sets
packed into machine words, points at Chapter 25. The lexicographically-smallest and heap-based
enumeration orders belong to Chapter 17's own search topics.

</section>

<section data-section="questions">

## More questions

- Minimum remaining values picks the square most likely to be wrong fast. Is there a square-choice
  rule that could do better than MRV on this specific hard grid, and what would it have to know
  about the grid that MRV does not use?
- The unsound "too near the edge" prune lost every solution at n equals eight. Is there a prune
  that is unsound in general but still finds at least one correct solution on some inputs, and
  what would make it dangerous to ship anyway?

</section>

<section data-section="next">

## Where this goes next

Backtracking never made the problem polynomial. It made the tree small by refusing doomed branches
early, choosing the branch that fails fastest and deducing before guessing, and on a bad day the
tree is still enormous. The next chapter takes the opposite road for a different family of
problems: arrays where the obvious program tries every pair or every subarray, and a single
invariant lets you do it in one linear pass with no tree at all. Two pointers, next.

</section>
