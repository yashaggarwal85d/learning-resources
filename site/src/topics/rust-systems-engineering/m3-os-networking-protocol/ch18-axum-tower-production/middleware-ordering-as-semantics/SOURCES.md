# Sources — Middleware ordering as semantics

## `tower::ServiceBuilder`

URL: https://docs.rs/tower/latest/tower/struct.ServiceBuilder.html
Fetched: 2026-10-24, cached at `sources/service-builder.txt`.

> The order in which layers are added impacts how requests are handled. Layers that are added first will be called with the request first. The argument to service will be last to see the request.

> In the above example, the buffer layer receives the request first followed by concurrency_limit. buffer enables up to 100 request to be in-flight on top of the requests that have already been forwarded to the next layer. Combined with concurrency_limit, this allows up to 110 requests to be in-flight.

> The above example is similar, but the order of layers is reversed. Now, concurrency_limit applies first and only allows 10 requests to be in-flight total.

## `tower::retry`

URL: https://docs.rs/tower/latest/tower/retry/index.html
Fetched: 2026-10-24, cached at `sources/retry-index.txt`.

> Middleware for retrying "failed" requests.

> A "retry policy" to classify if a request should be retried.

> A retry "budget" for allowing only a certain amount of retries over time.
