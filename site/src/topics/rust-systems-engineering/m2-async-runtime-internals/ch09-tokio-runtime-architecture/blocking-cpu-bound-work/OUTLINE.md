# Outline: Blocking and CPU-bound work (`rust.blocking-cpu-bound-work`)

Chapter 9, topic 30 (third of five). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Reconfirm topic 28's baseline (a real, direct blocking call on the only worker stalls a trivial sibling for the call's full length), then fix it directly: move the identical call to `spawn_blocking`'s dedicated pool, measuring that the one async worker stays free.
2. Explain `block_in_place`'s different promise: it informs the executor that the *current* task is about to block, letting the executor hand an independent sibling task off to a new worker thread before that happens — measured directly, and contrasted with its own documented panic on a current-thread runtime, which has no other worker to hand anything off to.
3. Name `rayon` and a dedicated runtime as the real alternative for CPU-heavy (not I/O-blocking) work, and thread-per-core, shared-nothing runtimes (`glommio`, `monoio`, `compio`) as a different scheduler design entirely, not a defect in Tokio's.

## Changes from the chapter plan

None. Built exactly as `CHAPTER.md` §A.2/§A.3 describe: reuses topic 28's measurement technique for a fresh, self-contained baseline, then demonstrates both of the chapter's named fixes and their real difference.

## Reel steps (storyboard)

1. **"A real, 300ms blocking call, made directly inside a spawned task on the only worker. Does a trivial sibling task notice?"** (predict, hook) — `fig`: `std::thread::sleep` called directly inside `tokio::spawn`. Options: no, the runtime finds it another thread / yes — the sibling waits the full 300ms (correct) / only if the sibling also blocks.
2. **"Measured: the sibling waited the full 300ms, same baseline as the last topic"** — `fig`: `blocking_call_stalls_worker`'s real, executed output. NO takeaway (reconfirming a known baseline, not a new claim — test-harness rule for the first non-radio step after a predict).
3. **"Move that exact same call into spawn_blocking. Does the one worker still stall?"** (predict) — `fig`: the identical call, now wrapped in `task::spawn_blocking`. Options: yes, spawn_blocking still uses the worker pool / no — it runs on its own, separate pool (correct) / only with more than one worker.
4. **"Measured: the sibling ran almost instantly — spawn_blocking's own pool never touched the worker"** — `fig`: `spawn_blocking_isolates_it`'s real, executed output. Takeaway: "spawn_blocking moves a genuinely blocking call onto its own, separate pool — the one async worker never notices it at all."
5. **"block_in_place makes a different promise: can an independent sibling task still run while it blocks?"** (predict) — `fig`: `task::block_in_place` wrapping the identical call, inside its own spawned task. Options: no, it blocks everything on that worker / yes — the executor hands the sibling to a new worker thread first (correct) / only inside spawn_blocking.
6. **"Measured: the sibling ran almost instantly — handed off to a new worker thread before the call even started"** — `fig`: `block_in_place_hands_off`'s real, executed output. Takeaway: "block_in_place tells the executor to hand an independent sibling task off to a new worker thread before it blocks this one."
7. **"Can block_in_place be called on a current-thread runtime, the same way it works on a multi-thread one?"** (predict) — `fig`: the identical call to `task::block_in_place`, now on `Builder::new_current_thread()`. Options: yes, it just blocks that one thread / no — it panics outright (correct) / it silently does nothing.
8. **"rustc's own panic: there's no other worker thread to hand anything off to"** — `fig`: the real panic message, naming the exact reason. Takeaway: "block_in_place panics on a current-thread runtime — its whole promise depends on a sibling worker thread that doesn't exist there."
9. **"For CPU-heavy work with no I/O at all, spawn_blocking's pool isn't the only answer"** — `fig`: `rayon`'s own name, next to a dedicated-runtime split, next to `glommio`/`monoio`/`compio`'s thread-per-core design. NO takeaway (a naming step, not a new measured claim — test-harness rule).
10. **Recap** — a genuinely blocking call stalls a worker exactly like topic 28 measured; `spawn_blocking` moves it off the worker pool entirely; `block_in_place` makes a narrower, different promise, and panics where that promise can't be kept; CPU-heavy work has its own named alternatives beyond both. Handoff: every task scheduled so far was already ready to run, or told directly to stop. The other half of the picture is how a task waiting on something external ever gets told it's ready again.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 8 (a real, named panic, not just "this won't work").
- Takeaways: steps 4, 6, 8 (three — steps 2 and 9 deliberately have none, the test-harness rule).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| A real, direct blocking call on the only worker stalls a trivial sibling for the call's full length | `examples/runtime-demo/src/blocking_call_stalls_worker.rs` (executed, measured ≈300ms) |
| spawn_blocking runs the provided closure on a thread dedicated to blocking operations | `docs.rs/tokio/task::spawn_blocking` (quoted) |
| Tokio spawns more blocking threads on demand up to a configured limit, then queues further requests | `docs.rs/tokio/task::spawn_blocking` (quoted) |
| For many CPU-bound computations, a semaphore or specialized executor such as rayon should be used instead of spawn_blocking alone | `docs.rs/tokio/task::spawn_blocking` (quoted) |
| The identical blocking call moved to spawn_blocking leaves the one async worker free, measured directly | `examples/runtime-demo/src/spawn_blocking_isolates_it.rs` (executed, measured <100ms) |
| block_in_place informs the executor that the current task is about to block, so it can hand other tasks to a new worker thread first | `docs.rs/tokio/task::block_in_place` (quoted) |
| block_in_place hands an independent sibling task off to a new worker thread before the blocking call starts, measured directly | `examples/runtime-demo/src/block_in_place_hands_off.rs` (executed, measured <100ms) |
| block_in_place cannot be used within a current_thread runtime, because there are no other worker threads to hand off to | `docs.rs/tokio/task::block_in_place` (quoted) |
| block_in_place panics when called from a current_thread runtime | `examples/runtime-demo/src/block_in_place_panics_on_current_thread.rs` (executed, real panic, exact message) |

## Concept ledger

- `introduces`: `blocking-pool-isolation` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `task-multiplexing-on-workers`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Cooperative budgeting only works for a task that is willing to cooperate at all — written so that it has a point to yield at. Some real work, a blocking system call or a long CPU-bound computation, has no such point. What happens to the worker running one of those?"
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Every task this chapter has scheduled so far was already ready to run, or was told directly to stop being ready. The other half of the picture is how a task that is waiting on something external — a socket, a timer — ever gets told it's ready again at all."
