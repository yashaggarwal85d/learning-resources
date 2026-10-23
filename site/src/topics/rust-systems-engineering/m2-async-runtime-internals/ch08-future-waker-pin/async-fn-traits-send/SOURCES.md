# Sources — Async fn in traits and Send bounds

## Rust Blog, "Announcing `async fn` and return-position `impl Trait` in traits"

URL: https://blog.rust-lang.org/2023/12/21/async-fn-rpit-in-traits/
Fetched: 2026-10-23, cached at `sources/async-fn-traits-stabilization.txt`.

> The Rust Async Working Group is excited to announce major progress towards our goal of enabling the use of async fn in traits. Rust 1.75, which hits stable next week, will include support for both -> impl Trait notation and async fn in traits.

> Of particular interest to users of async are Send bounds on the returned future. Since users cannot add bounds later, the error message is saying that you as a trait author need to make a choice: Do you want your trait to work with multithreaded, work-stealing executors?

> This proc macro is part of the trait-variant crate, published by the rust-lang org.

## `async-trait` crate docs (dtolnay)

URL: https://docs.rs/async-trait/latest/async_trait/
Fetched: 2026-10-23, cached at `sources/async-trait-crate.txt`.

> The stabilization of async functions in traits in Rust 1.75 did not include support for using traits containing async functions as dyn Trait.

> Async fns get transformed into methods that return Pin<Box<dyn Future + Send + 'async_trait>> and delegate to an async block.

## `trait-variant` crate docs (rust-lang org)

URL: https://docs.rs/trait-variant/latest/trait_variant/
Fetched: 2026-10-23, cached at `sources/trait-variant-crate.txt`.

> trait_variant generates a specialized version of a base trait that uses async fn and/or -> impl Trait.
