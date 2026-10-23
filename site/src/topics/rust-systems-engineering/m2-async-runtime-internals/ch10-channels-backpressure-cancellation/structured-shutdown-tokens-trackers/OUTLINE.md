# Outline: Structured shutdown with tokens and trackers (`rust.structured-shutdown-tokens-trackers`)

Chapter 10, topic 35 (third and last of three). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Measure a `CancellationToken` signal genuinely stopping new work: once cancelled, every new submission is rejected outright, while anything already accepted beforehand is unaffected.
2. Measure a `TaskTracker`'s `wait()` genuinely waiting for completion, not merely for a signal: it does not return until every tracked job has actually finished.
3. Measure a real shutdown deadline genuinely enforced: waiting on a straggler job past a stated deadline times out close to that deadline, rather than hanging indefinitely.
4. Name `SIGTERM` and the Kubernetes termination grace period as the real external deadline this sequence exists to meet, and assemble the full stop-accepting → signal → drain-or-cancel → close → wait sequence from this chapter's own three topics.

## Changes from the chapter plan

None. `CHAPTER.md` §A.3 scopes this topic to reusing topic 33's worker-pool shape and wrapping it in a real `CancellationToken` + `TaskTracker` shutdown sequence — built exactly that way.

## Reel steps (storyboard)

1. **"A worker pool signals shutdown with a CancellationToken. Does a job submitted right after that signal still get accepted?"** (predict, hook) — `fig`: `token.cancel();` followed by a submission attempt. Options: yes, it's queued and runs eventually / no, it's rejected outright, immediately (correct) / it depends on whether any workers are still idle.
2. **"Measured: 3 jobs accepted before the signal, then every single submission after it rejected outright"** — `fig`: `shutdown_rejects_new_after_signal`'s real, executed output. NO takeaway (this is the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64 — moved to a later step instead).
3. **"A TaskTracker's wait() is called right after the tracker is closed. Does it return as soon as the tracker is closed, or does it wait for the jobs themselves?"** (predict) — `fig`: `tracker.close(); tracker.wait().await;` against 8 in-flight jobs. Options: it returns immediately once closed / it waits until every tracked job has actually finished (correct) / it waits for exactly one job, the first to finish.
4. **"Measured: wait() didn't return until all 8 accepted jobs had genuinely finished running"** — `fig`: `tracker_waits_for_every_accepted_job`'s real, executed output. Takeaway: "A TaskTracker's wait() returns only once every tracked job has actually finished, not merely been told to stop."
5. **"Wrap that same wait in a real deadline, with one job that deliberately runs far longer than it. Does the shutdown hang, or does it stop on time?"** (predict) — `fig`: `timeout(deadline, tracker.wait())` against a 2-second straggler and a 300ms deadline. Options: it hangs until the straggler finishes, deadline or not / it stops close to the deadline, straggler or not (correct) / the deadline only applies to new jobs, not ones already running.
6. **"Measured: the wait genuinely stopped right at its 300ms deadline — the straggler, still unfinished, was not waited for any longer"** — `fig`: `shutdown_meets_its_deadline`'s real, executed output. Takeaway: "A shutdown's own wait respects a real deadline — it stops on time, even if a straggler hasn't finished."
7. **"Which real-world signal is this entire sequence actually built to answer, in time?"** (predict) — `fig`: `SIGTERM`, with a Kubernetes termination grace period named beside it. Options: an unhandled crash, caught after the fact / a deliberate shutdown request, with a real, limited amount of time to respond (correct) / only a manual, interactive shutdown command.
8. **"The real sequence, assembled from this chapter's own three topics: stop accepting, signal, drain or cancel, close, wait — against a deadline that mirrors a real Kubernetes grace period"** — `fig`: the shutdown-sequence diagram, all five stages lighting up in order. NO takeaway (a connecting step restating already-measured claims, not a new one — test-harness rule).
9. **"Every stage of that sequence just used a mechanism this chapter already proved"** — `fig`: the five stages, each labelled with the topic that proved it (33 for bounded channels and backpressure, 34 for cancellation and cancel safety, this topic for the token, tracker, and deadline). Takeaway: "Graceful shutdown isn't a new mechanism — it's three already-proven ones, assembled into one explicit, ordered sequence."
10. **Recap** — a cancellation signal genuinely stops new work outright; a task tracker's wait genuinely waits for real completion, not a signal; a stated deadline is genuinely enforced, even against a straggler. Handoff: every shutdown sequence in this chapter has been a Rust-level story — underneath every task sits a real kernel handle whose ownership rules this chapter has been quietly assuming the whole time.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 6 (the wait genuinely abandons a straggler at the deadline rather than waiting for it to finish, which is the entire point of having a deadline at all).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, the test-harness rule).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| A CancellationToken is a token which can be used to signal a cancellation request to one or more tasks | `docs.rs/tokio_util::sync::CancellationToken` (quoted) |
| Cancellation can be requested through the CancellationToken::cancel method | `docs.rs/tokio_util::sync::CancellationToken` (quoted) |
| Once a CancellationToken is cancelled, every subsequent job submission checked against it is rejected outright, while submissions accepted before cancellation are unaffected | `examples/runtime-demo/src/shutdown_rejects_new_after_signal.rs` (executed, measured) |
| A TaskTracker is a task tracker used for waiting until tasks exit | `docs.rs/tokio_util::task::TaskTracker` (quoted) |
| The TaskTracker must be closed, and must be empty (all tracked tasks must have exited), before wait returns | `docs.rs/tokio_util::task::TaskTracker` (quoted) |
| When a call to wait returns, it is guaranteed that all tracked tasks have exited and that the destructor of the future has finished running | `docs.rs/tokio_util::task::TaskTracker` (quoted) |
| wait() on a real TaskTracker did not return until all 8 tracked jobs had genuinely finished, measured directly | `examples/runtime-demo/src/tracker_waits_for_every_accepted_job.rs` (executed, measured) |
| CancellationToken and TaskTracker are usually used together to implement graceful shutdown: the token signals tasks to shut down, and the tracker waits for them to finish | `docs.rs/tokio_util::task::TaskTracker` (quoted) |
| Wrapping a TaskTracker's wait in a real timeout genuinely stops close to the stated deadline even when a straggler job has not finished, rather than hanging indefinitely | `examples/runtime-demo/src/shutdown_meets_its_deadline.rs` (executed, measured) |
| tokio::signal::unix provides Unix-specific types for signal handling, including a listener for receiving a particular kind of OS signal | `docs.rs/tokio::signal::unix` (quoted) |

## Concept ledger

- `introduces`: `structured-shutdown-sequence` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `bounded-channel-backpressure`, `cancellation-by-drop`, `cancel-safety`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Backpressure and cancellation are both real, local mechanisms — true of one channel, one future, one task at a time. Turning them into a shutdown a whole service can trust means making the sequence explicit, not assuming every task will notice on its own."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Every shutdown sequence in this chapter has been a Rust-level story — tasks, channels, tokens. Underneath every one of those tasks sits a real kernel handle — a file descriptor, a process, a signal — whose ownership rules this chapter has been quietly assuming the whole time."
