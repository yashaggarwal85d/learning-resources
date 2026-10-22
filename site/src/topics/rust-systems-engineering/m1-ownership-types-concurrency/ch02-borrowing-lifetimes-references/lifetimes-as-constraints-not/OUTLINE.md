# Outline: Lifetimes as constraints, not durations (`rust.lifetimes-as-constraints-not`)

Chapter 2, topic 6. Single `/make-topic` session, 2026-10-22.

## Learning outcomes

1. State what a lifetime actually is (a constraint between existing references, never a change to how long a value lives) and predict elision without running rustc.
2. Place `&'a T`, `&'a mut T` and `Cell<T>` on the variance axis and explain one real failure invariance causes for each of the latter two.
3. Tell `T: 'static` apart from `&'static T` and say why the bound is rarely the right fix for an error that mentions it.

## Reel steps (storyboard)

1. **"A lifetime never extends a value's life"** — `fig`: the distinction. Chapter 1's drop-timeline mark reused: a value's lifespan (from creation to drop) is fixed by ownership; a lifetime parameter is drawn as a *span over existing borrows*, not touching the drop mark at all. Takeaway: "A lifetime describes how borrows relate to each other, not how long anything lives."
2. **"Three rules fill in what you don't write"** (predict) — `fig`: elision. Code panel: `fn substr1(s: &str, until: usize) -> &str`. Predict: which lifetime does the elided output get? Options naming each parameter / "the compiler rejects this" / "today's edition needs `'_`". Correct: the one with an input lifetime, since there's exactly one.
3. **"Elision gives up: two inputs, no receiver"** — `fig`: the E0106 case. `examples/elision_ambiguous.rs`'s `frob(s: &str, t: &str) -> &str`, the real rustc message.
4. **"Can a longer borrow stand in for a shorter one?"** — `fig`: covariance. `examples/variance_ref.rs`: a `&'static str` and a shorter `&str` passed by value to one `T: Debug`. It compiles: `&'a T` is covariant over `'a`. Takeaway: "&'a T is covariant: a longer-lived borrow can always stand in for a shorter one."
5. **"The same two references, now through a &mut"** (predict) — `fig`: invariance. `examples/variance_mut_fail.rs`'s `assign`. Predict: does swapping a shorter borrow into a `&mut &'static str` binding compile? Correct: no, E0597 — `&mut T` is invariant over `T`.
6. **"Cell<T> inherits the same invariance"** — `fig`: `Cell`. `examples/cell_invariant_fail.rs`: the identical shape of failure through `Cell<&'a str>`, because interior mutability gives `Cell`/`UnsafeCell` the same variance as `&mut T`. Takeaway: "Anything that lets you write through a shared reference is invariant in what it holds."
7. **"A lifetime that can't be named until the call happens"** — `fig`: HRTB. `examples/hrtb.rs`'s `Closure<F>`; `call`'s `&self` lifetime isn't fixed, so the bound on `F` is written `for<'a> F: Fn(&'a (u8, u16)) -> &'a u8` — "for all choices of `'a`." Takeaway: "A higher-ranked bound is a bound that holds for every lifetime, not one the caller picks."
8. **"T: 'static is not a promise that a value lives forever"** (predict) — `fig`: the bound vs. the reference. `examples/static_bound_fail.rs`'s `print_it(impl Debug + 'static)` called with an owned `i` (fine) and `&i` (rejected). Predict which call fails. Correct: `print_it(&i)`, E0597.
9. **"The one case the bound really is the fix"** — `fig`: `Box::leak`. `examples/box_leak.rs` mints a genuine `&'static u32` at run time, deliberately skipping its destructor (Chapter 1's leak-safety topic). Takeaway: "Minting real `'static` data is rare and explicit; patching an error with it almost never is."
10. **Recap** — lifetime as constraint not duration; elision's three rules and its one failure mode; covariance vs. invariance (`&T` vs. `&mut T`/`Cell<T>`); the higher-ranked bound; `T: 'static` vs. `&'static T`. Handoff to topic 7: every lifetime here named one reference; a parser returns many, all borrowed from one buffer.

## Engagement arc

- Hook: step 1, against Chapter 1's own drop-timeline mark.
- Early predictions: step 2 (within the first four) and step 5 and step 8.
- Surprising number: none needed (no digits beyond step counts); the surprising *fact* is that the covariant and invariant examples use the literal same two references, one compiles, one doesn't (steps 4 and 5).
- Takeaways: steps 1, 4, 6, 7, 9 (five).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| A lifetime describes how existing references relate, never extends a value's life | `reference-lifetime-elision` (framing) + expert knowledge |
| The three elision rules; the two illegal cases | `reference-lifetime-elision` + `examples/elision.rs`, `examples/elision_ambiguous.rs` (executed) |
| `&'a T` covariant over `'a`; `&'a mut T`, `Cell<T>`/`UnsafeCell<T>` invariant over `T` | `nomicon-subtyping` + `examples/variance_ref.rs`, `examples/variance_mut_fail.rs`, `examples/cell_invariant_fail.rs` (executed) |
| `for<'a> F: Fn(&'a (u8,u16)) -> &'a u8` as the desugaring of an elided `Fn` bound whose lifetime can't be named until the call | `nomicon-hrtb` + `examples/hrtb.rs` (executed) |
| `T: 'static` means "no non-static borrows in T"; `&'static T` means the referent lives for the program; owned data always satisfies the bound, a local borrow generally doesn't | `rbe-static-lifetime` + `examples/static_bound_fail.rs` (executed) |
| `Box::leak` mints a genuine `&'static` reference at run time | `rbe-static-lifetime` + `examples/box_leak.rs` (executed) |

## Concept ledger

- `introduces`: `lifetime-as-constraint`, `lifetime-elision`, `variance-of-references`, `higher-ranked-trait-bounds`, `static-bound-vs-static-ref`
- `uses`: `ownership-signatures`, `references-basics` is declared not used-id; actually used registry ids: `ownership-signatures`, `aliasing-xor-mutability`, `reborrowing`
- `declared`: `references-basics`, `structs-enums`, `traits-generics-basics`, `closures-basics`

## Bridge and handoff

- Bridge: "The rule says how many borrows, of what kind, at once. Now: it says nothing yet about how long, that is a lifetime." (topic 5's real handoff, reused verbatim.)
- Handoff: "Every lifetime here named one reference. Next: a parser that returns many borrowed views, all tied to one buffer, what shape does that take?"
