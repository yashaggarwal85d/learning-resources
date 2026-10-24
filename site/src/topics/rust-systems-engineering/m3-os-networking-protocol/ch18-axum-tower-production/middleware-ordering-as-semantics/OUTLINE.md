# Outline: Middleware ordering as semantics (`rust.middleware-ordering-as-semantics`)

Chapter 18, topic 47 (third and last of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Measure, by reproducing `tower::ServiceBuilder`'s own documented order example with real code, that a real buffer-then-concurrency-limit stack admits far more concurrent callers immediately than the reverse order, matching the claimed figures exactly.
2. Measure that a real deadline placed outside a slow auth step genuinely bounds that auth step and fires, while the same deadline placed only around the fast handler behind it never sees the slow auth step at all, letting it run to completion unbounded.
3. Measure that a real retry layer above a non-idempotent handler genuinely re-executes its own side effect once per attempt, and that a real idempotency key genuinely prevents that, running the side effect exactly once despite the same number of retries.
4. State, from `tower::ServiceBuilder`'s own documentation, that the order layers are added changes how requests are handled, and that layers added first are called with the request first.

## Changes from the chapter plan

None. All three of this topic's own claims are measured directly against real `tower::Service` stacks, real `tower::retry::Retry`, and `tower::ServiceBuilder` itself, entirely within this container; none need root access, a real network, or hardware the sandbox lacks. The tracing-layer-placement claim named in the syllabus (where the tracing layer sits decides whether a span describes one logical request or one retry attempt) is discussed in prose rather than measured, since reproducing it needs a real tracing subscriber capturing span structure, which is a layer of its own infrastructure beyond this topic's own three measured claims; `coverage.json`'s expert review records this scope choice.

## Reel steps (storyboard)

1. **"tower::ServiceBuilder's own documentation gives a specific example: buffer first, then a concurrency cap of ten, admits up to a hundred and ten callers at once; swap the order, and it only admits ten. Does real code actually behave that way, or is that just a simplification in the docs?"** (predict, hook) — `fig`: the same two layers, in two different orders, around the same slow service. Options: it's a simplification; real code behaves the same either way / real code matches the documented numbers closely, almost exactly (correct) / the real numbers are close, but far smaller than the documentation claims.
2. **"Measured: with the buffer first, well over a hundred callers were admitted immediately; with the order reversed, only exactly ten were, matching the documentation's own claimed numbers closely"** — `fig`: the real, measured counts, side by side. NO takeaway (the reel's swipe-test "from" step).
3. **"Build a real request pipeline with a deliberately slow authorization step, and a real deadline. Put that deadline around the whole pipeline, auth included. Does a slow auth step get caught by that deadline, the same way a slow handler would?"** (predict) — `fig`: a deadline wrapped around a slow auth step and a fast handler together. Options: no, a deadline only ever applies to the handler, never to auth / yes, the deadline bounds everything inside it, auth included, and genuinely fires (correct) / only if the auth step is the very last thing before the handler.
4. **"Measured: the real deadline fired well before the slow auth step would have finished on its own, because it wrapped the auth step too"** — `fig`: the real, measured early firing. Takeaway: "A deadline bounds whatever it wraps; placed around a slow auth step too, it genuinely catches that, not only the handler."
5. **"Now put that same deadline only around the fast handler, with the slow auth step run ahead of it, outside its reach. Does the slow auth step still get caught, since the deadline is still there somewhere in the pipeline?"** (predict) — `fig`: the same deadline, moved to wrap only the handler, with auth now outside it. Options: yes, the deadline still applies to the whole request, wherever it sits / no, the deadline never sees the auth step at all; it runs to completion, unbounded (correct) / it depends on which one finishes first.
6. **"Measured: with the deadline moved inside, the slow auth step ran to completion entirely unbounded, taking far longer than the deadline's own limit, because the deadline never saw it at all"** — `fig`: the real, measured unbounded auth step. Takeaway: "The same deadline bounds a genuinely different thing depending on where it sits; moved inside, it stops protecting against exactly what moved outside it."
7. **"Wrap a handler that isn't safe to run twice in a real retry layer, with no idempotency key guarding it. The handler fails twice, then succeeds on the third attempt. How many times does its own side effect actually run?"** (predict) — `fig`: a non-idempotent handler, retried twice before succeeding. Options: once, since only the final, successful attempt's effect actually counts / exactly as many times as it was attempted, three times in a row (correct) / twice, since the first failed attempt doesn't count.
8. **"Measured: the handler's own side effect ran three separate times, once per attempt, including the two that failed, since nothing was guarding it from running again"** — `fig`: the real, measured side-effect count. Takeaway: "Retrying a handler that isn't safe to run twice means its side effect runs again, every single time, unless something stops it."
9. **"Add one real idempotency check to that same handler, with the same two failures and the same retries. How many times does the side effect run now?"** — `fig`: the same handler, now guarded by a real idempotency key. NO takeaway (a connecting step restating the documented finding directly, not a new measured claim). Measured inline: exactly once, despite the same three attempts.
10. **Recap** — a real buffer-then-concurrency-limit order admits far more callers immediately than the reverse, matching `ServiceBuilder`'s own documented numbers; a deadline bounds whatever it wraps, and moving it changes what it actually protects; and a non-idempotent handler's side effect runs again on every retry, unless a real idempotency key stops it. Handoff: this chapter was about a request arriving at a service boundary, correctly bounded and correctly ordered; the next is about what sits behind that boundary once the request lands, the storage engine's own physical layout, starting with a single page.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 9 (the same handler, same failures, same retries — but with one idempotency check added, the side effect runs only once).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, being the swipe test's "from" step; step 9 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| the order in which layers are added impacts how requests are handled; layers added first are called with the request first | `tower::ServiceBuilder` docs (quoted) |
| buffer(100).concurrency_limit(10) allows up to 110 requests to be in-flight; the reverse order allows only 10 | `tower::ServiceBuilder` docs (quoted) |
| a real buffer-first stack admits well over 100 concurrent callers immediately, while the reversed order admits exactly 10 | `examples/runtime-demo/src/service_builder_order_bounds_in_flight.rs` (executed, measured) |
| a real deadline wrapped around a slow auth step and a fast handler together genuinely fires before the slow auth step finishes | `examples/runtime-demo/src/timeout_placement_bounds_different_things.rs` (executed, measured) |
| the same deadline, placed only around the fast handler with the slow auth step outside it, never catches the slow auth step, which runs to completion unbounded | `examples/runtime-demo/src/timeout_placement_bounds_different_things.rs` (executed, measured) |
| a real retry layer above a non-idempotent handler causes its side effect to run once per attempt, including failed attempts | `examples/runtime-demo/src/retry_without_idempotency_reruns_the_effect.rs` (executed, measured) |
| the same handler, guarded by a real idempotency check, runs its side effect exactly once despite the same number of retries | `examples/runtime-demo/src/retry_without_idempotency_reruns_the_effect.rs` (executed, measured) |

## Concept ledger

- `introduces`: `middleware-order-changes-semantics`, `retry-idempotency-hazard` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `tower-service-poll-ready-contract`, `tower-layer-composition-limits`, `axum-is-tower-all-the-way-down`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Composing layers is easy to get working, but the order you compose them in changes what the stack actually guarantees — and getting that wrong is a correctness bug, not just a style choice."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter was about a request arriving at a service boundary, correctly bounded and correctly ordered. The next is about what sits behind that boundary once the request lands — the storage engine's own physical layout, starting with a single page."
