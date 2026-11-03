## libstdc++ — `stl_algo.h` (GCC `master`, read at research time)

URL: https://raw.githubusercontent.com/gcc-mirror/gcc/master/libstdc%2B%2B-v3/include/bits/stl_algo.h
Version: fetched 2026-11-03 (`master` branch, current at fetch time)

> enum { _S_threshold = 16 };

> if (__depth_limit == 0)
>     {
>       std::__partial_sort(__first, __last, __last, __comp);
>       return;
>     }

> std::__introsort_loop(__first, __last,
>                        std::__lg(__last - __first) * 2,
>                        __comp);

### Contents (item by item, this topic's scope)

- `_S_threshold = 16`: the size below which introsort stops partitioning and falls to insertion sort (the small-range cutoff named in topic 48, confirmed here as the same constant that also gates `__introsort_loop`'s own loop condition).
- `__introsort_loop`'s depth-limit check: when `__depth_limit` reaches 0, the remaining range is finished by `__partial_sort`, which is a heap sort (`__heap_select` then `__sort_heap`) — the introsort fallback this topic's "role" clause teaches.
- `__sort`'s call: the depth limit passed in is `std::__lg(n) * 2`, i.e. `2 * floor(log2(n))` — the exact depth bound libstdc++ uses.

## OpenJDK 21 — `DualPivotQuicksort.java` (`jdk-21-ga` tag, read at research time)

URL: https://raw.githubusercontent.com/openjdk/jdk/jdk-21-ga/src/java.base/share/classes/java/util/DualPivotQuicksort.java
Version: fetched 2026-11-03, `jdk-21-ga` tag

> private static final int DELTA = 3 << 1;

> private static final int MAX_RECURSION_DEPTH = 64 * DELTA;

> /*
>  * Switch to heap sort if execution
>  * time is becoming quadratic.
>  */
> if ((bits += DELTA) > MAX_RECURSION_DEPTH) {
>     heapSort(a, low, high);
>     return;
> }

> private static void heapSort(int[] a, int low, int high) {
>     for (int k = (low + high) >>> 1; k > low; ) {
>         pushDown(a, --k, a[k], low, high);
>     }
>     while (--high > low) {
>         int max = a[low];
>         pushDown(a, low, a[high], low, high);
>         a[high] = max;
>     }
> }

### Contents (item by item, this topic's scope)

- `DELTA = 3 << 1 = 6` and `MAX_RECURSION_DEPTH = 64 * DELTA = 384`: the JDK's own depth bound (a count of partitioning rounds, incremented by `DELTA` each round, not a plain recursion-depth counter).
- The exact fallback: once the accumulated `bits` counter exceeds `MAX_RECURSION_DEPTH`, the current range is finished by `heapSort` instead of continuing to partition — the second real system (with libstdc++) that this topic names for the introsort-style fallback.
- `heapSort`'s own body: a bottom-up build (the `for` loop sifting every non-leaf down) followed by the repeated root-extraction loop (`pushDown` the last element into the shrinking heap) — confirms the same two-phase structure (build, then repeated extract-and-sift) this topic teaches from Chapter 6, independently in Java's own sort.

## Rust 1.81.0 — `library/core/src/slice/sort/unstable/mod.rs` (`1.81.0` tag, read at research time)

URL: https://raw.githubusercontent.com/rust-lang/rust/1.81.0/library/core/src/slice/sort/unstable/mod.rs
Version: fetched 2026-11-03, `1.81.0` tag

> // Limit the number of imbalanced partitions to `2 * floor(log2(len))`.
> // The binary OR by one is used to eliminate the zero-check in the logarithm.
> let limit = 2 * (len | 1).ilog2();
> crate::slice::sort::unstable::quicksort::quicksort(v, None, limit, is_less);

### Contents (item by item, this topic's scope)

- The exact depth-limit formula Rust's unstable sort (ipnsort) passes into its own quicksort: `2 * floor(log2(len))`, the same shape of bound as libstdc++'s and the JDK's, confirming the "proportional to lg n" rule is not one library's idiosyncrasy.
- The `| 1` is only to avoid a zero-check in the logarithm when `len` is even; it does not change the bound's meaning.

## Rust blog — "Announcing Rust 1.81.0" (read at research time)

URL: https://blog.rust-lang.org/2024/09/05/Rust-1.81.0/
Version: fetched 2026-11-03

> Both the stable and unstable sort implementations in the standard library have been updated to new algorithms, improving their runtime performance and compilation time.

### Contents (item by item, this topic's scope)

- The announcement that both of Rust's standard-library sorts (stable: driftsort; unstable: ipnsort) were rewritten in this release — the version this topic and topic 52 both cite for "Rust 1.81".

## Rust — `std::primitive::slice` documentation, "Current implementation" (`sort_unstable`, read at research time)

URL: https://doc.rust-lang.org/std/primitive.slice.html
Version: fetched 2026-11-03 (current docs at fetch time)

> The current implementation is based on ipnsort by Lukas Bergdoll and Orson Peters, which
> combines the fast average case of quicksort with the fast worst case of heapsort, achieving
> linear time on fully sorted and reversed inputs.

### Contents (item by item, this topic's scope)

- The documentation's own one-line characterization of ipnsort (Rust's unstable sort, which `sort_unstable` calls): it names heapsort by name as the thing that bounds the worst case, which is this topic's own "role as the fallback" clause confirmed from the library's own docs, not just its source.

## Go 1.19 release notes (read at research time)

URL: https://go.dev/doc/go1.19
Version: fetched 2026-11-03

> The sorting algorithm has been rewritten to use
> pattern-defeating quicksort, which
> is faster for several common scenarios.

### Contents (item by item, this topic's scope)

- Named once, in post-notes only, per CHAPTER.md's instruction: Go 1.19 switched its `sort` package to pattern-defeating quicksort (pdqsort), named here with nothing about its internals beyond what this document says.

### Reused from Chapter 6 topic 30 (`dsa.binary-heaps-heapify`), cited per CHAPTER.md's "reuse its quotes only if cited"

Topic 30's own `SOURCES.md` quotes Wikipedia's "Binary heap" page — *"Then starting from the lowest level and moving upwards, sift the root of each subtree downward as in the deletion algorithm until the heap property is restored."* — and Sedgewick & Wayne's *Algorithms* 4th ed. booksite, "Priority Queues" — *"Sink-based heap construction is linear time."* Both quotes are copied here only as a pointer (not re-verified against the live pages this session, per CHAPTER.md's "reuse its quotes only if cited" instruction), since the linear-time bottom-up build and the sift-down procedure are topic 30's own facts, built there; this topic only points to them (`uses: heapify-linear-build, sift-up-down`) and does not re-derive them, supporting the one sentence this topic needs ("build a max-heap... with Chapter 6's linear bottom-up build").

### Citation-only (to verify; not opened this session, per CHAPTER.md's own framing)

- CLRS 4th ed., chapter 6 (heapsort) — **number to verify**, not opened.
- Williams, "Algorithm 232: Heapsort" (CACM 7(6), 1964) — **to verify**, not opened (pre-digital-archive CACM issue, not freely available).
- Floyd, "Algorithm 245: Treesort 3" (CACM 7(12), 1964) — **to verify**, not opened (same reason).
- Musser, "Introspective Sorting and Selection Algorithms" (Software: Practice and Experience 27(8), 1997) — **to verify**, not opened (paywalled; the depth-limit *mechanism* this topic teaches is instead confirmed directly from the three real systems' own source above, which CHAPTER.md's own scope clause treats as sufficient: "Real systems, each read at planning time from source...").
- Wegener, 1993 (Floyd's bottom-up heapsort variant, named only in post-notes per CHAPTER.md) — **to verify**, not opened.

### Red team

1. **CLRS, Williams 1964, Floyd 1964, Musser 1997, Wegener 1993 are not opened.** All five are named by CHAPTER.md itself as "to verify" (CLRS, Williams, Floyd, Musser) or restricted to post-notes only (Wegener); none claims a number this topic asserts as its own measurement. Every number this topic states (comparison counts, cache-line counts, the depth-limit formula) comes from `examples.py`'s own instrumentation or from the three real source files above, not from these five.
2. **The `jdk-21-ga` heapSort excerpt first fetched through `sources.mjs fetch` was HTML-tag-stripping-mangled** (its generic bracket content, e.g. the javadoc, was not affected here, but a different mangling — the depth-check lines around `MAX_RECURSION_DEPTH` lost their comparison context because `fetchSource()` treats `<` ... `>` as an HTML span in `htmlToText()`). Re-fetched the raw file with `curl` directly and hand-verified the three excerpts above against it line by line before writing them into this file's cache entry.
3. **No independent second source for the DELTA/MAX_RECURSION_DEPTH values**: both are read from the same file at the same tag. They are stated as "the JDK's own constants at `jdk-21-ga`", not cross-checked against another JDK release, since CHAPTER.md's own scope asks only for the mechanism and the fact that a bound proportional to lg n exists in each of three real systems, not for cross-version stability of one system's exact constant.
4. **The Go 1.19 and Rust 1.81 quotes are each one sentence from a release-notes page**, used only in post-notes per CHAPTER.md's instruction ("named once in post-notes, with nothing about their internals beyond what those two documents say") — no claim here goes beyond what each sentence itself says.
5. **Topic 30's two reused quotes are taken from that topic's own already-shipped `SOURCES.md`**, not re-fetched or re-verified against the live page this session; they are treated as already-verified (the topic is live) and cited here per CHAPTER.md's explicit "reuse its quotes only if cited" instruction, with the quote text copied byte for byte from the shipped file.
6. **Currency check (2026-11-03):** the `master`-branch `stl_algo.h` fetch is unversioned by design (GCC's `master` moves); the specific symbols quoted (`_S_threshold = 16`, `__introsort_loop`'s depth-limit fallback to `__partial_sort`, `__sort`'s `std::__lg(n) * 2` call) were already confirmed present and unchanged by topic 50's own research into the same file, and are reconfirmed unchanged again at this fetch.
