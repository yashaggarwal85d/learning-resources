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

## Looks and learning review (Opus, 2026-10-12)

Judged from the 42 screenshots in `site/test-results/` (desktop 1440 × 900 and phone, every step, `-q` = question frame), against `OUTLINE.md`, `narration.json` and DESIGN.md → "The looks review checks". Step 2 (the merge-sort tree with its column of 64s summing to 448) is the reel at its best: one idea, the column is the point, the final frame teaches the step on its own at both sizes. No findings there.

1. **Step 1 · phone: the caption is missing.** What: the phone frame shows the vector and three cards, then empty space down to the controls: no eyebrow, title, bridge, body or "Tap to continue". Every other phone frame has its caption. The opening step loses its bridge and its problem statement. Fix: open step 1 at phone width and find out whether this is a real rendering bug (caption sheet scrolled or hidden after the earlier swipe checks, or the bridge block pushing it out) or a state the test leaves behind. Fix the cause and re-shoot. Severity: major (verify first).

Resolution: not fixed because it is not a bug in this topic: a fresh load of the reel at phone size (iPhone 13) shows step 1 with its bridge, eyebrow, title, body and "Tap to continue" (checked by loading the page and screenshotting after 5 s), and `site/tests/reels.mjs` reaches the step-1 screenshot only after its swipe, tap and vertical-swipe checks, which leave the page's snap scroller scrolled so the caption sits below the visible area (the visual is also shifted down in that capture). The step's own files are unchanged; the shared player/test state is outside this topic's files.

2. **Step 1 · both: the bracket spine stops short of the third card.** What: the vertical taupe line from the vector ends level with the second card's branch. The third card's tick (median of medians) hangs off nothing. Fix: run the spine down to the last branch's y. Severity: minor.

Resolution: fixed (the spine now runs down to the third card's branch, y = 96 + 2·92 + 38)

3. **Step 3 · both: question frame wording and strips.** What: the caption and narration say "Same tree shape", but the tree is now 8-way. In the question frame only the bottom strip has a label (a lone taupe "?" at the far left), and the other strips have none. All four strips are the same length, so the picture never shows the level count growing; only the column does. Fix: say "Same kind of tree". In the question frame, show the 512 / 4,096 / 32,768 strip labels with "?" only on the bottom one, as the outline says. Severity: minor.

Resolution: fixed (caption and narration say "Same kind of tree"; the question frame shows the strip labels 512, 4,096 and 32,768 with a "?" only on the bottom strip; strip lengths now grow with the node count, 75 units per level; the node counts are asserted in examples.py)

4. **Steps 3, 8, 10, 13, 14 · phone answer frames: the drawing shrinks under the explain box and its text drops below the readable size.** What: once the "Not quite" box opens, the visual is scaled down by about 20–35% from its question frame. Examples: step 8's "333 / 111 / 222" labels, step 3's strip counts, step 10's whole inequality chain, and step 13/14's column labels all look about 8 px. In step 10 the new ratio bars and their "2¹" labels sit directly on top of the "10/15 · §1.1" eyebrow, with no gap. These reveals are the payoff of the predict steps, and on a phone they are the smallest text in the reel. Fix: on portrait (`portrait` in the step context), give the answer state a shorter canvas. For example, step 10 drops the chain after the answer and shows only the climbing bars, and steps 3 and 8 drop the dot/strip rows and keep the column. Alternatively, raise label sizes so that they stay ≥ 9.5 px at the answer-frame scale. Severity: major.

Resolution: fixed (on a phone steps 3, 8, 10, 13 and 14 use a short 250-unit canvas, so the drawing keeps the full 0.62 scale next to the open "Not quite" box and labels stay at 13+ units at about 10 px or more; step 3 and 8 use a 30-unit row pitch, step 8's edges stop at level 3 and the deeper levels are dots; step 10 drops the first three chain lines after the answer and keeps only the failing step above the bars, so nothing sits on the eyebrow; steps 13 and 14 use 24-unit rows)

5. **Steps 3, 8, 10, 13, 14 · both: the answer captures show half-finished reveals.** What: the test shoots 600 ms after the answer, but the reveals run about 2 s. Step 3 still shows three "?" with no 520,192 or "leaves win: Θ(n³)". Step 8 still shows three "?" with no "Θ(n log n)" line or exact count. Step 10 shows one of seven bars. Steps 13 and 14 show no verdict line. The final frames (which `scenes.tsx` does draw) could not be reviewed. Fix: shorten each reveal to about 1 s (0.12 s beats, verdict by 0.9 s). The aim is that the frame a learner sees right after choosing is already complete. Then re-shoot and look at the five answer frames. Severity: minor (but until it is done, the predict steps' final frames are unreviewed).

Resolution: fixed (all five reveals, and step 15's, finish in about 0.5 to 0.7 s: 0.06 s column beats, verdict at 0.3 to 0.6 s; the captured answer frames now show the full column, totals, verdict lines and bars)

6. **Step 4 · both: the third column ("leaves win") never reaches full opacity.** What: in `ThreeShapes` the third column's labels fade in over `seg(t, 3.5, 3.9)`, but the step's duration is 3.6 and the player clamps `t` at the duration. "× 2", "4,096 … 262,144", "leaves win" and "Θ(n³)" therefore stay at about 45% opacity forever. This is visible in both screenshots. The third verdict is the one that names the case step 3 just taught. Fix: set the step's duration to 4.0, or start the third column earlier (t0 = 0.2 + k·1.0). Severity: major.

Resolution: fixed (step 4's duration is 4.0 and the columns start 1.1 s apart, so the third column's labels end at 3.7 s and reach full opacity)

7. **Step 5 · phone: the recurrence column runs into the watershed column.** What: "8T(n/2) + n²" → "n³" and "2T(n/2) + n²" → "n" are about 18 units apart at phone scale (DESIGN asks for 24+). The rows read as one string. Fix: move the watershed column right by about 15 units and the f column with it (the case column has room), or set the recurrences at 13 units on portrait. Severity: minor.

Resolution: fixed (on portrait the table columns sit at x = 30, 190, 315, 375, leaving 40 units between a recurrence and its watershed)

8. **Step 5 · both: the heaviest caption in the reel, and the regularity line floats.** What: the body is 15 lines on desktop, dense with ASCII math ("O(n^(log_b a − ε))", "Ω(n^(log_b a + ε))"), while the drawing uses superscripts. The "regularity: …" line under the table is not visibly tied to the case-3 row it belongs to. Fix: move the 4th-edition hypotheses sentence to the Deep dive (it is there already) and keep the three cases plus regularity. Prefix the line with "row 5:" or draw a short caramel bracket from it to the last row. Severity: minor.

Resolution: fixed (the 4th-edition sentence is gone from the caption; it is already in the Deep dive "a < 1" and "Erickson's form" bullets; the regularity line now starts "row 5 regularity:")

9. **Step 6 · both: the point is the quietest thing on screen, and the verdict is missing.** What: the step is about the neighbour ratios drifting (0.83, 0.80 … 0.50), so that no constant fits. Those ratios are 13-unit taupe, detached at the far right (desktop x ≈ 1130 px, about 100 px from the nearest bar label). The eye lands on the six caramel bars, which shrink by a constant difference and look like an ordinary staircase, and then on "1,344" in 20 units. That number is a partial sum, and the real T(64) = 1,408 sits under it in a second line. The answer the caption gives, Θ(n log² n) by the extended case 2, is not on the drawing. Fix: bring the ratio column next to the bar labels (x ≈ 380) in latte at 15 units, and make it the step's caramel element. Demote 1,344 to latte and lead with "T(64) = 1,408 = Θ(n log² n): extended case 2" as the one 20-unit line. Severity: major.

Resolution: fixed (the ratios are 15-unit caramel and sit right next to each bar's value, stepping left as the bars shrink; the bars are taupe so the ratios are the one accent; the lead line is "T(64) = 1,408" in 20 units, with "= 1,344 (64 × 21, six levels) + 64" in latte under it and "Θ(n log² n): extended case 2" in caramel)

10. **Steps 7–8 · both: the lower tree levels read as barcode noise, and step 7 has no verdict.** What: from level 3 down, the stacked hair-thin boxes and edges ("|||| ||| |") are illegible at both sizes, and they draw the eye away from the column. In step 7 the "Θ(n)" the step concludes is not on the drawing (only "< 10,000"). The exact-count note ("exact, with floors and T(0) = T(1) = 1: T(1,000) = 6,532", about 55 characters) is wider than the column, and on phone it ends about 15 px from the screen edge. "40" and "140" on level 2 are about 10 px apart on phone. Fix: draw levels 4–5 as dot rows without edges (as step 2 does). Put "< 10n: Θ(n)" under the rule. Shorten the note to "exact: T(1,000) = 6,532" and leave the T(0) convention in the caption. Nudge the "40" label left. Severity: minor.

Resolution: fixed (levels 4 and 5 are dot rows without edges, as in step 2; step 7 has "< 10,000 = 10n" and "so T(n) = Θ(n)" under the rule; the note is "exact: T(1,000) = 6,532" (and "exact: T(1,000) = 10,526" in step 8), the T(0) convention stays in the caption; the "40" label is nudged left)

11. **Step 9 · both: crowded origin and unexplained cards.** What: on phone, the y-tick "0.5" and the x-tick "0" nearly touch at the origin, and the three card lines start right under the x tick labels. On desktop the three cards ("2T(n/2) + n / p = 1" …) have no heading, so a learner may read them as points on this curve. Fix: drop the "0.5" y-tick (or start the y axis at 0.5 with the x ticks 6 units lower). Give the cards a taupe heading "same p, other recurrences". On portrait, add 12 units above the cards. Severity: minor.

Resolution: fixed (the 0.5 y-tick is dropped; the cards have a taupe heading, "same p, other recurrences" on a phone and "other recurrences" on desktop, where the longer text would not fit; on portrait the cards start 24 units lower)

12. **Step 10 · desktop: the strike-through hides what it strikes.** What: the cherry bar runs through the middle of "= O(n)", so the struck claim is barely legible. A learner should still be able to read what was wrong. Fix: draw the strike 2 units thinner and slightly above the x-height, or dim the text to taupe and strike it at 60% opacity. Severity: minor.

Resolution: fixed (the struck line is taupe, the strike is 1.5 units thick at 60% opacity and sits above the x-height, so "= O(n)" stays readable)

13. **Steps 11 and 15 · both: three accents and two serif labels.** What: each step uses cinnamon (the failed guess's title), cherry (its border, ✗ and "not closed" text) and caramel (the good guess and the ✓). That is three accents, and both card titles are serif. DESIGN allows two accents and one serif word per step. Fix: make the failed card's title crema (or latte) and keep cherry for failure and caramel for success. Keep the serif only on the successful guess's title. Severity: minor.

Resolution: fixed (the failed guess's title is crema and plain, cherry stays on the border, the cross and the "not closed" line, caramel is the good guess and its tick; only the successful title is serif)

14. **Step 12 · both: the summary is all text.** What: the closing cards are well built and the loop closes with real numbers. But the caption opens "Read the shape of the column", and the closing picture shows no column. Nine lines of similar weight compete, and the three verdicts are the only colour. "Akra-Bazzi" uses a hyphen; everywhere else in the reel it is an en dash. Fix: add a tiny three-bar column glyph at the right of each card (flat, single short bars, shrinking), reusing step 4's bars. That makes the final frame recall the reel's idea. Use "Akra–Bazzi". Severity: minor.

Resolution: fixed (each closing card has a small three-bar column glyph at the right: flat and wide for merge sort, flat and short for binary search, shrinking for median of medians; the text already had the en dash "Akra–Bazzi", no hyphen remains in the reel's text)

15. **Step 13 · both: the column hugs the left, and its ratio label floats far away.** What: the bars are normalised to the bottom row (117,649), so the top rows are 3-unit stubs. The labels sit at x 30–110 and the only ratio "× 7/4" is at x = 440 (desktop about 1130 px), half a screen away. The right two-thirds of the drawing is empty. Fix: place the ratio label just right of the second row's value (x ≈ 200), or put it between the first two rows as step 7 does. Consider a log scale or a max bar of 400 units so the growth fills the canvas. Severity: minor.

Resolution: fixed (bars scale to a 330-unit maximum; the ratio label sits just right of the lower row's value, between the rows; a log scale was not used so that bar length stays proportional to the total)

16. **Step 14 · both: the drawing asks the wrong question.** What: the question frame's caramel prompt says "which end of the column wins?". That text is copied from step 13 through the shared `ColumnQuestion`. The caption asks "A colleague applies case 2 and writes Θ(n log n). Right?", and the correct answer is that no case applies, so neither end wins by a constant factor. The picture primes the learner towards a Master-theorem case. Fix: pass a `prompt` prop to `ColumnQuestion` ("case 2? the column says …" or "does any case apply?") and use it in Q2. Severity: major.

Resolution: fixed (ColumnQuestion takes a `prompt`: step 13 asks "which end of the column wins?", step 14 asks "does any case fit this column?")

17. **Step 15 · both: the question frame eliminates a distractor and half-answers.** What: before the learner chooses, the failed card already reads "> c·n²: a larger c never helps". That rules out the option "Choose a larger c" and hints at the right one. DESIGN: "the question frame shows the setup without giving the answer away". Fix: in the question frame the third line should read "> c·n²: the step does not close". Show "a larger c never helps" only after the answer. Severity: major.

Resolution: fixed (the question frame's third line reads "> c·n²: the step does not close"; "a larger c never helps" appears only after the answer)


Counts: 17 findings, 6 major (1, 4, 6, 9, 16, 17), 11 minor. Steps without findings: 2. Accent and label budget: over budget only on steps 11 and 15 (finding 13). Pacing: steps 5, 6 and 9 carry 13–15-line captions; the rest are within a glance.
