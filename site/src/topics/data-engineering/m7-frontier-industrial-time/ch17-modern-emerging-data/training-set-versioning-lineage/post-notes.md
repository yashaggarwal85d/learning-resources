<section data-section="outcomes">

## Outcomes

Build a training set that queries a snapshot or tag instead of "the current table" and show it is
reproducible after the source table changes; state what lakeFS branching and DVC each actually
pin, and pick the right one for "a whole derived lake dataset" versus "a file next to a
Git-tracked training script"; log a dataset's digest against a model run in an experiment tracker
and search by it; name label-version drift as a failure distinct from data drift.

</section>

<section data-section="internals">

## Internals

A lakeFS branch and a DVC pin solve the same problem — avoid duplicating bytes that haven't
changed — at two different granularities. lakeFS's own documentation is explicit that "creating a
branch is a zero-copy operation: instead of duplicating data, lakeFS creates a pointer to the
source commit"; a merge later "finds the merge base, the nearest common ancestor of the two
commits, and then performs a three-way merge." DVC works at the scale of one file: its cache is
"content-addressable," and "file hashes are calculated from file contents only," so two
identically-named-but-different files, or two differently-named-but-identical files, are never
confused with each other. Apache Iceberg's own table format gives the same pinning idea a third
home, one layer down, inside a single table's own metadata: "table metadata maintains a snapshot
log," and "branches and tags are named references to snapshots with their own independent
lifecycles" — a team can reasonably use a table-format tag and a lakeFS tag at once, one inside a
table, one across a whole repository of tables and files.

</section>

<section data-section="lab">

## Lab

This topic hosts no lab of its own; it builds on topic 3's logged rows as the thing being
versioned. `examples.py` snapshots a Postgres table, mutates the live source table afterward, and
re-queries both: the live query's rows changed, the pinned snapshot's rows did not, confirmed row
for row. A content-hashing check (Python's own `hashlib`, standing in for DVC's MD5-based cache)
confirmed two byte-identical files hash identically regardless of name, and a single changed byte
changes the hash. A minimal experiment-tracker stand-in logged two models against two different
dataset digests and confirmed a search by digest returns exactly the one model that trained on it.
Finally, the same feature snapshot was labeled twice, once under a 30-day churn window and once
under a 45 day window: 270 of 1,500 simulated customers (18.0%) got a different label purely from
the label definition changing, with every feature value held fixed — label-version drift, measured,
not asserted.

</section>

<section data-section="production">

## Production failures this topic warns about

**A dataset identified by a name, not a digest.** "Dataset v2" means nothing if the table or file
it points to keeps changing underneath that name — the name is exactly the kind of mutable
reference the Hook's broken, unrebuildable dataset relied on. A digest (a snapshot id, a content
hash) is the only identifier that can't silently drift out from under you.

**Retraining "on the same data" after a silent label redefinition.** A policy change to what counts
as churn, rolled out without anyone updating a dataset version or notifying the model's owners,
produces a model that looks retrained on unchanged data and is actually trained on a different
problem — the failure this topic's label-version-drift reveal exists to name before it happens
silently in production.

</section>

<section data-section="frontier">

## Frontier

MLflow 3.0's own documentation frames `LoggedModel` as "a new first-class object" introduced "into
MLflow Tracking," one that lets "every deep learning checkpoint" be "stored as a LoggedModel with
its own metrics and parameters," and that a model logged with a `name` can later be found again by
searching on that name. Weights & Biases offers the comparable mechanism in a different tool
(dataset- and model-versioning artifacts), named here only as the same idea under another vendor,
not re-derived from its own documentation.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A versioned dataset still assumes the world it was drawn from hasn't moved since. It has. The next
topic is what to do about that: data drift, concept drift, and the proxy metrics you watch while
the true label is still weeks away.

</section>
