- **Snapshot-based table metadata**, this chapter's topic 12. *Where you meet it:* that snapshot
  model gets opened up here into its real tree — `metadata.json`, manifest list, manifests.
- **Optimistic commits and conflict resolution**, this chapter's topic 13. *Where you meet it:*
  `rewrite_manifests` commits through the exact same optimistic path as any other write.
- **Copy-on-write vs merge-on-read**, this chapter's topic 14. *Where you meet it:* the manifest
  each data file belongs to carries the same per-file metrics either strategy relies on.
- **Small files, compaction and file sizing**, this chapter's topic 18. *Where you meet it:*
  manifest bloat is the identical small-writes problem, one level up the tree.
- **Incremental reads and change feeds**, this chapter's previous topic. *Where you meet it:*
  the sequence numbers this topic reads directly off real manifests are what that topic's row
  lineage model was built from.
