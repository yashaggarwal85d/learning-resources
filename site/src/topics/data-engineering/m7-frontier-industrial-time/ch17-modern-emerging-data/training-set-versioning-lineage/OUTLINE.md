# Outline — de.training-set-versioning-lineage

## Outcomes (from CHAPTER.md)

Build a training set that queries a snapshot/tag instead of "the current table" and show it is
reproducible after the source table changes; state what lakeFS branching and DVC each actually
pin, and pick the right one for "a whole derived lake dataset" versus "a file next to a
Git-tracked training script"; log a dataset's digest against a model run in an experiment tracker
and search by it; name label-version drift as a failure distinct from data drift.

## 10-step storyboard

1. **Hook.** A model's offline AUC was reported six months ago from a dataset no one can rebuild
   today — the source tables have since been compacted and the query that built it was never
   saved.
2. **Predict: what would have made it reproducible.** Two tools, one for the whole lake, one for
   a file next to the training script — which fits a dataset this size? (Correct: a table-format
   snapshot/tag plus a lakeFS branch for a lake-scale derived set, justified by scale.)
3. **Reveal: querying a moving target vs. a pinned one.** "The current table" keeps moving under
   a query; a snapshot/tag is a named, immutable reference to one exact state. No takeaway (reel
   test's reference step).
4. **Reveal: lakeFS branches, the mechanism.** A branch is a zero-copy pointer to a commit; commits
   are immutable checkpoints; a tag names one commit for reuse. Takeaway on what a branch actually
   is (a pointer, not a copy).
5. **Reveal: DVC, the mechanism.** DVC pins by content hash — a file's identity is its hash, not
   its name or path, so two files with identical content share one cache entry. Takeaway on what
   DVC actually pins (a file's exact bytes, not a lake-scale namespace).
6. **Predict: which tool for which case.** A whole derived lake dataset the size of a table vs. a
   single CSV sitting next to a Git-tracked training script — which tool actually fits each?
7. **Reveal: the decision, justified by scale.** lakeFS branch for the lake-scale derived dataset
   (isolated view, merged once validated); DVC pin for the file next to the script (content-hash
   identity, travels with a Git commit). Takeaway: the choice follows the artifact's scale, not a
   preference.
8. **Reveal: linking dataset, code and model in an experiment tracker.** MLflow 3's LoggedModel
   ties a model run to its dataset digest and code commit, and models are searchable by which
   dataset trained them. Takeaway on what a LoggedModel actually links.
9. **Reveal: label-version drift.** A label can be relabeled by a policy change; "the same"
   features with a changed label definition do not reproduce the old model — a distinct failure
   from data drift. Takeaway distinguishing the two.
10. **Recap.** Query a snapshot, not the current table. Pick the pin by scale. Link dataset, code
    and model in one tracker. Watch the label's own version, not only the data's.
11. **Prove it.** A team re-trains "on the same dataset" every quarter by re-running the same SQL
    query against the live tables, no snapshot, no tag. Is this reproducible? (Correct: no — the
    query is stable, the tables underneath are not, so "the same dataset" silently changes.)

(Steps numbered 1-10 as reel steps per the project's convention: Hook, Predict, Reveal x6, Recap,
Prove it = 10 steps total — step indices above collapse to the 10-step reel.)

## Engagement arc

- Predicts: step 2, step 6/7 (combined into one predict+reveal pair in the reel) — actually per
  house convention, keep exactly two `predict` steps: step 2 and the final "Prove it" step; step 6
  becomes a reveal that states the decision rather than a second predict block, to keep the
  10-step budget tight and avoid three predicts.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 7, 8, 9 (five takeaways).

## Post-notes headings

What reproducibility actually requires; lakeFS branches vs. DVC pins (the decision table); linking
a dataset to a model run; label-version drift vs. data drift; what this topic leaves for the next
(drift as a distribution problem).

## Examples.py spec

Against this sandbox's own Postgres: build a "training set" as a materialized snapshot table
(`t17tv_snapshot_<version>`) at two points in time, after which the source table is mutated
(simulating compaction/overwrite); show that re-querying "the current table" after the mutation
gives a different row count/content than the original training run, while re-querying the pinned
snapshot table gives byte-identical results. Separately, demonstrate content-hash pinning: hash two
files with identical content but different names, confirm they hash identically (DVC's dedup
claim); hash two files that differ by one byte, confirm they hash differently. Log a small
"dataset digest + code version + metric" record to a local dict/table standing in for an
experiment tracker, and show a search-by-dataset-digest query returning the correct run. Finally,
simulate label-version drift: retrain on the same feature snapshot under label definition v1 and
v2 (e.g., churn window 30 days vs. 45 days) and show the resulting labels differ for a nontrivial
fraction of rows, proving "same data, different label version" is not reproducing the same
training set.

## Bridge / handoff

Bridge (answers topic 3's handoff verbatim): "A logged vector proves what one request saw. It says
nothing about whether this training set, built from many such logs over many weeks, can be rebuilt
byte for byte six months from now when someone asks which data trained which model. This topic is
giving a training set a version and a lineage: a snapshot to query, a branch or a pin to point at
it, and an experiment tracker that links all three to the model it produced."

Handoff (leads into topic 5): "A versioned dataset still assumes the world it was drawn from
hasn't moved since. It has. The last topic of this section is what to do about that: data drift,
concept drift, and the proxy metrics you watch while the true label is still weeks away."

## Concept ledger

Introduces: `dataset-snapshot-reproducibility`, `lakefs-branch-vs-dvc-pin`,
`logged-model-dataset-linkage`, `label-version-drift`.
Uses: `served-vector-logging`, `log-and-wait-label-join` (topic 3); `feature-store-single-definition`
(topic 2).
Declared: basic familiarity with Git commits and content hashing.

## Claims list (for FACT-CHECK.md)

1. lakeFS: a branch is a pointer to a commit plus uncommitted changes, zero-copy to create.
2. lakeFS: a tag names a specific commit for reuse.
3. lakeFS: a merge finds the nearest common ancestor and performs a three-way merge.
4. lakeFS: a commit is an immutable checkpoint of the whole repository at a point in time.
5. DVC: the cache is content-addressable; file identity is a content hash (usually MD5).
6. DVC: two files with identical content but different names/paths share one cache entry (dedup).
7. MLflow 3.0 introduced LoggedModel as a first-class tracking entity.
8. MLflow 3.0: a LoggedModel's page shows evaluation metrics, model ID, source run, parameters —
   "a comprehensive overview of the model's performance and lineage."
9. MLflow 3.0: passing `name` when logging a model lets you search for LoggedModels by that name
   later.
10. Apache Iceberg: table metadata maintains a snapshot log of changes applied to a table.
11. Apache Iceberg: branches and tags are named references to snapshots with independent
    lifecycles.
12. Apache Iceberg: tags are used for retaining important historical snapshots for auditing.
13. (This course, reused) topic 3's served-vector-logging and log-and-wait join are the thing
    being versioned by this topic's snapshot/pin mechanism.
14. (This course, reused) topic 2's feature-store single-definition is the data source whose
    output gets snapshotted.
