---
title: "async/await lowering and future size"
---

## Outcomes

- Describe what `async fn` lowers to: an enum of suspension states, one per `.await` point, each holding exactly the locals still live there — and measure a real future's size to make that concrete rather than asserted.
- Explain why a future that holds a sizeable local across an `.await` point is measurably larger than one that does not, and why that size is a real cost (a `memcpy` every time the future moves) rather than a style concern.
- Reproduce the `!Send` propagation rule directly: a `!Send` value held across an `.await` point makes the entire future `!Send`, shown by the exact compiler diagnostic.

## Internals

The two examples in this topic needed no custom future type and no hand-rolled executor at all — a deliberate simplification from topic 24's `Delay`/executor pair. Measuring a future's size only requires calling the async function and passing the result to `size_of_val`, because size is a static property of the generated type, fixed at compile time, independent of whether the future is ever polled; `std::future::ready` supplies a trivially resolvable `.await` target without needing any waker machinery at all. The `!Send` example needed even less: the compiler rejects the program before it ever runs, so the "proof" is the compiler's own diagnostic text, asserted on directly rather than observed from a running process. Both examples lean on the same underlying fact this topic's claims depend on: the compiler-generated suspension-state enum is a real type with real fields, so everything that already applies to ordinary Rust types — `size_of`, auto-trait propagation — applies to it unchanged.

## In production

Clippy's `large_futures` lint exists because this topic's size measurement is exactly the kind of thing that is invisible until measured and expensive once it accumulates: a deeply nested chain of async calls, each one's future nested inside its caller's, can silently produce a future many kilobytes in size. That size is paid on every `Box::pin`, every `tokio::spawn`, and every move the executor makes between its internal task slots. The standard fix — `Box::pin`-ing the largest sub-future at its own await point — trades a single heap allocation and one level of indirection for a dramatically smaller enclosing suspension-state variant, which is a real, deliberate tradeoff production async code makes constantly, not a default applied everywhere. The `!Send` propagation rule has an equally concrete production consequence: it is exactly why `tokio::spawn` requires its future to be `Send` — a multi-threaded executor may move a suspended task to a different worker thread at any await point, and a non-`Send` value trapped in that task's suspension state would make that move unsound.

## The frontier

This topic deliberately does not attempt to show the exact layout of the generated enum (field order, discriminant placement, niche optimizations) because that layout is explicitly unspecified by the reference (`doc.rust-lang.org/reference/expressions/block-expr.html` states this directly: "The actual data format for this type is unspecified"). Different compiler versions, optimization levels, and even unrelated code changes elsewhere in the same function can change a future's exact size without changing anything this topic's claims depend on — which is precisely why the examples measure size as an empirical fact on this container's toolchain rather than asserting a specific byte count that would be fragile across Rust versions.

## Where this goes next

That state machine is just an enum, holding exactly the locals still alive at each pause point — simple, until one of those locals points at another one sitting right next to it in the same enum. What happens when the whole thing moves?
