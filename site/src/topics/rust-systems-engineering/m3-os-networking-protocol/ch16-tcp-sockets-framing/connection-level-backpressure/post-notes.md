---
title: "Connection-level backpressure"
---

## Outcomes

- Measure that a real server that deliberately stops reading from a real TCP connection genuinely closes its own receive window, and that the remote peer's own `write()` calls genuinely start blocking once that window closes.
- Measure that a minimal, real bounded per-connection output buffer enforces its own cap: filling it to exactly the cap succeeds, and the very next push past it is genuinely rejected by policy.
- Measure that a real per-connection read timeout genuinely fires against a stalled, slow-loris-style peer that never sends anything, closing the connection rather than waiting on it forever.
- State, from RFC 9293's own documentation, that a TCP implementation may keep its offered receive window closed indefinitely as long as it keeps answering zero-window probes.

## Internals

The window-closing example never calls any application-level policy code to stop reading — the server simply never reads at all, so the blocking the client observes is TCP's own flow control enforced entirely by the kernel, not a simulated effect. Detecting that blocking is done by timing each individual `write()` call and flagging one that takes far longer than the others, rather than asserting a fixed total byte count, since the exact number of bytes the kernel buffers before blocking is a kernel- and machine-dependent detail this topic does not claim to pin down. The bounded-buffer example is a minimal, self-contained data structure rather than a full connection handler, because the claim under test — a cap is enforced, not a soft suggestion — is a property of the buffer's own push logic, independent of whatever connection or protocol code would call it in a real server.

## In production

Not reading a connection is a genuinely sanctioned way to pause a sender: RFC 9293 itself says a TCP implementation may keep its own receive window closed indefinitely, as long as it keeps answering the sender's own zero-window probes. That makes "stop reading" a real backpressure policy, not a workaround — a server under load can deliberately slow its own consumption and let TCP's own flow control propagate the pressure back to the sender. A bounded output buffer and a per-connection timeout are the other two parts of the same state machine: bound what you'll queue, and bound how long you'll wait on a peer that might never finish what it started (the slow-loris pattern this topic's timeout example defends against).

## The frontier

All three of this topic's own claims are measured directly in this container, unlike several earlier topics in this chapter and the previous one, because none of them need root access, a real device, or hardware the sandbox lacks — only a real loopback TCP connection and real wall-clock timing. The slow-loris defense shown here is a single stalled connection hitting a real timeout, not a full multi-connection resource-exhaustion attack and its mitigation at scale; reproducing an actual exhaustion attack is out of this topic's own scope, which names the defensive pattern rather than benchmarking the attack itself. This topic closes Chapter 16 deliberately on one connection's own policy, not on a system of many connections composed together — that composition, behind a single readiness contract, is specifically Chapter 18's own subject.

## Where this goes next

This chapter was about one raw TCP connection's own byte stream, framing, and backpressure. The next is about composing many such connections' worth of work behind an explicit, composable readiness contract.
