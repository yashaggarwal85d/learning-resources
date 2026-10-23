---
title: "Structured shutdown with tokens and trackers"
---

## Outcomes

- Measure a `CancellationToken` signal genuinely stopping new work: once cancelled, every new submission is rejected outright, while anything already accepted beforehand is unaffected.
- Measure a `TaskTracker`'s `wait()` genuinely waiting for completion, not merely for a signal: it does not return until every tracked job has actually finished.
- Measure a real shutdown deadline genuinely enforced: waiting on a straggler job past a stated deadline times out close to that deadline, rather than hanging indefinitely.
- Name `SIGTERM` and the Kubernetes termination grace period as the real external deadline this sequence exists to meet, and assemble the full stop-accepting → signal → drain-or-cancel → close → wait sequence from this chapter's own three topics.

## Internals

A `CancellationToken`'s check happens at the exact call site of the submission, not at some later poll — which is why the dividing line between accepted and rejected jobs is drawn at the precise moment `cancel()` runs, rather than fuzzily around it. A `TaskTracker`'s `close()` is deliberately a separate, one-way step from `wait()`: closing only stops new work from being tracked, and says nothing about the work already inside, which is exactly why `wait()` still has real waiting left to do after `close()` returns. `wait()` returning only once every tracked task has both exited and finished dropping its own future is a stronger guarantee than merely finishing its last line of code — it's exactly what lets a caller treat `wait()` returning as proof that every task's cleanup, not just its work, is done.

## In production

Wrapping the tracker's own wait in a timeout doesn't change what the tracker promises; it changes what the caller is willing to promise back, which is the real reason a deadline belongs at the call site of `wait()` and not inside the tracker itself. The straggler job that outlives the deadline isn't cancelled by the timeout — it's simply no longer waited for, a direct consequence of this chapter's own earlier finding that dropping a future is the one real cancellation mechanism, and a timeout is just another place that drop happens. A real deployment's termination signal and its grace period aren't a separate concern layered on top of this sequence; they're the exact reason the sequence has a deadline at all, since an orchestrator that gets no response within its own grace period simply kills the process outright, straggler or not.

## The frontier

The five-stage sequence — stop accepting, signal, drain or cancel, close, wait — is an ordering claim as much as a list: stopping acceptance before signalling avoids a race where a job slips in during the signal itself, and closing before waiting is what makes the wait's own completion guarantee meaningful rather than open-ended. Nothing in this topic's own code is a new primitive — every stage reuses exactly the token, the channel, and the cancel-safety distinctions this chapter already measured directly in its first two topics, which is the whole argument that graceful shutdown is composition, not a new mechanism. This closes the loop Chapter 9 opened and left unproven: "bound every channel" and "define cancellation semantics explicitly" were both named as operating rules there, and this chapter has now measured, directly, exactly what each one costs and buys when it's actually followed.

## Where this goes next

Every shutdown sequence in this chapter has been a Rust-level story — tasks, channels, tokens. Underneath every one of those tasks sits a real kernel handle — a file descriptor, a process, a signal — whose ownership rules this chapter has been quietly assuming the whole time.
