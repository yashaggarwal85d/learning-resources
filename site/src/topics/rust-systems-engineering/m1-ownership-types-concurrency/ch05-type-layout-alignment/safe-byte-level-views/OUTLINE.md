# Outline — Safe byte-level views of structs

## Learning outcomes
- State why reading a struct's padding bytes as part of a value is undefined behaviour, and why that makes a hand-rolled `transmute`/pointer-cast reinterpret of a byte buffer unsound in general.
- Use a derive-checked crate (`bytemuck`'s `Pod`/`Zeroable`) to view a byte buffer as a struct safely, and recognize that the derive itself refuses to compile a type with padding.
- Pick an explicit byte order (`to_be_bytes`/`from_be_bytes` or `to_le_bytes`/`from_le_bytes`) for any value crossing a wire or a file, and explain why the platform's native order is not portable.

## Engagement arc
- Hook (step 1): the previous topic's own "Bad" field order — the one with real padding bytes — is exactly the shape that makes a byte-buffer reinterpret unsound; bring it back as the running example.
- Predict 1 (step 2, within the first four): "does bytemuck's Pod derive accept the padded Bad header?" — testing whether the reader has internalized topic 16's padding lesson as a safety property, not just a size number.
- Predict 2 (step 5): "read the same two wire bytes on this little-endian machine without picking a byte order — what comes out?" — before revealing the wrong number.
- Surprising number: reading the identical two wire bytes as big-endian gives ten thousand; reading them in this platform's native order gives a completely different number, from the exact same bytes.
- Takeaways: step 1, step 3, step 6, plus the recap.
- Recap (step 7): padding bytes are real and unsafe to read blind; a derive-checked view and an explicit byte order are what make reading someone else's bytes sound.

## Steps

### 1. The same padding that cost bytes now costs soundness
- fig: `PaddingIsUB`
- Visual idea: the "Bad" header's byte ruler from topic 16 (hatched padding cells), now with a magnifying glass or highlight on exactly the hatched cells, relabelled "never written" instead of just "padding".
- On screen: the Bad header's byte ruler (reused shape from topic 16's step 3), with the two hatched padding regions highlighted and a short caption underneath.
- What moves: the ruler draws in (fields first, solid), then the padding cells redraw highlighted with a "?" mark, then a caption fades in.
- Real values: the same offsets as topic 16's Bad ordering (no new numbers; purely conceptual framing).
- Final frame: the ruler with both padding regions marked "never written", not merely "unused".
- Caption point: padding bytes aren't zero or blank by guarantee — they're whatever was already there, possibly never initialized at all.
- Narrator's line of thought: she connects this directly back to the previous topic — the padding that cost four extra bytes there is the same padding that makes reading this struct's raw bytes back unsound here; a byte that was never written is not a safe value of any type, and a plain `transmute` or pointer-cast has no way to know or check that.
- Takeaway (≤20 words): A struct's padding bytes are never guaranteed initialized, so reading them back as a value is undefined behaviour.

### 2. Does a derive-checked view accept the padded header? (predict)
- fig: `PodDerivePredict`
- Visual idea: the padded "Bad" header's code, with `#[derive(Pod, Zeroable)]` added, and a question mark where a compiler verdict belongs.
- On screen: the struct's code with the derive attribute, a question mark over it.
- What moves: the code draws, then the prediction options fade in.
- Options: "Yes — Pod only checks the fields, not the gaps between them" (tempting: sounds like it matches size/align, not padding); "No — the derive refuses to compile a type with padding" (correct); "Yes, but every read panics at run time" (invented, no basis).
- Answer: no — the derive itself checks for padding at compile time and refuses to compile if any exists, rather than compiling something unsound and failing (or not) later.
- Narrator's line of thought: she highlights exactly what's being checked and when — not a runtime check on each read, but a one-time, compile-time proof about the type's shape itself, which is strictly stronger than trusting a programmer to remember which field orders are safe.

### 3. A padding-free header, read with no unsafe code at all (no takeaway — the reel's "from" step)
- fig: `BytemuckSafeRead`
- Visual idea: the "Good" (no-padding) header's byte ruler, with a byte buffer below it, and an arrow showing the buffer being viewed directly as the struct — no copy, no unsafe block drawn anywhere.
- On screen: eight labelled byte cells (the raw buffer) above, the Good header's field spans below, connected by a single "viewed as" arrow; real field values shown as the arrow completes.
- What moves: the buffer's eight cells draw in with real byte values; the arrow draws from buffer to struct; then each field's real value fades in under its span.
- Real values: the buffer's bytes and the four decoded field values, from `bytemuck_header_safe.rs`.
- Final frame: buffer and struct side by side, connected, with every field's real value shown.
- Caption point: the exact same bytes, viewed as the struct, with nothing copied and nothing unsafe.
- Narrator's line of thought: she draws the contrast with a hand-written `transmute` explicitly — this isn't skipping the check, it's moving the check earlier: the type itself was proven, once, to have no padding and a fixed layout, so viewing a buffer this way needs no per-call unsafety at all.

### 4. What derive(Pod) actually checks
- fig: `PodDeriveRejects`
- Visual idea: the padded header's code with the derive attribute, and the real compiler error appearing beneath it, naming padding explicitly as the cause.
- On screen: the padded struct's code, then a short error panel reading the real diagnostic (padding named as the reason), with a "refused to compile" stamp.
- What moves: the code draws; then the error panel draws in below it, text appearing as if typed by the compiler itself.
- Real values: the real `error[E0080]` diagnostic text from `bytemuck_padded_header_fails.rs`, naming padding as the cause.
- Final frame: code plus the real refusal, side by side.
- Caption point: the derive doesn't just check size and alignment — it checks for padding specifically, by name.
- Narrator's line of thought: she makes the point precise — this isn't a generic "something's wrong" error; the compiler's own message names padding as the exact reason, because the derive is checking for the exact property that makes reading a type's bytes back unsound, not merely checking that the numbers add up.
- Takeaway (≤20 words): bytemuck's Pod derive checks for padding once, at compile time, instead of trusting every call site to get it right.

### 5. Read the same two wire bytes without choosing a byte order (predict)
- fig: `EndiannessPredict`
- Visual idea: two wire bytes, with two unlabeled arrows pointing at two different possible readings.
- On screen: the two raw bytes, large, with a question mark over "what number is this?".
- What moves: the two bytes draw in, then the prediction options fade in.
- Options: "The same number either way — bytes are bytes" (tempting, and wrong); "Two different numbers, depending on which byte order you read them in" (correct); "It depends only on the field's type, not the platform" (invented, no basis).
- Answer: two different numbers — the wire format's own byte order (here, big-endian) gives the correct value; reading the identical bytes in this machine's native order gives a different, wrong one.
- Narrator's line of thought: she names the trap directly — "native" sounds like it should be the safe default, but native is a property of whichever machine happens to be running the code, never a property of the bytes themselves, so it's the one choice that's actively wrong for data that came from somewhere else.

### 6. Big-endian, little-endian, and the one wrong default
- fig: `EndiannessFig`
- Visual idea: the same two wire bytes, decoded three ways side by side — big-endian, little-endian, native — with the correct one highlighted.
- On screen: three small decode panels, each showing the same two input bytes and a different resulting number; the big-endian panel (the wire format's real choice here) highlighted.
- What moves: the three panels draw in one after another, each revealing its decoded number.
- Real values: the real decoded numbers from `endianness_mismatch.rs` (big-endian and native; little-endian shown as the complementary case for completeness, computed the same way).
- Final frame: three panels, one highlighted as correct for this wire format.
- Caption point: the wire format decides the byte order; the reading code must match it explicitly, never assume it.
- Narrator's line of thought: she ties this back to the whole topic's throughline — a derive-checked view handles the struct's own layout safely, but it says nothing about which byte order a multi-byte field's bytes are actually in; that's a second, independent choice the wire format itself makes, and the reading code has to match it on purpose.
- Takeaway (≤20 words): A wire format's byte order is its own explicit choice; reading in the platform's native order instead is a real, silent bug.

### 7. Recap: padding is real, and bytes need a byte order
- fig: `Recap`
- Visual idea: four short lines, dot-accented, recapping the whole arc.
- Rows: "a struct's padding bytes are never guaranteed initialized"; "a derive-checked view refuses to compile a type with padding"; "reading that way needs no unsafe code at all"; "a wire format's byte order is its own choice, never assumed".

## Post-notes headings
- **Internals**: how bytemuck's derive actually proves "no padding" (reusing `size_of`/`align_of` at compile time, the same facts topic 16 built), and what `Pod` adds on top of `NoUninit`.
- **Lab**: the chapter's lab line in full — define a C-compatible packet header, verify it against a C compiler, and show how `repr(Rust)` (not `repr(C)`) would have broken the same assumption, closing the loop back to topic 16.
- **In production**: a real-world class of parser bug this topic's derive check exists to prevent (reading a file format's header via a raw cast, silently depending on padding or struct layout matching the file's own).
- **The frontier**: `zerocopy`'s alternative design (named, not built, since bytemuck was this chapter's pick) and why Rust still has no first-class, built-in equivalent of either crate.
- **Where this goes next**: hands off to Chapter 6 (Send, Sync, Arc, Mutex, and Ownership Across Threads).

## Examples to execute
1. `bytemuck_header_safe.rs` (cargo) — a padding-free `repr(C)` header deriving `Pod`/`Zeroable`, read from a real byte buffer via `bytemuck::from_bytes`.
2. `bytemuck_padded_header_fails.rs` (cargo) — the padded field order, asserted to fail to compile, naming padding as the reason.
3. `endianness_mismatch.rs` (bare rustc) — the same two wire bytes decoded as big-endian (correct) and native order (wrong on this little-endian sandbox).

## Bridge and handoff
- Bridge: the previous topic's padded field order, which only ever cost extra bytes there, turns out to be exactly the shape that makes reading a byte buffer back as that struct unsound — this topic opens by returning to it.
- Handoff: every guarantee this chapter made was about one value's own layout, standing still, inside one process; the next chapter asks the question Chapter 4 touched but never made precise — which of a type's guarantees survive being handed to another thread at all?

## Concept ledger
- `introduces`: `repr-c-fixed-layout`, `padding-read-is-ub`, `derive-checked-byte-view`
- `uses`: `size-alignment-invariant`, `padding-depends-on-field-order`
- `declared`: `structs-enums`, `error-handling-result`
