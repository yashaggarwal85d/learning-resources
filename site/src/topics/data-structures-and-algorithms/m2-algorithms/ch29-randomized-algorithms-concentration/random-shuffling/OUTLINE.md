# Storyboard — dsa.random-shuffling

**Learning outcomes** (from CHAPTER.md):
1. Prove Fisher–Yates uniform by counting outcomes, and show that any loop with nⁿ equally
   likely choices cannot be.
2. Detect a biased shuffle with a chi-squared test and say what its statistic and critical
   value mean.
3. Say what Sattolo's algorithm produces, why one changed bound changes it, and where each
   version is needed.
4. Choose a method for data too large for memory and state what uniformity each gives up.

**Running data** (all computed/asserted in `examples.py`):
- Naive swap-with-any-position on three items: 3³ = 27 equally likely choice sequences give
  exact counts (4, 4, 4, 5, 5, 5) across the six permutations, never (4.5, 4.5, …).
- A 60,000-run chi-squared comparison: Fisher–Yates lands near 3 (well under the 5%-critical
  11.07 at five degrees of freedom); the naive shuffle lands over 700.
- nⁿ mod n! is never zero for n = 3, 4, 5, 6 (3, 16, 5, 576), so no assignment of nⁿ equally
  likely choices to n! outcomes can be even.
- Sattolo's algorithm on four items: every run is a single 4-cycle, zero fixed points over
  20,000 runs (Fisher–Yates on the same size averages almost exactly one), and exactly
  (4 − 1)! = 6 distinct cyclic permutations are reachable, never the other 18 of the 24.
- A generator with the Mersenne Twister's period (2^19937 − 1) can reach every permutation of
  at most 2,080 items (2,081! is the first factorial to exceed that period); a deck of 52 needs
  log₂(52!) ≈ 225.6 bits.
- The buffered streaming shuffle on a six-item stream, enumerated exactly (not simulated): an
  item at input position p is never emitted earlier than output position max(0, p − (b − 1)),
  and the first item lands in the first two slots 75% of the time at buffer size 2 (first three
  slots ≈70% of the time at buffer size 3) — concentrated near the front, not flat at 1/6.

**Engagement arc:** 15 steps, full topic, ~15 min. Three predicts (steps 2, 7, 12 — first
within the first four). Three takeaways (steps 5, 9, 14 — none on steps 3, 8 or 13, each the
step right after a predict's own reveal).

## Per-step storyboard

1. **Opening/hook.** The "obvious" shuffle — for each position, swap with a random position —
   looks right and is provably wrong without running it: three cards give 27 equally likely
   choices, and 27 cannot split evenly among six orderings.
2. **Predict.** Out of 60,000 shuffles of three cards with the naive rule, how do the six
   orderings come out? Options: about 10,000 each (uniform); three orderings near 9,000 and
   three near 11,000 (correct shape); every ordering is exactly 10,000; it depends on the seed.
3. **Reveal — Fisher–Yates.** For i from n − 1 down to 1, draw j uniformly from 0…i and swap
   positions i and j. (No takeaway — right after step 2's reveal.)
4. **Correctness by counting.** The algorithm makes n·(n − 1)·…·1 = n! equally likely random
   choices, and distinct choice sequences give distinct permutations, so each of the n!
   permutations has probability exactly 1/n!.
5. **The naive shuffle, counted.** Swap each position with a random position in 0…n − 1: nⁿ
   equally likely choices, and nⁿ is never divisible by n! for n ≥ 3 — so no assignment can be
   uniform, on three items or three million. Takeaway here.
6. **The random-comparator sort.** Sorting with a comparator that returns a random value is not
   a consistent ordering, so the result depends on the sort algorithm's internals: Microsoft's
   2010 browser-choice ballot used exactly this, and a 10,000-run measurement found Internet
   Explorer in the last position about half the time.
7. **Predict.** A pseudo-random generator with 2^b possible internal states — how many of a
   deck's 52! orderings can it ever produce? Options: all of them, given enough time; at most
   2^b, however large n! is; it depends only on the shuffle algorithm, not the generator; half
   of them on average.
8. **Reveal — the seed-size and modulo-bias limits.** A generator cannot reach more outcomes
   than it has internal states; Python's documentation states that 2,080 is the longest
   sequence whose every permutation fits inside the Mersenne Twister's period, and `rand() % n`
   is biased whenever the generator's range is not a multiple of n. (No takeaway — right after
   step 7's reveal.)
9. **Why the deck example bites.** 2,081! is the first factorial above the Mersenne Twister's
   period, and log₂(52!) ≈ 225.6 bits — more than a 32-bit or even a naively-seeded generator
   can cover, so "it looked random in testing" is not evidence of uniformity at this scale.
   Takeaway here.
10. **Sattolo's cyclic variant.** The same loop with j drawn from 0…i − 1, strictly below i,
    produces a uniformly random single cycle of length n: (n − 1)! of the n! permutations, never
    the identity, never any fixed point.
11. **The accidental-bug angle.** Write Sattolo's loop where Fisher–Yates was meant, and the
    result is silently never the identity: zero fixed points over 20,000 runs on four items
    against Fisher–Yates' own expectation of exactly one (topic 95's fixed-point result,
    reused as the test that catches the bug). (No takeaway — right after step 10's reveal.)
12. **Predict.** Data too large to hold in memory for a swap-based shuffle — what is the
    honest option? Options: sort by a random key per record, then merge (correct, one of
    three); there is no way to shuffle it uniformly; always use a small fixed-size buffer; skip
    shuffling and rely on the data's own order.
13. **Reveal — three options for too-large-for-memory.** Assign each record an independent
    random key and external-sort by it (uniform, costs a sort); distribute into buckets
    uniformly at random and shuffle each bucket in memory (uniform if bucket sizes and
    within-bucket shuffles are both random); or hold a buffer of b records and repeatedly emit
    a random buffer element, replacing it with the next input record — a reservoir-style
    argument, and not uniform unless b is at least the whole dataset. (No takeaway — right
    after step 12's reveal.)
14. **The buffered shuffle, measured.** Exhaustively enumerated on a six-item stream: an item
    can only be emitted earlier than its own input position by at most about b − 1 slots, but
    later by any amount with falling probability — so the first item of a long stream lands
    near the front most of the time, and a late item almost never does. Takeaway here.
15. **Recap and handoff.** A permutation of everything, one item and one draw at a time,
    provably uniform by counting — and, when memory runs out, a buffer that trades uniformity
    for a bounded window. Handoff to the streaming model.

**Post-notes headings:** outcomes; internals (why a single changed bound — j strictly below i
instead of at most i — moves the whole output distribution from n! permutations to (n − 1)!
cycles; the counting-argument template applied to all three biased versions at once); lab
(re-run the chi-squared test on a different n, and the buffered-shuffle enumeration at a
different buffer size); production (the Microsoft browser-ballot incident per Weir's own
measured table; the Mersenne Twister's 2,080-item limit; TensorFlow's and Hugging Face's
documented, admittedly-non-uniform shuffle buffers); frontier (named-only: MergeShuffle as the
parallel in-memory algorithm, the Rao–Sandelius distribute-then-shuffle scheme, cryptographic
shuffling); next (Chapter 30, the streaming model and its lower bounds).

**Bridge** (word for word, topic 96's handoff, from `registry.ts`): "A reservoir answers 'give
me k items, each equally likely' from a stream you read once. Its cousin does not want some of
the items, it wants all of them, in an order where every ordering is equally likely. The same
kind of proof, one item and one draw at a time, but over arrangements instead of subsets, and
with a family of famous wrong answers shipped in real systems. Random shuffling, next."

**Handoff** (word for word, from CHAPTER.md): "A shuffle that fits in memory is one swap per
item; one that does not has to settle for a buffer, because the algorithm gets to look at each
item once and can keep only so much. That is no accident of shuffling. It is the situation a
whole family of problems lives in: one pass, memory far below the input, and an answer that
must still be provably close. What can be computed in that model at all, and what cannot, is
the subject of the next chapter. The streaming model and its lower bounds, next."

**Concept ledger:** introduces `fisher-yates-shuffle`, `shuffle-counting-argument`,
`biased-shuffle`, `random-comparator-sort`, `sattolo-cyclic-shuffle`, `chi-squared-test`,
`buffered-streaming-shuffle`, `external-shuffle`. Uses topic 95's `linearity-of-expectation`,
`indicator-variable`, `expected-fixed-points`; topic 96's `reservoir-sampling`,
`uniform-sample-invariant`; Chapter 2's `contiguous-storage`; Chapter 1's `io-model`,
`io-sort-bound`, `pointer-chasing-benchmark`. Declares nothing new.

**Changes from the chapter plan:** none. Every claim stated on screen is backed by a source
quoted in `SOURCES.md` or a value computed and asserted in `examples.py`; the Weir "about half
the time" figure is read directly from the published raw-counts table (5,034 of 10,000), not
restated from the plan's own paraphrase.
