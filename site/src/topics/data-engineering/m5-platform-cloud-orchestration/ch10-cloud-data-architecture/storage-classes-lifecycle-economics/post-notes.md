---
id: de.storage-classes-lifecycle-economics
title: 'Storage classes and lifecycle economics'
---

<section data-section="outcomes">

## Outcomes

- Choose a storage tier and automation policy from an access pattern, and price the retrieval cost correctly, including the retrieval delay.
- Explain exactly how a lifecycle rule can corrupt a table format's snapshot, and the one ordering fix that prevents it.
- Decide when Object Lock is worth its own irreversibility, and rehearse it safely before committing.

</section>

<section data-section="internals">

## Internals

- **Minimum storage duration is a commitment, not a suggestion.** All three clouds charge a prorated early-deletion or early-transition fee if an object leaves a cool/cold/archive tier before that tier's own minimum: 30/90/180 days on S3's IA/Glacier family, 30/90/365 on GCS, 30/90/180 on Azure. Chaining two minimum-duration transitions needs their combined minimum — AWS's own worked example needs at least 94 days end to end, not just the larger of the two.
- **Retrieval is a second, separate bill.** Reading a file back out of an archive tier costs a per-GB retrieval fee on top of storage, and for Glacier-class tiers it also costs time: Expedited in 1–5 minutes, Standard in 3–5 hours (or 12 for Deep Archive), Bulk in 5–12 hours (or 48 for Deep Archive). Azure's archive tier is flatly unreadable until rehydrated, up to 15 hours.
- **A lifecycle rule has no table-format-aware input, on any of the three clouds.** Its only inputs are an object's age, tags, prefix and size. It cannot ask whether a live snapshot still references the file it is about to delete — that question only Iceberg's `expireSnapshots` (or Delta's `VACUUM`) can answer, because only the table format's own metadata tracks it.
- **The fix is ordering, not a smarter rule.** Expiring the snapshot first drops the file's last reference before any age-based rule is allowed to delete it. Delete-before-expire corrupts the table every time the deleted file was still referenced; expire-before-delete never does, because nothing live still points at the file by the time the rule runs.
- **Object Lock's compliance mode has exactly one way out early: delete the whole account.** Governance mode is the same mechanism minus that absoluteness — overridable only with the explicit `s3:BypassGovernanceRetention` permission and header — which is also AWS's own documented way to rehearse a compliance-mode policy before committing to it.

</section>

<section data-section="production">

## Production

A common, real-shaped incident: a team sets a lifecycle rule to delete files over ninety days old to cut storage cost, without checking what else references those files. A table using snapshot-based time travel keeps data files alive past their age purely because a snapshot still points at them — sometimes for exactly the retention window a compliance team asked for. The lifecycle rule, blind to that reference, deletes the file anyway. The table doesn't error at delete time; it errors later, the next time someone runs a time-travel query or a rollback that needed that file, with no connection obvious between that failure and a lifecycle rule that ran weeks earlier. The fix a team converges on is almost always the one this topic reproduces directly: run snapshot expiry first, on a schedule ahead of the lifecycle rule's own cutoff, so the table itself releases a file before any age-based rule is allowed to touch it.

</section>

<section data-section="frontier">

## Frontier

The tier and lifecycle cost model built here — minimum-duration charges, retrieval fees and delays, and the automated-tiering monitoring fee — feeds directly into a later topic's full pricing lab, which puts storage cost on the same ledger as the compute and network costs a pipeline actually accrues, rather than pricing storage in isolation as this topic does.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything in this topic has been about data already at rest: what it costs to keep, move or read back. The next two topics turn to who is even allowed to touch any of it — starting with identity, because the alternative to a scoped role is a static key sitting in a notebook.

</section>
