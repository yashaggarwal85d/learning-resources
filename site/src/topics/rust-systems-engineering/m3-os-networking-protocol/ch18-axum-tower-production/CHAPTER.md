# Chapter 18 — Axum, Tower, and Production Service Boundaries (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 3, *OS, Networking, and Protocol Layer* (its fifth and final chapter). Chapter 18 has one section, 18.1, with three full topics; its own lab exercise (a service with timeout, trace, auth and retry middleware, deliberately misordered to demonstrate the bug, then documented) is not a reel, per `CLAUDE.md`'s convention. Planned 2026-10-24, in one `/make-topic` session. Previous chapter: Chapter 16, *TCP Sockets, Framing, Partial I/O, and Backpressure* (three topics live: TCP as a byte stream, framing strategies and failure modes, connection-level backpressure). Chapter 17 (HTTP/1.1, HTTP/2, HTTP/3, QUIC, TLS 1.3) is marked `*(skipped)*` in full and gets no reels, per `syllabus/rust-systems-engineering.md` lines 202-211.

This file is the contract the chapter's three topics build to. Do not edit it once a topic is in progress; record any unavoidable departure under that topic's `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 16 ended with one raw TCP connection's own byte stream, framing, and backpressure fully worked out. A real server handles many such connections at once, and every one of them needs the same cross-cutting behaviors — timeouts, rate limiting, load shedding, tracing, authorization — applied consistently without duplicating that logic into every handler. Tower's answer is a single abstraction, `Service`, with exactly two methods: `poll_ready`, which asks "can you accept work right now?", and `call`, which asks for the work to be done. Readiness is not a formality; it *is* the backpressure contract — a service that is never ready never gets called, and a `Buffer` layer that queues calls anyway hides exactly the kind of unbounded buffer Chapter 16 spent a whole topic warning against. `Layer`s wrap a `Service` in another `Service`, so `ConcurrencyLimit`, `LoadShed`, `RateLimit`, and `Timeout` all compose the same way a Unix pipe composes commands. Axum, the framework most of this ecosystem actually ships with, has no middleware system of its own — it is Tower all the way down, so understanding `Service` and `Layer` here is understanding Axum's entire middleware story, and the ecosystem's `tower-http` crate, for free. None of this is safe to compose carelessly, though: middleware order changes what a stack actually guarantees. A timeout that wraps authorization bounds something different from one authorization wraps; a retry layer misplaced above a non-idempotent handler can execute that handler's side effect more than once, which is not a performance bug but a correctness one.

By the end of the chapter the learner can: explain `tower::Service`'s `poll_ready`/`call` split as a backpressure contract, and name what each of `ConcurrencyLimit`, `LoadShed`, `RateLimit`, `Timeout`, and `Buffer` actually does to that contract, including `Buffer`'s own hidden queue; explain and show, with a running Axum server, that Axum's own middleware (extractors, `State`, `middleware::from_fn`, `tower-http` layers, the 0.8 `/{param}` routing syntax) is Tower underneath, with no separate system to learn; and demonstrate, concretely, that `ServiceBuilder` applies its first-listed layer outermost, and that reordering timeout versus auth versus retry versus tracing changes what a request stack actually does and protects — including why retrying a non-idempotent operation without an idempotency key is a correctness bug, not just a wasted call.

## A.2 The order of ideas, and why

1. **Tower Service and poll_ready backpressure** (topic 45) — the chapter's foundation: establishes, with a real, minimal `tower::Service` implementation, that `poll_ready` and `call` are genuinely two separate steps, that a service reporting itself not-ready is a real backpressure signal a caller must respect, and measures what `ConcurrencyLimit`, `LoadShed`, `RateLimit`, `Timeout`, and `Buffer` each actually do to a stack of calls under load. Needs Chapter 16's own `connection-backpressure-state-machine` directly (the same "stop accepting work until ready" shape, now at the service layer instead of the raw-socket layer) and Chapter 9's `io-driver-readiness-cycle`/`async-state-machine-lowering` (since `poll_ready` is exactly the same poll-based readiness contract driving `Future::poll` itself).
2. **Axum on Tower and hyper** (topic 46) — needs topic 45's own `Service`/`Layer` vocabulary directly: shows, with a real running Axum server, that Axum's extractors, `State`, `middleware::from_fn`, and routing are built entirely on the `Service` trait topic 45 just established, and that `tower-http`'s own layers (timeout, tracing, compression, authorization) attach to an Axum router exactly the way any other Tower layer would. Introduces nothing new about backpressure; it is the chapter's proof that the abstraction generalizes to the framework most of the ecosystem actually uses.
3. **Middleware ordering as semantics** (topic 47) — needs topic 46's own running Axum stack directly: demonstrates, by deliberately misordering layers and then fixing the order, that `ServiceBuilder` applies its first-listed layer outermost, that a timeout before versus after an auth layer bounds a different thing, and that a retry layer above a non-idempotent handler without an idempotency key genuinely re-executes that handler's side effect. Closes the chapter and Milestone 3; hands off to Milestone 4 (Pages, Records, and Physical Storage Layout), since the course now turns from a request arriving at a service boundary to the storage engine behind it.

*(The chapter's lab — a service with timeout, trace, auth and retry middleware, deliberately misordered to demonstrate the bug, then documented with the invariant the correct order protects — is not a reel; it stays in the syllabus as a lab exercise, exercising all three of this chapter's topics together rather than introducing a new tested claim of its own.)*

## A.3 The running example: a real Tower/Axum service, measured both ways

Self-contained per topic (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–16's conventions.

- **Topic 45** implements a minimal, real `tower::Service` (not a mock) whose `poll_ready` can be made to report not-ready on demand, and measures: that a caller observing not-ready genuinely does not call it; that `ConcurrencyLimit` genuinely caps in-flight calls at its configured bound; that `LoadShed` genuinely rejects a call rather than queuing it once the inner service is not ready; that `RateLimit` genuinely spaces calls out over real wall-clock time; that `Timeout` genuinely cancels a call that outlives its deadline; and that `Buffer` genuinely accepts calls beyond what the inner service's own readiness would otherwise allow, by actually enqueuing them — the hidden queue the syllabus calls out explicitly.
- **Topic 46** stands up a real, minimal Axum server (real `TcpListener`, real HTTP requests via a real client, not mocked) with an extractor, `State`, a `middleware::from_fn` layer, a `tower-http` layer (e.g. `TraceLayer` or `TimeoutLayer`), and the 0.8 `/{param}` routing syntax, and measures that each actually does what it claims against real requests — the state is genuinely shared and observed, the middleware genuinely runs, the path parameter is genuinely extracted.
- **Topic 47** builds two versions of the same small real Axum/Tower stack (auth, timeout, tracing, retry layers) with the layers in two different orders, sends real requests against both, and measures the different, real, observable outcome each ordering produces — including a real non-idempotent handler (a counter incremented server-side) actually incrementing more than once under a misplaced retry layer, and an idempotency key fix actually preventing that double-execution.

Every number and outcome must come from the topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). Topics in this chapter add `tower`, `axum`, and `tower-http` as dependencies where the syllabus names them directly; unlike Chapters 11–16, nothing here is inherently Unix-specific, so the `sys.platform != 'win32'` guard is only added if a topic's own measurement actually needs it.

## A.4 Terms and notation (continuing Chapters 1–16's vocabulary)

Everything in Chapters 1–16 §A.4 still applies. This chapter adds:

- **`Service`**: Tower's core abstraction — anything with `poll_ready(&mut self, cx) -> Poll<Result<(), Error>>` and `call(&mut self, Request) -> Future<Response>`; readiness and doing-the-work are two separate steps, not one.
- **Readiness as the backpressure contract**: a `Service` reporting itself not-ready via `poll_ready` is a real signal a well-behaved caller must wait on before calling, exactly as a closed TCP window signals a sender to slow down.
- **`Layer`**: a wrapper that takes one `Service` and produces another `Service`, which is how Tower middleware composes — each layer added wraps the one before it.
- **`ConcurrencyLimit` / `LoadShed` / `RateLimit` / `Timeout`**: layers that bound, respectively, the number of in-flight calls, whether an unready call is rejected instead of queued, how calls are spaced over time, and how long a call is allowed to run.
- **`Buffer`**: a layer that introduces its own hidden queue so callers can enqueue work ahead of the inner service's own readiness — convenient, but an unbounded or carelessly-sized one reintroduces exactly the unbounded-buffer failure Chapter 16 warned against.
- **Middleware ordering as semantics**: the order layers are composed in changes what the resulting stack actually guarantees, not just its performance; `ServiceBuilder` applies the first-listed layer outermost.
- **Retry budget / idempotency key**: a bound on how much retrying is allowed system-wide, and a caller-supplied key that lets a handler recognize and skip a side effect it has already performed, both needed before a retry layer can safely wrap a non-idempotent operation.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "asking if it's ready, versus asking it to do the work" for the `poll_ready`/`call` split; "the service saying not yet, and the caller actually waiting" for readiness as backpressure; "wrapping one service inside another" for a Layer; "a cap on how many calls are in flight at once", "rejecting instead of waiting in line", "spacing calls out over time", and "giving up on a call that's taken too long" for the four limiting layers in turn; "a queue hiding behind the service" for Buffer; "the first one you list wraps everything after it" for ServiceBuilder's ordering; "running the same side effect more than once" for the non-idempotent retry hazard.

## A.5 Visual language (continuing Chapters 1–16's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list (per Chapter 11's own established fix) and the byte-stream-strip/frame-cap-gate glyphs Chapter 16 introduced, reused where relevant. This chapter adds:

- **A nested-box layer stack**: concentric boxes showing a `Service` wrapped by successive `Layer`s, with the outermost box labeled as the first one `ServiceBuilder` was given.
- **A ready/not-ready gate glyph**: a glyph showing a call either passing through (service ready) or stopping at a gate (service not ready), in the same visual family as Chapter 16's frame-cap gate.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–16 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 3, title: 'OS, Networking, and Protocol Layer' }` and `chapter: { number: 18, title: 'Axum, Tower, and Production Service Boundaries', section: '18.1' }`. A cargo crate under `examples/` is used, with `tower` (and its `util`/`limit`/`timeout`/`buffer`/`load-shed` features as needed), `axum`, and `tower-http` named directly by the syllabus; `tokio` as the async runtime underneath all three. No `sys.platform != 'win32'` guard unless a specific measurement needs one.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–16's own declared list. Chapters 1–16's *introduced* ids this chapter draws on directly: `connection-backpressure-state-machine` (Chapter 16); `io-driver-readiness-cycle`, `async-state-machine-lowering` (Chapter 9). A topic in this chapter lists in `uses` only the ones it actually relies on.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `tower-service-poll-ready-contract` | 45 | `tower::Service` is `poll_ready` plus `call`; a service reporting not-ready is a real backpressure signal, and `Buffer`'s own hidden queue can silently reintroduce an unbounded buffer if sized carelessly. |
| `tower-layer-composition-limits` | 45 | `Layer`s compose `Service`s like wrapped boxes; `ConcurrencyLimit`, `LoadShed`, `RateLimit`, and `Timeout` each bound a different real axis of a call stack under load. |
| `axum-is-tower-all-the-way-down` | 46 | Axum has no middleware system of its own — extractors, `State`, `middleware::from_fn`, and `tower-http` layers are all built on and compose through the same `Service`/`Layer` abstraction. |
| `middleware-order-changes-semantics` | 47 | `ServiceBuilder` applies its first-listed layer outermost, so reordering timeout, auth, tracing, and retry layers changes what the stack actually guarantees, not just its performance. |
| `retry-idempotency-hazard` | 47 | Retrying a non-idempotent operation without a retry budget and an idempotency key genuinely re-executes that operation's side effect, which is a correctness bug. |

## A.8 Bridges and handoffs

- **45** bridges from Chapter 16's own real handoff (this chapter's own first sentence names it directly: Chapter 16 was about one raw TCP connection's byte stream, framing, and backpressure; this chapter is about composing many such connections' worth of work behind an explicit, composable readiness contract) and continues Chapter 9's own `io-driver-readiness-cycle`/`async-state-machine-lowering`, since `poll_ready` is the same poll-based contract driving `Future::poll` itself. Hands to 46: "`Service` and `Layer` are the whole abstraction — the next question is whether a real framework actually uses them, or invents its own thing."
- **46** bridges from 45's own handoff directly, showing Axum is Tower underneath with no separate middleware system to learn. Hands to 47: "Composing layers is easy to get working, but the order you compose them in changes what the stack actually guarantees — and getting that wrong is a correctness bug, not just a style choice."
- **47** bridges from 46's own handoff directly, closing the chapter and Milestone 3. Hands off to Milestone 4, Chapter 19 (Pages, Records, and Physical Storage Layout): "This chapter was about a request arriving at a service boundary, correctly bounded and correctly ordered. The next is about what sits behind that boundary once the request lands — the storage engine's own physical layout, starting with a single page."

## A.9 Primary sources to start from (each topic must re-fetch and verify)

- The Tower Project's own documentation for `tower::Service`, `Layer`, `ServiceBuilder`, and the `ConcurrencyLimit`/`LoadShed`/`RateLimit`/`Timeout`/`Buffer` layers' own documented semantics.
- The Axum Project's own documentation for extractors, `State`, `middleware::from_fn`, the 0.8 routing syntax, and its own statement that it is built on `tower::Service`.
- The `tower-http` crate's own documentation for its middleware layers (timeout, tracing, compression, authorization).
