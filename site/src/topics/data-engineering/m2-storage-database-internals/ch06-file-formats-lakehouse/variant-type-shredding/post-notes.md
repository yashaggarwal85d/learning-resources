<section data-section="outcomes">

## Outcomes

Explain the Variant logical type's binary-encoded-value-plus-metadata-dictionary design, built by
hand to the specification's own byte layout, and show it round-tripping 6 real, heterogeneous
records exactly where a fixed struct schema silently drops data on half of them. Shred a Variant
column's frequently present fields into typed columns and show the real statistics/pushdown gain
that gets back — a typed-column filter that never touches the residual Variant value at all.
Contrast a plain JSON string column, a fully typed struct, and Variant-with-shredding on the same
data, with real measured size for each.

</section>

<section data-section="three-ways-to-store-the-same-record">

## Three ways to store the same record

A fixed struct is the fastest to query and the cheapest to store, but only for data that actually
fits its schema — this topic measures the cost of the gap directly: 3 of 6 real records lose a
field when forced into one. An unshredded Variant goes to the opposite extreme: every record's
`value` is opaque binary, self-describing and lossless, but a reader has to decode the whole thing
to answer even one field's filter. Shredding is the compromise this topic builds by hand: pull the
fields that are reliably typed into real Parquet columns, exactly as `VariantShredding.md`
specifies, and leave a residual Variant `value` for whatever doesn't fit — getting a typed
column's speed for the common case without a struct's all-or-nothing schema.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating "shredded" as "guaranteed small."** This topic's own measured numbers show the size
gain from shredding two fields out of a tiny 6-record sample is modest — 126 bytes against 155.
Teams that adopt Variant and shredding expecting a dramatic storage win, rather than the pushdown
and statistics win this topic actually demonstrates, will be disappointed by the file-size line
item and may misdiagnose a real performance win as a non-event.

**Assuming every field shreds cleanly forever.** Record 6's `button_id` is a string instead of an
int32 — a single malformed or evolved event falls back to the residual `value` column, exactly as
the specification requires. A pipeline that assumes a shredded column is always populated, instead
of checking for this fallback case, will silently miss rows on exactly the data that needed
attention most.

</section>

<section data-section="frontier">

## Frontier

This topic's encoder implements only the primitive types the dataset needs (null, int32, short
string, object) — the full specification adds many more primitive types (decimals, dates,
timestamps, UUIDs, arrays) and a large-object/large-array mode for more than 255 elements, all
built on the identical header-byte-plus-value-data pattern shown here. The shredding simulation
models the field-level `value`/`typed_value` decision table directly; it does not implement
nested shredding of arrays or sub-objects, which `VariantShredding.md`'s own "Nesting" section
describes as the same mechanism applied recursively.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A single Parquet file, however well encoded, typed and skippable, is still one immutable file.
ORC is the one real rival that made different choices at every one of these same decisions —
worth seeing once, directly, before this chapter leaves the single-file world for good.

</section>
