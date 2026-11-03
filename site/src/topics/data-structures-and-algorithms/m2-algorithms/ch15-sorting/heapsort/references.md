Last verified: 2026-11-03.

- libstdc++ `stl_algo.h`, GCC `master` branch — `__introsort_loop`'s own depth-limit check and its fallback to `__partial_sort`, a heap sort. [source](https://raw.githubusercontent.com/gcc-mirror/gcc/master/libstdc%2B%2B-v3/include/bits/stl_algo.h)
- OpenJDK `DualPivotQuicksort.java`, `jdk-21-ga` tag — the JDK's own `DELTA`/`MAX_RECURSION_DEPTH` constants and its own `heapSort` fallback. [source](https://raw.githubusercontent.com/openjdk/jdk/jdk-21-ga/src/java.base/share/classes/java/util/DualPivotQuicksort.java)
- Rust 1.81.0 `library/core/src/slice/sort/unstable/mod.rs` — the recursion `limit = 2 * (len | 1).ilog2()` passed into Rust's own unstable quicksort. [source](https://raw.githubusercontent.com/rust-lang/rust/1.81.0/library/core/src/slice/sort/unstable/mod.rs)
- Rust blog, "Announcing Rust 1.81.0" — the sort-rewrite announcement. [source](https://blog.rust-lang.org/2024/09/05/Rust-1.81.0/)
- Rust `std::primitive::slice` documentation, "Current implementation" — ipnsort described as combining "the fast average case of quicksort with the fast worst case of heapsort". [source](https://doc.rust-lang.org/std/primitive.slice.html)
- Go 1.19 release notes — the pattern-defeating quicksort (pdqsort) naming, used only in post-notes per `CHAPTER.md`. [source](https://go.dev/doc/go1.19)
- Chapter 6 topic 30's own `SOURCES.md` (Wikipedia's "Binary heap" and Sedgewick & Wayne's booksite) — the linear bottom-up build and sift-down this topic reuses rather than re-quotes, per `CHAPTER.md`'s "reuse its quotes only if cited".

CLRS 4th ed. chapter 6, Williams (1964), Floyd (1964), Musser (1997) and Wegener (1993) are citation-only this session (CLRS and Musser paywalled, Williams and Floyd pre-digital-archive CACM issues, Wegener named only in post-notes), per `CHAPTER.md`'s own "to verify" framing. The depth-limit mechanism itself is verified directly from the three real systems' own source above, which `CHAPTER.md`'s own scope clause treats as sufficient.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=heapsort:%20).
