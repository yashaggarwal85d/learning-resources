- **System of record**: the one authoritative copy of a dataset — everything else derived from it
  can be rebuilt. *Where you meet it:* the system-of-record reveal.
- **Derived store**: a dataset computed from a system of record, kept for convenience or
  performance rather than as the source of truth. *Where you meet it:* the system-of-record
  reveal.
- **Dominant access path**: the one query shape that accounts for most of a system's actual cost.
  *Where you meet it:* the access-path reveal and the band-across-layouts reveal.
- **Partition pruning**: skipping files or partitions that can't contain data a query needs,
  rather than scanning them. *Where you meet it:* the band-across-layouts reveal — the mechanics
  themselves are Chapter 2's own subject, assumed here.
- **Retention tier**: a class of data (hot, warm, cold) with its own storage cost and its own
  retention period. *Where you meet it:* the tiers reveal.
- **Erasure**: deleting one subject's data on request — assumed vocabulary this topic doesn't
  re-derive the mechanics of. *Where you meet it:* the second predict and its takeaway.
