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