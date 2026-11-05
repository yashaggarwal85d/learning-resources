---
id: dsa.bin-packing-makespan-scheduling
title: Bin packing and makespan scheduling
---

<section data-section="outcomes">

## After this topic you can

- State First-Fit Decreasing's bound (11/9·OPT + 6/9) in its own additive-constant shape, and explain why that shape matters most at small OPT.
- Tell a volume-based lower bound on OPT apart from a proved optimum, and know which claims a volume bound alone can and can't support.
- Prove and compute LPT's 4/3 − 1/(3m) makespan bound for identical machines, and contrast it with plain list scheduling's weaker 2 − 1/m bound on the same job set.
- Recognize when a real system's own algorithm (Spark's "Next Fit Decreasing") is a cheaper relative of a textbook algorithm, not the same one, and why a proved guarantee doesn't automatically transfer.

</section>

<section data-section="internals">

## Into the internals

### Why First-Fit Decreasing's bound has a constant, not just a ratio

The 11/9 ratio alone would be a clean asymptotic statement, but small instances break a ratio-only bound: at OPT = 1, any algorithm using 2 bins already exceeds 11/9 by a wide margin in relative terms, even though it's off by only one bin in absolute terms. Dósa's proof produces an absolute inequality on bin counts (FFD(I) ≤ 11/9·OPT(I) + 6/9) precisely so the statement holds at every OPT, including small ones, without pretending the ratio itself is the whole story at small scale.

### Why LPT's proof is a case analysis, not a counting argument

LPT's bound comes from asking: where does the job that finishes last end up? Graham's proof fixes attention on the single job assigned last to the machine that ends up maximal, and bounds how much every other machine's load could have grown before that job was placed, given that LPT always picks the currently-least-loaded machine. That's a structural argument about one job's position, entirely different in shape from FFD's charge-and-sum volume argument — the two proofs share only the outer pattern of "bound against a computable lower bound on OPT," not any proof machinery.

</section>

<section data-section="lab">

## In the lab

Take the Johnson tight family in `examples.py` (30 items, four sizes near 1/2, 1/4, 1/4, 1/4) and shrink epsilon from 1/100 to 1/1000: confirm FFD still uses 11 bins against the same volume floor of 9 (already checked in `FACT-CHECK.md`'s red team section — rerun it yourself and watch what happens as epsilon approaches zero). Separately, extend Graham's family past m = 5: does the exact ratio 4/3 − 1/(3m) keep landing exactly, or does floating-point or integer rounding in the job sizes start to matter at larger m?

</section>

<section data-section="production">

## In production

Apache Spark's `FilePartition.scala` packs file splits into partitions with a "Next Fit Decreasing" rule — cheaper than full First-Fit because it only ever checks the single most recently opened partition, never reopening an earlier one. That's a deliberate engineering trade: a weaker packing guarantee in exchange for not having to scan every open bin on every placement, which matters when a real planner is packing thousands of files into partitions on every query plan. LPT-style scheduling shows up directly in multi-worker build systems and render farms, where jobs (compile units, frames) are assigned to a fixed pool of identical workers and sorting the longest jobs first measurably shortens the total wall-clock time against submitting them in arrival order.

</section>

<section data-section="frontier">

## The frontier

Both bounds in this topic are for the single easiest case of their problem family: bin packing with a single bin size, and scheduling on machines that all run at identical speed. Real packing problems often have multiple bin sizes or higher-dimensional items (2D or 3D bin packing), and real scheduling problems often have machines that run at different speeds (uniformly related) or are good at different jobs (unrelated machines) — both needing a different algorithm family with its own, generally weaker, bounds, not covered in this topic's scope per `CHAPTER.md`.

</section>

<section data-section="questions">

## More questions

- Dósa's 6/9 additive constant and the 11/9 ratio were both found specifically to be tight together. Would a slightly larger ratio (say 12/9) allow a *smaller* additive constant, or are the two locked together by the same construction?
- Spark's partitioning code ties with true FFD's bin count on the one skewed instance tested in `examples.py`. What property would a constructed input need to make Spark's next-fit variant strictly worse than FFD on the same items?

</section>

<section data-section="next">

## Where this goes next

Two more shapes of the same lower-bound trick — an asymptotic ratio plus a constant for packing, a flat ratio for scheduling — both measured against a computable lower bound neither algorithm ever actually computes. The next topic gives up the proof entirely, on purpose, for problems whose search space is too vast and whose objective is only ever an estimate anyway: local search and metaheuristics.

</section>
