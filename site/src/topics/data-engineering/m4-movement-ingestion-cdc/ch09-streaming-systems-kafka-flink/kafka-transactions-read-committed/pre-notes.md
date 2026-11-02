- **Transactional id**: a stable, application-assigned identity that lets a producer recover its
  transactional state across a restart. *Where you meet it:* the setup, and the zombie-fencing
  predict/reveal.
- **Coordinator**: a dedicated broker role that tracks every transaction's state and writes its
  commit/abort control markers. *Where you meet it:* the setup, and the recap.
- **Control marker**: a commit or abort record the coordinator writes into every partition the
  transaction touched. *Where you meet it:* the visibility reveal.
- **Last stable offset**: the point past which no open transaction's writes exist. *Where you
  meet it:* the visibility predict/reveal.
- **Read-committed**: a consumer isolation level that only returns records from transactions
  that committed. *Where you meet it:* the visibility predict/reveal.
- **Two-phase commit**: a protocol letting two separate systems agree to both commit or both
  abort the same logical write. *Where you meet it:* the final reveal, named for KIP-939.
