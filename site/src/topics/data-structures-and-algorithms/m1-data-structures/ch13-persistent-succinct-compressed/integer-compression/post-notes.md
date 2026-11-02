<section data-section="outcomes">

## Outcomes

- Encode and decode a sorted list with varint, delta plus frame of reference, and patched frame
  of reference, and give each one's bits per integer against the counting floor.
- Explain why the fastest decoders remove per-integer branches and data dependencies (grouped
  control bytes, a separate control stream, fixed-width blocks), rather than minimizing output
  size, and why a single outlier can force an entire block to a wider width than it needs.
- Choose a codec for a posting list or a column page from its gap distribution and the decode
  speed a query needs, and say what each choice gives up (random access, patching cost, block
  size).

</section>

<section data-section="internals">

## Internals

Varint spends seven payload bits per byte and reserves the eighth as a continuation flag,
least-significant group first (Protobuf's own worked examples: one is the single byte `01`;
a hundred and fifty is `9601`). Every byte's continuation flag is a genuinely data-dependent
branch — nothing about a value tells the decoder in advance how many bytes it will need, so the
decoder has to check, byte by byte, and can mispredict. Measured on this topic's own posting
list: 15.97 bits per id and just under two such branches for every id decoded. The signed variant
(zigzag) maps a positive value `p` to `2p` and a negative value `n` to `2|n| - 1`, so small
magnitudes in either direction stay small after the mapping — verified against Protobuf's own
five-value worked table.

Frame of reference removes those per-value branches by committing, once per fixed block, to a
single bit width wide enough for that block's own largest gap; every value in the block is then
packed at exactly that width, with no flag of any kind. The cost is structural: a block's width is
set by its single largest member, so one outlier in an otherwise tight block of a hundred and
twenty eight small gaps forces every other value in that block to spend bits none of them
actually needed. Measured here: 16.93 bits per id — *more* than plain varint on this topic's own
list, specifically because this list's gaps include a small fraction of much wider outliers (by
design, so patching has something real to fix). Patched frame of reference fixes exactly that:
pick a width that covers most of a block, store the few values that don't fit as a separate
exception list, and patch them back in after decoding the block at its narrow width. Measured:
15.21 bits per id, recovering most of what the outliers cost plain frame of reference, at the
same near-zero branch count (one branch per block boundary, not per value).

A grouped control byte (Google's own VARINT-GB design) describes four integers' own byte lengths
at once, cutting the decoder's decision points from one per byte to one per four integers — "can
reduce the number of branch mispredictions by a factor of four," the Stream VByte paper's own
words for exactly this move. Stream VByte keeps that same grouping but moves every control byte
out of the data entirely, into its own separate stream read ahead of it — "separates the control
stream from the encoded data." This changes nothing about the bit budget (the same control
information, the same per-four-integers grouping) but changes what the data stream looks like to
a vector instruction: a single uninterrupted run, rather than data and control bytes interleaved,
which is exactly the shape a wide SIMD load wants. The paper reports this reaching "more than 4
billion differentially-coded integers per second from RAM to L1 cache" on a named 3.4 GHz Haswell
processor — a number this topic quotes and attributes to that paper's own hardware, never
recomputed in Python, since interpreter overhead would hide the very branch counts this topic
measures honestly instead.

</section>

<section data-section="lab">

## Lab

`examples.py` builds one real posting list — about a million ids over a universe of four billion,
gaps drawn mostly from an exponential distribution with the matching mean, with a small fraction
drawn from a much wider exponential to give the list the clustered-with-outliers shape that makes
patching's benefit real rather than negligible. It computes the exact counting floor (13.44
bits/id, via the log-gamma form of the binomial coefficient, matching the closed-form
approximation to within a thousandth of a bit); reproduces varint encode/decode exactly against
Protobuf's own worked examples and byte-count table; reproduces the zigzag mapping against
Protobuf's own five-value table; measures plain varint, a Varint-GB-style grouped byte code,
frame of reference, and patched frame of reference on the same list, reporting both bits per id
and a branch-count model for each. The syllabus's own lab (encoding a hundred-million-entry
posting list with varint, Elias-Fano and Roaring, comparing bits per element, intersection speed
and random access) runs at the scale this topic's `examples.py` actually used (about a million
ids, not a hundred million, for a lab that finishes in seconds rather than minutes), with
Elias-Fano skipped per `CHAPTER.md` and frame-of-reference/patched-FOR substituted; Roaring's own
side of the comparison is topic 43's own container choice, not rebuilt here.

</section>

<section data-section="production">

## Production failures this topic warns about

The first draft of this topic's own posting list used a plain exponential gap distribution with
no outliers, following `CHAPTER.md`'s planning description literally — and patching then barely
moved the needle (14.95 to 14.93 bits per id), a difference too small to teach anything. The
general lesson generalizes past this one build: a codec's own benefit can be real and still
invisible on an unrepresentative test list; frame of reference and patching specifically need a
list with outliers to show what either one actually buys, and a planning estimate drawn from a
smoother distribution than the real data will systematically understate that gap.

A block that trusts its own single stored width without ever checking for outliers pays the
opposite failure in production: one unusually sparse or bursty region of a posting list — a term
that appears everywhere for a while, then almost nowhere — can quietly inflate an entire block's
stored width, and that cost is invisible unless something is actually measuring bits per block,
not just an average bits-per-id figure across the whole list.

</section>

<section data-section="frontier">

## Frontier

Two real systems were checked directly against their own current documentation rather than
assumed from the papers' own adoption claims. Apache Lucene's `Lucene99PostingsFormat` decodes
fixed blocks of a hundred and twenty eight integers, using patching for one kind of block
(frequencies) and not another (document deltas) — a real production instance of exactly this
topic's own patch-or-widen trade-off, chosen differently for two different statistical shapes of
data inside the same format. Apache Parquet names two separate encodings for this job: delta
encoding (`DELTA_BINARY_PACKED`) and a run-length/bit-packing hybrid, each applying to different
column types.

The GOV2-collection decimal bits-per-integer figures in Lemire and Boytsov's own paper (binary
packing, SIMD-BP128 and OptPFD, each around five to six bits per integer, per `CHAPTER.md`'s own
planning prose) are real numbers in a real table, but this topic's own PDF-text extraction of
that table lost the alignment between each decimal figure and the scheme name it belongs to — so
rather than risk attributing a number to the wrong scheme, this topic quotes the paper's
qualitative claims (verified word for word) and names the dataset, without repeating the specific
decimal figures.

Integer compression as the *columnar-format* topic belongs to Data Engineering (its own coverage
of columnar encodings: dictionary, run-length, delta, byte-stream-split) and to Rust Systems
Engineering's Chapter 24 (lightweight encodings and cascading compression, with a real Rust
implementation) — named here by pointer only, since this topic owns the codecs themselves, not a
column-encoding chooser. This chapter's two skipped §13.1/§13.2 neighbors — persistent structures
and succinct rank/select structures, including Elias-Fano encoding — are named once here:
Elias-Fano encodes a sorted list of integers in close to the fewest bits any sorted list that size
could take, using a structure built once and never changed, which is the main alternative this
chapter's own syllabus lab asks to compare against; it is not built in this topic.

</section>

<section data-section="where-next">

## Where this goes next

A compressed posting list is a block of bytes that no one ever changes, and that is exactly why a
hundred threads can decode it at once with no coordination at all: nothing they touch can be
altered under them. Every structure that can be changed is a different matter entirely. The first
time two threads write to the same queue, map or counter, the question is no longer how fast it
is but what it means for it to be correct — and that question has a name and a formal definition.
Progress guarantees and linearizability, next.

</section>
