---
id: dsa.dynamic-arrays-growth-policy
title: Dynamic arrays and growth policy
---

<section data-section="outcomes">

## After this topic you can

- State the amortized O(1) append bound as settled by Chapter 1 for any fixed growth factor g > 1, and explain that the real question a library still has to answer is which g, and why.
- Explain the memory-reuse argument: a growth factor of 2 makes every new chunk strictly bigger than the sum of every chunk freed before it (1 + 2 + 4 + … + 2ⁿ = 2ⁿ⁺¹ − 1), so the vector can never reuse its own discarded memory; any factor under 2 eventually can. Name at least two real libraries that chose differently and why.
- Use `reserve` and `shrink_to_fit` correctly: say exactly when each reallocates, and that `shrink_to_fit` is explicitly non-binding, so code must not assume it ever frees anything.
- State exactly what a reallocation invalidates (every reference, pointer and iterator into the sequence, the past-the-end iterator included) and why contiguous storage is the default choice for cache locality.

</section>

<section data-section="internals">

## Into the internals

### The memory-reuse argument, in full

Folly's engineers lay the argument out as a picture: a vector of capacity C that keeps doubling allocates chunks of size C, 2C, 4C, 8C, … , each one freed the moment the next is allocated. Because 1 + 2 + 4 + … + 2ⁿ = 2ⁿ⁺¹ − 1, the sum of every chunk ever freed is always exactly one short of the next chunk about to be requested — the vector can only ever crawl forward through memory, never back into what it already gave up.

Any growth factor under 2 breaks that pattern. Folly's own documentation states three concrete cases: a factor of 1.5 lets the vector reuse a previously freed chunk after 4 reallocations; 1.45 after 3; 1.3 after only 2. This topic quotes those three numbers directly rather than re-deriving them: an attempt to reconstruct them from the obvious "sum of every freed chunk so far ≥ the next chunk requested" model does not reproduce them (that model converges at the same count for every factor under the golden ratio, φ ≈ 1.618, so it cannot be the model behind three different counts for three different factors — see `FACT-CHECK.md`, claim 3, for the full working). Folly's documentation doesn't spell out which specific allocator mechanism produces its numbers, so they are cited as Folly's own claim, not independently proven here.

### Four libraries, four choices

- **GCC's libstdc++** `std::vector` uses a growth factor of 2. (This topic cites Folly's own account of GCC's behaviour; an attempt to confirm it by fetching `libstdc++-v3/include/bits/stl_vector.h` directly from the GCC mirror was made, but this repository's plain-text source fetcher strips `<` and `>` as if they were HTML tags, which corrupts every comparison operator in the C++ source it returns. The claim on screen is attributed to Folly's documentation, not to GCC's source, because that is what was actually verified.)
- **Facebook's `folly::fbvector`** deliberately chose 1.5, trading more total copying for a vector that can eventually reuse its own freed memory, and tunes its reallocation sizes to cooperate with the jemalloc allocator's own size classes (named here, not built: see "The frontier").
- **CPython's `list`** over-allocates far more gently: `new_allocated = ((size_t)newsize + (newsize >> 3) + 6) & ~(size_t)3`, i.e. roughly the new size plus one eighth of it plus six, rounded down to a multiple of four. Its own source comment states the resulting pattern directly: 0, 4, 8, 16, 24, 32, 40, 52, 64, 76, … — confirmed in `examples.py` by implementing the same formula and reproducing that exact sequence.
- **Rust's `Vec`** documents no fixed growth factor at all. Its own documentation is explicit that the complexity bound (O(1) amortized push) is the guarantee, and the mechanism that delivers it is free to change between versions.

### reserve and shrink_to_fit, precisely

The current C++ working draft (N4868) states `reserve(n)`'s effect exactly: "Reallocation happens at this point if and only if the current capacity is less than the argument of reserve()," and once it has run, "No reallocation shall take place during insertions that happen after a call to reserve() until an insertion would make the size of the vector greater than the value of capacity()." `shrink_to_fit()` is described, word for word, as "a non-binding request to reduce capacity() to size()," with a note added specifically "to allow latitude for implementation-specific optimizations" — an implementation may legally do nothing at all.

### What reallocation invalidates, and why

Both functions carry the identical remark: "Reallocation invalidates all the references, pointers, and iterators referring to the elements in the sequence, as well as the past-the-end iterator," with the standard's own note that if no reallocation happens, they all remain valid. There is no partial case: either every one of them is still good, or none of them are. A vector cannot avoid this without giving up contiguity — the next topic, "Linked and intrusive lists," builds and measures the structure that keeps every element's address fixed for its whole lifetime, at the cost of giving up the cache-line win this topic states and leaves for that topic to measure.

</section>

<section data-section="production">

## In production

The classic way this bites in production code is exactly the shape step 9's predict describes: a pointer, reference or iterator taken into a vector, kept across a later call that might reallocate (a `push_back`, an `insert`, a `reserve` to a larger size, or a `shrink_to_fit` that happens to reallocate), and then dereferenced. The standard's wording makes this unconditional on the vector's side: there is no defined state in which the old pointer is "usually fine." The fix the standard itself points to is also unconditional: call `reserve` for the final size before taking any pointer you intend to keep across further insertions, since the standard specifically promises no reallocation will happen after that point until the reserved capacity would be exceeded.

</section>

<section data-section="frontier">

## The frontier

- **Allocator cooperation.** `fbvector`'s documentation describes detecting the jemalloc allocator and adjusting its reallocation sizes to match jemalloc's own size classes, so there is close to no slack between what the vector asks for and what the allocator actually hands back. Named here, not built: it is a property of one library paired with one allocator, not a general technique this topic can measure.
- **Object relocation.** Folly's documentation distinguishes types that are safely "relocatable" (movable by `memcpy`, with no internal self-pointers or external observers) from the C++ standard's conservative default that no type is. A vector of relocatable elements can reallocate by bulk-copying bytes instead of running each element's move constructor, which `fbvector` exploits through an opt-in trait. Named here; no syllabus topic builds it.

</section>

<section data-section="questions">

## More questions

- A vector calls `reserve(100)` while already at capacity 150. Does it reallocate? Why or why not, in the standard's own words?
- A vector calls `shrink_to_fit()` while at `size() == capacity()`. Can it reallocate? What does its own effects clause say happens to capacity() in that case?
- Two pointers are taken into a vector of size 10, capacity 16: one at index 0, one at index 9. A single `push_back` is called once, with no further insertions. Which of the two pointers, if any, are still valid afterward, and why does the answer not depend on which index each pointer pointed to?

</section>

<section data-section="next">

## Where this goes next

"Linked and intrusive lists" picks this topic's locality claim up directly: the same records held as separate linked nodes instead of one contiguous buffer, measured in real cache misses and wall-clock time against the contiguous array, plus what a pointer-based structure buys back (O(1) splice, addresses that never move) that a vector's reallocation rule can never offer.

</section>
