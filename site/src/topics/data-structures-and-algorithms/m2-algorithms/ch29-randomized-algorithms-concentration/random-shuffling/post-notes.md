---
id: dsa.random-shuffling
title: Random shuffling
---

<section data-section="outcomes">

## After this topic you can

- Prove Fisher–Yates uniform by counting outcomes, and show that any loop with nⁿ equally
  likely choices cannot be.
- Detect a biased shuffle with a chi-squared test and say what its statistic and critical value
  mean.
- Say what Sattolo's algorithm produces, why one changed bound changes it, and where each
  version is needed.
- Choose a method for data too large for memory and state what uniformity each gives up.

</section>

<section data-section="internals">

## Into the internals

### One counting argument, run on four different loops

Every version in this topic is the same loop with a different range for the random draw, and
every version is judged by the same question: how many distinct choice chains does the loop
make, and does that number divide evenly across the orderings it can produce? Fisher–Yates
makes exactly n! chains for n! orderings — one each. The naive swap-with-any-position loop
makes nⁿ chains for the same n! orderings, and nⁿ is never a multiple of n! once n reaches
three, so some orderings are structurally favored. Sattolo's algorithm swaps the range down by
one at each step (strictly below the current position, not at or below it), which collapses the
output from all n! permutations to only the (n − 1)! cyclic ones — the single changed bound in
the outcomes section is this one inequality, nowhere else.

### Why the random-comparator sort is a different kind of wrong

The naive swap and Sattolo's algorithm are both *counted* wrong or right directly. A sort with a
randomized comparator cannot be counted the same way at all, because the bias comes from the
sorting algorithm's own internal comparison pattern, not from a clean choice-chain argument —
which is exactly why Weir's fix was to replace the algorithm with Fisher–Yates rather than to
patch the comparator.

### The buffered shuffle as a reservoir in disguise

The buffer in a streaming shuffle holds exactly the role topic 96's reservoir held: a fixed-size
pool, one random slot sampled and replaced per step. The reservoir's own invariant (every item
seen so far equally likely to be in the pool) does not carry over here, because the buffer's job
is to *emit* items on a schedule, not to hold a final sample — so the honest comparison is not
"is the buffer uniform" but "how far from uniform, and in which direction," which is what the
exact enumeration in `examples.py` answers.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs every number in this topic directly: the exact 27-choice enumeration on
three cards, a sixty-thousand-run chi-squared comparison between Fisher–Yates and the naive
shuffle, the nⁿ-mod-n! divisibility table, Sattolo's cycle-length and fixed-point check against
Fisher–Yates' own fixed-point rate, the 2,080/2,081 factorial crossing against the Mersenne
Twister's period, and the exact buffered-shuffle emission matrices for buffer sizes two and
three on a six-item stream. Re-run the chi-squared test with a different seed and confirm the
statistics move by single digits, not by orders of magnitude — the gap between the two
algorithms is structural, not a seed artifact. Re-run the buffered-shuffle enumeration at
buffer size four and watch the first item's early-slot concentration grow further.

</section>

<section data-section="production">

## In production

**Microsoft's BrowserChoice.eu ballot (2010)** used a JavaScript sort with a comparator that
returned `0.5 - Math.random()`, and Rob Weir's own measured ten-thousand-run table shows
Internet Explorer landing in the last of five positions in just over half of those runs — a real
system shipped to millions of users carrying this exact bug. **Python's documentation** states
outright that a sequence of length 2,080 is the largest whose every permutation fits inside the
Mersenne Twister's period, a hard limit stated by the standard library itself, not a theoretical
curiosity. **TensorFlow's `tf.data.Dataset.shuffle`** and **Hugging Face `datasets`'
`IterableDataset.shuffle()`** both document, in their own words, that a shuffle buffer samples
from and replaces within a fixed window and is only uniform once that window covers the whole
dataset — real, widely used data-loading code that is openly non-uniform by design, for a good
reason (memory), and says so.

</section>

<section data-section="frontier">

## The frontier

MergeShuffle (Bacher, Bodini, Hollender and Lumbroso, arXiv:1508.03167) is named once as the
parallel in-memory algorithm this topic does not build — its abstract claims an
easy-to-implement, in-place algorithm parallelizable across any number of processes, read at
research time, not opened beyond the abstract. The Rao–Sandelius-style distribute-then-shuffle
scheme (Sanders, 1998, citation checked, paper not opened) is named as the option that splits
into buckets before shuffling each in memory, for the case where the dataset is larger than
memory but the bucketing itself can be done quickly. Cryptographic shuffling and secure random
sources are named only in passing: the property a casino or lottery actually needs is an
unpredictable bit source, which this topic's uniform-but-not-secret generators do not provide on
their own.

</section>

<section data-section="next">

## Where this goes next

A permutation answers "every arrangement, equally likely" with one pass and one swap per item.
The next question drops the promise of even one full pass: given a stream you can only look at
once, with memory far below its size, what can be computed about it at all, and what provably
cannot be? The streaming model and its lower bounds, next.

</section>
