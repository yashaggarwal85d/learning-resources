# Outline: File descriptors and I/O safety (`rust.file-descriptors-i-o`)

Chapter 11, topic 36 (first of two). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Measure two file descriptors that refer to the same open file description — one obtained by a real `dup(2)` call — genuinely sharing that description's own read offset.
2. Measure `OwnedFd` genuinely closing its file descriptor on `Drop`, while a `BorrowedFd` taken from a different, still-owned `File` remains completely valid.
3. Measure `std::fs::File` opening with `O_CLOEXEC` set by default, so it does not leak across a real fork+exec, while a file descriptor with that flag explicitly cleared leaks straight into the child.
4. Name `RLIMIT_NOFILE` as the real, enforced ceiling on how many of these handles one process may hold open at once.

## Changes from the chapter plan

None. `CHAPTER.md` §A.3 scopes this topic to a real opened file put through `dup`, `OwnedFd`/`BorrowedFd`, and a real fork+exec via `Command` — built exactly that way.

## Reel steps (storyboard)

1. **"Duplicate a file descriptor with a real dup() call, then read from the original and then the duplicate. Does the duplicate start reading from the beginning of the file, or from wherever the original left off?"** (predict, hook) — `fig`: `libc::dup(original.as_raw_fd())`, then reading each half. Options: it starts over, from the beginning / it continues from exactly where the original stopped (correct) / it depends on which one is read first.
2. **"Measured: the original fd read the first half of the file, and the duplicated fd read exactly the second half — continuing from the shared offset, not restarting"** — `fig`: `dup_shares_the_same_offset`'s real, executed output. NO takeaway (this is the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64 — moved to a later step instead).
3. **"An OwnedFd is dropped. A moment later, something tries a raw syscall on that exact file descriptor number. What happens?"** (predict) — `fig`: `drop(owned);` followed by `libc::fcntl(raw, F_GETFD)`. Options: it still works, the number is just a number / it fails outright — the fd is genuinely gone (correct) / it works only if nothing else opened a new fd in between.
4. **"Measured: after the OwnedFd was dropped, a raw syscall on its fd failed outright with EBADF — while a BorrowedFd taken from a completely different, still-owned file stayed valid the whole time"** — `fig`: `owned_fd_closes_on_drop`'s real, executed output. Takeaway: "An OwnedFd's Drop genuinely closes its file descriptor — a raw syscall on that number afterward fails outright."
5. **"Open the same file twice: once the normal way, once with its close-on-exec flag explicitly cleared. Fork and exec a real child process. Which file descriptor is still open inside it?"** (predict) — `fig`: `Command::new("/bin/sh")...` after clearing `FD_CLOEXEC` on one fd. Options: both are still open in the child / neither is / only the one with close-on-exec explicitly cleared (correct).
6. **"Measured: the normally-opened file descriptor, protected by O_CLOEXEC, never appeared inside the real forked and exec'd child — the one with that flag explicitly cleared leaked straight into it"** — `fig`: `cloexec_default_blocks_the_leak`'s real, executed output. Takeaway: "std opens a file descriptor with O_CLOEXEC set by default — that's exactly what stops it leaking into a forked, exec'd child."
7. **"So why does any of this matter for a real, long-running service?"** (predict) — `fig`: a process genuinely running out of descriptors. Options: a service can open as many file descriptors as it wants, forever / a real kernel limit, RLIMIT_NOFILE, genuinely caps how many it may hold open at once (correct) / only network sockets count toward any limit.
8. **"RLIMIT_NOFILE is a real, enforced ceiling — one greater than the highest file descriptor number a process may ever have open at once"** — `fig`: the kernel's own definition of the limit. NO takeaway (a connecting step naming the real-world stake, not a new measured claim).
9. **"Every one of these mechanisms exists because an fd is a handle into a kernel-side resource, not the resource itself — and a handle can be duplicated, closed, or leaked independently of what it points to"** — `fig`: the three measured behaviours side by side (shared offset, closes on drop, leaks without O_CLOEXEC). Takeaway: "A file descriptor is a handle, not the resource — which is exactly why duplicating, closing, and leaking it are each their own, separately real, event."
10. **Recap** — a duplicated file descriptor genuinely shares its original's offset; an OwnedFd's drop genuinely closes the real resource, while a borrow never can; a normally-opened fd genuinely does not leak across exec, and a leaked one genuinely does. Handoff: a file descriptor's ownership is explicit now — but a file descriptor is cheap compared to the process that holds a whole table of them, and that process has its own, much sharper ownership rule the instant it forks.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 4 (a `BorrowedFd` from an entirely different, still-owned file stays valid even while a dropped `OwnedFd`'s own fd number has gone completely dead — ownership, not fd number, is what decides).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| The dup() system call allocates a new file descriptor that refers to the same open file description as the descriptor oldfd | `man7.org/linux/man-pages/man2/dup.2.html` (quoted) |
| Since the two file descriptors refer to the same open file description, they share file offset and file status flags; if the offset is modified via one, it changes for the other too | `man7.org/linux/man-pages/man2/dup.2.html` (quoted) |
| A real duplicated fd, obtained via dup(), continues reading from exactly where the original fd left off, measured directly | `examples/runtime-demo/src/dup_shares_the_same_offset.rs` (executed, measured) |
| OwnedFd closes the file descriptor on drop, and it is guaranteed that nobody else will close the file descriptor | `docs.rs/std::os::fd::OwnedFd` (quoted) |
| BorrowedFd has a lifetime tied to the thing that owns the fd, and for that lifetime it is guaranteed that nobody will close the file descriptor | `docs.rs/std::os::fd::BorrowedFd` (quoted) |
| After a real OwnedFd is dropped, a raw fcntl call on its exact fd number fails with EBADF, while a BorrowedFd from a separate, still-owned File remains valid, measured directly | `examples/runtime-demo/src/owned_fd_closes_on_drop.rs` (executed, measured) |
| The close-on-exec race this flag exists to close: one thread opening a file descriptor and trying to set its close-on-exec flag at the same time as another thread forks and execs can leak that fd into the child, depending on execution order | `man7.org/linux/man-pages/man2/open.2.html` (quoted) |
| A file descriptor opened the normal way by std::fs::File does not survive into a real forked and exec'd child, while one with its close-on-exec flag explicitly cleared does, measured directly | `examples/runtime-demo/src/cloexec_default_blocks_the_leak.rs` (executed, measured) |
| RLIMIT_NOFILE specifies a value one greater than the maximum file descriptor number that can be opened by a process | `man7.org/linux/man-pages/man2/getrlimit.2.html` (quoted) |
| std::os::fd provides owned and borrowed Unix-like file descriptors, with AsFd as the trait to borrow a file descriptor from an underlying object | `docs.rs/std::os::fd` and `docs.rs/std::os::fd::AsFd` (quoted) |

## Concept ledger

- `introduces`: `fd-as-kernel-handle`, `io-safety-ownership-types`, `cloexec-default-and-leaks` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `drop-trait`, `raii-guard`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "underneath every one of those tasks sits a real kernel handle — a file descriptor, a process, a signal — whose ownership rules this chapter has been quietly assuming the whole time," answered directly: a file descriptor's real ownership rules, made explicit the same way Chapters 1–2 made memory ownership explicit.
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A file descriptor's ownership is explicit now — but a file descriptor is cheap compared to the process that holds a whole table of them, and that process has its own, much sharper ownership rule the instant it forks."
