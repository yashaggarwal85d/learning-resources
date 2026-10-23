# Outline: Tasks multiplexed on worker threads (`rust.tasks-multiplexed-on-worker`)

Chapter 9, topic 28 (first of five). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. State precisely why a task is not a thread: it is a lightweight state machine multiplexed onto a small, fixed pool of real worker threads, and a task that blocks its worker without yielding stalls every other task scheduled there — demonstrated with a real, measured delay.
2. Choose between the current-thread and multi-thread runtimes as a workload-shape decision: a multi-thread runtime spawns its own fixed worker pool and is always running; a current-thread runtime has none and only runs while `Runtime::block_on` drives it.
3. Explain why `tokio::spawn` requires its future to be `Send` (a multi-threaded runtime may move a task between workers), and use `LocalSet` with `spawn_local` to run the exact `!Send` future `tokio::spawn` refuses, on the one thread that calls it.

## Reel steps (storyboard)

1. **"Does spawning a hundred tasks on two worker threads start a hundred real OS threads?"** (predict, hook) — `fig`: `tokio::spawn` called in a loop, next to a runtime built with two worker threads. Options: yes, one real thread per task / no — all hundred are multiplexed onto the same two real threads (correct) / only if each task awaits something.
2. **"No — a task is a lightweight state machine, not a thread"** — `fig`: a fixed row of two worker boxes, a hundred task dots flowing through them. NO takeaway (first non-radio step after a predict step).
3. **"If one worker is fully occupied by a call that never yields, what happens to a trivial task that also needs it?"** (predict) — `fig`: a single-worker runtime, a task doing a real `std::thread::sleep`, a second, instant task queued behind it. Options: the runtime finds it a thread of its own / it waits until the busy worker is free (correct) / it runs on the calling thread instead.
4. **"Measured: a trivial task waited the full length of the blocking call"** — `fig`: `blocking_stalls_worker`'s real, measured delay. Takeaway: "A worker fully occupied by a non-yielding call stalls every other task that also needs it — measured here, not merely described."
5. **"Current-thread or multi-thread: is this a style choice?"** (predict) — `fig`: `Builder::new_current_thread()` next to `Builder::new_multi_thread()`. Options: yes, either works for any program / no — it's a workload-shape decision with a real consequence (correct) / only the multi-thread runtime actually runs.
6. **"A multi-thread runtime is always running; a current-thread one only runs while block_on drives it"** — `fig`: the docs' own words, quoted. Takeaway: "A multi-thread runtime spawns its own fixed worker pool and is always running; a current-thread runtime has none, and runs only while block_on drives it."
7. **"Can a value that isn't safe to send between threads be spawned as a task?"** (predict) — `fig`: `Rc::new(...)` held across an `.await` inside `tokio::spawn`. Options: yes, spawn works for any future / no — spawn requires the future to be Send (correct) / only on the current-thread runtime.
8. **"rustc's own diagnostic: tokio::spawn refuses it outright"** — `fig`: the real compile error, naming the exact value. Takeaway: "tokio::spawn requires its future to be Send, because a multi-threaded runtime may move a task to a different worker — an Rc held across an await makes that impossible to promise."
9. **"LocalSet runs that identical future for real, on the one thread that calls it"** — `fig`: `localset_runs_not_send`'s real, executed output. Takeaway: "LocalSet and spawn_local run the exact !Send future tokio::spawn refuses, by guaranteeing it only ever runs on the thread that calls it."
10. **Recap** — a task is a lightweight state machine multiplexed onto a small, fixed worker pool, not mapped 1:1 onto real threads; a worker fully occupied by a non-yielding call stalls everything else scheduled there, measured directly; current-thread versus multi-thread is a workload-shape decision with a real consequence; and LocalSet is the real, working answer for a !Send future tokio::spawn must refuse. Handoff: a blocked worker stalls its own queue completely, but even an unblocked one has to decide, task by task, what runs next and where a newly-woken task actually goes.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5 — kept as a genuine prediction since "it's just a style choice" is the easiest wrong intuition about runtime flavors.
- Fourth prediction: step 7 — the chapter's recurring !Send-across-threads claim, tested again in a new, scheduling-specific context.
- Surprising fact: step 4 (a real, measured stall, not a described risk).
- Takeaways: steps 4, 6, 8, 9 (four — step 2 deliberately has none, the test-harness rule).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| A multi-thread runtime has a fixed number of worker threads, all created on startup | `docs.rs/tokio/runtime` (quoted) |
| Most applications should use the multi-thread scheduler, except in some niche use-cases, such as when running only a single thread is required | `docs.rs/tokio/runtime` (quoted) |
| A trivial task queued behind a single, non-yielding blocking call on the only worker thread waits for the full length of that call before it gets to run | `examples/runtime-demo/src/blocking_stalls_worker.rs` (executed, measured ≈300ms wait) |
| The current-thread scheduler provides a single-threaded future executor; all tasks are created and executed on the current thread | `docs.rs/tokio/runtime` (quoted) |
| In some cases it is necessary to run futures that do not implement Send; a local task set may be used to schedule one or more !Send futures to run together on the same thread | `docs.rs/tokio/task/LocalSet` (quoted) |
| To spawn !Send futures, a local task set schedules them on the thread calling Runtime::block_on, using task::spawn_local | `docs.rs/tokio/task/LocalSet` (quoted) |
| tokio::spawn requires its future to be Send; a future holding an Rc across an await point fails to compile with the exact "cannot be sent between threads safely" diagnostic | `examples/runtime-demo/src/not_send_rejected_by_spawn.rs` (executed, fails to compile) |
| The identical !Send shape of future runs for real through spawn_local on a LocalSet, producing the Rc-held value correctly | `examples/runtime-demo/src/localset_runs_not_send.rs` (executed) |

## Concept ledger

- `introduces`: `task-multiplexing-on-workers`, `runtime-flavor-decision` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `send-auto-trait`, `not-send-future-propagation`
- `declared`: []

## Bridge and handoff

- Bridge: topic 27's own handoff line, reused verbatim: "Every piece of this chapter — the poll loop, the state machine, pinning, even where the language still falls short — was deliberately runtime-agnostic. The next question is what a real, production, multi-threaded scheduler actually does with all of it: how tasks get multiplexed onto worker threads, and what happens when one of them blocks."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A blocked worker stalls its own queue completely — but even an unblocked one has to decide, task by task, what runs next and where a newly-woken task actually goes. That decision has real, documented mechanics, not just a queue."
