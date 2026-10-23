# Outline — Arc shares, Mutex synchronizes

## Learning outcomes
- State `Arc`'s one job (shared ownership) and `Mutex`/`RwLock`'s separate job (synchronized access), and explain why `Arc` alone never makes mutation safe.
- Explain `std::sync::Mutex`'s poisoning strategy and why `parking_lot::Mutex` makes the opposite design choice on purpose.
- State when `tokio::sync::Mutex` is actually needed (holding a lock across an `.await`) and recognize the real compile failure a `std` guard held across `.await` produces inside a spawned task.

## Engagement arc
- Hook (step 1): the same job counter from topic 18, now behind a bare `Arc`, with the question of mutating it opened immediately.
- Predict 1 (step 2, within the first four): "does assigning directly through a bare `Arc<u64>` compile?"
- Predict 2 (step 7): "does holding a `std` lock's guard across an `.await` inside a spawned task compile?"
- Surprising number: the panic-while-holding-the-lock sequence recovers the exact same value (seven) through two completely different mechanisms — `std`'s advisory poisoning and `parking_lot`'s no poisoning at all.
- Takeaways: steps 1, 4, 5, 6, plus the recap.
- Recap (step 9): `Arc` shares and nothing more; `Mutex`/`RwLock` add the synchronization; `std` poisons on panic, `parking_lot` doesn't; `tokio::sync::Mutex` exists for exactly one reason.

## Steps

### 1. A bare Arc shares the counter — and that's all (takeaway)
- fig: `BareArcShares`
- Visual idea: the counter box inside a plain `Arc`, cloned to a second thread dot, both pointing at the identical box — then a crossed-out pencil icon over any attempt to write to it.
- On screen: the `Arc<u64>` box, two thread dots each holding a clone, a crossed-out write icon.
- What moves: the box draws, clones to both thread dots, then the write icon fades in crossed out.
- Real values: none yet (purely structural).
- Final frame: two threads, one box, no way to write shown.
- Caption point: sharing and mutating turned out to be two different questions, and `Arc` only ever answers the first one.
- Narrator's line of thought: she names the trap directly — `Arc`'s own documentation calls this out as a common point of confusion: multiple ownership is thread-safe the moment you wrap something in `Arc`, but nothing about the value itself just became safe to mutate.
- Takeaway (≤20 words): `Arc` shares ownership only; it adds no way to mutate the value inside it.

### 2. Does assigning through a bare Arc<u64> compile? (predict)
- fig: `BareArcPredict`
- Visual idea: the real code attempting `*counter += 1;` directly through the `Arc`, with a question mark over a compiler verdict.
- On screen: a `Code` panel with the real assignment line, a question mark.
- What moves: the code draws, then the prediction options fade in.
- Options: "Yes — Arc's atomic refcount makes the whole thing thread-safe to write to" (tempting: conflates refcount safety with value safety, the exact trap step 1 named); "No — it fails to compile; Arc never implements the trait that would allow it" (correct); "Yes, but it silently clones the value first" (invented: `Arc` doesn't do copy-on-write by default)
- Answer: no — `Arc<u64>` never implements `DerefMut`, so there is no path to a mutable reference through it at all, by design.
- Narrator's line of thought: she connects this to ordinary shared references — `&T` never lets you write either, and `Arc` is explicitly no exception to that rule; the fix was never going to be "wrap it tighter," it has to be a type that adds real synchronized mutability underneath.

### 3. The real compiler verdict (no takeaway — the reel's "from" step)
- fig: `BareArcReveal`
- Visual idea: the real error text appearing under the attempt, naming the exact missing trait.
- On screen: the real `error[E0594]` text in a dim `Code` panel.
- What moves: the error draws in.
- Real values: the real error text (`cannot assign to data in an \`Arc\``, naming `DerefMut`).
- Final frame: the full real error on screen.
- Caption point: the compiler names the missing trait by name, not a vague "can't do that."
- Narrator's line of thought: she reads the error literally — it isn't a borrow-checker complaint about sharing, it's a much more basic fact: the type simply never offers a mutable path in, the same way a plain shared reference never does.

### 4. Wrap it in a Mutex, and both jobs get done (takeaway)
- fig: `ArcMutexWorks`
- Visual idea: the same counter, now behind `Mutex` inside the `Arc`, four thread dots each drawing a non-overlapping line to it, landing on the exact real total.
- On screen: the `Arc<Mutex<u64>>` box, four thread dots, a running total.
- What moves: four lines draw in a staggered beat; the total ticks up to its real final value.
- Real values: 4 workers × 25,000 increments each, the real exact total from `arc_mutex_shares_and_synchronizes.rs`.
- Final frame: the box showing the exact total, four thread dots settled.
- Caption point: sharing and synchronizing, both present now, both doing their own separate job.
- Narrator's line of thought: she names the two jobs explicitly, by pointing at the two types doing them — the `Arc` is still only sharing, exactly as before; the new thing, the only new thing, is the `Mutex` actually synchronizing every single access to the value inside it.
- Takeaway (≤20 words): `Arc` shares; `Mutex` synchronizes — two separate jobs, two separate types, never one substituting for the other.

### 5. A panic while the lock is held really poisons it (takeaway)
- fig: `StdMutexPoisons`
- Visual idea: a thread holding the lock, a small crack/warning icon appearing on the lock as the thread panics, then a second thread's lock attempt returning a visibly different (poisoned) result.
- On screen: a `Code` panel showing the panic-while-holding sequence, a lock icon that cracks, the real poisoned/recovered values.
- What moves: the first thread's lock-then-panic draws; the lock icon cracks; a second lock attempt shows the real poisoned result; the recovered value still appears via `into_inner`.
- Real values: the real poisoned flag (true) and recovered value (seven) from `std_mutex_poisons.rs`.
- Final frame: the cracked lock, with the recovered value still shown underneath.
- Caption point: poisoning is a warning passed along, not data lost.
- Narrator's line of thought: she frames poisoning as a deliberate, conservative choice — the standard library doesn't know whether the panic left the data in a broken state, so it refuses access by default and makes every later caller decide, rather than silently handing over data that might be wrong.
- Takeaway (≤20 words): `std::sync::Mutex` poisons itself if a thread panics while holding it; the data is still reachable, deliberately, through recovery.

### 6. The identical panic, and parking_lot's opposite choice (takeaway)
- fig: `ParkingLotNoPoison`
- Visual idea: the identical scene as step 5 — thread panics holding the lock — but this time the lock icon never cracks; a second lock attempt proceeds exactly as if nothing happened.
- On screen: the same panic-while-holding shape, now with `parking_lot`'s `Mutex`, the lock icon staying intact, the real recovered value.
- What moves: the panic draws exactly as before; the lock icon stays whole this time; the second lock's real value appears directly, no recovery step needed.
- Real values: the real value (seven) from `parking_lot_no_poison.rs`.
- Final frame: the intact lock, the value shown directly.
- Caption point: same panic, same lock, a completely different library decision about what happens next.
- Narrator's line of thought: she states the trade-off plainly, without declaring a winner — `parking_lot` trades away poisoning's safety net (a caller can now silently read data a panic may have left inconsistent) for a smaller, simpler lock with no advisory step at all; which one is right depends entirely on whether that panic-time invariant actually matters for the data being protected.
- Takeaway (≤20 words): `parking_lot::Mutex` never poisons; the same panic that warns a `std` lock's callers leaves this one silently unlocked.

### 7. Does holding a std lock's guard across an await compile? (predict)
- fig: `GuardAwaitPredict`
- Visual idea: a spawned task holding a `std` lock's guard across a dotted `.await` line, a question mark over whether the whole thing still compiles.
- On screen: a `Code` panel showing the guard acquired, then an `.await`, then the guard used again.
- What moves: the code draws, the `.await` point highlights, the prediction options fade in.
- Options: "Yes — the guard is just a value like any other inside the task" (tempting: ignores that a guard is specifically the one `!Send` value this chapter has already met); "No — the whole task stops qualifying to be spawned, the moment the guard is still alive at that pause" (correct); "Yes, but the lock silently unlocks itself for the duration of the pause" (invented: no such behavior exists)
- Answer: no — the guard is exactly the `!Send` value from topic 18's own example, so holding it alive across the task's one pause point makes the entire generated future `!Send`, and a spawned task must be `Send`.
- Narrator's line of thought: she draws the direct line back to the previous topic — this isn't a new rule, it's the identical one, just triggered by the specific value every `Mutex`'s `lock()` call happens to hand back.

### 8. The real failure, and the one tool built to survive it (no takeaway — the reel's "from" step)
- fig: `GuardAwaitReveal`
- Visual idea: the real compiler error under the `std` attempt, naming the guard directly; beside it, the identical shape built with `tokio::sync::Mutex` instead, compiling and running to its real value.
- On screen: two `Code` panels — the real `std` failure, and the real `tokio::sync::Mutex` success with its real printed value.
- What moves: the `std` failure draws first; the `tokio` success draws beside it, landing on its real output.
- Real values: the real error text (`future cannot be sent between threads safely`, naming `MutexGuard`), and the real printed value (one) from `tokio_mutex_across_await_works.rs`.
- Final frame: both panels, side by side, one red, one real and working.
- Caption point: the exact same shape, two different locks, one built for exactly this.
- Narrator's line of thought: she closes the loop with tokio's own published advice — the ordinary, cheaper lock is still the right default everywhere else; this one extra cost buys exactly the one thing the `std` lock structurally can't do.

### 9. Recap: two jobs, two choices each (takeaway)
- fig: `Recap`
- Visual idea: four short rows.
- On screen: four lines, each with a small marker.
- What moves: each row fades in in turn.
- Real values: none new — a pure summary.
- Final frame: all four rows settled.
- Caption point: the whole topic in four lines.
- Narrator's line of thought: a plain, declarative close.
- Takeaway (≤20 words): `Arc` shares, `Mutex` synchronizes; `std` poisons on panic and `parking_lot` doesn't; `tokio::sync::Mutex` is for holding a lock across `.await`.
- Rows: "Arc shares ownership; it adds no way to mutate what's inside it"; "Mutex and RwLock are the types that actually add synchronization"; "std's Mutex poisons on panic; parking_lot's doesn't, by design"; "tokio::sync::Mutex exists for one reason: surviving an await while locked"

## Post-notes headings
- **Outcomes**: the three learning outcomes above.
- **Internals**: `std::sync::Mutex`'s real futex-based implementation on Linux (a single atomic word with unlocked/locked/contended states), contrasted with `parking_lot`'s one-byte lock state; why a thin C-library wrapper was replaced.
- **Lab**: the chapter's lab builds a concurrent counter three ways (`Mutex`, atomics, owner task); this topic completes the `Mutex` leg for real (already shown in topic 18, reused and re-verified here with the `Arc`/`Mutex` pairing made explicit), and names which crate/type to reach for by default (`std::sync::Mutex`, escalating to `parking_lot` only under measured contention, to `tokio::sync::Mutex` only when a lock must survive an `.await`).
- **In production**: the standard "do I need `std`, `parking_lot`, or `tokio::sync`" decision tree real codebases hit constantly; poisoning bugs where a library silently `.unwrap()`s a `PoisonError` and crashes the whole process on an unrelated panic elsewhere.
- **The frontier**: `Mutex::clear_poison` (stabilized) as a way to deliberately un-poison a lock when the caller has verified the data's invariant still holds; ongoing ecosystem debate over whether poisoning's safety net is worth its ergonomic cost, reflected in `parking_lot`'s popularity.
- **Where this goes next**: hands off to topic 20 (critical sections and external latency) — the lock now has exactly one well-defined job; the next question is what happens the moment something that isn't a memory operation ends up inside it.

## Examples to execute and what each must assert
- `bare_arc_no_mutation.rs`: real compile failure, asserting the exact `error[E0594]` text and that `DerefMut` is named.
- `arc_mutex_shares_and_synchronizes.rs`: real multi-threaded run, asserting the final count is exactly `WORKERS * PER_WORKER` (100,000).
- `std_mutex_poisons.rs`: real run, asserting the lock is reported poisoned and the value is still recovered via `into_inner` (seven).
- `parking_lot_no_poison.rs`: real run (cargo + parking_lot), asserting the identical panic leaves the lock usable, value recovered directly (seven).
- `std_guard_across_await_fails.rs`: real compile failure (cargo + tokio), asserting the exact `future cannot be sent between threads safely` text and that `MutexGuard` is named.
- `tokio_mutex_across_await_works.rs`: real compile and run (cargo + tokio), asserting the real printed value (one).

## Bridge and handoff
- Bridges from topic 18's real handoff: "knowing which types the compiler lets across a thread boundary says nothing yet about what happens once several threads actually hold the same one — Arc alone was never the whole answer in Chapter 4, and this chapter can finally say why."
- Hands off to topic 20: "the lock now has exactly one well-defined job: synchronizing access to a few memory operations. The next question is what happens the moment something that isn't a memory operation ends up inside it."

## Concept ledger
- `introduces`: `arc-shares-only`, `mutex-rwlock-synchronizes`.
- `uses`: `send-auto-trait`, `sync-auto-trait` (topic 18), `arc-atomic-refcount` (Chapter 4), `threads-and-channels`, `mutexes` (declared).
- `declared`: none beyond what's already declared by Chapters 4/6.

## Claims list
1. `Arc<T>` provides shared ownership only; it adds no way to mutate the value inside it. — std `Arc` docs' own "doesn't add thread safety to its data" statement; confirmed by the real `bare_arc_no_mutation.rs` compile failure.
2. `Mutex`/`RwLock`/atomics are what actually add synchronized mutability. — std `Arc` docs.
3. `std::sync::Mutex` implements poisoning: a panic while holding the lock poisons it for later lockers by default, recoverable via `into_inner`. — std `Mutex` docs; confirmed by the real `std_mutex_poisons.rs` run.
4. `std::sync::Mutex` is a real, futex-based primitive on Linux (not a thin C-library wrapper). — the real std source (`sys::sync::mutex::futex`).
5. `parking_lot::Mutex` makes the opposite choice: no poisoning, the lock releases normally on panic, and needs only one byte of lock state. — parking_lot's own "Differences from the standard library Mutex" docs; confirmed by the real `parking_lot_no_poison.rs` run.
6. `tokio::sync::Mutex`'s guard is specifically designed to be held across `.await`; `std`'s is not, and the docs recommend `std`/`parking_lot` by default. — tokio `Mutex` docs.
7. Holding a `std` `MutexGuard` across `.await` inside a spawned task makes the whole future `!Send` and fails to compile, for the identical reason topic 18's `Rc`-across-`.await` example did. — confirmed by the real `std_guard_across_await_fails.rs` compile failure; `tokio::sync::Mutex`'s guard, built to be `Send`, compiles and runs the identical shape (`tokio_mutex_across_await_works.rs`).

## Changes from the chapter plan
None. This topic builds the chapter plan's three counter shapes (bare `Arc`, `Arc<Mutex<_>>`, `parking_lot::Mutex`) and its poisoning contrast exactly as specified, and adds the `tokio::sync::Mutex`-across-`.await` material the chapter plan's A.2 also assigned to this topic.
