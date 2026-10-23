# Sources — I/O and time drivers

## `mio::Poll` docs

URL: https://docs.rs/mio/latest/mio/struct.Poll.html
Fetched: 2026-10-23, cached at `sources/mio-poll.txt`.

> Poll allows a program to monitor a large number of event::Sources, waiting until one or more become "ready" for some class of operations; e.g. reading and writing.

> To use Poll, an event::Source must first be registered with the Poll instance using the register method on its associated Register, supplying readiness interest.

> A Token is also passed to the register function. When Poll returns a readiness event, it will include this token. This associates the event with the event source that generated the event.

> Poll::poll may return readiness events even if the associated event source is not actually ready.

> Once a readiness event is received, the corresponding operation must be performed repeatedly until it returns WouldBlock.

## `tokio::time` module docs

URL: https://docs.rs/tokio/latest/tokio/time/index.html
Fetched: 2026-10-23, cached at `sources/time-module.txt`.

> Sleep is a future that does no work and completes at a specific Instant in time.

> These types must be used from within the context of the Runtime.

## `tokio` crate root docs (unstable features)

URL: https://docs.rs/tokio/latest/tokio/index.html
Fetched: 2026-10-23, cached at `sources/tokio-crate-root.txt`.

> io-uring: Enables io-uring (Linux only).

> This flag enables unstable features. The public API of these features may break in 1.x releases. To enable these features, the --cfg tokio_unstable argument must be passed to rustc when compiling.
