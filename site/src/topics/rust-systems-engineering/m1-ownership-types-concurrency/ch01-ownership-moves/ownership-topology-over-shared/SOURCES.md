# Sources: Ownership topology over shared mutability

## Transfer Data Between Threads with Message Passing - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch16-02-message-passing.html
Version: The Rust Programming Language, online edition (chapter 16.2); the page shows no edition number or date

Message passing and the slogan:

> One increasingly popular approach to ensuring safe concurrency is message
> passing, where threads or actors communicate by sending each other messages
> containing data. Here’s the idea in a slogan from the Go language documentation:
> “Do not communicate by sharing memory; instead, share memory by communicating.”

Channels, transmitter and receiver, closing:

> To accomplish message-sending concurrency, Rust’s standard library provides an
> implementation of channels. A channel is a general programming concept by
> which data is sent from one thread to another.

> A channel has two halves: a transmitter and a receiver. The transmitter half is
> the upstream location where you put the rubber duck into the river, and the
> receiver half is where the rubber duck ends up downstream. One part of your
> code calls methods on the transmitter with the data you want to send, and
> another part checks the receiving end for arriving messages. A channel is said
> to be closed if either the transmitter or receiver half is dropped.

> Once you’re familiar with the technique, you could
> use channels for any threads that need to communicate with each other, such as
> a chat system or a system where many threads perform parts of a calculation and
> send the parts to one thread that aggregates the results.

mpsc:

> We create a new channel using the mpsc::channel function; mpsc stands for
> multiple producer, single consumer. In short, the way Rust’s standard library
> implements channels means a channel can have multiple sending ends that
> produce values but only one receiving end that consumes those values. Imagine
> multiple streams flowing together into one big river: Everything sent down any
> of the streams will end up in one river at the end.

> The mpsc::channel function returns a tuple, the first element of which is the
> sending end—the transmitter—and the second element of which is the receiving
> end—the receiver.

Move closures and the spawned thread owning the transmitter:

> Let’s move the transmitting end into a spawned thread and have it send one
> string so that the spawned thread is communicating with the main thread, as
> shown in Listing 16-7.

> Again, we’re using thread::spawn to create a new thread and then using move
> to move tx into the closure so that the spawned thread owns tx. The spawned
> thread needs to own the transmitter to be able to send messages through the
> channel.

send:

> The transmitter has a send method that takes the value we want to send. The
> send method returns a Result<T, E> type, so if the receiver has already
> been dropped and there’s nowhere to send a value, the send operation will
> return an error.

recv and try_recv:

> The receiver has two useful methods: recv and try_recv. We’re using recv,
> short for receive, which will block the main thread’s execution and wait
> until a value is sent down the channel. Once a value is sent, recv will
> return it in a Result<T, E>. When the transmitter closes, recv will return
> an error to signal that no more values will be coming.

> The try_recv method doesn’t block, but will instead return a Result<T, E>
> immediately: an Ok value holding a message if one is available and an Err
> value if there aren’t any messages this time.

Ownership transfer through channels:

> The ownership rules play a vital role in message sending because they help you
> write safe, concurrent code. Preventing errors in concurrent programming is the
> advantage of thinking about ownership throughout your Rust programs.

> Here, we try to print val after we’ve sent it down the channel via tx.send.
> Allowing this would be a bad idea: Once the value has been sent to another
> thread, that thread could modify or drop it before we try to use the value
> again. Potentially, the other thread’s modifications could cause errors or
> unexpected results due to inconsistent or nonexistent data. However, Rust gives
> us an error if we try to compile the code in Listing 16-9:

> error[E0382]: borrow of moved value: `val`

> Our concurrency mistake has caused a compile-time error. The send function
> takes ownership of its parameter, and when the value is moved the receiver
> takes ownership of it. This stops us from accidentally using the value again
> after sending it; the ownership system checks that everything is okay.

Iterating over a receiver:

> In the main thread, we’re not calling the recv function explicitly anymore:
> Instead, we’re treating rx as an iterator. For each value received, we’re
> printing it. When the channel is closed, iteration will end.

> Because we don’t have any code that pauses or delays in the for loop in the
> main thread, we can tell that the main thread is waiting to receive values from
> the spawned thread.

Multiple producers:

> Let’s put mpsc to use and expand the code in Listing 16-10 to
> create multiple threads that all send values to the same receiver. We can do so
> by cloning the transmitter, as shown in Listing 16-11.

> This time, before we create the first spawned thread, we call clone on the
> transmitter. This will give us a new transmitter we can pass to the first
> spawned thread. We pass the original transmitter to a second spawned thread.
> This gives us two threads, each sending different messages to the one receiver.

> You might see the values in another order, depending on your system. This is
> what makes concurrency interesting as well as difficult.

Contents:
- Introduction: message passing as an approach to safe concurrency; the Go slogan "Do not communicate by sharing memory; instead, share memory by communicating."
- Channels: a channel sends data from one thread to another; the river and rubber duck analogy; two halves (transmitter and receiver); a channel is closed if either half is dropped; example uses (chat system, many threads sending parts of a calculation to one aggregating thread)
- Listing 16-6: creating a channel with `mpsc::channel` and destructuring into `tx` and `rx` (does not compile yet because the value type cannot be inferred); mpsc means multiple producer, single consumer; the function returns a tuple (transmitter, receiver)
- Listing 16-7: moving `tx` into a spawned thread with a `move` closure and sending `"hi"` with `send`; `send` returns a `Result` and errors if the receiver was dropped
- Listing 16-8: receiving the value in the main thread with `recv`, which blocks; `try_recv`, which does not block and returns `Ok` or `Err` immediately; output `Got: hi`
- Transferring Ownership Through Channels: why ownership rules matter for message sending; Listing 16-9, using `val` after sending, fails with error E0382 (borrow of moved value); `send` takes ownership of its parameter and the receiver takes ownership of the moved value
- Sending Multiple Values: Listing 16-10, a spawned thread sends four strings with a one-second pause between each; the main thread treats `rx` as an iterator in a `for` loop, which ends when the channel is closed
- Creating Multiple Producers: Listing 16-11, cloning the transmitter (`tx.clone()`) so two spawned threads send to the same receiver; output order is nondeterministic
- Closing note: a pointer ahead to a different method of concurrency (shared state, next page)

## Shared-State Concurrency - The Rust Programming Language (ch16-03)
URL: https://doc.rust-lang.org/book/ch16-03-shared-state.html
Version: online edition of The Rust Programming Language, chapter 16.3 (no edition number shown on the page), fetched 2026-10-12

> In a way, channels in any programming language are similar to single ownership because once you transfer a value down a channel, you should no longer use that value. Shared-memory concurrency is like multiple ownership: Multiple threads can access the same memory location at the same time.

> multiple ownership can add complexity because these different owners need managing.

> Mutex is an abbreviation for mutual exclusion, as in a mutex allows only one thread to access some data at any given time.

> The lock is a data structure that is part of the mutex that keeps track of who currently has exclusive access to the data. Therefore, the mutex is described as guarding the data it holds via the locking system.

> Management of mutexes can be incredibly tricky to get right, which is why so many people are enthusiastic about channels. However, thanks to Rust’s type system and ownership rules, you can’t get locking and unlocking wrong.

> The call to lock returns a type called MutexGuard, wrapped in a LockResult that we handled with the call to unwrap. The MutexGuard type implements Deref to point at our inner data; the type also has a Drop implementation that releases the lock automatically when a MutexGuard goes out of scope, which happens at the end of the inner scope.

> The call to lock would fail if another thread holding the lock panicked. In that case, no one would ever be able to get the lock, so we’ve chosen to unwrap and have this thread panic if we’re in that situation.

> The error message states that the counter value was moved in the previous iteration of the loop. Rust is telling us that we can’t move the ownership of lock counter into multiple threads.

> We’ll wrap the Mutex<T> in Rc<T> in Listing 16-14 and clone the Rc<T> before moving ownership to the thread.

> Unfortunately, Rc<T> is not safe to share across threads. When Rc<T> manages the reference count, it adds to the count for each call to clone and subtracts from the count when each clone is dropped. But it doesn’t use any concurrency primitives to make sure that changes to the count can’t be interrupted by another thread. This could lead to wrong counts—subtle bugs that could in turn lead to memory leaks or a value being dropped before we’re done with it.

> Fortunately, Arc<T> is a type like Rc<T> that is safe to use in concurrent situations. The a stands for atomic, meaning it’s an atomically reference-counted type.

> The reason is that thread safety comes with a performance penalty that you only want to pay when you really need to.

> Arc<T> and Rc<T> have the same API, so we fix our program by changing the use line, the call to new, and the call to clone.

> Using this strategy, you can divide a calculation into independent parts, split those parts across threads, and then use a Mutex<T> to have each thread update the final result with its part.

> Note that if you are doing simple numerical operations, there are types simpler than Mutex<T> types provided by the std::sync::atomic module of the standard library.

> this means Mutex<T> provides interior mutability, as the Cell family does. In the same way we used RefCell<T> in Chapter 15 to allow us to mutate contents inside an Rc<T>, we use Mutex<T> to mutate contents inside an Arc<T>.

> Another detail to note is that Rust can’t protect you from all kinds of logic errors when you use Mutex<T>. Recall from Chapter 15 that using Rc<T> came with the risk of creating reference cycles, where two Rc<T> values refer to each other, causing memory leaks. Similarly, Mutex<T> comes with the risk of creating deadlocks. These occur when an operation needs to lock two resources and two threads have each acquired one of the locks, causing them to wait for each other forever.

Contents:
- Opening: contrasts message passing (single ownership; a sent value is no longer used) with shared memory (multiple ownership, which needs managing); Rust's type system and ownership rules help.
- Controlling Access with Mutexes: Mutex means mutual exclusion; the lock is part of the mutex and guards the data; two rules (acquire before use, unlock after); the one-microphone panel metaphor; channels are popular because mutexes are tricky, yet Rust's types prevent getting locking and unlocking wrong.
- The API of Mutex<T> (Listing 16-12): Mutex::new, lock blocks the thread, can fail if another holder panicked (hence unwrap), the guard acts as a mutable reference, Mutex<i32> is not i32 so lock cannot be forgotten, MutexGuard has Deref and a Drop that releases the lock at scope end.
- Shared Access to Mutex<T> (Listing 16-13): ten threads increment a counter; the `move` closure moves `counter` into the first thread, giving E0382 "borrow of moved value" because ownership cannot move into multiple threads.
- Multiple Ownership with Multiple Threads (Listing 16-14): wrapping in Rc<T> fails with E0277, `Send` is not implemented for Rc<Mutex<i32>>; Rc's non-concurrent count updates could give wrong counts, leaks or early drops.
- Atomic Reference Counting with Arc<T> (Listing 16-15): Arc is the atomic Rc with the same API; atomics are a further concurrency primitive (std::sync::atomic); thread safety costs performance, so it is not the default; the fixed program prints `Result: 10`; the pattern splits work across threads that update a shared result; simple numeric cases can use std::sync::atomic types instead of Mutex.
- Comparing RefCell<T>/Rc<T> and Mutex<T>/Arc<T>: Mutex gives interior mutability like the Cell family (Mutex in Arc parallels RefCell in Rc); Mutex risks deadlocks as Rc risks reference cycles (two threads each hold one of two locks and wait forever); suggests studying deadlock mitigation and the Mutex and MutexGuard API docs.
- Closing: leads into the Send and Sync traits.

## std::sync::mpsc (Rust standard library module docs)
URL: https://doc.rust-lang.org/std/sync/mpsc/index.html
Version: std 1.99.0 (b940084d7 2026-09-28)

> Multi-producer, single-consumer FIFO queue communication primitives.

> A Sender or SyncSender is used to send data to a Receiver. Both

> senders are clone-able (multi-producer) such that many threads can send

> simultaneously to one receiver (single-consumer).

> An asynchronous, infinitely buffered channel. The channel function

> will return a (Sender, Receiver) tuple where all sends will be

> asynchronous

> A synchronous, bounded channel. The sync_channel function will

> return a (SyncSender, Receiver) tuple where the storage for pending

> messages is a pre-allocated buffer of a fixed size. All sends will be

> synchronous by blocking until there is buffer space available.

> Note

> that a bound of 0 is allowed, causing the channel to become a “rendezvous”

> channel where each sender atomically hands off a message to a receiver.

> The send and receive operations on channels will all return a Result

> indicating whether the operation succeeded or not. An unsuccessful operation

> is normally indicative of the other half of a channel having “hung up” by

> being dropped in its corresponding thread.

> Once half of a channel has been deallocated, most operations can no longer

> continue to make progress, so Err will be returned.

> // Drop the last sender to stop `rx` waiting for message.

> // The program will not complete if we comment this out.

> // **All** `tx` needs to be dropped for `rx` to have `Err`.

> The receiving half of Rust’s channel (or sync_channel) type.

> This half can only be owned by one thread.

> An error returned from the Sender::send or SyncSender::send

> function on channels.
Notes: this module page does not itself state that Sender::send takes the value by ownership and returns it inside SendError, that Receiver::recv blocks, or that Sender is Send; those are on the Sender, SendError and Receiver item pages (not fetched here). The page does show the clone-per-thread pattern, the recv loop ending once every sender is dropped, and moves into spawned closures.

Contents:
- Overview: multi-producer, single-consumer FIFO; three types Sender, SyncSender, Receiver; both senders clone-able.
- Two flavors: channel (asynchronous, infinitely buffered, returns (Sender, Receiver)); sync_channel (bounded, pre-allocated buffer, sends block when full, bound 0 is a rendezvous channel).
- Disconnection: send and receive return Result; Err when the other half has been dropped; many applications unwrap, propagating failure across threads.
- Examples: simple usage (move tx into thread::spawn, rx.recv()); shared usage (tx.clone() per spawned thread); propagating panics (drop(tx) then rx.recv().is_err()); synchronous channels (sync_channel(0)); unbounded receive loop (clone tx per thread, drop the original tx, `while let Ok(msg) = rx.recv()` ends when all senders are dropped).
- Structs: IntoIter, Iter, Receiver, RecvError, SendError, Sender, SyncSender, TryIter.
- Enums: RecvTimeoutError, TryRecvError, TrySendError.
- Functions: channel, sync_channel.

## std::thread::spawn (Rust standard library function docs)
URL: https://doc.rust-lang.org/std/thread/fn.spawn.html
Version: std 1.99.0 (b940084d7 2026-09-28)

> pub fn spawn<F, T>(f: F) -> JoinHandle<T>where

>  F: FnOnce() -> T + Send + 'static,

>  T: Send + 'static,

> Spawns a new thread, returning a JoinHandle for it.

> The join handle provides a join method that can be used to join the spawned

> thread. If the spawned thread panics, join will return an Err containing

> the argument given to panic!.

> If the join handle is dropped, the spawned thread will implicitly be detached.

> The 'static constraint means that the closure and its return value

> must have a lifetime of the whole program execution. The reason for this

> is that threads can outlive the lifetime they have been created in.

> The Send constraint is because the closure will need to be passed

> by value from the thread where it is spawned to the new thread. Its

> return value will need to be passed from the new thread to the thread

> where it is joined.

> As a reminder, the Send marker trait expresses that it is safe to be

> passed from thread to thread.

> This example also shows how to use move, in order to give ownership

> of values to a thread.

> A thread can also return a value through its JoinHandle
Notes: the example `let result = computation.join().unwrap();` shows join returning the closure's result (wrapped in Result).

Contents:
- Signature: spawn<F, T>(f: F) -> JoinHandle<T> with F: FnOnce() -> T + Send + 'static and T: Send + 'static.
- Behaviour: spawns a thread; join waits for it; a panic in the thread makes join return Err; dropping the JoinHandle detaches the thread (program must join or detach, else resource leak).
- Builder: spawn uses default Builder parameters; Builder::spawn sets stack size or name and can recover from OS failure.
- Constraints explained: 'static (closure and return value must outlive the caller because threads can outlive it); Send (closure passed by value to the new thread, return value passed back to the joining thread); Send vs Sync.
- Panics: if the OS fails to create a thread.
- Examples: basic spawn and join; sender/receiver threads using channel with move closures giving ownership of tx and rx to threads; returning a value (42) through JoinHandle::join.
- Notes: foreign unwinding gives the same minimal guarantee as catch_unwind (process aborts, or join returns Err with an opaque type).

## Struct std::sync::Arc (Rust standard library documentation)
URL: https://doc.rust-lang.org/std/sync/struct.Arc.html
Version: std 1.99.0 (b940084d7 2026-09-28)

> A thread-safe reference-counting pointer. ‘Arc’ stands for ‘Atomically Reference Counted’.

> The type Arc<T> provides shared ownership of a value of type T, allocated in the heap.

> Invoking clone on Arc produces a new Arc instance, which points to the same allocation on the heap as the source Arc, while increasing a reference count.

> When the last Arc pointer to a given allocation is destroyed, the value stored in that allocation (often referred to as “inner value”) is also dropped.

> Shared references in Rust disallow mutation by default, and Arc is no exception: you cannot generally obtain a mutable reference to something inside an Arc.

> Use interior mutability with synchronization primitives like Mutex, RwLock, or one of the Atomic types.

> Use clone-on-write semantics with Arc::make_mut which provides efficient mutation without requiring interior mutability.

> Use Arc::get_mut when you know your Arc is not shared (has a reference count of 1), which provides direct mutable access to the inner value without any cloning.

> Unlike Rc<T>, Arc<T> uses atomic operations for its reference counting. This means that it is thread-safe.

> Arc<T> makes it thread safe to have multiple ownership of the same data, but it doesn’t add thread safety to its data.

> In the end, this means that you may need to pair Arc<T> with some sort of std::sync type, usually Mutex<T>.

> A cycle between Arc pointers will never be deallocated. For this reason, Weak is used to break cycles.

> Gets the number of strong (Arc) pointers to this allocation.

> Another thread can change the strong count at any time, including potentially between calling this method and acting on the result.

> Returns the inner value, if the Arc has exactly one strong reference.

> If there are other Arc pointers to the same allocation, then make_mut will clone the inner value to a new allocation to ensure unique ownership. This is also referred to as clone-on-write.

> Returns a mutable reference into the given Arc, if there are no other Arc or Weak pointers to the same allocation.

> Returns None otherwise, because it is not safe to mutate a shared value.

Contents:
- Overview: Arc is the atomically reference-counted pointer giving shared ownership of a heap value; clone makes a new Arc to the same allocation and bumps the count (the data is not copied); the inner value is dropped when the last Arc is destroyed.
- Mutation: shared references disallow mutation, so Arc<T> gives only shared access; options are interior mutability (Mutex, RwLock, atomics), Arc::make_mut (clone-on-write), or Arc::get_mut (only when unshared).
- Thread Safety: unlike Rc, counting is atomic (costlier); Arc<T> is Send and Sync only if T is; Arc<RefCell<T>> is rejected; pair with Mutex<T>.
- Breaking cycles with Weak: downgrade gives non-owning Weak; upgrade returns None once the value is dropped; Arc cycles are never deallocated (leak), so use Weak for parent links.
- Cloning references and Deref: Arc::clone(&x) and x.clone() are equivalent; Arc derefs to T; Arc methods are associated functions.
- Examples: sharing immutable data between threads; sharing an AtomicUsize.
- try_unwrap: returns the inner value if exactly one strong reference, else Err with the same Arc; prefer Arc::into_inner to avoid a race where neither thread gets the value.
- into_inner: Option<T>, Some only for the last Arc.
- strong_count: number of strong pointers; racy across threads.
- make_mut: clone-on-write; clones if other Arcs exist, dissociates Weak if only Weak remain.
- get_mut: Option<&mut T>, None if any other Arc or Weak exists.
- unwrap_or_clone: unwraps if sole owner, else clones.

## Struct std::sync::Mutex (Rust standard library documentation)
URL: https://doc.rust-lang.org/std/sync/struct.Mutex.html
Version: std 1.99.0 (b940084d7 2026-09-28)

> A mutual exclusion primitive useful for protecting shared data

> The data can only be accessed through the RAII guards returned from lock and try_lock, which guarantees that the data is only ever accessed when the mutex is locked.

> The mutexes in this module implement a strategy called “poisoning” where a mutex becomes poisoned if it recognizes that the thread holding it has panicked.

> Once a mutex is poisoned, all other threads are unable to access the data by default as it is likely tainted (some invariant is not being upheld).

> Poisoning is only advisory: the PoisonError type has an into_inner method which will return the guard that would have otherwise been returned on a successful lock.

> An RAII guard is returned to allow scoped unlock of the lock. When the guard goes out of scope, the mutex will be unlocked.

> The exact behavior on locking a mutex in the thread which already holds the lock is left unspecified. However, this function will not return on the second call (it might panic or deadlock, for example).

> Consumes this mutex, returning the underlying data.

> Since this call borrows the Mutex mutably, no actual locking needs to take place

> the mutable borrow statically guarantees no new locks can be acquired while this reference exists.

> T must be Send for a Mutex to be Send because it is possible to acquire the owned T from the Mutex via into_inner.

Contents:
- Overview: Mutex<T> owns the data it protects; access only through RAII guards from lock and try_lock, so the data is touched only while locked.
- Poisoning: a panic while holding the lock poisons the mutex; lock and try_lock return Result; usually unwrap() to propagate; PoisonError::into_inner recovers the guard; poisoning is advisory and unsafe code cannot rely on it.
- Examples: Arc<Mutex<i32>> shared by 10 threads with lock released at end of scope; recovering from a poisoned mutex; releasing a guard early with an inner scope or drop(guard) to avoid deadlock.
- new: creates an unlocked mutex.
- lock: blocks until acquired; guard unlocks on drop; locking twice in the same thread does not return (panic or deadlock); errors if poisoned.
- try_lock: non-blocking; Err(WouldBlock) if held, Poisoned if poisoned.
- is_poisoned / clear_poison: query and reset poison state.
- into_inner(self): consumes the mutex and returns the data (LockResult<T>).
- get_mut(&mut self): mutable reference to the data with no locking, justified by the exclusive borrow.
- Trait impls: Send and Sync require T: Send; Mutex<Rc<_>> would not protect other Rc copies.

## slotmap - Rust (crate documentation)
URL: https://docs.rs/slotmap/latest/slotmap/
Version: slotmap 1.1.1 (docs.rs, Zlib license, published 03 September 2026)

> Insertion, removal and access all take O(1) time with low overhead.

> Great for storing collections of objects that need stable, safe references but have no clear ownership otherwise, such as game entities or graph nodes.

> A key is always unique and will only refer to the value that was inserted.

> A slot map’s main purpose is to simply own things in a safe and efficient manner.

> Those solutions either can not reclaim memory from deleted elements or suffer from the ABA problem. The keys returned by slotmap are versioned. This means that once a key is removed, it stays removed, even if the physical storage inside the slotmap is reused for new elements.

> Insertion, access and deletion is all O(1) with low overhead by storing the elements inside a Vec.

> Behind the scenes each slot in the vector is a (value, version) tuple. After insertion the returned key also contains a version. Only when the stored version and version in a key match is a key valid. This allows us to reuse space in the vector after deletion without letting removed keys point to spurious new elements.

> let reuse = sm.insert("reuse"); // Space from bar reused.

> assert_eq!(sm.contains_key(bar), false); // After deletion a key stays invalid.

> If you have multiple slot maps it’s an error to use the key of one slot map on another slot map. The result is safe, but unspecified, and can not be detected at runtime, so it can lead to a hard to find bug.

Notes: the crate-level page does NOT state that `get` returns `None` for a stale key, nor that keys are `Copy`; it shows `contains_key` returning false after deletion. Those two facts live on the SlotMap struct / Key trait pages and are not quoted here.

Contents:
- Overview: a container with persistent unique keys; insert returns the key (unlike BTreeMap/HashMap, where the caller supplies it); insertion, removal, access O(1); suited to objects with no clear owner (game entities, graph nodes); SecondaryMap associates extra data by direct indexing, no hashing.
- Example: insert returns a key; remove, then insert reuses the space; the old key stays invalid (`contains_key` is false); SecondaryMap is keyed by keys the caller supplies.
- Serde / no_std: keys and maps (de)serialize and a key stays valid across a round trip; no_std needs alloc; SparseSecondaryMap needs std.
- Why not index a Vec, slab, stable-vec: they either cannot reclaim memory or suffer from the ABA problem; slotmap keys are versioned, so a removed key stays removed even when the slot is reused; uses carefully checked unsafe internally.
- Performance: each slot is a (value, version) tuple; key is valid only when versions match; version wraps after 2^31 delete/insert cycles on one slot (very unlikely, and safe); capacity 2^32 - 2 elements; per-slot memory 4 + max(sizeof(T), 4) for SlotMap, 4 + max(sizeof(T), 12) for HopSlotMap, DenseSlotMap 8 bytes per element and 8 per slot.
- Choosing SlotMap / HopSlotMap / DenseSlotMap: SlotMap fastest except iteration, never shrinks storage (must remember the latest version per slot); HopSlotMap iterates only filled slots but insertion/removal about twice as slow; DenseSlotMap contiguous storage, two indirections per random access, Vec-speed iteration.
- Choosing SecondaryMap / SparseSecondaryMap: SecondaryMap is a Vec of slots, may need memory as large as the primary; SparseSecondaryMap is hash-based and auto-removes outdated keys whose slot was reused.
- Custom key types: `new_key_type!` makes a distinct key type per map so the wrong key cannot be used on the wrong map; generic code uses the Key trait.
- Items: modules basic, dense, hop, secondary, sparse_secondary; macro new_key_type; structs DefaultKey, DenseSlotMap, HopSlotMap (deprecated), KeyData, SecondaryMap, SlotMap, SparseSecondaryMap; trait Key.

## Flexibility - Rust API Guidelines
URL: https://rust-lang.github.io/api-guidelines/flexibility.html
Version: Rust API Guidelines, Flexibility chapter (live page, no edition or date shown)

> Caller decides where to copy and place data (C-CALLER-CONTROL)

> If a function requires ownership of an argument, it should take ownership of the argument rather than borrowing and cloning the argument.

> If a function does not require ownership of an argument, it should take a shared or exclusive borrow of the argument rather than taking ownership and dropping the argument.

> The Copy trait should only be used as a bound when absolutely needed, not as a way of signaling that copies should be cheap to make.

> Functions minimize assumptions about parameters by using generics (C-GENERIC)

> The fewer assumptions a function makes about its inputs, the more widely usable it becomes.

> Many functions that answer a question also compute interesting related data. If this data is potentially of interest to the client, consider exposing it in the API.

> HashMap::insert returns an Option<T> that returns the preexisting value for a given key, if any.

Contents:
- C-INTERMEDIATE: functions expose intermediate results to avoid duplicate work; std examples Vec::binary_search (index if found, insertion index if not), String::from_utf8 (error hands back the input bytes and valid-up-to offset), HashMap::insert (returns the old value, avoiding a second lookup).
- C-CALLER-CONTROL: take ownership if you need it rather than borrow and clone (`fn foo(b: Bar)` over `fn foo(b: &Bar) { b.clone() }`); borrow if you do not need ownership rather than take and drop (`fn foo(b: &Bar)` over `fn foo(b: Bar)`); Copy only as a bound when absolutely needed.
- C-GENERIC: prefer `fn foo<I: IntoIterator<Item = i64>>(iter: I)` over slice, Vec or other-collection parameters when only iteration is needed; advantages: reusability, static dispatch/monomorphization, inline layout, inference, precise types; disadvantages: code size, homogeneous types, signature verbosity; std example File::open takes AsRef<Path>.
- C-OBJECT: traits are object-safe if they may be useful as a trait object; trait-object limits (no generic methods, no Self except receiver); `where Self: Sized` excludes a method from the object; advantages heterogeneity and smaller code; disadvantages no generic methods, dynamic dispatch and fat pointers, no Self; std examples io::Read, io::Write, Iterator.

## Disallow references to static mut - The Rust Edition Guide
URL: https://doc.rust-lang.org/edition-guide/rust-2024/static-mut-references.html
Version: Rust Edition Guide, Rust 2024 chapter (live page, no date shown)

> The static_mut_refs lint level is now deny by default. This checks for taking a shared or mutable reference to a static mut.

> The static_mut_refs lint detects taking a reference to a static mut. In the 2024 Edition, this lint is now deny by default to emphasize that you should avoid making these references.

> Merely taking such a reference in violation of Rust’s mutability XOR aliasing requirement has always been instantaneous undefined behavior, even if the reference is never read from or written to.

> Furthermore, upholding mutability XOR aliasing for a static mut requires reasoning about your code globally, which can be particularly difficult in the face of reentrancy and/or multithreading.

> Wherever possible, it is strongly recommended to use instead an immutable static of a type that provides interior mutability behind some locally-reasoned abstraction (which greatly reduces the complexity of ensuring that Rust’s mutability XOR aliasing requirement is upheld).

> you must now use raw pointers such as can be obtained via the &raw const or &raw mut operators.

> There is no automatic migration to fix these references to static mut.

Contents:
- Summary: static_mut_refs is deny by default in the 2024 edition; it flags taking a shared or mutable reference to a static mut.
- Details: examples of flagged code (`&X`, `let ref x = X`, tuple of `&X, &Y`); the reference alone is instant UB if it breaks mutability XOR aliasing; global reasoning needed; implicit references (`println!("{NUMS:?}")`, `NUMS.len()`) also trigger the lint.
- Alternatives: prefer an immutable static with interior mutability; otherwise use raw pointers via `&raw const` / `&raw mut`. Listed approaches: don't use globals; atomics (AtomicU64 instead of static mut u64); Mutex or RwLock (`static QUEUE: Mutex<VecDeque<String>>`); OnceLock / LazyLock for one-time init; a no_std atomic-guarded init pattern; raw pointers for FFI (`&raw mut STATE`); a Sync wrapper around UnsafeCell (nightly std has SyncUnsafeCell); safe references only when narrowly scoped and synchronized (allow the lint narrowly, or `&mut *&raw mut MY_STATIC`); keep any reference short-lived and use pointers as the default unit.
- Migration: no automatic fix; code must be rewritten to one of the Alternatives.


## std::sync::mpsc::Sender and SendError (item pages)
URL: https://doc.rust-lang.org/std/sync/mpsc/struct.Sender.html
Version: std 1.99.0 page, fetched 2026-10-12

> Attempts to send a value on this channel, returning it back if it could
> not be sent.

> impl<T: Send> Send for Sender<T>

Contents: Sender::send(&self, t: T) -> Result<(), SendError<T>> (takes the value by move; on Err the value comes back inside SendError), clone, is_disconnected (nightly), trait impls (Send when T: Send); SendError<T>(pub T) payload.

## slotmap::SlotMap (item page)
URL: https://docs.rs/slotmap/latest/slotmap/struct.SlotMap.html
Version: slotmap 1.1.1 page, fetched 2026-10-12

> Removes a key from the slot map, returning the value at the key if the
> key was not previously removed.

> Returns a reference to the value corresponding to the key.

Contents: new, insert, remove, get, contains_key, iteration, secondary maps.
