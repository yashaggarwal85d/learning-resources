# Fact-check: Idempotent producer (de.idempotent-producer)

## Claims table

| Claim | Status | Source |
|---|---|---|
| Every producer is assigned a unique PID on initialization, transparent to the user | Confirmed | KIP-98 |
| Sequence numbers start at zero and increase monotonically, one counter per (PID, partition) | Confirmed | KIP-98 |
| The broker rejects a request whose sequence number isn't exactly one greater than the last committed one for that (PID, partition); a lower number is a duplicate error | Confirmed | KIP-98 |
| A producer epoch ensures only one legitimate active instance per TransactionalId; an epoch bump fences off a zombie instance | Confirmed | KIP-98 |
| Idempotence requires `max.in.flight.requests.per.connection` ≤ 5, `retries` > 0, `acks=all`, and is enabled by default when nothing conflicts | Confirmed, current in 4.4 | Kafka 4.4 producer config reference |

## Red-team

**Predict step 3 (can the broker tell a resend from a fresh batch?)** — the easy wrong answer is
"no, a resend looks identical to a new batch over the wire." KIP-98's own mechanism is the direct
counter-argument: the sequence number travels with the batch specifically so the broker can tell
the two apart without needing any other signal.

**Predict step 5 (does per-producer protection extend across partitions?)** — the tempting wrong
answer assumes "idempotent" means "globally deduplicated for this producer." KIP-98 states the
counter is kept "per topic partition produced to," which the toy model's `TinyBroker` enforces
directly: the same (pid, sequence) pair on two different partitions is two independent, both-valid
writes, not a duplicate.

**Reveal steps 7-8 (epoch fencing and scope)** — this reel deliberately states what idempotence
does NOT cover (two different producers, across partitions, across a restart without an
application-level identity) as explicitly as what it does, per the scope line's own wording ("and
what it does not cover"). This is checked directly in the toy model: a stale-epoch write is
rejected by `fenced_zombie_epoch`, not silently treated as the previous session's continuation.

**Toy measurements (`examples.py`)** — `TinyBroker` is a simplified standalone model of the rule
KIP-98 states (an in-memory last-seen-sequence table, checked per (pid, epoch, partition)), not a
port of Kafka's actual broker code (no real Kafka broker runs in this sandbox). The out-of-sequence
case is included to distinguish "this is a duplicate" (safe to ignore) from "data may have been
lost" (fatal), matching KIP-98's own stated distinction between the two error types.

## Corrections

None needed — every claim traces directly to KIP-98's own design text or the current 4.4 producer
configuration reference, continuing the pattern from topics 5-9: no unconfirmed version or
behavior claim required downgrading.
