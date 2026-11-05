---
id: dsa.reservoir-sampling
title: Reservoir sampling
---

<section data-section="outcomes">

## After this topic you can

- Prove by induction that Algorithm R leaves every item in the reservoir with probability
  exactly k/n, and say why any simpler-looking rule fails.
- Explain how Algorithm L skips items and what it saves (random draws, and reads only where
  reads can be skipped).
- Sample k items by weight with the Efraimidis key construction and say precisely what the
  weights mean.
- Merge two reservoirs correctly and say what each needs to carry.

</section>

<section data-section="internals">

## Into the internals

### Why Algorithm L's skip and Algorithm R's per-item draw give the same marginal probability

Algorithm R asks, for every item, "does it replace something, with probability k/i?" Algorithm
L instead asks, once, "how many items pass before the next replacement?" — a question whose
answer is a geometric random variable with the same per-item success probability k/i (phrased
as a continuously updated W rather than recomputed each time). Both describe the identical
underlying random process; Algorithm L just samples the *waiting time* directly instead of
flipping a biased coin once per item, which is why the two give the same marginal inclusion
probability while making wildly different numbers of random draws.

### The heap's role in the weighted case

The weighted reservoir keeps the k largest keys seen so far using a min-heap of size k: a new
item's key only matters if it beats the heap's current minimum, in which case that minimum is
popped and the new key pushed, each in O(log k). This is the same binary-heap operation
Chapter 6 teaches, used here to keep a running "top k by key" rather than a priority queue of
tasks.

### Algorithm R really is a Fisher–Yates relative

Both algorithms place item i into a uniformly random position among the i positions considered
so far, then never move it again except by a later replacement — the same single-pass,
one-random-choice-per-item shape that `random-shuffling` (topic 97) builds into a full
permutation instead of a fixed-size sample.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs every number in this topic directly: the small exact case's inclusion
frequencies, the million-item comparison between Algorithm R's and Algorithm L's draw counts,
the four-light-one-heavy weighted example (both by simulation and by the invalid-probability
arithmetic check), and the two-reservoir merge. Change the merge's split (say n1 = 2, n2 = 20)
and check that every item's inclusion frequency still lands near k/(n1+n2) — the same check
`FACT-CHECK.md` ran on the 7-against-3 split.

</section>

<section data-section="production">

## In production

**Apache Spark's `SamplingUtils.reservoirSampleAndCount`** implements Algorithm R exactly as
this topic teaches it ("there are k elements in the reservoir, and the l-th element has been
consumed. It should be chosen with probability k/l"), and `RangePartitioner.sketch` uses it per
partition, carrying each partition's item count alongside its sample so that a larger
partition's sample can later be weighted correctly when the partitioner picks range
boundaries — the weight "is 1 over the sampling probability," per the source. Spark's
`takeSample` solves a different problem entirely: it counts the RDD, computes a sampling
fraction that succeeds with high confidence, samples with that fraction, and retries if the
result came back too small. It is not a reservoir sample, and this topic does not call it one.

</section>

<section data-section="frontier">

## The frontier

Data Engineering §5.6 lists "Stream sampling: reservoir and weighted" but marks it *(skipped)*,
so this is the only reel on the subject anywhere in the course; the practitioner's view
(stratified sampling for skewed data, sampling versus sketching as different tools) is named
here only, with no claim promised on that domain's behalf. The Efraimidis–Spirakis algorithm's
exponential-jump variant for weighted sampling is named once, without a standalone name, since
the only fetched source for it (an arXiv companion paper) never gives it one — see
`SOURCES.md` and `FACT-CHECK.md`'s red team for the full reasoning behind not using the
chapter plan's unconfirmed "A-Res"/"A-ExpJ" names. Vitter's 1985 paper and Li's 1994 paper are
named for attribution only and not opened.

</section>

<section data-section="next">

## Where this goes next

A reservoir answers "give me k items, each equally likely" from a stream read once. Random
shuffling asks for every item, in an order where every ordering is equally likely — the same
one-item-at-a-time proof, over arrangements instead of subsets.

</section>
