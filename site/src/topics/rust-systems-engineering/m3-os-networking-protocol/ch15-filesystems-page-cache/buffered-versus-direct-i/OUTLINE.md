# Outline: Buffered versus direct I/O (`rust.buffered-versus-direct-i`)

Chapter 15, topic 39 (first of three). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Measure a real `readahead()` call genuinely populating the page cache for a file whose pages had been dropped, confirmed directly via `mincore()` on a mapping that never reads a byte itself.
2. Measure a real `posix_fadvise(POSIX_FADV_DONTNEED)` call genuinely evicting pages `readahead()` had just brought in, confirmed the same way.
3. Measure that a normal buffered read genuinely populates the page cache, and the exact same read through `O_DIRECT` genuinely never does.
4. State why `posix_fadvise`'s advice is documented as non-binding, and why dirty pages specifically resist `POSIX_FADV_DONTNEED` until they are flushed first.

## Changes from the chapter plan

None. `CHAPTER.md` §A.3 scopes this topic to measuring readahead, `posix_fadvise`, and the buffered-versus-direct cache-residency difference directly via `mincore()` — built exactly that way. One refinement discovered while building: `posix_fadvise(POSIX_FADV_DONTNEED)` does not evict a file's pages immediately after writing it, because they are still dirty; the man page's own documented caveat ("any unwritten dirty pages will not be freed... call fsync(2) ... first") turned out to matter for making every measurement start from a clean, deterministic baseline, so every example's helper fsyncs before the first `DONTNEED` call.

## Reel steps (storyboard)

1. **"A file's pages have genuinely been dropped from the page cache. Call the real readahead() syscall on it. Does that alone bring the pages back in, or does a read still have to happen first?"** (predict, hook) — `fig`: `libc::readahead(fd, 0, len)` called against a file confirmed to have zero resident pages. Options: nothing changes until a real read happens / readahead() alone genuinely brings every page in (correct) / only the first page comes in, the rest wait for an actual read.
2. **"Measured: before readahead, none of the file's pages were resident; immediately after it, every single one was — with no read() call in between"** — `fig`: `readahead_populates_the_page_cache.rs`'s real, executed output. NO takeaway (this is the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64 — moved to a later step instead).
3. **"Those same freshly-cached pages: call posix_fadvise with DONTNEED on them. Does that hint alone genuinely evict them, or is it merely advisory and ignored?"** (predict) — `fig`: `libc::posix_fadvise(fd, 0, len, POSIX_FADV_DONTNEED)` called against the now-fully-resident file. Options: it's only advisory — the kernel is free to ignore it / it genuinely evicts every one of those pages (correct) / it evicts pages only once memory pressure appears.
4. **"Measured: every one of those pages was resident right after readahead, and not one of them was resident right after the real DONTNEED call"** — `fig`: `fadvise_dontneed_evicts_resident_pages.rs`'s real, executed output. Takeaway: "A hint the kernel documents as non-binding can still have a completely real, measured effect once you actually call it."
5. **"Read the same amount of data two real ways: once through a normal buffered read, once through O_DIRECT. Does O_DIRECT's read end up resident in the page cache too, or not?"** (predict) — `fig`: the same byte count read via `libc::read` and via `libc::pread` on an `O_DIRECT` fd. Options: both end up resident, direct I/O just skips the speed-up / only the buffered read ends up resident (correct) / neither ends up resident, since both are raw syscalls.
6. **"Measured: the buffered read left every single page resident in the cache, and the exact same read through O_DIRECT left none resident at all"** — `fig`: `direct_io_never_populates_the_page_cache.rs`'s real, executed output. Takeaway: "O_DIRECT isn't a faster buffered read — it's a read that the page cache never sees happen at all."
7. **"If DONTNEED can't evict a file's pages right after it's written, what's actually stopping it?"** (predict) — `fig`: the man page's own documented caveat about dirty pages. Options: the kernel simply hasn't scheduled the eviction yet / the pages are still dirty, and DONTNEED only discards clean ones (correct) / DONTNEED never works on a file opened for writing.
8. **"The man page is explicit: any unwritten, dirty page will not be freed by DONTNEED at all — fsync or fdatasync has to write it back first, or the hint simply has nothing clean to discard"** — `fig`: the man page's own documented caveat, quoted directly. NO takeaway (a connecting step restating the documented rationale directly, not a new measured claim).
9. **"Readahead, DONTNEED, and O_DIRECT are the same page cache, pulled three different directions: bring pages in early, push them back out on request, or never let them in to begin with"** — `fig`: the three measured behaviors side by side. Takeaway: "The page cache has exactly one knob three different ways: whether a page is in it, and who decided that."
10. **Recap** — A real readahead() call genuinely brings a dropped file's pages back into the cache before any read happens; a real DONTNEED call genuinely evicts them again once they're clean; and O_DIRECT genuinely bypasses the cache on every read, never populating it at all. Handoff: the buffered path and direct I/O both eventually return from write — neither one, on its own, says anything about whether those bytes would survive a crash right now.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 8 (a hint documented as non-binding, `POSIX_FADV_DONTNEED`, can be blocked outright by something as ordinary as a page still being dirty).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| posix_fadvise's advice is not binding; it merely constitutes an expectation on behalf of the application | `man7.org/linux/man-pages/man2/posix_fadvise.2.html` (quoted) |
| POSIX_FADV_DONTNEED attempts to free cached pages associated with the specified region | `man7.org/linux/man-pages/man2/posix_fadvise.2.html` (quoted) |
| Any unwritten dirty pages will not be freed by DONTNEED; fsync or fdatasync must be called first to release them | `man7.org/linux/man-pages/man2/posix_fadvise.2.html` (quoted) |
| readahead() initiates readahead on a file so that subsequent reads will be satisfied from the cache, not blocking on disk I/O | `man7.org/linux/man-pages/man2/readahead.2.html` (quoted) |
| O_DIRECT tries to minimize cache effects of I/O to and from a file, useful when applications do their own caching | `man7.org/linux/man-pages/man2/open.2.html` (quoted) |
| dirty_ratio is the percentage of available memory at which a process generating disk writes will itself start writing out dirty data | `docs.kernel.org/admin-guide/sysctl/vm.html` (quoted) |
| whenever a file is read, the data is put into the page cache to avoid expensive disk access on subsequent reads | `docs.kernel.org/admin-guide/mm/concepts.html` (quoted) |
| a real readahead() call genuinely brings every page of a dropped file back into residency, measured directly via mincore(), with no read() call | `examples/runtime-demo/src/readahead_populates_the_page_cache.rs` (executed, measured) |
| a real posix_fadvise(DONTNEED) call genuinely evicts every page readahead() had just brought in, measured directly via mincore() | `examples/runtime-demo/src/fadvise_dontneed_evicts_resident_pages.rs` (executed, measured) |
| a normal buffered read genuinely leaves every page resident, and the identical read through O_DIRECT genuinely leaves none resident, measured directly via mincore() on both | `examples/runtime-demo/src/direct_io_never_populates_the_page_cache.rs` (executed, measured) |

## Concept ledger

- `introduces`: `buffered-io-readahead-throttling` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `direct-io-alignment-tradeoff`, `mmap-double-caching`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter's own first sentence names it directly: what mapping a file costs, measured against the owned buffer pool most real systems choose — and this topic extends topic 38's own direct-I/O measurement into a genuine two-path comparison."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "The buffered path and direct I/O both eventually return from write — neither one, on its own, says anything about whether those bytes would survive a crash right now."
