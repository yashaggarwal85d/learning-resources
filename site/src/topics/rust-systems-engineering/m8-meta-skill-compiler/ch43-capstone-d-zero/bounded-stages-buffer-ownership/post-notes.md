---
title: "Bounded stages and buffer ownership"
---

## Outcomes

- Measure that a real, bounded pipeline, moving each batch forward through channels with a real, enforced capacity, keeps its own real, total memory capped under a deliberately slow sink, for an entire real run.
- Measure that the identical real producer and the identical real, slow sink, driving a real, unbounded, cloning pipeline instead, lets that pipeline's own real, total memory grow toward the full run's own total bytes.
- Measure the real, structural size of the gap between those two pipelines' own real, measured peaks, for the identical real workload.
- State, from the tokio `mpsc` module's own documentation, the real nature of bounded backpressure and unbounded, uncapped sending this topic's own two measured runs demonstrate directly.

## Internals

The Apache Arrow project's own documentation on its columnar format describes a real, relocatable buffer convention, without pointer swizzling, that allows true zero-copy access to real, columnar data in shared memory; this topic's own small, in-process pipeline is modeled on the identical real idea at a far smaller scale, moving a batch's own backing buffer forward between stages rather than copying it, so that ownership, not a copy, decides which stage currently holds that memory.

## In production

A real pipeline rarely has only two stages between a producer and a sink; backpressure has to propagate across every real stage in a longer chain, and the real, slow stage is not always the final one. A bounded channel between any two adjacent stages forces the stage feeding it to wait the identical way this topic's own two-channel pipeline does, whichever stage in a longer chain turns out to be the genuinely slow one.

## The frontier

A real, distributed pipeline runs its stages on separate real machines, where a bounded channel's own real backpressure has to cross a real network boundary rather than live inside a single process's own memory; the identical underlying idea, a receiver's own real capacity signaling a sender to slow down, extends to that setting, but the real mechanism that carries the signal (an acknowledgment, a credit, a flow-control window) is no longer a single process's own in-memory channel.

## Where this goes next

A pipeline whose own real memory stays bounded under a slow sink has solved one real problem, keeping up; the next real problem is what happens when it stops running entirely, mid-stream, and has to start again without losing or repeating a single real record.
