<section data-section="outcomes">

## Outcomes

A real toy rescale from four to six instances confirms every key sharing a key group also shares
an instance, both before and after rescaling, with no key group ever split — and that every key's
value checksums identically across the rescale. A real recovery-time model confirms a failed
instance's recovery time is identical regardless of how many operators the job runs, and tracks
only the state size its key groups held. A real access-cost and capacity comparison confirms
RocksDB costs measurably more per access than heap state, in exchange for a capacity bound by disk
rather than memory. All measured directly against the models' own state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic hosts the kill-TaskManager/measure-recovery-time and rescale-from-savepoint legs of the
9.3 chapter lab, on this topic's own toy keyed-checkpoint-and-restore model standing in for a real
Flink cluster (disclosed in FACT-CHECK.md).

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming recovery time scales with job complexity.** A job with many operators recovers exactly
as fast as a simple one holding the same state — provisioning extra recovery-time buffer for a
"complex" job misreads what actually drives that cost.

**Setting max parallelism casually, expecting to raise it later.** It fixes the number of key
groups a job will ever have; raising it after the fact requires a full state migration, not a
configuration change.

**Assuming an old savepoint restores into a new major version.** Flink's own compatibility table
only covers its own recent minor releases; a major-version jump needs the current migration guide
checked explicitly, not assumed to still work.

</section>

<section data-section="frontier">

## Frontier

The ForSt backend's own architecture — what it changes about where state's primary copy actually
lives, and what that buys for checkpoint cost — is the next topic's scope; this topic names it
only as one of three backends, not yet detailed.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every state backend covered so far keeps its authoritative copy close to the machine doing the
processing. Flink 2.x changes that assumption architecturally for one of them, and what it buys
and costs is the next topic.

</section>
