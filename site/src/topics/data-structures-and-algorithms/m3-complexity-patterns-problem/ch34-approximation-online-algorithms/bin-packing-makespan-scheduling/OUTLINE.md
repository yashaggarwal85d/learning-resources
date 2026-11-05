# OUTLINE: Bin packing and makespan scheduling

A full topic, about 14 minutes. Second topic of Chapter 34. Every count below is
computed and asserted directly in `examples.py`, except Spark's own algorithm, which is
read from its source and faithfully reproduced, not redesigned.

## Learning outcomes

1. State First-Fit Decreasing's bin-packing bound (11/9·OPT + 6/9) as an *asymptotic*
   guarantee (a ratio plus an additive constant), distinct from the *absolute* ratios of
   the chapter's first topic, and explain why that distinction matters.
2. Prove and compute LPT's absolute 4/3 − 1/(3m) makespan bound on Graham's own tight
   family, verified against a brute-force optimum.
3. Show, on the identical job set, that order alone (arbitrary vs. descending) changes
   list scheduling's own worst-case ratio from 2 − 1/m to 4/3 − 1/(3m).
4. Read a real system's own file-splitting algorithm from its source and state precisely
   which theoretical guarantee does, and does not, carry over to it.

## Storyboard

1. **Hook.** The chapter's first topic bounded two NP-hard problems. These two are
   NP-hard too (declared, same fallback as topic 109), and the lower-bound trick returns
   — but this time the guarantee has a different *shape* again: not a flat ratio, not a
   growing one, but a ratio plus a fixed extra amount.
2. **First-Fit Decreasing.** Sort items by descending size, then place each into the
   first bin it fits; open a new bin only when it fits nowhere. Simple, and provably
   close: Dósa (2007) proved FFD(I) ≤ 11/9·OPT(I) + 6/9 — not for every n a bound in
   absolute ratio terms (that constant +6/9 means the ratio itself only gets interesting
   at smaller OPT; at OPT = 9 the bound allows up to 11 bins).
3. **The tight family, reproduced.** The standard 30-item construction (6 near one half,
   6 near one quarter plus two epsilon, 6 near one quarter plus epsilon, 12 near one
   quarter minus two epsilon): FFD uses 11 bins; the total volume alone already requires
   at least 9. Consistent with the bound at OPT = 9 — not a proof OPT is exactly 9, which
   this topic states plainly rather than overclaiming.
4. **A smaller instance, the optimum actually proved.** An 8-item instance (found by
   random search, not hand-picked) where FFD uses 4 bins and brute force proves the true
   optimum is 3 — small enough to verify completely, showing the gap is real, not just
   asymptotic.
5. **Switch problems: makespan scheduling.** m identical machines, a set of jobs, each
   job entire on one machine, minimize the finishing time of the last machine to stop.
   Also NP-hard (declared). LPT: sort jobs descending, assign each to the
   currently-least-loaded machine.
6. **Predict.** Does sorting the jobs before assigning them (LPT) ever change the
   worst-case guarantee compared to assigning them in whatever order they arrive
   (arbitrary-order list scheduling), on the same machines?
7. **Graham's tight family, reproduced and brute-force verified.** m = 2 through 5: LPT's
   makespan against the true optimum (found by brute force, not estimated) gives ratios
   7/6, 11/9, 5/4, 19/15 — each exactly 4/3 − 1/(3m), the published bound, matched to four
   decimal places at every scale.
   *Takeaway:* "LPT's bound, 4/3 minus 1 over 3m, isn't approached in the limit — Graham's
   own family hits it exactly, at every machine count checked."
8. **The classic list-scheduling worst case.** The jobs arrive unsorted this time: m(m−1)
   unit jobs, then one job of size m, in that order. Every machine fills with m−1 unit
   jobs before the big job arrives and lands on one of the tied machines: makespan 2m−1
   against a true optimum of m — exactly Graham's 2 − 1/m bound, brute-force verified at
   m = 2 and m = 3. Sorting those same jobs first (LPT) finds the true optimum instead.
   *Takeaway:* "Same machines, same jobs, one difference — sorted or not — and the
   worst-case ratio moves from 2 minus 1 over m all the way down to 4 thirds minus 1 over
   3m."
9. **Spark's own algorithm, read directly.** `FilePartition.scala`'s own comment: "Assign
   files to partitions using 'Next Fit Decreasing.'" Its real rule — close the current
   partition the moment the next file would overflow it, each file's size padded by a
   fixed open cost — is reproduced faithfully in `examples.py` and run on a skewed file
   list. It is a relative of First-Fit-Decreasing, not the same algorithm: this topic
   states which guarantee is proved (for First-Fit) and which is not (for next-fit),
   rather than assuming the 11/9 bound simply carries over.
   *Takeaway:* "A real system's own source code often implements a cheaper relative of
   the textbook algorithm — naming the difference matters more than assuming it away."
10. **Recap and handoff.** Two more guarantees, two more shapes: an asymptotic ratio with
    an additive constant for bin packing, an absolute ratio for scheduling, both still
    bounding the answer against a computable lower bound on OPT. The next topic gives up
    the proof entirely, on purpose, for problems too large or too vague for one. Local
    search and metaheuristics, next.

## Why no compiled benchmark

Every Python-side count — the Johnson family's bin counts, the small brute-force
instance, Graham's tight family at m = 2 through 5 (verified by exhaustive brute-force
search over all machine assignments, feasible at this scale), and the classic
list-scheduling worst case at m = 2 and m = 3 — is a small, deterministic computation
checked directly (`examples.py`). Spark's own algorithm is read from its real source
(`sources/spark-filepartition.txt`) and faithfully reproduced, not redesigned, per
CHAPTER.md's own framing of this piece as "the planner's own algorithm read from the
source."

## Concept ledger

- **Introduces:** `asymptotic-approximation-ratio` (the ratio-plus-constant shape, in
  contrast to topic 109's absolute ratios), `first-fit-decreasing`,
  `longest-processing-time-first`, `list-scheduling`.
- **Uses:** `approximation-ratio`, `lower-bound-on-opt` (topic 109, this chapter).
- **Declared:** `np-hard-np-complete` (Chapter 33, not live — restated in one line, as in
  topic 109); `brent-greedy-bound` (Chapter 32, not live — cited once, in one line, for
  the contrast between this topic's list-scheduling bound and a DAG's own greedy
  schedule bound, per CHAPTER.md's own framing).

## Bridge and handoff

- **Bridge from topic 109:** the identical trick — a computable lower bound on OPT,
  compared against your own answer — applied to two more NP-hard problems, with a new
  proof shape (an additive constant alongside the ratio).
- **Handoff to topic 111** (local search and metaheuristics): the next topic gives up the
  proof on purpose, for the first time in the chapter, when the search space is too
  large and the objective only an estimate anyway.

## Changes from the chapter plan

- Chapters 32 and 33 are not live in the registry as of this build (confirmed via
  `next-topic.mjs dsa --all`). Every id CHAPTER.md listed as conditional on those
  chapters is declared here instead, per CHAPTER.md's own "Ids not introduced by any
  live DSA topic" section.
- Both Wikipedia pages' own ratio formulas (FFD's 11/9·OPT + 6/9, LPT's 4/3 − 1/(3m), and
  list scheduling's 2 − 1/m) render as stripped MathML in the plain-text fetch, the same
  issue topic 109 recorded; each value is read from the rendered page by eye and
  independently re-derived and verified directly in `examples.py`, and FFD's bound is
  additionally confirmed word for word from the page's own citation title (Dósa 2007),
  which states the formula in its title text rather than as an equation.
- CHAPTER.md's planning instance for the Johnson family (6+6+6+12 items) used ε values
  without a fixed scale; this topic fixes ε = 1/100 (exact fractions throughout, via
  Python's `fractions.Fraction`) so every size and sum is exact, not floating point.
- The ILP/exact-solver lab item from CHAPTER.md's own "Lab" note is left to the
  post-notes lab section (see `post-notes.md`), consistent with the chapter plan's own
  split of the lab between this topic and topic 112.
