---
title: "Cache lines and false sharing"
---

## Outcomes

- Build a real, deterministic cache-line-contention model: two real counters represented as sharing one real cache line versus two separately padded cache lines, standing in for a real hardware cache-miss counter, since this sandboxed container has no real hardware performance counters.
- Measure that the shared layout genuinely pays a real, counted cross-core invalidation cost on every alternating write between two cores.
- Measure that the padded layout genuinely avoids every real cross-core invalidation, at the identical sequence of writes.
- Measure that the shared layout's own real cost genuinely grows with more operations, while the padded layout's own real cost stays genuinely at zero regardless of how many operations run.
- State, from crossbeam_utils's own `CachePadded` documentation and from Wikipedia's own False sharing article, the real rules this topic's own code measures directly.

## Internals

A real CPU cache does not move single bytes; it moves whole, fixed-size cache lines (commonly sixty-four real bytes), which is exactly the unit this topic's own model counts invalidations over. `count_invalidations_shared` tracks one real "last writer" for the whole line, so any write from the other core counts as a real invalidation regardless of which byte within the line actually changed; `count_invalidations_padded` tracks a separate "last writer" per counter, modeling each counter's own, separate real cache line, so a core's own write can never register against the other core's own line. Per-core sharding, the syllabus's own second fix alongside padding, takes a different real approach to the identical problem: instead of padding one shared counter, give each core its own, wholly independent real counter from the start (never sharing a value, padded or not), and combine them only once, at the end, when no core is still writing.

## In production

`crossbeam_utils::CachePadded<T>` is the real, widely used Rust type this topic's own padded layout stands in for: it pads and aligns a value to the real length of a cache line, so two values wrapped in it never end up sharing one. The classic real example is a concurrent queue's own head and tail index: two unrelated-looking integers that, left unpadded, would force every push and every pop to invalidate the other operation's own cached line, even though a push never reads the tail and a pop never reads the head.

## The frontier

Struct-of-arrays layout restructures a collection of structs (an array of struct-of-two-fields, say) into two separate, parallel arrays, one per field, so a loop touching only one real field streams through contiguous memory instead of skipping over the other field's own bytes on every step; this is a genuinely different real technique from padding, aimed at prefetch-friendly, cache-line-efficient reads rather than at cross-core write contention, and it is named here in prose rather than measured, since this topic's own model is about contention between cores, not about a single core's own sequential access pattern. All of this topic's own measured claims run entirely on plain in-memory Rust values and functions, with no file, network, or root access needed.

## Where this goes next

This chapter measured how to tell a real improvement from a real regression, where a real cost actually lives, and why two unrelated values sharing a cache line pay a real, measurable price for it; the next topic turns to a proof obligation unsafe code itself carries, one no benchmark or profiler can discharge on its own.
