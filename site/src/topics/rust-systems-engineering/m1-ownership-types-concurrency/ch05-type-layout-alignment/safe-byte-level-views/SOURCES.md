# Sources — Safe byte-level views of structs

## The Rustonomicon — Working With Uninitialized Memory
URL: https://doc.rust-lang.org/nomicon/uninitialized.html
Version: fetched 2026-10-23

> All runtime-allocated memory in a Rust program begins its life as uninitialized. In this state the value of the memory is an indeterminate pile of bits that may or may not even reflect a valid state for the type that is supposed to inhabit that location of memory. Attempting to interpret this memory as a value of any type will cause Undefined Behavior. Do Not Do This.

Contents:
- interpreting uninitialized memory as a value of any type is undefined behaviour, full stop — the direct basis for why reading a struct's padding bytes (which are never guaranteed initialized) through a reinterpret is unsound.

## bytemuck crate docs
URL: https://docs.rs/bytemuck/latest/bytemuck/
Version: fetched 2026-10-23

> This crate gives small utilities for casting between plain data types.

> Depending on the function, the NoUninit and/or AnyBitPattern traits are used to maintain memory safety.

> NoUninit
>
> Marker trait for "plain old data" types with no uninit (or padding) bytes.

> Pod
>
> Marker trait for "plain old data".

> from_bytes
>
> Re-interprets &[u8] as &T.

> If you enable the crate's derive feature then these traits can be derived on your own types. The derive macros will perform the necessary checks on your type declaration, and trigger an error if your type does not qualify.

> However, these traits are unsafe, and you should carefully read the requirements before using a manual implementation.

Contents:
- bytemuck casts between plain data types via five basic forms (T, &T, &mut T, &[T], &mut [T])
- `NoUninit` specifically requires no padding bytes at all — the trait that makes a type checkably safe to view as bytes
- `Pod` ("plain old data") is the strongest of the marker traits, a sub-trait of `Zeroable`
- `from_bytes` reinterprets a byte slice as `&T`, gated by these traits
- the derive macros check a type's declaration and refuse to compile if it doesn't qualify (e.g. has padding), replacing a hand-rolled, unchecked `transmute`
- the traits are `unsafe` to implement by hand, placing the burden of proof on whoever skips the derive

## Rust std docs — `to_le_bytes`/`to_be_bytes`/`to_ne_bytes` on the integer primitives
URL: https://doc.rust-lang.org/std/primitive.u32.html
Version: fetched 2026-10-23 (stabilized 1.32.0, const since 1.44.0)

> Returns the memory representation of this integer as a byte array in big-endian (network) byte order.

> Returns the memory representation of this integer as a byte array in little-endian byte order.

> Returns the memory representation of this integer as a byte array in native byte order.
>
> As the target platform's native endianness is used, portable code should use to_be_bytes or to_le_bytes, as appropriate, instead.

Contents:
- `to_be_bytes`/`from_be_bytes`: big-endian ("network") byte order, the standard for wire formats
- `to_le_bytes`/`from_le_bytes`: little-endian byte order
- `to_ne_bytes`: the current platform's native order, explicitly called out as unportable — wire and on-disk formats must pick an explicit endianness, never native order
- stabilized 1.32.0, `const fn` since 1.44.0
