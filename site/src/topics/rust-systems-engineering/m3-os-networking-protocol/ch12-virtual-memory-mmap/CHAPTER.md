# Chapter 12 — Virtual Memory, mmap, Page Faults, and Memory Mappings (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 3, *OS, Networking, and Protocol Layer* (its second chapter). Chapter 12 has one section, 12.1, with exactly one full topic — the syllabus's first two 12.1 items, "Address translation and page faults" and "mmap semantics and Rust soundness," are both marked `*(skipped)*` and get no reel, per `syllabus/review-notes/rust-systems-engineering-cuts.md`. Planned 2026-10-23, in one `/make-topic` session. Previous chapter: Chapter 11, *Processes, File Descriptors, Syscalls, and Resource Ownership* (both topics live: file descriptors and I/O safety, processes/signals/environment safety).

This file is the contract the chapter's one topic builds to. Do not edit it once the topic is in progress; record any unavoidable departure under its `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 11's own handoff named exactly where this chapter picks up: "a process's file descriptors and its signals are both kernel handles this chapter made explicit. Its memory is a kernel handle too — just one so heavily abstracted by the virtual memory system that most code never has to think of it as one at all, until it's mapped directly." Memory-mapping a file looks, from Rust's side, like the cheapest possible way to read a large file: no explicit read calls, no application-side buffer, just a slice of bytes the kernel fills in lazily as pages are touched. That appearance is specifically what this chapter's one topic exists to correct for the case that matters most in practice — a database or other latency-sensitive service deciding how to manage a large file's contents in memory. Mapping a file does not remove the kernel's own page cache from the picture; it exposes it directly, which means an application that also keeps its own cache on top is now holding the same bytes twice, in two different caches that know nothing of each other's eviction decisions — the double-caching problem. Direct I/O (`O_DIRECT`) is the kernel's own answer to removing that duplication, and it is not free: bypassing the page cache trades it for hard alignment and completion constraints on every read and write. Crotty, Leis & Pavlo's 2022 CIDR paper lays out, directly and with evidence, why the overwhelming majority of production database systems choose to own their own buffer pool rather than lean on `mmap`: transactional-safety failures (a dirty page the kernel decides to write back at the wrong moment undermines a database's own durability ordering), I/O-stall unpredictability (a page fault on a mapped file can block for an arbitrary, uncontrollable amount of time exactly where a database needs a bounded one), error handling that degrades to a process-terminating `SIGBUS` instead of a recoverable `Result`, and TLB-shootdown costs that `munmap`/`mprotect` impose on every other thread in the process. None of this makes `mmap` wrong everywhere — the same paper, and real systems like LMDB, show exactly where its guarantees are enough: read-mostly workloads where the operating system's own page-eviction policy is an acceptable substitute for a hand-rolled one.

By the end of the topic the learner can: name the double-caching problem precisely (the page cache and an application-level cache of the same file both exist in memory at once, evicted independently of each other) and explain why direct I/O's alignment and completion constraints are the real price of removing it; state, from the paper's own argument, the four concrete failure classes — transactional safety, I/O-stall unpredictability, error handling, and TLB-shootdown cost — that lead most DBMSs to own their own buffer pool instead of mapping a file directly; and identify, from the paper and from LMDB's own design, the real conditions (read-mostly access, no need for a bounded I/O-stall budget, acceptance of the kernel's own eviction policy) under which `mmap` is still the right choice.

## A.2 The order of ideas, and why

This chapter has exactly one full topic, so there is no internal ordering to justify — only how it is scoped against the two syllabus items that precede it and were deliberately skipped.

1. **mmap versus an owned buffer pool** (topic 38) — needs nothing new from this chapter (the two syllabus items ahead of it, address translation/page faults and mmap's own soundness argument for `unsafe`, are skipped and contribute no prerequisite ids); it builds directly on Chapter 11's kernel-handle framing. Measures the double-caching problem directly (a mapped file's pages counted in the kernel's own page cache at the same time a hand-built application cache holds the same bytes), measures direct I/O's real alignment constraint (an unaligned buffer passed to an `O_DIRECT` read failing outright, an aligned one succeeding), and states the paper's own four-failure-class argument for why most DBMSs own their buffer pool, plus the real, narrower case — read-mostly, LMDB-style — where `mmap` remains the right call. Hands off to Chapter 13 (epoll and Readiness-Driven Networking), where the milestone turns from how a process's own memory and files are managed to how it is notified about the outside world arriving on a socket.

*(The chapter's lab — map a multi-GB file, scan it sequentially and then randomly, and record page faults, RSS and throughput, then repeat with `read`-based I/O and with `MADV_RANDOM`/`MADV_SEQUENTIAL` — is not a reel; it stays in the syllabus as a lab exercise per `CLAUDE.md`'s convention, exercising this chapter's one topic directly rather than introducing new tested claims of its own. The syllabus's first two 12.1 items, "Address translation and page faults" and "mmap semantics and Rust soundness," are marked `*(skipped)*` and get no reel.)*

## A.3 The running example: one real file, measured both ways

The topic's own example is self-contained (no cross-chapter imports, per Chapters 1–11's convention, except where it explicitly measures a prior chapter's own construction as its baseline): one real, moderately large file on disk, read through two genuinely different paths so the topic's own claims come from a direct, measured comparison rather than from either path alone.

- It memory-maps the file (via the real `memmap2` crate, the ecosystem's own safe-ish wrapper around `mmap(2)`) and measures the kernel's own page-cache residency for that file directly from `/proc/<pid>/smaps` (the `Rss`/`Pss` fields for the mapping), while a separate, hand-built application-level cache holds a copy of the same bytes read through a normal `read` call — demonstrating the double-caching claim as two real, simultaneously resident copies of the same data, not an assumption.
- It opens the same file with `O_DIRECT` (via `OpenOptionsExt::custom_flags`) and measures directly that a misaligned buffer's read fails with the real `EINVAL` the kernel returns, while a buffer aligned to the filesystem's own logical block size (read from `/sys/block/.../queue/logical_block_size`, or a safe, portable default where that is unavailable in the container) succeeds — the real alignment constraint direct I/O trades the double-caching problem for.
- It names, directly from the CIDR 2022 paper's own text, the four failure classes (transactional safety, I/O-stall unpredictability, error handling, TLB-shootdown cost) and the one condition under which the paper and LMDB's own design agree `mmap` is still the right choice (read-mostly, no bounded-latency requirement).

Every number and every outcome shown must come from the topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024; this topic is Unix-specific like Chapter 11's, and adds `memmap2` as a new, real dependency alongside `libc` where a raw syscall or `/proc` read is needed). Reuse Chapters 1–11's engineering conventions unchanged: a cargo crate under `examples/`, sources fetched and quoted via `scripts/sources.mjs`, "never invent what you didn't run" (`QUALITY.md`). Where the container's own filesystem or kernel does not support a measurement this topic would otherwise want (e.g. `O_DIRECT` refused by the underlying filesystem), the topic's `OUTLINE.md` must record that constraint explicitly under "Changes from the chapter plan" and adjust the measured claim to what the container can actually prove, never asserting a number that was not genuinely observed.

## A.4 Terms and notation (continuing Chapters 1–11's vocabulary)

Everything in Chapters 1–11 §A.4 still applies. This chapter adds:

- **Double caching**: the page cache (kernel-level) and an application-level cache both holding the same file's bytes in memory at once, evicted independently of each other, with no way for either to learn what the other is doing.
- **Direct I/O (`O_DIRECT`)**: bypassing the page cache entirely on a read or write, in exchange for hard alignment and completion constraints the kernel enforces strictly (an unaligned buffer or offset fails outright rather than being silently handled).
- **Transactional-safety problem (of `mmap`)**: the kernel's own writeback of a dirty mapped page can happen at a time the database did not choose, undermining the exact ordering a transaction log depends on.
- **I/O-stall problem (of `mmap`)**: a page fault on a mapped file can block for an arbitrary, kernel-decided amount of time, exactly where a latency-sensitive system needs a bounded one.
- **Error-handling problem (of `mmap`)**: an I/O error on a mapped page surfaces as `SIGBUS`, a process-terminating signal, instead of a recoverable `Result` a normal read would return.
- **TLB-shootdown problem (of `mmap`)**: `munmap`/`mprotect` must invalidate the mapping's entries in every other thread's TLB, a real, measurable cross-thread cost a buffer pool's own allocator never pays.
- **Owned buffer pool**: an application-managed cache of file contents, with its own eviction policy, durability ordering, and error handling — the alternative most DBMSs choose over mapping the file directly.

Narration words (continuing the convention: no digits, no code-style names spoken): "the same bytes, held twice, by two caches that don't know about each other" for double caching; "bypassing the cache, but only in neat, aligned pieces" for direct I/O; "a write-back the database never asked for, at a moment it didn't choose" for the transactional-safety problem; "a pause with no promised end" for the I/O-stall problem; "a crash instead of a result to handle" for the error-handling problem; "every other thread, paused, just to update one mapping" for TLB shootdown; "a cache the application actually controls" for an owned buffer pool.

## A.5 Visual language (continuing Chapters 1–11's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same thread dots and shared-memory boxes reused where relevant. This chapter adds:

- **A double-cache glyph**: two separate boxes (the kernel's page cache, the application's own cache) each holding a copy of the same labelled bytes, with no line connecting them — used once for the double-caching claim.
- **An alignment gate**: a narrow slot that only an aligned buffer passes through cleanly, with a misaligned one bouncing off it labelled with the real `EINVAL` — used for the direct-I/O alignment claim.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400, a vertical stack rather than a horizontal row for any multi-item list per Chapter 11's own established convention) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–11 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields as in Chapters 1–11 but with `milestone: { number: 3, title: 'OS, Networking, and Protocol Layer' }` and `chapter: { number: 12, title: 'Virtual Memory, mmap, Page Faults, and Memory Mappings', section: '12.1' }` (the syllabus's own single subsection heading). A cargo crate under `examples/` is used, with `memmap2` added as a new, real dependency alongside `libc`; this topic is Unix-specific, continuing Chapter 11's own `examples.py` convention of asserting `sys.platform != 'win32'`.

## A.7 The chapter's concept ledger

**Declared** (Chapters 1–11's own declared prerequisite ids, verified against `registry.ts` immediately before writing this list): `rust-basics`, `stack-and-heap`, `references-basics`, `structs-enums`, `pattern-matching-basics`, `std-collections`, `error-handling-result`, `traits-generics-basics`, `threads-and-channels`, `mutexes`, `closures-basics`, `ownership`, `move-semantics`, `box-ownership`. Chapters 1–11's *introduced* ids actually in `registry.ts` that this chapter's topic draws on directly: `fd-as-kernel-handle`, `io-safety-ownership-types`, `cloexec-default-and-leaks` (`rust.file-descriptors-i-o`) — the file-as-handle framing this topic's own mapped-file measurements extend to memory. A topic in this chapter lists in `uses` only the ones it actually relies on.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `mmap-double-caching` | 38 | Mapping a file exposes the kernel's own page cache directly; an application-level cache on top of that holds the same bytes twice, in two caches that cannot coordinate with each other. |
| `direct-io-alignment-tradeoff` | 38 | `O_DIRECT` removes the double-caching problem by bypassing the page cache entirely, in exchange for hard alignment and completion constraints the kernel enforces strictly rather than handling silently. |
| `owned-buffer-pool-rationale` | 38 | Crotty, Leis & Pavlo's own four failure classes (transactional safety, I/O-stall unpredictability, error handling, TLB-shootdown cost) are why most DBMSs own their buffer pool instead of mapping files directly — except in the narrower, read-mostly, LMDB-style case where mapping remains the right call. |

## A.8 Bridges and handoffs

- **38** bridges from Chapter 11's own real handoff ("its memory is a kernel handle too — just one so heavily abstracted by the virtual memory system that most code never has to think of it as one at all, until it's mapped directly") and answers it directly: what mapping that memory actually costs, measured against the alternative most real systems actually choose. Hands off to Chapter 13 (epoll and Readiness-Driven Networking): "This chapter was about how a process's own memory and files are managed once it already has them open. The next one is about how a process finds out, in the first place, that there's anything to read at all."

## A.9 Primary sources to start from (topic must re-fetch and verify)

- Crotty, Leis & Pavlo, "Are You Sure You Want to Use MMAP in Your Database Management System?" (CIDR 2022) — the paper's own four-failure-class argument and its own statement of when `mmap` remains acceptable.
- The `mmap(2)` man page, for the kernel's own description of shared file-backed mappings and the page cache they expose.
- The `open(2)` man page's `O_DIRECT` section, for the kernel's own documented alignment and completion requirements.
- The `memmap2` crate's own docs, for `Mmap::map`'s documented safety contract and behavior.
- LMDB's own documentation or design notes, for its own stated rationale for mapping its data file directly.
