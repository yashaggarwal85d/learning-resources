# REVIEW: Recurrences: Master theorem and Akra–Bazzi (`dsa.recurrences-master-theorem-akra`)

## Content review (Fable, 2026-10-11)

ROUTINE.md section 4, by an agent that wrote nothing in this topic. Read once, in order: the previous topic (`ch01-cost-models/asymptotic-notation`: reel step titles, Deep dive headings, registry entry, its `REVIEW.md`), then this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, the registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, `OUTLINE.md`, `examples.py`, the chapter plan's entries #2–#4 and shared notation in `../CHAPTER.md`, and the next syllabus line (Lower bounds and adversary arguments). `python3 -I examples.py` passes (8 s). Every numeric claim in the reel and Deep dive was recomputed independently in the session scratchpad (level totals, 8⁶ = 64³, 1,344 = 64 × 21, p = 0.83978, the Akra–Bazzi integral for f(u) = u, the Leighton examples including the corrected second one, 2n − 1, 2n² − n, 20,951,424 / 19,931,569 = 1.051, 20 probes, 4/15, the 0.0861 oscillation bound, log₂ φ = 0.694, ε = log₂ 7 − 2 = 0.807). No web request was made. The `coverage.json` topic references were checked against `syllabus/data-structures-and-algorithms.md` (all four titles and all five quotes exist, lines 286, 350, 352, 468).

What holds up: the mathematics is right everywhere I could compute it; the fact-check's corrections (step 3's give-away, the step 6 "× 0" row, the step 14 integral bound, Leighton's misprint, the T(0) convention, the CLRS 4th ed. hypotheses) are all in the built files; the driving function is f throughout with the one Leighton/g note in step 9; a ≥ 1, b > 1 and the watershed are as the chapter fixes them, and b never has to mean a bit length; the narration has no digits or symbols and has an `answer` clip on exactly the six predict-shaped steps; the coverage map's `out` items are honest. The findings below are mostly local. Three are major.

Severity: **major** = a learner is misled or a question is answered before it is asked; **minor** = precision, wording or a bookkeeping gap.

### Flow

1. **Steps 5 → 6 (and narration 6): the reel contradicts itself about whether n log n is a gap.** Where: `reel.tsx` step 5 states case 2 in the extended form, "f(n) = Θ(n^(log_b a)·logᵏ n) for some k ≥ 0", and the narration says "Same size, up to a log power, case two." Step 6 is titled "The gaps between the cases" and uses f = n log n as the gap; its narration says "So no constant below one fits, and no case applies." What: under the statement the reel gave one step earlier, 2T(n/2) + n log n *is* case 2 with k = 1 (the MIT handout's own solution 6, quoted in `SOURCES.md`), so the step's headline example is not a gap of the theorem as stated; only the caption's parenthesis "(The extended case 2 with k = 1 gives Θ(n log² n)…)" admits it, and the narration never does. Evidence: step 5 body lines 71–72; step 6 body lines 84–86 and title; `narration.json` steps 5 and 6. Fix (either): (a) state the basic case 2 (k = 0) in step 5, and make step 6 the place where the log-power extension is introduced as the patch that closes the n log n gap, with n/log n (Prove it 2) as the gap that remains; or (b) keep step 5 as is and give step 6 a real gap, for example 2T(n/2) + n/log n or 2T(n/2) + n log n/log log n, keeping the drifting-ratio picture (the ratio still drifts to 1 either way). The narration line "no case applies" must then match. Severity: **major** (the reel teaches a statement and then calls one of its instances uncovered).

Resolution: fixed (step 5 now states basic case 2, f = Θ(n^(log_b a)), with the caption and narration to match; step 6 keeps its title and id, presents n log n as the gap of the three cases, introduces the log-power extension as the patch that closes it (k = 1 gives n log² n), and names n/log n (Prove it 2) as the gap that remains; narration 5 and 6, Prove it 2 explain and the Deep dive case-2 bullet updated; coverage.json step references unchanged)

2. **Step 8 → 9 → 10: the substitution section starts with a question about a method that has not been named.** Where: step 10 "Predict: the proof that proves nothing" opens "Merge sort, guess T(n) ≤ c·n. The induction step gives…"; the word "substitution" first appears in that step's *explain* ("Substitution confirms or refutes a guess"). The outline's planned bridge sentence at the end of step 8's answer ("The next step turns that sum into an exponent") and the narration's "Now substitution. Guess, then prove by induction." have no counterpart in the step 10 caption. What: the ledger `introduces: substitution-method`, but the learner meets the method inside a predict question before it is introduced, and step 9 (Akra–Bazzi) ends with no hand-over. Fix: one clause at the top of step 10's body, "Now the proof side, **substitution**: guess, then prove by induction." (the body is short enough to take it), or end step 9's caption with "Trees and theorems give a guess; the proof is next." Severity: minor.

Resolution: fixed (step 10 body opens with "Now the proof side, substitution: guess, then prove by induction."; narration 10 already said it)

3. **Integrals are used but never declared.** Where: step 9 ("∫₁ⁿ f(u)/u^(p+1) du … for f(u) = u the integral is Θ(n^(1−p))"), Prove it 2's explain ("the integral of (u/log u)/u² is ln ln n − ln ln 2"), and the Deep dive's Akra–Bazzi section. What: `prerequisites.mdx` 03 declares induction and geometric series; topic 1 declared `limits`; nothing declares integration, and the registry's `declared` has no entry for it. A learner without calculus cannot check either integral. Fix: fold "the integral of a power and of 1/u" into prerequisite 03 (title "Induction, geometric series and two integrals") with a self-check ("∫₁ⁿ du/u = ln n; ∫₁ⁿ u^(−p) du for p < 1 grows like n^(1−p)/(1 − p)"), and add the id to `declared` (and to the Outline's ledger). Severity: minor.

Resolution: fixed (prerequisite 03 retitled "Induction, geometric series and two integrals" with a self-check; `integration` added to the registry `uses` and `declared`)

4. **Step 6 says "Akra–Bazzi, next" twice; it is three steps away.** Where: step 6 body "Akra–Bazzi, next, covers the gaps"; narration "Akra Bazzi, next, covers this gap." What: the next step is the lopsided tree (7), then the groups-of-3 predict (8); Akra–Bazzi is step 9. Fix: "Akra–Bazzi, two steps on," or "in a moment". Severity: minor.

Resolution: fixed (step 6 body and narration now say "in a moment")

5. **The previous topic is cited for something it did not do.** Where: `prerequisites.mdx` 01, "the quicksort recurrence that the first reel solved by differencing"; step 6 body, "the quicksort recurrence of the first reel". What: topic 1's reel never shows the recurrence; its Deep dive ("Cases and randomness") states the closed form 2(n+1)Hₙ − 4n "(solving C(n) = n − 1 + (2/n)·ΣC(k))" and its `examples.py` (lines 85–86) checks the closed form against the recurrence numerically. No differencing is shown anywhere, and the outline itself wrote "the first reel's Deep dive". Fix: "the full-history quicksort recurrence stated and checked in the first topic's Deep dive". Severity: minor.

Resolution: fixed (prerequisite 01, step 6 body and the Deep dive now cite the full-history quicksort recurrence stated and checked in the first topic's Deep dive)

6. **Step 12: the narration's order differs from the cards'.** Where: `narration.json` step 12, "about twenty one million operations, eight point eight million, and twenty probes" (merge sort, median of medians, binary search), while the cards are merge sort, binary search, median of medians, and the caption says "The first … The third … The second". Fix: narrate and caption in card order (merge sort, binary search, median of medians). Severity: minor.

Resolution: fixed (step 12 body and narration now go in card order: merge sort, binary search, median of medians)

7. **Release-seam risk on `uses`.** Where: `registry.ts` `uses: ['word-ram', 'van-emde-boas-tree', …]` with the comment that topic 2 introduces them; topic 2 has no registry entry on this branch, and `status: 'held'` is what keeps `checkFlow` quiet. What: nothing to change here, but if topic 2's builder names its ids differently (`word-ram-model`, `veb-tree`) this topic fails the flow check the day it is unheld. Fix: record in the chapter's release-seam check that these two ids are a contract between topics 2 and 3. Severity: minor.

Resolution: fixed (registry comment records that `word-ram` and `van-emde-boas-tree` are a contract between topics 2 and 3; OUTLINE Changes notes it for the release-seam check)

8. **The root-wins case is never drawn as a tree.** Where: steps 2 and 3 draw trees (tie, leaves win); step 4 draws three bar columns; the shrinking case appears only as the first bar column and as a table row in step 5. What: the syllabus clause is "recursion-tree animation for the three Master cases" and the chapter's visual idea is one tree whose column shrinks in case 3. Content is not wrong (the column is the abstraction the reel teaches), so this is for the looks review to weigh; noted here because `coverage.json` maps the clause to these steps. Severity: minor.

Resolution: not fixed because the column is the abstraction the reel teaches, the shrinking case is drawn as the first bar column of step 4 and the regularity row of step 5, and whether to add a third tree is a looks-review choice that would add a step-sized scene; the coverage map already points the clause at these steps.

### Gap hunt

1. **The Master theorem's hypothesis on f is missing from the reel's statement.** Where: step 5 body, "with constants a ≥ 1 and b > 1" and nothing about f. What: both forms the Deep dive compares require f asymptotically positive (handout, CLRS to the 3rd ed.) or nonnegative for large n (4th ed.), and the Deep dive's "What the theorem does not cover" lists "f that is not positive" (the handout's 64T(n/8) − n² log n). The reel never says it. Fix: "with constants a ≥ 1, b > 1 and f ≥ 0 for large n" in step 5. Severity: minor.

Resolution: fixed (step 5 states "f(n) ≥ 0 for large n")

2. **Regularity is shown only where it holds by itself.** Where: step 5 ("for f = n^d it holds automatically") and the regularity line on screen; nothing in the reel shows a case-3-shaped f that fails it or what goes wrong. Outcome 2 promises "including its regularity condition". What: the Deep dive has the right counterexample (f = n at 4ʲ, n² at other powers of 2; `examples.py` asserts 4/15); the reel gives the learner no reason to check the condition. Fix: one clause in step 5, "it is there to exclude an f that jumps between n and n² from one size to the next (Deep dive)". Severity: minor.

Resolution: fixed (step 5 adds that regularity excludes an f jumping between n and n² from one size to the next, pointing to the Deep dive)

3. **Case 2 below k = 0 skips the range where the formula still holds.** Where: Deep dive "Case 2 below k = 0": "k = −1 gives Θ(n^(log_b a)·log log n), and k < −1 gives Θ(n^(log_b a))". What: for −1 < k < 0 the integral ∫ log^k u/u du = log^(k+1) n/(k + 1), so the ordinary case-2 answer Θ(n^(log_b a)·log^(k+1) n) still holds (f = n/√log n gives Θ(n √log n)); the page reads as if nothing is known between k = 0 and k = −1. Fix: "for −1 < k < 0 the case-2 formula Θ(n^(log_b a)·log^(k+1) n) still holds; k = −1 gives … ; k < −1 gives …". Severity: minor.

Resolution: fixed (Deep dive: for −1 < k < 0 the case-2 formula still holds, with the n/√log n example)

4. **Floors and ceilings are not mapped to the syllabus clause they answer.** Where: `coverage.json` syllabus clause 1 ("recursion-tree animation for the three Master cases") lists steps 2–6 and the Deep dive "The recursion tree, in full"; the chapter plan puts "why floors and ceilings don't change the answer" under this clause, and the material lives in "Floors, ceilings and small shifts", which the clause does not cite. Fix: add `{"deep": "Floors, ceilings and small shifts"}` to clause 1's `at`. Severity: minor.

Resolution: fixed (`Floors, ceilings and small shifts` added to clause 1's `at`)

5. **Two source items are mapped to a Deep dive section that does not contain them.** Where: `coverage.json`, Stanford CS161 item "The partition subroutine and quickselect; worst-case recurrence T(n) = T(n−1) + Theta(n)" → `deep: "The recursion tree, in full"`; Roura "4-5 Core theorems for general divide-and-conquer recurrences" → `deep: "The frontier"`. What: "The recursion tree, in full" never mentions quickselect, partition or T(n − 1) + Θ(n) (the only quicksort mention is the full-history recurrence); "The frontier" names Roura's Discrete and Continuous Master Theorems but says nothing about his core theorems. The map should say where a thing is or that it is out. Fix: Stanford item → `out` ("quickselect's worst-case recurrence T(n − 1) + Θ(n) is a linear chain, not a divide-and-conquer recurrence; Ch.16") keeping the existing `topic` reference; Roura 4–5 → `out` ("the general theorems behind the Discrete and Continuous MTs; the Frontier cites the two results"). Severity: minor.

Resolution: fixed (Stanford quickselect item and Roura 4-5 item now `out` with reasons; the topic reference kept)

6. **Pronunciation lexicon.** Where: `CHAPTER.md` "Spoken numbers" requires new terms (Akra–Bazzi) to be added to the lexicon on first appearance; the narration speaks "Akra Bazzi" (steps 6, 9, 14). What: no lexicon file exists in the repo yet (grep finds the word only in `PROJECT_PLAN.md` and the two chapter plans), so there is nowhere to record it. Fix: for the narration step (ROUTINE 7): create or extend the lexicon with "Akra–Bazzi" (AH-kra BAH-zee) when the narration tools are set up; nothing to do in this review beyond noting it. Severity: minor.

Resolution: not fixed because no lexicon file exists in the repo yet; "Akra–Bazzi" (AH-kra BAH-zee) is to be added when the narration tools create it (ROUTINE 7).

7. **`coverage.json` → `gapReview` still says "Builder (pending content review)".** Fix: after the fixes land, record this review (date, who, `open: []`) as ROUTINE 4 asks. Severity: minor (procedural).

Resolution: fixed (`gapReview` now by "Fable content review + fix agent", 2026-10-11, open [])

### Expert reader

1. **Step 12 calls the counts "exact word operations"; they are exact solutions of simplified recurrences.** Where: step 12 body, "The counts are exact word operations at a million keys, constants dropped"; the cards say "20,951,424 ops" and "8,832,605 ops"; the narration says "about twenty one million operations". What: "exact" and "constants dropped" cannot both be true. 20,951,424 is T(10⁶) for T(⌈n/2⌉) + T(⌊n/2⌋) + n with T(1) = 1 and the merge's constant set to 1; a real merge of n keys does more than n word operations (compares and moves), the selection count assumes T(0) = T(1) = 1 and f = n exactly, and the binary-search number is probes, not operations. The chapter's whole thesis is "say what you count", and this sentence says the wrong thing. Fix: "The counts are the exact solutions of the three recurrences with the constant in f set to 1 (`examples.py`), not operation counts of any implementation"; on the cards, "20,951,424 units" or "T(10⁶) = 20,951,424"; narration "about twenty one million units of work". Severity: **major**.

Resolution: fixed (step 12 body now says the counts are exact solutions of the three recurrences with the constant in f set to 1, not operation counts of any implementation; cards read "T = … units"; narration says units of work; aria label updated)

2. **Prove it 1 shows its answer in the question frame.** Where: `scenes.tsx` `ColumnQuestion`: the first two totals (4,096 and 7,168) are always visible (`i < 2 ? 1 : …`), and the ratio label is drawn at `i === 0` regardless of `shown`, so "× 7/4" sits beside a column that is visibly growing before the learner answers "Which end of the column wins?" What: the question's literal ask (root, tie or leaves) is on screen; only the exponent choice (n^2.81 against n³) is left, which the question does not ask. The fact-check's own red-team item 1 fixed exactly this on step 3. Fix: before the answer, draw only the root total and no ratio (keep the second bar and "× 7/4" for the reveal), or re-ask the question as "Which case, and which exponent?" Prove it 2 has the same mechanics ("× 1.2" and a visibly growing first pair), which rules out "Yes: case 2" at a glance; one ratio does not show the drift, so it is less serious, but hide it the same way. Severity: **major** for Prove it 1, minor for Prove it 2.

Resolution: fixed (ColumnQuestion shows only the root total before the answer; the second bar, the ratio label and the rest of the column appear at the reveal, for Prove it 1 and Prove it 2; the aria labels are neutral until answered; no shared code touched)

3. **Step 3's question frame makes the answer a one-step multiplication.** Where: `LeafPredict`: the strips for levels 3–5 carry node counts "512", "4,096", "32,768" in the question frame, and the column shows 4,096 then 8,192 (the doubling). What: 32,768 × 8 or 4,096 × 2⁶ is the answer, and the distractor "32,768" is a number printed on screen. The outline accepted the 8,192 hint; the strip counts were added in the build and go further than the outline's "a strip with a 512 count label" intended. Fix: label the strips only after the answer (or keep "× 8" beside each and no counts), and drop the distractor that is on screen. Severity: minor.

Resolution: fixed (the node counts on the density strips appear only after the answer, so 32,768 is no longer on screen as a distractor)

4. **Step 11: "The same move proves the selection bound" is not the same move.** Where: step 11 body. What: the move the step teaches is subtracting a lower-order term from a right guess; the selection step closes with the plain guess k·n ((9/10)·k·n + n ≤ k·n for k ≥ 10) and needs no subtraction. What it shares is the explicit constant and the base-case check. Fix: "Substitution also proves the selection bound, with no subtraction needed: …". Severity: minor.

Resolution: fixed (step 11 now reads "Substitution also proves the selection bound, with no subtraction needed")

5. **Deep dive: "Akra–Bazzi needs no separate regularity check: the integral already accounts for a large f."** Where: "Akra–Bazzi, stated and used", "The Master theorem is the one-term case". What: hand-wavy and partly wrong. What replaces regularity is the polynomial-growth hypothesis on f: the regularity-breaking f (n at 4ʲ, n² elsewhere) violates it, so the theorem does not apply to it at all; the integral does not "account for" that f, the hypothesis excludes it. The same section says this correctly two bullets earlier ("The condition is on f's growth, not on its size"), so the two bullets disagree. Fix: "needs no regularity condition because its polynomial-growth hypothesis already forbids the f that regularity exists to exclude". Severity: minor.

Resolution: fixed (Deep dive: the polynomial-growth hypothesis forbids the f that regularity exists to exclude)

6. **Deep dive: "T(4ʲ) is about n²/4".** Where: "Regularity" bullet. What: the limit is 4/15 ≈ 0.267 (R(4ʲ)/n² → 4/15, which `examples.py` asserts); n²/4 is 0.25, and the file and the page should quote the same number. Fix: "T(4ʲ) → 4n²/15 although f(n) = n there". Severity: minor.

Resolution: fixed (Deep dive now says T(4ʲ) tends to 4n²/15)

7. **Prove it 2's explain mixes three notations and leaves H unsubscripted.** Where: Prove it 2 explain: "ln ln n − ln ln 2", "level i sums to n/(lg n − i)", "T(n) = n·H = Θ(n lg lg n)". What: (a) ln ln n − ln ln 2 is the integral of du/(u ln u); with log₂ (which the on-screen column 64/6 … 64/1 uses) it is ln 2·(ln ln n − ln ln 2): same Θ, but the equation as written is only right for the natural log and the recurrence on screen says "n/log n" with no base; (b) "lg" appears nowhere else in the chapter (the convention is log₂ on screen where the base matters, plain log inside Θ); (c) "H" with no subscript is undefined (topic 1 wrote Hₙ). Fix: "∫₂ⁿ du/(u ln u) = ln ln n − ln ln 2, started at 2 because f is undefined at 1 … level i sums to n/(log₂ n − i), a harmonic series, so T(n) = n·H_{log₂ n} = Θ(n log log n)". Severity: minor.

Resolution: fixed (Prove it 2 explain: ∫₂ⁿ du/(u ln u) with the start explained, log₂ throughout, H subscripted log₂ n, Θ(n log log n))

8. **Step 5 asserts what the CLRS 4th edition says while the page admits nobody opened it.** Where: step 5 body, "The CLRS 4th edition (2022) relaxes a ≥ 1 to a > 0 and builds floors and ceilings into the statement."; Deep dive and Sources: "per A. Dillhoff's restatement of its Theorem 4.1; the book itself was not opened". What: the claim is right (Theorem 4.1 there reads "Let a > 0 and b > 1 be constants, and let f(n) be a driving function that is defined and nonnegative on all sufficiently large reals", with aT(n/b) meaning a′T(⌊n/b⌋) + a″T(⌈n/b⌉)), and topic 1 cites the same book's chapter 3 directly, so the hedge sits oddly: either the reel should not state flatly what a second-hand source says, or the book (the publisher posts chapter 4's statement) should be checked and the hedge dropped. Fix: verify against the book or its posted chapter and remove "was not opened"; otherwise soften step 5 to "the 4th edition's statement (2022) allows any a > 0 …" and keep the hedge in Sources only. Severity: minor.

Resolution: fixed (softened: step 5 now says "as restated from the CLRS 4th edition"; the "was not opened" hedge stays in the Deep dive and Sources)

9. **Steps 7 and 8 show "exact" counts for a recurrence the picture does not draw.** Where: `SelectionTree` "exact: T(1,000) = 6,532" under a tree whose sizes are the exact fractions 200, 700, 40, 140, 140, 490; `ThirdsPredict` "exact: T(1,000) = 10,526 ≈ 1.06 · n log₂ n". What: the counts use floors and T(0) = T(1) = 1 (the Deep dive says so; the reel does not), so a learner who recomputes from the pictured sizes gets other numbers (the Deep dive quotes 6,394 with T(0) = 0). Fix: label "exact, with floors and T(0) = T(1) = 1" or drop the two labels and keep the exact counts for step 12 and the Deep dive. Severity: minor.

Resolution: fixed (both labels now read "exact, with floors and T(0) = T(1) = 1")

10. **Deep dive: "When f is undefined or 0 near u = 1, as log u is, start the integral at any constant above 1."** Where: "Akra–Bazzi, stated and used", the statement bullet. What: f = log u being 0 at u = 1 is harmless (∫₁ log u/u^(p+1) du converges); the problem is f undefined or non-integrable near 1, as u/log u is. "or 0" gives the wrong reason. Fix: "When f is undefined near u = 1, as u/log u is, start the integral at any constant above 1; the Θ is unchanged." Severity: minor.

Resolution: fixed (Deep dive: "When f is undefined near u = 1, as u/log u is, start the integral at any constant above 1; the Θ is unchanged")

11. **Narration 5 says "two over four" for a line that shows ½·n².** Where: `narration.json` step 5, "For a plain power it holds by itself. Here, two over four, one half."; the screen's regularity line reads "2·(n/2)² = ½·n² ≤ c·n², c = ½ < 1" and the caption's "c = a/b^d, here 2/4" is caption-only. Fix: say "a over b to the d: two over four, one half", or add "= a/b^d = 2/4" to the on-screen line. Severity: minor.

Resolution: fixed (narration 5: "A over b to the d... here two over four, one half")

12. **Narration 2: "A level is a few nodes of one size."** Where: `narration.json` step 2. What: level 6 has 64 nodes; "a few" misdescribes the thing the column counts. Fix: "A level is some number of nodes, all of one size, so its total is that number times the work of one." Severity: minor.

Resolution: fixed (narration 2: "A level is some number of nodes, all of one size, ...")

13. **Predict options give their reasoning away by length.** Where: steps 8, 10 and Prove it 2: the correct option is the longest and contains the full explanation ("No: every full level sums to n, so Θ(n log n)"; "Nothing: the step had to come back to c·n, and c·n + n is larger"; "No case applies: f sits below the watershed n by only a log factor; Akra–Bazzi (p = 1) gives Θ(n log log n)"). What: a test-wise learner picks the longest; the explanation belongs in `explain`, which already repeats it. Fix: shorten to the claim ("No: Θ(n log n)"; "Nothing"; "No case applies: Θ(n log log n)") and keep the distractors the same length. Severity: minor.

Resolution: fixed (options shortened to the claim: "No: Θ(n log n)", "Nothing", "No case applies: Θ(n log log n)"; the reasoning stays in explain)

Counts: Flow 8 (1 major), Gap hunt 7 (0 major), Expert reader 13 (2 major). Total 28 findings, 3 major.
