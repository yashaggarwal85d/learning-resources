# Outline: Group commit and commit latency (`rust.group-commit-commit-latency`)

Chapter 20, topic 54 (third and last of three, closes Chapter 20). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real, minimal leader/follower group-commit implementation: the earliest-ready transaction becomes the leader, waits for others to join, and a single flush covers the whole batch.
2. Measure that group commit genuinely uses one flush for a whole batch of transactions, where committing without any grouping costs one flush per transaction.
3. Measure that commit latency, not execution time, is what differs across transactions sharing one batch: the earliest-ready transaction waits the longest for the shared flush, even though every transaction did identical, instant work.
4. Measure that asynchronous commit's own risk window is real: a crash between its acknowledgment and its actual flush genuinely reveals a false promise, where the identical crash against a synchronous commit never does.
5. State, from PostgreSQL's own documentation, what asynchronous commit actually trades away, and how its own leader/follower mechanism for `commit_delay` works.

## Changes from the chapter plan

None. All three of this topic's own claims are measured directly against a real, discrete-tick simulation (no real threads or sleeping, so every measurement is exactly reproducible); nothing here needs root access, real wall-clock timing, or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Five transactions all become ready to commit within a short window. Commit each one separately, with no grouping at all. How many WAL flushes does that cost?"** (predict, hook) — `fig`: five transactions, ready together, no grouping. Options: one flush, since they're all ready at nearly the same time / five flushes, one per transaction (correct) / somewhere in between, depending on exact timing.
2. **"Measured: committing without any grouping genuinely cost one flush per transaction, five separate flushes for five transactions ready within the same short window"** — `fig`: the real, measured count, five flushes. Takeaway: "Without grouping, every transaction pays for its own flush, even when several become ready at almost the same moment."
3. **"Now let the same five transactions commit as one group instead: the earliest-ready one becomes the leader, waits briefly, and a single flush covers everyone ready by then. How many flushes does that cost?"** (predict) — `fig`: the same five transactions, grouped under one leader. Options: still five; grouping only changes the order, not the count / exactly one, for the whole batch (correct) / it depends on how many followers actually join before the leader gives up.
4. **"Measured: group commit genuinely used exactly one flush for the whole batch of five"** — `fig`: the real, measured count, one flush. Takeaway: "Group commit trades a short wait for one flush instead of one per transaction."
5. **"Every transaction in that batch did identical, instant work. Does each one's own commit latency, the time from ready to acknowledged, end up identical too, or does it differ?"** (predict) — `fig`: five transactions, identical execution time, grouped under one leader. Options: identical; their execution time was identical, so their commit latency should be too / it genuinely differs; the earliest-ready one waits the longest for the shared flush (correct) / it differs, but randomly, with no relation to ready order.
6. **"Measured: commit latency genuinely varied across the batch, even though every transaction's own execution time was identical; the earliest-ready one waited the longest"** — `fig`: the real, measured latencies, one per transaction. Takeaway: "Commit latency isn't execution time: inside one batch, it's entirely about how long the shared flush made you wait."
7. **"One transaction commits asynchronously: it's told 'committed' the instant it's ready, before its own flush even happens. Crash in the gap between that acknowledgment and the real flush. Does its update survive?"** (predict) — `fig`: an asynchronous commit, acknowledged early, a crash in the gap. Options: yes, the acknowledgment itself is what matters, not the flush / no, genuinely; the client was told something that wasn't true yet (correct) / only if the gap is shorter than one flush interval.
8. **"Measured: the crash inside that gap genuinely revealed a false promise for the asynchronous commit; the identical crash against a synchronous commit never did"** — `fig`: the real, measured crash, one false promise, one none. Takeaway: "Asynchronous commit's own risk window is real: a crash inside it can reveal a promise that wasn't true yet."
9. **"PostgreSQL's own documentation names exactly this trade-off directly: what does asynchronous commit actually risk, and what doesn't it risk?"** — `fig`: PostgreSQL's own words on asynchronous commit, shown directly. NO new predict (continues directly from step seven's own crash scenario, to the real system's own description of it). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — without grouping, every transaction pays for its own flush; group commit trades a short wait for one flush instead of many. Inside one batch, commit latency is entirely about how long the shared flush made you wait, not about any transaction's own execution time. And asynchronous commit's own risk window is real: acknowledging before the flush can tell a client something that wasn't true yet, which is exactly the trade PostgreSQL's own documentation names directly — data loss, never corruption.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (about asynchronous commit's own risk window; step 9 continues from it directly, with no new predict, to PostgreSQL's own words on the trade-off).
- Surprising fact: step 9 (PostgreSQL's own documentation naming exactly this topic's own measured trade-off).
- Takeaways: steps 2, 4, 6, 8 (four — step 9 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| asynchronous commit allows transactions to complete more quickly, at the cost that the most recent transactions may be lost if the database should crash | PostgreSQL docs (quoted) |
| the risk taken by asynchronous commit is of data loss, not data corruption | PostgreSQL docs (quoted) |
| commit_delay adds a time delay before a WAL flush, improving group commit throughput by letting more transactions join a single flush | PostgreSQL docs (quoted) |
| the first process ready to flush waits for the configured interval, while subsequent processes wait only until the leader completes the flush | PostgreSQL docs (quoted) |
| committing without grouping costs one flush per transaction; group commit costs exactly one flush for the whole batch | `examples/runtime-demo/src/leader_follower_group_commit_latency.rs` (executed, measured) |
| commit latency genuinely varies across a batch even though every transaction's own execution time is identical, with the earliest-ready transaction waiting the longest | `examples/runtime-demo/src/leader_follower_group_commit_latency.rs` (executed, measured) |
| a crash inside asynchronous commit's own risk window genuinely reveals a false promise; the identical crash against a synchronous commit never does | `examples/runtime-demo/src/leader_follower_group_commit_latency.rs` (executed, measured) |

## Concept ledger

- `introduces`: `group-commit-batched-durability` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `write-ahead-lsn-redo-idempotence` (topic 52)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A correct recovery says nothing yet about how expensive making a transaction durable in the first place actually is, or what it costs to make that cheaper."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A durable, recoverable log says nothing yet about how a single record is actually found among billions without scanning every page; that needs a real, crash-safe index structure."
