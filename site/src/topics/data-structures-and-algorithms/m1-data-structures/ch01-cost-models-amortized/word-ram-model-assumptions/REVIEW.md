# REVIEW: The word-RAM model and its assumptions (`dsa.word-ram-model-assumptions`)

## Content review (2026-10-11, Fable, ROUTINE.md section 4)

Read in sequence: the previous topic as it is on `origin/topic/dsa.asymptotic-notation` (reel step titles and captions, registry entry, Deep dive "Resources, size and reality", narration of its last two steps, `REVIEW.md`); this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, its registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, `OUTLINE.md` and `examples.py`; the chapter's `CHAPTER.md` entry for topic 2 (and the shared-notation and visual-language sections); the next topic's syllabus line (Recurrences: Master theorem and Akra–Bazzi) and its `CHAPTER.md` bridge. I wrote nothing in this topic. Where a finding rests on a number, I recomputed it or read it off `examples.py` or the fetched source text in `sources/`.

What works: the problem (a million sorted keys, twenty probes) is opened in step 1, answered in step 14 and tested in Prove it, exactly as the plan asked; the unit of cost is named on the first step that counts; the fact-check's corrections (sketch rank against key rank, the processor-by-processor penalty list, the LSD/x-fast mix-up, the Zen 5 comparison point) are all in the built files; nothing in the reel uses a concept that a later topic introduces; the forward references (topic 3 for the recurrence, topic 4 for the lower bounds, 8–10 for the hierarchy, Ch.15/16 for branchless code) all point at syllabus lines that say they cover it. The bridge and handoff are the chapter plan's word for word.

Severity: **major** = a learner is misled, misses the step's point, or a claim is wrong; **minor** = imprecise, thin, or a house-rule slip.

### Part 1: Flow

1. **Step 1 (caption and narration): "The vector" arrives as if already known. Minor.**
   Where: `reel.tsx` step 1 ("The vector holds 1,000,000 sorted 64-bit keys"); `narration.json` step 1 ("Our vector holds one million sorted sixty-four bit keys").
   What: the chapter's running example is introduced by `CHAPTER.md` ("One running example: the vector"), but topic 1 is fixed and never mentions a vector (its reel is about quicksort, insertion sort and a duplicate search). This is the first reel in which the learner meets it, and the definite article and "our" make it sound like a callback to something they missed.
   Evidence: topic 1's twelve step captions on `origin/topic/dsa.asymptotic-notation` (no "vector"); `CHAPTER.md` line 27 says every topic "takes it from one structure", so topic 2 is where it must be introduced.
   Fix: one clause in step 1: "This chapter's running example is a vector: a growable array of 64-bit keys. Here it holds 1,000,000 of them, sorted, …" and "Our vector" → "A vector" in the narration.
   Status: Fixed: step 1 caption and narration now introduce the vector as the chapter's running example.

2. **Step 5: "Topic 1's Θ(b)" was only in topic 1's Deep dive, not its reel. Minor.**
   Where: `reel.tsx` step 5 ("Topic 1's Θ(b) is this count with w = 1"); `narration.json` step 5 ("topic one's theta of b").
   What: topic 1's reel says nothing about Θ(b) bit operations; the sentence lives in its Deep dive ("adding two b-bit numbers costs Θ(b) bit operations, not O(1)"). A learner who watched the reel and skipped the Deep dive is told they saw something they didn't.
   Evidence: `git show origin/topic/dsa.asymptotic-notation:…/asymptotic-notation/index.mdx`, "Resources, size and reality", bullet "The RAM model is an assumption"; none of its reel captions contains Θ(b).
   Fix: "Counted bit by bit, as topic 1's Deep dive did, that is Θ(b): the same count with w = 1." (narration likewise).
   Status: Fixed: step 5 caption and narration say "as topic 1's Deep dive did".

3. **Step 6: "cache line" is used without being taught, declared or glossed. Minor.**
   Where: `reel.tsx` step 6 ("with 64-byte cache lines, 17 distinct lines"); `narration.json` step 6 ("With sixty-four byte cache lines, seventeen distinct lines").
   What: Rule #5 wants every term taught earlier, declared, or explained on the spot. `CHAPTER.md` (line 51 and the ledger note on line 104) assigns "cache line" and the id `cache-lines` to topic 8. The reel uses the term as the unit of the "17" without saying what a line is; only the Deep dive does ("Caches move 'lines of several contiguous words'").
   Evidence: the caption text above; `CHAPTER.md` "Words: … 'cache line' is the block at the CPU-cache level (topic 8 introduces it)".
   Fix: a half-sentence gloss in the caption ("memory arrives in 64-byte lines, 8 keys at a time: the 20 probes touch 17 different ones") so the term is explained on the spot; keep `cache-lines` out of `uses`.
   Status: Fixed: step 6 glosses cache lines on the spot (64-byte lines, 8 keys at a time); `cache-lines` stays out of `uses`.

4. **The handoff is not planted in the reel; the recurrence it names is never called one. Minor.**
   Where: `reel.tsx` step 11 ("T(u) ≤ T(√u) + O(1), which is O(log w)") and step 14; `narration.json` last lines; registry `handoff`.
   What: the end card says "A recursive algorithm hands you its count as a recurrence; next, how to solve one", but no step says the word "recurrence" or that topic 3 solves T(u) ≤ T(√u) + O(1); `OUTLINE.md` promised step 11's caption would ("topic 3 solves the recurrence") and that step 14's close would plant it. The narration ends on Prove it 3's answer with no spoken handoff, where topic 1's ended "Next, the word RAM model…".
   Evidence: `OUTLINE.md` "Bridge and handoff": "Planted by step 11's caption (T(u) ≤ T(√u) + O(1), 'topic 3 solves the recurrence') and step 14's close"; neither caption contains it.
   Fix: step 11: "…a recurrence, T(u) ≤ T(√u) + O(1), which topic 3 solves: O(log w)". Step 14's last sentence (caption and narration): "Counting a loop here is easy; a recursive algorithm hands you a recurrence instead. Next: how to read the answer off one."
   Status: Fixed: step 11 says the recurrence T(U) ≤ T(√U) + O(1) is solved by topic 3; step 14 caption and narration end on the handoff sentence.

5. **Registry `uses` is missing `with-high-probability` (and the reel uses it). Minor.**
   Where: `site/src/topics/registry.ts`, the `uses` array; `reel.tsx` step 12 ("the O(log w) bound then holds with high probability"); `narration.json` step 12.
   What: topic 1 introduces `with-high-probability`; this reel relies on the learner knowing what the phrase promises (it is the whole "price" of the hashed vEB in step 12) and the Deep dive uses "expected O(1)" for hashing. The ledger should say so; the flow check only catches uses without an introducer, not the reverse, so this is a bookkeeping slip, but the next topic's planner reads `uses` to know what the learner has met.
   Evidence: `registry.ts` line 82 lists `big-o-theta-omega`, `pseudo-polynomial`, `time-space-tradeoff` from topic 1 only.
   Fix: add `with-high-probability` (and `expected-vs-average`, used in the Deep dive's Prove it (c) and "Prove it, in full" 2) to `uses`; `CHAPTER.md` isn't edited, so note it under `OUTLINE.md` → "Changes from the chapter plan".
   Status: Fixed: `with-high-probability` and `expected-vs-average` added to the registry `uses`; recorded in `OUTLINE.md` (Changes after final).

6. **Letters change meaning between steps and between reel and Deep dive: u / U, and b. Minor.**
   Where: `reel.tsx` step 11 ("T(u)") against step 12 ("Θ(U) space", "U = 2⁶⁴") and step 14 ("Θ(U) space"); `index.mdx` uses lower-case u throughout ("u = 2ʷ", "Θ(u)", "O(log log u)"); `index.mdx` "Which operations are unit cost is a choice" quotes Fredman–Willard's "two-word product … the high and low b bits" and "2ᵇ − 1".
   What: `CHAPTER.md` fixes "universe U = 2ʷ" for the chapter (and, inconsistently, writes topic 3's recurrence with u); the reel itself switches from u to U one step later with no word that they are the same. And b is this topic's letter for a number's bit length (step 5, chapter rule on "The letter b"), but in the Fredman–Willard quotes b is the word size; the chapter rule says "A reel that needs two of these says which", and the Deep dive doesn't.
   Evidence: `CHAPTER.md` "Shared notation and terms", bullets "Word-RAM" and "The letter b"; the captions above.
   Fix: in step 11 write T(U) ≤ T(√U) + O(1) (or say once "u = U = 2ʷ, written u in the notes"), and in the Deep dive add "(their b is our w)" after the first Fredman–Willard quote that uses it. Record the choice in `OUTLINE.md` so topic 3 can match it.
   Status: Fixed: reel uses U throughout; Deep dive says the chapter's U is the notes' u and adds "(their b is our w)"; choice recorded in `OUTLINE.md`.

7. **Step 13: "not for 22" refers to a query the learner has never seen. Minor.**
   Where: `reel.tsx` step 13 ("Careful: the sketch rank is right for 25 but not for 22, which one more step repairs"); `narration.json` step 13; `scenes.tsx` `Sketch` (only q = 25 is drawn).
   What: the drawing shows the subtraction for q = 25 only. The caption's warning about 22 has nothing on screen to attach to, so it reads as a non sequitur; `OUTLINE.md` step 13 said "the caption shows q = 22" (its sketch 00, the same as 21's, so the leading bits read 1 1 1 1 although its predecessor is 21).
   Evidence: `examples.py` lines 380–384 compute exactly the counter-example the caption alludes to; `scenes.tsx` `Sketch` has no second query.
   Fix: either a last beat in the drawing that swaps the query to 22 (sketch 00, difference blocks all with leading bit 1, verdict "no predecessor?" struck through, "desketchify → 21"), or a caption that carries the fact itself: "22 has the same sketch as 21, so the subtraction says 'none'; one more step (the Deep dive's desketchifying) repairs it."
   Status: Fixed by the caption option: step 13 carries the fact itself (22 has 21's sketch, so the subtraction says none; desketchifying repairs it); no new drawing beat.

8. **Step 11: the key's cluster and position are shown without the key's value, and 16 boxes stand for 2³² clusters unannounced. Minor.**
   Where: `scenes.tsx` `HalveBits` ("high 32: cluster 3", "low 32: position 7"; 16 summary cells and 16 cluster boxes); `reel.tsx` step 11.
   What: the storyboard draws one key throughout, x = 3·2³² + 7, so that cluster 3 and position 7 are readable; but no caption ever states x's value, so "cluster 3" and "position 7" are unexplained numbers. The summary and cluster rows draw 16 slots for a level that has 2³², with no "16 of 2³² shown".
   Evidence: `OUTLINE.md` "Running example": "One key is drawn throughout: x = 3·2³² + 7"; `reel.tsx` never prints it.
   Fix: name the key once (step 2 or step 11 caption: "our key x = 3·2³² + 7: high half 3, low half 7") and label the rows "16 of 2³² clusters drawn".
   Status: Fixed: step 11 caption names x = 3·2³² + 7; the drawing labels it and says "16 slots drawn of 2³² per level".

### Part 2: Gap hunt

9. **Step 10: the drawing runs the radix passes most-significant digit first while everything else describes LSD radix sort, and the reel never says why the passes compose. Major.**
   Where: `scenes.tsx` `RadixPasses`: `Bracket … c={p === pass - 1 ? C.caramel : C.taupe}` lights bracket p = 0 on pass 1, and `Bits` draws bit 63 at the left, so pass 1 highlights the **high** 16 bits; `reel.tsx` step 10 ("A stable counting sort places a million keys by one digit in one pass … 4 passes"); `index.mdx` "Radix sort on the word-RAM" (LSD: "sort the digits one after another … stability ensures previous sorts stay sorted"); `examples.py` `radix_sort_lsd` (`for shift in range(0, width, r)`: low digit first).
   What: an LSD radix sort must take the least-significant digit first, and each pass must be stable, or the earlier passes are undone; the picture shows the opposite order, and a scatter-and-collect by the high digit first followed by the low digits does not sort. The caption names stability ("collected in bucket order, stably" on screen) but never says the order of the digits or why stability makes the previous passes survive, which is the one idea that makes "digits as addresses" into a sort. A learner who knows radix sort sees a wrong picture; one who doesn't learns the wrong order.
   Evidence: the code lines above; `Bits` comment "most significant bit left"; the 6.006 quotes in `SOURCES.md` ("Stability ensures previous sorts stay sorted").
   Fix: light the brackets right to left (`p === 4 - pass`), and add one sentence to the caption: "lowest digit first; each pass is stable, so the order the earlier digits produced survives inside every bucket." Narration likewise ("lowest digit first, and stable, so earlier passes survive").
   Status: Fixed: `RadixPasses` lights brackets right to left (`p === 4 - pass`) and says "lowest digit first"; caption and narration say why stability keeps earlier passes.

10. **Step 10: the digit width is never tied to n, so "w/log₂ n passes" and "linear when w = O(log n)" are asserted, not shown. Minor.**
   Where: `reel.tsx` step 10 ("A digit of 16 bits is an array index … Linear when w = O(log n)"); `index.mdx` outcomes ("radix sort, w / log₂ n passes"); `narration.json` step 10.
   What: the point of the bound is that a digit of about log₂ n bits gives 2ʳ ≈ n buckets, so one counting-sort pass costs O(n + 2ʳ) = O(n), and there are w / log₂ n of them. The reel picks 16 bits with no reason (65,536 buckets happens to be under a million), so the learner cannot see why the pass count is w / log n rather than w / 16, nor why the sort stops being linear when w grows faster than log n. The Deep dive has it (c = log_n u = w / log₂ n); the reel does not.
   Evidence: `reel.tsx` step 10 against `index.mdx` "Radix sort on the word-RAM" and the syllabus clause "why integer-key structures (radix sort …) beat comparison-model bounds".
   Fix: caption: "a digit of about log₂ n bits (16 here, for a million keys) means at most about n buckets, so one pass is O(n); 64-bit keys need 64 / 16 = 4 such passes, w / log₂ n in general, a constant when w = O(log n)."
   Status: Fixed: step 10 ties the digit to about log₂ n bits (at most about n buckets, O(n) per pass, w / log₂ n passes); Deep dive says the same; `examples.py` asserts 2¹⁶ ≤ n and 64 / 16 = 4.

11. **Deep dive: the upper side of the word-size convention is never stated positively. Minor.**
   Where: `index.mdx` "The word-RAM, precisely", paragraph "Two constraints on w make the model honest … From above: …".
   What: the paragraph says why unbounded words are forbidden (repeated squaring, Paul and Simon) but never says what the standard convention is: w = Θ(log n), "integers bounded by a polynomial in the size of the data … can be stored in a single cell" (Mehlhorn and Sanders; CLRS's c·log n in `CHAPTER.md`'s scope). Without it the reader doesn't know whether "w ≥ log n" or "w = Θ(log n)" is being assumed when the topic later says "linear when w = O(log n)" or "w = Ω(lg n)". The quote is already in `SOURCES.md`, and expert item 2 ("integers polynomial in the input size fit in O(1) words") is mapped to this section but not delivered by it.
   Evidence: `SOURCES.md` Mehlhorn–Sanders: "Our default assumption is that integers bounded by a polynomial in the size of the data being processed can be stored in a single cell."; `coverage.json` expert item 2 → "The word-RAM, precisely".
   Fix: one sentence after "From above": "The standard convention is the middle: w = Θ(log n), so that any integer polynomial in n fits one word (Mehlhorn and Sanders: '…'), which is CLRS's c·log n; the fixed-universe view instead takes w as given and lets n vary, which is why the predecessor bounds below are in w and n separately."
   Status: Fixed: Deep dive "The word-RAM, precisely" states the w = Θ(log n) convention with the Mehlhorn-Sanders quote and the fixed-universe contrast.

12. **Deep dive "van Emde Boas trees in full" does not give the operations; delete is absent. Minor.**
   Where: `index.mdx` "van Emde Boas trees in full", first paragraph.
   What: `CHAPTER.md` (topic 2 scope) says vEB trees "have no other home in the syllabus, so this topic carries the mechanism … and the Deep dive gives the structure in full", and `OUTLINE.md` promised "successor/predecessor, insert and delete as lec11 §4 describes them". The section describes the layout and asserts that each operation "decide[s] in constant time whether the answer lies in the key's own cluster or must be found in the summary", but gives no procedure: predecessor (if x > cluster[high(x)].min, recurse into the cluster; else take summary.predecessor(high(x)) and return that cluster's max; the stored min covers the remaining case) and insert are only sketched, and delete, whose one-recursion trick is that the non-recursive min lets a deleted minimum be replaced by the first cluster's min before recursing, is not described at all. `examples.py` has a `VEB` class but it is referenced only for the toy's counts.
   Evidence: `index.mdx` lines 59–63; `CHAPTER.md` line 134; `OUTLINE.md` Deep dive heading for this section.
   Fix: three short lists (predecessor, insert, delete) of four or five lines each, in lec11's words where it has them ("Note that specifically, we only recurse once"), plus one sentence on why storing min non-recursively is what makes insert-into-empty and delete-the-min O(1) at that level.
   Status: Fixed: "van Emde Boas trees in full" now lists predecessor, insert and delete (lec11's words where it has them) and why the non-recursive min makes them one recursion.

13. **Step 13: the height Θ(log n / log w) is stated with nothing on screen or in the caption that produces it. Minor.**
   Where: `reel.tsx` step 13 ("Height Θ(log n / log w), theory only"); step 14 ("on paper O(log n / log w)"); the outcomes in `index.mdx`.
   What: the step shows one node's parallel compare but never says a node holds about w^(1/5) keys and is searched in O(1), so a B-tree of those nodes has height log_w n. The outcome "many keys compared in one word (fusion trees, O(log n / log w))" therefore has its mechanism in the reel but not the step that turns it into a bound. The Deep dive has it in its first sentence.
   Evidence: `reel.tsx` step 13 caption against `index.mdx` "Fusion trees: the idea…" ("A fusion tree is a B-tree with branching factor w^(1/5) … so its height is Θ(log_w n)").
   Fix: caption: "A node holds about w^(1/5) keys and is searched in O(1) this way, so the tree is a B-tree of height Θ(log n / log w): theory only (Fredman and Willard)."
   Status: Fixed: step 13 caption says a node holds about w^(1/5) keys, searched in O(1), so height Θ(log n / log w).

14. **Expert items mapped to the Deep dive but only half delivered: the integer-sorting state of the art, the dynamic optimum, and the external-memory corollary. Minor.**
   Where: `coverage.json` expert items 13, 22 and 25; `index.mdx` "The frontier" and "The comparison model and its escapes".
   What: (a) Item 13 names Han's O(n log log n) deterministic and Han–Thorup's O(n √(log log n)) expected bounds; the frontier gives only radix, signature sort and "OPEN", although lec14's survey table (opened, `sources/…lec14_pdf.txt` lines 50–76) has Han, Han–Thorup and "the best we have done in the general case is a randomized algorithm in O(n √(lg lg n))". (b) Item 22's second half (exponential search trees make min{log w, log_w n} dynamic and reach the optimal O(√(log n / log log n)) in linear space) is absent; the expert's source is Andersson–Thorup (arXiv cs/0210006), which the builder did not open, so either open it or mark that half `out` with a reason. (c) Item 25 (Pătraşcu–Thorup: with cells of B keys "it is always optimal to either use a standard B-tree, or the best RAM algorithm") is mapped to the frontier and to topic 8's clause "parameters N, M, B"; the frontier doesn't say it and topic 8's syllabus line is about scan and sort costs, not predecessor search. The quote is already in `SOURCES.md`.
   Evidence: `coverage.json` lines 895–900, 983–988, 1010–1019; `index.mdx` "The frontier"; `SOURCES.md` Pătraşcu–Thorup: "Thus, we show that it is always optimal to either use a standard B-tree, or the best RAM algorithm which completely ignores the benefits of external memory."
   Fix: one sentence each in the frontier (Han and Han–Thorup with lec14 quotes; the P–T external-memory sentence, with "Chapter 5's B-trees" as the forward pointer), and for (b) either a quoted sentence from an opened Andersson–Thorup or an `out` with reason in `coverage.json`.
   Status: Fixed: (a) frontier gives Han and Han-Thorup with lec14 quotes; (b) Andersson-Thorup (arXiv cs/0210006) was opened, copied to `sources/`, quoted in `SOURCES.md` and stated in the frontier; (c) Pătraşcu-Thorup's B-tree sentence added with Chapter 5 as pointer. `coverage.json` updated.

15. **Currency: "recent Intel cores" rests on Agner's §3.8 (Haswell to "other Lakes"), while his 2026 manual has Ice Lake/Tiger Lake and Alder Lake chapters with their own figures that the topic doesn't use. Minor.**
   Where: `reel.tsx` step 7 ("15 to 20 cycles on recent Intel cores"); `index.mdx` "What the unit hides" ("Haswell to the Lakes 15 to 20"); `examples.py` `AGNER_MISPREDICT_INTEL_RECENT` ("Haswell to the Lakes").
   What: Haswell is 2013; §3.8 covers Haswell, Broadwell, Skylake "and other Lakes". The fetched manual also says, in its Ice Lake and Tiger Lake pipeline chapter, "The measured misprediction penalty varies between 16 and 20 clock cycles" and "Mispredicted branches take approximately 20 clock cycles extra", and in its Alder Lake chapter "The penalty for branch misprediction is high, sometimes exceeding 20 clock cycles in my measurements"; none is quoted. "Recent" is therefore a stretch for the sources actually cited, and the newest Intel core in the manual is a little above the reel's "15 to 20".
   Evidence: `sources/www_agner_org_optimize_microarchitecture_pdf.txt` lines 26 (§3.8 title), 9936–9940 and 10068–10069 (chapter 12, Ice Lake and Tiger Lake), 10541–10542 (§13.1, Alder Lake); `SOURCES.md` has no quote from those chapters.
   Fix: either quote the Ice Lake/Tiger Lake and Alder Lake sentences into `SOURCES.md` and write "15 to 20 on Intel cores from Haswell to Tiger Lake, sometimes above 20 on Alder Lake" (Deep dive) with "15 to 20 or a little more on Intel cores of the last decade" (reel and narration), or drop "recent" and say "Haswell to the Lakes".
   Status: Fixed by the quote option: Ice Lake/Tiger Lake and Alder Lake sentences quoted in `SOURCES.md`; reel and narration say Haswell to Tiger Lake, a little more on Alder Lake; Deep dive quotes both; `examples.py` notes the figures.

### Part 3: Expert reader

16. **Step 6: "17 distinct lines" is a cold-cache count, and the caption doesn't say so. Minor.**
   Where: `reel.tsx` step 6 ("Binary search makes 20 probes that land far apart: with 64-byte cache lines, 17 distinct lines. This is the cache miss."); `narration.json` step 6.
   What: in a service the first probes of every binary search read the same few lines (the midpoint, the quarter points), which stay in cache across queries; only the deep probes miss. "17 distinct lines" therefore means "up to 17 misses on a cold cache", not 17 misses per query. The Deep dive is careful ("arithmetic about the model's picture, not a measurement"); the reel caption and narration are not.
   Evidence: `examples.py` lines 153–159 count distinct lines only.
   Fix: "…17 distinct lines: on a cold cache, up to 17 trips. (Hot queries share the first few.)"
   Status: Fixed: step 6 caption and narration say 17 is a cold-cache count (up to 17 trips, hot queries share the first few); Deep dive likewise; `examples.py` asserts every query starts at the midpoint.

17. **Step 7: an eight-stage pipeline is drawn under "lost: 15–25 cycles ≈ pipeline length". Minor.**
   Where: `scenes.tsx` `Flush` (8 stage boxes; label "lost: 15–25 cycles ≈ pipeline length"); `examples.py` `STAGES = 8`.
   What: the label says the penalty equals the pipeline's length, and the picture shows a pipeline eight long. A careful reader sees a contradiction in the one frame that carries the number. The source's claim is "approximately equal to the length of the pipeline"; the drawing should not quietly contradict it.
   Evidence: the two strings above in `scenes.tsx` lines 266–272.
   Fix: either draw 16 stages (thinner boxes), or label the row "8 of about 15–25 stages drawn" in taupe.
   Status: Fixed: `Flush` labels the row "8 of about 15–25 stages drawn".

18. **Step 10: "4,000,000 moves" counts placements only, and `examples.py` asserts 4·N rather than counting. Minor.**
   Where: `reel.tsx` step 10 ("4,000,000 moves, against about 20,000,000"); `scenes.tsx` `RadixPasses` ("4 passes × 1,000,000 keys = 4,000,000 moves"); `examples.py` line 203 (`assert 2**16 == 65_536 and 4 * N == 4_000_000`).
   What: a counting-sort pass reads every key once to count, once more to place, and writes it once; the list-of-lists version in `examples.py` appends every key to a bucket and then collects it (two moves per key per pass). "4,000,000 moves" is the number of key placements, not the number of memory operations, and the file does not count moves in the sort, it multiplies 4 by N. The caption already concedes the units differ; the number should still mean what it says.
   Fix: say "4 placements per key" (or "each key placed 4 times") and have `radix_sort_lsd` count placements and assert them; or count the real moves (reads and writes) and show that number.
   Status: Fixed: wording is now "placements" (reel, drawing, Deep dive); `radix_sort_lsd` counts placements and `examples.py` asserts 4 per key, so 4,000,000 for the vector.

19. **Step 11: "stores each level's minimum and maximum, so a query recurses once": the "so" is not explained in the reel. Minor.**
   Where: `reel.tsx` step 11; `scenes.tsx` `HalveBits` footnote ("each level stores its min and max, / so a query recurses once"); `narration.json` step 11.
   What: the mechanism is that the cluster's min (and max) answer in O(1) whether the predecessor lies inside the key's own cluster (if x > that cluster's min) or must come from the summary (then the answer is the previous non-empty cluster's max), so only one of the two recursions is taken. Without that sentence, "so" is an appeal to authority and the T(√u) in the recurrence is unmotivated; a senior engineer will ask why the summary and the cluster aren't both searched.
   Fix: caption: "…its min says in O(1) whether the answer is inside the key's own cluster (recurse there) or before it (ask the summary for the previous cluster and take its max): one recursion either way."
   Status: Fixed: step 11 caption, narration and drawing footnote explain why the cluster's min lets a query recurse once.

20. **Step 2: "the operations C gives you on an integer" is looser than the Deep dive, which later depends on the difference. Minor.**
   Where: `reel.tsx` step 2; `narration.json` step 2.
   What: the Deep dive's multiply count (64 × 64 = 4,096) rests on a multiply that "produces a two-word product", which C's `*` does not give (the Deep dive says so: 128 × 128 with low-word multiplies); "the operations C gives you" therefore understates the model the topic's own numbers use. The reel also never says that an operation touches O(1) cells and that there are O(1) registers, which is what stops a single step from doing unbounded work on memory (the counterpart of the word-size bound in step 4).
   Evidence: `index.mdx` "Numbers longer than a word" (the two counts); `SOURCES.md` lec11: "There is some fixed set of operations, each of which modifies O(1) memory cells."
   Fix: "a fixed set of operations like C's integer ones (arithmetic, comparisons, bit operations, shifts), each touching O(1) words, plus a load or store at a computed address: one unit each"; leave the two-word-product detail to step 5's caption, where it already is.
   Status: Fixed: step 2 caption and narration say "a fixed set of operations like C's integer ones ..., each touching O(1) words"; the two-word-product detail stays in step 5 and the Deep dive.

21. **Step 4: "or one unit operation could do the whole input's work" is asserted; the one-line proof is in `examples.py` and the Deep dive but not the reel. Minor.**
   Where: `reel.tsx` step 4; `narration.json` step 4.
   What: the claim is the half of the word-size assumption that experts most often get wrong (why not just let w be huge?). The evidence is one clause long and already executed: n squarings make a 2ⁿ-bit number (`(2 ** (2**20)).bit_length() == 2**20 + 1`), so an unbounded word computes exponentially much in n steps.
   Fix: "…or one unit operation could do the whole input's work: 20 squarings make a million-bit number."
   Status: Fixed: step 4 caption and narration add "20 squarings make a million-bit number"; `examples.py` squares 2 twenty times and asserts it.

22. **Deep dive: the fusion-tree height "≈ 16.6" is computed from a 2.3-key node, which is not a fusion node. Minor.**
   Where: `index.mdx` "Fusion trees: the idea, and what is left out", paragraph "Practicality" ("with w = 64, a node holds 64^(1/5) ≈ 2.3 keys, so … the height is about … 16.6"); "Prove it, in full" 8 ("A fusion tree's height here is about 16.6").
   What: the notes say the exponent 1/5 is one choice ("any small constant power suffices"); with k = 2.3 the "B-tree" is a binary tree and the parallel compare compares two keys, which is no longer the construction the section describes. The conclusion (constants dominate; theory only) is right and sourced, but the arithmetic presents an artefact of the exponent as the height of "the" fusion tree. With w^(1/3) = 4 keys per node the height is log₄ 10⁶ ≈ 10, which makes the same point honestly.
   Evidence: `SOURCES.md` lec12: "actually, any small constant power suffices, since the height of the tree will be Θ(logw n)"; `examples.py` lines 389–390.
   Fix: "with the notes' exponent 1/5 a node holds only 64^(1/5) ≈ 2.3 keys and the height is about 16.6; with w^(1/3) = 4 keys it is about 10: either way the Θ(log_w n) hides a constant that leaves it near binary search's 20 at this n" (assert the second number too).
   Status: Fixed: Deep dive gives 16.6 for the notes' exponent and about 10 for four keys per node, and says either way it stays near binary search's 20; `examples.py` asserts both.

23. **Deep dive: "attributes its coinage to no one" leaves a verifiable attribution open that the chapter plan asked for. Minor.**
   Where: `index.mdx` "The word-RAM, precisely" ("The notes call this the transdichotomous RAM; … attributes its coinage to no one"); `OUTLINE.md` "Changes from the chapter plan" (4).
   What: `CHAPTER.md` asked "which of their papers coins the term, to verify". The fusion-tree paper (JCSS 47, 1993) was opened and does not contain the word, which the topic reports honestly. The other Fredman–Willard paper of that period, "Trans-dichotomous algorithms for minimum spanning trees and shortest paths" (JCSS 48, 1994; FOCS 1990), carries the word in its title and is where the 6.851 notes' usage comes from; it was not opened. This is a lead for the fixer to open with `sources.mjs fetch`, not a claim: if it opens and its text defines the term, quote it; if not, keep the present sentence.
   Fix: open that paper; one sentence either way.
   Status: Not acted on, as the lead allowed: the 1994 paper's text cannot be opened (DOI and publisher URLs return no text through `sources.mjs fetch`; only Crossref metadata, which confirms the title, JCSS 48, June 1994). The Deep dive keeps "attributes its coinage to no one" and now names the candidate paper as unopened.

24. **"Prove it, in full" (c): "a hash function that behaves" is the kind of hand-wave the topic warns against. Minor.**
   Where: `index.mdx` "Prove it, in full", item 6 ("Model: the word-RAM, with expected time and a hash function that behaves").
   What: the worked answer should name the promise: expected O(1) per operation over the hash function's random choice (6.006: "Hash tables give expected O(1) time operations, amortized if dynamic"), with the family that gives it left to Chapter 3 "Universal and k-independent hashing". "Behaves" is not a model.
   Fix: "…with expected time over the choice of hash function (6.006: 'expected O(1)'; which families give that is Ch.3), amortized across resizes; hidden: …".
   Status: Fixed: "Prove it, in full" 6 names the promise: expected time over the choice of hash function (6.006: "expected O(1)"), families left to Chapter 3, amortized across resizes.

**Count: 1 major (9), 23 minor (1–8, 10–24).** The one major finding (9) is a wrong picture and a missing sentence in step 10; it needs no new step or redesign, so this review does not need to run again after the fix. Findings 1–8 are flow, 9–15 gaps, 16–24 expert reading.

## Looks and learning review (2026-10-11, Opus)

ROUTINE.md section 5, judged against DESIGN.md "The looks review checks". Viewed every screenshot in `site/test-results/` named `desktop-word-ram-model-assumptions-*.png` and `phone-word-ram-model-assumptions-*.png` (17 steps, 4 predict question frames, both sizes: 42 images), against `OUTLINE.md` (storyboard) and `narration.json`. Where a screenshot looked wrong, I read the step's scene in `scenes.tsx` and its `duration` in `reel.tsx` to find the cause; I changed no file except this one.

What works: the reel looks like this site (dark roast, caramel for the word-RAM's count, cinnamon for the comparison model, cherry kept to the miss and the flush), and most steps have their own picture rather than a shared template: the bit row cut three ways (step 9), the summary and cluster strip with the halving chain (step 11), the sketch rows and the three words of the subtraction (step 13), the back-to-the-problem card (step 14), and the two stamps on the design-doc card (step 16) all read at a glance at both sizes. Every number checked against the storyboard (the bits of x = 3·2³² + 7, the node, query and difference words of step 13, 1,048,576, 80×, 4,000,000 against ≈ 20,000,000) is right on screen. No text runs past the drawing at either size.

Severity: **major** = the step's point is missing, wrong or hidden in its final frame, or something is clipped or overlapping; **minor** = polish, crowding or pacing.

1. **Steps 3, 15 and 17 (predict answers), both sizes: the answer animation is cut off at the step's `duration`, so the answer frame freezes unfinished. Major.**
   Where: `BeatTwenty`, `Quiz1`, `Quiz3` in `scenes.tsx`; durations 1.5, 1.2 and 1.2 in `reel.tsx`.
   What: the answer visuals are timed from the step's own `t`, which stops at `duration`. Step 3's chain ends "64 → 32 → 16 → 8 → 4 → 2", with no "→ 1". Step 15's chain stops at "64 → 32 → 16 → 8 → 4", and the cinnamon "log₂ 10⁹ ≈ 29.9 → 30 comparisons" never shows (it fades in from t = 1.2). Step 17 is the worst: the learner is told 64, and the picture says **"word additions 27"**, with 27 of 64 cells filled.
   Evidence: `desktop-…-03.png`, `-15.png`, `-17.png` and the phone versions. The frozen values are exactly what the code gives at t = duration: `floor(1.5/0.3)+1 = 6` links; `floor(1.2/0.3)+1 = 5` links; `floor(1.2/0.045)+1 = 27` cells.
   Fix: time the answer animation from when the answer arrives, not from the step's start (or give the answer branch its own clock), so it always runs to the end: 7 links, the cinnamon line, and all 64 cells with "word additions 64". Or render the answer frame complete when the clock has stopped. Check that it plays when the learner answers late.
   Status: Fixed: answer branches run on a stretched clock (`stretch(t, duration, end)` in `scenes.tsx`) so the final frame is complete at the step's duration: step 3 shows 64 → … → 1 (7 links), step 15 the 7 links and the cinnamon 'log₂ 10⁹ ≈ 29.9 → 30 comparisons' line, step 17 all 64 cells and 'word additions 64'. Late answers still show the finished frame.

2. **Step 1, both sizes: the final frame shows 19 comparisons, not 20, and has no footnote. Major.**
   Where: `TwentyProbes` (`probeTime(19) = 3.8 + 0.17·13 = 6.01 s`); `reel.tsx` step 1 `duration: 6`.
   What: the step's whole point is the number 20, and it is the number the next two steps argue with. At `duration` the counter reads **19**, the strip has not collapsed to one lit cell, a cinnamon "<" still hangs under the strip, and "log₂ 1,000,000 ≈ 19.9, so 20 probes" (which fades in at 6.21 s) is missing. A paused or reduced-motion learner sees 19.
   Evidence: `desktop-…-01.png` and `phone-…-01.png` both show "comparisons 19".
   Fix: make `duration` about 6.6 s, or shorten the fast beats (e.g. 0.15 s) so that probe 20 and the footnote land by 5.8 s. Hide the "<" once `done`.
   Status: Fixed: fast beats shortened from 0.17 s to 0.15 s and step 1 `duration` raised from 6 to 6.6, so probe 20 lands at 5.75 s and the footnote is fully in by 6.45 s; the final frame reads 20 with the footnote and no stray '<'.

3. **Step 1, phone: no step title or caption on screen. Major.**
   Where: `phone-…-01.png`.
   What: every other phone step shows "n/17 · §1.1", the title, a three-line caption and MORE below the drawing. Step 1 shows the drawing and then about 850 px of empty background down to the controls, with no title ("A million keys, twenty probes"), no bridge and no problem statement. The first frame of the reel does not say what the strip is for. Desktop shows the bridge, title and caption.
   Evidence: compare `phone-…-01.png` with `phone-…-02.png`, where the caption block starts at y ≈ 1140.
   Fix: find out why the caption block does not render or sits off-screen on step 1 in portrait (likely the bridge quote plus the prerequisites button making the block too tall). If it is site chrome, report it to the site and check another topic's step 1. Then confirm the title and the first lines of the caption are visible without scrolling.
   Status: Not fixed (site chrome, locked): `ReelPlayer.tsx` renders the bridge quote only on step 0 for every topic and the caption block is shared; the phone step-1 frame is the same player layout for all topics. This topic has no layout of its own to change. I could not compare with asymptotic-notation's phone step 1 screenshot (none in `test-results/` and a second 5-minute run was not made); it should be checked at site level.

4. **Steps 3, 16 and 17, phone: the explanation after answering is below the fold. Major.**
   Where: `phone-…-03.png`, `-16.png`, `-17.png` (and the question frames `-03-q`, `-16-q`, where "PICK AN ANSWER TO CONTINUE" is half hidden behind the controls in 03-q).
   What: after answering, step 3 and step 16 show only the top edge of the feedback box above the playback controls. Step 17's box is cut mid-sentence ("be 64 × 64 = 4,096 word multiplies" is sliced). The explanation is the teaching moment of a predict step, and nothing tells the learner to scroll. Step 15, whose question is three lines, fits.
   Evidence: the screenshots above; the question captions of steps 3 and 16 run to 5 lines on phone, plus 4 two-line options (16 has a four-line option).
   Fix: shorten the question text on these steps (step 3: "A million sorted 64-bit keys; binary search needs 20 comparisons. On the word-RAM, can a predecessor query not grow with n?"; step 16: drop the quote from the caption, since the card in the drawing already shows it, and ask only "Which model is it true in, and does it hold on the word-RAM?"). Shorten the longest options. If the site does not already do so, scroll the feedback into view when it appears (a site-level fix).
   Status: Fixed in this topic: step 3 question shortened to 'A million sorted 64-bit keys; binary search needs 20 comparisons. On the word-RAM, can a predecessor query not grow with n?', option 2 shortened; step 16 caption reduced to 'Which model is the design doc's claim true in, and does it hold on the word-RAM?' (the quote stays on the card in the drawing), options shortened; step 17 question and explanation shortened (multiplication sentence dropped); step 3 and 16 explanations trimmed. Narration lines and answers updated to match. Not fixed: scrolling feedback into view is site-level (locked).

5. **Step 4, both sizes: the address arrow runs through the 8-bit word. Major.**
   Where: `PointerFits`: `Arrow` from (480, 124) to (246, 272) crosses the 8-bit `Bits` at x 330–490, y 200–220.
   What: the caramel arrow from "20 bits: 1,048,576 addresses" to cell 999,999 passes through the third cell of the 8-bit word. That reads as if the address goes through the small word, which is the opposite of the point (the small word cannot reach). The 8-bit word is also drawn as eight filled crema cells, the brightest shape in the frame, so it competes with the caramel 20-bit run. It does not look like the dim "taupe" word in the storyboard. The "column dims beyond its reach" idea shows only as the 999,999 cell fading, which reads as the arrow's target going dark.
   Evidence: `desktop-…-04.png` (arrow crosses at about x 1010, y 450), `phone-…-04.png` (about x 680, y 700).
   Fix: move the 8-bit word below the memory column or to the left under the word row, clear of the arrow's path (e.g. x 330, y 290, with the inequality moved down). Draw it in taupe outline. Show its reach as a short taupe bracket over cells 0–2 with "256 cells", ending well above 999,999.
   Status: Fixed: the 8-bit word is now a taupe-outline row below the memory column at (330, 268), clear of the arrow, with a short taupe bracket beside cells 0 to 2 labelled '256 cells'.

6. **Step 6, both sizes: the final frame loses the hit/miss picture. Both blocks end side by side in "registers". Major.**
   Where: `OneLoad`: the hit block ends at y 52, the miss block at y 58. The cherry flash lasts only from 1.5 to 2.1 s.
   What: the step's visual idea is one load hopping one band against one climbing from main memory. In the still, two identical crema blocks sit in the registers band, the right one 6 units lower (it looks misplaced, not meaningful). Nothing shows that one came from L1 and the other from main memory. The lesson comes only from the "≈ 3 / ≈ 240 cycles" labels and 80×.
   Evidence: `desktop-…-06.png`, `phone-…-06.png`.
   Fix: leave a trace of each trip in the final frame: a short caramel tick from L1 to registers in the left lane, and a cherry dotted path from main memory up to registers in the right lane (or a cherry outline on the right block). Align both blocks at y 52. Put each cycles label under its own lane's path.
   Status: Fixed: both blocks end at y 52; a caramel trace from L1 to registers (left lane) and a cherry dotted path from main memory to registers (right lane) stay in the final frame.

7. **Step 12, both sizes: the final frame drops the "2⁶⁴ dwarfs a million" contrast. Major.**
   Where: `SpacePrice`: the band fades to 20 % and the "1,000,000 keys" sliver and its label fade to 0 as `collapse` reaches 1.
   What: the still shows an almost invisible empty box under "array of clusters: 2⁶⁴ slots", a dimmed Θ(U), and a row of 8 caramel dots with Θ(n). The scale picture (a million keys as a hairline inside 2⁶⁴ slots) is gone, so the frame shows only two labels and some dots. The price is told, not shown.
   Evidence: `desktop-…-12.png`, `phone-…-12.png`.
   Fix: keep the band, the sliver and "1,000,000 keys" in the final frame (dim the band to about 60 %, not 20 %), and draw the hashed row below it as a short caramel bar or dots, so the still holds both bars as the storyboard's final frame says ("the two bars with Θ(U) and Θ(n)").
   Status: Fixed: band dims to 60 % (not 20 %), the 1,000,000-keys sliver, connector and label stay visible, and the hashed dots (Θ(n)) appear below, so the still holds both pictures.

8. **Step 2, both sizes: the five operations are never marked, and every memory cell holds x. Minor.**
   Where: `WordRam`; `desktop-…-02.png`.
   What: the final frame shows the operation list in uniform latte, "store a[0]" and "units 5". Which five different operations were counted is not visible, yet that is the idea ("five different operations, five units"). Memory cells 0, 1 and 2 all carry x's bit pattern, which suggests three copies of the key rather than cells.
   Fix: leave the five used operations lit in caramel in the list (load, <, +, >>, store), or list them as a small "load · < · + · >> · store" line above "units 5". Give cells 1 and 2 different seeded patterns, or leave them empty except the cell the store wrote.
   Status: Fixed: a 'counted: load < + >> store' row lights each operation in caramel as it is used; memory cell 1 holds a different pattern and cell 2 is empty, so only a[0] carries x.

9. **Step 7, both sizes: no trace of the flush in the final frame; hyphen in a range. Minor.**
   Where: `Flush`; `desktop-…-07.png`.
   What: the still shows a half-refilled pipeline and the penalty label. The flushed (cherry) work that makes the step is gone, so the refill looks like a normal start-up. "15-25" uses a hyphen in two labels, where the captions use "15 to 25"; elsewhere the site uses an en dash for ranges.
   Fix: keep the four discarded chips as faint cherry outlines under the row ("thrown away"), or a cherry bracket over the emptied stages. Use "15–25".
   Status: Fixed: four dashed cherry outlines labelled 'thrown away' remain after the flush. The range already used an en dash in `scenes.tsx` (15–25); the monospace font draws it like a hyphen.

10. **Step 8, both sizes: x lands after the last card, the degenerate case. Minor.**
   Where: `OneBit` (`probes = [3, 5, 6, 7]`); `desktop-…-08.png`.
   What: every answer goes "no, further right", and the lit gap is the far-right end, so the still looks like "x is bigger than everything" rather than "four answers found one of nine places". It also puts the caramel x card in the top-right corner, beside the side rail on desktop.
   Fix: choose a target gap in the middle (e.g. gap 5, places 9 → 5 → 3 → 2 → 1 with mixed yes/no), so the lit gap sits between cards.
   Status: Fixed: x now falls in gap 5 (probes at cards 3, 6, 4, 5: no, yes, no, yes), places 9 → 5 → 3 → 2 → 1 as examples.py asserts; the lit dot range follows lo/hi and the x card starts mid-row.

11. **Step 10, both sizes: a crowded still with no picture of the scatter; tally misaligned on phone. Minor.**
   Where: `RadixPasses`; `desktop-…-10.png`, `phone-…-10.png`.
   What: six text items compete (pass, buckets label, note, two tally lines, comparisons line). The scatter into buckets, which is both the mechanism and the price, is not visible in the still: the bucket strip is uniform and the "collected" strip is a plain crema bar. On phone the tally starts at x ≈ 100 while everything above it starts at ≈ 137. The note line runs to x ≈ 1125, past the bucket strip.
   Fix: drop the "lowest digit first…" note (the caption says it). Leave a few crema dots sitting in scattered buckets in the final frame. Align the tally with the key row's left edge.
   Status: Not fixed: minor, skipped (needs a redesign of the scatter picture).

12. **Steps 10, 11 and 13: the captions are too long for one step, and step 13 carries more than one idea. Minor.**
   Where: desktop captions of 11–12 lines (10, 11, 13); narration for 13 has six sentences across three beats.
   What: step 13 teaches sketching, the parallel compare, the q = 22 counterexample, w^(1/5) branching, the tree height and "theory only". The drawing carries the first two. The 22 warning and the height have no picture, so the learner holds them only from the caption. "w^(1/5)" in caret notation is also out of style beside "2³²" elsewhere.
   Fix: in step 13, keep the caption to sketch, block subtraction and "one more step repairs some queries (Deep dive)". Move the height and "theory only" into step 14's fusion-tree column, which already says "theory only". Write w^(1/5) as w¹ᐟ⁵ or "the fifth root of w". Trim 10 and 11 by a sentence each (10: the stability clause; 11: the min/max recursion clause is already the footnote).
   Status: Partly fixed: w^(1/5) in the step 13 caption now reads w<sup>1/5</sup>, as in index.mdx. Not fixed: trimming and splitting captions 10, 11 and 13 (skipped as non-trivial).

13. **Step 13, both sizes: the leading bits 0 and 1 are highlighted the same, and the query's own bits are missing. Minor.**
   Where: `Sketch`; `desktop-…-13.png`.
   What: in the difference word all four leading bits get the same caramel fill, so the learner has to read the digits to see "0 1 1 1 → 3". The storyboard's query row (25 = 00011001, with its sketch 01) is not drawn, so where "sketch 01" comes from is only stated in a label.
   Fix: fill only the 1-leading bits in caramel and give the 0 a taupe outline (or the reverse). Add the query's 8-bit row under the four keys, with its two distinguishing bits lit and its sketch "01" in the sketch column.
   Status: Not fixed: minor, skipped.

14. **Step 5, both sizes: the multiply lattice reads as decoration. Minor.**
   Where: `BigNumber`; `desktop-…-05.png`.
   What: the taupe dot in each caramel cell looks like a screw head on a tile. Nothing ties it to "64 × 64 = 4,096 word multiplies", since one dot per cell is 64 marks, not 4,096 pairings.
   Fix: drop the dots and let the note carry the multiply. Or draw an 8 × 8 corner of the 64 × 64 product grid beside the cells, labelled "each word × each word".
   Status: Not fixed: minor, skipped.

15. **Step 11, phone: "clusters" touches the first cluster box. Minor.**
   Where: `phone-…-11.png` (label ends at x ≈ 283, box starts at x ≈ 285).
   Fix: shorten the strip by one or two slots, or start it 12 units further right.
   Status: Fixed: the cluster strips and their labels start 12 units further right (x 152).

16. **Step 14, phone: the column headers reach the edges. Minor.**
   Where: `phone-…-14.png`: "comparison model" starts about 13 CSS px from the left edge, inside the 16 px gutter. "log n / log w" ends about 18 px from the right.
   Fix: move the columns to x 110 / 300 / 490 and shorten "comparison model" to "comparisons" (the unit line under 20 can then go).
   Status: Fixed: columns moved to x 110 / 300 / 490 and 'comparison model' shortened to 'comparisons'; the unit line under 20 removed.

17. **Steps 15 and 17, phone: the drawing rescales when the feedback appears. Minor.**
   Where: `phone-…-15-q.png` → `-15.png` (key row narrows from x 137–1032 to 197–972); `-17-q` → `-17` (grid narrows from 225–937 to 295–870).
   What: the picture jumps smaller just as the answer animates. This is likely the layout giving the feedback box room. It reads as a glitch, and it shrinks the answer's numbers.
   Fix: give predict steps a fixed drawing height in portrait, or reserve the feedback's space in the question frame (site-level); otherwise drop step 17's `h` from 320 to 300 so it shrinks less.
   Status: Not fixed: the rescale comes from the shared player layout (locked). Step 17's drawing height lowered from 320 to 300 so it shrinks less.

18. **Step 2, phone: the 64-cell memory rows turn into texture. Minor.**
   Where: `phone-…-02.png`: each memory bit cell is about 1.5 CSS px wide.
   What: the three memory rows read as striped bars, and the bit pattern (the point of drawing bits) is lost. The word row above is just legible.
   Fix: in portrait, draw the memory cells as plain 64-bit boxes (outline plus "64 bits" once) rather than 64 sub-cells, and keep the bit row only for the word at the top.
   Status: Not fixed: minor, skipped.

**Count: 7 major (1–7), 11 minor (8–18).** Findings 1 and 2 are timing bugs. In both, the final frame a paused or reduced-motion learner sees states a wrong number ("word additions 27", "comparisons 19"); fix them first. Findings 3, 4 and 17 may be site layout rather than this topic, so check them against another topic's phone screenshots before changing this reel. After 1–7 are fixed, re-shoot the screenshots and run this review again on steps 1, 3, 4, 6, 12, 15 and 17.
