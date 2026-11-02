- **Data skipping: statistics, page indexes, bloom filters**, this chapter's seventh topic.
  *Where you meet it:* this topic restates and extends that same per-file-statistic pruning
  mechanism to the table level, across two columns and three physical layouts.
- **Snapshot lifecycle: time travel to garbage collection**, this chapter's topic 17. *Where you
  meet it:* a reclustering commit is itself a new snapshot, subject to the same lifecycle rules.
- **Small files, compaction and file sizing**, this chapter's previous topic. *Where you meet it:*
  a bin-pack compaction and a reclustering both rewrite files, but only reclustering changes which
  rows end up next to which — compaction alone never does.
- **Schema evolution with column IDs**, this chapter's topic 16. *Where you meet it:* sort order
  and clustering columns are tracked by the same stable field identity that survives a rename.
- **Copy-on-write vs merge-on-read**, this chapter's §6.3. *Where you meet it:* reclustering is a
  copy-on-write operation — a new, differently-laid-out file replaces the old one outright.
