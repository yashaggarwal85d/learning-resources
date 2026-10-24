<section data-section="outcomes">

## Outcomes

An Arrow array is a validity bitmap plus a data or offset buffer, not one opaque blob — and a
real array with zero nulls, measured directly on this sandbox, actually omits the bitmap buffer
rather than merely being permitted to. Several record batches become one logical `ChunkedArray`
column with no copying, a real PyArrow mechanism rather than part of the columnar spec itself.
Dictionary encoding and run-end encoding are shown as specialists for different data shapes — a
real measured counter-case (alternating values) shows run-end encoding losing badly to both the
plain array and dictionary encoding, so neither one is "just better." The string-view
("German Strings") layout inlines short values and keeps only a four-byte prefix for long ones,
confirmed byte-for-byte against both the Arrow specification and DataFusion's own description of
the same layout. A `List` array reuses the exact same buffer kinds as flat types. A real
`pyarrow.compute` kernel beats an equivalent Python loop by a real measured margin on this
sandbox. And the identical `pyarrow.Table` object, with no conversion step, is consumed directly
by both Polars and DuckDB — the literal, demonstrated meaning of "interchange layer," not a
phrase taken on faith.

</section>

<section data-section="lab">

## Lab

No lab of its own (this topic feeds the dataframe engines built hands-on in topics 6-7). Every
number is still a real measurement on this sandbox's own PyArrow 26.0.0 (`examples.py`):
validity-bitmap buffer presence/absence; `Table.from_batches` chunk counts; dictionary- and
run-end-encoded byte sizes on data shaped for each, plus the alternating-value counter-case;
a real `string_view()` cast's buffer layout; a `List` array's own buffer composition; a timed
`pyarrow.compute.sum` kernel against an equivalent Python loop; and the same `pyarrow.Table`
object queried directly by DuckDB and loaded directly by Polars, both returning the identical
correct sum.

</section>

<section data-section="production">

## Production failures this topic warns about

**Picking dictionary encoding for a near-unique column.** The dictionary ends up almost as large
as the data it was meant to shrink, since there's almost nothing to deduplicate — the opposite of
the low-cardinality, high-repeat case dictionary encoding is actually built for.

**Assuming "Arrow" anywhere in a pipeline means zero-copy everywhere.** This topic's own
interchange-layer claim is scoped to the input side of a handoff between two engines that both
already understand the format; a conversion through JSON, or into a library that isn't
Arrow-aware, still forces a real copy, and a query's own output buffers are not themselves a
zero-copy view of the input (confirmed directly in the prior topic's own fact-check).

**Reaching for run-end encoding on data that merely repeats, not runs.** The alternating-value
measurement in this topic's own lab shows run-end encoding costing *more* than the plain array
in exactly that case — the two encodings solve different problems and are not interchangeable.

</section>

<section data-section="frontier">

## Frontier

StringView landed in `arrow-rs` v52.2.0 and DataFusion v41.0.0 in September 2024 — recent enough
that DataFusion still gates it behind a configuration option rather than making it the default,
per the DataFusion blog's own release-version language. The measured 20%-200% ClickBench
improvement is DataFusion's own number and is disclosed here as sourced-only, since DataFusion
itself is not installed on this sandbox; PyArrow's own `string_view()` cast, used for this
topic's byte-layout measurements, is available directly.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Arrow is the shared memory format; pandas 3.0 is the first topic to show what changes when a
library actually builds its own dtypes on top of it instead of NumPy's.

</section>
