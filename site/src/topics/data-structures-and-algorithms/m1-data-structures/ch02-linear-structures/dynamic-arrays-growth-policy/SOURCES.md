## ISO C++ working draft, N4868 (C++20), [vector]

URL: https://timsong-cpp.github.io/cppwp/n4868/vector
Version: N4868, the C++20 working draft (Tim Song's cppwp mirror)

> constexpr void reserve(size_type n);

> Effects: A directive that informs a vector of a planned change in size, so that it can manage the storage allocation accordingly. After reserve(), capacity() is greater or equal to the argument of reserve if reallocation happens; and equal to the previous value of capacity() otherwise. Reallocation happens at this point if and only if the current capacity is less than the argument of reserve().

> Complexity: It does not change the size of the sequence and takes at most linear time in the size of the sequence.

> Remarks: Reallocation invalidates all the references, pointers, and iterators referring to the elements in the sequence, as well as the past-the-end iterator. [Note 1: If no reallocation happens, they remain valid. — end note]

> No reallocation shall take place during insertions that happen after a call to reserve() until an insertion would make the size of the vector greater than the value of capacity().

> constexpr void shrink_to_fit();

> Effects: shrink_to_fit is a non-binding request to reduce capacity() to size(). [Note 2: The request is non-binding to allow latitude for implementation-specific optimizations. — end note] It does not increase capacity(), but may reduce capacity() by causing reallocation.

> Complexity: If reallocation happens, linear in the size of the sequence.

> Remarks: Reallocation invalidates all the references, pointers, and iterators referring to the elements in the sequence as well as the past-the-end iterator. [Note 3: If no reallocation happens, they remain valid. — end note]

Contents: the vector clause's member specification, covering constructors, capacity (`size`, `capacity`, `reserve`, `shrink_to_fit`), element access, modifiers (`push_back`, `insert`, `erase`, `resize`), and the reallocation-invalidation remarks attached to each modifier that may reallocate. This topic uses only the capacity and invalidation wording quoted above.

---

## Folly, `folly/docs/FBVector.md`

URL: https://raw.githubusercontent.com/facebook/folly/main/folly/docs/FBVector.md
Version: `main` branch, fetched 2026-10-22 (Facebook's folly repository)

> Despite other compilers reducing the growth factor to 1.5, gcc has staunchly maintained its factor of 2. This makes `std::vector` cache- unfriendly and memory manager unfriendly.

> To see why that's the case, consider a large vector of capacity C. When there's a request to grow the vector, the vector (assuming no in-place resizing, see the appropriate section in this document) will allocate a chunk of memory next to its current chunk, copy its existing data to the new chunk, and then deallocate the old chunk. So now we have a chunk of size C followed by a chunk of size k * C. Continuing this process we'll then have a chunk of size k * k * C to the right and so on.

> If we choose k = 2 we know that every element in the series will be strictly larger than the sum of all previous ones because of the remarkable equality:
>
> 1 + 2^^1 + 2^^2 + 2^^3... + 2^^n = 2^^(n+1) - 1
>
> This means that any new chunk requested will be larger than all previously used chunks combined, so the vector must crawl forward in memory; it can't move back to its deallocated chunks. But any number smaller than 2 guarantees that you'll at some point be able to reuse the previous chunks. For instance, choosing 1.5 as the factor allows memory reuse after 4 reallocations; 1.45 allows memory reuse after 3 reallocations; and 1.3 allows reuse after only 2 reallocations.

> `fbvector` uses a growth factor of 1.5. That does not impede good performance at small sizes because of the way `fbvector` cooperates with jemalloc (below).

Contents: why `std::vector`'s doubling growth factor is memory-manager-unfriendly (the chunk-reuse argument quoted above); the jemalloc cooperation section (how fbvector aligns its reallocation sizes to the allocator's own size classes); the object-relocation section (why most C++ types are conservatively non-relocatable, and what `folly::IsRelocatable` buys); a miscellaneous closing note. This topic uses the growth-factor section only; relocatability and jemalloc cooperation are named in the Deep dive, not built into the reel.

---

## Rust, `std::vec::Vec` documentation

URL: https://doc.rust-lang.org/std/vec/struct.Vec.html
Version: current stable `std` docs, fetched 2026-10-22

> Vec does not guarantee any particular growth strategy when reallocating when full, nor when reserve is called. The current strategy is basic and it may prove desirable to use a non-constant growth factor. Whatever strategy is used will of course guarantee O(1) amortized push.

> In general Vec does not guarantee any particular growth or allocation strategy.

> use an amortized growth strategy similar to pushing one item at a time

Contents: the `Vec` type's full method documentation (`push`, `pop`, `reserve`, `shrink_to_fit`, `capacity`, `with_capacity`, `extend`, `append`, and more), each method's own complexity note, and two general notes (quoted above) that growth strategy is deliberately unspecified. This topic uses only the growth-strategy notes; the full method catalogue is referenced for `reserve`'s and `shrink_to_fit`'s own wording when they agree with the C++ standard's framing.

---

## CPython, `Objects/listobject.c`

URL: https://raw.githubusercontent.com/python/cpython/main/Objects/listobject.c
Version: `main` branch, fetched 2026-10-22 (CPython repository)

> The growth pattern is: 0, 4, 8, 16, 24, 32, 40, 52, 64, 76, ...

> new_allocated = ((size_t)newsize + (newsize >> 3) + 6) & ~(size_t)3;

Contents: `list_resize` (the fast path, bypassing `realloc()` when the current over-allocation already covers the new size) and `py_list_resize` (the slow path, computing the new over-allocation and calling `realloc()`), the exact growth formula and its stated growth pattern quoted above. This topic uses the growth formula and pattern as a third, much gentler real growth policy (effectively about ×1.125 plus a small additive constant) alongside g = 2 and g = 1.5. Lines of this file containing `<` or `>` comparison operators are not quoted verbatim here, since this repo's plain-text fetch of the raw source strips angle-bracket-like sequences; only the two comparison-free lines above are quoted, and the growth pattern (0, 4, 8, 16, 24, 32, 40, 52, 64, 76) is taken directly from the comment, not recomputed from the (unquotable as fetched) branching logic.
