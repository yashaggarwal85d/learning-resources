---
title: "Version garbage collection and long snapshots"
---

## Outcomes

- Build a real garbage-collection pass over a version chain, driven by the oldest currently open snapshot's own horizon.
- Measure that a long-lived reader genuinely blocks every single reclaim newer than it, not only of the one version it directly reads.
- Measure that, on the identical workload, closing that same reader instead genuinely frees its previously-pinned dead versions.
- Measure that a long-lived reader retains genuinely more versions than a short-lived one, on the identical workload.
- State, from PostgreSQL's own documentation, the real coupling between VACUUM, the xmin horizon, and a long-running open transaction.

## Internals

The horizon computed here is the real minimum over the set of currently open snapshot ids, exactly PostgreSQL's own xmin-horizon mechanism, not a threshold picked to make the demonstration work. The stronger, more surprising claim this topic measures is that a long-lived reader blocks reclaim of versions it never directly reads at all, not only the one version actually visible to it: every dead version created after that reader opened stays retained for as long as it does, since its own deleting transaction is never older than the reader's own horizon.

## In production

PostgreSQL's own documentation states the real remedy directly: end long-running open transactions, found by checking its own activity view for backends whose own transaction age has grown large. Running VACUUM more often does not help here, since the horizon itself, not the garbage collector's own frequency, is what blocks reclaim. Its own activity view names a backend's own xmin horizon directly, the identical real-world quantity this topic's own `horizon()` function computes as the minimum over open snapshot ids.

## The frontier

The syllabus names epoch-based version garbage collection, a forward reference to Chapter 30, as further material beyond this topic's own direct xmin-horizon mechanism; this topic measures that simpler, direct mechanism, which an epoch-based scheme is itself built to make cheaper to compute at scale. All of this topic's own measured claims run entirely on plain in-memory Rust structs, with no file, network, or root access needed.

## Where this goes next

This topic closes Chapter 23, and with it Milestone 4 (Storage-Engine Internals) as a whole: it measured what a storage engine owes a concurrent reader (a consistent version, a precise rule on which histories are allowed, and a real cost for every version kept around). The next chapter turns to a different layout question entirely: how storing values column by column instead of row by row changes what a scan and a point update each cost.
