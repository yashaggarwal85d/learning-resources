# Sources — Unsafe contracts and safety comments

## Behavior considered undefined — The Rust Reference
URL: https://doc.rust-lang.org/reference/behavior-considered-undefined.html
Fetched: 2026-10-24, cached at `sources/ub-reference.txt`.
> Rust code is incorrect if it exhibits any of the behaviors in the following list. This includes code within unsafe blocks and unsafe functions. unsafe only means that avoiding undefined behavior is on the programmer; it does not change anything about the fact that Rust programs must never cause undefined behavior.

> It is the programmer’s responsibility when writing unsafe code to ensure that any safe code interacting with the unsafe code cannot trigger these behaviors. unsafe code that satisfies this property for any safe client is called sound; if unsafe code can be misused by safe code to exhibit undefined behavior, it is unsound.

## Documentation — Rust API Guidelines
URL: https://rust-lang.github.io/api-guidelines/documentation.html
Fetched: 2026-10-24, cached at `sources/api-guidelines-documentation.txt`.
> Unsafe functions should be documented with a "Safety" section that explains all
invariants that the caller is responsible for upholding to use the function
correctly.

> Beyond accepting a raw pointer, this is unsafe because it semantically
moves the value out of `src` without preventing further usage of `src`.
