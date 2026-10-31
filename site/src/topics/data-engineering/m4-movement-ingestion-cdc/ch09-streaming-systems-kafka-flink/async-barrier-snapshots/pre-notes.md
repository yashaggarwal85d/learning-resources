- **Checkpoint barrier**: a marker injected at every source that flows through the job graph with
  the ordinary data stream, signaling where a checkpoint starts. *Where you meet it:* the barrier
  reveal.
- **Chandy-Lamport snapshot**: the classical distributed-snapshot algorithm this topic's barrier
  mechanism generalizes to a dataflow graph. *Where you meet it:* the barrier reveal.
- **Aligned checkpoint**: an operator waits for the barrier on every input before snapshotting and
  forwarding it. *Where you meet it:* the aligned reveal.
- **Unaligned checkpoint**: an operator snapshots on the first barrier it sees, folding in-flight
  data into the snapshot. *Where you meet it:* the unaligned reveal.
- **Incremental checkpoint**: a checkpoint that only stores the diff since the previous one,
  bounding cost by that delta. *Where you meet it:* the incremental reveal.
- **Savepoint**: a checkpoint taken deliberately, in a portable format, so a job can be stopped
  and restarted even with a changed job graph. *Where you meet it:* the checkpoint-vs-savepoint
  reveal.
