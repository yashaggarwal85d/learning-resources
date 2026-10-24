---
title: "Throughput accounting beyond records per second"
---

## Outcomes

- Measure that two real transform implementations, one borrowing each record directly and one cloning it needlessly, process the identical real workload at statistically indistinguishable real records per second.
- Measure, with a real, custom global allocator counting every real byte allocated, that those two implementations' own real bytes allocated per record differ by more than a factor of twenty for the identical real workload.
- Measure that records per second alone, taken by itself, never once reveals that real, structural allocation gap, even though a second real number exposes it directly.
- State, from the Rust standard library's own documentation on a real global allocator, the real nature of the mechanism this topic's own counting allocator is built on top of.

## Internals

The syllabus names a longer real list of throughput-accounting metrics beyond records per second and allocation bytes per record: megabytes per second, CPU cycles per record, queue depth, batch size, sink latency, and memory high-water mark. This chapter's own three topics already measured several of these directly, under their own names, rather than this topic's own two: topic 97's own peak bytes in flight is this chapter's own real memory high-water mark, and topic 98's own checkpoint-to-commit gap is a real, concrete instance of sink latency mattering for correctness, not merely for speed.

## In production

A real production system facing this exact kind of allocation regime, once measured rather than merely suspected, is often answered by replacing the general-purpose global allocator with a real, specialized one for the workload in question, an arena, a slab, or a pool, rather than only continuing to measure the cost a general allocator pays on every record.

## The frontier

A real, continuous production profiler samples a real, running system's own allocation regime over real wall-clock time, catching a real allocation pattern that only appears under a real, specific load rather than this topic's own one-shot, in-process measurement of one fixed, real batch of records.

## Where this goes next

A bounded pipeline that keeps its own memory capped, restarts without losing or repeating a single real record, and is measured by more than one real number, is what every earlier chapter in this domain was building toward: a real system, judged end to end, by how it actually behaves rather than by any one mechanism in isolation.
