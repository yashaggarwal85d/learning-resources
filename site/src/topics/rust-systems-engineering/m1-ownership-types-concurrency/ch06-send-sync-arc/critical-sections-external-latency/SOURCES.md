# Sources — Critical sections and external latency

## tokio::sync::Mutex
URL: https://docs.rs/tokio/latest/tokio/sync/struct.Mutex.html
Version: tokio 1.54.1

> Contrary to popular belief, it is ok and often preferred to use the ordinary
Mutex from the standard library in asynchronous code.

> The feature that the async mutex offers over the blocking mutex is the
ability to keep it locked across an .await point. This makes the async
mutex more expensive than the blocking mutex, so the blocking mutex should
be preferred in the cases where it can be used. The primary use case for the
async mutex is to provide shared mutable access to IO resources such as a
database connection. If the value behind the mutex is just data, it's
usually appropriate to use a blocking mutex such as the one in the standard
library or parking_lot.

> Additionally, when you do want shared access to an IO resource, it is
often better to spawn a task to manage the IO resource, and to use message
passing to communicate with that task.

Contents:
- the docs' own named reason an async-capable lock exists at all: "shared mutable access to IO resources such as a database connection"
- the docs' own recommended alternative to reaching for a lock around an IO resource: "spawn a task to manage the IO resource, and ... message passing" instead of serializing every caller through the lock
- a plain-data value should use a blocking mutex, not one built around IO access patterns

## The Rust Programming Language — Shared-State Concurrency
URL: https://doc.rust-lang.org/book/ch16-03-shared-state.html
Version: fetched 2026-10-23

> Another detail to note is that Rust can't protect you from all kinds of logic errors when you use Mutex<T>.

> Similarly, Mutex<T> comes with the risk of creating deadlocks. These occur when an operation needs to lock two resources and two threads have each acquired one of the locks, causing them to wait for each other forever.

Contents:
- the book's own, explicit statement: the compiler's safety guarantees do not extend to deadlocks — `Mutex<T>` can still deadlock a correct-looking program
- the book's own definition of a two-lock deadlock: two threads, each already holding one of two needed locks, waiting on each other forever

## Linux kernel — Runtime locking correctness validator (lockdep-design)
URL: https://docs.kernel.org/locking/lockdep-design.html
Version: fetched 2026-10-23

> Furthermore, two locks can not be taken in inverse order:

> because this could lead to a deadlock - referred to as lock inversion
deadlock - as attempts to acquire the two locks form a circle which
could lead to the two contexts waiting for each other permanently.

> The validator will find such dependency circle in arbitrary complexity,
i.e., there can be any other locking sequence between the acquire-lock
operations; the validator will still find whether these locks can be
acquired in a circular fashion.

Contents:
- the kernel's own name for this exact failure: "lock inversion deadlock" — two locks acquired in opposite order by two different paths form a circular wait
- the primary-source justification for lock ordering as the fix: a *consistent* order across every path never forms the circle the validator is built to detect

## Lock convoy (Wikipedia)
URL: https://en.wikipedia.org/wiki/Lock_convoy
Version: fetched 2026-10-23

> In computer science, a lock convoy is a performance problem that can occur when using locks for concurrency control in a multithreaded application.

> A lock convoy occurs when multiple threads of equal priority contend repeatedly for the same lock.

> Unlike deadlock and livelock situations, the threads in a lock convoy do progress; however, each time a thread attempts to acquire the lock and fails, it relinquishes the remainder of its scheduling quantum and forces a context switch. The overhead of repeated context switches and underutilization of scheduling quanta degrade overall performance.

Contents:
- the named definition: a lock convoy is threads of *equal priority* repeatedly contending for the same lock
- the structural difference from deadlock: a lock convoy's threads still make progress — the cost is repeated, wasted context switches, not a permanent stall

## Linux kernel — RT-mutex subsystem with PI support
URL: https://docs.kernel.org/locking/rt-mutex.html
Version: fetched 2026-10-23

> A low priority owner of a rt-mutex inherits the priority of a higher
priority waiter until the rt-mutex is released. If the temporarily
boosted owner blocks on a rt-mutex itself it propagates the priority
boosting to the owner of the other rt_mutex it gets blocked on. The
priority boosting is immediately removed once the rt_mutex has been
unlocked.

> This approach allows us to shorten the block of high-prio tasks on
mutexes which protect shared resources. Priority inheritance is not a
magic bullet for poorly designed applications, but it allows
well-designed applications to use userspace locks in critical parts of
an high priority thread, without losing determinism.

Contents:
- the named failure mode this whole mechanism exists to counter (priority inversion: a low-priority lock holder blocking a higher-priority waiter) and the kernel's actual fix — temporarily boosting the holder's priority until it releases
- the kernel docs' own caveat, quoted directly: priority inheritance "is not a magic bullet for poorly designed applications"
