# OUTLINE: Asymptotic notation and case analysis (`dsa.asymptotic-notation`)

Reconstructed on 2026-10-11 from the topic's files (the topic was built without an outline), then brought in line with the section-4 content review of the same day. The files are the source of truth; this plan describes them.

- **Syllabus line (DSA §1.1, refresher):** "Asymptotic notation and case analysis — O/Θ/Ω/o/ω; best, average, worst, expected and with-high-probability bounds; time vs space trade-offs."
- **Previous topic:** none. This is the first topic of Data Structures & Algorithms.
- **Next topic (§1.1):** "The word-RAM model and its assumptions — unit-cost operations on w ≥ log n-bit words, what that hides (cache misses, branch mispredicts), and why integer-key structures (radix sort, van Emde Boas trees, fusion trees) beat comparison-model bounds."
- **Kind:** refresher, about 6 minutes, 12 steps, 2 predict questions, recap step.

## Learning outcomes

1. State O, Ω, Θ, o and ω with their quantifiers, produce witnesses for a bound, and say why 2²ⁿ is not O(2ⁿ).
2. Separate the two questions inside any complexity claim: which function (best, average, worst, expected case) and which inequality (O, Ω, Θ).
3. Say what an average-case, an expected-time and a with-high-probability bound each promise, which of them a latency target needs, and recognise an amortized bound (§1.2) as a third kind of promise.
4. Name both resources in a time-space trade-off and what is counted, and spot a bound stated in the value of a number instead of its length.

**The problem (opened in step 1, closed in step 12):** "quicksort is O(n log n)" hides three choices: which bound, which case, which resource. Decoded at the end: an upper bound on *expected* time with random pivots; with a fixed pivot the worst case is Θ(n²).

## Reel steps and storyboard

Canvas: 600 units wide, height per step as given; the same layout serves portrait, where text is scaled by 1.22, so every label is sized to fit at that scale. Colours from the coffee palette: caramel for the good or bounded, cherry for the bad or growing, latte and crema for text. Every number on screen is computed or asserted in `examples.py`.

1. **Every cost claim has three parts** (`Opening`, h 360). Visual idea: a claim is three answers, so three cards. Cards slide in on beats 0.2 / 0.6 / 1.0 s: "Which bound?" (O, Ω, Θ, o, ω: how the function relates), "Which case?" (best, worst, average, expected: which function we bound), "Which resource?" (time, space: what is counted). Caption: the course starts with the language costs are stated in; the quicksort claim hides three choices; swipe on if familiar. Bridge shown here.
2. **O, Ω, Θ are inequalities with witnesses** (`Sandwich`, h 380). Visual idea: Θ as a sandwich that only closes from n₀ on. Axes at the bottom (x 50–550, n 0–16); dashed 4n² and 3n² bounds; the caramel 3n² + 10n curve draws left to right over 3 s; a legend in the empty top-left names the three curves (the tips are too close to label). The dotted n₀ = 10 line lights up as the sweep passes it, and the headline flips from "below n₀ the top line is still crossed" to "from n₀ on, always between: Θ(n²)". Real values: at n = 9, 333 > 324; c₁ = 3, c₂ = 4, n₀ = 10. Caption: the definition with "every n ≥ n₀"; constants may not depend on n.
3. **A constant factor is fine; an exponent is not** (`PowerRatios`, h 360, predict). Visual idea: two rows of ratio bars for n = 1…10; 2ⁿ⁺¹/2ⁿ stays at 2 (caramel); 2²ⁿ/2ⁿ (cherry) stays hidden until the answer, then shoots up as 2ⁿ. Question: "Is 2²ⁿ also O(2ⁿ)?" Options: "Yes, 2 is a constant" / **"No"** (correct) / "Only for large n" / "Yes, it is Θ". Answer: 2²ⁿ = 4ⁿ, the ratio 2ⁿ is unbounded, so no c works; log bases, unlike exponents, differ by a constant.
4. **o and ω are strict: read the ratio** (`Ratios`, h 380). Visual idea: the ratio f/g at n = 10, 1,000, 1,000,000 decides. Three cards (n log n vs n² → 0 so o; 3n² + 10n vs n² → 3 so Θ, not o; n² vs n log n → ∞ so ω), values computed in the scene (tiny or huge values as exponents). Caption: "for every c > 0", n₀ may depend on c; the limit test is sufficient, not necessary (n against n·(2 + sin n)).
5. **Bound and case are different axes** (`CaseGrid`, h 380). Visual idea: three bars for one algorithm, each a different function. Insertion sort, n = 8: best 7 (n − 1, Θ(n)), average 19.3 (n(n−1)/4 + n − Hₙ, Θ(n²)), worst 28 (n(n−1)/2, Θ(n²)); bars grow in turn; footnote "each row is its own function, with its own O, Ω, Θ". Caption: "O is worst case" is the slip; a case picks a function, a bound relates it; "worst case is O(n³)" is true but loose; checked over all 40,320 orders.
6. **Average over inputs, or expected over coins** (`PivotChoice`, h 330, predict). Visual idea: the same sorted input, two pivot rules. First-pivot bar fills to 499,500; the random-pivot bar stays "?" until answered, then fills to 10,986. Footnote: "the coins are the algorithm's: no input is bad, only an unlucky run". Question: expected comparisons with a random pivot on the same sorted input? Options: "About 499,500" / "About 250,000" / **"About 10,986"** / "About 1,000". Answer: 2(n+1)Hₙ − 4n, the same for every input order; first-pivot quicksort averages the same count over random orders (same number, different promise); average case rests on an input distribution, expected time holds for every fixed input.
7. **Expected is not a guarantee; w.h.p. is a tail** (`Spread`, h 380). Visual idea: the histogram of 2,000 seeded runs, buckets of 1,000 from 9k; the two tail buckets in cherry. Values: 55, 1,086, 704, 139, 13, 2, 1, 0; mean 10,991, fastest 9,449, slowest 15,583. Footnote: a thin tail here; only a w.h.p. bound promises one. Caption: for every c there is a constant a with at most a·n·log n steps with probability ≥ 1 − 1/nᶜ; a bigger c costs only a bigger a; services are judged on tails.
8. **Time and space trade, so name both** (`TimeSpace`, h 380). Visual idea: three cards with two number columns, steps and extra values. 1,000 distinct numbers, no duplicate (worst case): every pair 499,500 / 0 (time n²); heapsort in place then scan 17,830 / 0 (time n log n); hash set 1,000 / 1,000 (expected time n). Caption: say what you count; the hash set's O(1) lookups hold only in expectation.
9. **The constant hides inside the O** (`Crossover`, h 380). Visual idea: 100n and n² drawn together; the dotted n = 100 line lights up as the sweep crosses it, headline flips to "past n = 100, 100n is the cheaper one". Caption: asymptotics describe growth, not speed at a size; measure when n is small or constants differ.
10. **n is the size of the input, in bits** (`BitsNotValue`, h 330). Visual idea: the input only doubles, the work explodes. Two cards: a 32-bit prime 65,534 trial divisions; a 64-bit prime 4 billion+; footnote "32 more bits of input: about 65,536 times the steps". Caption: O(√v) in the value is 2^(b/2) in the length b; pseudo-polynomial.
11. **The ladder, at a million items** (`Ladder`, h 360). Visual idea: one row per growth rate, bar length = time on a log scale from 1 ns to 585 years (labelled). n = 10⁶ at an assumed 10⁹ steps/s: log n 19.9 steps, 20 ns; n log n 20 million steps, 0.02 s; n² 1 trillion steps, 16.7 min; 2ⁿ at n = 64, 1.8 × 10¹⁹ steps, 585 years. Caption ends: every count assumes each step costs the same; hold that thought (sets up the handoff without giving it early).
12. **In one breath** (`Recap`, h 380). Seven cards: O, Ω, Θ; o, ω; bound ≠ case; average ≠ expected; w.h.p.; time ↔ space; constants, size. Caption decodes the opening quicksort claim, points rusty readers to the Deep dive, and hands off to the word-RAM model.

## Deep dive headings

- `## After this refresher you can`: the four outcomes.
- `## A little deeper`
  - `### Definitions`: sets and quantifier order; o and ω with "for every c"; the one-way limit test; the one-way equals sign and anonymous O in formulas (Knuth 1976); the two meanings of Ω (Knuth/CLRS vs Hardy–Littlewood); several variables (Rutanen, Howell); rules to know cold (sum, product, polynomials, log bases outside but not inside exponents, exponential bases, log n!, incomparable pairs).
  - `### Cases and randomness`: a case chooses a function; "insertion sort is Θ(n²)" and "at least O(n²)" as errors; expected time over the algorithm's coins, 2(n+1)Hₙ − 4n and its recurrence, asymptotically 1.39·n·log₂ n; Markov vs w.h.p. (Har-Peled), Las Vegas vs Monte Carlo (Ch.29), neither implies the other, the combination that bounds E[T]; amortized is neither (§1.2).
  - `### Resources, size and reality`: auxiliary vs total space and recursion depth; trade-offs in both directions with the measured duplicate search; input length vs value and pseudo-polynomial (Garey and Johnson's definition); the RAM model as an assumption (Θ(b) bit operations, log₂ n ≤ 64); constants and small sizes (merge vs insertion sort by comparison count), the doubling test and its blindness to log factors.
- `## Try it`: run `examples.py`, then three changes to make.
- `## In code review`: six review smells, including expected-only hash lookups.
- `## The frontier`: beyond worst case (smoothed analysis, Roughgarden's alternatives); algorithms with predictions.
- `## Sources`: last verified, fact-check record, expert sign-off pending.

## Examples to execute (`examples.py`) and what each asserts

- Witnesses: 3n² ≤ 3n² + 10n ≤ 4n² for 10 ≤ n ≤ 100,000; f(9) = 333 > 324; c₁ cannot exceed 3.
- 2ⁿ⁺¹ ≤ 2·2ⁿ; for c = 10, 1,000, 10⁶ some n has 4ⁿ > c·2ⁿ.
- Log bases: constant ratio log₂/log₁₀; 2^(log₂ n) = n, 2^(log₄ n) = √n. Doubling ratio for n log n from 10⁹ to 2·10⁹ is between 2 and 2.07.
- Ratios: n log n / n² decreasing; (3n² + 10n)/n² → 3.
- Insertion sort comparisons: 7 sorted, 28 reversed at n = 8; average n(n−1)/4 + n − Hₙ checked by enumerating every permutation for n = 5…8; 8! = 40,320; 19.3; growth checks at n = 100, 200, 400.
- Quicksort: 499,500 on sorted input with the first pivot; 2(n+1)Hₙ − 4n matches the exact recurrence at 10, 100, 1,000; 10,986; 2n ln n = 13,816; 2,000 seeded random-pivot runs: (min, max, mean) = (9,449, 15,583, 10,991), max/mean = 1.42, the histogram; first pivot on 300 random orders averages within 3% of the formula.
- Duplicates among 1,000 distinct numbers: pairs (False, 499,500, 0), hash set (False, 1,000, 1,000), in-place heapsort plus scan (False, 17,830, 0).
- Crossover at n = 100; merge sort's exact average comparisons equal insertion sort's at n = 2, 3 and are lower for 4…8.
- Ladder: 19.9; 20 ns; 20 million; 10¹²; 0.02 s; 1,000 s; 16.7 min; 585 years; 1.8 × 10¹⁹.
- Trial division: the two primes are 2³² − 5 and 2⁶⁴ − 59; 65,534 steps; √prime64 > 4·10⁹; ratio about 65,536.
- The two Ω conventions on n-for-odd, 0-for-even.

## Bridge and handoff

- **Bridge** (registry, first step): "Data Structures & Algorithms starts with the language its costs are written in: what a bound claims, which case it is about, and what it leaves out."
- **Handoff** (registry, end card; recap step): "Next: the word-RAM model, the machine these step counts quietly assume, and what it hides." The ladder step plants it ("every count here assumes each step costs the same"); the Deep dive's "The RAM model is an assumption" names what the next topic opens (unit cost, Θ(b) for b-bit arithmetic, the memory hierarchy).

## Concept ledger

- **introduces:** `big-o-theta-omega`, `little-o-omega`, `best-worst-average-case`, `expected-vs-average`, `with-high-probability`, `time-space-tradeoff`, `pseudo-polynomial`.
- **uses:** `logarithms`, `limits`, `expectation`, `standard-sorts`, `hash-set`.
- **declared** (assumed knowledge, in the Prerequisites panel): `programming`, `logarithms`, `limits`, `expectation`, `standard-sorts`, `hash-set`. The sorts and hash sets get their own topics later (Ch.2, 3, 15); the reel needs only what they do, never their analysis.
- **Prerequisites panel:** 01 programming, loops and recursion; 02 logarithms, sums and limits; 03 the algorithms used as examples; 04 probability and expectation.

## Claims list

| Claim | Source |
|---|---|
| Θ, O, Ω, o, ω definitions; quantifier order; notation as sets | CLRS 4th ed. ch. 3 (book, framing); Knuth 1976, SIGACT News, https://danluu.com/knuth-big-o.pdf |
| Knuth's Ω for all large n; Hardy–Littlewood Ω as "not o"; one-way equals | Knuth 1976 |
| Limit test sufficient not necessary; n vs n(2 + sin n); rules to know cold; log bases inside exponents | mathematics; asserted in examples.py where numeric |
| Multivariate O: most texts define one variable; two that define several differ; Howell's flaw | Rutanen 2013, arXiv 1309.3210 |
| Insertion sort n − 1, n(n−1)/2, average n(n−1)/4 + n − Hₙ | examples.py (enumeration); CLRS ch. 2 |
| Randomized quicksort expected 2(n+1)Hₙ − 4n; first pivot on sorted input n(n−1)/2; same average for fixed pivot over random orders | examples.py (recurrence, sampling); CLRS ch. 7 |
| W.h.p. wording: for every c a constant d with failure ≤ n⁻ᶜ | Har-Peled, UIUC CS 473 Fall 2023 notes §9.1 |
| Markov's inequality | Mitzenmacher and Upfal, 2nd ed. |
| Pseudo-polynomial: polynomial in length and magnitude of the largest number | Garey and Johnson (framing); trial division in examples.py |
| 2³² − 5 and 2⁶⁴ − 59 are the largest primes below 2³² and 2⁶⁴ | examples.py; OEIS A013603 |
| Duplicate search counts; heapsort permutes the input (O(1) auxiliary) | examples.py |
| Doubling hypothesis; order-of-growth classes; memory as a resource | Sedgewick and Wayne §1.4, https://algs4.cs.princeton.edu/14analysis/ |
| Ladder times at 10⁹ steps/s (assumption stated) | examples.py |
| Smoothed analysis definition; simplex polynomial smoothed complexity | Spielman and Teng, arXiv cs/0111050 |
| Beyond-worst-case alternatives | Roughgarden (ed.), introduction, arXiv 2007.13241 |
| Algorithms with predictions | Mitzenmacher and Vassilvitskii, arXiv 2006.09123 |

Fact-check record: `FACT-CHECK.md`. Source quotes: `SOURCES.md`.

## Progress

- Done: research, reel, deep dive, fact-check, gap hunt, flow review (section-4 content review, 2026-10-11: flow, gap hunt and expert reader; fixes applied, recorded in `coverage.json` → `gapReview`). Build and `examples.py` pass; the reel test passes apart from the narration manifest 404 (no audio yet).
- 2026-10-11 resume run: narration audio is on the branch; examples, build, reels and links checks pass on the merged branch. Two blockers remain before shipping: (1) `node scripts/check-locked.mjs` fails because it counts registry.ts as owned by live de.python-essentials, so any new registry entry fails it (needs the owner's decision or an Unlock: shared); (2) `SOURCES.md` was written from WebFetch summaries in a format `sources.mjs check` rejects (no 'URL:' line; 11 problems, 0 quotes verified): it must be redone with `sources.mjs fetch` raw texts and verbatim quotes, then FACT-CHECK re-run against them. Looks review (Opus) still to do.
- Next (original): narration (`narration.json` is final for the current reel), checks (section 6, with the looks and learning review).

## Changes after outlined
