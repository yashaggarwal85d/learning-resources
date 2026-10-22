Last verified: 2026-10-22.

- Linux kernel, `include/linux/types.h` (`struct list_head`). [source](https://raw.githubusercontent.com/torvalds/linux/master/include/linux/types.h)
- Linux kernel, `include/linux/list.h` (list manipulation and traversal macros). [source](https://raw.githubusercontent.com/torvalds/linux/master/include/linux/list.h)
- Linux kernel, `include/linux/container_of.h` (`container_of`, `container_of_const`). [source](https://raw.githubusercontent.com/torvalds/linux/master/include/linux/container_of.h)
- U. Drepper, "What Every Programmer Should Know About Memory", 2007 — the sequential-vs-random pointer-chasing benchmark (§3.3; numbers dated to one 2007 benchmark, used here as a relative, order-of-magnitude comparison, not an absolute figure). [PDF](https://www.akkadia.org/drepper/cpumemory.pdf)

Canonical numbers (a 10,000-node splice costing exactly 4 pointer rewrites regardless of run length; the `ctypes` struct's real field offset and the recovered address it reproduces; the cited cycle counts, about 9 sequential and about 450 random, and their roughly fiftyfold ratio) are asserted and computed in this topic's `examples.py`.

Related tracks (see Prerequisites): this chapter's "Dynamic arrays and growth policy" (contiguity and invalidation); Data Engineering's memory-hierarchy track (cache lines, cache misses); Rust Systems Engineering's ownership chapters (what a stable address means under a borrow checker, a related but separate question).

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=linked-intrusive-lists:%20).
