- **High watermark**: the largest cursor value an extractor has already read, past which it only
  asks for newer rows. *Where you meet it:* the line a cursor run advances, and the line a late
  commit lands behind.
- **`updated_at`**: an ordinary column, written by whatever touches a row, that a cursor compares
  against its own watermark. *Where you meet it:* the column at the center of every miss this
  topic reproduces.
- **Sequence**: a database object that hands out an increasing number on demand, never taking one
  back. *Where you meet it:* the second cursor family, shown disagreeing with commit order the
  same way a timestamp does.
- **Transaction timestamp**: a transaction's own notion of "now," fixed the moment it starts and
  never advancing while it stays open. *Where you meet it:* measured directly as the mechanism
  behind the whole chapter's missed row.
- **Commit order**: the order rows actually become visible to everyone else, which this topic
  shows disagreeing with both timestamp order and sequence order.
- **Hard delete**: a row removed outright, leaving no trace for any column-based cursor to
  compare against. *Where you meet it:* measured directly as the one miss lookback cannot repair.
- **Upsert**: a single write that inserts a new row or updates a matching one, keyed on identity
  rather than blindly appending. *Where you meet it:* the write-back this topic proves safe to
  repeat.
- **Lookback**: re-reading a short margin of time behind the watermark instead of stopping exactly
  at it. *Where you meet it:* sized from a real measured transaction length, not picked by feel.
