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
