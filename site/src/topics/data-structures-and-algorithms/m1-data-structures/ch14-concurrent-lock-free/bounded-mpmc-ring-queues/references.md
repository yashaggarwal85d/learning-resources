# References

Last verified against each source listed below on 1 November 2026.

- Dmitry Vyukov, "Bounded MPMC queue" (1024cores.net, 2010-2011; the live page and its Wayback
  Machine mirror are unreachable from this environment — see `SOURCES.md`). Verified instead via
  two independent, license-attributed vendored copies: spdlog's `mpmc_bounded_q.h`
  (https://github.com/gabime/spdlog/blob/1bd10957cb47824c0e24859db2bd637e472ab97d/include/spdlog/details/mpmc_bounded_q.h)
  and Rust's old `libsync/mpmc_bounded_queue.rs`
  (https://github.com/rust-lang/rust/blob/4e5b62618cb5341139177c1ef62e2467affd041f/src/libsync/mpmc_bounded_queue.rs).
- crossbeam-rs, `crossbeam-queue/src/array_queue.rs`.
  https://github.com/crossbeam-rs/crossbeam/blob/master/crossbeam-queue/src/array_queue.rs
- LMAX Exchange, "LMAX Disruptor: High performance alternative to bounded queues for exchanging
  data between concurrent threads" (technical paper).
  https://lmax-exchange.github.io/disruptor/disruptor.html
- LMAX Exchange, "LMAX Disruptor User Guide" (version 4.0.0-SNAPSHOT).
  https://lmax-exchange.github.io/disruptor/user-guide/index.html
- Maged M. Michael and Michael L. Scott, "Simple, Fast, and Practical Non-Blocking and Blocking
  Concurrent Queue Algorithms" (PODC 1996) — citation checked, not read; see `SOURCES.md`.

Found an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new).
