# Chapter 5 plan: Database Internals and Distributed Storage (Data Engineering, Milestone 2)

This is the contract for every topic of Chapter 5. Builders keep to their own entry and read the entries next to theirs. Don't edit this file except to append the next topic's entry in syllabus order, immediately after drafting it.

- **Planned:** 24 October 2026, from `syllabus/data-engineering.md` §5.1–§5.6, continuing straight on from the shipped Chapter 4 (`site/src/topics/data-engineering/m1-foundations/ch04-advanced-python-data/CHAPTER.md`). §5.4 ("Build-it-yourself storage engine track") has no topic of its own — it is entirely a cross-reference to *Rust Systems Engineering*'s builds, named where relevant in §5.1's and §5.3's topics, never duplicated here. Several syllabus entries are marked *(skipped)*: they stay in the curriculum (`syllabus/review-notes/data-engineering-cuts.md`) and get no reel; the topic after each one bridges from the last topic that is not skipped, exactly as `next-topic.mjs` already resolves it.
- **Registry fields shared by every topic:** `domain: 'data-engineering'`, `milestone: { number: 2, title: 'Storage: Database Internals, Files & the Lakehouse' }`, `chapter: { number: 5, title: 'Database Internals and Distributed Storage', section: '5.1' | '5.2' | '5.3' | '5.5' | '5.6' }`, `slug` = the folder below `site/src/topics/`. The registry `title` is the syllabus title unless the entry names a different **Registry title**; `syllabusTitle` is always the heading's title word for word. Every topic here ships `status: 'held'` on completion (owner decision 2026-10-17), queued in `renarration.json`, until the PC's narration pass generates its audio.
- **Engine of record:** the sandbox's own PostgreSQL 16/18 clusters (started on demand) for every storage-engine, transaction-isolation and replication claim this chapter can run directly; RocksDB (via `python-rocksdb` or a thin CLI wrapper) as the LSM reference engine where §5.1 needs a real LSM store side by side with Postgres; Redis or Valkey (whichever the sandbox can install) for §5.5's cache topics. A claim that needs a second machine this sandbox doesn't have (true multi-node failover, a real Spanner/CockroachDB cluster, Kafka's share groups) is named and sourced directly from the system's own documentation and disclosed honestly as sourced-only, following Chapters 1–4's honest-gap pattern — a single-node Postgres cluster with multiple local connections stands in for "a transaction" and "a session" wherever the syllabus's own lab only needs concurrent sessions, not concurrent hosts.

---

## The chapter

### The problem it solves

Chapter 4 closed on the honest admission that every fast Python library it used — Polars, pydantic-core, orjson — is actually a thin layer over Rust or C++, and built one such layer by hand. This chapter opens the thing underneath all of those native layers in turn: the database engine itself. It starts from the single physical unit every engine reads and writes — the fixed-size page, built from slots so a row's logical identity survives being physically moved — then builds up, page by page, everything an engine does to keep that page safe and fast: a buffer pool cache in front of it, a write-ahead log and checkpoint protocol so a crash never loses a committed write, a B-tree index on top of it, and two entirely different ways (Postgres's MVCC, an LSM tree) to let many transactions touch it at once without one reader blocking every writer (§5.1). It then turns to what "many transactions at once" actually promises and how often it's violated: the real anomalies ANSI's own isolation levels don't name, snapshot isolation's write skew, the two routes (locking, serializable snapshot isolation) to full serializability, and the coordination (2PC) a transaction spanning more than one engine needs (§5.2). It then takes the single engine this far and spreads it across machines: replication's own failure modes, CAP and PACELC as what a network partition actually costs you, and the partitioning and consensus mechanics every genuinely distributed database (and this course's own future topics) assumes (§5.3). It closes with the read side most of this machinery exists to protect — caches and their own consistency problem, a real production cache engine's internals, and the probabilistic sketches (Bloom filters, HyperLogLog, quantile sketches) that let a system answer "is it in there," "how many distinct," or "what's the p99" at a scale where an exact answer isn't affordable (§5.5–§5.6). The learner leaves able to explain, concretely and with real measurements from this sandbox's own Postgres and RocksDB, why a database behaves the way it does under load, contention, a crash, or a network partition — not as abstract theory, but as the direct, traceable consequence of the page, the log and the clock this chapter builds up from.

### Order of ideas, and why

1. **§5.1 Storage engines (topics 1–9).** Everything else in the chapter assumes you already know what a page is and how an engine protects it, so this opens there: the page itself, the unit every later mechanism operates on (1) → the buffer pool that caches it in memory (2) → the write-ahead log that makes a write to it durable before the page itself is ever flushed (3) → checkpoints and crash recovery, which exist only because topic 3's log needs a bound on how far back it must replay (4) → the B-tree that indexes pages for fast lookup, now that pages, caching and durability are all in place underneath it (5) → MVCC, the first of two entirely different answers to "what happens when two transactions touch the same row" (6) → vacuum, the maintenance cost MVCC's own append-only answer creates and must pay back (7) → the LSM tree, the second answer to the same concurrent-write problem, built from a genuinely different structure (8) → LSM compaction, the maintenance cost topic 8's own structure creates, closing the section with the same "every design has a bill to pay later" lesson topic 7 taught for MVCC (9).
2. **§5.2 Transactions and concurrency (topics 10–16).** A refresher first, since the chapter needs everyone using "atomicity," "consistency," "isolation," "durability" to mean the same precise thing before anomalies are named (10) → the real anomalies beyond what ANSI's own ambiguous definitions name, the vocabulary every later topic in this section diagnoses against (11) → snapshot isolation, MVCC's own isolation level, and the one anomaly (write skew) it doesn't prevent (12) → the two real routes to full serializability, one of which (SSI) is topic 12's own snapshot mechanism made serializable (13) → locking and deadlocks, the mechanism strict 2PL (topic 13's first route) is actually built from (14) → optimistic vs pessimistic concurrency control, the practical choice between topic 14's locking and topic 12's snapshot approach (15) → 2PC, closing the section with the coordination problem that appears the moment a transaction spans more than one engine, which every concurrency mechanism above assumed away (16).
3. **§5.3 Replication and distributed databases (topics 17–24).** Another refresher first, the replication vocabulary the whole section assumes (17) → physical vs logical replication, the two real mechanisms a refresher's "primary/replica" glosses over (18) → replication lag and the session guarantees an application actually needs despite it (19) → CAP and PACELC, naming precisely what a network partition costs the replication topic 18 just built (20) → partitioning schemes, the orthogonal axis to replication that a single-node engine from §5.1 needs to actually scale (21) → shard keys and resharding, the practical failure mode partitioning's own clean theory runs into (22) → consensus, the mechanism that makes topic 18's replication and topic 21's partitioning both survive a failure without losing or duplicating a write (23) → distributed SQL architecture, closing the section by showing a real system (Spanner's pattern) built from every mechanism topics 17–23 named (24).
4. **§5.5–§5.6 The read side: caching and probabilistic structures (topics 25–32).** Cache patterns and eviction first, the vocabulary the rest of the section assumes (25) → cache consistency and invalidation, the hard problem eviction policy alone doesn't solve (26) → a real cache engine's internals (Redis/Valkey), showing topics 25–26's abstractions as one real system's actual design (27) → analytical serving layers, the data-warehouse-facing use of caching this chapter hasn't yet connected to Chapter 3's own warehouse material (28) → message queues vs event logs, a different kind of "read side" (a consumer reading what a producer wrote) that doesn't depend on topics 25–28 at all (29) → Bloom/cuckoo/xor filters, opening the probabilistic-structures subsection with the simplest and most widely reused sketch (30) → HyperLogLog, a different sketch for a different question (31) → quantile sketches, closing the chapter with the third major sketch family and, with it, Chapter 5 as a whole, handing off to Chapter 6's file-format material.

### One running example: the shop's own order-and-event database

Same fictional online shop as Chapters 1–4 (no real company, no real person). Where Chapter 4 processed the shop's raw clickstream-and-orders feed in Python, this chapter opens the database that feed is ultimately written into and read back from: a small, real `orders`/`order_events` schema (an order row, a handful of event rows per order, a numeric `amount` column, a status column) created fresh in the sandbox's own PostgreSQL cluster, sized to each topic's own concern rather than fixed at one scale — a handful of rows to inspect a page's own bytes directly (§5.1's early topics), thousands of rows and concurrent sessions to reproduce a real isolation anomaly or lock wait (§5.2), and a second local store (RocksDB) or a second local Postgres connection standing in for a replica (§5.3) wherever the syllabus's own lab needs more than one engine or more than one session. The same schema is cached in front of Postgres with a real Redis/Valkey instance for §5.5, and the same order-events stream is the input to the probabilistic sketches of §5.6 — one coherent dataset carried through the whole chapter, exactly as Chapter 4's clickstream feed was.

### Shared notation and terms

- **Carries over from Chapters 1–4 unchanged:** version-stated claims for anything the sandbox can't run directly; the measured-vs-sourced-only disclosure habit; narration with no digits, symbols or code names, numbers spoken aloud.
- **Page and storage vocabulary** (topic 1 introduces, reused through §5.1 and beyond): a page, a slot/line-pointer, a tuple, out-of-line (TOAST-style) storage.
- **Durability vocabulary** (topics 3–4 introduce, reused through §5.1–§5.2): an LSN, a WAL record, a checkpoint, redo vs undo.
- **Concurrency vocabulary** (topics 6, 10–16 introduce, reused through §5.2–§5.3): a snapshot, a version, an isolation anomaly, a lock mode, 2PC.
- **Distribution vocabulary** (topics 17, 20–23 introduce, reused through §5.3): replication lag, a partition (network) vs a partition/shard (data), a quorum, a consensus round.
- **Spoken numbers:** narration has no digits, symbols or code names (same automatic check as Chapters 1–4).
- **Versions to state, not assume:** the sandbox's actual PostgreSQL major version (16 or 18, stated explicitly whenever a feature differs between them, e.g. async I/O, multicolumn skip scan, failover-safe logical slots); RocksDB's and Redis/Valkey's exact installed versions; any claim needing true multi-host failover disclosed as sourced-only.

### One visual language for the chapter's reels

Builds on Chapters 1–4's grammar (`crema`/`latte`/`taupe`/`caramel`/`cinnamon`/`cherry`, the same `Stack`/`Svg`/`T`/`Bar`/`C` kit) and adds the conventions this chapter needs:

- **A page is drawn as a labeled rectangle with a header strip, a line-pointer array growing from one end and tuple data growing from the other**, introduced in topic 1 and reused without re-explaining whenever a later topic (2, 4–9) draws anything living inside a page.
- **A durability timeline** (one horizontal strip for the WAL, with discrete LSN marks, and a second strip below for the data file, with a lagging "durable up to here" marker) is this chapter's one recurring mechanism diagram for everything log-and-crash related, introduced in topic 3 and reused in topics 4, 9, and 16.
- **A two-transaction timeline** (two horizontal lanes, time left to right, a marked read/write/commit event on each) is reused across every §5.2 topic (10–16) to show an anomaly or a locking/abort sequence as a concrete, dated sequence of events rather than prose.
- **A worker-lane timeline from Chapter 4, repurposed as a replica/node timeline**, reused across §5.3 (17–24) to show a leader/replica relationship, a partition boundary, or a consensus round as lanes that can fall behind, go silent, or disagree.
- **A sketch is drawn as a small fixed-size structure (a bit array, a register set) next to the real stream of input it summarizes**, introduced in topic 30 and reused in topics 31–32 so the "small, fixed memory vs. a much larger input" trade-off is visible at a glance every time.
- Every topic keeps Chapters 1–4's full-topic reel shape (hook → predict within the first four steps → mechanism in steps → at least three takeaways → recap → "Prove it"); this chapter's only refreshers are topics 10 and 17.

### The chapter labs: who hosts what

| Lab part (syllabus words) | Host topic, Deep dive section |
|---|---|
| §5.1 "run the same insert/update/scan workload against Postgres and RocksDB... measure write amplification, space amplification and p99 read latency; then hold a long-running transaction open in Postgres and chart table bloat" | Topic 9 (LSM compaction and the RUM trade-off) hosts the Postgres-vs-RocksDB amplification/latency comparison directly, since it is the section's last topic and the RUM trade-off is exactly what that comparison demonstrates; topic 7 (Vacuum, bloat and transaction-ID wraparound) hosts the long-running-transaction bloat chart directly, since that is its own subject. |
| §5.2 "reproduce write skew... under Postgres REPEATABLE READ, then rerun under SERIALIZABLE... add retry logic and measure abort rate as contention rises" | Topic 12 (Snapshot isolation and write skew) hosts the write-skew reproduction directly; topic 13 (Serializability: strict 2PL versus SSI) hosts the SERIALIZABLE rerun, the serialization-failure observation, and the abort-rate-under-contention measurement, since SSI is exactly the mechanism Postgres's own `SERIALIZABLE` uses. |
| §5.3 "run a three-node Postgres... cluster; measure replication lag... break read-your-writes from a replica and fix it with an LSN token, then kill the leader and record failover time" | Topic 19 (Replication lag and session guarantees) hosts the lag measurement, the read-your-writes break and its LSN-token fix directly, since that is its own subject; true multi-node failover timing is disclosed as sourced-only where this sandbox can't run a real second host, with the mechanism demonstrated instead on local replica connections wherever Postgres allows it. |
| §5.4 "put your engine, RocksDB and Postgres under the same ingest-then-query workload" | Not hosted here: the from-scratch engine itself is built in *Rust Systems Engineering*; this syllabus subsection's own cross-domain comparison is named, with its building blocks, in topics 1, 8–9 wherever RocksDB and Postgres are already compared directly. |
| §5.5 "put a cache-aside Redis/Valkey layer in front of Postgres; expire a hot key under 1,000 concurrent readers... then add single-flight coalescing and early expiration... finally reproduce the delete-after-write stale-read race" | Topic 27 (Redis and Valkey internals) hosts the cache-aside layer and the hot-key-expiry-under-concurrency measurement directly, scaled honestly to what this sandbox's own connection limits allow if 1,000 real concurrent readers isn't affordable; topic 26 (Cache consistency and invalidation) hosts the single-flight/early-expiration fix and the delete-after-write race reproduction directly, since that is its own subject. |
| §5.6 "implement HyperLogLog and Count-Min Sketch; measure error vs memory against exact counts on a Zipf-skewed stream; merge sketches across simulated partitions" | Topic 31 (HyperLogLog and distinct counting) hosts the HyperLogLog build and its error-vs-memory and merge measurements directly; Count-Min Sketch itself is a *(skipped)* syllabus entry, so its own build is named and sourced in topic 30 (Bloom, cuckoo and xor filters) as a related approximate-membership/frequency structure, not built as its own lab leg. |

---

## The topics, in syllabus order

Folder prefix for every topic: `site/src/topics/data-engineering/m2-storage-database-internals/ch05-database-internals-distributed/`. Concept ids are kebab-case. A concept is in `uses` only if a topic above it (in this chapter or Chapters 1–4) introduces it, and `declared` lists knowledge every reader of this course already has.

---

### 1. Pages, slotted pages and tuple layout (`de.pages-slotted-pages-tuple`): full, §5.1

- **Folder:** `pages-slotted-pages-tuple`. About 15 min.
- **Scope:** "the fixed-size page as the unit of I/O: header, line-pointer (slot) array, tuples growing toward each other, record headers, null bitmaps, page checksums; why slots decouple logical row identity (Postgres `ctid`) from physical offset; out-of-line storage of large values (Postgres TOAST, InnoDB overflow pages)" — the full syllabus line (the "Build depth → Rust Systems Engineering Ch.19" clause is a cross-reference, not content this topic teaches).
- **Outcomes:** Describe a real Postgres page's own layout (header, line-pointer array, tuple data) read directly from the sandbox's cluster; explain why a slot indirection lets a row move within a page while its logical identity (`ctid`) stays stable to an index pointing at it; state when a value is stored out of line (TOAST) and why.
- **Introduces:** `slotted-page-layout`, `tuple-identity-slots`. **Uses:** none from Chapter 4 directly. **Declared:** basic familiarity with a file as a sequence of fixed-size blocks (Chapter 1).
- **Bridge:** "Every acceleration in Chapter 4 — profiling, Arrow, Polars, a hand-built PyO3 extension — still assumed a database engine already existed underneath, already written in C or Rust. This topic opens that engine itself, starting from the single fixed-size page every one of them reads and writes." (Answers Chapter 4 topic 37's handoff.)
- **Handoff:** "A page sitting on disk is only useful if an engine doesn't have to read it from disk on every access. The next question is the cache in front of it: the buffer pool."
- **Prerequisites panel:** Chapter 4 (Before this, as the chapter's own entry point).
- **Visual idea:** a real page read directly from this sandbox's own Postgres cluster (via `pageinspect` or an equivalent real read), drawn as the chapter's page primitive — header strip, line-pointer array growing from one end, tuple bytes growing from the other, meeting in the middle — with one tuple's slot number and physical offset shown separately to make the indirection concrete.
- **Lab:** none of its own; feeds the §5.1 chapter lab's Postgres-vs-RocksDB comparison (assembled in topics 8–9).
- **Sources:** Postgres's own documentation on database page layout (storage internals chapter), the `pageinspect` extension's documentation, Postgres's TOAST documentation — fetched and quoted at research time.

### 2. Buffer pool and page replacement (`de.buffer-pool-page-replacement`): full, §5.1

- **Folder:** `buffer-pool-page-replacement`. About 15 min.
- **Scope:** "the buffer pool as the engine's own cache: pin/unpin, dirty-page tracking, replacement policies (LRU, clock-sweep, LRU-K/2Q) and why plain LRU fails under sequential scans (ring buffers); double caching with the OS page cache vs `O_DIRECT`; PostgreSQL 18's asynchronous I/O subsystem (`io_method` = worker or io_uring) replacing reliance on OS readahead" — the full syllabus line.
- **Outcomes:** Explain pin/unpin and dirty-page tracking as the buffer pool's own bookkeeping; contrast LRU, clock-sweep and LRU-K/2Q, and state precisely why plain LRU fails under a sequential scan and how a ring buffer fixes it; explain double caching (OS page cache plus the engine's own buffer pool) and what `O_DIRECT` trades away to avoid it; name PostgreSQL 18's `io_method` options and what they replace, honestly as sourced-only if the sandbox's own cluster is PostgreSQL 16.
- **Introduces:** `buffer-pool-pin-unpin`. **Uses:** `slotted-page-layout`. **Declared:** the memory-hierarchy material from Chapter 1 (cache levels, why a cache miss costs more than a hit).
- **Bridge:** "A page sitting on disk is only useful if an engine doesn't have to read it from disk on every access. This topic is the cache in front of it: the buffer pool, pin/unpin, and every real replacement policy an engine uses to decide what stays in memory." (Answers topic 1's handoff.)
- **Handoff:** "A dirty page sitting in the buffer pool is lost the instant the process crashes, unless something records the write durably before the page itself is ever flushed. That something is the write-ahead log."
- **Prerequisites panel:** topic 1 (Before this).
- **Visual idea:** a fixed-size buffer pool drawn as a row of page slots, a sequential scan sweeping through it under plain LRU (every slot evicted and refetched, shown as a real measured miss rate) versus the same scan under a ring-buffer policy (a bounded working set, a measurably lower miss rate) — real numbers from a real sequential scan against this sandbox's own Postgres cluster wherever its buffer-hit statistics (`pg_statio_*`) expose them directly.
- **Lab:** none of its own; feeds the §5.1 chapter lab.
- **Sources:** Postgres's own buffer manager documentation and `pg_statio_*`/`pg_buffercache` documentation, PostgreSQL 18's release notes on the asynchronous I/O subsystem — fetched and quoted at research time.

### 3. Write-ahead logging and fsync semantics (`de.write-ahead-logging-fsync`): full, §5.1

- **Folder:** `write-ahead-logging-fsync`. About 15 min.
- **Scope:** "'log before data': LSNs, group commit, `fsync` vs `fdatasync` vs `O_DSYNC`, write barriers and drive caches; torn pages and Postgres full-page writes vs InnoDB's doublewrite buffer; the 2018 'fsyncgate' lesson (a failed fsync can silently drop dirty pages, so the only safe response is to crash and replay)" — the full syllabus line.
- **Outcomes:** State the write-ahead rule precisely (a change is logged, and that log durable, before the changed page itself is written back); read a real LSN from this sandbox's own Postgres cluster and explain what it orders; contrast `fsync`, `fdatasync` and `O_DSYNC`; explain a torn page and contrast Postgres's full-page-write defense with InnoDB's doublewrite buffer; state the fsyncgate lesson and why "crash and replay" is the only safe response to a failed fsync.
- **Introduces:** `wal-lsn-fsync`. **Uses:** `slotted-page-layout`, `buffer-pool-pin-unpin`. **Declared:** the filesystem/durability basics from Chapter 1 (what a syscall boundary is).
- **Bridge:** "A dirty page sitting in the buffer pool is lost the instant the process crashes, unless something records the write durably first. This topic is that something: the write-ahead log, LSNs, and the real fsync machinery underneath 'durable.'" (Answers topic 2's handoff.)
- **Handoff:** "A WAL that's never allowed to grow forever needs a way to bound how far back a crash recovery must replay. That bound is a checkpoint."
- **Prerequisites panel:** topics 1–2 (Before this).
- **Visual idea:** this chapter's durability timeline, drawn with a real sequence of LSNs from a real transaction against this sandbox's own Postgres cluster — the WAL strip advancing on every commit, the data-file strip lagging visibly behind until the next checkpoint, making "log before data" a picture rather than a rule.
- **Lab:** none of its own; feeds the §5.1 chapter lab.
- **Sources:** Postgres's own WAL internals documentation, its `wal_sync_method`/full-page-writes documentation, MySQL/InnoDB's doublewrite buffer documentation, the 2018 "fsyncgate" (PostgreSQL mailing list thread / Craig Ringer's write-up) as the primary account of the failure — fetched and quoted at research time.

### 4. Checkpoints and crash recovery (`de.checkpoints-crash-recovery`): full, §5.1

- **Folder:** `checkpoints-crash-recovery`. About 15 min.
- **Scope:** "ARIES-style analysis/redo/undo vs Postgres's redo-only recovery; checkpoint frequency trading recovery time against write amplification and full-page-write volume; the WAL as the substrate that physical replication, point-in-time recovery and logical decoding (CDC, Ch.8) are all built on" — the full syllabus line.
- **Outcomes:** Contrast ARIES's three-pass analysis/redo/undo recovery with Postgres's redo-only approach and explain why Postgres can skip the undo pass; explain the checkpoint-frequency trade-off (recovery time vs. write amplification and full-page-write volume) with a real measurement; name physical replication, point-in-time recovery and logical decoding as three things built directly on the WAL this and the previous topic established.
- **Introduces:** `checkpoint-recovery-redo-undo`. **Uses:** `wal-lsn-fsync`. **Declared:** none beyond topic 3.
- **Bridge:** "A WAL that's never allowed to grow forever needs a bound on how far back a crash recovery must replay. This topic is that bound: the checkpoint, and the two real recovery strategies (ARIES's redo/undo, Postgres's redo-only) built on top of the WAL topic 3 established." (Answers topic 3's handoff.)
- **Handoff:** "Every mechanism so far assumed one path to a row: a direct page read. The next topic is the structure that makes finding the right page fast in the first place — the B-tree."
- **Prerequisites panel:** topics 1–3 (Before this).
- **Visual idea:** this chapter's durability timeline extended with a checkpoint marker, a crash point just after it, and the real amount of WAL a replay must walk through shown at two different checkpoint frequencies (frequent vs. infrequent) against the same crash point — real measured replay distance from this sandbox's own Postgres cluster at two different `checkpoint_timeout` settings.
- **Lab:** none of its own; feeds the §5.1 chapter lab.
- **Sources:** the original ARIES paper (Mohan et al.), Postgres's own WAL/checkpoint and recovery-process documentation — fetched and quoted at research time.

### 5. B-tree indexes in production (`de.b-tree-indexes-production`): full, §5.1

- **Folder:** `b-tree-indexes-production`. About 15 min.
- **Scope:** "B+-tree structure and fanout, page splits and merges, fill factor, Lehman–Yao (B-link) concurrency; index bloat and deduplication (PG13+); multicolumn skip scan (PG18); clustered (InnoDB) vs heap-organised (Postgres) tables and what a secondary-index lookup costs in each" — the full syllabus line.
- **Outcomes:** Describe a B+-tree's own fanout and why it bounds lookup depth; explain a page split/merge and fill factor's effect on both; explain the Lehman–Yao (B-link) approach to concurrent B-tree access without locking the whole tree; explain index deduplication and multicolumn skip scan as real, versioned Postgres features; contrast a secondary-index lookup's real cost on a clustered (InnoDB) table against a heap-organized (Postgres) one.
- **Introduces:** `btree-fanout-blink`. **Uses:** `slotted-page-layout`, `buffer-pool-pin-unpin`. **Declared:** the B-tree background from the Data Structures & Algorithms track's own B-tree topic, assumed rather than re-taught.
- **Bridge:** "Every mechanism so far assumed one path to a row: a direct page read. This topic is the structure that makes finding the right page fast in the first place, and the real concurrency and production features (deduplication, skip scan) a real B-tree index needs." (Answers topic 4's handoff.)
- **Handoff:** "A B-tree index answers 'where is this row' fast, but says nothing about what happens when two transactions want to change the same row at once. That's the next question: MVCC, Postgres's own answer to concurrent writes."
- **Prerequisites panel:** topics 1–4 (Before this); the Data Structures & Algorithms track's B-tree topic named directly as background.
- **Visual idea:** a real B+-tree index inspected on this sandbox's own Postgres cluster (via `pageinspect`'s B-tree functions), drawn as the chapter's page primitive stacked into levels, with a real page split shown as one level growing by one page and the fanout read directly off the real index.
- **Lab:** none of its own; feeds the §5.1 chapter lab.
- **Sources:** Postgres's own B-tree index internals documentation, the Lehman–Yao paper ("Efficient Locking for Concurrent Operations on B-Trees"), Postgres's index-deduplication and PG18 skip-scan release notes/documentation — fetched and quoted at research time.

### 6. MVCC: append versions vs undo logs (`de.mvcc-append-versions-vs`): full, §5.1

- **Folder:** `mvcc-append-versions-vs`. About 15 min.
- **Scope:** "two families of the same idea: Postgres writes new heap tuples (`xmin`/`xmax`, snapshots, commit-log lookups), while InnoDB and Oracle update in place and reconstruct old versions from undo segments; how each affects update cost, index maintenance, long-read behaviour and 'snapshot too old' failures" — the full syllabus line.
- **Outcomes:** Explain Postgres's append-only MVCC (`xmin`/`xmax`, a snapshot, a commit-log lookup) directly against a real updated row inspected in this sandbox's cluster; contrast InnoDB/Oracle's in-place-update-plus-undo-log approach; state how each affects update cost, index maintenance and long-read behaviour; explain an Oracle-style "snapshot too old" failure as the direct consequence of the undo-log approach's own bounded history.
- **Introduces:** `mvcc-versioning`. **Uses:** `slotted-page-layout`, `wal-lsn-fsync`. **Declared:** none beyond topics 1–5.
- **Bridge:** "A B-tree index answers 'where is this row' fast, but says nothing about what happens when two transactions want to change the same row at once. This topic is Postgres's own answer: MVCC, and the entirely different undo-log family InnoDB and Oracle use instead." (Answers topic 5's handoff.)
- **Handoff:** "Postgres's own append-only MVCC never overwrites a row in place — which means every update leaves an old version behind. The next topic is the maintenance job that has to clean that up: vacuum."
- **Prerequisites panel:** topics 1–5 (Before this).
- **Visual idea:** a real updated row inspected directly in this sandbox's Postgres cluster, drawn with its old and new heap tuple side by side, `xmin`/`xmax` fields labeled, next to a second drawing of the same update under an undo-log model (one in-place row, a separate undo record pointing back to the old value) — the two families drawn structurally different, not just described differently.
- **Lab:** none of its own; feeds the §5.1 chapter lab.
- **Sources:** Postgres's own MVCC documentation (concurrency control chapter), InnoDB's own MVCC/undo-log documentation, Oracle's "snapshot too old" documentation — fetched and quoted at research time.

### 7. Vacuum, bloat and transaction-ID wraparound (`de.vacuum-bloat-transaction-id`): full, §5.1

- **Folder:** `vacuum-bloat-transaction-id`. About 15 min. Hosts part of the §5.1 chapter lab.
- **Scope:** "dead tuples, HOT updates, the visibility map, autovacuum tuning; why one long transaction, an abandoned replication slot or a stale prepared transaction pins the xmin horizon and grows every table; 32-bit XID freezing and the wraparound shutdown as a real production outage" — the full syllabus line.
- **Outcomes:** Explain a dead tuple and a HOT update as MVCC's own by-products, measured directly on this sandbox's cluster; explain the visibility map and what autovacuum tunes; state precisely why a long-running transaction, an abandoned replication slot, or a stale prepared transaction pins the xmin horizon and grows every table, demonstrated by holding a real transaction open and charting real bloat; explain 32-bit XID freezing and why a wraparound shutdown is a real, self-inflicted production outage.
- **Introduces:** `vacuum-xid-wraparound`. **Uses:** `mvcc-versioning`. **Declared:** none beyond topic 6.
- **Bridge:** "Postgres's own append-only MVCC never overwrites a row in place, which means every update leaves an old version behind. This topic is the maintenance job that cleans that up — and the real outage that happens when something stops it from running: vacuum, bloat, and transaction-ID wraparound." (Answers topic 6's handoff.)
- **Handoff:** "MVCC is one family's answer to concurrent writes, and vacuum is the bill it pays later. The next topic is the other family entirely — a structure built from the start around never updating in place: the LSM tree."
- **Prerequisites panel:** topics 1–6 (Before this).
- **Visual idea:** a real chart of table size over time while a transaction is held open against this sandbox's own Postgres cluster (bloat visibly growing, then dropping once the transaction releases and autovacuum runs) — the lab's own required measurement, drawn directly as the step's evidence.
- **Lab:** hosts the §5.1 chapter lab's long-running-transaction-bloat leg directly: a real transaction held open against this sandbox's own Postgres cluster while a concurrent workload updates the same table, table size and dead-tuple count charted in real time, then released and autovacuum's own real reclaim measured.
- **Sources:** Postgres's own vacuum/HOT-update/visibility-map documentation, its autovacuum tuning documentation, its transaction-ID wraparound documentation (including real production postmortems where available) — fetched and quoted at research time.

### 8. LSM trees: write and read paths (`de.lsm-trees-write-read`): full, §5.1

- **Folder:** `lsm-trees-write-read`. About 15 min.
- **Scope:** "WAL → memtable (often a skip list) → immutable memtable → sorted SSTable flush; point reads checking newest structures first, guided by per-file Bloom filters and block indexes; range reads merging many sorted runs; tombstones and why deletes are not free" — the full syllabus line.
- **Outcomes:** Trace a real write through RocksDB's own WAL → memtable → immutable memtable → flushed SSTable path; explain why a point read checks newest structures first and how a per-file Bloom filter and block index make that check cheap; explain how a range read merges many sorted runs; explain a tombstone and why a delete in an LSM tree is not free, measured directly against a real RocksDB instance.
- **Introduces:** `lsm-write-read-path`. **Uses:** `wal-lsn-fsync` (the direct contrast: a different engine's own write-ahead log and flush path). **Declared:** a skip list's own structure, from the Data Structures & Algorithms track, assumed rather than re-taught.
- **Bridge:** "MVCC is one family's answer to concurrent writes, and vacuum is the bill it pays later. This topic is the other family entirely — a structure built from the start around never updating in place: the LSM tree, its own write path through a memtable and its own read path through Bloom filters and sorted runs." (Answers topic 7's handoff.)
- **Handoff:** "An LSM tree accumulates sorted runs forever unless something merges them back down. That something is compaction, and how it merges them decides the trade-off the whole structure is built around."
- **Prerequisites panel:** topics 1–7 (Before this); the Data Structures & Algorithms track's skip-list topic named directly as background.
- **Visual idea:** a real write and a real point read traced through a real RocksDB instance in this sandbox, drawn as a vertical stack (memtable at the top, older immutable memtables and SSTables below, newest checked first) with a Bloom-filter check drawn as a fast reject/accept gate in front of each level the read actually touches.
- **Lab:** none of its own; feeds the §5.1 chapter lab's Postgres-vs-RocksDB comparison, completed in topic 9.
- **Sources:** the original LSM-tree paper (O'Neil et al.), RocksDB's own architecture-guide documentation (memtable, flush, Bloom filters, block index) — fetched and quoted at research time.

### 9. LSM compaction and the RUM trade-off (`de.lsm-compaction-rum-trade`): full, §5.1

- **Folder:** `lsm-compaction-rum-trade`. About 15 min. Hosts part of the §5.1 chapter lab.
- **Scope:** "leveled vs tiered (size-tiered/universal) vs FIFO compaction; read, write and space amplification and the RUM conjecture (you can optimise at most two); compaction debt, write stalls and tombstone build-up as production failures; when a B-tree beats an LSM and vice versa (RocksDB, Cassandra, ScyllaDB, Pebble as reference points)" — the full syllabus line.
- **Outcomes:** Contrast leveled, tiered and FIFO compaction strategies; state the RUM conjecture precisely (read, write and space amplification trade off, at most two optimized at once) and back it with a real measured comparison between this sandbox's Postgres and RocksDB instances; explain compaction debt, a write stall and tombstone build-up as real production failure modes; decide, from measured amplification and latency numbers rather than received wisdom, when a B-tree (Postgres) beats an LSM tree (RocksDB) and vice versa.
- **Introduces:** `lsm-compaction-rum`. **Uses:** `lsm-write-read-path`, `btree-fanout-blink`. **Declared:** none beyond topic 8.
- **Bridge:** "An LSM tree accumulates sorted runs forever unless something merges them back down. This topic is that merge, the real trade-off (the RUM conjecture) every compaction strategy makes, and the production failures that strategy's own debt causes." (Answers topic 8's handoff.)
- **Handoff:** "Every mechanism in this section so far lived inside one engine, on one machine. The next section asks what a transaction even means once two transactions can run at the same time at all — starting with a precise restatement of ACID itself."
- **Prerequisites panel:** topics 1–8 (Before this).
- **Visual idea:** this chapter's own write-amplification/space-amplification/p99-latency numbers, measured directly by running the identical insert/update/scan workload against this sandbox's real Postgres and real RocksDB instances, drawn as three paired bars (one per metric) at their real measured heights — the RUM trade-off shown as an actual asymmetry between two real systems, not an abstract triangle.
- **Lab:** hosts the §5.1 chapter lab's Postgres-vs-RocksDB comparison directly: the same insert/update/scan workload run against both, real write amplification, space amplification and p99 read latency measured and compared; the cross-domain build-it-yourself engine (§5.4) is named here as the same comparison *Rust Systems Engineering*'s own from-scratch engine makes, not duplicated.
- **Sources:** the RUM conjecture paper (Athanassoulis et al.), RocksDB's own compaction-styles documentation, real production write-up(s) on LSM compaction debt/write stalls (e.g. from RocksDB's or ScyllaDB's own engineering blog) — fetched and quoted at research time.

### 10. ACID guarantees, precisely stated (`de.acid-guarantees-precisely-stated`): refresher, §5.2

- **Folder:** `acid-guarantees-precisely-stated`. About 5 min.
- **Scope:** "what atomicity, consistency, isolation and durability each actually promise, and which layer (engine vs application) owns 'consistency'" — the full syllabus line.
- **Outcomes:** State what each of atomicity, consistency, isolation and durability actually promises, distinctly from each other; say precisely which layer (the engine or the application) owns "consistency" and why that's the one letter of ACID the engine alone can't guarantee.
- **Introduces:** `acid-guarantees`. **Uses:** `wal-lsn-fsync` (durability's own mechanism), `mvcc-versioning` (isolation's own mechanism, both already built in §5.1). **Declared:** none beyond §5.1.
- **Bridge:** "Every mechanism in §5.1 lived inside one engine, on one machine. This refresher is the precise vocabulary the rest of this section needs before naming what happens when two transactions run at the same time: ACID, each letter stated exactly, and which one the engine can't own alone." (Answers topic 9's handoff.)
- **Handoff:** "Isolation is the one letter with the most room to be violated quietly. The next topic names exactly how, with the real anomalies ANSI's own definitions leave ambiguous."
- **Prerequisites panel:** §5.1 (Before this).
- **Visual idea:** the four letters drawn as four short labeled panels, each with a one-line promise and a small icon of which layer owns it (engine vs application), consistency's own panel visibly split between both.
- **Lab:** none; a refresher, no lab leg of its own.
- **Sources:** the original ACID paper/terminology (Härder & Reuter) or an equivalent primary source, Postgres's own transaction-isolation documentation's framing of the four properties — fetched and quoted at research time.

### 11. Isolation anomalies beyond ANSI (`de.isolation-anomalies-beyond-ansi`): full, §5.2

- **Folder:** `isolation-anomalies-beyond-ansi`. About 15 min.
- **Scope:** "dirty write, dirty read, non-repeatable read, read skew, lost update, write skew, phantoms and the read-only transaction anomaly; why the ANSI SQL-92 definitions are ambiguous (Berenson et al. 1995, Adya's dependency-graph formalisation) and what each anomaly looks like as a two-transaction timeline" — the full syllabus line.
- **Outcomes:** Name and distinguish dirty write, dirty read, non-repeatable read, read skew, lost update, write skew, phantoms and the read-only transaction anomaly; explain why the ANSI SQL-92 definitions are ambiguous, per Berenson et al.'s critique and Adya's dependency-graph formalisation; reproduce at least one real anomaly as an actual two-transaction timeline against this sandbox's own Postgres cluster.
- **Introduces:** `isolation-anomalies`. **Uses:** `acid-guarantees`. **Declared:** none beyond topic 10.
- **Bridge:** "Isolation is the one letter of ACID with the most room to be violated quietly. This topic names exactly how: every real anomaly ANSI's own ambiguous definitions leave out, each shown as a real two-transaction timeline." (Answers topic 10's handoff.)
- **Handoff:** "Snapshot isolation prevents most of these anomalies by construction — but not all of them. The next topic is exactly which it prevents, which one survives, and the vendor-naming traps around calling it 'serializable.'"
- **Prerequisites panel:** §5.1, topic 10 (Before this).
- **Visual idea:** this chapter's two-transaction timeline, drawn once per named anomaly (lost update, write skew, phantom read) with the real conflicting statements from a reproduced run against this sandbox's own Postgres cluster marked at their actual commit order.
- **Lab:** none of its own; feeds topics 12–13's reproductions.
- **Sources:** Berenson et al., "A Critique of ANSI SQL Isolation Levels"; Adya's dissertation/paper on a dependency-graph formalization of isolation — fetched and quoted at research time.

### 12. Snapshot isolation and write skew (`de.snapshot-isolation-write-skew`): full, §5.2

- **Folder:** `snapshot-isolation-write-skew`. About 15 min. Hosts part of the §5.2 chapter lab.
- **Scope:** "how SI works (read from a snapshot, first-committer-wins on write–write conflicts), which anomalies it prevents and why write skew and the read-only anomaly survive; vendor naming traps: Postgres `REPEATABLE READ` is SI, Oracle `SERIALIZABLE` is SI, MySQL InnoDB `REPEATABLE READ` mixes snapshot reads with locking reads" — the full syllabus line.
- **Outcomes:** Explain snapshot isolation's own mechanism (read from a fixed snapshot, first-committer-wins on write–write conflicts); state which of topic 11's anomalies SI prevents by construction and why write skew and the read-only anomaly survive it; name the real vendor-naming traps (Postgres `REPEATABLE READ` is SI; Oracle `SERIALIZABLE` is SI; MySQL InnoDB's `REPEATABLE READ` mixes snapshot and locking reads) and reproduce a real write-skew anomaly (the "on-call doctors" pattern) against this sandbox's own Postgres cluster under `REPEATABLE READ`.
- **Introduces:** `snapshot-isolation`. **Uses:** `isolation-anomalies`, `mvcc-versioning`. **Declared:** none beyond topic 11.
- **Bridge:** "Snapshot isolation prevents most of the anomalies topic 11 named, by construction — but not all of them. This topic is exactly which it prevents, which survives, and a real write-skew reproduction against this sandbox's own Postgres cluster." (Answers topic 11's handoff.)
- **Handoff:** "Write skew survives snapshot isolation. The next topic is the two real ways to close that gap entirely and reach full serializability — one of which is SI itself, made serializable."
- **Prerequisites panel:** §5.1, topics 10–11 (Before this).
- **Visual idea:** the "on-call doctors" write-skew scenario, reproduced for real against this sandbox's Postgres cluster under `REPEATABLE READ`, drawn as the chapter's two-transaction timeline with both transactions reading the same pre-update snapshot and both committing successfully — the anomaly made visible as two commits that should have been impossible together.
- **Lab:** hosts the first half of the §5.2 chapter lab directly: reproducing write skew under Postgres `REPEATABLE READ`.
- **Sources:** Postgres's own transaction-isolation documentation (naming `REPEATABLE READ` as SI), Oracle's own `SERIALIZABLE`-is-SI documentation, MySQL InnoDB's own `REPEATABLE READ` documentation, the Fekete et al. "making snapshot isolation serializable" paper for write skew's formal treatment — fetched and quoted at research time.

### 13. Serializability: strict 2PL versus SSI (`de.serializability-strict-2pl-versus`): full, §5.2

- **Folder:** `serializability-strict-2pl-versus`. About 15 min. Hosts the rest of the §5.2 chapter lab.
- **Scope:** "two routes to the same guarantee: two-phase locking with predicate/next-key locks (block on conflict) vs Serializable Snapshot Isolation (track rw-antidependencies, abort on a dangerous structure; Cahill 2008, Ports & Grittner 2012 for Postgres); throughput, false-positive aborts, and why retries become mandatory application logic" — the full syllabus line.
- **Outcomes:** Contrast strict 2PL (predicate/next-key locks, blocking on conflict) with Serializable Snapshot Isolation (tracking rw-antidependencies, aborting on a dangerous structure); explain Cahill's SSI algorithm and Ports & Grittner's Postgres implementation at a level that would satisfy an expert; rerun topic 12's write-skew scenario under Postgres `SERIALIZABLE` and observe the real serialization failure it now produces; measure real abort rate as contention rises and explain why retries become mandatory application logic under SSI.
- **Introduces:** `serializability-2pl-ssi`. **Uses:** `snapshot-isolation`, `isolation-anomalies`. **Declared:** none beyond topic 12.
- **Bridge:** "Write skew survives snapshot isolation. This topic is the two real routes that close that gap — strict 2PL's blocking locks, and Serializable Snapshot Isolation, the same snapshot mechanism from topic 12 made genuinely serializable." (Answers topic 12's handoff.)
- **Handoff:** "SSI aborts on a dangerous structure instead of blocking; strict 2PL blocks instead of aborting. Both routes still rest on one underlying mechanism neither topic has opened yet: locking itself, and what happens when it deadlocks."
- **Prerequisites panel:** §5.1, topics 10–12 (Before this).
- **Visual idea:** topic 12's exact write-skew scenario rerun against this sandbox's own Postgres cluster under `SERIALIZABLE`, drawn as the same two-transaction timeline but now with one transaction's commit replaced by a real serialization-failure error — the identical scenario, one isolation level higher, with a genuinely different outcome; a second small chart of real measured abort rate rising with contention.
- **Lab:** hosts the second half of the §5.2 chapter lab directly: rerunning write skew under `SERIALIZABLE`, observing the serialization failure, adding retry logic, and measuring abort rate as contention rises.
- **Sources:** Cahill, Röhm & Fekete, "Serializable Isolation for Snapshot Databases" (2008); Ports & Grittner, "Serializable Snapshot Isolation in PostgreSQL" (2012); Postgres's own `SERIALIZABLE` documentation — fetched and quoted at research time.

### 14. Locking, deadlocks and lock escalation (`de.locking-deadlocks-lock-escalation`): full, §5.2

- **Folder:** `locking-deadlocks-lock-escalation`. About 15 min.
- **Scope:** "lock modes and intention locks, row vs page vs table granularity, deadlock detection (wait-for graphs) vs prevention (timeouts, wait-die/wound-wait), lock escalation in SQL Server/Db2, and long DDL locks as a migration hazard" — the full syllabus line.
- **Outcomes:** Name real lock modes and intention locks and explain row/page/table granularity's own trade-off; contrast deadlock detection (a wait-for graph) against deadlock prevention (timeouts, wait-die/wound-wait); explain lock escalation as SQL Server/Db2 implement it; explain why a long-running DDL statement's lock is a real migration hazard, reproduced as a real blocked session against this sandbox's own Postgres cluster.
- **Introduces:** `locking-deadlock-detection`. **Uses:** `serializability-2pl-ssi`. **Declared:** none beyond topic 13.
- **Bridge:** "SSI aborts on a dangerous structure instead of blocking; strict 2PL blocks instead of aborting. This topic opens the blocking mechanism itself — real lock modes and granularity, and what happens when two sessions' locks form a cycle: a deadlock." (Answers topic 13's handoff.)
- **Handoff:** "Locking is pessimistic by nature: it blocks before it knows there's really a conflict. The next topic is the practical choice between that and the optimistic alternative topics 12–13 already showed working."
- **Prerequisites panel:** §5.1, topics 10–13 (Before this).
- **Visual idea:** a real deadlock reproduced between two sessions against this sandbox's own Postgres cluster, drawn as the two-transaction timeline with each transaction's lock wait pointing at the other, closing into a visible cycle, followed by Postgres's own real deadlock-detection error terminating one side.
- **Lab:** none of its own.
- **Sources:** Postgres's own explicit-locking and deadlock-detection documentation, SQL Server's/Db2's own lock-escalation documentation — fetched and quoted at research time.

### 15. Optimistic vs pessimistic concurrency control (`de.optimistic-vs-pessimistic-concurrency`): full, §5.2

- **Folder:** `optimistic-vs-pessimistic-concurrency`. About 15 min.
- **Scope:** "`SELECT … FOR UPDATE` vs version-column compare-and-set vs validate-at-commit OCC; how conflict rate decides the winner; the same pattern reappearing in object-store table commits (§6.3) and distributed SQL (§5.3)" — the full syllabus line.
- **Outcomes:** Contrast `SELECT … FOR UPDATE` (pessimistic locking), a version-column compare-and-set, and validate-at-commit OCC as three real implementations of the same underlying choice; measure, directly against this sandbox's own Postgres cluster at two different conflict rates, which approach actually wins and why; name object-store table commits and distributed SQL's own commit protocols as the same pattern reappearing elsewhere in this course.
- **Introduces:** `occ-vs-pcc`. **Uses:** `locking-deadlock-detection`, `snapshot-isolation`. **Declared:** none beyond topic 14.
- **Bridge:** "Locking is pessimistic by nature: it blocks before it knows there's really a conflict. This topic is the practical choice between that and the optimistic alternative — real `FOR UPDATE`, a version-column compare-and-set, and validate-at-commit OCC, measured against each other at two real conflict rates." (Answers topic 14's handoff.)
- **Handoff:** "Every mechanism in this section so far assumed one engine making one decision. The next topic is what happens the moment a transaction has to span more than one: two-phase commit."
- **Prerequisites panel:** §5.1, topics 10–14 (Before this).
- **Visual idea:** two real measured throughput bars (pessimistic locking vs. optimistic compare-and-set) run at a low-conflict workload and again at a high-conflict workload against this sandbox's own Postgres cluster — the crossover between which approach wins shown as an actual measured reversal, not an assertion.
- **Lab:** none of its own.
- **Sources:** Postgres's own `SELECT ... FOR UPDATE` documentation, a real OCC reference (Kung & Robinson's original optimistic-concurrency-control paper) — fetched and quoted at research time.

### 16. 2PC in production databases (`de.2pc-production-databases`): full, §5.2

- **Folder:** `2pc-production-databases`. About 15 min.
- **Scope:** "prepare/commit as databases run it, coordinator failure leaving participants in doubt (theory in Ch.14), XA in practice, and how distributed SQL systems hide 2PC behind consensus-replicated participants (Spanner, Ch.14 and the M6 case study)" — the full syllabus line (the "theory in Ch.14"/"M6 case study" clauses are cross-references, not content this topic teaches).
- **Outcomes:** Trace a real prepare/commit exchange as a database actually runs it; explain exactly what a coordinator failure leaves participants in (an "in doubt" transaction, named but not formally modeled here — that's Chapter 14's job); name XA as the real standard 2PC implementation and what it costs in practice; explain, at a naming level, how a distributed SQL system hides 2PC behind consensus-replicated participants, setting up §5.3's own consensus and distributed-SQL topics.
- **Introduces:** `two-phase-commit`. **Uses:** `wal-lsn-fsync`. **Declared:** none beyond topic 15.
- **Bridge:** "Every mechanism in this section so far assumed one engine making one decision. This topic is what happens the moment a transaction has to span more than one: prepare, commit, and the real in-doubt state a coordinator failure leaves participants in." (Answers topic 15's handoff.)
- **Handoff:** "A single engine's own transactions are done. The next section spreads that single engine across machines entirely — starting with the replication vocabulary every later topic in it assumes."
- **Prerequisites panel:** §5.1, topics 10–15 (Before this).
- **Visual idea:** this chapter's two-transaction timeline, repurposed as a coordinator-and-two-participants timeline: a prepare phase where both participants acknowledge, then a commit phase, then a second run where the coordinator is cut off between the two phases, leaving both participants visibly stuck "in doubt."
- **Lab:** none of its own.
- **Sources:** the XA specification/standard's own documentation, a real database's own 2PC/XA implementation documentation (e.g. Postgres's `PREPARE TRANSACTION`), a primary account of how a distributed SQL system (Spanner's own paper) layers 2PC over consensus-replicated participants — fetched and quoted at research time.

### 17. Synchronous, asynchronous and semi-synchronous replication (`de.synchronous-asynchronous-semi-synchronous`): refresher, §5.3

- **Folder:** `synchronous-asynchronous-semi-synchronous`. About 5 min.
- **Scope:** "primary/replica topologies, what each acknowledgement mode risks on failover (lost commits vs stalled writes), and failover/promotion basics" — the full syllabus line.
- **Outcomes:** Describe a primary/replica topology; contrast synchronous, asynchronous and semi-synchronous acknowledgement and state precisely what each risks on failover (lost commits vs. stalled writes); describe failover and promotion at a basic level.
- **Introduces:** `replication-ack-modes`. **Uses:** `wal-lsn-fsync`. **Declared:** none beyond §5.2.
- **Bridge:** "A single engine's own transactions are done. This refresher opens the vocabulary every later topic in this section assumes: a primary and its replicas, and exactly what each acknowledgement mode risks the moment the primary fails." (Answers topic 16's handoff.)
- **Handoff:** "This refresher treated replication as one undifferentiated thing. The next topic is the two genuinely different mechanisms hiding behind that word: shipping WAL bytes versus shipping decoded row changes."
- **Prerequisites panel:** §5.1–§5.2 (Before this).
- **Visual idea:** a primary/replica pair drawn as two of this chapter's node-timeline lanes, with a commit event on the primary and an acknowledgement marker placed at three different points relative to it (synchronous, asynchronous, semi-synchronous), and a failover drawn at each point to show exactly what's lost or stalled.
- **Lab:** none; a refresher, no lab leg of its own.
- **Sources:** Postgres's own replication documentation (synchronous/asynchronous/`synchronous_commit` modes), MySQL's own semi-synchronous replication documentation — fetched and quoted at research time.

### 18. Physical vs logical replication (`de.physical-vs-logical-replication`): full, §5.3

- **Folder:** `physical-vs-logical-replication`. About 15 min.
- **Scope:** "shipping WAL bytes (exact block copy, same major version) vs decoded row changes (cross-version, selective, the basis of CDC); Postgres replication slots and the WAL-retention outage when a consumer stalls; failover-safe logical slots (PG17+); MySQL row-based binlog as the equivalent" — the full syllabus line.
- **Outcomes:** Contrast physical replication (exact WAL-byte shipping, same major version only) with logical replication (decoded row changes, cross-version, selective, the basis of CDC); set up and inspect a real Postgres replication slot against this sandbox's own cluster, and explain the real WAL-retention outage that occurs when its consumer stalls; name failover-safe logical slots (PG17+) and MySQL's row-based binlog as the same idea elsewhere.
- **Introduces:** `physical-vs-logical-replication`. **Uses:** `replication-ack-modes`, `wal-lsn-fsync`. **Declared:** none beyond topic 17.
- **Bridge:** "This section's refresher treated replication as one undifferentiated thing. This topic is the two genuinely different mechanisms hiding behind that word: physical WAL-byte shipping, and logical, decoded row changes — reproduced directly, including the real WAL-retention outage a stalled logical slot causes." (Answers topic 17's handoff.)
- **Handoff:** "A replica that's falling behind isn't just a retention risk — it's a real, measurable lag with real consequences for anything reading from it. The next topic is exactly that lag, and what an application can do about it."
- **Prerequisites panel:** §5.1–§5.2, topic 17 (Before this).
- **Visual idea:** a real logical replication slot created against this sandbox's own Postgres cluster, its consumer stopped deliberately, and the resulting WAL retention growth charted in real time until the outage is visible — the exact failure the syllabus names, reproduced rather than described.
- **Lab:** none of its own; feeds the §5.3 chapter lab.
- **Sources:** Postgres's own physical-replication and logical-decoding/replication-slot documentation, its PG17 failover-safe-slots release notes, MySQL's own binlog (row-based replication) documentation — fetched and quoted at research time.

### 19. Replication lag and session guarantees (`de.replication-lag-session-guarantees`): full, §5.3

- **Folder:** `replication-lag-session-guarantees`. About 15 min. Hosts the §5.3 chapter lab.
- **Scope:** "read-your-writes, monotonic reads and consistent-prefix reads; implementing them with LSN/GTID tokens, sticky routing or primary fallback; what lag does to dashboards and downstream pipelines (formal consistency models live in Ch.14)" — the full syllabus line.
- **Outcomes:** Define read-your-writes, monotonic reads and consistent-prefix reads precisely; measure real replication lag against this sandbox's own Postgres cluster and deliberately break read-your-writes by reading from a lagging replica; fix it with a real LSN token (or sticky routing/primary fallback) and confirm the guarantee holds again; explain what lag does to a dashboard or a downstream pipeline reading from a replica.
- **Introduces:** `session-consistency-guarantees`. **Uses:** `physical-vs-logical-replication`. **Declared:** none beyond topic 18.
- **Bridge:** "A replica that's falling behind isn't just a retention risk — it's a real, measurable lag with real consequences for anything reading from it. This topic measures that lag directly, breaks read-your-writes with it, and fixes the break with a real LSN token." (Answers topic 18's handoff.)
- **Handoff:** "Lag is what a network partition costs you in the normal case. The next topic names precisely what it costs you in the worst case: CAP and PACELC."
- **Prerequisites panel:** §5.1–§5.2, topics 17–18 (Before this).
- **Visual idea:** a real client writing to the primary and immediately reading from a lagging replica against this sandbox's own Postgres cluster, drawn as the node-timeline with the write and the stale read shown explicitly out of order, then the identical sequence redrawn correctly once an LSN token forces the read to wait for the replica to catch up.
- **Lab:** hosts the §5.3 chapter lab's directly runnable portion: measuring real replication lag under write load, breaking and fixing read-your-writes with an LSN token; true multi-node leader-kill failover timing is disclosed as sourced-only where this sandbox can't run a genuine second host, demonstrated instead on local replica connections wherever Postgres allows it.
- **Sources:** Postgres's own documentation on monitoring replication lag and LSN-based consistency, the session-guarantees terminology from the distributed-systems literature (Terry et al.'s session guarantees paper) — fetched and quoted at research time.

### 20. CAP and PACELC in practice (`de.cap-pacelc-practice`): full, §5.3

- **Folder:** `cap-pacelc-practice`. About 15 min.
- **Scope:** "CAP as a statement about behaviour during a partition (PA vs PC); PACELC adding the normal-case latency-vs-consistency trade (EL vs EC), with systems classified (Dynamo/Cassandra PA/EL, Spanner PC/EC); failure domains (process, host, rack, AZ, region) as what 'partition' means physically" — the full syllabus line.
- **Outcomes:** State CAP precisely as a statement about behaviour *during* a partition (PA vs. PC), not a claim about normal operation; explain what PACELC adds (the normal-case latency-vs-consistency trade, EL vs. EC); classify real systems (Dynamo/Cassandra as PA/EL, Spanner as PC/EC) and justify the classification from their own documented designs; name the real failure domains (process, host, rack, AZ, region) that "a partition" means physically.
- **Introduces:** `cap-pacelc`. **Uses:** `replication-ack-modes`. **Declared:** none beyond topic 19.
- **Bridge:** "Lag is what a network partition costs you in the normal case. This topic names precisely what it costs you in the worst case: CAP's own PA-vs-PC choice, and PACELC's addition of the normal-case trade lag already demonstrated." (Answers topic 19's handoff.)
- **Handoff:** "Every replication topic so far assumed the same data lived on every node. The next topic is the orthogonal axis: splitting the data itself across nodes, starting with the real schemes for doing it."
- **Prerequisites panel:** §5.1–§5.2, topics 17–19 (Before this).
- **Visual idea:** a real failure domain hierarchy (process → host → rack → AZ → region) drawn as nested boxes, with Dynamo/Cassandra and Spanner placed on a two-axis PA/PC-by-EL/EC grid, each system's placement backed by a quoted line from its own documentation.
- **Lab:** none of its own.
- **Sources:** Brewer's own CAP retrospective ("CAP Twelve Years Later"), the PACELC paper (Abadi), Dynamo's own paper, Spanner's own paper — fetched and quoted at research time.

### 21. Partitioning schemes: range, hash, consistent hashing (`de.partitioning-schemes-range-hash`): full, §5.3

- **Folder:** `partitioning-schemes-range-hash`. About 15 min.
- **Scope:** "range partitioning (ordered scans, hot tails) vs hash partitioning (even spread, no range scans); consistent hashing with virtual nodes and rendezvous hashing to limit data movement on membership change (algorithm in → *Data Structures & Algorithms* Ch.2); request routing via client, proxy or coordinator; partitioning vs replication as independent axes" — the full syllabus line.
- **Outcomes:** Contrast range partitioning (ordered scans, a real hot-tail problem demonstrated directly) with hash partitioning (even spread, no range scans); explain consistent hashing with virtual nodes and rendezvous hashing as two ways to limit data movement on membership change, assuming the algorithm itself from the Data Structures & Algorithms track; contrast client-side, proxy and coordinator request routing; state explicitly why partitioning and replication are independent axes, not two names for the same thing.
- **Introduces:** `partitioning-schemes`. **Uses:** `cap-pacelc`. **Declared:** consistent hashing's own algorithm, from the Data Structures & Algorithms track, assumed rather than re-taught.
- **Bridge:** "Every replication topic so far assumed the same data lived on every node. This topic is the orthogonal axis: splitting the data itself across nodes, with range and hash partitioning's own real trade-offs and consistent hashing's answer to membership change." (Answers topic 20's handoff.)
- **Handoff:** "Partitioning's own clean theory runs into a real practical failure the moment one key gets far more traffic than the rest. The next topic is exactly that: shard keys and the hot shards a bad one creates."
- **Prerequisites panel:** §5.1–§5.2, topics 17–20 (Before this); the Data Structures & Algorithms track's consistent-hashing topic named directly as background.
- **Visual idea:** a range-partitioned key space drawn as a line with one hot segment visibly absorbing more write traffic than the rest, next to a hash-partitioned key space drawn as an evenly shaded ring — then the same ring redrawn with virtual nodes to show how little data moves when one node joins or leaves, versus how much would move under plain modulo hashing.
- **Lab:** none of its own.
- **Sources:** a real distributed database's own partitioning documentation (e.g. CockroachDB's or Cassandra's own range/hash partitioning docs), the consistent-hashing paper (Karger et al.), the rendezvous-hashing paper (Thaler & Ravishankar) — fetched and quoted at research time.

### 22. Shard keys, hot shards and resharding (`de.shard-keys-hot-shards`): full, §5.3

- **Folder:** `shard-keys-hot-shards`. About 15 min.
- **Scope:** "choosing a shard key from access patterns (tenant, user, time) and cardinality; celebrity keys and salting/splitting; secondary indexes across shards (local vs global); online resharding and range splits (Vitess, CockroachDB, DynamoDB partition splits) and the cost of moving data under load" — the full syllabus line.
- **Outcomes:** Choose a shard key from real access patterns and cardinality, not just "what's unique"; explain a celebrity key and the salting/splitting fix; contrast local and global secondary indexes across shards; explain online resharding and range splits (naming Vitess, CockroachDB, DynamoDB's own documented mechanisms) and the real cost of moving data under load.
- **Introduces:** `shard-key-resharding`. **Uses:** `partitioning-schemes`. **Declared:** none beyond topic 21.
- **Bridge:** "Partitioning's own clean theory runs into a real practical failure the moment one key gets far more traffic than the rest. This topic is exactly that: choosing a shard key from real access patterns, the celebrity-key failure a bad one creates, and what resharding actually costs to fix it." (Answers topic 21's handoff.)
- **Handoff:** "Every mechanism in this section so far assumed replicas and shards stay in sync and agree on membership changes without a formal protocol for it. The next topic is that protocol: consensus."
- **Prerequisites panel:** §5.1–§5.2, topics 17–21 (Before this).
- **Visual idea:** a shard key chosen by cardinality alone shown absorbing one celebrity key's disproportionate traffic on one shard, next to the same workload under a salted key spread evenly across shards — real or realistically modeled traffic distributions, drawn as uneven vs. even bar heights across shards.
- **Lab:** none of its own.
- **Sources:** Vitess's own resharding/VReplication documentation, CockroachDB's own range-splitting documentation, DynamoDB's own adaptive-capacity/partition-split documentation — fetched and quoted at research time.

### 23. Consensus inside data systems (`de.consensus-inside-data-systems`): full, §5.3

- **Folder:** `consensus-inside-data-systems`. About 15 min.
- **Scope:** "where Raft and Paxos actually run in a data stack (Kafka KRaft, etcd for Kubernetes, per-range Raft in CockroachDB/TiKV, Multi-Paxos per DynamoDB partition), what a commit costs in round trips, and what losing quorum looks like operationally" — the full syllabus line (the "theory in Ch.14"/build-depth clauses are cross-references, not content this topic teaches).
- **Outcomes:** Name where Raft or Paxos actually runs inside a real data stack (Kafka's KRaft, etcd, per-range Raft in CockroachDB/TiKV, Multi-Paxos per DynamoDB partition), from each system's own documentation; state what a commit under consensus costs in round trips; explain, operationally rather than theoretically, what losing quorum looks like and why a data system stops accepting writes rather than risk a split-brain.
- **Introduces:** `consensus-raft-paxos-in-systems`. **Uses:** `two-phase-commit`, `cap-pacelc`. **Declared:** Raft/Paxos's own algorithmic content, assumed as background theory covered elsewhere (Chapter 14) rather than re-derived here.
- **Bridge:** "Every mechanism in this section so far assumed replicas and shards stay in sync and agree on membership changes without a formal protocol for it. This topic is that protocol: where Raft and Paxos actually run inside a real data stack, what a commit costs in round trips, and what losing quorum looks like operationally." (Answers topic 22's handoff.)
- **Handoff:** "Every mechanism in this section — replication, partitioning, consensus — is a building block. The next topic closes the section by showing a real system (Spanner's pattern) built from all of them at once."
- **Prerequisites panel:** §5.1–§5.2, topics 17–22 (Before this).
- **Visual idea:** this chapter's node timeline redrawn as a consensus round (a leader proposing, a quorum of followers acknowledging, a commit only once the quorum is reached), with a second run showing one follower below quorum size and the leader visibly refusing to commit — "losing quorum" shown as a real refusal, not an abstract risk.
- **Lab:** none of its own.
- **Sources:** the Raft paper (Ongaro & Ousterhout) and its own documentation/visualization site, Kafka's own KRaft documentation, etcd's own Raft documentation, CockroachDB's/TiKV's own per-range-Raft documentation — fetched and quoted at research time.

### 24. Distributed SQL architecture (`de.distributed-sql-architecture`): full, §5.3

- **Folder:** `distributed-sql-architecture`. About 15 min.
- **Scope:** "the Spanner pattern made mainstream: range-sharded keyspace, consensus group per range, MVCC with timestamps (TrueTime, hybrid logical clocks), and 2PC across ranges; CockroachDB, TiDB, YugabyteDB, and Aurora DSQL's alternative (optimistic concurrency with conflict checks only at commit, GA May 2025); the latency price and when 'shard a boring Postgres' wins instead" — the full syllabus line (the "M6 case study" clause is a cross-reference, not content this topic teaches).
- **Outcomes:** Describe the Spanner pattern precisely (a range-sharded keyspace, a consensus group per range, MVCC with timestamps via TrueTime or a hybrid logical clock, 2PC across ranges) as the composition of topics 21–23's own mechanisms; name CockroachDB, TiDB and YugabyteDB as real systems following this pattern and Aurora DSQL's documented alternative (optimistic concurrency, conflict checks only at commit); state the real latency price distributed SQL pays for this and when "shard a boring Postgres yourself" wins instead.
- **Introduces:** `distributed-sql-architecture`. **Uses:** `consensus-raft-paxos-in-systems`, `mvcc-versioning`, `two-phase-commit`. **Declared:** none beyond topic 23.
- **Bridge:** "Every mechanism in this section — replication, partitioning, consensus — is a building block. This topic closes the section by showing a real system built from all of them at once: the Spanner pattern, and the alternative systems and trade-offs that followed it." (Answers topic 23's handoff.)
- **Handoff:** "Every mechanism in this chapter so far protected a write. The next section turns to the read side most of that protection exists for in the first place: caching, starting with the patterns and eviction policies every cache is built from."
- **Prerequisites panel:** §5.1–§5.2, topics 17–23 (Before this).
- **Visual idea:** the Spanner pattern drawn as a composite of this chapter's own earlier diagrams already built — a partitioned keyspace (topic 21's ring, range-sharded instead), a consensus group per range (topic 23's quorum diagram, repeated per shard), and a 2PC exchange across two such groups (topic 16's coordinator timeline, now between two consensus groups instead of two plain engines) — making the point visually that distributed SQL is a composition, not a new primitive.
- **Lab:** none of its own.
- **Sources:** the Spanner paper (Corrigan-Gibbs et al. / the original OSDI paper), CockroachDB's own architecture documentation, Aurora DSQL's own announcement/architecture documentation (optimistic concurrency, commit-time conflict checks) — fetched and quoted at research time.

### 25. Cache patterns and eviction policies (`de.cache-patterns-eviction-policies`): full, §5.5

- **Folder:** `cache-patterns-eviction-policies`. About 15 min.
- **Scope:** "cache-aside, read-through, write-through, write-behind and the failure each risks; TTLs; LRU vs LFU vs W-TinyLFU (Caffeine) and why admission matters as much as eviction" — the full syllabus line (the "structures in → Data Structures & Algorithms Ch.5" clause is a cross-reference, not content this topic teaches).
- **Outcomes:** Contrast cache-aside, read-through, write-through and write-behind, and name precisely what failure each risks; explain a TTL; contrast LRU, LFU and W-TinyLFU (Caffeine's own admission-plus-eviction policy) and explain why an admission policy matters as much as an eviction policy, with a real measured hit-rate comparison.
- **Introduces:** `cache-patterns-eviction`. **Uses:** `buffer-pool-pin-unpin` (the direct structural parallel: a buffer pool is itself a cache with its own eviction policy). **Declared:** none beyond §5.1–§5.3.
- **Bridge:** "Every mechanism in this chapter so far protected a write. This section turns to the read side most of that protection exists for in the first place: caching, starting with the real patterns (cache-aside, read-through, write-through, write-behind) and eviction policies every cache is built from — the same eviction problem §5.1's buffer pool already solved once, now solved again at the application layer." (Answers topic 24's handoff.)
- **Handoff:** "An eviction policy alone says nothing about whether a cached value is still correct. The next topic is the harder problem: cache consistency and invalidation."
- **Prerequisites panel:** §5.1–§5.3 (Before this).
- **Visual idea:** the same ring-buffer-vs-plain-LRU comparison from topic 2's buffer pool, redrawn one layer up as an application cache, with a real measured hit-rate comparison between plain LRU and W-TinyLFU on a realistic (skewed) access pattern — the structural echo of topic 2 made explicit.
- **Lab:** none of its own; feeds the §5.5 chapter lab.
- **Sources:** a real cache library's own documentation naming these patterns (e.g. AWS's or a cloud provider's caching-strategies guide), the Caffeine cache's own W-TinyLFU documentation/design write-up — fetched and quoted at research time.

### 26. Cache consistency and invalidation (`de.cache-consistency-invalidation`): full, §5.5

- **Folder:** `cache-consistency-invalidation`. About 15 min. Hosts part of the §5.5 chapter lab.
- **Scope:** "the delete-after-write race and why 'update the cache' is wrong; versioned keys, leases against stale sets (the Memcache-at-Facebook design), CDC-driven invalidation from the database log, and deciding per field how stale is acceptable (the TAO case study)" — the full syllabus line.
- **Outcomes:** Reproduce the real delete-after-write race against this sandbox's own cache-aside layer and explain precisely why "update the cache" (rather than invalidate it) is the wrong fix; explain versioned keys and leases against stale sets, per Facebook's own Memcache design; explain CDC-driven invalidation from the database log, connecting directly to topic 18's logical replication; explain, per the TAO case study, why how-stale-is-acceptable is a per-field decision, not a single global rule.
- **Introduces:** `cache-consistency-invalidation`. **Uses:** `cache-patterns-eviction`, `physical-vs-logical-replication`. **Declared:** none beyond topic 25.
- **Bridge:** "An eviction policy alone says nothing about whether a cached value is still correct. This topic is the harder problem: the delete-after-write race reproduced directly, and the real fixes (versioned keys, leases, CDC-driven invalidation) production systems actually use." (Answers topic 25's handoff.)
- **Handoff:** "Every pattern in this section so far has been described abstractly, independent of any one real cache engine. The next topic is one real engine's actual internals: Redis and Valkey."
- **Prerequisites panel:** §5.1–§5.3, topic 25 (Before this).
- **Visual idea:** the delete-after-write race reproduced for real (a write landing on the database between a cache's read-miss and its write-back), drawn as a three-lane timeline (writer, reader, cache) with the stale value visibly written back after the real update — then the identical sequence redrawn with a lease in place, the stale write now rejected.
- **Lab:** hosts the §5.5 chapter lab's single-flight-coalescing, early-expiration and delete-after-write-race legs directly.
- **Sources:** "Scaling Memcache at Facebook" (Nishtala et al., the leases-and-versioned-keys design), "TAO: Facebook's Distributed Data Store for the Social Graph" (the per-field staleness case study) — fetched and quoted at research time.

### 27. Redis and Valkey internals (`de.redis-valkey-internals`): full, §5.5

- **Folder:** `redis-valkey-internals`. About 15 min. Hosts part of the §5.5 chapter lab.
- **Scope:** "single-threaded event loop with I/O threads, data structures as the API, RDB vs AOF persistence, async replication and the writes lost on failover, Redis Cluster's 16,384 hash slots; licensing history (2024 move to RSALv2/SSPL, the BSD-licensed Valkey fork under the Linux Foundation, Redis 8 adding AGPLv3 in May 2025) as a platform-selection factor" — the full syllabus line.
- **Outcomes:** Explain Redis/Valkey's single-threaded event loop with I/O threads as its own concurrency model, directly against Chapter 4's asyncio event loop for contrast; contrast RDB and AOF persistence; explain async replication's own real failover data-loss risk, demonstrated against this sandbox's real instance; name Redis Cluster's 16,384 hash slots as a concrete instance of topic 21's hash partitioning; state the real 2024–2025 licensing history (RSALv2/SSPL, the Valkey fork, Redis 8's AGPLv3) as a genuine platform-selection factor.
- **Introduces:** `redis-valkey-internals`. **Uses:** `cache-patterns-eviction`. **Declared:** the asyncio event loop from Chapter 4, used directly for contrast.
- **Bridge:** "Every pattern in this section so far has been described abstractly, independent of any one real cache engine. This topic is one real engine's actual internals: Redis/Valkey's own event loop, persistence model, replication, and the real licensing history that now decides which of the two you actually choose." (Answers topic 26's handoff.)
- **Handoff:** "A cache in front of a database is one read-side pattern. The next topic is a different one this chapter hasn't yet connected to Chapter 3's own warehouse material: pre-aggregated, analytical serving layers."
- **Prerequisites panel:** §5.1–§5.3, topics 25–26 (Before this).
- **Visual idea:** a real cache-aside layer built against this sandbox's own real Redis or Valkey instance in front of Postgres, with a real hot-key expiry under concurrent readers measured directly (the §5.5 lab's own required measurement, scaled honestly to what this sandbox's connection limits allow), drawn as a spike in real database query load the instant the key expires.
- **Lab:** hosts the §5.5 chapter lab's cache-aside-layer and hot-key-expiry-under-concurrency legs directly.
- **Sources:** Redis's/Valkey's own documentation on the event loop, RDB/AOF persistence, replication and Redis Cluster hash slots; the 2024 licensing-change announcement and the Valkey/Linux-Foundation announcement; Redis 8's AGPLv3 announcement — fetched and quoted at research time.

### 28. Analytical serving layers (`de.analytical-serving-layers`): full, §5.5

- **Folder:** `analytical-serving-layers`. About 15 min.
- **Scope:** "pre-aggregation, materialized serving tables and cubes, and when to move from warehouse queries to a real-time OLAP store (Druid, Pinot, ClickHouse — engine detail in §6.4 and §9.3); freshness vs concurrency vs cost" — the full syllabus line (the "engine detail in §6.4 and §9.3" clause is a cross-reference, not content this topic teaches).
- **Outcomes:** Explain pre-aggregation, a materialized serving table and a cube as three real techniques for the same goal; decide, from a real freshness-vs-concurrency-vs-cost trade-off, when to move from plain warehouse queries (Chapter 3's own subject) to a real-time OLAP store, naming Druid, Pinot and ClickHouse as real reference points without building their engine internals (that's §6.4/§9.3's job).
- **Introduces:** `analytical-serving-layers`. **Uses:** `cache-patterns-eviction`, `partitioning-schemes`. **Declared:** Chapter 3's warehouse/dimensional-modeling material, used directly for contrast.
- **Bridge:** "A cache in front of a database is one read-side pattern. This topic is a different one this chapter hasn't yet connected to Chapter 3's own warehouse material: pre-aggregation and materialized serving layers, and precisely when a real-time OLAP store earns its own cost over plain warehouse queries." (Answers topic 27's handoff.)
- **Handoff:** "Every read-side pattern so far assumed a reader pulling from a store. The next topic is the opposite direction entirely — a consumer reading what a producer wrote, through a queue or a log."
- **Prerequisites panel:** §5.1–§5.3, topics 25–27 (Before this); Chapter 3's warehouse/dimensional-modeling topics named directly as background.
- **Visual idea:** the same query drawn served three ways — a cold warehouse scan, a pre-aggregated materialized table, and a real-time OLAP store — with real or realistically modeled latency and freshness numbers for each, the freshness-vs-concurrency-vs-cost trade-off shown as three bars that don't all win together.
- **Lab:** none of its own.
- **Sources:** a real-time OLAP store's own architecture documentation (Druid's, Pinot's, or ClickHouse's own docs on pre-aggregation/materialized views) — fetched and quoted at research time.

### 29. Message queues vs event logs (`de.message-queues-vs-event`): full, §5.5

- **Folder:** `message-queues-vs-event`. About 15 min.
- **Scope:** "per-message ack and redelivery without replay (RabbitMQ, SQS) vs offset-based replayable logs (Kafka); choosing by replay, ordering and fan-out; Kafka 4.2 share groups (KIP-932 'queues for Kafka', production-ready Feb 2026) blurring the line" — the full syllabus line (the "Kafka internals in Ch.9" clause is a cross-reference, not content this topic teaches).
- **Outcomes:** Contrast per-message ack-and-redelivery queues (RabbitMQ, SQS) with offset-based replayable logs (Kafka); choose between the two from a workload's real replay, ordering and fan-out needs; name Kafka's own share groups (KIP-932) as a real, documented feature blurring that line, disclosed as sourced-only if this sandbox can't run a real multi-broker Kafka cluster directly.
- **Introduces:** `queues-vs-logs`. **Uses:** `wal-lsn-fsync` (the direct structural parallel: a replayable log is itself an append-only, offset-addressed WAL). **Declared:** none beyond §5.5's earlier topics.
- **Bridge:** "Every read-side pattern so far assumed a reader pulling from a store. This topic is the opposite direction entirely: a consumer reading what a producer wrote, through either a per-message queue that forgets what it delivered, or a replayable log that doesn't — the same append-only, offset-addressed idea §5.1's own WAL already introduced, one layer up." (Answers topic 28's handoff.)
- **Handoff:** "Every mechanism in this chapter answered a question with an exact result. The next section's closes the chapter with the opposite idea entirely: structures that trade a small, bounded error for a massive reduction in memory, starting with the simplest — Bloom, cuckoo and xor filters."
- **Prerequisites panel:** §5.1–§5.3, topics 25–28 (Before this).
- **Visual idea:** the identical message delivered through both systems side by side — a queue (RabbitMQ/SQS-style) shown acking and removing the message, unable to redeliver it once consumed and forgotten, next to a log (Kafka-style) shown advancing a consumer offset while the message itself stays put, replayable by resetting the offset.
- **Lab:** none of its own.
- **Sources:** RabbitMQ's/SQS's own documentation on message acknowledgement and redelivery, Kafka's own documentation on offsets and log retention, the KIP-932 ("Queues for Kafka") proposal/release documentation — fetched and quoted at research time.

### 30. Bloom, cuckoo and xor filters (`de.bloom-cuckoo-xor-filters`): full, §5.6

- **Folder:** `bloom-cuckoo-xor-filters`. About 15 min.
- **Scope:** "approximate membership with no false negatives; sizing from target false-positive rate (bits per key, hash count); cuckoo filters adding deletes, xor/binary-fuse and ribbon filters (RocksDB) trading build cost for space; uses in LSM reads, Parquet column filters (§6.2), join pruning and runtime filters" — the full syllabus line.
- **Outcomes:** Explain approximate membership with no false negatives as a Bloom filter's own core guarantee; size a real Bloom filter from a target false-positive rate (bits per key, hash count) and measure its real false-positive rate against a real data set; explain what a cuckoo filter adds (real deletes) and what xor/binary-fuse/ribbon filters trade (build cost for space); name the real systems (LSM reads, already built in topic 8; Parquet column filters, Chapter 6's own subject; join pruning; runtime filters) that use this family of structure.
- **Introduces:** `probabilistic-membership-filters`. **Uses:** `lsm-write-read-path` (the direct connection: topic 8's own per-file Bloom filters are a real, already-seen instance of this family). **Declared:** a hash function's own basic behavior, from Chapter 1.
- **Bridge:** "Every mechanism in this chapter answered a question with an exact result. This topic closes the chapter's last section by opening the opposite idea: a structure that trades a small, bounded error for a massive reduction in memory — the Bloom filter family, and the real system (topic 8's own LSM reads) that already used one without this topic naming it yet." (Answers topic 29's handoff.)
- **Handoff:** "Membership ('is it in there') is one question a tiny structure can answer approximately. The next topic is a completely different question answered the same way: how many distinct values are there, without storing any of them."
- **Prerequisites panel:** §5.1–§5.3, topic 8, topics 25–29 (Before this).
- **Visual idea:** this chapter's own sketch primitive (a small fixed-size bit array next to the real stream of input it summarizes) drawn for a real Bloom filter built and queried against a real dataset in this sandbox, with its real measured false-positive rate shown next to the theoretical rate its own sizing formula predicted.
- **Lab:** none of its own; feeds topic 31's lab, and names Count-Min Sketch (a *(skipped)* syllabus entry) as a related, sourced-only structure rather than building it.
- **Sources:** the original Bloom filter paper, the cuckoo filter paper (Fan et al.), the xor filter paper (Graf & Lemire), RocksDB's own ribbon-filter documentation — fetched and quoted at research time.

### 31. HyperLogLog and distinct counting (`de.hyperloglog-distinct-counting`): full, §5.6

- **Folder:** `hyperloglog-distinct-counting`. About 15 min. Hosts the §5.6 chapter lab.
- **Scope:** "leading-zero estimation, registers and harmonic mean, HLL++ bias correction and sparse mode; mergeability across partitions and time; what `APPROX_COUNT_DISTINCT` returns vs exact `COUNT(DISTINCT)`; Theta/KMV sketches when you need set intersection and difference" — the full syllabus line.
- **Outcomes:** Build a real HyperLogLog sketch from leading-zero estimation, registers and a harmonic mean, and measure its real error vs. memory against an exact count on a Zipf-skewed stream; explain HLL++'s bias correction and sparse mode as real refinements; merge real sketches across simulated partitions and confirm the merged estimate matches a single-pass sketch; contrast `APPROX_COUNT_DISTINCT` against exact `COUNT(DISTINCT)`; name Theta/KMV sketches as the tool needed once set intersection or difference, not just cardinality, matters.
- **Introduces:** `hyperloglog-distinct-counting`. **Uses:** `probabilistic-membership-filters` (the sibling sketch-family contrast: membership vs. cardinality, same small-fixed-memory idea). **Declared:** none beyond topic 30.
- **Bridge:** "Membership is one question a tiny structure can answer approximately. This topic is a completely different question answered the same way: how many distinct values are there, built and measured for real against an exact count on a Zipf-skewed stream." (Answers topic 30's handoff.)
- **Handoff:** "Counting distinct values is one single number a sketch can approximate. The next, closing topic is a sketch for an entire distribution at once: a quantile."
- **Prerequisites panel:** §5.1–§5.3, topics 25–30 (Before this).
- **Visual idea:** this chapter's sketch primitive, drawn for a real HyperLogLog built in this sandbox against a real Zipf-skewed stream, with real measured error-vs-memory plotted against an exact `COUNT(DISTINCT)` at several register-count sizes — then two real sketches merged and the merged estimate compared directly against a single-pass sketch over the same combined data.
- **Lab:** hosts the §5.6 chapter lab directly: a real HyperLogLog and a real Count-Min Sketch (the latter built here as this topic's own worked comparison, since Count-Min Sketch itself is a *(skipped)* syllabus entry with no topic of its own) measured for error vs. memory against exact counts on a Zipf-skewed stream, then merged across simulated partitions.
- **Sources:** the HyperLogLog paper (Flajolet et al.) and the HLL++ paper (Google's improvement), a real warehouse engine's own `APPROX_COUNT_DISTINCT` documentation, the KMV/Theta-sketch literature for set intersection/difference — fetched and quoted at research time.

### 32. Quantile sketches: t-digest, DDSketch, KLL (`de.quantile-sketches-t-digest`): full, §5.6

- **Folder:** `quantile-sketches-t-digest`. About 15 min.
- **Scope:** "rank-error vs relative-error guarantees, why averaging per-partition percentiles is wrong, mergeability, and which engines and observability tools use which" — the full syllabus line.
- **Outcomes:** Contrast a rank-error guarantee (KLL) against a relative-error guarantee (t-digest, DDSketch); demonstrate directly why averaging per-partition percentiles is mathematically wrong, with a real counterexample; merge real quantile sketches across partitions and confirm the result stays a valid approximation, unlike the naive average; name which real engines and observability tools use which sketch (e.g. DDSketch in Datadog, t-digest in several warehouse engines' own percentile functions).
- **Introduces:** `quantile-sketches`. **Uses:** `hyperloglog-distinct-counting` (the closing thread: the third and last major sketch family this chapter builds, after membership and cardinality). **Declared:** none beyond topic 31.
- **Bridge:** "Counting distinct values is one single number a sketch can approximate. This closing topic is a sketch for an entire distribution at once: a quantile, with a real demonstration of why averaging per-partition percentiles is simply wrong, and why a real mergeable sketch fixes it." (Answers topic 31's handoff.)
- **Handoff:** "This chapter opened at the single physical page an engine reads and writes and closed at a sketch that approximates an entire distribution in a few kilobytes — the full range between an engine's own internals and the statistics built on top of it. The next chapter turns to the files these engines and sketches actually read and write at rest, starting with the oldest and most trap-ridden of them: plain-text interchange formats like CSV and JSON."
- **Prerequisites panel:** §5.1–§5.3, topics 25–31 (Before this).
- **Visual idea:** a real p99 computed three ways on the same partitioned, real dataset in this sandbox — a naive average of per-partition p99s (visibly wrong against the true value), a single merged quantile sketch (visibly correct, within its own error guarantee), and the true exact value computed directly — the three bars at their real measured heights make the "averaging percentiles is wrong" claim undeniable rather than asserted.
- **Lab:** none of its own.
- **Sources:** the t-digest paper/reference implementation documentation (Dunning), the DDSketch paper (Masson, Rim & Lee), the KLL sketch paper (Karnin, Lang & Liberty), a real observability tool's own documentation naming which sketch it uses (e.g. Datadog's DDSketch write-up) — fetched and quoted at research time.
