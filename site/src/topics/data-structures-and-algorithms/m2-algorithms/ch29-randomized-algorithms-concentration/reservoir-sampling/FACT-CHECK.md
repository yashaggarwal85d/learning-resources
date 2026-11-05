# Fact-check — dsa.reservoir-sampling

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | Reservoir sampling was introduced in 1962 by Fan, Muller and Rezucha, needing no advance knowledge of the population size | Confirmed | SOURCES.md §1 |
| 2 | Algorithm R (keep the first k, draw j uniformly from 1…i for item i > k, replace slot j if j ≤ k) was discovered independently by Waterman and by McLeod & Bellhouse | Confirmed | SOURCES.md §1 |
| 3 | Algorithm R can also be viewed as a variant of the Fisher–Yates shuffle | Confirmed | SOURCES.md §1 |
| 4 | Vitter observed that skipping sections of the stream gives a sublinear-time algorithm, and proved O(k(1 + log(n/k))) is optimal | Confirmed | SOURCES.md §1 |
| 5 | Li described Algorithm L, the skip-based algorithm achieving the same asymptotic runtime | Confirmed | SOURCES.md §1 |
| 6 | Algorithm L's pseudocode: draw W = exp(log(random())/k), skip floor(log(random())/log(1-W)) items, replace a uniformly random reservoir slot, update W | Confirmed | SOURCES.md §1 |
| 7 | Algorithm L computes three random numbers for each item that enters the reservoir, and spends no time on items that do not | Confirmed | SOURCES.md §1 |
| 8 | The Efraimidis–Spirakis algorithm (named "A-ES" by the fetched source) draws a key u^(1/w) per item and keeps the m/k items with the largest keys | Confirmed | SOURCES.md §2 |
| 9 | Weighted random sampling without replacement has (at least) two distinct interpretations of "weight": probability of appearing in the final sample, vs. probability of being selected at each draw | Confirmed | SOURCES.md §2 |
| 10 | Exponential jumps can be used with algorithm A-ES, per the fetched source — but no standalone name ("A-ExpJ") for that variant appears in it | Confirmed (absence) | SOURCES.md §2 |
| 11 | Apache Spark's `SamplingUtils.reservoirSampleAndCount` implements Algorithm R: "There are k elements in the reservoir, and the l-th element has been consumed. It should be chosen with probability k/l." | Confirmed | SOURCES.md §3 |
| 12 | `RangePartitioner.sketch` returns, per partition, both the item count and the sample, via reservoir sampling | Confirmed | SOURCES.md §4 |
| 13 | The weight Spark's range partitioner assigns a partition's sample is 1 over the sampling probability | Confirmed | SOURCES.md §4 |
| 14 | Spark's `takeSample` is not a reservoir sample: it counts the RDD, computes a sampling fraction with a high-confidence bound, samples with that fraction, and retries if the sample came back too small | Confirmed | SOURCES.md §5 |
| 15 | n = 10, k = 3 inclusion frequencies (≈0.3 each); n = 1,000,000, k = 100 draw counts for R (999,900) and a measured L run; the weighted example (heavy item 0.934, light items ≈0.266, naive guess 1.43); the two-reservoir merge frequencies (≈0.3 each) | Confirmed by direct computation | `examples.py`, run and asserted |

## Red team

- **Is the "A-ES" vs. "A-Res" naming discrepancy actually a problem?** `CHAPTER.md` names the
  algorithm "A-Res" with a jump variant "A-ExpJ," attributed to the 2006 Efraimidis–Spirakis
  paper, which the plan itself marks as not read. The fetched companion paper (Efraimidis
  alone, arXiv:1012.0256) calls the same algorithm "A-ES" throughout and never uses "A-Res" or
  "A-ExpJ." Since the 2006 paper itself was never opened, there is no fetched source for either
  of the plan's two names — so this topic states only "A-ES," the name a real fetched source
  gives, and flags the discrepancy here and in `OUTLINE.md`'s "Changes from the chapter plan"
  rather than asserting an unconfirmed name on screen.

- **Is the weighted example's number (0.934) really not 10/14 × 2?** Checked two ways in
  `examples.py`: a direct 100,000-run simulation of `weighted_sample_once` (giving 0.934,
  matching the chapter plan's own planning-time figure), and the arithmetic fact that
  10/14 × 2 = 1.43 is not a valid probability at all (greater than 1), which by itself refutes
  the naive guess without needing the simulation — two independent reasons the naive answer is
  wrong, not one simulation that could be a fluke.

- **Does the merge actually need both n1 and n2, not just one?** Checked directly:
  `merge_reservoirs` draws each output slot from reservoir 1 with probability
  `n1/(n1+n2)` — a function of *both* counts, not n1 alone (doubling n2 while holding n1 fixed
  changes the draw probability from 7/10 to 7/13 in the running example). `examples.py`'s
  100,000-run simulation at n1=7, n2=3, k=3 confirms every one of the ten items lands in the
  merged sample 0.299–0.302 of the time, consistent with the uniform 0.3 the proof predicts.

- **Predict-distractor plausibility.** Step 2's wrong options (a half; a fixed small number;
  one over n) are each a rule a learner could plausibly reach for: "a half" treats every
  replacement decision the same regardless of how much the stream has grown; "a fixed small
  number" undersamples early items; "one over n" is the probability of landing in one specific
  slot, not the probability of being chosen to replace *something*. Step 7's distractors ("no,
  every item must be examined"; "only if k = 1"; "only with extra memory") each misdiagnose
  what Algorithm L actually trades away (examination for random-number generation, not memory
  or generality). Step 11's distractors are the two unweighted interpretations collapsed
  wrongly into one, or a non-answer ("neither — only rank matters"), each plausible to someone
  who has not yet seen the heavy-item example.
