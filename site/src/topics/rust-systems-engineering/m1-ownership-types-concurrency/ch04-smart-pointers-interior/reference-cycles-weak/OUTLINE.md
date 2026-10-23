# Outline: Reference cycles and Weak (`rust.reference-cycles-weak`)

Chapter 4, topic 14. Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Build a genuine two-node `Rc`/`RefCell` cycle, and measure that it leaks for the life of the program with a counting allocator, never a guessed number.
2. Place `Weak<T>` as a non-owning reference that breaks a cycle without itself ever keeping anything alive, and say what `upgrade` returns once the last strong owner is gone.
3. Use `Rc::new_cyclic` to build a structure that needs to hold a weak pointer to itself from the moment it exists.

## Reel steps (storyboard)

1. **"A cycle that never closes"** — `fig`: `CycleLeak`. `examples/rc_cycle_leak.rs`: a parent and child each holding a strong `Rc` to the other. Takeaway: "Safe Rust compiles a cycle of Rc and RefCell values pointing at each other, and it leaks for the life of the program."
2. **"Does this reject at compile time?"** (predict) — `fig`: `CompilePredict`. Predict: yes, the borrow checker refuses a cycle / no, it compiles fine and leaks forever (correct) / it panics the first time it runs / it only leaks in debug builds. Correct: a counting allocator shows real allocations never freed.
3. **"Weak: a reference that owns nothing"** — `fig`: `WeakConcept`. No takeaway (this is the reel's "from" step).
4. **"The same shape, with one link made Weak"** — `fig`: `WeakFixesCycle`. `examples/weak_breaks_cycle.rs`: the identical parent/child shape, parent held by `Weak` instead of `Rc`. Takeaway: "A Weak reference carries no ownership, so a cycle built with one breaks cleanly once every strong reference is gone."
5. **"The last strong owner is dropped — then upgrade"** (predict) — `fig`: `UpgradeAfterDrop`. `examples/weak_upgrade_after_drop.rs`. Predict: still returns the value, Weak keeps it alive / returns None, the value is already gone (correct) / panics / blocks until a new owner exists. Correct: `upgrade` returns `None`.
6. **"Built with a Weak to itself"** — `fig`: `NewCyclic`. `examples/rc_new_cyclic.rs`: `Rc::new_cyclic` handing the constructor a `Weak` to its own not-yet-finished allocation. Takeaway: "Rc::new_cyclic hands the constructor a Weak to the value's own allocation, for structures that must reference themselves from the start."
7. **Recap** — a cycle of strong `Rc`/`RefCell` references leaks forever, safe Rust compiles it without complaint; `Weak` carries no ownership and breaks that cycle; `upgrade` returns `None` once the last strong owner is gone; `Rc::new_cyclic` is how a self-referencing structure gets a weak pointer to itself from the moment it's built. Handoff to topic 15: every shared value so far lived on one thread's worth of logic at a time — what happens once more than one thread actually touches the same mutable, shared state at once?

## Engagement arc

- Hook: step 1, the cycle that leaks.
- Early predictions: step 2 (within the first four).
- Surprising fact: step 2's answer — the compiler accepts the cycle completely, and only the counting allocator reveals the leak.
- Takeaways: steps 1, 4, 6 (three; steps 2, 5's predicts explain themselves, step 3 carries its point without a separate takeaway line).
- Recap: step 7.

## Claims list

| Claim | Source |
|---|---|
| Memory leaks are memory-safe in Rust; an `Rc`/`RefCell` cycle leaks because every item's reference count never reaches zero | `book-reference-cycles` + `examples/rc_cycle_leak.rs` (executed, measured with a counting global allocator) |
| A `Weak` reference carries no ownership and cannot itself keep a cycle from breaking once every strong reference is gone | `book-reference-cycles` + `weak-docs` + `examples/weak_breaks_cycle.rs` (executed) |
| `upgrade` returns `None` once the value it points at has been dropped, because a `Weak` reference does not prevent that drop | `weak-docs` + `examples/weak_upgrade_after_drop.rs` (executed) |
| `Rc::new_cyclic` hands the constructor a `Weak<T>` to the value's own not-yet-finished allocation, for a structure that needs to hold a weak pointer to itself | `rc-docs` + `examples/rc_new_cyclic.rs` (executed) |

## Concept ledger

- `introduces`: `reference-cycle-leak`, `weak-reference`, `rc-new-cyclic`
- `uses`: `rc-shared-single-thread`, `refcell-runtime-borrow-check`
- `declared`: `structs-enums`, `leak-safety`, `counting-allocator`

## Bridge and handoff

- Bridge: "A node that can point at its own children, mutably, through RefCell, can also be made to point back at its parent. What happens once two of those point at each other?" (`CHAPTER.md` §A.8, reused verbatim.)
- Handoff: "Every shared value in this chapter so far lived on one thread's worth of logic at a time, even when Arc made it legal to share across threads. The next, final step is what happens when more than one thread actually touches the same mutable, shared state at once." (`CHAPTER.md` §A.8, reused verbatim.)
