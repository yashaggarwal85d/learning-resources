- **Iceberg metadata tree**, this chapter's previous topic. *Where you meet it:* the per-manifest
  partition summaries that topic measured are exactly what lets planning read "which spec" off a
  manifest before deciding whether to open it.
- **Manifest**, from that same topic. *Where you meet it:* each manifest built here records the
  partition spec id it was written under, alongside the partition tuples and metrics already
  covered.
- **Scan planning**, from that same topic. *Where you meet it:* this topic's pruning measurements
  reuse the exact planning path that topic measured, now exercised across two different specs.
- **Partition tuple**, from that same topic. *Where you meet it:* a partition tuple is what a
  transform like `day(ts)` or `bucket[N]` actually produces — this topic names the transforms
  that build one.
- **Optimistic commit**, this chapter's thirteenth topic. *Where you meet it:* a partition spec
  evolution commits through the same optimistic path as any other table change.
- **Sequence number**, from the metadata-tree topic. *Where you meet it:* the old and new eras'
  manifests still carry their own sequence numbers, unaffected by which spec is now the default.
