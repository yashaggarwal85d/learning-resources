# REVIEW: Deamortization and global rebuilding (`dsa.deamortization-global-rebuilding`)

## Content review (Opus, 2026-10-12)

The reviewer wrote none of this topic. Files were read once, in this order. First the previous topic on `origin/topic/dsa.potential-method`: its reel step titles, registry entry (bridge and handoff), Deep dive headings and Prerequisites. Then this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, its registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, `OUTLINE.md` and `EXPERT-BLIND.md`. Then `CHAPTER.md` entry #7 with the chapter's shared notation and visual language, and the next syllabus line ("External-memory (I/O) model", §1.3). `examples.py` was run, its assertions all hold, and the last line prints `ok`. Every number in the reel captions was checked against its assertions. The Galperin and Rivest potential argument was re-read in `sources/galperin-rivest.txt` (p. 168–169).

**Counts:** 1 major, 18 minor.

Overall: the numbers are right and asserted, the topic is honest about the syllabus's "scapegoat-style partial rebuilds" being amortized, and the Deep dive goes well past the plan's depth. Most findings below are about wording and the primer. The major one is a proof step shown on screen that does not add up.

### Flow

1. **The syllabus line calls scapegoat partial rebuilds a way of making bounds worst-case, and the topic correctly says they are not.** (minor)
   - **Status:** Fixed. Wording note logged in `syllabus/review-notes/dsa.md` (no reorder); `coverage.json` clause "scapegoat-style partial rebuilds)" carries a `note` saying the topic teaches it as amortized on purpose.
   - **Where:** the syllabus line (`syllabus/data-structures-and-algorithms.md` l. 46: "turning amortized bounds into worst-case ones (incremental copying, scapegoat-style partial rebuilds)"). In the topic: step 15 "Partial rebuilds are still amortized" and Deep dive "Spreading a partial rebuild out".
   - **What:** read literally, the syllabus offers scapegoat rebuilds as a deamortization technique. The topic teaches the opposite (correctly). It then offers a worst-case version only as an unsourced sketch ("No opened source gives a worst-case scapegoat tree"). A learner who compares the syllabus with the reel sees a contradiction.
   - **Evidence:** Galperin and Rivest, Theorem 5.2 (amortized O(log n) INSERT). EXPERT-BLIND item 9. FACT-CHECK #46.
   - **Fix:** log a wording note in `syllabus/review-notes/dsa.md`, e.g. "(incremental copying, Overmars's background rebuild; and scapegoat-style partial rebuilds, which stay amortized)". Only the wording changes, so no reorder is needed. In `coverage.json`, give the clause "scapegoat-style partial rebuilds" a one-line note saying the topic teaches it as amortized, on purpose.

2. **Binary search trees are a prerequisite that the syllabus teaches later (Ch.4), and the reel uses more of them than the primer covers.** (minor)
   - **Status:** Fixed. Prerequisites §03 retitled "search, insert, delete", with one sentence each on the in-order walk and delete by successor, and the check-yourself now asks for the walk. The Ch.4 dependency is logged in `syllabus/review-notes/dsa.md`.
   - **Where:** registry `declared: ['bst-basics', …]`; `prerequisites.mdx` §03 "Binary search trees: search and insert"; reel steps 11–15.
   - **What:** the declaration is the plan's accepted mechanism (CHAPTER.md #7 and its release note 4: scapegoat trees have no other home). But the reel also uses things that §03 does not cover. Step 13 uses the **in-order walk** ("walk its 6 nodes in order"). Step 14 uses **BST delete** ("Deletes never push a node deeper"; a delete by successor swap is what keeps that true). Steps 12–13 use **subtree size** and depth.
   - **Evidence:** `prerequisites.mdx` l. 52–56 covers search and insert only. The syllabus line for Ch.4 "BST operations and rotations" (l. 95) is where delete (successor swap) and in-order traversal live.
   - **Fix:** retitle §03 "Binary search trees: search, insert, delete" and add one sentence each: an in-order walk visits keys in sorted order; delete replaces a two-child node by its successor, so no node gets deeper. The check-yourself could add "in-order walk of that tree? (3, 4, 5, 8)". Also log in `syllabus/review-notes/dsa.md` that §1.2 depends on the Ch.4 refresher (release note 4 already suggests a Ch.4 home for scapegoat trees).

3. **α means the load factor in the previous reel and the balance parameter here, with nothing said about the switch.** (minor)
   - **Status:** Fixed. Step 11 caption and narration, and the Basics alpha bullet, say alpha here is a balance parameter, not the last reel's load factor. `load-factor` stays in `uses` because the topic now names it to make that contrast. The CHAPTER.md shared-notation line was not added (CHAPTER.md is out of scope); it is logged in `syllabus/review-notes/dsa.md` for the seam check.
   - **Where:** step 11 caption "Fix α strictly between ½ and 1, here 2/3", then steps 12, 14 and the Deep dive. The previous reel's steps 10–11 ("Write α = n/cap, the load factor …"). CHAPTER.md "Shared notation": "load factor α = n / cap (topic 6)". This topic's registry `uses` includes `load-factor`.
   - **What:** a learner who has just used α = n/cap for a whole reel now hears "alpha, two thirds" for something else. The chapter reserves α for the load factor and α(n) for inverse Ackermann; this third meaning is not flagged. Separately, `load-factor` is listed in `uses`, but the topic never uses the load factor (grep finds "load factor" in none of its files).
   - **Fix:** add one clause to step 11's caption and narration: "α here is a balance parameter, not the last reel's load factor". Add the same note to the Basics bullet. Either drop `load-factor` from `uses` or note why it is kept. Add a line to CHAPTER.md's shared notation for the release seam check.

4. **p50 and p99.9 appear on screen in step 2 but are defined only in step 3.** (minor)
   - **Status:** Fixed. p50 and p99.9 are defined in step 2 (caption and narration); step 3 now opens on "Per append, the tail is 1 write".
   - **Where:** step 2: the `AppendP99` landscape headers p50, p99.9 and max, and the explain "p50, p99, p99.9 and even p99.99 are all 1 write". Step 3's caption opens "p50 is the median; p99, …; p99.9, …".
   - **What:** step 3 defines terms the learner has already been asked to read, and repeats step 2's p99 definition. The Basics bullet covers them, so this is order rather than a missing definition.
   - **Fix:** move "p50 is the median; p99.9, only 1 in 1,000 exceed it" into step 2's body after the p99 sentence. Open step 3 directly on "Per append, the tail is 1 write. Per request, wait included, …".

5. **The captions of steps 9 and 11 change structure without a bridge; only the narration has one.** (minor)
   - **Status:** Fixed. Step 9 caption opens with "A second structure, apart from growing arrays" and ends "At 1,048,576 keys, one delete still copies 524,288"; step 11 opens with "Now a tree where only a part goes bad".
   - **Where:** step 9 narration opens "Now a second structure, to see the idea apart from arrays that grow"; step 11 narration opens "Now a tree where only a part goes bad". Neither sentence is in the `body`.
   - **What:** read without sound, step 8 (the vector's costs) jumps straight to "Global rebuilding: … A sorted vector deletes by leaving a tombstone", and step 10 (background rebuild) jumps to "A scapegoat tree is a plain binary search tree". Step 9 also ends with "one delete still copies half a million keys" without saying at what size; the scene says it (1,048,576 keys).
   - **Fix:** start step 9's caption with "A second structure, apart from growing arrays:", and end it with "…at 1,048,576 keys, one delete still copies 524,288". Start step 11's with "Now a tree where only a part goes bad:" (trim elsewhere to stay within 55 words).

### Basics

6. **"Fan-out" is used as a headline term but is not in Basics.** (minor)
   - **Status:** Fixed. New Basics bullet "Fan-out".
   - **Where:** step 4 title and caption "Fan-out multiplies the tail"; Q3 explain "a fan-out"; Deep dive.
   - **What:** the term is only implied by "a request that waits for 100 of them". It has no Basics entry, and nothing in the declared or earlier concepts covers it.
   - **Fix:** add a bullet such as "**Fan-out**: one request split across many servers, which finishes only when the slowest answers. *Where you meet it:* a search that asks 100 index shards at once."

7. **"Tombstone" appears only in parentheses inside another bullet.** (minor)
   - **Status:** Fixed. New Basics bullet "Tombstone"; the parenthesis is removed from the Global rebuilding bullet.
   - **Where:** the Basics "Global rebuilding" bullet: "(marks left by deletes)". Used in steps 9 and 10, and throughout the Deep dive.
   - **What:** this is a core term of two steps and it gets no definition of its own. The parenthesis also does not say that the key stays in place, which is what keeps a binary search working (Deep dive l. 65).
   - **Fix:** give it its own bullet: "**Tombstone**: a deleted key left in its slot with a mark, so lookups skip it and the order is kept. *Where you meet it:* a sorted array that deletes without shifting."

8. **The Basics section is at its word limit (391 of 400 words, 11 bullets), so findings 6 and 7 cannot fit unless something is cut.** (minor)
   - **Status:** Fixed. "Worst-case versus amortized bound" cut, "Tail latency" folded into the Percentile bullet, scapegoat bullet shortened: 11 bullets, 383 words (under 400).
   - **Where:** `prerequisites.mdx` l. 9–20.
   - **What:** the scapegoat and α bullets are long. "Tail latency" and "Percentile" overlap. "Worst-case versus amortized bound" restates topic 5, which is a Before-this prerequisite (§01).
   - **Fix:** cut "Worst-case versus amortized bound" (§01 covers it), or shorten it to one line. Fold "Tail latency" into the Percentile bullet. That frees about 60 words for fan-out and tombstone and keeps the section under 400 words with at most 12 bullets.

9. **The Percentile bullet contradicts itself on "at or under" and overstates its example.** (minor)
   - **Status:** Fixed. Percentile bullet now says "at or under" and "at most 1 request in 100 is slower".
   - **Where:** Basics bullet 1: "the value that a given share … stay at or under; p99 is the cost 99 of every 100 stay under. *Where you meet it:* 'p99 is 120 ms' means 1 request in 100 is slower."
   - **What:** "stay under" conflicts with the nearest-rank definition the topic uses (at or under; §04 and the Deep dive). With nearest rank, *at most* 1 in 100 is slower, not exactly 1. On the reel's own data the append p99 is 1 while 20 appends in a million (0.002%) are slower.
   - **Fix:** "p99 is the cost that 99 of every 100 stay at or under. *Where you meet it:* 'p99 is 120 ms' means at most 1 request in 100 is slower."

10. **Prerequisites §01's check answer reads as 21.** (minor)
   - **Status:** Fixed. Answer now reads "20. The first append only allocates, and copies nothing."
    - **Where:** `prerequisites.mdx` l. 30: "how many of a million appends to the doubling vector copy anything? (Answer: 20, plus the first append, which only allocates.)"
    - **What:** "20, plus the first append" sounds like 21, but the first append copies nothing.
    - **Fix:** "(Answer: 20. The first append only allocates, and copies nothing.)"

### Gap hunt

11. **An expert-list item is mapped to the wrong syllabus quote.** (minor)
   - **Status:** Fixed. Quote changed to "doubling with amortized cost vs incremental migration across two tables".
    - **Where:** `coverage.json` expert item "Not every production table deamortizes" → topic "Resizing and incremental rehashing", quote "hash tables under memory pressure".
    - **What:** that clause is about memory pressure. The clause that carries the point (amortized all-at-once doubling against incremental migration) is the first half of the same line.
    - **Evidence:** syllabus l. 82: "doubling with amortized cost vs incremental migration across two tables (Redis `dict`) to bound per-operation latency; hash tables under memory pressure."
    - **Fix:** change the quote to "doubling with amortized cost vs incremental migration across two tables".

12. **The queue built from two stacks is marked "not deamortization", but its worst-case form is the textbook deamortization.** (minor)
   - **Status:** Fixed. Out-reason reworded; the item also points to the Deep dive "Deamortizing as a recipe", which gained a sentence on the two-stack queue becoming the real-time queue (Ch.13; Okasaki ch. 5.5).
    - **Where:** `coverage.json`, source Erickson L9, item "Exercises …": "out: queues from two stacks … are further amortized-analysis exercises, not deamortization". Expert item 7 "Real-time queue: the textbook deamortization" → Ch.13. Deep dive "The frontier" l. 137 names "Okasaki's real-time structures" in one clause.
    - **What:** the exercise is amortized, but the out-reason is wrong as a statement about the structure: the Hood–Melville real-time queue is that same queue deamortized (EXPERT-BLIND item 7). Ch.13 owning the mechanics is fine. But a learner of this topic should hear that the most common example exists and where it lives, ideally in the recipe, where it is a second instance alongside Ehrlich's counter.
    - **Fix:** reword the out-reason to "the amortized two-stack queue is an exercise; its deamortized form, the real-time queue, is taught in Ch.13 'Amortization under persistence'". Add one sentence to "Deamortizing as a recipe": "The two-stack queue's reversal, done a step per operation, is the real-time queue (Ch.13, Goes deeper later)". It can cite Okasaki ch.5.5, already a source, which credits global rebuilding for real-time queues.

13. **The background-rebuild step gives its two design constants (start at ¼, 8 units per delete) with no reason.** (minor)
   - **Status:** Fixed. Step 10 caption and narration give the reason (8 slots a delete finish the copy before the old one is half tombstones, the vector's deadline again); "Then the new copy takes over" trimmed.
    - **Where:** step 10 caption and narration; the scene header "start at a quarter · 8 slots of work per delete".
    - **What:** step 7 taught the deadline argument for the vector ("Does the copy finish in time?"), but step 10 does not apply it, so its numbers look arbitrary. A learner cannot tell whether 8 depends on the size (it does not) or why a quarter. The Deep dive has the proof (8d ≥ S + d once d ≥ S/7, so at most 11S/28 < ½ tombstones), and More questions 3 asks it.
    - **Fix:** add one clause: "8 units a delete finish the copy within S/7 deletes, before the old copy reaches half tombstones", or "the same deadline as the vector: finish before the old copy is half tombstones". Trim "Then the new copy takes over" from the narration to make room.

14. **The partial-rebuild sketch for the syllabus's own example has no source.** (minor)
   - **Status:** Fixed (no content change, as the review said). SOURCES.md notes that Overmars's chapters on partial and local rebuilding are to be checked when someone can open them.
    - **Where:** Deep dive "Spreading a partial rebuild out".
    - **What:** this is the only place where the syllabus clause "scapegoat-style partial rebuilds" meets "worst-case". It is honestly labelled as the recipe applied, without a source. A quick search found nothing better (Andersson's partial-rebuilding papers are amortized as far as their abstracts say). Overmars's book (LNCS 156), named but not opened, is the likeliest source for a deamortized partial or local rebuilding.
    - **Fix:** keep the label. Add to SOURCES.md's "not opened" list a note that Overmars ch. on partial/local rebuilding should be checked when someone can open it. No content change is needed.

### Expert reader

15. **"Paid by potential: |left − right| at 87 was 5" does not pay for the rebuild that is shown, because the constant factor is missing.** (major)
   - **Status:** Fixed. Honest scaled potential (Galperin and Rivest, p. 168-169): step 13 caption and narration say c times the difference for a constant c, O(1) added at each of O(log n) ancestors, Theta(size) at an unbalanced node. The `Rebuild` scene shows "Phi at 87: 3 x 5 = 15" and "c x 5 = 15 (c = 3) >= 6 writes + 6 climb"; the Deep dive Analysis and the outcome bullet carry the same constant, with the bound 3 x delta > s + 3 for alpha = 2/3. Asserted in `examples.py` (size 6, delta 5, 15 >= 12, delta > s/3 + 1).
    - **Where:** step 13 caption ("Each node holds |left size − right size| of potential (0 below 2): an unbalanced node holds Θ(its size). So inserts cost O(log n) amortized"). The `Rebuild` scene's gauge "Φ at 87: 5 → 0" and line "paid by potential: |left − right| at 87 was 5". The narration. Deep dive "Analysis".
    - **What:** the screen sets a potential of 5 against a rebuild that writes 6 nodes (examples.py: `last_rebuild == 6`). The climb that counts subtree sizes is another Θ(6). The proof as drawn does not add up, and a sceptical reader sees 5 < 6 at once. Galperin and Rivest do not claim Δ alone pays. They scale it: "by increasing their cost by only a constant factor, the insertion operations … can pay for the increases in potential", and the potential of an unbalanced node is Θ(size). For α = 2/3, an unbalanced node of size s has Δ > s/3 + 1, so a factor of about 3 per unit of work is needed. The caption also skips the other half of the argument: why an insert adds only O(log n) potential (each of the O(log n) ancestors on the path gains Δ ≤ 2).
    - **Evidence:** `sources/galperin-rivest.txt` l. 560–590 (p. 168–169). `examples.py` l. 937–942.
    - **Fix:** caption: "Each node holds c·|left size − right size| of potential (0 below 2), for a constant c. An insert adds O(1) at each of its O(log n) ancestors. An unbalanced node holds Θ(its size), enough to pay the climb and the rebuild. So inserts cost O(log n) amortized." Scene: "paid by potential: c × 5, with c = 3 here 15 ≥ 6 writes + the climb" (or drop the number and say "Θ(size of 87's subtree)"). Narration and the Deep dive's "Analysis" bullet need the same constant.

16. **"Both buffers stay alive" reads as a cost that plain doubling does not have.** (minor)
   - **Status:** Fixed. Step 8 caption, `Costs` scene row and narration say it is the same 12 MiB peak as plain doubling, held for 262,144 appends instead of one. Asserted in `examples.py` (old cap + new cap = 1,572,864).
    - **Where:** step 8 caption "Both buffers stay alive while the copy runs: 12 MiB for 262,144 appends at the last resize". The `Costs` scene row 1. Narration step 8.
    - **What:** plain doubling also needs both buffers, 3c slots (the same 12 MiB), during its copy. The difference is how long they are held, not the peak. The Deep dive says so (l. 46: "The plain vector also holds both while it copies, but only during that one append"), but the reel does not. A senior reader will object that the peak memory is unchanged.
    - **Fix:** "Both buffers stay alive while the copy runs: the same 12 MiB peak as plain doubling, but held for 262,144 appends instead of one."

17. **"Same total work" conflicts with "every read pays a comparison" in the same step.** (minor)
   - **Status:** Fixed. "Same total writes" in steps 8 and 16 (caption and narration) and in the Deep dive outcome line.
    - **Where:** step 8 caption ("Same total work, a different bill. … Every read pays a comparison"). Step 16 caption ("Same total work; the median rose"). Narration steps 8 and 16. Q3 and the Deep dive correctly say "same total writes".
    - **What:** the topic's own unit is element writes. The extra comparison per read, and the extra loop per append, are work the model leaves out. Saying "work" makes the step contradict itself.
    - **Fix:** "Same total writes, a different bill" (step 8) and "Same total writes" (step 16), in both caption and narration.

18. **Some narration is hard to follow by ear, and two spoken lines do not match the screen.** (minor)
   - **Status:** Fixed. Narration rewritten as proposed for steps 1, 2, 5, 15, 17 and 19 (and step 8's six-digit count now "about a quarter of a million"). Longest line 41 words; total 1,773 words.
    - **Where and what:**
      - Step 1, line 6: two six-digit numbers in one sentence ("Append five hundred twenty four thousand, two hundred eighty nine copies five hundred twenty four thousand, two hundred eighty eight keys"). Step 14's last line (32 words, two six-digit numbers). Step 15, line 4. Step 17's answer line 2 (40 words, two numbers of six and seven digits). Step 19's answer (a ten-digit and a nine-digit number). The OUTLINE's rule is "big exact numbers are said where the exact value is the point, otherwise 'about'". In step 19 (2,073,741,823 and 536,870,913) and step 15 (900,961) the exact value is not the point.
      - Step 2, line 3: "The largest copies five hundred twenty four thousand keys" says an inexact value as if it were exact (the screen shows 524,288).
      - Step 5, line 5: "drains by two every time, from eight to zero" holds only on appends 9–12.
    - **Fix:** step 1: "The append that finds it full, number five hundred twenty four thousand, two hundred eighty nine, copies every key before it." Step 15: "One insert, near the nine hundred thousandth, rebuilds about three quarters of a million nodes." Step 19: "Both vectors write about two point one billion elements … no request waits behind the one append that writes over half a billion." Step 17: split the line in two at "appends." Step 2: "about five hundred twenty four thousand". Step 5: "drains by two on each of appends nine to twelve". All lines are already under 50 words; these changes are for listening, not the limit.

19. **Small precision slips on screen and in the Deep dive.** (minor)
   - **Status:** Fixed. `Installments` aria-label "bars of 1, 2 or 3"; Prove it 3's correct option shortened; Deep dive "The frontier" now says "this topic did not check whether it has been settled since".
    - **Where and what:**
      - `Installments` aria-label: "With 2 moves per append: bars of 1 or 3". Append 2 costs 2 (examples.py l. 193: `[1, 2, 3, 1, 3, …]`). Write "bars of 1, 2 or 3".
      - Prove it 3: the correct option is the only long, qualified one ("No: same total writes, slower reads, buffers held longer; only the tail improves, and nothing waits on it"). The length gives it away. Shorten it to "No: same total writes, and nothing waits on the tail", or lengthen one distractor to match.
      - Deep dive "The frontier", l. 137: "it has not been checked since" reads as a claim about the field. Write: "this topic did not check whether it has been settled since".
    - **Fix:** as given for each.

### Checked and fine

- The bridge from the previous topic's handoff ("spreads that copy out so no single operation spikes") into step 1's "The last reel proved append O(1) amortized" is continuous. Step 5's "the last reel's Φ = 8" reuses the gauge.
- The handoff seam into the next syllabus topic ("External-memory (I/O) model") is planted in step 16's last sentence.
- Every caption number is asserted in `examples.py`, and the scene data (`SG_SPIKES`) is checked against the simulation. The numbers checked were: 20 resizes; mean 2.05; p99.99 = 1; 131,072; 349,515 (35%); p99 494,289; p99.9 521,289; 63% and 18%; 31 writes; 12 MiB and 24 MiB; 524,287 appends at cost 3; costs 1, 1, 1, 7, 8, 4 and ≤ 10; 39%; h(9) = 5; shares 1/2, 2/3, 3/5, 5/6; height 6 → 4; 333,334 → 666,666; 28.24, p99 246, 751,332 and 34; 2,073,741,823 and 536,870,913.
- Dean and Barroso's figures are stated as their hypothetical (10 ms, 1 s at p99, 63%; 2,000 servers at 1 in 10,000 → about 18%), and Table 1 as the measured one.
- The incremental-vector rule (k ≤ i < m, writes included), the 1/(g − 1) bound and the g = 1.5 boundary agree in the reel, the Deep dive and the asserts. All narration lines are ≤ 50 words (longest: 40).
- Every other covered-elsewhere quote in `coverage.json` matches the syllabus text verbatim.

## Looks and learning review (Sonnet, 2026-10-12)

**Basis.** All 50 screenshots in `site/test-results/` (`desktop-` and `phone-` `deamortization-global-rebuilding-NN.png`, steps 1-19, plus the `-q` question frames of steps 2, 7, 12, 17, 18, 19) were viewed, judged by DESIGN.md "The looks review checks", and read against `narration.json` and the storyboard in OUTLINE.md. Step numbers are the built 19 steps. "Final frame" means the frame in the screenshot; where a screenshot looks mid-animation, that is said (finding 1).

**Verdict.** The reel looks like this site (roast background, cream and caramel mono labels, Fraunces titles, cherry only for the bad number) and most steps have a clear point: 1 (the 131,072 counter), 3 (the red request row), 4 (63% and "1 request in 5"), 5 (the strips), 11 (69 under the dashed line), 15 (the spike chart), 16 (plain against incremental). Never more than two accents in a step. Two steps need real redesign (10, 13), one phone layout collides (8), and the predict steps' answer frames are either captured too early or leave the answer off the picture (1, 5, 6). Everything else is polish.

Counts: 6 major, 13 minor, 4 nit (23 findings).

### Major

1. **Answer frames are captured mid-reveal, so the final frame of the predict steps cannot be judged.** (major)
   - **Step / size:** steps 2 (desktop), 7, 12, 17, 18, 19; both sizes unless noted.
   - **What:** step 2 desktop shows p50 and p99 revealed but p99.9 and max still blank; step 2 phone shows `524,289` in a half-faded dull red. Step 7 shows the gauges mid-drain (4 left, 6 free) and the line `in use when the copy ends: ?` gone, so the answer, 12, is on neither size. Step 17's new bar is filled about 38% (the answer is 75% of the bar, n = 1,572,864). Step 12 and 18 are discussed in 5 and 7. The reel test appears to take the answer shot a fixed time after the click, not after the reveal ends.
   - **Fix:** make the reel test wait for the answer reveal to finish (the step's final `t`) before the shot, then re-look at 2, 7, 12, 17, 18, 19 at both sizes. Until then findings 5-8 below are "as captured".
   - **Status:** **FIXED (2026-10-12).** Cause: `tests/reels.mjs` (shared, left alone) clicks the first option and screenshots 0.6 s later, while this topic's reveals (`useSinceAnswer` in `scenes.tsx`) ran 1.5 to 2.5 s. Other topics' answers are captured the same way, so the test is not wrong; the finding was real here because the final frame lacked the answer. Every predict reveal now finishes by 0.45 s after the click (steps 2, 7, 12, 17, 18, 19), and each was re-shot at both sizes: the answer is on the picture.

2. **Phone step 8: labels collide with the row pictures.** (major)
   - **Step / size:** 8, phone.
   - **What:** the title `both buffers stay alive for longer` runs into the buffer icon (its last letter `r` is overprinted by the rectangle). The row 4 sub-line `the analysis assumes the allocator is O(1)` runs through the dashed box (its `O(1)` sits on the dashes). Row 3's `(524,287 appends cost 3)` ends against the dot icon. Violates "never place a label where a line, bar or another label can reach it".
   - **Fix:** on `portrait` put each icon on the right of its own row at x >= 470 and cap the text at x 440 (shorten row 4's second line to `assumes allocation is O(1)`, row 3's to `p50: 1 → 3 (524,287 appends cost 3)`), or drop the icons on phone and keep four text rows.
   - **Status:** **FIXED.** Step 8 rebuilt: text stops at x 440, every picture sits at x >= 458 (both sizes), row texts shortened (`capacity 524,288: the same 12 MiB peak,` / `no allocator cost is counted`); no collision at either size.

3. **Step 10 (`Background`): nine labels, and which row is old and which is new is not readable.** (major)
   - **Step / size:** 10, both.
   - **What:** the frame carries `start at a quarter · 8 slots of work per delete`, `serves queries now`, `swap`, `old copy: freed`, `log`, `writes per delete`, `10`, `at any size: every delete ≤ 10 writes`, `old copy never past 39% tombstones`: more than twice the four-label limit. After the swap the top row (the new copy) is labelled `serves queries now`, which the caption has just said the old copy does; the old copy is a keyless grey ghost, so no one can see the two copies. The `log` label touches the old row's cells, and the empty log box shows nothing. The bar chart's last three-quarters are empty. The eye has no first stop.
   - **Fix:** keep the storyboard's final frame but label the two rows `new copy (serves queries after the swap)` and `old copy (freed)`, give the ghost its keys in taupe, move `log` above the box and out of the cell row, and cut `start at a quarter ...` (the caption says it) and `old copy never past 39% tombstones` (Deep dive). Stretch the bar chart to the strip's width or label the three bars `delete 3, 6, 10`... so the empty right side reads as intended. Aim for five labels.
   - **Status:** **FIXED.** Step 10 relabelled and re-laid out: `new copy: serves queries now` over the new row and `old copy: freed` over the old one (a ghost with dashed cells and taupe keys), `log` moved above its box and to the right (`log: replayed` at the end), `start at a quarter ...` and `39%` cut (the caption and the Deep dive carry them), the strip stretched to 480 units with `del 3 / 6 / 10 / 14 / 2 / 15` under the bars. Five labels plus the bar values.

4. **Step 13 (`Rebuild`): the final frame does not show what was rebuilt.** (major)
   - **Step / size:** 13, both.
   - **What:** the final frame is the rebalanced tree with every node drawn alike, so the rebuilt subtree (63 and its five nodes) is not marked. The "before" (the lopsided path 87-54-80-63-69, height 6) is gone, so `height 6 → 4` is only text. The `in order` row is six empty dashed circles that read as unfilled placeholders, not as the walk that was done. The potential gauge is a tiny empty tube at the far right with the `Φ at 87` text, and the 10-line caption carries the whole payment argument.
   - **Fix:** colour the six rebuilt nodes caramel (the only accent); put the in-order keys (51 54 63 69 80 87) in the ghost row in taupe; show `was height 6` as a taupe dotted outline of the old path or a small `6 → 4` marker beside the tree's depth lines (as step 11's grid lines). Move `paid by c × 5 = 15 ≥ 12 of work` to the one line under the tree and drop the separate tube.
   - **Status:** **FIXED.** Step 13: the six rebuilt nodes end caramel, the in-order keys are printed (taupe) in the ghost row, a depth ruler beside the tree shows the old height 6 (taupe dots) against the new 4 (caramel), the tube is gone and the payment is one line under the tree (`potential at 87: 3 × 5 = 15 ≥ 12 of work`).

5. **Step 12 (`WhichScapegoat`): the answer is not on the picture; the phone has no tree.** (major)
   - **Step / size:** 12 and its `-q`, both.
   - **What:** after the choice the desktop tree rings 63 in caramel (the climb stopped at the first ancestor), and 87 is not marked; the phone shows a six-row list `63 1 of 2 ok / 80 2 of 3 ok / 54 ... / 87 5 of 6` with only two `ok`s. Whichever the learner picked, the picture does not end on 87 flagged as the scapegoat (`5 of 6 > 2/3`), and the explanation card (below the fold on phone) carries the answer. The phone's list is also an arithmetic table, not the tree: the "climb from 69" idea is lost.
   - **Fix:** the final frame ends with 87 ringed caramel, `5 of 6 > 2/3`, and the ancestors below it dimmed with `ok` (63, 80, 54) and above it greyed (31, 22). On phone keep the list but add the tree's one-line path `69 → 63 → 80 → 54 → 87` or draw the small tree at 0.6 scale as in step 11 (it fits: step 11's phone tree is the same size).
   - **Status:** **FIXED.** Step 12: the final frame ends on 87 ringed with `5 of 6 > 2/3`, 63, 80 and 54 ringed caramel with `ok`, 31 and 22 dimmed. The phone list gains `never reached` rows and the climb path `69 → 63 → 80 → 54 → 87` (a list with the path, not a scaled tree).

6. **Step 19 (Q3): the answer frame is two equal unlabelled bars.** (major)
   - **Step / size:** 19, both.
   - **What:** the storyboard promised `2,073,741,823 writes` under each bar and `largest append: 536,870,913 vs 3, and nothing waits on it`. The screenshot has neither: two bars filled to the same 72% of an unlabelled track. The picture says "equal" but not equal what, and does not carry the lesson's other half (the tail gain is real but worthless in a batch). It is also the reel's last picture.
   - **Fix:** add the two numbers at the bar ends and the one latte line from the storyboard; if the capture is early (finding 1) re-shoot first.
   - **Status:** **FIXED.** Step 19: the answer frame carries `2,073,741,823 writes` under each bar and the latte line `largest append: 536,870,913 vs 3, and nothing waits on it` (both sizes); the miss was the capture timing (finding 1), now re-shot.

### Minor

7. **Step 18 (Q2): the final frame shows only the bug, not the fix.** (minor)
   - **Size:** both. The storyboard's caramel arrow to old slot 5 (key 6) and `fix: k ≤ i < m → old` is absent (or not yet shown, finding 1). On phone the explanation that holds the rule is under the transport bar.
   - **Fix:** ring old key 6 in caramel and add `fix: old if k ≤ i < m`, so the picture ends on the right rule.
   - **Status:** **FIXED.** Step 18: the final frame shows the caramel ring on old key 6 with `old[5] = key 6` and `fix: k ≤ i < m → old` (desktop) / `fix: old[5] = key 6` (phone), after the reveal timing fix.

8. **Step 17 (Q1): the answer reveal lacks the storyboard's last line.** (minor)
   - **Size:** both. `3,145,728 slots, 24 MiB, until n = 1,572,864` is missing, and the new bar's fill (about 38%) matches nothing on screen (it should reach 75% = 1,572,864 of 2,097,152, or 50% for the moved keys, and say which).
   - **Fix:** fill to 75% with a taupe tick at 50% labelled `old keys moved`, add the taupe line.
   - **Status:** **FIXED.** Step 17: the new bar fills to 75% (n = 1,572,864 of 2,097,152, asserted in `examples.py`), a taupe tick at 50% is labelled `old keys moved`, and the line `3,145,728 slots, 24 MiB, until n = 1,572,864` is shown (two lines on phone).

9. **Step 6: the rings put `get(5)` on the cell labelled 6, with no index shown.** (minor)
   - **Size:** both. The rings sit on index 1, 5, 9 whose cells read 2, 6, 10 (key = index + 1); the three read lines have no colour link to the rings. `n` and `m`, which the caption and narration use ("slot n", "i below m"), are not on the picture. On phone the code panel is gone, so `k ≤ i < m` appears only in the caption, clamped behind `MORE`.
   - **Fix:** put the index under each slot in taupe 13 (0..7 and 0..15, at the ring cells only if crowded) or write `get(5) → old (key 6)`; add `n = 10`, `m = 8` beside the row labels (`old · m = 8 slots`, `new · 16 slots · n = 10`); on phone add the rule as one line under the reads.
   - **Status:** **FIXED.** Step 6: row labels read `old · m = 8 slots` and `new · 16 slots · n = 10`; each read is two lines (`get(5)` / `old · key 6`) naming the key the ringed cell prints; on phone the rule `old if k ≤ i < m, else new` sits under the reads (desktop has it in the code panel).

10. **Step 5: the Φ ghost collides with its own label; the draining gauge is over before the narration reaches it.** (minor)
    - **Size:** both. The dashed top of the gauge's ghost crosses `was 8`, so the text reads `- - - was 8`. The final gauge is an empty tube whose full state is a hairline; the narration says "drains from eight to zero, by two on each of appends nine to twelve" at about 15 s, 10 s after the drain animation (about 5.6 s) finished.
    - **Fix:** move `was 8` 12 units right of the ghost line; see 17 for the timing.
   - **Status:** **FIXED.** Step 5: `was 8` moved 12 units right of the ghost line; the beats follow the narration (plain strip, gauge, appends 9 to 12 draining at 5.2 to 8.2 s, the bound at 10 s; duration 5.6 s to 11.2 s).

11. **Step 9: two scales in one frame, and crowded labels.** (minor)
    - **Size:** both. The 16-slot toy's bar `9` sits above a line reading `copies 524,288 keys`; the learner must connect `9 of 16` to `524,288 of a million` with only the caption. `writes per delete` is 38 px under `compact copy: 8 live keys` and reads as part of it. The tombstoned keys' digits are struck through and unreadable (intended, but the survivors line below needs no gap check).
    - **Fix:** put a taupe `scaled up:` divider before the million line and move `writes per delete` 20 units lower or left of the strip.
   - **Status:** **FIXED.** Step 9: a dotted divider and a taupe `scaled up:` lead the million line, `writes per delete` sits 46 units under the compact-copy line, and the beats are spread to 7.8 s.

12. **Step 8 (desktop): four rows, no focal point; icons carry no meaning.** (minor)
    - **Size:** desktop (phone: see 2). All four rows are the same weight and the pictures are 40 px taupe sketches: the eye lands nowhere. The red dot-and-arrow beside row 3 does not say "median"; row 4's box is just a dashed rectangle; `c = 524,288` uses a `c` the reel has not defined (the storyboard's `524,288` alone was clear). Rows 1 and 4 repeat their title in the second line.
    - **Fix:** make the row the lesson stresses (`the median append got slower`, the only red `3`) the largest, draw its picture as `1 → 3` on two small bars, write `capacity 524,288`, and shorten row 4's second line to `no allocator cost is counted`.
   - **Status:** **FIXED.** Step 8: row 3 (`the median append got slower`) is larger with a `1 → 3` two-bar picture (the only red `3`), `c =` is now `capacity`, row 4's second line is `no allocator cost is counted`, and the beats follow the narration (7.4 s).

13. **Step 14: `6` for writes and `5` for nodes, and a red `size` bar.** (minor)
    - **Size:** both. `size 5 < 6: rebuild all 5 nodes` sits under a bar labelled `6` writes (5 nodes + the delete: not said); the `size` bar is cherry although a shrinking tree is not the bad outcome; `writes per delete` is 20 px under the bar labels.
    - **Fix:** `6 writes = 1 delete + 5 nodes`, make the `size` bar crema and keep cherry for the spike only.
   - **Status:** **FIXED.** Step 14: `6 writes = 1 delete + 5 nodes` added, the size bar is crema (cherry only for the 6-write spike and the million line; the trigger flash is caramel), `writes per delete` has room; beats follow the narration (6.2 s).

14. **Step 18 `-q`, phone: `get(5) = ?` runs into the step kicker.** (minor)
    - **What:** the line is about 15 CSS px above `18/19 · §1.2`, tighter than any other phone frame. Also the phone strips are unlabelled, so index 5 cannot be found (see 9).
    - **Fix:** lower the drawing's height by 30 units or put `get(5) = ?` above the rows.
   - **Status:** **FIXED.** Step 18, phone: `get(5) = ?` moved to the top under the title, the drawing is shorter and the old row uses 34-unit cells that print keys 1 to 8, so index 5 can be found.

15. **Step 1: the queue is not labelled; phone caption blurred.** (minor)
    - **What:** the band of dots right of the box is the pile of requests, but nothing says so (`requests waiting` would cost one 13-unit label); the 131,072 counter carries the point, and it does. In the phone frame the caption area is a blur (the intro gate), so the step's question `Is this service fast?` cannot be read in that shot.
    - **Fix:** add `waiting` in cherry text at the band's end; confirm the blur is only the first-step gate and the shot is taken after it clears.
   - **Status:** **FIXED.** Step 1: `requests waiting` added at the queue band; beats follow the narration (9.4 s). The blurred phone caption was the first-step intro gate (the new shot is sharp).

16. **Step 12 `-q`: the question frame already shows every ratio.** (minor)
    - **What:** all five `x of y` labels (and on phone the whole table) are printed before the learner chooses, so the choice reduces to "which fraction is over 2/3", and the hard part, counting subtree sizes on the way up, is done for them. DESIGN: the question frame must not give the answer away.
    - **Fix:** show the tree with sizes hidden in the `-q` frame (a `?` at each ancestor) and print the ratios in the reveal, as the narration's "sizes are counted on the way up" suggests.
   - **Status:** **FIXED.** Step 12 `-q`: the question frame shows a `?` at each ancestor; the ratios appear only in the reveal.

17. **Pacing: every animation ends in 3.4-5.6 s, the narration runs 11-41 s.** (minor, systemic)
    - **What:** the 15 explainer steps have narration of 29-106 words (about 11-41 s at the voice's pace); the picture is finished after about 5 s and then holds. The other reels in this chapter do the same, so it is the house pattern, but here several steps narrate a process the learner can no longer watch: step 5 (the drain, said at about 15 s), 10 (scan, log and replay, said at about 20 s), 13/14 (the in-order walk, the climb), 1 (the queue, 131,072 reached at 3.8 s, narrated at about 25 s). Step 11 is the longest (106 words, about 41 s) over a static tree.
    - **Fix:** if durations can follow the narration, give steps 5, 10, 13 and 1 beats at the lines that describe them (the `narration.json` order already matches the storyboard's beats) and split step 11's narration (alpha and h(n) here; the root's two counts to step 14, where the delete rule is). If not, trim those steps' narration to what the held final frame shows.
   - **Status:** **FIXED (beats spread, narration kept).** Durations now follow the narration's order of beats: step 1 9.4 s, 3 6.8 s, 4 8.4 s, 5 11.2 s, 6 7.0 s, 8 7.4 s, 9 7.8 s, 10 10.0 s, 11 9.2 s, 13 7.2 s, 14 6.2 s, 15 8.4 s, 16 6.4 s (pure functions of `t`; the first tap still completes a step). Narration is not cut and step 11's was not split: its counts line is drawn at 2.6 s, alpha at 4.4 s, the limit at 5.6 s, the insert at 6.8 s.

18. **Captions of steps 10, 11 and 13 run 8-10 lines; on phone only three show.** (minor)
    - **What:** step 13's caption (about 78 words) holds the in-order walk, lower middle, `c·|left − right|`, the O(1) per ancestor, and the amortized conclusion. On phone the lines after `and recurse` are behind `MORE`, so the payment argument is not seen by a phone learner who does not tap it. Step 11 defines alpha, h(n) and the two counts in one paragraph.
    - **Fix:** move the potential argument's second half to the narration and Deep dive only; keep the caption to what the picture shows (see 4 for what the picture should add).
   - **Status:** **FIXED.** Captions of steps 10, 11 and 13 shortened to about 40 to 55 words; the potential argument (c·|left − right|, Θ(size), O(log n) ancestors) stays in the narration and the Deep dive ("Analysis").

19. **Phone predict steps: the explanation card starts under the transport bar.** (minor)
    - **Size:** phone, steps 2, 7, 12, 17, 18, 19. The `RIGHT`/`NOT QUITE` card is clipped at the controls on every answer frame; the learner has to scroll the caption to read it, and nothing hints that. Site-wide behaviour, not this topic's, but here the answers carry the rule (steps 7, 18).
    - **Fix:** report to the shared player (locked: note it, do not change it); in this topic keep each answer's key fact on the picture (5, 6, 7, 8 above).
   - **Status:** **NOT CHANGED (shared player, locked).** Reported: on phone the `RIGHT` / `NOT QUITE` card starts under the transport bar on every predict answer frame (`ReelPlayer.tsx`). In this topic each answer's key fact is on the picture (see 5 to 8).

### Nits

20. **Steps 2 and 3, desktop: row label crowds the column heads.** `append cost (writes)` is 33 px under `p50 p99 ...` and reads as part of the header row. Add 12 units above it. (nit)
   - **Status:** **FIXED.** Steps 2 and 3 (desktop): the column heads moved up so `append cost (writes)` sits with its own row of values.

21. **Step 15: `max 751,333` against `rebuilds 751,332 nodes`.** Correct (the insert itself is one write) but a reader sees two different numbers for one event. Write `max 751,333 = 751,332 + 1`. (nit)
   - **Status:** **FIXED.** Step 15: `max 751,333 = 751,332 + 1` added under the table.

22. **Steps 9 and 10: struck-through keys are unreadable.** The `×` and the digit overprint. A thinner `×` or taupe digits without the cross, with the cell outline dashed, would do. (nit)
   - **Status:** **FIXED.** Steps 9 and 10: tombstone cells are dashed with taupe keys and a 1-unit cross (the keys stay readable).

23. **Step 16: the `vector` and five dots at the top show nothing about incremental copying.** `queue: 0` is the point, and it reads; the strip could end with a small caramel `3` on the box. Optional. Steps 3 and 16 reuse one table frame on purpose (the bookend works). (nit)
   - **Status:** **FIXED.** Step 16: a caramel `max 3` on the vector box; beats follow the narration (6.4 s).

### Checked and fine

- Step 2, 3, 4, 15, 16: points land at a glance; numbers match the narration (494,289; 63%; 246; 751,333).
- Step 11: the 69 node under the dashed `h(9) = 5` line is the best picture in the reel; the long edge from 31 to 87 is the one odd note (an in-order x layout) and is readable.
- Q1-Q3 question frames (`?` in place of the answer) give nothing away except in 12.
- Contrast: taupe 13-unit lines on phone are small (about 9 px) but within the stated floor; nothing is clipped at the canvas edge except in 2.
