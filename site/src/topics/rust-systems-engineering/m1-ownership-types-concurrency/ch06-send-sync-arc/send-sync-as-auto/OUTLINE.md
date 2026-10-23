# Outline — Send and Sync as auto-traits

## Learning outcomes
- State what `Send` and `Sync` each mean in one sentence, and name a real `std` type that is one but not the other (`Cell`/`RefCell`: `Send`, not `Sync`; `MutexGuard`: `Sync`, not `Send`; `Rc`: neither).
- Explain why `unsafe impl Send`/`Sync` is a real, unchecked proof obligation, and read `PhantomData<*const T>` as the mechanism that opts a generic type out of an auto-trait it would otherwise get.
- State that a spawned future must itself be `Send`, and that a `!Send` value only breaks that if it is still alive across an `.await` point.

## Engagement arc
- Hook (step 1): the job counter, built with a plain `Cell<u64>`, counts correctly on one thread — then the question of sharing it opens immediately.
- Predict 1 (step 2, within the first four): "does `Arc<Cell<u64>>`, cloned into a second thread, compile?"
- Predict 2 (step 7): "can an `Rc` be held across an `.await` inside a spawned task and still compile?"
- Surprising number: the four-worker `Arc<Mutex<u64>>` counter lands on exactly 200,000 (4 × 50,000) — no number is ever off by even one, because every access is synchronized.
- Takeaways: steps 1, 4, 5, 6, plus the recap.
- Recap (step 9): `Send`/`Sync` are structural facts the compiler derives from a type's fields; `unsafe impl` and `PhantomData` are the two deliberate overrides of that derivation; a spawned future's `Send`-ness depends only on what's alive across its `.await` points.

## Steps

### 1. A job counter that counts correctly, alone (takeaway)
- fig: `CellAloneWorks`
- Visual idea: a single `Cell<u64>` box with a thread dot beside it, a loop of increments drawing in, landing on a real final value — clean and uncontested.
- On screen: the `Cell<u64>` box, one thread dot next to it, an increment loop counting up.
- What moves: the box draws in, the thread dot appears, the counter ticks up in a short animated loop to its real final value.
- Real values: the final count from a short, real increment loop (no threading yet).
- Final frame: the box showing its final count, one thread dot beside it, nothing contested.
- Caption point: alone, on one thread, `Cell<u64>` is exactly as simple as it looks.
- Narrator's line of thought: she sets up the real question immediately — this works because only one thread ever touches the cell; the entire chapter is about what happens the moment that stops being true, and today's first question is the simplest version of it: can this same cell be handed to a second thread at all?
- Takeaway (≤20 words): A type being safe to use on one thread says nothing yet about sharing it with another.

### 2. Does Arc<Cell<u64>>, cloned into a second thread, compile? (predict)
- fig: `CellSyncPredict`
- Visual idea: the same `Cell<u64>` box now inside an `Arc`, with a second thread dot and a cloned arrow reaching toward it; a question mark over the connection.
- On screen: `Arc<Cell<u64>>`'s code (`Arc::clone`, `thread::spawn(move || ...)`), a question mark where a compiler verdict belongs.
- What moves: the code draws, then the three prediction options fade in.
- Options: "Yes — Arc's atomic refcount makes anything inside it safe to share" (tempting: conflates what `Arc` does for its own refcount with what it does for the value inside); "No — the compiler refuses to compile it, before either thread even runs" (correct); "Yes, but a data race can corrupt the count at run time" (invented: there is no run time here, it never compiles).
- Answer: no — `Arc<Cell<u64>>` fails to compile, because `Arc<T>` is only `Send` when `T` is both `Send` and `Sync`, and `Cell<u64>` is `Send` but never `Sync`.
- Narrator's line of thought: she names the trap in the first wrong option directly — `Arc`'s atomic refcount only ever protects `Arc`'s own bookkeeping; it adds no synchronization to the value living inside it, so sharing a `Cell` through an `Arc` is exactly as unsynchronized as sharing a bare `Cell` would be.

### 3. Cell and RefCell fail identically, before main even runs (no takeaway — the reel's "from" step)
- fig: `CellRefCellFailReveal`
- Visual idea: the real compiler error text appearing under the `Arc<Cell<u64>>` attempt, then the identical shape of error appearing under an `Arc<RefCell<u64>>` attempt beside it — same diagnosis, two types.
- On screen: two short `Code` panels side by side (`cell_not_sync.rs`, `refcell_not_sync.rs`), each with its real `error[E0277]` beneath it.
- What moves: the `Cell` panel and its error draw in first; then the `RefCell` panel and its error draw in, visually matching.
- Real values: the real error text from both compiles (`` `Cell<u64>` cannot be shared between threads safely`` / `` `RefCell<u64>` cannot be shared between threads safely``, and `the trait Sync is not implemented for ...` in both).
- Final frame: both panels and both real errors on screen together.
- Caption point: the same cause, named twice: `Sync` is missing, not `Send`.
- Narrator's line of thought: she reads the compiler's own words literally — it never says `Cell` can't move to another thread; it says `Cell` can't be *shared* between threads, which is `Sync`'s question, not `Send`'s, and the two types fail in exactly the same way because they share exactly the same kind of unsynchronized interior mutability.

### 4. Arc<Mutex<u64>> compiles — and really synchronizes four workers (takeaway)
- fig: `MutexSynchronizesFig`
- Visual idea: the same counter box, now behind `Mutex`, with four thread dots each drawing a line to it one at a time (never overlapping), landing on the real final count.
- On screen: the `Mutex<u64>` counter box, four thread dots, each one's line to the box, a running total.
- What moves: the four thread lines draw in with a staggered, non-overlapping beat (visually: never two lines "inside" the box at once); the counter ticks up to its real final value.
- Real values: 4 workers × 50,000 increments each = the real, exact final count from `mutex_synchronizes.rs`.
- Final frame: the box showing the exact final count, four thread dots settled around it.
- Caption point: four threads, one lock, one exact number — never low, never high.
- Narrator's line of thought: she contrasts this directly with step 3 — `Mutex<u64>` is `Sync` precisely because every access goes through real synchronization, which is the one thing `Cell` and `RefCell` never add; `Arc<Mutex<u64>>` compiles for the same structural reason the bare `Arc<Cell<u64>>` didn't: the type inside the `Arc` is finally `Sync` too.
- Takeaway (≤20 words): `Mutex` makes a value `Sync` by adding real synchronization; `Cell` and `RefCell` never do.

### 5. MutexGuard is Sync but never Send (takeaway)
- fig: `GuardNotSendFig`
- Visual idea: the lock held by one thread (a small padlock icon docked to its thread dot), an attempt to move that padlock itself to a second thread dot, blocked with a real compiler error.
- On screen: a `Code` panel (`mutexguard_not_send.rs`: acquire the guard, then move it into `thread::spawn`), the real `error[E0277]` beneath it.
- What moves: the code draws; the padlock icon appears docked to the first thread dot; an arrow attempting to move it to a second thread dot draws and then is crossed out as the error appears.
- Real values: the real error text (`` `std::sync::MutexGuard<'_, u64>` cannot be sent between threads safely``).
- Final frame: the padlock still docked to the original thread dot, the crossed-out arrow, the error text.
- Caption point: the *lock* isn't `Send`, even though the *value it protects* is.
- Narrator's line of thought: she separates two things that sound like one — the counter behind the mutex crossed threads just fine in step 4, but the guard itself, the thing `lock()` hands back, is a different value with a different trait: it's tied by the platform's lock API to the exact OS thread that acquired it, so handing it to another thread would let that thread try to release a lock it never took.
- Takeaway (≤20 words): A `MutexGuard` is tied to the thread that acquired it; only the locked value itself can cross threads.

### 6. Two deliberate overrides of the compiler's own rule (takeaway)
- fig: `OverridesFig`
- Visual idea: two small trait-badge panels side by side — one generic wrapper with a plain `PhantomData<T>` field showing a normal "Send" badge; the identical wrapper with `PhantomData<*const T>` instead showing a crossed-out "!Send" badge; then a `Carton<T>` box with a handwritten "unsafe impl Send" stamp crossing a thread boundary for real.
- On screen: the two `PhantomData` variants' field declarations with their badges; then `Carton<T>`'s `unsafe impl<T: Send> Send for Carton<T> {}` line with a thread-crossing arrow and its real returned value.
- What moves: the plain-`PhantomData` wrapper draws with its "Send" badge; the opted-out variant draws beside it, its badge crossing out as the real compile error appears; then the `Carton` line draws and its arrow crosses to a second thread dot, landing on its real value.
- Real values: the real compile error naming `PhantomData<*const u8>`, and the real returned value (99) from `unsafe_impl_send_carton.rs`.
- Final frame: all three badges/results on screen — inherited, opted out, and hand-granted.
- Caption point: the compiler's structural rule has exactly two deliberate escape hatches, in opposite directions.
- Narrator's line of thought: she names the symmetry on purpose — `PhantomData<*const T>` closes a door the compiler would otherwise have opened on its own (because raw pointers are never `Send`/`Sync`, regardless of `T`), while `unsafe impl Send` opens one the compiler could never have proven itself; both are the programmer overriding the automatic, structural derivation, and both are a real promise the compiler trusts without checking.
- Takeaway (≤20 words): `PhantomData<*const T>` opts a type out of an auto-trait; `unsafe impl Send` opts one in by hand.

### 7. Can an Rc be held across an .await and still compile? (predict)
- fig: `RcAwaitPredict`
- Visual idea: a spawned async task holding an `Rc`, with a dotted line through an `.await` point, and a question mark over whether the whole future still compiles.
- On screen: a short `Code` panel showing an `Rc` created, then an `.await`, then the `Rc` used again afterward, inside `tokio::spawn(async { .. })`.
- What moves: the code draws, the `.await` point highlights, then the prediction options fade in.
- Options: "Yes — only the spawned closure itself needs to be Send, not what's inside it" (tempting: true for `thread::spawn`'s captured closure body generally, false for what a future holds live across suspension); "No — the whole future stops being Send the moment anything !Send is alive across an .await" (correct); "Yes, but only on a single-threaded runtime" (invented: this isn't about the runtime's thread count, it's about the type itself)
- Answer: no — `tokio::spawn` requires the future itself to be `Send`, and a future generated from an `async` block is `Send` only if every value it holds live across one of its `.await` points is `Send` too; an `Rc` alive across an `.await` makes the whole future `!Send`.
- Narrator's line of thought: she connects this back to steps 2–3 directly — this is the exact same structural rule as `Cell`/`RefCell` not being `Sync`, just applied to a value the compiler can't see named anywhere: the compiler-generated future type itself has a field for everything still alive at each suspension point, and that field inherits whatever `Rc` is.

### 8. The same Rc, dropped before the await, and held across it (no takeaway — the reel's "from" step)
- fig: `RcAwaitReveal`
- Visual idea: two versions of the same spawned task side by side — one where the `Rc` is dropped (scoped out) before the `.await`, landing on a real successful run; one where it's held live across the `.await`, landing on the real compile error.
- On screen: two `Code` panels (`tokio_rc_dropped_before_await.rs`, `tokio_rc_across_await_fails.rs`), the first with a real successful output, the second with the real error.
- What moves: the dropped-before version draws first, runs to its real "ok"; then the held-across version draws beside it, failing with its real error naming the future itself, not the `Rc`.
- Real values: the real printed `ok` from the first binary; the real error text (`future cannot be sent between threads safely`, naming `Rc<()>`) from the second.
- Final frame: both panels and both real outcomes on screen together.
- Caption point: the `Rc` is identical in both; only whether it's still alive at the `.await` differs.
- Narrator's line of thought: she points at the exact boundary — not "does this task use an `Rc` anywhere", but "is an `Rc` still alive at the specific moment the task suspends"; `tokio::spawn`'s own documentation calls this out directly, down to naming `Rc` as its own example.

### 9. Recap: the compiler derives it, you can only ever override it (takeaway)
- fig: `Recap`
- Visual idea: four short rows, the chapter's "trait badge" grammar reused once more for the last row.
- On screen: four lines, each with a small marker.
- What moves: each row fades in in turn.
- Real values: none new — a pure summary.
- Final frame: all four rows settled.
- Caption point: the whole topic in four lines.
- Narrator's line of thought: a plain, declarative close — no new claim, just the four ideas the reel actually proved, in order.
- Takeaway (≤20 words): `Send` and `Sync` are derived from a type's fields; only `unsafe impl` and `PhantomData` override that.
- Rows: "Send is safe-to-move; Sync is safe-to-share — two separate, structural facts"; "Cell and RefCell are Send but never Sync; Mutex adds the synchronization that makes the difference"; "a MutexGuard is tied to the thread that took the lock, even though the locked value isn't"; "unsafe impl Send and PhantomData<*const T> are the compiler's only two deliberate overrides"

## Post-notes headings
- **Outcomes**: the three learning outcomes above, restated plainly.
- **Internals**: how the compiler actually derives `Send`/`Sync` structurally (field by field, including the hidden fields of a compiler-generated future type across its `.await` points), and why marker traits with no methods are cheap to check this way.
- **Lab**: build the chapter's job counter all three ways (`Cell`, `RefCell`, `Mutex`) and watch the compiler accept or refuse each one; this chapter's own lab line (Mutex, atomics, owner task) is only partially buildable here — the Mutex leg is this topic's own lab, the rest arrives in topics 19–21.
- **In production**: real crates and APIs that lean on this directly — `tokio::spawn`'s `Send + 'static` bound, `rayon`'s requirement that closures be `Send`, and the common "future cannot be sent between threads safely" error that this topic's step 8 produces verbatim.
- **The frontier**: `negative_impls`, the unstable feature that lets a type explicitly `impl !Send`/`impl !Sync` for itself (the Rustonomicon's own "incredibly rare case"), and ongoing work on auto-trait leakage through `impl Trait` return types.
- **Where this goes next**: hands off to topic 19 (`Arc` shares, `Mutex` synchronizes) — this topic answered which types the compiler lets across a thread boundary at all; the next topic asks what happens once several threads actually hold the same one.

## Examples to execute and what each must assert
- `cell_not_sync.rs` / `refcell_not_sync.rs`: real `rustc` compile failures, asserting the exact `error[E0277]` text and that the missing trait named is `Sync`.
- `mutex_synchronizes.rs`: real multi-threaded run, asserting the final count is exactly `WORKERS * PER_WORKER` (200,000).
- `mutexguard_not_send.rs`: real compile failure, asserting the exact error naming `MutexGuard` and `Send`.
- `phantomdata_plain_send.rs`: real compile and run, asserting the real returned value (7).
- `phantomdata_optout_fails.rs`: real compile failure, asserting the error names `PhantomData<*const u8>` and `Send`.
- `unsafe_impl_send_carton.rs`: real compile and run, asserting the real returned value (99).
- `tokio_rc_dropped_before_await.rs`: real compile and run (cargo + tokio), asserting the real printed `ok`.
- `tokio_rc_across_await_fails.rs`: real compile failure, asserting the exact `future cannot be sent between threads safely` text and that `Rc<()>` is named.

## Bridge and handoff
- Bridges from topic 17's real handoff: "every guarantee this chapter made was about one value's own layout, standing still, inside one process. The next chapter asks the question Chapter 4 touched but never made precise: which of a type's guarantees survive being handed to another thread at all?"
- Hands off to topic 19: "knowing which types the compiler lets across a thread boundary says nothing yet about what happens once several threads actually hold the same one — Arc alone was never the whole answer in Chapter 4, and this chapter can finally say why."

## Concept ledger
- `introduces`: `send-auto-trait`, `sync-auto-trait`, `phantomdata-trait-optout`, `unsafe-impl-send-obligation`.
- `uses`: `rc-shared-single-thread`, `arc-atomic-refcount` (Chapter 4), `cell-copy-semantics`, `refcell-runtime-borrow-check` (Chapter 4), `threads-and-channels` (declared).
- `declared` (new, not yet introduced anywhere; listed in Prerequisites): none beyond Chapter 4/5's own declared set — `threads-and-channels` already covers the base vocabulary this topic assumes.

## Claims list
1. `Send` means ownership of a value may move to another thread; auto-derived from a type's fields. — std `Send` docs, Rustonomicon.
2. `Sync` means `&T` is itself `Send`. — std `Sync` docs, Rustonomicon.
3. `Cell`/`RefCell` are `Send`, never `Sync`. — std `Sync` docs ("Cell cannot be Sync"), confirmed by the real `cell_not_sync.rs`/`refcell_not_sync.rs` compile failures.
4. `Rc` is neither `Send` nor `Sync` (non-atomic refcount). — std `Send` docs, Rustonomicon.
5. `Arc<T>` is `Send` only when `T: Sync + Send`. — std `Send` docs' own `impl<T, A> Send for Arc<T, A> where T: Sync + Send`.
6. `Mutex`/`RwLock` add real synchronization, making their contents `Sync`. — std `Sync` docs; confirmed by the real `mutex_synchronizes.rs` exact-count run.
7. `MutexGuard` is `!Send` (tied to the acquiring thread) but remains `Sync`. — Rustonomicon; confirmed by the real `mutexguard_not_send.rs` compile failure.
8. Raw pointers are neither `Send` nor `Sync`. — Rustonomicon.
9. `PhantomData<T>` inherits `T`'s own auto-traits; `PhantomData<*const T>`/`PhantomData<*mut T>` are unconditionally `!Send + !Sync`. — Rustonomicon's `PhantomData` table; confirmed by the real `phantomdata_plain_send.rs`/`phantomdata_optout_fails.rs` pair.
10. `unsafe impl Send`/`Sync` is a real, unchecked, hand-written claim. — Rustonomicon; confirmed by the real, working `unsafe_impl_send_carton.rs`.
11. `std::thread::spawn` and `tokio::spawn` both require their future/closure to be `Send + 'static` in their real signatures. — std `thread::spawn` docs, `tokio::task::spawn` docs.
12. A `!Send` value may exist inside a spawned future as long as it is never alive across an `.await`; held across one, it is a real, named compile failure. — `tokio::task::spawn` docs' own `Rc` example; confirmed by the real `tokio_rc_dropped_before_await.rs`/`tokio_rc_across_await_fails.rs` pair.

## Changes from the chapter plan
None. This topic builds exactly the three-way counter cell (`Cell`, `RefCell`, a held `MutexGuard`) the chapter plan named, using the real failing `thread::spawn` call it specified, and adds the `PhantomData`/`unsafe impl Send`/future-`Send`-ness material the chapter plan's A.2 also assigned to this topic.
