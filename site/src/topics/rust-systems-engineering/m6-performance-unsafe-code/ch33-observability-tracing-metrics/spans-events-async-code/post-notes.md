---
title: "Spans and events in async code"
---

## Outcomes

- Measure that holding a real `Span::enter()` guard across a real `.await` genuinely misattributes a genuinely different, concurrently-running task's own event to the held span.
- Measure that `.instrument(span)` genuinely fixes it, by exiting and re-entering the span around every real `.await`.
- Measure that `#[instrument]` behaves the identical, correct way, confirming it generates the same code by hand instead of a different mechanism.
- State, from the `tracing` crate's own documentation, the real rule this topic's own code measures directly.

## Internals

`Span::enter()` returns `Entered<'_>`, a borrowing guard that, in the current `tracing` release, is still `Send` (it holds only a reference to the `Span`, which is itself `Send` and `Sync`). This is why holding it across an `.await` compiles cleanly rather than failing outright: the real mistake is not a type error, it is the thread-local span stack never being popped while the guard's own drop is deferred past the await point. `Span::entered()`, the owned variant, returns a genuinely different guard, `EnteredSpan`, which carries a deliberate `PhantomNotSend` field specifically to prevent it from being sent across a real thread boundary, since it must be dropped on the exact thread that created it.

## In production

Subscribers and layers beyond this topic's own single, minimal capturing `Layer` are how a real production system actually consumes spans and events: `tracing-subscriber`'s own formatting layers render them for a human, and `EnvFilter` lets an operator turn verbosity up or down by module or level without recompiling anything. Sampling (recording only a real fraction of spans under real production load) trades a real, measurable gap in coverage for a real, measurable reduction in overhead; at the scale of this topic's own two-task crate, that overhead is already negligible, so the real cost only shows up at a production scale this sandboxed container cannot reproduce.

## The frontier

`Span::in_scope` is the real, correct tool for entering a span around a synchronous section of code inside an async function, without ever risking holding a guard across an `.await`: it takes a plain closure, enters the span, runs the closure to completion, and exits the span the instant the closure returns, before the function can reach any await point at all. It solves a real, narrower problem than `.instrument` or `#[instrument]` (a pocket of synchronous work inside an async function, not the whole async function or block), which is why this topic measures the two broader tools directly and names this one in prose instead.

## Where this goes next

A span that survives every real await inside it tells you when something happened and for how long; it says nothing yet about what, specifically, was true while it was happening.
