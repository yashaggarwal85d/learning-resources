# Fact-check: Kafka transactions and read-committed (de.kafka-transactions-read-committed)

## Claims table

| Claim | Status | Source |
|---|---|---|
| A transaction coordinator is assigned per producer and manages all transaction logic | Confirmed | KIP-98 |
| A dedicated internal topic stores a persistent, replicated record of every transaction's state | Confirmed (mechanism); literal topic name `__transaction_state` not independently confirmed — see Corrections | KIP-98 ("the Transaction Log") |
| The coordinator writes commit/abort control markers to each partition the transaction touched | Confirmed | KIP-98 |
| `transactional.id` gives a producer a stable identity across restarts, and a restart aborts any in-flight transaction from the previous instance | Confirmed | Kafka 4.4 design docs |
| read_uncommitted sees everything including aborted-transaction records; read_committed returns only committed-transaction records | Confirmed | Kafka 4.4 design docs |
| The last stable offset (LSO) is the point past which no open transaction's writes exist; a stuck LSO blocks read_committed consumers | Confirmed | KIP-890 |
| KIP-890's server-side defense bumps the producer epoch per transaction; completed and enabled by default since Kafka 4.0 | Confirmed | Kafka 4.4 operations docs, "Transaction Protocol" |
| KIP-939 lets Kafka participate as one side of an external two-phase commit, via a database-coordinated protocol | Confirmed | KIP-939 |

## Red-team

**Predict step 3 (zombie fencing on restart)** — the tempting wrong answer is "the old instance's
writes just get queued behind the new one." KIP-98 and KIP-890 are explicit that a restart bumps
the epoch and the coordinator actively rejects anything still arriving under the stale one — not a
queueing or ordering effect, an outright rejection, which the toy `TinyCoordinator.write` models
directly (`fenced_zombie`, not a delayed `accepted`).

**Predict step 5 (does a reader see an aborted transaction's records?)** — the easy wrong answer is
"no, Kafka deletes them." The actual mechanism is filtering, not deletion: the records physically
remain in the log (confirmed by the design docs' own wording, "all messages are visible to
consumers" under read_uncommitted), and `read_committed` is a consumer-side visibility rule, not a
broker-side erasure. The toy `TinyLog.read` reflects this by keeping all records in `_records` and
only filtering at read time.

**Reveal step 8 (KIP-890 and KIP-939, named not built)** — per CHAPTER.md's own instruction, KIP-
939's 2PC participation is stated as a design fact (Kafka's transaction coordinator already
implements an internal 2PC; KIP-939 lets an external coordinator take that role) without claiming
any toy implementation of a real two-system 2PC, since no second transactional system runs in this
sandbox.

**Toy measurements (`examples.py`)** — `TinyCoordinator` and `TinyLog` are simplified standalone
models of the fencing and isolation-level rules stated in the sources, not a port of Kafka's actual
broker/coordinator code (no real Kafka broker runs here). `TinyLog.last_stable_offset` is
deliberately the simplest possible version of the real LSO computation (scan for the first
not-yet-decided transaction's offset) — sufficient to demonstrate the filtering behavior under
test, not a claim of matching the real broker's incremental bookkeeping.

## Corrections

KIP-98 names the transaction coordinator's internal state-store topic "the Transaction Log" (by
analogy to the Consumer Offsets topic) but never spells the literal topic identifier
`__transaction_state` that CHAPTER.md's scope line names, and none of this topic's five fetched
sources state that literal string either. Per the established research-correction pattern (topics
3/4): the reel teaches the *mechanism* (a dedicated internal topic storing transaction state) as a
directly confirmed fact, without asserting the specific literal topic name as an on-screen claim;
`coverage.json`'s clause text still quotes the syllabus line verbatim, since the clause check
matches against the syllabus wording, not against what the reel body asserts as fact.
