# OUTLINE: Asymptotic notation and logarithms (`de.asymptotic-notation-logarithms`)

Content plan and storyboard (ROUTINE.md 2.2), written 2026-10-12 before anything else was built. Writing follows this file. A change of plan during writing is made here first, with the reason.

- **Syllabus line (DE §1.1, refresher):** "Asymptotic notation and logarithms — O/Θ/Ω and how costs grow with input size; logarithms in any base and the change of base (log_b x = ln x / ln b); why a large base makes the logarithm tiny (B-tree height, external-sort passes); full treatment → *Data Structures & Algorithms* Ch.1."
- **Contract:** `CHAPTER.md` → "### 5. Asymptotic notation and logarithms". Scope, outcomes, concepts, bridge and handoff are kept as written there, except for the items under "Changes from the chapter plan" at the end.
- **Previous topic:** 4, Software delivery workflow (refresher, being built in parallel). Its planned handoff: "Last of the five refreshers: the notation for how costs grow, and the logarithms the rest of the chapter counts with."
- **Next topic:** 6, Memory hierarchy and latency numbers (full). Its planned bridge: "Big-O treated every step alike. On real hardware a step costs a nanosecond in a cache or tens of milliseconds from object storage; here is the ladder in between."
- **Neighbours that use this topic's numbers:**
  - Topic 13 (B+-trees vs LSM) uses the `orders` index height (4 levels at about 400 entries per page).
  - Topic 14 (I/O cost model, held) uses "log₁₆,₃₈₄ of a million is under 1.5" and "log₁₀₀₀(10⁹) = 3" in its Prerequisites 01, and the 1 TiB sort's log ≈ 1.43 and 2 passes in its reel and Deep dive.
  - Topic 16 (external merge sort) owns the merge mechanics.
- **Kind:** refresher, about 5 minutes, 11 steps, 3 predict steps. It opens on `RefresherList` (`../refreshers.tsx`, `current={4}`) and closes with "In one breath".
- **Running example:** the shop. The `orders` table has 100,000,000 rows. The nightly sort of `order_events` is 1 TiB, with 16 GiB of memory and 1 MiB blocks (CHAPTER.md, "One running example").

## Learning outcomes

After this refresher the learner can:

1. Read and compare O, Θ and Ω statements: O is a ceiling (at most), Ω a floor (at least), Θ both, all "for every n from some n₀ on", with constants dropped. And say why "it's O(n²)" does not mean "it's slow".
2. Convert a logarithm between bases in their head: log_b x = ln x / ln b; log₂ x ≈ 3.32 · log₁₀ x; 2¹⁰ ≈ 1,000.
3. Estimate a B-tree's height and a sort's pass count from a large base: the `orders` index is 4 levels at about 400 entries per page, and the 1 TiB sort takes 2 passes (log ≈ 1.43: one pass of runs, and the merge of 64 runs fits in one more because the fan-in is up to 16,383).
4. Say why big-O alone doesn't predict wall-clock time: it drops constants on purpose and counts every step as if it cost the same, whatever memory tier the step touches (the handoff to topic 6).

**The problem (opened in step 1, closed in step 11).** "How does this cost grow when the data grows?" A test can't answer it. By the end the learner prices three things the chapter needs: a growth rate (Θ(n log n)), an index height (4 levels) and a sort (2 passes). The learner also knows the one thing the notation won't say: seconds.

## House rules for this reel (from DESIGN.md, the chapter's visual language and the DSA asymptotic topic's REVIEW.md)

- **Kit and colour.** Import `C`, `Svg`, `T`, `Bar`, `Stack` from `site/src/reels/kit.tsx` (`../../../../../reels/kit`). Don't copy the kit (DSA review #14).
- **Colour meanings (chapter grammar):**
  - `caramel`: the cost being counted (the divisions, the levels, the passes) and the answer.
  - `cinnamon`, large shapes only: the alternative compared (base 2, merging two at a time).
  - `cherry` fills with `C.cherryText` labels: a bad outcome (n² at 100 million rows, a level count that falls short).
  - `crema` for values, `latte` for labels, `taupe` for axes and notes.
  - At most two accents per step.
- **Notation glyphs.** In JetBrains Mono, Θ looks like 0 (DSA review #12). Wherever Θ, Ω or O sits next to digits in a drawing, set the letter in Fraunces with a `<tspan>`, or write it out ("Theta"). That serif counts as the step's one serif element. Step 2's band label and the recap are the only places the Θ glyph is drawn; steps 3 and 10 write it out as "Theta" (step 3 already spends its serif on the O).
- **Predict reveals are complete stills.** The player keeps `t` at `duration` after an answer (DSA review #13; the player is shared and locked). So each `answer` frame is designed to read fully with no motion, plus an optional CSS opacity transition. The question frame never shows the answer.
- **No scientific notation on screen.** Use thousands separators (CHAPTER.md "Time"; DSA review #18). Big counts are written out or in words ("10 quadrillion").
- **Text sizes.** 13 units minimum, values 15–17, the one number that matters 20+. At most four labels competing.
- **Captions.** One idea per step, short enough for three lines on a phone plus "more". The longer reasoning goes in the predict `explain` and the Deep dive.
- **Narration.** No digits, symbols or code names (automatic check). Logs are spoken as "log base two of a billion", Θ as "big theta", n² as "n squared". The `answer` clip never contradicts the screen, and the question narration never gives the trick away (DSA review #20).

## Reel steps and storyboard

Canvas: 600 units wide. Each step picks `h` from `portrait` (portrait height first, then landscape). Every number on screen is computed or asserted in `examples.py`, as listed in "Examples to execute".

### 1. Counting cost, in five minutes (`Opening`, not a predict step)

- **Visual idea:** `RefresherList` with `current={4}`. Rows 1–4 are ticked, and "Asymptotic notation and logarithms" is lit caramel with "NOW ▶". The learner sees this is the last of the five §1.1 refreshers. (It's the shared component; it isn't changed.)
- **On screen, portrait and landscape:** the component as it is (600 × 420; its own layout serves both).
- **Beats:** the component's own (rows arrive 0.2 s + i · 0.22 s). Duration 2.
- **Real values:** none.
- **Final frame:** five rows, the fifth lit.
- **Caption point:** the bridge, then permission to skip. Draft: "Tests check that a change gives the right answer; they don't say how its cost grows with the data. That takes O, Θ and Ω, and logarithms in any base: the last of the five refreshers. If it's all familiar, swipe on to the memory hierarchy."
- **Narration sketch:** "Tests tell you a change is right. They don't tell you how its cost grows when the data grows. For that you need big O, big theta and big omega, and logarithms in any base."

### 2. O is a ceiling, Ω a floor, Θ both (`RatioBand`)

- **Visual idea:** don't draw the cost. Draw the cost divided by the candidate growth rate. For a job that takes g(n) = 3·n·log₂n + 8n steps, the ratio g(n) / (n·log₂n) = 3 + 8/log₂n falls as n grows, crosses the ceiling c = 4 at exactly n₀ = 256, and then stays inside the band between the floor c = 3 and the ceiling c = 4 forever.
  - The band is Θ, n₀ is "from some n on", and the constants 3 and 4 are the c's in the definitions.
  - Why it clicks: on a plain cost plot the gap before n₀ is about 3% and invisible (the DSA reel's n₀ evidence "can't be seen", review #10). The ratio makes "eventually inside the band" a picture, and it shows that the 3 and the 8n are what Θ throws away.
- **Portrait (h 420):**
  - Headline at the top (y ≈ 40), latte 15.
  - A fixed live readout under it (y ≈ 66), crema 15: "n = 256 → ratio 4.00".
  - Plot area x 60–560, y 100–360. The x axis is a log₂ scale from n = 2 to n = 100,000,000, with taupe 13 ticks at "2", "256", "65,536" and "100 M".
  - The y axis runs from ratio 0 to 12. Only two ticks are labelled, on the right: "ceiling c = 4" (caramel 13) and "floor c = 3" (latte 13), with their dashed horizontal lines.
  - The dotted n₀ line at x(256), labelled "n₀ = 256" (taupe 13) under the axis.
- **Landscape (h 340):** the same layout with the plot at y 90–290. The labels keep their x positions.
- **Beats:**
  - 0.2 s: axes and the two dashed lines fade in.
  - 0.6–3.0 s: the ratio curve (crema, 3 units) draws left to right with a dot at its tip. The readout updates to the dot's n: 11.00 at n = 2, 5.00 at 16, 4.00 at 256, 3.50 at 65,536, 3.30 at 100 M.
  - The dot crosses n₀ at about 1.3 s (n = 256 is 27% of the way along the log₂ axis). The n₀ line lights caramel, and the headline flips from "below n₀ the ceiling is crossed" to "from n₀ = 256 on: 3 ≤ ratio ≤ 4".
  - 3.2 s: the band between 3 and 4 fills with caramel at 0.18 opacity, and "Θ(n log n)" appears inside the band's right end. The Θ is in serif, the step's one serif element.
  - Duration 3.6.
- **Real values:** ratio 11.00 (n = 2), 5.00 (16), 4.00 (256), 3.50 (65,536), 3.30 (100,000,000); n₀ = 256; c = 3 and c = 4. At n = 128, g = 3,712 > 4·n·log₂n = 3,584.
- **Final frame:** the falling curve inside the shaded band from n₀ on, the lit n₀ line, the headline "from n₀ = 256 on: 3 ≤ ratio ≤ 4", and Θ(n log n) in the band.
- **Caption point:** the three definitions in one breath, and what gets dropped. Draft: "O(f) is a ceiling: cost ≤ c·f(n) for every n from some n₀ on. Ω(f) is a floor: cost ≥ c·f(n). Θ is both. This job takes 3n·log₂n + 8n steps. Divided by n·log₂n, it stays between 3 and 4 from n₀ = 256 on: Θ(n log n). The constants and the 8n drop out."
- **Narration sketch:** "Big O is a ceiling: from some point on, the cost stays below a constant times the function. Big omega is a floor. Big theta is both… This job's cost, divided by n log n, stays between three and four from two hundred fifty six on. So it's theta of n log n."

### 3. Is it also O(n²)? (`LooseCeiling`, predict)

- **Visual idea:** the same job against a much higher ceiling. The question frame shows only the job and the candidate. The answer frame shows how far above the job n² sits at the shop's scale, so the learner sees "true, but loose".
- **Question frame, portrait (h 380):**
  - A card at the top: "job: 3·n·log₂n + 8n steps" (crema 17).
  - Under it, a caramel outline card: "O(n²) ?" (O in serif 22).
  - Below, a taupe note: "Theta(n log n), from the last step" (written out: the O is this step's serif, see the house rules).
  - No bars.
- **Question frame, landscape (h 320):** the two cards side by side, the note under them.
- **Answer frame, a complete still:** two horizontal bars at n = 100,000,000 on a log₁₀ scale of steps that starts at 1,000,000,000 ("1 billion") and ends at 10 quadrillion, so the job's bar is about 1/7 of the n² bar. (A log axis starting at 1 would draw the job at 62% of n², which hides the "million times" gap.)
  - Row 1: "job: 8,772,627,428 steps" (crema bar).
  - Row 2: "n²: 10,000,000,000,000,000 steps" (caramel outline bar, label "10 quadrillion").
  - A verdict line: "true: a ceiling, over a million times too high" (latte 15).
  - A footnote: "c = 11 works from n = 1" (taupe 13).
- **Beats:** the question frame arrives on 0.2 / 0.6 s. Duration 1.2. The answer frame is static.
- **Question (body):** "That job is Θ(n log n). Is it also O(n²)?"
- **Options:**
  - "No: it grows like n log n"
  - **"Yes: O is only a ceiling"** (correct)
  - "Only below n₀ = 256"
  - "No: O(n²) is for the worst case"
- **Explain:** "Yes. log₂n ≤ n, so the cost is at most 11·n² for every n ≥ 1: n² is a ceiling, just a loose one, over a million times above the job at 100 million rows. O alone never says 'slow', and it isn't a case either: this job has one cost, and any cost, best or worst, can have an O, an Ω and a Θ. Knuth's 1976 letter complains about people rejecting a sorting method 'because its running time is O(n²)'. Say Θ when you mean the growth rate."
- **Real values:** 8,772,627,428 (g at 10⁸, rounded); 10¹⁶ written out; ratio 10¹⁶ / g ≈ 1,139,909 ("over a million"); c = 11 with g(n) ≤ 11n² for all n ≥ 1.
- **Why each wrong option is wrong (red team):** "No: it grows like n log n" reads O as Θ. "Only below n₀" inverts the definition (11n² is above g at every n ≥ 1, and O is about large n anyway). "Worst case" confuses a bound with a case (expert list #1). None of the three is defensible: g is a single function, so there's no other case in which it could fail.
- **Narration:** the question says "Is it also big O of n squared?" without hinting. The `answer` clip: "Yes. Big O is only a ceiling, and n squared is a very high one…"

### 4. Double the data (`Race`)

- **Visual idea:** a three-lane race of n, n·log₂n and n² as the shop grows from a thousand orders to a million to 100 million. Each lane is a bar on a log scale of time, at a stated round speed of a billion simple steps per second. At small n every lane finishes at once. At 100 million the n² bar runs off the canvas into cherry. Growth decides at data sizes, not at test sizes.
- **Portrait (h 400):**
  - Top: a big crema counter "n = 1,000 orders" (serif 24, the step's one serif), stepping to 1,000,000, then 100,000,000.
  - Under it, a taupe note: "at 1,000,000,000 steps per second (a round assumption)".
  - Three lanes at y ≈ 150 / 230 / 310. Each has a lane label above its bar on the left ("n", "n·log₂n", "n²", latte 15) and a time value right-aligned at x 540 above the bar (crema 17).
  - Bar track x 40–540, log scale from 100 ns to 1 day (not from 1 µs: the n lane at n = 1,000 is exactly 1 µs and would draw as a zero-length bar). The n² bar at 100 M reaches the right edge and turns cherry, and its value reads "116 days" in `C.cherryText`.
- **Landscape (h 320):** the counter and note on one row, lanes at y ≈ 120 / 190 / 260.
- **Beats:**
  - 0.2 s: lanes appear.
  - 0.6 s: n = 1,000. Bars grow to 1 µs / 10 µs / 1 ms.
  - 1.6 s: n = 1,000,000. 1 ms / 20 ms / 17 min.
  - 2.6 s: n = 100,000,000. 0.1 s / 2.7 s / 116 days, the n² bar going cherry.
  - Values swap in place, so nothing moves into another label. Duration 3.4.
- **Real values:**
  - n = 1,000: 1,000 / 9,966 / 1,000,000 steps, so 1 µs / 10 µs / 1 ms.
  - n = 1,000,000: 1,000,000 / 19,931,569 / 10¹² steps, so 1 ms / 20 ms / 1,000 s ≈ 17 min.
  - n = 100,000,000: 10⁸ / 2,657,542,476 / 10¹⁶ steps, so 0.1 s / 2.7 s / 10,000,000 s ≈ 116 days.
  - Doubling ratios at 100 M (caption only): ×2, ×2.08, ×4.
- **Final frame:** the three lanes at 100 million, with n and n·log₂n short and n² cherry, off the edge, at "116 days".
- **Caption point:** growth rates matter at data sizes. Draft: "At a thousand rows everything is instant. At the shop's 100 million orders, assuming a billion steps a second: n takes 0.1 s, n log n 2.7 s, n² 116 days. Double the data and n doubles, n log n a bit more (×2.08), n² quadruples."
- **Narration sketch:** "At a thousand rows, nothing matters. At a hundred million, n squared takes a hundred and sixteen days…"

### 5. Bisect, at a billion (`Halvings`, predict)

- **Visual idea:** a logarithm counts divisions, drawn as a staircase. Each step up is one division by the base, and the tower's height is the logarithm. It calls back the Git refresher: bisect needed about 10 tests for 1,000 commits.
- **Question frame, portrait (h 420):**
  - Left column: a short caramel staircase of 10 steps labelled "1,000 commits → 10 tests (Git refresher)" (latte 13, two lines).
  - Right column: the base "1,000,000,000" (crema 17) under a faint taupe outline of a much taller tower with "?" at its top.
- **Question frame, landscape (h 340):** the same, the two columns farther apart.
- **Answer frame, a complete still:** the right tower drawn as 30 thin caramel steps (about 9 units each in portrait), with three side labels at steps 10, 20 and 30: "976,563", "954", "0.93 · done". Every 10 halvings divide by 1,024. A big "30" (serif 28) at the top, and a taupe footnote "log₂(10⁹) = 29.9".
- **Beats:** question elements on 0.2 / 0.6 s. Duration 1.2. The answer frame is static.
- **Question (body):** "A logarithm counts divisions: log_b x is how many times you divide x by b to get down to 1. Bisect needed about 10 tests for 1,000 commits. How many halvings take a billion down to one?"
- **Options:**
  - "About 20"
  - **"About 30"** (correct)
  - "About 1,000"
  - "About 10 million"
- **Explain:** "About 30. 2³⁰ = 1,073,741,824 is the first power of two past a billion, so log₂(10⁹) ≈ 29.9. Every 10 halvings divide by 1,024, about a thousand. A billion is a thousand cubed, so it takes 3 × 10. A million times more data than bisect's 1,000 commits costs only 20 more halvings. Binary search over a billion sorted keys needs at most 30 comparisons the same way."
- **Real values:**
  - log₂(1,000) = 9.97, so 10 tests (2¹⁰ = 1,024).
  - log₂(10⁹) = 29.9, so 30 halvings (2²⁹ = 536,870,912 < 10⁹ ≤ 2³⁰ = 1,073,741,824).
  - After 10, 20 and 30 halvings: 976,562.5 (shown as 976,563), 953.7 (954) and 0.93. After 29 it is still 1.86, so "down to one" means "to 1 or below": 30.
- **Red team:** "About 20" is the right answer for a million (log₂ 10⁶ = 19.9), the classic slip of one factor of a thousand; "About 1,000" and "About 10 million" are linear thinking. "At most 30 comparisons" for binary search holds both for three-way comparisons (⌊log₂ n⌋ + 1 = 30) and for the two-way lower-bound form (⌈log₂(n + 1)⌉ = 30). An integer loop that halves with `x //= 2` stops after 29 (it counts ⌊log₂ n⌋), so `examples.py` must halve rounding up (`x = (x + 1) // 2`) or count `while 2**k < n`.
- **Narration:** the question avoids "thirty", "a thousand cubed" and "ten per thousand". The `answer` clip: "About thirty. Every ten halvings divide by about a thousand, and a billion is a thousand, times a thousand, times a thousand."

### 6. Any base, one formula (`Rulers`)

- **Visual idea:** change of base as measuring one length with different rulers. ln(10⁹) = 20.72 is drawn as one crema bar, three times. Each copy is cut into pieces of length ln b: ln 2 = 0.693, ln 10 = 2.303, ln 1,000 = 6.908. The number of pieces is log_b x = ln x / ln b: 29.9, 9 and 3. The formula becomes "how many rulers fit", and the base is visibly a constant factor.
- **Portrait (h 420):**
  - Top: the formula "log_b x = ln x / ln b" (serif 20, the one serif).
  - Under it: "ln(1,000,000,000) = 20.72" (crema 15).
  - Three rows at y ≈ 150 / 250 / 350. Each row has a label above its bar on the left ("÷ ln 2 = 0.693", latte 13) and its piece count right-aligned at x 540 (caramel 20: "29.9", "9", "3").
  - Bars x 40–540 with caramel tick marks at every multiple of ln b: about 17 units apart in row 1, 56 in row 2, 167 in row 3.
- **Landscape (h 340):** rows at y ≈ 130 / 205 / 280.
- **Beats:**
  - 0.2 s: the formula and the length line.
  - 0.6 s: row 1's ticks sweep left to right, then "29.9".
  - 1.4 s: row 2, then "9".
  - 2.2 s: row 3, then "3".
  - Duration 3.2.
- **Real values:** ln(10⁹) = 20.72; ln 2 = 0.693; ln 10 = 2.303; ln 1,000 = 6.908; 29.9 / 9 / 3; 1 / log₁₀2 = 3.32 (caption).
- **Final frame:** three equal bars, cut 29.9, 9 and 3 times, under the formula.
- **Caption point:** the formula, a mental shortcut, and why O drops the base. Draft: "Any base converts to any other: log_b x = ln x / ln b. One length, three rulers. In your head: log₂ x ≈ 3.32 × log₁₀ x, so a billion (9 zeros) is about 30 halvings. Fixed bases differ only by a constant factor, so O(log n) needs no base. Counts of levels or passes do, and so does a base that is itself a parameter, like a page's fan-out."
- **Narration sketch:** "Any base converts to any other: divide the natural log of x by the natural log of the base…"

### 7. A large base flattens the tower (`Towers`; the chapter's "division staircase")

- **Visual idea:** the same billion divided by 2, by 1,000 and by 16,384, drawn as three staircases side by side. The base-2 tower from step 5 comes back in cinnamon, as the alternative. The large-base towers are short and wide, in caramel: 3 steps, then 2 steps and a sliver. The large base visibly flattens the tower, which is the whole reason B-trees and merges use bases in the hundreds or thousands.
- **Portrait (h 420):**
  - Three columns centred at x ≈ 90 / 270 / 450 (everything left of x 536, clear of the desktop side rail), with a shared baseline at y 380.
  - **Height = number of divisions.** Every step in every tower is the same height (9 units in portrait, 7 in landscape), so a tower's height is its logarithm. Step 6 already showed that the bases measure the same length; this step shows the count.
  - Base 2: 29 thin steps plus a 0.9 sliver (about 40 units wide), 269 units tall, up to y ≈ 111 (cinnamon). It reads as step 5's 30-step tower, but its height matches its "29.9" label, as the 16,384 tower's sliver matches "2.14".
  - Base 1,000: 3 wide steps (about 130 units wide), 27 units tall (caramel).
  - Base 16,384: 2 full wide steps plus a 0.14 sliver, about 19 units tall (caramel).
  - The large-base towers read as low, wide platforms beside the base-2 spire.
  - Under each: "÷ 2", "÷ 1,000", "÷ 16,384" (latte 15).
  - Above each: "29.9", "3", "2.14" (crema 17). The two short towers' labels sit just above their tops, with 24+ units between them.
- **Landscape (h 340):** the same three columns, baseline y 300.
- **Beats:**
  - 0.2 s: the base-2 tower fades in, already built (callback).
  - 0.8 s: the base-1,000 tower builds step by step at 0.3 s per step.
  - 2.0 s: the base-16,384 tower builds.
  - 2.8 s: the three counts pop.
  - Duration 3.2.
- **Real values:** log₂(10⁹) = 29.9; log₁₀₀₀(10⁹) = 3; log₁₆,₃₈₄(10⁹) = 2.14 (10⁹ / 16,384 = 61,035; again 3.73; a third division finishes); log₁₆,₃₈₄(10⁶) = 1.42 (caption).
- **Final frame:** a tall thin cinnamon tower beside two short caramel ones, with counts 29.9, 3 and 2.14.
- **Caption point:** "The bigger the base, the fewer the divisions: a billion is 29.9 halvings, 3 divisions by 1,000, just over 2 by 16,384. log₁₆,₃₈₄ of a million is 1.42, under 1.5. Indexes and sorts divide by hundreds or thousands at a time, so their logarithms are tiny."
- **Narration sketch:** "The bigger the base, the fewer the divisions. A billion needs about thirty halvings, but only three divisions by a thousand…"

### 8. How tall is the orders index? (`IndexLevels`, predict)

- **Visual idea:** a B-tree's height is a logarithm in base fan-out, shown as capacity per level. Each level multiplies the keys reachable by about 400 (one 8 KB page of entries). The question is how many levels 100 million keys need. The answer frame shows level 3 falling short (cherry) and level 4 covering it, with the caramel root-to-leaf path.
- **Question frame, portrait (h 420):**
  - A wide crema band at the bottom: "100,000,000 order ids" (crema 15).
  - Above it, one page icon: "1 page = 8 KB ≈ 400 entries" (latte 13).
  - Stacked faint level outlines narrowing to a root, with "? levels" (caramel 20).
- **Question frame, landscape (h 340):** the same, the page icon to the left of the stack.
- **Answer frame, a complete still:** four rows, top (root) to bottom, each a band whose width grows with its level.
  - Row 1: "1 level: 400"
  - Row 2: "2 levels: 160,000"
  - Row 3: "3 levels: 64,000,000", with a cherry fill and the label "short" in `C.cherryText`
  - Row 4: "4 levels: 25,600,000,000", in caramel
  - A caramel path drops through one page per level.
  - A big "4" (serif 28) at the top right.
  - A taupe footnote: "binary tree: 27 levels".
- **Beats:** question elements on 0.2 / 0.6 / 1.0 s. Duration 1.2. The answer frame is static.
- **Question (body):** "100 million orders, a B-tree index on order_id. A full 8 KB index page holds about 400 entries (an 8-byte key, a 6-byte row pointer, small headers: about 20 bytes each). How many levels from root to leaf?"
- **Options:**
  - "3"
  - **"4"** (correct)
  - "8"
  - "27"
- **Explain:** "4. Each level multiplies the reach by 400: three levels reach only 400³ = 64 million keys, and the fourth reaches 25.6 billion. log₄₀₀(10⁸) = 3.07, rounded up to 4. Any fan-out from 100 to 464 gives 4 levels, so the estimate is robust. A binary tree would need 27. Topic 13 shows what each of those page reads costs."
- **Real values:**
  - (8,192 − 24) / 20 = 408; with the b-tree's 16-byte special space at the end of every page, (8,192 − 24 − 16) / 20 = 407. Either way "about 400" for a full page.
  - Real pages aren't full: PostgreSQL builds leaf pages to a default 90% fill and upper pages to 70%, so about 366 entries per leaf and 285 per internal page. That still gives 4 levels (10⁸ / 366 → 273,225 leaves → 959 → 4 → 1 root).
  - 400¹ through 400⁴ = 400; 160,000; 64,000,000; 25,600,000,000.
  - log₄₀₀(10⁸) = 3.07, so 4 levels.
  - Fan-out 100 gives 4 (100⁴ = 10⁸ exactly); 464 gives 4 (464³ = 99,897,344, just short); 465 gives 3 (465³ = 100,544,625); 99 gives 5.
  - Binary: log₂(10⁸) = 26.6, so 27.
- **Red team:** "3" is ⌊3.07⌋ (forgetting the ceiling), "8" is log₁₀(10⁸) (dropping the base), "27" is the binary tree. "3" would be right only from a fan-out of 465 up, which an 8-byte key on 8 KB pages can't reach, so it is wrong under the stated assumption.
- **Narration:** the question says "about four hundred entries per page"; it avoids "four hundred cubed". The `answer` clip: "Four. Three levels of four hundred reach only sixty four million keys…"

### 9. Sort passes are a logarithm too (`SortPasses`)

- **Visual idea:** the staircase again, now for the nightly sort. The base is the number of blocks memory holds.
  - Step one (pass 1, run formation) divides 1,048,576 blocks by 16,384 and leaves 64 sorted runs.
  - Step two (pass 2, the merge) is a sliver: 64 runs, merged all at once, become one file. The merge can take up to 16,383 runs at once (one block per input run, one for the output), and 64 ≤ 16,383, so one merge pass finishes.
  - The tower is 1.43 steps tall: one whole step of run formation and 0.43 of a merge step. A partial merge still reads and writes everything, so it costs a whole pass: 1 + 1 = 2 passes. (This is the held topic's 1 + ⌈log₁₆,₃₈₃ 64⌉; it is not "round the whole log up", which can be one short when the runs only just outnumber a power of the fan-in, see the Deep dive.)
  - Merging two at a time (cinnamon) would be a 7-step tower beside it.
- **Portrait (h 420):**
  - Left: the caramel staircase. The base label is "1,048,576 blocks (1 TiB ÷ 1 MiB)" (crema 15). At the first landing: "64 runs · pass 1". At the top: "1 sorted file · pass 2".
  - Big "2 passes" (serif 24) at the top left.
  - Right: a faint cinnamon 7-step tower labelled "two at a time: 7 passes" (cinnamon 15, large enough for the accent rule). Its steps are passes (run formation, then six two-way merges), not divisions by one base, so its label must say "passes", and the comparison drawn is 2 passes against 7, not 1.43 against 7.
  - Bottom note: "memory holds 16,384 blocks (16 GiB ÷ 1 MiB)" (taupe 13).
  - Line: "log₁₆,₃₈₄(1,048,576) = 20/14 ≈ 1.43" (latte 15).
- **Landscape (h 340):** the staircase left, the cinnamon tower right, notes along the bottom.
- **Beats:**
  - 0.2 s: the base label and the memory note.
  - 0.8 s: step 1 rises, then "64 runs · pass 1".
  - 1.8 s: the sliver step rises, then "1 sorted file · pass 2".
  - 2.6 s: the log line, then "2 passes".
  - 3.0 s: the cinnamon 7-step tower fades in.
  - Duration 3.6.
- **Real values:**
  - N/B = 2⁴⁰ / 2²⁰ = 1,048,576 blocks; M/B = 2³⁴ / 2²⁰ = 16,384.
  - log = 20/14 = 1.43; runs N/M = 64; merge fan-in up to M/B − 1 = 16,383 ≥ 64.
  - Passes 1 + ⌈log₁₆,₃₈₃ 64⌉ = 2 (equal to ⌈1.43⌉); binary 1 + log₂ 64 = 7.
- **Final frame (superseded by review fix 14, see "Changes after review"):** a 1.43-step caramel staircase labelled pass 1 and pass 2, "2 passes", and a cinnamon 7-step tower beside it.
- **Caption point:** the pass count is the same logarithm with a big base, and powers of two make it mental. Draft: "The nightly job sorts 1 TiB in 1 MiB blocks with 16 GiB of memory: 1,048,576 blocks, 16,384 in memory. Pass one writes 64 memory-sized runs. The merge can take up to 16,383 runs at once, so pass two merges all 64. In powers of two, log is 20/14 ≈ 1.43: one pass of runs, then part of a merge, which still costs a whole pass. 2 passes. Two at a time: 7."
- **Narration sketch:** "Sorting is the same logarithm with a big base. One pass makes sixty four sorted runs; one more merges them all at once. Two passes."

### 10. Big-O is not a stopwatch (`SameSteps`)

- **Visual idea:** two jobs with the same step count and the same Θ, but an unknown price per step. Two rows, each "100,000,000 steps · Θ(n)". Row A's steps are a fast run of small caramel ticks. In row B each step carries a taupe wait bar whose length is a "?". The notation counts the ticks. It can't see the waits, and the waits are what the next topic measures.
- **Portrait (h 380):**
  - Row A at y ≈ 120: label "scan A: 100,000,000 steps" (latte 15) above 24 small caramel ticks packed into x 40–200, and "time: ?" right-aligned at x 540 (crema 15).
  - Row B at y ≈ 240: the same label above 6 ticks, each followed by a taupe wait bar, the row spanning x 40–540 and running past the "time" column. "time: ?" sits above the row instead.
  - Bottom note: "same count, same Θ(n); the price of a step isn't in the O" (taupe 13; Θ written "Theta" or in a serif tspan, per the house rules).
- **Landscape (h 320):** the rows at y ≈ 110 / 210.
- **Beats:**
  - 0.2 s: row labels.
  - 0.6–1.6 s: row A's ticks run.
  - 1.0–2.4 s: row B's ticks and waits alternate (the waits grow in taupe).
  - 2.6 s: the bottom note.
  - Duration 2.8.
- **Real values:** 100,000,000 (the `orders` rows). No latencies on screen: CHAPTER.md "canonical numbers" keeps tier numbers for topic 6.
- **Final frame:** two equal-count rows, one compact and one stretched by waits, and the note.
- **Caption point:** why big-O alone doesn't give seconds. Draft: "Big-O drops constants and lower terms on purpose, to compare growth whatever the hardware. So it can't give you seconds. Two Θ(n) scans of the same 100 million rows can take very different times, depending on where each step's data lives: in a cache, in RAM, on disk, across the network."
- **Narration sketch:** "Big O throws away constants on purpose. So it can't tell you seconds… The same hundred million steps can take very different times, depending on where the data lives."

### 11. In one breath (`Recap`)

- **Visual idea:** five rows, the whole topic as one still, in the Python and Git recap pattern. Each row is short, so no two labels share a line.
- **Portrait (h 420):** five stacked rows at y ≈ 70, 140, 210, 280, 350, each on one line at 15–16 units, with a caramel bullet:
  1. "O ceiling · Ω floor · Θ both" (the letters in serif tspans; the recap is the agreed exception to one serif per step, as in the DSA review's #16 note)
  2. "log_b x = divisions by b down to 1"
  3. "log_b x = ln x / ln b"
  4. "big base, tiny log: 4 levels, 2 passes"
  5. "O counts steps, not seconds"
- **Landscape (h 340):** the same rows at a tighter pitch.
- **Beats:** rows arrive at 0.2 + i · 0.3 s. Duration 2.
- **Real values:** 4 levels, 2 passes (from steps 8 and 9).
- **Final frame:** all five rows.
- **Caption point:** keep these five. The Prerequisites panel has the full treatment in the algorithms track. Then the handoff. Draft: "Five things to keep. For the full treatment (cases, little-o, proofs) see the algorithms track in the Prerequisites panel. Big-O counts steps as if each cost the same. Next: the memory hierarchy, where the same step costs anything from a nanosecond to tens of milliseconds."

Timing: 11 captions of about 35–60 words, with narration at about 140 words a minute, come to about 5 minutes.

## Deep dive headings (`index.mdx`, the python-essentials pattern)

- `## After this refresher you can`: the four outcomes above.
- `## A little deeper`
  - `### O, Ω and Θ, precisely`:
    - The MIT 6.006 definitions with c and n₀; Θ = O ∩ Ω.
    - "g is O(f)" means set membership, and the "=" is one-way (MIT; Knuth "speaking about sets of functions"; "The equal sign here really means").
    - f = Ω(g) exactly when g = O(f), from the two definitions (c ↔ 1/c).
    - Knuth's 1976 letter: O used for lower bounds ("reject a particular sorting method"), and his case for Ω and Θ as "order at least" and "order exactly". Words quoted only from the passages that survived the OCR; the symbols come from MIT.
    - Reading all n items is Ω(n) (MIT, "Linear time is often necessary…").
    - A bound is not a case: O, Ω and Θ can each describe best-, average- or worst-case cost. One sentence, pointing to DSA "Asymptotic notation and case analysis" for cases, little-o and ω, amortized and expected bounds.
  - `### Growth at data sizes`:
    - MIT's growth table (constant, logarithmic, linear, quadratic, polynomial, exponential).
    - The race table at 1,000, 1,000,000 and 100,000,000 rows (steps and time at the stated 10⁹ steps/s).
    - Doubling ratios ×2 / ×2.08 / ×4; MIT's "If n = 1000, log n ≈ 10".
    - Polylog grows slower than any polynomial ((log n)^a = O(n^b), MIT exercise).
    - Binary search is logarithmic (MIT).
    - Why the n₀ in step 2 is 256 (8n ≤ n·log₂n ⇔ n ≥ 2⁸), and that n₀ comes paired with c: with c = 5 it is 16, with c = 11 it is 2. No c works at n = 1, because n·log₂n is 0 there while the cost is 8, which is exactly why the definitions say "from some n₀ on".
  - `### Logarithms and the change of base`:
    - DLMF definitions: ln as the integral of dt/t (real on positive reals, only zero at 1); the inverse of exp (4.2.25); z^n as repeated multiplication (4.2.27). So log_b x = k means b^k = x, and "a logarithm counts divisions by b".
    - The change of base 4.2.8: log_a z = ln z / ln a; 4.2.9: log_a z = log_b z / log_b a; 4.2.10: log_a b = 1 / log_b a.
    - ln 10 = 2.302585… and log₁₀ e = 0.4342944819… (DLMF).
    - Product and power rules (MIT).
    - Mental conversions: log₂ x ≈ 3.32 · log₁₀ x; 2¹⁰ = 1,024 ≈ 10³; log_{2^a}(2^b) = b/a, as for the sort.
    - Why the base disappears inside O and not in counts (Vitter's "not hide them within the big-oh"). The base disappears only when it is a fixed number: log_B N = log N / log B, so when B is a parameter of the problem (fan-out, M/B) it changes the bound and must stay.
    - The word-RAM assumption w > log₂ n (MIT): on a 64-bit machine, log₂ of anything addressable is under 64.
  - `### Large bases: index height and sort passes`:
    - Vitter 2008 on Bayer and McCreight's B-tree: node degree Θ(B), "height … roughly log_B N"; splits propagate to the root, "which is how the tree grows in height". PostgreSQL 18: a root split "adds a new level"; leaf pages are typically over 99% of all pages (the flip side of a big base).
    - The `orders` index estimate with its assumption stated: 8 KB pages, a 24-byte page header, 4-byte line pointers, index tuples = a 6-byte heap TID plus t_info, with the key at a MAXALIGN boundary (8 bytes on common 64-bit builds, an assumption). That gives about 20 bytes for a bigint key, so about 400 per full page (408 before, 407 after the b-tree's 16-byte special space, BTPageOpaqueData in `nbtree.h`).
    - The sensitivity table: fan-out 99 / 100 / 400 / 464 / 465 gives 5 / 4 / 4 / 4 / 3 levels.
    - Real pages are not all full, so the fan-out is an estimate: PostgreSQL's `nbtree.h` sets a default leaf fillfactor of 90% and a fixed 70% above the leaves, applied at index build and when the rightmost page splits (which is where an ascending `order_id` inserts). That is about 366 and 285 entries, still 4 levels. Deduplication and wider keys move it further; the 100–464 range is the margin. Topic 13 covers fill and splits; §5.1 covers node layout.
    - The sort: Vitter's run formation (N/M runs), merge passes of up to R = Θ(m) runs, O(log_m n) passes; Vitter's own example N = 10¹⁰, M = 10⁷, B = 10⁴ gives log_m n = 2.
    - The chapter's sort, exactly as the held I/O topic words it: N/B = 2²⁰, M/B = 2¹⁴, log_{M/B}(N/B) = 20/14 ≈ 1.43 = 1 + log_{M/B}(N/M); with fan-in M/B − 1 = 16,383, passes = 1 + ⌈log_{M/B−1}(N/M)⌉ = 1 + ⌈log₁₆,₃₈₃ 64⌉ = 2.
    - Why the ceiling matters (passes are whole). ⌈log_{M/B}(N/B)⌉ gives the same 2 here; the two can differ by one only when the run count falls between (M/B − 1)^k and (M/B)^k.
    - Merging two at a time: 1 + log₂ 64 = 7 passes.
    - Pointers: 13 (B-tree mechanics), 14 (I/O model and the cost per pass), 16 (fan-in under a memory budget, merge mechanics).
  - `### Why big-O doesn't predict wall-clock time`:
    - The notation drops constants on purpose: MIT ("ignore constant factor differences in hardware performance").
    - Vitter: "it is equally important to consider any other constants hidden".
    - Lower-order terms matter at small n: at n = 16 the 8n term of step 2's job is 40% of its cost (128 of 320 steps). Θ drops it because it fades as n grows.
    - Every step costs the same in the RAM model, but not on hardware: topic 6 (memory hierarchy) and topic 14 (counting block transfers instead of steps, "Why CPU big-O misleads").
- `## Try it`: three short Python snippets the learner can paste, all executed in `examples.py`.
  1. Change of base in code: `math.log(x, b)` is `log(x)/log(b)` (Python docs). `math.log(1000, 10)` returns `2.9999999999999996`, so `int()` or `floor` of a float log gives 2 (and `math.log(10**9, 10)` gives `8.999999999999998`, so 8). The error runs the other way too: `math.log(125, 5)` is `3.0000000000000004`, so `math.ceil` gives 4. `math.log10` and `math.log2` are exact on these powers but not a general fix. Count levels with integers instead: a loop, or `int.bit_length()`, minding its off-by-one: `n.bit_length()` is ⌊log₂ n⌋ + 1 and `(n - 1).bit_length()` is ⌈log₂ n⌉ (both 30 for a billion, but 11 and 10 for 1,024).
  2. Count levels and passes exactly with integer loops (the index and the sort).
  3. Watch n log n grow by counting comparisons, not by timing. Wrap keys in a class that counts `__lt__` calls, sort 2¹⁴, 2¹⁵ and 2¹⁶ seeded random keys, and check that the count stays under n·log₂n and grows about 2.1× per doubling. A pairwise duplicate check, by contrast, makes n(n − 1)/2 comparisons and grows 4×.
- `## Common slips` (the python-essentials "In code review" slot, for this topic):
  - "O(n²) means slow" (it's a ceiling).
  - "O means worst case" (a bound is not a case).
  - Dropping the base in a count of levels or passes, or inside O when the base is a parameter (log_B N = log N / log B: writing O(log N) is still true but loses the factor log B, so it is no longer tight).
  - Forgetting the ceiling on passes and levels, or putting it in the wrong place (passes are 1 + ⌈merge log⌉, not always ⌈whole log⌉).
  - The float `log` floor and ceil bugs, and the integer halving loop with `//= 2` that counts one short.
  - Comparing two O's at small n without the constants.
  - Reading a Θ(n) as a time.
- `## Sources`: the list below, "Last verified: 12 October 2026", "Expert sign-off: pending", and the report-an-error link as in the other topics.

## Prerequisites panel (`prerequisites.mdx`)

- **01 High-school algebra: powers and roots** (declared `high-school-algebra`). b^k is k factors of b; 10⁹ = 1,000³. Self-check: "What is 2¹⁰?" (1,024.)
- **02 The four refreshers before this one** (Before this): Python, Git (bisect's halving reappears in step 5), shell, delivery workflow.
- **Resources:**
  - The DSA reel "Asymptotic notation and case analysis" (`<Resource kind="reel" host={props.host} domain="data-structures-and-algorithms" …>`, shown as another track).
  - The DLMF §4.2 page.
  - The MIT 6.006 Recitation 1 PDF.
  - Any video only after its title, author and length are verified (oEmbed). The held I/O topic's "Change of base formula" (Khan Academy) entry is a candidate; re-verify its length.

## Examples to execute (`examples.py`) and what each asserts

Plain Python 3 standard library (`math`, `random`). Every number above is asserted here. Integer arithmetic wherever a count is exact.

1. **Bounds (step 2).**
   - g(n) = 3·n·log₂n + 8n. For every n in 256..2²⁰ (and sampled powers up to 2²⁷): 3·n·log₂n ≤ g(n) ≤ 4·n·log₂n.
   - At n = 128: g = 3,712 > 3,584 (the ceiling is crossed below n₀). At n = 256: g = 8,192 = 4·256·8 (equality at n₀).
   - Ratio values 11.00 (n = 2), 5.00 (16), 4.00 (256), 3.50 (65,536), 3.30 (10⁸, rounded to 2 places).
   - n₀ is the least power of two with 8n ≤ n·log₂n, which is 256.
   - The 8n share at n = 16: 8·16 / g(16) = 128 / 320 = 40%.
2. **Loose ceiling (step 3).**
   - g(n) ≤ 11·n² for n in 1..10⁶ (and log₂n ≤ n).
   - round(g(10⁸)) = 8,772,627,428.
   - 10¹⁶ / g(10⁸) > 1,000,000 (= 1,139,909 to the integer; corrected by the fact-check from 1,139,912).
3. **Race (step 4).**
   - Steps and times at n = 10³, 10⁶ and 10⁸, at 10⁹ steps/s: 1 µs / 10 µs / 1 ms; 1 ms / 20 ms / 1,000 s; 0.1 s / 2.7 s / 10⁷ s.
   - Rounded displays: "17 min" = round(1,000 / 60) = 17; "116 days" = round(10⁷ / 86,400) = 116.
   - round(10⁶ · log₂ 10⁶) = 19,931,569 and round(10⁸ · log₂ 10⁸) = 2,657,542,476.
   - Doubling ratio for n·log₂n at 10⁸: 2.08.
4. **Halvings (step 5).**
   - Halving a billion until ≤ 1 gives 30: with floats, with an integer loop that rounds up (`x = (x + 1) // 2`), and with `while 2**k < n`. Also assert the trap: the floor loop (`x //= 2` while x > 1) gives 29 = ⌊log₂ 10⁹⌋, so the reel never uses it.
   - (10⁹ − 1).bit_length() == 30 and 2²⁹ < 10⁹ ≤ 2³⁰.
   - round(log₂ 10⁹, 1) = 29.9; log₂ 1,000 rounds to 10 and ceil gives 10 (2¹⁰ = 1,024).
   - Values after 10, 20 and 30 halvings: 976,562.5, 953.67… (shown 954) and 0.93.
5. **Change of base (step 6).**
   - math.log(x, b) == math.log(x) / math.log(b) for the reel's pairs.
   - ln(10⁹) = 20.72, ln 2 = 0.693, ln 10 = 2.303, ln 1,000 = 6.908 (rounded as shown).
   - 20.72 / 0.693 → 29.9, / 2.303 → 9.0, / 6.908 → 3.0. Assert the displayed counts with round(), never int(): math.log(10**9) / math.log(10) is 8.999999999999998 (math.log(10**9, 1000) happens to be 3.0).
   - 1 / log₁₀ 2 rounds to 3.32, and 3.32 × 9 rounds to 29.9.
   - DLMF consistency: abs(log₁₀ e − 0.4342944819) < 1e-10 and abs(ln 10 − 2.302585093) < 1e-9.
6. **Towers (step 7).**
   - log₁₀₀₀(10⁹) == 3 (integer check 1000**3 == 10**9).
   - round(log₁₆,₃₈₄(10⁹), 2) = 2.14; 10⁹ // 16,384 = 61,035 and 10⁹ / 16,384² rounds to 3.73.
   - round(log₁₆,₃₈₄(10⁶), 2) = 1.42 < 1.5.
7. **Index levels (step 8).**
   - (8,192 − 24) // 20 = 408 and (8,192 − 24 − 16) // 20 = 407 (b-tree special space), about 400.
   - At PostgreSQL's default fill: int(8,152 · 0.9) // 20 = 366 per leaf, int(8,152 · 0.7) // 20 = 285 per internal page; a page-by-page count (⌈10⁸ / 366⌉ = 273,225 leaves, then ⌈÷ 285⌉ to 959, 4, 1) gives 4 levels.
   - 400³ = 64,000,000 < 10⁸ ≤ 400⁴ = 25,600,000,000.
   - The smallest h with 400**h >= 10**8 is 4 (integer loop); round(log₄₀₀ 10⁸, 2) = 3.07.
   - The level function (integer loop, no float log) gives 5 at 99, 4 at 100 (100**4 == 10**8), 4 at 464 (464**3 = 99,897,344 < 10**8), and 3 at 465.
   - Binary: ceil(log₂ 10⁸) = 27.
   - Agrees with the held I/O topic's own assert that 100 keys per page gives 4 levels.
8. **Sort passes (step 9).**
   - With TiB = 2⁴⁰, GiB = 2³⁰, MiB = 2²⁰: N/B = 1,048,576, M/B = 16,384, runs = 64, fan-in = 16,383.
   - log(N/B, M/B) == 20/14 to 1e-12, rounding to 1.43.
   - 1 + ceil(log(64, 16,383)) == 2 == ceil(log(N/B, M/B)).
   - The integer loop (smallest k with 16,383**k >= 64 is 1) gives passes = 2.
   - Binary merge: 1 + log₂ 64 = 7.
   - These match `io-cost-model/examples.py` (`passes(1 TiB, 16 GiB, 1 MiB) == (2, 64, 16_383)`).
9. **Float gotcha (Try it).**
   - math.log(1000, 10) == 2.9999999999999996 (CPython on IEEE-754 doubles, as run by `test:examples`), so int(math.log(1000, 10)) == 2.
   - math.log(10**9, 10) == 8.999999999999998, so int() gives 8.
   - math.log(125, 5) == 3.0000000000000004, so math.ceil gives 4 (the ceil trap, relevant to every level and pass count).
   - math.log10(1000) == 3.0.
   - (2**10).bit_length() == 11 but (2**10 - 1).bit_length() == 10 (the bit_length off-by-one).
   - The integer level loop is exact.
10. **Comparison counts (Try it).**
    - Seeded `random.Random(5)` permutations of 2¹⁴, 2¹⁵ and 2¹⁶ keys sorted with a counting `__lt__`.
    - Each count is < n·log₂n, and each doubling ratio is between 2.0 and 2.3.
    - A naive pairwise check makes n(n − 1)/2 comparisons: 134,209,536 at 2¹⁴, and the ratio per doubling is about 4.
    - **Ranges only**, because exact counts depend on the CPython sort implementation; the Deep dive shows the ranges and ratios, not exact counts.
11. **Step 10:** 100,000,000 is the `orders` row count (assert it equals the chapter constant used in steps 4 and 8).

## Bridge and handoff (registry and reel)

- **Bridge (from CHAPTER.md, word for word):** "Tests check that a change gives the right answer; they don't say how its cost grows with the data. That takes O, Θ and Ω, and logarithms in any base." Shown on step 1. It answers topic 4's planned handoff ("Last of the five refreshers: the notation for how costs grow, and the logarithms the rest of the chapter counts with").
- **Handoff (from CHAPTER.md, word for word):** "Big-O counts steps as if each cost the same. Next: the memory hierarchy, where the same step costs anything from a nanosecond to tens of milliseconds." Set up by step 10 and said on step 11. Topic 6's planned bridge ("Big-O treated every step alike…") picks it up.
- **Registry entry:**
  - `id: 'de.asymptotic-notation-logarithms'`, `slug: 'data-engineering/m1-foundations/ch01-cs-foundations/asymptotic-notation-logarithms'`.
  - `title` and `syllabusTitle`: 'Asymptotic notation and logarithms' (the `REFRESHERS` string).
  - `kind: 'refresher'`, `minutes: 5`, `chapter.section: '1.1'`, `verified: '2026-10-12'`.
  - `status: 'held'` until topics 2–4 are live.

## Concept ledger

- **introduces:** `big-o` (O, Θ, Ω as ceiling, floor and both; growth rates; constants dropped), `logarithms` (log_b x counts divisions by b; large bases give tiny logs: index height, sort passes), `change-of-base` (log_b x = ln x / ln b; mental conversions; base irrelevant inside O, relevant in counts).
- **uses:** `git-bisect` (step 5's callback: bisect's about-10 tests for 1,000 commits; introduced by topic 2, earlier in the chapter). See "Changes from the chapter plan".
- **declared:** `high-school-algebra`.
- **Explained on the spot, not used as concepts:**
  - "an 8 KB index page holds about 400 entries" (`db-pages` belongs to 14, and `fanout-height` / `b-tree-lookup` to 13; this topic only computes the logarithm, as CHAPTER.md assigns).
  - "sorted runs, then a merge" (`external-sort-passes` belongs to 14 and the mechanics to 16).
  - "where the data lives: cache, RAM, disk, network" (named only; `memory-hierarchy` belongs to 6).

## Claims list

Each claim with its source (in `SOURCES.md`, every quote checked by `node scripts/sources.mjs check`). Arithmetic claims are executed in `examples.py`. Checked 2026-10-12.

| # | Claim | Source |
|---|---|---|
| 1 | g ∈ O(f) iff there are c > 0 and n₀ with g(n) ≤ c·f(n) for all n ≥ n₀: an upper bound "for sufficiently large n" | MIT 6.006 S20 R01, "O Notation…" and "This definition upper bounds…" |
| 2 | g ∈ Ω(f) iff c·f(n) ≤ g(n) for all n ≥ n₀: a lower bound | MIT R01, "Ω Notation…" |
| 3 | Θ(f) = O(f) ∩ Ω(f), and Θ is the tight bound | MIT R01, "Θ Notation…" and "When one function both asymptotically upper bounds…" |
| 4 | Asymptotic notation ignores constants that don't change with input size, and comparing algorithms asymptotically ignores constant-factor hardware differences | MIT R01, "We can use asymptotic notation to ignore constants…" and "…in order to ignore constant factor differences in hardware performance" |
| 5 | "g is O(f)" or "= O(f)" means set membership, g ∈ O(f), and the equals sign is one-way | MIT R01, "By convention… what they really mean is set containment"; Knuth 1976, "…we are actually speaking about sets of functions…" and "The equal sign here really means" |
| 6 | O stands for functions upper-bounded by a constant times f(n) for all large n, read "order at most"; a separate notation for lower bounds is needed, and O has been misused for them when rejecting a sorting method | Knuth 1976 (SIGACT News 8(2)): "Most of us have gotten accustomed…", "Sometimes we also need a corresponding notation for lower-bounded functions,", "when they reject a particular sorting method", "because its running time is" (the OCR gives "O(n 2)" for O(n²) right after it), "can be read as "order at most f(n) ";". The words come only from passages whose OCR is intact; the Ω and Θ symbols and definitions are taken from MIT (claims 1–3) |
| 7 | f = Ω(g) iff g = O(f) | derived from claims 1 and 2 (c ↔ 1/c); Deep dive only |
| 8 | 3n·log₂n + 8n is between 3·n·log₂n and 4·n·log₂n exactly when n ≥ 256 (the lower one for all n ≥ 1), so Θ(n log n); ratio values 11.00 / 5.00 / 4.00 / 3.50 / 3.30 | claims 1–3, with arithmetic in `examples.py` #1 |
| 9 | The same cost is O(n²) with c = 11 from n = 1, a ceiling over a million times above it at n = 10⁸ | claim 1, `examples.py` #2 |
| 10 | A problem that must read its whole input needs linear time: reading every row is Ω(n) | MIT R01, "Linear time is often necessary to solve problems where the entire input must be read…" |
| 11 | Common growth classes are constant, logarithmic, linear, quadratic, polynomial and exponential | MIT R01, the growth table (quoted lead-in "We often use shorthand…" plus the table note) |
| 12 | If n = 1000, log n ≈ 10 | MIT R01, "If n = 1000, log n ≈ 10" |
| 13 | (log n)^a = O(n^b) for all positive a, b | MIT R01, exercise 5 quote |
| 14 | Binary search finds a value in a sorted in-memory array in logarithmic time | MIT R01, "…can be solved in logarithmic time via binary search" |
| 15 | Race values (steps and times at 10⁹ steps/s, a stated round assumption, not a measured speed) and doubling ratios ×2 / ×2.08 / ×4 | arithmetic, `examples.py` #3 |
| 16 | log_a z = ln z / ln a (a, z positive, a ≠ 1) | DLMF 4.2.8, "With a,b≠0 or 1," and "loga⁡z =ln⁡z/ln⁡a," |
| 17 | log_a z = log_b z / log_b a, and log_a b = 1 / log_b a | DLMF 4.2.9 and 4.2.10; MIT R01, "loga b = log b/ log a" |
| 18 | ln 10 = 2.302585…; log₁₀ e = 0.4342944819…; ln e = 1 | DLMF 4.2.18 quote; 4.2.17 quote (added by the fact-check); "ln⁡e=1." |
| 19 | log_b x = k means b^k = x: a logarithm counts how many factors of b (divisions by b) make x | DLMF 4.2.25 ("exp⁡z=ζ⟺z=Ln⁡ζ."), 4.2.26 (z^a = exp(a Ln z)), 4.2.27 (z^n = z·z⋯z, n times), and 4.2.8; derivation in the Deep dive |
| 20 | Product and power rules: log ab = log a + log b, log(a^b) = b log a | MIT R01, "Recall exponent and logarithm rules…" |
| 21 | log₂ 1,000 ≈ 9.97 (10 tests, 2¹⁰ = 1,024); log₂(10⁹) ≈ 29.9, so 30 halvings (2²⁹ < 10⁹ ≤ 2³⁰) | arithmetic, `examples.py` #4. The Git refresher's "about 10 tests" is from that topic's own `examples.sh` (1,000 commits, 10 runs) |
| 22 | log₁₀₀₀(10⁹) = 3; log₁₆,₃₈₄(10⁹) = 2.14; log₁₆,₃₈₄(10⁶) = 1.42 < 1.5 | arithmetic, `examples.py` #6; matches the held I/O topic's Prerequisites 01 ("under 1.5", "3") |
| 23 | log₂ x ≈ 3.32 · log₁₀ x | DLMF 4.2.9 with arithmetic (1 / log₁₀ 2 = 3.3219), `examples.py` #5 |
| 24 | Inside O the base of a logarithm is a constant factor when the base is a fixed number, so O(log n) needs no base; when the base is a parameter (B, M/B) the factor 1/log B is not constant and the base stays | claims 16–17 (log_b n = log₂ n / log₂ b); claim 25 for why parameter bases are kept |
| 25 | In counts of I/Os, levels or passes the logarithm's base matters and should be stated, not hidden in the O; the log terms are small constants in practice; constants hidden in O matter as much | Vitter 2008, "It still makes sense to explicitly identify terms such as logm n and logB N…", "In practice, the logarithmic terms… are small constants.", "(Of course, it is equally important to consider any other constants hidden in big-oh and big-theta notations!)" |
| 26 | The B-tree (Bayer and McCreight) has node degree Θ(B) except at the root, so its height is roughly log_B N; splits propagate to the root, which is how it grows in height | Vitter 2008 Ch. 11, the three B-tree quotes |
| 27 | PostgreSQL B-tree indexes are multi-level trees of pages; leaf pages are typically over 99% of pages; a root split adds a new level | PostgreSQL 18 docs §65.1, the three quotes |
| 28 | PostgreSQL stores tables and indexes as arrays of fixed-size pages, usually 8 kB; the page header is the first 24 bytes; each item identifier is 4 bytes | PostgreSQL 18 docs §66.6, "Every table and index is stored as an array of pages…", "The first 24 bytes…", "…4 bytes per item." |
| 29 | Each index tuple starts with IndexTupleData (the heap TID plus t_info); the TID is six bytes; key values follow at a MAXALIGN boundary | PostgreSQL REL_18_STABLE `itup.h` and `itemptr.h`, the quoted comments and fields |
| 30 | Assumption, stated as one on screen and in the Deep dive: an index entry for an 8-byte key is about 20 bytes (8-byte tuple header with alignment, 8-byte key, 4-byte line pointer), so (8,192 − 24) / 20 ≈ 408, or 407 after the 16-byte b-tree special space, "about 400 per full page". MAXALIGN = 8 on common 64-bit builds, and full pages, are assumptions | claims 28–29, 30a, arithmetic, `examples.py` #7 |
| 30a | B-tree pages end in a special space (BTPageOpaqueData: two block numbers, a level, flags and a cycle id, 16 bytes); leaf pages are filled to a default 90% and upper pages to a fixed 70% at build and on rightmost splits, so real fan-out is about 366 / 285 for this key, still 4 levels | PostgreSQL REL_18_STABLE `nbtree.h` (added by the fact-check), the struct fields and the fillfactor comment and defines; §66.6 "b-tree indexes store links to the page's left and right siblings"; arithmetic, `examples.py` #7 |
| 31 | 100 M keys at fan-out 400 need 4 levels (400³ = 64 M < 10⁸ ≤ 400⁴); 4 levels for any fan-out from 100 to 464; 3 from 465; a binary tree needs 27 | claim 26 (height ≈ log_fanout N), `examples.py` #7; consistent with the held I/O topic (100 keys per page gives 4) and topic 13's planned "3–4 levels" |
| 32 | Merge sort first forms N/M sorted runs, then merges groups of up to R = Θ(m) runs per pass, for O(log_m n) passes (n = N/B, m = M/B) | Vitter 2008 Ch. 5.2 and Ch. 2.1, the run-formation, merge-pass and parameter quotes |
| 33 | Vitter's example: N = 10¹⁰, M = 10⁷, B = 10⁴ gives log_m n = 2 | Vitter 2008, "For example, in units of items…" (Deep dive only) |
| 34 | The chapter's sort: 1 TiB, 16 GiB, 1 MiB gives N/B = 1,048,576, M/B = 16,384, log = 20/14 ≈ 1.43, 64 runs, fan-in up to 16,383, passes 1 + ⌈log₁₆,₃₈₃ 64⌉ = 2 (one run-formation pass plus one merge pass, worded as the held reel does: "Pass one writes 64 runs. The merge can take up to 16,383 runs at once, so a single pass finishes"); two-way merging takes 7 | claim 32; the numbers are fixed by CHAPTER.md and the held `io-cost-model` (its reel "A terabyte in two passes", its Deep dive "1 + ⌈log_{M/B−1}(N/M)⌉ passes", "≈ 1.43", and its `examples.py`); arithmetic in `examples.py` #8 |
| 35 | A nonlinear I/O bound like Θ(n log_m n) means more than one pass over the data | Vitter 2008, "The nonlinear I/O bound Θ(n logm n) usually indicates…" |
| 36 | The word-RAM assumes a word size w > log₂ n bits, so log₂ of anything addressable is below the word size (64 on a 64-bit machine) | MIT R01, "…we will always assume our Word-RAM has a word size of at least w > log2 n bits…" |
| 37 | Python's two-argument `math.log(x, base)` computes log(x)/log(base); `math.log2` and `math.log10` are usually more accurate; `int.bit_length()` gives the exact bit count | Python 3.15 docs, `math`, the four quotes; behaviour executed in `examples.py` #9 |
| 38 | `math.log(1000, 10)` returns 2.9999999999999996 in CPython, so flooring it gives 2 | executed in `examples.py` #9 (real behaviour, run, not reasoned) |
| 39 | Python's sort makes fewer than n·log₂n comparisons on these seeded inputs, growing about 2.1× per doubling; a pairwise check makes n(n − 1)/2 | executed in `examples.py` #10 (ranges only); n(n − 1)/2 is arithmetic |
| 40 | Big-O can't give wall-clock time: it drops constants and hardware differences by design, and counts every step alike while real steps cost different amounts depending on where the data lives | claims 4 and 25; the cost per tier is topic 6's (no tier figure shown here) |

**Not claimed, and why:**
- Comparison sorting's Ω(n log n) lower bound: no primary source opened here, and DSA "Lower bounds and adversary arguments" covers it.
- "Real indexes are 4–5 levels" (Use The Index, Luke): not opened here; the reel computes its own estimate instead.
- Galactic algorithms: only a secondary source exists.
- Any tier latency: topic 6 owns those.

## Coverage plan (for `coverage.json`, ROUTINE.md 2.4)

**Syllabus clauses:**

| Clause | Covered by |
|---|---|
| "O/Θ/Ω and how costs grow with input size" | steps 2, 3, 4; Deep dive "O, Ω and Θ, precisely" and "Growth at data sizes" |
| "logarithms in any base and the change of base (log_b x = ln x / ln b)" | steps 5, 6; Deep dive "Logarithms and the change of base" |
| "why a large base makes the logarithm tiny (B-tree height, external-sort passes)" | steps 7, 8, 9; Deep dive "Large bases: index height and sort passes" |
| "full treatment → *Data Structures & Algorithms* Ch.1" | Prerequisites (the DSA reel) and the step 11 caption; the DSA §1.1 line "Asymptotic notation and case analysis — O/Θ/Ω/o/ω; best, average, worst, expected…" |

**Sources (at least two, item by item):** MIT 6.006 R01 contents, DLMF §4.2 contents, Vitter 2008 contents (the parts used), PostgreSQL §65.1. Out with reasons:
- MIT's birthday matching, static array and induction: not this topic.
- DLMF's complex branch cuts: logs here are of positive reals only.
- PostgreSQL's deduplication and bottom-up deletion: §5.1.
- Vitter's parallel disks: topic 14.

**Blind expert list (`EXPERT-LIST.md`), every item placed:**

| # | Item | Placement |
|---|---|---|
| 1 | O is only an upper bound, not "worst case" | here: steps 2–3 and Deep dive "O, Ω and Θ, precisely" (one sentence on cases); the full case analysis is DSA "Asymptotic notation and case analysis" |
| 2 | Θ is tight; say Θ when you mean "grows like" | here: steps 2, 3 |
| 3 | Ω is a lower bound; f = Ω(g) iff g = O(f); problem lower bounds need an argument over all algorithms | here: step 2 and Deep dive (the symmetry); problem lower bounds are later, DSA "Lower bounds and adversary arguments" ("…what a lower bound does (and does not) rule out") |
| 4 | "=" in f = O(g) is one-way membership | here: Deep dive "O, Ω and Θ, precisely" (MIT and Knuth quotes) |
| 5 | Constants and lower terms dropped, so growth not wall-clock; memory effects decide time | here: steps 2 and 10 and Deep dive "Why big-O doesn't predict wall-clock time"; later topic 6 (memory hierarchy). Galactic algorithms are out (secondary source only; DSA territory) |
| 6 | Bounded n: log₂ n < 64 for addressable data | here: Deep dive "Logarithms and the change of base" (MIT word-RAM quote) |
| 7 | Empirical order of growth by doubling | here, lightly: Try it #3 (doubling ratios of counted comparisons). The log-log slope formula is out: benchmarking method; a later performance topic |
| 8 | Change of base; base irrelevant inside O | here: step 6 |
| 9 | Base irrelevant in O, relevant in counts (fan-out) | here: steps 6–9; Deep dive (Vitter quote) |
| 10 | B-tree height ≈ log_fanout N; real indexes are shallow; height is a range | here: step 8 and Deep dive "Large bases…" (estimate, sensitivity, partial fill as one sentence); later topic 13 ("fan-out and height") for fill, splits and best/worst height |
| 11 | Sort passes are a ceiling of a logarithm; each pass reads and writes all the data | here: step 9 and Deep dive (ceiling, passes); the cost per pass (2N/B) is later, topic 14 ("sort bound (N/B)·log_{M/B}(N/B)") |
| 12 | Fan-in is bounded by memory; buffers shrink and seeks dominate | later: topic 16 ("…vary run size and fan-in…"), and topic 14 |
| 13 | Comparison sort Ω(n log n) | later: DSA "Lower bounds and adversary arguments" ("decision-tree Ω(n log n) for comparison sorting") |
| 14 | Best/worst/average/amortized are separate from O/Θ/Ω | here: one sentence in the Deep dive; later DSA "Asymptotic notation and case analysis" ("best, average, worst, expected…") and DSA §1.2 amortized analysis |
| 15 | The cost model decides what you count (RAM steps vs I/O blocks) | here: one line in step 10's caption and the Deep dive; later topic 14 ("the Aggarwal–Vitter model", "cost counted in block transfers") and DSA "The word-RAM model and its assumptions" |
| 16 | Multi-parameter bounds | out: not needed in a 5-minute refresher (N, B and M appear only inside the sort example); DSA Ch.1 |

## Progress

- 2026-10-12, content plan (2.2) done:
  - `OUTLINE.md` written.
  - `SOURCES.md` extended with sources the plan needed, every quote passing `node scripts/sources.mjs check` (79 quotes, 0 problems):
    - Vitter 2008 (B-tree height, merge passes, bases and constants).
    - Python `math` docs (change of base in code).
    - PostgreSQL `itup.h` and `itemptr.h` (the fan-out assumption).
    - Extra quotes from DLMF (4.2.18, 4.2.25, 4.2.27), MIT R01 (linear time) and PostgreSQL §66.6 (4-byte line pointers).
- 2026-10-12, fact-check (2.3) done, see `FACT-CHECK.md`. Corrections applied here: step 3's ratio (1,139,909, not 1,139,912), step 3's fourth option (now the "worst case" misconception) and answer-frame axis, step 4's axis start, step 7's base-2 tower height, step 8's "full page" wording, special space and default fill, step 9's pass wording (1 + one merge pass, as the held topic words it, not "1.43 rounded up"), the Θ-glyph house rule, the halving-loop, float-log and bit_length traps in `examples.py` and Try it, and claims 6, 18, 24, 30, 30a (new) and 34. `SOURCES.md`: 94 quotes, 0 problems (added `nbtree.h`, DLMF 4.2.17, a Knuth fragment, two OCR notes).
- 2026-10-12, coverage map `coverage.json` and build (3) done: `examples.py`, `reel.tsx`, `scenes.tsx`, `index.mdx`, `prerequisites.mdx`, `narration.json`, registry entry (held). `npm run build`, `npm run test:examples` and the reel test pass.
- **Next:** content review (4), looks review (5), then narration (7).
- 2026-10-12, content review (4) done, see `REVIEW.md` (27 findings). Review fixes applied in the same pass (see "Changes after review" below). Finding 6 (information only): the previous topic, `de.software-delivery-workflow`, is not built yet (its branch holds only OUTLINE, SOURCES, FACT-CHECK and examples.sh), so the seam was checked against its plan only. The release seam check must re-read the built topic: its real handoff, and whether its step 3 still says "unit tests".

## Changes from the chapter plan

1. **The 16,384 tower is 2.14 steps, not "two short steps".** log₁₆,₃₈₄(10⁹) = 2.14: two divisions take a billion to 3.73, and a third finishes. The reel draws two full steps and a sliver and labels it 2.14, so the picture matches the number.
2. **Two different "about 1.4" numbers, kept apart.**
   - log₁₆,₃₈₄ of a million (10⁶) is **1.42**. This is the held topic's "under 1.5".
   - The sort's log₁₆,₃₈₄(1,048,576 = 2²⁰ blocks) is 20/14 ≈ **1.43**.
   - Both appear (steps 7 and 9), each with its own argument, so neither is rounded into the other.
3. **The index whose height is computed is an index on `order_id`** (100 M distinct keys). The chapter's running example names "an index on `status`", which has only a few distinct values and is a poor height example. The fan-out of about 400 is a stated assumption (8-byte key) backed by PostgreSQL's page layout and tuple headers, and the result (4 levels) holds for any fan-out from 100 to 464. That covers topic 13's "3–4 levels" and agrees with the held topic's 100-keys-per-page check.
4. **Sources.**
   - Bayer and McCreight 1972 has no openable copy, so B-tree height is sourced from Vitter 2008 (opened), which credits the B-tree to Bayer and McCreight.
   - CLRS (a book) was not opened and is not cited for any claim.
   - Knuth 1976 is cited only for passages whose words survived the OCR; the Ω and Θ definitions come from MIT 6.006.
   - Added: the Python `math` docs and two PostgreSQL headers.
5. **`uses: ['git-bisect']` instead of none.** Step 5 calls back the Git refresher's bisect (about 10 tests for 1,000 commits) to make "a logarithm counts halvings" land on something the learner just did. Topic 2 introduces `git-bisect` earlier in this chapter. If the release seam check prefers no dependency, the callback can be reworded to "bisect's halving" without the number and the `uses` dropped.

## Changes during build

1. **Step 2's title is "O ceiling, Ω floor, Θ both"** (the plan had "O is a ceiling, Ω a floor, Θ both"), and **step 3's options and body are reworded.** The reel test swipes at the height of step 2's title right after returning to step 2 from step 3, while step 3's caption is still on screen for about 300 ms. A button of step 3's two-line options sat exactly under that point (a swipe that starts on a button is ignored by the player), so the swipe failed. Fixes, all content-neutral:
   - Step 2's title fits one line on a phone.
   - Step 3's options are one-liners: "No: only n log n", "Yes: a ceiling" (correct), "Only below n₀", "No: worst case". The explanation carries the nuance, as before.
   - Step 3's body adds one sentence defining Θ as a growth rate, bounded above and below, so the options start lower. Its narration gains the matching line.
2. **Text in the predict steps' drawings is 15 units, not 13** where the test measured 8 px on a phone (step 5's labels and footnote, step 8's footnote); step 9's two-line label has 20 units between lines. The plan's sizes were minimums, not targets.
3. **Step 4: the counter and the assumption note stack** (counter above, note below) in landscape too, because the note is 55 characters and cannot share a row with the counter.
4. **Step 8's answer frame:** the bands are centred at x = 290 and the caramel path runs down the right at x = 520, so the path never crosses a label; "short" sits to the left of the cherry band.
5. **Step 2's labels:** "ceiling c = 4" and "floor c = 3" sit just right of the n₀ line (above and below their lines) and the Θ label sits above the ceiling at the right, so none of them lies on the curve; the "256" tick is replaced by the n₀ label.
6. **Step 3's answer frame:** the job's bar is 13% of the n² bar (log₁₀ scale, 1 billion to 10 quadrillion), asserted in `examples.py`; the plan said "about 1/7".
7. **Prerequisites:** the Khan Academy video's length is left out (oEmbed gives title and author, not duration); the HackerRank video is kept with author only. The registry's `uses: ['git-bisect']` is kept as planned.
8. **Registry order:** the entry sits between `de.python-essentials` and `de.io-cost-model` (syllabus order: §1.1 before §1.3). The other §1.1 topics, built in parallel, will add theirs between the same two.

## Changes after review

1. Step 1 no longer repeats the bridge; step 11 no longer repeats the handoff. Step 2 glosses log₂n and says "for some constant c > 0". Step 3 sets up the trap instead of redefining Θ. Step 8 says each inner entry points to a page below and names PostgreSQL.
2. **Step 4's race has a labelled log axis** (ticks 1 µs, 1 ms, 1 s, 1,000 s; "log scale: each tick ×1,000"), now 100 ns to 100,000,000 s so no bar is cut off; tick positions are asserted in `examples.py`. The caption says n log₂n.
3. **Step 9 draws two equal caramel pass blocks beside seven equal cinnamon blocks at one unit**, with the logarithm on its own line (20/14 = 1 + log 64 ≈ 1 + 0.43, passes = 1 + ⌈0.43⌉ = 2). It supersedes the "1.43-step caramel staircase" in the step 9 plan and final frame above. The caption gives the fan-in reason, says a pass cannot be partial, and states 4 TiB of I/O (asserted).
4. Powers of ten are written out on screen and in the Deep dive ("a billion", "100 million"); numbers shown (6-byte pointer, 8-byte key, 20-byte entry, 1,000,000,000 steps per second) are asserted in `examples.py`.
5. Deep dive additions: log(n!), a counted constant-factor crossover (997), 964 upper pages (about 7.5 MiB), PostgreSQL's level numbering, a reworded "Bounded n"; the unsourced latency figures are gone. Knuth's "order at least" and "order exactly" are now quoted in `SOURCES.md`.
6. `coverage.json`: the MIT exercise item is split (log(n!) mapped, binomial and 2^(n+1) out); multi-parameter bounds are mapped to the Deep dive and the I/O cost model topic; `gapReview` is now "builder + review fixes".

## Changes after the looks review (2026-10-12)

The drawings were changed as the looks review asked (`REVIEW.md` marks each finding). Where this OUTLINE's per-step plan above differs, this section wins:

1. **Step 2** stages the ceiling line ("O: ceiling c = 4"), the floor line ("Ω: floor c = 3"), the ratio curve (named "cost ÷ n·log₂n" in its live readout) and then the Θ label; the y axis has ticks 3 and 4 and the x axis says "n (log scale)".
2. **Step 3** has its correct option first and all options as "Yes/No: reason" one-liners; the n² bar is filled cinnamon with "1,139,909× too high".
3. **Step 4** adds a fourth beat, "double it: 200,000,000 orders", with ghost tails labelled ×2, ×2.08 and ×4 (n² in cherry), and named ticks "1 day" and "1 year" (asserted in `examples.py`). The axis is "1 µs to 1 year".
4. **Step 5** has the correct option third, "1 slab = 1 halving", and marks "after 10: 976,563", "after 20: 954", "after 30: under 1" with "÷ 1,024" between them.
5. **Step 6** labels its rulers "base 2", "base 10" and "base 1,000" with the 29.9, 9 and 3 counts, and shows "29.9 ÷ 9 = 3.32". The sentence "Inside big O a fixed base doesn't matter..." is cut from the narration and caption.
6. **Step 7** is "A large base, few divisions": three rows of cells (30, 3, 2.14), no towers. The log₁₆,₃₈₄ of a million (1.42) is no longer in the narration, caption or drawing; it stays asserted and in the Deep dive.
7. **Step 8** has a one-sentence question caption (the byte arithmetic moved into the explanation), the correct option last, and an answer drawn on a log axis against a dashed "target: 100,000,000" line.
8. **Step 9** shows pass 1 as 64 cells, pass 2 as one bar, "2 passes", "4 TiB of I/O" and seven thin cinnamon bars for the two-at-a-time alternative. The 20/14 line and "a pass can't be partial" are out of the reel (Deep dive only).
9. **Step 10** labels the cache and disk scans, and shows "0.1 s" and "2.8 hours" (1 ns and 100 µs a step, illustrative, asserted in `examples.py`).
10. **Step 11** has an icon per bullet. Θ, O, Ω are serif and log_b has a real subscript in every drawing.
11. **Pacing.** The player runs animation time on `duration` and holds the last frame (like the live python-essentials reel, whose narration is also 27 to 50 words against 1.2 to 4.6 s), so reveals are staged to the spoken beats and the multi-beat steps got longer durations (5 to 6.6 s). The coverage.json step title for step 7 is updated.
