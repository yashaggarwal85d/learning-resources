# Outline: Failure injection and linearizability checking (`rust.failure-injection-linearizability-checking`)

Chapter 25, topic 67 (second and last of this chapter). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build directly on topic 66's own toy cluster: inject two real, independent failures together (a delayed acknowledgement and a duplicated message) into a tiny replicated register.
2. Record the resulting real history of reads and writes, and build a real linearizability checker over it, by brute-force enumeration over every candidate total order.
3. Measure that the history gathered under both injected failures genuinely fails the linearizability check.
4. Measure that fixing only the delayed-ack staleness makes the identical history genuinely linearizable, even with the duplicated-message failure still present, and that the checker names the real, delayed-ack violation directly rather than the harmless duplicated-message read.
5. Measure that a read genuinely concurrent with a write is still genuinely linearizable, and that the checker's own brute-force count of real-time-respecting total orders matches the real order structure of each history exactly.
6. State, from Jepsen's own documentation, the real definition of linearizability and the real generator/nemesis/checker methodology this topic's own code mirrors.

## Changes from the chapter plan

None. All claims are measured directly against a real toy replicated register and a real, brute-force linearizability checker; nothing here needs root access, real network I/O, or real multiple machines.

## Reel steps (storyboard)

1. **"Two real failures are injected together into a small replicated register: a delayed acknowledgement, and a duplicated message. A read happens after both. Does the resulting recorded history, checked mechanically, turn out consistent with any honest real-time order at all?"** (predict, hook) — `fig`: the register, two failures, a read. Options: yes, genuinely / no, it genuinely is not (correct) / only if the duplicated message is the one that matters.
2. **"Measured: the checker scans the real recorded history and finds it genuinely is not linearizable"** — `fig`: the real, measured result. NO takeaway (phone swipe test "from" step; the point is stated in the body instead).
3. **"Of the two real failures injected together, only one actually shows up as a violation in the recorded history. Does the checker name the delayed-acknowledgement read, or the duplicated-message read, as the real problem?"** (predict) — `fig`: two failures, one checker verdict. Options: the duplicated-message read / the delayed-acknowledgement read (correct) / both equally.
4. **"Measured: the checker names the delayed-acknowledgement read directly; the duplicated-message read, being idempotent, caused no actual violation"** — `fig`: the real, measured attribution. Takeaway about not every injected failure leaving a visible trace.
5. **"Now the identical two failures run again, except the lagging replica catches up before anyone reads from it. Is the resulting history now linearizable?"** (predict) — `fig`: the same two failures, one read moved later. Options: no, the duplicated message still breaks it / yes, genuinely (correct) / only if the duplicated message is also fixed.
6. **"Measured: genuinely linearizable now, even with the duplicated-message failure still present"** — `fig`: the real, measured result. Takeaway: only a failure an actual read observes can ever show up in a history at all.
7. **"Now a read genuinely overlaps a write in real time: neither one finishes before the other starts. How many of the real total orders the checker brute-force-enumerates actually respect that real-time precedence?"** (predict) — `fig`: one concurrent pair. Options: only one / exactly two (correct) / every possible order.
8. **"Measured: exactly two, matching the real order structure of a single concurrent pair, found by the checker's own brute-force enumeration, not assumed"** — `fig`: the real, measured count. Takeaway about a concurrent pair's own real linear-extension count.
9. **"Jepsen's own real methodology for this exact kind of question: a generator produces operations, a nemesis injects real faults, and a checker decides correctness. Does this topic's own code genuinely mirror that structure?"** — `fig`: Jepsen's own words, shown directly. NO new predict (continues directly from the measured work). NO takeaway (a connecting step naming the real methodology this topic's own code mirrors).
10. **Recap** — a recorded history gathered under several real, independent failures can be mechanically checked for linearizability; only the failures an actual read observes ever show up as a violation, and the checker finds the real answer by genuine enumeration, never by assumption.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 4 (not every injected failure leaves a trace; the checker finds the real one mechanically) and step 9 (this topic's own code genuinely mirrors Jepsen's own real methodology).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, the reel's own "from" step for the phone swipe test; step 9 deliberately has none too, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| linearizability implies every operation appears to take place atomically, in some order, consistent with the real-time ordering of those operations | Jepsen Docs: Linearizability (quoted) |
| if operation A completes before operation B begins, then B should logically take effect after A | Jepsen Docs: Linearizability (quoted) |
| a linearizable history H is one in which there is an equivalent sequential history S, and the partial real-time order of operations in H is consistent with the total order of S | Jepsen Docs: Linearizability (quoted) |
| a generator generates new operations, processes apply them, and the start/end of each operation is recorded in a history | Jepsen README (quoted) |
| a special nemesis process introduces faults into the system | Jepsen README (quoted) |
| Jepsen uses a checker to analyze the test's history for correctness | Jepsen README (quoted) |
| a history gathered under two real, independent injected failures together (a delayed acknowledgement and a duplicated message) is genuinely not linearizable | `examples/runtime-demo/src/failure_injection_linearizability_checker.rs` (executed, measured) |
| fixing only the delayed-ack staleness makes the identical history genuinely linearizable, even with the duplicated-message failure still present | `examples/runtime-demo/src/failure_injection_linearizability_checker.rs` (executed, measured) |
| a genuinely concurrent read/write pair is still genuinely linearizable, and the checker's brute-force count of real-time-respecting total orders matches the real order structure exactly | `examples/runtime-demo/src/failure_injection_linearizability_checker.rs` (executed, measured) |
| the checker names the real, delayed-ack violation directly, not the idempotent duplicated-message read | `examples/runtime-demo/src/failure_injection_linearizability_checker.rs` (executed, measured) |

## Concept ledger

- `introduces`: `linearizability-checking-over-injected-failure` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `acknowledgement-point-durability-tradeoff` (topic 66's own concept, this topic builds directly on its replicated log)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Choosing an acknowledgement point decides what a single write survives; it says nothing yet about whether an entire recorded history of many concurrent reads and writes, gathered while real failures are happening, is even consistent with any honest order at all."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter measured what one acknowledgement is allowed to promise, and how to check a whole recorded history against that promise under real injected failure; the next chapter turns to how a cluster of nodes, with no leader assumed in advance, actually agrees on which one gets to make that promise at all, and proves it stays correct."
