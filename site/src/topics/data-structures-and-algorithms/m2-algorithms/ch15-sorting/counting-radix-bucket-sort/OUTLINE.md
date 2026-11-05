# OUTLINE: Counting, radix and bucket sort

A full topic, about 15 minutes. Fifth topic of Chapter 15, hosting the chapter's
in-memory benchmark lab (the partition variants and LSD radix sort part; topic 54 hosts
the external, out-of-memory half). Every count below is computed and asserted directly
in `examples.py`; no claim about DuckDB's current engine behavior is made (only the 2021
post and the 2023 paper, both dated, are cited).

## Storyboard

1. **Hook.** A database sorts ten million rows by country descending, then birth year
   ascending. A comparison sort's comparator loops over the columns on every one of the
   roughly two hundred million comparisons it makes. DuckDB's answer: encode each row's
   sort columns into one string of bytes whose plain byte order is already the right row
   order, and then never call a comparator loop at all.
2. **Predict.** Sorting a million 32-bit keys, a radix sort with 8-bit digits makes how
   many passes over the data? (Four passes of 8 bits each; a comparison sort goes about
   twenty levels deep — `ceil(lg 1,000,000) = 20`.)
3. **Counting sort.** Keys are integers in a small range `[0, k)`: count how many of each
   value, turn the counts into starting positions by a running sum, then scatter each key
   to its slot, walking the input in order. Measured directly: 12 keys, 12 moves,
   Theta(n + k); the scatter's own input-order walk is why three tied keys (value 5, at
   input positions 4, 8, 10) come out in that same order — the stability the next step
   depends on.
4. **LSD radix sort.** Counting-sort by the last digit, then the next, and so on; each
   pass's own stability is exactly why the composed result ends up sorted — topic 48's
   "sort by one column, then the next" idea, realized on digits. Measured directly: 3
   passes on 3-digit keys, 24 total moves (`d x n`); at a million 32-bit keys with 8-bit
   digits, 4 passes against roughly 20 comparison levels.
5. **MSD radix sort.** Partition by the first digit into buckets, recurse on each bucket
   by the next digit; it can stop early once a bucket is small or its keys already
   differ, falling back to insertion sort below a cutoff (topic 48's small-sort-cutoff).
   It touches only distinguishing prefixes, but its memory access is irregular and it
   recurses over many small buckets. Measured directly on the same keys as step 4.
6. **American flag sort.** The in-place MSD variant (McIlroy, Bostic & McIlroy, 1993,
   named by analogy with the Dutch flag problem — topic 50's three-way partition, scaled
   from 3 piles to as many as there are digit values): count the digit values, turn the
   counts into each bucket's own slot range, then permute in place by following
   cycle-leader swaps, one displaced key handing off to the next until a cycle closes.
   Measured directly: 6 swaps on an 8-key deck. *Takeaway:* "American flag sort is
   in-place MSD radix sort, at the cost of the one property the two-array version kept —
   stability — which this chapter's table (topic 48) already had a cell for."
7. **Instability, shown.** A tagged deck: two keys sharing a digit value (3 and 2, both
   in the tens-digit-0 pile) go in as h, i and come out as i, h — confirmed directly.
8. **DuckDB's byte encoding.** The three-row worked example from the 2021 post
   (`c_birth_country DESC, c_birth_year ASC`): a descending string's bits all inverted,
   a signed 32-bit year's sign bit flipped and bytes swapped to big-endian, a shorter
   string padded with zero bytes that the descending inversion turns to `0xFF`. Confirmed
   directly: comparing the three encoded byte strings reproduces the post's own row order
   (NETHERLANDS/1991, NETHERLANDS/1992, GERMANY/1924) with a single `memcmp`-equivalent
   comparison, no per-column loop.
9. **Why the encoding also unlocks radix sort.** Binary strings that give the right order
   under byte comparison give the right order under a byte-by-byte radix sort too (the
   post's own stated connection) — the encoding bought a cheap comparator, and then a
   comparator-free sort for free. IEEE 754 floats get the same treatment: always flip the
   sign bit, and if it was set (a negative number), flip every other bit too — confirmed
   directly on seven signed float samples, their flipped-bit order matching their numeric
   order exactly.
10. **Predict.** Does the Theta(n * w / log n) bound ever lose to Theta(n log n)?
    (Yes — when keys are long, w >> log^2 n, or when the digit-count array's own cache
    misses dominate; it is a real escape from the comparison model, not a free lunch.)
11. **The crossover, measured.** At 50,000 random 32-bit keys with 8-bit digits: LSD radix
    sort makes exactly `4 x n = 200,000` key moves in total; a comparison sort (merge sort)
    makes about 718,000 comparisons on the same keys — both counted directly, not from a
    wall-clock benchmark (see "Why no compiled benchmark" below). Radix sort is not
    adaptive either: an already-sorted array still costs all 4 passes and n moves per pass.
    *Takeaway:* "Theta(n log n) is a floor over comparisons, not over work; a key that can
    be read digit by digit escapes the floor by not comparing at all."
12. **Bucket sort.** n keys drawn uniformly from `[0, 1)` into n buckets, each bucket
    sorted by insertion sort: expected O(n) when the keys are actually uniform. Measured
    directly at n = 100,000: the largest bucket held 8 keys, and 36.7% of buckets were
    empty, matching e^-1 = 36.8% almost exactly. On a clustered (non-uniform) input,
    confirmed directly: nearly every key lands in the same handful of buckets, and the
    cost collapses to the inner sort's own cost on a near-full-size array.
13. **Recap and handoff.** Radix sort never compares a key as a whole — it reads one digit
    at a time, which is the door out of the comparison-sort floor this chapter has
    otherwise lived under. Everything so far has also assumed the data fits in memory.
    External merge sort, next.

## Why no compiled benchmark

Every number here — move counts, comparison counts, swap counts, the bucket-sort empty
fraction — is a small, deterministic (or seeded-random) computation checked directly in
Python against the exact structures being taught; nothing claims a wall-clock figure.
`CHAPTER.md`'s own compiled-helper requirement is for its post-notes lab (five input
shapes, a real compiled sort, machine and flags recorded), which is out of this file's
scope and left to the post-notes per the chapter's own instruction.

## Changes from the chapter plan

- `CHAPTER.md`'s own planning value for the bucket-sort simulation (100,000 uniform keys
  into 100,000 buckets: largest bucket 8, 36.7% empty, e^-1 = 36.8%) is reproduced exactly
  on this topic's own seed — largest bucket 8, empty fraction 0.367.
- The crossover step uses move/comparison counts rather than a wall-clock measurement
  (see "Why no compiled benchmark"); `CHAPTER.md`'s own planning comparison (4 passes
  against about 20 comparison levels at a million keys) is kept as the headline figure,
  with the n = 50,000 move-vs-comparison count as the measured crossover evidence.
- The American flag sort's own code listing in McIlroy, Bostic & McIlroy's 1993 PDF is
  too OCR-damaged to transcribe or quote verbatim (see `SOURCES.md`'s Red team); the
  mechanism is implemented in `examples.py` directly from the paper's own prose
  description, cross-checked for correctness against a trusted stable counting sort on
  the same digit function, and independently confirmed to be the same algorithm by
  Sedgewick & Wayne's own booksite exercise describing the identical count-then-swap
  mechanism.
- CLRS's bucket-sort expected-cost lemma, Graefe's 2006 survey, and Knuth vol. 3 section
  5.2.5 are citation-only this session (paywalled, named-only, or not opened per
  `CHAPTER.md`'s own instruction, respectively); none of this topic's numeric claims rest
  on them. The IEEE 754 standard itself is paywalled; the bit-flip transform is instead
  cited from a widely reproduced technical page and confirmed consistent with a second,
  independent source (a Rust crate's own documentation), per `SOURCES.md`'s Red team.
