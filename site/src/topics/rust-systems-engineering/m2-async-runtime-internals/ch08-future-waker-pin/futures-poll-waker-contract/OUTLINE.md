# Outline: Futures, Poll, and the Waker contract (`rust.futures-poll-waker-contract`)

Chapter 8, topic 24 (first of four, opens Milestone 2). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Explain why constructing a future does no work at all, and why that laziness is itself a form of backpressure rather than an accident of the design.
2. State the `Poll::Pending` contract precisely: a pending future must arrange for its `Waker` to be called, or it may never be polled again — and show a future that breaks this contract hanging for real.
3. Describe the actual architecture — future → waker → scheduler → poll — with no hidden thread anywhere in it, built and run as a real, working loop.

## Reel steps (storyboard)

1. **"A value that does nothing until something asks"** — hook. `fig`: a future drawn as an inert box, nothing happening inside it, contrasted with a thread already running.
2. **"Build a future by hand — does creating it do any work at all?"** (predict) — `fig`: `struct Delay` with no body executed yet. Options: yes, some setup always runs / no, nothing runs until it's polled (correct) / only if it captures variables.
3. **"Nothing. Polling is the only thing that ever runs it"** — `fig`: the `Future` trait's own single required method, `poll`, quoted directly. NO takeaway (first non-predict step after a predict step).
4. **"That laziness is the backpressure"** — `fig`: many constructed-but-unpolled futures, no cost paid for existing. Takeaway: "Constructing a future does no work; a system can hold far more pending futures than it can run at once, because nothing runs until something polls."
5. **"Pending without a plan to be asked again — what happens?"** (predict) — `fig`: a future that returns `Pending` and does nothing else. Options: it gets polled again soon anyway / it may simply never be polled again (correct) / the runtime detects the mistake.
6. **"It hangs. For real — timed out on purpose to prove it"** — `fig`: `broken_contract_hangs.rs`, run under a timeout, never returning. Takeaway: "A pending future must arrange for its Waker to be called; skip that, and the executor has no reason left to poll it again."
7. **"The fix: store the Waker, call it from wherever the real work finishes"** — `fig`: `delay_executor.rs`'s `Delay` future, storing `cx.waker().clone()` and waking it from a conduit thread. Takeaway: "A future waiting on real work stores the Waker it was given, and whatever finishes that work calls it — that's the entire handoff."
8. **"A Waker is built from an Arc, using the standard library's own Wake trait"** — `fig`: `Task` implementing `Wake`, `Waker::from(task.clone())`. Takeaway: "The std library's own Wake trait is the ordinary way an executor builds a Waker — wrap the wakeup data in an Arc, and waking means re-enqueueing it."
9. **"Future, Waker, scheduler, poll — run end to end, no hidden thread"** — `fig`: the full loop, the result value landing exactly once. Takeaway: "The whole architecture is future, Waker, scheduler, poll — a real loop, with nothing running the future's work except the executor calling poll."
10. **Recap** — a future does no work until polled, and that's the backpressure; `Pending` is a real promise to arrange a wakeup, broken here on purpose to prove it; a `Waker` built from `Arc` via `Wake` is the ordinary mechanism; the whole loop runs with no hidden thread. Handoff: the next topic shows what the compiler actually builds when `async`/`.await` generates this exact shape automatically.

## Engagement arc

- Hook: step 1.
- Early prediction: step 2 (within the first four).
- Second prediction: step 5.
- Surprising fact: step 6 (a real, timed-out hang, not a described risk).
- Takeaways: steps 4, 6, 7, 8, 9 (five — step 3 deliberately has none, the test-harness rule).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| A future is a value that might not have finished computing, obtained from `async`; a thread can continue doing other work while it waits | `doc.rust-lang.org/std/future/trait.Future.html` (quoted) |
| `poll` never blocks; a pending result means the task was scheduled for a wakeup, not that the caller should retry in a loop | `doc.rust-lang.org/std/future/trait.Future.html` (quoted) |
| Futures are inert — nothing progresses unless something actively polls them | `doc.rust-lang.org/std/future/trait.Future.html` (quoted) |
| `Poll::Pending` requires the function to ensure the current task is scheduled to be woken when progress can be made | `doc.rust-lang.org/std/task/enum.Poll.html` (quoted) |
| A future that breaks the Waker contract (returns `Pending` without arranging a wakeup) hangs the executor for real | `examples/broken_contract_hangs.rs` (executed, times out on purpose) |
| A `Waker` is commonly built by wrapping an executor's wakeup data in an `Arc` and implementing the `Wake` trait on it | `doc.rust-lang.org/std/task/trait.Wake.html` (quoted) |
| A future that stores the `Waker` it is given and has a conduit thread call it when the real work finishes completes correctly through a real executor loop | `examples/delay_executor.rs` (executed, result lands exactly once) |

## Concept ledger

- `introduces`: `future-laziness-backpressure`, `waker-contract` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `send-auto-trait`, `sync-auto-trait`
- `declared`: `threads-and-channels` (the thread/channel vocabulary this topic's executor and conduit thread build on)

## Bridge and handoff

- Bridge: topic 23's own handoff line, reused verbatim: "Every guarantee in this chapter was about memory becoming visible between threads that already exist and are already running. The next question is different in kind: what does it mean for a unit of work to not be running at all yet, and for something else entirely — not a thread, a scheduler — to decide when it starts again?"
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A future that does nothing until polled, and a waker that promises to ask again — that's the whole contract, proven by a loop with no hidden thread in it anywhere. The next question is what the compiler actually builds when it turns ordinary-looking `async` code into exactly this shape."
