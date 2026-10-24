# Sources — Miri and sanitizers for UB detection

## README — Miri (rust-lang/miri)
URL: https://raw.githubusercontent.com/rust-lang/miri/master/README.md
Fetched: 2026-10-24, cached at `sources/miri-readme.txt`.
> Miri is an [Undefined Behavior][reference-ub] detection tool for Rust. It can run binaries and test suites of cargo projects and detect unsafe code that fails to uphold its safety requirements.

> Moreover, Miri fundamentally cannot ensure that your code is *sound*. [Soundness] is the property of
> never causing undefined behavior when invoked from arbitrary safe code, even in combination with
> other sound code. In contrast, Miri can just tell you if *a particular way of interacting with your
> code* (e.g., a test suite) causes any undefined behavior *in a particular execution* (of which there
> may be many, e.g. when concurrency or other forms of non-determinism are involved)

## sanitizer — The Rust Unstable Book
URL: https://doc.rust-lang.org/unstable-book/compiler-flags/sanitizer.html
Fetched: 2026-10-24, cached at `sources/sanitizer-unstable-book.txt`.
> AddressSanitizer is a memory error detector. It can detect the following types of bugs: Out of bound accesses to heap, stack and globals

> AddressSanitizer works with non-instrumented code although it will impede its ability to detect some bugs. It is not expected to produce false positive reports.

Last verified: 2026-10-24. Expert sign-off: pending.
