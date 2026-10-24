# Outline: Runtime observability and operating rules (`rust.runtime-observability-operating-rules`)

Chapter 9, topic 32 (fifth and last of five). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Measure a `Semaphore` genuinely bounding concurrency: 20 tasks contending for 4 permits never run more than 4 at once, and the semaphore reports itself fully saturated while they wait — not an assumption, a direct count.
2. Measure a real task backlog with Tokio's own runtime metrics: spawning 500 tasks onto a single worker leaves most of them visibly still queued the instant `global_queue_depth` is sampled.
3. Measure a bounded channel genuinely refusing a send once full, and genuinely accepting one again the moment capacity is freed by a receive — the enforcement behind "bound every channel," not aspirational advice.
4. Name `tokio-console` as the real tool that turns these same signals into a live, per-task view in production, from the crate's own words, and close the chapter with its operating rules as direct consequences of topics 28–31's mechanisms.

## Changes from the chapter plan

None. `CHAPTER.md` §A.3 scopes this topic to wrapping topics 28–31's mechanisms in Tokio's own runtime-metrics API to measure at least one operating rule violated and then fixed; built with a `Semaphore` saturation measurement, a `RuntimeMetrics::global_queue_depth` backlog measurement, and a bounded-channel backpressure measurement — three rules, each proven directly.

## Reel steps (storyboard)

1. **"20 tasks, one Semaphore with 4 permits. Does the runtime actually stop at 4 running at once?"** (predict, hook) — `fig`: `Semaphore::new(4)` beside 20 spawned tasks. Options: no — more than 4 still slip through / yes — never more than 4, and it reports fully saturated (correct) / only on the current-thread runtime.
2. **"Measured: 4 tasks running, zero permits available, with the rest genuinely waiting"** — `fig`: `semaphore_bounds_concurrency`'s real, executed output. NO takeaway (this is the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64 — moved to step 9 instead).
3. **"Spawn 500 tasks onto one worker, then ask the runtime's own metrics what's still queued. Zero, or a real backlog?"** (predict) — `fig`: `handle.metrics().global_queue_depth()` sampled right after the spawn loop. Options: zero — spawning is instant, so they're all already running / a real, large backlog — the one worker hasn't touched most of them yet (correct) / the metric only updates once a second.
4. **"Measured: hundreds of tasks still queued, read straight from the runtime's own metrics"** — `fig`: `global_queue_depth_reveals_backlog`'s real, executed output. Takeaway: "Runtime metrics report a real backlog, not an estimate — this is how a violation of 'keep tasks small' becomes visible before it's an incident."
5. **"A channel with capacity for one message. Does a second send wait politely, or get refused outright?"** (predict) — `fig`: `tx.try_send(1)` then `tx.try_send(2)` on a channel of size 1. Options: it waits until space frees up / `try_send` is refused immediately — the channel is actually full (correct) / the channel silently grows to fit it.
6. **"Measured: the second send was refused outright, and a third went through the instant capacity freed up"** — `fig`: `bounded_channel_applies_backpressure`'s real, executed output. Takeaway: "A bounded channel's limit is enforced, not aspirational — refused when full, accepted the moment it isn't."
7. **"Is tokio-console just a log viewer, or does it see every task this chapter has measured?"** (predict) — `fig`: the crate's own description of what it collects. Options: just a structured log viewer / a live view into tasks, resources, and operations across the whole runtime (correct) / it only works with the current-thread runtime.
8. **"The crate's own words: tokio-console sees tasks, resources, and operations — live, in a running process"** — `fig`: the exact description text, quoted. NO takeaway (a naming step, not a new measured claim — test-harness rule).
9. **"This chapter's rules, named one more time: small enough to yield, bounded concurrency, bounded channels, explicit cancellation"** — `fig`: the four rules, each pointed back at the topic that proved it (28–31) plus this topic's own three measurements. Takeaway: "A Semaphore's permits genuinely run out, and the runtime genuinely stops there — a real cap, not a suggestion."
10. **Recap** — a Semaphore's permits really run out and really stop concurrency there; runtime metrics report a real backlog, not an estimate; a bounded channel really refuses a send once full; tokio-console turns every one of these signals into a live view in production. Handoff: Chapter 10 is entirely about what "bound every channel" means in full.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 4 (the backlog is hundreds of tasks, not a handful — spawning really does outrun a single worker that fast).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, the test-harness rule).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| A semaphore maintains a set of permits that synchronize access to a shared resource, allowing more than one concurrent caller at a time | `docs.rs/tokio::sync::Semaphore` (quoted) |
| When no permits remain, acquire asynchronously waits until an outstanding permit is dropped | `docs.rs/tokio::sync::Semaphore` (quoted) |
| 20 tasks contending for a 4-permit semaphore never run more than 4 at once, and the semaphore reports 0 available permits while the rest wait | `examples/runtime-demo/src/semaphore_bounds_concurrency.rs` (executed, measured) |
| `RuntimeMetrics::global_queue_depth` returns the number of tasks currently scheduled in the runtime's global queue | `docs.rs/tokio::runtime::RuntimeMetrics` (quoted) |
| Spawning 500 tasks onto a single-worker runtime leaves a real, large backlog visible in `global_queue_depth` the instant it is sampled | `examples/runtime-demo/src/global_queue_depth_reveals_backlog.rs` (executed, measured) |
| A bounded channel refuses a second send once its one slot of capacity is full, and accepts a new send the instant that capacity is freed by a receive | `examples/runtime-demo/src/bounded_channel_applies_backpressure.rs` (executed, measured) |
| tokio-console collects and displays in-depth diagnostic data on the asynchronous tasks, resources, and operations in an application | `docs.rs/console-subscriber` (quoted) |
| tokio-console requires the `tokio_unstable` cfg flag and Tokio's optional tracing instrumentation to be enabled | `docs.rs/console-subscriber` (quoted) |

## Concept ledger

- `introduces`: `runtime-operating-rules` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `task-multiplexing-on-workers`, `cooperative-budgeting`, `blocking-pool-isolation`, `io-driver-readiness-cycle`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Every mechanism in this chapter is real, and every one of them can also be violated — a task that never yields, a channel with no bound, a cancellation path nobody defined. The question left is how any of that becomes visible before it becomes an incident."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Bound every channel was this chapter's shortest rule and its least explained one. The next chapter is entirely about what that actually means, and what happens at every one of the ways a bounded channel can still go wrong."
