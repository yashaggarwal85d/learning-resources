# FACT-CHECK: Binary search on the answer

## Claims table

| # | Claim | Source | Verified how |
|---|---|---|---|
| 1 | A feasibility predicate (does capacity c need at most k trips) is monotone in capacity: once true, it stays true for every larger capacity | This topic's own construction | Checked directly in `examples.py` by evaluating the predicate at every integer capacity from the maximum package weight to the total weight, confirming no true-then-false transition occurs |
| 2 | The minimum capacity for [7, 2, 5, 10, 8] in two trips is 18 | This topic's own worked example (a well-known instance of the "split array, minimise largest sum" problem) | Computed by binary search on the answer in `examples.py`, confirmed independently by brute force over every candidate capacity |
| 3 | A non-monotone predicate handed to the identical search loop terminates and returns an index, but not the predicate's own first true position | This topic's own construction | Constructed directly in `examples.py`: the predicate [true, false, true, true, false] is not monotone (a true at index 0 is followed by a false at index 1); the search returns index 2, while the true predicate holds at indices 0, 2 and 3 — the search misses index 0 entirely |
| 4 | Real-valued bisection for √2 converges to within the given precision in a number of iterations matching ⌈log₂(span / ε)⌉ | Standard halving argument (not a quoted source; the same argument topic 55 proves for integer ranges, extended here to a continuous one) | Checked directly in `examples.py`: bisecting [1, 2] to a precision of one in a million takes exactly 20 iterations, matching the formula |
| 5 | Halving the required precision costs exactly one more iteration, not twice the iterations | Direct consequence of the halving argument | Checked across five different precisions (1e-2 through 1e-6) in `examples.py`; every pair (ε, ε/2) differs by exactly one iteration |
| 6 | Parametric search (Megiddo, 1983) transforms a decision algorithm into an optimisation algorithm | Wikipedia, "Parametric search" | Word-for-word quoted in SOURCES.md |
| 7 | Megiddo's own paper states the technique is not always the fastest route to a given answer, only that it often matches or beats the best known running time for harder problems | Wikipedia, "Parametric search" (quoting Megiddo's own stated remark) | Word-for-word quoted in SOURCES.md |

## Currency check

- The Wikipedia page was fetched 2026-11-05. Megiddo's own primary paper (*Journal of the ACM* 30(4), 852–865, 1983, DOI `10.1145/2157.322410`) sits behind the ACM Digital Library's paywall, which this session could not reach; this is recorded honestly rather than presented as if the primary text had been opened. Every claim this topic makes about the technique's name, year, and Megiddo's own stated caveat is sourced to Wikipedia's own quoted text, which itself cites the 1983 paper — the topic does not claim to have read the paper directly.
- No numeric claim in this topic rests on the unread primary paper: the technique is named and its general shape described, but no specific running-time bound from the paper itself is asserted as a fact this topic's own examples measure.

## Red team

1. **The "minimum capacity" worked example is a well-known problem instance** (the classic "split array into k parts to minimise the largest part sum" problem, for which [7, 2, 5, 10, 8] with k = 2 giving 18 is a commonly cited example in algorithms teaching material) — this topic does not claim the specific numbers are original, only that they are independently verified by brute force in `examples.py`, which they are.
2. **The non-monotone predicate example is a deliberately constructed counter-example**, not a real-world scenario — stated as such in the reel's own caption ("the search isn't slow here... answering a question that doesn't have the kind of answer it assumes"), not presented as if non-monotone predicates commonly arise by accident in production code.
3. **Parametric search is named but not built**: this topic's own worked examples (the capacity search, the bisection) are each simple instances of "decision procedure plus outer binary search," but neither uses Megiddo's own advanced machinery (simulating a parallel decision algorithm). This is stated explicitly in `coverage.json`'s `out` items and in post-notes, not left for the reader to assume the topic has built the full technique.
4. **The real-valued bisection's midpoint, `(lo + hi) / 2`, has no integer-overflow analogue** here, since `lo` and `hi` are small bounded floats, not array indices that could be billions apart — this is stated directly in `examples.py`'s own comment, so a reader does not wrongly expect topic 55's overflow concern to reappear in the real-valued case.

## Corrections applied

- The non-monotone predicate's expected search result was initially assumed to be index 0 (the first true position) by analogy with "the search always finds something near the front." Tracing the actual loop by hand (and confirming in `examples.py`) showed it returns index 2 instead — corrected before the claim reached `OUTLINE.md`, and used as the topic's own worked example of exactly how a broken precondition misleads intuition, not only code.
