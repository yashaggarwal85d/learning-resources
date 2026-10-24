---
title: "Work stealing and cooperative budgeting"
---

## Outcomes

- Name Tokio's real scheduling path for a multi-thread runtime: each worker's local queue, the global injection queue behind it, and work stealing by moving half of a busy sibling's local queue — demonstrated directly, not merely diagrammed.
- State the LIFO slot's purpose and its own limit, from the docs' own words: a fast path for a task that just woke a sibling, disabled after three consecutive uses.
- Explain cooperative budgeting and measure it directly: an always-ready hot loop is still forced to yield, letting a trivial sibling task run well before the loop itself finishes.
- Contrast that with `task::unconstrained`, measured as the sibling only running once the identical hot loop itself finishes — the exact starvation risk the docs name directly.

## Internals

The 200-task measurement in this topic is built so that stealing is the *only* possible explanation for its result: every one of those tasks is spawned by code running inside the single worker that is driving `block_on`, so a task landing on any other real thread had to be redistributed there, not scheduled there directly. The docs describe stealing as moving half a busy worker's local queue to an idle sibling's, a deliberate choice that trades frequent, cheap steals for fewer, larger ones, amortizing the cross-thread synchronization the operation requires. The LIFO slot is a separate, narrower optimization for a different problem entirely: when one task wakes another (the message-passing pattern this chapter's narration calls "a fast lane for a task that just woke a neighbour"), the woken task is given a fast path ahead of the ordinary queue, to run while its data is still warm in cache — and that fast path is deliberately capped at three consecutive uses, so a long chain of self-waking tasks cannot monopolize a worker through it alone.

Cooperative budgeting is not a general preemption mechanism — Rust's async model has no way to forcibly pause arbitrary code mid-poll. It only works because specific library functions (channel receives among them) are instrumented to check a per-task budget and manually return `Poll::Pending` once it is exhausted, even when real data is sitting there ready. That is exactly what this topic measures: an always-ready channel receive, looped forever, is still interrupted mid-loop well before it would otherwise finish, letting a trivial sibling task run in the gap. `task::unconstrained` does not change what the wrapped future does — it only removes those budget checks from the calls inside it — and the measured result is correspondingly stark: the sibling's own wait lands within milliseconds of the loop's own total runtime, because it was never interleaved at all, only queued behind a task that never voluntarily returned control.

## In production

The chapter's one hard rule from topic 28 — a blocked worker runs nothing else, no exceptions — only applies to a task with no yield point at all, like a real blocking syscall. Cooperative budgeting is the chapter's second, narrower rule: a task that *is* written to make instrumented library calls, but does so in a loop tight enough to never naturally pause, is still protected against on its own, without the author doing anything. `task::unconstrained` exists for a real, narrow use case — typically squeezing out the last bit of latency from a future known to yield on its own frequently enough that the budget checks are pure overhead — and its own documentation names the tradeoff directly rather than hiding it: using it exposes the service to starvation if that assumption turns out to be wrong.

## The frontier

This topic deliberately limits itself to a task willing to cooperate at all — one making instrumented library calls, even in an unbroken loop. The chapter's next failure mode is a task that genuinely cannot cooperate: a real, synchronous blocking call or a long CPU-bound computation with no yield point anywhere in it, which no budget check can ever reach because no instrumented call is ever made.

## Where this goes next

Cooperative budgeting only works for a task that is willing to cooperate at all — written so that it has a point to yield at. Some real work, a blocking system call or a long CPU-bound computation, has no such point. What happens to the worker running one of those?
