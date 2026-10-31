# Outline: Exactly-once as an end-to-end property (`de.exactly-once-as-end`)

Section 14.8. ~15 min. Per CHAPTER.md §13.

## Scope (syllabus clause by clause)

1. **The end-to-end argument (Saltzer, Reed & Clark)** — a function correct only with the
   application's own knowledge cannot be fully delegated to a lower layer; a "reliable" broker can
   only be a performance optimisation, never a substitute for the endpoints' own check.
2. **Delivery is at-least-once at best** — on a fair-loss link, the only way to be sure a message
   arrives is to retry, and a retry after a lost ack delivers it twice; at-most-once is the choice
   not to retry.
3. **"Exactly-once" is an effect — at-least-once plus idempotent writes** — if applying a message
   twice has the same effect as once, duplicate delivery is harmless.
4. **Deterministic replay** — a deterministic computation with replayable inputs can overwrite
   rather than duplicate its output after a failure.
5. **Atomic offset+output commits (Kafka transactions, Flink two-phase-commit sinks, table-format
   commits)** — making "consume, produce, record the offset" atomic so a crash can't leave one
   without the others.
6. **Where the guarantee breaks at external side effects** — an effect that leaves the system
   cannot be rolled back or deduplicated by the pipeline's own transaction.

## Leaves out

Kafka's idempotent producer, transactions, read-committed and the sink recipes in full detail
(Chapter 9 §9.2, built on and named — see the cross-chapter-id gap below); idempotency keys and
CRDTs as designed components (*Rust Systems Engineering* Ch.27-28; the skipped CRDTs and CALM
syllabus topics, named only); the 2PC protocol itself (topic 12, used); the Two Generals problem
(skipped; named once, via Gray's 1978 report).

## Cross-chapter id gap (CHAPTER.md's rule, logged)

CHAPTER.md says this topic "builds on Chapter 9 §9.2 (delivery semantics, the idempotent producer,
Kafka transactions and read-committed, end-to-end exactly-once with external sinks) and Chapter 7
§7.4 (Structured Streaming's exactly-once boundaries): look up their `introduces` ids in
`registry.ts` for `uses`." Grepping `registry.ts`, Chapter 9 (`ch09-streaming-systems-kafka-flink`)
has only two built topics so far (`de.partitioned-log-segments-indexes`,
`de.producer-batching-compression-acks`), both at §9.1, and Chapter 7
(`ch07-spark-distributed-batch-execution`) has no topic at §7.4 at all. Neither chapter has a
topic whose `introduces` covers delivery semantics, the idempotent producer, Kafka transactions,
read-committed, or Structured Streaming's exactly-once boundaries. Per CHAPTER.md's own fallback
("if it is not there, puts it in declared and logs the gap"), this topic does not add a borrowed
id to `uses` for this material at all: the Kafka-transactions and Flink-sink content this topic
needs is sourced and taught directly here (KIP-98, the Flink engineering post), not pulled in by
reference from an unbuilt topic.

## Concept ledger

Introduces: `end-to-end-argument`, `at-least-once-plus-idempotence`, `atomic-offset-output-commit`,
`exactly-once-boundary-external-effects`.
Uses, per CHAPTER.md: `link-models-fair-loss-reliable`, `timing-models-sync-partial-async`,
`two-phase-commit-blocking-in-doubt`, `fencing-token-epoch`, `table-commit-as-cas`,
`kafka-isr-non-majority-quorum`, `resilient-client-patterns` (Chapter 4), `merge-statement` and
`upsert-atomicity` (Chapter 2), `queues-vs-logs` (Chapter 5), `two-phase-commit` (Chapter 5).
Grepping `registry.ts` confirms `link-models-fair-loss-reliable`, `timing-models-sync-partial-async`
(topic 1), `two-phase-commit-blocking-in-doubt` (topic 12), `fencing-token-epoch` (topic 10),
`table-commit-as-cas` and `kafka-isr-non-majority-quorum` (topic 11), `resilient-client-patterns`,
`merge-statement`, `upsert-atomicity` and `two-phase-commit` are all genuinely `introduces`d
already. `queues-vs-logs` is never `introduces`d by any built topic (only ever appears in other
topics' `declared` lists), so it moves to `declared`, per the same ledger-correction rule used in
every topic since topic 5.
Declared: `queues-vs-logs`.

## Reel shape (10 steps)

1. Hook — the payment service times out, retries, the first request had already succeeded; the
   customer is charged twice; the platform calls its pipeline "exactly-once."
2. Predict — does the broker's exactly-once cover this, does the retry need an idempotency key, or
   does only a distributed lock help?
3. Reveal — the end-to-end argument: a function needing the application's own knowledge can't be
   fully delegated to a lower layer.
4. Reveal — delivery is at-least-once at best on a fair-loss link; at-most-once is giving up
   retries, not a third option.
5. Reveal — the shop's duplicated payment, with and without an idempotency key.
6. Reveal — exactly-once as an effect: at-least-once plus an idempotent write. Takeaway.
7. Reveal — atomic offset+output commits: Kafka transactions (KIP-98's own words), Flink's
   two-phase-commit sink, table-format commits as the third route. Takeaway.
8. Reveal — where the guarantee ends: an external side effect the pipeline's own transaction
   can't reach.
9. Recap. Takeaway.
10. Prove it — a second predict step, about what an idempotency key does and does not protect
    against on its own.
