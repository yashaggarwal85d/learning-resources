Last verified against these sources: 2026-10-22, with every example run in `examples.py`. Fact-check record: `FACT-CHECK.md`. Expert sign-off: pending.

- [Working Draft, Standard for Programming Language C++ (N4868)](https://timsong-cpp.github.io/cppwp/n4868/vector), §[vector] (Tim Song's mirror of the ISO C++ working paper): the exact effects, complexity and reallocation-invalidation wording for `reserve` and `shrink_to_fit`.
- Facebook, [`folly/docs/FBVector.md`](https://github.com/facebook/folly/blob/main/folly/docs/FBVector.md): the memory-reuse argument for growth factor 2 vs smaller factors, GCC's and fbvector's own choices, and the jemalloc and object-relocation sections named in "The frontier".
- Rust Project, [`std::vec::Vec` documentation](https://doc.rust-lang.org/std/vec/struct.Vec.html): the explicit statement that no particular growth strategy is guaranteed, only the O(1) amortized push bound.
- Python Software Foundation, [`Objects/listobject.c`](https://github.com/python/cpython/blob/main/Objects/listobject.c), `list_resize` / `py_list_resize`: CPython's own over-allocation formula and its stated growth pattern, reproduced exactly in `examples.py`.
- Chapter 1 of this domain, "Aggregate and accounting methods" and "The potential method" (`dsa.aggregate-accounting-methods`, `dsa.potential-method`): the amortized O(1) append proof this topic takes as already settled, not re-sourced here.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=dynamic-arrays-growth-policy:%20).
