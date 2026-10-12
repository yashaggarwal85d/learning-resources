# OUTLINE: Aggregate and accounting methods (`dsa.aggregate-accounting-methods`)

Content plan and storyboard, written 2026-10-12 (ROUTINE.md section 2, step 2) against this topic's entry (#5) in [`CHAPTER.md`](../CHAPTER.md). Writing follows this file; a change of plan is made here first, with its reason.

- **Syllabus line (DSA §1.2, full topic):** "Aggregate and accounting methods — dynamic-array doubling, binary counter and multipop stack: charging cheap operations to pay for expensive ones."
- **Previous topic (§1.1, built in parallel):** Lower bounds and adversary arguments (`dsa.lower-bounds-adversary-arguments`). Its planned handoff (CHAPTER.md, not its files): "Every bound so far priced one run on its worst input. A data structure lives through a sequence of operations, where one expensive step can be paid for by many cheap ones, with no probability involved. Next: amortized analysis." Nothing here depends on topic 4 beyond that sentence.
- **Concepts from earlier topics:** topic 1 (`dsa.asymptotic-notation`, on `main`) said in its Deep dive "**Amortized is neither.** An amortized bound is a worst-case bound on a *sequence* divided by its length: no probability, but individual operations can still be slow. It gets its own topic (§1.2)", and its outcomes call it "a third kind of promise". This topic keeps that wording and never calls amortized cost an average. Topic 2 (word-RAM) gives the machine: an element write is one word operation.
- **Next topic (§1.2):** "The potential method — choosing Φ, proving table expand/contract bounds, and why shrinking at ½ occupancy thrashes while shrinking at ¼ does not; the tool behind splay trees, union–find and Fibonacci heaps." Its bridge: "Accounting stored credits on single elements. The potential method keeps them as one number for the whole structure, which is what a table that grows and shrinks needs." It redoes this topic's three examples with Φ, so this topic must not introduce Φ, shrinking or the ½-vs-¼ thrash.
- **Kind:** full, about 12 minutes, 19 steps: open on the vector's problem (1), a predict in step 2, the mechanism (3–15) with two more predicts (9, 11), "Back to the problem" (16), "Prove it · 1 of 3 … 3 of 3" (17–19).
- **Running example:** the chapter's vector of 64-bit keys, its growth rule and cost unit exactly as CHAPTER.md fixes them (empty vector capacity 0; first append allocates 1; an append to a full vector allocates g·cap rounded up and at least cap + 1, copies the n keys, then writes the new one; g = 2 default, g = 1.5 compared; **one unit = one element write**, allocation not counted). The small trace (16 appends, costs 1, 2, 3, 1, 5, 1, 1, 1, 9, then seven 1s, total 31) and the large vector (n = 1,000,000, 1,048,575 copies over 20 resizes, the last copying 524,288) are the topic's two scales. The binary counter and the stack are the other two structures the syllabus names; each names its own unit on screen (a bit flip; a key pushed or popped), which is the same unit, one write.

## Learning outcomes

As CHAPTER.md lists them, made concrete:

1. **Bound a sequence's total cost with the aggregate method:** show that any n appends to the doubling vector from empty write fewer than 3n elements, that n increments of a binary counter flip fewer than 2n bits (bit i flips ⌊n/2ⁱ⌋ times), and that any n stack operations cost at most twice the pushes.
2. **Design accounting charges and prove the credit never goes negative:** 3 per append (1 write, 1 coin on the new key, 1 coin on a key in the old half), 2 per increment (1 to set a bit, 1 coin on it for its reset), 2 per push and 0 per pop and multipop; state the condition as Σĉᵢ ≥ Σcᵢ after **every** prefix, and find where a charge that is too low first fails.
3. **Compute the amortized copy cost of a growth factor g:** at most about g/(g − 1) copies per append (2 for g = 2, 3 for g = 1.5), reached just after a resize; about 1/(g − 1) just before one; accounting charge 1 + g/(g − 1); explain why a fixed additive step is quadratic.
4. **Say what an amortized bound promises:** a worst-case bound on the total of every sequence of n operations from the start state, divided by n; no probability (unlike topic 1's average and expected bounds); one operation can still be expensive; the bound needs a single history from the start state.

## The problem (opened in step 1, closed in step 16)

"Of a million appends to a vector, one copies 524,288 keys, and yet everyone says append is O(1). Both are true. How?" Closed in step 16: the million appends write 2,048,575 elements in total, under 3n = 3,000,000; when the expensive append (number 524,289) arrives, the bank of saved charges holds 524,289 coins for its 524,288 copies. The spike is still one operation (topic 7's problem), and a vector that also shrinks has nowhere to keep the coins (topic 6's).

## Conventions for every step (builder: read first)

- **Canvas:** 600 units wide, heights as given. Phone first: the drawing gets about 360 × 300 CSS px, scale about 0.6, phone text scale about 1.22, so a 13-unit mono character is about 8 units wide: a 40-character label needs about 320 units. Nothing important in the right 64 units on desktop (x > 536): every drawing below keeps its content in x 30–536.
- **Text:** 13 units minimum, 15–17 for values, 20–26 for the one number that matters (serif, one per step).
- **Chapter grammar (CHAPTER.md, "One visual language"):** `crema` keys, cells, counts; `latte` secondary labels; `taupe` axes, empty slots, quiet notes; `caramel` the counted thing and the bound that holds: the dashed amortized line, the coins, the answer; `cinnamon` (large text and shapes only) g = 1.5, the compared alternative; `cherry` fills (labels in `C.cherryText`) the expensive spike, the bank gone negative. At most two accents per step (caramel plus one of cherry or cinnamon).
- **The vector** is a row of square cells, filled cells `crema` with the key's index, empty slots `taupe` outlines, row length = capacity. A resize draws the new, longer row underneath and moves cells down along short `caramel` arrows.
- **The cost strip** sits under the vector: one thin bar per operation, left to right, height = actual cost cᵢ, spikes (cost > 1) in `cherry`, the amortized bound as a dashed `caramel` horizontal line.
- **Coins** are small `caramel` discs (r ≈ 8) sitting on cells (vector), on bits (counter) or on keys (stack).
- **Animation:** pure functions of `t` with `seg`, `easeOut`, `easeOutBack`, `lerp`; beats 0.4–1.0 s; the final frame teaches the whole step. Predict reveals run from a local clock started when `answer` becomes non-null (topic 1's `useSinceAnswer` pattern; the player clamps `t` at `duration`, REVIEW of topic 1, finding 13), and every animated bar or count must **finish inside `duration`** (topic 1, finding 1: a bar stopped at 494,590 because its segment ran past the duration).
- **Kit only:** build from `site/src/reels/kit.tsx` (`Stack`, `Svg`, `T`, `Bar`, `C`, `SERIF`); never copy it (topic 1, finding 14). Red text is `C.cherryText`, never `C.cherry` (topic 1, finding 4).
- **Labels:** stack two labels rather than share a line unless both fit with 24+ units between them (topic 1, finding 3); label the ends of curves, not points on them (finding 5); multi-line footnotes rather than one 60-character line (finding 2).
- **Step titles** are plain strings without apostrophes (the coverage check reads `title: '…'` from `reel.tsx`).
- **Captions vs narration:** captions (`body`, `explain`) are short, written for reading, and may use digits, symbols and the chapter's letters (cᵢ, ĉᵢ, Σ, ≥, g/(g − 1)): about 25–50 words, never more than three phone lines plus one "more". Narration (`narration.json`) is written to be heard: **no digits, no symbols, no code-style names** (the build's check rejects `0-9 _ = < > { } [ ] ( ) / \ * # @ | ~ ^ $ % & \` +`). Numbers are spelled as said and rounded where the caption carries the exact value ("about two million", "five hundred twenty-four thousand, two hundred eighty-eight copies" only where the exact number is the point). Letters are said: "c i" → "the actual cost of operation i"; "ĉ i" → "its charge"; "g over g minus one"; "three n"; "two to the i". Operation names are said as words: "multipop of k" (lexicon: "multipop" said "multi-pop"). Every predict step has an `answer` clip; Prove-it answers are spoken too.

## Reel steps and storyboard

Durations are suggestions; the builder sets each so the final frame completes inside it.

### 1. One append copied half a million keys (`Opening`, h 360, about 3.6 s)

- **Visual idea:** the whole million-append history as one cost strip on a linear scale: 999,980 cheap appends are a flat hairline and a handful of spikes tower over them, the last one 524,289 writes tall. The picture is the paradox: almost all the cost you can see is in a few operations, and the claim above says O(1).
- **Portrait:** top, y 46: the claim `“append is O(1)”`, serif 24, `caramel`, centred. y 76: `a vector of 64-bit keys · 1,000,000 appends from empty`, taupe 13, centred (two lines on portrait if it doesn't fit: "a vector of 64-bit keys" / "1,000,000 appends from empty"). The strip: baseline y 318, x 40 → 520 maps append 1 → 1,000,000 linearly; height ∝ cost with 524,289 → 190 units. Each of the 20 resizing appends is a 3-unit-wide `cherry` rect at its position (appends 2, 3, 5, 9, …, 262,145, 524,289; only the last four or five are tall enough to see, which is honest); the other appends are a 2-unit `crema` band on the baseline. Under the baseline, taupe 13: `999,980 appends cost 1 write`. Spike label, `C.cherryText` 15, two lines, end-anchored just left of the tallest spike's top (x ≈ 288, y ≈ 128/146): `append 524,289` / `copies 524,288 keys`. Under the claim at the end: `both true?` crema 17.
- **Landscape:** same composition (the canvas is 600 wide in both); h 320 so it fills the wider frame; the claim left-aligned at x 40.
- **Beats:** 0.2 s claim fades in; 0.5 s the sub-line; 0.8–2.6 s a sweep draws the strip left to right, each spike popping (`easeOutBack`) as the sweep passes; 2.8 s the spike label; 3.2 s `both true?`.
- **Final frame:** claim, strip with the towering spike and its label, the baseline note, `both true?`.
- **Real values:** 1,000,000; 524,289; 524,288; 999,980; 20 resizing appends (positions computed by the rule).
- **Caption's point (body, about 45 words):** "Topic 4 priced one run on its worst input. A data structure lives through a sequence. Of a million appends to the vector, one copies 524,288 keys, yet everyone says append is O(1). Both are true. From here on, one unit of cost is one element write." The registry `bridge` shows on this step.

### 2. What do a million appends cost? (`MillionTotal`, h 340, predict)

- **Visual idea:** a total, not a strip: one horizontal bar that will hold the whole sequence's cost, against the 3n mark. The question frame shows only the empty track, so nothing gives the answer away.
- **Portrait, question frame:** top (y 30–120), the step-1 strip shrunk to 90 units tall, faded to 0.5. y 170: taupe 13 label `total element writes, 1,000,000 appends`. y 190–222: an empty track (`C.cocoa` rect, x 40 → 520, h 32) with a large `?` crema 26 at its centre. No ticks, no 3n mark yet.
- **Answer reveal (local clock, about 1.4 s, all inside the reveal):** a `crema` segment fills from x 40 to the 1,000,000 mark, then a `cherry` segment for 1,048,575 copies; scale: 3,000,000 → x 520, so writes end at x 200 and copies at x 368. Labels under the bar, two stacked lines each, never sharing a line: under the crema part `1,000,000` / `new keys` (crema 15 / taupe 13), under the cherry part `1,048,575` / `copies` (`C.cherryText` 15 / taupe 13). Above the bar, end-anchored at x 368: `2,048,575` serif 24 caramel. A dashed `caramel` vertical tick at x 520 labelled `3n = 3,000,000` (caramel 13, two lines `3n =` / `3,000,000` if it doesn't fit at x ≤ 536).
- **Landscape:** same; track y 200.
- **Final frame (after answer):** the filled bar, both labels, the total and the 3n mark.
- **Question (body):** "Count one write per key appended and one per key a resize copies. What do all 1,000,000 appends cost together?"
- **Options:** "About 1 million" / **"About 2 million"** (correct) / "About 20 million" / "About 524 billion".
- **Wrong options, and why someone picks them:** 1 million: forgets the copies. 20 million: charges each append log₂ n ≈ 20, as if every append paid a tree-like cost. 524 billion: every append at the worst append's price (1,000,000 × 524,289 = 524,289,000,000), the per-operation worst case that topic 4's view would give.
- **Explain:** "About 2 million: 2,048,575. That is 1,000,000 new keys plus 1,048,575 copies (1 + 2 + 4 + … + 524,288). Under 3n. Pricing every append at the worst one's 524,289 writes would say 524 billion: true as an upper bound, and useless."

### 3. Sixteen appends, counted in writes (`SmallTrace`, h 380, about 5 s)

- **Visual idea:** the vector and its cost strip drawn together, so each spike is visibly the moment the row is full and gets copied into a longer one.
- **Portrait:** top, y 26: counters, two stacked lines at x 40: `cost so far: 31` (crema 17, the number counting up) and `3 per append: 48` (caramel 15, counting up as 3·i). The vector: row at y 56, 16 cells of 28 units with 4-unit gaps (x 44 → 556 would hit the rail, so cells 26 + 4: x 40 → 520). Capacity shown by taupe outlines; filled cells crema with the key's number 1–16 (13 units). On each resize the new, longer row appears at y 100, the filled cells drop into it along short caramel arrows (0.25 s), then the new row slides up to y 56 replacing the old (0.15 s). The cost strip: baseline y 350, bars 26 wide under each cell column (same x as the cells), height 18 units per write (9 → 162); bars of cost 1 crema, spikes 2, 3, 5, 9 `cherry` with their value above in `C.cherryText` 15. Dashed `caramel` line at height 3 (y 296) across the strip, labelled `3` caramel 13 in the left gutter (x 26, end of the line).
- **Landscape:** same layout; there is room for the counters at the right of the row instead (x 380–520, y 26/46).
- **Beats:** one append every 0.28 s from 0.3 s (16 appends, done by 4.8 s); a resize append takes its 0.4 s for the copy animation within that beat budget (the builder can give the resize appends 0.45 s and the cheap ones 0.22 s; total must finish inside `duration`).
- **Final frame:** full 16-cell row; strip 1, 2, 3, 1, 5, 1, 1, 1, 9, 1, 1, 1, 1, 1, 1, 1; `cost so far: 31`; `3 per append: 48`; the dashed line at 3 under which every cheap bar sits and over which four spikes rise.
- **Real values:** costs as listed; capacities 1, 2, 4, 8, 16; total 31; 3·16 = 48.
- **Caption:** "The rule: an empty vector has capacity 0; the first append allocates 1; an append to a full vector allocates twice the capacity, copies every key, then writes the new one. Sixteen appends: 1, 2, 3, 1, 5, 1, 1, 1, 9, then seven 1s. Total 31."

### 4. Add up the whole sequence (`Aggregate`, h 380, about 4.4 s)

- **Visual idea:** the aggregate method as a physical regrouping: the spikes split into their one write and their copies, and the copies stack into one column that is visibly shorter than the column of writes. The geometric series becomes a picture: each block is at most half the one above it.
- **Portrait:** starts from step 3's strip (y 200–350, same scale). Beat 1 (0.3–1.2 s): each spike splits; its top 1 unit stays crema (the write), its copies part (1, 2, 4, 8 units of 18) lifts off in `cherry`. Beat 2 (1.2–2.4 s): the 16 crema writes slide right and stack into a column at x 380 (16 × 12 units = 192 tall, crema); the cherry copy blocks slide into a column at x 460 in order 8 (bottom), 4, 2, 1 (15 × 12 = 180 tall). Labels under each column, stacked: `writes` / `16` (taupe 13 / crema 17) and `copies` / `1+2+4+8 = 15` (taupe 13 / `C.cherryText` 15). Beat 3 (2.6 s): a caramel bracket at the right of the copies column, `15 < 16` caramel 15. Beat 4 (3.2 s), top, x 40: `31 < 3 · 16 = 48` crema 17, and beneath it `any n: copies < 2n, total < 3n` caramel 15 (two lines on portrait: `any n: copies < 2n` / `total < 3n`). Beat 5 (3.8 s): serif 22 caramel `O(1) amortized`.
- **Landscape:** the two columns at x 360/440 and the text block at x 40–300, y 120–260.
- **Final frame:** the two columns, the bracket, the two inequalities, `O(1) amortized`.
- **Real values:** 16; 15; 31; 48.
- **Caption:** "The aggregate method: bound the total cost of any n operations, then divide by n. Writes: n. Copies: 1 + 2 + 4 + …, each resize copying at most half as many as the next, so fewer than 2n in all. Total under 3n: O(1) amortized per append." Second sentence in the explain-style footnote under the caption if space: "Amortized cost = worst-case total of n operations ÷ n."

### 5. A third kind of promise (`Promise`, h 380, about 3.4 s)

- **Visual idea:** three promises, each drawn as what it averages over: topic 1's average case (over inputs), expected (over the algorithm's coins), and amortized (over the operations of one sequence, with nothing random). The first two pictures contain a cherry exception that the promise allows; the third has a cherry spike that it also allows, but a caramel total that no sequence can cross.
- **Portrait:** three cards stacked (y 20–130, 140–250, 260–370), each 500 × 100 at x 40, `C.roast` fill with a taupe 1-unit border, the third card's border caramel 2 units. In each card, line 1 (crema 15): the name; line 2 (taupe 13): what it averages over; right half: a small picture.
  - Card 1: `average case` / `over random inputs`; picture: 7 small bars (different inputs' costs), one tall in cherry. Line 3 (latte 13): `an unusual input can cost more`.
  - Card 2: `expected` / `over the algorithm's own coins`; picture: 7 small dots (runs), one far right in cherry. Line 3: `an unlucky run can cost more`.
  - Card 3: `amortized` / `over one sequence, nothing random`; picture: the 16-append strip in miniature (spikes cherry) under a dashed caramel line. Line 3 (caramel 13): `no n appends from empty cost 3n or more` (two lines on portrait: `no n appends from empty` / `cost 3n or more`).
- **Landscape:** three cards side by side (each 160 wide), name, over-what and picture stacked inside each; the third line under the picture.
- **Beats:** cards arrive at 0.2 / 0.9 / 1.6 s; the third card's caramel border draws at 2.4 s.
- **Final frame:** all three cards, the third highlighted.
- **Caption:** "Topic 1 separated average case (over inputs) from expected (over coins). Amortized is neither: nothing is random. It is a worst-case bound on the total of a whole sequence, divided by its length. Every n appends from empty cost less than 3n, and one append can still cost n + 1."

### 6. Coins on cells: the accounting method (`Coins`, h 380, about 5.2 s)

- **Visual idea:** the charge made visible as coins left on the keys themselves. Between two resizes, each append leaves one coin on itself and one on its partner in the old half, so the moment the row is full every key holds exactly one coin: the copy that comes next is paid cell by cell.
- **Portrait:** top, y 30, crema 15: `charge 3 per append` and under it, taupe 13: `1 write · 1 coin on the new key · 1 coin on an old key`. Start state (just after append 5's resize to capacity 8): row at y 120, 8 cells of 56 units (x 40 → 520, 4-unit gaps), cells 1–5 crema, 6–8 taupe outlines; no coins. Appends 5, 6, 7, 8 replayed one per 0.6 s (append 5 re-plays its write only): for append i, two caramel coins fall onto cell i and onto its partner i − 4 (`easeOutBack`, 0.3 s). A thin caramel arc links i to i − 4 for the duration of the drop (it fades after). At 2.8 s: every cell carries one coin; caramel 15 under the row, `8 keys · 8 coins`. Beat (3.2–4.6 s): append 9: the 16-cell row (cells 26 units, x 40 → 520) draws at y 230; each old cell moves down along a short caramel arrow while its coin lifts off and vanishes (spent, 0.08 s stagger); then key 9 lands in its cell. Under the new row, two stacked labels: `copy 8 keys = 8 coins` caramel 15 / `write 1 = this append's own charge` taupe 13.
- **Landscape:** same, row widths unchanged; the charge text at the left top.
- **Final frame:** the new 16-cell row with keys 1–9 (no coins yet on the old keys, which is the point of the next phase) and both labels; the old 8-cell row faded to 0.25 above it as a ghost so the "8 coins" state is still readable.
- **Real values:** charge 3; cells 1–8; partners i − 4; 8 coins; 8 copies; append 9 costs 9.
- **Caption:** "The accounting method: charge each append 3. One pays its write, one stays on the new key as a coin, one goes on a key in the old half, which has none. When the row fills, every key holds a coin: exactly what its copy will cost."
- **Note for the Deep dive (not on screen):** the very first append has no old half, so its third unit is a spare coin; the bank is the coins on cells plus that one spare (2n − cap + 1 after any append with cap ≥ 2). Step 7 shows the bank including it.

### 7. The bank never goes negative (`Bank`, h 380, about 4.6 s)

- **Visual idea:** two running totals on one chart: what the appends actually cost (a staircase that jumps at every resize) and what they were charged (a straight dashed line, 3 per append). The gap between them is the bank, shaded caramel; the step's whole proof is that the staircase never pokes through the line, at any append, not just the last.
- **Portrait:** chart x 60 → 520 for appends 0 → 16, y from 330 (0) up to 40 (48 writes), 6 units per write. Dashed caramel line from (0, 0) to (16, 48), labelled at its end above-left: `Σ charges = 3i` caramel 13. Staircase in crema: Σcᵢ = 1, 3, 6, 7, 12, 13, 14, 15, 24, 25, …, 31, drawn left to right over 3 s (one step per 0.18 s); the gap between line and staircase fills caramel at 0.35 opacity as it is drawn. Three short taupe ticks with the bank's value where it is lowest after a resize: `3` above appends 3, 5 and 9. Under the chart, y 356, two stacked labels: `bank = Σĉᵢ − Σcᵢ ≥ 0 after every append` (crema 15; two lines on portrait: `bank = Σĉᵢ − Σcᵢ` / `≥ 0 after every append`) and `lowest: 2, after append 1` taupe 13. Axis labels taupe 13: `append i` (x), `writes` (y).
- **Landscape:** the chart on the left 2/3 (x 40–400), the two labels stacked at the right (x 420–530, wrapped).
- **Final frame:** line, staircase, the shaded bank, the ticks and both labels.
- **Real values:** cumulative costs; bank after each append 2, 3, 3, 5, 3, 5, 7, 9, 3, 5, 7, 9, 11, 13, 15, 17; minimum 2; final 48 − 31 = 17.
- **Caption:** "Write cᵢ for the actual cost of operation i and ĉᵢ for its charge. The proof needs Σĉᵢ ≥ Σcᵢ after every operation, not just at the end: the bank, charges minus costs, never below zero. Then n appends cost at most 3n. A bank that can drift negative proves nothing."

### 8. Grow by a fixed amount and it is quadratic (`Additive`, h 340, about 3.6 s)

- **Visual idea:** why the rule multiplies: three growth rules priced at the same million appends, on a log scale where each decade is one step, so the gap of five orders of magnitude is visible at once (topic 1's ladder grammar, here for one problem).
- **Portrait:** three rows, y 80 / 170 / 260, each: a label line (crema 15) and a bar on a log₁₀ axis from 10⁶ (x 40) to 10¹² (x 520), bar height 22, value at its end or inside, two stacked lines if needed.
  - `grow by 1 slot`: bar to 500,000,500,000 (x ≈ 496), `cherry`, value `500,000,500,000` in `C.cherryText` 15 under the bar (right-aligned at 520).
  - `grow by 1,000 slots`: bar to 500,500,000 (x ≈ 256), `cherry` at 0.7 opacity, value `500,500,000` `C.cherryText` 15.
  - `double (g = 2)`: bar to 2,048,575 (x ≈ 65), `caramel`, value `2,048,575` caramel 17 to its right.
  Axis ticks taupe 13 at 10⁶, 10⁹, 10¹² (y 320), axis name `total writes, 1,000,000 appends (log scale)` taupe 13 at y 30.
- **Landscape:** same rows with more height; label left at x 40, bar from x 200.
- **Beats:** rows arrive 0.3 / 1.1 / 1.9 s, each bar growing over 0.6 s.
- **Final frame:** three bars and values; the caramel bar tiny beside two cherry ones.
- **Real values:** n(n + 1)/2 = 500,000,500,000 for grow-by-one; 500,500,000 for grow-by-1,000 (first append allocates 1,000 slots; each resize adds 1,000); 2,048,575 for doubling.
- **Caption:** "Why multiply? Grow by one slot and append i copies i − 1 keys: n appends cost n(n + 1)/2, half a trillion writes at a million. A step of 1,000 slots divides that by about 1,000 and stays quadratic. Only geometric growth makes the copies a series that sums to O(n)."

### 9. A growth factor of 1.5 (`Factor`, h 360, predict)

- **Visual idea:** the geometric series as tiles laid end to end: all the copies made up to just after a resize, the latest copy first, each earlier copy 1/g of the next. For g = 2 they tile to twice the last copy; the learner predicts the length for g = 1.5. n at that moment is about the last copy, so the tiled length over n is the copies per append.
- **Portrait, question frame:** two rows. Row 1 (y 100), label `g = 2` caramel 15 above it: tiles from x 40, widths proportional to the real copies just after the resize at append 524,289 (524,288; 262,144; 131,072; … ; 1), the last copy = 200 units, so the tiles end at x ≈ 440; caramel fills with 2-unit gaps (tiles under 3 units merge into one sliver). Under it, a crema bar of 200 units at y 130 labelled `n ≈ last copy` taupe 13; at the right, caramel 15, `≈ 2 × n`. Row 2 (y 230), label `g = 1.5` cinnamon 15 above it: only the last tile (cinnamon, 200 units: the copy of 699,912 at append 699,913) and the crema `n` bar under it; to the right a `?` crema 22.
- **Answer reveal (local clock, about 1.2 s):** row 2's earlier tiles slide in from the right, each 2/3 of the one before (466,608; 311,072; … real values), until the row reaches x ≈ 640 → scale row 2 so its full tiling ends at x 520: so in row 2 the last copy is 160 units and both rows are re-scaled to the same per-key scale (builder: draw both rows at one scale from the start, last copy 160 units, so row 1 ends at x ≈ 360 and row 2 at x ≈ 520; the `n` bars are 160 units). The `?` becomes `≈ 3 × n` cinnamon 17.
- **Landscape:** same, more vertical room; labels left of the rows.
- **Final frame:** both tilings at one scale, `≈ 2 × n` and `≈ 3 × n`.
- **Question (body):** "Doubling copies at most about 2 keys per append. A growth factor of 1.5 leaves less empty space after each resize. At most how many copies per append does it cost?"
- **Options:** "About 1.5" / "About 2" / **"About 3"** (correct) / "About 4".
- **Wrong options:** 1.5 confuses the factor with the cost; 2 assumes the factor doesn't matter; 4 is the accounting charge, which also counts the write.
- **Explain:** "About 3. Just after a resize that copied c keys, all copies so far are c + c/g + c/g² + … ≈ c · g/(g − 1), and n is about c. For g = 2 that is 2, for g = 1.5 it is 3. Add the write: an accounting charge of 1 + g/(g − 1), 3 for doubling, 4 for g = 1.5. The space saved: right after a resize a third of the capacity is empty, not half."

### 10. Where n falls between resizes (`Sawtooth`, h 380, about 4.4 s)

- **Visual idea:** "copies per append" is not one number: plotted against n it is a sawtooth, jumping to about g/(g − 1) at each resize and sliding down to about 1/(g − 1) before the next. The million-append measurement is one point on it, which is why it says 1.05 and not 2.
- **Portrait:** chart x 60 → 520 is log₂ n from 2¹⁰ to 2²⁰ (ticks taupe 13 at `2¹⁰`, `2¹⁵`, `2²⁰`); y from 0 (y 340) to 3.2 (y 60), ticks `1`, `2`, `3` taupe 13. Curves: copies so far ÷ n, computed by the rule at every n (or sampled densely, exactly), g = 2 in `caramel` (teeth between about 1 and 2, one per doubling), g = 1.5 in `cinnamon` (teeth between about 2 and 3, about 1.7 per doubling). Dashed lines at 2 (caramel) and 3 (cinnamon), labelled at their left end above the line: `g/(g − 1)` latte 13 once, at the 3 line. A dotted taupe vertical at n = 1,000,000 (just left of 2²⁰) with two dots and their values to its left, stacked and colour-coded: `2.10` cinnamon 17 at y(2.10), `1.05` caramel 17 at y(1.05). A legend at top-left, stacked: `g = 2` caramel 13, `g = 1.5` cinnamon 13.
- **Landscape:** same chart, wider height; legend top-left.
- **Beats:** axes 0.2 s; both curves sweep left to right 0.5–3.0 s; the vertical and dots at 3.3 s; values at 3.7 s.
- **Final frame:** both sawtooths, the dashed bound lines, the two measured points.
- **Real values:** g = 2 at n = 1,000,000: 1,048,575 / 1,000,000 = 1.05; g = 1.5: 2,099,719 / 1,000,000 = 2.10; peak just after a resize (for n ≥ 1,024) above 1.99 for g = 2 and above 2.99 for g = 1.5, never reaching 2 or 3; trough above 0.99 and 1.99.
- **Caption:** "“About g/(g − 1)” is a peak, reached just after a resize; just before the next it falls to about 1/(g − 1). At a million appends doubling has copied 1.05 keys per append, not 2; g = 1.5, 2.10. Topic 10's lab measures this sawtooth; compare against the curve, not one number."

### 11. A binary counter, by the total (`Counter`, h 400, predict)

- **Visual idea:** the counter's history as a grid, one row per increment and one column per bit, with every flip lit. Columns thin out to the left in halves (16, 8, 4, 2, 1), which is the whole aggregate argument; the question frame shows only the worst increment.
- **Portrait, question frame:** a 5-bit register drawn large at y 70 (cells 64 units, x 120 → 440, bit 4 on the left), showing `01111` → `10000` with all five cells flashing `cherry` (the 16th increment), labelled above `increment 16 flips 5 bits` `C.cherryText` 15; under it taupe 13 `unit: one bit flip`. A faint empty 16 × 5 grid (taupe outlines) at y 130–354 (rows 14 units, columns 64 units aligned with the register).
- **Answer reveal (local clock, about 1.4 s):** rows fill top to bottom (0.07 s each): flipped cells caramel, unflipped empty; at the right of each row its flip count (crema 13: 1, 2, 1, 3, 1, 2, 1, 4, …, 5). Column totals under the grid, y 376, caramel 15, under each column: `1`, `2`, `4`, `8`, `16` (bit 4 … bit 0). At the right of the totals: `= 31` serif 22 caramel. Row 16 keeps a cherry outline.
- **Landscape:** register and grid side by side: grid on the left (x 40–360), register and labels on the right.
- **Final frame:** the lit grid, per-row counts, column totals, `= 31`.
- **Question (body):** "A binary counter from 0. An increment turns trailing 1s into 0s and the next 0 into a 1, so one increment can flip every bit: the 16th flips 5. How many bits do 16 increments flip in total?"
- **Options:** "80" / "64" / **"31"** (correct) / "16".
- **Wrong options:** 80 = 16 increments × the worst 5; 64 = 16 × log₂ 16 (the O(n log n) bound from the per-operation worst case); 16 forgets the carries.
- **Explain:** "31. Bit 0 flips on every increment, bit 1 on every second, bit i on every 2ⁱ-th: 16 + 8 + 4 + 2 + 1. For any n the total is under 2n, exactly 2n minus the number of 1 bits in n, so O(1) amortized against Θ(log n) for the worst single increment. The vector's 16 appends also cost 31: at a power of two both are 2n − 1."

### 12. One coin on every 1 bit (`CounterCoins`, h 340, about 4.4 s)

- **Visual idea:** each 1 bit carries the coin that will pay for resetting it, so a long carry is paid by coins that were saved one at a time, and the number of coins is just the number of 1s.
- **Portrait:** the 5-bit register at y 150, cells 72 units (x 120 → 480), bit values crema 22. Above, y 50, crema 15: `charge 2 per increment` / taupe 13 `1 sets a bit · 1 stays on it as a coin`. Start: `00111` with a caramel coin on each 1. Beat 1 (0.4–1.6 s): increment to 8: the three coins lift from bits 0–2, each turning its bit to 0 as it vanishes (0.2 s stagger), then bit 3 turns 1 and a new coin drops on it (`easeOutBack`). Label under the register, y 230, caramel 15: `3 resets paid by 3 coins`. Beat 2 (1.8–3.4 s): fast-forward 8 → 16 (0.2 s per increment), coins appearing and vanishing with the bits. Final tally y 280, stacked: `16 × 2 = 32 charged · 31 flips` crema 15 / `coins = number of 1 bits ≥ 0` caramel 15.
- **Landscape:** register centred, labels at left and below.
- **Final frame:** `10000` with one coin, both tally lines.
- **Real values:** charge 2; 7 → 8 resets 3 bits; 16 × 2 = 32; 31; 1 coin left (32 − 31 = 1 = the number of 1 bits in 16).
- **Caption:** "Accounting: charge 2 per increment. Every increment sets exactly one bit from 0 to 1: one unit pays for that, the other stays on the bit as a coin. A carry resets 1 bits, each with its own coin. The coins always equal the number of 1 bits, so the bank never goes negative."

### 13. Multipop: each key leaves once (`Multipop`, h 380, about 5 s)

- **Visual idea:** a stack whose keys each carry the coin for their own removal, so a multipop of any size arrives already paid for. Beside it the cost strip shows the multipops as spikes that the dashed line at 2 per operation still covers in total.
- **Portrait:** the stack at the left, x 60 → 160, cells 100 × 24 stacked upward from y 340, keys crema 13; each pushed key gets a caramel coin at its right edge. Header y 26, crema 15: `push · pop · multipop(k)`, taupe 13 under it: `multipop(k) pops min(k, size) keys · unit: one key in or out`. Right side, x 220 → 520: the 10-operation cost strip (baseline y 340, 30 units per unit of cost, bars 22 wide), dashed caramel line at height 2, its label `2 per operation` caramel 13 above its right end. Sequence (0.35 s per push, 0.6 s per multipop): push ×6; multipop(4) (four keys leave upward with their coins, each coin flying into the operation's bar, which rises to 4 in `cherry`); push ×2; multipop(10) pops the 4 keys left (bar 4, cherry). Tally at y 370 (two stacked lines on portrait): `10 operations · cost 16` crema 15 / `≤ 2 × 8 pushes ≤ 2n` caramel 15.
- **Landscape:** stack left, strip right, tally under the strip.
- **Final frame:** empty stack (taupe outline), strip 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, both tally lines.
- **Real values:** costs as listed; total 16; 8 pushes; 2 × 10 = 20.
- **Caption:** "A stack with push, pop and multipop(k), which pops min(k, size) keys. One multipop can cost almost n, so n operations look like n². But each key is popped at most once after its push: the total is at most twice the pushes. Accounting: charge push 2, pop and multipop 0; each key carries the coin for its own pop."

### 14. Cheap operations pay for expensive ones (`Setup`, h 380, about 4 s)

- **Visual idea:** the one move behind all three examples: every expensive operation is preceded by cheap ones that set it up, and coins flow from those cheap operations into the spike. Three rows, one per structure, the same picture each time.
- **Portrait:** three rows, y 40–130, 150–240, 260–350. Each row: on the left a run of small crema chips (the cheap setup operations), on the right one `cherry` chip (the spike), with caramel coins travelling along a caramel arrow from the chips into the spike. Two labels per row, stacked under it, left and right, each ≤ 20 characters (crema 13 left, `C.cherryText` 13 right):
  - vector: 8 chips `8 appends` → spike `append 9: 8 copies`.
  - counter: 3 chips `3 bits set` → spike `increment 8: 3 resets`.
  - stack: 4 chips `4 pushes` → spike `multipop(4): 4 pops`.
- **Landscape:** three rows unchanged, wider spacing; one line of text per label.
- **Beats:** rows at 0.2 / 1.2 / 2.2 s; in each, chips appear (0.3 s), coins travel (0.5 s), spike outline turns caramel when paid (0.2 s).
- **Final frame:** three rows, every spike outlined caramel (paid).
- **Caption:** "The same move three times: an expensive operation can only follow cheap ones that set it up, so each cheap one pays a little extra in advance. The aggregate method needs one total that covers every sequence; charge per operation when operations differ, like push and multipop, and the bounds you get are not unique."

### 15. When the bound breaks (`Breaks`, h 380, about 3.8 s)

- **Visual idea:** take the setup away and every operation is a spike. Two cost strips that are all cherry, each with its would-be bound line far below.
- **Portrait:** two panels.
  - Top (y 30–180): title crema 15 `add decrement: 01111 ↔ 10000`; strip of 8 bars, each 5 units tall (14 units per flip, bar 70 tall), all `cherry`, x 60 → 500; dashed caramel line at height 2 labelled `2 per op` caramel 13; total at the right, stacked: `40 flips` `C.cherryText` 15 / `bound said 16` taupe 13.
  - Bottom (y 210–370): title crema 15 `append to the same full vector`; strip of 10 bars each 17 units tall (scaled 4 units per write, 68 tall), all `cherry`; dashed caramel line at height 3, `3 per op`; total stacked: `170 writes` `C.cherryText` 15 / `bound said 30` taupe 13.
- **Landscape:** the two panels side by side.
- **Beats:** top strip 0.2–1.6 s (bars pop in sequence), bottom 1.8–3.2 s, totals 3.4 s.
- **Final frame:** both all-cherry strips, the low bound lines, the totals.
- **Real values:** a 5-bit counter at 15 alternating increment and decrement 8 times: 5 flips each, 40; 10 appends each starting from the same full 16-key vector (capacity 16): 17 writes each, 170; 2 × 8 = 16; 3 × 10 = 30.
- **Caption:** "The bound needs the cheap operations first, in one history from the start state. Add decrement, and a counter at 01111 flips 5 bits on every operation. Append again and again to one old, full version of the vector, and every append copies all 16 keys. Chapter 13 returns to this for persistent structures."

### 16. Back to the problem (`Back`, h 380, about 4.2 s)

- **Visual idea:** the opening strip again, now paid for: the running total stays under the 3n line for the whole million, and the tallest spike is met by the pile of coins the 524,288 earlier appends left behind. The spike is still there: one operation still waits for it.
- **Portrait:** top half (y 30–190): a running-total chart, x 60 → 520 for appends 0 → 1,000,000, y for 0 → 3,000,000 writes; dashed caramel 3i line; the crema staircase Σcᵢ under it (its jumps visible only at the last few resizes); at the end, stacked at the right inside x ≤ 536: `2,048,575` crema 17 / `≤ 3n = 3,000,000` caramel 15. Bottom half (y 210–370): step 1's strip at reduced height; at the tallest spike a caramel coin pile labelled, stacked, `bank: 524,289 coins` caramel 15 / `for 524,288 copies` taupe 13; the coins flow into the spike and its fill changes from cherry to a cherry outline with caramel inside (paid). Final note y 370 taupe 13: `still one append of 524,289 writes` (two lines on portrait if needed).
- **Landscape:** the two charts side by side.
- **Beats:** top chart 0.2–1.8 s; bottom strip 2.0 s; coins flow 2.6–3.4 s; final note 3.8 s.
- **Final frame:** both charts, the totals, the paid spike, the note.
- **Real values:** 2,048,575; 3,000,000; bank before append 524,289 = 524,289; 524,288 copies; 524,289 writes.
- **Caption:** "A million appends wrote 2,048,575 elements, under 3n. When append 524,289 arrived, the bank held 524,289 coins for its 524,288 copies. The spike is still one operation: a request waiting on it waits, which is deamortization's problem. And a vector that shrinks loses the coins on the keys it pops."

### 17. Prove it · 1 of 3 (`Q1`, h 340, predict, debug-this)

- **Visual idea:** the bank after each append under a charge of 2, as bars above and below a zero line: it dips below zero right after resizes and climbs back by each power of two, so a check at the end alone would pass a broken proof.
- **Question frame:** the 16-append cost strip (as step 3, scaled to 180 tall, y 60–240) and above each bar a small caramel `2` chip (the charge); no bank yet. Header taupe 13 `charge 2: 1 write + 1 coin on the new key`.
- **Answer reveal (local clock, about 1.2 s):** under the strip, a zero line at y 300 (taupe) and the bank after each append as thin bars (6 units per write): 1, 1, 0, 1, −2, −1, 0, 1, −6, −5, −4, −3, −2, −1, 0, 1; negative bars `cherry` below the line, non-negative caramel above; the 5th bar outlined with label `append 5: −2` `C.cherryText` 15; at the right `ends at +1` taupe 13.
- **Final frame:** strip, chips, the bank bars with the first negative marked.
- **Question (body):** "A teammate charges 2 per append, not 3: one for the write, one coin on the new key. With doubling from empty, at which append does the bank first go negative?"
- **Options:** "Never: 2 is enough" / "The 3rd" / **"The 5th"** (correct) / "The 9th".
- **Wrong options:** "never" checks only the end (after 16 appends the bank is +1); "the 3rd" is where it first reaches exactly 0; "the 9th" is the biggest dip in the picture, not the first.
- **Explain:** "The 5th: costs 1 + 2 + 3 + 1 + 5 = 12 against 10 charged. The coin on each new key pays its own copy, but every resize also copies the old half, which holds no coins. At each power of two the bank is back to +1, so checking only at the end hides the failure; its lowest within a million appends is −524,286."

### 18. Prove it · 2 of 3 (`Q2`, h 340, predict, estimate-the-cost)

- **Visual idea:** step 9's tiles for g = 1.5 at the real scale of the last resize before a million, so the estimate is read off the picture: tiles ≈ 3 × the last copy.
- **Question frame:** the last tile alone, cinnamon, 160 units, labelled above `last resize: append 699,913, copies 699,912` (cinnamon 15, two stacked lines: `last resize: append 699,913` / `copies 699,912`), with `n = 1,000,000` crema 15 on a crema bar of the matching length (229 units at the same scale) under it, and `total copies = ?` crema 17.
- **Answer reveal:** earlier tiles slide in to ≈ 480 units; label `2,099,719` serif 22 cinnamon, under it `÷ 1,000,000 = 2.10 per append` cinnamon 15 (two lines on portrait).
- **Question (body):** "With g = 1.5, the last resize before the millionth append comes at append 699,913 and copies 699,912 keys. Estimate the total copies after 1,000,000 appends."
- **Options:** "About 1.05 million" / **"About 2.1 million"** (correct) / "About 3 million" / "About 20 million".
- **Wrong options:** 1.05 million is doubling's figure; 3 million applies the peak ratio 3 to n = 1,000,000 instead of to the last resize; 20 million is the log₂ n guess from step 2.
- **Explain:** "About 2.1 million (2,099,719). The copies made up to that resize tile to about 3 × 699,912 ≈ 2.1 million, and none follow it before the millionth append. Per append that is 2.10: between the trough of 2 and the peak of 3, as the sawtooth showed."

### 19. Prove it · 3 of 3 (`Q3`, h 340, predict, defend-a-design)

- **Visual idea:** the multipop stack with a new operation that adds many keys at once: alternating it with multipop makes every operation a spike, so the per-operation bound is gone even though the per-key argument still holds.
- **Question frame:** step 13's stack and strip, with the header `new: multipush(k) pushes k keys in one operation` crema 15; the strip empty.
- **Answer reveal:** the strip fills with 10 equal `cherry` bars of height k (scaled to 150 units; the first 10 of the 1,000 operations), the stack filling and emptying in time; tally, stacked: `1,000 operations, k = 1,000` crema 15 / `cost 1,000,000: 1,000 each` `C.cherryText` 15.
- **Question (body):** "Someone adds multipush(k), which pushes k keys in one operation. Is every stack operation still O(1) amortized?"
- **Options:** "Yes: charge 2 per key pushed" / **"No: alternate multipush(k) and multipop(k)"** (correct) / "Yes, if the stack is a doubling vector" / "No: multipop becomes Θ(n²)".
- **Wrong options:** "charge 2 per key" is the trap: it still pays for everything, but it charges multipush 2k, which is not O(1) per operation; the doubling vector changes the storage cost, not the count of pushes and pops; multipop's own cost is still at most the keys it pops.
- **Explain:** "No. 1,000 operations alternating multipush(1,000) and multipop(1,000) cost 1,000,000: 1,000 each. Charging 2 per key pushed still covers every pop, but then multipush is charged 2k, so its amortized cost is Θ(k). The bound was per key, and an operation that creates k keys at once breaks it per operation."

End card (from the registry): the `handoff`.

## Deep dive (`index.mdx`)

- `## After this topic you can`: the four outcomes above.
- `## Into the internals`
  - `### The definition, exactly`: amortized cost of an operation in a sequence = T(n)/n with T(n) the worst-case total over every sequence of n operations from the start state (Erickson's "Summation Method", CMU Definition 7.1); the example of 100 operations of cost 1 and one of cost 100, 200/101 < 2 (CMU); the accounting condition Σᵢ≤ₖ ĉᵢ ≥ Σᵢ≤ₖ cᵢ for every prefix k, and why "at the end" is not enough (Prove it 1's bank returns to +1 at 16); starting state and seeds (CMU: "seed the bank account", total ≤ cn + seed), the from-full example of step 15; amortized against topic 1's average and expected (Erickson: "There is no probability involved"; CMU: "just averaging over time"), never an average-case bound; what an amortized bound does not say: it bounds no single operation (topic 1's "In code review" smell: "O(1)" for an operation that is amortized O(1)).
  - `### The doubling vector, both ways`: the growth rule and cost unit restated; exact aggregate count: for n not a power of two the copies are 2^(k+1) − 1 with 2ᵏ the largest power of two below n, so copies ≤ 2n − 3 < 2n; at powers of two exactly n − 1; total < 3n for every n (asserted to n = 2²⁰); the accounting proof in full: the partner scheme (append i in the new half puts one coin on itself and one on key i − cap/2), the one spare coin from the first append, bank = 2n − cap + 1 after any append once cap ≥ 2 (topic 6 turns this into a potential function and drops the spare); the 3 per append and CMU's refinement for a stack with pop that does not shrink ($3 per push, −$1 per successful pop: amortized costs are not unique). Sedgewick and Wayne's resizing-array stack as the same rule in a textbook implementation (starts at capacity 1, doubles when full; its halving at a quarter is topic 6's).
  - `### Any growth factor g`: derivation of copies ≤ n·g/(g − 1) (geometric series in 1/g), the trough 1/(g − 1), charge 1 + g/(g − 1); the rounding rule (⌈g·cap⌉, at least cap + 1) and its exact capacities for g = 1.5 (1, 2, 3, 5, 8, 12, 18, 27, 41, 62, …); the exact counts at n = 1,000,000: g = 2: 1,048,575 copies, 20 resizes, last 524,288, final capacity 1,048,576; g = 1.5: 2,099,719 copies, 33 resizes, last 699,912, final capacity 1,049,868; the bound is strict (never reaches g/(g − 1)); why a charge of 3 fails for g = 1.5 (first negative at append 9, then drifting down); the empty fraction just after a resize, 1 − 1/g (a half against a third); additive growth by k: about n²/(2k) copies (500,500,000 total at k = 1,000), the CMU grow-by-one count n(n + 1)/2 and its (n + 1)/2 per operation. What g to choose in a real library and the memory-reuse argument for 1.5 are Ch.2 "Dynamic arrays and growth policy".
  - `### The binary counter`: Increment, Θ(k) for k trailing 1s, Θ(log n) worst case; bit i flips ⌊n/2ⁱ⌋ times, total exactly 2n − #1(n) (Erickson), 1,999,993 at n = 1,000,000; the accounting proof (2 per increment, Erickson's "Increment Revenue Service" two-dollar tax, CMU's piggy bank); naive O(n log n) against Θ(n); a fixed k-bit counter that wraps (the wrap increment resets k bits and the argument still holds, every reset paid by its coin); a variant where flipping bit k costs 2ᵏ (CMU 7.6): the total is at most n(log₂ n + 1), exactly 80 = 16 · 5 at n = 16 (executed), so the amortized cost becomes O(log n); increment and decrement together (Erickson 9.3): the plain counter is Θ(k) per operation in the worst sequence (step 15), and the aggregate method cannot be used without knowing the sequence; Erickson's double counter and Gray-code counter as the fixes, named only.
  - `### The multipop stack`: operations and their costs (multipop(k) costs min(k, s); multipop on an empty stack costs 0); the aggregate argument (pops ≤ pushes, so any n operations cost at most 2 × pushes ≤ 2n; for n ≥ 2 at most 2n − 2, since a sequence with pops has at most n − 1 pushes); the accounting argument (charge push 2, others 0; bank = keys on the stack); the multipush counter-example (Prove it 3; Erickson's MultiPush/MultiPull exercise is the same phenomenon for a queue); the worst-case-per-operation O(n) bound and why multiplying it by n gives only O(n²).
  - `### Choosing a method`: aggregate when one total for every sequence is easy and every operation can get the same amortized cost; accounting (taxation) when operations differ or when costs belong to specific elements (Erickson: "Taxation and charging are useful when there is a convenient way to distribute costs to specific steps in the algorithm or components of the data structure"); the charging method (Erickson 9.2.3: charge each reset to the earlier set); tight bounds come from schedules "that just barely stay in the black"; bounds are not unique; the methods are "logically equivalent" in many cases (Erickson). The next topic's potential method keeps the bank as one function of the state; Chapter 13 "Amortization under persistence" meets the same ideas as "banker's and physicist's methods" (the names are that syllabus line's; this topic attributes them to no one).
- `## Build, break, measure`: run `examples.py`; break it: (1) charge 2 per append (first negative at append 5); (2) keep the charge at 3 and set g = 1.5 (negative at append 9); (3) grow by a fixed 1,000 slots and time a million appends against doubling; (4) add decrement to the counter; (5) add multipush to the stack. Predictions for topic 10's lab, part 2 (time per append and total element copies for g = 2 and g = 1.5): a table of the exact copy counts at n = 1,000, 10,000, 100,000 and 1,000,000 for both factors, and the sawtooth's peak and trough; link to topic 10 "Measuring the memory hierarchy" ("Goes deeper later"), which hosts the lab and measures it. No lab is repeated here (CHAPTER.md, "The chapter lab").
- `## In production`: misreadings to catch, each with its numbers from this topic: "amortized O(1)" read as "every call is O(1)" (the 524,289-write append; latency is topic 7's subject); "about 2 copies per append" expected from a measurement at one n (1.05 at a million); the bound assumed from a state other than empty (a vector built by someone else, or restored from a snapshot, has no saved credit); an operation added later that undoes the setup (decrement; multipush). Reserving capacity up front and real libraries' growth factors are Ch.2's; no production system claims are made here.
- `## The frontier`: amortized bounds are a statement about a single history: persistence and lazy evaluation (Chapter 13, "Amortization under persistence"); worst-case bounds instead of amortized (topic 7, deamortization; Erickson's Gray-code counter that "maintains a Gray code counter in constant worst-case time per" increment as the classic example of a worst-case O(1) counter).
- `## More questions`: the three Prove-it questions with their worked answers, plus: (a) Erickson exercise 1(c)-style: f(k) = n if k is a power of two, 1 otherwise: amortized cost (aggregate: about log₂ n · n / n = O(log n)); (b) a queue from two stacks with each element moved at most twice: amortized O(1) per operation by accounting (Sedgewick and Wayne's exercise, Erickson's exercise 10: solved here by derivation and executed); (c) at which n between 2¹⁹ and 2²⁰ do copies per append for g = 2 first fall below 1.5? (executed).
- `## Sources`: last verified 2026-10-12; the three opened sources with what each supports; CLRS 4th ed. as framing only (not opened, no page or chapter numbers claimed); "Expert sign-off: pending"; fact-check record `FACT-CHECK.md`.

## Prerequisites panel (`prerequisites.mdx`), per CHAPTER.md

- 01 Topics 1 and 2, "Before this" (on-site reels: "Asymptotic notation and case analysis" for best/worst/average and expected; "The word-RAM model and its assumptions" for the unit-cost write).
- 02 Stacks (declared): push and pop, LIFO; self-check: "push a, b, c, pop twice: what is left?" (Answer: a.) Ch.2 "Stacks, queues and deques" as "Goes deeper later".
- 03 Binary counting (declared): adding 1 in binary, carries; self-check: "what is 0111 + 1, and how many bits changed?" (Answer: 1000; four.)
- 04 Geometric series (declared): 1 + 2 + 4 + … + 2ᵏ = 2^(k+1) − 1, and 1 + 1/g + 1/g² + … = g/(g − 1) for g > 1; self-check: "1 + 2 + 4 + 8 + 16 = ?" (Answer: 31.)
- Topic 10 "Measuring the memory hierarchy" as "Goes deeper later" for the measurement.
- Resource links (each verified before shipping): Erickson's Lecture 9 notes; CMU 15-451 Lecture 7 notes; Sedgewick and Wayne §1.3 booksite page.

## Examples to execute (`examples.py`) and what each must assert

Every number the reel or Deep dive shows appears as a literal in an assert (the build matches on-screen numbers to numbers in `examples.py`; rounded displays such as 1.05, 2.10, 2.00, 3.00 must appear as literals too). One `grow(cap, g)` implements the chapter's rule exactly: `1 if cap == 0 else max(ceil(g * cap), cap + 1)`, with g = 1.5 as an exact `Fraction(3, 2)` so no float rounding changes a capacity.

1. **Small trace, g = 2:** per-append costs == [1, 2, 3, 1, 5, 1, 1, 1, 9, 1, 1, 1, 1, 1, 1, 1]; sum 31; 3 × 16 == 48; capacities reached [1, 2, 4, 8, 16]; resize copies [1, 2, 4, 8], 1 + 2 + 4 + 8 == 15 < 16; spikes are exactly the costs 2, 3, 5, 9; running total ≤ 3i for every i ≤ 16.
2. **Aggregate bound for every n:** for every n ≤ 2²⁰, copies < 2n and total < 3n; at n = 2ᵏ, copies == n − 1 and total == 2n − 1 (so 31 at 16).
3. **Large vector, g = 2:** at n = 1,000,000: copies 1,048,575 == 2²⁰ − 1; 20 resizes; last copy 524,288 at append 524,289, whose cost 524,289 is the maximum; total writes 2,048,575; 999,980 appends cost exactly 1; final capacity 1,048,576; 3n == 3,000,000; copies per append rounds to 1.05.
4. **Step 2's wrong options (computed, for honesty):** 1,000,000 × 20 == 20,000,000; 1,000,000 × 524,289 == 524,289,000,000.
5. **Accounting, charge 3, g = 2:** bank after each of the 16 appends == [2, 3, 3, 5, 3, 5, 7, 9, 3, 5, 7, 9, 11, 13, 15, 17]; min bank 2 (after append 1) for all n ≤ 1,000,000, never negative; final 48 − 31 == 17. Partner scheme simulated cell by cell: after appends 8 and 16 every key holds exactly one coin (8 and 16 coins) and the spare is 1; at every resize the coins on cells equal the copies (4, 8, 16, …); bank == 2n − cap + 1 for every append with cap ≥ 2. Bank just before append 524,289 == 524,289.
6. **Charge 2, g = 2 (Prove it 1):** bank after the 16 appends == [1, 1, 0, 1, −2, −1, 0, 1, −6, −5, −4, −3, −2, −1, 0, 1]; first negative at append 5 (bank −2; costs to there sum to 12 against 10); bank +1 at every power of two; minimum over a million −524,286 at append 524,289.
7. **Additive growth (step 8):** grow by one: total n(n + 1)/2 == 500,000,500,000 at n = 1,000,000 ((n + 1)/2 == 500,000.5 per append); grow by 1,000 (first allocation 1,000): total 500,500,000; doubling 2,048,575; ratio of grow-by-1,000 to n²/(2k) + n within 1%.
8. **g = 1.5 (steps 9, 10, Prove it 2):** first capacities [1, 2, 3, 5, 8, 12, 18, 27, 41, 62]; 16-append costs [1, 2, 3, 4, 1, 6, 1, 1, 9, 1, 1, 1, 13, 1, 1, 1], total 47 ≤ 4 × 16 == 64; at n = 1,000,000: copies 2,099,719, 33 resizes, last copy 699,912 at append 699,913, final capacity 1,049,868, total 3,099,719 ≤ 4,000,000, copies per append rounds to 2.10; 3 × 699,912 == 2,099,736 within 0.01% of 2,099,719; the step-9 tile widths: the copies of the last resizes before 524,289 and 699,913 (524,288, 262,144, …; 699,912, 466,608, 311,072, …) and their sums 1,048,575 and 2,099,719; ratio just after those resizes rounds to 2.00 and 3.00.
9. **Sawtooth (step 10), both g:** copies/n < g/(g − 1) for every n ≤ 1,000,000 (strict: < 2 and < 3); for n ≥ 1,024 the peak exceeds 1.99 (g = 2) and 2.99 (g = 1.5), the trough exceeds 0.99 and 1.99; peaks occur at the resizing appends themselves (524,289 and 699,913 are the last ones). Charge 4 never negative for g = 1.5 (min bank 3); charge 3 first negative at append 9 (bank −1) for g = 1.5. Empty fraction just after a resize: 1 − 1/g == 1/2 and 1/3 (for capacities ≥ 8 under the rounding rule, within one slot). Copies per append at n = 1,000, 10,000, 100,000, 1,000,000 for both g (the lab prediction table). The first n in (2¹⁹, 2²⁰] where g = 2's copies per append fall below 1.5 (More questions (c)).
10. **Binary counter (steps 11, 12):** flips per increment for 16 increments == [1, 2, 1, 3, 1, 2, 1, 4, 1, 2, 1, 3, 1, 2, 1, 5]; total 31; per-bit totals [16, 8, 4, 2, 1] (bit i flips ⌊16/2ⁱ⌋ times); total == 2n − popcount(n) for every n ≤ 100,000 and < 2n; at n = 1,000,000: 1,999,993 (popcount 7); the 16th increment flips 5 (the worst); wrong options 16 × 5 == 80, 16 × 4 == 64; charge 2: bank == popcount(value) ≥ 0 after every increment; 7 → 8 resets 3 bits; 16 × 2 == 32, 32 − 31 == 1 == popcount(16). Both 31s coincide: for every k ≤ 20, vector total at 2ᵏ == counter flips at 2ᵏ == 2^(k+1) − 1. Weighted variant (flipping bit k costs 2ᵏ): 16 increments cost 80 == 16 × (log₂ 16 + 1), and ≤ n(log₂ n + 1) for n ≤ 4,096.
11. **Counter with decrement (step 15):** a 5-bit counter at 15 alternating increment and decrement 8 times flips 5 bits each time, 40 in all; 2 × 8 == 16.
12. **Old version (step 15):** 10 appends, each starting from the same full 16-key vector (capacity 16), cost 17 each, 170 in all; 3 × 10 == 30; from a full vector with an empty bank the first append costs 17 > 3 (the seed).
13. **Multipop stack (step 13):** the sequence push × 6, multipop(4), push × 2, multipop(10) costs [1, 1, 1, 1, 1, 1, 4, 1, 1, 4], total 16, 8 pushes, 16 ≤ 2 × 8 ≤ 2 × 10 == 20; multipop on an empty stack costs 0; for 1,000 seeded random sequences of 1 to 200 operations, total ≤ 2 × pushes ≤ 2n, and the accounting bank (2 per push, 0 otherwise, minus cost) equals the stack size and is never negative.
14. **Multipush (Prove it 3):** 1,000 operations alternating multipush(1,000) and multipop(1,000) cost 1,000,000, 1,000 per operation.
15. **Deep dive extras:** CMU's 100 × 1 + 100 = 200 over 101 operations, 200/101 < 2; f(k) = n if k is a power of two else 1 (More questions (a)): total for n = 1,024 and its ratio to n·log₂ n; queue from two stacks (More questions (b)): for seeded random sequences, element moves ≤ 4 per element enqueued (push, pop, push, pop), so ≤ 4 per operation amortized.

## Bridge and handoff (registry, exactly as CHAPTER.md)

- **Bridge** (registry; shown on step 1): "Here is that sequence. One append to a dynamic array can cost Θ(n), because it may copy everything; any n appends from empty cost less than 3n together. Here is how to count it."
- **Handoff** (registry; end card): "Credits on elements work while you can see where to store them. When the table can shrink too, keep the savings as one number for the whole structure: the potential."
- Planted in the reel by step 16's last sentence (a vector that shrinks loses the coins on the keys it pops) and by the Deep dive's bank formula 2n − cap + 1 under "The doubling vector, both ways", which topic 6 turns into Φ.

## Concept ledger (registry), exactly as CHAPTER.md

- **introduces:** `amortized-cost`, `aggregate-method`, `accounting-method`, `dynamic-array-doubling`, `growth-factor`, `binary-counter`, `multipop-stack`.
- **uses:** `big-o-theta-omega`, `best-worst-average-case`, `expected-vs-average`, `word-ram`, `binary-numbers`, `stacks`, `geometric-series`.
- **declared:** `binary-numbers`, `stacks`, `geometric-series`.
- Where each use shows: `big-o-theta-omega` (O(1), Θ(n), Θ(log n) throughout); `best-worst-average-case` and `expected-vs-average` (step 5); `word-ram` (step 1's unit: one element write is one word operation); `binary-numbers` (steps 11, 12, 15); `stacks` (13, 19); `geometric-series` (4, 9). Not used: Φ, potential, load factor, shrinking (topic 6), latency percentiles (topic 7); the forward mentions of Chapter 2, Chapter 13 and topics 6, 7 and 10 are links, not uses (CHAPTER.md note 5).
- **Registry fields:** `id: 'dsa.aggregate-accounting-methods'`, `domain: 'data-structures-and-algorithms'`, `slug: 'data-structures-and-algorithms/m1-data-structures/ch01-cost-models-amortized/aggregate-accounting-methods'`, `title` and `syllabusTitle: 'Aggregate and accounting methods'`, `kind: 'full'`, `milestone: { number: 1, title: 'Data Structures' }`, `chapter: { number: 1, title: 'Cost Models and Amortized Analysis', section: '1.2' }`, `minutes: 12`, `verified: '2026-10-12'`, `status: 'held'` unless every earlier topic is live on `main` at ship time.

## Claims list

Only claims backed by a `SOURCES.md` quote, by an executed example, or by mathematics derived in the Deep dive. Sources: **E** = Erickson, Lecture 9 (09-amortize.pdf); **M** = CMU 15-451 Lecture 7 (Blum, lect0922.pdf); **SW** = Sedgewick and Wayne booksite §1.3; **ex** = `examples.py`; **math** = derived in the Deep dive.

| # | Claim | Where | Source |
|---|---|---|---|
| 1 | Amortized cost per operation = total cost of a sequence of n operations divided by n (worst-case total, any sequence) | steps 4, 5; Deep dive | M: "Definition 7.1 The amortized cost per operation for a sequence of n operations is the total cost of the operations divided by n."; E: "The Summation Method. Let T (n) be the worst-case running time for a sequence of n operations. The amortized time for each operation is T (n)/n." |
| 2 | "Aggregate method" is the textbook name for computing the total and dividing by n | step 4 | E: "Most textbooks call this particular technique "the aggregate method", or "aggregate analysis"…" |
| 3 | No probability is involved; amortization averages over a sequence, unlike randomized or average-case analysis | step 5 | E: "There is no probability involved; we are averaging over a sequence of operations, not the possible running times of a single operation."; M: "we are not making any assumptions about the inputs being chosen at random, we are just averaging over time." (the topic says "a worst-case bound on the total", never "an average": CHAPTER.md) |
| 4 | Worst case per operation is too pessimistic when an expensive operation must be set up by many cheap ones | steps 1, 14 | M: "looking at the worst-case time per operation can be too pessimistic if the only way to produce an expensive operation is to "set it up" with a large number of cheap operations beforehand." |
| 5 | Doubling: resize copies 1 + 2 + 4 + … ≤ 2n − 1; total < 3n; amortized < 3 | steps 2, 4, 16 | M: "This sum is at most 2n − 1. Adding in the additional cost of n for inserting/removing, we get a total cost < 3n, and so our amortized cost per operation is < 3."; exact counts ex 1–3 |
| 6 | The chapter's rule and unit give 1, 2, 3, 1, 5, 1, 1, 1, 9, seven 1s, total 31; 1,048,575 copies over 20 resizes, last 524,288, 2,048,575 writes at a million | steps 1–4, 16 | ex 1, 3 (CHAPTER.md planning values, re-asserted) |
| 7 | Accounting: charge 3 per append, 1 for the write and 2 banked; the L-element copy is paid because at least L/2 pushes happened since the last resize | steps 6, 7 | M: "every time we perform a push operation, we pay $1 to perform it, and we put $2 into a piggy bank. So, our out-of-pocket cost per push is $3." and "after the last resizing, there were only L/2 elements in the array and so there must have been at least L/2 new pushes since then contributing $2 each."; the partner scheme (coin on the new key and on a key in the old half) ex 5, math |
| 8 | The bank must never go negative; a bank that drifts negative breaks the proof | step 7, Prove it 1 | M: "Note that it is very important in this analysis to prove that the bank account doesn't go negative." and "if the bank account can slowly drift off to negative infinity, the whole proof breaks down."; prefix values ex 5, 6 |
| 9 | The accounting method is also called the taxation method; tight bounds come from schedules that barely stay in the black | step 6 caption, Deep dive | E: "is called either the accounting method or the taxation method." and "The tightest bounds are obtained from tax schedules that just barely stay in the black." |
| 10 | A seed may be needed when the bank does not start at 0; bounds are stated from a start state | step 15, Deep dive | M: "Sometimes one may need in an analysis to "seed" the bank account with some initial positive amount"; from-full example ex 12 |
| 11 | Grow-by-one: n pushes cost 1 + 2 + … + n = n(n + 1)/2, (n + 1)/2 amortized; any fixed step is quadratic | step 8 | M: "If our n operations consist of n pushes then we will incur a total cost 1 + 2 + 3 + 4 + . . . + n = n(n + 1)/2. That's an amortized cost of (n + 1)/2 per operation."; k = 1,000 ex 7 |
| 12 | Growth factor g: copies per append at most about g/(g − 1), just after a resize; about 1/(g − 1) just before; charge 1 + g/(g − 1); g = 1.5 counts at a million; a third of capacity empty after a resize | steps 9, 10, Prove it 2 | math (geometric series in 1/g, Deep dive "Any growth factor g"); ex 8, 9. **No opened source states the g/(g − 1) form** (SOURCES.md gap): derived and executed only |
| 13 | Sedgewick and Wayne's resizing-array stack doubles when full and starts with an array of size 1 | Deep dive | SW: "We double the size of the array in push() if it is full;" and "Item[] a = new Item[1];" |
| 14 | Binary counter: bit i flips ⌊n/2ⁱ⌋ times; total exactly 2n − #1(n); worst case per increment O(log n), amortized O(1); naive O(n log n) | steps 11, 12 | E: "a sequence of n Increments flips each bit B[i] exactly bn/2i c times." (as fetched: ⌊n/2ⁱ⌋), "the number of flips is exactly 2n − #1(n)", "the worst-case cost of Increment is O(log n), but the amortized cost is only O(1)", "we get an upper bound of O(n log n)"; ex 10 |
| 15 | Counter accounting: 2 per increment, one to set the bit, one stored on it for its reset; each increment sets exactly one bit | step 12 | E: "the Increment Revenue Service charges a two-dollar increment tax whenever we want to set a bit from zero to one. One of those dollars is spent changing the bit from zero to one; the other is stored away as credit until we need to reset the same bit to zero."; M: "each increment has exactly one 0 → 1 flip." |
| 16 | 16 increments flip 31 bits; the vector's 16 appends also cost 31; both are 2n − 1 at powers of two | step 11 | ex 10 (coincidence asserted for k ≤ 20); CHAPTER.md mentions it |
| 17 | Multipop stack: any n operations cost at most 2 × pushes ≤ 2n; accounting 2 per push, 0 per pop and multipop | step 13 | math and ex 13. **No opened source works the multipop stack** (SOURCES.md gap; nearest: M's stack cost model "inserting into the array costs 1, taking an element out of the array costs 1", and E's MultiPull exercise "Prove that in any intermixed sequence of Push and MultiPull operations, the amortized cost of each operation is O(1)") |
| 18 | MultiPush with MultiPull forces Ω(n) amortized per operation; the stack's multipush is the same | Prove it 3 | E's exercise 6(b) text (in `sources/erickson-amortize.txt`; fact-check to add a quote to SOURCES.md if cited by name); ex 14 |
| 19 | Charging cheap operations to pay for expensive ones overestimates the total, so the bound holds for any sequence | step 14 | E: "By charging the cost of some operations to earlier operations, we are overestimating the total cost of any sequence of operations, since we pay for some charges from future operations that may never actually occur." |
| 20 | Accounting fits when costs can be attached to specific steps or components; methods are often logically equivalent; amortized bounds are not unique | step 14, Deep dive | E: "Taxation and charging are useful when there is a convenient way to distribute costs to specific steps in the algorithm or components of the data structure.", "Many (perhaps even all) of these methods are logically equivalent", "amortized time bounds are not unique."; M footnote: "our amortized cost is $3 per push and $−1 per successful pop" |
| 21 | Adding decrement breaks the counter's bound (alternating at 2ᵏ and 2ᵏ − 1) | step 15 | E: "A standard binary counter won't work, even in an amortized sense; if we alternate between 2k" (as fetched: 2ᵏ); ex 11 |
| 22 | Reusing an old version breaks an amortized bound | step 15 | ex 12 (the mechanism); Chapter 13's syllabus line "why amortized bounds break when an old version is reused" (a pointer, not a source) |
| 23 | 100 operations of cost 1 and one of cost 100: amortized 200/101 < 2 | Deep dive | M: "if we have 100 operations at cost 1, followed by one operation at cost 100, the" / "amortized cost per operation is 200/101 < 2."; ex 15 |
| 24 | Flipping bit k at cost 2ᵏ: O(log n) amortized, total ≤ n(log₂ n + 1) | Deep dive | M section 7.6 (contents; fact-check to quote it if kept); ex 10 |
| 25 | A Gray-code counter can be incremented in constant worst-case time | Deep dive frontier | E section 9.4 (expert list quote "maintains a Gray code counter in constant worst-case time per"; fact-check to add it to SOURCES.md) |
| 26 | Amortization applies to any sequence of numbers | Deep dive | E: "you should remember that amortization can be applied to any sequence of numbers." |
| 27 | The names "banker's" and "physicist's" methods | Deep dive only | Chapter 13's syllabus line, as a pointer; **not attributed to any person** (no opened source attributes them; SOURCES.md) |

Not claimed: anything from CLRS or Tarjan 1985 (not opened); any real library's growth factor; any measured time.

## Coverage plan (`coverage.json`, written in section 2.4)

- **syllabus** (the line after the dash, split into clauses that together cover it word for word):
  - "dynamic-array doubling" → steps "One append copied half a million keys", "Sixteen appends, counted in writes", "Add up the whole sequence", "Coins on cells: the accounting method", "The bank never goes negative", "Grow by a fixed amount and it is quadratic", "A growth factor of 1.5", "Where n falls between resizes"; Deep dive "The doubling vector, both ways", "Any growth factor g".
  - "binary counter" → steps "A binary counter, by the total", "One coin on every 1 bit"; Deep dive "The binary counter".
  - "and multipop stack" → step "Multipop: each key leaves once", "Prove it · 3 of 3"; Deep dive "The multipop stack".
  - "charging cheap operations to pay for expensive ones" → steps "Cheap operations pay for expensive ones", "A third kind of promise", "When the bound breaks", "Back to the problem"; Deep dive "Choosing a method", "The definition, exactly".
- **sources** (three, item by item from `SOURCES.md` "Contents"):
  - Erickson: epigraphs → out (decoration, no content); 9.1 → steps 11, Deep dive "The binary counter"; 9.2 → step 11; 9.2.1 → steps 4, 11; 9.2.2 → steps 6, 12, Deep dive "Choosing a method"; 9.2.3 charging → Deep dive "Choosing a method"; 9.2.4 potential → topic "The potential method", quote "choosing Φ"; 9.3 increment and decrement → step "When the bound breaks", Deep dive "The binary counter"; 9.4 Gray codes → Deep dive "The frontier"; 9.5 generalities → step 14, Deep dive "Choosing a method"; exercises 1–16 → Deep dive "More questions" (1(c), 6(b), 10 adapted), the rest out ("exercises on other structures beyond this line").
  - CMU 15-451: 7.1 → steps 1, 14; 7.2 → step 4, Deep dive "The definition, exactly"; 7.3 → steps 2–4, 8; 7.4 → steps 6, 7, 15; 7.5 → steps 11, 12; 7.6 → Deep dive "The binary counter"; 7.7 amortized dictionary → out ("a structure built on the binary counter, not one of this line's three examples; the logarithmic method is not part of §1.2").
  - Sedgewick and Wayne §1.3: stacks and queues API → topic "Stacks, queues and deques" quote "LIFO/FIFO semantics"; resizing-array stack (double when full) → Deep dive "The doubling vector, both ways"; its halving at a quarter → topic "The potential method" quote "why shrinking at ½ occupancy thrashes while shrinking at ¼ does not"; linked lists → out ("linked-list implementations are Chapter 2's containers, not amortized analysis"); Q&A generics → out (language detail); exercises (queue with two stacks, constant amortized) → Deep dive "More questions"; web exercises (doubling and halving) → topic "The potential method", same quote.
- **expert** (`sources/expert.json`, 19 items, by the blind Sonnet agent, 2026-10-12):
  1. amortized = total/n, worst case over any sequence → step "Add up the whole sequence"; Deep dive "The definition, exactly".
  2. not average-case → step "A third kind of promise".
  3. differs from expected of randomized algorithms → step "A third kind of promise".
  4. pays off when expensive ops are set up by cheap ones → steps "One append copied half a million keys", "Cheap operations pay for expensive ones".
  5. aggregate method: one amortized cost for all ops → step "Add up the whole sequence"; Deep dive "Choosing a method".
  6. grow by +1 is quadratic → step "Grow by a fixed amount and it is quadratic".
  7. doubling: 2n − 1, under 3n → steps "What do a million appends cost?", "Add up the whole sequence".
  8. accounting $3, L/2 pushes → steps "Coins on cells: the accounting method", "The bank never goes negative".
  9. credit never negative → step "The bank never goes negative", "Prove it · 1 of 3".
  10. taxation charges, tight schedules → step "Coins on cells: the accounting method"; Deep dive "Choosing a method".
  11. counter aggregate → step "A binary counter, by the total".
  12. counter accounting → step "One coin on every 1 bit".
  13. start state, seeds → step "When the bound breaks"; Deep dive "The definition, exactly".
  14. multipop-style O(1) amortized → step "Multipop: each key leaves once"; Deep dive "The multipop stack".
  15. bounds not unique → step "Cheap operations pay for expensive ones"; Deep dive "Choosing a method".
  16. potential method (later) → topic "The potential method", quote "choosing Φ".
  17. amortization hides worst-case latency; Gray code worst case (later) → step "Back to the problem"; topic "Deamortization and global rebuilding", quote "turning amortized bounds into worst-case ones"; Deep dive "The frontier".
  18. aggregate fails for mixed increment/decrement → step "When the bound breaks"; Deep dive "The binary counter".
  19. shrink hysteresis at ¼ not ½ (blind agent placed it here; CHAPTER.md gives it to topic 6) → topic "The potential method", quote "why shrinking at ½ occupancy thrashes while shrinking at ¼ does not".
- **gapReview:** written after the section-4 content review.

## Progress

- 2026-10-12: sources fetched and quotes checked (`SOURCES.md`, `sources/`, blind expert list `sources/expert.json`); this content plan and storyboard written. **Next:** fact-check, currency and red team (2.3, a fresh Opus agent) on this file against `sources/*.txt`, saved as `FACT-CHECK.md`, with its corrections applied here; then `coverage.json` (2.4) from the plan above; then the build (section 3).

## Changes from the chapter plan

1. **Predict count.** CHAPTER.md says full topics "have 2–4 predict questions". This reel has three teaching predicts (steps 2, 9, 11) plus the three "Prove it" self-assessment questions (17–19), six question steps in all. The teaching predicts are within 2–4; Prove it is counted separately as the chapter's reel shape lists it separately ("… go 'Back to the problem', then 'Prove it · 1 of 3 … 3 of 3'"). The three structures in the syllabus line each get a question before their reveal (vector total, growth factor, counter), which the Learning design's "predict first" asks for; the multipop stack's question is Prove it 3. If the release review reads the limit as total, step 9's question can become a plain reveal without changing the storyboard.
2. **"Banker's view" attribution.** CHAPTER.md's scope names "banker's view" for accounting "(to verify the attribution to Tarjan 1985)". No opened source makes that attribution, and Tarjan 1985 could not be opened (SOURCES.md), so the topic attributes the name to no one: the Deep dive mentions the names only as the ones Chapter 13 "Amortization under persistence" uses, and the reel uses Erickson's and CMU's words (accounting, taxation, bank, coins).
3. **CLRS** is not opened and is cited only as framing; no chapter number is claimed for it (CHAPTER.md "to verify" left unverified, so unused).
4. **Visual idea, kept with one addition:** the spikes of 2, 3, 5, 9 in cherry, coins on cells between resizes paying each spike exactly, and the dashed caramel line at 3 that the running total never crosses are steps 3, 6 and 7. The coins pay each spike's copies exactly; its one write is paid by that append's own charge, and one spare coin from the first append stays in the bank (shown in step 7, explained in the Deep dive).

## Changes after final

