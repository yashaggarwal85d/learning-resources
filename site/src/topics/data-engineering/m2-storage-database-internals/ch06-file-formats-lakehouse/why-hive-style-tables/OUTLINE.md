# Outline — de.why-hive-style-tables

10-step storyboard. Predicts at steps 2 and 5 (both in the first half, per house rule). Takeaways
at steps 4, 7, 9 (never on the step right after a predict: step 3 and step 6 are reveals, not
takeaway steps, so 4 and 7 are safe).

1. **Hook** — a Hive-style table isn't a thing you commit to; it's whatever `LIST` returns right
   now for a directory tree. Set up the shop's order history as date-partitioned directories.
2. **Predict: does Hive validate a partition value before writing it?** — options: it validates
   against the column it was derived from / it trusts whatever value the writer supplies.
3. **Reveal: directory-as-partition, and no validation** — `/wh/T/ds=20090101/ctry=US` (Hive's own
   VLDB paper), and Hive can't check that `ds` actually matches the row's own timestamp column.
4. **Reveal: the metastore can go stale** — adding/dropping files on disk doesn't update the
   metastore; a reader trusts metadata that may no longer match the directory. Takeaway: table
   state and file-system state are two different things that can silently disagree.
5. **Predict: can two partitions commit as one atomic unit?** — options: yes, Hive wraps a
   multi-partition INSERT in one transaction / no, atomicity (pre-ACID) stops at one partition.
6. **Reveal: reproduced for real — a reader catches a partition mid-write** — the real two-
   partition write from `examples.py`, paused between partitions; a concurrent listing sees
   partition A complete and partition B half-written.
7. **Reveal: this is exactly Hive's own documented dirty-read problem** — the streaming-ingest
   motivation for ACID transactions: readers getting dirty reads and many small files pressuring
   the NameNode. Takeaway: a table with no atomic commit is a moving target for every concurrent
   reader, not just a theoretical risk.
8. **Reveal: listing itself gets slower as files pile up** — the real measured `os.scandir()`
   curve across growing file counts, and MSCK REPAIR TABLE's own documented cost scaling with
   partition count.
9. **Reveal: the shape every modern table format fixes** — a mutable table sitting on an
   immutable, list-based object store; replacing "list the files" with an explicit, versioned
   table state is the fix. Takeaway: every problem this topic reproduced — no validation, stale
   metadata, no atomic commit, listing cost — comes from using LIST as the table's state.
10. **Recap** — directory-as-partition, no atomic multi-partition commit, listing cost grows with
    file count; the fix is an explicit, versioned snapshot instead of a LIST call.
