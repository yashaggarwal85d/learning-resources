<section data-section="outcomes">

## Outcomes

Reproduce directly why a changelog scan with no row identity reports a copy-on-write compaction
or update as a pile of spurious deletes and inserts, and how a stable `_row_id` plus a
`_last_updated_sequence_number` that only moves on real change fixes it — exactly Iceberg's v3
row lineage mechanism. Name Delta's Change Data Feed and Hudi's incremental queries as the same
idea in their own vocabulary. Measure Iceberg's own plain incremental scan: append-only, and it
raises outright the moment a non-append snapshot falls in its range.

</section>

<section data-section="one-rule-two-formats">

## A row that moved and a row that changed look identical to a file diff

Iceberg's own `create_changelog_view` procedure removes "carry-over rows" by default — rows a
copy-on-write rewrite relocated without modifying, which a naive scan would otherwise report as
deleted-then-reinserted. Delta's Change Data Feed and Hudi's `hudi_table_changes` solve the same
problem from the opposite direction: instead of filtering a file diff after the fact, they both
track changes directly, tagging each one by its real operation (`insert` / `update_preimage` /
`update_postimage` / `delete` for Delta; `INSERT` / `DELETE` / `UPDATE_BEFORE` / `UPDATE_AFTER`
for Iceberg's changelog view). Either way, the row identity — not the file it happens to live
in — is the thing that makes "what changed" answerable at all.

</section>

<section data-section="production">

## Production

**A plain incremental scan is append-only, full stop.** Iceberg's own docs are explicit:
`start-snapshot-id` is exclusive, `end-snapshot-id` is inclusive, and the scan "cannot support
replace, overwrite, delete operations" in that range — a single compaction anywhere in the
window breaks it, and the API has no way to represent what happened instead.

**Delta's Change Data Feed is forward-looking only.** Enabling `delta.enableChangeDataFeed`
does not backfill history: querying a version before it was enabled raises an error outright,
and `VACUUM` deletes change data files on the same retention policy as everything else.

</section>

<section data-section="frontier">

## Frontier

The row-lineage model in `examples.py` is a from-scratch Python implementation of the v3 spec's
actual rules — not a wrapper around a real Iceberg catalog or Spark session, which this sandbox
cannot run. Delta's CDF and Hudi's `hudi_table_changes` are introduced by name and their own
documented semantics, not separately re-implemented, since the point is a shared underlying
idea, not identical code across three different runtimes this sandbox doesn't have. Iceberg's
merge-on-read delete-file case for changelog scans — where some engines historically could not
read snapshots containing delete files — is named only as a scope boundary, not demonstrated.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything so far has been taught once, in the abstract, across whichever format made the point
clearest. The next nine topics show the same ideas as two real, concretely different systems,
starting with Iceberg's own metadata tree.

</section>
