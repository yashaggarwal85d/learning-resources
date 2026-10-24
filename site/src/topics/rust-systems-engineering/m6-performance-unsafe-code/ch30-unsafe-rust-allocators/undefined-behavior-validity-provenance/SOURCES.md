# Sources — Undefined behavior: validity, provenance, aliasing

## Behavior considered undefined — The Rust Reference
URL: https://doc.rust-lang.org/reference/behavior-considered-undefined.html
Fetched: 2026-10-24, cached at `sources/ub-reference.txt`.
> The Rust compiler assumes that all values produced during program execution are “valid”, and producing an invalid value is hence immediate UB.

> A bool value must be false (0) or true (1).

> An enum must have a valid discriminant, and all fields of the variant indicated by that discriminant must be valid at their respective type.

## MaybeUninit in std::mem — The Rust standard library
URL: https://doc.rust-lang.org/std/mem/union.MaybeUninit.html
Fetched: 2026-10-24, cached at `sources/maybeuninit.txt`.
> The compiler, in general, assumes that a variable is properly initialized or “valid” according to the requirements of the variable’s type.

> zero-initializing a variable of reference type causes instantaneous undefined behavior, no matter whether that reference ever gets used to access memory

## std::ptr — The Rust standard library
URL: https://doc.rust-lang.org/std/ptr/index.html
Fetched: 2026-10-24, cached at `sources/ptr-provenance.txt`.
> It is undefined behavior to access memory through a pointer that does not have provenance over that memory.

> Creates a new pointer with the given address and the provenance of `self`.

Last verified: 2026-10-24. Expert sign-off: pending.
