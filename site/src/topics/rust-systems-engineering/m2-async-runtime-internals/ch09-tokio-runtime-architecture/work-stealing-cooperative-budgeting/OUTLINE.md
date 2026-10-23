# Outline: Work stealing and cooperative budgeting (`rust.work-stealing-cooperative-budgeting`)

Chapter 9, topic 29 (second of five). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Name Tokio's real scheduling path for a multi-thread runtime: each worker's own local queue, the global injection queue behind it, and work stealing by moving half of a busy sibling worker's local queue — demonstrated directly: 200 tasks spawned from the one worker driving `block_on` end up running across several real threads.
2. State the LIFO slot's purpose (message-passing locality: a task that wakes a sibling is given a fast path ahead of the ordinary queue) and its own limit (disabled after three consecutive uses), from the docs' own words.
3. Explain cooperative budgeting: a task is forced to yield after a bounded per-poll budget of resource operations, demonstrated by measuring a trivial sibling task running well before an always-ready hot loop finishes.
4. Contrast that with `task::unconstrained`, which opts a future out of the budget entirely — measured as the sibling only running once the identical hot loop itself finishes, exactly the starvation risk the docs name directly.

## Changes from the chapter plan

None. Built exactly as `CHAPTER.md` §A.2/§A.3 describe: reuses topic 28's multi-thread runtime shape, adds a task-stealing measurement, a budget-forced-yield measurement, and an `unconstrained` contrast.

## Reel steps (storyboard)

1. **"200 tasks are all spawned from inside the one task that's running block_on. Do they all run on that same one worker thread?"** (predict, hook) — `fig`: a loop of `tokio::spawn` calls inside `block_on`'s own future, next to a 4-worker runtime. Options: yes, they were all queued by the same worker / no — some get redistributed to other workers (correct) / only if `block_on` itself yields.
2. **"No — idle workers steal from a busy one's queue"** — `fig`: one worker's queue strip, half of it sliding into an idle sibling's queue strip. NO takeaway (test-harness rule, first non-radio step after a predict step).
3. **"Measured: 200 tasks, all spawned from one worker, land on three or four real threads"** — `fig`: `tasks_get_stolen`'s real, executed output. Takeaway: "Stealing moves half of a busy worker's queue to an idle sibling — that's the only way tasks spawned from one worker end up running on several real threads."
4. **"A task that wakes a sibling task: does it go to the back of the queue like everything else?"** (predict) — `fig`: task A sending on a channel, waking task B. Options: yes, same queue, same order / no — it gets a special fast-path slot ahead of the queue (correct) / only on the current-thread runtime.
5. **"The LIFO slot: a fast lane for the task that was just woken, for message-passing locality"** — `fig`: the docs' own words, quoted, plus the three-uses-in-a-row disable rule. NO takeaway (reused test-harness pattern; it's a from-step, docs-naming moment, not yet the measured claim).
6. **"A hot loop that's always ready to run, never once blocked on anything real — does it ever let a trivial sibling task run?"** (predict) — `fig`: an unbounded channel that resupplies itself the instant it's drained, looped forever. Options: no, never, it monopolizes the worker / yes, it's still forced to yield periodically (correct) / only if it calls `.await` on something slow.
7. **"Measured: the sibling ran long before the hot loop itself finished"** — `fig`: `budget_forces_yield`'s real, executed timings. Takeaway: "A task is forced to yield after a bounded per-poll budget of resource operations — a trivial sibling got to run while the identical hot loop was still going."
8. **"Wrap that exact same hot loop in task::unconstrained. Does the sibling still get in early?"** (predict) — `fig`: the identical loop, now inside `task::unconstrained(...)`. Options: yes, unconstrained only affects I/O / no — it now has to wait for the whole loop to finish (correct) / it crashes instead.
9. **"Measured: the sibling only ran the moment the unconstrained loop itself finished"** — `fig`: `unconstrained_starves_sibling`'s real, executed timings, landing within milliseconds of each other. Takeaway: "task::unconstrained opts a future out of the budget entirely — exactly the starvation risk Tokio's own docs name directly."
10. **Recap** — work stealing moves half a busy worker's queue to an idle sibling; the LIFO slot fast-paths a just-woken task for message-passing locality; cooperative budgeting forces a hot loop to yield, measured directly; `task::unconstrained` removes that protection and starves its neighbours, also measured directly. Handoff: cooperative budgeting only helps a task willing to cooperate at all — some real work has no point to yield at.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 4.
- Third prediction: step 6.
- Fourth prediction: step 8.
- Surprising fact: step 9 (unconstrained genuinely starves the sibling until the loop itself ends — not just "slower", but exactly simultaneous).
- Takeaways: steps 3, 7, 9 (three — steps 2 and 5 deliberately have none, the test-harness rule).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| Stealing moves half the tasks in one worker's local queue to another local queue when both the stealing worker's local and the global queue are empty | `docs.rs/tokio/runtime` (quoted) |
| 200 tasks, all spawned from the single worker running block_on, run across more than one real OS thread | `examples/runtime-demo/src/tasks_get_stolen.rs` (executed, measured 2-4 distinct threads) |
| A task that wakes another task is placed in the woken worker's lifo slot instead of its queue, for message-passing locality | `docs.rs/tokio/runtime` (quoted) |
| The lifo slot is disabled after three consecutive uses in a row until a non-lifo task is scheduled | `docs.rs/tokio/runtime` (quoted) |
| A task that runs for a long time without yielding can starve other tasks or resources on the same executor | `docs.rs/tokio/task/coop` (quoted) |
| Tokio has explicit yield points in library functions that force tasks to return to the executor periodically | `docs.rs/tokio/task/coop` (quoted) |
| An always-ready hot loop is still forced to yield periodically, letting a trivial sibling task run well before the loop itself finishes | `examples/runtime-demo/src/budget_forces_yield.rs` (executed, measured sibling << loop total) |
| task::unconstrained exposes a service to starvation if the unconstrained future never yields otherwise | `docs.rs/tokio/task/coop` (quoted) |
| The identical hot loop wrapped in task::unconstrained only lets the sibling run once the loop itself finishes | `examples/runtime-demo/src/unconstrained_starves_sibling.rs` (executed, measured sibling ≈ loop total) |

## Concept ledger

- `introduces`: `work-stealing-queues`, `cooperative-budgeting` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `task-multiplexing-on-workers`, `runtime-flavor-decision`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A blocked worker stalls its own queue completely — but even an unblocked one has to decide, task by task, what runs next and where a newly-woken task actually goes. That decision has real, documented mechanics, not just a queue."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Cooperative budgeting only works for a task that is willing to cooperate at all — written so that it has a point to yield at. Some real work, a blocking system call or a long CPU-bound computation, has no such point. What happens to the worker running one of those?"
