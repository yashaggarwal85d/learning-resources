# Rust Systems Engineering — Syllabus

Data-platform and infrastructure teams use Rust where a garbage collector's pauses, a GIL, or C/C++'s memory-unsafety are unaffordable: query engines, storage engines, connectors, agents, stream processors and hot paths (Polars, DataFusion/Comet, delta-rs, Vector, Materialize, RisingWave, the Linux kernel's newer drivers). Ownership gives predictable memory and tail latency without a GC, `Send`/`Sync` make data races a compile error, monomorphized generics cost nothing at run time, and the C ABI lets one Rust core sit under Python, the JVM and C++. This domain is for **senior engineers who already ship systems** in C/C++, Go, Java or Python. It teaches the hard parts: ownership as resource topology, async runtime internals, kernel I/O, storage-engine and consensus internals, unsafe code and its proof obligations, and how to measure, not the syntax. It is the deep track the *Data Engineering* domain points to for its storage, streaming and infrastructure specializations (→ *Data Engineering* Appendix B.3). Budget 3–5 months.

**Structure:** Milestones → Chapters → Topics. 8 milestones and 43 chapters. Topics marked *(skipped)* stay in the curriculum for reference but get no reel (owner decision of 13 October 2026, `review-notes/rust-cuts.md`): the routines never build them, and the course flows past them. Ch.34–36 and Ch.43 are capstone projects, and the domain closes with Systems in Production case studies. Toolchain baseline as of October 2026: stable Rust 1.99, **Rust 2024 edition** (stable since 1.85), Tokio 1.5x (LTS lines 1.51.x and 1.53.x).

> **Prerequisites** *(refresher)* — *The Rust Programming Language* through ch. 10: ownership, borrowing, structs/enums, pattern matching, generics/traits, error handling (`Result`/`?`), collections and `cargo` basics. Ch.1 assumes you can compile Rust and read a borrow-checker error.

## Canonical references
- *The Rust Programming Language* ("the Book"; Klabnik, Nichols & Krycho; No Starch Press, 3rd ed., Rust 2024 edition; free online). Prerequisites, M1
- *The Rust Reference* and the **FLS** (Ferrocene Language Specification, adopted by the Rust Project in 2025 as its specification text). M1, Ch.30, Ch.38
- *The Rustonomicon* (Rust Project): unsafe Rust, layout, FFI. Ch.5, Ch.7, Ch.30, Ch.31
- *Rust Atomics and Locks* (Mara Bos, O'Reilly, 2023). Ch.6, Ch.7, Ch.29
- *Rust for Rustaceans* (Jon Gjengset, No Starch Press, 2021). M1, Ch.32
- *The Rust Edition Guide* (2024 edition chapters). Ch.1, Ch.2, Ch.5, Ch.11, Ch.30
- Tokio documentation and tutorial (tokio.rs, docs.rs/tokio, tokio-util); the *Asynchronous Programming in Rust* book (rust-lang async book). M2
- Rust RFCs: 2094 (non-lexical lifetimes), 2349 (`Pin`), 2592 (`Future`/task API), 3128 (I/O safety), 3185 (async fn in traits), 3484 (unsafe extern blocks), 3654 (return-type notation, not yet stable), 3668 (async closures), 3691 (crates.io trusted publishing)
- Unsafe-code semantics: Unsafe Code Guidelines / operational-semantics team; *Stacked Borrows* (Jung, Dang, Kang & Dreyer, POPL 2020); *Tree Borrows* (Villani, Hostert, Dreyer & Jung, PLDI 2025); *Miri: Practical Undefined Behavior Detection for Rust* (Jung et al., POPL 2026). Ch.30, Ch.42
- Kernel I/O: Axboe, *Efficient IO with io_uring* (2019); Linux man-pages (epoll(7), io_uring(7), fsync(2)); Crotty, Leis & Pavlo, *Are You Sure You Want to Use MMAP in Your Database Management System?* (CIDR 2022). M3
- Storage: *Database Internals* (Petrov, O'Reilly, 2019); ARIES (Mohan et al., ACM TODS 1992); the LSM-tree (O'Neil et al., Acta Informatica 1996); PostgreSQL internals docs; Apache Arrow columnar format spec. M4
- Distributed: Raft (Ongaro & Ousterhout, USENIX ATC 2014) and Ongaro's thesis (2014); Kafka (Kreps, Narkhede & Rao, NetDB 2011) and the Kafka design docs; CRDTs (Shapiro, Preguiça, Baquero & Zawirski, SSS 2011); *Keeping CALM* (Hellerstein & Alvaro, CACM 2020). M5
- Protocols: RFC 9000/9001/9002 (QUIC), RFC 9114 (HTTP/3), RFC 9113 (HTTP/2), RFC 9112 (HTTP/1.1), RFC 8446 (TLS 1.3). Ch.16–17

---

# Milestone 1 — Ownership, Types, and Concurrency Primitives
Learn to treat ownership, borrowing, layout and `Send`/`Sync` as tools for designing resource topologies and concurrency boundaries.

## Chapter 1 — Ownership and Moves
Ownership as a static model of who destroys what, and therefore who may touch what.

### 1.1 Ownership as resource topology
- **Single ownership and move semantics** — one live owner is responsible for destruction. A move is a shallow bitwise copy that statically invalidates the source binding, with no implicit deep copy; `Copy` vs `Clone` marks where the cost is. Signatures act as ownership contracts (`T` takes, `&T` borrows, `&mut T` borrows exclusively, returning `T` hands ownership back). Reading E0382 (use after move) and E0505 (move while borrowed).
- **RAII, drop order, and leak safety** — deterministic destruction: locals drop in reverse declaration order, struct fields in declaration order, temporaries at the end of the statement (and Rust 2024's narrower `if let`/tail-expression temporary scopes). A RAII wrapper for an OS resource closes it exactly once. `mem::forget`/`ManuallyDrop` and why leaking is *safe*, so an API's soundness may never depend on `Drop` running (the scoped-thread "leakpocalypse" lesson).
- **Partial moves and destructuring as transfer** — moving individual fields out of a multi-field struct, and why you cannot partially move out of a type that implements `Drop`. `Option::take`/`mem::replace`/`mem::take` are the idioms for moving out of a `&mut`. Pattern matching (by-value vs binding modes, Rust 2024 match-ergonomics reservations) works as a resource-transfer boundary.
- **Ownership topology over shared mutability** — the anti-pattern of reaching for `Arc<Mutex<T>>` when the real problem is the wrong ownership topology. Alternatives: tree-shaped ownership, arenas with generational indices for graphs, and an owner task fed by messages (→ Ch.4, Ch.6).
- *Lab:* 3-stage byte pipeline (allocate once → borrow to inspect headers → own the buffer and return it to a pool). Count allocations with a counting `#[global_allocator]` and trace `Drop` order through nested structs.

## Chapter 2 — Borrowing, Lifetimes, and References
How the borrow checker proves aliasing safety, and how to design zero-copy APIs around it.

### 2.1 The borrow checker's model
- **Aliasing XOR mutability** — many `&T` or exactly one `&mut T`, never both. This rule gives data-race freedom and the `noalias` facts the optimizer relies on (→ Ch.38). Reborrowing (`&mut *x`, implicit reborrows at call sites) and two-phase borrows (`v.push(v.len())`).
- **Lifetimes as constraints, not durations** — a lifetime describes how existing references relate and never extends a value's life. Elision rules; variance (`&'a T` covariant, `&'a mut T` and `Cell<T>` invariant) and why invariance bites; higher-ranked bounds (`for<'a> Fn(&'a T)`). `T: 'static` ("holds no non-static borrows") differs from `&'static T` and is rarely the right fix for an error.
- **NLL limits and the Polonius borrow checker** *(skipped)* — non-lexical lifetimes (RFC 2094) are computed on MIR. The conditional-return-of-a-borrow pattern that NLL still rejects (NLL "problem case #3") and its workarounds. **Polonius alpha** has been enabled on nightly since Aug 2026 and is targeted for stabilization by the end of 2026. Rust 2024 `impl Trait` capture rules and precise capturing with `use<..>`.

### 2.2 Zero-copy data and borrow scope
- **Zero-copy parsing with borrowed views** — `fn parse<'a>(buf: &'a [u8]) -> Header<'a>`; `Cow<'a, [u8]>` vs `&'a [u8]` vs an owned `Vec<u8>` for mostly-read workloads. Reference-counted zero-copy (`bytes::Bytes`) for when a borrow can't outlive the buffer's scope, as in network and async code. Self-referential structs and why `yoke`/`ouroboros` exist.
- **Borrows across thread and task boundaries** — `thread::spawn` and `tokio::spawn` require `'static` because the spawned work can outlive the caller. `std::thread::scope` is the borrow-friendly alternative. There is no sound scoped spawn in async, because futures may be leaked, so you move owned data or an `Arc` instead.
- *Lab:* zero-copy protocol parser over `&[u8]`, then port it to `Bytes` and compare allocations. Deliberately write a dangling-reference function and read the diagnostic. Reproduce NLL problem case #3 and compile it with Polonius on nightly.

## Chapter 3 — Traits, Generics, Monomorphization, and Dynamic Dispatch
Choose between static and dynamic polymorphism by measured cost, not habit.

### 3.1 Static vs dynamic polymorphism
- **Monomorphization and its costs** — generics with trait bounds are compiled once per concrete type, which enables inlining at zero run-time cost but bloats code and compile times. The "non-generic inner function" outlining trick, and `impl Trait` in argument vs return position.
- **Trait objects, vtables, and dyn compatibility** — `dyn Trait` is a fat pointer (data + vtable), and most of its cost is lost inlining, not the indirect call. Dyn-compatibility rules (formerly "object safety": no generic methods, no by-value `Self`) and the `where Self: Sized` escape hatch; trait upcasting (stable 1.86). Enum dispatch as the closed-set alternative for plugin-style boundaries.
- **Associated types, GATs, and coherence** — associated types vs generic parameters (one `Iterator` impl per type vs many `From<T>` impls). Generic associated types for lending iterators. The orphan rule, coherence, blanket impls and the newtype pattern. Specialization remains unstable. Async methods in traits → Ch.8.
- *Lab:* implement one codec as a generic function, behind `Box<dyn Codec>`, and as an enum. Benchmark throughput, binary size (`cargo bloat`) and compile time.

## Chapter 4 — Smart Pointers and Interior Mutability
Ownership shapes beyond a single owner, and their cost.

### 4.1 Shared ownership and interior mutability
- **Box, Rc, and Arc ownership shapes** — `Box` for heap ownership, `Rc` for a single-threaded refcount (`!Send`), `Arc` for an atomic refcount. "`Arc::clone` is cheap" stops being true under contention: every clone and drop is an atomic read-modify-write on a shared cache line (→ Ch.29).
- **Interior mutability: Cell, RefCell, UnsafeCell** — `UnsafeCell` is the only legal way to mutate through `&`. `Cell` copies values in and out. `RefCell` keeps a runtime borrow flag and panics on conflict; it is `!Sync` and explicitly NOT a synchronization primitive. `OnceCell`/`OnceLock` (stable 1.70) and `LazyLock` (stable 1.80) handle one-time initialization.
- **Reference cycles and Weak** — safe Rust can still leak through cyclic logical ownership. `Weak` breaks cycles (parent pointers, caches), and `Rc::new_cyclic` builds self-referencing structures.
- **Arc<Mutex<T>> as hidden serialization** — wrapping an unclear design until the compiler is satisfied serializes the hot path and hides contention. Alternatives: sharding, an owner task with a channel, and `arc-swap` (RCU-style) for read-mostly config.
- *Lab:* take an `Arc<Mutex<HashMap<..>>>` service, measure lock-hold time, redesign one path as an owner task with a channel, and compare throughput and tail latency.

## Chapter 5 — Type Layout, Alignment, and ABI
What the compiler does and does not promise about bytes in memory. The FFI protocol itself is in Ch.31.

### 5.1 Layout
- **Size, alignment, and padding rules** — size is a multiple of alignment, and padding depends on field order. `repr(Rust)` layout is chosen by the compiler and unstable (fields get reordered; `-Z randomize-layout` exposes code that assumes otherwise). Verify with `size_of`/`align_of`/`offset_of!` and compile-time assertions; never assume.
- **repr attributes and niche optimization** *(skipped)* — `repr(C)`, `repr(transparent)`, primitive enum reprs, `repr(packed)` (taking a reference to an unaligned field is UB, so use `&raw const`), and `repr(align(64))` for cache-line isolation. Niches make `Option<&T>`, `Option<Box<T>>` and `Option<NonZeroU32>` pointer- or integer-sized, and enum layout is only guaranteed in documented cases.
- **Safe byte-level views of structs** — reading wire and on-disk structs: alignment, endianness, and padding bytes (reading uninitialized padding as bytes is UB). `zerocopy`/`bytemuck` derive-checked `FromBytes`/`IntoBytes` replace hand-rolled `transmute` (→ Ch.16, Ch.19).

### 5.2 ABI and the declaration surface
- **ABIs and Rust 2024 unsafe declarations** *(skipped)* — the Rust ABI is unstable and `extern "C"` is the stable contract. A panic unwinding out of `extern "C"` aborts; use `"C-unwind"` when unwinding must cross. Rust 2024 requires `unsafe extern { .. }` blocks, where individually safe items can be declared `pub safe fn`, and makes `#[unsafe(no_mangle)]`/`export_name`/`link_section` unsafe attributes. v0 symbol mangling is the default since 1.97, and C-variadic function definitions are stable since 1.99.
- *Lab:* define a C-compatible packet header and verify `size_of`/`align_of`/field offsets against a C compiler. Add compile-time assertions, then show how `repr(Rust)` breaks the assumption and how a niche changes `Option<T>`'s size.

## Chapter 6 — Send, Sync, Arc, Mutex, and Ownership Across Threads
Concurrency boundaries are type-level facts. Make them explicit.

### 6.1 Thread-safety as types
- **Send and Sync as auto-traits** — `Send` means ownership may move to another thread; `Sync` means `&T` is `Send`. A type can be `Send` without being `Sync` (`Cell`, `RefCell`), `MutexGuard` is `!Send`, and `Rc` is neither. Opt-outs come through `PhantomData`, and `unsafe impl Send` is a proof obligation. A future is `Send` only if everything held across an `.await` is.
- **Arc shares, Mutex synchronizes** — `Arc` gives shared ownership only. `Mutex`/`RwLock` (futex-based in std, with poisoning semantics) or `parking_lot` provide the synchronization. Use `tokio::sync::Mutex` only when a lock must be held across `.await`, and never hold a std guard across `.await`.
- **Critical sections and external latency** — never do I/O inside a critical section: then the lock is serializing external latency, not just protecting a critical section. Lock ordering prevents deadlock; lock convoys and priority inversion are the other failure modes.
- **Explicit ownership-crossing points** — `thread::spawn`, `thread::scope`, `tokio::spawn(async move { .. })` and channel sends are the only places ownership changes threads. Design them deliberately (std `mpsc` is crossbeam-based internally).
- *Lab:* implement a concurrent counter three ways (Mutex, atomics, owner task with a channel) and compare throughput and tail latency at 1/2/4/8/16 workers.

## Chapter 7 — Atomics and the Memory-Ordering Model
What an atomic guarantees, what an ordering guarantees, and how lock-free code goes wrong.

### 7.1 The memory model
- **Atomicity versus ordering** — atomicity means no torn updates; ordering governs visibility between threads. These are distinct concerns. Rust's atomics follow the **C++20 memory model** (minus `consume`): happens-before, per-location modification order, and data races as UB. The Linux kernel's own memory model (LKMM) matters only for kernel Rust (→ Ch.39).
- **Acquire/Release publication and SeqCst** — the publication pattern: release-store a flag or pointer, then acquire-load it before reading the published data. `Relaxed` is fine for statistics counters. `SeqCst` matters only for store-load patterns such as Dekker or the store-buffer litmus test. Fences and `compiler_fence`; how orderings map to hardware (x86-TSO hides missing orderings that ARM exposes).

### 7.2 Lock-free building blocks
- **CAS loops and the ABA problem** *(skipped)* — `compare_exchange` vs `compare_exchange_weak` (spurious LL/SC failure) and `fetch_update`. The **ABA problem** and its mitigations: tagged/versioned pointers, epochs and hazard pointers (reclamation schemes → Ch.30). Lock-free vs wait-free progress guarantees.
- **Spin locks, futexes, and thread parking** *(skipped)* — how to build a spin lock correctly (test-and-test-and-set, `spin_loop` hint, backoff) and why userspace spinning is usually wrong under preemption. Futex-based mutexes and condvars, and `thread::park`/`unpark` as the primitive under channels and locks.
- *Lab:* build an SPSC ring buffer with a `Mutex`, then with atomic indices. Define the slot-ownership invariant, check it with loom (→ Ch.42), and run on ARM to expose a deliberately weakened `Acquire`.

# Milestone 2 — Async Runtime Internals
Understand async Rust from `Future::poll` up through Tokio's scheduler, I/O driver, and shutdown semantics.

## Chapter 8 — Future, Waker, Pin, and the Async State Machine
What `async` compiles to, and the 2026 language surface around it.

### 8.1 Futures as state machines
- **Futures, Poll, and the Waker contract** — a `Future` is a lazy computation: constructing one does no work, and that laziness is itself a backpressure mechanism. The `Poll::Pending` contract says a pending future must arrange for its `Waker` to be called. The architecture is Future → Waker → scheduler → poll, not a hidden thread.
- **async/await lowering and future size** — the compiler lowers `async fn` into an enum of suspension states holding the live locals at each `.await`. Large futures and the stack and `memcpy` cost they impose (`Box::pin` big futures, Clippy `large_futures`), and how holding a `!Send` value across `.await` makes the whole future `!Send`.
- **Pin and self-referential state** — `Pin` exists because an async state machine may hold references into itself after its first poll, and these break if the value moves. `Pin<&mut Self>`, `Unpin`, the `pin!` macro, and pin projection (`pin-project-lite`) with structural vs non-structural pinning.

### 8.2 The async language surface
- **Async fn in traits and Send bounds** — async fn in traits and return-position `impl Trait` in traits have been stable since 1.75. The "Send bound problem": callers cannot require the returned future to be `Send`. Return-type notation (RFC 3654) would fix it but is still unstable in 2026. Workarounds: `trait-variant`, the boxing `async-trait`, and `dynosaur` for `dyn` dispatch.
- **Async closures and AsyncFn traits** *(skipped)* — stable since 1.85 (RFC 3668). Closures can return futures that borrow from their captures, and `AsyncFn`/`AsyncFnMut`/`AsyncFnOnce` bounds replace the `F: Fn() -> Fut` higher-ranked workaround. Rust 2024 adds `Future`/`IntoFuture` to the prelude. Async drop is still unstable, so async cleanup has to be explicit.
- *Lab:* write a future that returns `Pending` once and then `Ready`, logging every poll and wake. Build a tiny executor with a runnable queue and a `Waker` built from `Arc<Task>` (the `std::task::Wake` trait).

## Chapter 9 — Tokio Runtime Architecture
How Tokio schedules tasks and drives I/O, and the operating rules that follow.

### 9.1 Scheduling
- **Tasks multiplexed on worker threads** — tasks are lightweight state machines multiplexed onto worker threads, not 1:1 with OS threads, so blocking a worker stalls unrelated tasks. Choosing the current-thread vs multi-thread runtime is a workload-shape decision, and `LocalSet` runs `!Send` tasks.
- **Work stealing and cooperative budgeting** — each worker has a local run queue plus a LIFO slot for message-passing locality; a global injection queue sits behind them, and idle workers steal half of a busy worker's queue. Cooperative budgeting forces a task to yield after a per-poll budget of resource operations, so a hot loop over a ready socket can't starve its neighbours.
- **Blocking and CPU-bound work** — `spawn_blocking` (bounded blocking pool), `block_in_place`, and rayon or a separate dedicated runtime for CPU-heavy work (the pattern DataFusion-based engines use for query execution vs network I/O). Thread-per-core, shared-nothing runtimes (glommio, monoio, compio) are the alternative design point.

### 9.2 Drivers and operations
- **I/O and time drivers** — the I/O driver (mio over epoll/kqueue/IOCP) follows register interest → park the worker → readiness event → wake task → poll again, which ties directly to Ch.13. Timers use a hierarchical timer wheel. io_uring in Tokio is still an unstable, opt-in `io-uring` feature for filesystem operations in 1.5x (behind `tokio_unstable`); the separate `tokio-uring` runtime has seen few releases (→ Ch.14).
- **Runtime observability and operating rules** — tokio-console, runtime metrics (stabilization in progress since 1.38) and task dumps. Operating rules: keep tasks small enough to yield, bound concurrency with a `Semaphore`, bound every channel, and define cancellation semantics explicitly. Track LTS lines and the rolling MSRV (1.85 as of 2026).
- *Lab:* async TCP accept loop with a bounded semaphore, a task per connection, timeouts, a shutdown signal and metrics. Overload it past the bound and observe the behaviour. Then block one worker with a synchronous sleep and watch unrelated connections' p99 in tokio-console.

## Chapter 10 — Channels, Backpressure, Cancellation, and Graceful Shutdown
Async code fails by unbounded queues and silent cancellation. Make both explicit.

### 10.1 Flow control and lifecycle
- **Bounded channels and backpressure** — any concurrency or queueing you introduce must use a **bounded** channel, or memory exhaustion follows. Capacity is an application-specific burst-tolerance decision (Little's law sizing). Tokio's channels have different semantics: `mpsc`, `broadcast` (lagging receivers lose messages), `watch` (latest value only) and `oneshot`. `try_send` is the load-shedding hook.
- **Cancellation by drop and cancel safety** — cancellation means dropping the future at its current `.await`, and gets subtle once background tasks and external resources are involved. `select!` drops the losing branches, which defines cancel safety: dropping and recreating the future must lose nothing (`mpsc::Receiver::recv` is cancel-safe, `read_exact` is not). Dropping a `JoinHandle` detaches a task, it does not cancel it; use `abort`, `JoinSet` or `AbortHandle`. There is no async drop.
- **Structured shutdown with tokens and trackers** — `CancellationToken` + `TaskTracker` (tokio-util). An explicit shutdown sequence: stop accepting → signal workers → drain or cancel per policy → close transports → wait for completion with a deadline. SIGTERM handling and Kubernetes termination grace periods.
- *Lab:* build a worker pool that rejects new jobs after shutdown and guarantees every accepted job completes or is explicitly abandoned. Add a `select!` branch that is not cancel-safe, show the lost data, and fix it.

---

# Milestone 3 — OS, Networking, and Protocol Layer
Learn the kernel and protocol layers that a runtime abstracts away, well enough to know when to bypass the abstraction.

## Chapter 11 — Processes, File Descriptors, Syscalls, and Resource Ownership
The user/kernel boundary and how Rust's types model kernel handles.

### 11.1 The user/kernel boundary
- **Syscalls as boundary crossings** *(skipped)* — mode-switch cost, the vDSO, and how Spectre/Meltdown-era mitigations raised it. Batching trade-offs (`writev`, `recvmmsg`, io_uring). Measure with `strace -c` and `perf trace`.
- **File descriptors and I/O safety** — an fd is a process-local handle to a kernel *open file description*, so duplicated or forked fds share an offset. I/O safety (RFC 3128, stable 1.63): `OwnedFd` closes on `Drop`, `BorrowedFd<'a>`/`AsFd` borrow, and `into_raw_fd(self)`/`from_raw_fd` are the explicit ownership handoffs that prevent use-after-close. std opens with `O_CLOEXEC` by default; fd leaks across exec; `RLIMIT_NOFILE`.
- **Processes, signals, and environment safety** — `std::process::Command`, and why after `fork` in a multithreaded process only async-signal-safe operations are allowed. Signal handling in async code (`tokio::signal`, `signal-hook`), and pidfds for race-free process management. `std::env::set_var` is `unsafe` in Rust 2024 because of races with C `getenv`.
- *Lab:* wrap a raw socket in `OwnedFd`, prove double-close is impossible and inspect `/proc/<pid>/fd`. Then leak an fd into a child with `CLOEXEC` cleared and find it.

## Chapter 12 — Virtual Memory, mmap, Page Faults, and Memory Mappings
Address translation, mapping semantics, and why databases rarely trust `mmap`.

### 12.1 Virtual memory
- **Address translation and page faults** *(skipped)* — virtual address → page-table walk → physical frame, with permissions enforced. TLB reach and huge pages (THP, hugetlbfs), and the TLB shootdowns that `munmap`/`mprotect` trigger. Major vs minor faults. `/proc/<pid>/maps` and `/proc/<pid>/smaps` (RSS vs PSS).
- **mmap semantics and Rust soundness** *(skipped)* — anonymous vs file-backed, shared vs private copy-on-write, and `madvise` hints. Why `memmap2::Mmap::map` is `unsafe`: another process truncating or rewriting the file breaks the immutability `&[u8]` promises (UB or `SIGBUS`).
- **mmap versus an owned buffer pool** — the double-caching problem (page cache and application cache holding the same data), and direct I/O trading it for alignment constraints. Crotty, Leis & Pavlo (CIDR 2022): transactional-safety, I/O-stall, error-handling and TLB-shootdown problems explain why most DBMSs own their buffer pool (→ Ch.19), and when mmap is fine (read-mostly, LMDB-style).
- *Lab:* map a multi-GB file, scan it sequentially and then randomly, and record page faults, RSS and throughput. Repeat with `read`-based I/O and with `MADV_RANDOM`/`MADV_SEQUENTIAL`.

## Chapter 13 — epoll and Readiness-Driven Networking
The readiness model under mio and Tokio.

### 13.1 Readiness
- **Interest lists and ready lists** *(skipped)* — the epoll interest list vs the ready list, and `epoll_wait`. Portability: kqueue is also readiness-based, while Windows IOCP is completion-based. mio is the Rust abstraction over all three.
- **Level- versus edge-triggered semantics** *(skipped)* — the edge-triggered rule: every readable event needs a read-until-`EAGAIN` loop, and every writable event needs a drain of the outbound buffer. `EPOLLONESHOT`; `EPOLLEXCLUSIVE` and `SO_REUSEPORT` against thundering-herd accept.
- **Application-owned protocol state machines** *(skipped)* — the kernel reports readiness, and the application owns the protocol state: input buffer, output buffer, parser state, deadlines and lifecycle. Tokio's `AsyncFd`/`poll_read_ready` encodes exactly this split.
- *Lab:* implement a level-triggered echo server, convert it to edge-triggered, introduce partial writes and slow readers, and find where the state machine breaks.

## Chapter 14 — io_uring and Submission/Completion Queues
Completion-based I/O, and why it collides with Rust's borrow-based I/O traits.

### 14.1 The io_uring model
- **Submission and completion rings** *(skipped)* — ring buffers shared between user space and the kernel (an SQE describes an operation, a CQE reports its completion), and `io_uring_enter` batching. SQPOLL kernel-thread polling changes the batching story. Linked SQEs, CQ overflow, registered files and buffers, provided buffer rings, multishot accept/recv, zero-copy send, and zero-copy receive (zcrx, Linux 6.15; needs NIC header split and flow steering).
- **Completion I/O and Rust buffer ownership** *(skipped)* — critical lifetime rule: a buffer referenced by an in-flight SQE must stay valid until its CQE arrives. A borrowed `&mut [u8]` plus a dropped future is a use-after-free, so io_uring runtimes use owned-buffer ("rent"/`IoBuf`) APIs (`tokio-uring`, `monoio`, `compio`; the low-level `io-uring` crate). Cancellation (`ASYNC_CANCEL`) still has to wait for the CQE.
- **When io_uring wins, and its risks** *(skipped)* — io_uring is not universally faster. Benchmark it against blocking `read` and epoll on submissions per batch, completions per batch, cache misses, syscalls, CPU and tail latency. Its security record counts too: Google reported in June 2023 that 60% of kCTF VRP kernel-exploit submissions over the preceding year used io_uring, and disabled or restricted it on ChromeOS, Android apps and its production servers, so check the seccomp policy of your target platform.
- *Lab:* file-read microbenchmark, blocking `read` vs io_uring with fixed-size registered buffers and `O_DIRECT`. Measure CPU time per GB and the latency distribution.

## Chapter 15 — Filesystems, Page Cache, Direct I/O, and Durability
What "written" means, and what it takes to make it durable.

### 15.1 Durability
- **Buffered versus direct I/O** — buffered I/O goes through the page cache (writeback, readahead, dirty-page throttling). Direct I/O (`O_DIRECT`) bypasses it under alignment and completion constraints (logical block size, aligned buffers). `posix_fadvise`.
- **fsync semantics and failure modes** — a successful `write` is not durable. Durability may need both the file data AND the directory metadata on stable storage: `fsync` the file and its parent directory after create or rename, and use the write-temp + fsync + rename + fsync-dir atomic-replace pattern. In Rust, `File::sync_all` vs `sync_data`. After **fsyncgate** (PostgreSQL, 2018), a failed fsync may drop dirty pages, so retrying can lie; crash and recover from the WAL instead (Rebello et al., USENIX ATC 2020). Torn writes and `RWF_ATOMIC` (Linux 6.11+, direct I/O, needs hardware support).
- **WAL flush points and I/O measurement** — databases use a WAL plus explicit flush points, not an fsync per small update (→ Ch.20). Volatile device write caches and FUA. Tools: `strace`, `perf`, `biolatency`/bpftrace, device queue-depth counters.
- *Lab:* journaled file format. Crash the process at four distinct write/flush stages and verify which states survive restart, then inject an fsync error (e.g. `dm-flakey`/`dm-error`) and show why retrying is wrong.

## Chapter 16 — TCP Sockets, Framing, Partial I/O, and Backpressure
From byte stream to messages, with explicit overload behaviour.

### 16.1 Streams and frames
- **TCP as a byte stream** — TCP is a byte stream, not a message queue: `read`/`write` can be partial. Nagle and delayed ACK (`TCP_NODELAY`), socket buffer sizing vs the bandwidth-delay product, half-close (`shutdown(Write)`) vs RST, `SO_LINGER`, TIME_WAIT.
- **Framing strategies and failure modes** — length-prefix (cap the frame size or get DoS'd), delimiter-based (escaping, scan cost) and fixed-size framing each fail differently. `tokio_util::codec` (`Decoder`/`Encoder`/`Framed`) and `BytesMut::split_to` for zero-copy frame extraction.
- **Connection-level backpressure** — backpressure is explicit connection state-machine behaviour: pause producers (stop reading, so the TCP window closes and the sender blocks), drop by policy, or close once a limit is reached. Bound the output buffer per connection, set per-connection timeouts, and defend against slow-loris.
- *Lab:* length-prefixed TCP protocol with a 1 MiB max frame, a bounded output buffer, per-connection timeouts and graceful half-close.

## Chapter 17 — HTTP/1.1, HTTP/2, HTTP/3, QUIC, and TLS 1.3
Where head-of-line blocking lives, and how to review a TLS deployment.

### 17.1 Transports and multiplexing
- **HTTP/1.1 and HTTP/2 multiplexing** *(skipped)* — RFC 9112/9113. HTTP/2 multiplexes streams over one TCP connection, so one lost packet stalls all of them. The general rule: when transport recovery is coarser than the application's unit of concurrency, failures get amplified. HTTP/2 flow-control windows, and Rapid Reset (CVE-2023-44487) as an abuse of stream concurrency. hyper 1.x as the Rust stack.
- **QUIC and HTTP/3** *(skipped)* — RFC 9000/9001/9002/9114. Flow-controlled independent streams over UDP, a 1-RTT handshake (0-RTT on resumption), connection IDs and path migration, integrated TLS, and congestion control in user space. Costs: CPU, plus UDP GSO/GRO needed to compete. Rust implementations: quinn, `h3`, quiche, s2n-quic.

### 17.2 TLS
- **TLS 1.3 review with rustls** *(skipped)* — RFC 8446. Review checklist: certificate validation, SNI/ALPN, key establishment, session resumption, 0-RTT replay risk, and safe shutdown on authentication failure. rustls with the aws-lc-rs provider, including the hybrid post-quantum key exchange X25519MLKEM768. mTLS for service-to-service traffic.
- *Lab:* trace one request over HTTP/1.1, HTTP/2 and HTTP/3 under injected packet loss (`tc netem`) and compare tail behaviour, not just wall-clock latency.

## Chapter 18 — Axum, Tower, and Production Service Boundaries
The `Service` abstraction, backpressure through `poll_ready`, and middleware order as semantics.

### 18.1 Service composition
- **Tower Service and poll_ready backpressure** — `tower::Service` is `poll_ready` plus `call`; readiness is the backpressure contract, and `Layer`s compose services. `ConcurrencyLimit`, `LoadShed`, `RateLimit` and `Timeout`, and `Buffer` with the hidden queue it introduces.
- **Axum on Tower and hyper** — Axum has no middleware system of its own; it is built entirely on `tower::Service`, so Tower middleware (timeouts, tracing, compression, authorization via `tower-http`) is shared with any Tower-based stack. Extractors, `State`, `middleware::from_fn`, and the 0.8 routing syntax (`/{param}`).
- **Middleware ordering as semantics** — order changes meaning. A timeout before vs after auth bounds different things. Retrying a non-idempotent operation is catastrophic, so you need retry budgets and idempotency keys (→ Ch.28). Where the tracing layer sits decides whether a span describes one logical request or one retry attempt. `ServiceBuilder` applies the first layer outermost.
- *Lab:* build a service with timeout, trace, auth and retry middleware, deliberately misorder them to demonstrate the bug, then document the invariant the correct order protects.

---

# Milestone 4 — Storage-Engine Internals
Build the physical layer of a database (pages, buffer pool, WAL, B-tree, LSM, MVCC, columnar) and understand the trade-offs. Systems-level companion to → *Data Engineering* Ch.5.

## Chapter 19 — Pages, Records, and Physical Storage Layout
Bytes on disk, identity of records, and who caches pages.

### 19.1 Page design
- **Self-describing page formats** — PostgreSQL's page layout as the reference: a fixed-size page with a header, line pointers, tuples, free space and a special area. A self-describing format carries a magic number, format version, slot info, a checksum (CRC32C) and the page LSN. Encode endianness and alignment explicitly (→ Ch.5).
- **Slotted pages and record identity** — a slotted page separates the tuple identifier from the physical offset, so records can move within a page while their logical identity (the slot) stays stable. In-page compaction, variable-length records, overflow pages and TOAST-style out-of-line storage.
- **Update strategies: in-place, append, copy-on-write** — in-place, append-only and copy-on-write updates trade off fragmentation, MVCC support and compaction cost differently (PostgreSQL heap vs LSM append vs LMDB-style CoW B-tree).
- **Buffer pool and page eviction** — the frame table, pin counts and dirty bits; eviction policies (LRU-K, CLOCK, 2Q); latches (short, physical) vs locks (transactional). Modern designs avoid the hash-table indirection: LeanStore pointer swizzling (ICDE 2018) and vmcache (SIGMOD 2023). Contrast with the mmap approach (Ch.12).
- *Lab:* implement a 4 KiB slotted page, insert variable-length records, delete half, compact, fuzz malformed offsets, and add a page checksum and format version. Put a small CLOCK buffer pool in front of it.

## Chapter 20 — Write-Ahead Logging and Crash Recovery
Log first, data later, and how recovery decides what to redo.

### 20.1 Logging and recovery
- **Write-ahead rule and LSNs** — "log first, data later": a durable log record must reach its durability point before the data page can be trusted after a crash. The Log Sequence Number lets recovery decide whether a redo record still needs applying (`page.lsn >= record.lsn` makes redo idempotent). Physical vs logical vs physiological logging; torn pages and the fixes for them (PostgreSQL full-page writes, InnoDB doublewrite buffer).
- **ARIES steal/no-force recovery** — the analysis, redo and undo passes, compensation log records and fuzzy checkpoints. Why steal + no-force is the high-performance buffer policy, and when a simpler redo-only design (no-steal, typical of LSM engines) is enough.
- **Group commit and commit latency** — group commit batches several transactions into one flush. Commit latency ≠ execution time: p99 commit latency can be dominated by flush contention. Leader/follower group-commit implementation in Rust, and what asynchronous commit gives away.
- *Lab:* single-file WAL with length-prefixed, checksummed records. Crash after append-before-page-write and after page-write-before-checkpoint; recovery must never expose a partial commit. Add group commit and plot p99 commit latency against batch size.

## Chapter 21 — B-Trees, Page Splits, and Range Scans
The read-optimized index, crash-safe and concurrent.

### 21.1 B+-tree mechanics
- **B+-tree fanout and page splits** — PostgreSQL's B-tree (nbtree) as the reference. High fanout keeps the tree a few levels deep even at billions of records, at the cost of page splits and write amplification. Merges, prefix/suffix truncation and fill factor.
- **Crash-safe structure modifications** *(skipped)* — a partial split must never orphan or duplicate a key range. Structure modifications are WAL-logged, or avoided entirely by copy-on-write B-trees (LMDB, redb).
- **Range scans and B-link trees** *(skipped)* — range scans rely on leaf ordering and traversal to neighbouring leaves, not just balanced search. Right-links and high keys (Lehman & Yao, 1981) keep scans and descents correct while a concurrent split is in progress.
- **Concurrent B-tree latching protocols** *(skipped)* — latch crabbing (lock coupling) vs optimistic lock coupling with version counters (Leis et al., "The ART of Practical Synchronization", DaMoN 2016), and why reads should take no shared-memory writes.
- *Lab:* disk-backed B-tree over fixed pages with point lookup, ascending range scan and splits. Kill the process mid-split and recover from the WAL.

## Chapter 22 — LSM Trees, Memtables, SSTables, and Compaction
The write-optimized engine and the amplification triangle.

### 22.1 LSM mechanics
- **LSM write and read paths** — write path: durable log append → memtable → rotate to an immutable memtable → flush as a sorted SSTable. Reads check the newest structures first. Immutable flushed files simplify concurrent reads and recovery.
- **Compaction strategies and amplification** — leveled vs tiered (universal) vs hybrid compaction, and the read/write/space amplification trade-off (RUM conjecture). Compaction must be budgeted against foreground I/O and CPU (rate limiting, write stalls).
- **Bloom filters and their successors** — Bloom filters rule out SSTables that definitely lack a key: no false negatives, some false positives. A negative result is proof of absence; a positive result only gives permission to look. False-positive rate vs bits per key, per-level allocation (Monkey, SIGMOD 2017), Ribbon/xor filters, and prefix filters for range scans.
- **Key-value separation and object-store LSMs** *(skipped)* — WiscKey (FAST 2016) value logs for large values; LSMs written directly to object storage (SlateDB). The Rust engine landscape: `rust-rocksdb` bindings, fjall.
- *Lab:* LSM key-value store with a WAL, memtable, immutable memtable, SSTables, a Bloom filter and one compaction policy. Measure write and read amplification under skewed vs uniform workloads.

## Chapter 23 — MVCC, Visibility, and Transaction Isolation
Snapshots, anomalies, and the garbage that versions leave behind.

### 23.1 Multi-version concurrency control
- **Snapshot visibility over version chains** — PostgreSQL's MVCC docs as the reference. Visibility is a function of version metadata plus the transaction's snapshot, not "the newest row" (`xmin`/`xmax`). Writers create new versions instead of overwriting ones a concurrent reader may need, which stops readers blocking on writers but ties visibility to garbage collection. Version-storage designs: append, time-travel and delta storage, oldest-to-newest vs newest-to-oldest chains (Wu et al., VLDB 2017).
- **Isolation levels and their anomalies** — isolation levels are statements about which concurrent histories are allowed. Read committed vs snapshot isolation vs serializable; write skew as the anomaly SI permits; Adya's dependency-graph formalism. Serializable Snapshot Isolation (Cahill et al., SIGMOD 2008; in PostgreSQL, Ports & Grittner, VLDB 2012).
- **Version garbage collection and long snapshots** — version retention is coupled to vacuum: old versions can't be reclaimed while any active snapshot might need them, so one long-running transaction becomes a storage-growth problem. Epoch-based version GC (→ Ch.30).
- *Lab:* simulate two concurrent transactions over an in-memory version chain. Implement read-committed and repeatable-read visibility and measure version retention under a long-lived reader. Write a write-skew test that passes under SI and add a detection rule that rejects it.

## Chapter 24 — Columnar Storage, Vectors, and Compression
The analytic layout behind Arrow, Parquet, Polars and DataFusion.

### 24.1 Columnar layout
- **Columnar layout and the Arrow format** — column-major storage reduces bytes touched for narrow projections, improves cache locality and enables SIMD-friendly loops, but it hurts point updates and wide-row access. The Apache Arrow format: validity bitmaps, offset buffers, dictionary arrays, and the variable-size view layouts (`Utf8View`/`BinaryView`, "German strings") with inline prefixes. `arrow-rs` as the Rust implementation.
- **Lightweight encodings and cascading compression** — run-length, delta, dictionary, frame-of-reference and bit-packing, chosen by data distribution, predicate shape and decode cost, not by default. Cascading compression (BtrBlocks, SIGMOD 2023), FSST for strings (VLDB 2020), ALP for floats (SIGMOD 2024), and executing directly on compressed data. Next-generation files beyond Parquet: Vortex (LF AI & Data, 2025) and Lance.

### 24.2 Execution
- **Vectorized versus compiled query execution** — vectorized execution processes batches instead of rows to cut interpreter overhead (MonetDB/X100, CIDR 2005), using selection vectors. The alternative is data-centric code generation (HyPer, VLDB 2011); Kersten et al. (VLDB 2018) compare the two. Polars and DataFusion are vectorized Arrow engines.
- **SIMD in Rust** — autovectorization and how to verify it (→ Ch.38); `std::arch` intrinsics; safe `#[target_feature]` functions (stable 1.86) with runtime feature detection and multiversioning; portable `std::simd` (still nightly-only). The `-C target-cpu` trade-off for binaries you distribute.
- *Lab:* column scan over 10M integers comparing row-major structs with column-major arrays. Add RLE or delta encoding and an explicit SIMD kernel; measure bytes read, cycles per row and the effect of predicate selectivity.

---

# Milestone 5 — Distributed Systems and Streaming
Replication, consensus, logs and convergent state, specified precisely enough to implement and test. Implementation companion to → *Data Engineering* Ch.14 and Ch.9.

## Chapter 25 — Replication, Quorums, and Failure Semantics
What an acknowledgement promises, and how to prove it under failure.

### 25.1 Replication semantics
- **Acknowledgement points define durability** — grounded in the Kafka design docs and the Raft paper. Durability vs availability is decided by *which* acknowledgement point is used: accepted by a subset, persisted by a quorum, or durably recorded by the leader. Kafka's `acks`, ISR and `min.insync.replicas`; Kafka has run KRaft-only (no ZooKeeper) since 4.0 (March 2025).
- **Quorum intersection is not enough** *(skipped)* — quorum intersection is necessary but not sufficient: you still need an explicit rule for which version wins (consensus order, vector clocks, or last-writer-wins with its clock hazards). Sloppy quorums and hinted handoff weaken it further (→ *Data Engineering* Ch.14).
- **Failure injection and linearizability checking** — inject process death, partitions, delayed packets, duplicate requests, disk-full and clock skew together, not one at a time. Jepsen-style methodology: record histories and check them with a linearizability or isolation checker (Knossos, Porcupine, Elle). Deterministic simulation → Ch.42.
- *Lab:* three-node replicated register. Inject delayed acks and leader failure, record which reads are permitted at each point, and check the history for linearizability.

## Chapter 26 — Raft: Leader Election, Log Replication, and Commitment
Consensus from the paper to a correct, testable implementation.

### 26.1 Core protocol
- **Leader election, terms, and PreVote** — terms; follower, candidate and leader roles; randomized election timeouts. A candidate must prove its log is up to date under the voting rules. PreVote and CheckQuorum stop a partitioned node from disrupting a healthy cluster.
- **Log replication and commitment rules** — `AppendEntries{term, prev_log_index, prev_log_term, entries, leader_commit}`. An entry commits only once stored on a majority under the leader's current term (the Figure 8 hazard). Conflict repair: the leader backs up to a common prefix and overwrites a follower's divergent suffix, and it must be impossible to silently corrupt indexes. Separating consensus from the state machine lets you test consensus against a trivial KV state machine first.

### 26.2 Production concerns
- **Linearizable reads: ReadIndex and leases** *(skipped)* — why a correct Raft can still return stale reads from a follower or a deposed leader. ReadIndex (confirm leadership with a heartbeat round), leader leases (which assume bounded clock drift), and follower reads via ReadIndex.
- **Membership changes and log compaction** *(skipped)* — joint consensus vs single-server membership changes (and the published single-server bug and its fix). Snapshots with InstallSnapshot to collapse log prefixes. Rust implementations to read: `raft-rs` (TiKV) and `openraft`.
- *Lab:* 3-node Raft-like log, deterministic timers first, then randomized elections. Inject partitions and restarts and compare the observed history against a linearizable register spec. Then serve reads from a stale leader and fix it with ReadIndex.

## Chapter 27 — Kafka-Style Logs, Partitions, and Delivery Semantics
The log abstraction, built and broken. Product-level Kafka → *Data Engineering* Ch.9.

### 27.1 Log mechanics and semantics
- **Partitioned logs and per-key ordering** — a topic is divided into partitions, each an ordered append-only log, so ordering is scoped to a partition, not the topic. Key-based partitioning (`hash(key) % N`) preserves per-key order while spreading load, and changing N breaks it. Segment files and sparse offset indexes.
- **Delivery semantics and idempotent consumers** — at-most-once, at-least-once and exactly-once are defined by where publish, consume and commit fail, not by the network. The idempotent producer (producer ID + sequence number) and transactions (`read_committed`). Use idempotent consumers even with transactional broker support, because downstream side effects (payments, email) need their own dedup. Consumer-group protocols: KIP-848 (GA in Kafka 4.0); share groups for queue semantics (KIP-932, preview in 4.1, production-ready in 4.2).
- **Retention, compaction, and tiered storage** — log compaction keeps the latest value per key forever (with tombstones), unlike time/size retention. Tiered storage (KIP-405) offloads cold segments to object storage. The Rust client (`rdkafka`) wraps librdkafka.
- *Lab:* partitioned log with consumer offsets. Run at-least-once, crash between the side effect and the offset commit, observe the duplicate, then make the consumer idempotent.

## Chapter 28 — CRDTs, Idempotency, and Convergent State
When state can merge without coordination, and when it cannot.

### 28.1 Convergence
- **CRDT merge semantics: state, op, delta** *(skipped)* — the real question is whether the state has a mathematically safe merge that matches user semantics, not whether CRDTs are fashionable. A merge must be commutative, associative and idempotent (a join-semilattice). State-based vs op-based vs delta-state CRDTs. Counters, OR-sets and registers with version metadata each need different merge rules, so the merge operator is part of the data model. Metadata and tombstone growth. Automerge and Loro as Rust references.
- **Coordination avoidance: CALM and invariants** *(skipped)* — CALM: monotonic programs need no coordination (Hellerstein & Alvaro, CACM 2020), and invariant confluence (Bailis et al., VLDB 2015) is the test. When NOT to use a CRDT: business rules that need a single lock holder (uniqueness, non-negative balances) or other global invariants require a coordination protocol instead.
- **Idempotency keys for distributed APIs** — the practical cousin of exactly-once. Key scope and TTL, storing and replaying the response, and the race between concurrent retries carrying the same key.
- *Lab:* model a replicated shopping-cart quantity (CRDT) vs a unique reservation (consensus). Explain why only one merges without coordination.

---

# Milestone 6 — Performance, Unsafe Code, FFI, Build, and Observability
The engineering disciplines that make a Rust system fast, sound, embeddable, releasable, and diagnosable.

## Chapter 29 — Performance Engineering: Caches, Branch Prediction, NUMA, Profiling
Measure first, then explain the curve with the hardware.

### 29.1 Method and tooling
- **Benchmarking discipline and statistics** — the workflow is measure → hypothesize → change → measure. Sources of noise: frequency scaling and turbo, SMT, noisy neighbours, warm-up, and `black_box`. Track p50/p95/p99 and the tail, not the average (a median improvement can be a p99 regression), with HDR histograms, and avoid coordinated omission in load generators. Criterion and Divan for wall-clock benchmarks; instruction-count benchmarks (iai-callgrind, renamed Gungraun) for stable CI signals.
- **CPU and memory profiling** — `perf stat`/`perf record`, flamegraphs (`cargo flamegraph`, samply), off-CPU profiling, and top-down microarchitecture analysis. Heap profiling (dhat, heaptrack); allocator choice (jemalloc, mimalloc) as a measured decision.

### 29.2 Hardware effects
- **Cache lines and false sharing** — the cache line is the unit of memory movement. **False sharing** is a reason lock-free structures can underperform locked ones; fix it with padding (`crossbeam_utils::CachePadded`) and per-core sharding. Struct-of-arrays layout and prefetch-friendly access.
- **Branch prediction and speculation** *(skipped)* — misprediction cost, branchless selection, sorted vs unsorted data, and `#[cold]`/`#[inline(never)]` to shape the hot path.
- **NUMA and CPU topology** *(skipped)* — multi-socket memory-locality effects can overwhelm parallelism gains if ignored. First-touch allocation, `numactl`, thread pinning, chiplet/L3-domain boundaries on modern server CPUs, and why thread-per-core designs exploit topology (→ Ch.9).
- *Lab:* benchmark shared, sharded and padded counters at 1/2/4/8 threads with cache-miss and context-switch counters, and explain the scaling curve.

## Chapter 30 — Unsafe Rust, Allocators, and Memory Reclamation
Unsafe is a larger proof obligation, not a faster mode.

### 30.1 Soundness
- **Unsafe contracts and safety comments** — unsafe code must prove validity, aliasing, initialization, lifetime, alignment and thread-safety. Every unsafe function documents its preconditions (`# Safety`) and every unsafe block states why they hold (`// SAFETY:`, enforced by Clippy `undocumented_unsafe_blocks`). "This is faster" is not a safety argument. Rust 2024 warns on `unsafe_op_in_unsafe_fn` by default. Soundness means no safe caller can trigger UB, which is stronger than "my callers don't".
- **Undefined behavior: validity, provenance, aliasing** — the Reference's UB list. Validity invariants (`bool`, enum discriminants, non-null aligned references) and `MaybeUninit`. Pointer provenance and the strict-provenance APIs (stable 1.84); `&raw const`/`&raw mut` (stable 1.82). Aliasing models: Stacked Borrows → Tree Borrows (PLDI 2025). `static mut` references are denied by default in Rust 2024.
- **Miri and sanitizers for UB detection** — Miri interprets MIR and detects provenance, aliasing and validity violations, data races and weak-memory behaviours (Jung et al., POPL 2026). Its limits: speed, FFI, and only the paths actually executed. Run `cargo +nightly miri test` in CI. The `-Zsanitizer` flag is still nightly-only, though the Tier 2 `x86_64-unknown-linux-gnuasan` target lets AddressSanitizer run from a stable compiler; AddressSanitizer/LeakSanitizer are close to stabilization, while MemorySanitizer/ThreadSanitizer need an instrumented std.

### 30.2 Memory management
- **Custom allocators and arenas** *(skipped)* — `GlobalAlloc` and `#[global_allocator]`; the still-unstable `Allocator` trait (and `allocator-api2`). Arenas (bump allocators such as bumpalo), fixed-size pools and region lifetimes with bulk deallocation are justified only when allocation topology is predictable.
- **Lock-free memory reclamation schemes** *(skipped)* — why freeing memory is the hard part of lock-free structures. Epoch-based reclamation (crossbeam-epoch; one stalled thread blocks reclamation), hazard pointers (a per-access fence, bounded garbage), and newer hybrids and RCU. Ties back to ABA (Ch.7).
- *Lab:* implement a bump arena and prove individual drops aren't required. Expose one unsafe accessor with a documented safety contract and boundary-case tests, and run them under Miri with Tree Borrows.

## Chapter 31 — FFI, ABI, Dynamic Linking, and Native Interop
The FFI boundary is a protocol, not just `repr(C)`. Layout rules are in Ch.5.

### 31.1 Native interop
- **FFI boundary as a protocol** — who allocates and who frees, how errors are represented, alignment, unwinding (`"C-unwind"`), thread affinity, and whether callbacks can arrive concurrently or reentrantly.
- **Binding generation and linking** *(skipped)* — prefer generated bindings over handwritten ones that drift: bindgen (C → Rust), cbindgen (Rust → C), `cxx` for safe C++ interop. `-sys` crate conventions with `build.rs` + `cc`/`pkg-config`; static vs dynamic linking, symbol visibility, and `dlopen` via `libloading`.
- **Callbacks and cross-boundary lifetimes** *(skipped)* — a native library that calls back after the initiating Rust function returns needs a stable heap allocation plus a context pointer (`Box::into_raw`/`from_raw`) and explicit synchronization and unregistration, not a stack-captured closure. Panics must never unwind through C frames.
- **Embedding Rust in Python and JVM** — the data-platform deployment model. PyO3 + maturin (Polars, delta-rs and pydantic-core ship this way): `Python<'py>` tokens, releasing the GIL around Rust work, and zero-copy exchange via the Arrow C Data Interface/PyCapsule. Free-threaded CPython is officially supported from 3.14 (PEP 779). JNI (`jni` crate) for Spark accelerators such as Comet: who owns JVM vs native memory.
- *Lab:* wrap a tiny C library that allocates and frees buffers, add safe ownership, introduce a callback with explicit lifetime handling, and run under sanitizers. Then expose an Arrow array to Python through PyO3 without copying.

## Chapter 32 — Cargo Workspaces, Features, Lints, Tests, and Release Engineering
Crate boundaries, feature combinatorics, and a release pipeline you can trust.

### 32.1 Build engineering
- **Workspace and crate boundaries** — workspace boundaries should follow API and dependency ownership, not "a crate per module". Crates are the unit of parallel and incremental compilation. Workspace inheritance (`[workspace.dependencies]`, `[workspace.lints]`) and workspace publishing (Cargo 1.90).
- **Feature flags and their combinatorics** — Cargo features are compile-time product variants and must be additive. Feature unification across the dependency graph (resolver 2) and dev-dependency surprises. Every feature combination costs test space, so cover it with `cargo hack --feature-powerset`. The MSRV-aware resolver 3 is the default under edition 2024.
- **CI baseline and lint policy** — format check, Clippy with warnings as errors (via the `[lints]` table and Cargo's `build.warnings`, stable 1.97), unit and integration tests (`cargo nextest`), an MSRV check against `rust-version`, `cargo-semver-checks` for libraries, dependency auditing (→ Ch.41), and `cargo fix --edition` for edition migrations.
- **Release profiles and build speed** — `opt-level`, thin vs fat LTO, `codegen-units = 1`, `panic = "abort"`, stripping and split debuginfo; PGO/BOLT (→ Ch.38). Reproducible builds, sccache, the LLD default linker on x86_64 Linux (1.90), and crates.io Trusted Publishing (OIDC from CI, 2025).
- *Lab:* split a prototype into core/transport/storage/service crates with CI, feature-gated backends, integration tests and a reproducible release profile.

## Chapter 33 — Observability: Tracing, Metrics, and Failure-Oriented Diagnostics
Diagnose async systems where call stacks don't tell the story.

### 33.1 Telemetry
- **Spans and events in async code** — the `tracing` crate's structured events and spans matter most in async code, where execution hops between tasks and the call stack isn't a simple linear story. `#[instrument]` and `.instrument(span)` vs holding a `Span::enter()` guard across `.await` (a classic bug). Subscribers and layers (`tracing-subscriber`, `EnvFilter`); sampling and overhead.
- **Structured fields and OpenTelemetry export** — structured fields over formatted-sentence logs: request_id, tenant, shard, partition, operation, attempt, queue depth. `tracing-opentelemetry` → OTLP, and W3C trace-context propagation across services and Kafka headers.
- **Metrics that answer overload questions** — counters vs gauges vs histograms answer different overload questions. RED/USE, queue depth, in-flight tasks, saturation, Tokio runtime metrics, and exemplars that link a latency bucket to a trace.
- **Failure taxonomy and error design** — timeout, cancellation, remote error, protocol violation, local resource exhaustion and invariant failure each drive retry policy and alerting differently. Typed errors at library boundaries (`thiserror`) vs contextual errors in binaries (`anyhow`-style); panic vs `Result`.
- *Lab:* instrument the Ch.18 service with spans around the HTTP request, DB call, queue wait and each retry attempt. Build dashboards for queue depth, p99 latency, error class and in-flight tasks.

---

# Milestone 7 — Systems Capstones A–C
Three end-to-end builds that integrate Milestones 1–6, each judged by failure behaviour and measurements rather than features.

## Chapter 34 — Capstone A: Production-Grade Async Service *(capstone project)*
Integrates Ch.9–10, Ch.18 and Ch.33.

### 34.1 Build
- **Service topology and state boundaries** — HTTP edge (Axum) → bounded internal queue → worker pool → storage layer → shutdown coordinator, each owning a narrow state boundary.
- **Failure budget and overload behaviour** — an explicit failure budget for queue-full, database slowdown, client disconnect, SIGTERM and downstream timeout. Benchmark request latency, queue wait, storage latency, CPU, allocation rate and task count, increasing load until one resource saturates.
- *Lab:* implement, containerize, run failure injection, and write a two-page design review.

## Chapter 35 — Capstone B: Durable Key-Value Engine *(capstone project)*
Integrates Ch.15 and Ch.19–23; a four-version build progression.

### 35.1 Build
- **V1 — WAL and memtable replay** *(skipped)* — replay on startup proves durability first.
- **V2 — SSTables with filters and indexes** *(skipped)* — periodic freeze and flush and newest-first reads. Add Bloom filters and sparse indexes only after correctness is stable.
- **V3 — Compaction with atomic manifest switch** *(skipped)* — merge overlapping SSTables. A crash during compaction must resolve to exactly the old or the new state.
- **V4 — MVCC snapshots and version GC** *(skipped)* — versions plus snapshots, which creates a real garbage-collection problem.
- *Lab:* build in milestones with crash-injection tests. Benchmark point and range reads, and profile the time spent in parsing, I/O, compaction and synchronization.

## Chapter 36 — Capstone C: Raft-Backed Replicated State Machine *(capstone project)*
Integrates Ch.25–26 and Ch.42.

### 36.1 Build
- **Deterministic state machine first** *(skipped)* — a pure-function state machine (identical histories → identical state) for testability, then the replicated log.
- **Persist before acknowledging** *(skipped)* — persist term, vote and log *before* acknowledging dependent operations. In-memory only is not the same algorithm.
- **Chaos-tested transport and snapshots** *(skipped)* — network chaos (delay, duplication, reordering, loss, partition) may stall the cluster but must never produce conflicting committed histories. Snapshotting collapses log prefixes and must itself be crash-safe and index-compatible.
- *Lab:* deterministic simulator first, then a real TCP transport, with property-style tests over random failure schedules.

---

# Milestone 8 — Meta-Skill, Compiler, Embedded, GPU, Security, and Testing
The skills that generalize: reasoning about new problems, seeing through the compiler, leaving the OS behind, and proving systems correct.

## Chapter 37 — How to Reason About a New Systems Problem in Rust
A repeatable method for design and optimization decisions.

### 37.1 Method
- **The systems design worksheet** — resources, owners, sharing rules, queues, persistence boundary, failure modes, consistency rule, backpressure point and observability signals. If any of these is implicit, the design is not finished.
- **Choosing the abstraction level** — stay in safe Rust and the runtime's abstractions until the problem genuinely crosses a lower-level boundary; drop to epoll, io_uring or `unsafe` only when the abstraction blocks control you need. Evidence discipline: record hypothesis, workload, metric, change and result for every optimization.
- *Lab:* fill in the worksheet for Capstone D (Ch.43) before writing code. Afterwards, record which implicit decision caused the most rework.

## Chapter 38 — Compiler Pipeline, MIR, LLVM, and Optimization Boundaries
What rustc does with your code, and what unsafe code must not break.

### 38.1 Compiler internals
- **rustc pipeline: HIR, THIR, MIR, LLVM** *(skipped)* — the query-based compiler: parsing → HIR (type checking) → THIR → MIR (borrow checking, MIR optimizations, monomorphization collection) → LLVM IR → machine code. Alternative backends: Cranelift for faster debug builds, `rustc_codegen_gcc`, and the separate gccrs front end.
- **Optimizations and the UB contract** *(skipped)* — the optimizer may reorder or eliminate operations as long as the language-permitted behaviour is preserved. Unsafe code must uphold the validity and aliasing assumptions those optimizations rely on (`noalias`, niches): "it works on my CPU" is not proof that UB is harmless. Bounds-check elimination patterns (iterators, hoisted `assert!`, slicing up front) before `get_unchecked`.
- **Inspecting and steering codegen** *(skipped)* — `rustc --emit=llvm-ir,asm`, `cargo-show-asm`, Compiler Explorer, and `-C llvm-args`. `-C target-cpu`, `#[inline]`/`#[cold]`, LTO, PGO/BOLT. Compile-time engineering: `cargo build --timings`, the parallel front end (nightly). Record the compiler version and target flags with every benchmark.
- *Lab:* inspect optimized IR and assembly for a bounds-check-heavy loop, a slice iterator and a hand-indexed loop, and benchmark all three on the same target.

## Chapter 39 — no_std, Embedded, Kernel, and Hardware-Facing Rust
Rust without an operating system, and Rust inside one.

### 39.1 Bare metal
- **no_std, core, and alloc** *(skipped)* — `#![no_std]` relies on `core`, plus optional `alloc` with a platform allocator. Panic handlers, the `critical-section` crate, and fallible allocation.
- **MMIO, volatile access, peripheral ownership** *(skipped)* — memory-mapped I/O requires `ptr::read_volatile`/`write_volatile` and type-safe peripheral wrappers, not ordinary memory reads. svd2rust-generated PACs, singleton peripherals (ownership of hardware), type-state pins, and the embedded-hal 1.0 traits.
- **Interrupts and async embedded executors** *(skipped)* — an interrupt handler is a separate execution context, so state shared with main code needs atomics or critical sections chosen by the hardware's concurrency model. RTIC (priority-ceiling scheduling) and Embassy (async executors on bare metal); probe-rs and defmt tooling.
- **Safety-critical Rust toolchains** *(skipped)* — Ferrocene is a qualified rustc (ISO 26262 ASIL D, IEC 61508 SIL 3, IEC 62304 Class C) with a certified subset of `core` (IEC 61508 SIL 2 / ISO 26262 ASIL B, 2025–26). The FLS is the specification text these qualifications cite.

### 39.2 Kernel
- **Rust in the Linux kernel** *(skipped)* — the "experiment" label was removed in December 2025, and Rust is now a permanent part of the kernel. The `kernel` crate wraps C APIs in safe abstractions; `pin-init` handles pinned in-place initialization; allocation is fallible; kernel code uses the LKMM rather than C++20 atomics. Production drivers: Android Binder in Rust (merged in 6.18, with the C driver slated for removal). Nova (NVIDIA) and Tyr (Arm Mali) DRM drivers are in progress, and DRM maintainers expect to require Rust for new drivers.
- *Lab:* tiny no_std firmware module (one timer, one GPIO abstraction). Test the register-level logic on the host and isolate target-specific code behind a thin layer. Optionally, build the kernel's `rust_minimal` sample module and load it under QEMU.

## Chapter 40 — GPU and Heterogeneous Systems: Ownership Across the PCIe Boundary
Device memory is another ownership domain with its own completion events.

### 40.1 Heterogeneous ownership
- **Host-device buffer ownership and transfers** *(skipped)* — host and device are separate: the host owns buffers, queues transfers, launches kernels (via FFI or a driver API) and waits on an event or stream. Copies are a first-class cost (CPU→GPU→CPU can dominate compute). Pinned (page-locked) host memory, and unified memory with its page-migration costs.
- **Synchronization as ownership transfer** *(skipped)* — a kernel-completion event means the device has finished using a buffer, which is the heterogeneous analogue of io_uring's in-flight buffer lifetime problem (Ch.14). Streams overlap copy and compute. Encode stream-ordered ownership in Rust types (e.g. `cudarc`'s stream-bound device slices).
- **The Rust GPU ecosystem in 2026** *(skipped)* — host-side: `cudarc` (CUDA driver/runtime bindings) and `wgpu` (portable WebGPU). Kernels written in Rust: Rust-GPU (SPIR-V), Rust-CUDA (rebooted 2025, still early), NVIDIA's experimental cuda-oxide (0.1, 2026), and CubeCL (Burn); nightly `std::offload`/`autodiff` experiments. Production kernels are still mostly CUDA C++ or Triton called through FFI.
- *Lab:* GPU pipeline that processes batches on-device between ingest and writeback. Compare one copy per stage vs one transfer per batch.

## Chapter 41 — Security Engineering: Crypto APIs, Parsers, Secrets, and Supply Chain
Memory safety removes one bug class; this chapter covers the rest.

### 41.1 Threat surfaces
- **Using cryptography without implementing it** *(skipped)* — never implement crypto primitives casually: the risk surface includes nonce handling, serialization, side channels and key lifecycle, not just the math. Use vetted providers (rustls with aws-lc-rs or ring, RustCrypto), misuse-resistant AEAD APIs, and constant-time comparison (`subtle`).
- **Secrets in memory and telemetry** *(skipped)* — `zeroize` and `secrecy` wrappers, redacting `Debug` impls, keeping secrets out of tracing fields (Ch.33), and core dumps and swap.
- **Parsers as security boundaries** — validate lengths before arithmetic can overflow; integer overflow checks are off in release builds by default, so use checked or saturating operations. Set maximum size and nesting policies. Fuzz with **cargo-fuzz** (libFuzzer) or AFL.rs, structure-aware via `arbitrary`, for truncated, oversized, duplicated and inconsistent fields.
- **Supply-chain trust and provenance** — the **RustSec advisory database** with `cargo audit`/`cargo deny`; `cargo vet` audit sharing; `cargo auditable` dependency metadata in binaries. Build scripts and proc macros run arbitrary code at build time. Typosquatted malicious crates (e.g. `faster_log`/`async_println`, removed in Sep 2025) show why every new transitive dependency needs review. crates.io Trusted Publishing.
- *Lab:* fuzz a binary parser with a max nesting/size policy, run a dependency audit, and write a short threat model.

## Chapter 42 — Testing Concurrent and Failure-Prone Rust Systems
Find the interleaving, the crash point and the invariant violation before production does.

### 42.1 Test techniques
- **Exhaustive interleavings with loom** *(skipped)* — **loom** systematically explores scheduler interleavings and C11-style weak-memory outcomes (bounded by a preemption limit), finding orderings a stress test might miss for days. Its limits; shuttle (randomized schedules) for larger code.
- **Property-based and model-based testing** — `proptest!` for storage-page invariants (slots in bounds, no bad offset overlap, serialization round-trips), with shrinking. Stateful model-based tests compare the system against a simple reference model.
- **Deterministic simulation testing** *(skipped)* — FoundationDB-style: a single-threaded deterministic executor with simulated network, disk and clock, and seed-based replay. Rust tools: turmoil (Tokio) and madsim. Whole-system simulation (Antithesis) and TigerBeetle's VOPR as references.
- **Fuzz findings to permanent regressions** *(skipped)* — turn fuzz discoveries and crash-injection points into permanent, reproducible regression tests (minimized corpora, seeds as tests). Mutation testing (cargo-mutants) measures test strength. Bounded model checking with Kani for unsafe code, and the Rust standard-library verification challenge.
- *Lab:* add property tests, fuzzed record bytes and crash points to the WAL/page engine, plus one deterministic concurrency model for the in-memory index.

## Chapter 43 — Capstone D: Zero-Copy ETL and Streaming Data Plane *(capstone project)*
Integrates the whole domain into the data-platform hot path.

### 43.1 Build
- **Bounded stages and buffer ownership** — bounded dataflow stages: source → decoder → batch builder → transform → sink. Each batch owns its backing buffers, transforms borrow or move columns, and downstream gets ownership only when it can keep up, which prevents unbounded producer allocation against a slow sink.
- **Checkpoints, offsets, and watermarks** — durable checkpoints store source offsets and watermarks alongside output commit metadata, so restart is exactly-once at the sink (→ *Data Engineering* Ch.9).
- **Throughput accounting beyond records per second** — MB/s, records/s, CPU cycles/record, allocation bytes/record, queue depth, batch size, sink latency and memory high-water mark. Records/s alone can hide a pathological allocation regime.
- *Lab:* ingest a large event stream, zero-copy parse it, build Arrow-compatible column batches, transform them and write to a durable sink. Slow the sink 10x and prove memory stays bounded.

## Systems in Production — Milestone 8: Rust in the data plane
Why these systems chose Rust (or its thread-per-core cousin), and which chapters each one proves.
- **Polars (2020–, Ritchie Vink; Polars Inc.) — a DataFrame engine without a GIL.** Forcing problem: single-threaded, copy-heavy pandas. Mechanism: Arrow-style columnar memory, a lazy optimized query plan (predicate and projection pushdown), and work-stealing parallelism. Polars 2.0 (Oct 2026) runs lazy queries on its streaming engine with out-of-core processing, and Polars Cloud (GA on AWS, Sep 2025) adds a distributed engine. Trade-off: a Rust core reached through PyO3. Proves Ch.24 (columnar/vectorized), Ch.1 (ownership, zero-copy buffers), Ch.9 (CPU-pool parallelism) and Ch.31 (Python embedding).
- **Apache DataFusion / Ballista / Comet (DataFusion begun by Andy Grove, 2017; Lamb et al., SIGMOD 2024) — the embeddable engine.** An Arrow-native SQL query engine (planner + vectorized execution) built as an extensible library, the Rust answer to "embed a fast engine". Ballista distributes it; Comet (1.0, Aug 2026) accelerates unmodified Spark by translating its physical plans to DataFusion through JNI. Proves → *Data Engineering* Ch.2 (§2.3 optimizers) and Ch.6 (§6.4 lakehouse engines), plus Ch.24, Ch.31 (JNI) and Ch.9 (separate CPU runtime).
- **Materialize / RisingWave — incremental views over changing inputs.** Streaming databases that maintain SQL views incrementally, the → *Data Engineering* Ch.9 (§9.3) "SQL-native streaming" idea implemented where deterministic low-latency state matters. Materialize is built on Timely/Differential Dataflow (McSherry et al.) and offers strict serializability (self-managed and Community editions since 2025). RisingWave keeps state on object storage, with CDC and Iceberg integration. Proves Ch.22–23 (state stores, MVCC) and Ch.25–27 (replicated, log-driven state).
- **delta-rs / Vector — connectors and agents without GC pauses.** delta-rs is a native Rust Delta Lake implementation, shipped to Python as `deltalake` (1.0 in May 2025). Vector is a Rust observability pipeline (Datadog since 2021; it powers Datadog Observability Pipelines) with bounded memory/disk buffers and explicit `when_full` policies. Predictable memory and no GC pauses are the entire point. Proves Ch.1/Ch.30 (ownership, allocation control), Ch.10 (bounded buffers) and Ch.31 (PyO3).
- **Arroyo (2023–; Cloudflare since 2025) — stream processing built from DataFusion parts.** A Rust distributed stream processor with SQL on Arrow/DataFusion that now powers Cloudflare Pipelines. It shows the composable-engine thesis (→ *Data Engineering* Ch.6, §6.4) applied to streaming. Proves Ch.10, Ch.27 and Ch.43.
- **Redpanda (2019–) — a Kafka-compatible log, thread-per-core in C++/Seastar (not Rust).** Included because it is the clearest production proof of the Ch.13–15 thesis: shard state per core, pin the thread, manage I/O and caching yourself with direct I/O instead of relying on the page cache, and run Raft per partition (Ch.26), and the log gets dramatically faster. The Rust engines above apply the same discipline with memory safety added.

## Assessment
- Why does an owning pipeline naturally produce backpressure while a clone-heavy pipeline does not? Point to the exact line where the producer blocks.
- A future that holds a `std::sync::MutexGuard` across `.await` compiles in one context and not another. Explain both outcomes, and what goes wrong if you "fix" it with `unsafe impl Send`.
- Why can't io_uring use `AsyncRead`'s `&mut [u8]` buffers soundly, and what does dropping a future with an in-flight read do to the kernel's view of that buffer?
- Which `select!` branches in your service are not cancel-safe, and what data is lost when they lose the race?
- When does a correct Raft implementation return a stale read, and what does ReadIndex cost compared with a lease read?
- What is the actual cost difference between a B-tree and an LSM-tree under a write-heavy, skewed workload: measured write, read and space amplification, not assumed?
- `fsync` returned `EIO` once and succeeded on retry. Is the data durable? What should the engine do?
- Show an `Acquire`/`Release` bug that passes every test on x86 and fails on ARM, and the loom test that finds it.
- Your unsafe arena passes Miri under Stacked Borrows but fails under Tree Borrows (or vice versa). What does each model say about the access, and which do you trust?
- Where in a Tower stack must the retry layer sit relative to timeout and tracing, and what breaks for a non-idempotent POST if it doesn't?
- Why does a pipeline that moves owned buffers through bounded stages keep memory bounded under a slow sink, while one that clones buffers into unbounded queues does not? (Ch.10, Ch.43)
- What is the difference between epoll-based and io_uring-based I/O, and when does the difference matter? (Ch.13, Ch.14)
- Why can a correct Raft implementation still return stale reads from a follower (or from a deposed leader), and what do ReadIndex and lease reads do about it? (Ch.26, Ch.36)
- What is the actual cost difference between a B-tree and an LSM tree under write-heavy load — measured, not assumed? (Ch.21, Ch.22, Ch.35)
