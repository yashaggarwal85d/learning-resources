# Reviews: Aggregate and accounting methods (`dsa.aggregate-accounting-methods`)

## Content review (ROUTINE.md section 4), 2026-10-12

- **Reviewer:** a fresh Opus agent (effort high) that wrote nothing in this topic.
- **Read, in order:** the previous topic that exists, "Asymptotic notation and case analysis" (registry entry, reel step titles, Deep dive headings and its "Amortized is neither" passage; topics 2–4 are built in parallel, so their CHAPTER.md entries stood in for them); `CHAPTER.md` (entry 5, neighbours 4 and 6, notation, visual language, lab ownership); this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, `OUTLINE.md`, `sources/expert.json`; `examples.py` (run: all assertions hold); the syllabus lines of topics 5 and 6 (and of "Stacks, queues and deques", "Dynamic arrays and growth policy" and "Amortization under persistence", which this topic points to).
- **Checked and found sound (no finding):** every number on screen against `examples.py` (16-append trace, the million-append totals, 999,980 cheap appends, banks under charges 2, 3 and 4, g = 1.5 counts, counter totals, multipop and multipush totals, additive growth); the predict questions and their distractors; the registry ledger (`uses` all introduced by topics 1–2 or declared; nothing used that sits later in the syllabus; `stacks` is declared, its own refresher being Ch.2); bridge and handoff word for word as CHAPTER.md; the wording "a third kind of promise" in the reel (topic 1's numbering kept); narration free of digits and symbols; the chapter's colour grammar in the scenes; the syllabus clauses all mapped; the expert list's placements.
- **Result:** 20 findings, 4 major. All fixed in this topic's files, except two closed with a reason (G5, E9). `npm run build`, `python3 examples.py` and `node scripts/sources.mjs check` pass after the fixes.

### Flow

1. **The first predict question comes before the rule it needs.** *(major)*
   - **Where:** step 2, "What do a million appends cost?" (caption and narration).
   - **What:** the learner is asked for the total writes of a million appends, but the growth rule (double the capacity when full) is first stated in step 3. Step 1 shows one append copying 524,288 keys and nothing more, so the question can only be answered by guessing the rule.
   - **Fix:** step 2's caption and narration now open with "When the vector is full, an append doubles its capacity and copies every key across."
   - **Status:** fixed.
2. **Neighbours are named by planning numbers the learner never sees.** *(minor)*
   - **Where:** captions of steps 1 ("Topic 4 priced…"), 5 ("Topic 1 separated…") and 10 ("Topic 10's lab"); narration of steps 1 and 5 ("Topic four", "Topic one"); Deep dive (topics 1, 6, 7 and 10, six places); Prerequisites 01 ("Topic 1 … topic 2").
   - **What:** topic numbers come from CHAPTER.md. The site shows reels in a feed and in the Prerequisites panel by title ("Before this", "Goes deeper later"), never by number, so "topic 4" points nowhere. Topic 1 itself writes "§1.2", not a number.
   - **Fix:** every one is replaced by the topic's role or title: "The lower-bounds reel", "The notation refresher", "The chapter lab", "the next topic, The potential method", "Deamortization and global rebuilding", "Measuring the memory hierarchy".
   - **Status:** fixed.
3. **Step 3 draws "3 per append" before anything has derived 3.** *(minor)*
   - **Where:** step 3, "Sixteen appends, counted in writes": the visual has a dashed caramel line at 3 and a running "3 per append: 48" counter; the caption is silent about them.
   - **What:** the line is the chapter's amortized-bound grammar, but here it arrives unexplained. The caption doesn't say what the picture shows (DESIGN.md, looks-review question).
   - **Fix:** the caption ends "Total 31, under the dashed 3 per append (48)." Steps 4 and 6 then derive the 3.
   - **Status:** fixed.
4. **"One old, full version of the vector" relies on persistence, which is not taught.** *(minor)*
   - **Where:** step 15, "When the bound breaks", caption and narration.
   - **What:** a "version" of a mutable vector means nothing to a learner who hasn't met persistent structures (Ch.13).
   - **Fix:** the caption and narration now say it concretely: "Append again and again to one saved snapshot of a full 16-key vector." Chapter 13 is still named for the general case.
   - **Status:** fixed.
5. **The Prerequisites panel renumbers topic 1's promises.** *(major)*
   - **Where:** `prerequisites.mdx` 01, the resource note for "Asymptotic notation and case analysis".
   - **What:** it said "the three kinds of promise this topic adds a fourth to". Topic 1 calls amortized "a third kind of promise" beside average-case and expected bounds, CHAPTER.md says topics 5–7 "keep that wording and don't renumber it", and this reel's step 5 is titled "A third kind of promise". So the panel contradicted the reel it introduces.
   - **Fix:** the note now reads "Bounds, cases, and the average-case and expected promises; this topic is the third kind of promise that reel points to."
   - **Status:** fixed.
6. **Prerequisites 04 (geometric series) holds resources that are not about geometric series.** *(minor)*
   - **Where:** `prerequisites.mdx` 04.
   - **What:** the topic 10 reel (the lab) and two amortization readings sat under "Geometric series", described in terms unrelated to the series ("The counter analysed three ways").
   - **Fix:** the lab reel moved to 01 (cost and the machine). The two readings stay in 04, re-described by the series each one sums: Blum sums 1 + 2 + 4 + … for the doubling array; Erickson sums n + n/2 + n/4 + … for the counter. Same URLs and titles, so the verified metadata is unchanged.
   - **Status:** fixed.

### Gap hunt

7. **The tightness of 3n is never stated.** *(minor)*
   - **Where:** the reel's "under 3n" (steps 2, 4, 16) and Deep dive "The doubling vector, both ways".
   - **What:** a sceptical reader asks whether 3 is slack. It is not: at n = 2ᵏ + 1 the total is exactly 3n − 3.
   - **Fix:** the Deep dive "Aggregate" bullet now states it (48 at n = 17, 3,145,728 at n = 2²⁰ + 1). `examples.py` asserts it for k ≤ 14 and at 2²⁰ + 1.
   - **Status:** fixed.
8. **The accounting charge for a general g was asserted, not derived.** *(minor)*
   - **Where:** Deep dive "Any growth factor g" → "Charges".
   - **What:** CHAPTER.md's outcome is to "compute the amortized copy cost of a growth factor g", and the scope gives the accounting charge 1 + g/(g − 1). The Deep dive derived only the aggregate ratio and cited an executed check for the charge. Nowhere did it say why that charge pays each resize, or why ⌈g · cap⌉ rounding doesn't break it. The fact-check's proof sketch hadn't reached the page.
   - **Fix:** the epoch argument is added. The cap′ − c appends from a resize to the next number at least cap′(g − 1)/g, and each banks g/(g − 1), so together they bank ≥ cap′, the next copy. For g = 2 this is the reel's coins. `examples.py` asserts the inequality at every resize up to 10⁶ for g = 5/4, 3/2, 2 and 3.
   - **Status:** fixed.
9. **A source item was marked covered but taught nowhere.** *(major)*
   - **Where:** `coverage.json`, Erickson item "9.2.2 Taxation (accounting) method: … the second taxation scheme (each bit charges 2^−i per increment)", mapped to steps 6 and 12 and to Deep dive "Choosing a method" and "The binary counter".
   - **What:** none of those places mentioned the second schedule (taxes collected by the data structure's parts on every operation, Erickson's "Taxation Method 2"). It is the one accounting variant in the sources where the charge sits on components rather than on steps, and this topic's "Choosing a method" bullet argues exactly that distinction.
   - **Fix:** Deep dive "The binary counter" → "Accounting" now teaches it: bit i collects 2⁻ⁱ every increment, holds exactly 1 each time it flips, and each increment pays < 2. `examples.py` checks it with exact fractions over 4,096 increments of a 12-bit counter. The mapping is now true.
   - **Status:** fixed.
10. **More questions 2 had no worked answer.** *(minor)*
    - **Where:** Deep dive "More questions", item 2 (Erickson exercise 1(c)).
    - **What:** it ended on the question "Why does the aggregate method give O(log n) and not O(1)?" with no answer. The plan's Learning design asks for "each with a worked answer". Its figure "about log₂ n + 1 ≈ 12" was also loose, and `examples.py` asserted an odd `f_total / (1024 · 10)` ratio rather than the per-operation value.
    - **Fix:** a worked answer is added. The total is n(⌊log₂ n⌋ + 1) + n − ⌊log₂ n⌋ − 1 = Θ(n log n), and no cheap operation sets the spikes up, so nothing can be prepaid. The per-operation value 12,277 / 1,024 ≈ 11.99 and the closed form are asserted.
    - **Status:** fixed.
11. **Primary and suggested sources were not opened.** *(minor)*
    - **Where:** `SOURCES.md` and the Deep dive Sources section.
    - **What:** CHAPTER.md's sources to start from include Tarjan 1985 (the primary paper), CLRS 4th ed. and MIT 6.046J's notes. The topic rests on four opened sources: Erickson, CMU 15-451, Sedgewick and Wayne, and Okasaki. Tarjan and CLRS are named only for framing or through Okasaki.
    - **Fix:** none needed for correctness. Every claim is backed by an opened source and checked by `sources.mjs check` (85 quotes, 0 problems). The coverage map has four sources item by item. Tarjan's paper is behind the SIAM paywall (the fact-check could not open it), and the Deep dive already says the names are credited through Okasaki and that CLRS was not opened.
    - **Status:** not fixed. The reason is above; the release run may add an open copy of Tarjan 1985 if one turns up.

### Expert reader

12. **Step 4's aggregate argument skipped the step that makes it a proof.** *(minor)*
    - **Where:** step 4, "Add up the whole sequence", caption and narration.
    - **What:** "each resize copying at most half as many as the next, so fewer than 2n" leaves out why the series is bounded by 2n: the last resize copies fewer than n keys, and a halving series sums to less than twice its largest term.
    - **Fix:** the caption says "the last resize copied fewer than n keys, and each earlier one half as many as the one after it, so 1 + 2 + 4 + … sums to fewer than 2n". The narration says the same in two sentences.
    - **Status:** fixed.
13. **Step 10 said the peak g/(g − 1) is "reached".** *(minor)*
    - **Where:** step 10, "Where n falls between resizes", caption and narration.
    - **What:** the bound is strict. The Deep dive, outcome 3 and FACT-CHECK correction 1 all say "approached, never reached" (largest 1.99999 and 2.99997 up to 10⁶), so the caption contradicted the Deep dive.
    - **Fix:** the caption now reads "approached just after each resize, never reached". The narration reads "You come closest to it just after a resize, and never quite reach it."
    - **Status:** fixed.
14. **The step 16 narration contradicted its caption and visual.** *(minor)*
    - **Where:** step 16, "Back to the problem".
    - **What:** the narration said the bank "held exactly enough coins for its copies". The caption and the drawing say 524,289 coins for 524,288 copies: one spare, from the first append (Deep dive "Accounting").
    - **Fix:** the narration now says "the bank held a coin for every key it copied, and one to spare".
    - **Status:** fixed.
15. **The step 1 narration rounds the key number the caption shows exactly.** *(minor)*
    - **Where:** step 1, "copies five hundred twenty four thousand keys", against the caption's 524,288.
    - **What:** spoken as a bare figure it reads as a different number from the one on screen.
    - **Fix:** "copies more than five hundred twenty four thousand keys".
    - **Status:** fixed.
16. **The stack's cost unit is never said in the caption.** *(minor)*
    - **Where:** step 13, "Multipop: each key leaves once".
    - **What:** step 1 fixed the unit as "one element write", and a pop writes nothing. Only the drawing says "unit: one key in or out", so a caption-only or narration-only learner has no unit for "one multipop can cost almost n".
    - **Fix:** the caption and narration add "one unit is one key in or out".
    - **Status:** fixed.
17. **"The bounds you get are not unique" doesn't say which bounds.** *(minor)*
    - **Where:** step 14, "Cheap operations pay for expensive ones", caption and narration.
    - **What:** the ambiguity is between the total bound and the per-operation charges. Erickson's point is that the charges (amortized costs) are not unique.
    - **Fix:** the caption now reads "The charges are a choice, not unique: any that keep the bank at zero or above prove a bound." The narration says the same.
    - **Status:** fixed.
18. **The per-call variant of the multipop cost was false as written.** *(major)*
    - **Where:** Deep dive "The multipop stack" → "Aggregate".
    - **What:** it said "If every call also cost 1, the total would be pushes + calls + keys popped ≤ 2n". That sum is bounded only by n + 2 × pushes, which reaches about 3n (n − 1 pushes and one multipop give 3n − 2). Nothing in `examples.py` checked it. The fact-check's own sentence (total ≤ n + pushes) counts a different model, where a push costs only its call.
    - **Fix:** the bullet now reads "calls + keys pushed + keys popped ≤ n + 2 × pushes ≤ 3n: the per-operation O(1) survives (charge 3 per push and 1 per pop or multipop, and the bank is again the keys on the stack)". `examples.py` asserts the bound and the bank on 1,000 seeded sequences.
    - **Status:** fixed.
19. **Step 15's premise was imprecise.** *(minor)*
    - **Where:** step 15, "When the bound breaks": "The bound needs the cheap operations first, in one history from the start state."
    - **What:** the bound holds for every sequence. What it rests on is structural: an expensive operation can only follow cheap ones that set it up, plus one history from the start state. Read literally, "needs the cheap operations first" sounds like a restriction on the order of the input.
    - **Fix:** the caption and narration now say "The bound rests on two facts: expensive operations come only after cheap ones set them up, in one history from the start state." Decrement breaks the first fact and the snapshot breaks the second.
    - **Status:** fixed.
20. **"In production" has misreadings but no incidents.** *(minor)*
    - **Where:** Deep dive "In production".
    - **What:** the plan's layer 7 asks for "incidents and post-mortems". This section lists review-time misreadings with this topic's numbers and no real incident.
    - **Fix:** none in this topic. CHAPTER.md gives real libraries' growth policies and their failures to Ch.2's "Dynamic arrays and growth policy", and latency incidents to "Deamortization and global rebuilding" (topic 7, with Dean and Barroso as its source). No opened source here reports an incident, and the topic deliberately makes no production claim.
    - **Status:** not fixed. The reason is above, and the section already says so.

## Looks and learning review (ROUTINE.md section 5), 2026-10-12

- **Reviewer:** a fresh agent that wrote nothing in this topic, judging as a demanding designer and teacher.
- **Looked at:** every step's desktop and phone screenshot in `site/test-results/` (19 steps, plus the `-q` question frames of the 7 predict steps), against `OUTLINE.md`, `narration.json`, `DESIGN.md` ("The looks review checks") and `CHAPTER.md`'s visual language.
- **Checked and found sound (no finding):** the cost strip, vector row, coins and dashed `caramel` amortized line follow the chapter grammar in every step; `cinnamon` is only g = 1.5, the alternative being compared (steps 9, 10, 18); `cherry` is only spikes and failures; at most two accents per step; the numbers on screen match the narration; steps 1, 3, 14 and 15 read at a glance; no text is under-sized or clipped on desktop. Predict steps are captured mid-reveal (the learner's answer animates in after the screenshot), so their final frames were judged from `scenes.tsx`: all carry their labels (total, tiles, tally, answer marker).
- **Result:** 14 findings, 2 major. Listed as step, size, what, fix, severity; status at the end of each.

1. **Step 5, phone: the first two cards' notes run into their pictures.** *(major)*
   - **Where:** step 5, "A third kind of promise", phone.
   - **What:** "an unusual input can cost more" and "an unlucky run can cost more" are 28-30 characters; at phone text scale they reach the bars and dots at x = 350 ("cost mor" is cut by a bar; the second touches the dots).
   - **Fix:** both notes split over two lines, like the third card's.
   - **Status:** fixed.
2. **Step 6, desktop and phone: the coins sit on top of the key numbers in the full row.** *(major)*
   - **Where:** step 6, "Coins on cells", the upper row after the keys are "spent".
   - **What:** the spent coins lift 10 units and land on the digit (1 to 8): the number and the coin are one smudge, in the step's main picture.
   - **Fix:** the lift is 4 units, so a spent coin stays below the digit.
   - **Status:** fixed.
3. **Step 6, phone: the sub-heading is too wide for the drawing.** *(minor)*
   - **Where:** step 6, "1 write · 1 coin on the new key · 1 coin on an old key" (55 characters), phone.
   - **What:** at phone text scale it runs about 100 units past the cells below it, to the right edge.
   - **Fix:** "1 write · coin on new key · coin on old key" (43 characters).
   - **Status:** fixed.
4. **Step 4, phone: "16" and "1+2+4+8 = 15" read as one line.** *(minor)*
   - **Where:** step 4, "Add up the whole sequence", the two totals under the columns.
   - **What:** the two labels sit on one baseline about 8 units apart on a phone, and the right one is wider than its column.
   - **Fix:** two big totals, 16 and 15, centred under their columns; "1+2+4+8" is a quiet taupe line beneath the 15.
   - **Status:** fixed.
5. **Step 7: the small "3" marks are unexplained.** *(minor)*
   - **Where:** step 7, "The bank never goes negative", desktop and phone.
   - **What:** four "3"s sit on the dashed line (appends 2, 3, 5, 9). They are the bank after each resize, but they look like the charge of 3 again.
   - **Fix:** they are `caramel` and a legend line says "the small 3s: the bank after each resize".
   - **Status:** fixed.
6. **Step 8: superscript tick labels fall apart.** *(minor)*
   - **Where:** step 8, "10 ⁶", "10 ⁹", "10 ¹ ²" (monospace spaces every superscript digit); on the phone "10¹²" also sits past the axis end.
   - **Fix:** the ticks read "1 million", "1 billion", "1 trillion", aligned to start, middle and end of the axis.
   - **Status:** fixed.
7. **Step 10: ticks and axis titles.** *(minor)*
   - **Where:** step 10, "Where n falls between resizes".
   - **What:** the same spaced superscripts ("2 ¹ ⁰"); "n (log scale) · copies per append" under the x-axis names the y-axis in the wrong place; the troughs 1/(g − 1) the caption talks about are not drawn.
   - **Fix:** ticks are the real values (1,024, 32,768, 1,048,576); "copies per append" heads the y-axis, the legend moves to the top right, the x-axis reads "n, appends so far (log scale)"; the peak line is labelled "peaks g/(g − 1)" and a dotted line is labelled "troughs 1/(g − 1)".
   - **Status:** fixed.
8. **Step 12: the final frame lost the carry.** *(minor)*
   - **Where:** step 12, "One coin on every 1 bit".
   - **What:** "3 resets paid by 3 coins", the step's idea, shows mid-animation and fades; the final frame (a learner who pauses at the end, or reduced motion) shows one coin on 10000 and a formula.
   - **Fix:** a quiet line at the same place stays in the final frame: "every carry is paid by the coins it resets".
   - **Status:** fixed.
9. **Step 13: the final frame is an empty box.** *(minor)*
   - **Where:** step 13, "Multipop: each key leaves once".
   - **What:** after the last multipop the stack is empty and nothing in it says why that is the point.
   - **Fix:** the empty stack carries "8 in" and "8 out" in the final frame.
   - **Status:** fixed.
10. **Step 14: the caption is the longest of the reel and the aggregate/accounting contrast is a clause.** *(minor)*
    - **Where:** step 14, "Cheap operations pay for expensive ones": 63 words (8 lines on desktop).
    - **Fix:** trimmed to about 55 words; "Aggregate when one total covers every sequence; charge per operation when operations differ". The meaning, the picture and the narration are unchanged.
    - **Status:** fixed.
11. **Step 15: the two strips have no unit.** *(minor)*
    - **Where:** step 15, "When the bound breaks".
    - **What:** the red bars are operations, but nothing says how many (8 and 10), so "40 flips, bound said 16" cannot be checked against the picture.
    - **Fix:** "8 operations" and "10 appends" under the strips.
    - **Status:** fixed.
12. **Step 16: the bank label touches the spike; the caption is the second longest.** *(minor)*
    - **Where:** step 16, "Back to the problem", both sizes.
    - **What:** "bank: 524,289 coins / for 524,288 copies" ends about 10 units from the 524,289 spike, which is as tall as the label.
    - **Fix:** the labels move 14 units left; the caption trims its last sentence (about 60 words).
    - **Status:** fixed.
13. **Step 17, phone: the answered frame shrinks the picture to about 0.4 and the badge row is unreadable.** *(minor)*
    - **Where:** step 17, "Prove it 1 of 3", phone with the explanation open.
    - **What:** 16 identical "2" badges at 7 px; the drawing (360 units tall) is scaled down to make room for the explanation; the cost bars have no label.
    - **Fix:** the badge row becomes one line, "charge 2 per append" in `caramel`; the drawing is 324 units tall (was 360); "actual cost per append" labels the bars; "append 5: −2" sits under the hanging bars instead of among them.
    - **Status:** fixed.
14. **Step 1: the headline stack is tight.** *(minor)*
    - **Where:** step 1, "both true?" and "append 524,289 / copies 524,288 keys", desktop and phone.
    - **What:** four text lines inside 80 units, the red labels 8 units from the spike.
    - **Fix:** the spike labels move down 6 and left 4 units, "both true?" up 2.
    - **Status:** fixed.

Not findings, noted for the next reviewer: the phone caption shows three lines and "MORE" by design, so the 55-65 word captions are fully read only in the expanded view; the narration carries the whole text.

**Closed:** all 14 findings fixed in `scenes.tsx` and `reel.tsx` (captions of steps 14 and 16 trimmed; `narration.json` still says the same, so no change there). `npm run build` and `node scripts/check-all.mjs --only reels --topic aggregate-accounting-methods` pass; the new screenshots of steps 4, 5, 6, 7, 10, 13 and 17 (phone) were looked at again and show the fixes. Step 13's first fix ("8 keys in / out") touched the stack's walls on a phone and was shortened to "8 in / 8 out".

## Looks and learning review, second pass, 2026-10-12

- **Reviewer:** a fresh agent that wrote nothing in this topic, judging as a demanding designer and teacher.
- **Looked at:** all 19 steps at desktop (1440 x 900) and phone (iPhone 13), plus the 7 question frames (`-q`) of the predict steps, in `site/test-results/`; read against `OUTLINE.md`, `narration.json`, `DESIGN.md` ("The looks review checks") and the final-frame code in `scenes.tsx`. Text sizes on the phone were measured from the screenshots (monospace advance 0.6 em, 3 device px per CSS px).
- **Checked and found sound (no finding):** the first pass's fixes hold in the new screenshots (step 4 totals, step 5 notes, step 6 coins, step 7 legend, step 8 ticks, step 10 axes, step 13 "8 in / 8 out", step 17 badge row). Steps 1, 5, 7, 8, 10, 15 and 16 read at a glance on both sizes; nothing is clipped or overlapping on desktop; the chapter grammar (crema keys, caramel coins and bound, cinnamon only for g = 1.5, cherry only for spikes and failures) is kept and no step uses more than two accents; every number I could see matches the narration.
- **Limit of this pass:** `tests/reels.mjs` takes each predict step's answered screenshot 600 ms after the click, before the reveal labels fade in (see finding 15). The answered frames of steps 2, 9, 11, 17, 18 and 19 were therefore judged for geometry from the screenshots and for labels from `scenes.tsx`.
- **Result:** 15 findings, 3 major, 12 minor. Listed as where, what, evidence, fix, severity.

1. **The phone's answered frame of every predict step shrinks the drawing below the minimum text size and pushes the explanation under the controls.** *(major)*
   - **Where:** steps 2, 9, 11, 17, 18, 19, phone, after answering.
   - **What:** the drawing is scaled down to make room for the answer panel; the "NOT QUITE" explanation, which is the teaching payoff of a predict step, shows two lines and is then cut off by the player's control bar.
   - **Evidence:** `phone-...-09.png`: "n ≈ last copy" is 13 characters in 173 device px, so about 7.4 px (step 9); step 2 "total element writes, 1,000,000 appends" about 7.9 px; step 17 "bank after each append" about 8.2 px; step 19 "new: multipush(k) pushes k keys in one operation" about 8.8 px. The question frames (`-q`) of the same steps measure about 10 px. DESIGN says labels are about 9.5 px on a phone and the reel test fails text under 9 px, but the test does not look at these frames.
   - **Fix:** keep the drawing at its question-frame size and let the explanation scroll under it, or cap the answered drawing height so labels stay at 9 px or more (raise the 13-unit labels in these steps to 15, which they can afford: steps 2, 9 and 17 are not full). Add a vertical-room check on the answered frame to `tests/reels.mjs`.
2. **Phone, step 1: the caption, title, bridge and "tap to continue" are missing from the screenshot.** *(major, to verify)*
   - **Where:** step 1, "One append copied half a million keys", phone.
   - **What:** below the drawing (y 950 to 1790 device px) there is nothing but the side buttons; every other phone step shows its step number, title, caption and "MORE" there. On desktop the same step shows the bridge italic, title and caption.
   - **Evidence:** `phone-aggregate-accounting-methods-01.png` against `-03.png`.
   - **Fix:** open step 1 on a phone. If the text is there and only missing from the capture, make the test wait for it (and note it here); if it is real (the longer bridge plus caption overflowing the panel), shorten the bridge on phones or let the panel scroll. The opening step is the one a learner must not lose.
3. **The dashed amortized line is crossed by spikes in four steps, so it reads as a per-operation cap that is broken.** *(major)*
   - **Where:** step 3 (worst), step 5 card 3, step 13, step 15, desktop and phone.
   - **What:** the line is "3 per append" (a charge) but the bars poking through it are single operations (5 and 9 over a line of 3). The caption of step 3 says "Total 31, under the dashed 3 per append (48)", which compares a total with a per-operation level that the picture cannot show; a learner reads "5 and 9 are over the line, so the bound is false". Step 7 draws the right picture (running totals) but it comes four steps later. Steps 13 and 15 repeat it ("2 per operation", "bound said 16" next to a 2-per-operation line, a unit mismatch).
   - **Evidence:** `desktop-...-03.png` (spikes 5 and 9 above the line), `-05.png` (miniature strip), `-13.png`, `-15.png`.
   - **Fix:** in step 3 add one quiet line under the strip, "spikes cross it; the running total never does: 31 of 48", or draw the cumulative total as a thin caramel staircase under the line; reword the step 3 caption to "every append is charged 3 (the dashed line); the total, 31, stays under 48". In steps 13 and 15 label the line "charge per operation" and keep totals in the totals.
4. **Step 3: the final frame does not show why the spikes are where they are.** *(minor)*
   - **Where:** step 3, "Sixteen appends, counted in writes", final frame.
   - **What:** the 16-cell row is full and static; capacities 1, 2, 4, 8, 16 appear only in the animation and the caption, so a paused learner cannot see that spikes 2, 3, 5, 9 are the moments the row was full.
   - **Fix:** mark the capacity boundaries on the row (taupe ticks or brackets labelled "cap 1, 2, 4, 8, 16") and tie each spike to its boundary with a thin line.
5. **Step 4: the picture proves "15 < 16" but the claim is "copies < 2n", and nothing adds up to 31.** *(minor)*
   - **Where:** step 4, "Add up the whole sequence".
   - **What:** the bracket compares the copies column with the writes column (n = 16), while the narration says "less than twice the last one" (2 x 8 = 16, which happens to equal n) and the text says "copies < 2n". The columns also never join: "31" is only in the formula, far from them (about 400 px on desktop, a void in between).
   - **Fix:** label the dashed line "2 x last copy (8) = 16"; put "16 + 15 = 31" under the two columns and move "31 < 3 · 16 = 48" next to them.
6. **Step 6: the state that is the point is the faintest thing on screen.** *(minor)*
   - **Where:** step 6, "Coins on cells", final frame.
   - **What:** "every key holds a coin" is shown by the old row at 0.25 opacity, with coins that are dark brown on dark brown; the bright new row has coins only on keys 1 and 9 and seven bare cells, which can read as "the coins got lost".
   - **Evidence:** `desktop-...-06.png`.
   - **Fix:** ghost the old row at about 0.5, keep its coins `caramel`, and add a taupe "spent" tag on the arrow between the rows ("8 coins pay the 8 copies").
7. **Step 7: more than four labels compete.** *(minor)*
   - **Where:** step 7, "The bank never goes negative".
   - **What:** writes, append i, Σ charges, bank, Σ actual cost, four "3"s, and four legend lines are on screen at once.
   - **Fix:** drop "writes" and "append i" (the legend names the axes) and merge the last two legend lines ("small 3s: the bank after each resize · lowest: 2").
8. **Step 8: the log scale makes a 1,000-fold gap look like a factor of two.** *(minor)*
   - **Where:** step 8, "Grow by a fixed amount".
   - **What:** the 1-slot bar is about 614 px, the 1,000-slot bar about 290 px, doubling about 35 px; the surprise (one thousand times, then 250,000 times) is only in the printed numbers. The first value sits under its bar, the second beside it.
   - **Fix:** a small caramel "÷ 1,000" between the two cherry bars and "÷ 250,000" to the doubling bar; put all three values in the same position.
9. **Step 9: the 2 x versus 3 x comparison is by eye.** *(minor)*
   - **Where:** step 9, "A growth factor of 1.5", both sizes.
   - **What:** the "n ≈ last copy" ruler is 160 units, but the row ends at 360 and 520, and "≈ 2 × n" and "≈ 3 × n" float at the ends with no bracket to the ruler; caramel (g = 2) and cinnamon (g = 1.5) tiles are close in hue.
   - **Fix:** a thin bracket under each row, with the ruler repeated 2 and 3 times in taupe ticks at 160-unit steps.
10. **Step 10: the dashed line at 2 does double duty and the "troughs" label sits on the wrong line.** *(minor)*
   - **Where:** step 10, "Where n falls between resizes".
   - **What:** the line at 2 is the peak of g = 2 and the trough of g = 1.5; "troughs 1/(g − 1)" is written under the dotted line at 1 only, so the g = 1.5 trough reads as unlabelled.
   - **Fix:** colour each peak and trough line by its g (caramel for 2, cinnamon for 1.5) and label them in that colour at the right: "g = 2: peak 2, trough 1", "g = 1.5: peak 3, trough 2".
11. **Step 11: the 16 x 5 grid has no row or column names, and on a phone each row is about 5 px.** *(minor)*
   - **Where:** step 11, "A binary counter, by the total", question and answered frames.
   - **What:** nothing says rows are increments or that the right column is bit 0; the totals "1 2 4 8 16" appear only after the answer. In the question frame a learner who cannot read the grid cannot reason about it.
   - **Fix:** "increment 1 … 16" down the left and "bit 4 … bit 0" over the columns, in taupe 13; make rows 14 units apart on the phone.
12. **Step 13: seven labels and an empty final stack.** *(minor)*
   - **Where:** step 13, "Multipop: each key leaves once".
   - **What:** three header lines, "8 in / 8 out", "2 per operation", two footer lines; the stack ends empty so "each key leaves once" has no picture, and the two multipops cost 4 each but push and pop look alike.
   - **Fix:** drop "multipop(k) pops min(k, size) keys" (it is in the caption); keep a faint outline of 8 keys with a coin each inside the empty stack; label the two red bars "multipop 4" and "multipop 4".
13. **Step 14: the three rows do not say the same thing.** *(minor)*
   - **Where:** step 14, "Cheap operations pay for expensive ones".
   - **What:** only row 1 says what each cheap operation pays ("2 each"); the red block is the same size for 8, 3 and 4 units; there are no coins, the object the accounting steps taught.
   - **Fix:** a caramel coin on every cheap block, the same number of coins inside each red block, and labels "2 each = 8 copies", "1 each = 3 resets", "1 each = 4 pops".
14. **Small cinnamon text is about 3.7:1 against the background.** *(minor)*
   - **Where:** step 9 "g = 1.5" (15 units); step 10 legend "g = 1.5" (13 units); step 18 "last resize: append 699,913", "copies 699,912", "÷ 1,000,000", "= 2.10 per append" (15 units).
   - **What:** `cinnamon` is `#b8612f` on `#2a1d16`, 3.7:1; DESIGN allows it for large text only.
   - **Fix:** use `caramel` or `latte` for these labels and keep cinnamon for the fills and the one 22-unit number.
15. **The reel test captures the answered frame before the reveal finishes, and step 19's bars do not tell push from pop.** *(minor)*
   - **Where:** `tests/reels.mjs` (answered screenshot after 600 ms); step 19, "Prove it 3 of 3".
   - **What:** the answers' labels fade in at 0.9 to 1.9 s (for example "1,000,000 new keys", "3n = 3,000,000", "append 5: −2", "1,000 operations, k = 1,000"), so no saved screenshot shows an answered final frame, and a reviewer must trust the code. In step 19 all ten red bars are identical, so "alternate multipush and multipop" is carried only by the stack level.
   - **Fix:** wait about 2.5 s (the longest reveal) before the answered screenshot; alternate the bar tint or add "push k" and "pop k" ticks under the bars in step 19.

**Fix status (2026-10-12, looks fixes):** `npm run build` and `node scripts/check-all.mjs --only reels --topic aggregate-accounting-methods` pass; the changed steps' new screenshots were read at desktop and phone (answered frames re-captured 3 s after the click, outside the test, to see the reveal labels).

1. **Fixed (within the topic).** Shared code is untouched, so the phone's answered frame still has a short drawing box (about 225 x 161 CSS px) and the explanation scrolls under the controls, as designed. Instead every drawing of steps 2, 9, 11, 17, 18 and 19 is shorter (viewBox heights 246 to 318 instead of 324 to 360) and its labels are 15 units or more, so the smallest label is now 9.3 to 11.4 px on the phone (measured on the answered frame, including the reveal labels): was 7.1 to 8.8. Step 11's 16 rows stay 11 units apart (the grid now has "bit 4 … bit 0" over the columns and "inc 1" / "inc 16" at the rows, finding 11). The vertical-room check on the answered frame for `tests/reels.mjs` is a shared-code change and is left for the owner of the tests.
2. **Not a bug in the step (verified).** Opened on a phone normally (and after tapping step 1's own dot) the bridge, step number, title, caption, "MORE" and "tap to continue" are all there. The saved `phone-...-01.png` is still blank below the drawing after this pass, so it is a capture artefact of `tests/reels.mjs` (it clicks step 1's dot after the touch-gesture checks, and the caption has not come back by the screenshot); not changed here (shared test). A real consequence was found and fixed: with the bridge present the step 1 drawing was shrunk to about 7 px text (the test never saw it because the caption was missing); the drawing is now 276 high with 15-unit labels (10.7 px minimum).
3. **Fixed.** Step 3 caption now reads "Every append is charged 3 (the dashed line); the total, 31, stays under 48" (`reel.tsx`; narration unchanged, it never said "dashed"); the top-right label is "charged 3 each: 48" and a line under the strip says "spikes cross the line; the total never does: 31 of 48". Step 5 card 3 labels its dashed line "dashed: charge 3 per append". Steps 13 and 15 label the line "charge: 2 per op" / "charge 2 per op" / "charge 3 per op"; the totals ("bound said 16", "bound said 30") stay separate.
4. **Fixed.** After the animation, step 3 draws dotted guides at the capacity boundaries 1, 2, 4, 8, 16 from the row down to the strip, each spike starting right after its guide, with a legend line.
5. **Fixed.** The dashed line is labelled "2 × last copy (8) = 16"; "16 + 15 = 31" and "31 < 3 · 16 = 48" sit directly under the two columns.
6. **Fixed.** The old row ghosts to 0.5 (was 0.25) and a "spent: 8 coins pay the 8 copies" tag sits between the rows (the duplicate "copy 8 keys = 8 coins" line was dropped).
7. **Fixed.** "writes" and "append i" are gone; the two legend lines are one ("small 3s: the bank after each resize · lowest: 2").
8. **Fixed.** All three values sit under their bars; "÷ 1,000 vs 1 slot" and "÷ 244,000 vs 1 slot" (500,000,500,000 / 2,048,575 = 244,070; the review's 250,000 is rounder than the number) are at the right of the second and third rows.
9. **Fixed.** A taupe ruler of one "n ≈ last copy" is repeated under each row (twice for g = 2 right away, three times for g = 1.5 only after the answer, so the question frame does not give it away); "g = 1.5" is `latte`, the "≈ 3 × n" answer is 22 units.
10. **Fixed.** The line at 2 is drawn in alternating caramel and cinnamon dashes (peak of g = 2, trough of g = 1.5), the line at 3 is cinnamon, the line at 1 caramel; the legend reads "g = 2: peak 2, trough 1" and "g = 1.5: peak 3, trough 2" next to colour swatches (the text is `latte`, finding 14), with the formulas on one taupe line.
11. **Fixed, rows kept at 11 units.** "bit 4 … bit 0" over the columns, "inc 1" and "inc 16" at the rows, "unit: one bit flip" under the title. Rows are 11, not 14, units apart: at 14 the drawing would be 336 high and the labels would drop under 9 px on the answered frame (the trade-off with finding 1).
12. **Fixed.** "multipop(k) pops min(k, size) keys" dropped; the empty stack now ends with eight faint key outlines each holding a coin, labelled "8 in · 8 out" above it; the two red bars are labelled "multipop 4".
13. **Fixed.** Every cheap block carries its coins (2, 1, 1), the red blocks hold 8, 3 and 4 coins that fly in from the blocks, and each row says "2 each = 8 copies", "1 each = 3 resets", "1 each = 4 pops".
14. **Fixed.** Step 9 "g = 1.5" and step 10 legend are `latte`, step 18's four labels are `latte` / `caramel`; cinnamon stays on fills and 20 to 22 unit numbers (step 10's 2.10 raised to 20).
15. **Half fixed.** Step 19: pushes and pops now differ (push bars full cherry with "+" under them, pop bars at 55 % with "−", legend "+ multipush(k) · − multipop(k)"). The test's 600 ms capture timing is shared code and was left alone, as asked; the reveal labels were checked in my own 3 s captures.

**Remaining for the owner of the tests:** the vertical-room check on answered frames (finding 1), the 2.5 s wait before the answered screenshot (finding 15) and the blank step 1 phone capture (finding 2).
