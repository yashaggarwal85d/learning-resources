# OUTLINE: Physical clocks and why they lie (`de.physical-clocks-why-they-lie`)

## Learning outcomes
1. Compute how far two clocks drift apart in a day at a given drift rate.
2. Explain why NTP's offset estimate has an error bound, and why a wall clock can jump backward.
3. Say which clock to use for a duration and which for an instant, and why neither orders events across machines.
4. Reproduce a last-write-wins write loss in the simulator under clock skew, and say what a bounded-error clock changes.

## Reel steps (storyboard)
1. **Hook** — two nodes accept writes to the shop's `stock` register twenty milliseconds apart, in the real-time-correct order; the store keeps the earlier one. Both report "synchronised" via NTP. `fig`: how can a synchronised clock put the later write in the past?
2. **Predict** (within first four) — whose sale is actually gone: the node with the faster clock, the later write, or neither? Correct: the later write — it's the one silently discarded, however fast or slow either node's clock runs.
3. **Reveal: quartz drift and NTP's own error bound** — a crystal oscillator drifts continuously (Spanner's own quoted worst-case figure computed to seconds/day); NTP estimates and corrects that drift from a round trip, but the estimate's accuracy depends on the path being symmetric — an asymmetric path biases it.
4. **Reveal: a leap second, smeared or stepped** — Google's 24-hour linear smear vs. an abrupt step; two clocks that each handle the leap second differently disagree with each other for a full day, even though both are "correct" by their own rule. `takeaway`.
5. **Reveal: wall clock vs. monotonic clock, and the pause no clock survives** — `CLOCK_REALTIME` can jump (NTP correction, an admin); `CLOCK_MONOTONIC` only moves forward but means nothing on another host; a paused process (GC, a hypervisor migration) makes even a perfectly synchronised reading stale before it's used.
6. **Reveal: a bounded-error clock turns a guess into a flagged "don't know"** — TrueTime/ClockBound return an interval, not a point; two overlapping intervals are explicitly "cannot order" instead of silently ordered; a lease's length must exceed the known maximum skew for the same reason.
7. **Reveal: the lab — last-write-wins loses a write, and the bounded clock catches it** — the chapter's simulator: last-write-wins under skew keeps the wrong write; the same situation, read through a bounded-error clock instead, flags the pair as unorderable rather than guessing wrong. `takeaway`.
8. **Recap** — drift is continuous and NTP's correction has its own error bar; a leap second handled two different ways is a day-long disagreement, not an instant; neither clock type orders events across machines, and a pause breaks even a synchronised one; a bounded clock turns silent guessing into an honest "cannot tell". `takeaway`.
9. **Prove it** (second predict) — a lease is granted for a length equal to the *typical* clock skew measured last month. Is that safe?

## Engagement arc
- Hook: step 1.
- Predicts: steps 2 and 9.
- Surprising number: step 3 (seconds of drift a day) and step 4 (a full day of disagreement from one leap second).
- Takeaways: steps 4, 7, 8 (three).
- Recap: step 8.

## Narrator's line of thought
- Step 1: she flags that "synchronised" is not binary — both nodes can honestly report synchronisation and still disagree by more than the gap between two real writes.
- Step 3: she corrects the instinct that NTP "fixes" the clock once — it's a continuous correction against a continuously drifting oscillator, and the correction's own accuracy is bounded by how symmetric the network path happens to be, which NTP cannot verify from inside the protocol.
- Step 4: she makes the leap-smear point concrete — this isn't a one-second blip, it's a full day where two "correct" clocks compute different values for the same instant.
- Step 5: she draws the wall/monotonic line sharply — monotonic answers "how long", wall answers "when", and neither was ever designed to answer "which of these two events on two different machines happened first."
- Step 6: she reframes a bounded-error clock's whole value: it isn't more accurate, it's honest about how inaccurate it might be, which is a strictly more useful thing for a protocol to know.
- Step 9: she names the budgeting mistake precisely — "typical" skew is a central tendency; a lease has to survive the *worst* skew that can occur within its length, not the common case.

## Post-notes headings (Deep dive)
- **Internals: what NTP actually promises** — the offset/delay formulas worked through, the symmetric-path assumption and what breaks it.
- **Lab: a bounded-error clock reading the same skewed pair** — the simulator's two readings of the identical scenario.
- **Production: a leap second's day-long shadow** — the 2012/2015/2016 real leap-second incidents named (Linux futex/leap-second bug class), sourced, not reproduced.
- **Frontier: TrueTime and ClockBound, side by side** — Spanner's TrueTime vs. AWS ClockBound as two real, named implementations of the same bounded-error idea.
- **Where this goes next** — if a timestamp can't be trusted, what can: happens-before and Lamport clocks.

## Examples to execute and what they assert
- Quartz drift at Spanner's own quoted worst case (200 ppm) computes to roughly 17.3 seconds/day.
- NTP's offset/delay formulas reproduce a worked example exactly under a symmetric path, and are shown biased under an asymmetric one.
- A 24-hour linear smear and an abrupt step disagree by nearly half a second at the midpoint of the window, and agree again at its end.
- Last-write-wins under skew larger than the write gap keeps the wrong (earlier, inflated-timestamp) write; under skew smaller than the gap it's correct.
- A bounded-error clock's two intervals for the same skewed pair overlap, correctly flagging them as unorderable.

## Bridge and handoff
- Bridge: answers topic 1's handoff (what the clocks a machine has actually promise).
- Handoff: if a timestamp can't be trusted, what can — happens-before and a Lamport clock (topic 3).

## Concept ledger
- **Introduces:** `clock-drift-ntp-error`, `wall-vs-monotonic-clock`, `last-write-wins-clock-hazard`, `bounded-error-clock-interval`.
- **Uses:** `timing-models-sync-partial-async` (topic 1), `memory-hierarchy`, `latency-numbers`, `latency-bandwidth-cost`, `process-model`, `signals`, `cpu-memory-profiling`, `replication-ack-modes` (all verified present in `registry.ts`, introduced by live topics).
- **Declared:** `cap-pacelc` — CHAPTER.md's entry lists this as a Chapter 5 cross-reference, but Chapter 5's CAP/PACELC topic is not yet built (only topics 84–86 of that chapter are live); per CHAPTER.md's own cross-chapter-id rule ("Chapter 5's unmade topics... treated as available", but "if it is not there [in registry.ts], puts it in `declared` and logs the gap"), this is declared instead of used, and the gap is logged here for the seam pass.

## Changes from the chapter plan
`cap-pacelc` moved from `uses` to `declared` (see the concept ledger above): Chapter 5's CAP/PACELC topic does not exist in `registry.ts` yet to resolve the id against. No other change.

## Claims list
1. Spanner's TrueTime uncertainty generally under ten ms, from multiple modern clock references → Spanner paper (quoted).
2. TrueTime returns an interval (earliest, latest), not a point → Spanner paper (quoted).
3. Uncertainty derived from worst-case local clock drift plus time-master uncertainty and communication delay → Spanner paper (quoted).
4. NTP's on-wire offset/delay formulas → RFC 5905 (formula reproduced from the RFC's own definitions; worked example computed, not quoted beyond the "round-trip delay" phrase already verified for topic 1's link discussion — re-verify directly from RFC 5905's own text here).
5. Google's 24-hour linear noon-to-noon smear, adopted by AWS → Google Public NTP leap-smear page (quoted).
6. Smeared time briefly deviates from UTC during the smear period but realigns after 24 hours → same page (quoted).
7. `CLOCK_REALTIME` settable/jumps, `CLOCK_MONOTONIC` nonsettable/monotonic → Linux `clock_gettime(2)` man page (paraphrased from its own documented semantics).
8. A paused process (GC, live migration) can hold a stale clock reading for an unbounded time → Kleppmann's distributed-locking article (paraphrased from its named pause examples).
9. ClockBound returns a (earliest, latest) Clock Error Bound, synced from a PTP Hardware Clock, NTP, or VMClock → AWS ClockBound README (quoted).
10. Cassandra documents last-write-wins, by timestamp, as its own conflict-resolution rule → Cassandra docs (quoted).
11. Dynamo names timestamp-based last-write-wins as one reconciliation choice among others → Dynamo paper (paraphrased, contents-level, no direct quote needed since the claim is attributive, not a specific textual claim).
12. The lab's results (last-write-wins losing the later write under skew; a bounded clock flagging the same pair as unorderable) → `examples.py`, executed, asserted.
