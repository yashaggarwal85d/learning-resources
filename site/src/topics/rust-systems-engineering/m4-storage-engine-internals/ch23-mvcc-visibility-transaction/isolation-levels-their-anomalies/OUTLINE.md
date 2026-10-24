# Outline: Isolation levels and their anomalies (`rust.isolation-levels-their-anomalies`)

Chapter 23, topic 60 (second of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real write-skew history: two on-call doctors, a shared invariant ("at least one is on call"), and two concurrent transactions that each individually preserve it but together violate it.
2. Measure that a real snapshot-isolation commit rule (conflict only on same-key writes) genuinely lets both transactions through, with the shared invariant genuinely ending up violated.
3. Measure that a real, stricter check implementing Adya's own dependency-graph formalism genuinely detects the identical history as unsafe, by finding the "dangerous structure" of two opposing rw-antidependency edges.
4. Measure that the same stricter check is not simply always true: two transactions over entirely independent keys genuinely pass it.
5. State, from PostgreSQL's own documentation, the real definition of a serialization anomaly and the real example (two sums, two classes) PostgreSQL's own docs use to show Serializable rejecting what Repeatable Read would allow.

## Changes from the chapter plan

None. All claims are measured directly against a real, deterministic write-skew history and a real dependency-graph check built from plain Rust data structures; nothing here needs root access, real file I/O, or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Two on-call doctors, both currently on call. Each one separately checks: is at least one other doctor on call? Each gets yes, and each goes off call. Does the shared rule — at least one doctor on call — survive?"** (predict, hook) — `fig`: two doctors, both on call, both about to check and leave. Options: yes, since each check genuinely passed / no, it genuinely breaks, even though neither check was wrong (correct) / it depends on which one commits first.
2. **"Measured: it breaks — with no write-write conflict at all"** — `fig`: the real, measured result, the rule ending up violated. NO takeaway (this is the reel's own "from" step for the phone swipe test; the point — snapshot isolation lets this through because the two writes never touch the same key — is stated directly in the step's own body instead).
3. **"Both transactions wrote different doctors' own rows, never the same one. Does a snapshot-isolation database even notice a conflict here at all?"** (predict) — `fig`: two disjoint writes, one commit rule. Options: yes, any two concurrent transactions conflict / no, genuinely; same-key writes are the only conflict it checks for (correct) / only if they commit at the exact same instant.
4. **"Measured: no conflict, genuinely; snapshot isolation's own commit rule only checks for writes to the identical key"** — `fig`: the real, measured result, no conflict found. Takeaway: "Snapshot isolation genuinely permits write skew through; its own commit rule was never designed to catch it."
5. **"A stricter check instead builds a real dependency graph between the two transactions' own reads and writes. Does that graph genuinely catch what the write-write check missed?"** (predict) — `fig`: the same two transactions, a dependency graph instead. Options: no, it misses the identical thing / yes, genuinely; it finds a dangerous two-edge cycle (correct) / only with a third, unrelated transaction watching.
6. **"Measured: a real, two-edge cycle, genuinely found; each transaction's own read was invalidated by the other's write"** — `fig`: the real, measured cycle, found. Takeaway: "A cycle of two opposing read-write dependencies between the identical pair of transactions is exactly write skew's own signature."
7. **"Run that same stricter check against two entirely unrelated transactions instead, touching different doctors nobody else reads from. Does it still flag them?"** (predict) — `fig`: two independent transactions, the same check. Options: yes, it flags every concurrent pair the same way / no, genuinely; it correctly finds no cycle at all (correct) / only if they happen to commit in the same instant.
8. **"Measured: no cycle, genuinely, for two transactions that never read each other's own writes"** — `fig`: the real, measured result, no cycle found. Takeaway: "The stricter check isn't simply stricter about everything; it correctly lets unrelated transactions straight through."
9. **"PostgreSQL's own documentation states this exact anomaly directly, using two account classes instead of two doctors. What does it call the result of committing a group of transactions in a way no one-at-a-time ordering could produce?"** — `fig`: PostgreSQL's own words on the serialization anomaly, shown directly. NO new predict (continues directly from step seven's own question, to the real system's own name for exactly what this topic's own prototype measured). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — snapshot isolation's own commit rule only checks for same-key writes, so it genuinely lets write skew through even while two transactions each individually preserve a shared invariant; a stricter, dependency-graph check catches exactly that pattern, a cycle of opposing read-write dependencies, while correctly leaving unrelated transactions alone.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (whether the stricter check over-flags unrelated transactions; step 9 continues from it directly, with no new predict, to PostgreSQL's own words naming the serialization anomaly).
- Surprising fact: step 9 (the real system's own documentation naming exactly what this topic's own measured history is).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, being the reel's own "from" step for the phone swipe test, per `QUALITY.md` #64; step 9 deliberately has none too, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| the result of successfully committing a group of transactions is inconsistent with all possible orderings of running those transactions one at a time (the SQL standard's own definition of a serialization anomaly) | PostgreSQL Docs: 13.2. Transaction Isolation (quoted) |
| the Serializable isolation level emulates serial transaction execution for all committed transactions, as if they had been executed one after another rather than concurrently | PostgreSQL Docs: 13.2. Transaction Isolation (quoted) |
| in PostgreSQL's own two-class-sum example, if either transaction were running at Repeatable Read, both would be allowed to commit, but Serializable transactions will allow one to commit and roll the other back, since there is no serial order consistent with the result | PostgreSQL Docs: 13.2. Transaction Isolation (quoted) |
| the Repeatable Read isolation level only sees data committed before the transaction began, and never sees changes committed by concurrent transactions during its own execution | PostgreSQL Docs: 13.2. Transaction Isolation (quoted) |
| a real snapshot-isolation commit rule (same-key write conflicts only) genuinely lets a write-skew history commit, with the shared invariant ending up genuinely violated | `examples/runtime-demo/src/isolation_level_permitted_anomaly.rs` (executed, measured) |
| a real, stricter dependency-graph check genuinely detects the identical history as unsafe, by finding a real two-edge cycle of opposing read-write dependencies | `examples/runtime-demo/src/isolation_level_permitted_anomaly.rs` (executed, measured) |
| the identical stricter check genuinely does not flag two transactions over entirely independent keys | `examples/runtime-demo/src/isolation_level_permitted_anomaly.rs` (executed, measured) |

## Concept ledger

- `introduces`: `isolation-level-permitted-anomaly` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `snapshot-visibility-version-chain` (topic 59)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused: "Visibility decides which single version a reader sees; it says nothing yet about which concurrent histories of reads and writes across several transactions are even allowed to happen at all."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "An isolation level draws the line on which histories are allowed; it says nothing about how long the versions those histories created are allowed to stick around afterward."
