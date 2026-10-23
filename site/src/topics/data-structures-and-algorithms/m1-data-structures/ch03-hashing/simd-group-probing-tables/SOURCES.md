# Sources — SIMD group-probing tables (Swiss Tables)

## Abseil, "Swiss Tables Design Notes" (Google)

URL: https://abseil.io/about/design/swisstables
Version: Abseil design-notes page, fetched 2026-10-23

> H1, a 57 bit hash value, used to identify the element index within the table
itself, which is truncated and modulated as any normal hash value would be for
lookup and insertion purposes.

> H2, the remaining 7 bits of the hash value, used to store metadata for this
element.

> Each metadata entry consists of one byte, which
consists of a single control bit and the 7 bit H2 hash.

> Because we can winnow 16
candidates down to only those with a matching H2 hash in only a few
instructions, we are functionally searching very deep probe chains
inexpensively.

Contents:
- The H1/H2 hash split, in Abseil's own original design notes: H1 (57 bits) picks the element's index; H2 (the remaining 7 bits) is stored as metadata, not the key itself.
- The one-byte-per-slot control metadata: one control bit plus the 7-bit H2 fingerprint, matching this topic's "one control byte per slot" syllabus clause exactly.
- The "winnow 16 candidates" line directly grounds the syllabus's "matching 16 slots per SIMD instruction" claim in Abseil's own words, from the original 2017/2018 design.

## The Go Blog, "Faster Go maps with Swiss Tables" (go.dev)

URL: https://go.dev/blog/swisstable
Version: Go Blog post, fetched 2026-10-23

> In 2017, Sam Benzaquen, Alkis Evlogimenos, Matt Kulukundis, and Roman Perepelitsa at Google presented a new C++ hash table design, dubbed “Swiss Tables”.

> In 2018, their implementation was open sourced in the Abseil C++ library.

> Go 1.24 includes a completely new implementation of the built-in map type, based on the Swiss Table design.

> If it is in use, the byte contains the lower 7 bits of the hash for that slot’s key (called h2).

> we have effectively performed 8 steps of a probe sequence at once, in parallel.

> This improvement to probing behavior allowed both the Abseil and Go implementations to increase the maximum load factor of Swiss Table maps compared to prior maps, which lowers the average memory footprint.

Contents:
- A dated, verified confirmation that Go 1.24 (not an older, remembered version) adopted the Swiss Table design for its built-in map — exactly the syllabus's "adopted by... Go's built-in map since Go 1.24" clause, cited from Go's own blog rather than assumed.
- Go's own group size (8 slots per control word, versus Abseil's original 16-wide SSE groups) — an honest, verified difference between the two real adoptions, not glossed over as identical.
- The forcing problem's real payoff, in the Go team's own words: testing a whole group's control bytes "at once, in parallel" turns what would be several sequential probes into one operation, which is why both real implementations could safely raise their maximum load factor.

## `hashbrown` crate README (Rust, `rust-lang/hashbrown`)

URL: https://raw.githubusercontent.com/rust-lang/hashbrown/master/README.md
Version: `master` branch, fetched 2026-10-23

> This crate is a Rust port of Google's high-performance [SwissTable] hash map,
adapted to make it a drop-in replacement for Rust's standard `HashMap` and
`HashSet` types.

> Since Rust 1.36, the Rust standard library has adopted this implementation for
`HashMap`, using its own default hasher

> Lower memory usage: only 1 byte of overhead per entry instead of 8.

> SIMD lookups to scan multiple hash entries in parallel.

Contents:
- A dated, verified confirmation that Rust's standard library `HashMap` has used this design since Rust 1.36 — the syllabus's third named adopter, cited from the crate's own current README.
- The concrete memory payoff this topic's "forcing problem" step leans on: one byte of control-metadata overhead per entry, instead of the pointer-and-allocation overhead a node-per-entry chained table pays.
