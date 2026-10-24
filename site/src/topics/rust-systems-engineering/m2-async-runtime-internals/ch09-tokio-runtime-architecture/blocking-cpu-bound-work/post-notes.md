---
title: "Blocking and CPU-bound work"
---

## Outcomes

- Reconfirm topic 28's baseline (a real, direct blocking call on the only worker stalls a trivial sibling for the call's full length), then fix it: move the identical call to `spawn_blocking`'s own pool, measuring that the one worker stays free.
- Explain `block_in_place`'s different promise — it blocks the calling task's own worker, but hands an independent sibling task off to a new worker thread first — measured directly, and contrasted with its documented panic on a current-thread runtime.
- Name `rayon` and a dedicated runtime as the real alternative for CPU-heavy work, and thread-per-core, shared-nothing runtimes (`glommio`, `monoio`, `compio`) as a different scheduler design entirely.

## Internals

`spawn_blocking` and `block_in_place` solve the same underlying problem — a task with no yield point at all — with two genuinely different mechanisms, and this topic's measurements are built to make that difference impossible to confuse. `spawn_blocking` moves the blocking call itself onto a separate, dynamically-sized pool of real threads; the one async worker never touches it at all, which is why the measured sibling wait drops to roughly zero. `block_in_place` does something structurally different: the blocking call still runs on the same worker thread the calling task was already on, but the executor is told in advance, so it can hand that worker's *other*, independent tasks to a different worker before the call starts. The sibling in this topic's `block_in_place` measurement is unaffected not because the call moved, but because everything else was moved away from it first. The docs name a real sharp edge here that the two mechanisms do not share: any other code running concurrently in the *same* task as a `block_in_place` call — behind a `join!`, for example — is suspended for the whole call, which is exactly why the documentation itself recommends `spawn_blocking` instead whenever that matters. `block_in_place`'s panic on a current-thread runtime is not an arbitrary restriction: its one mechanism depends on handing tasks to a different worker thread, and a current-thread runtime has none to hand anything to, so the operation is simply impossible rather than merely unwise.

## In production

`spawn_blocking`'s pool is sized generously by default because it is used constantly for ordinary blocking I/O that has no async equivalent — file access, DNS lookups through some resolvers, certain FFI calls. That generosity is itself a trap for genuinely CPU-bound work: the pool's size was tuned for I/O-shaped blocking, not for saturating every core with computation, which is exactly why the documentation recommends a semaphore or a specialized executor like `rayon` once the work is CPU-bound rather than I/O-bound. Thread-per-core, shared-nothing runtimes are named here as a real, different point in the design space, used by systems like `glommio`, `monoio`, and `compio` — not a more aggressive version of anything Tokio does, but a deliberate trade of topic 29's cross-core work stealing entirely away for strict per-core isolation, which suits some workloads (certain storage engines, certain high-throughput proxies) better than Tokio's own model.

## The frontier

Every task this chapter has scheduled so far — multiplexed, stolen, budgeted, or moved off the pool — was either already ready to run, or was told directly that it needed to stop being ready for a while. None of them were ever genuinely waiting on something external that hadn't happened yet.

## Where this goes next

Every task this chapter has scheduled so far was already ready to run, or was told directly to stop being ready. The other half of the picture is how a task that is waiting on something external — a socket, a timer — ever gets told it's ready again at all.
