<section data-section="outcomes">

## Outcomes

Design a landing, validation and promotion flow where a half-written batch is never read.
Choose among a manifest, a success marker and a conditional write for a given producer. Route a
poison file to quarantine with a reason. Decide between notification-driven and list-driven
discovery and handle the duplicates the first one delivers.

</section>

<section data-section="internals">

## Internals: the object-storage contract, applied

This topic introduces no new storage mechanism of its own. Chapter 1 topic 11's own
object-storage contract (an atomic `PUT` per object, no rename, read-after-write consistency,
conditional writes) is the constraint every protocol here is built around, not re-derived; this
topic's own contribution is showing what a producer and a reader actually do with that contract
— a manifest, a marker, a conditional write — to get a safe commit despite it. Chapter 3 topic
13's idempotent-merge-load pattern reappears implicitly in the manifest's own role: a manifest
written exactly once, named deterministically, makes a repeated write of the same batch as safe
as the merge that pattern already teaches.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a listing instead of a completion signal.** The hook's own producer crash leaves
nine files unwritten, and a reader that simply lists the prefix reads the other thirty-one as if
they were the whole batch — nothing in that listing distinguishes "the batch finished" from "the
batch is still in progress, or died." A team that lists before checking for a manifest or a
marker inherits this exact risk on every single run, not just the rare crash.

**Treating `ignoreCorruptFiles` as a validation strategy.** Step 7's own named anti-pattern is a
blanket setting that keeps a job running past a corrupt file with no record of why that file was
skipped. A team that reaches for this setting to make a flaky pipeline green again loses the one
thing a real quarantine preserves: a reason, attached to the file, for whoever has to debug it
later.

</section>

<section data-section="frontier">

## Frontier

None claimed. Manifests, success markers, conditional writes and notification-driven discovery
are each established, long-documented practice — this topic measures their real behaviour
directly rather than describing something new.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every source this chapter has covered so far needed its own trick to avoid losing or repeating
rows. They share one underlying property, worth stating on its own: a run that can be repeated,
or resumed, without changing the answer.

</section>
