## Apache Iceberg, Table Spec (snapshot references: branches and tags)

URL: https://iceberg.apache.org/spec/
Version: latest (fetched 2026-11-02)

> Iceberg tables keep track of branches and tags using snapshot references.
Tags are labels for individual snapshots. Branches are mutable named references that can be updated by committing a new snapshot as the branch's referenced snapshot using the Commit Conflict Resolution and Retry procedures.

> A reference's snapshot ID. The tagged snapshot or latest snapshot of a branch.

> Type of the reference, tag or branch

> For snapshot references except the main branch, a positive number for the max age of the snapshot reference to keep while expiring snapshots. Defaults to table property history.expire.max-ref-age-ms. The main branch never expires.

> There is always a main branch reference pointing to the current-snapshot-id even if the refs map is null.

Contents: a tag is a fixed, named pointer at one snapshot — nothing moves it, which is what makes
it useful for retention and reproducibility. A branch is a named pointer that moves forward as new
snapshots are committed against it, which is what makes it useful for isolated writes. `main` is
itself just one branch among possibly several, the one the table always has.

## Apache Iceberg, Spark Procedures (fast_forward)

URL: https://iceberg.apache.org/docs/latest/spark-procedures/
Version: latest (fetched 2026-11-02)

> Fast-forward the current snapshot of one branch to the latest snapshot of another.

> The wap_id to be published from stage to prod

> The table's current snapshot before publishing the change

> The snapshot ID created by applying the change

Contents: the project's own procedures documentation names the publish step directly as a
fast-forward of one branch's current snapshot to another's — exactly the mechanism this topic's
`examples.py` exercises through pyiceberg's own `set_current_snapshot`, and reports before/after
snapshot ids as its own stated output, matching what this topic verifies by hand.

## Apache Iceberg, View Spec

URL: https://iceberg.apache.org/view-spec/
Version: latest (fetched 2026-11-02)

> View metadata storage mirrors how Iceberg table metadata is stored and retrieved. View metadata is maintained in metadata files. All changes to view state create a new view metadata file and completely replace the old metadata using an atomic swap. Like Iceberg tables, this atomic swap is delegated to the metastore that tracks tables and/or views by name. The view metadata file tracks the view schema, custom properties, current and past versions, as well as other metadata.

> Each metadata file is self-sufficient. It contains the history of the last few versions of the view and can be used to roll back the view to a previous version.

> A view version can have more than one representation. All representations for a version must express the same underlying definition. Engines are free to choose the representation to use.

> A view version can have multiple SQL representations of different dialects, but only one SQL representation per dialect.

Contents: an Iceberg view is a separate kind of catalog object from a table — its own metadata
file, its own atomic-swap history, and its own version model — that stores one or more SQL
representations (one per dialect) of the same logical definition, rather than any data of its own.
