# Outline: Bounded channels and backpressure (`rust.bounded-channels-backpressure`)

Chapter 10, topic 33 (first of three). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Measure a bounded `mpsc` channel genuinely applying backpressure: a fast producer sending into a channel of capacity 1 is paced by a slow consumer, not racing ahead of it.
2. Measure a `broadcast` channel's real lagging-receiver behavior: a receiver that falls behind reports exactly how many messages were dropped, then resumes cleanly from the oldest value still retained.
3. Measure a `watch` channel retaining only the most recently sent value: a receiver that checks in late after many sends sees only the last one.
4. Measure `try_send` refusing a full channel immediately, as the real load-shedding hook, distinct from `send`'s backpressure.

## Changes from the chapter plan

None. `CHAPTER.md` §A.3 scopes this topic to building all four of Tokio's channel kinds side by side under real contention, measuring each one's own specific delivery guarantee directly — built exactly that way.

## Reel steps (storyboard)

1. **"A fast producer, a slow consumer, one channel with room for a single message. Does the producer race ahead, or get paced?"** (predict, hook) — `fig`: `mpsc::channel(1)` beside a producer loop and a slow consumer loop. Options: it races ahead, buffering internally / it genuinely waits on the consumer, paced to its speed (correct) / it drops messages the consumer can't keep up with.
2. **"Measured: the producer's own total time tracked the consumer's pace, message for message"** — `fig`: `mpsc_applies_backpressure`'s real, executed output. NO takeaway (this is the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64 — moved to a later step instead).
3. **"A broadcast channel with room for 2 values, and a receiver that never checks in while 5 are sent. What happens to the ones it missed?"** (predict) — `fig`: `broadcast::channel(2)` with 5 sends and no reads in between. Options: they queue up invisibly until the receiver catches up / the oldest ones are overwritten, and the receiver is told exactly how many it missed (correct) / the sends simply fail once the buffer is full.
4. **"Measured: a real Lagged error, naming exactly how many messages were dropped before resuming cleanly"** — `fig`: `broadcast_lagging_receiver_drops`'s real, executed output. Takeaway: "A lagging broadcast receiver isn't silently behind — it's told exactly how many messages it missed, then resumes from what's left."
5. **"A watch channel sends 50 updates in a row before anyone checks in. How many of those 50 does a late receiver actually see?"** (predict) — `fig`: `watch::channel(0)` with 50 rapid sends. Options: all 50, buffered in order / only the very latest one (correct) / only the first one it happened to catch.
6. **"Measured: one receiver, checking in once, saw exactly the latest value — none of the other 49"** — `fig`: `watch_keeps_only_latest`'s real, executed output. Takeaway: "A watch channel is not a queue — it keeps only the most recent value, and that's the whole point of using one."
7. **"The same channel, but now call try_send on it while it's already full. Does it wait a little, or refuse outright?"** (predict) — `fig`: `tx.try_send(2)` on an already-full channel. Options: it waits briefly for room, like send does / it's refused immediately, with no wait at all (correct) / it silently drops the new value and returns success.
8. **"Measured: refused in a fraction of a millisecond — not a wait, a decision"** — `fig`: `try_send_sheds_load_immediately`'s real, executed output. NO takeaway (a naming step restating an already-measured result pattern — test-harness rule, kept consistent with step 2's own instance of it).
9. **"Four channels, four different promises about a message nobody was ready for"** — `fig`: the comparison strip — mpsc waits, broadcast drops the oldest and reports it, watch keeps only the latest, oneshot delivers exactly one reply. Takeaway: "Every channel in this chapter must be bounded — but which of these four promises it keeps is a real design decision, not a detail."
10. **Recap** — a bounded mpsc channel genuinely paces a fast producer; a broadcast channel reports exactly how many messages a lagging receiver missed; a watch channel keeps only the latest value, by design; try_send refuses a full channel outright, the real load-shedding hook. Handoff: a channel can make a producer wait, but the task doing the waiting can also simply be cancelled instead.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 6 (a watch channel genuinely discards 49 of 50 sent values — not a bug, the entire point of the channel).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, the test-harness rule).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| The bounded mpsc variant has a limit on messages it can store; sending into a full channel waits until a message is received | `docs.rs/tokio::sync::mpsc` (quoted) |
| A bounded channel at capacity rejects the send and notifies the task when capacity is available — this is backpressure | `docs.rs/tokio::sync::mpsc` (quoted) |
| A bounded mpsc channel of capacity 1 genuinely paces a fast producer to a slow consumer's speed, measured directly | `examples/runtime-demo/src/mpsc_applies_backpressure.rs` (executed, measured) |
| If a value is sent when a broadcast channel is at capacity, the oldest value currently held is overwritten | `docs.rs/tokio::sync::broadcast` (quoted) |
| A receiver that has not seen an overwritten value gets RecvError::Lagged the next time it receives | `docs.rs/tokio::sync::broadcast` (quoted) |
| Lagged does not close the receiver; its cursor advances to the oldest value still retained | `docs.rs/tokio::sync::broadcast` (quoted) |
| Falling behind a 2-capacity broadcast channel by 5 sends with no reads drops exactly 3 messages, then resumes from the oldest retained value | `examples/runtime-demo/src/broadcast_lagging_receiver_drops.rs` (executed, measured) |
| A watch channel is a multi-producer, multi-consumer channel that only retains the last sent value | `docs.rs/tokio::sync::watch` (quoted) |
| Each watch Receiver independently tracks the last value seen by its caller | `docs.rs/tokio::sync::watch` (quoted) |
| A watch receiver that checks in once after 50 rapid sends sees only the latest value, never the 49 it missed | `examples/runtime-demo/src/watch_keeps_only_latest.rs` (executed, measured) |
| oneshot creates a channel for sending a single value across asynchronous tasks | `docs.rs/tokio::sync::oneshot` (quoted) |
| try_send on an already-full bounded channel is refused immediately, in a fraction of a millisecond, not queued and not waited on | `examples/runtime-demo/src/try_send_sheds_load_immediately.rs` (executed, measured) |

## Concept ledger

- `introduces`: `bounded-channel-backpressure`, `load-shedding-try-send` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `future-laziness-backpressure`, `runtime-operating-rules`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Bound every channel was this chapter's shortest rule and its least explained one. The next chapter is entirely about what that actually means, and what happens at every one of the ways a bounded channel can still go wrong."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A bounded channel can make a producer wait, but the task doing the waiting can also simply be cancelled instead — and that cancellation has exactly one real mechanism, with a sharp edge most code never checks for."
