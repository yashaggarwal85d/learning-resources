# Sources — Cancellation by drop and cancel safety

## `tokio::select!` macro docs

URL: https://docs.rs/tokio/latest/tokio/macro.select.html
Fetched: 2026-10-23, cached at `sources/select-macro.txt`.

> Waits on multiple concurrent branches, returning when the first branch completes, cancelling the remaining branches.

> Cancellation safety describes what happens when a future is dropped before it completes.

> The following methods are cancellation safe:

> tokio::sync::mpsc::Receiver::recv

> The following methods are not cancellation safe and can lead to loss of data:

> tokio::io::AsyncReadExt::read_exact

## `tokio::sync::mpsc::Receiver` docs

URL: https://docs.rs/tokio/latest/tokio/sync/mpsc/struct.Receiver.html
Fetched: 2026-10-23, cached at `sources/mpsc-receiver.txt`.

> This method is cancel safe. If recv is used as a branch in tokio::select! and another branch completes first, it is guaranteed that no messages were received on this channel.

## `tokio::io::AsyncReadExt` docs

URL: https://docs.rs/tokio/latest/tokio/io/trait.AsyncReadExt.html
Fetched: 2026-10-23, cached at `sources/async-read-ext.txt`.

> Reads the exact number of bytes required to fill buf.

## `tokio::task::JoinHandle` docs

URL: https://docs.rs/tokio/latest/tokio/task/struct.JoinHandle.html
Fetched: 2026-10-23, cached at `sources/join-handle.txt`.

> A JoinHandle detaches the associated task when it is dropped, which means that there is no longer any handle to the task, and no way to join on it.

> Note that the background task associated with this JoinHandle started running immediately when you called spawn, even if you have not yet awaited the JoinHandle.
