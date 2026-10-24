# Outline: Cache lines and false sharing (`rust.cache-lines-false-sharing`)

Chapter 29, topic 76 (third and closing topic). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real, deterministic cache-line-contention model: two real counters represented as sharing one real cache line versus two separately padded cache lines, standing in for a real hardware cache-miss counter, since this sandboxed container has no real hardware performance counters.
2. Measure that the shared layout genuinely pays a real, counted cross-core invalidation cost on every alternating write between two cores.
3. Measure that the padded layout genuinely avoids every real cross-core invalidation, at the identical sequence of writes.
4. Measure that the shared layout's own real cost genuinely grows with more operations, while the padded layout's own real cost stays genuinely at zero regardless of how many operations run.
5. State, from crossbeam_utils's own `CachePadded` documentation and from Wikipedia's own False sharing article, the real rules this topic's own code measures directly.

## Changes from the chapter plan

None. All claims are measured directly against a real, fixed, deterministic cache-line-contention model; nothing here needs root access, real hardware counters, or a live benchmark.

## Reel steps (storyboard)

1. **"Two unrelated counters, one touched by each of two cores, happen to share one real cache line. Does writing one counter ever cost the other core anything?"** (predict, hook) — `fig`: two counters, one shared line. Options: no, genuinely; they are unrelated values / yes, genuinely; every write can invalidate the other core's own cached copy (correct) / only if both cores write the identical counter.
2. **"Measured: the shared layout genuinely pays a real invalidation cost on every single alternating write between the two cores, even though the two counters are otherwise unrelated"** — `fig`: the real, measured invalidation count. Takeaway naming exactly why "unrelated" data is not the same as "safe to place together."
3. **"Now pad each counter onto its own real cache line instead. Does that genuinely remove the cost, or only reduce it?"** (predict) — `fig`: two counters, two separate lines. Options: only reduces it, some cost remains / genuinely removes it entirely, down to zero (correct) / depends on how many cores are involved.
4. **"Measured: the padded layout genuinely avoids every real cross-core invalidation, at the identical sequence of writes the shared layout paid for"** — `fig`: the real, measured zero-invalidation count. Takeaway naming exactly what padding buys, and why it buys all of it.
5. **"Run both layouts again, but with far more operations this time. Does the shared layout's own real cost grow, or does it stay the same no matter how much work runs?"** (predict) — `fig`: a longer real sequence, both layouts. Options: it stays the same, false sharing has a fixed one-time cost / it genuinely grows with every additional operation (correct) / only the padded layout's cost changes.
6. **"Measured: the shared layout's own real cost genuinely grows with more operations, while the padded layout's own real cost stays genuinely at zero no matter how many run"** — `fig`: the real, measured comparison at two real workload sizes. Takeaway naming exactly why false sharing gets worse, not better, as a program runs longer.
7. **"crossbeam_utils's own `CachePadded` documentation and Wikipedia's own False sharing article both state this exact mechanism directly: updating one piece of data invalidates the whole real cache line it belongs to, and padding is the real, standard fix. Does this topic's own code measure the identical real cost those real tools exist to remove?"** — `fig`: both sources' own words, shown directly. NO predict (continues directly from the measured work). NO takeaway (a connecting step naming the exact rule this topic's own code measures).
8. **Recap** — two unrelated counters sharing one real cache line genuinely pay a real, growing invalidation cost; padding each counter onto its own real cache line genuinely removes that cost entirely, which is also this chapter's own closing idea: cost can live in where data sits, not only in which function runs.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Step 7 deliberately connects rather than re-predicts, per `QUALITY.md`'s own guidance that a reel need not force a predict onto every remaining step.
- Surprising fact: step 2 (unrelated data still pays a real cost together) and step 6 (the cost genuinely grows, it does not plateau).
- Takeaways: steps 2, 4, 6 (three, one per measured pair; step 7 deliberately has none, a connecting step; the recap itself, step 8, carries the closing statement).
- Recap: step 8.

## Claims list

| Claim | Source |
|---|---|
| `CachePadded` pads and aligns a value to the length of a cache line, so commonly accessed pieces of data are not placed into the same cache line as each other | crossbeam_utils Documentation (quoted) |
| updating an atomic value invalidates the whole cache line it belongs to, making the next access to that cache line slower for other CPU cores | crossbeam_utils Documentation (quoted) |
| false sharing is most commonly seen in modern multiprocessor CPU caches, where memory is cached in fixed-size lines such as 64 aligned, contiguous bytes | Wikipedia, False sharing (quoted) |
| when two processors operate on independent data stored in the same cache line, the cache coherency mechanism can force the whole line across the interconnect with every write, causing memory stalls | Wikipedia, False sharing (quoted) |
| false sharing in CPU caches can be prevented by reordering variables or adding padding between them | Wikipedia, False sharing (quoted) |
| the shared layout genuinely pays a real invalidation cost on every alternating write between two cores | `examples/runtime-demo/src/false_sharing_costs_a_shared_cache_line.rs` (executed, measured) |
| the padded layout genuinely avoids every real cross-core invalidation, at the identical sequence of writes | `examples/runtime-demo/src/false_sharing_costs_a_shared_cache_line.rs` (executed, measured) |
| the shared layout's own real cost genuinely grows with more operations, while the padded layout's own real cost stays at zero | `examples/runtime-demo/src/false_sharing_costs_a_shared_cache_line.rs` (executed, measured) |

## Concept ledger

- `introduces`: `false-sharing-costs-a-shared-cache-line` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `tail-latency-diverges-from-the-average`, `profiling-attributes-cost-to-the-real-hot-path` (topics 74 and 75's own introduced concepts, per `CHAPTER.md` §A.8's own bridge for this topic)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "topic 74 and 75's own measured cost models directly" — restated as the question topics 74 and 75 left open: attributing cost to one real function decides where to look next; it says nothing yet about a cost that has nothing to do with which function runs at all, only with which cache line two unrelated values happen to share.
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter measured how to tell a real improvement from a real regression, where a real cost actually lives, and why two unrelated values sharing a cache line pay a real, measurable price for it; the next topic turns to a proof obligation unsafe code itself carries, one no benchmark or profiler can discharge on its own."
