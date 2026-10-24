---
title: "Snapshot visibility over version chains"
---

## Outcomes

- Build a real, minimal version chain per row, each version tagged with the id of the transaction that created it and, once superseded, the id of the transaction that deleted it.
- Measure that visibility is genuinely a function of version metadata plus a reader's own fixed snapshot, never the chain's own newest row.
- Measure that a writer never overwrites an existing version's own fields: it appends a brand-new version and stamps only the old one's own deleting-transaction marker.
- Measure that a reader's snapshot, once taken, keeps returning the identical version across any number of further, unrelated commits.
- State, from PostgreSQL's own documentation, the real xmin/xmax mechanics and the real guarantee that reading never blocks writing and writing never blocks reading.

## Internals

The visibility check here runs against a real `HashSet` of committed transaction ids, captured at the exact moment a reader's own snapshot is taken; a version is visible only when its own creating transaction is in that set (or is the reader itself) and its own deleting transaction, if any, is not. An aborted transaction is modeled correctly for free: since it's simply never added to the committed set, a version it tried to delete still correctly reads as visible to everyone else, exactly as a real rollback would behave.

## In production

PostgreSQL's own documentation states the central guarantee directly: reading never blocks writing, and writing never blocks reading, because MVCC gives every reader its own fixed snapshot instead of a lock on the row. Its own system-columns page names the real version metadata this topic's own prototype stands in for: `xmin`, the inserting transaction for a row version, and `xmax`, the deleting transaction or zero for an undeleted one. Its own transaction-isolation page states that a repeatable read transaction's snapshot is fixed as of its own first real statement, not re-taken for every later one.

## The frontier

The syllabus names real version-storage designs beyond this topic's own simplest append-only chain: time-travel and delta storage, and oldest-to-newest versus newest-to-oldest chain ordering, compared directly in Wu et al.'s VLDB 2017 paper. This topic's own prototype uses the simplest of those (an oldest-to-newest, append-only chain) to keep the visibility rule itself the clear, measured center of the topic. All of this topic's own measured claims run entirely on in-memory Rust collections, with no file, network, or root access needed.

## Where this goes next

This topic measured what a single reader's snapshot sees; it says nothing yet about which concurrent histories of reads and writes across several transactions are even allowed to happen at all, which is exactly where the next topic, isolation levels and their anomalies, begins.
