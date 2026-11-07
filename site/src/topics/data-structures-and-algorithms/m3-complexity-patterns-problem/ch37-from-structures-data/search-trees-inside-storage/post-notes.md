<section data-section="outcomes">

## What this topic leaves you able to do

Say what a storage engine's index entry actually stores, and why a tuple identifier has to
ride along with every key; explain why an LSM tree's stored key carries a sequence number and
how that makes a snapshot read a single seek rather than a scan; explain why a filter larger
than a data block needs a paged index of its own, and what that index costs when it is not
cached.

</section>

<section data-section="internals">

## Into the internals

### The slotted page underneath a (key, TID) entry

A B+-tree leaf page is a slotted page (Chapter 5's own mechanics): a line pointer array at one
end of the page, variable-length tuples packed from the other end. A leaf entry's tuple
identifier is just one more fixed-width field stored beside the key inside that tuple, not a
separate structure — the only change is that the uniqueness comparison at insert and split time
now compares `(key, TID)` as one logical value, never `key` alone. Real production page
capacity is governed by the page's byte budget, not a fixed entry count; this topic's own
duplicate-split example uses a small, explicit entry-count capacity (four) purely so the
lopsided split is countable on screen, not as a claim about any real page's actual size.

### Why "logical duplicates," not "copies"

PostgreSQL's own wording calls same-key entries "logical duplicates": the key values are equal,
but the TID makes every stored tuple distinct at the byte level, so the structure's own
uniqueness invariant (every entry different from every other) never actually breaks — it is
satisfied by a field the learner does not think of as "the key" until this topic names it.

### The internal key's exact byte layout

RocksDB's internal key is the user key followed by an eight-byte field packing the sequence
number and a one-bit value type (put or delete) into one sortable unit; comparing two internal
keys compares the user-key bytes first and, only on a tie, compares that packed field as a
single descending integer. The value-type bit is why a delete at the same sequence number as a
put of the same key still sorts in a defined order rather than being ambiguous — a mechanical
detail this topic's own simulation (sequence number alone, as a separate field) does not model,
named here rather than silently assumed away.

</section>

<section data-section="lab">

## The lab

`examples.py`'s four-case block-read counter is the thing to change by hand: swap which case is
"cached" versus "not cached," change the leaf capacity in the duplicate-split model, or change
the per-level growth factor in the LSM sizing and recompute the level sizes. Every number this
topic puts on screen comes from running that file; changing an input and re-running it is the
fastest way to see which of this topic's claims depend on the exact numbers chosen and which
depend only on the shape of the mechanism.

</section>

<section data-section="production">

## In production

A leaf split pathology: PostgreSQL's ascending-TID fallback assumes duplicates mostly arrive in
ascending TID order, the common case for ordinary inserts. A bulk reload that reorders TIDs (for
example, a `VACUUM FULL` or a logical restore that re-inserts rows out of their original heap
order) can defeat that assumption, producing splits that are not actually lopsided in the
helpful direction; the README's own fallback is a heuristic, not a guarantee, and this topic
does not claim otherwise. On the LSM side, a snapshot held open far longer than the writes
around it (a long-running backup or replication read, for instance) pins every version newer
than it needs for compaction to garbage-collect, a real operational cost production engines
monitor and this topic names once without building.

</section>

<section data-section="frontier">

## At the frontier

RocksDB's current default filter construction — a classic Bloom filter or the newer Ribbon
filter, gated by `format_version` — is deliberately left **unresolved** here. The RocksDB Bloom
Filter wiki page was fetched and read in full at research time; it describes both filter
families and the trade-off between them but does not state, in a sentence quotable without risk
of it being stale by the time this topic is watched, which one new tables default to at the
current format version. CHAPTER.md itself flagged this as "to verify at research time," and the
honest outcome of that verification is an open question, not a guess dressed up as a fact. A
reader who wants the exact current default should read `BlockBasedTableOptions` in RocksDB's
own current source.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Data Engineering's live "B-tree indexes in production", "LSM trees: write and read paths" and
"LSM compaction and the RUM trade-off" own the system-level view of these same engines: their
operational tuning, their failure modes under real load, their place in a query planner's cost
model. Rust Systems Engineering's Chapters 21 and 22 go the other direction: building a B-tree
and an LSM tree from scratch, page splits and compaction included, rather than reading one
already built. This topic's own next step stays inside the chapter: once a key is found inside
one machine's index, which machine holds it at all becomes the question — consistent hashing
inside sharded stores, next.

</section>
