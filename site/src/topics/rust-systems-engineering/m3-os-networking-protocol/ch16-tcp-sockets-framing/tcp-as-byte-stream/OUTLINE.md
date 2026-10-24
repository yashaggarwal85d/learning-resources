# Outline: TCP as a byte stream (`rust.tcp-as-byte-stream`)

Chapter 16, topic 42 (first of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Measure that a single real `write_all()` call on one side of a real loopback TCP connection can take many real `read()` calls to receive on the other side — TCP genuinely delivers an undifferentiated byte stream, not discrete messages.
2. Measure that a real `shutdown(Write)` half-close genuinely makes the peer's `read()` observe EOF, while the peer can still write a real reply back over the still-open direction — a half-close is a different, real operation from an abrupt RST.
3. State, from `tcp(7)`'s own documentation, what Nagle's algorithm and delayed ACK each actually do, and why disabling Nagle via `TCP_NODELAY` trades network efficiency for latency on small writes.
4. State, from `socket(7)`'s own documentation and RFC 9293, what `SO_LINGER` actually changes about `close()`'s own blocking behavior, and what TIME-WAIT is actually for.

## Changes from the chapter plan

Measuring `TCP_NODELAY`'s own latency effect directly needs a workload where Nagle's batching and delayed ACK's own batching genuinely compound — in practice, pipelined small writes racing an unacknowledged previous segment — and a prototype ping-pong benchmark over this container's own loopback interface did not reproduce a measurable, repeatable difference (loopback round-trip latency is already far below the delayed-ACK timer this effect depends on). `TCP_NODELAY`/Nagle and delayed ACK are therefore quoted directly from `tcp(7)`'s own documentation rather than measured. `SO_LINGER`'s own effect on `close()`'s blocking behavior needs a socket with a genuinely non-empty send queue at the moment of the final `close()` of the underlying fd, which a prototype using a duplicated file descriptor did not reliably produce in this container; it is quoted from `socket(7)` directly. TIME-WAIT's own multi-minute real kernel timeout is not reproducible inside a single `examples.py` run regardless of container; it is quoted from RFC 9293 directly. The byte-stream-partial-I/O claim and the half-close claim are both measured directly, not quoted.

## Reel steps (storyboard)

1. **"Write one real 4 MiB payload to a real TCP connection in a single write_all() call. On the other end, read it back with a 64 KiB buffer. How many real read() calls does that actually take?"** (predict, hook) — `fig`: one real `write_all()`, traced by counting real `read()` calls on the receiving side. Options: exactly one, since TCP delivers whatever was sent as one unit / many, since TCP delivers an undifferentiated stream, not discrete messages (correct) / it depends only on the network's own latency, not the buffer size.
2. **"Measured: writing 4 MiB in one real call took dozens of real read() calls to receive, through a 64 KiB read buffer — confirmed directly, not assumed"** — `fig`: the real, executed, measured read count. NO takeaway (the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64).
3. **"Write a message, then call the real shutdown(Write) half-close on just one side of a real connection. Does the other side's read() see an error, or something else — and can that side still reply?"** (predict) — `fig`: a real half-close, traced on both the reading and the still-writable side. Options: the other side's read() returns an error / the other side's read() sees EOF, and can still write a real reply back (correct) / the connection is fully closed in both directions immediately.
4. **"Measured: the server's own read() genuinely saw EOF once the client half-closed, and the server could still write a real reply back, which the client genuinely received"** — `fig`: the real, executed, measured half-close sequence. Takeaway: "Half-closing one direction with shutdown(Write) genuinely leaves the other direction open — it's not the same as closing the connection."
5. **"tcp(7)'s own documentation describes what TCP_NODELAY actually disables. What does it say happens to small writes when Nagle's algorithm is left on?"** (predict) — `fig`: the documentation's own description of Nagle's batching. Options: small writes are sent immediately regardless / small writes are buffered until there's enough to send, to avoid flooding the network with tiny packets (correct) / small writes are silently dropped if too small.
6. **"The documentation's own words: with Nagle left on, data is buffered until there's a sufficient amount to send out, specifically to avoid the frequent sending of small packets — and TCP_NODELAY is what turns that batching off"** — `fig`: the `tcp(7)` quote, shown directly. NO takeaway (a connecting step restating the documented finding directly, not a new measured claim).
7. **"socket(7)'s own documentation describes what SO_LINGER actually changes. Does enabling it make close() behave the same as leaving it off, just with a timer attached, or something genuinely different?"** (predict) — `fig`: the documentation's own description of `SO_LINGER`'s effect on `close()`. Options: the same either way, just with an extra timer running in the background / genuinely different — close() itself blocks until the queued data is sent or the timer expires (correct) / SO_LINGER only affects accept(), never close().
8. **"The documentation's own words: with SO_LINGER enabled, close() won't return until all queued messages have been sent or the linger timeout is reached — without it, close() returns immediately and the closing happens in the background"** — `fig`: the `socket(7)` quote, alongside RFC 9293's own definition of what TIME-WAIT is actually for (letting enough time pass to be sure the peer got the termination acknowledgment, and to avoid new connections being confused by a previous connection's own late, stray segments). Takeaway: "SO_LINGER changes whether close() itself waits; TIME-WAIT is the kernel's own wait, afterward, for a different reason entirely."
9. **"Partial reads, a half-close that leaves one direction open, Nagle's own batching, and SO_LINGER's own blocking are all the same kind of surprise: a byte stream genuinely has none of a message's own boundaries"** — `fig`: the four behaviors side by side. Takeaway: "TCP promises an ordered stream of bytes — it was never going to hand back your own write boundaries, too."
10. **Recap** — writing 4 MiB in one real call took dozens of real reads to receive, because TCP delivers an undifferentiated byte stream; a real half-close genuinely leaves one direction open while closing the other; Nagle's own documented batching is what `TCP_NODELAY` turns off; and `SO_LINGER` changes whether `close()` itself waits, which is a different thing entirely from TIME-WAIT's own kernel-held wait afterward. Handoff: TCP delivers bytes, not messages — turning that stream back into discrete messages again is an explicit choice, and each way of making that choice fails differently if you're not careful.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 2 (a single write of several megabytes genuinely takes dozens of separate real read calls to receive, not one).
- Takeaways: steps 4, 8, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 6 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| Applications may perform writes at the granularity of messages, but TCP guarantees no correlation between the boundaries of segments sent/received and the boundaries of the read or write buffers of user application data | RFC 9293 (quoted) |
| TIME-WAIT represents waiting for enough time to pass to be sure the remote TCP peer received the acknowledgment of its connection termination request, and to avoid new connections being impacted by delayed segments from previous connections | RFC 9293 (quoted) |
| TCP_NODELAY disables the Nagle algorithm; without it, data is buffered until there's a sufficient amount to send out, to avoid the frequent sending of small packets | `tcp(7)` (quoted) |
| in quickack mode, acks are sent immediately, rather than delayed as they are in normal TCP operation | `tcp(7)` (quoted) |
| with SO_LINGER enabled, close() or shutdown() won't return until all queued messages have been sent or the linger timeout is reached; otherwise close() returns immediately and the closing happens in the background | `socket(7)` (quoted) |
| if how is SHUT_WR, further transmissions will be disallowed | `shutdown(2)` (quoted) |
| a single real write_all() call of several megabytes genuinely takes dozens of real read() calls, through a 64 KiB read buffer, to receive in full | `examples/runtime-demo/src/partial_reads_on_a_real_tcp_stream.rs` (executed, measured) |
| a real shutdown(Write) half-close genuinely makes the peer's read() observe EOF, while the peer can still write a real reply back over the still-open direction | `examples/runtime-demo/src/half_close_lets_the_peer_still_reply.rs` (executed, measured) |

## Concept ledger

- `introduces`: `tcp-byte-stream-partial-io`, `nagle-delayed-ack-half-close` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `fd-as-kernel-handle`, `io-safety-ownership-types`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter was about a process getting its own data durably onto its own disk. The next one is about getting bytes reliably to another process entirely, over a connection that offers none of a filesystem's guarantees." *(Chapter 15's own handoff, which this topic opens the chapter by answering directly.)*
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "TCP delivers bytes, not messages — turning that stream back into discrete messages again is an explicit choice, and each way of making that choice fails differently if you're not careful."
