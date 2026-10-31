# Fact-check — de.hyperloglog-distinct-counting

## Claim 1: a HyperLogLog register tracks the position of the leftmost set bit of a hashed value, and the structure averages registers with a harmonic rather than geometric mean
Source: Flajolet, Fusy, Gandouet, Meunier, the original HyperLogLog paper (SOURCES.md #1).
> "H YPER L OG L OG, described in detail in the next section, is based on the same observable as
> L OG L OG, namely
> the largest ρ value obtained, where ρ(x) is the position of the leftmost 1-bit in binary string
> x."
> "our algorithm differs from standard L OG L OG by its
> evaluation function: its is based on harmonic means, while the standard algorithm uses what
> amounts to
> a geometric mean"
Verdict: Confirmed directly from the paper's own introduction, and reproduced in `examples.py`:
each register stores the longest run of leading zeros seen for keys hashing to that register's
index, and the final estimate is computed from the harmonic mean of `2^(-register)` across all
registers, matching the structure's own named evaluation function.

## Claim 2: HLL++ corrects the raw estimator's real small-cardinality bias with a measured, interpolated table, and uses a sparse representation to avoid storing empty registers
Source: Heule, Nunkesser, Hall, the Google HyperLogLog++ engineering paper (SOURCES.md #2).
> "we can compute
> the observed bias and use it to correct the raw estimate."
> "We use knearest neighbor interpolation to get the bias for a given
> raw estimate"
> "Instead, we can use a sparse representation that stores pairs (idx, %(w)). If the list of such
> pairs
> would require more memory than the dense representation
> of the registers (i.e., 6m bits), the list can be converted to
> the dense representation."
Verdict: Confirmed directly from the paper's own Section 5 and 6. Not separately reproduced in
`examples.py`: this topic's own lab scope is the base HyperLogLog structure (per CHAPTER.md), and
HLL++'s own refinements are documented, quoted facts rather than something this sandbox needs a
second implementation to re-demonstrate.

## Claim 3: a real warehouse's `APPROX_COUNT_DISTINCT` trades exactness for speed on purpose, against exact `COUNT(DISTINCT)`
Source: BigQuery documentation, "Approximate aggregate functions" (SOURCES.md #3).
> "Returns the approximate result for COUNT(DISTINCT expression). The value
> returned is a statistical estimate, not necessarily the actual value."
> "This function is less accurate than COUNT(DISTINCT expression), but performs
> better on very large input."
Verdict: Confirmed directly from a real, shipped engine's own documentation.

## Claim 4: Theta-sketch set operations (union, intersection, difference) follow real, documented accuracy rules, and a mixed operation's result can hold anywhere from zero to all of the union's retained values
Source: Apache DataSketches documentation, "Theta Sketch Set Operations Accuracy" (SOURCES.md #4).
> "All set operations (Union, Intersection, Difference) between two sketches A and B
> must obey the following two rules:"
> "This means, of course, that depending on the operations and the data, the result set could
> have
> zero, all, or some number in between of the retained values of the Union sketch."
Verdict: Confirmed directly from a real, shipped sketch library's own documentation — the real
capability (set intersection and difference) that HyperLogLog itself does not provide, which is
exactly why this topic names Theta/KMV sketches as the tool to reach for instead.

## Claim 5 (this course): a real HyperLogLog's measured error against an exact count shrinks as register count grows; merging two partitioned sketches produces the identical estimate a single combined-stream sketch would; a Count-Min Sketch never undercounts a key's true frequency
Source: `examples.py`, run directly against a real Zipf-skewed stream (20,000 distinct keys,
200,000 events).
Measured: exact distinct count 11,121. HyperLogLog error against that exact count: 4.24% at 256
registers, 3.54% at 1,024, 2.60% at 4,096, 0.47% at 16,384 — monotonically shrinking as register
count grows. A sketch built by merging two partitioned sketches (register-wise maximum) produced
an estimate (11,409.9) identical to a single sketch built over the same combined stream. A
Count-Min Sketch's estimate for each of the stream's five heaviest keys was never below that
key's true count (e.g. 41,007 estimated vs. 41,000 true for the single heaviest key).
Verdict: Confirmed by direct computation, not asserted from a source. Deterministic (fixed
seeds): re-running produced byte-identical output.

## Problem Solving
- Both PDF-extracted sources (the original HyperLogLog paper and the HLL++ paper) use a small-caps
  font that gets extracted with spaces inserted between letters (e.g. "H YPER L OG L OG" for
  "HyperLogLog"); quoted exactly as extracted rather than "cleaned up," since `sources.mjs
  check`'s own comparison is against the literal extracted text. The HLL++ paper also drops the
  hyphen in "k-nearest," extracting as "knearest" — quoted exactly as extracted for the same
  reason, following the precedent already recorded from this chapter's own PDF-sourcing topics.
- The original paper's abstract uses a standalone "√" character on its own line (a dropped
  superscript/radical glyph); the two quotes used from this source were chosen to avoid that
  character entirely rather than attempt to reproduce it, since the surrounding sentence (the
  64%-memory comparison and the register-observable definition) carries the same factual content
  without it.
- `examples.py`'s own merge-matches-single-pass check uses `==` rather than an approximate
  tolerance deliberately: taking the register-wise maximum across two sketches is an exact
  operation (not an approximation layered on an approximation), so the merged and single-pass
  estimates are expected to be bit-for-bit identical, and the check verifies that rather than
  allowing drift.
