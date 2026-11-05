# Storyboard — dsa.reservoir-sampling

**Learning outcomes** (from CHAPTER.md):
1. Prove by induction that Algorithm R leaves every item in the reservoir with probability
   exactly k/n, and say why any simpler-looking rule fails.
2. Explain how Algorithm L skips items and what it saves (random draws, and reads only where
   reads can be skipped).
3. Sample k items by weight with the Efraimidis–Spirakis keys and say precisely what the
   weights mean.
4. Merge two reservoirs correctly and say what each needs to carry.

**Running data** (all computed/asserted in `examples.py`):
- n = 10, k = 3: each item's inclusion frequency over 100,000 runs is 0.298–0.301 (exact 0.3).
- n = 1,000,000, k = 100: Algorithm R makes 999,900 draws; a seeded Algorithm L run makes
  2,841; Li's bound k(1 + ln(n/k)) is on the order of 1,021.
- Weighted sample: weights (1,1,1,1,10), k = 2 — the heavy item is included 0.934 of the time,
  each light one about 0.266; the naive "weight share" guess (10/14 × 2 = 1.43) is not even a
  probability.
- Merge: n1 = 7, n2 = 3, k = 3 — inclusion frequency 0.299–0.302 for all ten items over
  100,000 runs.

**Engagement arc:** 15 steps, full topic, ~15 min. Three predicts (steps 2, 7, 11 — first
within the first four). Three takeaways (steps 5, 10, 13 — none on steps 4, 9 or 12, each the
step right after a predict's own reveal).

## Per-step storyboard

1. **Opening/hook.** A log of unknown length, memory for a thousand lines, and a sample where
   every line in the whole file has exactly the same chance of being kept.
2. **Predict.** When line n arrives, with what probability should it replace something in the
   sample? Options: one half; a fixed small number; k over n (correct); one over n.
3. **Reveal — Algorithm R.** Keep the first k items. For item i > k, draw j uniformly from
   1…i; if j ≤ k, replace slot j with item i.
4. **Correctness invariant.** By induction on the stream length: after item n, every item seen
   so far is in the reservoir with probability exactly k/n — the (n+1)-th step's survival
   probability (k/n)·(1 − 1/(n+1)) telescopes to k/(n+1). (No takeaway — right after step 3's
   reveal.)
5. **The tempting wrong versions.** "Sample with probability k/n" needs n in advance, which a
   stream never gives up front; "keep the first k" is not uniform; "replace a random slot with
   probability one half" is not either. Takeaway here.
6. **The cost.** O(n) time, O(k) space, one random draw per item after the k-th — 999,900
   draws at a million items and a reservoir of a hundred.
7. **Predict.** Can an algorithm touch fewer than n items and still be exactly uniform?
   Options: no, every item must be examined; yes, by skipping ahead (correct); only if k = 1;
   only with extra memory.
8. **Reveal — Algorithm L.** The number of items skipped before the next replacement follows a
   geometric distribution, so the skip can be drawn directly: three random numbers for every
   item that enters the reservoir, none for the rest.
9. **Measured.** A seeded run at the same scale makes a few thousand draws against Algorithm
   R's hundreds of thousands — Li's own bound, k(1 + log(n/k)), gives the order of growth. (No
   takeaway — right after step 8's reveal.)
10. **What the skip buys.** On a stream read item by item, the saving is random draws only,
    not reads; on an indexed, seekable source it saves the reads too. Takeaway here.
11. **Predict.** A reservoir samples by weight: what does "weight" mean here? Options: the
    probability the item ends up in the final sample; the probability it is picked at each
    draw; both, always the same thing; neither — only rank matters.
12. **Reveal — weighted keys.** Each item draws a key u^(1/w); the sample is the k items with
    the largest keys, held in a min-heap of size k. (No takeaway — right after step 11's
    reveal.)
13. **The subtle point.** Weighted means sampling without replacement with probability
    proportional to weight at each draw, not "included with probability proportional to
    weight" — those differ once k > 1: a weight-ten item among four weight-one items is
    included 0.934 of the time, not 10/14 times 2, which is not even a probability. Takeaway
    here.
14. **Merging and a real system.** Two uniform reservoirs merge by drawing each output slot
    from the larger stream's reservoir with probability proportional to its stream length,
    without replacement — so a reservoir without its stream's count cannot be merged. Apache
    Spark's `RangePartitioner.sketch` carries exactly that count alongside every partition's
    sample; `takeSample` is a different trick entirely (count, compute a fraction, sample,
    retry if too small), not a reservoir at all.
15. **Recap and handoff.** A reservoir answers "give me k items, each equally likely" from a
    stream read once. Handoff to random shuffling: the same one-item-at-a-time proof, over
    arrangements instead of subsets.

**Post-notes headings:** outcomes; internals (why Algorithm L's geometric skip and Algorithm
R's per-item draw give the same marginal k/n; the heap's role in the weighted case); lab
(re-run the merge example at a different n1/n2 split); production (Spark's `SamplingUtils` and
`RangePartitioner`, with the fetched measurements; `takeSample` as the contrast); frontier
(named-only: Data Engineering §5.6's skipped reservoir topic, stratified sampling, sampling
versus sketching, A-ExpJ-style jumps for weighted sampling); next (Chapter 29, topic 97).

**Bridge** (word for word, topic 95's handoff, from `registry.ts`): "Linearity of expectation
turns a messy random count into a sum of probabilities, and it worked even where the pieces
depend on each other. The next question is not a running time but a distribution: you are
handed a stream you can only read once, you do not know how long it is, you can keep k items,
and you must be able to say that every item has the same chance of being among them. Reservoir
sampling, next."

**Handoff** (word for word, from CHAPTER.md): "A reservoir answers 'give me k items, each
equally likely' from a stream you read once. Its cousin does not want some of the items, it
wants all of them, in an order where every ordering is equally likely. The same kind of proof,
one item and one draw at a time, but over arrangements instead of subsets, and with a family
of famous wrong answers shipped in real systems. Random shuffling, next."

**Concept ledger:** introduces `reservoir-sampling`, `algorithm-r`, `algorithm-l-skip`,
`uniform-sample-invariant`, `weighted-reservoir-keys`, `reservoir-merge`. Uses topic 95's
`linearity-of-expectation`, `indicator-variable`, `harmonic-number`; Chapter 6's `binary-heap`;
Chapter 2's `contiguous-storage`; Chapter 1's `expected-vs-average`. Declares nothing new.

**Changes from the chapter plan:** the Efraimidis–Spirakis algorithm is named only as **"A-ES"**
(the name the fetched arXiv companion paper uses), not "A-Res"/"A-ExpJ" as `CHAPTER.md` named
it from the (unread) 2006 paper — the fetched source never uses either of those two names, so
this topic states only the name it can confirm (see `SOURCES.md` §2). The exponential-jumps
variant is named only as "exponential jumps... with algorithm A-ES," with no standalone name
stated, for the same reason.
