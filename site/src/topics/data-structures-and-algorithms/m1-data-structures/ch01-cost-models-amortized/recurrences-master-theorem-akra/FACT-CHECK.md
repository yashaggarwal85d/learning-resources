# FACT-CHECK: Recurrences: Master theorem and Akra–Bazzi

Fact-check, currency check and red team (ROUTINE.md 2.3), 2026-10-11, Opus. Read in full: `OUTLINE.md`, `SOURCES.md`, the raw texts `sources/leighton.txt`, `rec.txt`, `recursion.txt`, `roura.txt`, `stanford.txt`, `select.txt`, `master.txt` and `expert-list.json`. New sources were fetched with `node scripts/sources.mjs fetch` only: Dillhoff's restatement of CLRS 4th ed. Theorem 4.1, Chen–Dumitrescu (arXiv 1409.3600), Drmota–Szpankowski (Purdue PDF) and CMU 15-451 lecture 2. No personal information was sent in any request. Every number below was recomputed in Python (brute force, memoised or array DP; scripts kept in the session scratchpad, not in the repo). `node scripts/sources.mjs check` passes with the new quotes (175 found, 0 problems).

**Decoding the Leighton text layer.** The control characters are consistent throughout `leighton.txt`: `\x15` = ≥, `\x14` = ≤, `\x02` = Θ, `\x0f` = ε (and the bullet), `=` = `/`, `,` = `−`, and a stray `0` = the prime ′ (the j′ of the proof of Theorem 1 shows the same stray `0`s). Every "to verify" item below was read with this key and then checked by computing.

## Verdicts on the claims list

| # | Claim (short) | Verdict | Evidence | Correction made |
|---|---|---|---|---|
| 1 | Recursion tree: aⁱ nodes of f(n/bⁱ), L = log_b n, leaves n^(log_b a) | Correct | rec.txt lines 700–720, quotes in SOURCES.md | none |
| 2 | Geometric series: only the largest term matters; three easy cases | Correct | rec.txt, recursion.txt (quoted) | none |
| 3 | Merge sort 2T(n/2) + n: Θ(n log n); 448 at 64 | Correct | brute force T(64) = 448, T(2ᵏ) = 2ᵏk + 2ᵏ for k ≤ 20 | none |
| 4 | Erickson's form of the Master theorem and proof sketch | Correct | rec.txt 893–905 | none |
| 5 | Textbook form; "CLRS 4th ed.'s exact wording to verify" | **Partly outdated.** The three cases and case 2 with k ≥ 0 are right. The hypotheses a ≥ 1 and "f asymptotically positive" are the MIT handout and CLRS 1st–3rd ed. form; CLRS 4th ed. (2022) Theorem 4.1 has a > 0, a nonnegative "driving function", floors and ceilings built in (a′T(⌊n/b⌋) + a″T(⌈n/b⌉)), and names n^(log_b a) the "watershed function" | master.txt lines 8–15; Dillhoff's notes restating Cormen et al. 2022 (new SOURCES.md entry, quoted). The book itself was not opened, so the page should cite the restatement, not quote the book | Step 5 caption rewritten: both hypothesis sets, regularity automatic for n^d (c = a/b^d); claims row 5 rewritten |
| 6 | MIT handout solutions | **Misattributed.** The row gave "non-polynomial difference" as the handout's reason for 2T(n/2) + n log n. The handout solves that one by case 2 (sol. 6: n log² n) and says "non-polynomial difference" of n/log n (sol. 7). "Does not apply (a < 1)" holds only for the a ≥ 1 form; under CLRS 4th ed. 0.5T(n/2) + 1/n is case 2, Θ((log n)/n), as Leighton's Akra–Bazzi example also gives (exactly n·T(n) = log₂ n + 1 for powers of two). For n(2 − cos n) the handout is right that regularity fails (worst f(n/2)/f(n) = 1.5 over even n < 10⁶), but T(n) = Θ(n) anyway (T(n)/n in [2.0, 5.6] for n < 2·10⁵): the theorem falls silent, the answer doesn't change | master.txt 76–108 (solutions now quoted in SOURCES.md); Python | Row 6 rewritten; step 6 caption no longer lists "a < 1" as outside the theorem; the Deep dive explains a < 1 under both forms and the cos example correctly; "19 practice recurrences" in SOURCES.md corrected to 22 |
| 7 | Floors and ceilings don't matter; S(n) = T(n + 2) | Correct | rec.txt; M(n)/(n log₂ n) in [1.000, 1.012] for n = 100 … 10⁵ (step 7), M(100) = 672, M(1,000) = 9,976, M(10⁶) = 19,951,424 | Deep dive adds the monotone-sandwich argument and its assumption (expert list) |
| 8 | Leighton's hᵢ bound, ceilings, nearly tight | **Verified, made precise.** Condition 2 of §3: "there is some constant ε > 0 for which \|hᵢ(x)\| ≤ x/(log^(1+ε) x)". The remark: T(x) = 2T(x/2 + x/log x) + x solves to x·log^Θ(1) x (the `\x02` before "(1)" is Θ), not Θ(x log x). Leighton also allows hᵢ = −√x and x/log² x | leighton.txt 366, 429–433, 785–800; brute force (T = 1 for x ≤ 16): T/(x log₂ x) 3.7 → 28.6 over x = 2¹⁰ … 2⁵⁰, T/(x log₂² x) in [0.37, 0.57] | Deep dive and row 8 state it exactly; quotes added |
| 9 | Akra–Bazzi statement, conditions 1–5, integral | **Verified.** 1. x ≥ 1 real; 2. x₀ ≥ 1/bᵢ and x₀ ≥ 1/(1 − bᵢ); 3. aᵢ > 0; 4. bᵢ ∈ (0, 1); 5. k ≥ 1; 6. g ≥ 0 with the polynomial-growth condition c₁g(x) ≤ g(u) ≤ c₂g(x) for u ∈ [bᵢx, x]. T(x) = Θ(xᵖ(1 + ∫₁ˣ g(u)/u^(p+1) du)) with Σ aᵢbᵢᵖ = 1. Erickson's version has sizes n/bᵢ, bᵢ > 1, and ρ from Σ aᵢ/bᵢ^ρ = 1: same theorem | leighton.txt 42–98; rec.txt 909–944 | Step 9 caption states the conditions; two red-team caveats added (below) |
| 9a | Erickson's hypothesis f = Ω(nᶜ), O(nᵈ) | **Not sufficient as stated.** f(n) = n at powers of 2 and n² elsewhere satisfies it; T(n) = T(n/2) + f(n) is 2n − 1 at n = 2ᵏ while the formula gives Θ(n²). Leighton's polynomial-growth condition excludes it | Mathematics | Step 9 and the Deep dive use Leighton's condition, not Erickson's paraphrase, and say "f grows smoothly", not "f is polynomially bounded" |
| 10 | Naming, history, "less restrictive", order transform, 1998 | Correct | leighton.txt; rec.txt 912 | none |
| 11 | Faster-than-polynomial remark; "a polynomially bounded g satisfies the condition" | First part correct. **Second part wrong twice.** Leighton writes \|g′(x)\| (the prime is the stray "0" in "polynomial0"), not \|g(x)\|, and the remark is false either way: g(x) = 2^(−x) has \|g\| ≤ 1 and \|g′\| ≤ 1, but g(x/2)/g(x) = 2^(x/2) is unbounded | leighton.txt 73, 321–322 | The Deep dive no longer quotes it; it gives the true examples (x^α log^β x for large x satisfies the condition, 2ˣ doesn't); row 11 rewritten |
| 12 | Leighton's five examples | **One misprint in the source.** Example 2, 2T(x/2) + (8/9)T(3x/4) + Θ(x²/log x): p = 2 is right (2/4 + (8/9)(9/16) = 1), but the solution is Θ(x² log log x), not the printed Θ(x²/log log x): ∫ (u²/log u)/u³ du = Θ(log log x). Brute force (T = 1 for n ≤ 4): T/n² rises 2.06, 2.58, 2.97, 3.27, 3.52, 3.90 at 2¹⁰, 2¹⁵, …, 2⁴⁰; T/(n² log₂ log₂ n) stays in [0.62, 0.74]. The other four are correct (x log² x; log² x; p = −1 and (log x)/x; x²) | leighton.txt 93–97; Python | Deep dive corrected with a note on the misprint; examples.py plan adds the brute-force check; SOURCES.md paraphrase annotated |
| 13 | Master theorem as a special case; non-integer parameters; ρ ≈ 0.83978 | Correct | rec.txt; bisection gives p = 0.8397803045, φ(0) = 2, φ(0.5) = 1.284, φ(1) = 0.9, φ(1.5) = 0.675 | none |
| 14 | Selection: 9/10 per level, 3n/10, 7n/10 + 6, 5 smallest odd block, 8n/5, ≤ 16n | Correct | recursion.txt 1290–1393, select.txt | none |
| 14a | Selection counts 6,532; 8,832,605; S(n)/n | **Correct only with T(0) = 1.** The outline said "T(1) = 1"; ⌊n/5⌋ = 0 for n < 5, and with T(0) = 0 the counts are 6,394 and 8,788,161 (thirds: 10,261 instead of 10,526). With T(n) = 1 for n ≤ 1: S(10⁷)/10⁷ = 9.19, max S(n)/n over 1 ≤ n ≤ 10⁷ = 9.192 (at 9,584,115), so ≤ 10n holds | Python (memo and array DP to 10⁷) | Steps 7, 8, 12 and the examples.py plan state "T(n) = 1 for n ≤ 1, T(0) included" |
| 15 | n/4, 3n/4 split and thirds: Θ(n log n) | Correct for the recurrences | rec.txt 842–852; G(n)/(n log₂ n) = 1.056, 1.070, 1.077, 1.067 at 10³ … 10⁶ | none |
| 15a | "Median of medians with groups of 3 is no faster than sorting" | **Overstated as a fact about the algorithm.** Erickson's "tight" is about the recurrence. Chen and Dumitrescu: the usual argument for an Ω(n log n) worst case "fall[s] short of proving this claim", and groups-of-3 variants run in linear time | recursion.txt 1371–1377; arXiv 1409.3600 (new SOURCES.md entry) | Step 8 answer and the Deep dive say this analysis can't show linear time, and name the linear variants (Ch.16); new row 24 |
| 16 | Substitution quotes | Correct | rec.txt | none |
| 17 | False proof; subtract a lower-order term | Correct | T(n)/n = 2, 5, 8, 11, 14, 17, 20; C(n) = 2n − 1; 4T(n/2) + n = 2n² − n (6, 28, 120, 8,128, 2,096,128) | none |
| 18 | Stanford constants | **Verified.** k = 10c for the floor recurrence; k = 50c for T(⌈n/5⌉) + T(⌈7n/10 + 6⌉) + cn, left as an exercise in the deck: 8k + cn − kn/10 = 400c − 4cn ≤ 0 exactly when n ≥ 100, the deck's fat-base-case cut-off | stanford.txt (both proofs now quoted) | Row 18 and Deep dive updated |
| 19 | √n·T(√n) + n = Θ(n lg lg n) | Correct | rec.txt 828–841 | none |
| 20 | Domain and range transformations; ham-sandwich n^0.694; U(n) = nT(n) | Correct | rec.txt; U(n) = (n/4)T(n/4) + (3n/4)T(3n/4) + n checked | none |
| 21 | vEB: 64 → 1 in six halvings | Correct | Python: six √ steps from 2⁶⁴ to 2 | none |
| 22 | Roura: sublogarithmic factors, floors, stochastic recurrences | Correct | roura.txt lines 11, 159–224, 268 | none |
| 23 | On-screen numbers | All recomputed, all correct except the two below | Python | see red team items 1 and 2 |

## Red team: explanations, questions and on-screen numbers

1. **Step 3 gave its own answer away.** The question read "8⁶ = 262,144 leaves at the bottom. What does the leaf level total?", and with each leaf costing 1 the answer is the number just printed. The bottom strip's count label also showed "262,144" in the question frame. Fixed: the question now gives only the root's cost and the rule (8 calls on half the keys, 1 per one-key call), and the bottom strip's label stays "?" until the answer. This matches the narration rule the outline already had.
2. **Step 6 showed a "0" bar and "× 0".** f(1) = 1·log₂ 1 = 0 made the leaf row 0, which ignores the 64 leaves at T(1) = 1 (step 2's convention), and "× 0" reads as part of the drift. Fixed: six bars (levels 0–5) with five ratios, "+ 64 leaves × T(1) = 64", and T(64) = 1,408 by brute force. 1,344 = 64 × 21 is still the sum of the six bars.
3. **Step 14's integral diverged.** ∫₁ⁿ du/(u log u) is infinite at u = 1, and f = u/log u is undefined there. Fixed: ∫₂ⁿ = ln ln n − ln ln 2. The P(2ᵏ) checks are right: P/(n log₂ k) = 0.731, 0.720, 0.717, 0.715 and P/(n k) = 0.243, 0.180, 0.155, 0.137 at k = 10, 16, 20, 24. Case 2's failure is now stated as "not Θ(n logᵏ n) for any k ≥ 0" (n/log n is the k = −1 case).
4. **Regularity: "what breaks without it" was the wrong example.** The MIT n(2 − cos n) example still has T = Θ(n). A real break: R(n) = R(n/2) + f(n) on powers of two, with f = n when log₂ n is even and n² when it is odd. Then f = Ω(n¹), regularity fails, and R(4ʲ)/n² → 4/15, so R ≠ Θ(f) at n = 4ʲ. Added to the Deep dive and the examples.py plan. Also added: some lecture statements drop "c < 1" (expert list), and n^d above the watershed is automatically regular.
5. **Step 11's selection substitution needs base cases.** With floors, ⌊n/5⌋ = 0 for n < 5 and T(0) = 1 > k·0, so the inductive step alone doesn't prove T(n) ≤ 10n. Added: the small n are base cases checked directly (the Stanford fat base case), and T(n) ≤ 10n is asserted for 1 ≤ n ≤ 10⁷.
6. **The step 9 condition was worded too loosely.** "f polynomially growing" would let learners read it as "f bounded by a polynomial", which is not sufficient (row 9a). Fixed: the polynomial-growth condition in words, with an example that satisfies it and one that doesn't, and a note that Akra–Bazzi needs no separate regularity check.
7. **Prerequisite self-check.** "How many halves does binary search take on 1,000,000 keys? 20" mixes up halvings (19) and probes (20 = ⌊log₂ 10⁶⌋ + 1). Reworded to probes.
8. **Frontier.** The outline refused any claim about oscillation without a source. Drmota–Szpankowski is now opened and quoted, and an exact, computed example was added: M(n) = n⌈log₂ n⌉ + n − 2^⌈log₂ n⌉ holds for every n ≤ 10⁶ (M(1) = 0), so (M(n) − n log₂ n)/n is periodic in log₂ n and lies in [0, 1 − (1 + ln ln 2)/ln 2 ≈ 0.0861].
9. **Checked and fine as planned:** steps 2, 4, 5 (729 = 3⁶ = 64^(log₂ 3) exactly, log₂ 3 = 1.585, log₂ 7 = 2.807), 7 (1,000, 900, 810, 729, 656, 590; box widths 90/18/63; 10,000 bound), 8 (333/667/111/222/444; 1.056), 9 (p and φ samples; the integral ratio 4.51, 5.67, 6.05 → 6.24), 10 (2 … 20), 12 (20,951,424 within 5.1 % of n log₂ n = 19,931,569; 20 probes; 8,832,605), 13 (4,096 … 117,649 = 7⁶; ε ≈ 0.807), 15 (c₂ ≥ 1; c₁ = 2, c₂ = 1 exact). The predict distractors are plausible, and none of them is accidentally correct. For 7T(n/2) + n², "Leaves: Θ(n³)" is wrong because 7 < 8.
10. **Currency.** CLRS 4th ed. (2022) is the current edition; its Theorem 4.1 differs from the handout as in row 5. The page must not present a ≥ 1 as "the" textbook hypothesis. Roura 2001 and Drmota–Szpankowski 2013 remain the references for discrete and precise forms. Nothing found supersedes Akra–Bazzi/Leighton for the Θ form.

## Quotes in SOURCES.md checked against their claims

- All 143 original quotes are found word for word, and each supports the claim it is filed under. Exceptions:
  - The MIT section said "19 practice recurrences". There are 22; corrected.
  - The Leighton examples paraphrase repeated the misprinted Θ(x²/log log x). It is now annotated.
  - The Leighton condition paraphrase was correct. The g′ remark is now quoted with a note that it is not used.
- Added quotes:
  - Leighton: the g′ remark; "does not necessarily hold…"; example 2's three fragments; the −√x and x/log² x line; the nearly-tight remark.
  - Erickson Appendix II: "The sum of all the nodes in the ith level is n/(lg n − i).", "= nHlg n = Θ(n lg lg n)".
  - Erickson ch. 1: "(Moreover, this analysis is tight…)".
  - Stanford: both substitution conclusions (10c, 50c).
  - MIT: case 2 line; solutions 6, 7, 9, 19, 22.
  - New sources: Dillhoff (CLRS 4th ed. restatement), Chen–Dumitrescu, Drmota–Szpankowski, CMU 15-451 (case numbering).

## Expert-list items the outline missed (now added to OUTLINE.md unless noted)

Item numbers count the 27 entries of `sources/expert-list.json` from 1.


- Item 4, the note on case 2 with negative k (k = −1 → log log n, k < −1 → Θ(n^(log_b a))): only k = −1 was there. Added to the Deep dive and as row 27.
- Item 5, the note that some statements drop c < 1 and that n^d is automatically regular: missing. Added.
- Item 7, the monotone sandwich between powers of b and its monotonicity assumption: missing. Added to "Floors, ceilings and small shifts".
- Item 15, the degenerate boundary case (T(n) = 2T(n/2), T(1) = 0): missing. Added to "A recurrence is a program's step count".
- Item 2, the reversed case numbering in some sources (CMU 15-451): missing. Added, with CMU opened and quoted.
- Item 27, oscillation of exact solutions (Drmota–Szpankowski): the outline had ruled it out for lack of a source. Source opened, and added to the Frontier.
- Item 18 (growth condition): the outline was about to quote Leighton's g′ remark as if it were a valid sufficient condition. The expert list itself gives "|g′(x)| bounded by a polynomial (Lehman–Leighton–Meyer)" as the condition. As a standalone sufficient condition that is false (g = 2^(−x)); the page uses the polynomial-growth condition instead. The expert list's wording should not be copied.
- Item 26 (T(3n/4) + T(n/4) + n is only a heuristic model of quicksort): the outline uses this split only as Erickson's n/4, 3n/4 example, so nothing to change. The build must not call it "quicksort's recurrence".
- Items 24 (BFPRT 5.4305n) and 25 (Karatsuba/Strassen details) are placed in Ch.16 and Ch.21; the outline names them as forward mentions only. Nothing to add.
