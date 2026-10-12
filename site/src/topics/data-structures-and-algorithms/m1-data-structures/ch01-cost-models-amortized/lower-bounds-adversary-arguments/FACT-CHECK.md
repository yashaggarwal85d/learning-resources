# Fact-check: Lower bounds and adversary arguments (2026-10-12, against raw source texts)

Adversarial check (ROUTINE.md 2.3) of `OUTLINE.md`: its claims list, captions, explanations, predict questions, Deep dive plan and `examples.py` plan. The reel, narration and `index.mdx` don't exist yet. Every claim was re-derived from the raw texts in `sources/`, fetched with `node scripts/sources.mjs fetch`. No summaries were used as evidence. Three more texts were fetched the same way:

- Erickson's Lecture 5, Hash Tables: `sources/erickson-hash.txt`.
- Dörrer et al., SEA 2025, "Exact Lower Bounds for the Number of Comparisons in Selection": `sources/sea2025-selection.txt`.
- Blum's CMU 15-451 lecture 5: `sources/cmu-lect0913.txt`.

`SOURCES.md` had 69 quotes; the fact-check added 36 and two new sections. `node scripts/sources.mjs check` passes with 105 quotes and 0 problems.

Every numeric and combinatorial claim was recomputed by scripts written for this check. They are pure Python run with `python3 -I`, kept in the session scratchpad and not committed. The scripts are:

- closed forms and big integers;
- a generic exhaustive minimax over sets of consistent inputs, with memo and iterative deepening;
- a simulation of the four-state min/max referee.

Their results are below.

## Claims

| # | Claim (short) | Result | Evidence |
|---|---|---|---|
| 1 | Problem complexity = min over algorithms of max over inputs; a lower bound covers every algorithm; fix a model first | Confirmed; quotes added | Erickson 12.1–12.2: "The worst-case complexity of a problem Π is the worst-case running time of the fastest algorithm"; "we must prove that every algorithm that solves Π has a"; "there is no formal definition of the phrase ‘all algorithms’!"; "This specification is called a model of computation." |
| 2 | Decision tree model; depth = cost; decisions are a lower bound on time | Confirmed; quote added | Erickson 12.2: "But the number of decisions is certainly a lower bound on the actual running time" |
| 3 | Comparison trees cover the usual sorts, "but not radix sort or bucket sort" | Confirmed | Erickson 12.5 |
| 4 | N outputs → ≥ N leaves → depth ≥ ⌈log_k N⌉; lg M | Confirmed | Erickson 12.3; CMU lecture 6 |
| 5 | n! leaves, log₂ n!, Θ(n log n), every n ≥ 2 | Confirmed | Northeastern Theorem 5.1; Erickson 12.5 |
| 6 | n log₂ n − 1.443n < log₂ n! < n log₂ n; (n/2)(log n − 1) ≤ log n! | Confirmed. 18,488,569 < 18,488,885 < 19,931,569. The bracket uses 1.443 > lg e (exact lg e gives 18,488,873.5). UMass bracket checked for n = 2 … 1,000 | CMU; UMass (quote added); script |
| 7 | ⌈log₂ n!⌉ = 3, 5, 7, 16, 22, 29, 18,488,885; floor 18,488,884; log₂ 10! = 21.79 | Confirmed | script (exact integers) |
| 8 | Sorting 3, 4, 5 keys needs exactly 3, 5, 7 | Confirmed | exhaustive minimax |
| 9 | Larger-half adversary; n!/2^g; n = 3 run 6 → 3 → 2 | Confirmed. Card names: (123), (132), (231) are abc, acb, cab; after b > c, acb and cab remain, as the storyboard says | Northeastern 5.2; UMass (quote added) |
| 10 | Merge sort worst case n⌈log₂ n⌉ − 2^⌈log₂ n⌉ + 1 = 18,951,425; ratio 1.025 | Confirmed: the recurrence equals the closed form for n ≤ 20,000 and at 10⁶. The previous reel's 20,951,424 is the same recurrence with T(1) = 1 | script; CMU; Waterloo (quote added) |
| 11 | Average ≥ ⌊log₂ n!⌋; the rebalancing move; 20 → 17 → 16 | Confirmed. The move changes the depth sum by d + 1 − D (< 0 iff D − d ≥ 2); 6-leaf minimum 16, 24-leaf minimum 112. The floor line at log₂ 6 = 2.585 is also valid (Northeastern: "we can get rid of the floor") | Northeastern 5.3; script |
| 12 | Randomized sorts; matrix view | Confirmed | Northeastern 5.4 (quote added) |
| 13 | Search: n + 1 outcomes, 20 at a million, binary search optimal | **Corrected** (see Red team 1). 20 holds for three-way probes; yes/no comparisons need 21 | Erickson 12.3; Amenta Ex. 3; UMass; exhaustive n ≤ 10 |
| 14 | Hashing doesn't contradict Ω(log n); "choosing the right model … crucial" | Confirmed | Erickson 12.4 |
| 15 | Merging: C(2n, n) leaves; ≈ 2n − ½ log₂ n − ½ log₂ π | Confirmed. At 10⁶ the approximation differs from log₂ C(2n, n) by 2·10⁻⁷; ceiling 1,999,990 | NMSU; script |
| 16 | Merging needs 2n − 1 (interleaved adversary) | Confirmed. Amenta's index slip (neighbours are y_{i−1}, y_i) is already noted in SOURCES.md; the swap keeps both runs sorted | Amenta Ex. 2; exhaustive |
| 17 | Merging 5 + 5 needs 9 vs count 8; 8 + 8: 15 vs 14 | Confirmed | exhaustive (n = 2 … 5: 3, 5, 7, 9) |
| 18 | Maximum n − 1; counting ⌈log₂ n⌉ tight only for arbitrary questions | Confirmed. The step-8 instance was re-run: same six answers on A and B, max k₈ vs k₄ | Erickson 12.6; CMU Claim 6.4 (quote added) |
| 19 | Adversary definition; can't be told from an honest user | Confirmed | Erickson 12.6, 13.2 (quote added) |
| 20 | Pairing ⌈3n/2⌉ − 2; two scans 2n − 3 | Confirmed: 10 at 8, 12 at 9, 1,499,998 and 1,999,997 at 10⁶ | Erickson 13.7; script |
| 21 | Min/max lower bound, four states, ≤ ⌊n/2⌋ two-unit comparisons | Confirmed: exhaustive game values for n = 2 … 6 are 1, 3, 4, 6, 7 | Erickson 13.7; Waterloo; UMass (quote added) |
| 22 | Referee's answers always realisable | **Confirmed with a sharper rule** (see Red team 4) | mathematics; simulation |
| 23 | Inconsistent adversary proves nothing | Confirmed: none of the 6 orders satisfies a > b > c > a | Erickson 13.2; script |
| 24 | Distinctness ≥ ⌈log₂ n!⌉ via the neighbour argument | **Confirmed, with its assumption stated** (see Red team 2) | Erickson 13.8 lemma; Amenta Ex. 1; exhaustive |
| 25 | Ben-Or Theorem 1, n! components, Theorem 11 | Confirmed; **quotation corrected**. "one for each permutation" is not in the text; the source says "a maximal connected component of W for each permutation" | Ben-Or 1983 (`sources/benor.txt`) |
| 26 | Extends Dobkin–Lipton's linear-decision-tree bounds | Confirmed as Ben-Or states it ("lower bounds", plural). The step-12 caption said "bound" and was corrected. DL 1979 not opened; cited only through Ben-Or | Ben-Or, sentence and ref. [5] |
| 27 | Hash set: expected O(n), loses the worst case | Confirmed; **opened source added** | Erickson Lecture 5: "for any fixed hash function, there is a subset of at least \|U\|/m items that all hash to the same location"; near-universal hashing gives expected Θ(1 + α) per search |
| 28 | Radix: 4 passes of 16-bit digits, 65,536 buckets | Confirmed (arithmetic) | Erickson 12.5; script |
| 29 | Smallest half first: many correct outputs, linear time | Confirmed | Northeastern 5.2 |
| 30 | Insertion/selection exactly n(n − 1)/2; 499,999,500,000 | Confirmed | UMass (quote added); script |
| 31 | Verifying sortedness: n − 1 | Confirmed (mathematics; also a lower bound by the neighbour argument) | — |
| 32 | Lower bounds live in restricted models | Confirmed | Northeastern 5.2 |
| 33 | Second largest n + ⌈lg n⌉ − 2, Kislitsyn 1964 | Confirmed. CMU states it only for n a power of 2 (quote added); general n from Erickson ex. 5 and SEA 2025 "V2 (n) = n − 2 + ⌈log n⌉" | CMU; Erickson 13; SEA 2025 |
| 34 | Connectivity is evasive | Confirmed | CMU Thm 6.9; Erickson 13.5 (HideConnectedness) |
| 35 | Median bounds; exact selection status | **Outdated wording corrected** (see Outdated) | Erickson 13.8; Waterloo; SEA 2025 |
| 36 | Ford–Johnson "essentially" fewest comparisons | Confirmed as the notes say it. The Deep dive's "fewest known for most n" went beyond the source and now uses the notes' wording | Waterloo (quote added) |
| 37 | n − 1 for max holds for algebraic decision trees | Confirmed | Erickson 12.6 footnote 4 |
| 38 | Every on-screen count | Confirmed (all recomputed: see the scripts' outputs below) | script |
| 39 (new) | Northeastern lecture 5 = Blum, CMU 15-451 lecture 5 (2011) | Confirmed: both fetched and identical after the URL line | `sources/cmu-lect0913.txt` |
| 40 (new) | The neighbour argument needs comparisons between two keys | Added | Def. 5.1 / Def. 6.2 (text) |

Script outputs, for the record:

- Sorting minima: 3, 5, 7.
- Min/max minima: 1, 3, 4, 6, 7.
- Distinctness minima: three-way 3, 5, 7; yes/no "<" 4, 7, 10. Inputs with ties: 13, 75, 541 weak orders.
- Merging minima: 3, 5, 7, 9.
- Search, n = 1 … 10:
  - three-way probes: 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, which is ⌈log₂(n + 1)⌉;
  - yes/no "<"/"=" queries: 1, 2, 3, 3, 4, 4, 4, 4, 5, 5, which is ⌈log₂ n⌉ + 1.
- Referee, pairing at n = 8:
  - units trace 2, 4, 6, 8, 9, 10, 11, 12, 13, 14;
  - columns (0,4,4,0), (0,1,4,3), (0,1,1,6).
- Referee, 40,000 seeded random runs: all consistent, none below ⌈3n/2⌉ − 2, at most ⌊n/2⌋ two-unit comparisons.

The distinctness search with yes/no comparisons takes about 20 s at n = 5 with a naive solver. `examples.py` may limit that check to n ≤ 4 to stay under its 30 s budget.

## Red team: attempts and outcomes

1. **Step 6, "20 questions and binary search uses 20" (broken, fixed).** Binary search's 20 are three-way probes (<, =, >), while the row's bound counts yes/no questions. Counting with three-way questions gives only ⌈log₃ 1,000,001⌉ = 13.

   The 20 is right for three-way probes, but for a different reason than plain counting: an "=" answer ends the search, so probe nodes branch two ways and 2ᵏ − 1 ≥ n (Amenta, Ex. 3). With yes/no comparisons only, an exhaustive search for n ≤ 10 gives ⌈log₂ n⌉ + 1, which is 21 at a million.

   Fixed in the storyboard (a "3-way probes" note), the caption, the Deep dive and `examples.py`. The "=" on the row stays, because it is correct for three-way probes.
2. **Step 12, the element-distinctness neighbour argument (holds; one assumption made explicit).**
   - *Comparisons between keys:* take a distinct input that reaches a "distinct" leaf, and suppose some pair adjacent in sorted order was never compared. Move the larger key onto the smaller. Every comparison against a third key keeps its answer, because no key lies strictly between the two. The pair itself was never compared, so the run is identical and the answer is wrong.
   - *Why one leaf per order:* on distinct inputs every neighbour pair was compared. Two distinct inputs on one leaf share the path, so each satisfies the other's neighbour chain, and they have the same order.
   - *Why the bound is ⌈log₂ n!⌉, not log₃:* distinct inputs never take an "=" branch, so the part of the tree they reach is binary with at least n! leaves.
   - *Ties:* the argument only needs distinct inputs, and inputs with ties only add constraints. The exhaustive search over all weak orders gives 3, 5, 7 for n = 3, 4, 5, equal to ⌈log₂ n!⌉.
   - *Yes/no "<" comparisons:* the bound still holds, but the exact cost is higher (4, 7, 10), because equality needs two questions. The reel's "same as sorting" figure is therefore stated for three-way comparisons, which the outline already did.
   - *Comparisons with constants:* the counter-example to the bare argument is an algorithm that compares keys with a constant c. If c lies between two neighbours, moving one onto the other can flip that answer. This is outside the comparison model as defined (Definition 5.1, "comparing pairs of them"). Ben-Or's model allows constants and still gives Ω(n log n). Stated in the Deep dive.
   - *n = 1, 2:* trivial, and the bound holds (0 and 1).
   - "Sort-then-scan is optimal" was too strong and is now "optimal up to lower-order terms". A three-way merge sort detects an equal pair by itself, so the true worst case at 10⁶ lies between 18,488,885 and 18,951,425. Step 11's "about 18.5 million" is right as the lower bound the question asks for.
3. **Ben-Or / Dobkin–Lipton wording (fixed).**
   - The model has +, −, ×, ÷, √ and real constants plus sign tests, and Ω(n log n) counts operations and tests together. The caption listed only the four arithmetic operations and said "Ω(n log n)" without saying what was counted.
   - Ben-Or writes "extends the lower bounds of Dobkin and Lipton [5] for the linear decision tree model". The caption's singular "bound" now follows that. Nothing is said about DL's bound beyond Ben-Or's sentence.
   - Ben-Or's Example 9 (the discriminant reduction) is quoted for the Deep dive's reduction remark.
4. **Claim 22, the min/max referee's consistency (holds with a sharper rule).** A first attempt at a simulation raised every winning key, and this broke earlier answers when the winner had already lost. That is the hole in "raise a winner".

   The checked rule follows Waterloo's answer table. A key gets its value at its first comparison: above all values so far if it wins, below all values so far if it loses. Comparisons among already-tested keys read the current values.

   The proof has three parts:
   - values never change after a key's first comparison, so earlier answers stay true;
   - an only-won key beats an only-lost key because whichever was placed later was placed beyond everything, the other included;
   - a key in "both" is answered by its value.

   The simulation found no inconsistency in 40,000 runs, and the pairing trace matches the storyboard exactly. Units: only a comparison of two untested keys gives 2. The other answers give at most 1: VW → V loses, VL → V wins, VO → V wins, WW, LL, WO, LO, OO, and WL (0).
5. **Predict #1 (step 3).** I tried to argue that "No: some input needs 4" is also correct. It isn't: insertion sort never needs 4 on three keys, so the claim fails for some sorts. The question is not ambiguous. The correct option is not the longest one.
6. **Predict #2 (step 7).** 999,999 holds: every non-maximum must lose once, and a comparison makes at most one loser. The distractors are as described. Counting's 20 is achievable only with non-comparison questions, as Erickson says.
7. **Predict #3 (step 9).** 10 is both achievable and a lower bound (exhaustive at n = 6 and the referee at n = 8). 12 is achievable but not the fewest, and 7 is the max-only bound.
8. **Predict #4 (step 11).** "1 comparison" is the counting bound. "999,999" needs sorted input. "1,499,998" is the min/max bound. "About 18.5 million" is correct as a lower bound (see 2).
9. **Prove it 1 (merging).** I tried smaller n: the exhaustive minima are 3, 5, 7, 9 for n = 2 … 5, which is 2n − 1, while counting gives 3, 5, 7, 8. Swapping an uncompared adjacent pair keeps both runs sorted. Holds.
10. **Prove it 2 (inconsistent adversary).** I tried whether the student's rule could still prove n − 1 against algorithms that never ask a cycle. It can't, as a proof, because an adversary argument must work against every algorithm, and the a, b, c cycle produces answers no input fits. The correct option holds, and the misconception option is correctly rejected.
11. **Prove it 3 (which claim is refuted; fixed).** The question said "the Ω(n log n) … bound", but an asymptotic bound refutes no count at a single n. The answer correctly uses ⌊log₂ 10⁶!⌋ = 18,488,884, so the question now says "the comparison-sorting lower bound". The other three options are each possible: radix sort is outside the model, 999,999 on sorted input is an easy input, and top-10 selection in O(n) exists.
12. **Step 5 floor line.** I checked whether the line at log₂ 6 = 2.585 overstates Northeastern's ⌊log₂ n!⌋ theorem. It doesn't: the average leaf depth of any binary tree with L leaves is at least log₂ L (Kraft), and Northeastern notes the floor can be removed. The 6-leaf minimum average is 2.67.
13. **Deep dive, second largest.** "Counting (log₂ of n(n − 1) answers)" was wrong: the output is one index, so there are n answers and ⌈log₂ n⌉ questions. Fixed.
14. **Step 2 tree.** The insertion sort tree was re-derived (insert b, then c by scanning from the right). Root a : b; left b : c, right a : c; leaves at depths 2, 3, 3, 2, 3, 3, sum 16; the input b < a < c follows ">", "<". This matches the storyboard.

## Outdated or superseded items

- **Exact selection (claim 35, Frontier).** Erickson's notes (Fa'13, © 2018) say "Even the case k = 3 is still open!". The current status now comes from Dörrer et al., SEA 2025 (published 2025-07-15):
  - V₁(n) = n − 1 and V₂(n) = n − 2 + ⌈log n⌉ are known in general;
  - optimal algorithms are known for n ≤ 15 (all i) and for n = 16 (i ≤ 6);
  - V₇(14) = 25, V₆(15) = V₇(15) = 26 and V₈(15) = 27 were first determined there.

  A 2013 chapter by Kirkpatrick, "Closing a Long-Standing Complexity Gap for Selection: V3(42) = 50" (LNCS 8066), turned up in its Crossref record. It could not be opened (Springer blocked the fetch; no abstract in Semantic Scholar or OpenAlex). The topic therefore makes no claim about V₃.
- **Median lower bound.** Waterloo's 1¾n (2013 notes) is a weaker classroom bound. The best known bound is about 2n (Bent and John 1985, as SEA 2025 cites it; Erickson's "2n − o(n)"), and the best known algorithm uses 2.95n (Dor and Zwick, as SEA 2025 cites it).
- **Ben-Or's limitation (Frontier).** "Any general method that can pass this limitation would be of great interest" is a 1983 remark. It is now dated as such, not presented as today's frontier.
- **Ford–Johnson.** The source is 2013 lecture notes, and its "(essentially) … the fewest comparisons" is kept to that wording. Not checked against later work.
- **Aanderaa–Karp–Rosenberg.** The status is given "as of those notes" (Erickson 13.6).
- **Provenance.** "Northeastern lecture 5" is Avrim Blum's CMU 15-451 Fall 2011 lecture 5, word for word. The Deep dive's Sources list now credits it.

## Corrections applied

To `OUTLINE.md`:

1. Step 6 storyboard, real values and caption: binary search's 20 are three-way probes, with the reason they meet the yes/no count; yes/no comparisons need 21.
2. Step 10 caption and Deep dive "Adversary arguments: the rules": the referee's consistency rule as checked.
3. Step 11 explain: "at least the sorting bound".
4. Step 12 caption:
   - "optimal up to lower-order terms";
   - Ben-Or's model with square roots, every operation and test counted;
   - Dobkin and Lipton's "lower bounds" (plural), as Ben-Or cites them.
5. Deep dive "Element distinctness in three models":
   - the comparisons-between-keys assumption and constants;
   - the yes/no costs (4, 7, 10);
   - Ben-Or's model in full;
   - "optimal up to lower-order terms";
   - the hash set's expectation over a random hash function, with Erickson Lecture 5.
6. Deep dive "Counting answers":
   - the search models (three-way 20, yes/no 21);
   - median bounds from SEA 2025, with Waterloo's 1¾n marked as weaker;
   - second largest: n answers, and Kislitsyn's bound for general n.
7. Deep dive "The sorting bound, in full": Ford–Johnson in Waterloo's wording.
8. Deep dive "The frontier":
   - exact selection from SEA 2025;
   - Erickson's k = 3 remark dated and not claimed as current;
   - Ben-Or's limitation dated 1983.
9. Deep dive "Sources": Blum's CMU 15-451 lecture 5 (via Northeastern), Erickson Lecture 5 and SEA 2025 added.
10. Prove it 3 question wording.
11. Examples to execute:
    - search-model exhaustive check;
    - distinctness with yes/no comparisons;
    - the referee's value rule.
12. Claims list:
    - rows 1, 2, 9, 13, 18, 21, 22, 24, 25, 26, 27, 33, 35 and 36 rewritten with their evidence;
    - rows 39 and 40 added;
    - quote count updated.
13. Progress updated and a "Changes after the fact-check" section added.

To `SOURCES.md`:

- 36 quotes added to the Erickson 12, Erickson 13, UMass, Northeastern, Ben-Or, Waterloo and CMU lecture 6 sections, with notes:
  - the k = 3 remark's date;
  - the Northeastern = CMU provenance;
  - Ben-Or's paraphrase and constants;
  - Waterloo's 1¾n superseded;
  - CMU's power-of-2 assumption.
- New sections: Erickson Lecture 5 (Hash Tables) and Dörrer et al., SEA 2025.
- `node scripts/sources.mjs check`: 105 quotes, 0 problems.

## Notes

- Dobkin and Lipton (1979), Pohl (1972), Knuth and CLRS were not opened. No claim rests on them; DL is cited only through Ben-Or's sentence.
- The topic's `sources/` folder holds duplicate caches under both short names and URL-derived names. `sources.mjs check` uses the URL-derived ones. The three files added here use short names; `check` fetches its own copies.
- The step-12 instance (keys at drawn values, 6 neighbour arcs and 2 others) has no values in the outline yet. `examples.py` must assert that setting k₂ := k₅ leaves every recorded answer unchanged, including the two non-neighbour comparisons. That holds whenever neither of those is the pair (k₅, k₂).
