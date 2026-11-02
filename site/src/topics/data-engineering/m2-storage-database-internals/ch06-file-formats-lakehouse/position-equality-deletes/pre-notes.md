- **Deletion vectors**, this chapter's fifteenth topic. *Where you meet it:* the per-data-file
  bitmap that topic built is exactly what v3 replaces position delete files with — this topic's
  cost measurement is why.
- **Iceberg metadata tree**, this chapter's previous-but-one topic. *Where you meet it:* delete
  files are tracked by manifests the same way data files are, using that topic's own scan
  planning path.
- **Manifest**, from that same topic. *Where you meet it:* this topic's delete manifest is built
  with the same `write_manifest` primitive that topic used for data manifests, just holding a
  delete file instead.
- **Sequence number**, from that same topic. *Where you meet it:* a position delete must share
  its data file's sequence number to delete rows added in the very same commit.
- **Hidden partitioning and partition evolution**, this chapter's previous topic. *Where you meet
  it:* delete files, like data files, are tracked by partition and planned per-manifest the same
  way.
- **Table snapshot model**, Chapter 6's earlier shared-foundations topics. *Where you meet it:*
  both delete kinds here are committed as an ordinary new snapshot, not a special-cased write.
