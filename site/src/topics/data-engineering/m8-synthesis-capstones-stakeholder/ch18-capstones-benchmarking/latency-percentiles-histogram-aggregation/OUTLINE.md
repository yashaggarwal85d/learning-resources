# Outline — de.latency-percentiles-histogram-aggregation

## Outcomes (from CHAPTER.md)

Show a mean latency staying nearly flat while p99 and p99.9 move sharply under an injected rare
stall; report p50 through max together and say what real question each answers; merge two hosts'
histograms correctly and show the naive average of their percentiles disagreeing with the true
merged value; derive the fan-out tail-amplification probability for a stated shard count and
reproduce it on a simulated fan-out query. Run the chapter lab's core: a closed-loop generator and
a constant-rate generator at the same offered load against the shop's query, with a two-second
stall injected, and show the closed-loop generator's own self-slowdown hides exactly the worst
samples the constant-rate generator reports, then report the corrected (constant-rate) p99 as the
number that should actually be published.

## 9-step storyboard (full, ~18 min)

1. **Hook.** A load test reports a mean latency of forty milliseconds and a shopper still waits
   four full seconds on a bad request, during the same run.
2. **Predict: which five numbers would have shown that gap, and which load-generation choice
   would have caught the four-second request at all.** (Correct: the full percentile ladder shows
   it at p99.9, but only if the load generator paces requests at a constant rate — a closed-loop
   generator would have quietly skipped measuring exactly the slow request.)
3. **Reveal: why means hide tails.** A rare, large stall barely moves the mean while the tail
   percentiles move sharply. No takeaway (reel test's reference step).
4. **Reveal: the percentile ladder, p50 through max.** Five points on the same distribution, each
   answering a different real question. Takeaway.
5. **Reveal: merging histograms instead of averaging percentiles.** Two hosts' percentiles cannot
   be averaged into the fleet's true percentile; HdrHistograms merge instead. Takeaway.
6. **Reveal: fan-out tail amplification.** A hundred-shard fan-out hits at least one shard's own
   tail far more often than any single shard's own rate would suggest, derived from first
   principles. Takeaway.
7. **Reveal: closed-loop vs. constant-rate generators, and the chapter lab's stall.** Both
   generators run at the same offered load against the shop's query; an injected stall exposes the
   closed-loop generator hiding its own worst samples, while the constant-rate generator reports
   them; the corrected p99 is the number to publish. Takeaway.
8. **Recap.**
9. **Prove it.** A fleet of ten hosts each independently reports its own ninety-ninth percentile as
   five milliseconds. Is the fleet's own combined ninety-ninth percentile also five milliseconds?
   (Correct: not necessarily — averaging or assuming equality across hosts' percentiles is exactly
   the error histogram merging exists to avoid; the fleet's true combined percentile has to be read
   off a merged histogram, not assumed from the individual hosts agreeing.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (HdrHistogram's mergeability, wrk2's constant-throughput/coordinated-omission
mechanism, the fan-out derivation); Lab (the closed-loop/constant-rate/stall harness, run for real
against this sandbox's Postgres); Production (the hook's mean-hides-tail scenario, resolved);
Frontier (why averaging percentiles across hosts is a distinct, separate error from the
mean-hides-tail error); Where this goes next (whether the data behind these numbers was realistic
in the first place).

## Bridge / handoff

Bridge (answers topic 1's handoff verbatim): "A warmed-up, steady-state run still has to be
summarized into one number someone reads, and the easiest way to summarize it is also the most
dishonest: a mean. This topic is why that single number hides exactly the tail that matters, and
what to report instead: the full percentile ladder, histograms merged instead of averaged, and the
fan-out math that makes a tail far more common than it looks."

Handoff: "Every number in this topic came from requests generated against the shop's real schema
with a uniform customer id — data far tidier than any real traffic actually is. The next topic
asks what changes once the data looks the way real data looks: a few customers dominating the
traffic, not an even spread."

## Concept ledger

Introduces: `mean-hides-tail-latency`, `percentile-ladder-p50-to-max`,
`histogram-merge-vs-percentile-average`, `fanout-tail-amplification`,
`closed-loop-vs-constant-rate-generator`, `coordinated-omission-effect`.
Uses: `steady-state-detection`, `cold-vs-hot-cache-reporting` (topic 1).
Declared: basic probability (independent events, a product of probabilities). Builds on Chapter
5's §5.6 quantile-sketch material (not yet live) and HdrHistogram's own documented bucket
structure in prose only.

## Claims list (for FACT-CHECK.md)

1. HdrHistogram's own documentation: Histogram objects are additive, so it is common practice to
   use per-thread non-synchronized histograms or recorders, and use a summary/reporting thread to
   perform histogram aggregation math across time and/or threads.
2. wrk2's own documentation (Gil Tene): wrk's model computes latency from the sending of a
   request to the completion of its response, which correctly measures individual requests but
   exhibits a strong Coordinated Omission effect, since each connection only sends its next request
   after receiving a response, so high-latency periods are under-sampled.
3. wrk2's own documentation: wrk2 avoids Coordinated Omission by combining constant-throughput
   load generation with latency measurement taken from the time a request *should* have been sent
   according to the configured constant throughput, not from when it actually was sent.
4. (Tail-at-scale literature) a fan-out request's end-to-end latency is set by its slowest
   sub-request, and the chance that at least one of N independent shards lands in its own tail
   latency rises toward certainty as N grows, even though each shard's own tail event is individually
   rare — derived from first principles (one minus the probability every shard avoids its own tail).
5. (This course) a steady-state query's latency distribution, with a rare injected stall, shows a
   mean that moves only slightly while p99 and p99.9 move sharply — measured directly in
   examples.py.
6. (This course) the chapter lab's core: a closed-loop generator and a constant-rate generator run
   at the same offered load against the shop's query with an injected two-second stall, with the
   closed-loop generator's own self-slowdown measurably hiding the worst samples the constant-rate
   generator reports — measured directly in examples.py.
7. (This course) two simulated hosts' own, separately-computed p99 values, naively averaged,
   disagree with the true p99 of their merged, combined histogram — measured directly in
   examples.py.
