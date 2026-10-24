# Chapter 20 — Write-Ahead Logging and Crash Recovery (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 4, *Storage-Engine Internals* (its second chapter). Chapter 20 has one section, 20.1, with three full topics; its own lab exercise (a single-file WAL with length-prefixed, checksummed records, crashing after append-before-page-write and after page-write-before-checkpoint, recovery that must never expose a partial commit, then group commit plotted against batch size) is not a reel, per `CLAUDE.md`'s convention. Planned 2026-10-24, in one `/make-topic` session. Previous chapter: Chapter 19, *Pages, Records, and Physical Storage Layout* (four topics live: self-describing page formats, slotted pages and record identity, update strategies, buffer pool and page eviction), which closed on the question of which pages are resident in memory and who decides eviction.

This file is the contract the chapter's three topics build to. Do not edit it once a topic is in progress; record any unavoidable departure under that topic's `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 19 closed on a buffer pool that can evict a dirty page at any time, writing its bytes back to disk — but said nothing about what happens if the process or machine dies with a dirty page still only in memory, its write never reaching disk at all. This chapter answers that directly: a durable log record must reach its own durability point before the data page it describes can be trusted after a crash, the write-ahead rule that gives the chapter its name. A Log Sequence Number stamped on both the log record and the page it touches is what lets recovery decide, deterministically, whether a given redo record still needs applying — `page.lsn >= record.lsn` makes redo idempotent, safe to run again on a page that already reflects the change. Not every byte written to a page arrives atomically: a crash mid-write can tear a page, writing half of it in its old state and half in its new one, and real systems fix this two different ways (PostgreSQL's full-page writes, InnoDB's doublewrite buffer) rather than assuming the filesystem's own guarantees cover it. ARIES names the real recovery algorithm built on top of the write-ahead rule: an analysis pass finds where recovery needs to start, a redo pass reapplies every change whose durability point was reached but whose page wasn't, and an undo pass reverses every change a transaction started but never committed, using compensation log records so that undo itself survives a second crash; a fuzzy checkpoint bounds how far back recovery ever needs to look, without stopping the system to take it. And because fsync is not free, no real system calls it once per write: group commit batches several transactions' log records into one flush, trading a small amount of added latency for a large reduction in flush contention, which is why a system's own commit latency is not the same number as its own execution time, and why asynchronous commit (acknowledging a commit before its log record is even durable) is a real, named way to give durability up for latency.

By the end of the chapter the learner can: build a real write-ahead log where a page's own LSN and a log record's own LSN together make redo idempotent, and show a torn page detected and fixed by a full-page write (or equivalent) rather than silently misread; build a real, minimal ARIES-style recovery that runs an analysis pass, a redo pass, and an undo pass using compensation log records over a log containing both committed and uncommitted transactions, and show it recovers to a state with no partial commit visible, whatever point the crash happened at; and build a real group-commit implementation with a leader thread batching several commits into one flush, measuring commit latency against batch size and showing where asynchronous commit trades durability for latency.

## A.2 The order of ideas, and why

1. **Write-ahead rule and LSNs** (topic 52) — the chapter's foundation: a durable log record reaching its durability point before its page can be trusted, and the LSN comparison that makes redo idempotent. Needs Chapter 19's own `buffer-pool-pin-evict-contract` directly (the rule exists specifically because a buffer pool can evict, and therefore write back, a dirty page at any time) and Chapter 15's own `wal-batched-flush-points` (this topic builds the actual flush-point mechanism that chapter measured from the outside).
2. **ARIES steal/no-force recovery** (topic 53) — needs topic 52's own LSN contract directly: the analysis, redo, and undo passes are each built entirely on top of being able to tell, from a page's and a record's own LSN, whether a change still needs replaying. Measures a real recovery that produces a correct, no-partial-commit state regardless of when the crash happened.
3. **Group commit and commit latency** (topic 54) — needs topic 52's own durability point directly: group commit is a policy for how many transactions' log records get flushed together before each one's own durability point is reached. Measures real commit latency against batch size, and names what asynchronous commit gives away.

*(The chapter's lab — a real single-file WAL with length-prefixed, checksummed records, crashed deliberately at two different points, with recovery proven never to expose a partial commit, then group commit added and p99 commit latency plotted against batch size — is not a reel; it stays in the syllabus as a lab exercise, exercising all three of this chapter's topics together rather than introducing a new tested claim of its own.)*

## A.3 The running example: one real WAL, built and measured three ways

Self-contained per topic (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–19's conventions.

- **Topic 52** builds a real, minimal write-ahead log: length-prefixed, checksummed records, each carrying its own LSN, appended to a log and only then applied to an in-memory page carrying its own LSN. Measures that a record whose LSN the page's own LSN already covers is correctly skipped on redo (idempotence), and that a page deliberately torn mid-write is caught and fixed by a full-page write rather than silently misread.
- **Topic 53** builds a real, minimal ARIES-style recovery over a log containing a mix of committed and uncommitted transactions: an analysis pass locating the right starting point, a redo pass reapplying every change whose durability point was reached, and an undo pass reversing every uncommitted change using compensation log records, with a fuzzy checkpoint bounding how far back the analysis pass needs to scan. Measures that recovery, run after a crash injected at several different points in the log, always produces a state with no partial commit visible.
- **Topic 54** builds a real leader/follower group-commit implementation: several callers' commit requests are batched by a leader thread into one flush. Measures real commit latency against batch size on the same workload, and measures the real latency an asynchronous commit (acknowledging before the flush) gives up durability to buy.

Every number and outcome must come from the topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). No topic in this chapter needs root access or special hardware; a WAL here is a length-prefixed, checksummed in-process log file, and a crash is simulated by truncating or corrupting that file deliberately between writes, not by actually killing the process.

## A.4 Terms and notation (continuing Chapters 1–19's vocabulary)

Everything in Chapters 1–19 §A.4 still applies. This chapter adds:

- **Write-ahead rule**: a durable log record describing a change must reach its own durability point before the data page that change touches can be trusted after a crash.
- **Log Sequence Number (LSN)**: a monotonically increasing identifier stamped on both a log record and the page it modifies, letting recovery compare `page.lsn >= record.lsn` to decide, without ambiguity, whether a redo record still needs applying.
- **Physical / logical / physiological logging**: three different granularities for what a log record actually describes — a page's own raw bytes, an operation's own intent, or a hybrid naming the page and the logical operation on it.
- **Torn page**: a page left in a state that mixes its old and new contents because a crash interrupted a write partway through; fixed by writing (and recovering from) a full copy of the page, or an equivalent doublewrite buffer, rather than trusting a partial write.
- **Analysis / redo / undo pass**: the three passes of ARIES-style recovery — finding where recovery needs to start, reapplying every durable-but-unapplied change, and reversing every change a transaction began but never committed.
- **Compensation log record (CLR)**: a log record written during undo itself, so that undo's own work survives a second crash without being undone twice.
- **Fuzzy checkpoint**: a checkpoint taken without stopping the system, bounding how far back the analysis pass ever needs to scan.
- **Steal / no-force (buffer policy)**: "steal" permits an uncommitted transaction's dirty page to be written back before commit; "no-force" permits a committed transaction's dirty page to stay unwritten after commit. ARIES assumes both, for performance; a simpler no-steal, redo-only design (typical of LSM engines) needs neither.
- **Group commit**: batching several transactions' log records into one flush, trading a small added latency for less flush contention.
- **Commit latency vs. execution time**: the time a caller waits for its own commit to be acknowledged is not the same number as the time its transaction took to execute; p99 commit latency can be dominated entirely by flush contention.
- **Asynchronous commit**: acknowledging a commit before its log record has actually reached its own durability point, trading durability for latency.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "log first, then trust the page" for the write-ahead rule; "a number that says how far along a change is" for an LSN; "a page caught half-written by a crash" for a torn page; "finding where to start, then redoing, then undoing" for the three recovery passes; "a note written while undoing, so undoing itself survives a second crash" for a compensation log record; "a checkpoint taken without ever stopping the system" for a fuzzy checkpoint; "batching several commits into one flush" for group commit; "promising a commit before it's actually durable" for asynchronous commit.

## A.5 Visual language (continuing Chapters 1–19's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list and the page-layout-strip/slot-to-offset-arrow glyphs Chapter 19 introduced, reused where relevant. This chapter adds:

- **A log-and-page LSN pair**: two small labeled boxes, one for a log record's own LSN and one for a page's own LSN, with the comparison between them shown directly.
- **A three-pass sweep**: a single horizontal strip divided into three labeled segments (analysis, redo, undo), matching ARIES's own three-pass structure, in the same visual family as Chapter 19's page-layout strip.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–19 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 4, title: 'Storage-Engine Internals' }` and `chapter: { number: 20, title: 'Write-Ahead Logging and Crash Recovery', section: '20.1' }`. A cargo crate under `examples/` is used; no root access or special hardware is needed in this chapter, since a crash is simulated by deliberately truncating or corrupting an in-process log file, not by killing the process.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–19's own declared list. Chapters 1–19's *introduced* ids this chapter draws on directly: `buffer-pool-pin-evict-contract` (Chapter 19); `wal-batched-flush-points`, `fsync-file-and-directory-durability`, `fsyncgate-failure-is-not-retryable` (Chapter 15). A topic in this chapter lists in `uses` only the ones it actually relies on.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `write-ahead-lsn-redo-idempotence` | 52 | A log record's own durability point must precede trusting the page it describes; comparing a page's own LSN against a record's own LSN makes redo safe to repeat. |
| `aries-steal-no-force-recovery` | 53 | ARIES-style recovery's analysis, redo, and undo passes, using compensation log records, recover a correct state under a buffer policy that permits writing back uncommitted pages and not forcing committed ones. |
| `group-commit-batched-durability` | 54 | Batching several transactions' log records into one flush trades a small added latency for less flush contention, and is why commit latency and execution time are different numbers. |

## A.8 Bridges and handoffs

- **52** bridges from Chapter 19's own real handoff (this chapter's own first sentence names it directly: Chapter 19 closed on a buffer pool that can evict a dirty page at any time; this chapter is about what happens if the process or machine dies before that write reaches disk) and continues Chapter 15's own `wal-batched-flush-points`, building the actual flush-point mechanism that topic measured from the outside. Hands to 53: "A log record and a page that each carry their own LSN are enough to tell whether a change still needs replaying; the next question is what a real recovery does with that, across a log containing both committed and uncommitted work."
- **53** bridges from 52's own handoff directly, building the real analysis/redo/undo recovery on top of the LSN contract. Hands to 54: "A correct recovery says nothing yet about how expensive making a transaction durable in the first place actually is, or what it costs to make that cheaper."
- **54** bridges from 53's own handoff directly, measuring the real cost of durability and how batching reduces it. Hands off to Chapter 21 (B-Trees, Page Splits, and Range Scans): "A durable, recoverable log says nothing yet about how a single record is actually found among billions without scanning every page; that needs a real, crash-safe index structure."

## A.9 Primary sources to start from (each topic must re-fetch and verify)

- The PostgreSQL Global Development Group, "Write-Ahead Logging (WAL)," the PostgreSQL documentation, for the write-ahead rule, LSNs, and full-page writes.
- The PostgreSQL Global Development Group, "Reliability and the Write-Ahead Log," the PostgreSQL documentation, for torn-page protection and checkpointing.
- Mohan et al., "ARIES: A Transaction Recovery Method," the original ARIES paper, for the analysis/redo/undo passes, compensation log records, and fuzzy checkpoints.
- MySQL/InnoDB's own documentation on the doublewrite buffer, for the alternative torn-page fix named directly by the syllabus.
