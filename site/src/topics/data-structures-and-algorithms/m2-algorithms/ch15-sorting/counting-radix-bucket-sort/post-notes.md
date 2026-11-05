---
id: dsa.counting-radix-bucket-sort
title: Counting, radix and bucket sort
---

<section data-section="outcomes">

## After this topic you can

- Run counting sort and LSD radix sort on small integer keys, and say why the stability of
  each pass is the proof of correctness.
- Describe MSD radix sort and its in-place American-flag form, and say what each costs and
  which one is stable.
- Encode a multi-column key (integers, a descending string, a NULL) into a byte string that
  sorts correctly under byte comparison, and say why a database does this before radix
  sorting.
- Say when Theta(n w / log n) beats Theta(n log n) and when it does not, with a measured
  crossover.

</section>

<section data-section="internals">

## Into the internals

### Why the encoding also unlocks radix sort

It's tempting to think DuckDB's byte encoding is only a comparator optimization, but the
same property that makes `memcmp` give the right order — "byte k of the encoded string
fully determines the order among keys that agree on bytes before it" — is exactly the
property a byte-by-byte radix sort needs to make progress one digit at a time. The encoding
is not two separate tricks; it is one property (order-preserving byte layout) paying for two
different algorithms.

### Why American flag sort can't be both in-place and stable

The two-array version of MSD radix sort keeps stability by writing into a fresh output
array in input order (topic 48's own definition: stability survives because nothing ever
displaces an already-placed key). American flag sort gives up the second array by writing
into the *same* array, which means an element can only move into its own bucket by
displacing whatever is already sitting there — and that displaced element is not
necessarily the one that arrived first. The in-place property and the stability property are
not independent costs; losing the second array is what causes the loss of input order among
equal keys, not a separate design choice.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs counting sort, LSD radix sort, MSD radix sort and American flag sort on
small worked decks, confirming move counts, pass counts and (for American flag sort) a real
instability on a tagged deck. It reproduces DuckDB's own three-row encoding example by hand
and confirms byte comparison gives the post's own stated row order. It reproduces the IEEE
754 float bit-flip transform and confirms it preserves numeric order on seven signed
samples. It measures LSD radix sort's total key moves against a comparison sort's
comparisons at 50,000 random 32-bit keys, and simulates bucket sort at 100,000 uniform keys,
reproducing `CHAPTER.md`'s own planning values (largest bucket 8, 36.7% empty) almost
exactly, then shows the same simulation collapsing on clustered, non-uniform input.

</section>

<section data-section="production">

## In production

DuckDB's 2021 post describes the multi-column byte encoding and its radix-sort connection
as of that post's own design; its 2023 ICDE paper, read directly, gives a fuller account of
the same row-sorting approach. Neither source's claim is extended to DuckDB's present-day
engine, which this topic does not open. American flag sort, named by McIlroy, Bostic and
McIlroy in 1993, is recommended in that paper as a general-purpose in-place radix-sort
variant; this topic does not claim any specific present-day system ships it, since no such
claim was verified at research time.

</section>

<section data-section="frontier">

## The frontier

The parallel and SIMD radix and sample sorts named in `CHAPTER.md` (vqsort, x86-simd-sort,
IPS⁴o) are not built or sourced here beyond their own repository names, found at planning
time and not read: a reader who wants the vectorized version of any idea in this topic
should start there. The in-place, cache-efficient variant of radix sort that scales to
string keys (tries, covered in Chapter 7) is also left for later, as is the external version
of this topic's lab, which Chapter 15's own next topic builds.

</section>

<section data-section="questions">

## More questions

- American flag sort's cycle-leader permutation does the same number of key-moves as the
  two-array version's scatter, yet needs no second array. What is the actual *extra* cost it
  pays instead, and where does it show up (a hint: look at the `count`/`pile` bookkeeping,
  not the data movement itself)?
- Bucket sort's expected O(n) argument assumes the keys are drawn uniformly at random. Given
  only an array of keys and no promise about their distribution, is there a cheap way to
  check, before sorting, whether the uniform assumption is likely to hold?

</section>

<section data-section="next">

## Where this goes next

Radix sort does not compare keys at all, and for fixed-width keys it beats every comparison
sort. Everything in this chapter, though, has assumed the data fits in memory, and the data
a database sorts often does not. When it is ten times the size of memory, the cost is no
longer comparisons or even cache lines: it is how many times each byte has to travel to disk
and back, and the algorithm that minimises that is a merge sort. External merge sort, next.

</section>
