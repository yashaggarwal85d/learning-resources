# Sources — Axum on Tower and hyper

## `axum`

URL: https://docs.rs/axum/latest/axum/index.html
Fetched: 2026-10-24, cached at `sources/axum-index.txt`.

> In particular, the last point is what sets axum apart from other libraries / frameworks. axum doesn't have its own middleware system but instead uses tower::Service. This means axum gets timeouts, tracing, compression, authorization, and more, for free. It also enables you to share middleware with applications written using hyper or tonic.

> axum is designed to work with tokio and hyper. Runtime and transport layer independence is not a goal, at least for the time being.

## `axum::extract`

URL: https://docs.rs/axum/latest/axum/extract/index.html
Fetched: 2026-10-24, cached at `sources/axum-extract.txt`.

> A handler function is an async function that takes any number of "extractors" as arguments. An extractor is a type that implements FromRequest or FromRequestParts.

## `axum::middleware::from_fn`

URL: https://docs.rs/axum/latest/axum/middleware/fn.from_fn.html
Fetched: 2026-10-24, cached at `sources/axum-from-fn.txt`.

> Create a middleware from an async function.

> Note that this function doesn't support extracting State. For that, use from_fn_with_state.

## `tower_http`

URL: https://docs.rs/tower-http/latest/tower_http/index.html
Fetched: 2026-10-24, cached at `sources/tower-http-index.txt`.

> tower-http is a library that provides HTTP-specific middleware and utilities built on top of tower.

> All middleware uses the http and http-body crates as the HTTP abstractions. That means they're compatible with any library or framework that also uses those crates, such as hyper, tonic, and warp.
