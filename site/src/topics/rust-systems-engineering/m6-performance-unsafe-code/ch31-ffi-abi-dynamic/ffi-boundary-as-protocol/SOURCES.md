# Sources — FFI boundary as a protocol

## FFI — The Rustonomicon
URL: https://doc.rust-lang.org/nomicon/ffi.html
Fetched: 2026-10-24, cached at `sources/nomicon-ffi.txt`.

> Foreign libraries often hand off ownership of resources to the calling code.
> When this occurs, we must use Rust’s destructors to provide safety and guarantee
> the release of these resources (especially in the case of a panic).

> If you expect Rust panics or foreign (e.g. C++) exceptions to cross an FFI
> boundary, that boundary must use the appropriate -unwind ABI string.

> A foreign exception entering Rust will cause undefined behavior.

## External blocks — The Rust Reference
URL: https://doc.rust-lang.org/reference/items/external-blocks.html
Fetched: 2026-10-24, cached at `sources/reference-external-blocks.txt`.

> The calling convention defines a low-level interface for functions, such as how arguments are placed in registers or on the stack, how return values are passed, and who is responsible for cleaning up the stack.

> extern "C-unwind" and extern "system-unwind" — Identical to "C" and "system", respectively, but with different behavior when the callee unwinds (by panicking or throwing a C++ style exception).

Last verified: 2026-10-24. Expert sign-off: pending.
