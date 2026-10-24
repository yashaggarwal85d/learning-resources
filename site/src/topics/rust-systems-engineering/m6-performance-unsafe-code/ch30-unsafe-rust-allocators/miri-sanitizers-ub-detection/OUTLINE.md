# Outline — Miri and sanitizers for UB detection

Concept ledger: introduces `a-checker-only-catches-paths-it-actually-runs`; uses `safety-contracts-bound-what-a-caller-can-trigger` (topic 77) and `validity-invariants-reject-illegal-bit-patterns` (topic 78), per Chapter 30's own CHAPTER.md §A.7 — this topic closes the chapter's own three-part arc: a contract, the rule a contract presupposes, and how anyone actually catches a violation of either.

Bridge/handoff (verbatim from CHAPTER.md §A.8): "Knowing which bit patterns and which pointers are genuinely valid decides what a violation even is; it says nothing yet about how anyone would actually catch one happening, short of reading every line by hand." Hands off to the next chapter (verbatim): "This chapter measured what a safety contract has to guarantee, what makes a value valid in the first place, and how a real checker catches a violation only on the path it actually runs; the next chapter turns to a boundary where Rust's own rules stop applying at all, because the code on the other side of it was never written in Rust."

Chapter 30's own no-real-UB rule (§A.3/§A.6) applies: this topic cannot run a real nightly Miri session in this sandboxed container, and must not execute real undefined behavior either way. Instead it builds a real, small interpreter over a fixed, real sequence of synthetic memory operations (a real address and length against a real, fixed-size buffer), with a real bounds checker run only on the one branch a given simulated run actually takes, measuring Miri's own real, stated limitation directly: a run-based checker only catches a violation on a path it actually executes.

## Storyboard (8 steps, 3 predict/reveal pairs)

1. **SafeBranchPredict** — A real interpreter runs one program with a real branch; this run takes the branch whose every operation stays inside a 16-byte buffer. Does the real checker, run only on this branch's own operations, find a violation? Options: yes, somewhere; no, genuinely, none of this branch's own operations is out of bounds (correct); only on the last operation.
2. **SafeBranchReveal** — Measured: the real checker, run over the three operations this branch actually takes, finds no violation; every one stays inside the sixteen-byte buffer. No separate takeaway here (this is the reel's own "from" step for the phone swipe test; its takeaway moves to step 7, the connecting step, below).
3. **OtherBranchPredict** — The identical interpreter now runs the branch its first run never took, which holds a real, genuinely out-of-bounds operation. Does the checker catch it this time? Options: no, it already decided the program is safe; yes, genuinely, once a run actually takes the branch that holds it (correct); only if the buffer is also resized.
4. **OtherBranchReveal** — Measured: the real checker, run over this branch's own two operations, genuinely catches the violation on the second one, the moment a run actually takes this branch. Takeaway: the identical violation is real and checkable the instant a run actually reaches it.
5. **UncheckedOpsPredict** — The safe branch's own run never took the other branch at all. How many of the other branch's own two operations did that first run's checker actually examine? Options: all of them, just in case; some, partially; none, genuinely, since that branch was never taken (correct).
6. **UncheckedOpsReveal** — Measured: the safe-branch run examined exactly its own three operations and none of the other branch's two; the violation sat there, real and uninspected, the whole time. Takeaway: a checker that never runs a branch never asks it a single question.
7. **DocsReveal** — Miri's own README states the identical limitation directly, in its own words: Miri can tell you whether one particular way of interacting with your code causes undefined behavior in one particular execution, among the many an unexplored branch could have taken; the Unstable Book's own AddressSanitizer docs name a different, complementary tool with its own different real reach. Does this topic's own small interpreter model exactly the limitation both sources describe? Takeaway (moved here from step 2): a run-based checker's silence means this run found nothing, not that nothing is there.
8. **Recap** — A run-based checker only ever asks about the path it actually takes; the identical violation on an unexercised branch sits there, real, and goes unasked.

## Engagement arc

- Predicts: steps 1, 3, 5 — each a genuine guess about what one specific, countable run of a real checker finds.
- Takeaways: steps 4, 6, 7 (three — step 2 deliberately carries none, since it is the reel's own "from" step for the phone swipe test; its takeaway moves to step 7, the connecting "both sources say this" step; step 8's recap carries the closing statement, and the chapter's own closing handoff, instead of a fourth).

## Deferred to post-notes (not measured in the reel itself, per the no-real-UB rule and the kit's real-measurement standard)

- Miri's own real, broader detection list (data races, weak-memory effects, Stacked Borrows / Tree Borrows violations under its experimental modes) beyond the one bounds-checking model this topic builds — Internals.
- `cargo +nightly miri test` as the real command that runs Miri in CI, and why it needs the nightly toolchain — In production.
- The `-Zsanitizer` flag's own real, current state: still nightly-only overall, though the Tier 2 `x86_64-unknown-linux-gnuasan` target lets AddressSanitizer run from a stable compiler; AddressSanitizer/LeakSanitizer close to stabilization, MemorySanitizer/ThreadSanitizer needing an instrumented std — The frontier.
- How a sanitizer's own real reach differs from Miri's: instrumented machine code catching real memory errors at native speed versus an interpreter checking Rust's own abstract rules, each with its own real blind spots — The frontier.
