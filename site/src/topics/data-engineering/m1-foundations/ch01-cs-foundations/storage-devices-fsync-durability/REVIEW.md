# REVIEW: Storage devices and fsync durability (`de.storage-devices-fsync-durability`)

Independent fact-check. Read: `index.mdx`, `narration.json`, `prerequisites.mdx`, `registry-entry.ts`, and the chapter contract `site/src/topics/data-engineering/m1-foundations/ch01-cs-foundations/CHAPTER.md` (topic 10's entry). Every one of the eleven cited URLs was fetched via the proxy and checked against the specific claim it backs.

**Verdict: MINOR_FIX**

## 1. Sources

Every single cited source was reachable, and every direct quotation and figure in the draft was traced to an exact match — the strongest sourcing record of any draft reviewed in this pass.

| # | URL | Reachable? | Supports the claim? |
|---|---|---|---|
| 1 | `fsync(2)`/`fdatasync(2)` man page | Yes, 200 | Exact matches: "This includes writing through or flushing a disk cache if present. The call blocks until the device reports that the transfer has completed"; "Calling fsync() does not necessarily ensure that the entry in the directory containing the file has also reached disk. For that an explicit fsync() on a file descriptor for the directory is also needed"; and, confirmed to sit under the page's own HISTORY section as the draft claims — "The fsync() implementations in older kernels and lesser used filesystems do not know how to flush disk caches. In these cases disk caches need to be disabled using hdparm(8) or sdparm(8)." |
| 2 | `open(2)` man page | Yes, 200 | Exact matches: "In Linux 2.6.0, this was relaxed to the logical block size of the block device (typically 512 bytes)"; "Since Linux 6.1, O_DIRECT support and alignment restrictions for a file can be queried using statx(2), using the STATX_DIOALIGN flag." |
| 3 | `io_uring(7)` man page | Yes, 200 | Exact matches: SQE/CQ mechanics as described; and the precise claim "The kernel places exactly one matching CQE in the CQ for every SQE you submit on the SQ" — matches "one completion event (CQE) per SQE" exactly. |
| 4 | PostgreSQL 18, "Resource Consumption" | Yes, 200 | Exact matches on every row of the `io_method` table (`worker`/`io_uring`/`sync`, with the `--with-liburing` build requirement) and `io_workers` default 3, `io_combine_limit` default 128 kB, `io_max_concurrency` default −1 "based on shared_buffers... but not more than 64." (The draft's "chosen from shared_buffers" is a slight simplification — the real formula also weighs `max_connections`/`autovacuum_worker_slots`/etc. — not wrong, just incomplete.) |
| 5 | PostgreSQL 18, "Write Ahead Log" | Yes, 200 | Exact match: "fdatasync is the default on Linux and FreeBSD" — matches "wal_sync_method defaults to fdatasync on Linux" exactly. |
| 6 | PostgreSQL wiki, "Fsync Errors" | Yes, 200 | Exact match: "As of this PostgreSQL 12 commit, PostgreSQL will now PANIC on fsync() failure. It was backpatched to PostgreSQL 11, 10, 9.6, 9.5 and 9.4" — matches the draft's version list exactly. |
| 7 | Corbet, "PostgreSQL's fsync() surprise", LWN | Yes, 200 | Exact matches: "Craig Ringer first reported the problem to the pgsql-hackers mailing list"; "Some patches merged during the 4.13 development cycle improved the situation somewhat (and 4.16 had some changes to improve it further)" — matches the draft's 4.13/4.16 claims exactly. |
| 8 | Rebello et al., USENIX ATC 2020 | Yes, 200 (abstract) | Exact matches: "pages are always marked clean" (verbatim); "we study how five widely used applications (PostgreSQL, LMDB, LevelDB, SQLite, Redis) handle fsync failures... none are sufficient" — matches "tested PostgreSQL, LMDB, LevelDB, SQLite and Redis and found that no failure-handling strategy was sufficient" almost word for word. |
| 9 | Agrawal et al., "Design Tradeoffs for SSD Performance", USENIX ATC 2008 | Yes, 200 | Author list confirmed exactly (Agrawal, Prabhakaran, Wobber, Davis, Manasse, Panigrahy, Microsoft Research), matching the draft's citation. |
| 10 | Linux kernel docs, `block/queue-sysfs` | Yes, 200 | All six cited sysfs attributes (`logical_block_size`, `physical_block_size`, `minimum_io_size`, `optimal_io_size`, `rotational`, `discard_granularity`) confirmed present on the page. |
| 11 | Seagate Exos X22 datasheet | Yes, 200 (PDF) | Exact numeric match: "Max. Sustained Transfer Rate OD: 285/272 [MB/s, MiB/s]... Random Read/Write 4K QD16 WCD (IOPS): 168/550... Average Latency (ms): 4.16" — matches the draft's "~168 random 4K read IOPS at queue depth 16, against roughly 285 MB/s streaming sequentially" and "4.16 ms average rotational latency" precisely, pulled straight from the vendor table. |

No dead links, no misattributions. This is an exemplary sourcing job: all three man pages, both PostgreSQL doc pages, the wiki, the LWN article, both USENIX papers and the kernel docs and vendor datasheet were checked and every one backs its claim exactly as attributed.

## 2. Unsupported numbers

- **One real overstatement: narration says "nearly a thousand to one," but the vendor's own numbers (confirmed above) give about 414:1.** `index.mdx` carefully hedges: "a random-to-sequential throughput gap near three orders of magnitude" (true but softened wording — 285 MB/s ÷ (168 IOPS × 4 KiB ≈ 0.69 MB/s) ≈ 414, which is roughly 2.6 orders of magnitude, not quite 3). Narration step 1 (0-indexed) instead asserts "That gap is nearly a thousand to one, and it's pure mechanics" — 414 is well under half of 1,000, so "nearly a thousand to one" overstates what the cited datasheet actually shows. Fix: match the written page's own hedge, e.g. "a few hundred to one" or "the better part of three orders of magnitude."
- Every other number checks out: the 7,200 rpm → 4.16 ms rotational-latency figure, the 168 IOPS / 285 MB/s HDD figures, the Linux version history for `O_DIRECT` alignment (2.4.10 introduction, 2.6.0 relaxation, 6.1 `STATX_DIOALIGN`), the PostgreSQL version list for the PANIC fix (12, backpatched to 11/10/9.6/9.5/9.4), the kernel versions for writeback error reporting (4.13, 4.16), and the `io_method`/`io_workers`/`io_combine_limit`/`io_max_concurrency` defaults — all independently confirmed against primary sources.

## 3. Narration & format

- **Valid JSON**, 12 steps. No digits or symbols found in any spoken line (regex-scanned).
- **Three predict steps with answers** (steps 2, 5, 9, 0-indexed), matching the "full" topic convention.
- **Opens on the Bridge, closes on the Handoff, both essentially verbatim.** Step 0's first two lines match `registry-entry.ts`'s `bridge` field with only a comma-to-ellipsis spoken-pause substitution; the last two lines of step 11 — "One machine's disks end here. Next: object storage, the bottom tier where lakehouses keep their data." — match the `handoff` field word for word. This is one of the cleanest bridge/handoff matches reviewed in this pass.
- **MIT-professor voice:** reads as spoken teaching prose ("Now, why writes are the hard case on flash," "And now the lesson that cost a database community a very bad week") and is clearly distinct from the `index.mdx` prose. Pass.
- **index.mdx format:** frontmatter has `id` and `title`; the five required `<section data-section="...">` blocks are present and in order; depth (two device mechanisms with their failure modes, the full durable-write recipe, the 2018 fsyncgate case study, io_uring/PostgreSQL 18 async I/O, a two-part lab with concrete `fio` jobs, an eight-item production checklist) is comparable to the `io-cost-model` reference topic.
- **prerequisites.mdx:** has the required `data-section="basics"` section plus two further numbered sections and a "goes deeper later" pointer. Matches shape.
- **registry-entry.ts:** well-formed `TopicMeta`, `status: 'held'`. Import path is wrong: `import type { TopicMeta } from '../../../../site/src/topics/registry'` uses 4 `../`, but the file sits 5 path segments deep under `chapters/` (`data-engineering/m1-foundations/ch01-cs-foundations/storage-devices-fsync-durability`), so it should be 5 `../`, as several sibling drafts correctly have. Same never-executed, harmless-but-wrong import noted in other drafts this pass — worth the same one-line sweep-fix.

## 4. Flow

- **`uses`/`introduces` ledgers, `id`, folder, `kind`, `minutes`, bridge and handoff all match `CHAPTER.md`'s topic 10 entry exactly, word for word.** `introduces: ['storage-devices', 'block-alignment', 'ssd-internals', 'write-amplification', 'io-uring', 'fsync', 'fsync-failure']` and `uses: ['memory-hierarchy', 'latency-numbers', 'latency-bandwidth-cost', 'page-cache', 'o-direct', 'virtual-memory']` are identical to the plan. `memory-hierarchy`/`latency-numbers`/`latency-bandwidth-cost` are confirmed introduced by `de.memory-hierarchy-latency-numbers` (topic 6, as built in `site/src/topics/registry.ts`); `page-cache`/`o-direct`/`virtual-memory` are planned to come from topic 9, not yet drafted anywhere, but correctly ordered before topic 10 in the syllabus — the same staged "held" pattern used throughout this chapter. `declared: []` is correct.
- **No id/folder deviation** — unlike several other drafts reviewed in this pass (`external-memory-io-model`, `btree-vs-lsm-at-a-glance`, `object-storage-tier`, `measuring-memory-hierarchy`), this one's folder and id match its own chapter's plan exactly.
- Nothing else in `uses`/`introduces`/`declared` is wrong; concept sequencing is correct throughout.

## Summary

This is an outstandingly well-sourced draft: all eleven cited sources were fetched and every direct quotation or figure — from three Linux man pages, two PostgreSQL doc pages, the PostgreSQL wiki, the 2018 LWN postmortem, two USENIX papers, kernel docs and a vendor datasheet — matched exactly. It is also one of the few drafts in this pass with no id/folder/kind deviation from its chapter plan. The verdict is MINOR_FIX only for a narration line that overstates a ratio the written page gets right ("nearly a thousand to one" vs. the sourced ~414:1), and the same harmless broken import path seen elsewhere in this batch.
