# OUTLINE: Timing and failure models (`de.timing-failure-models`)

## Learning outcomes
1. State each timing model (synchronous, partially synchronous in both its forms, asynchronous) and say exactly what it lets a protocol assume.
2. State the fault hierarchy (crash-stop, crash-recovery, omission, Byzantine) and place a given failure description in the right class.
3. Say what a fair-loss link must be wrapped in (retransmission + dedup) to behave as a reliable one, and why "reliable" is never a property of the wire itself.
4. Run the chapter's primary-backup register through message loss, reordering and crash-recovery-with-a-lost-disk in the simulator, and name the first invariant each one breaks.

## Reel steps (storyboard)

1. **Hook** — "A primary-backup register passes every test, loses an acknowledged write in production." `fig`: the dirty assumption question. Visual: space-time diagram, primary lane + backup lane, a write/replicate/ack arrow sequence, final frame freezing on a question mark over "which assumption?". Moves: `Draw` for the three arrows, landing on a static final frame. Caption: the tester's model vs. production's reality.
2. **Predict** (within first four ✓) — "Which breaks the protocol first: crash-recovery with a lost disk, message reordering, or message loss?" Options: each one, no single "all of the above" cop-out; correct = depends on what the protocol actually assumed, so the predict step asks the narrower, decidable question the simulator answers: *does message loss alone, with no other fault, already break it?* Correct: yes. Wrong-but-tempting: "no, because the client was already told", testing the misconception that acknowledging is the same as persisting.
3. **Reveal: three timing models, the same space-time diagram** — synchronous (known Δ bound, known Φ), partially synchronous in its two DLS forms (Δ unknown vs. Δ holds only from GST on), asynchronous (no bound at all). Visual: the same three-lane diagram with the bound shown as a shrinking/absent reticle box over the message arrow; GST marked as a vertical line after which the box appears. `takeaway`: a protocol correct in one timing model is not automatically correct in a weaker one.
4. **Reveal: four fault classes, one hierarchy** — crash-stop, crash-recovery (with the lost-disk wrinkle), omission, Byzantine, with the containment (Byzantine ⊇ omission ⊇ crash) and the 2t+1 vs 3t+1 resiliency fact named (not derived — that's consensus, topic 9). `takeaway`: none here (factual, not yet surprising; the surprise is step 6).
5. **Reveal: a fair-loss link, and what turns it reliable** — FL1 (retry infinitely often → delivered infinitely often) vs. PL1 (every message delivered, period); reliable is fair-loss plus retransmission and dedup, built, not given. `takeaway`: "reliable" is an engineered property of a layer on top of the wire, never a fact about the wire itself.
6. **Reveal: the lab, three faults, three different first breaks** — the simulator's three real runs (message loss → write #1 lost entirely; reordering → write #2's acknowledged value unreadable; crash-recovery with a lost disk → write #2's unflushed state gone on restart), each number taken directly from `examples.py`. `takeaway`: the same two-line protocol breaks for three unrelated reasons, and each is a different model assumption leaving reality.
7. **Recap** — the four pieces: a model is a contract, not a guess; the fault hierarchy and why Byzantine costs more replicas; a reliable link is retry+dedup over fair-loss, not a wire property; the lab's three distinct breaks.
8. **Prove it** (second predict) — "A monitoring dashboard shows zero dropped messages and zero crashes this week. Does that mean this protocol's safety invariant held all week?" Correct: no — the dashboard can't observe reordering within the delivery window it already counts as "not dropped", and a crash-recovery that loses only unflushed state looks, from outside, like a clean restart. Wrong-but-tempting: yes, since the two fault types it tracks didn't fire.

## Engagement arc
- Hook: step 1, a real-shaped production incident.
- Predicts: steps 2 and 8 (two, full topic).
- Surprising number: step 6 — the *same* two-line protocol breaks for three structurally different reasons, each traced to one line of the simulator.
- Takeaways: steps 3, 5, 6 (three).
- Recap: step 7.

## Narrator's line of thought, beyond the description
- Step 1: she doesn't just read the incident; she asks the viewer to notice that "passed every test" is itself a model claim — the tests encoded a model, and it just wasn't production's.
- Step 3: she flags the trap of treating "partially synchronous" as one thing — DLS gives two *different* formal conditions (Δ unknown vs. Δ-after-GST) that happen to be provably equivalent to a safety/liveness split, and that equivalence is the actual insight, not the vocabulary.
- Step 4: she corrects the instinct to think "Byzantine is just worse omission" — it's not quantitatively worse, it's a different kind of claim (a lying witness vs. a silent one), which is why no amount of retrying fixes it the way retrying fixes omission.
- Step 5: she warns against the common conflation "TCP is reliable" — TCP gives reliable *delivery on an open connection*, not the link-layer guarantee the protocol literature means, and a partition still breaks it.
- Step 6: she walks the viewer through *why* the same two-line protocol has three separate failure shapes — not "bugs", but three different model assumptions (no loss, in-order delivery, flush-before-restart) each left unstated in the code.
- Step 8: she names the blind spot explicitly: a dashboard that counts only the faults it was told to count is not evidence of a model holding, it's evidence of a model *not yet observed to fail*.

## Post-notes headings (Deep dive)
- **Internals: the model as a contract** — the safety/liveness-vs-GST equivalence worked through; fair-loss → reliable as an explicit construction; crash-recovery's lost-disk wrinkle tied to Chapter 1's fsync/fsync-failure.
- **Lab: searching for the shortest lost-write trace** — the exhaustive search over the six schedules, and why this is the executable stand-in for the chapter's one skipped TLA+ lab (§14.9).
- **Production: the incident this model explains** — a worked rewrite of a real-shaped incident narrative in terms of which model assumption left reality (asynchronous replication that acks before the backup has it, the classic unsafe default).
- **Frontier: Byzantine's cost, and where it's actually paid** — 2t+1 vs 3t+1 named from DLS, with where Byzantine tolerance is actually bought in practice (named only: BFT consensus, blockchains), not built.
- **Where this goes next** — physical clocks, and why a timestamp can't be trusted to order two events even once the model is pinned down.

## Examples to execute and what they assert
- `every_fault_breaks_the_invariant_exactly_once`: each of the three faults breaks the durability invariant at the expected write number.
- `a_clean_run_under_no_fault_never_violates_the_invariant`: the same protocol, nothing injected, never violates it.
- `shortest_lost_write_trace`: exhaustive search over the six orderings of `{deliver_1, deliver_2, crash_before_fsync}` finds a 2-step trace that loses an acknowledged write, and the schedule space really is the six permutations of three events.

## Bridge and handoff
- Bridge (from Chapter 13's last topic): as written in CHAPTER.md §1 — answers Chapter 13's final handoff about assumptions behind a timestamp, an alert's window, a lease, a lock.
- Handoff (to topic 2): as written in CHAPTER.md §1 — a model gives no shared clock; next is what the clocks a machine does have actually promise.

## Concept ledger
- **Introduces:** `timing-models-sync-partial-async`, `fault-models-crash-omission-byzantine`, `link-models-fair-loss-reliable`, `safety-vs-liveness-in-a-model`.
- **Uses:** `bandwidth-delay-product`, `throughput-vs-latency`, `signals`, `exit-status`, `fsync`, `fsync-failure`, `replication-ack-modes`, `wal-lsn-fsync` (all verified present in `registry.ts`, all introduced by live topics).
- **Declared:** none.

## Claims list (claim → source)
1. Fail-stop, omission, Byzantine as DLS's three fault classes → DLS88 §1 (quoted, SOURCES.md).
2. Omission's precise definition (a subset of sent/expected messages never delivered) → DLS88 §2.2 (quoted).
3. Authenticated Byzantine vs. Byzantine, distinguished by forgeable signatures → DLS88 §2.2 (quoted).
4. GST: an unknown time after which a known Δ bound holds → DLS88 §2.3 (quoted).
5. Safety-always/liveness-after-GST is equivalent to the GST model → DLS88 §2.4 (paraphrased from the quoted passage, not a direct quote beyond the one given).
6. 2t+1 vs 3t+1 resiliency for crash/omission vs. Byzantine-with-authentication → DLS88 §1 (paraphrased from the paper's stated results; the exact bound numerals are the paper's, named, not derived here).
7. Fair-loss link (FL1): infinite retries → infinite deliveries → EPFL/CGR slides (quoted).
8. Reliable/perfect link (PL1): every message delivered, no loss → EPFL/CGR slides (quoted).
9. Reliable links are fair-loss links plus an engineered layer (retransmission, dedup), not a property of the wire → EPFL/CGR slides (quoted framing, "reliable links ensure...").
10. Crash-recovery as a distinct, more realistic fault model than DLS's own taxonomy → this topic's own placement, argued, not an external citation (flagged as such in SOURCES.md and coverage.json).
11. Two Generals: no ack-based protocol over a lossy channel gives certainty of delivery → Gray 1978, named only, not independently verified (flagged in SOURCES.md).
12. The lab's three simulated results (write #1 / #2 / #2 lost, by fault) → `examples.py`, executed, asserted.

## Changes from the chapter plan
None: this topic keeps to its CHAPTER.md entry exactly (scope, outcomes, hook, visual idea, lab, sources).
