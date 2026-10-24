# Outline: I/O and time drivers (`rust.i-o-time-drivers`)

Chapter 9, topic 31 (fourth of five). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Build a small, direct `mio` registration and poll loop from scratch, proving the register-interest → park → readiness-event cycle concretely: a real socket connect delivers a real writable readiness event, and nothing else ever will.
2. Show the other side of the same cycle directly: a socket registered for readiness that never arrives leaves `poll` parked for close to its full timeout, delivering no event at all — this is the real mechanism behind "the worker parks when there's nothing ready," not a diagram.
3. Measure `tokio::time::sleep` waking close to its real deadline on a real runtime — the timer driver's own wake cycle, closing the loop Chapter 8 opened: this is the thing that actually calls `wake()`.
4. Name `io_uring` support as a real, currently unstable, opt-in feature (`tokio_unstable`), from the crate's own words, rather than the default path.

## Changes from the chapter plan

None. `CHAPTER.md` §A.3 explicitly scopes this topic to a minimal, direct `mio`-based loop (no Tokio I/O driver internals exposed) plus a timer measurement — built exactly that way, with `mio` as the one new real dependency this topic needs.

## Reel steps (storyboard)

1. **"Register a real socket's connection with mio, then poll. Does a real readiness event actually arrive once it connects?"** (predict, hook) — `fig`: `poll.registry().register(...)` followed by `poll.poll(&mut events, ...)`. Options: no, mio only reports errors / yes — a real writable event arrives (correct) / only after a fixed delay.
2. **"Measured: a real writable readiness event, naming the exact socket that connected"** — `fig`: `mio_register_then_connect`'s real, executed output. Takeaway: "Register interest, then poll — a real readiness event names the exact socket that became ready, not a guess."
3. **"Register a socket for readiness that will never arrive. What does poll actually do?"** (predict) — `fig`: the identical registration, but nothing is ever written to the socket. Options: it returns immediately with no events / it parks for close to the full timeout, then returns empty (correct) / it panics.
4. **"Measured: poll parked for the full timeout, delivering no event at all"** — `fig`: `mio_poll_times_out_with_nothing_ready`'s real, executed output. Takeaway: "With nothing ready, poll genuinely parks for close to the timeout — this is the real mechanism behind an idle worker, not a diagram."
5. **"tokio::time::sleep: does it actually wake close to its real deadline, or just eventually?"** (predict) — `fig`: `sleep(Duration::from_millis(200)).await`, timed. Options: it wakes immediately, ignoring the duration / it wakes close to the real deadline (correct) / it wakes only on the next readiness event.
6. **"Measured: a 200ms sleep woke right at its deadline — the timer driver's own wake cycle"** — `fig`: `sleep_actually_wakes_at_deadline`'s real, executed output. Takeaway: "The timer driver is the thing that actually calls wake() at the right moment — proven directly, not assumed."
7. **"Is io_uring Tokio's default way of doing I/O now?"** (predict) — `fig`: the crate's own feature-flag list, naming `io-uring`. Options: yes, it replaced mio by default / no — it's a real, currently unstable, opt-in feature (correct) / it only exists in a separate crate.
8. **"The crate's own words: io-uring requires tokio_unstable, opted in explicitly"** — `fig`: the exact feature-flag text, quoted. NO takeaway (a naming step, not a new measured claim — test-harness rule).
9. **"This closes the loop the earlier chapter opened: register, park, event, wake, poll again — for real"** — `fig`: the full cycle, each step now backed by one of this topic's own measurements. NO takeaway (a connecting step restating already-measured claims, not a new one — test-harness rule).
10. **Recap** — registering interest and polling delivers a real, named readiness event; with nothing ready, poll genuinely parks for the timeout; the timer driver wakes a sleep close to its real deadline, the thing Chapter 8 left unnamed; io_uring is real but still unstable and opt-in. Handoff: every mechanism in this chapter is real, and every one of them can also be violated.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 4 (poll genuinely blocks for the real timeout, not a described abstraction).
- Takeaways: steps 2, 4, 6 (three — steps 8 and 9 deliberately have none, the test-harness rule).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| Poll monitors registered event sources, becoming ready when an operation like read or write can be performed immediately | `docs.rs/mio::Poll` (quoted) |
| An event source must be registered with Poll via its Registry, supplying a Token that is returned with the readiness event | `docs.rs/mio::Poll` (quoted) |
| Registering a real socket's connection and polling delivers a real writable readiness event once the connection completes | `examples/runtime-demo/src/mio_register_then_connect.rs` (executed, measured true) |
| Poll::poll may return readiness events even if the associated event source is not actually ready (spurious events) | `docs.rs/mio::Poll` (quoted) |
| A socket registered for readiness that never arrives leaves poll parked for close to the full timeout, delivering no event | `examples/runtime-demo/src/mio_poll_times_out_with_nothing_ready.rs` (executed, measured ~300ms, zero events) |
| Once a readiness event is received, the corresponding operation must be performed repeatedly until it returns WouldBlock | `docs.rs/mio::Poll` (quoted) |
| A 200ms tokio::time::sleep wakes close to its real deadline, not immediately and not long after | `examples/runtime-demo/src/sleep_actually_wakes_at_deadline.rs` (executed, measured ~201ms) |
| io-uring is an unstable, Linux-only feature that requires the tokio_unstable flag to be passed to rustc | `docs.rs/tokio` crate root (quoted) |

## Concept ledger

- `introduces`: `io-driver-readiness-cycle` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `waker-contract`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Every task this chapter has scheduled so far was already ready to run, or was told directly to stop being ready. The other half of the picture is how a task that is waiting on something external — a socket, a timer — ever gets told it's ready again at all."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Every mechanism in this chapter is real, and every one of them can also be violated — a task that never yields, a channel with no bound, a cancellation path nobody defined. The question left is how any of that becomes visible before it becomes an incident."
