<section data-section="outcomes">

## Outcomes

A real page, read directly off this sandbox's own Postgres cluster through `pageinspect`'s
`get_raw_page`/`page_header`, confirms its own five-part layout: `pd_lower` sits before
`pd_upper`, which sits at or before `pd_special`, with the line-pointer array growing from one
end and item data growing from the other. A line pointer, decoded with `heap_page_items`, is
exactly the 4-byte (offset, length) pair the documentation names — never moved once allocated
until freed. A real `VACUUM` run against a table with three deleted rows moves the two surviving
rows' own stored offsets to new positions while their CTIDs (page number plus line-pointer
index) stay bit-for-bit identical, confirmed directly rather than assumed. A real null bitmap is
present only on a row that actually has a null column, and its bit for that column reads `0`
exactly as documented; a row with no null column carries no bitmap at all. A real 8000-byte
incompressible value, inserted on purpose, is chunked into five real rows of a separate TOAST
table, leaving a 46-byte row behind in the main table that still round-trips to the exact
original value. InnoDB's own overflow-page mechanism — the identical fixed-page problem solved
with space attached to the same row rather than a side table — is named and sourced directly
from its own documentation, since this sandbox has no InnoDB instance to run it against.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` runs every measurement it claims, directly against this
sandbox's real Postgres 16 cluster (the same `learnshop` database Chapter 4's connection-pooling
and resilience topics already used) via `pageinspect`'s real functions: a real page's header
fields read and checked for ordering; a real `DELETE` plus `VACUUM` with CTIDs compared before
and after; a real inserted row with one null column, its bitmap decoded; a real incompressible
value forced into TOAST and its chunk count and round-tripped length checked directly.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a CTID is a stable physical address rather than a stable logical one.** A script,
trigger, or external index that caches a row's CTID across a long-running batch is safe exactly
because a CTID names a line-pointer index, not a byte offset — this topic's own real `VACUUM`
measurement is the direct evidence a cached CTID survives physical compaction. The failure mode
is the opposite assumption: treating a CTID as permanently stable across operations that
actually *do* change which row it points to (an `UPDATE`, which creates a new tuple and a new
CTID) — a mistake this topic's own vacuum-only demonstration deliberately avoids inviting.

**Assuming a large column's cost is paid at write time and nowhere else.** TOAST moving a value
out of line genuinely shrinks the main table (this topic's own measured 46-byte row versus an
8000-byte value), but every read of that column still pays the cost of reassembling it from its
real chunks — a cost this topic names but doesn't measure directly, since the syllabus's own
scope here is the storage mechanism, not its read-path performance.

</section>

<section data-section="frontier">

## Frontier

PostgreSQL's own documentation goes further than this topic measures: in-memory TOAST pointers
(to "indirect" or "expanded" data, used during logical decoding and for complex data types like
arrays) never touch disk at all and are a distinct mechanism from the on-disk TOAST table this
topic built and measured directly. InnoDB's own row formats differ in exactly how much data an
overflow page can hold (REDUNDANT, COMPACT, DYNAMIC and COMPRESSED each draw that line
differently), named here only at the level the syllabus asks for, not reproduced since this
sandbox has no InnoDB instance.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A page sitting on disk is only useful if an engine doesn't have to read it from disk on every
access. The next topic is the cache in front of it: the buffer pool.

</section>
