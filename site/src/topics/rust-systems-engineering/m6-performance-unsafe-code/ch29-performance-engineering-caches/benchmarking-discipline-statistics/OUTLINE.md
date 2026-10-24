# Outline: Benchmarking discipline and statistics (`rust.benchmarking-discipline-statistics`)

Chapter 29, topic 74 (first topic, opens Milestone 6). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real, deterministic latency-distribution model: a real, fixed array of samples standing in for a real benchmark's own captured samples, since this sandboxed container has no flaky wall-clock timing to depend on.
2. Measure that a distribution's own p50 and p99 are genuinely separate statistics, not the same number read twice.
3. Measure that a real "before" and "after" pair of distributions can genuinely improve the median while genuinely regressing the p99 tail, on the identical change.
4. Measure that the real average alone genuinely hides this divergence, since it moves with the median's own improvement rather than the tail's own regression.
5. State, from Criterion.rs's own documentation and from HdrHistogram's own README, the real rules this topic's own code measures directly.

## Changes from the chapter plan

None. All claims are measured directly against a real, fixed, deterministic latency-distribution model; nothing here needs root access, real hardware counters, or a live wall-clock benchmark.

## Reel steps (storyboard)

1. **"A benchmark's own average goes down after a change. Does that genuinely mean every real user's own request got faster?"** (predict, hook) — `fig`: an average, going down. Options: yes, genuinely, a lower average always means faster for everyone / no, genuinely; the real tail can move in the opposite direction (correct) / only if the benchmark ran long enough.
2. **"Measured: the real p50 and the real p99 of the identical distribution are genuinely separate statistics, computed from the identical real samples"** — `fig`: the real, measured p50 and p99. NO takeaway (phone swipe test "from" step; the point is stated in the body instead).
3. **"Now a real change is applied. The real median genuinely drops. Does the real p99 genuinely drop along with it?"** (predict) — `fig`: a median dropping, the p99 beside it. Options: yes, they genuinely move together / no, genuinely; the real p99 can genuinely rise instead (correct) / only if the change touches every request equally.
4. **"Measured: the real median genuinely improved, while the real p99 genuinely regressed, on the identical change"** — `fig`: the real, measured divergence. Takeaway naming exactly why a median alone is not enough to trust a change.
5. **"Now check the real average on this identical change. Does it genuinely show the real p99's own regression?"** (predict) — `fig`: the average, beside the real p99. Options: yes, the average always tracks the real tail / no, genuinely; the real average can genuinely improve while the real p99 genuinely regresses (correct) / only for small sample sizes.
6. **"Measured: the real average genuinely improved too, completely hiding the real p99's own regression"** — `fig`: the real, measured average, disagreeing with the real p99. Takeaway naming exactly what a single average can never show.
7. **"Criterion.rs's own documentation and HdrHistogram's own README both describe this exact discipline directly: real warmup and outlier classification before trusting a result, and a real correction for exactly the missed, slow samples a naive measurement would hide. Does this topic's own code measure the identical real divergence those real tools exist to catch?"** — `fig`: both sources' own words, shown directly. NO predict (continues directly from the measured work). Takeaway naming the real discipline both sources agree on (a third takeaway, required by DESIGN.md → What makes a reel engaging).
8. **Recap** — a distribution's own p50, p95, and p99 are three genuinely separate real statistics; a single average can genuinely improve while the real tail a user actually waits on genuinely gets worse.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Step 7 deliberately connects rather than re-predicts, per `QUALITY.md`'s own guidance that a reel need not force a predict onto every remaining step.
- Surprising fact: step 4 (a median improvement and a p99 regression genuinely coexist) and step 6 (the average agrees with the median, not the tail).
- Takeaways: steps 4, 6, 7 (three — step 2 deliberately has none, the reel's own "from" step for the phone swipe test; the recap itself, step 8, carries the closing statement instead of a fourth takeaway).
- Recap: step 8.

## Claims list

| Claim | Source |
|---|---|
| warmup executes the routine repeatedly to give the OS, CPU, and JIT time to adapt, preventing cold caches and compilation time from throwing off later measurements | Criterion.rs Documentation (quoted) |
| outlier classification uses a modified Tukey's Method, computing the interquartile range from the 25th and 75th percentiles | Criterion.rs Documentation (quoted) |
| the comparison process can be extremely sensitive to small, unrelated changes in background load, which is why a configurable noise threshold exists | Criterion.rs Documentation (quoted) |
| a raw histogram missing an expected-interval correction can show the overwhelming majority of results as fast, which is obviously not right, once a long pause is hidden in a single sample | HdrHistogram README (quoted) |
| recording with an expected interval between samples produces a data set that much more accurately reflects the response-time distribution a random, uncoordinated request would have experienced | HdrHistogram README (quoted) |
| a distribution's own p50 and p99 are genuinely separate statistics, not the same number read twice | `examples/runtime-demo/src/tail_latency_diverges_from_the_average.rs` (executed, measured) |
| a real change can genuinely improve the median while genuinely regressing the p99 tail, on the identical distribution | `examples/runtime-demo/src/tail_latency_diverges_from_the_average.rs` (executed, measured) |
| the real average alone genuinely hides this divergence, since it moves with the median's own improvement rather than the tail's own regression | `examples/runtime-demo/src/tail_latency_diverges_from_the_average.rs` (executed, measured) |

## Concept ledger

- `introduces`: `tail-latency-diverges-from-the-average` (per `CHAPTER.md` §A.7's concept table)
- `uses`: [] (this topic opens Milestone 6 and changes subject to performance measurement itself, per the chapter plan's own A.7)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "the engineering disciplines that make a whole Rust system fast, sound, embeddable, releasable, and diagnosable, starting with measuring performance itself before explaining it."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Knowing that a tail and a median can move in opposite directions decides what a benchmark's own result is even allowed to claim; it says nothing yet about which exact part of the real code that tail's own cost actually lives in."
