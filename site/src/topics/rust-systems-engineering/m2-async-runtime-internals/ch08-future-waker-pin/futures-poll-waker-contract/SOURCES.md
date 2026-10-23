# Sources — Futures, Poll, and the Waker contract

## Future (std::future)
URL: https://doc.rust-lang.org/std/future/trait.Future.html
Version: Rust std 1.99.1

> A future is a value that might not have finished computing yet. This kind of
"asynchronous value" makes it possible for a thread to continue doing useful
work while it waits for the value to become available.

> This method does not block if the value is not ready. Instead,
the current task is scheduled to be woken up when it's possible to make
further progress by polling again.

> Futures alone are inert; they must be actively polled for the
underlying computation to make progress, meaning that each time the
current task is woken up, it should actively re-poll pending futures
that it still has an interest in.

Contents:
- the trait's own framing of a future as a value, not an action: something that "might not have finished computing yet", obtained from `async`
- `poll`'s own statement of the non-blocking contract: it never blocks, and a pending result means the task was scheduled to be woken, not that the caller should retry in a loop
- the trait's own statement that futures are inert: nothing progresses unless something actively polls, which is exactly why a future that forgets to arrange a wakeup can simply stop forever

## Poll (std::task)
URL: https://doc.rust-lang.org/std/task/enum.Poll.html
Version: Rust std 1.99.1

> Indicates whether a value is available or if the current task has been
scheduled to receive a wakeup instead.

> When a function returns Pending, the function must also
ensure that the current task is scheduled to be awoken when
progress can be made.

Contents:
- `Poll`'s own two-variant definition and what each one means: `Ready` is an immediately available value, `Pending` is deferred work with a wakeup promised instead
- the `Pending` variant's own obligation, stated directly on the variant itself: returning it requires arranging the wakeup, not merely hoping for one

## Wake (std::task)
URL: https://doc.rust-lang.org/std/task/trait.Wake.html
Version: Rust std 1.99.1

> This trait can be used to create a Waker. An executor can define an
implementation of this trait, and use that to construct a Waker to pass
to the tasks that are executed on that executor.

> It supports the common executor design in which the data used
to wake up a task is stored in an Arc.

Contents:
- the trait's own stated purpose: it exists so an executor can build a real `Waker` without touching the unsafe `RawWaker` vtable directly
- the trait's own documented common design: an executor's wake-up data lives behind an `Arc`, which is exactly the shape this topic's hand-rolled executor uses
- the source's own worked `block_on` example, confirming the real architecture directly: pin the future, build a `Waker` from an `Arc`-wrapped type implementing `Wake`, loop on `poll` until `Ready`, parking the thread on `Pending` — no hidden thread anywhere in the loop
