# Fact-check — dsa.pseudo-polynomial-time-strong

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | A problem is strongly NP-complete if it remains NP-complete even when all its numerical parameters are bounded by a polynomial in the input's length | Confirmed | SOURCES.md §1 |
| 2 | Bin packing is strongly NP-complete; the 0-1 knapsack problem is only weakly NP-complete | Confirmed | SOURCES.md §1 |
| 3 | A weakly NP-hard problem may have a pseudo-polynomial time algorithm; the partition problem is an example | Confirmed | SOURCES.md §1 |
| 4 | A strongly NP-hard problem does not have a pseudo-polynomial time algorithm, nor a fully polynomial-time approximation scheme; 3-partition is an example | Confirmed | SOURCES.md §1 |
| 5 | The decision form of the knapsack problem (can a value of at least V be achieved without exceeding weight W) is NP-complete | Confirmed | SOURCES.md §2 |
| 6 | Knapsack has a pseudo-polynomial time algorithm using dynamic programming | Confirmed | SOURCES.md §2 |
| 7 | The O(nW) runtime is pseudopolynomial, not polynomial in the input's length, which is why it does not contradict knapsack's NP-completeness; this makes knapsack a weakly NP-complete problem | Confirmed | SOURCES.md §2 |
| 8 | Bin packing is strongly NP-complete, proven by reducing the strongly NP-complete 3-partition problem to it | Confirmed | SOURCES.md §3 |
| 9 | Bin packing is solvable in pseudo-polynomial time for any fixed number of bins K, and in polynomial time for any fixed bin capacity B | Confirmed | SOURCES.md §3 |
| 10 | 3-partition is a strongly NP-complete problem: deciding whether a multiset of integers can be partitioned into equal-sum triplets | Confirmed | SOURCES.md §4 |
| 11 | 3-partition remains NP-complete even when its integers are bounded above by a polynomial in n (equivalently, written in unary) | Confirmed | SOURCES.md §4 |
| 12 | `pseudo-polynomial` is already a live concept (Chapter 1 topic 1), not re-introduced here | Confirmed | Chapter 1 topic 1's registry entry, read directly |
| 13 | Garey and Johnson (1978, 1979) are the origin of the strong/weak NP-hardness distinction; Backurs and Indyk (STOC 2015) is a fine-grained-complexity result named for the post-notes frontier | Named, not read, exactly as the chapter plan anticipated | SOURCES.md's "Named, not read" note |
| 14 | Every number on screen (the cell counts at ten/twenty/forty bits, the timed doubling-per-bit growth, the unary/binary length gap, the three-partition call-count blow-up, the K-fixed bin-packing table sizes) | Confirmed by direct computation | `examples.py`, run and asserted |

## Red team

- **Is the "pseudo-polynomial" DP actually O(n·W), or asserted without running it?** `examples.py`
  implements the standard 0/1 knapsack dynamic program and checks its output against a brute-force
  solver on twenty random small instances, confirming correctness before the cell-count and
  timing claims are trusted.
- **Are the hundred-thousand / hundred-million / hundred-trillion cell counts computed fresh, or
  copied from the chapter plan?** Computed fresh as `n * 2**b` for n = 100 and b = 10, 20, 40 in
  `examples.py`, and asserted equal to the exact integers (102,400; 104,857,600;
  109,951,162,777,600), which the plan's own rounded figures approximate.
- **Does the measured timing actually show roughly-doubling growth, or is that asserted without
  measurement?** `examples.py` times the same dynamic program at six increasing bit lengths (12
  through 17) on the same machine, in the same run, and asserts the average ratio between
  consecutive bit lengths' times falls in a band consistent with doubling (not exactly 2.0 every
  time, since wall-clock timing is noisy, but well above 1 and well below 4).
- **Does the three-partition instance actually stay small while the search blows up, or is a
  large instance disguised as small?** Every generated instance has every individual number
  bounded by thirty, checked directly (`assert max(...) < 10` style bound in the smallest case,
  and the generator's own bounds in the larger ones); the call count is counted by direct
  instrumentation of the backtracking search, not estimated.
- **Is the bin-packing K-fixed table size a real pseudo-polynomial claim, or just an unverified
  formula?** `examples.py` both computes the formula `(capacity + 1) ** k` and runs an actual
  feasibility search with K bins fixed on a concrete instance, confirming the search finds a
  packing with three bins and correctly reports infeasibility with only one.
- **Predict-distractor plausibility.** Step 2's distractors test the natural but wrong
  generalization from knapsack to bin packing (that any NP-complete problem with numbers in it
  has the same kind of escape); step 8's distractors test the natural but wrong generalization
  from partition to three-partition (that small numbers always rescue a problem), which is
  exactly the mistake strong NP-hardness is defined to rule out.
- **Does the topic overclaim about Garey and Johnson's original paper or book?** No specific
  sentence is attributed to either directly; both are named in SOURCES.md's "Named, not read"
  section as the origin the Wikipedia pages themselves cite, consistent with CHAPTER.md's own
  instruction for this exact case.
- **Does declaring `knapsack-dynamic-program` instead of using topic 75's id risk a mismatch
  later?** The registry was checked directly before this topic's build and topic 75 ("Knapsack
  and coin change") is not present as a live entry, so CHAPTER.md's own fallback instruction
  applies; this is recorded in OUTLINE.md's "Changes from the chapter plan" for a later release
  to reconcile if topic 75 ships afterward.
