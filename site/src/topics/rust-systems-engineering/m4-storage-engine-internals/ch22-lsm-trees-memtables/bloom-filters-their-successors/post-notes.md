---
title: "Bloom filters and their successors"
---

## Outcomes

- Build a real, minimal Bloom filter: a bit array and a chosen number of independent hash functions.
- Measure that every key actually inserted is always reported as possibly present — zero false negatives, ever, at any bits-per-key budget.
- Measure that false positives genuinely exist at a tight bits-per-key budget: a positive result is not a guarantee.
- Measure that spending more bits per key genuinely lowers the real, measured false-positive rate.
- State, from RocksDB's own wiki, the real diminishing-returns shape of that bits-per-key trade, and why cutting unneeded disk reads is the whole point.

## Internals

The zero-false-negatives claim checks every one of the two thousand actually-inserted keys, not a sample, at both a tight and a generous budget. The false-positive measurements probe a disjoint range of keys that share no overlap with the inserted keys, so a measured false positive is genuinely a key the filter was never given. This topic's own hash-position function combines two independent base hashes via the Kirsch-Mitzenmacher technique to stand in for several genuinely independent hash functions from only two underlying hash computations — a real, standard technique, not an ad hoc shortcut.

## In production

RocksDB's own wiki states its bits-per-key table directly: 9.9 bits per key, for a 1% false positive rate, is 99% as effective as 100 bits per key — a real, diminishing-returns shape. Its own Basic Operations page states why any of this is worth doing at all: the optional FilterPolicy mechanism reduces the number of disk reads substantially, by a factor of approximately a hundred for a `Get()` call.

## The frontier

The syllabus names per-level allocation (Monkey), Ribbon/xor filters, and prefix filters for range scans as further material beyond this topic's own core measured claims; this topic covers the core guarantee and trade directly and names the successors in prose, since the core Bloom filter mechanics are what every successor still builds on. All of this topic's own measured claims run entirely on an in-memory Rust bit array, with no file, network, or root access needed.

## Where this goes next

This chapter measured the real cost an LSM tree defers and the real techniques that make deferring it tolerable; the next chapter turns to how a storage engine gives an in-flight reader a consistent view of data that writers keep changing underneath it.
