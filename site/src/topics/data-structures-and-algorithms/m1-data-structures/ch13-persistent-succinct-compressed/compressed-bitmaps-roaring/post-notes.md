<section data-section="outcomes">

## Outcomes

- Explain why a plain bitmap's fixed cost and a plain sorted array's per-match cost are each
  dishonest about a set that is dense in one region, sparse in another, and strung into long
  runs in a third, and derive the exact crossover count where an array and a bitmap cost the
  same.
- Pick the smallest of three per-chunk containers (array, bitmap, run) by measuring, not by a
  fixed rule, and explain why a run container's cost tracks run count rather than value count.
- Explain why a missing chunk costs nothing in a chunk-by-chunk intersection, and why a galloping
  search beats a plain merge only once one side of an intersection clearly dwarfs the other.

</section>

<section data-section="internals">

## Internals

Roaring's own crossover between its two baseline containers falls directly out of their cost
formulas, not a tuned constant: a sorted array of sixteen-bit values costs two bytes per value,
a bitmap over the same sixty-five-thousand-five-hundred-and-thirty-six-value chunk costs a fixed
eight kilobytes regardless of how full it is. Setting those two costs equal gives exactly four
thousand and ninety six values — below it the array is cheaper, above it the bitmap is
(`examples.py` asserts this exact crossover). A run container's cost — two bytes of overhead plus
four bytes per run — ignores value count almost entirely and prices run count instead, which is
why a chunk holding every one of its own sixty-five-thousand-five-hundred-and-thirty-six values
in a single unbroken run still costs only six bytes. A separate pass, `runOptimize`, converts an
existing array or bitmap container to a run container wherever that's actually smaller, typically
run once, right before a set is stored for querying (Lemire et al. 2016, quoted in `SOURCES.md`).

Within a shared chunk, a bitmap-bitmap intersection is one word-by-word pass; an array-array
intersection merges the ordinary way when the two arrays are within about sixty-four times each
other's size, and gallops — an exponential search that overshoots then narrows back by binary
search — once one array dwarfs the other (Chambi et al. 2016). `examples.py`'s own cost model
demonstrates the crossover directly: a plain merge's cost rises linearly with the smaller array's
size regardless of the larger one, while galloping's cost rises only logarithmically in the
larger array's size, so the gap between the two widens without bound as one side grows — galloping
wins decisively exactly where the plain-merge cost model predicts it should.

</section>

<section data-section="lab">

## Lab

`examples.py` reproduces the chapter's own worked arithmetic directly: the universe-level
bitmap/array break-even at two to the twenty-seventh values; the chunk-level break-even at four
thousand and ninety six; all four of the chapter's worked chunk examples exactly (a hundred
scattered values, four thousand and ninety seven values in one run, thirty thousand values in
fifteen thousand runs, and a full chunk in one run); three real predicates — dense, sparse and
clustered — over several million row ids, each beating both a plain bitmap and a plain array by
picking a container per chunk; a real three-way intersection checked row by row against a
brute-force set computation, confirming fewer chunk-pairs get examined than the full chunk
universe; and the galloping-versus-merge cost comparison, checked right at and well beyond the
sixty-four-times threshold. The chapter's own lab — encoding a hundred-million-entry posting list
with varint, Elias-Fano and Roaring, and comparing bits per element, intersection speed and random
access — is the next topic's own lab, not repeated here.

</section>

<section data-section="production">

## Production failures this topic warns about

The first draft of `examples.py`'s own "thirty thousand values in fifteen thousand runs" worked
example doubled fifteen thousand independently scattered points into pairs to build the runs —
and some of those pairs landed next to each other by chance, silently merging two runs into one
and producing fewer runs than intended. The container choice came out right anyway (a bitmap
still won), but the exact byte count didn't match the chapter's own planning table until the
construction was fixed to lay down exactly fifteen thousand evenly spaced, guaranteed-non-touching
runs. The general lesson: a randomly or naively constructed "worked example" of a specific shape
can silently drift away from that shape by coincidence, and the drift may not be large enough to
change the headline conclusion — only a sharp enough number to check against will catch it.

A chunk key present on one side of an intersection with nothing on the other is cheap only
because it's skipped entirely by the merge; a mistaken implementation that instead builds an
empty container for it and compares anyway pays a real, avoidable cost on every such chunk,
invisible unless measured directly against the skip-it version.

</section>

<section data-section="frontier">

## Frontier

Two of this topic's four named adopters are Roaring-inspired code, not the RoaringBitmap library
itself: Apache Lucene's `RoaringDocIdSet` and `IndexedDISI` are two separate classes, each
independently varying the same two-level idea (an inverse-array third case in one, a three-way
all/dense/sparse choice in the other) rather than importing the library directly, as Apache Spark
and Apache Pinot both do. Apache Druid names this design as its default bitmap-index compression
in its own documentation. Each claim here was checked against that system's own source or docs
directly, not assumed from the Roaring papers' own adoption sentence.

The skipped neighbors in this chapter — persistent structures, succinct structures, and
Elias-Fano encoding specifically — each attack a different cost than Roaring does: persistence
keeps every past version of a structure reachable rather than compressing a single version; a
succinct structure reaches close to the information-theoretic minimum for *any* structure of its
kind, not just a fast per-chunk choice among three; Elias-Fano encodes a sorted list of integers
in close to the fewest bits any sorted list that size could take, which is exactly where the next
topic, integer compression, picks up. Data Engineering's own deletion-vectors topic names Roaring
directly as the structure several table formats use to mark deleted row positions without
rewriting a file — a production use of the same container this topic builds, not built again
here.

</section>

<section data-section="where-next">

## Where this goes next

Roaring answers exactly what the previous topic's approximate structure couldn't: no false
answers in either direction, at close to whatever the tightest honest encoding of each chunk's
own shape would need. What it stores one way — a short sorted list of small integers — is itself
compressible further, by treating each integer as something other than a fixed-size value.
Integer compression, next.

</section>
