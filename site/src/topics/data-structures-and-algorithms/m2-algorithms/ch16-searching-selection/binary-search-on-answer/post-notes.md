---
id: dsa.binary-search-on-answer
title: Binary search on the answer
---

<section data-section="outcomes">

## After this topic you can

- Reframe a feasibility question as a monotone predicate over a candidate answer and binary-search it, stating the precondition (monotonicity) explicitly.
- Run bisection on a real-valued range to a stated precision and give its iteration count from the formula.
- State what parametric search is, in Megiddo's own framing, and name one problem it generalises binary-search-on-the-answer to.

</section>

<section data-section="internals">

## Into the internals

### Why monotonicity is the whole precondition

Binary search's own correctness proof (topic 55) rests on exactly one fact: there is a single index (or value) where the predicate's truth value flips, once, and never flips back. Every step of the loop narrows toward that one flip point. A predicate that flips more than once has no single flip point for the loop to narrow toward, so the loop still runs — it has no way to detect the violation — but the position it converges to is an artefact of which flip its particular sequence of midpoints happened to land near, not a meaningful answer.

### The real-valued case needs no overflow guard

Topic 55's overflow-safe midpoint exists because array indices can be billions apart, each individually small, but summing to more than a fixed-width integer can hold. A real-valued bisection's `lo` and `hi` are typically both small, bounded floating-point numbers describing the same physical quantity (a rate, a time, a capacity), so their sum essentially never approaches a floating-point overflow in practice; the naive midpoint `(lo + hi) / 2` is the one actually used in `examples.py` for this reason, stated explicitly rather than left for a reader to wonder why the "safe" form from the previous topic doesn't reappear here.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds a greedy feasibility check for "can these packages ship in at most k trips at this capacity," confirms directly (not merely asserted) that it is monotone in capacity across the full candidate range, and binary-searches it to the known answer (18, for the chapter's own five-package example), cross-checked against a brute-force scan over every candidate capacity. It then constructs a genuinely non-monotone predicate and runs the identical search loop on it, confirming the loop returns a position (index 2) that is not the predicate's own first true position (index 0) — the topic's own demonstration that the algorithm has no way to detect its precondition failing. Real-valued bisection for the square root of two is run to a precision of one in a million, confirmed to take exactly twenty iterations, matching the formula `⌈log₂(span / ε)⌉`; the doubling relationship (halving ε costs exactly one more iteration) is checked across five different precisions, not just one pair.

</section>

<section data-section="production">

## In production

"Binary search on the answer" is a named pattern in competitive programming and systems engineering alike: a load balancer finding the smallest number of servers that keeps latency under a target, a build system finding the smallest timeout that doesn't flake, a video encoder finding the highest bitrate that fits a size budget — each is an instance of searching a monotone feasibility predicate over a candidate answer, exactly the shape this topic builds. Parametric search in its advanced (parallel-decision-algorithm) form is a research technique used in computational geometry; it is named here only as the general pattern this topic's basic examples instantiate, not built.

</section>

<section data-section="frontier">

## The frontier

Megiddo's own 1983 paper and Cole's 1987 refinement (replacing the simulated decision algorithm with an efficient parallel one, cutting the number of decision-procedure calls needed) sit behind this topic's own reach this session — the primary text is paywalled and was not opened. What is taught here is only what Wikipedia's own quoted summary of the technique and Megiddo's own stated caveat support; a reader wanting the parallel machinery itself should start from the *Journal of the ACM* paper directly.

</section>

<section data-section="questions">

## More questions

- This topic's non-monotone example was deliberately constructed to break the search. Can you think of a real feasibility question that looks monotone at first but secretly isn't — where the mistake would be easy to make by accident, not on purpose?
- The real-valued bisection here never needed an overflow-safe midpoint. Is there a real-valued search where a naive midpoint actually could cause a problem, and what would that problem look like for floating-point numbers instead of integers?

</section>

<section data-section="next">

## Where this goes next

Every search in this chapter so far has assumed that order already exists to exploit, whether in an array or in the answer space. The next topic's order is hidden in a different way — a rotated array, or a matrix sorted two different ways — and the first job is recognising which invariant actually applies before any loop can be written at all. Search in rotated and sorted matrices, next.

</section>
