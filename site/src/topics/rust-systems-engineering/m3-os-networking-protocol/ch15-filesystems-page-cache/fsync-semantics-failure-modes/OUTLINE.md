# Outline: fsync semantics and failure modes (`rust.fsync-semantics-failure-modes`)

Chapter 15, topic 40 (second of three). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Measure that `File::sync_all()` and `File::sync_data()` genuinely make two different real syscalls (`fsync` and `fdatasync`), confirmed directly via `strace`.
2. Measure that fsyncing a file's own fd and fsyncing its parent directory's fd are two genuinely separate real syscalls, confirmed the same way.
3. Measure that the write-temp + fsync + rename + fsync-dir atomic-replace pattern never exposes a half-written file to a real, concurrently reading thread, across many real replacements.
4. State, from Rebello et al.'s own USENIX ATC 2020 findings and PostgreSQL's own documented fsyncgate incident, why retrying a failed `fsync` can silently lie about durability, and why the fix is to crash and recover from a WAL instead.

## Changes from the chapter plan

The lab's own fault-injection tooling (`dm-flakey`/`dm-error`) needs root-level device-mapper access this container does not have, so fsyncgate's own "a failed fsync may drop dirty pages" claim is not reproduced by injecting a real `EIO` here — it is quoted directly from Rebello et al.'s own paper, which already ran that exact fault injection on real file systems and reported its exact findings. Everything else in `CHAPTER.md` §A.3 — the `sync_all`/`sync_data` syscall distinction, the directory-fsync requirement, and the atomic-replace pattern's own crash-safety — is measured directly, not quoted.

## Reel steps (storyboard)

1. **"Call File::sync_all() on a file, and separately call File::sync_data() on another. Do they genuinely make the same real syscall underneath, or two different ones?"** (predict, hook) — `fig`: `f.sync_all()` and `f.sync_data()`, traced with strace. Options: the same syscall either way — sync_data is just a nicer name / two genuinely different real syscalls (correct) / it depends on the filesystem, not the call itself.
2. **"Measured: sync_all() made a real fsync() syscall, and sync_data() made a real, genuinely different fdatasync() syscall — confirmed directly by strace, not by the docs alone"** — `fig`: `sync_demo`'s real, executed, traced output. NO takeaway (this is the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64 — moved to a later step instead).
3. **"fsync a file's own fd, then separately fsync its parent directory's fd. Does the file's own fsync already cover the directory, or are these genuinely two separate operations?"** (predict) — `fig`: `f.sync_all()` then `dir_fd.sync_all()`, traced. Options: the file's own fsync already covers its directory entry / they're genuinely two separate real syscalls, on two different fds (correct) / only needed if the file was newly created, never for an existing one.
4. **"Measured: the file's fsync and the directory's fsync were two real, separate syscalls, on two genuinely different file descriptors"** — `fig`: `directory_fsync_is_a_separate_syscall.rs`'s real, executed output. Takeaway: "A file's own fsync says nothing about its directory entry — that's a second, separate call, on a second, separate handle."
5. **"Replace a file's content two hundred real times using write-temp, fsync, rename, fsync-the-directory — while a separate thread reads that same file as fast as it possibly can. Does that reader ever catch a half-written file?"** (predict) — `fig`: the atomic-replace sequence, racing against a concurrent reader thread. Options: yes, occasionally, since rename takes real time / no — it only ever sees the old content or the new content, never a mix (correct) / only if the new content is much larger than the old.
6. **"Measured: across many tens of thousands of real concurrent reads during two hundred real replacements, the reader never once observed a length that wasn't the old file's or the new file's"** — `fig`: `atomic_replace_never_exposes_a_partial_file.rs`'s real, executed output. Takeaway: "Write-temp, fsync, rename, fsync-the-directory: that whole sequence is what makes a replace atomic against a crash, not just the rename."
7. **"PostgreSQL retried a failed fsync, exactly as its own code had done for twenty years. What actually went wrong?"** (predict) — `fig`: the paper's own account of the 2018 incident. Options: the retry eventually succeeded in writing the missing data / the retry succeeded without writing anything, because the dirty page had already been marked clean (correct) / the retry corrupted a different, unrelated page.
8. **"The paper's own finding is specific: on the file systems it tested, a failed fsync marks the dirty page clean regardless — so a second fsync call finds nothing left to write, succeeds immediately, and PostgreSQL mistook that success for a completed write"** — `fig`: the paper's own account, quoted directly. NO takeaway (a connecting step restating the documented finding directly, not a new measured claim).
9. **"sync_all vs sync_data, a file's fsync vs its directory's fsync, and a failed fsync's retry are all the same question: what, exactly, did that one call actually promise you?"** — `fig`: the three measured/quoted behaviors side by side. Takeaway: "Every one of fsync's surprises comes from the same gap: what a call promises, and what it actually covers."
10. **Recap** — `sync_all` and `sync_data` genuinely make two different real syscalls; a file's fsync and its directory's fsync are genuinely two separate calls the atomic-replace pattern needs both of; and a failed fsync's own retry can succeed without having written anything at all, which is exactly why the fix is to crash and recover from a WAL, never to simply retry. Handoff: fsyncing correctly is necessary, but fsyncing every single small update is not what any real system actually does — the next question is how much less I/O a system can get away with, and still be correct.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 8 (a failed fsync's own retry can report success while having written nothing at all, because the file system already marked the dirty page clean).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| fsync() transfers all modified in-core data of a file to the disk device so that changed information can be retrieved even after a crash | `man7.org/linux/man-pages/man2/fsync.2.html` (quoted) |
| Calling fsync() does not necessarily ensure the directory entry has reached disk; an explicit fsync() on the directory's own fd is needed too | `man7.org/linux/man-pages/man2/fsync.2.html` (quoted) |
| fdatasync() is similar to fsync() but does not flush modified metadata unless needed for a subsequent correct data retrieval | `man7.org/linux/man-pages/man2/fsync.2.html` (quoted) |
| File::sync_all attempts to sync all OS-internal file content and metadata to disk | `doc.rust-lang.org/std/fs/struct.File.html` (quoted) |
| File::sync_data is similar to sync_all except that it might not synchronize file metadata | `doc.rust-lang.org/std/fs/struct.File.html` (quoted) |
| all three tested file systems mark pages clean after fsync fails, rendering application-level retry ineffective | Rebello et al., USENIX ATC 2020 (quoted) |
| when PostgreSQL retried a failed fsync, the second call succeeded without actually writing data, because there were no dirty pages left for the file system to write | Rebello et al., USENIX ATC 2020 (quoted) |
| developers changed PostgreSQL to respond to an fsync error by crashing and restarting without retrying the fsync | Rebello et al., USENIX ATC 2020 (quoted) |
| RWF_ATOMIC's torn-write protection means a power or hardware failure stores all or none of a write's data, never a mix of old and new | `man7.org/linux/man-pages/man2/pwritev2.2.html` (quoted) |
| RWF_ATOMIC's torn-write protection only works with O_DIRECT; buffered writes are not supported | `man7.org/linux/man-pages/man2/pwritev2.2.html` (quoted) |
| sync_all() genuinely makes a real fsync() syscall, and sync_data() genuinely makes a real, different fdatasync() syscall, confirmed directly via strace | `examples/runtime-demo/src/sync_demo.rs` (executed, measured) |
| a file's own fsync and its parent directory's fsync are genuinely two separate real syscalls on two different file descriptors | `examples/runtime-demo/src/directory_fsync_is_a_separate_syscall.rs` (executed, measured) |
| the write-temp + fsync + rename + fsync-dir atomic-replace pattern never exposes a half-written file to a real concurrent reader, across many real replacements | `examples/runtime-demo/src/atomic_replace_never_exposes_a_partial_file.rs` (executed, measured) |

## Concept ledger

- `introduces`: `fsync-file-and-directory-durability`, `fsyncgate-failure-is-not-retryable` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `buffered-io-readahead-throttling`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "The buffered path and direct I/O both eventually return from write — neither one, on its own, says anything about whether those bytes would survive a crash right now."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Fsyncing correctly is necessary, but fsyncing every single small update is not what any real system actually does — the next question is how much less I/O a system can get away with, and still be correct."
