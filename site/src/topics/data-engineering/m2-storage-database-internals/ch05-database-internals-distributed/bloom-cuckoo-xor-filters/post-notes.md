<section data-section="outcomes">

## Outcomes

Approximate membership with no false negatives is named as a Bloom filter's own core guarantee,
reproduced for real: a filter sized from a target false-positive rate (bits per key, hash count)
is built, queried against real held-out keys, and its measured false-positive rate is checked
directly against the sizing formula's own predicted rate. A cuckoo filter's real addition (actual
deletes) and what xor, binary-fuse and ribbon filters trade (build cost for space) are named from
their own papers and a real engine's own documentation. The real systems that already use this
family — topic 8's own LSM reads, Parquet column filters, join pruning, runtime filters — are
named directly.

</section>

<section data-section="internals">

## Internals

Inserting a key sets a handful of bit positions, derived from the key's own hash; checking that
same key later probes those exact same positions, which is why a genuinely inserted key can never
come back as absent. Sizing ties the number of bits per key, and the number of hash positions
each key touches, directly to a chosen target false-positive rate: fewer bits per key means more
false positives at the same key count. A standard Bloom filter structurally cannot delete a
single item without rebuilding the entire filter; a cuckoo filter adds a real way around this by
storing a removable fingerprint per entry instead. Xor and ribbon filters both need the whole set
known up front and cannot be modified afterward, trading that one-time build cost for using less
memory per key than a Bloom or cuckoo filter at the same false-positive rate.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a Bloom filter's false-positive rate as fixed rather than a sizing choice.** The real
rate is set directly by how many bits per key, and how many hash positions, the filter was built
with — a looser target rate trades real memory for a higher real error rate, and the choice is
made at build time, not discovered afterward.

**Reaching for a cuckoo filter for a capability a system never actually uses.** A cuckoo filter's
real advantage over a standard filter is deleting one entry directly. A system that only ever
drops an entire filter at once (such as topic 8's own per-file filters, dropped by deleting the
whole file) gains nothing from that extra capability.

</section>

<section data-section="frontier">

## Frontier

Count-Min Sketch is named here as a related, sourced-only structure: it answers a different
question entirely (an approximate count for a key, not a yes-or-no membership check), and is
built directly in the next chapter section's own lab rather than in this topic.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Membership is one question a tiny structure can answer approximately. The next topic is a
completely different question answered the same way: how many distinct values are there,
without storing any of them.

</section>
