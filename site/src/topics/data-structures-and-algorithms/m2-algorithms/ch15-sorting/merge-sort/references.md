Last verified: 2026-11-03.

- CPython "Objects/listsort.txt" — why a true in-place linear-time merge is impractical, and Timsort's own min(A, B) buffer refinement. [source](https://raw.githubusercontent.com/python/cpython/main/Objects/listsort.txt)
- "Arrays (Java SE 21 & JDK 21)" (Oracle) — `Arrays.sort`'s own stability guarantee, its own stable-mergesort implementation note, and its own n/2-object-reference worst case. [source](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html)
- `std::primitive::slice` documentation (Rust) — the `sort`/`sort_unstable` split, and the current stable sort's own self.len()/2 auxiliary-memory clamp. [source](https://doc.rust-lang.org/std/primitive.slice.html)

CLRS, Knuth (*TAOCP* vol. 3) and Sedgewick & Wayne are citation-only per `CHAPTER.md`'s own instruction; this topic's own worst-case formula, the top-down/bottom-up comparison counts, and the gap to the information-theoretic bound are all computed and asserted directly in `examples.py` instead.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=merge-sort:%20).
