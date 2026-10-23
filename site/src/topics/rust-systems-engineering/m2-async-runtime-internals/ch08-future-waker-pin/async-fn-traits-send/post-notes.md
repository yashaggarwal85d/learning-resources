---
title: "Async fn in traits and Send bounds"
---

## Outcomes

- State the Send bound problem precisely: a trait's `async fn` returns an anonymous future type, and nothing in the stable language lets a caller require that future to be `Send` — demonstrated with a real compile failure.
- Explain why a trait containing an `async fn` is not `dyn` compatible, and name the real crates that work around both gaps: `trait-variant` and `async-trait`.
- Name Return-Type Notation (RFC 3654) as the eventual, still-unstable fix, and `dynosaur` as a further workaround, without overstating what either currently guarantees.

## Internals

The two compile failures in this topic are deliberately kept separate, because they are caused by two different limitations, not one. Dyn incompatibility is about vtables: a trait object needs one concrete, uniformly-sized return type per method across every implementor, and an `async fn`'s generated future type is a different, differently-sized type per implementor — there is nothing to put a single vtable entry's return slot to. The Send bound problem is about expressiveness, not layout: the trait's signature simply has no syntax to say "and this returned type must also implement Send," so even an implementor that would happily produce a Send future cannot make that promise visible to a generic caller. `trait-variant` solves the second problem by sidestepping it — generating an entirely separate trait with the bound already written into its signature, rather than trying to add bounds to the first trait after the fact (which `CHAPTER.md` and this topic's own compile failure both confirm is not something a caller can do). `async-trait` solves the first problem the other way: it does not try to make the original, per-implementor-sized future dyn-safe at all — it erases it into a single, uniform `Pin<Box<dyn Future + Send>>` before it ever reaches the trait boundary.

## In production

This topic's allocation count (exactly one heap allocation per `async-trait`-wrapped call) is not a worst case or a contrived measurement — it is the literal, direct consequence of the `Box::pin` the macro's own documented expansion performs on every call, confirmed here with a counting global allocator rather than merely cited. Real codebases pay this deliberately: a plugin system, a middleware stack, or anything needing `Vec<Box<dyn Trait>>` has no alternative to type erasure if it also needs async methods, and one allocation per call is a genuinely small price for that flexibility in most such systems. `trait-variant`, by contrast, costs nothing at the call site — its generated trait is just an ordinary trait with an ordinary `impl Future` return — but it requires the calling code to be generic over the trait rather than working through a trait object, which is a real constraint of its own.

## The frontier

Return-Type Notation (`G::greet(): Send`) is named here as the fix the language itself is still working toward — a way to bound a trait method's return type directly, without a sibling trait or a boxed future — but as of 2026 it remains unstable, and `CHAPTER.md`'s own footnote on the stabilization blog post records that the working group originally hoped to ship it alongside `async fn` in traits and chose to cut it from scope rather than delay the feature. `dynosaur` is named as a further, more recent `dyn`-safety workaround built on different internal machinery than `async-trait`'s boxing approach; this topic does not build an executable example of it, deliberately, since nothing here was run against it.

## Where this goes next

Every piece of this chapter — the poll loop, the state machine, pinning, even where the language still falls short — was deliberately runtime-agnostic. The next question is what a real, production, multi-threaded scheduler actually does with all of it: how tasks get multiplexed onto worker threads, and what happens when one of them blocks.
