<section data-section="outcomes">

## Outcomes

Explain dictionary encoding and reproduce the real fallback to PLAIN when the dictionary exceeds
a cardinality limit, on a column built specifically to trigger it. Explain the RLE/bit-packing
hybrid's narrow, deliberate scope — levels, dictionary indices, booleans — and its single
per-page bit width. Contrast `DELTA_BINARY_PACKED` against that hybrid for near-sorted integers,
and `DELTA_BYTE_ARRAY` for sorted strings. Explain `BYTE_STREAM_SPLIT` for floating point and why
it changes nothing about size by itself. State the "encode first, compress second" principle with
a real measured size at each stage. Name FSST and ALP as research/newer-format lightweight
encodings and what each targets.

</section>

<section data-section="five-bets">

## Five encodings, five bets about the data

Every encoding this topic implements is a bet about a specific shape in the data, checked against
the data rather than assumed. Dictionary encoding bets that a column has few distinct values
relative to its row count — measured here against a 6-value zone column (a clean win) and a fully
distinct 200-value column (a real fallback to PLAIN, not a hypothetical one). The RLE/bit-packing
hybrid bets that a page's values all fit in a narrow range, which is why the specification scopes
it to levels, dictionary indices and booleans rather than general integers. `DELTA_BINARY_PACKED`
bets that consecutive values are close together — true of a near-sorted identifier column, where
a frame-of-reference subtraction inside each miniblock keeps every stored delta small and
non-negative. `DELTA_BYTE_ARRAY` makes the string equivalent of that same bet: sorted strings tend
to share a long prefix with their neighbor. `BYTE_STREAM_SPLIT` is the odd one out — it does not
shrink anything by itself, by the specification's own statement; its bet is entirely about what a
general-purpose compressor can do once same-position bytes across many values sit next to each
other instead of staying grouped by value.

</section>

<section data-section="lab">

## Lab: a fallback that actually fires

This topic's `examples.py` builds two columns side by side — a 6-value, low-cardinality zone
column and a 200-value, fully distinct high-cardinality column — and runs the identical dictionary
encoder on both. The zone column shrinks from 400 bytes to 113. The high-cardinality column, past
a 40-entry fallback limit, is measured choosing PLAIN instead, because a dictionary with as many
entries as rows would cost more than it saves. Three of the topic's five encoders are also
self-checked against the Parquet specification's own published worked examples — exact
intermediate deltas, prefix lengths, and transposed bytes — before being run on this topic's own
column data, so correctness rests on the spec's own stated output, not only on this script's own
round trip.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming one encoding is always the right default.** A column encoded with `DELTA_BINARY_PACKED`
because an upstream system assigns monotonically increasing identifiers can stop benefiting the
moment identifiers are reassigned out of order — the encoding's win depends entirely on the data
staying close to sorted, not on the column's logical meaning.

**Measuring compression on the wrong layer.** Comparing a `BYTE_STREAM_SPLIT`-encoded column's raw
size against PLAIN and concluding the encoding "does nothing" misses the point: its benefit shows
up only after a general compressor runs on top, which this topic measures explicitly rather than
leaving implicit.

</section>

<section data-section="frontier">

## Frontier

FSST (fast static symbol table) targets exactly the column dictionary encoding gives up on —
high-cardinality strings — while still allowing random access and compressed-domain equality
comparison, unlike a block-based general compressor. ALP targets floating-point columns with a
decimal-scaling, frame-of-reference and exceptions scheme, aimed at the same kind of win
`DELTA_BINARY_PACKED` gets for integers. Neither is hand-implemented here: both are substantially
more involved than this topic's five encoders, and this topic's claims about them are traced only
to each project's own summary of its own scope. Newer formats also cascade encodings — running a
dictionary or delta pass first, then a general compressor on the result — the same two-layer idea
this topic's own "encode first, compress second" step demonstrates with a single encoding layer.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything encoded so far has been a flat column. The next topic is what happens the moment a
column is optional, repeated or nested — Dremel's own shredding model.

</section>
