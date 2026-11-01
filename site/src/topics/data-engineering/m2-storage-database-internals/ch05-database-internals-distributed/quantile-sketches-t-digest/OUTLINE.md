# Outline — de.quantile-sketches-t-digest

## Outcomes (from CHAPTER.md)

Contrast a rank-error guarantee (KLL) against a relative-error guarantee (t-digest, DDSketch);
demonstrate directly why averaging per-partition percentiles is mathematically wrong, with a real
counterexample; merge real quantile sketches across partitions and confirm the result stays a
valid approximation, unlike the naive average; name which real engines and observability tools
use which sketch (e.g. DDSketch in Datadog, t-digest in several warehouse engines' own percentile
functions).

## 9-step storyboard (full, ~15 min, closes Chapter 5)

1. **Hook.** The same partitioned dataset, the same target percentile, and two completely
   different ways of computing it that land on two completely different answers.
2. **Predict: is the average of several partitions' own p99 values a valid estimate of the whole
   dataset's real p99.** (Correct: no — averaging per-partition percentiles is mathematically
   wrong, and this topic measures exactly how wrong against the true value.)
3. **Reveal: a real counterexample proves it, computed in this sandbox.** No takeaway (reel
   test's reference "from" step).
4. **Reveal: a rank-error guarantee bounds a different thing than a relative-error one.** KLL
   bounds how far off a rank can be; t-digest and DDSketch instead bound how far off the actual
   value can be, which matters far more once the tail is heavy. Takeaway.
5. **Reveal: a merged quantile sketch stays a valid approximation; a naive average does not.**
   This topic's own real measurement: the true p99, a naive average of per-partition p99s, and a
   single merged sketch, computed on the same real partitioned dataset. Takeaway.
6. **Reveal: mergeability is a real, designed property, not a coincidence.** Both t-digest's own
   buffer-and-merge construction and DDSketch's own fully-mergeable design are named directly from
   their own papers as deliberate engineering choices. Takeaway.
7. **Reveal: real engines and tools each picked a different one of these sketches.** A real
   warehouse's own t-digest-backed function, and a real observability platform's own DDSketch at
   wide scale, named directly from their own sources. Takeaway.
8. **Recap.**
9. **Prove it.** A dashboard already averages each service instance's own reported p99 latency
   into one number shown to on-call. A teammate asks why that number sometimes looks fine while
   users are actually complaining about slow requests. What is actually wrong with that
   dashboard's own number, and what would fix it?
   (Correct: averaging per-instance p99s is mathematically wrong and can hide a real tail problem
   that a single bad instance has; replacing it with a merged quantile sketch across every
   instance would give the real combined p99 instead.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (rank-error vs relative-error, mergeability by design); Production (the real
counterexample measurement; which real engines and tools use which sketch; the "Prove it" step's
own dashboard failure); Frontier (stream sampling, named sourced-only as a related but distinct
tool for a different trade-off); Where this goes next (Chapter 6: the files these engines and
sketches actually read and write at rest).

## Bridge / handoff

Bridge (answers topic 31's handoff verbatim): "Counting distinct values is one single number a
sketch can approximate. This closing topic is a sketch for an entire distribution at once: a
quantile, with a real demonstration of why averaging per-partition percentiles is simply wrong,
and why a real mergeable sketch fixes it."

Handoff: "This chapter opened at the single physical page an engine reads and writes and closed
at a sketch that approximates an entire distribution in a few kilobytes — the full range between
an engine's own internals and the statistics built on top of it. The next chapter turns to the
files these engines and sketches actually read and write at rest, starting with the oldest and
most trap-ridden of them: plain-text interchange formats like CSV and JSON."

## Concept ledger

Introduces: `quantile-sketches`. Uses: `hyperloglog-distinct-counting` (the closing thread: the
third and last major sketch family this chapter builds, after membership and cardinality).
Declared: none beyond topic 31.

## Claims list (for FACT-CHECK.md)

1. The t-digest paper (Dunning & Ertl): t-digest clusters real-valued samples by mean and count,
   giving particularly high accuracy near the tails of a distribution, and supports a real
   buffer-and-merge construction.
2. The DDSketch paper (Masson, Rim, Lee): a rank-error guarantee can translate into an arbitrarily
   large relative error on heavy-tailed data (with a concrete, quoted worked example); DDSketch is
   the first fully-mergeable, relative-error quantile sketch, and is used by Datadog at wide scale.
3. The KLL sketch paper (Karnin, Lang, Liberty): KLL gives a rank-error guarantee — an additive
   bound on how far off a query's estimated rank can be from its true rank.
4. ClickHouse's own documentation: a real warehouse engine ships a t-digest-backed percentile
   function directly, naming the algorithm and its own performance-vs-precision trade-off.
5. This course's own measurement (`examples.py`): on a real partitioned dataset, a naive average
   of per-partition p99 values diverges measurably from the true p99, while a single merged
   quantile sketch stays close to it.
