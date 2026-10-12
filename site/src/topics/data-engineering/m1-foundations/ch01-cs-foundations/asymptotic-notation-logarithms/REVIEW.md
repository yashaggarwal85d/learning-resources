# REVIEW: Asymptotic notation and logarithms (`de.asymptotic-notation-logarithms`)

## Content review (ROUTINE.md section 4): flow, gap hunt, expert reader

- **Reviewer:** a fresh content-review agent (Opus) that wrote nothing in this topic.
- **Date:** 2026-10-12.
- **Read, in order:**
  - The previous topic, `de.software-delivery-workflow`, on `origin/topic/de.software-delivery-workflow`. That branch has only `OUTLINE.md`, `SOURCES.md`, `FACT-CHECK.md` and `examples.sh`: no reel, registry entry or `index.mdx` yet. So its planned step titles, Deep dive headings, bridge and handoff were read from its `OUTLINE.md`.
  - `CHAPTER.md`: the chapter sections and entries 5 and 6.
  - This topic's `registry.ts` entry, `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, `OUTLINE.md`, `examples.py` and `EXPERT-LIST.md`.
  - The syllabus lines for this topic, DSA §1.1 and the next topic ("Memory hierarchy and latency numbers").
  - `QUALITY.md` and `ReelPlayer.tsx`, to see how the bridge and handoff are shown.
- **Run:**
  - `python3 examples.py` passes on Python 3.11.17 (comparisons [208032, 448963, 963153]).
  - `node scripts/sources.mjs check <topic>`: 94 quotes, 0 problems.
- **Summary:** 27 findings, 2 major and 25 minor. Both majors are drawings that contradict their own captions: step 9's sort-pass tower and step 4's race, whose log scale has no label.

Each finding gives where, what, the evidence, the fix and its severity.

### Flow

**1. Step 1 caption repeats the bridge word for word** (minor)
- **Where:** step 1 "Counting cost, in five minutes" (`reel.tsx` lines 12–13). The same happens on step 11 with the handoff.
- **What:** the learner reads the same two sentences twice in a row.
- **Evidence:**
  - `ReelPlayer.tsx` lines 305–307 already print `meta.bridge` as an italic pull-quote above step 1's caption. The body then repeats "Tests check that a change gives the right answer; they don't say how its cost grows with the data. That takes O, Θ and Ω, and logarithms in any base".
  - The end card prints `meta.handoff` (`ReelPlayer.tsx` line 586) right after step 11's caption has said it word for word.
  - The previous topic's plan avoids exactly this: its step 1 "does not repeat the bridge pull-quote, which the player shows; Git looks review finding 23".
- **Fix:** step 1 body: "Five minutes on how costs grow, and the logarithms the rest of the chapter counts with: the last of the five refreshers. All familiar? Swipe on to the memory hierarchy." Step 11: keep "Big-O counts steps as if each cost the same" and drop or shorten the "Next: …" sentence, which the end card shows. Narration can keep its own wording.
- **Status:** Fixed: step 1's body now says 'Five minutes on how costs grow… Swipe on to the memory hierarchy' and no longer repeats the bridge; step 11 drops the 'Next: …' sentence the end card shows. Narration keeps its own wording.

**2. log₂n is used for three steps before the reel says what a logarithm is** (minor)
- **Where:** steps 2–4 use log₂n; step 5 is the first to define a logarithm.
- **What:** "3n·log₂n + 8n", "Divided by n·log₂n" and the race's "n log n" all come before step 5's "A logarithm counts divisions".
- **Evidence:** the reel order. Algebra is declared and Prerequisites 01 defines a log, so this is not a ledger break, but the reel teaches logs after leaning on them.
- **Fix:** add a three-word gloss in step 2 ("log₂n, the number of halvings from n down to 1"), so step 5 picks up a word the learner has already met.
- **Status:** Fixed: step 2 glosses 'log₂n is the number of halvings from n down to 1' (caption and narration).

**3. Step 3 opens by defining Θ again** (minor)
- **Where:** step 3 "Is it also O(n²)?", body.
- **What:** "Θ(n log n) is a growth rate: bounded above and below by constant multiples of n·log₂n, from some n₀ on" repeats step 2 and delays the trap.
- **Evidence:** OUTLINE "Changes during build" item 1 says the sentence was added for the reel test, to push the option buttons below the swipe point. Its reason is layout, not teaching.
- **Fix:** keep two lines of text but make them set up the trap: "You've just shown this job is Θ(n log n). A reviewer writes 'it's O(n²)'. Is that also true?"
- **Status:** Fixed: step 3's body now reads 'You've just shown this job is Θ(n log n). A reviewer writes "it's O(n²)". Is that also true?'; narration matches.

**4. Step 8 asks for an index height without saying what fan-out means** (minor)
- **Where:** step 8 "How tall is the orders index?", body.
- **What:** B-trees are taught in topic 13, later in the syllabus. The body gives "about 400 entries" per page but never says that each entry on an inner page points to a page below. Getting from "400 per page" to "×400 per level" is left to the learner.
- **Evidence:** the body text. The explain is the first place to say "each level multiplies the reach by 400".
- **Fix:** "…about 400 entries; on an inner page each one points to a page below, so every level multiplies the reach by about 400. How many levels from root to leaf?"
- **Status:** Fixed: step 8 says each inner-page entry points to a page below, so every level multiplies the reach by about 400 (caption and narration).

**5. Step 9 states the fan-in without its reason** (minor)
- **Where:** step 9 "Sort passes are a logarithm too", caption.
- **What:** runs, merging and fan-in belong to topics 14 and 16. The caption says "can take up to 16,383 runs at once" but not why it is 16,383 rather than 16,384.
- **Evidence:** the reason (one block per input run plus one for the output) is only in the Deep dive's "The chapter's sort, exactly".
- **Fix:** add "(one block per run, one for the output)" to the caption, or say it in step 9's narration.
- **Status:** Fixed: step 9's caption and narration give the reason, 'one block per run, one for the output'.

**6. The seam with the previous topic was checked only against its plan** (minor, informational)
- **Where:** the seam with `de.software-delivery-workflow`.
- **What:** that topic isn't built yet. Against its plan the seam holds:
  - Its step 1 ends "Swipe on to the notation for how costs grow".
  - Its handoff is "the notation for how costs grow, and the logarithms the rest of the chapter counts with".
  - Its step 3 teaches unit tests, which this topic's bridge ("Tests check…") picks up.
- **Evidence:** `git show origin/topic/de.software-delivery-workflow:…/OUTLINE.md`. The branch has no `reel.tsx`, `index.mdx` or registry entry.
- **Fix:** none now. The release seam check must re-read the built topic: its real handoff, and whether its step 3 still says "unit tests".
- **Status:** Not changed: informational. Recorded in OUTLINE.md 'Progress': the previous topic is not built, so the release seam check must re-read it (its handoff, and whether its step 3 still says unit tests).

### Gap hunt

**7. "Each pass reads and writes the whole file" is marked covered, but nothing teaches it** (minor; the visual it contradicts is finding 14)
- **Where:** `coverage.json`, expert item "External merge sort pass count is a ceiling of a logarithm; passes are integers and each pass reads and writes the whole file". It is mapped to step 9 and the Deep dive's "Large bases: index height and sort passes".
- **What:** neither the step nor the Deep dive says that each pass reads and writes all 1 TiB, so 2 passes means 4 TiB of I/O. That is the reason a pass count matters at all.
- **Evidence:**
  - Step 9's caption and narration never mention I/O volume.
  - The Deep dive only says "the cost of each pass" is in the I/O cost model topic.
  - The held `io-cost-model` reel says "2 passes, 4 TiB of I/O" (quoted in `FACT-CHECK.md`, "Sort-pass wording").
- **Fix:** add "each pass reads and writes the whole terabyte" to step 9 (caption or narration) and one Deep dive clause. Assert 2 × 2 × 1 TiB = 4 TiB in `examples.py` if 4 TiB goes on screen.
- **Status:** Fixed: step 9 (caption, narration, drawing) says each pass reads and writes the whole 1 TiB, 4 TiB of I/O, asserted in examples.py (2 × (1 TiB + 1 TiB) = 4 TiB); the Deep dive 'The chapter's sort, exactly' says it too.

**8. One MIT item is mapped to places that don't cover all of it** (minor)
- **Where:** `coverage.json`, MIT item "Asymptotics Exercises: ordering growth, binomial bound, logarithm rules (product, power, change of base), 2^(n+1) vs 2^n, polylog vs polynomial, Stirling and log(n!)".
- **What:** it is mapped to "Double the data", "Any base, one formula", "Growth at data sizes" and "Logarithms and the change of base". Those cover the log rules, polylog vs polynomial and ordering growth. Nothing covers the binomial bound, 2ⁿ⁺¹ vs 2ⁿ, or log(n!) = Θ(n log n).
- **Evidence:** `index.mdx` has no "n!" and no exponential example.
- **Fix:** split the item. log(n!) = Θ(n log n) is worth one Deep dive line: it is why a comparison sort needs Ω(n log n) comparisons, and it hands off to DSA "Lower bounds and adversary arguments", which the expert list already cites. Mark the binomial and 2ⁿ⁺¹ parts `out`, with a reason.
- **Status:** Fixed: coverage.json splits the item. log(n!) = Θ(n log n) gets a Deep dive bullet in 'Growth at data sizes' (comparison sort lower bound, handed to DSA 'Lower bounds and adversary arguments'); the binomial bound and 2^(n+1) vs 2^n are marked out with a reason, and the Deep dive says so in one sentence.

**9. The reason given for leaving out multi-parameter bounds isn't true** (minor)
- **Where:** `coverage.json`, expert item "Multi-parameter bounds", marked `out` with "Full treatment in the DSA track's Chapter 1".
- **What:** no DSA §1.1 line mentions bounds in several variables. The DSA lines are "O/Θ/Ω/o/ω; best, average, worst…", the word-RAM, recurrences and lower bounds. The topic also uses N, M and B itself, in step 9 and the Deep dive.
- **Evidence:** `syllabus/data-structures-and-algorithms.md` lines 37–41.
- **Fix:** map the item to "The external-memory (I/O) cost model" with the quote "sort bound (N/B)·log_{M/B}(N/B)", or reword the `out` reason.
- **Status:** Fixed: the item is mapped to the Deep dive 'Large bases…' (which now names N, M, B, n, m) and to the I/O cost model topic with the quote 'sort bound (N/B)·log_{M/B}(N/B)'; the false 'out' reason is removed.

**10. The gap review was signed off before the content review** (minor)
- **Where:** `coverage.json` → `gapReview`, which reads `{"by": "builder", "open": []}`.
- **What:** ROUTINE.md section 4 records the gap review after this review's gaps are filled. The builder closed it before any gap hunt had happened.
- **Evidence:** the entry's `by` field, and that this `REVIEW.md` didn't exist until now.
- **Fix:** after fixing findings 7–9, 11 and 12, rewrite `gapReview` with the date, "content review", and `open: []`.
- **Status:** Fixed: gapReview is now by 'builder + review fixes', 2026-10-12, open: [], after findings 7–9, 11 and 12 were closed (each by teaching, not just mapping).

**11. "Big-O is not a stopwatch" gives one reason only** (minor)
- **Where:** step 10 and outcome 4.
- **What:** the step's only reason is where the data lives. Nothing shows the lower growth class losing because of its constants, and no size of effect is given ("very different times").
- **Evidence:**
  - The Deep dive has the 8n term at n = 16 (40%), but no crossover between two algorithms.
  - The Deep dive's "Common slips" already says "can differ by orders of magnitude"; the caption doesn't.
- **Fix:**
  - Caption: "…can differ by orders of magnitude".
  - Deep dive: one counted, deterministic crossover. For example, insertion sort makes about n²/4 comparisons on random input and merge sort about n·log₂n, so the quadratic one wins below about n = 16. That is why real sorts finish small runs with insertion sort. Assert it by counting, as Try it 3 does.
- **Status:** Fixed: step 10's caption says 'can differ by orders of magnitude'. The Deep dive adds a counted crossover, but not insertion vs merge sort: counted comparisons show merge sort ahead from about n = 5, so the n²/4 example would be false. Instead: n² steps against 100·n·log₂n steps, where the quadratic method is cheaper up to n = 996 and loses from 997; asserted in examples.py.

**12. The Deep dive misses that most of a 4-level lookup is cached** (minor)
- **Where:** step 8 and the Deep dive's "Real pages are not all full".
- **What:**
  - At the default fill, everything above the leaves is 959 + 4 + 1 = 964 pages, about 7.5 MiB, against 273,225 leaves.
  - The pages above the leaves are what PostgreSQL's "over 99% of all pages are leaf pages" leaves out. They stay in memory, so a 4-level lookup is usually one or two device reads, not four.
  - This is exactly the "same step, different price" that the handoff sets up.
- **Evidence:** the page counts are already asserted in `examples.py` (273,225 / 959 / 4 / 1). The 99% quote is in `SOURCES.md`.
- **Fix:** one Deep dive sentence that ties the 99% to the next topic. No new numbers are needed beyond 964 pages × 8 KiB, which `examples.py` should then assert.
- **Status:** Fixed: Deep dive 'Real pages are not all full' (the 'orders estimate' bullet) adds the 964 pages above the leaves, about 7.5 MiB, tied to the 99% leaf-page quote and to a lookup often costing one or two device reads (stated as an assumption); 964 × 8 KiB asserted in examples.py.

### Expert reader

**13. The O and Ω definitions on screen drop "for some constant c > 0"** (minor)
- **Where:** step 2 caption.
- **What:** "O(f) is a ceiling: cost ≤ c·f(n) for every n from some n₀ on. Ω(f) is a floor: cost ≥ c·f(n)." Without "for some c > 0", the Ω statement is empty, because c = 0 always works.
- **Evidence:** MIT's definition in `SOURCES.md` says "there exists a positive real number c". The Deep dive has it; the reel doesn't.
- **Fix:** "O(f) is a ceiling: cost ≤ c·f(n) for some constant c > 0, for every n from some n₀ on."
- **Status:** Fixed: step 2's caption says 'cost ≤ c·f(n) for some constant c > 0, for every n from some n₀ on'; narration says 'some constant'.

**14. Step 9's drawing shows the second pass as less than half a pass** (major)
- **Where:** step 9 "Sort passes are a logarithm too": `SortPasses` in `scenes.tsx` and the caption.
- **What:**
  - The "2 passes" tower is one full block plus a sliver 0.43 high, labelled "1 sorted file · pass 2". The picture says the second pass costs less than half a pass.
  - The caption says "one pass of runs, then part of a merge, which still costs a whole pass". But the merge isn't partial: it merges all 64 runs into one file, using 64 of a possible 16,383 inputs (0.4% of the fan-in, not 43%).
  - 0.43 = log₁₆,₃₈₄ 64 is a position in log space, not a share of the work. Every pass reads and writes the whole 1 TiB.
  - The cinnamon "two at a time: 7 passes" tower beside it uses a different unit (22/28 against 50/60), so the two towers can't be compared by height either.
  - This is the wrong picture to hand on to topics 14 and 16, which price each pass.
- **Evidence:**
  - `FACT-CHECK.md` correction 11 says: "the comparison drawn is 2 passes against 7, not 1.43 against 7".
  - The OUTLINE's final frame still describes "a 1.43-step caramel staircase", and `scenes.tsx` draws `sliver = 0.43 * unit`.
  - The held `io-cost-model` reel words it as two whole passes and 4 TiB of I/O.
- **Fix:**
  - Draw pass 1 (1,048,576 blocks → 64 runs) and pass 2 (64 runs → 1 file) as two equal caramel blocks, beside seven equal cinnamon blocks at the same unit.
  - Keep the logarithm as its own line: "log₁₆,₃₈₄(1,048,576) = 20/14 = 1 + log₁₆,₃₈₄ 64 ≈ 1 + 0.43 → passes = 1 + ⌈0.43⌉ = 2".
  - Caption: replace "then part of a merge, which still costs a whole pass" with "1 for the runs, plus 0.43 because 64 runs need only a sliver of the 16,383-way fan-in; but a pass can't be partial: 2 passes, each reading and writing the whole terabyte" (see finding 7).
  - Assert any new on-screen numbers.
- **Status:** Fixed: SortPasses now draws pass 1 and pass 2 as two equal caramel blocks beside seven equal cinnamon blocks at the same unit; the logarithm is on its own line ('20/14 = 1 + log₁₆,₃₈₄ 64 ≈ 1 + 0.43'), then 'passes = 1 + ⌈0.43⌉ = 2: a pass can't be partial'; the caption is reworded as the finding asks. New numbers asserted (6/14 = 0.43, 64/16,383 < 0.4%, 4 TiB).

**15. Step 4's race uses a log scale nobody is told about** (major)
- **Where:** step 4 "Double the data": `Race` in `scenes.tsx`.
- **What:**
  - Bar length is `logFrac`, a log scale from 100 ns to 1 day, with no axis, ticks or label, so a learner reads it as linear.
  - At n = 1,000 the n² bar is about 4× the n bar (0.34 against 0.08 of the track) for a 1,000× gap.
  - At 100 million the n·log₂n bar (2.7 s) is about 1.24× the n bar (0.62 against 0.50) for a 27× gap.
  - n² simply stops at the edge.
  - The picture shrinks the very gaps the step exists to show.
  - It also misses the chance to teach reading a log axis. This is the topic that introduces `logarithms`, and every later chapter reel uses log axes: CHAPTER.md says "Latency axes are logarithmic, with decade ticks labelled 1 ns, 1 µs, 1 ms, 1 s in taupe", and topic 6 opens on a log-axis latency ladder.
- **Evidence:**
  - `scenes.tsx` line 120 (`logFrac`). The fractions follow from it: (log₁₀ s + 7) / 11.94.
  - Step 3's answer frame, by contrast, labels "log scale from 1 billion".
- **Fix:**
  - Add taupe decade ticks under the lanes (1 µs, 1 ms, 1 s, 1 day) and a note "log scale: each tick ×1,000".
  - Optionally add a caption clause ("on a log scale, so each step right is a thousand times longer").
  - Assert the tick positions in `examples.py`.
- **Status:** Fixed: Race has a labelled log axis with taupe ticks (1 µs, 1 ms, 1 s, 1,000 s), tick marks over each lane and the note 'log scale: each tick ×1,000'; the caption says so too. The axis now runs 100 ns to 100,000,000 s so the n² bar (10,000,000 s) is no longer cut off. Tick positions (0.067, 0.267, 0.467, 0.667) are asserted in examples.py. (The finding's 1-day tick was dropped because it is not ×1,000.)

**16. Step 4 drops the base the next steps say matters** (minor)
- **Where:** step 4 caption, "n log n 2.7 s".
- **What:** a time depends on the base. With log₁₀ the same count gives 0.8 s, and steps 6–9 teach that counts need their base. The lane is labelled n·log₂n but the caption says "n log n".
- **Evidence:** `reel.tsx` line 61 against the `LANES` labels in `scenes.tsx`.
- **Fix:** write "n log₂n 2.7 s" in the caption.
- **Status:** Fixed: the caption now writes 'n log₂n 2.7 s' (and n log₂n for the doubling).

**17. "Nearly constant" is quoted from no source, and overstates the point** (minor)
- **Where:** Deep dive, "Bounded n".
- **What:**
  - "nearly constant" is in quotation marks but is in no source. It is the blind expert list's own wording.
  - The claim also cuts against this topic's message. log₂n of up to 30–64 is a real factor: binary search's 30 probes against one hash probe, a binary tree's 27 levels against the B-tree's 4.
  - Vitter's point, which the Deep dive quotes, is that the large-base logarithms are the small constants.
- **Evidence:** a grep of `sources/` for "nearly" finds nothing. Vitter: "the logarithmic terms logm n … are small constants".
- **Fix:** drop the quotation marks and rephrase: "log₂ of anything addressable stays under 64, so it never grows large, but a factor of 30 is not free; it is the large-base logarithms, log_m n and log_B N, that are small constants in practice."
- **Status:** Fixed: Deep dive 'Bounded n' no longer quotes 'nearly constant'; it says log₂ stays under 64 but a factor of 30 is not free (30 probes vs 1, 27 levels vs 4), and that the large-base logarithms are the small constants.

**18. PostgreSQL counts the same tree's levels differently** (minor)
- **Where:** step 8 and the Deep dive's "The `orders` estimate".
- **What:**
  - PostgreSQL numbers levels from 0 at the leaves (`btpo_level`, "tree level --- zero for leaf pages", quoted in `SOURCES.md`). `pageinspect`'s `bt_metap` therefore reports level 3 for the root of this 4-level tree, and a learner who checks will think the reel is one off.
  - The caption also never says that the page arithmetic (8 KB pages, 6-byte row pointer) is PostgreSQL's.
- **Evidence:** the `nbtree.h` quote in `SOURCES.md`, and `FACT-CHECK.md` "Remaining caveats", which defers `bt_metap` to topic 13.
- **Fix:**
  - Caption: "…a PostgreSQL B-tree index on `order_id`…".
  - Deep dive: one clause, "4 levels, root to leaf; PostgreSQL itself numbers them 0 (leaf) to 3 (root)".
- **Status:** Fixed: step 8's caption says 'a PostgreSQL B-tree index'; the Deep dive adds '4 levels, root to leaf; PostgreSQL numbers them 0 (leaf) upward' and the bt_metap level-3 note.

**19. Narration rounds units and numbers loosely** (minor)
- **Where:** `narration.json`.
- **What:**
  - Step 9 says "The nightly job sorts a terabyte". The data is 1 TiB, about 10% more than a terabyte, and the chapter's notation is strict about binary and decimal units.
  - Step 8's answer says "The fourth reaches twenty five billion" for 25.6 billion.
- **Evidence:** CHAPTER.md "Shared notation and terms" → Sizes and Spoken numbers.
- **Fix:** "a tebibyte" (add it to the lexicon if the voice needs it) or "one tebibyte of events"; "over twenty five billion".
- **Status:** Fixed: narration says 'a tebibyte' and 'over twenty five billion'.

**20. "Slower" reads as "takes longer"** (minor)
- **Where:** Deep dive, "Growth at data sizes".
- **What:** "Polylogarithms are slower than any power" can be read as "take longer to run", the opposite of what is meant.
- **Evidence:** wording.
- **Fix:** "Polylogarithms grow more slowly than any power".
- **Status:** Fixed: 'Polylogarithms grow more slowly than any power'.

**21. `examples.py` truncates a float log, the habit the lab warns against** (minor)
- **Where:** `examples.py` line 182, `1 + int(math.log2(64)) == 7`.
- **What:** it truncates a float logarithm, exactly what the lab teaches against: "Count levels with integers instead, and round, never truncate". It is exact here only because 64 is a power of two.
- **Evidence:** `index.mdx` Try it 1 against `examples.py` line 182.
- **Fix:** use `(64 - 1).bit_length()` or the integer `passes(…, fan_in=2)` that the same line already asserts.
- **Status:** Fixed: examples.py uses 1 + (64 - 1).bit_length() == 7.

**22. Prerequisites claim more than the reel uses** (minor)
- **Where:** `prerequisites.mdx`, sections 01 and 02.
- **What:**
  - Section 01 says the reel "assumes powers and roots", but no step uses a root.
  - Section 02 says "The reel also mentions code review, CI and tests", but the reel mentions only tests (step 1).
- **Evidence:** `reel.tsx`.
- **Fix:** "assumes powers from school algebra"; "The reel's opening picks up the tests from the delivery workflow."
- **Status:** Fixed: prerequisites 01 says 'powers from school algebra' and 02 says 'The reel's opening picks up the tests from the delivery workflow.' (It also writes 1,000³ as a billion instead of 10⁹, per the powers-of-ten ruling.)

### QUALITY.md checks

**23. Powers of ten appear on screen** (minor)
- **Where:** step 5's explain ("log₂(10⁹) ≈ 29.9"), step 8's explain ("log₄₀₀(10⁸) = 3.07") and the `Halvings` answer frame ("log₂(10⁹) = 29.9").
- **What:** the OUTLINE's house rule says "No scientific notation on screen … Big counts are written out or in words", and CHAPTER.md says "no scientific notation on screen". A bare power of ten isn't strictly a×10ⁿ, and "10⁹ = 9 zeros" helps the mental trick, so this is a judgement call. But the rule has no exceptions.
- **Evidence:** `reel.tsx` lines 81 and 125; `scenes.tsx` line 202. Elsewhere the reel writes "1,000,000,000" and "100 million".
- **Fix:** "log₂ of a billion ≈ 29.9", "log₄₀₀ of 100 million = 3.07", or record the owner's ruling that a power of ten inside a logarithm is allowed. The Deep dive's 10¹⁰ / 10⁷ / 10⁴ quotes Vitter and can stay.
- **Status:** Fixed: per the owner's ruling, powers of ten are written out on screen and in the Deep dive: 'log₂ of a billion ≈ 29.9' (step 5 explain and the Halvings answer frame), 'log₄₀₀ of 100 million = 3.07', and Vitter's example as 10 billion, 10 million and 10,000 (asserted).

**24. Some on-screen numbers pass the number check only by coincidence** (minor)
- **Where:** step 8's caption ("an 8-byte key, a 6-byte row pointer … about 20 bytes each") and the race's note ("1,000,000,000 steps per second").
- **What:** they pass the build's number check (`topic-checks.ts`) only because 8, 6 and 10\*\*9 occur somewhere in `examples.py`. The check counts any occurrence. Nothing asserts the entry breakdown.
- **Evidence:** `ENTRY = 20` is set, with the breakdown only in a comment ("8 (tuple) + 8 (key) + 4 (line pointer)"). `SPEED = 10**9` is never compared with 1,000,000,000.
- **Fix:** add `assert 6 + 2 == 8 and 8 + 8 + 4 == ENTRY == 20` (TID, t_info, key, line pointer) and `assert SPEED == 1_000_000_000`.
- **Status:** Fixed: examples.py asserts 6 + 2 == 8 and 8 + 8 + 4 == ENTRY == 20, and SPEED == 1_000_000_000.

**25. A latency claim in the Deep dive has no source** (minor)
- **Where:** Deep dive, "Every step costs the same only in the model".
- **What:** "a step is a nanosecond in a cache or tens of milliseconds from object storage" has no source in `SOURCES.md`.
  - The handoff and narration wording come from CHAPTER.md word for word, which is fine.
  - But CHAPTER.md says not to put a planning number "on screen without your own source for it", and the Deep dive states this one as fact.
- **Evidence:** `SOURCES.md` has no latency source. CHAPTER.md "The canonical numbers" gives topic 6 ownership of these figures.
- **Fix:** attribute it ("orders of magnitude apart; the next topic measures and sources the ladder") or drop the figures from the Deep dive sentence.
- **Status:** Fixed: the Deep dive now says the price of a step varies by orders of magnitude with where its data lives, and that the next topic measures and sources the ladder; the unsourced nanosecond and millisecond figures are gone.

**26. `sources/` holds two copies of most documents** (minor)
- **Where:** `sources/`.
- **What:** the Knuth scan, MIT R01, DLMF §4.2 and both PostgreSQL doc pages are each fetched twice under different names, for example `knuth-1976.txt` and `danluu_com_knuth_big_o_pdf.txt`. It isn't clear which copy is the one the checks rely on.
- **Evidence:** `ls sources/`.
- **Fix:** keep the copy that `sources.mjs` uses for each source and delete the other.
- **Status:** Fixed: deleted the five duplicate copies (knuth-1976, dlmf-4-2, mit-6006, pg-btree, pg-page); kept the URL-named copies sources.mjs uses. sources/ is gitignored.

**27. These QUALITY.md checks pass** (no action)
- Narration has no digits, symbols or code names. The automatic check passes, and a manual read finds nothing. "B-tree" is fine.
- Every quote is word for word (94/0).
- Claims match their sources, apart from findings 17 and 25. Knuth's "order at least" and "order exactly", used in the Deep dive, are in the fetched scan but not quoted in `SOURCES.md`; add them as quotes.
- Every number on screen comes from `examples.py`, apart from finding 24, and the file runs.
- The `uses: ['git-bisect']` change from the plan is recorded in OUTLINE "Changes from the chapter plan" item 5. The concept ledger agrees with CHAPTER.md's entries 5 and 6: topic 6 uses `big-o` and `logarithms`, and both are introduced here.
- **Status:** Not changed: a record of checks that passed. The Knuth 'order at least' and 'order exactly' quotes are now in SOURCES.md (96 quotes, 0 problems); the other exceptions are findings 17, 24 and 25, fixed above.

**Counts:** 27 findings, 2 major (14 and 15) and 25 minor; finding 27 is a record of checks that passed.

## Looks and learning review

- **Reviewer:** a fresh looks-and-learning review agent that wrote nothing in this topic.
- **Date:** 2026-10-12.
- **Looked at:** all 28 frames in `site/test-results/`: `desktop-` and `phone-asymptotic-notation-logarithms-01` to `-11`, including the `-03-q`, `-05-q` and `-08-q` question frames (14 desktop, 14 phone). Read against DESIGN.md ("The looks review checks"), PROJECT_PLAN.md Rule #4, CHAPTER.md "One visual language", this folder's `OUTLINE.md`, `reel.tsx`, `scenes.tsx` and `narration.json`.
- **Phone sizes are estimates.** The phone frames are 1170 px wide, so I took them to be 3× a 390 px screen and measured text from the character widths in the frames. Treat the sizes as ±1 px.
- **What works** (so the fixes below don't undo it):
  - The reel has a clear chain: ceiling/floor, trap, growth, halvings, bases, tall/flat towers, B-tree, sort passes, caveat, recap.
  - Colour is mostly on grammar: cherry for the 116 days, the 3-level index and the wrong picks; caramel for the answer; cinnamon for the binary alternative in steps 7 and 9; taupe for the waits in step 10.
  - Step 6's three equal-length rulers and step 10's comb against stretched ticks are real ideas of their own.
  - The predict question frames (3, 5, 8) don't give the answer away.
  - Step 1's list and step 4's bars read at a glance.
- **Summary:** 23 findings, 9 major and 14 minor. The majors, in order of how much they hurt: step 9 is three ideas and, on a phone, clipped text; step 7's empty space; step 4's title promises doubling that the picture never shows; step 8's answer never draws the 100 million it argues about; step 5's unexplained tick labels; phone text of about 6–8 px on steps 3, 5 and 8; step 10 not showing its cause; and the pacing (pictures finish in under 4 s, narration runs 15–37 s).

Each finding gives step, size, what, fix and severity.

### Major

**1. "Double the data" never shows doubling** (major)
- **Fixed:** step 4 now ends on a fourth beat, 'double it: 200,000,000 orders', that grows a tail on each bar labelled x2, x2.08 and x4 (the n² tail in cherry). Named ticks '1 day' and '1 year' added (asserted in examples.py). The caption now starts with the doubling.
- **Step / size:** 4, desktop and phone.
- **What:** the title and the last sentence of the caption are about doubling: n doubles, n log₂n ×2.08, n² ×4. The picture shows one size only (100,000,000 orders) with three bars. The doubling, which is the growth idea the step exists for, is only in the caption. On a phone that sentence is behind "MORE" (the caption shows 3 lines). The step holds two ideas: what each cost comes to at 100 million rows, and how each grows.
- **Fix:** keep the three bars, and after a beat grow a second, ghost tail on each bar to the doubled size, labelled ×2, ×2.08, ×4 (the n² tail in cherry). Or retitle "Three costs at 100 million rows" and move the doubling into its own half-step. The log axis has no tick between 1,000 s and 116 days (about 10 million s), so add "1 day" so the cherry bar ends at a labelled place.

**2. Step 7 leaves a third of the drawing empty above the short towers** (major)
- **Fixed:** step 7 is now three rows of cells, one row per base (30 thin cells, 3 wide, 2 wide plus a sliver), each filling the width, so nothing floats and no empty top. The million (1.42) is dropped from the narration, caption and drawing; the 1.42 stays asserted in examples.py and in the Deep dive.
- **Step / size:** 7, desktop and phone.
- **What:**
  - The 29.9 tower is about 300 px tall on desktop; the towers for 1,000 and 16,384 are 3 and 2 slabs high. The area above them is empty, which is the "lots of empty space" the builder noted.
  - On the phone about 250 px of the drawing above the short towers is empty, and 90 px above the tall tower.
  - The picture is a bar chart in the end: the eye has to compare heights across a gap.
  - The caption's second number (log₁₆,₃₈₄ of a million = 1.42, narration "under one and a half") is not drawn.
  - The 16,384 tower shows 2 slabs for 2.14, the 29.9 tower 30 slabs, so the fractions are lost.
- **Fix:**
  - Use the idea of step 6 instead: three horizontal rows, one per base, each a row of cells (30 thin cells; 3 wide; 2 wide plus a sliver for 2.14). Each row fills the width and the rows stack, so nothing floats and the phone has no empty top.
  - If the towers stay, make the slab height at least 2.5× larger and draw the 29.9 tower's top as a dashed ghost line across the other two, so the gap itself is the picture.
  - Either draw the million (a thin "1.42" tower under each) or drop it from the narration.

**3. Step 9 on a phone: labels clipped and crowded** (major)
- **Fixed:** step 9 is re-laid as stacked rows (pass 1, pass 2, then the seven passes below), every label above its bar, no overlap on a phone; the log₁₆,₃₈₄ subscripts are gone from the drawing.
- **Step / size:** 9, phone (desktop is fine).
- **What:**
  - "pass 2: 64 runs → 1 file" is cut to "1 fil" by the 7-pass tower, and "pass 1: 1 TiB → 64 runs" touches the tower.
  - "two at a time: 7 passes" sits about 20 px under "(1 TiB ÷ 1 MiB)" and next to "2 passes", so three labels compete in the top 100 px.
  - The log₁₆,₃₈₄ subscripts are about 6 px.
  - The tower's last block touches the baseline rule of the bars.
- **Fix:**
  - On portrait, stack the two answers: the 2-pass bars on top and the 7-pass tower as a row of 7 blocks below (or to the right at half the width), never overlapping the labels.
  - Put the label text above its bar, not beside it, so nothing runs under the tower.
  - Write the log as "log base 16,384" in words, or drop it (see 4).

**4. Step 9 is three ideas, and the formula block is heavy** (major)
- **Fixed:** the drawing keeps '2 passes', '4 TiB of I/O' and the 7-pass comparison, and shows pass 1 as 64 small cells flowing into pass 2's single bar. 20/14, the ceiling and 'a pass can't be partial' are out of the drawing, caption and narration (they stay in the Deep dive and examples.py).
- **Step / size:** 9, desktop and phone.
- **What:**
  - It teaches the passes (pass 1 makes 64 runs, pass 2 merges them), the logarithm with a ceiling (20/14 = 1 + 0.43, ⌈0.43⌉, "a pass can't be partial"), and the I/O volume (4 TiB), and then contrasts 7 passes.
  - Five lines of monospace maths sit under the picture, including "log₁₆,₃₈₄(1,048,576) = 20/14".
  - Narration is 93 words, the longest in the reel.
  - The picture that shows the idea is the two bars; the maths restates it.
  - The desktop picture has a gap above the 2-pass bars (about 170 px) because the 7-tower sets the height.
- **Fix:**
  - Keep the picture, the two lines "2 passes" and "4 TiB of I/O" and the 7 tower; move 20/14 and the ceiling to the Deep dive (the OUTLINE already has it there).
  - If the log is kept, show it as one line: "1 + ⌈0.43⌉ = 2".
  - Draw pass 1 as 64 small cells flowing into pass 2's single bar so "64 runs" is visible, not only said.

**5. Step 5's answer labels are unexplained** (major)
- **Fixed:** '1 slab = 1 halving' on both frames; marks read 'after 10: 976,563', 'after 20: 954', 'after 30: under 1' with '÷ 1,024' between them; 'done' deleted.
- **Step / size:** 5 (answer frame), desktop and phone.
- **What:**
  - Three labels beside the 30-slab stack read "0.93 · done", "954" and "976,563". They are what is left after 30, 20 and 10 halvings, but nothing says so, and "0.93 · done" is odd for a count that should end at 1.
  - Neither frame says that each slab is one halving, so the picture ("30 slabs of the same thing") is the answer without the mechanism.
  - On a phone these labels are about 7 px.
- **Fix:**
  - Put "1 slab = 1 halving" on the question frame.
  - Label the marks "after 10: 976,563", "after 20: 954", "after 30: under 1", all in taupe, and mark "÷1,024" between ticks.
  - Delete "done".

**6. Phone: drawing text of about 6–8 px on steps 3, 5 and 8** (major)
- **Fixed:** question captions shortened (step 8 now one sentence, the byte arithmetic moved to its explanation), drawings made flatter and wider on a phone, and 'after n' labels larger relative to the frame. The reel test (which samples the answer frames) passes at its 9 px minimum. Not done: a separate 400-unit-wide portrait viewBox, because the shared Svg kit fixes a 600-unit width.
- **Step / size:** phone, steps 3 (answer), 5 (answer), 8 (question and answer).
- **What:** DESIGN.md says 13 units minimum, which should be about 9.5 px on a phone. These frames measure:
  - Step 3 answer: "log scale from 1 billion" about 7 px; "c = 11 works from n = 1" about 7 px; "job: 8,772,627,428 steps" about 8 px.
  - Step 5 answer: "976,563" and "0.93 · done" about 7 px; "log₂ of a billion = 29.9" about 8 px.
  - Step 8 question: "1 page = 8 KB ≈ 400 entries" about 6 px; "100,000,000 order ids" about 7 px.
  - Step 8 answer: "1 level: 400" to "4 levels: 25,600,000,000" and "binary tree: 27 levels" about 7 px.
  - The cause: on these frames the drawing is scaled down to roughly 190–215 CSS px wide (about 60% of the screen width) while the caption takes 7–8 lines (step 8's question caption is 8 lines on the phone).
- **Fix:**
  - Shorten the question captions. Step 8: "A PostgreSQL B-tree index on order_id: 100 million orders, about 400 entries per 8 KB page, and each inner entry points to a page below. How many levels?" Move the 8-byte key / 6-byte pointer / headers arithmetic to the explain.
  - Give these drawings a portrait viewBox (taller, 400 units wide) so the 13-unit labels fill the width.
  - Re-run the reel test's under-9-px check on the answer frames. The question frames pass it today, which suggests the test samples only the question frame.

**7. Step 8's answer never draws the 100 million it argues about** (major)
- **Fixed:** step 8's answer is drawn on a log axis against a dashed caramel 'target: 100,000,000' line: the 3-level bar (cherry, 'short') stops before it and the 4-level bar passes it; '× 400' sits between the bars.
- **Step / size:** 8 (answer), desktop and phone.
- **What:** the answer says "three levels reach only 64 million, the fourth reaches 25.6 billion". The picture is four stacked bars of reach (400; 160,000; 64,000,000; 25,600,000,000) with "short" in front of the third. The 100,000,000 target (drawn as the base bar in the question frame) is gone, so "short" is a word you have to trust. The "×400 per level" multiplication, the mechanism the caption teaches, is not drawn either: the bars just widen. It is a pyramid, not an index.
- **Fix:**
  - Keep the 100,000,000 bar from the question frame as a thin caramel line across all four bars: the third bar stops short of it (cherry), the fourth passes it.
  - Add "×400" in taupe between the bars.
  - Optionally draw the root page as one box fanning to 400, which is the picture topic 13 will reuse.

**8. Step 10 shows no cause, and its takeaway is the quietest text on the frame** (major)
- **Fixed:** gaps and combs are labelled ('data in cache: about 1 ns a step', 'data on disk: each step waits, about 100 µs'); 'time: ?' turns into '0.1 s' and '2.8 hours' as each scan finishes (asserted in examples.py: 100,000,000 × 1 ns = 0.1 s, × 100 µs = 10,000 s = 2.8 h); the takeaway is crema 17 with serif Θ and O.
- **Step / size:** 10, desktop and phone.
- **What:**
  - The caption's point is where each step's data lives (cache, RAM, disk, network). The picture shows scan A as a dense comb and scan B as spaced ticks with taupe gaps, but the gaps carry no label, so nothing says what B is waiting for.
  - Both scans say "time: ?" although B visibly runs far longer, so the question mark is contradicted by the picture.
  - "same count, same Theta(n): the price of a step isn't in the O" is the lesson, and it is the dimmest, smallest line (taupe, 13 units).
- **Fix:**
  - Label the gaps "wait for data" (taupe), and A "data in cache", B "data on disk" (or similar).
  - Replace "time: ?" by a time once the learner reaches the end ("about 0.1 s" against "about 100 s", asserted in `examples.py` first), or leave the question mark only while the bars are still drawing.
  - Make the takeaway latte or crema at 15–17 units, and spell it "Θ(n)".

**9. Pacing: pictures finish in 1–4 s, narration runs 15–37 s** (major)
- **Not changed (by design) for the player:** ReelPlayer runs animation time on `duration` only and holds the final frame after it, and the live python-essentials reel has the same shape (durations 1.2 to 4.6 s against 27 to 50 words of narration), so the player cannot sync to the voice. Fixed within this reel.tsx: staged reveals to the spoken beats and lengthened `duration` on the multi-beat steps (step 2 5.6 s: ceiling, floor, curve, Θ; step 4 6.4 s; step 6 6.6 s, one ruler per sentence; step 7 6 s; step 9 6.6 s: pass 1, pass 2, then seven; step 10 5.2 s). The pictures still finish before the voice does on the longest steps, as in the live reels.
- **Step / size:** all steps, both sizes.
- **What:**
  - In `ReelPlayer.tsx` (lines 88–98) animation time runs on `duration` alone, 1.2–3.6 s here, while narration has 27–93 words per step (about 11–37 s at a speaking pace): step 2 has 88 words (about 35 s) for a 3.6 s animation, step 6 has 87 words (about 35 s) for 3.2 s, and step 9 has 93 words (about 37 s) for 3.6 s.
  - Everything is on screen in the first seconds and then holds while the voice says four or five more things, so the learner hears "Big omega is a floor" while the drawing has long since shown everything, and it does not point at what is being said.
- **Fix:** where a step has two or more spoken beats, stage the picture to them. Step 2: the ceiling and floor lines, then the example ratio curve, then the "Θ(n log n)" label. Step 6: one ruler per spoken sentence. Step 9: pass 1, pass 2, then the 7 tower. If the player cannot sync to narration, set `duration` close to the narration length so the reveal spreads across it, as the DESIGN.md "steady beat" rule asks.

### Minor

**10. In all three predict steps the correct answer is the second button** (minor)
- **Fixed:** the correct answer is now first in step 3, third in step 5 (options no longer sorted) and last in step 8; step 3's options are all 'Yes/No: reason' one-liners (kept short so the reel test's swipe still misses the buttons).
- **Step / size:** 3, 5, 8; both sizes.
- **What:** options are "No: only n log n / Yes: a ceiling", "About 20 / About 30" and "3 / 4". A learner who sees the pattern can answer without thinking. Step 3's "Yes: a ceiling" also gives away its reason in the label, while the three wrong options have none.
- **Fix:** move the correct answer to different positions (step 3 first or last, step 5 third or fourth, step 8 last), shuffling the values rather than keeping them sorted if need be. Give step 3's options the same shape, with the reason last in every label (for example "Yes: it is a ceiling", "No: it is exactly n log n", "Only below n₀", "No: it is the worst case").

**11. Step 3's answer draws the ceiling as an empty box** (minor)
- **Fixed:** the n² bar is filled cinnamon (the alternative), '1,139,909× too high' is in crema on the line below, and the log-scale note stays on one taupe line.
- **Step / size:** 3 (answer frame), desktop and phone.
- **What:** the n² bar is a hollow caramel outline next to a filled crema "job" bar. An empty bar reads as zero, not as "a loose ceiling far above". The job bar is about 15% of the track and the n² outline 100%, so the "over a million times" is only the log axis label. Under the grammar, the other thing being compared should be cinnamon, not caramel.
- **Fix:** fill the n² bar cinnamon (or draw a vertical ceiling line at 10 quadrillion), put "÷ 1,139,909" or "1,139,909× too high" over the gap in crema, and keep the log-scale note on one taupe line.

**12. "Theta(n log n)" is spelled out in the drawings, Θ everywhere else** (minor)
- **Fixed:** Θ and O are the serif glyphs in the drawings of steps 3 and 10 and in step 11 (O, Ω, Θ).
- **Step / size:** 3 (question frame, `scenes.tsx` lines 80 and 88) and 10 (line 408), desktop and phone.
- **What:** the captions, titles, step 2's label and step 11 use the Θ glyph (serif in steps 2 and 11); the drawings on 3 and 10 say "Theta(n log n)" and "Theta(n)" in mono. Same notation, two spellings in one frame (step 3's caption says Θ(n log n) just beside it). The note on line 14 suggests the mono font lacks the glyph, but step 11 already solves it with a serif `<tspan>`.
- **Fix:** use the step 11 pattern (serif `Θ`) in all three spots, and keep O, Ω and Θ in the serif everywhere: step 3's "O(n²) ?" box and step 11's last bullet are mono O.

**13. "log_b" shows the underscore in steps 6 and 11** (minor)
- **Fixed:** log_b is drawn with a real subscript b in steps 6 and 11.
- **Step / size:** 6 (formula, `scenes.tsx` line 245) and 11 (bullets 2 and 3), desktop and phone.
- **What:** captions print log<sub>b</sub> x; the pictures print "log_b x = ln x / ln b". It reads as code, in a refresher that is teaching notation.
- **Fix:** draw the subscript (`<tspan baselineShift>` or a smaller `T` at 0.7× and lowered by 4 units), the same as the "log₂" the other steps use.

**14. In step 11 the letter O in the mono font reads as a zero** (minor)
- **Fixed:** the last bullet reads 'Big-O counts steps, not seconds' (the O is no longer a bare mono O at the start of the line).
- **Step / size:** 11, desktop and phone.
- **What:** "O counts steps, not seconds" starts with a plain mono O that looks like "0" next to "4 levels, 2 passes". The first bullet uses a serif O, so the two O's differ too.
- **Fix:** put the O in the serif `<tspan>` as in bullet 1, or write "Big-O counts steps, not seconds".

**15. Step 2: O and Ω are not drawn, and the curve's axes are unnamed** (minor)
- **Fixed:** lines are labelled 'O: ceiling c = 4' and 'Ω: floor c = 3', y ticks 3 and 4, 'n (log scale)' under the axis, and the curve is named by its live readout 'cost ÷ n·log₂n = … at n = …'. The curve, ceiling and floor now appear one by one with the narration.
- **Step / size:** 2, desktop and phone.
- **What:**
  - The title is "O ceiling, Ω floor, Θ both", but the picture labels its lines "ceiling c = 4" and "floor c = 3" and only Θ(n log n). The glyphs never appear next to the lines they name, which is what a learner has to memorise.
  - The curve has no label ("cost ÷ n·log₂n"), and the vertical axis has no tick at all; the x axis (2, 65,536, 100 M) doesn't say it is log-scaled.
  - The curve's first part (left of n₀) rises above the ceiling line with nothing to say why; the "from n₀ on" is shown by the dotted line only.
  - "ratio" is not introduced anywhere before the caption mentions "divided by n·log₂n".
- **Fix:** label the lines "O: ceiling c = 4" and "Ω: floor c = 3", label the curve "cost ÷ n·log₂n", add "n (log scale)" under the axis and 3 and 4 ticks on the y axis.

**16. Step 6 doesn't name the three bases** (minor)
- **Fixed:** rows are labelled 'base 2', 'base 10', 'base 1,000' with '29.9 halvings', '9 divisions', '3 divisions', the '÷ ln b' line in taupe beneath, '29.9 ÷ 9 = 3.32' on the base-10 row, and no stray tick at the end of the last ruler.
- **Step / size:** 6, desktop and phone.
- **What:** each ruler is labelled "÷ ln 2 = 0.693", "÷ ln 10 = 2.303" and "÷ ln 1,000 = 6.908", counts 29.9, 9 and 3. The bases 2, 10 and 1,000 appear only as arguments of ln, so "one length, three rulers" doesn't say which ruler is which base, and the "3.32" the caption and narration tell you to remember isn't shown. The last ruler's final tick sits exactly on the bar's end and looks like a stray mark.
- **Fix:** label each row "base 2: 29.9 halvings", "base 10: 9", "base 1,000: 3", with the ÷ ln b line in taupe beneath; add "29.9 ÷ 9 = 3.32" on the first two rows; leave a small gap at the end of the last ruler.

**17. Phone: the caption's key sentence is behind "MORE", and explanations start below the fold** (minor)
- **Fixed in part:** caption openings now carry the point (step 4 starts with the doubling; step 8's question is one sentence; step 9's caption is shorter). Not changed: the three-line clamp with 'MORE' and the position of the explanation under the options are the shared player's layout.
- **Step / size:** phone. Steps 2, 4, 6, 7, 9, 10, 11 (caption clamped to 3 lines); 3, 5, 8 (answer frames).
- **What:**
  - On every non-predict step the caption stops at "…" after about 20 words, so the formula of step 2, the doubling of step 4 and the 1.42 of step 7 are not seen unless the learner taps.
  - In the answer frames of steps 3 and 5 the explanation starts under the options and is cut by the control bar, and in step 8 it is out of view entirely (only the four options show), so the learner sees the "why" only by scrolling.
- **Fix:** the first 20 words of every caption should carry the point (step 4: "n doubles, n log₂n a bit more, n² quadruples" first), and on answer frames shorten the question caption so the explanation starts higher (see 6).

**18. Step 1 on a phone: caption blurred in the capture, and the §1.1 label is tiny** (minor)
- **Not changed:** the refresher list and its 'REFRESHERS' label belong to refreshers.tsx, shared by all five refreshers of the chapter, and the phone frame was taken during the entrance transition (the final frame is sharp). To be checked by eye once in the chapter pass.
- **Step / size:** 1, phone.
- **What:**
  - The caption, title and "New to this?" button are a blur of glowing shapes in the frame, so I can't judge them; the desktop frame is sharp. It may be a capture during the entrance transition. If it is real, the first thing a phone learner meets is unreadable.
  - The "§1.1 · REFRESHERS · SKIM WHAT YOU KNOW" label is about 6 px, and the list takes only about 58% of the width, with the rows' titles about 11 px.
- **Fix:** take the phone frame after the transition settles (and check it by eye once); on portrait let the list use the full 600 units, with a 13-unit label.

**19. Step 11 is five lines of text, and the last frame has no pictures** (minor)
- **Fixed:** each recap bullet has a 38×24-unit icon from its step (band, slabs, three rulers, tall against flat, comb) and the text sits beside it.
- **Step / size:** 11, desktop and phone.
- **What:** the recap is five caramel bullets with mono text and nothing visual. Rule #4 asks for memory, and the reel made five distinct pictures (the ceiling/floor band, the halving stack, the rulers, the flat tower, the stopwatch). The desktop frame is also left-heavy: the list ends at 1,135 px and 300 px of dark is left on the right.
- **Fix:** give each bullet a 40×24-unit icon taken from its step (a band with two dashes; 3 slabs; three equal bars; a 4-block tower; a comb), in the same colours, and one line of text beside it.

**20. Colour grammar is mostly right, with three slips** (minor)
- **Fixed:** step 8's binary line is cinnamon, step 3's n² bar is cinnamon, step 6's ticks are latte on a mocha ruler (caramel is saved for the counts); step 8's answer drops the extra colours (two bars in mocha, one cherry, one caramel).
- **Step / size:** 3, 7/8/9.
- **What:**
  - The binary-base alternative is cinnamon in steps 7 and 9, but taupe in step 8 ("binary tree: 27 levels"). The step-7 tower is cinnamon while the other two are caramel, which is the right way round (the large base is the answer), but the step-9 "2 passes" in caramel and "7 passes" in cinnamon uses the same pairing, so keep it and fix step 8.
  - Step 3's n² outline is caramel; the alternative should be cinnamon (finding 11).
  - Step 6 uses crema bars with caramel ticks and caramel counts; there is no comparison there, so the colour is only decoration.
  - On step 8's answer, the picture uses caramel, cherry, crema, a serif "4" and taupe: still two accents.
- **Fix:** step 8 binary line in cinnamon; step 3 per finding 11; step 6 ticks in latte so caramel is saved for the count.

**21. Desktop answer frames move the caption block up, and step 8's touches the header** (minor)
- **Not changed:** the vertical position of the caption block is the shared player's layout (not editable here). Step 8's question caption is now short, which removes the touch with the header.
- **Step / size:** 3, 5, 8 answer frames, desktop.
- **What:** the column is vertically centred, so when the explanation appears the chip and title jump up, from about 270 px to 140 px on step 3, and to 62 px on step 8, where "REFRESHER 8/11" sits about 10 px under the logo and nav pill. The title jumps between frames.
- **Fix:** anchor the caption block from the top (about 140 px) on predict steps, or cap the explanation height with its own scroll; shorten the step 8 question caption (finding 6).

**22. Steps 2, 4 and 6 each carry two ideas** (minor)
- **Fixed:** step 2's example is a staged second beat; step 4's second idea is now the picture's last beat (finding 1); step 6's last narration sentence ('Inside big O a fixed base doesn't matter...') is cut from narration and caption, the point is in the Deep dive and in steps 7 to 9.
- **Step / size:** 2, 4, 6; both sizes.
- **What:**
  - Step 2: the definition (ceiling, floor, both) and a worked example (3n·log₂n + 8n, n₀ = 256, ratio 3.30).
  - Step 4: the cost at 100 million and how each cost grows (finding 1).
  - Step 6: the change-of-base formula and when the base matters (the last narration line, which no picture backs).
- **Fix:** for each, keep one headline idea and let the other be a staged second beat (finding 9) or move it to the Deep dive. For step 6, cut "Inside big O a fixed base doesn't matter. But when you count levels…" from the narration or give it its own small picture (two lines: "O(log n): no base" and "levels: base matters").

**23. Step 4's log axis ends before its most important bar** (minor)
- **Fixed:** the log axis now runs 1 µs to 1 year with named ticks including '1000 s', '1 day' and '1 year', so 0.1 s, 2.7 s and 116 days sit between named marks.
- **Step / size:** 4, desktop and phone.
- **What:** the log axis ticks stop at 1,000 s while the n² bar ends at 116 days (about 10,000,000 s), so the most important bar finishes beyond the last tick, and "1 µs" is the first tick although the first bar (0.1 s) starts at the left edge. A reader cannot tell what the bar length means at the right end.
- **Fix:** add ticks "1 day" and "1 year" in taupe (and let the axis run 1 ms to 1 year), so 0.1 s, 2.7 s and 116 days sit between named marks.

**Counts:** 23 findings, 9 major (1–9) and 14 minor (10–23). No source files other than this REVIEW.md were changed.


**After the fixes (2026-10-12):** all 23 findings are marked above. Fully fixed: 1 to 8 and 10 to 16, 19, 20, 22, 23. Fixed in part: 9 (shared player timing) and 17. Not changed: 18 and 21 (shared layout). See OUTLINE.md, "Changes after the looks review".
