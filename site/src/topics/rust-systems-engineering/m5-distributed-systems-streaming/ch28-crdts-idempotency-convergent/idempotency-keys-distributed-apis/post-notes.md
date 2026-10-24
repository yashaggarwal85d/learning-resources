---
title: "Idempotency keys for distributed APIs"
---

## Outcomes

- Build a real toy idempotency-key store: a real `(scope, key)` map, each entry either in progress or completed with a real, stored response, bounded by a real TTL.
- Measure that a key's own scope genuinely keeps two otherwise-identical keys from colliding across different resources.
- Measure that a duplicate request within a key's own TTL genuinely replays the exact stored response, without running the real side effect again.
- Measure that a genuine race between two concurrent retries carrying the identical key is genuinely caught, so the real side effect still runs exactly once.
- State, from Stripe's own API reference and from the IETF's own Idempotency-Key header draft, the real rules this topic's own code measures directly.

## Internals

The store's own real entry carries a three-way status (absent, in progress, or completed with a response) rather than a simpler boolean, specifically because a two-valued model cannot distinguish a genuine race from a genuine duplicate: both look identical from the outside (the key already exists), but only the in-progress state is the one that must be rejected rather than replayed. The TTL is checked once, at lookup time, against the real clock passed into `begin`, rather than through a background sweep, which is enough to measure the real behavior (a duplicate inside the window replays, one outside it runs fresh) without needing a real timer thread.

## In production

This topic is the practical cousin of the exactly-once idea Chapter 27 measured at the log layer, moved here to a plain API with no broker or log underneath it to do the bookkeeping. Stripe's own API reference describes the identical real mechanism: the status code and body of the first request made with a given key are saved after execution begins, and a retry with the same key returns that saved response, including a 500 error; keys are pruned automatically after at least 24 real hours, and a reused key past that point genuinely starts a new request. Stripe's own documentation also states the genuine race directly: a result is saved only once execution begins, so a request that conflicts with another one already executing concurrently does not get its result saved, and can be safely retried. The IETF's own Idempotency-Key header draft states the identical two outcomes in vendor-neutral terms: a retry after the original completed should get a response consistent with the user's own intent, while a retry before the original completed should get a real resource-conflict error instead.

## The frontier

The syllabus's own two skipped topics (CRDT merge semantics and CALM's own coordination-avoidance rule) describe the wider frontier this narrow mechanism sits inside: a CRDT lets state merge safely with no coordination at all because its own merge operator is commutative, associative, and idempotent by construction, while CALM names exactly when that is even possible, a monotonic program needing no coordination at all, and an invariant like a unique reservation or a non-negative balance needing a real coordination protocol instead. An idempotency key is not a CRDT; it does not make two concurrent writes converge, it only makes one logical request safe to retry, which is why this topic's own race scenario ends in a real, reported conflict rather than a real, silent merge. All of this topic's own measured claims run entirely on plain in-memory Rust values and functions, with no file, network, or root access needed.

## Where this goes next

This chapter measured how a single idempotency key keeps one logical request safe to retry; the next milestone turns to the engineering disciplines that make a whole Rust system fast, sound, embeddable, releasable, and diagnosable, starting with measuring performance itself before explaining it.
