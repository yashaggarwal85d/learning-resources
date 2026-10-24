---
title: "Pin and self-referential state"
---

## Outcomes

- State precisely why `Pin` exists: a value that holds a reference into its own fields is sound only as long as it never moves after that reference is formed, and the compiler-generated async state machine is the standard-library-named example of exactly such a value.
- Read `Pin<&mut Self>` and `Unpin` correctly: `Pin<Ptr>` is a promise that a pointer's pointee will not move, enforced by the type, not a container; `Unpin` is auto-implemented for almost every type and opts a type back out of needing that promise at all.
- Distinguish structural from non-structural pin projection: a field projects to `Pin<&mut Field>` only when pinning that field is declared structural; every other field projects to an ordinary reference.

## Internals

Every example in this topic uses a hand-written struct standing in for the compiler's own generated state machine, because the standard library names that generated type as the canonical case rather than something this topic can print the layout of directly (its layout is explicitly unspecified). The self-reference example avoids any true undefined behavior: it only compares pointer *addresses* after the move, never dereferences the stale pointer, which is enough to prove the pointer is wrong without ever reading through it. `Pin` itself is not a container that moves a value anywhere different — `Box::pin` and the `pin!` macro both still place the value exactly where it would otherwise go (the heap, or the stack); what changes is which operations the safe API exposes afterward. A `Pin<Box<T>>` only hands back a plain, ownable `T` through `DerefMut` when `T: Unpin` — when it is not, the compiler has nothing to move out of, which is why `move_out_of_pin_fails.rs` fails with a real, specific error rather than merely being discouraged.

## In production

Almost no production code writes pin projection by hand with `unsafe`, because getting structural vs non-structural projection wrong does not produce a compile error — it produces a value that is unsound to move, discovered later as undefined behavior rather than caught at the point of the mistake. `pin-project-lite` (and its larger sibling `pin-project`) exists specifically to generate that unsafe code correctly from a declarative `#[pin]` annotation, which is why this topic's structural-projection example is a real dependency rather than a hand-rolled unsafe block. Every executor built on top of `Future` — including the hand-rolled one from topic 24 and Tokio in the next chapter — depends on exactly this guarantee: once a future is polled for the first time, the executor is free to assume it will never move again, which is precisely the promise `Pin<&mut Self>` in `Future::poll`'s own signature is making.

## The frontier

This topic's self-referential struct is a deliberately simplified stand-in, not a literal reproduction of what `async fn` actually generates — the real generated enum's field layout, discriminant placement, and niche optimizations are explicitly unspecified and can change between compiler versions without changing anything this topic's claims depend on. Likewise, `pin-project-lite`'s own documentation is explicit that it is a *lightweight* version of `pin-project`: it supports fewer cases (no custom `Unpin` implementations, no tuple structs or variants) in exchange for no proc-macro dependency, a tradeoff real crates choose deliberately rather than by default.

## Where this goes next

Every guarantee in this chapter so far has been about one future, running correctly, by itself. The moment a trait is asked to hand one back across a thread boundary, something the stable language still can't quite say yet gets exposed.
