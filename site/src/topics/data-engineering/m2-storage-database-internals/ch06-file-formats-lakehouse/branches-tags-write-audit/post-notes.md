<section data-section="outcomes">

## Outcomes

A real tag and a real branch, both created from the same snapshot, through pyiceberg's own
`manage_snapshots()` API. A real write-audit-publish flow run twice in the same sandbox: once
staged on a branch, validated, and fast-forwarded into `main`; once staged, caught by the same
validation check for a duplicate id, and discarded without ever touching `main`.

</section>

<section data-section="deep-dive">

## Deep-dive

The whole mechanism rests on one fact already covered: a snapshot reference is just a named
pointer at a snapshot, and `main` itself is one such reference, not a privileged special case.
A tag is a reference the spec declares fixed — useful for retention and for reproducing an exact
past table state on demand, since nothing ever moves it again. A branch is a reference the spec
declares mutable — every commit made "against" a branch is really just that branch's own pointer
being reassigned to a new snapshot, exactly the same primitive move that advances `main` on an
ordinary write. Write-audit-publish doesn't need any new machinery at all: stage data by
committing against a branch instead of `main`; audit it by running whatever check matters before
touching anything else; publish by moving `main`'s own pointer to the branch's now-validated
snapshot. The entire pattern is three ordinary reference operations in a row, not a distinct
feature bolted onto the format.

</section>

<section data-section="production">

## Production

In production this check is rarely a toy duplicate-id scan — it's whatever a team's own data
contract requires: row counts within an expected band, no nulls in a required column, a
downstream consumer's schema still satisfied. The `wap_id` table property and procedures like
`fast_forward`/`publish_changes` exist precisely so a CI job or an orchestrator can stage,
validate, and publish programmatically without a human watching every step — the tag created in
this topic plays the same retention role a release tag plays in software: a fixed point a team
can always return to, regardless of how many branches have come and gone since.

</section>

<section data-section="frontier">

## Frontier

Not built here, named only: Iceberg views, which are a wholly separate catalog object with their
own metadata and version history and no data of their own — a representation of a query, not a
table. Also named only: branching across more than one table at once, atomically, which the spec
places above any single table, in the catalog layer. Also disclosed honestly: no official Iceberg
page uses the literal phrase "write-audit-publish" as a section heading; this topic's sourcing
comes from the project's own `fast_forward`/`publish_changes`/`wap_id` procedures documentation,
which describes the identical mechanism under its own names.

</section>

<section data-section="next">

## Where this goes next

The next topic leaves Iceberg's metadata-tree-of-files mechanism behind entirely and shows the
same shared foundations — an immutable sequence of committed states, read by id — built on a
visibly different mechanism: Delta Lake's own ordered JSON transaction log, reconstructed by hand
from a real `_delta_log` directory.

</section>
