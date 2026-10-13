# Rust Systems Engineering — shortlist of topics to cut (13 October 2026)

**Why.** The Rust syllabus has 155 topics and 6 cases. The owner's Rust position is "Rust developer for data infrastructure": the TI Rust ETL engine, the public Kafka-to-Parquet ingester (`_master/rust_project_spec.md` in the resumes repo), Kafka, Iceberg and ClickHouse. A Rust interview for that role asks ownership and borrowing under async, `Send`/`Sync` across tasks, error handling, backpressure, zero-copy where it matters, why not `unsafe`, how you measured. The syllabus is already written for exactly that, so the cut is small: embedded and kernel Rust, GPU, compiler internals, convergent replicated state, and the deep ends of lock-free, consensus and kernel I/O that a storage-engine author needs and a data-plane developer does not.

**Applied on 13 October 2026 (owner decision): every Tier A and Tier B topic below is marked *(skipped)* in `rust-systems-engineering.md`.** Skipped topics stay in the curriculum (the site shows them muted with a "skipped" tag) but get no reel: `scripts/claim.mjs` never hands them out, a chapter is complete without them, and the build's flow check lets a live topic follow them. Each line is a syllabus topic title, word for word, so the mark can be removed by title. Tier A: no bearing on the owner's goal. Tier B: real material, but deeper than any interview or job goes, or a sibling topic or another domain already teaches it.

**Already-made topics are excluded** (owner rule 2026-10-13): no title below has a registry entry, an open claim or a `topic/*` branch, checked against `main` on 13 October 2026. Apply the same check before marking anything: a topic with a reel stays.

**Totals.** 155 topics and 6 Systems-in-Production cases. Tier A: 16 topics + 0 cases. Tier B: 40 topics. Cutting A alone leaves 139 topics; A and B leaves 99.

---

## Tier A — cut (16 topics + 0 cases)

### Chapter 17 — HTTP/1.1, HTTP/2, HTTP/3, QUIC, and TLS 1.3 (1 of 3)
- QUIC and HTTP/3

### Chapter 28 — CRDTs, Idempotency, and Convergent State (2 of 3)
- CRDT merge semantics: state, op, delta (cut in Data Engineering too; no data-platform role asks for it)
- Coordination avoidance: CALM and invariants (same)

### Chapter 29 — Performance Engineering: Caches, Branch Prediction, NUMA, Profiling (1 of 5)
- NUMA and CPU topology (multi-socket tuning; the owner's engines run on 4-node sites, not NUMA boxes)

### Chapter 30 — Unsafe Rust, Allocators, and Memory Reclamation (1 of 5)
- Lock-free memory reclamation schemes (needed to write lock-free structures from scratch; crossbeam and tokio do it)

### Chapter 38 — Compiler Pipeline, MIR, LLVM, and Optimization Boundaries (3 of 3)
- rustc pipeline: HIR, THIR, MIR, LLVM
- Optimizations and the UB contract
- Inspecting and steering codegen

### Chapter 39 — no_std, Embedded, Kernel, and Hardware-Facing Rust (5 of 5)
- no_std, core, and alloc
- MMIO, volatile access, peripheral ownership
- Interrupts and async embedded executors
- Safety-critical Rust toolchains
- Rust in the Linux kernel

### Chapter 40 — GPU and Heterogeneous Systems: Ownership Across the PCIe Boundary (3 of 3)
- Host-device buffer ownership and transfers
- Synchronization as ownership transfer
- The Rust GPU ecosystem in 2026

---

## Tier B — cut if the target is a smaller syllabus (40 topics)

### Chapter 2 — Borrowing, Lifetimes, and References (1 of 5)
- NLL limits and the Polonius borrow checker (compiler detail; the workaround is a refactor the earlier topics teach)

### Chapter 5 — Type Layout, Alignment, and ABI (2 of 4)
- repr attributes and niche optimization
- ABIs and Rust 2024 unsafe declarations

### Chapter 7 — Atomics and the Memory-Ordering Model (2 of 4)
- CAS loops and the ABA problem
- Spin locks, futexes, and thread parking

### Chapter 8 — Future, Waker, Pin, and the Async State Machine (1 of 5)
- Async closures and AsyncFn traits

### Chapter 11 — Processes, File Descriptors, Syscalls, and Resource Ownership (1 of 3)
- Syscalls as boundary crossings

### Chapter 12 — Virtual Memory, mmap, Page Faults, and Memory Mappings (2 of 3)
- Address translation and page faults
- mmap semantics and Rust soundness

### Chapter 13 — epoll and Readiness-Driven Networking (3 of 3)
- Interest lists and ready lists
- Level- versus edge-triggered semantics
- Application-owned protocol state machines

### Chapter 14 — io_uring and Submission/Completion Queues (3 of 3)
- Submission and completion rings
- Completion I/O and Rust buffer ownership
- When io_uring wins, and its risks

### Chapter 17 — HTTP/1.1, HTTP/2, HTTP/3, QUIC, and TLS 1.3 (2 of 3)
- HTTP/1.1 and HTTP/2 multiplexing
- TLS 1.3 review with rustls

### Chapter 21 — B-Trees, Page Splits, and Range Scans (3 of 4)
- Crash-safe structure modifications
- Range scans and B-link trees
- Concurrent B-tree latching protocols

### Chapter 22 — LSM Trees, Memtables, SSTables, and Compaction (1 of 4)
- Key-value separation and object-store LSMs

### Chapter 25 — Replication, Quorums, and Failure Semantics (1 of 3)
- Quorum intersection is not enough

### Chapter 26 — Raft: Leader Election, Log Replication, and Commitment (2 of 4)
- Linearizable reads: ReadIndex and leases
- Membership changes and log compaction

### Chapter 29 — Performance Engineering: Caches, Branch Prediction, NUMA, Profiling (1 of 5)
- Branch prediction and speculation

### Chapter 30 — Unsafe Rust, Allocators, and Memory Reclamation (1 of 5)
- Custom allocators and arenas

### Chapter 31 — FFI, ABI, Dynamic Linking, and Native Interop (2 of 4)
- Binding generation and linking
- Callbacks and cross-boundary lifetimes

### Chapter 35 — Capstone B: Durable Key-Value Engine (4 of 4)
- V1 — WAL and memtable replay (Capstone B, a key-value engine: a second large build beside the ingester the resume needs; Ch.19–23 teach the mechanisms)
- V2 — SSTables with filters and indexes
- V3 — Compaction with atomic manifest switch
- V4 — MVCC snapshots and version GC

### Chapter 36 — Capstone C: Raft-Backed Replicated State Machine (3 of 3)
- Deterministic state machine first (Capstone C, Raft: Ch.26 teaches the protocol; the owner's story is the log and the lakehouse, not consensus)
- Persist before acknowledging
- Chaos-tested transport and snapshots

### Chapter 41 — Security Engineering: Crypto APIs, Parsers, Secrets, and Supply Chain (2 of 4)
- Using cryptography without implementing it
- Secrets in memory and telemetry

### Chapter 42 — Testing Concurrent and Failure-Prone Rust Systems (3 of 4)
- Exhaustive interleavings with loom
- Deterministic simulation testing
- Fuzz findings to permanent regressions

---

## What stays, and why

After Tier A, 139 topics: ownership, borrowing, traits, smart pointers, layout and `Send`/`Sync` (M1); futures, Tokio, channels, backpressure and shutdown (M2); file descriptors, mmap vs a buffer pool, fsync and the WAL, TCP framing, Axum and Tower (M3); pages, WAL, B-trees, LSM, MVCC, Arrow and vectorized execution (M4); acknowledgement points, Raft's core, Kafka-style logs, idempotency keys (M5); benchmarking, profiling, cache lines, unsafe contracts and Miri, PyO3, Cargo, tracing and metrics (M6); the async service, key-value and Raft capstones and the zero-copy ETL data plane (M7); the design worksheet, parsers as security boundaries, supply-chain checks, property tests (M8); and all six cases (Polars, DataFusion, Materialize, delta-rs and Vector, Arroyo, Redpanda), every one on the owner's story. With Tier B as well, 99 topics: the same, minus the two capstones that duplicate the ingester's effort and the kernel-I/O, lock-free and consensus depths.
