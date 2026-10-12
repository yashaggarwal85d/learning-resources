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
