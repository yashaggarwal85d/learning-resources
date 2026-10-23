# Outline — Size, alignment, and padding rules

## Learning outcomes
- Compute a struct's size and a field's offset from its fields' sizes, alignments, and order alone, and state the two rules that always hold: size is a multiple of alignment, and a field's offset is a multiple of its own alignment.
- Explain why `repr(Rust)` (the default) can reorder fields and is not a layout contract, and demonstrate it moving under `-Z randomize-layout`.
- Use `offset_of!` and a compile-time assertion to make a layout claim something the build itself checks, and recognize `error[E0080]` as that check failing.

## Engagement arc
- Hook (step 1): the same four fields, declared in reverse order, get exactly the same 8-byte layout under `repr(Rust)` — the compiler already picked the best order on its own, regardless of what was written.
- Predict 1 (step 2, within the first four): "does writing a struct's fields in a different order ever change its size?" — the reader has just seen "no" under `repr(Rust)`; the predict asks whether that's always true.
- Predict 2 (step 5): "what happens when a compile-time layout assertion is simply wrong?" — before revealing the actual compiler error.
- Surprising number: `repr(C)`'s "Bad" field order costs 12 bytes for the same four fields that cost 8 in the "Good" order — 50% more, from reordering alone.
- Takeaways: step 1, step 4, step 6, plus the recap.
- Recap (step 7): layout is the compiler's choice until you fix it with `repr(C)` and check it.

## Steps

### 1. Same four fields, two orders — one repr(Rust) layout
- fig: `ReprRustSame`
- Visual idea: a byte ruler (8 cells, offsets labelled) under each of two struct declarations with the same four fields in opposite written order; both rulers end up identical.
- On screen: two small struct snippets (`version, flags, length, seq` vs `seq, length, version, flags`), each above its own byte ruler; a draw reveals the ruler cells for each, then both rulers overlay/align to show they match.
- What moves on which beat: the code panel draws in; then each ruler's 8 cells draw in sequence (fields as bracketed spans); then a brief highlight shows both rulers are identical.
- Real values: `size_of::<HeaderAB>() = size_of::<HeaderBA>() = 8`, from `repr_rust_reorders.rs`.
- Final frame: both 8-byte rulers side by side, visually identical.
- Caption point: the two source orders produced the same layout.
- Narrator's line of thought: she doesn't just report the numbers — she poses the real question underneath: a struct's size is always a multiple of its alignment, but *which* multiple depends on how the fields are arranged, and the arranging is not yours to decide under the default representation; the compiler already found the best arrangement for you, which is why these two "different" structs aren't different at all.
- Takeaway (≤20 words): `repr(Rust)` is free to reorder a struct's fields, and usually already picks the smallest layout it can.

### 2. Does field order ever change a struct's size? (predict)
- fig: `OrderMattersPredict`
- Visual idea: the same four fields, now framed as a question — "reorder them again: does the size ever change?" — with two or three answer options.
- On screen: the two struct snippets again, side by side, with an unresolved question mark over a byte-ruler outline.
- What moves: the code panel draws, then the prediction options fade in.
- Options: "Never — the compiler always picks the smallest layout" (tempting: step 1 just showed exactly this); "Yes, once the layout is pinned to source order" (correct); "Only for types larger than one cache line" (a plausible-sounding but invented threshold with no basis).
- Answer: yes — once a representation fixes field order to the order in source (as `repr(C)` does), reordering genuinely changes the padding and the total size.
- Narrator's line of thought: she doesn't let "the compiler always optimizes it" stand unchallenged — that was only ever true because nothing forced the order to stay as written; the moment something does force it, the saving disappears and the programmer's own choice of order starts costing real bytes.

### 3. repr(C): the same reorder, now it costs four bytes (no takeaway — the reel's "from" step)
- fig: `ReprCDiffers`
- Visual idea: the same byte ruler idea, now for two `repr(C)` versions of the header with one field moved — "Good" ends at 8 bytes, "Bad" ends at 12, with the extra padding cells drawn hatched, not blank.
- On screen: `Good` and `Bad` struct snippets stacked vertically, each with its own byte ruler underneath, the "Bad" ruler visibly longer with two hatched padding cells.
- What moves: `Good`'s ruler draws first (8 cells, no gaps); then `Bad`'s draws (12 cells, with two cells drawn hatched where `flags`' single byte forces three padding bytes before the next `u32`).
- Real values: `size_of::<Good>() = 8`, `size_of::<Bad>() = 12`, from `repr_c_field_order_matters.rs`.
- Final frame: both rulers stacked, the extra length and the hatched padding cells plainly visible on `Bad`.
- Caption point: under a fixed field order, the order itself decides how much padding gets inserted.
- Narrator's line of thought: she walks through exactly why — `flags` is one byte, but the next field, `length`, needs to start on a two-byte boundary, so one byte of hatched padding appears right after `flags`; worse, `seq` after that needs a four-byte boundary, so three more bytes of padding appear before it — bytes that would never have existed had `length` simply come right after `version` and `flags` the way the "Good" order does.

### 4. offset_of! and a compile-time assertion make the claim checkable
- fig: `OffsetsChecked`
- Visual idea: the `repr(C)` header's byte ruler again, now with each field's offset labelled by an `offset_of!` call, and a small "✓" badge appearing next to a `const` assertion line.
- On screen: the header's byte ruler with four offset labels drawn in (`version=0`, `flags=1`, `length=2`, `seq=4`); below it, two lines of code (`const _: () = assert!(...)`) with a checkmark appearing once each is shown to hold.
- What moves: the ruler and its four offset labels draw in one by one; then each assertion line draws in with its checkmark appearing right after.
- Real values: offsets `0, 1, 2, 4`, from `offsets_checked.rs`.
- Final frame: the ruler with all four offsets labelled, both assertions checked.
- Caption point: `offset_of!` computes a real offset, and a `const` assertion lets the build check a layout claim itself.
- Narrator's line of thought: she stresses the difference between knowing a number and the build *verifying* it — a comment saying "seq is at offset four" can silently go stale the next time a field is added or removed, but a `const` assertion using that exact number fails to compile the instant it stops being true, which is a fundamentally stronger guarantee than a comment anyone could have written.
- Takeaway (≤20 words): `offset_of!` plus a compile-time assertion turn a layout assumption into something the build itself checks.

### 5. What happens when the claim is wrong? (predict)
- fig: `AssertionFailPredict`
- Visual idea: the same assertion line, now claiming `seq`'s offset is `999` — an obviously false number — with the question "what happens when this is built?"
- On screen: one line of code, `const _: () = assert!(offset_of!(Header, seq) == 999);`, with a question mark where a compiler verdict would appear.
- What moves: the code line draws, then the prediction options fade in.
- Options: "It compiles, and panics the first time the program runs" (tempting: sounds like a normal `assert!`, but this one is `const`); "It fails to compile, before the program can even exist" (correct); "It's silently ignored, since offset_of! is only diagnostic" (invented, no basis).
- Answer: it fails to compile — a `const` context's `assert!` is evaluated at compile time, so a false claim is a compile error, not a runtime one.
- Narrator's line of thought: she makes the contrast explicit — an ordinary `assert!` only ever fires if that line of code actually runs; a `const` one is evaluated by the compiler itself while it's still building the program, so a false layout claim never even gets the chance to ship.

### 6. -Z randomize-layout: the same struct, shuffled on purpose
- fig: `RandomizeLayout`
- Visual idea: one eight-field struct's byte ruler, redrawn twice under two different `-Z layout-seed` values, with the field spans visibly in different positions each time (and the total ruler length differing too).
- On screen: the eight-field struct's code, then two byte rulers stacked, each labelled by its seed, fields drawn as colour-matched spans so the same field's new position is easy to track between the two.
- What moves: the code draws; then the first ruler's eight field spans draw into one arrangement; then the second ruler's eight spans draw into a visibly different arrangement (and a different total length).
- Real values: the two real `-Z layout-seed` runs' sizes and offsets, from `randomize_layout.rs` (exact numbers recorded in `post-notes.md`, since they are an implementation detail of one compiler build and could legitimately change).
- Final frame: both rulers side by side, visibly different arrangements of the same eight fields.
- Caption point: the same source, the same compiler, two different layouts — on purpose.
- Narrator's line of thought: she ties it back to step 1 directly — nothing here is a bug; `-Z randomize-layout` exists precisely to turn "the compiler happens to lay this out one way today" into "the compiler will happily lay this out a different way tomorrow," so any code quietly relying on one particular `repr(Rust)` arrangement finds out immediately, in testing, instead of after it ships.
- Takeaway (≤20 words): `-Z randomize-layout` deliberately changes a `repr(Rust)` type's layout between builds, exposing code that wrongly assumed one.

### 7. Recap: layout is the compiler's choice, until you fix it
- fig: `Recap`
- Visual idea: four short lines, each with the chapter's dot-accent, recapping the whole arc.
- Rows: "size is always a multiple of alignment"; "under repr(Rust), field order is the compiler's to pick"; "under repr(C), the order you write is the order you pay for"; "offset_of! and a compile-time assertion make the claim checkable, not assumed".

## Post-notes headings
- **Internals**: how `repr(Rust)`'s layout algorithm actually orders fields today (largest-alignment-first, a real but unstable optimization), and what `-Z randomize-layout`'s tracking issue says about its limits.
- **Lab**: the chapter's own lab line — build a C-compatible packet header, verify its layout against what a C compiler would produce, then show a niche changing `Option<T>`'s size (a brief, concrete coda using `Option<&u8>` vs `Option<u8>`).
- **In production**: a real `transmute`/pointer-cast bug class this topic's next topic (17) exists to fix, named here so the handoff is concrete, not abstract.
- **The frontier**: niche optimization (`repr(packed)`, `repr(align(N))`) that this chapter's syllabus marks `(skipped)`, and why `-Z randomize-layout` is still nightly-only years after its tracking issue opened.
- **Where this goes next**: hands off to topic 17's safe byte-level views.

## Examples to execute
1. `repr_rust_reorders.rs` — `repr(Rust)`, two field orders, same size.
2. `repr_c_field_order_matters.rs` — `repr(C)`, two field orders, different sizes (8 vs 12).
3. `offsets_checked.rs` — `offset_of!` plus two passing compile-time assertions.
4. `offset_assertion_fail.rs` — a false compile-time assertion, asserted to fail with `error[E0080]`.
5. `randomize_layout.rs` — the same source, compiled twice on nightly with two different `-Z layout-seed` values, asserted to produce different output.

## Bridge and handoff
- Bridge (from Chapter 4's real closing content, not topic 15's mistaken handoff line — see `CHAPTER.md` §A.8): every guarantee the previous four topics made was about who may own and mutate a value, never about the value's own bytes; this topic opens on the same four fields changing shape purely from how they're arranged.
- Handoff: `repr(Rust)` was never a promise, and the compiler is free to change its mind about where every byte goes. What does a program do when the layout is not the compiler's to choose — when it's fixed by whatever sent the bytes in the first place?

## Concept ledger
- `introduces`: `size-alignment-invariant`, `padding-depends-on-field-order`, `repr-rust-unstable-layout`, `checked-layout-assertions`
- `uses`: (none from earlier chapters — type layout is orthogonal to ownership)
- `declared`: `structs-enums`, `rust-basics`
