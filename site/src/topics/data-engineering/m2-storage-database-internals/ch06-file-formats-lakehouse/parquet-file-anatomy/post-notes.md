<section data-section="outcomes">

## Outcomes

Draw a real Parquet file's own structure — row groups, column chunks, pages — read directly from
a file this topic's own code writes and then parses back. Contrast a dictionary page against a
data page, and a v1 `DATA_PAGE` header against a v2 `DATA_PAGE_V2` header, from the real header
bytes. Read a real Thrift footer and explain the difference between a column's physical type and
its logical type. Reproduce a real `INT96`-vs-`isAdjustedToUTC` timestamp mismatch between two
readers that each make a different, reasonable assumption about the same bytes. State why putting
the footer at the end of the file suits a write-once, append-only object store.

</section>

<section data-section="internals">

## Three mechanisms, one shared requirement

The file this topic writes is parsed back using the same Thrift Compact Protocol the real
specification defines: a field-header byte that encodes a delta from the last field ID plus a
type tag, varint-and-zigzag integers, and length-prefixed strings. Nothing about this topic's
numbers is simulated — the schema, the row counts, the page offsets and the page-header type
bytes are all read back from the literal bytes this topic's own code wrote, and the resulting
file was independently confirmed readable by a real Parquet implementation during this topic's
own fact-check. The INT96 pitfall is the clearest illustration of why a logical type exists at
all: the physical bytes (eight bytes of nanoseconds-of-day, four bytes of a Julian day number) are
silent about timezone, so two equally reasonable readers — one assuming a universal instant, one
assuming a local wall clock — decode the identical bytes to two different real-world moments. The
modern `TIMESTAMP` logical type doesn't change the physical encoding; it adds exactly one required
field, `isAdjustedToUTC`, that removes the need to assume anything at all.

</section>

<section data-section="lab">

## Lab: a dictionary page that earns its keep

This topic's `examples.py` writes the same four-row file two different ways for its `status`
column — a dictionary page followed by a `PLAIN_DICTIONARY`-encoded data page of one-bit indexes
in the first row group, and a `DATA_PAGE_V2` with no dictionary at all in the second — so both
page-header shapes exist side by side in one real file, rather than two separate ones. That design
choice is what makes it possible to read the exact header byte that distinguishes them directly
out of the footer's own recorded offsets, instead of asserting the difference from documentation
alone.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a renamed INT96 column as self-describing.** Because INT96 carries no logical type at
all, a BI tool or a second compute engine reading the same file has nothing in the file itself to
check its timezone assumption against — the bug this topic reproduces (a seven-hour drift between
two equally plausible readings) is exactly the class of silent, cross-engine mismatch real
production incidents from Hive/Impala-vs-Spark INT96 handling have reported for years.

**Assuming a dictionary page always exists.** A reader that unconditionally looks for a dictionary
page before a data page will misread this topic's own second row group, where none exists —
`dictionary_page_offset` is optional in the footer precisely because a writer may skip
dictionary encoding (for high-cardinality columns, or any reason of its own), and a correct reader
has to check for its presence rather than assume it.

</section>

<section data-section="frontier">

## Frontier

This topic stops at the file format itself: it does not touch column statistics, page-level
indexes or bloom filters, which this chapter's next topic (§6.2, data skipping) covers on top of
exactly this same file anatomy. It also does not touch the stable column IDs that Iceberg and
Delta Lake add on top of a file format like this one's own `field_id`-free schema — that
comparison is this chapter's §6.3 material, once table formats are introduced.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A row group is just column chunks, and a column chunk is just pages of values — but those values
are rarely stored as plain, unencoded bytes the way this topic's `PLAIN` encoding does. The next
topic is exactly how they're encoded instead: dictionary, run-length, delta and byte-stream-split.

</section>
