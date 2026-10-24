# Outline: Cancellation by drop and cancel safety (`rust.cancellation-by-drop-cancel`)

Chapter 10, topic 34 (second of three). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Measure `select!` genuinely dropping its losing branch's future: the loser's own side effect never runs, even long after its own delay would have elapsed.
2. Measure `mpsc::Receiver::recv` being genuinely cancel-safe: cancelling it via `select!` loses no message, and a fresh `recv()` afterward gets exactly what was sent.
3. Measure `read_exact` being genuinely not cancel-safe: cancelling it mid-read loses the bytes it had already consumed, which a fresh read can never recover.
4. Measure dropping a `JoinHandle` detaching its task rather than cancelling it: the task keeps running on the runtime, unobserved, with nothing left to join on.

## Changes from the chapter plan

None. `CHAPTER.md` §A.3 scopes this topic to reusing topic 33's `mpsc` channel for the cancel-safe measurement, contrasting it with a hand-built cancel-unsafe `read_exact` case, and measuring a dropped `JoinHandle`'s detached task via a side channel it still writes to — built exactly that way.

## Reel steps (storyboard)

1. **"select! races two branches and picks whichever finishes first. What happens to the one that loses?"** (predict, hook) — `fig`: `select! { v = fast => v, v = slow => v }`. Options: it keeps running quietly in the background / its future is dropped outright, cancelling it (correct) / it's paused and resumed later if needed.
2. **"Measured: the losing branch's own side effect never ran, even long after its own delay had passed"** — `fig`: `select_drops_losing_branches`'s real, executed output. NO takeaway (this is the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64 — moved to a later step instead).
3. **"Cancel an mpsc recv() mid-wait with select!, then send a message and call recv() again. Does the first message ever go missing?"** (predict) — `fig`: `select! { v = rx.recv() => v, _ = timeout => () }` then a fresh `recv()`. Options: yes, the cancelled recv() can silently consume it / no, nothing is lost — recv() is cancel-safe (correct) / only if the message arrives before the next poll.
4. **"Measured: a fresh recv() after cancellation received exactly the message that was sent, nothing lost"** — `fig`: `recv_is_cancel_safe`'s real, executed output. Takeaway: "mpsc::Receiver::recv is cancel-safe — dropping it mid-wait and starting a fresh one loses nothing."
5. **"Now cancel a read_exact() midway through reading, after it's already consumed part of the stream. What happens to those bytes?"** (predict) — `fig`: `select! { r = reader.read_exact(&mut buf) => r, _ = timeout => () }`. Options: they're buffered internally and returned by the next read / they're gone — a fresh read only gets what arrives after (correct) / read_exact can't be cancelled at all.
6. **"Measured: the first half of the stream, already consumed by the cancelled read, is gone for good"** — `fig`: `read_exact_is_not_cancel_safe`'s real, executed output. Takeaway: "read_exact is not cancel-safe — cancelling it mid-read loses the bytes it already consumed, permanently."
7. **"Drop a JoinHandle without awaiting or aborting it. Does its task stop, or keep going?"** (predict) — `fig`: `drop(handle);` right after `tokio::spawn(...)`. Options: the task is cancelled along with the handle / the task keeps running, completely detached (correct) / the task pauses until a new handle is created.
8. **"Measured: the task kept ticking long after its only handle was dropped — detached, not cancelled"** — `fig`: `dropped_join_handle_detaches_task`'s real, executed output. NO takeaway (a naming step restating an already-measured result pattern — test-harness rule, kept consistent with step 2's own instance of it).
9. **"One real mechanism, two very different outcomes depending on what was cancelled"** — `fig`: the drop-at-await glyph, labelled recv (safe) versus read_exact (unsafe) versus a detached task (not even cancelled). Takeaway: "Cancellation is always a drop at the current .await — whether that loses anything depends on what was paused." (this topic's handle finding: there is no async drop, so a type holding a resource across an .await must plan for being dropped mid-operation.)
10. **Recap** — select! genuinely drops its losing branch's future; recv() is cancel-safe and loses nothing when cancelled; read_exact is not cancel-safe and loses already-consumed bytes; dropping a JoinHandle detaches a task rather than cancelling it. Handoff: backpressure and cancellation are both real, local mechanisms — turning them into a shutdown a whole service can trust means making the sequence explicit.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 6 (read_exact's already-consumed bytes are permanently gone — not buffered anywhere, not recoverable).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, the test-harness rule).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| select! waits on multiple concurrent branches, returning when the first completes, cancelling the remaining branches | `docs.rs/tokio::select!` (quoted) |
| Cancellation safety describes what happens when a future is dropped before it completes | `docs.rs/tokio::select!` (quoted) |
| select! genuinely drops its losing branch's future: the loser's own side effect never runs, even long after its own delay would have elapsed | `examples/runtime-demo/src/select_drops_losing_branches.rs` (executed, measured) |
| tokio::sync::mpsc::Receiver::recv is listed among the methods that are cancellation safe | `docs.rs/tokio::select!` (quoted) |
| recv is cancel safe: if used as a select! branch and another branch completes first, no messages were received on the channel | `docs.rs/tokio::sync::mpsc::Receiver` (quoted) |
| A fresh recv() after a cancelled one receives exactly the message that was sent, with nothing lost | `examples/runtime-demo/src/recv_is_cancel_safe.rs` (executed, measured) |
| tokio::io::AsyncReadExt::read_exact is listed among the methods that are not cancellation safe and can lead to loss of data | `docs.rs/tokio::select!` (quoted) |
| read_exact reads the exact number of bytes required to fill a buffer | `docs.rs/tokio::io::AsyncReadExt` (quoted) |
| Cancelling a read_exact mid-read loses the bytes it had already consumed; a fresh read only recovers what arrives afterward | `examples/runtime-demo/src/read_exact_is_not_cancel_safe.rs` (executed, measured) |
| A JoinHandle detaches the associated task when it is dropped, meaning there is no longer any handle to the task and no way to join on it | `docs.rs/tokio::task::JoinHandle` (quoted) |
| The background task associated with a JoinHandle started running immediately when spawn was called, even before the handle is ever awaited | `docs.rs/tokio::task::JoinHandle` (quoted) |
| A task whose JoinHandle was dropped keeps running and producing real side effects on the runtime, completely detached and unobserved | `examples/runtime-demo/src/dropped_join_handle_detaches_task.rs` (executed, measured) |

## Concept ledger

- `introduces`: `cancellation-by-drop`, `cancel-safety` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `bounded-channel-backpressure`, `waker-contract`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A bounded channel can make a producer wait, but the task doing the waiting can also simply be cancelled instead — and that cancellation has exactly one real mechanism, with a sharp edge most code never checks for."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Backpressure and cancellation are both real, local mechanisms — true of one channel, one future, one task at a time. Turning them into a shutdown a whole service can trust means making the sequence explicit, not assuming every task will notice on its own."
