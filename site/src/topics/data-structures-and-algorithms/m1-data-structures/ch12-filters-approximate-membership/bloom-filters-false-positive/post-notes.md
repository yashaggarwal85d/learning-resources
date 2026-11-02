<section data-section="outcomes">

## Outcomes

- Derive the false-positive rate, the optimal number of hash functions, and the bits-per-key cost
  from the single line "a bit is still zero after kn settings with probability ≈ e^(−kn/m)," and
  check each derivation against a measured implementation.
- Size a Bloom filter for a target rate and key count, and explain why reaching a far rarer rate
  costs a small, fixed number of extra bits per key rather than a proportionally larger multiple
  of the memory.
- Explain the 1.44x gap between a Bloom filter's own best rate and the best any filter could
  achieve, how two hash values can replace k independent ones, and why the structure cannot
  support a delete.

</section>

<section data-section="internals">

## Internals

The false-positive rate formula is a direct consequence of one probability: after `n` keys each
set `k` bits, a given bit is still zero with probability close to `e^(−kn/m)` (the survey calls
this approximation "very close, within O(1/m)" of the exact value — not claimed exact here). A
false positive needs every one of a key's `k` bits to already be set by something else, so the
rate is that same shrinking probability's complement, raised to the `k`th power. Minimizing that
expression over `k` gives the optimal number of hash functions, `k = (m/n) ln 2`; at that `k`
exactly half the filter's bits are set (measured: 0.503 in `examples.py`), and the rate collapses
to one-half raised to `k`. The curve around that optimum is flat — in `examples.py`, k = 6, 7 and
8 at ten bits per key all land within ten percent of each other — which is exactly why LevelDB
feels free to *truncate* `bits_per_key * 0.69` rather than round it (`k=6` at ten bits/key, versus
the rounded `k=7` Chapter 5 topic 28 used; both are near-optimal, not a bug either way).

The space lower bound is Chapter 1's information-theoretic counting argument applied to a new
object: any filter promising zero false negatives at a target rate `ε` must be able to represent
enough distinct `m`-bit strings to separately identify every possible set that could produce a
"maybe," which forces `m ≥ n·log₂(1/ε)` bits. A Bloom filter's own optimal construction needs
`n·log₂(e)·log₂(1/ε) ≈ 1.44` times that floor — a *fixed* multiplicative gap that never grows as
the target rate gets rarer (verified algebraically in `examples.py`: the ratio is exactly
`log₂(e)` to within floating-point precision). The two-hash probe trick (Kirsch and
Mitzenmacher) computes `g_i(x) = h1(x) + i·h2(x) mod m` from only two independently computed hash
values, and measured against `k` genuinely independent hash functions at the same bits per key,
the two agree within sampling noise (0.817% versus 0.836% in `examples.py`, at ten bits/key,
k=seven). This is the same probe-arithmetic shape as Chapter 3's double hashing — there, the
sequence resolves a collision between two keys competing for one slot; here, it spreads one
key's own k probes across the filter.

</section>

<section data-section="lab">

## Lab

`examples.py`'s own lab, standard Bloom filter only (the syllabus's Lab bullet also names blocked
Bloom, cuckoo and ribbon/binary-fuse structures, all skipped per `CHAPTER.md`): measured
false-positive rate at eight, ten, twelve, sixteen and twenty bits per key against two hundred
thousand absent keys, each matching its formula value within sampling noise; the flat-valley
measurement across eight values of k at ten bits per key; the fill fraction at the optimum; the
bound comparison at one percent and one in a million; the derived-probe-versus-independent-hash
agreement; and a found (not hand-picked) deletion failure on a small filter. Queries-per-second
and cache-miss counts from the syllabus's own Lab bullet are not measured here (out of this
topic's scope per CHAPTER.md) — a sourced extension for a reader who wants to go further.

</section>

<section data-section="production">

## Production failures this topic warns about

This build's own first attempt at `examples.py` is itself a cautionary example: simulating `k`
independent hash functions by combining Python's built-in `hash()` with a small integer index
produced a false-positive rate two to three times higher than the formula predicted, at every
bits-per-key value tested — not because the formula was wrong, but because the simulated hash
functions weren't independent enough in practice. Switching to a properly mixed hash (SHA-256,
truncated) fixed it immediately. The general lesson: a Bloom filter's measured false-positive
rate can silently run well above its formula's prediction if the underlying hash mixing is weak
or correlated, and the gap is invisible from reading the code — it only shows up by measuring
against the derived formula on real data, which is exactly the discipline this topic's own build
had to apply to itself.

Clearing a key's bits to simulate a delete (step "No deletes") can silently turn a key that is
still genuinely present into a false negative, because bits are shared across keys with no
reference count. The one real defense is architectural, not algorithmic: build the filter once
over an immutable set of keys and never edit it, which is exactly why an LSM run's own filter
never needs to support a delete.

</section>

<section data-section="frontier">

## Frontier

The practitioner's view of this structure — sizing it from a target rate, where it sits in an
LSM read path, column filters, join pruning and runtime filters, and where cuckoo, xor and
ribbon filters run in production — is Data Engineering §5.6; this topic gives the mathematics
underneath it and points there by name, not by a built link (not live when this topic shipped).

RocksDB's own newer Bloom implementation (`format_version=5`, shipped in version 6.6 and later)
reaches below a tenth of a percent false-positive rate using only sixteen bits per key, where the
older implementation needed closer to a hundred bits per key to approach that rate — named here,
not built, since this topic's formula and the classical construction are the syllabus's scope.
RocksDB's Ribbon filter (since version 6.15.0) is a different structure entirely, saving about
thirty percent of the space at the same false-positive rate, at a higher construction cost — one
of the several *(skipped)* structures (blocked and partitioned Bloom, cuckoo, quotient, xor,
binary fuse and ribbon filters) that each attack one of this topic's two costs: the 1.44x space
gap, or the inability to delete. Bose et al.'s 2008 paper (citation only, not read beyond the
title) is cited for the claim that the textbook formula used throughout this topic is itself an
approximation, not an exact probability — consistent with, not contradicting, the survey's own
"very close, within O(1/m)" language.

</section>

<section data-section="where-next">

## Where this goes next

A Bloom filter answers one question — "is this key maybe present" — at close to the
information-theoretic floor, and pays for that with a one-sided wrong answer and two permanent
limitations: no delete, no listing. When the thing being stored is a set of integers and every
answer must be exact, with fast intersections and unions, a different structure takes over:
compressed bitmaps, one bit per possible value, compressed in pieces — Roaring, next.

</section>
