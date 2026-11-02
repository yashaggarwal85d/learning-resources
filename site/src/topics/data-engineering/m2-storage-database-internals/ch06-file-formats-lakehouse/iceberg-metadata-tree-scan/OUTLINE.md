# Outline — de.iceberg-metadata-tree-scan

1. **Hook.** Every topic so far has treated "the snapshot" as a single thing a reader reaches
   for. This topic opens it up: a snapshot is a tree, and a scan plans by walking down it.
2. **Predict.** A reader needs one partition's worth of rows out of a table with five
   partitions, one per day. Does it have to open every manifest to find out which files match?
3. **Reveal — reproduced for real.** The real tree, built in this sandbox with a real
   `pyiceberg` table: `metadata.json` at the root (schemas, partition specs, sort orders,
   snapshot log, refs) points at a manifest list, which points at manifests.
4. **Reveal — reproduced for real.** Every manifest, data file, and delete file inherits its
   snapshot's sequence number — a real table's five commits read back with sequence numbers
   `[1, 2, 3, 4, 5]`, in order, with no gaps.
5. **Reveal — reproduced for real.** The manifest list carries per-manifest partition
   summaries; each manifest carries per-file partition tuples and column metrics — read
   directly off the real Avro files via the table's own inspect tables. Takeaway.
6. **Predict.** Scale the same question up: does planning actually skip manifests outside the
   target partition, or does it open all five and filter rows afterward?
7. **Reveal — reproduced for real.** Measured directly: an unfiltered scan plans 5 files; a
   scan filtered to one day's partition plans exactly 1 — the other 4 manifests are pruned by
   their partition summaries before any file inside them is touched. Takeaway.
8. **Reveal.** This is why a streaming-style table — one small commit per arrival, each with
   its own one-manifest snapshot — ends up with as many manifests as commits: the same bloat
   topic 18 found at the data-file level, one level up the tree.
9. **Reveal — reproduced for real.** A real `rewrite_manifests`, built from pyiceberg's own
   manifest-writing and snapshot-commit primitives: the five one-manifest commits merge into a
   single manifest, committed as the table's new live snapshot — same row count, same data,
   one manifest instead of five. Takeaway.
10. **Recap.**

Ten steps, two predicts (steps 2 and 6), three takeaways (steps 5, 7, 9 — none on step 3, the
reel test's "from" step).
