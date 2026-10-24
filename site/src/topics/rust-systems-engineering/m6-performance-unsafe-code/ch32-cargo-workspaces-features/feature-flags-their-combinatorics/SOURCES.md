# Sources — Feature flags and their combinatorics

## Features — The Cargo Book
URL: https://doc.rust-lang.org/cargo/reference/features.html
Fetched: 2026-10-24, cached at `sources/features.txt`.

> When a dependency is used by multiple packages, Cargo will use the union of
> all features enabled on that dependency when building it.

> A consequence of this is that features should be additive. That is, enabling
> a feature should not disable functionality, and it should usually be safe to
> enable any combination of features.

## Dependency Resolution — The Cargo Book
URL: https://doc.rust-lang.org/cargo/reference/resolver.html
Fetched: 2026-10-24, cached at `sources/resolver.txt`.

> The version "1" resolver will unify features for a package no matter where it is specified.

Last verified: 2026-10-24. Expert sign-off: pending.
