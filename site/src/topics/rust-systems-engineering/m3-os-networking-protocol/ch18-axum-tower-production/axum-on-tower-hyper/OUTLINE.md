# Outline: Axum on Tower and hyper (`rust.axum-on-tower-hyper`)

Chapter 18, topic 46 (second of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Measure, with a real, minimal, running Axum server, that the 0.8 `/{param}` routing syntax genuinely extracts a real path parameter from a real request.
2. Measure that Axum's own `State` genuinely persists and accumulates across separate real requests, rather than being re-created fresh each time.
3. Measure that a real `middleware::from_fn` layer genuinely runs against a real response, Axum's own stated way to write middleware, with no system of its own.
4. Measure that a real `tower-http` layer (`TimeoutLayer`) genuinely cuts off a handler that outlives it, showing that `tower-http`'s own middleware attaches to an Axum router exactly the way any other Tower layer would.
5. State, from `axum`'s own documentation, that Axum doesn't have its own middleware system but instead uses `tower::Service`, and that this is what gets it timeouts, tracing, compression, and authorization for free, and lets middleware be shared with hyper- or tonic-based applications too.

## Changes from the chapter plan

None. All four measured claims run against a real, running Axum server over a real `TcpListener`, driven by a real HTTP client, entirely within this container; nothing here needs root access or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Topic forty-five showed that tower::Service and Layer are the whole backpressure abstraction. Axum is the framework most of this ecosystem actually ships with. Does Axum build its own separate middleware system on top of that, or does it just reuse Service and Layer directly?"** (predict, hook) — `fig`: Axum's own router, with a question mark over whether it has its own separate middleware machinery. Options: it builds its own system, tailored to HTTP specifically / it has no middleware system of its own; it's tower::Service all the way down (correct) / it uses tower::Service only for simple cases, and its own system for everything else.
2. **"Axum's own documentation says so plainly: Axum doesn't have its own middleware system; it uses tower::Service, and that's what gets it timeouts, tracing, compression, and authorization for free"** — `fig`: the quoted documentation, shown directly. NO takeaway (the reel's swipe-test "from" step).
3. **"Stand up a real, running Axum server with a route written in the newer `/{param}` syntax. Send a real request for a specific name through it. Does the handler actually receive that name, or does it need to parse the raw path itself?"** (predict) — `fig`: a real running server, a real request to a path with a parameter in it. Options: the handler has to parse the raw path string itself / a real extractor hands the handler the parameter directly, already parsed (correct) / only works if the parameter is the very last thing in the path.
4. **"Measured: a real request to a path with a name in it came back with that exact name, pulled out by a real extractor, not a hand-written parser"** — `fig`: the real, measured extraction. Takeaway: "An extractor is just a type that knows how to pull itself out of a real request; the handler never touches the raw path at all."
5. **"Give that same server a piece of state shared across every request, and send three real requests to a handler that reads and increments it. Does each request see a fresh copy, or does the state actually accumulate?"** (predict) — `fig`: three requests arriving in sequence, one shared piece of state behind them. Options: each request sees a fresh copy, since every request gets its own task / the state genuinely accumulates across every real request, since it's shared (correct) / it only accumulates if the requests happen to land on the same worker thread.
6. **"Measured: three separate real requests came back with increasing values in a row, a real piece of shared state actually accumulating, not three fresh copies"** — `fig`: the real, measured sequence of increasing values. Takeaway: "Shared state in a real Axum server is exactly that, shared; three real requests prove it accumulates, rather than resetting."
7. **"Wrap that server in a real middleware::from_fn layer that touches every response, and separately, a real tower-http layer that cuts a handler off if it runs too long. Do both of those actually run against real requests, the same way any other Tower layer would?"** (predict) — `fig`: a from_fn layer and a tower-http layer, both wrapped around the same server. Options: only the tower-http one really runs; from_fn is just documentation sugar / both genuinely run, against real requests, the same way any other layer composes (correct) / only one of the two can be active on a given router at once.
8. **"Measured: a real middleware::from_fn layer genuinely modified a real response, and a real tower-http timeout genuinely cut off a handler that would have taken far longer, both running against real requests"** — `fig`: the real, measured results of both layers. Takeaway: "from_fn and tower-http's own layers are ordinary Tower layers; a real Axum server runs both exactly the way the abstraction promised."
9. **"None of this needed a separate thing to learn: the extractor, the shared state, the two layers, all of it is the same Service and Layer abstraction from the topic before this one, just running inside a real HTTP server"** — `fig`: the server, the extractor, state, and both layers, shown as one composed whole. NO takeaway (a connecting step restating the documented finding directly, not a new measured claim).
10. **Recap** — a real `/{param}` route genuinely hands a handler its parameter, already extracted; real shared state genuinely accumulates across real requests; a real `middleware::from_fn` layer and a real `tower-http` layer both genuinely ran against real requests, composed the same way any Tower layer composes; and none of it needed a system of its own, exactly as Axum's own documentation says. Handoff: composing layers is easy to get working, but the order composed in changes what the stack actually guarantees, and getting that wrong is a correctness bug, not just a style choice.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 2 (quoted directly, moved earlier than the usual slot since it answers the hook's own prediction immediately — the reel's swipe-test "from" step doubles as the surprising-fact reveal here).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, being the swipe test's "from" step; step 9 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| Axum doesn't have its own middleware system but instead uses tower::Service; this means Axum gets timeouts, tracing, compression, authorization, and more, for free, and enables sharing middleware with hyper- or tonic-based applications | `axum` docs (quoted) |
| Axum is designed to work with tokio and hyper | `axum` docs (quoted) |
| a handler function is an async function that takes any number of extractors as arguments; an extractor is a type that implements FromRequest or FromRequestParts | `axum::extract` docs (quoted) |
| `middleware::from_fn` creates a middleware from an async function; it doesn't support extracting State directly | `axum::middleware::from_fn` docs (quoted) |
| tower-http is a library that provides HTTP-specific middleware and utilities built on top of tower, compatible with any library using the http and http-body crates | `tower_http` docs (quoted) |
| a real request to a `/{param}` route genuinely extracts the real path parameter via a real extractor | `examples/runtime-demo/src/axum_is_tower_underneath.rs` (executed, measured) |
| real `State` genuinely persists and accumulates across three separate real requests | `examples/runtime-demo/src/axum_is_tower_underneath.rs` (executed, measured) |
| a real `middleware::from_fn` layer genuinely runs and modifies a real response | `examples/runtime-demo/src/axum_is_tower_underneath.rs` (executed, measured) |
| a real `tower-http` `TimeoutLayer` genuinely cuts off a handler that would have taken far longer | `examples/runtime-demo/src/axum_is_tower_underneath.rs` (executed, measured) |

## Concept ledger

- `introduces`: `axum-is-tower-all-the-way-down` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `tower-service-poll-ready-contract`, `tower-layer-composition-limits`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "`Service` and `Layer` are the whole abstraction — the next question is whether a real framework actually uses them, or invents its own thing."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Composing layers is easy to get working, but the order you compose them in changes what the stack actually guarantees — and getting that wrong is a correctness bug, not just a style choice."
