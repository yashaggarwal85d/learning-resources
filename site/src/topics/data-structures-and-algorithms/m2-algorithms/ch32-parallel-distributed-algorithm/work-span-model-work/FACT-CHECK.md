# Fact-check — dsa.work-span-model-work

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | The work law: TP ≥ T1/P (p processors do at most p operations per step) | Confirmed | SOURCES.md §1, §2 |
| 2 | The span law: TP ≥ T∞ (no finite number of processors beats an unbounded one) | Confirmed | SOURCES.md §1, §2 |
| 3 | Brent's bound (greedy-scheduling theorem): any greedy schedule achieves TP ≤ T1/P + T∞ | Confirmed | SOURCES.md §1 (Theorem 2.1) |
| 4 | Attribution: the upper bound T1/P + T∞ traces to early independent work by Brent and Graham; the greedy-scheduling theorem's own extension of it is Blumofe and Leiserson's | Confirmed | SOURCES.md §1 |
| 5 | Brent's bound implies any greedy schedule is within a factor of 2 of optimal | Confirmed | SOURCES.md §1 |
| 6 | Linear speed-up is achievable when P ≤ T1/T∞ (the average parallelism) | Confirmed | SOURCES.md §1 |
| 7 | Brent's sharper bound form, Tp ≤ T∞ + (T1 − T∞)/p | Confirmed | SOURCES.md §2 |
| 8 | Brent's law is attributed to Brent, "The Parallel Evaluation of General Arithmetic Expressions," JACM 21(2), 1974 | Confirmed | SOURCES.md §2 |
| 9 | A fully strict computation: every dependency goes from a thread to its parent | Confirmed | SOURCES.md §1 |
| 10 | The work-stealing deque: two ends, owner pushes/pops the bottom like a call stack, a migrated (stolen) thread is removed from the top | Confirmed | SOURCES.md §1 |
| 11 | When a worker's deque is empty, it steals the topmost thread from a randomly chosen processor's deque | Confirmed | SOURCES.md §1 |
| 12 | A thief picks a victim processor chosen uniformly at random, and retries another random victim if that one's deque is empty | Confirmed | SOURCES.md §1 |
| 13 | Theorem 4.2: the Work-Stealing Algorithm on a fully strict computation with stack depth S1 uses at most S1·P space on P processors | Confirmed | SOURCES.md §1 |
| 14 | Theorem 4.10: expected running time of the Work-Stealing Algorithm on a fully strict computation is O(T1/P + T∞) | Confirmed | SOURCES.md §1 |
| 15 | Theorem 4.11: expected total communication is O(P·T∞·(1 + nd)·Smax) | Confirmed | SOURCES.md §1 |
| 16 | OpenCilk's own framing: "provably efficient scheduling tunes each execution... to its host environment" | Confirmed | SOURCES.md §3 |
| 17 | Rayon's `join`: "the underlying technique is called 'work stealing'," a fixed worker pool, idle-CPU-gated parallelism | Confirmed | SOURCES.md §4 |
| 18 | Rayon's `join`: the calling thread runs closure A, advertises closure B as stealable, and if B was stolen, looks for other work while waiting | Confirmed | SOURCES.md §4 |
| 19 | Rayon's `join` warns that blocking one closure on another inside `join` "could lead to a deadlock" | Confirmed | SOURCES.md §4 |
| 20 | Tokio's scheduler steals from per-worker queues but is scoped to I/O-bound tasks, not claimed under the fully-strict fork-join theorem | Not independently re-verified this topic; owned and sourced by the live Rust Systems Engineering Ch.9 topic, named only here per CHAPTER.md's cross-reference split | CHAPTER.md §105 scope |
| 21 | Every numeric claim on screen (the sum DAG's work/span/parallelism, the Brent-bound table, the merge sort's span/work doubling ratios and parallelism growth, the work-stealing simulation's step counts and steal fractions) | Confirmed by direct computation | `examples.py`, run and asserted |

## Red team

- **Is the Blumofe technical report a legitimate stand-in for the unreachable JACM 1999 paper,
  or does it risk stating something the published version later changed?** The TR is explicitly
  the author's own account of the same joint research with Leiserson (its own text: "The
  research reported in this chapter is joint work with Charles Leiserson... and was first
  published in [14]"), predates the 1999 journal version by four years as a PhD thesis chapter,
  and every theorem quoted here (the greedy-scheduling theorem, the space/time/communication
  bounds for randomized work stealing) matches the abstract-level statement the chapter plan
  itself read from the JACM paper at planning time (expected T1/P + O(T∞), space S1·P,
  "existentially optimal to within a constant factor"). No claim in this topic depends on
  wording that could plausibly have changed between the 1995 TR and the 1999 journal version.

- **Does the greedy-schedule simulation in `examples.py` actually respect Brent's bound, or
  could the simulation be silently wrong?** Every one of the five processor counts (1, 2, 4, 8,
  16) is asserted to fall between the two-law lower bound (max(T1/p, T∞)) and the sharper Brent
  bound (T∞ + (T1 − T∞)/p); at p = 16 the real schedule reaches exactly T∞ = 4, the span itself
  — the point beyond which Brent's bound and the span law coincide, which is the strongest
  possible check that the simulation is not merely coincidentally inside a loose range.

- **Is it honest to compare the work-stealing simulation's step count directly against Brent's
  bound, when the theorem states an *expected* bound with a *constant factor*, not an exact
  ceiling?** No — and `examples.py` does not make that comparison. The discrete-event simulation
  charges a thief a full time step for a *failed* steal attempt (a simplification the real
  protocol's continuous retrying does not literally make), so its step counts legitimately run
  somewhat over the idealized greedy bound; the assertion checks it stays within a bounded
  constant multiple of that bound, matching the theorem's own "T1/P + O(T∞)" shape rather than
  overclaiming the un-amortized T1/P + T∞ ceiling for a non-ideal scheduler.

- **Does "steals are rare" hold up under the actual simulated numbers, or is it asserted on
  faith?** The simulation shows the fraction of work completed by a successful steal rising from
  0% (one worker) to about 15% (sixteen workers on a 16,384-leaf tree) — rising with the worker
  count, as the theorem's O(P·T∞) steal-attempt bound predicts, but staying well under a quarter
  of the total work even at the largest worker count tested; the topic states this directly
  rather than asserting an unverified small constant.

- **Predict-distractor plausibility.** Step 2's distractors each reflect a specific
  misunderstanding: "fifteen steps, unlimited speed-up" ignores that the chain itself is the
  cap; "four steps, unlimited speed-up" gets the span right but forgets that parallelism (not
  infinity) is the actual ceiling; "fifteen steps, four times faster at most" swaps which number
  is which. Step 10's distractors ("wait to be handed work," "shut down," "always take from the
  starting worker") each describe a real but different scheduling strategy (centralized
  dispatch, a fixed hierarchy) that the chapter explicitly contrasts work stealing against in
  its own framing of why a central queue is avoided.

- **Tokio scope limit.** CHAPTER.md explicitly instructs that Tokio's scheduler not be claimed
  under Blumofe and Leiserson's fully-strict-computation bound; this topic names Tokio's
  per-worker-queue work stealing in one sentence as a different point on the same design idea
  and defers its actual mechanics (local queue, LIFO slot, injection queue, cooperative
  budgeting) entirely to the live Rust Systems Engineering Ch.9 topic, which owns and sources
  them — nothing about Tokio is asserted here beyond "it also steals from per-worker queues, for
  a different kind of task."
