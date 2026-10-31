<section data-section="outcomes">

## Outcomes

Contrast N-ary (row-major) storage, full column decomposition (DSM), and PAX (columnar within a
page) using a real packed-byte measurement of each, on the same 1,000-row table. State precisely
why row storage wins a point lookup and loses a column scan, and why DSM does the reverse. Explain
why PAX keeps NSM's I/O (the same number of pages opened) while reading DSM's useful-byte ratio,
by grouping attribute values into per-page minipages instead of separate files. Name Parquet as a
real column-oriented format built on exactly this compromise.

</section>

<section data-section="internals">

## Why the page is the unit that matters

Every number this topic measures is a count of bytes or pages touched, not wall-clock time,
because the point of PAX is specifically that it changes nothing about *how much is read from
disk* — only how much of what's already in memory turns out to be useful. The PAX paper states
this directly: PAX "only affects layout inside the pages," so it "incurs no storage penalty and
does not affect I/O behavior." That is the entire reason step 6's result is surprising rather than
obvious — a reader expecting columnar storage to mean "fewer pages read" is half right (DSM does
read fewer files) and half wrong (PAX, by design, reads exactly as many pages as NSM would). The
win PAX buys is that once a page is in cache, only the minipage holding the column you asked for
is useful; the rest of the page's bytes, although they were transferred, never needed to be.

</section>

<section data-section="lab">

## Lab: measuring the trade-off directly

This topic hosts the §6.1 chapter lab's size, write-time and scan-time comparison: lay the same
ten rows out three ways — row-major, full column decomposition, and PAX — and measure a real
single-column scan and a real single-row point lookup against each layout. The pattern this
topic's own `examples.py` follows (pack real bytes with `struct`, then slice and count them,
rather than estimate or time a noisy wall-clock run) is the one the lab extends to a larger table
and to write costs, which this topic's refresher scope does not measure.

</section>

<section data-section="production">

## Production failures this topic warns about

**Choosing a columnar warehouse format for a write-heavy, point-lookup-heavy workload.** A system
whose actual access pattern is many small inserts and single-row lookups (the OLTP pattern from
Chapter 3) pays DSM's point-lookup cost — a join across every column's own storage — on every
single operation, for a scan benefit it never uses. The fix is not "columnar is better" or "row
storage is better"; it's matching the layout to the measured access pattern, which is exactly what
this topic's own numbers make visible rather than assumed.

**Assuming "columnar" always means "fewer pages read."** PAX's own design claim — unchanged I/O,
improved cache behavior — is easy to conflate with DSM's actual page reduction. A system that
reports "I/O unchanged" after a columnar migration is not necessarily broken; it may be running a
PAX-style layout exactly as designed, trading cache efficiency for the same disk reads rather than
fewer of them.

</section>

<section data-section="frontier">

## Frontier

This topic measures PAX as a general page layout, not Parquet's own anatomy — Parquet's row
groups, column chunks and pages (and the Thrift footer that describes them) are the next full
topic's subject. Likewise, the compression and encoding Parquet applies per column once that
column's values are grouped together (dictionary encoding, RLE, delta encoding) are a later topic
in this chapter, not this one: this topic stops at "grouping makes per-column compression
possible," without measuring any specific encoding's ratio.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every one of these layouts still has to survive a reader using a different version of the schema
than the writer did. That's schema evolution — the next topic.

</section>
