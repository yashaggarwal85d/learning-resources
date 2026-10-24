---
title: "The systems design worksheet"
---

## Outcomes

- Measure that a real, bounded service whose own backpressure point was stated on purpose caps its real queue length and sheds load under a real burst of requests.
- Measure that the identical real burst against a second, independent service that never states its own backpressure point admits every request instead, with its real queue length growing past the first service's own cap.
- Measure, from `tokio::sync::mpsc`'s own documentation, that its two functions describe exactly the real difference this topic's own two services measure directly.
- State that an implicit design decision is still a real decision, just one answered by a library's own default instead of by a real, deliberate choice.

## Internals

This topic's own crate measures each service's real queue length with hand-rolled `enqueued`/`started` atomic counters rather than `tokio::sync::mpsc::Receiver::len()`, a real method that exists and reports the identical real number on both a bounded and an unbounded receiver. The method itself needs `&self`, but reading it from an HTTP endpoint while a worker task holds the identical receiver for an indefinitely pending `recv().await` risks a real deadlock the instant the queue is empty; the atomic pair avoids sharing the receiver at all, at the cost of one more field to keep in step by hand.

## In production

The worksheet's own real ninth question, the backpressure point, is only one of nine; this topic measures that one directly because Chapter 34 already built the real, concrete service needed to measure it, but the identical explicit-versus-implicit comparison applies to each of the other eight (resources, owners, sharing rules, persistence boundary, failure modes, consistency rule, observability signals) the identical way, each one answerable on purpose or left to whatever a library, a framework, or a database's own default happens to do.

## The frontier

`tower::load_shed` performs the identical real rejection this topic's own bounded service's handler performs by hand, available as a drop-in `Tower` middleware layer (continuing Ch.18's own `Tower` vocabulary) rather than written out inside the handler itself; the unbounded service in this topic has no equivalent layer to reach for, since nothing in it ever rejects anything at all.

## Where this goes next

An implicit decision answered by a real default is still a real decision, measured directly; the next real question is whether a decision that was made on purpose, an optimization, actually did what it was meant to.
