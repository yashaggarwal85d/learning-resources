---
title: "ARIES steal/no-force recovery"
---

## Outcomes

- Build a real, minimal ARIES-style recovery: an analysis pass, a redo pass, and an undo pass, over a log containing both a committed transaction and one that never committed.
- Measure that redo reapplies every update in the log, committed or not, before undo ever runs.
- Measure that a fuzzy checkpoint's own dirty-page bound lets redo visit genuinely fewer log records than a full scan, while still reaching the identical, correctly recovered final state.
- Measure that a second, independent crash partway through undo is recovered correctly from the compensation log records already written, without repeating or skipping any of the undo work.
- State, from the original ARIES paper, what a CLR is and why its own update is never itself undone, and from PostgreSQL's own documentation, what a checkpoint record names as the point recovery must redo from.
- State why steal and no-force are the high-performance buffer policy this topic's own recovery assumes, and when a simpler, redo-only design (no-steal) is enough instead.

## Internals

Analysis determines each loser transaction's own undo-resumption point from the most recent record belonging to that transaction, whether that record is a plain update or a CLR already written on an earlier recovery attempt. The undo pass itself then follows a CLR's own `undo_next_lsn` pointer forward rather than ever re-examining the record that CLR already compensated for — this topic's own second claim measures exactly that, interrupting undo mid-way, discarding all in-memory state, and rerunning the full sequence from scratch.

## In production

ARIES's own words state the CLR rule plainly: a CLR's own update is never undone, so CLRs are viewed as redo-only log records. PostgreSQL's own checkpoint record names the real point recovery must redo from, and ARIES itself supports fuzzy checkpoints — taken without stopping the system — as one of the features it names directly as important to an industrial-strength transaction processing system.

## The frontier

The syllabus names a simpler, redo-only, no-steal design, typical of LSM engines, as sufficient when immutable, append-only writes mean an uncommitted page is never written back before commit in the first place — such a system needs no undo pass and no CLRs at all. This topic discusses that alternative in prose rather than building a second recovery implementation, since the claim under test is specifically why steal and no-force need both an undo pass and CLRs. All three of this topic's own measured claims run entirely on in-memory Rust structures, with no file, network, or root access needed.

## Where this goes next

A correct recovery says nothing yet about how expensive making a transaction durable in the first place actually is, or what it costs to make that cheaper.
