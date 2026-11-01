# SOURCES: Elementary sorts and sorting networks (`dsa.elementary-sorts-sorting-networks`)

Read 2026-11-01.

## Bert Dobbelaere, "List of sorting networks"

URL: https://bertdobbelaere.github.io/sorting_networks.html
Version: page as fetched 2026-11-01 (the author's "extended list" page, no version number given)

> Number of compare/exchange elements (CEs) - metric below called "size"

> Number of parallel operation steps (layers), determining processing latency - metric below called "depth"

The summary table's rows for four and eight inputs (citing `[TAOCPv3]`, Knuth's *The Art of
Computer Programming* vol. 3, for both):

> 4
> (5, 3)
> 5
> 3
> [TAOCPv3]

> 8
> (19, 6)
> 19
> 6
> [TAOCPv3]

The page's own drawn network for four inputs (quoted to show the page's labeling convention;
this topic's own four-input network, independently brute-force verified in `examples.py`, uses a
different but equally valid 5-CE, 3-layer wiring — see FACT-CHECK.md):

> Sorting network for 4 inputs, 5 CEs, 3 layers:

> [(0,2),(1,3)]

> [(0,1),(2,3)]

> [(1,2)]

## Rust, `library/core/src/slice/sort/shared/smallsort.rs` (tag `1.81.0`)

URL: https://raw.githubusercontent.com/rust-lang/rust/1.81.0/library/core/src/slice/sort/shared/smallsort.rs
Version: tag `1.81.0`, fetched 2026-11-01. The file's generic-parameter clauses (angle brackets)
are mangled by the fetch pipeline's HTML-tag stripping (documented in prior topics' SOURCES.md);
the quotes below avoid any angle-bracket span and were spot-checked against the raw fetched text.

> Sorts the first 9 elements of `v` with a fast fixed function.

> Should `is_less` generate substantial amounts of code the compiler can choose to not inline `swap_if_less`. If the code of a sort impl changes so as to call this function in multiple places, `#[inline(never)]` is recommended to keep binary-size in check. The current design of `small_sort_network` makes sure to only call this once.

> sort13_optimal(region, is_less); 13 } else if region.len() >= 9 { sort9_optimal(region, is_less); 9 } else { 1 };

## GCC libstdc++, `libstdc++-v3/include/bits/stl_algo.h` (`master` branch)

URL: https://raw.githubusercontent.com/gcc-mirror/gcc/master/libstdc%2B%2B-v3/include/bits/stl_algo.h
Version: `master` branch, fetched 2026-11-01

> This controls some aspect of the sort routines.

> enum { _S_threshold = 16 };

> This is a helper function for the sort routine.

### Citation only, not read this session

- Cormen, Leiserson, Rivest and Stein, *Introduction to Algorithms*, 4th ed. — the chapter on
  getting started (insertion sort, loop invariants) and the sorting-networks material; chapter
  and section numbers not verified this session.
- Knuth, *The Art of Computer Programming*, vol. 3, §5.2.1 (insertion sort, inversions) and
  §5.3.4 (sorting networks, the zero-one principle) — named only as Dobbelaere's page's own
  citation for the size/depth bounds quoted above; not opened directly.
- Sedgewick and Wayne, *Algorithms*, §2.1 (booksite) — named by pointer only.

### Red team

1. **The zero-one principle's exact statement and section number are not independently
   verified** — Knuth vol. 3 §5.3.4 was not opened this session; the principle is used here only
   in the informal form CHAPTER.md states it ("a network that sorts every 0/1 input sorts
   everything"), checked computationally on the topic's own four-input network rather than
   quoted from Knuth.
2. **This topic's four-input network is not the literal network Dobbelaere's page draws** (the
   page's is `[(0,2),(1,3)], [(0,1),(2,3)], [(1,2)]`; this topic uses
   `(0,1),(2,3),(0,2),(1,3),(1,2)`, from `CHAPTER.md`'s own planning value) — both are 5-CE,
   3-layer networks on four inputs, and this topic's own is verified independently in
   `examples.py` against all 24 permutations and all 16 zero-one inputs, rather than asserted
   from the page.
3. **The Rust and libstdc++ quotes avoid every angle-bracket-mangled span** (documented above);
   the generic type parameters and bounds on `sort9_optimal`/`sort13_optimal` and
   `__final_insertion_sort` are not quoted, only named, since the fetch pipeline corrupts them.
   The mangling also ate the exact `region.len() >= 13` condition guarding the `sort13_optimal`
   call (an earlier unrelated `<...>` span in the same file was left unclosed by the stripper and
   swallowed it); the quoted span starts just after that loss, from the `sort13_optimal` call
   itself, which is intact.
4. **The Rust doc-comment quotes were seeded with their literal `///` line markers stripped**
   (same fix as the javadoc `*`-marker issue documented for a previous topic), since `norm()`
   collapses whitespace but not literal comment-marker characters.
