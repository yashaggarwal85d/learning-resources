<section data-section="outcomes">

## Outcomes

By the end of this topic you can: implement a WAP publish with an audit step that can block promotion, and show a deliberately bad write never reaches production; design a canary rollout by partition or tenant with a measured rollback trigger; use a table format's time travel to roll back a bad publish in one step.

</section>

<section data-section="internals">

## Internals

Iceberg's own branching documentation is specific about both halves of the mechanism. The write side: "Writes are performed on a separate audit-branch independent from the main table history." The promotion side: "After validation, the main branch can be fastForward to the head of audit-branch to update the main table state." Fast-forward is only legal when main's current snapshot is still an ancestor of the audit branch's -- the same rule a git fast-forward merge follows. If main has moved on while the audit branch was being written, main's snapshot is no longer an ancestor, and the operation has to be a real merge instead of a fast-forward; this topic's own `SnapshotTable.fast_forward` enforces exactly that check and returns `False` rather than silently resolving it.

</section>

<section data-section="lab">

## Lab

Against the shop's own `fct_orders` baseline, a good write -- an idempotent reprocessing run of the same real data -- passes a real diff-and-tolerance audit and is fast-forwarded into production in one operation. A deliberately bad write, carrying one real negative amount, fails that same audit, and production is left byte-for-byte unchanged. A blue-green swap between two full table copies is measured as a single pointer update, not a row-by-row migration. A ten-partition canary rollout halts expansion the moment it reaches the one partition seeded with a real elevated error rate, never touching the partitions after it. A shadow run diffs a byte-identical re-run as safe to cut over and a regressed re-run (a real ~3.7% shift on one in five rows) as blocked, under the same audit logic used for the branch write. A feature-flagged transform reverts to its exact prior output the instant the flag is toggled back off. And a one-operation time-travel rollback restores the exact prior snapshot after a bad publish, removing every negative-amount row the bad write introduced.

</section>

<section data-section="production">

## Production

Downstream consumers protect themselves against an in-flight WAP write for the same reason the audit branch protects production: AWS's own write-up on the pattern states plainly that "these updates aren't accessible to downstream users who can only access the main branch." Isolation and the audit gate are two separate guarantees working together, not one mechanism doing double duty.

</section>

<section data-section="frontier">

## Frontier

A true zero-copy branch -- the chapter's one skipped syllabus entry -- is what an Iceberg audit branch approximates; this topic's own `SnapshotTable` is a full in-memory copy standing in for that storage-sharing mechanism, not a demonstration of it. The diff technique the audit step runs is topic 16's, used here and not re-taught. Chapter 6's own snapshot and time-travel mechanics are the real mechanism `time_travel_rollback` stands in for, also used and not re-taught.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

WAP protects a pipeline's own deploys. It says nothing about a change that breaks a consumer's expectations even though every internal test passed -- a column renamed that another team's dashboard still reads by its old name. That contract, enforced automatically, is the chapter's last topic.

</section>
