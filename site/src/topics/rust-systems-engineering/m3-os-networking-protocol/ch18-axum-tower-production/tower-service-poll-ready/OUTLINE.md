# Outline: Tower Service and poll_ready backpressure (`rust.tower-service-poll-ready`)

Chapter 18, topic 45 (first of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Measure, with a real, minimal `tower::Service` implementation, that `poll_ready` and `call` are genuinely two separate steps, and that a caller only calls once it has observed a real `Ready` result, not merely because it worked last time.
2. Measure that `ConcurrencyLimit`, `LoadShed`, `RateLimit`, and `Timeout` each really bound a different axis of a real call stack under load: in-flight concurrency, immediate rejection versus waiting, real wall-clock spacing, and a real deadline.
3. Measure that `Buffer` genuinely enqueues calls beyond what the inner service's own readiness would otherwise allow, by accepting every one of a batch of calls immediately while the inner, concurrency-capped service still only runs one at a time underneath it — the hidden queue the syllabus calls out.
4. State, from `tower::Service`'s own documentation, that calling a service at capacity should be guarded by `poll_ready`, and that an implementation is permitted to panic if `call` is invoked without first obtaining a real `Ready` result.

## Changes from the chapter plan

None. All four of this topic's own claims are measured directly against real `tower::Service` implementations and real Tower middleware layers in this container; none need root access, real hardware, or a real network beyond what the standard library's own async primitives and `tokio::time` already provide.

## Reel steps (storyboard)

1. **"A real tower::Service can report that it isn't ready several times before it finally says yes. If a caller calls it anyway, while it's still reporting not ready, what does the trait's own contract actually allow to happen?"** (predict, hook) — `fig`: a service reporting not ready, then ready, with a caller waiting on it. Options: it always just works, since poll_ready is only a performance hint / it's allowed to panic outright, since calling before a real ready result breaks the contract (correct) / it silently queues the call until the service becomes ready on its own.
2. **"Measured: the real service reported not ready several times in a row, and only once it had genuinely become ready did a caller actually call it"** — `fig`: the real, executed poll loop and its eventual call. NO takeaway (the reel's swipe-test "from" step).
3. **"Wrap that same kind of service with four different Tower layers at once, a concurrency cap, a load shedder, a rate limiter, and a deadline, then send a whole batch of calls through all four together. How many of those four layers actually change what happens to that batch, rather than just watching it pass by?"** (predict) — `fig`: four layers stacked around one service, a batch of calls arriving together. Options: only one of them really changes anything; the rest are just logging / all four, each one bounding a different real thing about that batch (correct) / none of them, since a layer can only wrap a service, never change its behavior.
4. **"Measured: the concurrency cap genuinely capped how many calls ran at once, the load shedder genuinely rejected a call immediately instead of waiting, the rate limiter genuinely spaced calls out over real time, and the deadline genuinely cancelled a call that ran too long"** — `fig`: all four measured results shown together. Takeaway: "A layer wraps one service inside another without touching its code, and each layer bounds a different real thing: how many run at once, whether to wait, how fast, or how long."
5. **"Put a bounded queue in front of a service whose own concurrency is capped at just one, then send several calls in all at once. Does that queue reject the extra calls, the same way the load shedder did?"** (predict) — `fig`: a queue in front of a concurrency-capped service, several calls arriving together. Options: yes, it rejects them immediately, the same way the load shedder does / no, it accepts every one of them up front into its own queue, no matter what the inner service can actually run (correct) / it accepts them, but only once the caller itself checks the inner service is ready.
6. **"Measured: the queue accepted every call immediately, while the service hiding behind it still ran only one call at a time underneath, a real, hidden backlog, not a rejection"** — `fig`: the real, measured accept-everything-up-front behavior next to the real, still-capped inner concurrency. Takeaway: "A queue sitting in front of a service can quietly hide the very backlog a hard cap exists to prevent, unless its own size is chosen on purpose."
7. **"Go back to the very first question: a caller calls a real service without ever checking whether it's ready first. What does the trait's own documentation actually say is allowed to happen?"** (predict) — `fig`: the same unready service, called directly without waiting. Options: it must still work correctly; that's the whole point of the trait / it's permitted to panic outright, since the contract was broken (correct) / it returns a graceful error instead, by the trait's own design.
8. **"The trait's own words settle it directly: an implementation is permitted to panic outright if a call arrives before it has genuinely reported ready"** — `fig`: the quoted documentation, shown directly. NO takeaway (a connecting step restating the documented finding directly, not a new measured claim).
9. **"Asking if it's ready and asking it to do the work are two separate steps on purpose, that is the backpressure contract itself, and every layer wrapping a service composes around exactly that same contract"** — `fig`: the two-step contract and the layered stack, shown as one shared idea. Takeaway: "Readiness is not a formality bolted onto a service; it is the backpressure contract itself, and every layer composes around that same contract."
10. **Recap** — a real service that reports not ready, and a caller that genuinely waits for ready before calling; four Tower layers, each bounding a different real thing about a batch of calls; a queue that can accept work the inner service cannot yet run, a real hidden backlog unless sized on purpose; and the trait's own documented permission to panic if that contract is ever broken. Handoff: `Service` and `Layer` are the whole abstraction; the next question is whether a real framework actually uses them, or invents its own thing.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 8 (the trait's own documentation sanctions a panic outright, not a graceful error, if the contract is broken).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| calling a Service which is at capacity should result in an error; the caller is responsible for ensuring the service is ready before calling it; poll_ready returns Ready if the service expects it can process a request | `tower::Service` docs (quoted) |
| poll_ready returns Ready(Ok) when the service can process requests; if at capacity, Pending is returned and the task is notified when the service becomes ready again | `tower::Service` docs (quoted) |
| implementations are permitted to panic if call is invoked without first obtaining Ready(Ok) from poll_ready | `tower::Service` docs (quoted) |
| LoadShed is middleware for shedding load when inner services aren't ready; it sheds load rather than waiting | `tower::load_shed` docs (quoted) |
| Buffer places a service behind a multi-producer, single-consumer buffering channel | `tower::buffer` docs (quoted) |
| Timeout aborts a response that does not complete within its configured duration | `tower::timeout` docs (quoted) |
| a real poll_ready reports Pending several times before Ready, and a caller genuinely waits for Ready before calling | `examples/runtime-demo/src/service_is_poll_ready_then_call.rs` (executed, measured) |
| ConcurrencyLimit(3) caps in-flight calls at exactly 3 even when 10 are attempted at once | `examples/runtime-demo/src/layers_compose_and_bound_a_stack.rs` (executed, measured) |
| LoadShed rejects a call immediately, rather than waiting, once the inner service reports not ready | `examples/runtime-demo/src/layers_compose_and_bound_a_stack.rs` (executed, measured) |
| RateLimit(2 per 200ms) genuinely spaces 4 calls out over real wall-clock time | `examples/runtime-demo/src/layers_compose_and_bound_a_stack.rs` (executed, measured) |
| Timeout(50ms) cancels a call that would have taken far longer, close to its own configured deadline | `examples/runtime-demo/src/layers_compose_and_bound_a_stack.rs` (executed, measured) |
| Buffer accepts all 6 calls up front via its own hidden queue while the inner ConcurrencyLimit(1) still runs only 1 at a time | `examples/runtime-demo/src/layers_compose_and_bound_a_stack.rs` (executed, measured) |

## Concept ledger

- `introduces`: `tower-service-poll-ready-contract`, `tower-layer-composition-limits` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `connection-backpressure-state-machine`, `io-driver-readiness-cycle`, `async-state-machine-lowering`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter's own first sentence names Chapter 16's own real handoff directly: Chapter 16 was about one raw TCP connection's own byte stream, framing, and backpressure; this chapter is about composing many such connections' worth of work behind an explicit, composable readiness contract."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "`Service` and `Layer` are the whole abstraction — the next question is whether a real framework actually uses them, or invents its own thing."
