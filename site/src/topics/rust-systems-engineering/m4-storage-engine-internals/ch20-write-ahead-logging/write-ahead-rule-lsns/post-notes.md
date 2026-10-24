---
title: "Write-ahead rule and LSNs"
---

## Outcomes

- State the write-ahead rule: a durable log record must reach its own durability point before the data page it describes can be trusted after a crash.
- Measure that the identical kind of crash is survived correctly when the log is written first, and genuinely, silently loses the update when the page is written first instead.
- Measure that redo is idempotent: comparing a page's own LSN against a record's own LSN makes replaying an already-applied record, or re-running a whole recovery pass, a genuine no-op.
- Measure that a page torn by a partial write is caught by a checksum mismatch, and genuinely fixed by restoring the log's own full-page image.
- State, from PostgreSQL's own documentation, the real reason the write-ahead rule exists and the real mechanism it uses against torn pages.

## Internals

The crash in this topic's own first claim is simulated by discarding the in-memory page's own bytes entirely, not by killing a real process. That matches this chapter's own handoff from Chapter 19 directly: a dirty page can be evicted, or simply never flushed, independent of whether it was already overwritten in memory, so losing the in-memory page is exactly the failure mode the write-ahead rule exists to survive.

## In production

PostgreSQL's own words state the rule plainly: changes to data files are written only after they've been logged, and any change not yet applied to a data page can be redone from the log. Its own fix for a torn page, the full-page write, periodically writes a complete image of a page to the log before modifying it on disk, so a partially-written page can always be restored from that image — exactly the fix this topic's own third claim measures.

## The frontier

The syllabus also names physical, logical, and physiological logging as three distinct granularities, and InnoDB's doublewrite buffer as a second named torn-page fix alongside PostgreSQL's full-page write. This topic's own log records are already physical, full-page images, and reproducing InnoDB's own doublewrite buffer is a materially separate piece of work from the one fix this topic measures, so both are discussed in prose rather than measured. All three of this topic's own measured claims run entirely on in-memory Rust structures, with no file, network, or root access needed.

## Where this goes next

A log record and a page that each carry their own LSN are enough to tell whether a change still needs replaying; the next question is what a real recovery does with that, across a log containing both committed and uncommitted work.
