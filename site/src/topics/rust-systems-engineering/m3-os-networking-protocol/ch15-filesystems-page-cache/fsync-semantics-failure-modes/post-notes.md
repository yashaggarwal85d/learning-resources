---
title: "fsync semantics and failure modes"
---

## Outcomes

- Measure that `File::sync_all()` and `File::sync_data()` genuinely make two different real syscalls (`fsync` and `fdatasync`), confirmed directly via `strace`.
- Measure that fsyncing a file's own fd and fsyncing its parent directory's fd are two genuinely separate real syscalls, confirmed the same way.
- Measure that the write-temp + fsync + rename + fsync-dir atomic-replace pattern never exposes a half-written file to a real, concurrently reading thread, across many real replacements.
- State, from Rebello et al.'s own USENIX ATC 2020 findings and PostgreSQL's own documented fsyncgate incident, why retrying a failed `fsync` can silently lie about durability, and why the fix is to crash and recover from a WAL instead.

## Internals

The `sync_all`-versus-`sync_data` claim is confirmed via `strace` specifically because Rust's own documentation only describes behavior, not which real syscall implements it; a kernel or libc change could in principle alter that mapping without changing the documented contract, which only an executed trace can catch. The directory-fsync example opens the directory itself as a `File` specifically to get a real file descriptor to fsync, rather than relying on any higher-level API, because the man page's own claim is specifically about a file descriptor for the directory. The atomic-replace example's reset step — going back from the long content to the short content — uses the exact same write-temp-fsync-rename sequence as the forward step, not a plain overwrite; an early draft used a plain overwrite for the reset and it produced real partial reads. The bug was in the test's own reset step, not in the atomic-replace pattern itself — and that finding is itself evidence for why the full sequence matters everywhere, not just on the interesting half.

## In production

The fsyncgate incident's lesson is not that fsync is unreliable in general; it is that a single failure permanently changes what a subsequent retry can observe, because the file system's own internal bookkeeping (the dirty bit) was already updated by the failed attempt — a specific, narrow claim, quite different from a vague warning that fsync "can fail." This topic deliberately does not reproduce fsyncgate's own `EIO` injection in its executed examples, because the fault-injection tooling the paper used (device-mapper's `dm-flakey`/`dm-error`) needs root-level access this container's sandbox does not grant; the claim is instead sourced directly from the paper's own already-published, already-reproduced findings. `RWF_ATOMIC` is covered only by quoting its own documented constraints, never by an executed example, for the same reason: it requires Linux 6.11+ and specific hardware support this container's own kernel and virtual block device cannot be assumed to provide.

## The frontier

This topic's three measured or quoted behaviors are not three unrelated fsync quirks; each one exposes a different gap between what a call's name suggests it promises and what it actually, narrowly covers. This topic builds directly on topic 39's own buffered-versus-direct framing, since `fsync` and `fdatasync` only matter at all on the buffered path topic 39 already distinguished — a file opened and written entirely through `O_DIRECT` has no dirty page cache entries for fsync to flush in the first place. This topic deliberately stops short of measuring how much less I/O a batched WAL costs compared to fsyncing every update, even though the atomic-replace example already demonstrates one correct pattern, because quantifying that reduction is specifically the next topic's own scoped claim.

## Where this goes next

Fsyncing correctly is necessary, but fsyncing every single small update is not what any real system actually does — the next question is how much less I/O a system can get away with, and still be correct.
