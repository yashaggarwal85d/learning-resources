# Outline: WAL flush points and I/O measurement (`rust.wal-flush-points-i`)

Chapter 15, topic 41 (third and last of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Measure that fsyncing after every single small update makes exactly one real `fsync()` syscall per update, confirmed directly via `strace`.
2. Measure that batching those same updates into deliberate, far-less-frequent WAL-style flush points makes a dramatically smaller number of real `fsync()` syscalls for the identical writes, confirmed the same way.
3. Measure that the batched approach is also dramatically faster in real wall-clock time, for the identical writes, because most of them never wait on a real `fsync()` at all.
4. State, from PostgreSQL's own documentation and the Linux kernel's own documentation, why a real WAL amortizes durability cost across many transactions, and why a volatile device write cache needs the kernel's own forced-flush/FUA mechanisms to make any of this genuinely durable.

## Changes from the chapter plan

This container has no root or device-mapper access, so the device-level counters `biolatency`/`bpftrace` would use, and any hardware check of a real write cache's volatile-vs-FUA behavior, are not reproducible here — consistent with topic 40's own precedent for fsyncgate's `EIO` injection. The two claims this topic measures directly (the real fsync syscall count and the real wall-clock time, both via `strace` and `Instant`, exactly as `CHAPTER.md` §A.3 planned) need no root access and are measured directly; the volatile-write-cache and FUA material is quoted from the Linux kernel's own documentation instead of measured.

## Reel steps (storyboard)

1. **"A thousand small writes to a real log file, each followed immediately by a real fsync. How many real fsync syscalls does that actually make?"** (predict, hook) — `fig`: a loop of 1000 writes, each followed by `f.sync_all()`, traced with strace. Options: fewer than 1000, since the kernel can coalesce some / exactly 1000 (correct) / more than 1000, since fsync can issue multiple real syscalls.
2. **"Measured: a thousand writes, each followed by its own fsync, made exactly one thousand real fsync syscalls — confirmed directly by strace, not assumed from the loop"** — `fig`: `fsync_per_update`'s real, executed, traced output. NO takeaway (the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64).
3. **"Write those same thousand records, but fsync only once every fifty records, plus one final flush at the end. How many real fsync syscalls does that make now?"** (predict) — `fig`: the same 1000 writes, flushed every 50, traced. Options: about 1000 still, since every write eventually needs flushing / a small, fixed number, close to one flush per batch (correct) / zero, since the final flush covers everything.
4. **"Measured: the exact same thousand writes, flushed every fifty records plus a final flush, made twenty-one real fsync syscalls — not a thousand"** — `fig`: `fsync_batched_flush_points`'s real, executed, traced output. Takeaway: "Batching writes into deliberate flush points cuts the real number of fsync calls by close to the batch size, not by some vague amount."
5. **"Same comparison, but timed instead of counted: does cutting the fsync count also cut the real wall-clock time, by roughly the same factor?"** (predict) — `fig`: the same two binaries, timed with `Instant` instead of traced. Options: no, since each individual write still costs the same either way / yes, by roughly the same large factor the fsync count dropped by (correct) / only on a fast disk; it would reverse on a slow one.
6. **"Measured: the per-update version took far longer, in real wall-clock time, than the batched version — for the identical thousand writes"** — `fig`: the measured millisecond totals for both binaries, side by side. Takeaway: "Most of the time in fsync-per-write isn't the writes at all — it's waiting on a syscall a batched flush point would have skipped."
7. **"PostgreSQL's own documentation makes a specific claim about why a WAL helps at all. What does it actually say the WAL avoids flushing?"** (predict) — `fig`: the WAL-intro documentation's own text. Options: it avoids flushing the WAL file itself, only the data files / it avoids flushing every data file the transaction changed, needing only the WAL file flushed (correct) / it avoids flushing anything, relying entirely on the write cache.
8. **"The documentation's own words: using WAL means only the WAL file needs to be flushed to guarantee a transaction is committed, rather than every data file the transaction changed — and under load, one flush can cover many transactions at once"** — `fig`: the WAL-intro and WAL-configuration quotes, shown directly. NO takeaway (a connecting step restating the documented finding directly, not a new measured claim).
9. **"None of this flushing means anything if the disk itself lies about it. What does a volatile write cache actually do, and what forces it to tell the truth?"** — `fig`: the kernel's own write-back-cache-control documentation, quoted directly: a volatile cache signals completion before data is actually non-volatile, and `REQ_FUA` is what forces a request's completion signal to wait for that real write. Takeaway: "A flush that trusts a volatile write cache's own completion signal isn't done until something forces that cache to tell the truth."
10. **Recap** — fsyncing every update and batching into WAL-style flush points make the identical writes durable, but the batched approach made 21 real fsync syscalls instead of 1000, and was dramatically faster in real wall-clock time for it; PostgreSQL's own documentation explains why batching works at all (one flush can cover many transactions' worth of changes); and none of it is real durability until a forced-flush or FUA mechanism makes a volatile write cache actually tell the truth. Handoff: this chapter was about a process getting its own data durably onto its own disk; the next one is about getting bytes reliably to another process entirely, over a connection that offers none of a filesystem's guarantees.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 4 (cutting the fsync count by batching is not approximate — it drops to a small, specific number close to the batch count, not "somewhat fewer").
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| Using WAL results in a significantly reduced number of disk writes, because only the WAL file needs to be flushed to disk to guarantee that a transaction is committed, rather than every data file changed by the transaction | PostgreSQL docs, `wal-intro.html` (quoted) |
| when the server is processing many small concurrent transactions, one fsync of the WAL file may suffice to commit many transactions | PostgreSQL docs, `wal-intro.html` (quoted) |
| Normally, WAL buffers should be written and flushed by an XLogFlush request, which is made, for the most part, at transaction commit time to ensure that transaction records are flushed to permanent storage | PostgreSQL docs, `wal-configuration.html` (quoted) |
| the purpose of commit_delay is to allow the cost of each flush operation to be amortized across concurrently committing transactions | PostgreSQL docs, `wal-configuration.html` (quoted) |
| many storage devices come with volatile write back caches, signaling I/O completion before data has actually hit non-volatile storage | Linux kernel docs, `writeback_cache_control.html` (quoted) |
| the REQ_FUA flag makes sure I/O completion for a request is only signaled after the data has been committed to non-volatile storage | Linux kernel docs, `writeback_cache_control.html` (quoted) |
| a per-update fsync over 1000 small writes makes exactly 1000 real fsync syscalls, confirmed directly via strace | `examples/runtime-demo/src/fsync_per_update.rs` (executed, measured) |
| batching the same 1000 writes into a flush every 50 records plus a final flush makes exactly 21 real fsync syscalls, confirmed directly via strace | `examples/runtime-demo/src/fsync_batched_flush_points.rs` (executed, measured) |
| the batched approach is also dramatically faster in real wall-clock time for the identical 1000 writes | both binaries, timed directly with `Instant` (executed, measured) |

## Concept ledger

- `introduces`: `wal-batched-flush-points` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `fsync-file-and-directory-durability`, `fsyncgate-failure-is-not-retryable`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Fsyncing correctly is necessary, but fsyncing every single small update is not what any real system actually does — the next question is how much less I/O a system can get away with, and still be correct."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter was about a process getting its own data durably onto its own disk. The next one is about getting bytes reliably to another process entirely, over a connection that offers none of a filesystem's guarantees."
