---
title: "Checkpoints, offsets, and watermarks"
---

## Outcomes

- Measure that a real pipeline checkpointing only after a batch's own real commit genuinely returns restarts from a real, simulated crash having reprocessed nothing already committed and lost nothing that was not.
- Measure that the identical real crash, against a pipeline that checkpoints at handoff instead of after the real commit, leaves that pipeline's own checkpoint one real batch ahead of what was genuinely, durably committed.
- Measure that a restart from that wrong, advanced checkpoint genuinely, permanently loses the one real batch's own full set of records that was never actually committed, rather than merely reprocessing something already safe.
- State, from the Rust standard library's own documentation on a real, durable file sync, the real nature of a commit's own completion this topic's own two measured restarts demonstrate directly.

## Internals

Data Engineering's own Chapter 9 treats durable checkpoints, offsets, and watermarks alongside output commit metadata as the real mechanism that makes a stream's own restart exactly-once at the sink, the identical real idea this topic's own small, two-pipeline simulation demonstrates at a much smaller scale: a checkpoint is only as trustworthy as the real commit it is supposed to describe, never the handoff that merely precedes it.

## In production

A real pipeline with more than one real source advances a real watermark across each of them independently, and a restart has to decide what to do when two real sources disagree about how far the pipeline has genuinely gotten, a real complication this topic's own single-source simulation does not have to resolve.

## The frontier

A real, distributed pipeline often stores its own checkpoint on a separate real machine from the sink that checkpoint is supposed to describe, so a real network partition between the two can leave a checkpoint durably recorded while the sink's own real commit never actually happened, or the reverse, a genuinely harder version of the identical single-process timing gap this topic measures directly.

## Where this goes next

Surviving a real crash without losing or repeating a single real record is a real, structural property of a pipeline's own restart logic; it says nothing yet about whether that same pipeline is actually efficient while it runs, which is a real, separate question a single throughput number can hide.
