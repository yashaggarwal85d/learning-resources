<section data-section="outcomes">

## Outcomes

A real toy checkpoint-cost model confirms a remote-primary checkpoint stays flat as state size
grows while a local-primary checkpoint grows with it. A real per-key-ordering model confirms
same-key accesses always complete in the order they were issued while different keys' accesses
freely interleave. A real sync-vs-async throughput model confirms overlapping remote round trips
finishes measurably faster than serving them one at a time. A real cache model confirms a
latency-sensitive job pays a real, measurable cost when its working set isn't well cached. All
measured directly against the models' own state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic hosts the RocksDB-vs-ForSt throughput-comparison leg of the 9.3 chapter lab, sourced
from the Mei et al. paper's own reported measurements and this topic's own toy model standing in
for a real cluster (disclosed in FACT-CHECK.md; no real ForSt cluster available in the sandbox).

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming ForSt is strictly better than RocksDB.** A job needing single-digit-millisecond state
access on every record, with a working set that never fits a local cache well, pays real,
uneliminable round-trip latency that RocksDB's local-primary model doesn't.

**Treating async state access as a drop-in, order-preserving rewrite without checking.** The
per-key ordering guarantee only holds for the same key; code that silently assumed strict
cross-key ordering under the old synchronous API can observe different behavior under the new one.

**Underestimating the cold-cache cost on a freshly rescaled or recovered job.** A job that just
scaled out or recovered starts with an empty local cache, and the measured throughput hit for an
uncached working set is large enough to matter before the cache warms back up.

</section>

<section data-section="frontier">

## Frontier

The paper's own reported recovery, scale-in, and scale-out multiples are specific to the workloads
and cluster configuration it measured; this topic names and sources those numbers without
asserting they generalize to every deployment unchanged.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything about Flink covered so far has been operators and state underneath any particular API.
A whole other way to use Flink treats the stream as a changing SQL table instead, built directly
on top of the runtime and state model just covered — that layer is next.

</section>
