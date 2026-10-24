---
title: "CPU and memory profiling"
---

## Outcomes

- Build a real, deterministic call-tree model: a real tree of named functions, each with a real, fixed self cost, standing in for a real flamegraph's own captured call-stack data, since this sandboxed container has no real profiling tool to run.
- Measure that the real majority of total cost attributes to one specific function, not an even split across every function the program calls.
- Measure that this real hot function sits several real calls deep in the tree, not at the top level, so attributing cost correctly genuinely requires walking the whole real tree.
- Build a real, separate allocator cost-per-allocation model and measure that a specialized allocator genuinely cuts total allocation cost by more than half at the identical allocation count, making allocator choice a real, measured decision rather than a free abstraction.
- State, from Brendan Gregg's own flame-graphs page and from mimalloc's own README, the real rules this topic's own code measures directly.

## Internals

The call tree's own self cost is attributed per node, not per path, which is exactly why summing a node's own self cost plus every descendant's own self cost (its inclusive cost) is a genuinely different number from any single ancestor's own inclusive cost; this topic's own `depth` function walks real parent pointers up from the hot function to the root rather than trusting where that function happens to appear in source order, mirroring what a real sampling profiler must do: attribute each real sample to the full real call stack it was captured on, not just its topmost frame.

## In production

`perf stat` and `perf record` are the real Linux tools a flamegraph is usually built from: `perf record` captures real, sampled call stacks at a fixed real frequency, and a tool such as `cargo flamegraph` turns that real sampled data into the real visualization this topic's own code measures the shape of directly. `perf stat` instead reports real, aggregate hardware counters (real instructions retired, real cache misses, real branch mispredictions) for a whole real run, without the per-function detail a flamegraph gives. None of these real tools are available inside this sandboxed container, which has no root access and no real hardware performance counters, so this topic's own call-tree model stands in for their real captured data directly, continuing this domain's own established pattern.

## The frontier

Off-CPU profiling captures a real thread's own time spent genuinely blocked (waiting on I/O, a lock, or a channel) rather than genuinely running, which an on-CPU-only flamegraph misses entirely; a real off-CPU flamegraph is built from real scheduler events instead of real CPU samples. Top-down microarchitecture analysis goes a level deeper than either: it uses real hardware counters to decide whether a real bottleneck is genuinely CPU-bound, genuinely waiting on memory, or genuinely limited by a mispredicted branch, before a programmer spends real effort optimizing the wrong thing. Heap profilers such as `dhat` and `heaptrack` answer a different real question than a CPU flamegraph: not which function spent the real time, but which real call site is responsible for the real bytes still allocated, which is exactly the real detail needed to find a real memory leak or an unexpectedly large real allocation. All of this topic's own measured claims run entirely on plain in-memory Rust values and functions, with no file, network, or root access needed.

## Where this goes next

Attributing cost to one real function decides where to look next; it says nothing yet about a cost that has nothing to do with which function runs at all, only with which cache line two unrelated values happen to share.
