- **Snapshot-based table metadata**, this chapter's topic 12. *Where you meet it:* this topic
  reads the sequence of snapshots themselves as data — what changed between any two of them.
- **Deletion vectors across formats**, this chapter's topic 15. *Where you meet it:* a deletion
  is one of the operations whose downstream "what changed" a naive scan gets wrong.
- **Schema evolution with column IDs**, this chapter's topic 16. *Where you meet it:* a stable
  row identity is the same idea as a stable column identity, applied to rows instead of columns.
- **Small files, compaction and file sizing**, this chapter's topic 18. *Where you meet it:* the
  compaction this topic measures is the exact same copy-on-write rewrite that topic 18 showed
  fixing small files — here it's the thing a changelog scan has to see through.
- **Data layout: sorting, Z-order, Hilbert, clustering**, this chapter's previous topic. *Where
  you meet it:* a reclustering commit is also a copy-on-write rewrite, and faces the identical
  carry-over problem this topic solves with row identity.
