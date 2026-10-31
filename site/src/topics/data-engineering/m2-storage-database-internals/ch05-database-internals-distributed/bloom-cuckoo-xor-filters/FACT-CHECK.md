# Fact-check — de.bloom-cuckoo-xor-filters

## Claim 1: a Bloom filter gives approximate membership with false positives possible but false negatives never
Source: Wikipedia, "Bloom filter" (SOURCES.md #1, substituting for the unfetchable original 1970 paper — see Problem Solving).
> "In computing, a Bloom filter is a space-efficient probabilistic data structure, conceived by
> Burton Howard Bloom in 1970, that is used to test whether an element is a member of a set. False
> positive matches are possible, but false negatives are not – in other words, a query returns
> either "possibly in set" or "definitely not in set"."
Verdict: Confirmed, and reproduced directly in `examples.py`: every one of the first 500 inserted
keys is still found present after building the filter, at both a strict and a loose target rate —
the real property the source names.

## Claim 2: sizing follows a real bits-per-key-vs-target-false-positive-rate relationship, roughly 10 bits per key for 1%
Source: Wikipedia, "Bloom filter" (SOURCES.md #1).
> "More generally, fewer than 10 bits per element are required for a 1% false positive
> probability, independent of the size or number of elements in the set."
Verdict: Confirmed directly by `examples.py`'s own sizing formula and measurement: sizing 20,000
keys for a 1% target rate needs 9.59 bits per key, under the 10-bit figure the source states, and
the measured false-positive rate (1.0205% over 200,000 disjoint held-out keys) lands within 0.02
percentage points of the formula's own predicted rate (1.0039%).

## Claim 3: a standard Bloom filter cannot delete a single item without rebuilding the whole filter; a cuckoo filter deletes by removing a stored fingerprint
Source: cuckoo filter paper, Fan, Andersen, Kaminsky, Mitzenmacher (SOURCES.md #3).
> "However, they do not permit deletion of items from the set,"
> "Standard Bloom filters cannot delete, thus removing a single item requires rebuilding the entire
> filter, while counting"
> "are like counting Bloom filters that can delete inserted items"
Verdict: Confirmed directly from the paper's own abstract and body. Not separately reproduced in
`examples.py`: this topic's own scope is sizing and measuring the Bloom filter base case: what a
cuckoo filter adds is a documented, quoted capability (real deletes), not something this sandbox
needs its own cuckoo-filter implementation to re-demonstrate.

## Claim 4: an xor filter is immutable once built, needs the whole set known up front, and trades that build cost for being smaller and faster than a Bloom or cuckoo filter at the same false-positive rate
Source: xor filter paper, Graf & Lemire (SOURCES.md #2).
> "can be faster than Bloom and cuckoo filters while using less memory. We further show that a
> more compact"
> "While an xor filter is immutable, we believe that it is not a limitation for many important
> applications; competitive alternatives all have limited mutability in any case."
Verdict: Confirmed directly from the paper's own abstract and discussion section.

## Claim 5: RocksDB's own Ribbon filter trades build cost (CPU and temporary memory) for roughly 30% less space than a Bloom filter at the same false-positive rate
Source: RocksDB wiki, "RocksDB Bloom Filter" (SOURCES.md #4).
> "A new Bloom filter alternative is available as a drop-in replacement (since version 6.15.0),
> saving about 30% of Bloom filter space (most importantly, memory) but using about 3-4x as much
> CPU on filters."
> "There is higher temporary (untracked) memory use during construction of each Ribbon filter
> compared to Bloom filters (~231 bits per key vs. ~74 bits per key), but only ~50 filters (SST
> files or partitions) are needed to recoup this extra memory with savings from constructed
> filters. Ribbon filter construction could also slow peak write rates in some cases."
Verdict: Confirmed directly from RocksDB's own documentation — a real, shipped engine's own
documented instance of the "trading build cost for space" half of this topic's scope line.

## Claim 6 (this course): a real Bloom filter's measured false-positive rate tracks its own sizing formula's predicted rate closely, at both a strict and a loose target
Source: `examples.py`, run directly.
Measured: at a 1% target over 20,000 keys, 1.0205% measured vs. 1.0039% predicted (200,000
held-out trials); at a 10% target over 500 keys, 10.5000% measured vs. 10.0647% predicted (1,000
held-out trials). No false negative occurred in either run.
Verdict: Confirmed by direct computation, not asserted from a source. Deterministic (fixed seeds):
re-running produced byte-identical output both times.

## Problem Solving
- The original Bloom filter paper (Bloom, 1970, Communications of the ACM) has no confirmed free
  full-text copy reachable from this sandbox: the ACM Digital Library DOI page is paywalled, and
  the USPTO-hosted scan (an exhibit in an unrelated patent petition) returns a blocked CloudFront
  request rather than the document. Following the precedent `de.lsm-trees-write-read` (topic 8)
  already set for its own unfetchable original LSM-tree paper, this topic substitutes Wikipedia's
  own article on the structure, which states the identical no-false-negatives/approximate-
  membership mechanism and cites the original paper directly, as SOURCES.md #1 documents.
- The cuckoo filter paper's abstract uses UTF-8 curly/smart quote characters around the word
  "standard" (confirmed byte-for-byte with `cat -A`); `sources.mjs check`'s own quote normalizer
  converts curly and straight quotes to the same character before comparing, so no special
  handling was needed in `SOURCES.md` beyond quoting the sentence's unquoted portion.
- The xor filter paper's PDF-extracted text wraps "bits\nper entry" across a line break inside one
  quoted sentence; `sources.mjs check`'s own whitespace normalizer collapses this before matching,
  confirmed by running the check rather than assumed.
