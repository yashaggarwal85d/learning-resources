Last verified: 2026-11-03.

- CPython `Objects/listsort.txt`, `v3.11.0` tag — run detection, minrun, galloping, and the old merge-policy invariant, in the library's own words. [source](https://raw.githubusercontent.com/python/cpython/v3.11.0/Objects/listsort.txt)
- CPython `Objects/listsort.txt`, `v3.10.0` tag — confirms Powersort is new as of 3.11. [source](https://raw.githubusercontent.com/python/cpython/v3.10.0/Objects/listsort.txt)
- CPython `Objects/listsort.txt`, `main` branch — Stefan Pochmann's 2025 minrun refinement, unreleased as of this fetch. [source](https://raw.githubusercontent.com/python/cpython/main/Objects/listsort.txt)
- CPython `Misc/NEWS.d/3.11.0a1.rst`, `v3.11.0` tag — the bpo-34561 changelog entry, dated 2021-09-01. [source](https://raw.githubusercontent.com/python/cpython/v3.11.0/Misc/NEWS.d/3.11.0a1.rst)
- de Gouw, Rot, de Boer, Bubel & Hähnle, "OpenJDK's Java.utils.Collection.sort() Is Broken: The Good, the Bad and the Worst Case" (CAV 2015) — the formal-verification paper that found the 2015 invariant bug. [source](https://ir.cwi.nl/pub/23709/23709A.pdf)
- Munro & Wild, "Nearly-Optimal Mergesorts: Fast, Practical Sorting Methods That Optimally Adapt to Existing Runs" (ESA 2018; arXiv:1805.04154) — the Powersort paper. [source](https://arxiv.org/abs/1805.04154)
- Rust 1.81.0 `library/core/src/slice/sort/stable/mod.rs` — driftsort's own authorship and allocation formula. [source](https://raw.githubusercontent.com/rust-lang/rust/1.81.0/library/core/src/slice/sort/stable/mod.rs)
- Rust `std::primitive::slice` documentation, "Current implementation" — the standard library's own one-line characterization of driftsort. [source](https://doc.rust-lang.org/std/primitive.slice.html)
- Rust blog, "Announcing Rust 1.81.0" — the sort-rewrite announcement and the broken-`Ord`-panics behavior change. [source](https://blog.rust-lang.org/2024/09/05/Rust-1.81.0/)
- sort-research-rs, driftsort introduction writeup (Bergdoll & Peters) — the design document linked directly from the Rust source. [source](https://raw.githubusercontent.com/Voultapher/sort-research-rs/main/writeup/driftsort_introduction/text.md)

CLRS, Sedgewick & Wayne, McIlroy's 1993 SODA paper (cited by CPython's own file, not independently opened), and the unnamed earlier paper CPython's file says the galloping idea "probably dates back to" (Bentley and Yao) are citation-only this session, per `CHAPTER.md`'s own framing; every mechanism this topic claims is instead verified directly in `examples.py` or quoted word for word from a primary source read this session.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=timsort-powersort-driftsort:%20).
