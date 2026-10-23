Last verified: 2026-10-23. Expert sign-off: pending.

- Abseil, "Swiss Tables Design Notes" (Google) — the H1/H2 hash split, the one-control-byte-per-slot layout (one control bit plus a 7-bit H2 fingerprint), and the original design's own "winnow 16 candidates down... in only a few instructions" SIMD-compare claim. [source](https://abseil.io/about/design/swisstables)
- The Go Blog, "Faster Go maps with Swiss Tables" (go.dev, 2025) — a dated, current confirmation that Go 1.24 adopted this design for its built-in map, Go's own group width (8 slots, distinct from Abseil's original 16), and the shared load-factor payoff of testing a whole group's control bytes in parallel. [source](https://go.dev/blog/swisstable)
- `hashbrown` crate README (Rust, `rust-lang/hashbrown`, `master` branch) — Rust's standard library `HashMap`'s own adoption of this design since Rust 1.36, and the real memory-overhead payoff (1 byte of control-metadata overhead per entry instead of 8). [source](https://raw.githubusercontent.com/rust-lang/hashbrown/master/README.md)

Canonical numbers (the group-compare-vs-byte-scan cost asymmetry on both an average and a packed
group, and the 7-bit fingerprint's measured false-positive rate) are computed and asserted directly
in this topic's `examples.py`, on this machine, in one run — see `FACT-CHECK.md` and `post-notes.md`
for the real bug that first run caught in the false-positive-rate's own theoretical calculation, and
for why Abseil's 16-wide groups and Go's 8-wide groups are named as two distinct, real widths rather
than one universal constant.

Related tracks (see Prerequisites): topic 18 (linear probing and open addressing) for the probe
sequence and tombstone concepts this topic restates; topic 16 (practical hash functions) for the
hash function split into H1 and H2 unchanged.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=simd-group-probing-tables:%20).
