# Fact-check: End-to-end exactly-once with external sinks (de.end-to-end-exactly-once-sinks)

## Claims table

| Claim | Status | Source |
|---|---|---|
| `TwoPhaseCommitSinkFunction` implements exactly-once by a two-phase-commit algorithm on top of checkpointing | Confirmed | Flink 1.20 API docs |
| Pre-commit stages a write durably but reversibly; commit (only called after checkpoint-complete) finalizes it | Confirmed | Flink 1.20 API docs |
| A failed commit restarts the Flink application and retries `recoverAndCommit` for the same transaction | Confirmed | Flink 1.20 API docs |
| End-to-end exactly-once record delivery requires the sink to take part in checkpointing | Confirmed | Flink connector guarantees docs |
| A sink reaching exactly-once via idempotent updates (not two-phase commit) is a real, named pattern (Cassandra) | Confirmed | Flink connector guarantees docs |
| The Kafka sink's exactly-once mode commits a transaction on checkpoint, and delays record visibility until then | Confirmed | Flink Kafka connector docs |
| A transaction timeout shorter than the checkpoint-plus-restart duration causes Kafka to expire and abort the transaction, losing the staged write | Confirmed | Flink Kafka connector docs |

## Red-team

**Predict step 3 (crash between pre-commit and checkpoint-complete)** — the tempting wrong
answer is "the write is lost" or "the write is duplicated." Flink's own docs are explicit that
pre-commit must leave the transaction committable even after a restart, and `recoverAndCommit`
exists specifically to finish an interrupted commit — the toy `TwoPhaseCommitSink.crash_before_
checkpoint_complete` / `recover_and_commit` pair models this directly: the write survives,
exactly once, neither lost nor duplicated.

**Predict step 7 (three ways it breaks)** — the three failure modes are independent of each
other and each has a distinct root cause: non-determinism is a processing-logic problem,
external side effects are a scope problem (no transaction can reach outside the system that can
roll back), and the transaction-timeout mismatch is a pure configuration problem — confirmed as
exactly that in Flink's own `ProducerFencedException` troubleshooting section, not folklore.

**Toy measurements (`examples.py`)** — `TwoPhaseCommitSink`, `IdempotentUpsertSink`, and
`TransactionTimeoutMismatch` are simplified standalone models of the mechanisms described in
Flink's docs, not a port of Flink's actual checkpointing or Kafka transaction code (no real
Flink job runs here). The mismatch model's `every_nth_checkpoint_silently_lost` is a direct,
simplified restatement of the documented rule (transaction timeout must exceed checkpoint
duration plus restart duration), not an independent derivation.

## Corrections

None. All claims trace directly to Flink's own API docs, connector-guarantees docs, or Kafka
connector docs (the `ProducerFencedException` section), all first-party sources — no secondary
or disclosed-substitute sourcing was needed for this topic, unlike several earlier chapter 9
topics.
