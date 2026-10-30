# OUTLINE: Linearizability (`de.linearizability`)

## Learning outcomes
1. State linearizability exactly, as a property of a history, and decide by hand whether a given history is linearizable, giving the linearization.
2. State the locality property and why it matters.
3. State, from the paper, the Attiya-Welch result and its model, and say why "one round trip" is a simplification.
4. Show a "read from the leader" stale read in the simulator and fix it with a quorum read.
5. Run the chapter's small checker on a recorded history.

## Reel steps (storyboard)
1. **Hook** — the shop's `stock` register is "read from the leader." A leader is partitioned, the other two elect a new leader that accepts `write(stock, 7)`, and a client still talking to the old leader reads `9` after the write completed. `fig`: is the system linearizable, and what one change fixes it?
2. **Predict** (within first four) — linearizable because there's one leader, not linearizable because the read is stale, or linearizable because it's eventually consistent? Correct: not linearizable — the read's response comes after the write's, so the read must see the new value, and it doesn't.
3. **Reveal: every operation takes effect at one instant, somewhere in its interval** — Herlihy and Wing's own definition: the illusion of instantaneous effect between invocation and response, in an order consistent with real time.
4. **Reveal: a local, nonblocking property** — linearizable objects compose: if every object is linearizable, the system is; a pending operation never forces another to wait. `takeaway`.
5. **Reveal: the checker, replaying a legal history** — a brute-force search over candidate total orders, checking both that the order is a legal sequential history of the register and that it respects real-time precedence; a correctly ordered history has a linearization.
6. **Reveal: the same checker, finding no linearization at all** — the hook's stale-leader history fed to the identical checker: every ordering either breaks the register's semantics or breaks real-time order; none work. `takeaway`.
7. **Reveal: the fix, and the real cost of linearizability** — a quorum-confirmed read removes the anomaly; Attiya and Welch's own result: under realistic timing assumptions, linearizability is strictly more expensive than sequential consistency, and once clock uncertainty is nonzero, no linearizable implementation beats roughly that uncertainty per operation.
8. **Recap** — linearizability is a property of a history: instantaneous effect, real-time order, locally composable; a stale leader read breaks it exactly, a quorum read fixes it; the fix isn't free, and the paper proves why. `takeaway`.
9. **Prove it** (second predict) — a store serves reads straight from a single designated leader with no quorum check at all, and the leader has never yet been deposed in production. Is that enough to call its reads linearizable?

## Engagement arc
- Hook: step 1.
- Predicts: steps 2 and 9.
- Takeaways: steps 4, 6, 8 (three).
- Recap: step 8.

## Narrator's line of thought
- Step 1: she's careful that "read from the leader" sounds strongly consistent and is a specific, nameable trap — strong in the common case, silently wrong exactly when a leader change happens.
- Step 3: she states the definition as a property of a recorded history, not of an algorithm in the abstract — linearizability is something you check against what actually happened, not something a system "has" in isolation.
- Step 4: she's precise that locality is a composability result, not a vague "it's modular" claim — you can verify one object at a time and the system-level guarantee follows for free.
- Step 6: she treats the checker finding nothing as the whole point, not a failure of the search — no candidate order can simultaneously respect the register's rules and the real-time rule, which is the formal content of "this history is wrong."
- Step 7: she's exact about what the Attiya-Welch result actually says, resisting the syllabus's own shorthand — not flatly "a round trip," but a lower bound stated in terms of network delay and clock uncertainty, which only simplifies to "about a round trip" once uncertainty is comparable to delay.
- Step 9: she won't let "it hasn't happened yet" stand in for "it can't happen" — the absence of an anomaly in whatever history has been observed so far says nothing about the next partition.

## Post-notes headings (Deep dive)
- **Internals: the Ll/L2 conditions, and what the checker is actually searching for** — the formal definition worked through on the legal and stale-leader histories, side by side.
- **Lab: a stale-leader read with no legal order, and the fix that gives it one** — the simulator's before/after, same checker.
- **Production: Jepsen, and the tools built to find exactly this** — Knossos, Porcupine, Elle, named with sources, the methodology not reproduced.
- **Frontier: the Attiya-Welch bound, stated precisely** — d, u, the two regimes, and why "a round trip" is the syllabus's simplification of a sharper result.
- **Where this goes next** — most systems offer something weaker than linearizability on purpose, because of exactly this cost. The next topic states the two main weaker models.

## Examples to execute and what they assert
- A correctly ordered three-operation history (write, read, write) has a linearization the brute-force checker finds.
- The hook's stale-leader history (a write that completes, then a read starting after it that returns the old value) has no linearization at all.
- The same history with the read fixed to return the new (quorum-confirmed) value does have a linearization.
- The Attiya-Welch model's two regimes computed directly: a synchronized-clock round-trip floor of d, and a skewed-clock per-operation floor of u.

## Bridge and handoff
- Bridge: answers topic 4's handoff (what may a client's read return — the strongest answer is linearizability).
- Handoff: linearizability is the strongest single-object answer and, by Attiya-Welch, the most expensive. Most systems offer something weaker on purpose: sequential consistency (drops the real-time rule) and causal consistency (keeps only cause and effect) are topic 6's subject.

## Concept ledger
- **Introduces:** `linearizability-definition`, `linearizability-locality`, `linearizable-vs-sequential-cost`, `stale-leader-read`.
- **Uses:** `happens-before-partial-order` (topic 3), `timing-models-sync-partial-async` (topic 1), `snapshot-isolation`, `serializability-2pl-ssi`, `occ-vs-pcc` (all three verified present and introduced by live Chapter 5 topics in `registry.ts`).
- **Declared:** `cap-pacelc`, `consensus-raft-paxos-in-systems`, `session-consistency-guarantees` — CHAPTER.md lists these as Chapter 5 cross-references; grep of `registry.ts` finds none of the three introduced by any topic (Chapter 5's consensus, session-consistency and CAP topics are not yet built), so per CHAPTER.md's own cross-chapter-id rule they are declared instead of used, and the gap is logged here for the seam pass.

## Changes from the chapter plan
`cap-pacelc`, `consensus-raft-paxos-in-systems` and `session-consistency-guarantees` moved from `uses` to `declared` (see the concept ledger above): none of the three is introduced by any topic in `registry.ts` yet. `snapshot-isolation`, `serializability-2pl-ssi` and `occ-vs-pcc` kept in `uses` as planned: all three are introduced by live Chapter 5 topics already in `registry.ts`.

## Claims list
1. Linearizability's illusion-of-instantaneous-effect definition, over a history of invocations and responses → Herlihy & Wing 1990 (quoted).
2. Linearizability as a local, nonblocking property → Herlihy & Wing 1990 (quoted).
3. The Ll/L2 formal conditions (a legal sequential extension respecting real-time order) → Herlihy & Wing 1990 (quoted).
4. Under realistic timing assumptions, linearizability is strictly more expensive than sequential consistency in distributed implementations → Attiya & Welch 1994 (quoted).
5. The model's own definitions of d (worst-case network delay) and u (worst-case clock/delay uncertainty) and the stated lower bounds in terms of both → Attiya & Welch 1994 (quoted).
6. For sequential consistency, under a strong (synchronized-clock) model, the sum of the worst-case response times of a read and a write is at least d, matched by a concrete algorithm → Attiya & Welch 1994 (quoted).
7. The stale-leader-read hazard, in the Raft paper's own words, and the fix (confirm leadership before answering) → Raft paper (quoted).
8. etcd's own worked stale-read example and its documented default (linearizable) versus optional (serializable, possibly stale) read modes → etcd API guarantees documentation (quoted).
9. Jepsen's plain-language restatement of the real-time rule, and its own role as the production history-checking methodology → Jepsen linearizability page (quoted).
10. The lab's results (a legal history's linearization found, the stale-leader history's absence of one, the quorum-fixed history's linearization, the Attiya-Welch floors computed) → `examples.py`, executed, asserted.
