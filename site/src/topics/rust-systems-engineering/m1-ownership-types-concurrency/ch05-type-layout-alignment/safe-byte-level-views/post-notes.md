---
title: "Safe byte-level views of structs"
---

## Outcomes

- State why reading a struct's padding bytes as part of a value is undefined behaviour, and why that makes a hand-rolled `transmute`/pointer-cast reinterpret of a byte buffer unsound in general.
- Use a derive-checked crate (`bytemuck`'s `Pod`/`Zeroable`) to view a byte buffer as a struct safely, and recognize that the derive itself refuses to compile a type with padding.
- Pick an explicit byte order (`to_be_bytes`/`from_be_bytes` or `to_le_bytes`/`from_le_bytes`) for any value crossing a wire or a file, and explain why the platform's native order is not portable.

## Internals

bytemuck's own documentation describes five basic casting forms (`T`, `&T`, `&mut T`, `&[T]`, `&mut [T]`), each gated by one of two marker traits: "Depending on the function, the NoUninit and/or AnyBitPattern traits are used to maintain memory safety." `NoUninit` is specifically "Marker trait for 'plain old data' types with no uninit (or padding) bytes" — it rules out padding and nothing more. `Pod` ("Marker trait for 'plain old data'") is the strongest of the family, a sub-trait of `Zeroable`, and additionally requires that any all-zero bit pattern be a valid value of the type — a separate property from simply having no padding. The derive macros check these properties mechanically, from the same layout facts topic 16's `size_of`/`align_of`/`offset_of!` compute: "The derive macros will perform the necessary checks on your type declaration, and trigger an error if your type does not qualify." There is no way to silence this check short of actually removing the padding, which is precisely the point: `bytemuck_padded_header_fails.rs` in this topic's examples fails with `error[E0080]: evaluation panicked: derive(Pod) was applied to a type with padding`, naming the exact property it refused.

It's worth being precise about what `bytemuck::from_bytes` does and doesn't check. The `Pod`/`NoUninit` bound on the target type is a compile-time fact about the type's own layout, verified once. The function itself still performs a real run-time check on its *argument* — the byte slice's length and alignment must actually match the target type, or the call panics. These are two different kinds of safety: one proven about the type before any bytes exist, the other checked against the specific bytes handed over at the call site.

## Lab

The chapter's own lab line asks for a C-compatible packet header verified against a C compiler's own layout, plus a demonstration of `repr(Rust)` breaking that same assumption — both already built in topic 16 using this identical header shape (the "Good" `repr(C)` order and `repr(Rust)`'s free reordering). This topic completes the loop the lab describes: the same header, now actually arriving as a byte buffer (the part a C-interop lab would call "receiving the struct over the wire"), read safely via the derive-checked view rather than a raw cast. The niche-optimization aside from topic 16's own Lab section (`Option<&T>` costing nothing extra) is unrelated to this topic's byte-level reading question and isn't revisited here.

## In production

The bug class this topic exists to prevent is a familiar one in any codebase that parses a binary file or wire format by casting a byte buffer directly onto a struct: it compiles, it often produces plausible-looking output in testing, and it is undefined behaviour the moment the struct has any padding at all, because nothing guarantees those padding bytes were ever written by whoever produced the buffer. This is exactly why it's a dangerous bug class rather than a merely annoying one — undefined behaviour is not "always crashes" or "always gives garbage," it is "the compiler is permitted to do anything at all," which includes working correctly on the exact inputs a test suite happens to try and misbehaving only later, on inputs or optimizer decisions nobody tested against. A derive-checked view turns this from "a convention every call site must remember" into "a property proven once, about the type, that the compiler itself refuses to let slip."

## The frontier

This chapter picked `bytemuck` as its one example crate; `zerocopy` solves the identical problem with a different, more finely split trait hierarchy (separate `FromBytes`, `IntoBytes`, `Immutable`, and `Unaligned` traits rather than bytemuck's `Pod`/`NoUninit`/`AnyBitPattern` split), aimed at slightly different ergonomics for very fine-grained control over exactly which guarantee a given cast needs. Neither crate is part of the standard library, and Rust itself still has no first-class, built-in equivalent of either — reading a byte buffer safely as a struct remains something the ecosystem provides, not the language, years after the underlying padding-is-UB problem was well understood. Whether that gap should eventually close with a std-level primitive (and what such a primitive's trait design should look like) is an open design question, not a settled one.

## Where this goes next

Every guarantee this chapter made was about one value's own layout, standing still, inside one process — whether the compiler chose it (`repr(Rust)`) or a fixed contract pinned it down (`repr(C)`), and whether its bytes came from this process's own memory or from somewhere else entirely. The next chapter asks the question Chapter 4 touched but never made precise: which of a type's guarantees survive being handed to another thread at all?
