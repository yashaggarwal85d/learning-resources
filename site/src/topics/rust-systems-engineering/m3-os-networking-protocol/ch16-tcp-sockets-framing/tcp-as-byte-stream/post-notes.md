---
title: "TCP as a byte stream"
---

## Outcomes

- Measure that a single real `write_all()` call on one side of a real loopback TCP connection can take many real `read()` calls to receive on the other side — TCP genuinely delivers an undifferentiated byte stream, not discrete messages.
- Measure that a real `shutdown(Write)` half-close genuinely makes the peer's `read()` observe EOF, while the peer can still write a real reply back over the still-open direction.
- State, from `tcp(7)`'s own documentation, what Nagle's algorithm and delayed ACK each actually do, and why disabling Nagle via `TCP_NODELAY` trades network efficiency for latency on small writes.
- State, from `socket(7)`'s own documentation and RFC 9293, what `SO_LINGER` actually changes about `close()`'s own blocking behavior, and what TIME-WAIT is actually for.

## Internals

The partial-reads example deliberately writes a payload far larger than any default socket buffer, so the measured read count is robust to buffer-size differences across machines rather than depending on a borderline case; the assertion checks only that the read count clears a conservative threshold, not an exact number, since the real count depends on kernel-level buffering this topic's own code does not control. The half-close example deliberately has the server write its reply only after observing EOF from the client, not concurrently with reading — the ordering itself is part of the demonstration, showing that the client's own `shutdown(Write)` call never touched the server's ability to write back.

## In production

Nagle's algorithm and delayed ACK are each individually sensible — batch small writes, batch small acknowledgments — but together, on a connection doing small, latency-sensitive request/response traffic (an RPC protocol, a database wire protocol), they can compound: a small write waits for an ACK that the receiving side is itself delaying, adding real, measurable latency neither side intended. `TCP_NODELAY` is the usual fix for exactly that pattern. `SO_LINGER`'s own effect is specifically on `close()`'s blocking behavior; it is not related to TIME-WAIT at all, even though both involve a connection lingering in some sense after an application has finished with it — this topic's own lesson step keeps those two apart deliberately, since conflating them is a common, surface-level confusion.

## The frontier

Both `TCP_NODELAY`'s own latency effect and `SO_LINGER`'s own `close()`-blocking effect were prototyped directly in this container before this topic settled on quoting them instead of measuring them: a ping-pong benchmark over loopback did not reproduce Nagle/delayed-ACK's compounding effect, because loopback round-trip latency is already far below the delayed-ACK timer the effect depends on; a duplicated-file-descriptor test did not reliably produce a socket with a genuinely non-empty send queue at the moment of the final close. Both claims are quoted directly from their own documentation instead, consistent with this pipeline's established practice of quoting a true but unreproducible claim rather than shipping a number that was never genuinely observed. This topic deliberately stops at the byte-stream contract and its documented tuning knobs; it does not yet say anything about turning that stream back into discrete messages, which is specifically the next topic's own scoped claim.

## Where this goes next

TCP delivers bytes, not messages — turning that stream back into discrete messages again is an explicit choice, and each way of making that choice fails differently if you're not careful.
