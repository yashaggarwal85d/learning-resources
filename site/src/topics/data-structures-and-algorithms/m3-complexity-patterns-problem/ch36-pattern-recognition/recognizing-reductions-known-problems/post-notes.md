---
id: dsa.recognizing-reductions-known-problems
title: Recognizing reductions to known problems
---

<section data-section="outcomes">

## After this topic you can

- For each of six shapes, state the structural fact the input must have and one near-miss that breaks it, and say which of the near-misses is NP-hard.
- Say in which direction a reduction runs when the goal is an algorithm and in which when the goal is a hardness proof, and why the two are the same idea.
- Given an unseen problem statement, write the recognised pattern, the target complexity, the key invariant and the one condition that would make the recognition wrong.

</section>

<section data-section="internals">

## Into the internals

### Why the direction of a reduction flips the conclusion

A reduction is always a many-one mapping from one problem's instances to another's, plus a way to map the answer back. What that mapping proves depends entirely on which problem is known and which is new. Mapping a new problem *into* a known-hard one, and showing the known-hard problem can be solved by first solving the new one, proves the new problem is at least as hard — the direction Chapter 33 teaches, used to prove hardness. Mapping a new problem *into* a known-easy one, and solving it there, proves the new problem is at most as hard as the easy one — the direction this topic teaches, used to get an algorithm. The mapping machinery is identical; only which side is "known" and which conclusion follows changes.

### Why two SAT and three SAT split cleanly into easy and hard

An implication graph's strongly connected components answer two-SAT because each clause of two literals translates into exactly two directed implications, and the resulting graph is a plain directed graph that a standard linear-time algorithm already handles. A clause of three literals does not translate into a single implication at all — "at least one of three must be true" is not equivalent to any one directed edge, so the entire implication-graph construction collapses, and no comparably simple structure is known to replace it. The jump from two to three literals per clause is not a matter of the same method running slower; it removes the very property (two literals, one implication) the method depends on.

</section>

<section data-section="lab">

## In the lab

Take the reviewer-assignment instance in `examples.py` and shrink the reviewer capacity from two papers down to one. Does the maximum flow still reach the full demand of eight reviews, or does the instance become infeasible — and if it becomes infeasible, what is the largest number of reviews now achievable, confirmed again by both the flow computation and the brute-force search? Separately, take the two-SAT instance and change exactly one clause so that the formula becomes unsatisfiable; find which two literals now land in the same strongly connected component, and explain in one sentence why that pair proves no satisfying assignment exists.

</section>

<section data-section="production">

## In production

A recognition procedure this short is only worth having if it is actually run before reaching for code, and the discipline that keeps it honest is writing the falsifier, not just the pattern name. A scheduling system that silently assumes "interval scheduling" when the real workload has per-job setup costs will ship a greedy algorithm that is provably optimal for a problem it is not actually solving — the code runs, the guarantee it is quietly relying on does not hold, and the gap only shows up as a worse schedule than expected, with no error anywhere to point at. The habit of stating what would have to be true for the recognition to be wrong is what catches this before it ships, not after.

</section>

<section data-section="frontier">

## The frontier

Several of the shapes and near-misses in this topic have well-studied extensions this course does not build: minimum-cost flow and the Hungarian algorithm generalize flow and matching to weighted assignment problems; the blossom algorithm extends bipartite matching to general graphs in polynomial time, despite the odd-cycle near-miss shown here; and modelling a hard problem as an input to a SAT solver or an integer-programming solver, rather than solving it by hand, is itself a production strategy for problems this chapter's shapes don't cover cleanly. All three are *(skipped)* in this syllabus (Chapter 20 for the first two) and are named here only as honest pointers, with no claim beyond that.

</section>

<section data-section="questions">

## More questions

- The odd-cycle near-miss shown here uses a three-vertex triangle, the smallest possible odd cycle. Does every general graph with an odd cycle anywhere in it actually lose the bipartite structural test, or can a graph be "mostly bipartite" with the matching problem still tractable by the easier method on most of it?
- This topic's recognition procedure ends on writing a falsifier, but never asks what to do once the falsifier turns out to be true — once a near-miss is confirmed, is the next step always "fall back to brute force," or does each near-miss have its own next-best option (an approximation, a different exact algorithm, a reduction to a different known problem)?

</section>

<section data-section="next">

## Where this goes next

That is the whole skill, and it is a habit more than a body of knowledge: read the size, read the operations, read the situation as a graph, match it to a shape and check what would break the match. Everything so far was the textbook object, in a textbook problem. The same objects do their work somewhere with more at stake: inside a database engine or a data pipeline, where a hash table is not a hash table but a build phase and a probe phase that must spill to disk when memory runs out, and where the choice of structure decides whether a query takes a second or a day. The next chapter takes each structure you have met and shows what it becomes there. Hash tables inside hash joins, next.

</section>

<section data-section="lab-protocol">

## The chapter's Lab: a recognition practice protocol

Take thirty unseen problem statements. For each, within five minutes, write down only three things: the recognised pattern or shape, the target complexity it implies, and the key invariant the chosen technique relies on. Do not solve the problem yet. Once all thirty are recognised, go back and actually solve each one, then score two things separately: whether the recognised pattern was correct, and whether the stated complexity was within one growth class of the truth. For every miss, log the specific trigger word or structural detail that was misread, not just "got it wrong" — a signal word that pointed the wrong way, a near-miss condition that was missed, or a shape that was assumed without checking its structural fact. Practising against the logged triggers, rather than re-solving the same thirty problems, is what the chapter's own framing ("recognition is a check against a list of necessary conditions") is built to support: the error worth fixing is in the recognition step, not in the algorithm once it is correctly chosen. This topic supplies the protocol and the scoring sheet; the thirty problems themselves are left to whoever runs the Lab, chosen from a public source with a checked licence or written fresh.

</section>
