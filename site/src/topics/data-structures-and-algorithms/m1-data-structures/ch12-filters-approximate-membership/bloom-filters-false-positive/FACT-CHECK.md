# FACT-CHECK: Bloom filters and false-positive math (`dsa.bloom-filters-false-positive`)

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Structure: k hash functions over m bits; insert sets k bits, query reports "maybe" if all k set, "absent" at the first zero; no false negatives ever | Broder & Mitzenmacher survey §2; LevelDB `util/bloom.cc` | Verified — survey text + code read directly |
| 2 | `f ≈ (1 − e^{−kn/m})^k`, approximation "very close (within O(1/m))" to exact | Broder & Mitzenmacher survey | Verified — quoted in SOURCES.md |
| 3 | Optimal `k = (m/n) ln 2`, giving rate `(1/2)^k` | Broder & Mitzenmacher survey | Verified; reproduced in `examples.py` (fill 0.503 at the optimum) |
| 4 | The rate-vs-k valley is flat near the optimum (k=6,7,8 close at 10 bits/key) | Derived from the formula; planning table in CHAPTER.md | Verified — `examples.py` measures k=6: 0.82%, k=7: 0.82%, k=8: 0.88%, within 10% of each other |
| 5 | Lower bound `m ≥ n·log₂(1/ε)` for any filter with no false negatives | Broder & Mitzenmacher survey (counting argument) | Verified — quoted; Chapter 1's `information-theoretic-bound` applied to a new object |
| 6 | Bloom's own optimum needs `n·log₂(e)·log₂(1/ε) ≈ 1.44×` the bound | Broder & Mitzenmacher survey, "within a factor of log2 e ≈ 1.44" | Verified — quoted and reproduced exactly in `examples.py` (ratio = log2(e) to 1e-9) |
| 7 | Equal-space comparison: Bloom's rate `(0.6185)^j` vs. bound's `(0.5)^j` | Broder & Mitzenmacher survey | Verified — in SOURCES.md's quoted passage; not separately re-derived numerically in `examples.py` (the 1.44 bound check covers the same relationship) |
| 8 | Two hash functions can simulate k via `g_i(x) = h1(x) + i·h2(x) mod m` with no loss in asymptotic FP rate | Kirsch & Mitzenmacher 2008 | Verified — abstract and §3 quoted; reproduced in `examples.py` (derived 0.836% vs. independent 0.817% at 10 bits/key, k=7 — within sampling noise) |
| 9 | LevelDB: `k_ = bits_per_key * 0.69` truncated (not rounded), clamped 1..30; minimum filter size 64 bits; k stored as filter's last byte; probe delta `(h>>17)\|(h<<15)` citing Kirsch-Mitzenmacher | `util/bloom.cc`, fetched via WebFetch after `sources.mjs` mangled the `<`/`>` operators | Verified — re-fetched clean copy read directly |
| 10 | RocksDB: 9.9 bits/key ≈ 1% FPR; `format_version=5` (6.6+) reaches <0.1% at 16 bits/key; Ribbon filter (6.15.0+) saves ~30% space at same FPR | RocksDB wiki "RocksDB Bloom Filter" | Verified — quoted directly in SOURCES.md |
| 11 | No deletes: clearing a key's bits can falsely clear bits other keys depend on (false negative) | Mechanism of the structure itself (bits are shared, never per-key) | Verified by construction — `examples.py` finds a real instance by search, not hand-picked |
| 12 | Chapter 5 topic 28's 9.9 bits/key, k=round(bits_per_key·ln2)=7, lands near RocksDB's 1% row | Reusing topic 28's own registry entry and the RocksDB table above | Verified — `examples.py` computes k=7, formula rate 0.86%, within the 1% row's rounding |
| 13 | Bloom (1970) is the structure's origin; Bose et al. (2008) argue the textbook formula is an approximation, not exact | Citation-checked only, per CHAPTER.md — titles/venues confirmed, neither paper's body read | Citation only — no claim beyond "the formula is an approximation" is asserted from Bose et al., consistent with the survey's own "very close, within O(1/m)" language |

## Currency check

All sources read 2026-10-31. LevelDB `util/bloom.cc` read from the `main` branch at fetch time
(file is stable; LevelDB's Bloom filter implementation has not changed materially in years).
RocksDB wiki reflects the page as of 2026-10-31, including the `format_version=5` / 6.6+ and
Ribbon-filter (6.15.0+) sections, both already-released versions, not upcoming features.

## Red team

1. **The formula is an approximation, not exact.** The survey itself says `e^{-kn/m}` is "very
   close (within O(1/m))" to the true probability, and CHAPTER.md flags Bose et al. 2008 as
   showing the textbook formula isn't exact. This topic states the formula as derived and
   measures it against a real implementation (agreement within sampling noise at n=200,000),
   without claiming the formula is exact — `post-notes.md` and the reveal's narration both say
   "approximately," never "exactly."
2. **The own-code bug this build hit is itself informative, not just a fix.** The first
   `examples.py` draft used Python's `hash()` to simulate k independent hash functions and got a
   false-positive rate 2-3x the formula's prediction — not because the formula was wrong, but
   because the simulated hash functions weren't independent enough. This is exactly the gap
   between "the math" and "an implementation" the topic teaches; recorded in `OUTLINE.md`'s
   "Changes from the chapter plan" and in `post-notes.md`'s production-failures section as a
   real, generalizable lesson (a hand-rolled or poorly-mixed hash can silently inflate a Bloom
   filter's real-world false-positive rate above its formula prediction).
3. **LIRS/ARC/2Q from the previous topic are not reused as sources here** — this topic's only
   tie to Chapter 11 is the ghost-list handoff concept, named once, not re-verified.
4. **The LevelDB truncation vs. topic 28's rounding** (`int(bits_per_key*0.69)` = 6 at 10
   bits/key, vs. `round(bits_per_key*ln2)` = 7) is named once in SOURCES.md and OUTLINE.md, not
   presented as a discrepancy needing resolution — both are valid choices within the flat valley
   (step 5), and `examples.py` computes both explicitly (asserts 6 and 7 respectively).
5. **Double hashing's reuse across chapters:** Chapter 3's `double-hashing` concept is an open-
   addressing probe sequence (resolves a collision by trying successive slots); this topic's
   `g_i(x) = h1(x)+i·h2(x)` is the same arithmetic shape but a different purpose (spreading k
   independent probes for one key, not resolving a collision between two keys). The topic says
   this explicitly in one sentence (step 9's narration/post-notes), not left implicit.

## Corrections applied

- `examples.py`'s first draft measured false-positive rates several times higher than the
  formula predicted, across every bits-per-key value tested. Root-caused to Python's `hash()`
  tuple-mixing leaving correlation between probes of the same key when combined with small
  sequential integers (the probe index `i`). Fixed by switching to a SHA-256-based 64-bit hash
  for every simulated hash function (both the k-independent-hashes `BloomFilter` and the
  two-hash `DerivedProbeBloomFilter`). Re-ran: every measured rate now lands within sampling
  noise of its formula prediction, matching CHAPTER.md's planning table.
