---
title: "Runtime observability and operating rules"
---

## Outcomes

- Measure a `Semaphore` genuinely bounding concurrency: 20 tasks contending for 4 permits never run more than 4 at once, and the semaphore reports itself fully saturated while the rest wait.
- Measure a real task backlog with Tokio's own runtime metrics: spawning 500 tasks onto a single worker leaves most of them visibly still queued the instant `global_queue_depth` is sampled.
- Measure a bounded channel genuinely refusing a send once full, and genuinely accepting one again the moment capacity is freed by a receive.
- Name `tokio-console` as the real tool that turns these same signals into a live, per-task view in production, and close the chapter with its operating rules as direct consequences of topics 28–31's mechanisms.

## Internals

Every measurement in this topic answers the same question in a different shape: is a stated limit actually enforced, or only conventionally respected? A `Semaphore`'s permits running out to exactly zero while sixteen tasks still wait is not an estimate of concurrency; it's a hard count. `RuntimeMetrics::global_queue_depth` is not a sampled average either — it is the runtime's own live count of tasks it has not yet polled, which is why it can answer an operating question ("is something hogging the worker right now") rather than only a historical one. And a bounded channel's `try_send` returning an immediate error on a full channel is the mechanism that makes "bound every channel" an actual rule rather than a design suggestion: nothing about an unbounded channel would ever refuse a send, so nothing about it would ever force a caller to decide what happens when the system is overloaded. Each measurement in this topic is deliberately two-sided, the same symmetry topic 31 used for mio: proving a limit holds under contention is only half the claim, and proving the limit releases cleanly the moment it isn't needed is what tells a real bound apart from a one-shot failure.

## In production

`tokio-console`'s own documentation describes exactly the three kinds of thing this topic measured directly: tasks, resources, and operations, watched live in a running process rather than reconstructed after the fact from logs. It requires the same `tokio_unstable` opt-in this chapter already named for `io_uring` in the previous topic — as of 2026, the richest observability tooling in this ecosystem still sits behind an explicit flag, not on by default. Tokio's runtime metrics, by contrast, have been stabilizing since release 1.38 and are available without any unstable flag at all, which is why this topic's own measurements could use them directly.

## The frontier

This chapter's four operating rules each map to exactly one proven mechanism: keep tasks small enough to yield is topic 29's cooperative budgeting; bound concurrency with a Semaphore and bound every channel are this topic's own two measurements. The fourth rule, define cancellation semantics explicitly, is named here but deliberately not proven — Tokio's actual cancellation primitives are the next chapter's own subject, not a shortcut to take here.

## Where this goes next

Bound every channel was this chapter's shortest rule and its least explained one. The next chapter is entirely about what that actually means, and what happens at every one of the ways a bounded channel can still go wrong.
