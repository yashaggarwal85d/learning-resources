---
title: "mmap versus an owned buffer pool"
---

## Outcomes

- Name the double-caching problem precisely and measure it directly: a mapped file's pages stay resident in the kernel's own page cache while a separate, hand-built application-level cache of the same bytes is also resident, at the same time.
- Measure direct I/O's real alignment constraint: a misaligned buffer passed to an `O_DIRECT` read fails outright with the kernel's own `EINVAL`, and a buffer aligned to a safe block boundary succeeds.
- State, from Crotty, Leis & Pavlo's own CIDR 2022 argument, the four concrete failure classes — transactional safety, I/O-stall unpredictability, error handling, and TLB-shootdown cost — that lead most DBMSs to own their own buffer pool instead of mapping a file directly.
- Identify the real, narrower condition — read-mostly access, no bounded-latency requirement — under which the paper and LMDB's own design agree `mmap` remains the right choice.

## Internals

The double-caching measurement in this topic deliberately touches every mapped byte before reading `/proc/self/smaps`, because an untouched mapping has no resident pages at all — the claim is specifically about pages that have actually been faulted in, not about the mapping's mere existence. The application-level cache's own growth is measured as a `VmRSS` delta around the `fs::read` call itself, rather than as the allocated `Vec`'s length, because an allocation alone does not prove the kernel actually backed it with real pages. The misaligned buffer used against `O_DIRECT` is produced by offsetting a genuinely block-aligned allocation by exactly one byte, not by using an arbitrary unaligned stack buffer, so the failure measured is specifically about alignment and nothing else.

## In production

The paper's own four failure classes are not independent concerns a system could mitigate one at a time. Transactional safety and error handling both stem from the same root cause: the kernel's own unannounced control over when, and whether, a dirty page actually reaches disk. `SIGBUS` specifically, rather than some more general fault, is the documented outcome because a mapped page's I/O error surfaces during the memory access itself, not during a syscall that could return an error code the normal way a `read()` or `write()` would. The TLB-shootdown cost is a genuinely cross-thread cost, not a per-call overhead the mapping thread alone pays — every other thread sharing the address space must have its own cached translation entries invalidated before an unmap can be considered complete.

## The frontier

The read-mostly exception the paper names is not merely a smaller version of the same risk. A workload that never writes through the mapping has no dirty pages for the kernel to flush unpredictably, which removes the transactional-safety problem and most of the I/O-stall problem entirely, not just reduces them — which is exactly the case LMDB's own design is built around. This topic deliberately measures its two most directly observable claims (double caching, alignment) rather than only quoting the paper's own argument for the other two (transactional safety, TLB shootdown), because the container's own filesystem makes the first two directly measurable while the latter two require conditions — a real crash, a multi-threaded shootdown trace — outside what a short, repeatable example can safely demonstrate. This topic closes Chapter 12 as the chapter plan scoped it: the two preceding syllabus items, address translation and mmap's own soundness argument for `unsafe`, are deliberately skipped, so this topic's only real dependency is Chapter 11's own file-descriptor and ownership framing, not paging mechanics itself.

## Where this goes next

This chapter was about how a process's own memory and files are managed once it already has them open. The next one is about how a process finds out, in the first place, that there's anything to read at all.
