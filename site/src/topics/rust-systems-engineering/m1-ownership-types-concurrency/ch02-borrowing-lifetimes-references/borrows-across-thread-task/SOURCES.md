# Sources: Borrows across thread and task boundaries

## spawn - std::thread
URL: https://doc.rust-lang.org/std/thread/fn.spawn.html
Version: online edition, std 1.99.1 (58cf8f9c3 2026-10-13)

The signature:

> pub fn spawn<F, T>(f: F) -> JoinHandle<T>where
> F: FnOnce() -> T + Send + 'static,
> T: Send + 'static,

Why the bound exists:

> The 'static constraint means that the closure and its return value
> must have a lifetime of the whole program execution. The reason for this
> is that threads can outlive the lifetime they have been created in.

> Indeed if the thread, and by extension its return value, can outlive their
> caller, we need to make sure that they will be valid afterwards, and since
> we can't know when it will return we need to have them valid as long as
> possible, that is until the end of the program, hence the 'static
> lifetime.

The `Send` bound, named for completeness:

> The Send constraint is because the closure will need to be passed
> by value from the thread where it is spawned to the new thread.

Contents (item by item):
- `thread::spawn`'s exact signature and its two bounds (`Send + 'static` on both the closure and its return value)
- the reasoning: a spawned thread can outlive the caller, and since the caller can't know when it will finish, the closure and its return value must stay valid for as long as possible, i.e. for the rest of the program
- the `Send` bound exists because the closure crosses from the spawning thread to the new one
- a spawned thread detaches implicitly if its `JoinHandle` is dropped; it is the program's responsibility to join or detach every thread it creates

## scope - std::thread
URL: https://doc.rust-lang.org/std/thread/fn.scope.html
Version: online edition, std 1.99.1 (58cf8f9c3 2026-10-13), stable since 1.63.0

> Unlike non-scoped threads, scoped threads can borrow non-'static data,
> as the scope guarantees all threads will be joined at the end of the scope.

> All threads spawned within the scope that haven't been manually joined
> will be automatically joined before this function returns.

The two lifetimes:

> The 'scope lifetime represents the lifetime of the scope itself.
> That is: the time during which new scoped threads may be spawned,
> and also the time during which they might still be running.

> The 'env lifetime represents the lifetime of whatever is borrowed by the scoped threads.
> This lifetime must outlast the call to scope, and thus cannot be smaller than 'scope.

Contents (item by item):
- scoped threads can borrow non-`'static` data because the scope guarantees every thread is joined before `scope` returns
- every thread spawned in the scope that wasn't manually joined is automatically joined before the `scope` call returns
- the `'scope` lifetime (how long new threads may be spawned, and may still be running) and the `'env` lifetime (how long whatever the threads borrow must live, which must outlast `scope` itself and so cannot be shorter than `'scope`)
- joining only waits for a spawned thread's main function; destructors of that thread's own thread-local variables may still be running after `scope` returns

## spawn - tokio::task
URL: https://docs.rs/tokio/latest/tokio/task/fn.spawn.html
Version: docs.rs, tokio 1.54.1, 21 October 2026

The signature:

> pub fn spawn<F>(future: F) -> JoinHandle<F::Output> ⓘwhere
> F: Future + Send + 'static,
> F::Output: Send + 'static,

What happens to a spawned task that hasn't finished:

> There is no guarantee that a spawned task will execute to completion.
> When a runtime is shutdown, all outstanding tasks are dropped,
> regardless of the lifecycle of that task.

Contents (item by item):
- `tokio::task::spawn`'s signature requires the identical shape of bound as `thread::spawn`: `Future + Send + 'static` on the future, `Send + 'static` on its output
- a spawned task is not guaranteed to run to completion; on runtime shutdown every outstanding task is dropped outright, regardless of where it was in its own lifecycle
- the provided future starts running in the background as soon as `spawn` is called, whether or not the returned `JoinHandle` is ever awaited

## forget - std::mem
URL: https://doc.rust-lang.org/std/mem/fn.forget.html
Version: online edition, std 1.99.1 (58cf8f9c3 2026-10-13)

> Takes ownership and "forgets" about the value without running its destructor.

The safety claim:

> forget is not marked as unsafe, because Rust's safety guarantees
> do not include a guarantee that destructors will always run.

> mem::forget from safe code does not fundamentally change Rust's safety
> guarantees.

The cost, named anyway:

> That said, leaking resources such as memory or I/O objects is usually undesirable.

Contents (item by item):
- `mem::forget` takes ownership of a value and skips its destructor entirely, without any `unsafe`
- Rust's safety guarantees never promised that a destructor runs; calling `forget` from ordinary safe code does not weaken that guarantee, because it was never there to begin with
- leaking a resource this way is "usually undesirable" but is explicitly not a soundness violation
- the canonical safe use is deliberately skipping a `Drop` implementation (e.g. to hand a file descriptor to code that will manage it itself)
