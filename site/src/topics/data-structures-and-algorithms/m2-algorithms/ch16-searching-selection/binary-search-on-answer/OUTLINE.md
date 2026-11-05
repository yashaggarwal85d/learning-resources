# OUTLINE: Binary search on the answer

A full topic, about 14 minutes. Second topic of Chapter 16. No compiled benchmark needed —
every number is a small, exact count, computed and asserted in `examples.py`.

## Storyboard

1. **Hook / bridge.** The handoff from topic 55: the same loop answers a very different
   question when the thing being tested is any yes/no test that flips exactly once as a
   parameter grows, not an array lookup. A courier needs the smallest truck capacity that
   lets every package ship within a fixed number of trips; testing capacities one at a
   time is slow, and binary search needs only a handful of tries.
2. **Predict.** A packing feasibility check (does this capacity need at most this many
   trips) is monotone in capacity — but what happens if a caller binary-searches a
   predicate that *isn't* actually monotone?
3. **Reframe: search the answer, not the array.** The candidate space is now capacities,
   not indices; the predicate is "is this capacity enough," checked by a greedy packing
   pass, not an array comparison. The same half-open loop, the same overflow-safe
   midpoint, with the predicate swapped out.
4. **The precondition, broken on purpose.** A genuinely non-monotone predicate (true,
   false, true, true, false) handed to the identical loop: the loop still terminates and
   returns *something*, confidently — but it is not the first true position, and the loop
   has no way to notice its own precondition failed.
   *Takeaway:* "Binary search on a non-monotone predicate doesn't fail loudly — it just
   returns the wrong answer, confidently."
5. **Real-valued bisection.** The same idea over a continuous range instead of integers:
   no "next" value to converge to exactly, so the loop stops at a precision bound instead
   of an empty range. Bisecting for the square root of two.
6. **Predict.** Doubling the required precision — does it double the number of
   iterations, or something smaller?
7. **The iteration count, independent of the predicate's own cost.** `ceil(lg(span /
   epsilon))`: the identical halving argument from topic 55, now over a continuous range,
   completely indifferent to how expensive the predicate itself is to evaluate.
   *Takeaway:* "Doubling the precision costs exactly one more iteration, not twice the
   work — the halving argument doesn't care what's being halved."
8. **Parametric search, named.** Megiddo's own framing: a decision procedure (does a
   value this good exist) composed with an outer binary search over candidate values
   gives an optimisation procedure (find the best one) — the general pattern every
   worked example in this topic has been an instance of, with Megiddo's own caveat that
   it is not always the fastest route to a given answer.
9. **Recap and handoff.** Every search in this chapter so far has assumed order already
   exists to exploit. The next topic's order is hidden — a rotated array, or a matrix
   sorted two different ways — and the first job is recognising which invariant actually
   applies. Search in rotated and sorted matrices, next.

## Why no compiled benchmark

Every outcome here — the feasibility search's answer and iteration count, the
non-monotone predicate's wrong result, the bisection iteration counts — is a small,
exact, deterministic computation, checked directly in Python; no timing claim is made
anywhere in this topic.

## Changes from the chapter plan

None: the topic keeps to its `CHAPTER.md` entry. Megiddo's own *Journal of the ACM* paper
sits behind a paywall this session could not reach; `SOURCES.md` cites it through
Wikipedia's own quoted summary of the technique and Megiddo's own stated caveat, both
read directly, rather than through the paper's abstract — recorded honestly in
`FACT-CHECK.md` rather than presented as if the primary paper itself were opened.
