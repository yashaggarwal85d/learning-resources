<section data-section="outcomes">

## Outcomes

A Gorilla-style delta-of-delta timestamp encoder and XOR float encoder built and checked against the
paper's own two worked bit-count examples exactly. Bytes per point measured for raw storage, this
Gorilla-style encoder, a Chimp-style refinement, DuckDB's own default float codec, and a
general-purpose compressor, across three synthetic regimes: a slow, regular signal; a noisy,
high-precision signal; and a regular decimal signal. Chimp128's wider comparison window shown
winning specifically on the regime with a repeating pattern. DuckDB's real Parquet output measured
for its actual default float codec, not just the vendor's claim about it.

</section>

<section data-section="lab">

## Lab

`examples.py` runs every encoder directly: a `BitWriter` that counts bits written one at a time; the
Gorilla paper's own delta-of-delta rule checked to encode a delta of -2 in exactly nine bits and an
eleven-leading-zero, one-meaningful-bit XOR in exactly fourteen bits; a full Gorilla-style encoder
and a Chimp-style refinement (with an optional wider comparison window) run end to end on three
built-from-scratch regimes; bytes per point computed for raw storage, both encoders, a
general-purpose compressor, and DuckDB's actual Parquet output for each regime; and a set of
assertions that check the ratio differs by regime, that Chimp128's wider window beats both
single-previous-value Chimp and Gorilla specifically on the repeating-pattern regime, and that every
codec still beats raw storage.

</section>

<section data-section="production">

## Production failures this topic warns about

**Quoting a published compression ratio as a guarantee.** The hook's colleague isn't wrong that
Gorilla achieved a large reduction — the paper's own number is real — but that number came from one
company's specific data shape, and repeating it as a promise for different data is the actual
failure, not a bug in the code.

**Choosing a codec by its name instead of by the shape of the data it will see.** This topic's own
three-regime measurement is the fix: the same encoder that wins by far on one regime barely helps on
another, so the right codec depends on whether the data is regular, noisy, or decimal — not on which
codec sounds newest.

</section>

<section data-section="frontier">

## Frontier

Chapter 15 topic 24 (`manufacturing-telemetry-platform-design`) and its
`edge-buffer-sizing-from-outage` id are named by CHAPTER.md as already having used this chapter's
1.37-bytes-per-point figure as a forward pointer — as of this topic's build, Chapter 15 only extends
through §15.3 in `registry.ts`, and topic 24 doesn't exist yet. This topic doesn't claim those ids;
see `OUTLINE.md` and `SOURCES.md` for the gap. The Chimp implementation in `examples.py` is a
disclosed simplification: it omits the paper's own further leading-zero-reuse refinement (§4.1.4),
so the single-previous-value Chimp encoder here does not reliably beat Gorilla on every regime — only
Chimp128's wider window shows a clear, asserted win. No ALP library is installed in this environment;
DuckDB's own default float codec (which the DuckDB library page states is ALP) is measured instead
of a standalone implementation.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A codec shrinks a series; the next problem is finding it. Every distinct combination of labels is
its own series, and the index that maps labels to series is the first thing to run out. The next
topic is series cardinality and the label index.

</section>
