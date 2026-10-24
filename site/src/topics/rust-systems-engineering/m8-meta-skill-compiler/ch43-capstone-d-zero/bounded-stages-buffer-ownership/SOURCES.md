# Sources — Bounded stages and buffer ownership

## mpsc-backpressure — docs.rs (tokio::sync::mpsc)
URL: https://docs.rs/tokio/latest/tokio/sync/mpsc/index.html
Fetched: 2026-10-24, cached at `sources/tokio-mpsc.txt`.

> If the bounded channel is at capacity, the send is rejected and the task will be notified when additional capacity is available. In other words, the channel provides backpressure.

## mpsc-unbounded-infinite — docs.rs (tokio::sync::mpsc)
URL: https://docs.rs/tokio/latest/tokio/sync/mpsc/index.html
Fetched: 2026-10-24, cached at `sources/tokio-mpsc.txt`.

> An unbounded channel has an infinite capacity, so the send method will always complete immediately.

## arrow-zero-copy — Apache Arrow (Columnar Format)
URL: https://arrow.apache.org/docs/format/Columnar.html
Fetched: 2026-10-24, cached at `sources/arrow-columnar.txt`.

> Relocatable without "pointer swizzling", allowing for true zero-copy access in shared memory

Last verified: 2026-10-24. Expert sign-off: pending.
