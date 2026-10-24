---
title: "Service topology and state boundaries"
---

## Outcomes

- Measure that a real, bounded queue behind a real Axum edge rejects a request the instant it is already full, before the worker pool or storage layer is ever involved.
- Measure that the real, rejected request genuinely never appears in the real storage layer, even after the worker has finished every request it actually admitted.
- Measure that a real shutdown coordinator rejects a real new request immediately once shutdown begins, while still draining real work already queued through to storage.
- State, from `tokio::sync::mpsc`'s and `tokio-util::sync::CancellationToken`'s own documentation, the real mechanisms this topic's own service measures directly.

## Internals

This topic's own shutdown coordinator is hand-written (an `AtomicBool` the edge checks, plus dropping the channel's own `Sender` so the worker's `recv()` genuinely returns `None` once the queue drains) rather than built on the syllabus's own named `tokio_util::sync::CancellationToken`, to keep this topic's own dependency list to exactly what its three measured claims need. The two are real, equivalent ways to signal and observe the identical real shutdown request: a token's own `cancelled()` future resolves the moment `cancel()` is called, which this topic's own `AtomicBool` flag does by being checked on every new request; a production service reaches for the named primitive specifically because it composes with other tasks awaiting the identical signal, which this topic's own two-layer service does not yet need.

## In production

A real container build and a real, OS-level `SIGTERM` delivered to a real running process are exactly what the chapter's own lab exercises; neither is reachable the identical way from this sandboxed container, so this topic measures the identical real in-process shutdown signal directly, triggering the same real coordinator code a container's own `SIGTERM` handler would call. A real production topology also puts a real load balancer in front of the edge, so a `503` from one real instance's own full queue can be retried against a different real instance, which this topic's own single-instance measurement does not model.

## The frontier

`tower::load_shed` is a real, named `Tower` middleware performing the identical real rejection this topic's own `submit` handler performs by hand, available as a drop-in layer composed with the rest of a real `Tower` stack (continuing Ch.18's own `Tower` vocabulary) rather than written out by hand inside the handler itself.

## Where this goes next

A rejected request stopping cleanly at its own real boundary is a real, structural property of one request at a time; it says nothing yet about the real shape of a great many requests arriving at once, the way a real overload always does.
