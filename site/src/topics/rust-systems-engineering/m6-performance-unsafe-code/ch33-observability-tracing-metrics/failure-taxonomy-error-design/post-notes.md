---
title: "Failure taxonomy and error design"
---

## Outcomes

- Measure that a real, typed error, matched directly on its own variant, correctly retries a real timeout and correctly skips a real remote error.
- Measure that the identical pair of real errors, read only as text, shares a substring any plausible check would key on, and genuinely cannot tell the two failure kinds apart.
- Measure a real, direct disagreement: on the real remote error, the typed decision correctly says skip while the untyped decision incorrectly says retry.
- State, from `thiserror`'s and `anyhow`'s own documentation, the real distinction between a library's own typed errors and a binary's own contextual errors.

## Internals

The syllabus names four further real failure kinds beyond this topic's own timeout and remote error: cancellation (the caller gave up, not the operation; never worth retrying), protocol violation (the peer sent something the protocol forbids; a bug to alert on, not retry), local resource exhaustion (this process is out of some real resource; retrying immediately only makes it worse), and invariant failure (a real, internal assumption broke; the correct real response is usually to stop, not retry). Each is a genuinely different real reason to fail, and each drives its own real retry and alerting decision the identical way this topic's own two chosen kinds do: by matching on a typed variant, not by reading a message. `anyhow`'s own real, contextual error style is the real companion to `thiserror`'s typed style this topic measures: a binary's own top-level code generally wants one dynamic error type it can attach context to and propagate upward, where a library's own typed errors are what a caller one level down actually matches on.

## In production

A real retry loop in a production system is exactly this topic's own `should_retry_typed` function, scaled up to every failure kind a real client library can produce, usually paired with a real backoff policy (so a retried timeout waits longer each time) and real alerting rules that fire on the failure kinds that should never be retried at all, like a protocol violation or an invariant failure.

## The frontier

`panic!` is the real, further choice this topic's own crate deliberately avoids: an unrecoverable abort, appropriate only when a real invariant has broken so badly that continuing is unsafe, versus `Result`, a real, typed value the caller decides how to handle. Every failure this topic measures is the kind a well-designed system expects and recovers from, which is exactly why it is modeled as a `Result` and a typed error rather than a panic.

## Where this goes next

A span, a structured field, a metric, and a typed error are the real, separate tools a running system is diagnosed with; the next milestone turns to building whole, real systems end to end, where all of this chapter's own tools, and everything before it, are judged together by how the system actually fails.
