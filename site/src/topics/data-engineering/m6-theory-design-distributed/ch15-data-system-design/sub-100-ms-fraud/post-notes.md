<section data-section="outcomes">

## Outcomes

The shop gets a fraud-scoring pipeline with a latency-budget table built at p99 across every
hop, each with a measured basis; an estimate of event rate and streaming-feature state size that
decides where that state lives; three alternatives for the online store; a timeout fallback
recorded as an ADR with its own error costs; and a score-time feature-logging and replay plan
for retraining on labels that arrive weeks late. A per-hop latency-distribution simulation shows
why the chain's own p99 sits below the sum of the hops' own p99s, and the next bottleneck at ten
times the payment rate is named as the feature-state size and the online store's own load, not
the timeout itself.

</section>

<section data-section="internals">

## Internals

None claimed independently here. The stream engine, key-value store, and model-serving internals
(Chapters 5, 7, 9) are each referenced, not re-taught. The feature platform's own offline/online
parity and point-in-time joins (topic 23) and the exactly-once machinery (Chapter 14) are named
as built on, not re-derived here. Model training and fraud-detection modelling itself are named
as outside this course's scope.

</section>

<section data-section="lab">

## Lab

None of its own as a separate syllabus lab leg. The per-hop latency-distribution simulation (the
chain's p99 versus the sum of per-hop p99s), the feature-state size estimate, and the fallback
cost comparison are this topic's executable evidence. `examples.py`'s own lab:
`chain_p99_from_samples()` and `sum_of_hop_p99s()` compare the chain's real tail against the
naive bound; `feature_state_size_bytes()` sizes the per-card state by window length;
`fallback_cost()` prices the approve-versus-decline fallback choice.

</section>

<section data-section="production">

## Production failures this topic warns about

**An average that hides the real deadline.** A latency budget built from average hop times looks
comfortable right up until the tail arrives, and the tail is exactly when the fallback — and the
fraud it lets through — actually matters.

**A fallback nobody decided on purpose.** Defaulting a timeout's fallback to whichever branch was
easiest to code concentrates a real, priced cost (fraud loss or lost legitimate business) in a
place no one chose deliberately.

</section>

<section data-section="frontier">

## Frontier

None claimed. Latency-budget tables at p99, timeout fallbacks recorded as business decisions,
and score-time feature logging are each established practice, not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The fraud pipeline logged the features it scored with, because the model must later be trained
on what it actually saw. That is one face of a larger problem: the features used to train a
model and the features used to serve it must agree, down to the timestamp. The next design is
the feature platform with point-in-time correctness.

</section>
