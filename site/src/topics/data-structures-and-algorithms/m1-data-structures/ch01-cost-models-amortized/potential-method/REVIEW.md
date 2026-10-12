# REVIEW: The potential method (`dsa.potential-method`)

## Content review (Opus, 2026-10-12)

Reviewer did not write any of this topic. Read in sequence: the previous topic (`dsa.aggregate-accounting-methods`: reel step titles, Deep dive headings, narration, registry entry on `origin/topic/dsa.aggregate-accounting-methods`), then this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, registry entry, `examples.py` (run: all assertions hold), `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, `OUTLINE.md`, `EXPERT-BLIND.md`, CHAPTER.md topic 6 (the contract) and topic 7 (the next bridge), syllabus line 45, QUALITY.md and DESIGN.md. Every number on screen and in the narration was recomputed by hand or checked against `examples.py`; all hold except where a finding says otherwise.

**Counts:** 3 major, 17 minor.

**`site/narration/voice.json` against `origin/main`:** the only change is eight new entries in `asr.aliases` (`slater`/`sleeter` → sleator, `tarjin` → tarjan, `ackerman` → ackermann, `fi`/`fie`/`fy` → phi, `bloom` → blum). Model, voice, sampling, takes, pauses and audio are untouched, and the aliases do not enter `clip_hash` or `take_key`, so no clip is invalidated. OK. Note: these are transcript-normalisation aliases for the checker (they accept homophone spellings), not pronunciation hints to the narrator; they are global, so `bloom` will also be normalised in the Bloom-filter topic's narration (harmless, since script and transcript are both normalised).

### Flow

1. **Shrink-at-¼ is used before it is introduced, and step 9's numbers are false under the only rule taught so far.** (major)
   - **Where:** reel step 9 "Pops drive 2n − cap negative" (`reel.tsx` l. 118, narration step 9), scene `Negative` (`scenes.tsx` l. 569); first named in a caption only at step 11 (`reel.tsx` l. 140); step 10 implies it ("cap/4 at a quarter (the next shrink's)").
   - **What:** steps 1–3 teach one rule, shrink-at-½. Step 9's caption and narration ("Now let the vector shrink, and keep the same potential … after two pops it is minus two … forty eight … fifty") silently assume shrink-at-¼. The only place that says so is the 13-unit taupe header `17 pushes, then pops (shrink-at-¼)`. The switch to the safe rule, the central fix of the topic, is never announced or motivated before it is used; its motivation arrives at steps 13–14.
   - **Evidence:** under shrink-at-½ the second pop from (17, 32) shrinks to (15, 16) and costs 16: Σc = 65, Φ = 2·15 − 16 = 14, Σĉ = 79 ≥ 65. In fact, under shrink-at-½, 2n − cap never goes negative at all (a shrink at half always lands at α ≥ ½; simulated down to n = 1, minimum Φ = 0). A learner carrying the opening rule gets the opposite of the step's lesson. `examples.py` l. 281 uses `Vector(QUARTER)`, confirming the hidden switch.
   - **Fix:** say it in step 9's caption and narration before the pops, e.g. "From here on, use the safer rule: halve only when a pop leaves the vector less than a quarter full (step 13 shows why ½ can't be rescued). Keep Φ = 2n − cap and pop…". Optionally add one sentence: under ½ this Φ stays ≥ 0 but the shrinking pop costs 30 amortized, which is step 13's point.
   - **Status:** Fixed: step 9's caption, narration and scene header now announce that from here the vector shrinks only under a quarter full (shrink-at-¼) and that a later step shows why ½ cannot be saved; the numbers (−2, 48 < 50) are unchanged and now match the stated rule.

2. **The seam's promise ("one number is what a shrinking table needs") is never paid off, and the reel contradicts it.** (major)
   - **Where:** previous reel's "Back to the problem" ("a vector that also shrinks has no key left to keep its shrink coins on") and handoff; this topic's registry bridge (`registry.ts` l. 122, "which is what a table that grows and shrinks needs"); reel steps 4–5 (`reel.tsx` l. 55, 67); Deep dive "A table that grows and shrinks" (Erickson's exercise 9) and More questions 2.
   - **What:** the learner is told twice that shrinking forces the switch from coins to one number, but no step shows why: step 4 jumps from the thrash to the binary counter (which accounting already handled), step 5 quotes Tarjan that the two views are "entirely equivalent", and the Deep dive proves a grow/shrink table "without potentials". A sceptical reader concludes the motivation is false.
   - **Evidence:** Tarjan T14 "entirely equivalent"; Erickson exercise 9 hint (E10); `index.mdx` More questions 2 does it by aggregate.
   - **Fix:** reword the bridge to "is the easiest way to handle a table that grows and shrinks", and add one sentence at step 4 or step 10 that pays off the seam: the pops below half must save for the shrink, but the popped key is gone; coins could sit on empty slots, and Φ = cap/2 − n is exactly that count, without having to say which slot holds which coin.
   - **Status:** Fixed: step 10 now says a popped key is gone so its coin cannot stay on it, and cap/2 − n counts coins on the empty slots (caption and narration); registry bridge reworded to "the easiest way to handle a table that grows and shrinks"; Deep dive adds one sentence on the same point.

3. **"Tarjan's opening stack" arrives cold.** (minor)
   - **Where:** step 6 caption (`reel.tsx` l. 78) and narration ("Tarjan's opening stack, with some pops and then a push in each operation…").
   - **What:** the learner has never seen this stack; the step's own picture is the multipop stack. A second, unexplained example in one clause adds load without adding an idea.
   - **Fix:** cut it from the reel (it is in the Deep dive), or define it in one clause: "Tarjan's paper opens with a stack whose every operation pops some keys and then pushes one; the same Φ gives at most 2m."
   - **Status:** Fixed: step 6 caption and narration define Tarjan's stack in one clause (every operation pops some keys, then pushes one).

4. **"The banker's credits" is a new term in the reels.** (minor)
   - **Where:** step 5 caption and narration.
   - **What:** the previous reel never says "banker's" (only its Deep dive does), so the learner hears Tarjan's name for something without being told it is the last reel's coins.
   - **Fix:** "…entirely equivalent to the banker's credits, the last reel's coins."
   - **Status:** Fixed: step 5 now says "the banker's credits, the last reel's coins" (caption and narration).

5. **C is never defined, and n means two things.** (minor)
   - **Where:** step 3 caption and narration ("two C plus three, divided by four. That grows with C"; "Fill with about half of n pushes first, and n operations cost theta of n squared"); Prove it 2 caption, narration and explain.
   - **What:** C (the full size before the extra push) is only shown as `C = 16` in the drawing; in the narration it is never said. In the same step n switches from the number of keys (as in Φ = 2n − cap, steps 7–12) to the number of operations; step 12 uses m for operations.
   - **Fix:** step 3: "write C for the size it was full at, sixteen here"; use m for the number of operations ("m operations cost Θ(m²)"), as step 12 and the Deep dive do.
   - **Status:** Fixed: step 3 defines C (the size it was full at, 16 here); the thrash claim now uses m for operations (reel, narration, Prove it 2, Deep dive, outcome 3).

6. **Step 2's answer skips a push.** (minor)
   - **Where:** step 2 explain (`reel.tsx` l. 32) and answer narration ("Now fifteen of sixteen slots are full, so the second push finds the vector full").
   - **What:** heard as a non sequitur: 15 of 16 is not full; the first push fills it.
   - **Fix:** "Now 15 of 16 slots are full: the first push fills it, and the second finds it full and doubles, copying 16."
   - **Status:** Fixed: step 2 explain and answer narration now say the first push fills the vector and the second finds it full.

7. **"Back to the problem" repeats the last reel's ending and overstates "nothing resizes".** (minor)
   - **Where:** step 16 caption (`reel.tsx` l. 206–207) and narration.
   - **What:** "a request waiting on it still waits" is nearly word for word the previous reel's close ("A request waiting on it, waits. That is deamortization's problem"), so two consecutive reels end on the same line. "After the one grow, nothing resizes" ignores the four grows during the fill (the 31 copies on screen include them).
   - **Fix:** "after the push that grows to 32, nothing resizes"; and end on something this reel adds, e.g. "and the bound now covers pops too, but the push that copied 16 keys is still one push of 17" (the drawing already says it).
   - **Status:** Fixed: step 16 says "after the push that grows to 32" and ends on the bound covering pops and the push that copied 16 keys still being one push of 17 (narration synced).

8. **Prerequisite panel: the only resource for stacks is a later reel.** (minor)
   - **Where:** `prerequisites.mdx` section 03.
   - **What:** "Stacks, queues and deques" is Ch.2 (labelled "Goes deeper later"); `stacks` is declared, so this passes the ledger, but a learner who needs the prerequisite has nothing to read before this reel. Same for binary numbers and logarithms (self-checks only).
   - **Fix:** add one short outside reading for stacks (or rely on the self-check and drop the forward reel from this section).
   - **Status:** Fixed: the forward-only Stacks reel link is removed from prerequisites section 03, which now relies on its self-check (no verified outside reading for stacks was available to add).

### Gap hunt

9. **Union–find's potential is misrepresented; the contract's "rank-based potential behind the α(n) bound" is missing.** (major)
   - **Where:** step 15 caption (`reel.tsx` l. 196), scene `Later` union–find card (`scenes.tsx` l. 809: `Φ: e.g. Σ √size`, `O(log log n); full bound O(α(n))`), outcome 4 (`index.mdx` l. 13), Deep dive l. 79.
   - **What:** syllabus line: "the tool behind splay trees, union–find and Fibonacci heaps"; CHAPTER.md topic 6 asks for "union–find (a rank-based potential behind the α(n) bound …)"; outcome 4 promises the learner will "recognise the potential behind … union–find when those chapters use it". The reel names no potential for the α(n) bound: the one on screen (Σ√size) proves only O(log log n), and Ch.11's line ("union by rank/size plus path compression … O(α(n)) amortized bound") will use a rank-based one the learner has never seen. Splay and Fibonacci cards show the potential that gives the headline bound; union–find's card does not.
   - **Evidence:** SOURCES L1–L3 (√Size gives log log n), L11–L12 (Section 6: rank r(p) = ⌊log Sizemax(p)⌋, summed over Ackermann levels k ≤ α(n)).
   - **Fix:** put the α(n) potential on the card in words ("Φ: built on node ranks ⌊log₂ size⌋, summed over Ackermann levels"), keep Σ√size → O(log log n) as the Deep dive's "simplest instance", and make the caption say which potential gives which bound.
   - **Status:** Fixed (limited to what SOURCES.md supports): the union–find card shows "Φ: ranks, summed over Ackermann levels" with "rank = ⌊log₂ Sizemax⌋ → O(α(n))" and "Σ √size alone → O(log log n)"; caption and narration attribute the O(α(n)) potential to Lambert et al. (2023) and say Σ√size proves only O(log log n); outcome 4 and the Deep dive say the same. The double-sum formula is not shown because the extraction garbles it (SOURCES L11–L12); the Ackermann-level sum and the rank are all that is claimed.

10. **Expert item "Φ is a proof device, not stored" is mapped but not delivered.** (minor)
    - **Where:** `coverage.json` expert item 4 → Deep dive "Choosing Φ, and what a bad one looks like" and step "Which Φ pays for doubling?".
    - **What:** neither place says that Φ exists only in the proof and the program never maintains it (a common learner misreading of "one number for the whole structure", which sounds like a counter field). The nearest text is Tarjan's "accounting device" under "Names", which is about the banker's credits.
    - **Fix:** one clause in step 4 ("Φ lives in the proof; the vector never stores it") and in the Deep dive; remap the item.
   - **Status:** Fixed: step 4 caption and narration say Φ lives in the proof and the vector never stores it; Deep dive "Choosing Φ" says the same; coverage.json expert item 4 now maps to step 4.

11. **Fibonacci-heap extract-min: the reason given is incomplete.** (minor)
    - **Where:** Deep dive l. 78 ("Extract-min is O(log n) amortized because ΔΦ ≤ rank(H′) + 1 − trees(H)"); `coverage.json` expert item 17 maps the degree lemma here.
    - **What:** the ΔΦ bound alone gives O(rank(H′)); the O(log n) needs the degree lemma (a node of degree k has at least F(k+2) descendants), which the expert list names and the Deep dive omits.
    - **Fix:** "…and rank(H′) = O(log n) by the degree lemma (size ≥ F(k+2)), proved in Ch.6".
   - **Status:** Fixed: Deep dive adds that rank(H′) = O(log n) is a degree bound proved in Ch.6 (SOURCES: the slides use rank(H) = O(log n)); the F(k+2) form is not stated because SOURCES does not quote it.

12. **The lab's "break it, predict, run" has nothing to run.** (minor)
    - **Where:** Deep dive "Build, break, measure" items 1–5.
    - **What:** `examples.py` has no parameters and prints only "all assertions hold"; "shrink at ½ and run the adversarial sequence: 35 writes per round" or "change `<` to `≤`" gives an AssertionError traceback, not a measurement. Item 3's "at the second pop below 17 keys in capacity 32" is also hard to parse.
    - **Fix:** add a small `__main__` section (or a function) that prints the per-round cost, the Φ trace and the max ĉ for a given rule, a and g; reword item 3 to "at the second pop from 17 keys in capacity 32".
   - **Status:** Fixed: examples.py gains `report()` and a `__main__` printout (writes per round and max amortized cost for ½, ¼ and "at most half"); the lab mentions it and item 3 now reads "the second pop from 17 keys in capacity 32".

13. **One Deep-dive claim has no source in the topic.** (minor)
    - **Where:** Deep dive l. 80, "The cache-oblivious model uses Sleator and Tarjan's paging result."
    - **What:** true, but no opened source supports it: Tarjan 1985 only lists "[26] Amortized efficiency of list update and paging rules" in its references; nothing in `SOURCES.md` connects it to the cache-oblivious model.
    - **Fix:** drop it here (topic 9 owns LRU simulation), or source it.
   - **Status:** Fixed: the cache-oblivious sentence is dropped from the Deep dive.

### Expert reader

14. **Step 8's gloss contradicts its own numbers.** (minor)
    - **Where:** step 8 caption (`reel.tsx` l. 107) and narration ("Phi … says how far the vector is from where a grow leaves it. Just after a grow, it is two").
    - **What:** if Φ measured the distance from where a grow leaves the vector, it would be 0 just after a grow, not 2. It is zero at exactly half full; a grow lands one key past half.
    - **Fix:** "how far past half full the vector is: 2 just after a grow (the new key counts twice), n when full."
   - **Status:** Fixed: step 8 now says "how far past half full the vector is: 2 just after a grow (the new key counts twice), n when full" (caption and narration).

15. **Deep dive: "Φ_g is zero just after a resize" is false as written.** (minor)
    - **Where:** `index.mdx` l. 35; `examples.py` l. 516.
    - **What:** just after a resize n = cap + 1 and Φ_g = g/(g − 1) (2 for g = 2, 3 for g = 1.5), and the next sentence of the same bullet says Φ ≥ 1. `examples.py` says it does not assert the claim, and its comment is cut off mid-sentence ("… not asserted here: Phi >= 1 is").
    - **Fix:** "Φ_g is zero at n = cap/g, the load a resize copies into, and cap when full"; finish the comment in `examples.py`.
   - **Status:** Fixed: Deep dive now says Φ_g is zero at n = cap/g and cap when full; examples.py asserts it and the cut-off comment is finished.

16. **"One unit is one element write; a pop costs 1" reads as a contradiction.** (minor)
    - **Where:** step 1 caption and narration.
    - **What:** a pop writes no element. CHAPTER.md's convention ("removing the element, as CLRS counts a deletion") is not given, so a careful reader sees an inconsistency in the cost model the whole reel rests on.
    - **Fix:** "One unit is one element write, and a pop counts 1, like a deletion."
   - **Status:** Fixed: step 1 now says "a pop counts 1, like a deletion" (caption and narration).

17. **Union–find "potential proofs now reach its bound" implies a recent development.** (minor)
    - **Where:** step 15 caption and narration ("…and potential proofs now reach its bound"); Deep dive l. 79, which cites only Lambert et al. 2023 for potentials.
    - **What:** a reader knows that textbook potential-function proofs of the α bound are long established. The wording, together with "Tarjan's proof … the banker's view, not a potential", suggests potentials only got there in 2023. (The topic did not open CLRS, so it cannot cite that proof, but it should not imply that none exists.)
    - **Fix:** drop "now": "potential-function proofs also reach its bound (Lambert et al. give simpler ones)".
   - **Status:** Fixed: "now" dropped; the card and Deep dive attribute potential-function proofs of the α bound to Lambert et al. and say the topic did not open a textbook proof.

18. **Spoken forms that don't read right when heard.** (minor)
    - **Where:** narration step 15 ("order alpha of n"), Prove it 2 answer ("One thousand times two C plus three", "order C per operation").
    - **What:** the chapter's spoken convention is "big O of …" (CHAPTER.md, Spoken numbers); "order" is used only here. "One thousand times two C plus three" is heard as 1,000 × 2C + 3.
    - **Fix:** "big O of alpha of n", "big O of C per operation", "a thousand rounds at two C plus three each".
   - **Status:** Fixed: narration says "big O of alpha of n", "big O of C per operation" and "a thousand rounds at two C plus three each".

19. **Tautological assertions back some on-screen numbers.** (minor)
    - **Where:** `examples.py` l. 90 (`assert [1, 19, 4, 64] and …`, always true), l. 109 (pushes 33 and pops 16 as literal arithmetic, not counted from the run), l. 401 (`F(1, 16) == F(1, 16)`), l. 457, l. 515.
    - **What:** they satisfy the "every number is asserted" check without verifying anything. The 131 bound on step 16 rests on 33 pushes and 16 pops that no simulation counts (they happen to be right).
    - **Fix:** count pushes and pops in the 49-operation run and assert 3·pushes + 2·pops == 131 from those counts; delete the always-true lines (wrong predict options are exempt anyway).
   - **Status:** Fixed: always-true assertions deleted; the 33 pushes and 16 pops are now counted from the 49-operation list and 3·pushes + 2·pops = 131 asserted from them; the 3C fill is checked by simulation at C = 1,048,576.

20. **"In production" bullet 2 is garbled.** (minor)
    - **Where:** `index.mdx` l. 115.
    - **What:** "(alternation costs 24 against 136 only when the comparison is 'at most half')" says the reverse of what is meant: alternation costs 24 under the strict rule and 136 under "at most half".
    - **Fix:** "strict alternation costs 24 over 8 operations under 'less than half' and 136 under 'at most half'; the thrash needs pop, pop, push, push."

   - **Status:** Fixed: "In production" bullet 2 now reads strict alternation costs 24 over 8 operations under "less than half" and 136 under "at most half"; the thrash needs pop, pop, push, push.
## Looks and learning review (Sonnet, 2026-10-12)

Reviewed from `site/test-results/desktop-potential-method-*.png` and `phone-potential-method-*.png` (all 19 steps, plus the question and answer states of steps 2, 7, 11, 17, 18, 19), against OUTLINE.md, narration.json, DESIGN.md ("The looks review checks") and CHAPTER.md ("One visual language"). Phone figures below are estimates from the 1170 px-wide phone shots (3x), so 1 CSS px = 3 image px.

Limit of the evidence: the answer-state shots of 2, 7, 11, 17, 18, 19 were taken while the reveal was still animating (step 2 has no `round = 35`, step 7 has two of four cards empty, step 18 has no axis, step 19 has partial strips). Their final frames are not judged here; re-shoot them after the reveal ends (about 3 s after the answer) before sign-off.

Fixes (2026-10-12): all 21 findings addressed below (19 fixed, 1 fixed in the reel with the shell part not fixed, 1 not this topic's bug). The answer states of steps 2, 7, 11, 17, 18, 19 were re-shot after the reveal ended (5 s after the answer), desktop and phone, and the other changed steps from the smoke test's shots; the smoke test passes.

Counts: 6 major, 15 minor.

1. **Step 4, desktop and phone, major: the final frame omits the counter's before-state.**
   - **What:** the picture shows only `0 1 0 0 0`, Φ = 1, `c = 4`, `ΔΦ = 1 − 3 = −2`, `ĉ = 2`. The state it came from (`0 0 1 1 1`, seven, Φ = 3) is not on screen, so `1 − 3` has no visible 3 and "flips 4 bits" has nothing to count. A paused or reduced-motion learner cannot see why c = 4. The caption also says "Increment 8 flips 4 bits", which reads as "add eight" (8 to 9 flips one bit); the narration's "add one to seven" is right.
   - **Fix:** keep a faded `00111` row above the `01000` row with a small arrow, the four flipped cells ringed in cherry, and a faded Φ = 3 tick on the gauge. Caption: "Add 1 to 7 (00111 to 01000) flips 4 bits".
   - **Status:** Fixed: step 4 now keeps a faded `00111` row (labelled 7) above the live row with an `add 1` arrow, the four flipped cells stay ringed in cherry, and the gauge keeps a dashed tick `was 3`. The caption (and OUTLINE) now read "Adding 1 to 7 (00111 to 01000) flips 4 bits"; the narration already said "add one to seven".

2. **Step 6, desktop and phone, major: the final frame shows an empty stack and an empty gauge, so "Φ = number of keys" is not visible.**
   - **What:** the sequence ends with all keys popped (OUTLINE says so), leaving an empty bin, an empty tank labelled `Φ = size`, and a strip. The one thing the step teaches (the gauge is the stack's height; a push fills it by one, a multipop drains it) is only in the motion. The top label `multipop stack, as in the last reel` is taupe and sits about 120 units above the drawing on phone, leaving a dead band.
   - **Fix:** hold the final frame at the state after the 6 pushes (6 keys, gauge 6, still showing the strip so far), or draw a ghost of the peak (6 keys, a caramel tick on the gauge at the peak, `peak Φ = 6`) before the multipops drain it. Move the header down to the drawing or drop it.
   - **Status:** Fixed: the bin and gauge keep a dashed ghost of the peak after the multipops drain them (6 keys, caramel tick, `peak Φ = 6`); the far header is dropped and the drawing moved up (h 340).

3. **Step 14, desktop and phone, major: the quantity on the picture is never named and the verdict is not the loudest thing.**
   - **What:** the lines read "after grow: 10th pop or 16th push" and "after shrink: 4th pop or 10th push" with no header saying these are operations until the next resize. The two stacked bars under each line (crema over caramel / cinnamon) are never explained, and the dots, tick marks and bars are four small shapes per line. The point (10 / 16 / 4 / 10 operations against 2 / 2) sits at the same size and weight as the labels around it. The step does not say which capacity the counts refer to.
   - **Fix:** add a latte 13 header per panel, `operations until the next resize`, and the capacity (`from n = 17 of 32`). Draw one bracket from each landing dot to its nearest threshold with the count on it, drop the double bars, and make the counts the biggest text (crema 20 for ¼, cinnamon 20 for ½, with `2` and `2`).
   - **Status:** Fixed: step 14 is redrawn. A header `operations until the next resize` and a one-line legend (filled dot after a grow, ring after a shrink) sit on top; each panel names its capacities (`grow lands at 17 of 32, shrink at 7 of 16`); each landing dot has one bracket to its nearest threshold with the count as the biggest text (10 pops, 4 pops in crema for ¼; 2 pops, 2 pushes in cinnamon for ½). The double bars and the dot-and-line labels are gone.

4. **Step 15, phone, major: on the union-find card the text runs through the sketch.**
   - **What:** `Φ: ranks, summed over Ackermann levels` extends under the forest circles, which strike through the word "levels". On desktop the gap is under 15 units. The sketch for union-find is also two unlabelled trees, so it is decoration (DESIGN: "if the picture would make sense without the concept, it is decoration").
   - **Fix:** cut the Φ line to `Φ: ranks, summed over levels` (the caption has the full wording) and move all three sketches right by about 30 units, or wrap the line. Either label the forest (`rank 2`, `rank 1`) or drop it.
   - **Status:** Fixed: the union-find line is cut to `Φ: ranks, summed over levels` (the caption carries the Ackermann wording) and sits well clear of the sketch, whose roots are now labelled with their ranks (2 and 1). The bound lines moved to the caption.

5. **Steps 2, 7, 11, 17, 18, 19 on phone, major: in the answer state the drawing shrinks to about 0.4 scale and the explanation is cut off.**
   - **What:** once the learner answers, the explanation panel grows and the drawing is squeezed. Estimated from the shots, the 13-unit labels render at about 7 px (step 7: `16 appends, doubling from empty`; step 11: `pop: 8 -> 7 keys` and `halve to 16 and copy 7: cost 8`, whose two lines nearly touch; step 2: `after the push: n = 17, capacity 32`), under the 9 px floor. In step 7 the four result cards (`Φ = n`, `ĉ₉ = 10`) are the whole answer and are about 7 px. The NOT QUITE panel is cut by the player bar after one line in steps 2, 7, 11, 17, 18, 19, so the explanation is not readable without scrolling and nothing hints that it scrolls. This is partly the shared shell, but the reels are what suffer.
   - **Fix:** in the reel, give predict steps a phone layout with `portrait` that uses fewer, larger elements (15+ units; step 7's cards stacked one per row at 15). For the shell, let the explanation scroll with a visible fade or "more" cue, or collapse the question text to one line once answered.
   - **Status:** Fixed (reel part): the six question steps have a phone layout (`portrait`) on a 360-unit canvas about 240 units tall with fewer, larger elements: step 2 two rows of 16 cells, four chips and the costs; step 7 the strip over four cards one per row at 15 units; step 11 before and after as lines with the arithmetic; step 17 the vector and the numbers; step 18 two labelled bars on a log axis; step 19 two labelled strips. Re-shot after the reveal: all text in the drawings is readable at phone size with the explanation open. Not fixed (shell): the explanation panel being cut by the player bar with no scroll cue is the shared player's, which this topic may not change.

6. **Step 1, phone, major (verify): the shot has no title, caption or "tap to continue" at all.**
   - **What:** the drawing sits at the top and the whole lower half (about y 1000 to 1790 px) is empty. Every other phone step shows the step number, title and caption there. Either the opening state hides the caption until a tap (then the first thing the learner sees is an unexplained chip row with no "problem" sentence), or the shot caught a render gap.
   - **Fix:** confirm in the app; if intended, say so in the OUTLINE; if not, fix it. Step 1 carries the whole problem ("the vector that gives memory back"), so it must not open without its sentence.
   - **Status:** Not fixed: not this topic's bug. On a fresh load at phone size (iPhone 13) step 1 shows the eyebrow, the title `Halve when half empty`, the bridge sentence, the caption with MORE, the prerequisites button and TAP TO CONTINUE under the drawing. The empty lower half in the harness shot is the shared player mid-transition after the smoke test jumps back to step 1 from the end of the reel, not this topic's code; step 1 does open with its sentence.

7. **Step 11, desktop and phone, minor: the answer frame draws a dashed line through the `Φ = 8` label and never marks the answer.**
   - **What:** the dashed "after" V crosses the text `Φ = 8` (visible as `= /8`). The after point (Φ = 1, 7 keys in 16) is not marked, so the picture shows no 8 to 1 move. `ĉ = 1` appears with no arithmetic beside it. In the question frame the learner also needs the two-piece formula and the after state (n = 7, cap = 16) and neither is on screen.
   - **Fix:** put `Φ = 8` above the dot, away from the dashed line; add a second dot at the after position with `Φ = 1` and a short arrow from the first; show `8 + 1 − 8 = 1` under the `ĉ`. In the question frame add a taupe 13 line `Φ = cap/2 − n below half`.
   - **Status:** Fixed: `Φ = 8` sits above the dot, away from the dashed line; the dot keeps a ghost at 8 with an arrow to a second dot at the after position with `Φ = 1`; `8 + 1 − 8 = 1` sits under the bars; the question frame shows the two-piece formula and the after state (`after: n = 7, cap = 16`). The three bars moved up into the open top-left of the V so the dashed V no longer crosses them.

8. **Step 9, desktop and phone, minor: two different states are on screen at once.**
   - **What:** the cells and gauge are at n = 8 of 32, Φ = −16, while the pinned label says `after pop 2: Φ = −2` and `Σĉ = 48 < Σc = 50`. At a glance the learner reads Φ = −2 and Φ = −16 as a contradiction, and the Σ line is not tied to the gauge. The caption speaks only of "after two pops".
   - **Fix:** label the pinned lines as a snapshot (`snapshot at pop 2:` in taupe, with a small tick on the gauge at −2), and make the final-state number the large one with a short line, `9 pops later: Φ = −16`.
   - **Status:** Fixed: the pinned lines are labelled `snapshot at pop 2:` with a tick on the gauge at −2, and the final state gets its own large lines `9 pops later: Φ = −16`; the gauge label stays small.

9. **Step 8, desktop and phone, minor: the dashed bound line is hidden and shows as a stray fragment.**
   - **What:** the dashed caramel line at height 3 (y 333) is drawn exactly under the tops of the caramel ĉ outlines, so only a `- -` shows above the first cell, touching the `2` label, and `ĉ = 3` floats at the right end. CHAPTER's cost strip says the bound is a dashed caramel line across the strip; steps 6 and 8 use outlines instead. The gauge's path (rise 2 per append, drop at each grow) is not in the final frame, which shows Φ = 16 beside a 100-unit gap, so the step's idea is only in the motion.
   - **Fix:** draw the dashed line across at y 333 and the outlines a few units lower or thinner, or drop the line and label the outlines `ĉ = 3`. Add small tick marks on the gauge at the peaks (2, 4, 6, 8 ... then back to 2) or a faint trail of the drops.
   - **Status:** Fixed: the dashed `ĉ = 3` line is now drawn across the strip above the outlines, a few units higher so it no longer hides, cost labels show only for costs above 3 (no label sitting on the line), and the gauge has a scale with ticks at the peaks 8 and 16 (the labels at 2 and 4 were left out, they collided on phones).

10. **Step 4, desktop and phone, minor: small and low-contrast symbols in the key formula.**
    - **What:** the subscripts in `ĉᵢ = cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁)` use Unicode subscript glyphs that render at about 6 px on phone, and `Dᵢ: the state after operation i` is taupe 13 under it. This formula is the definition the rest of the reel uses, so it is the text that must be legible. Step 5's `Φ₁₆`, `Φ₁₅` and step 8's `Φ₁₆` have the same problem.
    - **Fix:** write the formula at 20 units with SVG `tspan` subscripts at 0.75 size (or `c_i` forms), and move the `Dᵢ` legend to latte.
   - **Status:** Fixed: the key formula is drawn at 20 units with real subscripts (SVG tspans), its `D` legend is latte, and step 5's `Φ₁₆`, `ĉ₁₆` and step 8's `Φ₁₆` use the same subscripts (also `ĉ₉` on step 7 and `log₂` on step 15).

11. **Step 3, desktop and phone, minor: the step is carrying three ideas and the picture connects only one.**
    - **What:** the strip (328 against dashed 147) is clear. The `(2C + 3)/4` table and the adversary claim `Θ(m²)` (in the caption only) are separate ideas; the C = 16, 1,024, 1,048,576 rows float below with no link to the spikes. Six text blocks compete (header, dashed label, 328, dashed total, formula, three rows), over the "no more than four labels" guide.
    - **Fix:** merge `dashed line: 3 per op` and `dashed total` into one label; mark one spike with `~2C` and draw a taupe bracket from it to the table; leave the Θ(m²) for step 16 or a Deep dive.
   - **Status:** Fixed (partly): `dashed line: 3 per op` and `dashed total` are one label; one spike is marked `≈ 2C` with a dotted link down to the table header. Left as is: the Θ(m²) claim stays in the caption only (it is already not in the drawing), and no bracket was drawn, the dotted link does that job.

12. **Step 5, desktop and phone, minor: dense, and only the first two cancellations are linked.**
    - **What:** five blocks (the telescoping rows, the sum, the numeric check, the conclusion, the attribution) share the picture. Two diagonal strokes join `+Φ₁` to `−Φ₁` and `+Φ₂` to `−Φ₂`, but they run between rows, so they read as strike-throughs of the wrong cells. `Tarjan 1985: the physicist's view` is taupe and has no visual role.
    - **Fix:** strike each cancelling pair horizontally in place (a short caramel line through both faded terms, or a bracket joining the two), and drop the attribution to the caption. Hold `32 = 31 + 1 − 0` as the one numeric line.
   - **Status:** Fixed: each cancelling pair is struck out in place (a caramel line through the + term and through the matching − term, drawn left to right), the attribution line is dropped from the drawing (the caption has it), and `32 = 31 + 1 − 0` stays as the one numeric line.

13. **Step 10, desktop and phone, minor: the new idea (the left piece) looks the same as the old one.**
    - **What:** both arms of the V are the same caramel weight, and both formulas the same caramel text, so the new piece `Φ = cap/2 − n` does not stand out against the one from steps 8 and 9. The Greek α in JetBrains Mono renders like a plain `a`, so `if α < ½` reads as `if a < ½`. The left arm ends in the air at α = 0 with no value (it should reach cap/2 = 16).
    - **Fix:** draw the left arm in crema or heavier, or add a small `new` tag; add `n = 0: Φ = 16` at its end, or end it with a dot. Use `n/cap` in the drawing and say "load factor" once.
   - **Status:** Fixed: the new left arm is drawn in crema and heavier with a dot at its start labelled `Φ = 16` and a `← new` tag on its formula; the old piece is latte. The drawing writes `n/cap` (and says `load factor` once); the caption keeps α, which reads fine in the caption font.

14. **Step 12, desktop and phone, minor: the table is clean but does not point at its own conclusion.**
    - **What:** the whole ĉ column is caramel, so the maxima (3 for pushes, 2 for pops) are not distinguished from 0, 1 and −1. The footer `edge cases at capacities 0-2: ĉ ≤ 2 (Deep dive)` is a footnote about the page, not about the idea. The conclusion line (`Σc ≤ 3·pushes + 2·pops ≤ 3m`) is the same size as the labels above.
    - **Fix:** ring or bold the two maxima (the 3 in the push rows, the 2 in the pop rows) and dim the rest; remove the Deep dive footer from the drawing (it belongs in the caption); make the final line crema 17.
   - **Status:** Fixed: the two maxima (3 in the push rows, 2 in the pop row) are ringed and bold at 20; the other values are dim; the Deep dive footer is removed from the drawing; the final line is crema 17. The case labels use `n/cap` instead of α.

15. **Step 13, desktop and phone, minor: the final frame loses the movement the step is about.**
    - **What:** under shrink-at-¼ the move is "slide down the V" and under shrink-at-½ it is "climb the V", but the final frame shows only the two landing dots and a hollow ring, with no arrows or start points, and the cinnamon trail up the right arm is a faint dotted line. A still image shows two dots near the bottom and a ring at the top with no start. `a resize must slide down the V` is taupe.
    - **Fix:** keep both paths in the final frame: a caramel arrow from the 8 dot to the 1 dot (down) and a cinnamon arrow from 0 to 14 (up) with a hollow start dot, and make the taupe line crema.
   - **Status:** Fixed: the final frame keeps both moves: a caramel arrow from the Φ = 8 dot down to the Φ = 1 dot, a hollow start ring at the bottom of the V with a cinnamon arrow up to Φ = 14; the closing line is crema 15.

16. **Step 16, desktop and phone, minor: the gauge is unlabelled and the bound is words, not a line.**
    - **What:** the gauge at the right of the second strip has a tiny `Φ` and no value (it ends at 2, which is what `Σĉ = 82 = 80 + Φ (2)` needs). The chapter's dashed caramel bound line is not drawn on either strip, so "the bound now covers pops too" is text only. The step has 8 text elements.
    - **Fix:** label the gauge `Φ = 2`; draw the dashed `3 per op` line on both strips (it sits low on the ¼ strip, which is the point); make `80 writes` crema 20.
   - **Status:** Fixed: the gauge reads `Φ = 2`, the dashed `3 per op` line is drawn on both strips (low on the ¼ strip), and `80 writes` is crema 20.

17. **Step 17, phone question frame, minor: text runs into the gauge.**
    - **What:** `append 13: grow to 18, copy 12, cost 13` ends about 14 image px (5 CSS px) from the gauge, and the `Φ = 12` label sits on the same line as the text's top edge. The gauge has no zero tick, so 12 of 16 is hard to read as "twelve".
    - **Fix:** shorten to `append 13: grow to 18, copy 12` (cost 13 is in the caption) or move the line under the row at full width; add a zero tick.
   - **Status:** Fixed: the line is shortened to `append 13: grow to 18, copy 12` (cost 13 is in the caption and on the bar) and the gauge has a zero tick and label; on phones the gauge is replaced by the numbers `Φ before = 24 − 12 = 12`, `Φ after = 26 − 18 = 8`.

18. **Steps 18 and 19, desktop and phone, minor: the drawing does not use the question's names.**
    - **What:** Step 19's question says "Rule A" and "Rule B" but the drawing labels read `shrink if n < cap/2` and `shrink if n ≤ cap/2` with no A or B, and the options say "Only B (at most half)", so the learner must map them by hand. In step 18 the question frame is two empty bars and `?`, so there is nothing to estimate from (no scale yet), and the log axis appears only in the answer.
    - **Fix:** prefix the labels `A:` and `B:`; in step 18's question frame show the axis (taupe ticks) with the bars empty, so the estimate is a position on the scale.
   - **Status:** Fixed: step 19's labels read `A: shrink if n < cap/2` and `B: shrink if n ≤ cap/2` (also in the phone layout); step 18 shows its log axis with ticks in the question frame so the estimate is a position on the scale.

19. **Step 1, desktop and phone, minor: the cost model is the quietest text on the page.**
    - **What:** `unit: one element write` and `a resize also copies every key` are taupe 13 at the bottom, but the whole reel depends on them; the grow rule is taupe too. The `?` under every chip is the only prompt. The gap between the rules and the chip row is large on desktop.
    - **Fix:** make the two unit lines latte 15; keep the shrink rule as the single cinnamon element; tighten the vertical spacing.
   - **Status:** Fixed: `unit: one element write`, `a resize also copies every key` and the grow rule are latte 15; the shrink rule stays the one cinnamon element; the vertical gaps are tightened (h 350).

20. **Step 15, desktop and phone, minor: three cards each carry formula, two bound lines and a sketch.**
    - **What:** this is a teaser step, but 3 cards x 4 text lines is above "four labels"; the `Ch.4`, `Ch.6`, `Ch.11` references are the same size as the potentials. The recognisable move ("rises a little on cheap steps, falls on expensive ones") is not drawn.
    - **Fix:** cut each card to two lines (name and chapter in latte, Φ in caramel) and put the bound in the caption.
   - **Status:** Fixed: each card is two lines (name in crema with the chapter in latte, Φ in caramel) plus the sketch; the splay and Fibonacci bounds moved into the caption and the narration (words only, no digits). The idea of a quantity that rises a little on cheap steps and falls on expensive ones is carried by steps 8 to 10, not redrawn here.

21. **Step 2, phone, minor: question frame leaves a large dead band.**
    - **What:** the 32-cell row and the four chips sit at the top and `round = ?` sits about 250 image px below with a long empty gap and a rule between them; the drawing is at about 0.43 scale (cells about 9 CSS px).
    - **Fix:** on `portrait`, move `round = ?` up under the chips and enlarge the cells (draw the 32 slots in two rows of 16).
   - **Status:** Fixed: on phones step 2 draws the 32 slots as two rows of 16 with bigger cells, the four chips under them, and the live state `n = 17, capacity 32` above; no long gap and no rule between them.

Not found as problems: colour grammar holds across the reel (cinnamon only for the compared rule and g = 1.5; cherryText for bad numbers; caramel for the potential, bound and chosen rule); at most two accents per step; nothing runs into the right 64 px; steps 3, 12 and 16 look finished and read clearly at phone size; phone captions truncate to three lines with MORE as designed.
