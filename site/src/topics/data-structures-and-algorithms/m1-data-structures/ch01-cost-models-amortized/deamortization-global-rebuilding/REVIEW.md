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
