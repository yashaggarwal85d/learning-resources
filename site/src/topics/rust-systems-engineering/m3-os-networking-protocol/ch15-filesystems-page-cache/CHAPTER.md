# Chapter 15 — Filesystems, Page Cache, Direct I/O, and Durability (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 3, *OS, Networking, and Protocol Layer* (its third chapter — Chapters 13, epoll and Readiness-Driven Networking, and 14, io_uring and Submission-Completion Queues, are both marked `*(skipped)*` in full and get no reels, per `syllabus/review-notes/rust-systems-engineering-cuts.md`). Chapter 15 has one section, 15.1, with three full topics; its own lab exercise (a journaled file format, crashed at four write/flush stages) is not a reel, per `CLAUDE.md`'s convention. Planned 2026-10-23, in one `/make-topic` session. Previous chapter: Chapter 12, *Virtual Memory, mmap, Page Faults, and Memory Mappings* (one topic live: mmap versus an owned buffer pool).

This file is the contract the chapter's three topics build to. Do not edit it once a topic is in progress; record any unavoidable departure under that topic's `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 12's own handoff left the question open at exactly the right place: Chapter 12 measured what mapping a file costs against the alternative most real systems choose — an owned buffer pool — but it never asked how that owned buffer pool's own writes actually become durable, or what a normal, unmapped `read`/`write` call costs that `O_DIRECT` was built to remove. This chapter answers both. Most I/O in a real system goes through the page cache by default: a `write` returns as soon as the kernel has copied the bytes into a dirty page, and the actual write-back to disk happens later, on the kernel's own schedule, smoothed by readahead on reads and dirty-page throttling on writes. `O_DIRECT` bypasses that path entirely, in exchange for the same hard alignment constraints Chapter 12 already measured — and `posix_fadvise` sits between the two extremes, a hint that shapes the buffered path's own behavior without bypassing it. None of this says anything about durability on its own: a `write` that returns successfully, buffered or not, is not yet on stable storage, and a real system that assumes otherwise is wrong in a way that only shows up after a crash. Getting a file's data durable means fsyncing the file and, after a create or rename, its parent directory too — and after PostgreSQL's own 2018 "fsyncgate" incident, the uncomfortable fact that a failed `fsync` can silently drop the very dirty pages it was supposed to flush, so retrying is not a safe response; the only safe response is treating the failure as a crash and recovering from a write-ahead log. Real systems don't fsync every small update — they batch into a WAL with its own, far less frequent flush points, and that batching is itself a measurable thing: `strace`, `perf`, and tools like `biolatency` show exactly when and how often a flush actually reaches the device.

By the end of the chapter the learner can: state precisely what buffered I/O's default path does differently from `O_DIRECT` (readahead, dirty-page throttling, the alignment constraints direct I/O trades for bypassing all of it) and use `posix_fadvise` to hint the buffered path without leaving it; explain why a successful `write`, and even a successful `fsync` on just the file, is not sufficient for durability (the parent directory's own metadata must be fsynced too, and the write-temp + fsync + rename + fsync-dir pattern exists precisely to make a replace atomic against a crash at any point), and why fsyncgate means a failed `fsync` must be treated as evidence of corruption to recover from a WAL, never as a prompt to retry; and measure, directly, how a WAL's own batched flush points reduce the per-write durability cost real systems would otherwise pay one fsync at a time.

## A.2 The order of ideas, and why

1. **Buffered versus direct I/O** (topic 39) — builds directly on topic 38's own direct-I/O alignment measurement (Chapter 12), extending it into a genuine two-path comparison: the same file, read and written through the default buffered path (with its own readahead and dirty-page throttling) and through `O_DIRECT`, plus `posix_fadvise`'s own real effect on the buffered path. Needs the alignment-tradeoff framing `rust.mmap-versus-owned-buffer` already introduced; adds nothing about durability yet, which is deliberately deferred to topic 40.
2. **fsync semantics and failure modes** (topic 40) — needs topic 39's own buffered/direct distinction (an `fsync` matters most on the buffered path, since `O_DIRECT` writes already bypass the cache it flushes) and introduces the chapter's real subject: a successful `write` is not a durable one. Measures the file-plus-directory fsync requirement directly, the write-temp + fsync + rename + fsync-dir pattern surviving a simulated crash at each stage, and fsyncgate's own documented failure-handling consequence (a failed fsync means recover from the WAL, not retry).
3. **WAL flush points and I/O measurement** (topic 41) — needs topic 40's own fsync-cost framing directly; measures that a WAL's own explicit, batched flush points cost real, measurably less I/O than an fsync per small update, using the same measurement tools (`strace`, timing, device-level counters where the container permits) the syllabus names. Hands off to Chapter 16 (TCP Sockets, Framing, Partial I/O, and Backpressure): this chapter was about a process getting its own data durably onto its own disk; the next one is about getting bytes reliably to another process entirely, over a connection that offers none of a filesystem's guarantees.

*(The chapter's lab — a journaled file format, crashed at four distinct write/flush stages, with and without an injected fsync error via `dm-flakey`/`dm-error` — is not a reel; it stays in the syllabus as a lab exercise, exercising all three of this chapter's topics together rather than introducing a new tested claim of its own.)*

## A.3 The running example: one real file, pushed through both paths and crashed on purpose

Self-contained per topic (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–12's conventions.

- **Topic 39** opens one real file both ways: through `std::fs::File`'s normal buffered path, and through `O_DIRECT` (as Chapter 12 already did), measuring real timing/behavior differences across repeated sequential reads (readahead's own effect) and real `posix_fadvise(POSIX_FADV_DONTNEED)` demonstrably dropping cached pages the kernel would otherwise have kept, checked via `/proc/<pid>/smaps` or `/proc/sys` cache-size deltas the same way topic 38 measured residency.
- **Topic 40** writes a real file, fsyncs it, and separately fsyncs (or doesn't) its parent directory, then simulates a crash by starting a fresh process and checking what's actually observable; implements the write-temp + fsync + rename + fsync-dir atomic-replace pattern directly and demonstrates a reader never observing a half-written file; measures `File::sync_all` versus `sync_data`'s real, documented difference (the latter may skip syncing metadata that doesn't affect a subsequent read, such as mtime).
- **Topic 41** builds a tiny WAL writer that batches several logical updates into one flush point, and measures the real number of `fsync`/`write` syscalls (via `strace -c` or a syscall counter) against a naive implementation that fsyncs after every single update — a real, measured reduction, not an assumed one.

Every number and outcome must come from the topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). These topics are Unix-specific like Chapters 11–12's; where the container's own filesystem or kernel doesn't support a measurement a topic would otherwise want (e.g. `RWF_ATOMIC`, which needs Linux 6.11+ and hardware support neither this container nor most real disks reliably have), the topic's `OUTLINE.md` must record that constraint under "Changes from the chapter plan" and adjust the measured claim to what the container can actually prove, quoting the documented behavior directly instead of asserting a number that was never genuinely observed.

## A.4 Terms and notation (continuing Chapters 1–12's vocabulary)

Everything in Chapters 1–12 §A.4 still applies. This chapter adds:

- **Readahead**: the kernel speculatively reading ahead of a sequential access pattern on the buffered path, to hide I/O latency before the application asks for the next block.
- **Dirty-page throttling**: the kernel slowing a writer down once too many dirty pages are queued for write-back, so memory pressure from buffered writes stays bounded.
- **`posix_fadvise`**: a hint, not a guarantee, that tells the kernel how an application intends to access a file (sequential, random, won't need again), shaping readahead and cache retention on the buffered path without bypassing it.
- **Durability (file plus directory)**: data is not safely on disk until both the file's own data and, after a create or rename, its parent directory's metadata have been fsynced — a reader after a crash can otherwise see a file that doesn't exist yet, even though its data was written.
- **The atomic-replace pattern**: write to a temp file, fsync it, rename over the target, fsync the directory — the only sequence that leaves no window where a crash can expose a half-written file under the real name.
- **Fsyncgate**: PostgreSQL's 2018 discovery that a failed `fsync` on Linux can mean the kernel already dropped the dirty pages it couldn't write — so retrying doesn't recover them; the only safe response is treating the failure as corruption and recovering from a WAL.
- **WAL flush point**: a deliberate, batched point at which a write-ahead log is fsynced, chosen to be far less frequent than one fsync per logical update.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "reading ahead of you, before you ask" for readahead; "a hint, not a promise" for `posix_fadvise`; "the file's bytes, and the folder's own record that the file exists" for file-plus-directory durability; "write the copy, make it real, then make the folder agree" for the atomic-replace pattern; "a failure that means the data might already be gone, not a failure to try again" for fsyncgate; "one flush for many changes, not one flush per change" for a WAL flush point.

## A.5 Visual language (continuing Chapters 1–12's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list (per Chapter 11's own established fix) and the alignment-gate glyph Chapter 12 introduced, reused where relevant. This chapter adds:

- **A durability ledger**: two rows — "file data" and "directory metadata" — each shown resident or flushed, used once for the file-plus-directory durability claim.
- **A crash line**: a vertical marker dropped onto a sequence of steps (write temp, fsync, rename, fsync directory), showing which states survive a crash landing at each point.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–12 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 3, title: 'OS, Networking, and Protocol Layer' }` and `chapter: { number: 15, title: 'Filesystems, Page Cache, Direct I/O, and Durability', section: '15.1' }`. A cargo crate under `examples/` is used, with `libc` for any raw syscall (`posix_fadvise`, `fsync`, `fdatasync` aren't all exposed directly by std); continuing the `sys.platform != 'win32'` guard from Chapters 11–12.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–12's own declared list. Chapters 1–12's *introduced* ids this chapter draws on directly: `fd-as-kernel-handle`, `io-safety-ownership-types`, `cloexec-default-and-leaks` (Chapter 11); `direct-io-alignment-tradeoff`, `mmap-double-caching` (Chapter 12, `rust.mmap-versus-owned-buffer`). A topic in this chapter lists in `uses` only the ones it actually relies on.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `buffered-io-readahead-throttling` | 39 | The default buffered path's own readahead and dirty-page-throttling behavior, and `posix_fadvise`'s role as a hint that shapes it without bypassing it. |
| `fsync-file-and-directory-durability` | 40 | A write is durable only once both the file's own data and, after a create or rename, its parent directory's metadata are fsynced — and the atomic-replace pattern (write-temp, fsync, rename, fsync-dir) is the only sequence with no crash window exposing a half-written file. |
| `fsyncgate-failure-is-not-retryable` | 40 | A failed `fsync` can mean the kernel already dropped the dirty pages it couldn't write; the only safe response is treating it as corruption and recovering from a WAL, never retrying. |
| `wal-batched-flush-points` | 41 | A write-ahead log's own deliberate, batched flush points cost real, measurably less I/O than fsyncing every small update individually. |

## A.8 Bridges and handoffs

- **39** bridges from Chapter 12's own real handoff (this chapter's own first sentence names it directly: what mapping a file costs, measured against the owned buffer pool most real systems choose) and extends topic 38's own direct-I/O measurement into a genuine two-path comparison. Hands to 40: "The buffered path and direct I/O both eventually return from `write` — neither one, on its own, says anything about whether those bytes would survive a crash right now."
- **40** bridges from 39's own handoff directly and introduces durability as this chapter's real subject. Hands to 41: "Fsyncing correctly is necessary, but fsyncing every single small update is not what any real system actually does — the next question is how much less I/O a system can get away with, and still be correct."
- **41** bridges from 40's own handoff directly, closing the chapter. Hands off to Chapter 16 (TCP Sockets, Framing, Partial I/O, and Backpressure): "This chapter was about a process getting its own data durably onto its own disk. The next one is about getting bytes reliably to another process entirely, over a connection that offers none of a filesystem's guarantees."

## A.9 Primary sources to start from (each topic must re-fetch and verify)

- The Linux man-pages Project, `posix_fadvise(2)` / `fadvise(2)`, for the kernel's own documented hint semantics.
- The Linux man-pages Project, `fsync(2)`, for the kernel's own documented durability guarantee (and what it does not cover).
- Rebello et al., "Can Applications Recover from fsync Failures?" (USENIX ATC 2020), for fsyncgate's own documented consequence and the recovery-from-WAL recommendation.
- The Rust Project, `std::fs::File::sync_all` and `sync_data`, for their own documented difference.
- The Linux man-pages Project, `pwritev2(2)` section on `RWF_ATOMIC` (Linux 6.11+), for torn-write prevention's own documented hardware requirement.
