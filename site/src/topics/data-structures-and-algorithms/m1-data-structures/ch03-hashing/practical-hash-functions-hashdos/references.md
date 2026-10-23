Last verified: 2026-10-22. Expert sign-off: pending.

- xxHash README (`Cyan4973/xxHash`, `dev` branch) — XXH3's recommended-default status, its non-adversarial-input quality scoping, and its own benchmark table (XXH3 vs SipHash vs FNV64). [source](https://raw.githubusercontent.com/Cyan4973/xxHash/dev/README.md)
- wyhash README (`wangyi-fudan/wyhash`) — the "salted"/dynamic-secret design, named adoption (Zig, V, Nim, Go ≥1.17), and the project's own note that it has since evolved into rapidhash. [source](https://raw.githubusercontent.com/wangyi-fudan/wyhash/master/README.md)
- rustc-hash README (`rust-lang/rustc-hash`) — FxHash's explicit trade-off: no HashDoS resistance, because the compiler's own inputs aren't adversarial. [source](https://raw.githubusercontent.com/rust-lang/rustc-hash/main/README.md)
- Rust `std::collections::HashMap` documentation — the default SipHash 1-3 hasher, randomly seeded for HashDoS resistance, and the explicit warning that a fixed, non-random hasher loses that resistance. [source](https://doc.rust-lang.org/std/collections/struct.HashMap.html)
- Aumasson & Bernstein, "SipHash: a fast short-input PRF" (INDOCRYPT 2012) — the formal PRF definition, the hash-flooding history (1999 `dnscache`, Crosby & Wallach 2003, Klink & Wälde 2011), and the central correction this topic teaches: a randomly-seeded but still-linear hash is breakable by a timing/adaptive attacker. [source](https://www.aumasson.jp/siphash/siphash.pdf)
- Aumasson, Bernstein & Boßlet, "Hash-flooding DoS reloaded" (AppSec 2012 slides) — an independent primary record of the same two disclosures, plus a worked cost example (200,000 colliding 10-byte strings, ≈40 billion comparisons). [source](https://www.aumasson.jp/siphash/siphashdos_appsec12_slides.pdf)
- BLAKE3 README (`BLAKE3-team/BLAKE3`) — the cryptographic tier's own internal speed range (BLAKE3 faster than SHA-2 by design). [source](https://raw.githubusercontent.com/BLAKE3-team/BLAKE3/master/README.md)
- PEP 456, "Secure and interchangeable hash algorithm" — why CPython's own `hash()` of `str`/`bytes` has used SipHash since this PEP, specifically to fix hash-collision attacks (citing `oCERT-2011-003`). [source](https://peps.python.org/pep-0456/)
- Python documentation, "Command line and environment" — `PYTHONHASHSEED`, the real per-process control for that randomization. [source](https://docs.python.org/3/using/cmdline.html)

Canonical numbers (the three-tier speed ratios, the collision-flood timing ratio, and the before/after
bucket-scatter counts) are computed and asserted directly in this topic's `examples.py`, on this
machine, in one run — see `FACT-CHECK.md` for why an earlier draft's pure-Python-vs-C-accelerated
benchmark gave the wrong ordering, and why the fix uses Python's own built-in `hash()` as the
keyed/PRF tier rather than a from-scratch timed implementation.

Related tracks (see Prerequisites): this chapter's own foundation topic — nothing from earlier
chapters is reused directly, per `CHAPTER.md`.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=practical-hash-functions-hashdos:%20).
