# Sources — Send and Sync as auto-traits

## std::marker — Send
URL: https://doc.rust-lang.org/std/marker/trait.Send.html
Version: std 1.99.1 (58cf8f9c3 2026-10-13)

> pub unsafe auto trait Send { }

> Types that can be transferred across thread boundaries.

> This trait is automatically implemented when the compiler determines it's
appropriate.

> An example of a non-Send type is the reference-counting pointer
rc::Rc. If two threads attempt to clone Rcs that point to the same
reference-counted value, they might try to update the reference count at the
same time, which is undefined behavior because Rc doesn't use atomic
operations. Its cousin sync::Arc does use atomic operations (incurring
some overhead) and thus is Send.

> impl<T, A> !Send for Rc<T, A>where
 A: Allocator,
 T: ?Sized,

> impl<T, A> Send for Arc<T, A>where
 T: Sync + Send + ?Sized,
 A: Allocator + Send,

Contents:
- `Send` is `pub unsafe auto trait Send {}` — an auto-trait, derived automatically rather than hand-implemented in the ordinary case
- the trait means a value may be transferred across a thread boundary
- `Rc` is the standard library's own example of a non-`Send` type, exactly because its refcount updates are not atomic
- `Arc<T, A>` is `Send` only when `T: Sync + Send` — confirms the real trait bound, not an approximation

## std::marker — Sync
URL: https://doc.rust-lang.org/std/marker/trait.Sync.html
Version: std 1.99.1 (58cf8f9c3 2026-10-13)

> pub unsafe auto trait Sync { }

> Types for which it is safe to share references between threads.

> The precise definition is: a type T is Sync if and only if &T is
Send. In other words, if there is no possibility of
undefined behavior (including data races) when passing
&T references between threads.

> Types that are not Sync are those that have "interior
mutability" in a non-thread-safe form, such as Cell
and RefCell. These types allow for mutation of
their contents even through an immutable, shared reference. For
example the set method on Cell<T> takes &self, so it requires
only a shared reference &Cell<T>. The method performs no
synchronization, thus Cell cannot be Sync.

> Another example of a non-Sync type is the reference-counting
pointer Rc. Given any reference &Rc<T>, you can clone
a new Rc<T>, modifying the reference counts in a non-atomic way.

> For cases when one does need thread-safe interior mutability,
Rust provides atomic data types, as well as explicit locking via
sync::Mutex and sync::RwLock. These types
ensure that any mutation cannot cause data races, hence the types
are Sync.

Contents:
- `Sync` means `&T` is itself `Send` — the precise, formal definition, not an informal gloss
- `Cell`/`RefCell` are the standard library's own named examples of `Send`-but-not-`Sync` types, because their interior mutability performs no synchronization
- `Rc` fails `Sync` for the same non-atomic refcount reason it fails `Send`
- `Mutex`/`RwLock` are the std types that make interior mutability `Sync` by adding real synchronization

## The Rustonomicon — Send and Sync
URL: https://doc.rust-lang.org/nomicon/send-and-sync.html
Version: fetched 2026-10-23

> A type is Send if it is safe to send it to another thread.

> A type is Sync if it is safe to share between threads (T is Sync if and only if &T is Send).

> Send and Sync are also automatically derived traits. This means that, unlike
every other trait, if a type is composed entirely of Send or Sync types, then it
is Send or Sync.

> Major exceptions include:

> raw pointers are neither Send nor Sync (because they have no safety guards).

> UnsafeCell isn't Sync (and therefore Cell and RefCell aren't).

> Rc isn't Send or Sync (because the refcount is shared and unsynchronized).

> Types that aren't automatically derived can simply implement them if desired:

> unsafe impl Send for MyBox {}
unsafe impl Sync for MyBox {}

> A nice example where this does not happen is with a MutexGuard: notice how
it is not Send. The implementation of MutexGuard
uses libraries that require you to ensure you
don't try to free a lock that you acquired in a different thread. If you were
able to Send a MutexGuard to another thread the destructor would run in the
thread you sent it to, violating the requirement. MutexGuard can still be Sync
because all you can send to another thread is an &MutexGuard and dropping a
reference does nothing.

Contents:
- the two one-line definitions of `Send` and `Sync`, in the Rustonomicon's own words
- `Send`/`Sync` are composed structurally — "composed entirely of Send or Sync types" is the auto-trait rule itself
- raw pointers are neither `Send` nor `Sync`, which is the mechanism `PhantomData<*const T>` exploits to opt a generic type out
- `unsafe impl Send for MyBox {}` is the exact syntax of a hand-written, unchecked claim
- `MutexGuard` is named as `!Send` (tied to the OS thread that acquired the lock) while remaining `Sync`

## The Rustonomicon — PhantomData
URL: https://doc.rust-lang.org/nomicon/phantom-data.html
Version: fetched 2026-10-23

> Here's a table of all the wonderful ways PhantomData could be used:

> PhantomData<T>

> covariant

> inherited

> disallowed ("owns T")

> PhantomData<*const T>

> !Send + !Sync

> PhantomData<*mut T>

> invariant

Contents:
- the reference table of `PhantomData<X>` patterns and the `Send`/`Sync` each one produces
- `PhantomData<T>` simply inherits `T`'s own `Send`/`Sync` (the ordinary, non-opting-out case)
- `PhantomData<*const T>` and `PhantomData<*mut T>` are unconditionally `!Send + !Sync`, regardless of `T` — the real mechanism behind "opting a generic type out of an auto-trait it would otherwise get"

## std::thread::spawn
URL: https://doc.rust-lang.org/std/thread/fn.spawn.html
Version: std 1.99.1 (58cf8f9c3 2026-10-13)

> pub fn spawn<F, T>(f: F) -> JoinHandle<T>where
 F: FnOnce() -> T + Send + 'static,
 T: Send + 'static,

> The Send constraint is because the closure will need to be passed
by value from the thread where it is spawned to the new thread. Its
return value will need to be passed from the new thread to the thread
where it is joined.
As a reminder, the Send marker trait expresses that it is safe to be
passed from thread to thread. Sync expresses that it is safe to have a
reference be passed from thread to thread.

Contents:
- `std::thread::spawn`'s real signature requires `F: FnOnce() -> T + Send + 'static` and `T: Send + 'static` — the primary-source proof behind every real `error[E0277]` this topic triggers by moving a non-`Send` value into a spawned closure
- the docs' own one-line restatement of `Send` ("safe to be passed from thread to thread") and `Sync` ("safe to have a reference be passed from thread to thread")

## tokio::task::spawn
URL: https://docs.rs/tokio/latest/tokio/task/fn.spawn.html
Version: tokio 1.54.1

> pub fn spawn<F>(future: F) -> JoinHandle<F::Output> ⓘwhere
 F: Future + Send + 'static,
 F::Output: Send + 'static,

> The task supplied to spawn must implement Send. However, it is
possible to use !Send values from the task as long as they only
exist between calls to .await.

> tokio::spawn(async {
 // Force the `Rc` to stay in a scope with no `.await`
 {
 let rc = Rc::new(());
 use_rc(rc.clone());
 }

 task::yield_now().await;
}).await.unwrap();

> Holding on to a !Send value across calls to .await will result in
an unfriendly compile error message similar to:

> `[... some type ...]` cannot be sent between threads safely

Contents:
- `tokio::spawn`'s real signature requires `F: Future + Send + 'static` — the primary-source proof that a spawned future itself must be `Send`
- a `!Send` value (the doc's own example uses `Rc`) is fine inside a spawned future only while it never exists across an `.await` point
- holding a `!Send` value across `.await` is the real, named failure mode, with the actual compiler error text quoted
