# Change log — slice `rust` (original.md lines 1183–1257 → Rust Systems Engineering domain)

Scope: old Milestone 9 / Chapter 25 (groups 25-A…25-H, Ch.1–43, capstones A–D, Systems in Production M9) rebuilt as a standalone domain file. It has front matter, Milestones 1–8 with chapters keeping their numbers Ch.1–43 (capstones are Ch.34/35/36/43, marked *(capstone project)*), Systems in Production as the last milestone's case studies, and a new `## Assessment`. Every chapter has `### N.M` sections and a `*Lab:*`; Ch.37 had no lab, so a light worksheet exercise was added.

## Corrections
- **Ch.7 memory model grounding.** The original said orderings are "grounded in Linux kernel memory-barrier semantics". Rust's atomics follow the **C++20 memory model** (without `consume`); the LKMM applies only to kernel Rust, now noted in Ch.39. Source: https://doc.rust-lang.org/stable/std/sync/atomic/
- **Ch.9 I/O driver.** The original said Tokio's I/O driver "ties directly to epoll/io_uring". Tokio's driver is readiness-based via mio (epoll/kqueue/IOCP). io_uring exists in Tokio only as an unstable, opt-in `io-uring` feature for fs operations (1.5x, `tokio_unstable`). Sources: https://github.com/tokio-rs/tokio/blob/master/README.md , https://newreleases.io/project/github/tokio-rs/tokio/release/tokio-1.53.0
- **Ch.11 fd ownership.** The original said to "wrap descriptors in a Drop-implementing owner type". std has provided this since 1.63 via I/O safety (`OwnedFd`/`BorrowedFd`/`AsFd`, RFC 3128). The topic now teaches the std types; hand-rolled wrappers are no longer the practice.
- **Ch.5 Rust 2024 `unsafe extern`.** Clarified: items in an `unsafe extern` block are unsafe by default, and `safe` marks individually-safe declarations. Added the companion 2024 change, unsafe attributes (`#[unsafe(no_mangle)]`, `export_name`, `link_section`). Source: https://www.infoworld.com/article/3835168/rust-1-85-arrives-with-long-awaited-async-closures.html (1.85 release summary) and https://blog.rust-lang.org/2025/02/20/Rust-1.85.0/
- **Ch.3 terminology.** "Object safety" → **dyn compatibility** (renamed in the 1.83 cycle). Source: https://github.com/rust-lang/rust/pull/133372
- **Ch.2 `'static`.** Distinguished `T: 'static` from `&'static T`. Noted that `thread::scope` exists for threads but no sound scoped spawn exists in async (leak/forget safety), which is why async tasks need owned or `Arc` data.
- **Ch.10 cancellation.** Added that dropping a Tokio `JoinHandle` *detaches* the task rather than cancelling it. The original's "cancellation = dropping the future" is true only for un-spawned futures.
- **Systems in Production: Redpanda.** "Manage the page cache deliberately" → Redpanda uses its own I/O and caching with direct I/O instead of the page cache. From prior knowledge, see Unverified.
- **Cross-references.** "Ch.26/27" in the Materialize entry (old Rust-book numbering) → in-domain Ch.25–27 plus Ch.22–23. Old Data Engineering refs "Ch.2.3 / Ch.6.4 / Ch.9.3" → `→ *Data Engineering* Ch.2 (§2.3)`, `Ch.6 (§6.4)`, `Ch.9 (§9.3)`. The intro's "Ch.21" → `→ *Data Engineering* Ch.21`. Capstone A–C chapter references (Ch.34–36) kept.
- **Canonical references.** "The dedicated 43-chapter systems book" (unnamed, unverifiable) was replaced by verifiable primary sources. *The Rust Programming Language* is now cited as the 3rd edition (Klabnik, Nichols & Krycho, No Starch, Rust 2024). Source: https://www.oreilly.com/library/view/the-rust-programming/0642572230241/

## Currency updates (with source URLs)
- Toolchain baseline: stable Rust 1.99 (1 Oct 2026); Rust 2024 edition stable since 1.85 (Feb 2025). https://blog.rust-lang.org/releases , https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- Async closures + `AsyncFn*` traits stable in 1.85 (RFC 3668); `Future`/`IntoFuture` in the 2024 prelude (Ch.8). https://www.infoworld.com/article/3835168/rust-1-85-arrives-with-long-awaited-async-closures.html
- Async fn in traits stable since 1.75; return-type notation (RFC 3654) still unstable, a 2026 project goal (Ch.8). https://rust-lang.github.io/goals/2026/rtn.html
- Polonius alpha enabled on nightly in Aug 2026, with stabilization targeted by end of 2026 (Ch.2). https://blog.rust-lang.org/2026/08/04/enabling-polonius-alpha-on-nightly
- Trait upcasting and safe `#[target_feature]` functions stable in 1.86 (Ch.3, Ch.24). https://blog.rust-lang.org/2025/04/03/Rust-1.86.0/
- LLD default linker on x86_64-unknown-linux-gnu, and `cargo publish --workspace`, in 1.90 (Ch.32, Ch.38). https://blog.rust-lang.org/2025/09/18/Rust-1.90.0/
- MSRV-aware resolver 3, the default under edition 2024 (Ch.32). https://doc.rust-lang.org/edition-guide/rust-2024/cargo-resolver.html , https://blog.rust-lang.org/2025/01/09/Rust-1.84.0/
- v0 symbol mangling default and Cargo `build.warnings` stable in 1.97 (Ch.5, Ch.32). https://blog.rust-lang.org/2026/07/09/Rust-1.97.0/
- C-variadic function definitions stable in 1.99 (Ch.5). https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- Tokio: LTS 1.51.x (to Mar 2027) and 1.53.x (to Sep 2027); MSRV 1.85; unstable io-uring fs ops (Ch.9, Ch.14). https://github.com/tokio-rs/tokio/blob/master/README.md
- Tokio runtime-metrics stabilization begun in 1.38 (Ch.9). https://github.com/tokio-rs/tokio/releases/tag/tokio-1.38.0 ; `TaskTracker` + `CancellationToken` for shutdown (Ch.10): https://docs.rs/tokio-util/0.7.19/tokio_util/task/struct.TaskTracker.html
- Miri: *Practical UB Detection for Rust* (POPL 2026) (Ch.30). https://popl26.sigplan.org/details/POPL-2026-popl-research-papers/50/Miri-Practical-Undefined-Behavior-Detection-for-Rust ; Tree Borrows (PLDI 2025) is from the same author's publication list.
- Sanitizers: still `-Zsanitizer` (nightly). ASan/LSan are near stabilization; MSan/TSan are a 2026 goal (Ch.30). https://rust-lang.github.io/goals/2026/stabilization-of-sanitizer-support.html
- Rust in the Linux kernel: the "experiment" ended at the Dec 2025 Maintainers Summit ("here to stay") (Ch.39). https://lwn.net/Articles/1049831/ , https://www.phoronix.com/news/Rust-To-Stay-Linux-Kernel ; Rust Binder merged in 6.18 with the C driver slated for removal: https://phoronix.com/news/Rust-Binder-For-Linux-6.18 , https://www.phoronix.com/news/Google-Binder-C-Goodbye ; Nova/Tyr status: https://www.phoronix.com/news/NVIDIA-Nova-Rust-Linux-7.3 , https://lwn.net/Articles/1055590
- FLS adopted by the Rust Project (2025) (front matter, Ch.39). https://blog.rust-lang.org/2025/03/26/adopting-the-fls/
- Ferrocene qualification and certified `core` subset (IEC 61508 SIL 2 / ISO 26262 ASIL B) (Ch.39). https://ferrous-systems.com/blog/ferrocene-26-02-0/ , https://www.businesswire.com/news/home/20251203818102/en
- GPU: Rust-CUDA rebooted (2025, still early); NVIDIA cuda-oxide 0.1 (experimental, 2026); `std::offload` goal closed and continued under ML goals (Ch.40). https://www.phoronix.com/news/Rust-CUDA-Project-Reboot , https://www.phoronix.com/news/NVIDIA-CUDA-Oxide-0.1 , https://rust-lang.github.io/goals/2025h2/finishing-gpu-offload.html
- io_uring zero-copy receive (zcrx) in Linux 6.15 (Ch.14). https://docs.kernel.org/6.15/networking/iou-zcrx.html
- io_uring security posture: 60% of kCTF submissions; disabled or restricted on ChromeOS, Android apps and Google production servers (Ch.14). https://security.googleblog.com/2023/06/learnings-from-kctf-vrps-42-linux.html
- `RWF_ATOMIC` torn-write protection, Linux 6.11+ (Ch.15). https://git.almalinux.org/rpms/man-pages/commit/a68a9cd9b8c87ea7d6809785bb13b05571851e63
- rustls with aws-lc-rs: hybrid X25519MLKEM768 support (Ch.17). https://doc.servo.org/rustls/manual/_05_defaults/index.html
- Axum 0.8 route syntax `/{param}` (Ch.18). https://github.com/rust-lang/crates.io/pull/10302
- Kafka 4.0: ZooKeeper removed (KRaft only), KIP-848 GA; KIP-932 share groups in preview in 4.1 (Ch.25, Ch.27). https://kafka.apache.org/40/getting-started/upgrade/ , https://kafka.apache.org/41/getting-started/upgrade/
- crates.io Trusted Publishing, July 2025 (Ch.32, Ch.41). https://blog.rust-lang.org/2025/07/11/crates-io-development-update-2025-07 ; malicious crates `faster_log`/`async_println`, Sep 2025 (Ch.41): https://blog.rust-lang.org/2025/09/24/crates.io-malicious-crates-fasterlog-and-asyncprintln
- Kani + Rust std verification challenge (Ch.42). https://aws.amazon.com/blogs/opensource/verify-the-safety-of-the-rust-standard-library/
- iai-callgrind renamed Gungraun (Ch.29). https://github.com/rust-lang/rust/pull/150080
- Free-threaded CPython officially supported from 3.14, PEP 779 (Ch.31). https://discuss.python.org/t/pep-779-criteria-for-supported-status-for-free-threaded-python/84319
- Vortex file format hosted by LF AI & Data, Aug 2025 (Ch.24). https://www.linuxfoundation.org/press/lf-ai-data-foundation-hosts-vortex-project-to-power-high-performance-data-access-for-ai-and-analytics
- Polars 2.0 (6 Oct 2026; streaming engine / out-of-core); Polars Cloud GA on AWS with distributed engine (Sep 2025) (SiP). https://pola.rs/posts/ , https://www.hpcwire.com/bigdatawire/this-just-in/polars-cloud-now-available-on-aws/
- DataFusion 54.x (Jul 2026), Ballista 54.0.0 (Jul 2026), Comet 1.0.0 (Aug 2026) (SiP). https://release-catalog.apache.org/datafusion/54.1.0/index.html , https://datafusion.apache.org/blog/2026/07/12/datafusion-ballista-54.0.0 , https://datafusion.apache.org/blog/2026/08/07/datafusion-comet-1.0.0
- Materialize Self-Managed + Community Edition, Mar 2025 (SiP). https://materialize.com/changelog/2025-03-11-materialize-self-managed-and-community-editions/ ; RisingWave state on S3 + Iceberg: https://risingwave.com/blog/risingwave-vs-materialize-comparison/
- `deltalake` (delta-rs Python) 1.0.0, 28 May 2025 (SiP). https://www.piwheels.org/project/deltalake
- Vector powers Datadog Observability Pipelines (SiP). https://www.datadoghq.com/about/latest-news/press-releases/datadog-launches-observability-pipelines-to-help-organizations-collect-manage-and-route-observability-data/
- Arroyo acquired by Cloudflare (Apr 2025), powers Cloudflare Pipelines (SiP). https://blog.cloudflare.com/cloudflare-acquires-arroyo-pipelines-streaming-ingestion-beta/

## Added topics
- Front matter: intro, structure/toolchain baseline line, canonical references with verified titles and authors; `## Assessment` (10 expert questions, including the 2 original DE "Systems/Rust" questions in sharpened form).
- Ch.1 **RAII, drop order, and leak safety** (leak safety / `mem::forget` new; Rust 2024 temporary scopes).
- Ch.2 **NLL limits and the Polonius borrow checker**; **Borrows across thread and task boundaries** (scoped threads, no async scoped spawn).
- Ch.3 **Associated types, GATs, and coherence** (GATs, orphan rule, specialization status).
- Ch.4 **Interior mutability: Cell, RefCell, UnsafeCell** (`UnsafeCell`, `OnceLock`/`LazyLock`).
- Ch.5 **repr attributes and niche optimization**; **Safe byte-level views of structs** (`zerocopy`/`bytemuck`).
- Ch.7 **Spin locks, futexes, and thread parking**.
- Ch.8 **async/await lowering and future size**; **Async fn in traits and Send bounds**; **Async closures and AsyncFn traits**.
- Ch.9 **Work stealing and cooperative budgeting**; **Runtime observability and operating rules** (tokio-console, metrics, LTS/MSRV).
- Ch.11 **Processes, signals, and environment safety** (fork safety, pidfd, `set_var` unsafe in 2024).
- Ch.12 **mmap semantics and Rust soundness**; CIDR 2022 mmap-vs-buffer-pool analysis.
- Ch.14 **Completion I/O and Rust buffer ownership** (owned-buffer APIs, cancellation); zcrx, provided buffers, security posture.
- Ch.15 **fsync semantics and failure modes** (fsyncgate, directory fsync, atomic rename, `RWF_ATOMIC`).
- Ch.17 rustls, PQ hybrid key exchange, HTTP/2 Rapid Reset, Rust QUIC stacks.
- Ch.18 **Tower Service and poll_ready backpressure**.
- Ch.19 **Buffer pool and page eviction** (CLOCK/LRU-K, LeanStore, vmcache).
- Ch.20 **ARIES steal/no-force recovery**; torn-page protection.
- Ch.21 **Range scans and B-link trees**; **Concurrent B-tree latching protocols**.
- Ch.22 **Compaction strategies and amplification** (leveled/tiered, RUM); **Key-value separation and object-store LSMs**.
- Ch.23 **Isolation levels and their anomalies** (write skew, Adya, SSI).
- Ch.24 **SIMD in Rust**; **Vectorized versus compiled query execution**; Arrow view types; BtrBlocks/FSST/ALP; Vortex/Lance.
- Ch.25 **Failure injection and linearizability checking** (Jepsen/Knossos/Porcupine/Elle).
- Ch.26 **Linearizable reads: ReadIndex and leases**; **Membership changes and log compaction**; PreVote/CheckQuorum; Figure-8 commit rule.
- Ch.27 idempotent producer/transactions, KIP-848, KIP-932, tiered storage.
- Ch.28 **Coordination avoidance: CALM and invariants**.
- Ch.29 **CPU and memory profiling**; **Branch prediction and speculation**; benchmarking statistics (coordinated omission, instruction-count CI benchmarks).
- Ch.30 **Undefined behavior: validity, provenance, aliasing**; **Miri and sanitizers for UB detection**.
- Ch.31 **Binding generation and linking**; **Embedding Rust in Python and JVM** (PyO3/maturin, Arrow C Data Interface, free-threaded Python, JNI/Comet).
- Ch.32 **Release profiles and build speed**; **CI baseline and lint policy** expanded (nextest, semver-checks, MSRV).
- Ch.33 **Structured fields and OpenTelemetry export**; **Failure taxonomy and error design** (thiserror vs anyhow).
- Ch.38 Cranelift/GCC backends, bounds-check elimination, PGO/BOLT, compile-time engineering.
- Ch.39 **Safety-critical Rust toolchains**; **Rust in the Linux kernel**; RTIC/Embassy/embedded-hal 1.0.
- Ch.40 **The Rust GPU ecosystem in 2026**.
- Ch.41 **Secrets in memory and telemetry**; `cargo vet`/`cargo auditable`, build-script risk, Trusted Publishing.
- Ch.42 **Deterministic simulation testing**; shuttle; cargo-mutants; Kani.
- Systems in Production: **Arroyo** (DataFusion-based streaming, Cloudflare).

## Removed or merged (with reason)
- The old milestone intro ("deliberately placed last… optional for pure-analytics roles… maps directly to the 43 chapters of a dedicated systems-engineering curriculum") was replaced by a domain intro. It described its position inside the DE syllabus, which no longer applies, and cited an unnamed book.
- Ch.26 "consensus/state-machine separation" merged into **Log replication and commitment rules**. The deterministic-state-machine build stays in Ch.36. One home each, cross-referenced.
- No substantive point was deleted: every point of every original bullet appears in some topic or lab.

## Split topics
Each original chapter was one dense bullet; each became 2–5 reels:
- Ch.1 → 4; Ch.2 → 5; Ch.3 → 3; Ch.4 → 4; Ch.5 → 4; Ch.6 → 4; Ch.7 → 4; Ch.8 → 5; Ch.9 → 5; Ch.10 → 3; Ch.11 → 3; Ch.12 → 3; Ch.13 → 3; Ch.14 → 3; Ch.15 → 3; Ch.16 → 3; Ch.17 → 3; Ch.18 → 3; Ch.19 → 4; Ch.20 → 3; Ch.21 → 4; Ch.22 → 4; Ch.23 → 3; Ch.24 → 4; Ch.25 → 3; Ch.26 → 4; Ch.27 → 3; Ch.28 → 3; Ch.29 → 5; Ch.30 → 5; Ch.31 → 4; Ch.32 → 4; Ch.33 → 4; Ch.34 → 2; Ch.35 → 4 (V1–V4); Ch.36 → 3; Ch.37 → 2; Ch.38 → 3; Ch.39 → 5; Ch.40 → 3; Ch.41 → 4; Ch.42 → 4; Ch.43 → 3.
- Notable mechanism splits: Ch.7 separates memory-model reels (atomicity vs ordering; acquire/release/SeqCst) from lock-free building blocks (CAS/ABA; spin/futex). Ch.17 separates HTTP/1.1–2, QUIC/HTTP/3 and TLS 1.3. Ch.30 separates soundness (contracts, UB model, Miri) from memory management (allocators, reclamation).

## Moved
- ABA mitigations (hazard pointers, epochs) appeared in both Ch.7 and Ch.30. ABA stays in Ch.7, and reclamation schemes live in Ch.30 with cross-references.
- FFI material appeared in both Ch.5 and Ch.31. Ch.5 keeps layout and ABI declarations (including Rust 2024 `unsafe extern`), and Ch.31 owns the FFI protocol, bindings and callbacks.
- Async methods in traits go in Ch.8 (async surface), not Ch.3; Ch.3 cross-references them.
- WAL flush points: Ch.15 keeps the OS-level durability view and references Ch.20 for WAL internals.
- Ch.39 retitled "no_std, Embedded, Kernel, and Hardware-Facing Rust" to hold the Linux-kernel topic. The LKMM note moved from Ch.7 to here.
- Old group headings 25-A…25-H became `# Milestone 1…8`. The old "Systems in Production — Milestone 9" became "Systems in Production — Milestone 8".

## Refresher-tagged
- The prerequisites block (the Book through ch. 10) is a short *(refresher)* pointer. No chapter topics were tagged, because the audience is new to Rust's specific model even when senior.

## Unverified
- Redpanda's use of direct I/O / bypassing the page cache comes from prior knowledge. It could not be re-checked because the session's web-search budget was exhausted.
- RFC numbers 2349 (Pin), 2592 (futures API), 3185 (async fn in traits) and 3484 (unsafe extern blocks) come from memory. 2094, 3128, 3654, 3668 and 3691 were seen in sources.
- Paper and venue citations added from memory and not re-fetched this session: Stacked Borrows (POPL 2020), LeanStore (ICDE 2018), vmcache (SIGMOD 2023), Monkey (SIGMOD 2017), WiscKey (FAST 2016), BtrBlocks (SIGMOD 2023), FSST (VLDB 2020), ALP (SIGMOD 2024), MonetDB/X100 (CIDR 2005), HyPer (VLDB 2011), Kersten et al. (VLDB 2018), Wu et al. MVCC (VLDB 2017), Cahill et al. SSI (SIGMOD 2008), Ports & Grittner (VLDB 2012), Lehman & Yao (1981), Leis et al. ART sync (DaMoN 2016), Bailis et al. (VLDB 2015), Rebello et al. fsync (USENIX ATC 2020), Crotty/Leis/Pavlo (CIDR 2022), Hellerstein & Alvaro (CACM 2020), DataFusion (SIGMOD 2024). They are standard, well-known references, but a reviewer should spot-check them.
- rustls post-quantum hybrid default-on status: sources conflict. The syllabus states only "supported with aws-lc-rs", not "default".
- OpenTelemetry-Rust trace-signal stability (beta vs stable) could not be confirmed, so the syllabus makes no maturity claim.
- Origin dates in case-study headers: Polars 2020, DataFusion 2017 (Andy Grove), Arroyo 2022, Redpanda 2019. Plausible but not re-verified.
- Polars 2.0 making streaming the *default* for all lazy queries: the release post title and secondary reports support it, but the syllabus words it as "runs lazy queries on its streaming engine".

Topics: before 48 → after 161
