# Outline: Connection-level backpressure (`rust.connection-level-backpressure`)

Chapter 16, topic 44 (third and last of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Measure that a real server that deliberately stops reading from a real TCP connection genuinely closes its own receive window, and that the remote peer's own `write()` calls genuinely start blocking once that window closes — a real, kernel-enforced backpressure signal, not application logic.
2. Measure that a minimal, real bounded per-connection output buffer enforces its own cap: filling it to exactly the cap succeeds, and the very next push past it is genuinely rejected by policy.
3. Measure that a real per-connection read timeout genuinely fires against a stalled, slow-loris-style peer that never sends anything, closing the connection rather than waiting on it forever.
4. State, from RFC 9293's own documentation, that a TCP implementation may keep its offered receive window closed indefinitely as long as it keeps answering zero-window probes, and from `tcp(7)`'s own documentation, how the receive buffer is shared between the kernel's own TCP window and the application's own buffer.

## Changes from the chapter plan

All three of this topic's own claims are measured directly in this container: none of them need root access, a real device, or hardware the sandbox lacks — unlike several topics earlier in Chapter 15 and this chapter's own first two topics. The slow-loris defense is demonstrated as a single stalled connection hitting a real timeout, not a full multi-connection resource-exhaustion attack and its mitigation at scale, since reproducing an actual exhaustion attack is out of this topic's own scope (the syllabus names the pattern to defend against, not a benchmark of an attack itself).

## Reel steps (storyboard)

1. **"A real server accepts a connection, then deliberately never reads from it again. Keep writing from the other side. Does the writer eventually notice, or does it just keep succeeding forever?"** (predict, hook) — `fig`: a client writing in a loop against a server that never reads. Options: it keeps succeeding forever, since TCP buffers everything in the background / it eventually blocks, once the kernel's own receive window closes (correct) / the connection is silently reset by the kernel after a few seconds.
2. **"Measured: the client wrote several megabytes successfully, then a real write() call genuinely blocked, once the server's own receive window had filled and closed"** — `fig`: the real, executed, measured blocking write. NO takeaway (the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64).
3. **"Build a real per-connection output buffer with an explicit cap of sixteen messages. Fill it to exactly the cap, then push one more. What happens to that one extra message?"** (predict) — `fig`: a real bounded buffer, filled and then overfilled by one. Options: it's queued anyway, since the cap is really just a soft hint / it's genuinely rejected, the queue's length never grows past the cap (correct) / the oldest message in the queue is silently dropped to make room.
4. **"Measured: the buffer filled to exactly its cap, and the very next push was genuinely rejected, its length never grew past the cap"** — `fig`: the real, measured accept/reject counts. Takeaway: "A bounded buffer that's actually bounded rejects the next push outright, rather than quietly growing past its own cap."
5. **"A real client connects, then deliberately sends nothing at all, a stalled, slow-loris-style peer. The server sets a real read timeout. Does the server wait on that connection forever, or does the timeout genuinely fire?"** (predict) — `fig`: a real stalled connection against a real configured read timeout. Options: it waits forever, since no error ever arrives on a connection that's just slow / the timeout genuinely fires, closing the connection on schedule (correct) / the timeout only fires if the client sends partial, malformed data.
6. **"Measured: the real read timeout fired right on schedule, closing the connection to a peer that had sent nothing at all"** — `fig`: the real, measured timeout firing. Takeaway: "A connection that might never send anything needs its own real timeout — waiting on good faith isn't a policy."
7. **"RFC 9293's own documentation makes a specific claim about how long a TCP implementation may keep its own receive window closed. What does it actually say?"** (predict) — `fig`: the RFC's own text on zero-window probing. Options: at most a few seconds, before the kernel forces it back open / indefinitely, as long as it keeps answering the sender's own probes (correct) / only until the application process itself exits.
8. **"The RFC's own words: a TCP implementation may keep its offered receive window closed indefinitely, as long as it keeps answering the sender's own zero-window probes — not reading is a real, sanctioned way to say not yet, for as long as that's true"** — `fig`: the RFC 9293 quote, shown directly. NO takeaway (a connecting step restating the documented finding directly, not a new measured claim).
9. **"Stop reading to say not yet, cap the buffer to say no more than this, and time out to say not forever: that's backpressure as an explicit connection state machine, not something that just happens on its own"** — `fig`: the three measured behaviors side by side. Takeaway: "Backpressure is a choice a connection makes on purpose — pause, drop by policy, or close — never an accident of an unbounded buffer."
10. **Recap** — not reading a real connection genuinely closes its own receive window and blocks the remote sender, exactly as RFC 9293 says a TCP implementation is allowed to do indefinitely; a real bounded output buffer enforces its cap by genuinely rejecting the next push once full; and a real per-connection timeout genuinely fires against a peer that may never send anything at all. Handoff: this chapter was about one raw TCP connection's own byte stream, framing, and backpressure; the next is about composing many such connections' worth of work behind an explicit, composable readiness contract.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 8 (not reading is a real, RFC-sanctioned way to pause a sender indefinitely, not a workaround or a hack).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| a TCP implementation MAY keep its offered receive window closed indefinitely, as long as the receiving peer continues to send acknowledgments in response to zero-window probes | RFC 9293 (quoted) |
| the socket receive buffer space is shared between the application and kernel; TCP maintains part of the buffer as the TCP window, the size of the receive window advertised to the other end | `tcp(7)` (quoted) |
| tokio::time::timeout requires a future to complete before a specified duration has elapsed; otherwise an error is returned and the future is canceled | `tokio::time::timeout` docs (quoted) |
| a server that deliberately stops reading from a real connection causes the remote peer's own write() calls to genuinely block once the receive window closes | `examples/runtime-demo/src/not_reading_closes_the_window.rs` (executed, measured) |
| a bounded per-connection output buffer filled to exactly its own cap accepts every push, and the very next push past the cap is genuinely rejected | `examples/runtime-demo/src/bounded_output_buffer_enforces_its_cap.rs` (executed, measured) |
| a real per-connection read timeout genuinely fires against a stalled peer that sends nothing at all, closing the connection on schedule | `examples/runtime-demo/src/a_stalled_peer_hits_its_real_timeout.rs` (executed, measured) |

## Concept ledger

- `introduces`: `connection-backpressure-state-machine` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `length-prefix-framing-dos-cap`, `zero-copy-frame-extraction`, `bounded-channel-backpressure`, `load-shedding-try-send`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A framing strategy gets you discrete messages back out of a byte stream, but it says nothing about what happens when messages arrive, or need to be sent, faster than the other side can keep up."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter was about one raw TCP connection's own byte stream, framing, and backpressure. The next is about composing many such connections' worth of work behind an explicit, composable readiness contract."
