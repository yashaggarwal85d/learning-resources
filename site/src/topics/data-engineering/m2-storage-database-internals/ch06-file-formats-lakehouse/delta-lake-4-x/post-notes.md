<section data-section="outcomes">

## Outcomes

This topic states the current Delta Lake release line's Spark compatibility and headline
features precisely, with versions and the Kernel-vs-Spark distinction where the primary sources
draw one; explains Delta Kernel as the shared library that lets non-Spark engines read and write
Delta correctly without reimplementing the protocol; and uses delta-rs (the `deltalake` Python
package) directly in this sandbox to write, append, time-travel read, and enable real protocol
table features on a local Delta table, with no Spark cluster anywhere.

</section>

<section data-section="deep-dive">

## Deep-dive

Delta Kernel's architecture splits a connector into Rust or C/C++ bindings calling into Kernel's
core logic, which in turn calls back into an engine-supplied "Engine trait" for the IO Kernel
itself doesn't want to own (reading files, listing a directory). This is why Kernel can stay
query-engine agnostic: it owns the protocol's decision logic, not the storage access underneath
it. delta-rs takes the opposite shape -- it owns both the protocol logic and its own Parquet
reader and filesystem access, which is exactly why DuckDB chose Kernel instead when building its
own Delta extension: adopting delta-rs would have meant routing every read through a second,
redundant Parquet reader DuckDB didn't need.

</section>

<section data-section="production">

## Production

The write-conflict and isolation-level rules this chapter already covered (topics 28-29) don't
change under Kernel or delta-rs -- both are readers and writers of the identical protocol, not a
different one. delta-iceberg's own Spark-version lag (supporting 4.1 but not 4.2 as of Delta 4.4)
is the kind of module-specific compatibility gap worth checking explicitly before upgrading a
UniForm-enabled table, rather than assuming every Delta module tracks the same Spark version.
Variant shredding's own Production-Ready flag, still unenforced as of 4.3, is a concrete reason
not to treat a feature's presence in a release as the same thing as its enforcement being final.

</section>

<section data-section="frontier">

## Frontier

Collations and the Geospatial table feature both shipped first in Delta Kernel, not in Delta
Spark -- a sign that new protocol features increasingly land in the shared, engine-agnostic
layer first, with individual engines (including Delta Spark itself) picking them up afterward
rather than inventing them.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Both Iceberg and Delta now exist as real, fully built arcs in this course. The next topic asks
what sits above either format so more than one engine can even find a given table in the first
place: the catalog.

</section>
