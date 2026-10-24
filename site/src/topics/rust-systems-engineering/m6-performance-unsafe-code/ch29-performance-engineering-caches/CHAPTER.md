# Chapter 29 — Performance Engineering: Caches, Branch Prediction, NUMA, Profiling (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 6, *Performance, Unsafe Code, FFI, Build, and Observability* (its first chapter). Chapter 29 has two sections: 29.1 *Method and tooling* (two full topics: benchmarking discipline and statistics, then CPU and memory profiling) and 29.2 *Hardware effects* (one full topic, cache lines and false sharing, plus two skipped ones, already recorded in `syllabus/review-notes/rust-cuts.md` under "Chapter 29 — Performance Engineering... (1 of 5)": branch prediction and speculation, and NUMA and CPU topology). The chapter's own lab exercise (benchmarking shared, sharded, and padded counters at several thread counts and explaining the scaling curve) is not a reel either. Planned 2026-10-24, in one `/make-topic` session. Previous milestone's own last chapter: Chapter 28, *CRDTs, Idempotency, and Convergent State*, which closed by naming this milestone's own first question directly: the engineering disciplines that make a whole Rust system fast, sound, embeddable, releasable, and diagnosable, starting with measuring performance itself before explaining it.

This file is the contract the chapter's three topics build to. Do not edit it once those topics are in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Every chapter in Milestones 1 through 5 measured a claim about correctness: does this algorithm, this protocol, this consensus rule actually do what it is supposed to do. This chapter opens Milestone 6 by measuring a different kind of claim: is a system actually fast, and does the way it is measured actually tell the truth about that. A benchmark's own average can lie outright, improving at the median while quietly regressing at the tail an real user actually waits on, and a benchmark's own noise (frequency scaling, hyperthreading, a noisy neighbour process, a cold cache on the first iteration) can make a real change look like it helped or hurt when it did neither. Profiling exists to answer a harder, more specific question than "is it fast": which exact part of the real code is actually spending the real time, on-CPU or off it, and whether a general-purpose allocator is itself a measured cost worth replacing. Finally, at the hardware level, a cache line, not a single byte or variable, is the real unit memory actually moves in, which is exactly why two unrelated counters sharing one cache line can make a lock-free structure measurably slower than a locked one, a real, counterintuitive hazard with a real, measurable fix. This chapter's own three topics measure all of this directly, continuing this domain's own established pattern: no root access, no real hardware counters, and no flaky wall-clock timing inside this sandboxed container, so every claim is built as a real, deterministic cost model (a fixed, real distribution of latencies to summarize; a real, weighted call tree to attribute cost across; a real, counted cache-line-contention model) rather than a live benchmark whose own result could differ run to run.

By the end of this chapter's three topics, the learner can: build a real toy benchmark-statistics pipeline and measure that a median improvement and a p99 regression are genuinely two separate, independently measurable facts about the identical change; build a real toy profiler's own call-tree model and measure that it genuinely attributes the real majority of cost to one specific hot function rather than spreading it evenly; and build a real toy cache-line-contention model and measure that two counters genuinely sharing one cache line pay a real, measurable cost that padding genuinely removes.

## A.2 The order of ideas, and why

1. **Benchmarking discipline and statistics** (topic 74, this chapter's first topic) — builds the foundation every later topic in this chapter measures against: a real toy latency-distribution model, measuring that the real p50, p95, and p99 of a distribution are genuinely separate statistics, and that a change can genuinely improve the median while genuinely regressing the tail.
2. **CPU and memory profiling** (topic 75) — builds a real toy call-tree model with a real, weighted cost per function, measuring that profiling genuinely attributes the real majority of a program's own cost to one specific hot function, and that an allocator's own overhead is itself a real, measurable cost rather than a free abstraction.
3. **Cache lines and false sharing** (topic 76) — builds a real toy cache-line-contention model, measuring that two counters genuinely sharing one real cache line pay a real, measurable contention cost that padding each counter onto its own real cache line genuinely removes.
4. **Branch prediction and speculation** *(skipped)* — stays in the syllabus; `syllabus/review-notes/rust-cuts.md` already records it.
5. **NUMA and CPU topology** *(skipped)* — stays in the syllabus; `syllabus/review-notes/rust-cuts.md` already records it.

*(The chapter's own lab — benchmarking shared, sharded, and padded counters at several thread counts and explaining the scaling curve — is not a reel; it stays in the syllabus as a lab exercise, exercising this chapter's own full topics together rather than introducing a new tested claim of its own.)*

## A.3 The running example: real, deterministic cost models, built and measured

Self-contained (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–28's conventions, with one explicit change this chapter's own subject requires: this domain has no root access, no real hardware performance counters, and no `perf`, `flamegraph`, or allocator-swapping tool available inside this sandboxed container, and a live wall-clock benchmark would be flaky rather than genuinely deterministic. Every topic in this chapter therefore measures a real, deterministic cost model standing in for the real tool it names (a fixed, real array of latency samples standing in for a real HDR histogram's own input; a real, weighted call-tree struct standing in for a real flamegraph's own data; a real, counted contention model standing in for a real hardware cache-miss counter), continuing this domain's own established pattern of measuring a real, small, fully-controlled model directly rather than a simulation, or a live measurement, taken on faith.

- **Topic 74** builds a real toy latency-distribution model: a real, fixed array of latency samples (standing in for a real benchmark's own captured samples), a real function computing p50/p95/p99 by sorting and indexing directly, and a real "before" and "after" pair of distributions where the after distribution's own median is lower but its own p99 is higher, measuring that these are genuinely two separate facts a single average would hide.
- **Topic 75** builds a real toy call-tree model: a real tree of named functions, each with a real, fixed cost weight, and a real function summing cost per function across the whole tree, measuring that the real majority of total cost attributes to one specific function, plus a real, separate measured comparison of a toy allocator's own per-allocation overhead at two different fixed costs, standing in for a real measured choice between allocators.
- **Topic 76** builds a real toy cache-line-contention model: two real counters represented as sharing one real, fixed-size byte array (one real cache line) versus two real, separately padded arrays (two real cache lines), and a real function counting how many of a sequence of alternating increments from two simulated cores would genuinely invalidate the other core's own cached line under each layout, measuring that the shared layout pays a real, counted cost the padded layout genuinely avoids.

Every number and outcome must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). This chapter needs no root access, no real network I/O, and no real multiple machines or multiple threads; "latency samples," "the call tree," and "cache-line contention" are all real, deterministic, in-memory Rust values and functions, continuing this domain's own established pattern of measuring a real, small, fully-controlled model directly rather than a simulation taken on faith.

## A.4 Terms and notation (continuing Chapters 1–28's vocabulary)

Everything in Chapters 1–28 §A.4 still applies. This chapter adds:

- **p50 / p95 / p99**: the real latency value below which 50%, 95%, or 99% of a real distribution's own samples fall; the tail (p95, p99) is a genuinely separate statistic from the median (p50) and from the average.
- **Coordinated omission**: the real hazard this chapter names but does not itself measure directly, where a load generator that waits for a slow response before sending the next one undercounts exactly the slow requests a real distribution most needs to capture.
- **Hot path**: the real function or code path a profiler's own cost attribution shows is responsible for the real majority of a program's own total cost, as distinct from every function the program merely calls.
- **Cache line**: the real, fixed-size unit (commonly sixty-four bytes) memory actually moves and invalidates in, never a single byte or variable on its own.
- **False sharing**: the real, measurable cost two logically unrelated variables pay when they happen to share one real cache line, each write from one core genuinely invalidating the other core's own cached copy.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "the value below which almost every real request falls" for a percentile; "the one function actually responsible for most of the real cost" for a hot path; "the real, fixed-size chunk memory actually moves in" for a cache line; "two unrelated values paying a real cost just for living too close together" for false sharing.

## A.5 Visual language (continuing Chapters 1–24's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list. This chapter adds:

- **A distribution-curve glyph**: a real, simple curve or sorted-bar shape marking p50/p95/p99 directly, for showing a real tail-versus-average divergence directly.
- **A cache-line glyph**: a small, fixed-width block representing one real cache line, split to show two counters sharing it versus two counters each on their own, for showing real false sharing directly.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–28 §A.6, with this chapter's own explicit addition from §A.3 above: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 6, title: 'Performance, Unsafe Code, FFI, Build, and Observability' }` and `chapter: { number: 29, title: 'Performance Engineering: Caches, Branch Prediction, NUMA, Profiling', section: '29.1' }` or `'29.2'`. A cargo crate under `examples/` is used; no root access, real network I/O, real multiple machines, real multiple threads, or a real hardware profiling tool are needed, since every claim is measured against a real, deterministic cost model standing in for the real tool or hardware behavior it names, continuing this domain's own established pattern of measuring a real, small, fully-controlled model directly.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–28's own declared list. No earlier chapter's own introduced id is reused directly in this chapter, since Milestone 6 changes subject from distributed-systems correctness to performance measurement itself; each of this chapter's own three topics' bridge instead names the milestone's own opening question in prose.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `tail-latency-diverges-from-the-average` | 74 | A distribution's own p50, p95, and p99 are genuinely separate statistics; a real change can genuinely lower the median while genuinely raising the tail, which a single average would hide entirely. |
| `profiling-attributes-cost-to-the-real-hot-path` | 75 | Profiling genuinely attributes the real majority of a program's own total cost to one specific function rather than spreading it evenly, and an allocator's own per-allocation overhead is itself a real, measurable cost rather than a free abstraction. |
| `false-sharing-costs-a-shared-cache-line` | 76 | Two counters genuinely sharing one real cache line pay a real, measurable contention cost from each other's own writes that padding each counter onto its own real cache line genuinely removes. |

## A.8 Bridges and handoffs

- **74** bridges from Chapter 28's own real handoff (this chapter's own first sentence names it directly: the engineering disciplines that make a whole Rust system fast, sound, embeddable, releasable, and diagnosable, starting with measuring performance itself before explaining it) and needs no earlier chapter's own introduced concept directly, since it changes subject to performance measurement itself. Hands off within the chapter to topic 75: "Knowing that a tail and a median can move in opposite directions decides what a benchmark's own result is even allowed to claim; it says nothing yet about which exact part of the real code that tail's own cost actually lives in."
- **75** bridges from topic 74's own measured distributions directly and hands off within the chapter to topic 76: "Attributing cost to one real function decides where to look next; it says nothing yet about a cost that has nothing to do with which function runs at all, only with which cache line two unrelated values happen to share."
- **76** bridges from topic 74 and 75's own measured cost models directly and hands off to the next topic: "This chapter measured how to tell a real improvement from a real regression, where a real cost actually lives, and why two unrelated values sharing a cache line pay a real, measurable price for it; the next topic turns to a proof obligation unsafe code itself carries, one no benchmark or profiler can discharge on its own."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- The `criterion.rs` crate's own documentation, a real, widely used Rust benchmarking harness, for topic 74's own concrete reference on statistical benchmarking, if fetchable.
- A real, authoritative reference on percentiles, tail latency, and coordinated omission (such as Gil Tene's own published writing on the subject), for topic 74's own concrete reference, if fetchable.
- The `crossbeam` crate's own documentation on `CachePadded`, a real, widely used Rust crate providing cache-line padding directly, for topic 76's own concrete reference, if fetchable.
