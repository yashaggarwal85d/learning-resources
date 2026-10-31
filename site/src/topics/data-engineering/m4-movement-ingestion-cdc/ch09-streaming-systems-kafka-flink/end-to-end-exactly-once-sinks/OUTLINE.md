# Storyboard: End-to-end exactly-once with external sinks (de.end-to-end-exactly-once-sinks)

10 steps. Covers two-phase-commit sinks (pre-commit/commit split), idempotent-upsert sinks
(deterministic id), atomic offset storage, and the three ways end-to-end exactly-once breaks
(non-deterministic processing, external side effects, transaction timeouts shorter than
checkpoint intervals). No lab leg of its own, per CHAPTER.md.

1. **Hook** — a sink's transaction timeout set shorter than the checkpoint interval silently
   loses every checkpoint's staged write; the toy mismatch model reproduces exactly this.
2. **Setup** — a Kafka transaction only keeps Kafka consistent; a non-Kafka sink needs its own
   mechanism for the same exactly-once effect.
3. **Predict** — a job crashes right after a sink pre-commits a write but before the checkpoint
   that pre-committed it is confirmed complete. Is that write lost, duplicated, or neither?
4. **Reveal** — neither: the staged write is durable, invisible until commit, and recovery just
   finishes committing it — the toy sink's own crash-and-recover run shows zero loss, zero
   duplicates.
5. **Reveal** — the alternative to two-phase commit: an idempotent-upsert sink keyed by a
   deterministic id, where a retried write overwrites the same row instead of appending a new
   one (Flink's own guarantees table: Cassandra reaches exactly-once only for idempotent
   updates).
6. **Reveal** — offsets must be committed atomically with the output (same transaction, or the
   same upsert row) — stored separately, a crash between them reopens topic 9's exact crash
   window at the sink boundary.
7. **Predict** — three things can make this exactly-once effect quietly stop being true. Name
   one.
8. **Reveal** — non-deterministic processing breaks idempotent-upsert's premise (a retry isn't
   actually the same write); an external side effect (an email, a payment call) can't be rolled
   back by any transaction; and a transaction timeout shorter than the checkpoint interval
   silently expires every staged write — directly confirmed from Flink's own Kafka connector
   docs.
9. **Prove it** — the toy run: the 2PC sink surviving a crash with no loss or duplicate, the
   upsert sink collapsing a retry into one row, and the mismatched-timeout model losing every
   checkpoint's write while a correctly configured one survives.
10. **Recap** — two-phase commit, idempotent upsert, atomic offset storage, and the three ways
    the guarantee breaks.

Prerequisites panel (CHAPTER.md): topic 11, and Chapter 8 topic 6 (`checkpoint-output-atomicity`,
`exactly-once-effect-recipe`). Bridge from topic 11's handoff; handoff into topic 13
(deduplication keys and idempotent consumers).
