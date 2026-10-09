# Verification log — rust-systems-engineering.md (checked 2026-10-09)

## Confirmed
### Rust toolchain / language
- Stable Rust 1.99 released 1 Oct 2026 (baseline "as of October 2026"); 1.97 = 9 Jul 2026; 1.90 = 18 Sep 2025; 1.86 = 3 Apr 2025; 1.85 = 20 Feb 2025 → https://blog.rust-lang.org/releases/
- Rust 2024 edition stable since 1.85; async closures + AsyncFn/AsyncFnMut/AsyncFnOnce in 1.85; Future/IntoFuture added to 2024 prelude; unsafe extern required; unsafe attributes (no_mangle/export_name/link_section); set_var unsafe; static mut refs deny-by-default; unsafe_op_in_unsafe_fn warns; if-let and tail-expression temporary scopes; match-ergonomics reservations; RPIT capture rules; rust-version-aware resolver → https://blog.rust-lang.org/2025/02/20/Rust-1.85.0/
- MSRV-aware resolver (resolver 3) default under edition 2024; strict-provenance APIs in 1.84 → https://blog.rust-lang.org/2025/01/09/Rust-1.84.0/
- Trait upcasting and safe `#[target_feature]` functions stable in 1.86 → https://blog.rust-lang.org/2025/04/03/Rust-1.86.0/
- LLD default linker on x86_64-unknown-linux-gnu and `cargo publish --workspace` in 1.90 → https://blog.rust-lang.org/2025/09/18/Rust-1.90.0/
- v0 symbol mangling default on stable in 1.97; Cargo build.warnings (deny warnings) in 1.97 → https://blog.rust-lang.org/2026/07/09/Rust-1.97.0/
- C-variadic function definitions stable in 1.99 → https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- `&raw const/mut`, `use<..>` precise capturing, `safe` items in `unsafe extern` (1.82) → https://blog.rust-lang.org/2024/10/17/Rust-1.82.0/
- LazyLock stable 1.80 → https://blog.rust-lang.org/2024/07/25/Rust-1.80.0/
- Async fn and RPITIT in traits stable since 1.75 → https://blog.rust-lang.org/2023/12/28/Rust-1.75.0/
- I/O safety (OwnedFd/BorrowedFd) and `thread::scope` in 1.63 → https://blog.rust-lang.org/2022/08/11/Rust-1.63.0/
- Polonius alpha enabled on nightly (4 Aug 2026; opt-out `-Zpolonius=off`), stabilization aimed before end of 2026 → https://blog.rust-lang.org/2026/08/04/enabling-polonius-alpha-on-nightly
- Return-type notation (RFC 3654) still unstable in 2026 (nightly `return_type_notation`) → https://goals.rust-lang.org/2026/rtn.html
- ASan/LSan close to stabilization; MSan/TSan need instrumented std (second half of the Ch.30 sentence) → https://goals.rust-lang.org/2026/stabilization-of-sanitizer-support.html
- Parallel front end still nightly-only (pre-stabilization 2026 goal) → https://goals.rust-lang.org/2026/parallel-front-end.html
- std::autodiff available on nightly via rustup `enzyme` component; std::offload still in progress → https://rustc-dev-guide.rust-lang.org/autodiff/installation.html , https://goals.rust-lang.org/2025h2/finishing-gpu-offload.html
- Rust atomics follow C++20 atomics rules, without `consume` → https://doc.rust-lang.org/stable/std/sync/atomic/
- RFC numbers 2094 (NLL), 2349 (pin), 2592 (futures), 3128 (io-safety), 3185 (static async fn in trait), 3484 (unsafe extern blocks), 3654 (RTN), 3668 (async closures), 3691 (crates.io trusted publishing) → https://rust-lang.github.io/rfcs/2349-pin.html etc. (each page resolves with matching title; a bogus slug returns 404)
- FLS adopted by the Rust Project (26 Mar 2025) → https://blog.rust-lang.org/2025/03/26/adopting-the-fls/
- Ferrocene: ISO 26262 ASIL D, IEC 61508 SIL 3, IEC 62304 Class C; certified core subset IEC 61508 SIL 2 / ISO 26262 ASIL B (ASIL B added in 26.02) → https://ferrous-systems.com/blog/ferrocene-26-02-0/
- crates.io Trusted Publishing (OIDC, GitHub Actions), July 2025 → https://blog.rust-lang.org/2025/07/11/crates-io-development-update-2025-07
- faster_log / async_println removed 24 Sep 2025 → https://blog.rust-lang.org/2025/09/24/crates.io-malicious-crates-fasterlog-and-asyncprintln
- iai-callgrind renamed gungraun → https://github.com/rust-lang/rust/pull/150080 , https://crates.io/crates/gungraun
- Kani + Rust std verification challenge → https://aws.amazon.com/blogs/opensource/verify-the-safety-of-the-rust-standard-library/

### Books / references / papers
- The Book 3rd ed., Klabnik/Nichols/Krycho, No Starch, Rust 2024 edition → https://nostarch.com/rust-programming-language-3rd-edition
- Rust Atomics and Locks (O'Reilly, 2023) → https://oreilly.com/library/view/rust-atomics-and/9781098119430 ; Rust for Rustaceans (No Starch, Nov 2021) → https://nostarch.com/rust-rustaceans
- Stacked Borrows (Jung, Dang, Kang, Dreyer, POPL 2020) → https://plv.mpi-sws.org/rustbelt/stacked-borrows/
- Tree Borrows (Villani, Hostert, Dreyer, Jung, PLDI 2025) → https://saarland-informatics-campus.de/en/piece-of-news/derek-dreyer-and-collaborators-receive-three-distinguished-paper-awards-at-pldi25-and-popl25/
- Miri: Practical UB Detection for Rust (Jung et al., POPL 2026) → https://popl26.sigplan.org/details/POPL-2026-popl-research-papers/50/Miri-Practical-Undefined-Behavior-Detection-for-Rust
- LeanStore ICDE 2018; vmcache (PACMMOD/SIGMOD 2023); Monkey SIGMOD 2017; BtrBlocks (PACMMOD/SIGMOD 2023); FSST PVLDB 2020; ALP (PACMMOD, SIGMOD 2024); Kersten et al. PVLDB 2018; Wu et al. PVLDB 2017; Cahill et al. SIGMOD 2008; Ports & Grittner PVLDB 2012; Lehman & Yao TODS 1981; Leis et al. ART sync DaMoN 2016; Bailis et al. PVLDB 8 (VLDB 2015); Hellerstein & Alvaro CACM 2020; Lamb et al. DataFusion SIGMOD 2024 (Companion) → Crossref API (https://api.crossref.org/works?query.bibliographic=...)
- MonetDB/X100 CIDR 2005 → https://event.cwi.nl/lsde/papers/vectorwise.pdf
- HyPer / Neumann PVLDB 4(9) 2011 → https://www.vldb.org/pvldb/vol4/p539-neumann.pdf
- WiscKey FAST 2016 → https://www.usenix.org/sites/default/files/fast16_contents.pdf
- Rebello et al. USENIX ATC 2020 → https://www.usenix.org/conference/atc20/presentation/rebello
- Crotty, Leis & Pavlo CIDR 2022 → https://vldb.org/cidrdb/2022/are-you-sure-you-want-to-use-mmap-in-your-database-management-system.html

### Linux / OS
- Rust in kernel no longer experimental, Dec 2025 Maintainers Summit → https://lwn.net/Articles/1049831/
- Tyr initial merge in 6.18, Nova in progress, DRM ~1 year from requiring Rust for new drivers (Airlie) → https://lwn.net/Articles/1055590
- Rust Binder in 6.18; C driver removal patch queued (for 7.4) → https://phoronix.com/news/Rust-Binder-For-Linux-6.18 , https://www.phoronix.com/news/Google-Binder-C-Goodbye (via search; direct fetch 403) , https://kernelsources.org/source/history/linux/drivers/android/binder/node.rs
- io_uring zcrx documented in 6.15 kernel docs; needs header split + flow steering (+RSS) → https://docs.kernel.org/6.15/networking/iou-zcrx.html
- Google limited io_uring: disabled on ChromeOS, unreachable to Android apps via seccomp, disabled on production servers → https://security.googleblog.com/2023/06/learnings-from-kctf-vrps-42-linux.html
- RWF_ATOMIC since Linux 6.11, torn-write protection → https://man7.org/linux/man-pages/man2/pwritev2.2.html

### Ecosystem
- Tokio LTS 1.51.x (to Mar 2027) and 1.53.x (to Sep 2027); MSRV 1.85; driver over epoll/kqueue/IOCP → https://github.com/tokio-rs/tokio/blob/master/README.md
- Tokio io-uring is an unstable feature behind `tokio_unstable`, used for fs ops in 1.5x → https://docs.rs/tokio/latest/tokio/ , https://newreleases.io/project/github/tokio-rs/tokio/release/tokio-1.53.0
- Tokio 1.38 "marks the beginning of stabilization for runtime metrics" → https://github.com/tokio-rs/tokio/releases/tag/tokio-1.38.0
- Axum 0.8 `/{param}` syntax → https://tokio.rs/blog/2025-01-01-announcing-axum-0-8-0
- rustls: X25519MLKEM768 available with aws-lc-rs (claim as worded, no default claim) → https://docs.rs/rustls/latest/rustls/manual/_05_defaults/index.html
- Kafka 4.0 (18 Mar 2025) KRaft-only; KIP-848 GA in 4.0; KIP-932 preview in 4.1 → https://kafka.apache.org/blog , https://kafka.apache.org/41/getting-started/upgrade/
- PEP 779 Final; free-threaded Python officially supported in 3.14 → https://peps.python.org/pep-0779/ , https://docs.python.org/3/whatsnew/3.14.html
- Vortex hosted by LF AI & Data, Aug 2025 → https://www.linuxfoundation.org/press/lf-ai-data-foundation-hosts-vortex-project-to-power-high-performance-data-access-for-ai-and-analytics
- Rust-CUDA rebooted 2025, still early → https://www.phoronix.com/news/Rust-CUDA-Project-Reboot
- NVIDIA cuda-oxide 0.1 (May 2026), experimental/alpha → https://nvidia.github.io/cuda-rust/ , https://phoronix.com/news/nvidia-cuda-oxide-0.1 (via search)

### Systems in Production
- Polars 2.0 released 6 Oct 2026; brings streaming engine to all lazy queries + out-of-core → https://pola.rs/posts/
- Polars 2020 origin (first public commit Jun 2020, Ritchie Vink) → https://en.wikipedia.org/wiki/Polars_(software) (secondary)
- Polars Cloud GA on AWS 3 Sep 2025, with distributed engine (open beta at launch) → https://pola.rs/posts/polars-cloud-launch , https://www.hpcwire.com/bigdatawire/this-just-in/polars-cloud-now-available-on-aws/
- DataFusion started ~2017 (2 years before Feb 2019 donation), Andy Grove original creator → https://arrow.apache.org/blog/2019/02/04/datafusion-donation/ , https://news.apache.org/foundation/entry/apache-software-foundation-announces-new-top-level-project-apache-datafusion
- Comet 1.0.0 (7 Aug 2026) → https://datafusion.apache.org/blog/2026/08/07/datafusion-comet-1.0.0 ; Ballista 54.0.0 (Jul 2026, not in file but in notes) → https://datafusion.apache.org/blog/2026/07/12/datafusion-ballista-54.0.0
- Materialize Self-Managed + Community editions (11 Mar 2025); strict serializable default → https://materialize.com/changelog/2025-03-11-materialize-self-managed-and-community-editions/ , https://materialize.com/docs/get-started/isolation-level/
- deltalake 1.0.0 on 28 May 2025 → https://www.piwheels.org/project/deltalake
- Vector: Datadog acquired Timber (Feb 2021); Observability Pipelines powered by Vector (Jun 2022) → https://datadoghq.com/about/latest-news/press-releases/datadog-acquires-timber-technologies/ , https://www.datadoghq.com/about/latest-news/press-releases/datadog-launches-observability-pipelines-to-help-organizations-collect-manage-and-route-observability-data/
- Arroyo acquired by Cloudflare (10 Apr 2025); Pipelines "built on top of Arroyo"; Arroyo SQL engine rebuilt on Arrow/DataFusion → https://blog.cloudflare.com/cloudflare-acquires-arroyo-pipelines-streaming-ingestion-beta/ , https://blog.cloudflare.com/cloudflare-data-platform/ , https://www.arroyo.dev/blog/arroyo-0-10-0
- Redpanda: allocates its own RAM cache instead of page cache, DMA/O_DIRECT, thread-per-core pinned (Unverified item now confirmed) → https://www.redpanda.com/blog/what-makes-redpanda-fast ; Raft group per partition → https://docs.redpanda.com/current/get-started/architecture/ ; founded 2019 (as Vectorized) → https://techcrunch.com/2022/02/23/with-mission-to-modernize-data-streaming-redpanda-snares-50m-series-b (secondary)

## Corrected
- Ch.14: "Google reported 60% of 2023 kCTF kernel-exploit submissions used io_uring and disabled…" → "Google reported in June 2023 that 60% of kCTF VRP kernel-exploit submissions over the preceding year used io_uring, and disabled…" (the 60% figure covers "the past year" before the June 2023 post, not calendar 2023) → https://security.googleblog.com/2023/06/learnings-from-kctf-vrps-42-linux.html
- Ch.27: "share groups for queue semantics (KIP-932, preview in 4.1)" → "(KIP-932, preview in 4.1, production-ready in 4.2)" (Kafka 4.2.0, Feb 2026: "Kafka Queues (Share Groups) is now production-ready") → https://kafka.apache.org/blog/2026/02/17/apache-kafka-4.2.0-release-announcement/
- Ch.4: "`OnceCell`/`OnceLock`/`LazyLock` (stable 1.80)" → "`OnceCell`/`OnceLock` (stable 1.70) and `LazyLock` (stable 1.80)" → https://blog.rust-lang.org/2024/07/25/Rust-1.80.0/
- SiP Arroyo: "Arroyo (2022–; …)" → "Arroyo (2023–; …)" (founder: "We started Arroyo in 2023") → https://blog.cloudflare.com/cloudflare-acquires-arroyo-pipelines-streaming-ingestion-beta/
- Ch.30: "Sanitizers still need nightly `-Zsanitizer`: AddressSanitizer/LeakSanitizer are close…" → "The `-Zsanitizer` flag is still nightly-only, though the Tier 2 `x86_64-unknown-linux-gnuasan` target lets AddressSanitizer run from a stable compiler; AddressSanitizer/LeakSanitizer are close…" → https://doc.rust-lang.org/stable/rustc/platform-support/x86_64-unknown-linux-gnuasan.html , https://goals.rust-lang.org/2026/stabilization-of-sanitizer-support.html

## Removed or softened
- (none) — every dated/version claim was either confirmed or corrected.

## Could not check
- rustls: whether X25519MLKEM768 is offered/preferred *by default* with aws-lc-rs. docs.rs (0.23.45) says it is "available but not highest-priority" unless `prefer-post-quantum` is enabled, and doesn't say whether that feature is on by default. The release notes I could see (0.23.36–0.23.45) don't settle it. The syllabus makes no default claim, so no change.
- OpenTelemetry-Rust trace-signal stability: the syllabus makes no maturity claim, so there was nothing to check.
- Polars 2.0 streaming as the *default* engine: the pre-release post says it brings "the streaming engine to all lazy queries". The syllabus wording ("runs lazy queries on its streaming engine") matches this, and no "default" wording was checked or added.
- Polars (2020) and Redpanda (2019) origin years: confirmed only from secondary sources, because the GitHub API was not reachable from this session.
