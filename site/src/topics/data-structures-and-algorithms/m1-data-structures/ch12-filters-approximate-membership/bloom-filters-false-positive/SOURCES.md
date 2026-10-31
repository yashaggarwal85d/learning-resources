# Sources: Bloom filters and false-positive math (`dsa.bloom-filters-false-positive`)

## Primary: Broder and Mitzenmacher, "Network applications of Bloom filters: a survey"

URL: https://www.eecs.harvard.edu/~michaelm/postscripts/im2005b.pdf
Version: Internet Mathematics 1(4), 2004, pp. 485–509, fetched 2026-10-31 (clean text, no mangling)

> within a factor of log2 e ≈ 1.44 of the (asymptotic) lower bound

> Thus, space-wise Bloom filters are within a factor of log2 e ≈ 1.44 of the (asymptotic) lower bound

The survey derives the false-positive rate from the probability a given bit is still zero after
kn insertions, `p = (1 − 1/m)^(kn) ≈ e^(−kn/m)`, calling this approximation "very close (within
O(1/m))" to the exact value, and gives the optimum `k = (m/n) ln 2` with rate `(1/2)^k`. It states
the counting lower bound `m ≥ n·log2(1/ε)` and the equal-space comparison of the Bloom filter's
achievable rate `(0.6185)^j` against the bound's `(0.5)^j` for j bits per key, and attributes the
fill-fraction concentration (half the bits are one at the optimum, with high probability) to a
martingale argument (Mitzenmacher).

## Primary: Kirsch and Mitzenmacher, "Less hashing, same performance: building a better Bloom filter"

URL: https://www.eecs.harvard.edu/~michaelm/postscripts/rsa2008.pdf
Version: Random Structures and Algorithms 33(2), 2008, pp. 187–218, fetched 2026-10-31 (clean text, no mangling)

> A standard technique from the hashing literature is to use two hash functions h1 (x)
> and h2 (x) to simulate additional hash functions of the form gi (x) = h1 (x) + ih2 (x).

> only two hash functions are necessary to effectively implement a Bloom filter without any loss in
> the asymptotic false positive probability

Section 3 gives the construction used in this topic's probe trick: `k` hash functions of the form
`gi(x) = h1(x) + i·h2(x) mod p`, each assigned a disjoint subarray of `p` bits (`m = kp`), insert
sets the `gi(x)`-th bit of each subarray, and a query answers "maybe" only if every `gi(y)`-th bit
is set.

## Primary: LevelDB `util/bloom.cc`

URL: https://raw.githubusercontent.com/google/leveldb/main/util/bloom.cc
Version: `main` branch, fetched 2026-10-31. `sources.mjs`'s own fetch mangled the bare `<`/`>`
comparison operators (the known C-header bug); re-fetched cleanly with `WebFetch` directly on
the raw URL. Verbatim:

> k_ = static_cast<size_t>(bits_per_key * 0.69);  // 0.69 =~ ln(2)

> if (k_ < 1) k_ = 1;
> if (k_ > 30) k_ = 30;

> // For small n, we can see a very high false positive rate.  Fix it
> // by enforcing a minimum bloom filter length.
> if (bits < 64) bits = 64;

> dst->push_back(static_cast<char>(k_));  // Remember # of probes in filter

> const uint32_t delta = (h >> 17) | (h << 15);  // Rotate right 17 bits

> return "leveldb.BuiltinBloomFilter2";

The file's own comment on the probe delta cites `[Kirsch,Mitzenmacher 2006]` (the paper above, in
its earlier ESA preprint year). `k_` is truncated (`static_cast<size_t>`, which floors a positive
float), not rounded, from `bits_per_key * 0.69`; this topic names that difference against Chapter
5 topic 28's `round(bits_per_key * ln(2))` once (see FACT-CHECK.md).

## Primary: RocksDB wiki, "RocksDB Bloom Filter"

URL: https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter
Version: wiki page as of 2026-10-31. The page returns HTTP 403 to a direct fetch from this
sandbox (both `sources.mjs`'s own fetch and a direct `curl`); read instead via `WebFetch`, which
returned these sentences as exact quotes.

> 1.5 bits per key (50% false positive rate) is 50% as effective as 100 bits per key

> 9.9 bits per key (1% false positive rate) is 99% as effective as 100 bits per key

> 15.5 bits per key (0.1% false positive rate) is 99.9% as effective as 100 bits per key

> a new implementation is used with format_version=5 (version 6.6) and later

> The new implementation is below 0.1% FP rate with only 16 bits/key.

> a new Bloom filter alternative is available as a drop-in replacement (since version 6.15.0)

> saving about 30% of Bloom filter space (most importantly, memory)

This is the same 9.9-bits-per-key, ~1% row that Chapter 5 topic 28 cited; this topic's
`examples.py` reproduces it from the formula (`k = round(9.9 · ln 2) = 7`, measured rate ≈ 0.82%,
within the planning table's formula value of 0.82%, close to RocksDB's rounder "1%").

### Citation only, not read beyond title/abstract (per CHAPTER.md)

- Bloom, B.H., "Space/time trade-offs in hash coding with allowable errors," Communications of the
  ACM 13(7), 1970, pp. 422–426. Title and venue checked; not read. Attributed only as the
  structure's origin, no claim quoted from it.
- Bose, P., Guo, H., Kranakis, E., Maheshwari, A., Morin, P., Morrison, J., Smid, M., Tang, Y.,
  "On the false-positive rate of Bloom filters," Information Processing Letters 108(4), 2008,
  pp. 210–213. Title checked; abstract not read. Cited only for the claim that the textbook
  `(1 − e^{−kn/m})^k` formula is an approximation, not the exact false-positive probability — this
  topic states that the formula is an approximation (per the Broder–Mitzenmacher survey's own
  "very close, within O(1/m)" language) without asserting Bose et al.'s own exact correction.
- Putze, F., Sanders, P., Singler, J., "Cache-, hash- and space-efficient Bloom filters," ACM J.
  Exp. Algorithmics 14, 2009 (conference version: Experimental Algorithms 2007). Title checked
  only; named once in post-notes for the skipped blocked/cache-local Bloom filter, no claim
  quoted.
- Mitzenmacher, M. and Upfal, E., *Probability and Computing*, 2nd ed. — the syllabus's canonical
  textbook reference for the chapter; not quoted directly, cited as general background.

### Chapter 5 topic 28 cross-reference (not a new source, reused from the registry)

Topic 28 (`de...` / `dsa.` LSM read path topic, live) measured a per-run Bloom filter at 9.9 bits
per key against RocksDB's published table (the same table quoted above) and used
`k = round(bits_per_key · ln 2)`. This topic derives the formula that number comes from; see
FACT-CHECK.md's reconciliation row.
