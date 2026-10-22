# Outline: Zero-copy parsing with borrowed views (`rust.zero-copy-parsing-borrowed`)

Chapter 2, topic 7. Single `/make-topic` session, 2026-10-22.

## Learning outcomes

1. Write and read a `fn parse<'a>(buf: &'a [u8]) -> Header<'a>` whose output borrows straight out of the input, and say why that borrow can never outlive `buf`.
2. Choose between `&'a [u8]`, `Cow<'a, [u8]>` and an owned `Vec<u8>` for a mostly-read workload, and predict when a `Cow` actually clones.
3. Explain why `bytes::Bytes` can escape a scope a plain borrow cannot, and why a self-referencing struct needs a crate like `yoke` or `ouroboros` (or real `unsafe`) instead of compiling as plain Rust.

## Reel steps (storyboard)

1. **"A parser that copies nothing"** — `fig`: the shape. `examples/zero_copy_parse.rs`'s `Header<'a>`, fields that are plain subslices of `buf`. Takeaway: "Every field of Header points straight into the caller's own bytes."
2. **"Does Header outlive the buffer it was parsed from?"** (predict) — `fig`: the lifetime tie. Predict: can `Header<'a>` be returned from a function that owns `buf` as a local `Vec<u8>`? Correct: no — the borrow can never outlive what it borrows from.
3. **"The attempt, and the error it earns"** — `fig`: `examples/owned_vs_borrowed_fail.rs`, the real `E0515`. No takeaway on this step (see Engagement arc).
4. **"Cow: borrowed until something needs to change"** — `fig`: the std docs' own `abs_all`. `examples/cow_example.rs`: a read-only pass stays `Cow::Borrowed`; a mutating pass clones into `Cow::Owned`. Takeaway: "A Cow cloning is not a mystery: it happens exactly once, the first time `to_mut` is called."
5. **"Which call actually clones?"** (predict) — `fig`: same `abs_all`, two different inputs. Predict: which of the two calls (all non-negative vs. one negative) triggers the clone? Correct: only the one with a negative value.
6. **"bytes::Bytes: owning the share, not borrowing it"** — `fig`: `examples/bytes_share.rs`. A `Bytes` built from an owned `Vec<u8>` is returned freely, then cloned (reference count, no copy) and sliced (same shared memory, no copy). Takeaway: "Bytes escapes the scope a plain borrow can't, because cloning it shares a reference count instead of borrowing someone else's slice."
7. **"A struct that borrows its own field"** — `fig`: the naive self-referential attempt. `examples/self_ref_fail.rs`'s `Parsed`, the real `E0515`/`E0505` pair. Takeaway: "Plain Rust refuses to let a struct hold a reference into one of its own fields."
8. **"ouroboros makes the same shape safe"** (predict) — `fig`: `examples/ouroboros_works.rs`. Predict: does the ouroboros version of the identical shape (owner field + view field borrowing it) compile? Correct: yes, via `#[self_referencing]` and a generated builder.
9. **"Why yoke and ouroboros exist at all"** — `fig`: `Yoke<Y, C>`'s own framing (erasing a static lifetime into a dynamic one, by analogy with `dyn` erasing a static type). Takeaway: "These crates exist because self-referencing structs are useful and genuinely need checked (or careful unsafe) help to build, not because the borrow checker is being unreasonable."
10. **Recap** — zero-copy means the parsed view's fields point at the original buffer; `&'a [u8]` can never outlive what it borrows; `Cow` defers the clone until mutation; `Bytes` escapes scope by owning a refcounted share instead of borrowing; a self-referencing struct needs `yoke`/`ouroboros`/`unsafe`, not plain references. Handoff to topic 8: every one of these views still lived on one thread; next, what happens when a borrow has to cross a thread or task boundary.

## Engagement arc

- Hook: step 1, the "copies nothing" claim against a concrete struct.
- Early predictions: step 2 (within the first four) and step 5 and step 8.
- Surprising fact: steps 4/5 show the same two-line function either clones or doesn't depending only on the data, same as topic 6's covariant/invariant pairing.
- Takeaways: steps 1, 4, 6, 7, 9 (five) — deliberately not step 3 (the first non-predict step at dot index ≥ 1, which `tests/reels.mjs`'s phone caption-swipe check exercises; see [[learning-resources-scenes-reel-gotchas]] in project memory).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| `Header<'a>`'s fields are plain subslices of `buf`, pointing at the same memory (verified by pointer equality) | expert knowledge + `examples/zero_copy_parse.rs` (executed) |
| A `&'a [u8]` cannot be returned from a function that owns its buffer as a local `Vec<u8>`: `E0515` | `examples/owned_vs_borrowed_fail.rs` (executed) |
| `Cow::Borrowed`/`Cow::Owned`, `to_mut` clones only if not already owned, the `abs_all` example's behaviour | `cow-std` + `examples/cow_example.rs` (executed) |
| `bytes::Bytes` is cheaply cloneable (reference count) and sliceable without copying, and can be built from an owned buffer and returned freely | `bytes-docs` + `examples/bytes_share.rs` (executed) |
| A naive self-referencing struct (an owned field plus a reference into that same field) fails to compile: `E0515` and `E0505` | `examples/self_ref_fail.rs` (executed) |
| ouroboros's `#[self_referencing]` + `#[borrows(...)]` builds the identical shape safely | `ouroboros-self_referencing` + `examples/ouroboros_works.rs` (executed) |
| `Yoke<Y, C>` attaches a zero-copy object to its backing "cart", described as erasing a static lifetime into a dynamic one | `yoke-docs` |

## Concept ledger

- `introduces`: `zero-copy-view`, `cow-clone-on-write`, `refcounted-bytes`, `self-referencing-struct`
- `uses`: `ownership-signatures`, `lifetimes-as-constraints-not`, `aliasing-xor-mutability`
- `declared`: `references-basics`, `structs-enums`, `std-collections`, `rc-arc-refcount`

## Bridge and handoff

- Bridge: "Every lifetime last topic named belonged to one reference at a time. Now: a parser that hands back many borrowed views at once, all tied to the lifetime of one input buffer."
- Handoff: "Every one of these views lived on a single thread. Next: what a thread::spawn or tokio::spawn actually requires of a borrow that wants to cross into another task."
