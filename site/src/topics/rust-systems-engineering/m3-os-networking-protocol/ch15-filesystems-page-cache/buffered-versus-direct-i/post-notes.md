---
title: "Buffered versus direct I/O"
---

## Outcomes

- Measure a real `readahead()` call genuinely populating the page cache for a file whose pages had been dropped, confirmed directly via `mincore()` on a mapping that never reads a byte itself.
- Measure a real `posix_fadvise(POSIX_FADV_DONTNEED)` call genuinely evicting pages `readahead()` had just brought in, confirmed the same way.
- Measure that a normal buffered read genuinely populates the page cache, and the exact same read through `O_DIRECT` genuinely never does.
- State why `posix_fadvise`'s advice is documented as non-binding, and why dirty pages specifically resist `POSIX_FADV_DONTNEED` until they are flushed first.

## Internals

Residency in every measurement here is checked via `mincore()` on a freshly created `mmap` that is never read through at all, specifically so the measurement itself cannot be the thing that causes a page to become resident — a read-based check would be measuring its own side effect. The `readahead` measurement specifically confirms zero resident pages beforehand, not merely that the call succeeded, because the claim is that `readahead` alone moves pages into residency; without that baseline, a pre-existing cache hit left over from writing the file could produce the same apparent result. The buffered-versus-direct comparison deliberately uses two separate files rather than reopening one file both ways, so an earlier buffered read's own cache effect cannot leak into the `O_DIRECT` measurement through shared page-cache state for that inode.

## In production

`DONTNEED`'s own documented non-binding status is exactly why this topic measures its effect directly rather than trusting the documentation alone — a hint the kernel is free to ignore could, in principle, do nothing in a given kernel version or configuration, and only an executed measurement rules that out. The dirty-page explanation for `DONTNEED`'s apparent failure right after a write is not a guess: it follows directly from the man page's own documented caveat, and the executed example demonstrates the contrapositive directly, since fsyncing first makes the exact same `DONTNEED` call succeed. `O_DIRECT` leaving zero resident pages is not merely the absence of a speed-up; it is direct evidence that its read path genuinely does not pass through the same kernel structure a buffered read populates, which is a stronger and more specific claim than "O_DIRECT is slower."

## The frontier

This topic deliberately defers any claim about durability to the next one, even though `fsync` appears in this topic's own example code as a baseline-clearing helper. Using `fsync` to produce a clean measurement is not the same claim as `fsync` making data durable, and conflating the two here would pre-empt that topic's own real subject. This topic's three measured behaviors are not three unrelated facts about three different syscalls — each one is a different point of control over the exact same underlying kernel data structure, the page cache for one file's pages, which is why the lesson step frames them as one shared resource rather than three separate topics. This topic also builds directly on topic 38's own direct-I/O alignment measurement from Chapter 12, extending a single-path alignment claim into a genuine two-path residency comparison.

## Where this goes next

The buffered path and direct I/O both eventually return from `write` — neither one, on its own, says anything about whether those bytes would survive a crash right now.
