# Outline: CPU and memory profiling (`rust.cpu-memory-profiling`)

Chapter 29, topic 75 (second topic). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real, deterministic call-tree model: a real tree of named functions, each with a real, fixed self cost, standing in for a real flamegraph's own captured call-stack data, since this sandboxed container has no real profiling tool to run.
2. Measure that the real majority of total cost attributes to one specific function, not an even split across every function the program calls.
3. Measure that this real hot function sits several real calls deep in the tree, not at the top level, so attributing cost correctly genuinely requires walking the whole real tree.
4. Build a real, separate allocator cost-per-allocation model and measure that a specialized allocator genuinely cuts total allocation cost by more than half at the identical allocation count, making allocator choice a real, measured decision rather than a free abstraction.
5. State, from Brendan Gregg's own flame-graphs page and from mimalloc's own README, the real rules this topic's own code measures directly.

## Changes from the chapter plan

None. All claims are measured directly against a real, fixed, deterministic call-tree model and a real, fixed allocator cost-per-allocation model; nothing here needs root access, real hardware counters, or a live profiling tool.

## Reel steps (storyboard)

1. **"A flamegraph's own width shows how often a function was on the real call stack. Does that real cost spread evenly across every function a program calls, or does it pile up in one place?"** (predict, hook) — `fig`: a call tree, cost unlabelled. Options: it spreads evenly across every function / no, genuinely; it piles up in one specific function (correct) / only for recursive functions.
2. **"Measured: one specific function genuinely holds the real majority of the whole tree's total cost, far more than an even share across every function"** — `fig`: the real, measured cost per function. Takeaway naming exactly why "spread evenly" is the wrong default assumption.
3. **"That one real hot function sits several calls deep in the tree, under two real ancestors. Does checking just the top of the real call stack find it?"** (predict) — `fig`: the tree, the hot function marked deep inside it. Options: yes, the top frame is always the real hot path / no, genuinely; it can sit well below the top, so the whole real tree must be walked (correct) / only if the program recurses.
4. **"Measured: the real hot function is genuinely not a top-level function; attributing its real cost correctly means walking down through its real ancestors, not just reading the top frame"** — `fig`: the real, measured path from root to hot function. Takeaway naming exactly what a profiler's own attribution must do that a glance at the top frame cannot.
5. **"A specialized allocator claims a real, measured speedup over a generic one, at the identical allocation count. Is that real difference big enough to matter, or too small to bother measuring?"** (predict) — `fig`: two allocators, one cost each. Options: too small to matter in practice / a real, measurable majority-level cut in total allocation cost (correct) / only matters in a single-threaded program.
6. **"Measured: the specialized allocator genuinely cut total allocation cost by more than half, at the identical allocation count"** — `fig`: the real, measured allocator comparison. Takeaway naming exactly why allocator choice is a measured decision, not a free abstraction.
7. **"Brendan Gregg's own flame-graphs page and mimalloc's own README both state this exact discipline directly: a frame's own real width shows how often it was on the real stack, and an allocator's own real overhead is a real, measured, sometimes decisive cost. Does this topic's own code measure the identical real rules those real tools exist to show?"** — `fig`: both sources' own words, shown directly. NO predict (continues directly from the measured work). NO takeaway (a connecting step naming the exact rule this topic's own code measures).
8. **Recap** — one specific function, not an even split, holds the real majority of a program's own cost, often several calls deep; and an allocator's own overhead is itself a real, measured cost, not a free abstraction.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Step 7 deliberately connects rather than re-predicts, per `QUALITY.md`'s own guidance that a reel need not force a predict onto every remaining step.
- Surprising fact: step 4 (the real hot function is genuinely not a top-level function) and step 6 (a specialized allocator's own real saving is large enough to matter).
- Takeaways: steps 2, 4, 6 (three, one per measured pair; step 7 deliberately has none, a connecting step; the recap itself, step 8, carries the closing statement).
- Recap: step 8.

## Claims list

| Claim | Source |
|---|---|
| flame graphs are a visualization of hierarchical call-stack data built so the most frequent code paths can be identified quickly and accurately | Brendan Gregg, Flame Graphs (quoted) |
| a frame's own width shows how often it was present in the real stacks; the x-axis is the stack population, not the passage of time | Brendan Gregg, Flame Graphs (quoted) |
| mimalloc outperforms other leading allocators and often uses less memory, doing consistently well over a wide range of real benchmarks | mimalloc README (quoted) |
| a workload spending a real, measured share of its time in the allocator turns an allocator's own speedup into a real, outsized speedup for the whole program | mimalloc README (quoted) |
| profiling genuinely attributes the real majority of total cost to one specific function, not an even split across every function | `examples/runtime-demo/src/profiling_attributes_cost_to_the_real_hot_path.rs` (executed, measured) |
| that real hot function is genuinely not a top-level function; it sits several calls deep in the tree | `examples/runtime-demo/src/profiling_attributes_cost_to_the_real_hot_path.rs` (executed, measured) |
| a specialized allocator genuinely cuts total allocation cost by more than half, at the identical allocation count | `examples/runtime-demo/src/profiling_attributes_cost_to_the_real_hot_path.rs` (executed, measured) |

## Concept ledger

- `introduces`: `profiling-attributes-cost-to-the-real-hot-path` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `tail-latency-diverges-from-the-average` (topic 74's own introduced concept, per `CHAPTER.md` §A.8's own bridge for this topic)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "topic 74's own measured distributions directly" — restated as the question topic 74 left open: knowing that a tail and a median can move in opposite directions decides what a benchmark's own result is even allowed to claim; it says nothing yet about which exact part of the real code that tail's own cost actually lives in.
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Attributing cost to one real function decides where to look next; it says nothing yet about a cost that has nothing to do with which function runs at all, only with which cache line two unrelated values happen to share."
