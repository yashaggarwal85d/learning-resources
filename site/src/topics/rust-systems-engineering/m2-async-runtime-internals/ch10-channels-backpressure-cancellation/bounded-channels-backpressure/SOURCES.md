# Sources — Bounded channels and backpressure

## `tokio::sync::mpsc` module docs

URL: https://docs.rs/tokio/latest/tokio/sync/mpsc/index.html
Fetched: 2026-10-23, cached at `sources/mpsc.txt`.

> This module provides two variants of the channel: bounded and unbounded. The bounded variant has a limit on the number of messages that the channel can store, and if this limit is reached, trying to send another message will wait until a message is received from the channel.

> If the bounded channel is at capacity, the send is rejected and the task will be notified when additional capacity is available. In other words, the channel provides backpressure.

## `tokio::sync::broadcast` module docs

URL: https://docs.rs/tokio/latest/tokio/sync/broadcast/index.html
Fetched: 2026-10-23, cached at `sources/broadcast.txt`.

> If a value is sent when the channel is at capacity, the oldest value currently held by the channel is overwritten.

> Any receiver that has not yet seen the overwritten value will return RecvError::Lagged the next time recv (or try_recv) is called.

> Returning RecvError::Lagged does not close or disconnect the receiver. The lagging receiver’s internal cursor is advanced to the oldest value still retained by the channel.

## `tokio::sync::watch` module docs

URL: https://docs.rs/tokio/latest/tokio/sync/watch/index.html
Fetched: 2026-10-23, cached at `sources/watch.txt`.

> A multi-producer, multi-consumer channel that only retains the last sent value.

> Each Receiver independently tracks the last value seen by its caller.

## `tokio::sync::oneshot` module docs

URL: https://docs.rs/tokio/latest/tokio/sync/oneshot/index.html
Fetched: 2026-10-23, cached at `sources/oneshot.txt`.

> Creates a new one-shot channel for sending single values across asynchronous tasks.
