# REVIEW: Asymptotic notation and case analysis (`dsa.asymptotic-notation`)

## Looks review (2026-10-11, Opus)

Judged against DESIGN.md → "The looks review checks", OUTLINE.md and narration.json, from the reel test's screenshots in `site/test-results/` (`desktop-` and `phone-asymptotic-notation-01…12.png`, built 17:51). Two gaps in that set: `01` shows step **2** a moment after it starts (headline "below n₀…", caramel curve not drawn yet), so step 1 is never captured; and both predict steps are captured only after the first option has been clicked, so their question frames are never shown. To cover those I took extra captures of the built `site/dist` with reduced motion (final frames) for steps 1, 3, 6 and 9 at the same two sizes. They are in the session scratchpad and are not part of the repo.

What works: steps 5 (case bars with Θ on the right), 8 (two-column time/space cards) and 11 (the log-scale ladder, with bar lengths checked against the stated scale: 6.6 %, 38 %, 62 %, 100 %) make their point at a glance on both sizes, and the reel keeps one visual grammar from start to end. Most of the problems below are local, and none of them needs a new storyboard.

Severity: **major** = a learner is misled, misses the step's point, or sees broken text; **minor** = polish or a house-rule slip.

1. **Step 6 (`PivotChoice`), both sizes: the question frame shows the wrong number. Major.**
   What: the first-pivot bar stops at **494,590**, not 499,500. The caption and the narration ("almost five hundred thousand") say 499,500.
   Evidence: `desktop-/phone-asymptotic-notation-06.png` and the question-frame captures. The bar animates over `seg(t, 0.4, 1.8)`, but the step's `duration` is 1.5. The clock is clamped at `duration`, so easeOut(0.786) = 0.990 and 0.990 × 499,500 ≈ 494,590. The value is frozen there before and after the answer.
   Fix: end the bar by 1.4 s (`seg(t, 0.2, 1.4)`) or raise `duration` to ≥ 1.8. Also make the label show the exact target when `a` is 1, which it will then be.

2. **Step 6, phone: the footnote is clipped at the screen edge. Major.**
   What: "the coins are the algorithm's: no input is bad, only an unl…" runs off the right edge in the question frame, and is cut at "…unlucky ru" after the answer.
   Evidence: `phone-asymptotic-notation-06.png` and the phone question capture. The 67-character line at 13 units, × 1.22 on the phone, needs about 640 units and starts at x = 30.
   Fix: break it into two lines ("the coins are the algorithm's:" / "no input is bad, only an unlucky run"), or shorten it to "no bad input, only unlucky runs".

3. **Step 1 (`Opening`), phone: two labels overlap. Major.**
   What: in the second card, "best, worst, average, expected" (right-aligned, 14 u) collides with "which function we bound" (13 u). The two lines interleave, so "we bound" sits under "best,".
   Evidence: the phone capture of step 1 (the test set has no step 1, see the note above). On the phone the drawing is also squeezed to about 265 CSS px wide by the bridge quote.
   Fix: stack each card as three lines (question / values / description), or move the values under the question. The DESIGN rule says to stack when two labels can't keep 24 units apart.

4. **Steps 8, 9, 10: cherry used as a text colour. Major.**
   What: the hero number "4 billion+" (step 10), the hash set's "1,000" extra values (step 8) and the "n²" curve label (step 9) are filled `#8e2f2a`. That is about 2.2 : 1 against the roast background, and step 10's whole point rests on that number.
   Evidence: `desktop-asymptotic-notation-10.png` (the number looks muddy next to the bright 65,534), `-08.png` and `-09.png`. DESIGN.md says cherry is for fills only and red text uses `C.cherryText`.
   Fix: use `C.cherryText` (`#e07a6e`) for all three. This comes for free with finding 14.

5. **Step 9 (`Crossover`): curve labels are misplaced. Major.**
   What: "n²" sits just above the **caramel 100n line** at n ≈ 118, about 100 units below the n² curve at that x, so it reads as a label for the line. "100n" is struck through by its own line, which crosses the "n".
   Evidence: `desktop-asymptotic-notation-09.png`, zoomed, and `phone-asymptotic-notation-09.png`, where "n²" touches the line.
   Fix: put "n²" just left of the n² curve's end (about x = px(130), y = py(16900) − 10, end-anchored) and lift "100n" about 14 units clear of its line. Label the ends of the curves, not points on them.

6. **Step 3 (`PowerRatios`): the two rows use different scales. Major.**
   What: the top row draws the ratio 2 as a full 26-unit square. The bottom row scales 2ⁿ so that 1024 = 130 units, so its first bars (ratios 2, 4, 8) are invisible. At n = 1 both ratios are exactly 2, but the picture shows a big square against nothing. That undercuts the comparison the step exists for.
   Evidence: `desktop-/phone-asymptotic-notation-03.png`.
   Fix: put both rows on one log axis (bar height ∝ log₂ ratio: a flat row of 1s against a staircase 1…10). The other option is a single shared linear axis with the top row drawn as a thin flat line at height 2 and labelled "2". Either way, "always 2" against "doubling" should be honest at n = 1.

7. **Step 7 (`Spread`): the tail the title names is invisible, and so is the w.h.p. idea. Major.**
   What: on a linear scale the 14k and 15k buckets (2 runs and 1 run) are about 0.4 units tall, so the cherry "tail" is a hairline you can't see (zoomed crop of `desktop-…-07.png`). Nothing marks the mean, and nothing on the drawing stands for a with-high-probability bound. The picture shows "a bell, mostly", and the step's idea (expectation vs a tail promise) lives only in the caption.
   Evidence: `desktop-/phone-asymptotic-notation-07.png`.
   Fix: give tail buckets a minimum visible height (or use a log count axis) and draw them in cherry. Add a mean tick at 10,991. Add one dashed threshold line (for example at 13k: "w.h.p. bound: beyond here ≤ 1/nᶜ of runs") with the 3 runs past it highlighted. That makes the "tail" claim something you can see.

8. **Step 12 (`Recap`): the "bound ≠ case" row is reversed. Major.**
   What: "bound ≠ case — function vs inequality" pairs *bound* with "function" and *case* with "inequality", the opposite of step 5 (a case picks the function; a bound is the inequality). The next row, "average ≠ expected — random input vs own coins", keeps the order right, which makes the swap read as deliberate.
   Evidence: `desktop-/phone-asymptotic-notation-12.png`.
   Fix: change it to "inequality vs function", or better, "relates a function / picks the function".

9. **Step 6: "random pivot, every run" misstates the promise. Major.**
   What: the row label "random pivot, every run" next to "10,986 expected" says each run costs 10,986. The promise is *every input*, expected over the coins. Step 7 shows the next moment that runs range from 9,449 to 15,583.
   Evidence: `desktop-asymptotic-notation-06.png`; the caption says "the same for every input order".
   Fix: relabel the row "random pivot, any input order" (the first row could read "first element as pivot, this input").

10. **Step 2 (`Sandwich`): the evidence for n₀ = 10 can't be seen. Major.**
    What: the headline claims "below n₀ the top line is still crossed", but with the y-axis running to 4·16² = 1024, the gap between 3n² + 10n and 4n² for n < 10 is under 3 units (for example 333 vs 324 at n = 9, about 2.4 units). The caramel curve looks laid on top of the 4n² line, so the learner can't see why n₀ is 10 and not 0.
    Evidence: `desktop-/phone-asymptotic-notation-02.png` (and `-01.png`, mid-sweep, where the headline names a crossing on an empty chart).
    Fix: shade the sliver where f > 4n² (n < 10) in cherry and add a small inset or call-out ("n = 9: 333 > 324"). The other option is to plot f/n² against the band [3, 4], which turns the sandwich into two horizontal lines and a curve that enters the band at n = 10. That is clearer, and it matches step 4's ratio idea.

11. **Phone, steps 1, 3 and 6: the drawing shrinks and its labels drop below the size floor. Minor.**
    What: when the caption is long (the bridge quote, predict options), the drawing gets about 265 CSS px of width. The 13-unit headers ("QUICKSORT, 1,000 KEYS ALREADY IN ORDER", "RATIO TO 2ⁿ…", "A COST CLAIM HAS THREE PARTS") come out around 7.5–8 px by cap height in the screenshots. The test passes because it measures line-box height.
    Evidence: `phone-asymptotic-notation-03.png`, `-06.png` and the step-1 phone capture.
    Fix: lower the drawing's `h` on these steps (330 → about 260) so it scales up, or cut the header line on phone (`portrait`). Separately, consider measuring font size × scale in the test.

12. **Steps 1, 2, 4, 5, 12: Θ and 0 look alike in JetBrains Mono. Minor.**
    What: in the mono labels, "Θ" renders as an oval with a bar and sits right next to zeros: "ratio → 0 so o" directly above "ratio → 3 so Θ, not o" (step 4), "Θ(n²)" in step 2's headline, and "ratio → 0 or ∞" in the recap. In a lesson about these symbols, a learner can read "so 0".
    Evidence: crop of `phone-asymptotic-notation-04.png`.
    Fix: set the notation letters (O, Ω, Θ, o, ω) in the serif inside mono lines (a `<tspan>` in Fraunces), or write "Theta" in the verdict lines.

13. **Steps 3 and 6: the answer reveals don't animate. Minor.**
    What: the player keeps `t` clamped at `duration` after an answer (`ReelPlayer.tsx` never resets it), so `seg(t, 0.1 + i·0.08, …)` (step 3) and `seg(t, 0.2, 1.2)` (step 6) are already complete when they are first evaluated. The 2²ⁿ bars "shooting up" (OUTLINE step 3) and the 10,986 bar filling just pop in. The final frames are right.
    Fix: run a local clock from the moment `answer` becomes non-null (a `useEffect` with rAF, or a CSS transition on height), or ask the player owner to restart `t` on answer for predict steps. Also step 6's "?" placeholder sits under the 3-unit minimum stub of the empty bar at x = 30–33 (phone question capture); move it to x = 44.

14. **All steps: the scenes copy the kit instead of importing it. Minor (house rule).**
    What: `scenes.tsx` defines its own `C`, `Svg`, `T`, `Bar`, `MONO`, `SERIF`. DESIGN.md says to build from `site/src/reels/kit.tsx` and not copy it. The copy has no `cherryText`, which is the root of finding 4, and it won't pick up kit fixes.
    Fix: `import { C, Svg, T, MONO, SERIF } from '../../../../../reels/kit'` and keep only `Bar` local if the kit's differs.

15. **Steps 5, 7, 8, 11: labels under the 13-unit minimum. Minor.**
    What: 12-unit text in bucket labels and counts (step 7), formula lines such as "n(n−1)/4+n−Hₙ" (step 5), the "STEPS / EXTRA VALUES" headers (step 8) and the scale footnote (step 11).
    Fix: raise them to 13.

16. **Steps 1, 4, 5, 10: more than one serif element per step. Minor.**
    What: DESIGN allows one Fraunces number or word per step. Step 5 has three Θ labels, step 4 three verdict glyphs, step 10 two hero numbers and step 1 three questions. The recap's seven is defensible as a list.
    Fix: keep the serif for the one element that matters (step 10: "4 billion+" only, with 65,534 in mono 20 u; step 5: mono Θ labels in caramel), or record the recap and verdict-glyph exception in DESIGN.md.

17. **Step 9: the final frame doesn't show the caption's main point. Minor.**
    What: the caption says "below that the 'worse' algorithm wins", but the final frame only says "past n = 100, 100n is the cheaper one". 100n stays caramel ("good") across the whole range, including where it is the costlier one.
    Fix: lightly shade the region n < 100 with a small label "n² cheaper here" and the region n > 100 with "100n cheaper here". The colours can then stay as they are.

18. **Step 4 (`Ratios`): the value columns have no n headers and use e-notation. Minor.**
    What: the three numbers per card line up under nothing (n = 10 / 1,000 / 1,000,000 appears only in the header line), and "2.0e-5" and "5.0e+4" are programmer notation.
    Fix: add a small taupe column header row ("n=10 · 10³ · 10⁶") above the first card, aligned to x = 50/162/274, and format as "2×10⁻⁵" and "5×10⁴".

19. **Steps 1 and 12: the opening problem never appears in a picture. Minor.**
    What: OUTLINE's problem ("quicksort is O(n log n)" hides three choices) is opened and closed only in captions. Step 1's cards are generic and step 12 is a list. The loop the reel promises is never drawn.
    Fix: in step 1, put the claim on top with three leader lines to the cards. In step 12, add (or swap in as the final frame) the same three cards filled in: bound "O (upper)", case "expected, random pivots", resource "time (comparisons)".

20. **Step 3 narration gives the trick away and differs from the screen. Minor.**
    What: the narration asks "is the function four to the n in big O of two to the n?" while the screen asks about 2²ⁿ. Rewriting 2²ⁿ as 4ⁿ is exactly the insight the predict question tests.
    Fix: narrate "is two to the two n in big O of two to the n?" and leave "four to the n" for the `answer` lines (which already say it).

21. **Step 10: "the input only doubled" is said, not shown. Minor.**
    What: two text cards. The idea in the OUTLINE ("the input only doubles, the work explodes") has no picture of the input.
    Fix: add a 32-cell and a 64-cell bit strip above each count (thin rects, taupe), so the doubling of the input sits beside the 65,536× in work.

22. **Step 12, phone: tight gap between columns. Minor.**
    What: "average ≠ expected" (serif 17 u) ends about 13 CSS px from "random input vs own coins", under the 24-unit gap rule.
    Fix: shorten it to "avg ≠ expected", or move the right column to x = 280 and trim its texts.

23. **Steps 3 and 6, phone: the answer explanation is cut off under the controls. Minor (player, all reels).**
    What: after answering, the "Not quite" panel continues below the fold. In step 6 only the first line shows. The learner has to know to scroll the caption.
    Fix (player): scroll the explanation into view on answer, or show a fade with a "more" cue as unanswered captions do.

24. **Test screenshots miss step 1 and both question frames. Minor (`site/tests/reels.mjs`, not this topic).**
    What: see the note at the top. `01` is step 2 at about t = 0.25 s, and predict steps are captured only after a (wrong) answer, so the looks review can't see question frames from the test output.
    Fix (test owner): capture each step after the clock settles (wait for `t ≥ duration`, not a key press that can advance), and for predict steps take a `-q` shot before clicking an option.

**Count: 10 major (1–10), 14 minor (11–24).**

### Resolution (2026-10-11)

Status per finding. All edits are in `scenes.tsx` (plus one narration line); nothing outside this topic was touched.

1. **Fixed.** Bar runs `seg(t, 0.2, 1.4)` inside the 1.5 s duration, so the question frame shows exactly 499,500.
2. **Fixed.** The footnote is two lines.
3. **Fixed.** Step 1 cards are three stacked lines (question / values / description).
4. **Fixed.** Hash-set "1,000", "n²" label and "4 billion+" use `C.cherryText`.
5. **Fixed.** "n²" is end-anchored left of the curve's end; "100n" sits above-left of its line.
6. **Fixed.** Both rows share one log axis (bar height = log₂ ratio, 13 units per doubling); at n = 1 both bars are equal.
7. **Fixed.** Tail buckets have a 9-unit minimum height and are cherry; mean tick at 10,991; dashed "w.h.p. cap (example)" at 14,000 with "3 runs beyond it" (2 + 1 runs from `HIST`). The cap position is illustrative and labelled so.
8. **Fixed.** Row now reads "bound: inequality, case: function".
9. **Fixed.** Rows read "first element as pivot, this input" and "random pivot, any input order".
10. **Fixed.** Step 2 now plots f(n)/n² against the band [3, 4]: the curve (cherry-text red) is above 4 for n < 10 and enters the band at n₀ = 10, with a "n = 9: 333 > 324" call-out.
11. **Partly fixed.** Step 1's header line is gone, step 6's header is dropped on portrait, and step 3's header is short. The remaining part (the test measuring font size × scale) is in `site/tests/`: **skipped, shared code**.
12. **Fixed.** Verdict lines in step 4 use words ("little-o", "Theta", "little-omega"); step 2's headline sets Θ in the serif via a `<tspan>`. Step 5's mono Θ labels stay mono (finding 16) and sit away from zeros.
13. **Fixed in the topic.** A local clock (`useSinceAnswer`, rAF, final frame under reduced motion) animates the answer reveals in steps 3 and 6, with no player change. The "?" moved to x = 44. Caveat: the test screenshot is taken about 0.3 s after the click, so it can show the reveal part-way.
14. **Fixed.** `scenes.tsx` imports `C`, `Svg`, `T`, `Bar`, `SERIF` from `reels/kit`; no local copies remain.
15. **Fixed.** All labels are at least 13 units.
16. **Fixed, with one recorded exception.** Step 1: one serif element (the claim). Step 5: mono Θ labels. Step 10: only "4 billion+" is serif; 65,534 is mono 20. Step 4 keeps its three serif verdict glyphs because DESIGN.md names those ratio cards as a good example; the recap's seven serif keys are a list.
17. **Fixed.** Both sides of n = 100 are shaded and labelled "n² cheaper here" / "100n cheaper here".
18. **Fixed.** Column headers "n = 10 · 10³ · 10⁶" align to x = 50/162/274; values print as "2×10⁻⁵" and "5×10⁴".
19. **Fixed.** Step 1 draws the claim "quicksort is O(n log n)" with leader lines to the three cards; step 12's final frame decodes it (bound: O (upper), case: expected, random pivots, resource: time (comparisons)).
20. **Fixed.** Narration step 3 now asks "is the function two to the two n in big O of two to the n?" (same line count; `answer` lines unchanged).
21. **Fixed.** A 32-cell and a 64-cell bit strip sit in the two cards of step 10.
22. **Fixed.** "avg ≠ expected", and the recap rows were compacted (value column at x = 236).
23. **Skipped.** Player behaviour in `site/src/reels/` (shared, locked).
24. **Skipped.** Test capture in `site/tests/reels.mjs` (shared, locked).

Also fixed in the same pass: step 5's Θ and formula lines were moved apart after the phone overlap check flagged them.
