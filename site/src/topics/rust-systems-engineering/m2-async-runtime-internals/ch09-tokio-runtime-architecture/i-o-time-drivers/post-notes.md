---
title: "I/O and time drivers"
---

## Outcomes

- Build a small, direct `mio` registration and poll loop from scratch, proving the register-interest → park → readiness-event cycle concretely: a real socket connect delivers a real writable readiness event.
- Show the other half of the same cycle directly: a socket registered for readiness that never arrives leaves `poll` parked for close to its full timeout, delivering no event at all.
- Measure `tokio::time::sleep` waking close to its real deadline — the timer driver's own wake cycle, closing the loop Chapter 8 opened.
- Name `io_uring` as a real, currently unstable, opt-in feature, from the crate's own words, rather than the default path.

## Internals

Every topic in this chapter so far has talked about a task being "woken" as an assumed, documented fact of Tokio's scheduler — this is the first topic to show, directly, what actually calls `wake()` and roughly when. `mio::Poll` is the real foundation Tokio's own I/O driver is built on: an event source is registered with a `Token`, and that token is what lets a readiness event be matched back to the exact task that should be woken, rather than "some task, somewhere." The two mio measurements in this topic are deliberately symmetric, because both halves of the guarantee matter equally: one proves the cycle fires correctly when something really does become ready (a real writable event, naming the exact socket), and the other proves it correctly does nothing — parked for the full timeout, no shortcuts — when nothing does. mio's own documentation names a real subtlety this topic takes seriously rather than glossing over: a spurious readiness event can arrive even when the corresponding operation would still block, which is exactly why the docs state that the operation must be retried repeatedly until it returns `WouldBlock`, not merely attempted once. The timer measurement closes a different, related gap: `tokio::time::sleep` waking within a few milliseconds of its real requested deadline is the timer driver doing the same fundamental thing as the I/O driver — turning an external event (in this case, time itself) into a woken task — using the hierarchical timer wheel design common to schedulers that need to fire a large number of deadlines without scanning every one of them on every tick.

## In production

Naming `io_uring` as unstable and opt-in matters because a reader who has encountered it elsewhere — as the fast, modern Linux I/O interface many systems are adopting — needs to know explicitly that Tokio's default I/O path, as of this chapter, is still the mio-based readiness cycle this topic just built, not io_uring. Enabling it requires passing `--cfg tokio_unstable` to rustc and accepting that its public API may break across 1.x releases, a real, documented tradeoff rather than a simple feature flag. The separate `tokio-uring` runtime is a different, more experimental project entirely, worth knowing exists but not something most production services should reach for by default today.

## The frontier

Every mechanism this chapter has built — multiplexing, work stealing, cooperative budgeting, blocking isolation, and now the I/O and time drivers — is a real, working guarantee. Every one of them can also be violated in production: a task that never yields, a channel with no bound, a readiness cycle nobody is actually watching.

## Where this goes next

Every mechanism in this chapter is real, and every one of them can also be violated — a task that never yields, a channel with no bound, a cancellation path nobody defined. The question left is how any of that becomes visible before it becomes an incident.
