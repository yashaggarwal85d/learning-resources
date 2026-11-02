- **The table snapshot model**, from earlier in this chapter. *Where you meet it:* small files and
  compaction are both about the data files a snapshot points to, not the snapshot chain itself —
  this topic's bin-pack compaction creates a new snapshot the same way any other commit does.
- **Copy-on-write versus merge-on-read**, this chapter's §6.3. *Where you meet it:* MOR's own
  delete/log files are named as one real source of small files, alongside streaming micro-batches
  and high-partition-count writes.
- **Optimistic commits and conflict resolution**, this chapter's topic 13. *Where you meet it:* a
  compaction job is itself a commit, which is exactly why compacting a partition ingestion is still
  actively writing to is a real scheduling decision, not a free action.
- **Schema evolution with column IDs**, this chapter's topic 16. *Where you meet it:* neither
  schema evolution nor compaction changes what a column means — both only change how the
  underlying bytes are packaged.
- **Snapshot lifecycle: time travel to garbage collection**, this chapter's previous topic.
  *Where you meet it:* this topic is the direct answer to that topic's own handoff — what happens
  when a snapshot's files don't stay a reasonable size.
