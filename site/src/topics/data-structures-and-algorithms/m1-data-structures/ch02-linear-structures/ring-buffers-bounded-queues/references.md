Last verified: 2026-10-22.

- Linux kernel, `include/linux/kfifo.h` — the unmasked, always-increasing in/out design this topic's full/empty fix is built on. [source](https://raw.githubusercontent.com/torvalds/linux/master/include/linux/kfifo.h)
- Agner Fog, *Optimizing software in C++* — simple bitwise operations at about one clock cycle, integer division at dozens. [source](https://www.agner.org/optimize/optimizing_cpp.pdf)
- Python documentation, `collections.deque` — the overwrite policy, officially documented. [source](https://docs.python.org/3/library/collections.html#collections.deque)
- Rust documentation, `std::sync::mpsc::sync_channel` — the block policy and boundedness as backpressure, officially documented. [source](https://doc.rust-lang.org/std/sync/mpsc/fn.sync_channel.html)

Canonical numbers (the masking-vs-modulo ratio at capacities sixteen, two hundred fifty-six and four
thousand ninety-six) are computed and asserted in this topic's `examples.py`, via a real C
microbenchmark with the capacity passed in at run time so the compiler can't substitute the mask
itself — not a Python-level timing, which was tried first and found too noisy to show the effect.

Related tracks (see Prerequisites): this chapter's "Dynamic arrays and growth policy" and "Stacks,
queues and deques"; Rust Systems Engineering's "Bounded channels and backpressure" (Ch.10), where the
concurrent, lock-free version of this exact structure is built.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=ring-buffers-bounded-queues:%20).
