- **Producer id (PID)**: a unique identity the broker assigns a producer, transparent to the
  user. *Where you meet it:* the setup, and the recap.
- **Epoch**: a session marker bumped on every producer restart. *Where you meet it:* the zombie-
  fencing reveal.
- **Sequence number**: a monotonically increasing counter, one per (producer, partition).
  *Where you meet it:* the first predict/reveal pair.
- **Idempotence**: the guarantee that a retried write is recognized and rejected rather than
  duplicated. *Where you meet it:* the hook onward.
- **Zombie producer**: a stale instance of a producer, from a session that has since restarted,
  still trying to write. *Where you meet it:* the zombie-fencing reveal.
