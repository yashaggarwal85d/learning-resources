# Outline: Async fn in traits and Send bounds (`rust.async-fn-traits-send`)

Chapter 8, topic 27 (fourth and last of four). Single `/make-topic` session, 2026-10-23.

## Changes from the chapter plan

`CHAPTER.md` §A.6 lists this topic's `chapter.section` as `'8.1' | '8.2'` generically; the syllabus itself places "Async fn in traits and Send bounds" under `### 8.2 The async language surface` (a different section from topics 24–26's `### 8.1 Futures as state machines`), so this topic's `registry.ts` entry uses `section: '8.2'` to match the syllabus's own structure exactly.

## Learning outcomes

1. State the Send bound problem precisely: a trait's `async fn` (or return-position `impl Trait`) returns an anonymous future type, and nothing in the stable language lets a caller require that future to be `Send` — demonstrated with a real compile failure, not merely described.
2. Explain why a trait containing an `async fn` is not `dyn` compatible, and name the real crates that work around both gaps: `trait-variant` (a generated `Send`-bounded sibling trait) and `async-trait` (type erasure into `Pin<Box<dyn Future>>`, at a real, measured allocation cost).
3. Name Return-Type Notation (RFC 3654) as the eventual, still-unstable-in-2026 fix, and `dynosaur` as a further workaround for `dyn`-safe async traits, without overstating what any of them currently guarantee.

## Reel steps (storyboard)

1. **"Can a trait's async method be called through a dyn Trait object?"** (predict, hook) — `fig`: a trait with one `async fn`, boxed as `Box<dyn Trait>`. Options: yes, exactly like any other trait method / no — the trait cannot build a vtable for it (correct) / only if the trait has no other methods.
2. **"No — the compiler's own diagnostic says exactly why"** — `fig`: `async_fn_in_trait_not_dyn_safe.rs`'s real `error[E0038]`, naming the `async` method directly. NO takeaway (first non-predict step after a predict step).
3. **"Even with a Send implementor, can a generic caller require the returned future be Send?"** (predict) — `fig`: a generic `multi_threaded_spawn` function, a generic `G: Send` implementor, and the call that should — but doesn't — type-check. Options: yes, Send implementors always produce Send futures / no — the trait itself has no way to say so (correct) / only if the method takes `&self`.
4. **"rustc's own diagnostic: the trait's future cannot be sent between threads"** — `fig`: `returned_future_not_send.rs`'s real `error[E0277]`. Takeaway: "A trait's async method gives its implementors no way to promise a Send future — even a Send implementor's call site can't require it."
5. **"trait_variant::make fixes this by generating a second, Send-bounded trait"** — `fig`: the macro's own example, quoted: one attribute generates `LocalGreeter` and a Send-bounded `Greeter` side by side. Takeaway: "trait-variant generates a Send-bounded sibling trait — the fix is a second trait, not a modification to the first."
6. **"Proven: spawned on a real thread, through the generated Send trait"** — `fig`: `trait-variant-fix`'s real cross-thread spawn, returning its result. Takeaway: "Through the trait-variant-generated trait, the identical async method's future really is Send — proven by actually spawning it on another thread."
7. **"Does fixing Send also fix dyn dispatch?"** (predict) — `fig`: the same boxed-trait-object attempt from step 1, now asked again after the Send fix. Options: yes, Send and dyn compatibility are the same gap / no — they're two separate gaps, and neither macro fixes the other alone (correct) / only for traits with one method.
8. **"async-trait fixes dyn dispatch instead — by boxing every call"** — `fig`: the crate's own documented expansion, quoted: every async method becomes `Pin<Box<dyn Future + Send>>`. Takeaway: "async-trait makes a trait dyn-safe by transforming every async method into one that returns a boxed, type-erased future."
9. **"Measured, not assumed: one real heap allocation, every call"** — `fig`: `async-trait-fix`'s real allocation count around the boxed call. Takeaway: "Dyn dispatch through async-trait costs one real heap allocation per call — a deliberate, measured tradeoff, not a hidden one."
10. **Recap** — a trait's async method is neither dyn-safe nor Send-constrainable by default, both proven with real compiler errors; trait-variant fixes the Send gap by generating a second trait; async-trait fixes the dyn gap by boxing every call, at one measured allocation; Return-Type Notation would fix the Send gap natively but is still unstable, and dynosaur is a further option for dyn-safe async traits. Handoff: everything built in this chapter was runtime-agnostic by design — the next question is what a real, production, multi-threaded scheduler does with all of it.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 7 — kept as a genuine prediction since the two gaps being separate, not the same, is the easiest claim in this topic to get wrong.
- Surprising fact: step 9 (a real, measured allocation count, not a described cost).
- Takeaways: steps 4, 5, 6, 8, 9 (five — step 2 deliberately has none, the test-harness rule).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| Rust 1.75 stabilized async fn and return-position impl Trait in traits | `blog.rust-lang.org/2023/12/21/async-fn-rpit-in-traits/` (quoted) |
| A trait with an async fn is not dyn compatible: Box<dyn Trait> fails with error E0038 | `examples/async_fn_in_trait_not_dyn_safe.rs` (executed, fails with `error[E0038]`) |
| Of particular interest to users of async are Send bounds on the returned future; since users cannot add bounds later, the trait author has to make the choice | `blog.rust-lang.org/2023/12/21/async-fn-rpit-in-traits/` (quoted) |
| Even with G: Send on a generic implementor, a trait's async method's returned future cannot be required to be Send by a generic caller, failing with error E0277 | `examples/returned_future_not_send.rs` (executed, fails with `error[E0277]`) |
| trait_variant generates a specialized version of a base trait that uses async fn and/or -> impl Trait, letting a trait author provide a Send-bounded sibling | `docs.rs/trait-variant` (quoted); `examples/trait-variant-fix/` (executed, real cross-thread spawn succeeds) |
| The stabilization of async fn in traits did not include support for dyn Trait; async-trait's own macro transforms async methods into ones returning Pin<Box<dyn Future + Send>> | `docs.rs/async-trait` (quoted); `examples/async-trait-fix/` (executed, dyn dispatch compiles, one measured heap allocation per call) |

## Concept ledger

- `introduces`: `async-trait-send-bound-gap` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `send-auto-trait`
- `declared`: []

## Bridge and handoff

- Bridge: topic 26's own handoff line, reused verbatim: "Every guarantee in this chapter so far has been about one future, running correctly, by itself. The moment a trait is asked to hand one back across a thread boundary, something the stable language still can't quite say yet gets exposed."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Every piece of this chapter — the poll loop, the state machine, pinning, even where the language still falls short — was deliberately runtime-agnostic. The next question is what a real, production, multi-threaded scheduler actually does with all of it: how tasks get multiplexed onto worker threads, and what happens when one of them blocks."
