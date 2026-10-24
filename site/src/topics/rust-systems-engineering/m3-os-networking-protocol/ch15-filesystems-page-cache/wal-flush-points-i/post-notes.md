---
title: "WAL flush points and I/O measurement"
---

## Outcomes

- Measure that fsyncing after every single small update makes exactly one real `fsync()` syscall per update, confirmed directly via `strace`.
- Measure that batching those same updates into deliberate, far-less-frequent WAL-style flush points makes a dramatically smaller number of real `fsync()` syscalls for the identical writes, confirmed the same way.
- Measure that the batched approach is also dramatically faster in real wall-clock time, for the identical writes, because most of them never wait on a real `fsync()` at all.
- State, from PostgreSQL's own documentation and the Linux kernel's own documentation, why a real WAL amortizes durability cost across many transactions, and why a volatile device write cache needs the kernel's own forced-flush/FUA mechanisms to make any of this genuinely durable.

## Internals

The 1000-versus-21 fsync count is not an approximation of a batching ratio; it is the specific, exact arithmetic of flushing every 50th write plus one final flush over 1000 writes (1000/50 = 20, plus the one trailing flush). The timing comparison deliberately reuses the identical write content and identical file-creation pattern between the two binaries, so the only variable that differs between them is how often `sync_all()` is actually called — which is why the wall-clock gap can be attributed specifically to the fsync calls themselves, not to some other difference in the two programs. Both counts were confirmed stable across repeated runs before being written into `examples.py`'s assertions, and the timing assertion deliberately uses a conservative multiplier (5x) rather than the full observed ~30-40x gap, so the claim holds even on a slower or more contended machine than the one that measured it.

## In production

PostgreSQL's own documentation makes a specific, narrow claim: a WAL helps because only the WAL file itself needs to be flushed to guarantee a transaction's durability, not every data file the transaction touched — and under concurrent load, one flush of the WAL file can cover many transactions that committed around the same moment, which is exactly the batching this topic measures directly. None of that flushing is actually durable, though, unless the underlying device genuinely commits the data when the kernel asks it to: a volatile write-back cache can signal completion to the operating system before the data has reached non-volatile storage at all, and the Linux block layer's own `REQ_PREFLUSH`/`REQ_FUA` mechanisms exist specifically to force that signal to wait for the real write, rather than trusting the cache's own optimistic timing.

## The frontier

This topic deliberately does not reproduce the volatile-write-cache or `REQ_FUA` behavior as an executed measurement, because confirming a real device's write-cache honesty, or its FUA support, needs root-level access to raw block-device behavior (queue-depth counters, `biolatency`/`bpftrace`) this container's sandbox does not grant — consistent with topic 40's own precedent for fsyncgate's `EIO` injection. The claim is instead sourced directly from the Linux kernel's own already-published documentation of these exact mechanisms. This topic closes the chapter: fsyncing correctly (topic 40) and knowing how rarely a real system actually needs to pay that cost (this topic) together describe what it takes for a process to get its own data durably onto its own disk.

## Where this goes next

This chapter was about a process getting its own data durably onto its own disk. The next one is about getting bytes reliably to another process entirely, over a connection that offers none of a filesystem's guarantees.
