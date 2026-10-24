# Outline: mmap versus an owned buffer pool (`rust.mmap-versus-owned-buffer`)

Chapter 12, topic 38 (the chapter's only topic). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Name the double-caching problem precisely and measure it directly: a mapped file's pages stay resident in the kernel's own page cache while a separate, hand-built application-level cache of the same bytes is also resident, at the same time.
2. Measure direct I/O's real alignment constraint: a misaligned buffer passed to an `O_DIRECT` read fails outright with the kernel's own `EINVAL`, and a buffer aligned to a safe block boundary succeeds.
3. State, from Crotty, Leis & Pavlo's own CIDR 2022 argument, the four concrete failure classes — transactional safety, I/O-stall unpredictability, error handling, and TLB-shootdown cost — that lead most DBMSs to own their own buffer pool instead of mapping a file directly.
4. Identify the real, narrower condition — read-mostly access, no bounded-latency requirement — under which the paper and LMDB's own design agree `mmap` remains the right choice.

## Changes from the chapter plan

None. `CHAPTER.md` §A.3 scopes this topic to one real file measured two genuinely different ways (mapped, and opened with `O_DIRECT`), plus the paper's own four-failure-class argument and its own stated exception — built exactly that way. The container's root filesystem is `ext4` and its block device reports a 512-byte logical block size, so `O_DIRECT` and the 4096-byte alignment used (a safe multiple of any real block size) both work as the plan anticipated; no fallback was needed.

## Reel steps (storyboard)

1. **"Memory-map a file, and also keep a separate, hand-built cache of the same bytes in your own code. Does the mapped file's data end up resident in memory once, or twice?"** (predict, hook) — `fig`: a mapped file next to a hand-built application cache. Options: once — the kernel merges them / twice — both are resident at the same time (correct) / it depends on how large the file is.
2. **"Measured: the mapped file held 8192 KB resident in the kernel's own page cache, and reading the exact same file again into a separate application cache grew the process's resident memory by another 8164 KB"** — `fig`: `mmap_holds_the_same_bytes_twice`'s real, executed output. NO takeaway (this is the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64 — moved to a later step instead).
3. **"Open the same file with O_DIRECT and read it into a buffer that isn't aligned to a block boundary. Does the read quietly degrade, silently succeed, or fail outright?"** (predict) — `fig`: a `pread` call against an `O_DIRECT` fd with a one-byte-offset buffer. Options: it quietly degrades in performance but still works / it fails outright with a specific, clear error (correct) / it silently rounds the buffer up for you.
4. **"Measured: the misaligned read failed outright with the kernel's own EINVAL, and the exact same read with a properly aligned buffer succeeded cleanly"** — `fig`: `direct_io_rejects_misaligned_buffers`'s real, executed output. Takeaway: "Direct I/O removes the double copy only by making every buffer's alignment the caller's own strict responsibility."
5. **"If a mapped page's read genuinely fails — a bad sector, a disk gone missing — does the program get a normal, recoverable error back?"** (predict) — `fig`: a mapped page that the OS cannot actually read. Options: yes, the same Result a normal read would give / no — it can raise SIGBUS and terminate the process outright (correct) / the kernel silently retries until it succeeds.
6. **"The paper's own argument is specific: a dirty mapped page can be written back at a moment the database never chose, a page fault can stall with no promised end, a real I/O error surfaces as a process-killing SIGBUS instead of a Result, and munmap has to interrupt every other thread's TLB just to unmap one region"** — `fig`: the four failure classes, quoted directly from the paper. Takeaway: "Mapping a file trades an explicit Result for four real failure modes most systems can't actually afford."
7. **"Given all four of those costs, is there ever a real system where mapping a file directly is still the right call?"** (predict) — `fig`: LMDB's own design next to the paper's own closing recommendation. Options: no, never in a serious system / only for tiny configuration files / yes — a read-mostly workload with no bounded-latency requirement (correct).
8. **"The paper's own recommendation is exactly that narrow: mapping remains the right call when your working set fits in memory and the workload is read-only — which is precisely the case LMDB is built around"** — `fig`: the paper's own recommendation, quoted directly, next to LMDB's design. NO takeaway (a connecting step restating the documented exception directly, not a new measured claim).
9. **"Double caching, direct I/O's alignment cost, and the paper's own four failure classes are all the same question asked three ways: who decides when a page moves, and does the caller find out if it goes wrong"** — `fig`: the three measured and quoted results side by side. Takeaway: "An owned buffer pool exists because most systems need an explicit answer to a question mmap leaves to the kernel."
10. **Recap** — Mapping a file genuinely holds the same bytes twice once an application keeps its own cache on top; direct I/O genuinely removes that duplication only by making alignment the caller's strict responsibility; and the paper's own four failure classes are why most DBMSs own their buffer pool instead — except in the narrow, read-mostly case LMDB is built around. Handoff: this chapter was about how a process's own memory and files are managed once it already has them open; the next one is about how a process finds out, in the first place, that there's anything to read at all.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 6 (mapping a file doesn't fail the way a normal read does — a real I/O error on a mapped page can terminate the whole process with SIGBUS instead of handing back a `Result`).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| The core issue is that, due to transparent paging, the OS can flush a dirty page to secondary storage at any time, irrespective of whether the writing transaction has committed | Crotty, Leis & Pavlo, CIDR 2022 (quoted) |
| Accessing any mapped page could result in an unexpected I/O stall because the DBMS cannot know whether the page is in memory | Crotty, Leis & Pavlo, CIDR 2022 (quoted) |
| Any code that interacts with mmap-backed memory can produce a SIGBUS that the DBMS must deal with via cumbersome signal handlers | Crotty, Leis & Pavlo, CIDR 2022 (quoted) |
| Unmapping or protecting a mapped region forces the OS to issue an expensive inter-processor interrupt to flush other threads' TLB entries, called a TLB shootdown | Crotty, Leis & Pavlo, CIDR 2022 (quoted) |
| mmap remains a reasonable choice when the working set (or the entire database) fits in memory and the workload is read-only | Crotty, Leis & Pavlo, CIDR 2022 (quoted) |
| A mapped file's pages are genuinely resident in the kernel's own page cache, and a separate application-level cache of the same file genuinely grows resident memory by roughly another copy, measured directly | `examples/runtime-demo/src/mmap_holds_the_same_bytes_twice.rs` (executed, measured) |
| A shared mapping's updates are visible to other processes mapping the same region and are carried through to the underlying file | `man7.org/linux/man-pages/man2/mmap.2.html` (quoted) |
| O_DIRECT tries to minimize cache effects of I/O to and from a file, useful when the application does its own caching, at the cost of real alignment requirements | `man7.org/linux/man-pages/man2/open.2.html` (quoted) |
| Since Linux 2.6.0, O_DIRECT's alignment requirement was relaxed to the logical block size of the block device, typically 512 bytes | `man7.org/linux/man-pages/man2/open.2.html` (quoted) |
| A real O_DIRECT read with a misaligned buffer fails outright with EINVAL, and the same read with an aligned buffer succeeds, measured directly | `examples/runtime-demo/src/direct_io_rejects_misaligned_buffers.rs` (executed, measured) |
| All file-backed memory map constructors are marked unsafe because of the potential for Undefined Behavior if the underlying file is modified in or out of process | `docs.rs/memmap2` (quoted) |

## Concept ledger

- `introduces`: `mmap-double-caching`, `direct-io-alignment-tradeoff`, `owned-buffer-pool-rationale` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `fd-as-kernel-handle`, `io-safety-ownership-types`, `cloexec-default-and-leaks`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter bridges from Chapter 11's own real handoff ('its memory is a kernel handle too — just one so heavily abstracted by the virtual memory system that most code never has to think of it as one at all, until it's mapped directly') and answers it directly: what mapping that memory actually costs, measured against the alternative most real systems actually choose."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter was about how a process's own memory and files are managed once it already has them open. The next one is about how a process finds out, in the first place, that there's anything to read at all."
