# Outline: Box, Rc, and Arc ownership shapes (`rust.box-rc-arc-ownership`)

Chapter 4, topic 12 (opens the chapter). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Place `Box`, `Rc`, and `Arc` by how many owners each allows: `Box` single ownership on the heap, `Rc` many owners on one thread via a plain refcount, `Arc` many owners across threads via an atomic refcount.
2. Explain why `Rc<T>` is `!Send` and reproduce the real compile failure from moving one into another thread.
3. State that `Arc::clone` is cheap only while uncontended, and back that with a real, measured, multi-threaded clone/drop benchmark against an uncontended baseline — never an asserted ratio.

## Reel steps (storyboard)

1. **"One owner, many owners, many owners safely"** — `fig`: `OwnershipShapes`. `examples/box_ownership.rs`: a `Node` moved whole, child and all, through one `Box`. Takeaway: "Box is one owner on the heap; Rc shares that owner on one thread; Arc shares it safely across threads."
2. **"Moving Rc into a new thread"** (predict) — `fig`: `RcNotSend`. `examples/rc_not_send_fail.rs`: an `Rc<i32>` moved into `thread::spawn`. Predict: compiles, the count is just a number / fails: Rc's count isn't safe to touch from two threads at once (correct) / compiles, but only with `move` / fails, but only because i32 is Copy. Correct: `error[E0277]`, `Rc<i32>` cannot be sent between threads safely.
3. **"A shared count, cheap to touch"** — `fig`: `RcShared`. `examples/rc_shared.rs`: `Rc::clone`/`Rc::strong_count` bumping and dropping a plain, non-atomic count on one thread. No takeaway (this is the reel's "from" step).
4. **"The same shape, safe across threads"** — `fig`: `ArcShared`. `examples/arc_shared.rs`: four real threads each clone the identical `Arc<Node>`, read it, and exit. Takeaway: "Arc's count is atomic, so cloning and dropping it from several threads at once is safe, unlike Rc's."
5. **"Does splitting the work across threads speed it up?"** (predict) — `fig`: `ContentionPredict`. `examples/arc_contention.rs` run live: the identical total of clone/drop pairs, once by one thread alone, once split across four threads hitting the same `Arc`. Predict: yes, close to four times faster / no, the four threads together take longer than the one thread alone (correct) / about the same either way / only slower on a machine with few cores. Correct: real, measured contention outweighs splitting the work.
6. **"Measuring what contention really costs"** — `fig`: `ContentionBar`. The same run's actual numbers: the contended time measured well above the single-thread baseline itself. Takeaway: "Arc::clone is cheap only until more than one thread actually touches the same count; then every clone and drop becomes a real, measured cost."
7. **Recap** — `Box` is one owner on the heap; `Rc` shares that owner on one thread with a plain count, `!Send`; `Arc` shares it safely across threads with an atomic count; that atomic count is cheap uncontended and measurably not cheap once several threads actually race for it. Handoff to topic 13: none of `Box`, `Rc`, or `Arc` let you mutate through a shared owner on their own — what actually makes that legal?

## Engagement arc

- Hook: step 1, opening the chapter against Chapter 3's closing handoff about `Box`.
- Early predictions: step 2 (within the first four).
- Surprising number: step 6's measured contention cost, read qualitatively from the real run (narration spells it as words, never digits).
- Takeaways: steps 1, 4, 6 (three; step 2's and step 5's predicts explain themselves, step 3 carries its point without a separate takeaway line).
- Recap: step 7.

## Claims list

| Claim | Source |
|---|---|
| `Box<T>` is single ownership, moved whole, just allocated on the heap | expert knowledge + `examples/box_ownership.rs` (executed) |
| `Rc::clone` bumps a plain, non-atomic reference count rather than deep-copying the data; the data is freed only once the count reaches zero | `book-rc` + `examples/rc_shared.rs` (executed) |
| `Rc<T>` is `!Send`: moving one into another thread fails to compile | expert knowledge + `examples/rc_not_send_fail.rs` (executed, real `E0277`) |
| `Arc<T>`'s count is atomic, which is what makes cloning and dropping it across real threads safe, at a higher per-touch cost than Rc's plain count | `std-arc-docs` + `examples/arc_shared.rs` (executed) |
| Splitting identical clone/drop work across several threads on the same `Arc` measurably does not scale down with thread count once the threads genuinely contend for the same count; the contended run measured well above the single-thread baseline itself | expert knowledge + `examples/arc_contention.rs` (executed, real wall-clock measurement via `std::time::Instant` and `std::sync::Barrier`) |

## Concept ledger

- `introduces`: `box-heap-ownership`, `rc-shared-single-thread`, `arc-atomic-refcount`, `atomic-refcount-contention-cost`
- `uses`: (none beyond declared)
- `declared`: `ownership`, `move-semantics`, `threads-and-channels`, `arc-mutex-reflex`

## Bridge and handoff

- Bridge: "Every `dyn Trait` value Chapter 3 built was borrowed or already sitting behind a `Box`; this chapter asks what shape of ownership that `Box` actually is, and what `Rc`/`Arc` add when one owner stops being enough." (`CHAPTER.md` §A.8, reused verbatim.)
- Handoff: "None of `Box`, `Rc`, or `Arc` let you mutate through a shared owner on their own — `&T` is still `&T`. What actually makes that legal?" (`CHAPTER.md` §A.8, reused verbatim.)
