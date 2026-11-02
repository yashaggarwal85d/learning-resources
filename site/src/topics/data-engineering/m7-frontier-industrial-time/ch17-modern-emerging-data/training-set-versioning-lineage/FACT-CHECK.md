# Fact-check — de.training-set-versioning-lineage

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | A lakeFS branch is a pointer to a commit plus uncommitted changes; creating one is zero-copy. | lakeFS docs, Internals | Verified, quoted |
| 2 | A lakeFS tag gives a meaningful name to a specific commit. | lakeFS docs, Internals | Verified, quoted |
| 3 | A lakeFS merge finds the nearest common ancestor and performs a three-way merge. | lakeFS docs, Internals | Verified, quoted |
| 4 | A lakeFS commit is an immutable checkpoint of the whole repository at a point in time. | lakeFS docs, Internals | Verified, quoted |
| 5 | DVC's cache is content-addressable; a file's identity is a hash (usually MD5) of its contents. | DVC docs, Internal Files | Verified, quoted |
| 6 | Two files with identical content but different names/paths are deduplicated to one cache entry in DVC. | DVC docs, Internal Files | Verified, quoted |
| 7 | MLflow 3.0 introduced LoggedModel as a new first-class tracking object/entity. | MLflow 3.0 (Preview) docs | Verified, quoted |
| 8 | A LoggedModel's page shows evaluation metrics, model ID, source run, parameters — "a comprehensive overview of the model's performance and lineage." | MLflow 3.0 (Preview) docs | Verified, quoted |
| 9 | Passing `name` when logging a model lets a user search for LoggedModels by that name later. | MLflow 3.0 (Preview) docs | Verified, quoted |
| 10 | Apache Iceberg table metadata maintains a snapshot log of every change applied to a table. | Iceberg docs, Branching and Tagging | Verified, quoted |
| 11 | Iceberg branches and tags are named references to snapshots, each with its own independent lifecycle. | Iceberg docs, Branching and Tagging | Verified, quoted |
| 12 | Iceberg tags are used to retain important historical snapshots for auditing purposes. | Iceberg docs, Branching and Tagging | Verified, quoted |
| 13 | Content-hash identity (examples.py): two files with identical bytes hash identically; one differing byte changes the hash. | This topic's own examples.py (Python `hashlib`, measured) | Measured in this sandbox |
| 14 | Snapshot pinning (examples.py): re-querying a pinned snapshot table after the live source table is mutated returns byte-identical results; re-querying "the current table" does not. | This topic's own examples.py (Postgres, measured) | Measured in this sandbox |
| 15 | Label-version drift (examples.py): the same feature snapshot under two label definitions (30-day vs. 45-day churn window) produces a different label for a nontrivial fraction of rows. | This topic's own examples.py (Postgres, measured) | Measured in this sandbox |

## Currency check

- The Tecton/Databricks acquisition fact used in topic 2 is not re-asserted here; this topic does
  not depend on it.
- MLflow's LoggedModel is current as of MLflow 3.0's own preview documentation (docs.mlflow.org,
  version path `3.0.1`), fetched at research time (30 October 2026). No claim is made about
  MLflow 4.x or later, which does not exist in this course's source material.
- lakeFS and DVC's documented mechanisms (branches/commits/tags; content-addressable cache) are
  core, stable architecture, not version-specific preview features, and are unlikely to change
  shape even if exact version numbers move.
- Apache Iceberg's branching/tagging spec is a stable table-format feature, fetched from the
  "latest" docs path at research time.

## Red team

1. **Does a lakeFS branch actually avoid copying data, or does the doc oversell "zero-copy"?**
   The source is explicit: "Creating a branch is a zero-copy operation: instead of duplicating
   data, lakeFS creates a pointer to the source commit." This is architecture, not marketing — the
   underlying object store files are genuinely not duplicated; only a new commit pointer is
   created. The topic states this as the mechanism, not a benchmark claim.
2. **Is MD5 content hashing actually a reliable identity for "the same file," given MD5's known
   cryptographic collision weaknesses?** DVC uses MD5 for change detection and deduplication, not
   for security — the collision resistance that matters for an adversarial security context is
   irrelevant to DVC's accidental-collision use case at the scale of a single project's files. The
   topic does not claim MD5 is cryptographically secure, only that it is DVC's own documented
   mechanism for content identity.
3. **Does "LoggedModel" replace MLflow's older Model Registry concept, or do they coexist?** The
   source material describes LoggedModel as a new first-class *tracking* entity introduced in
   MLflow 3.0, distinct from (and not stated to replace) the Model Registry's versioning/staging
   concept. This topic makes no claim about the Registry; it only uses LoggedModel for the
   dataset-run-code linkage the syllabus asks for.
4. **Is "the nearest common ancestor" claim about lakeFS merges actually a three-way merge in the
   Git sense, or a looser approximation?** The source states both parts explicitly in the same
   sentence ("finds the merge base, the nearest common ancestor... and then performs a three-way
   merge by examining the presence and identity of files in each commit"), so this is not an
   inference — it is lakeFS's own stated algorithm.
5. **Does the examples.py snapshot experiment actually prove reproducibility, or does it just show
   two tables with different names stayed different?** The experiment specifically mutates the
   *live* source table after taking the snapshot, then re-queries both the live table and the
   pinned snapshot — the live query changing while the snapshot query does not is the actual claim
   under test (a snapshot is immune to a mutation that happens after it was taken), not a trivial
   tautology.

## Problem Solving

No source substitutions were needed for this topic — all four primary sources (lakeFS, DVC,
MLflow, Iceberg) were live and directly quotable from their official documentation on the first
attempt, apart from the `docs.lakefs.io/understand/model.html` URL from CHAPTER.md's planning
notes, which now 301-redirects to `docs.lakefs.io/concepts/internals/` (confirmed via `curl -sIL`
and `curl -sL`, following the redirect manually) — the content exists, only the URL moved, so the
redirect target was used directly and is the URL cited in SOURCES.md.
