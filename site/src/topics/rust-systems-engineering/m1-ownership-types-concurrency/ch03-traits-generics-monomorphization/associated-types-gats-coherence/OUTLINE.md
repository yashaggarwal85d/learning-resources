# Outline: Associated types, GATs, and coherence (`rust.associated-types-gats-coherence`)

Chapter 3, topic 11 (closes the chapter). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Place an associated type against a generic parameter: an associated type is chosen once per impl (`Iterator::Item`); a generic parameter on the trait lets the same type implement it many times (`From<T>`).
2. Read a generic associated type (GAT) as an associated type that is itself generic over a lifetime, and say why a lending iterator needs one.
3. State the orphan rule, reproduce its real compile failure, and fix it with the newtype pattern; name a blanket impl and why specialization is still unstable.

## Reel steps (storyboard)

1. **"Chosen once, or chosen many times"** — `fig`: `AssocVsGeneric`. `examples/assoc_vs_generic.rs`: `Codec::Output` is picked once per impl (like `Iterator::Item`); `Meters` implements `From<i32>` and `From<f64>` separately (many impls, one per source type). Takeaway: "An associated type is chosen once per impl; a generic parameter on the trait lets the same type implement it many times."
2. **"Can the same type pick Output twice?"** (predict) — `fig`: `DuplicateImpl`. `examples/assoc_type_duplicate_fail.rs`: a second `impl Codec for A` with a different `Output`. Predict: yes, Rust picks the most recent one / no, it's a duplicate impl, rejected outright (correct) / yes, but only in different modules / no, only because `Output` differs. Correct: `error[E0119]`, conflicting implementations — a type can only implement a given trait once at all.
3. **"A generic parameter dodges that limit"** — `fig`: `GenericMultiple`. `examples/generic_param_multiple_impls.rs`: `CodecGeneric<u8>` and `CodecGeneric<u16>` for the same `A`, both compiling. `CodecGeneric<u8>` and `CodecGeneric<u16>` are different traits as far as coherence cares. No takeaway (this is the reel's "from" step).
4. **"An item that borrows from the call itself"** — `fig`: `GatLending`. `examples/gat_lending_iterator.rs`'s `LendingIterator` with `type Item<'a> where Self: 'a`: the Reference's own canonical GAT example. Each `next()` call's returned slice is tied to that one call's borrow of `&mut self`, not to one fixed type the way `Iterator::Item` is. Takeaway: "A GAT is an associated type generic over a lifetime, needed when the returned item borrows from the call itself."
5. **"Implementing a foreign trait for a foreign type"** (predict) — `fig`: `OrphanFail`. `examples/orphan_rule_fail.rs`: `impl Display for Vec<u8>`, both foreign. Predict: compiles, with a warning / fails: neither Display nor Vec is defined here (correct) / fails, but only because Vec is generic / compiles only with `unsafe`. Correct: `error[E0117]`, naming the exact rule.
6. **"A local wrapper satisfies the rule"** — `fig`: `NewtypeFix`. `examples/newtype_fix.rs`'s `struct Bytes(Vec<u8>)`: the identical `Display` impl, now legal because `Bytes` is local. Takeaway: "The newtype pattern wraps a foreign type in a local one, specifically to satisfy the orphan rule."
7. **"One impl, every type that qualifies"** — `fig`: `BlanketImpl`. `examples/blanket_impl.rs`'s `impl<T: Debug> Describe for T`, the same shape as the standard library's own `impl<T: Display> ToString for T`, covering an integer and a custom struct from one declaration. No takeaway.
8. **Recap** — associated types are chosen once per impl, generic parameters many times; a GAT ties an associated type to each call's own lifetime; the orphan rule guarantees one impl of a trait per type, program-wide, and the newtype pattern is how to satisfy it anyway; a blanket impl covers every qualifying type in one declaration. Handoff to Chapter 4: every `dyn Trait` value this chapter built was borrowed or already behind a `Box` — what shape of ownership is that `Box`, and what do `Rc`/`Arc` add when one owner stops being enough?

## Engagement arc

- Hook: step 1, against topic 10's "the trait itself" framing.
- Early predictions: step 2 (within the first four).
- Surprising number: none beyond step counts (narration spells numbers as words); the surprising *fact* is that a generic parameter and an associated type look almost identical on the page but one allows exactly one impl per type and the other allows many (steps 1–3).
- Takeaways: steps 1, 4, 6 (three; steps 2, 5's predict explains and steps 3, 7 carry their own point without a separate takeaway line).
- Recap: step 8.

## Claims list

| Claim | Source |
|---|---|
| `Iterator::Item` is chosen once per impl; a type can have only one impl of a trait, so an associated type is fixed once there | `book-advanced-traits` + `examples/assoc_vs_generic.rs`, `examples/assoc_type_one_impl.rs`, `examples/assoc_type_duplicate_fail.rs` (executed, real `E0119`) |
| A generic parameter on the trait (like `From<T>`) makes the trait different per parameter, so the same type can implement it many times | expert knowledge + `examples/generic_param_multiple_impls.rs` (executed) |
| A generic associated type is an associated type that itself takes generic parameters (commonly a lifetime), needed for a lending iterator's item to borrow from the call itself | `reference-associated-items` + `examples/gat_lending_iterator.rs` (executed) |
| The orphan rule: an impl is allowed only if the trait or one of its types is local, guaranteeing coherence | `reference-orphan-rule` + `examples/orphan_rule_fail.rs` (executed, real `E0117`), `examples/newtype_fix.rs` (executed) |
| A blanket impl implements a trait for every type satisfying a bound in one declaration, the same shape as `std`'s own `impl<T: Display> ToString for T` | `book-traits-blanket` + `examples/blanket_impl.rs` (executed) |

## Concept ledger

- `introduces`: `associated-type-vs-generic-param`, `generic-associated-types`, `orphan-rule-coherence`, `newtype-for-orphan-rule`
- `uses`: `dyn-trait-fat-pointer`
- `declared`: `traits-generics-basics`, `std-collections`

## Bridge and handoff

- Bridge: "Both answers so far assume the trait itself can be used this way — as a type parameter, or as `dyn Trait`. What decides whether it can?" (`CHAPTER.md` §A.8, reused verbatim.)
- Handoff: "Every `dyn Trait` value this chapter built was borrowed or already behind a `Box`; Chapter 4 asks what shape of ownership that `Box` actually is, and what `Rc`/`Arc` add when one owner stops being enough." (`CHAPTER.md` §A.8, reused verbatim.)
