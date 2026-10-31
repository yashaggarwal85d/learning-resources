# OUTLINE: Vector clocks and version vectors (`de.vector-clocks-version-vectors`)

## Learning outcomes
1. Run the vector-clock update rule on a three-process diagram and classify each pair of events as ordered or concurrent from the vectors alone.
2. Build a version vector for a replicated key and show a read returning two siblings.
3. Explain what a dotted version vector fixes.
4. Say what Dynamo's clock truncation risks and why it accepts the risk.
5. Write the application-side merge for a shopping cart and show the conflict it surfaces.

## Reel steps (storyboard)
1. **Hook** — two customers add an item to the same cart on two replicas during a partition; reconnecting leaves two versions. Scalar clocks or timestamps would pick one silently. `fig`: how does the store know both are current, and what should it hand back?
2. **Predict** (within first four) — larger clock wins, both versions, or neither? Correct: both — neither vector dominates the other, so neither can be discarded.
3. **Reveal: one counter per process, merged by maximum** — the vector-clock update rule (increment own entry, merge by element-wise max on receipt); `V(a) < V(b)` iff `a → b`, and incomparable vectors mean concurrent — exactly what a scalar clock cannot say.
4. **Reveal: the Dynamo worked example, D1 through D5** — Sx writes D1, D2; Sy and Sz each write concurrently from D2 (D3, D4); a client's read context merges both; Sx's reconciling write produces D5, dominating both. `takeaway`.
5. **Reveal: version vector vs. vector clock** — a vector clock tracks events at processes; a version vector tracks versions of one data item at replicas, same comparison rule, the form stores actually use.
6. **Reveal: siblings, and what makes them multiply** — Riak's `allow_mult`: concurrent writes become siblings the application must merge; a client that never merges lets them pile up; the vector itself grows with every new coordinator. `takeaway`.
7. **Reveal: the dot that stops a false merge** — two clients writing through the *same* coordinator get an identical plain-vector bump and look like one update, not two, hiding real concurrency; a dot (a single event identifier) tells them apart, bounding siblings to genuinely concurrent updates instead of letting delivery order duplicate them.
8. **Recap** — a vector detects concurrency exactly, which a scalar number cannot; Dynamo's own worked example shows a real reconciliation; siblings are the application's job, and dots keep them from exploding; truncation trades that exactness away on purpose. `takeaway`.
9. **Prove it** (second predict) — a store truncates a vector past ten entries to bound its size. Can that ever make a genuinely ordered pair of versions look concurrent?

## Engagement arc
- Hook: step 1.
- Predicts: steps 2 and 9.
- Takeaways: steps 4, 6, 8 (three).
- Recap: step 8.

## Narrator's line of thought
- Step 1: she names the asymmetry directly — the earlier topic's tool answers "is one ordered before the other," and this hook is a case where the honest answer is "neither," which that tool can't say at all.
- Step 3: she's precise that the vector comparison is elementwise, not a sum or an average — one smaller entry anywhere is enough to break domination.
- Step 4: she walks the Dynamo numbers as a real trace, not an abstraction — every step is a specific coordinator incrementing its own entry, nothing more.
- Step 6: she separates two costs that get conflated — siblings are a correctness feature (nothing is silently lost), while unbounded sibling growth from duplicate delivery is a performance bug dots exist to fix.
- Step 7: she's careful that the dot doesn't add causal information the vector didn't already have — it only tells two equally-caused-by-the-same-state updates apart, which a bare vector literally cannot distinguish.
- Step 9: she treats this as the chapter's recurring shape — accepting a looser guarantee somewhere (truncation, a clock skew bound, a quorum size) always has a named, specific failure mode, never a vague "edge case."

## Post-notes headings (Deep dive)
- **Internals: the comparison rule, and why Dynamo's own worked example is the whole mechanism** — the elementwise dominance rule, the D1-D5 trace line by line, the read context as a merge.
- **Lab: a same-coordinator write a plain version vector cannot tell apart** — the simulator's dotted-update stand-in distinguishing two concurrent writes a bare vector would conflate.
- **Production: sibling explosion, and the three settings that cause it** — Riak's `allow_mult`, the delivery-order duplication problem, and DVVs as the fix Riak shipped.
- **Frontier: from siblings to a merge the application never has to write** — CRDTs, named, not built, as the mechanism that removes the reconciliation step this topic's shopping-cart example still requires by hand.
- **Where this goes next** — vector clocks say which writes were ordered and which were concurrent, without a trusted clock, but say nothing about what a client may read. The next question is what a replicated register promises a reader: linearizability.

## Examples to execute and what they assert
- Two vectors with no entry dominating the other compare as concurrent — the case a scalar clock cannot express.
- The Dynamo paper's own D1-D5 example, reproduced directly: D3 and D4 compare as concurrent despite a shared ancestor D2, and the reconciling D5 dominates both.
- Truncating two vectors past a threshold can turn a genuinely dominating pair into one that compares as concurrent — the named risk made concrete.
- A same-coordinator pair of writes that a plain version vector reports as "equal" (indistinguishable), which a dot can still tell apart.

## Bridge and handoff
- Bridge: answers topic 3's handoff (a clock that can say when two events were independent, not just order everything).
- Handoff: vector clocks say which writes were ordered and which concurrent, without a trusted clock, but say nothing about what a client may read. The next question is linearizability.

## Concept ledger
- **Introduces:** `vector-clock-exact-causality`, `version-vector-vs-vector-clock`, `dotted-version-vector`, `siblings-and-metadata-growth`.
- **Uses:** `happens-before-partial-order`, `lamport-scalar-clock`, `clock-condition-total-order` (topic 3), `last-write-wins-clock-hazard` (topic 2).
- **Declared:** `session-consistency-guarantees`, `partitioning-schemes`, `cap-pacelc` — CHAPTER.md lists these as Chapter 5 cross-references; grep of `registry.ts` finds none of the three present (Chapter 5's replication, partitioning and CAP topics are not yet built), so per CHAPTER.md's own cross-chapter-id rule they are declared instead of used, and the gap is logged here for the seam pass.

## Changes from the chapter plan
`session-consistency-guarantees`, `partitioning-schemes` and `cap-pacelc` moved from `uses` to `declared` (see the concept ledger above): none of the three exists in `registry.ts` yet to resolve the id against.

## Claims list
1. Dynamo's vector clock as a list of (node, counter) pairs, one per version, with the dominance comparison rule → Dynamo paper (quoted).
2. Dynamo's clock truncation scheme (drop the oldest pair past a threshold, say ten) and its named risk to reconciliation accuracy → Dynamo paper (quoted).
3. The D1 through D5 worked example (Figure 3): sequential and concurrent coordinator writes, a read context as a clock summary, a reconciling write dominating both prior concurrent versions → Dynamo paper (quoted).
4. The same-coordinator false-merge problem: two clients' concurrent writes through one replica can register with the same version vector and appear to dominate each other's predecessor, hiding real concurrency → Dotted Version Vectors paper (quoted).
5. A dot as a single event identifier appended to the context, distinguishing updates a plain version vector would otherwise conflate → Dotted Version Vectors paper (quoted) and Riak causal-context docs (quoted).
6. `allow_mult` controlling whether Riak creates siblings for concurrent writes versus falling back to timestamp resolution → Riak causal-context documentation (quoted).
7. Vector clocks alone cannot identify which value came from which concurrent update, which is exactly what causes duplicate-sibling explosion under out-of-order delivery; DVVs bound sibling count to the number of genuinely concurrent updates → Riak causal-context documentation (quoted).
8. The lab's results (vector comparison detecting concurrency a scalar number cannot, the Dynamo trace, the truncation anomaly, the same-coordinator false merge) → `examples.py`, executed, asserted.
