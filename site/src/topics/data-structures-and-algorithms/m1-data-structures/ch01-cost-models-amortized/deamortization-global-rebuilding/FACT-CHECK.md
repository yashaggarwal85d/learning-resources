# Fact-check: Deamortization and global rebuilding (2026-10-12, against raw source texts)

Adversarial check (ROUTINE.md 2.3) of `OUTLINE.md`: its header design, claims list, captions, explanations, predict questions, Deep dive plan and `examples.py` plan. The reel, narration and `index.mdx` don't exist yet. The fact-checker did not write the outline.

Every claim was re-derived from the raw texts in `sources/` (fetched with `node scripts/sources.mjs fetch`), never from a summary. Five more sources were fetched the same way and added to `SOURCES.md`:

- Okasaki, *Purely Functional Data Structures* (CMU-CS-96-177, 1996), chapter 5: Overmars's attribution and the buffered-updates pattern.
- Erickson, Lecture 10 "Scapegoat and Splay Trees" [Fa'13]: Overmars, Andersson, global and partial rebuilding in a BST.
- Wikipedia "Scapegoat tree" (revision 1378893949): a lead and a clean-text check of h_α only.
- The Java Language Specification, Java SE 26, §15.10.2: array components are initialized (semantics, not a cost).
- Galperin and Rivest's PDF is a scan with an OCR layer that drops or garbles every displayed formula. Pages 166–174 were rendered to images (`pdftoppm`) and read directly. What was read only from the images is recorded as a note in its `SOURCES.md` section, since `sources.mjs check` can't test it.

`SOURCES.md` had 112 quotes. The fact-check added 59 (D23–D24, E24–E27, G27–G41, TS23–TS26, TZ20–TZ25, OK1–OK13, L1–L9, W1–W5, J1) and four `##` sections. `node scripts/sources.mjs check` passes: 171 quotes, 0 problems. Quote ids continue each section's numbering in file order, so the outline's existing ids are unchanged.

Every number was recomputed by scripts written for this check. They are pure Python run with `python3 -I`, kept in the session scratchpad and not committed:

- the plain and incremental vectors (with get, set, pop, shrink-at-¼);
- an exhaustive state search of the incremental vector;
- the queue model;
- the amortized and background tombstone vectors;
- a scapegoat tree with both scapegoat rules and both middle conventions;
- Ehrlich's Gray-code increment.

## Claims

| # | Claim (short) | Verdict | Evidence / correction |
|---|---|---|---|
| 1 | 20 of 10⁶ appends resize; append 524,289 copies 524,288; total 2,048,575 | Confirmed | sim: 999,980 cost 1, max 524,289 at 524,289, copies 1,048,575 |
| 2 | Nearest-rank percentiles; "99th-percentile latency", "one user request in 100" | Confirmed | TS12, TS13. **But see claim 4:** ranks must be computed exactly |
| 3 | Appends' p50 = p99 = p99.9 = p99.99 = 1; p99.999 = 513; mean 2.048575 | Confirmed | sim |
| 4 | Queue model, gap 4: 131,072 arrive during the last copy; 349,515 wait; p50 1, p90 243,218, p99 494,289, **p99.9 521,292**, max 524,289, mean 61,085.503615 | **Corrected: p99.9 is 521,289** | The requests behind the last copy have latencies 524,289 − 3j. Rank 999,000 (= ⌈99.9 · 10⁶/100⌉) is the 1,001st largest, j = 1,000: 521,289. 521,292 is rank 999,001, an off-by-one. Everything else confirmed: append 524,289 starts at tick 2,097,152 and ends at 2,621,441, no wait. Gap 3: p50 5,771, p99 504,289, 524,268 waited, busy 68%. Gap 8: p50 1, p99 454,289, 149,790 waited, busy 26%. Incremental at gaps 3, 4, 8: latency = own cost for every request |
| 5 | Tails hard to keep short at scale; temporary episodes dominate | Confirmed | TS2, TS3, TS11 |
| 6 | Fan-out 63% at 100 servers; about 18% at 2,000 with 1 in 10,000 | Confirmed; quote added | TS12–TS15, TS23. 1 − 0.99¹⁰⁰ = 0.634; 1 − 0.9999²⁰⁰⁰ = 0.181. The source calls the scenario "hypothetical" (TS24): the caption's "Dean and Barroso's example" stays, never "measured" |
| 7 | Table 1: 10 ms one leaf, 140 ms all leaves | Confirmed | TS16; Table 1 in the text |
| 8 | Charge 3; Φ = 8 before append 9 | Confirmed | previous topics; arithmetic |
| 9 | Deamortize: small pieces per operation, old structure serves until done | Confirmed | D15–D18, TZ5–TZ6, TZ18; OK4, OK7 |
| 10 | "a standard background-rebuilding technique" makes resizing O(1) worst case | Confirmed | TZ5, TZ6 |
| 11 | Incremental vector: ≤ 3 writes per operation with pops and shrink-at-¼; no resize during a migration; ≤ 2 buffers | **Confirmed by execution** | Exhaustive search to capacity 256: 17,570 states when a state is (cap, n, migrating, m, k), or 19,330 if the old buffer's length is added (it changes no behaviour). Max cost 3, 0 resizes started during a migration. 300 seeded random runs of 4,000 operations with `get` compared against a list every 97 steps: max 3, all reads right. The pop, pop, push, push sequence: max 3 |
| 12 | Copy ends at 1.5c, a quarter spare; 1 per append ends at full; ≥ 1/(g − 1) per append | Confirmed; **two corrections** | (a) **Rate 1 is not a broken design for g = 2.** The same exhaustive search at 1 move per operation (with pops and shrinks) gives max 2 writes and no resize during a migration. It only has zero slack. The Deep dive must say why the topic uses 2: it spends exactly the 2 saved coins of the charge of 3, and it leaves a quarter of the buffer spare. "Break it (1)" asked the script to find a failing pop sequence, and none exists; fixed in the outline. (b) **g = 1.5 with the chapter's rounding:** the copy finishes on the very append that fills the new buffer at **every** resize to 10⁶ (all 33: 1 → 2, 2 → 3, 3 → 5, 5 → 8, 8 → 12, 12 → 18, …), not only at 8 → 12 |
| 13 | Same total (31; 2,048,575); max 3 vs 9 and 524,289 | Confirmed | sim. The last migration ends at append 786,432 < 10⁶, so both totals are complete |
| 14 | Both buffers alive for c/2 appends; 12 MiB at c = 524,288; plain also holds two during its copy | Confirmed | 1,572,864 × 8 B = 12 MiB; appends 524,289 … 786,432. TZ9 is said of the exact-fit structure; cite it only for "two arrays must coexist during a copy", as the outline says |
| 15 | Median 1 → 3; 524,287 appends cost 3 | Confirmed | sim (one append costs 2: append 2, c = 1) |
| 16 | O(1) worst case assumes O(1) allocation; TZ's amortized bounds survive O(N) allocation; Brodnik et al. assume O(1) allocation | Confirmed; quotes added | TZ20, TZ21 |
| 17 | Zeroing a buffer costs Θ(c) | **No source states it: dropped from the reel** | The only opened text is JLS §15.10.2 (J1): "each component of the array is initialized to its default value". That is semantics, not a cost; a runtime may get cleared memory from elsewhere. The Deep dive may state the conditional with TZ20 and J1 ("if allocating c slots costs Θ(c), for instance because a language requires every slot initialized, the worst case is Θ(c) again unless allocation is spread out too"), and claims nothing about any runtime |
| 18 | Deamortized structures are more complicated | Confirmed | D14, TZ16, OK9 |
| 19 | One insertion can take long, unsuitable for low latency | Confirmed; quote completed | D12, D13, D24 |
| 20 | f(n) per rebuild after Θ(n) updates gives O(f(n)/n), if n doesn't change asymptotically | Confirmed; quote added | D1–D4, D23 |
| 21 | Doubling array, y-fast trie, tombstones at n/2 | Confirmed | D5–D8 |
| 22 | Erickson's hash-table "global rebuilding rules" = "the last reel's table under another name" | **Corrected** | E24, E25: the table grows at more than ¾ full, not at full. Now "the same grow-and-shrink pattern, growing at ¾ full instead of at full" |
| 23 | Tombstone example 8 of 16, cost 9; 524,289 at 1,048,576 | Confirmed | sim: [1 × 7, 9], live [1, 4, 5, 7, 9, 12, 13, 16] |
| 24 | Background rebuild: ≤ 9 writes per delete, old copy ≤ 11/28, new copy < ¼, ≤ 2 copies | **Corrected: 10 writes** | The example's costs 1, 1, 1, 7, 7, 3 leave out the log append: delete 2 writes its tombstone, **a log entry** and 6 copies. In this topic's unit a log entry is an element write, so the costs are **1, 1, 1, 7, 8, 4** and the bound is 1 + 1 + 8 = **10**. Executed at 1,048,576 keys, deleting all keys, smallest first, largest first and seeded random: max 10 writes (9 without the log), max 8 work units. Old-copy tombstone share max 0.3878, 0.381, 0.3839, all ≤ 11/28 = 0.393 (the planner's 0.3889 and 0.3846 come from an implementation detail; `examples.py` asserts its own). New copy starts at ≤ 0.167 ≤ 4/17. The proof's 8d ≥ S + d holds. Copies-only budget: one delete scans 262,152 slots (smallest first) and 349,528 (largest first) |
| 25 | dsbook: ≤ 3 finished blocks + 1 in construction per rank | Confirmed | D19, D20 and the lemma in the text |
| 26 | A write budget is not a time budget | Confirmed by execution | see 24 |
| 27 | Buffering updates during the rebuild and replaying them before the swap (Okasaki §5.2) | **Verified** | OK8; "started early enough" OK5 |
| 28 | Global rebuilding is Overmars's technique (1983) | **Verified, with a terminology correction** | OK3, OK12, OK13: "Overmars [Ove83] developed a technique for eliminating the amortization from batched rebuilding. He called this technique global rebuilding." So in Overmars's and Okasaki's sense, global rebuilding is the **incremental, worst-case** version (step 11). The all-at-once version (step 10) is Okasaki's "batched rebuilding" (OK1, OK2). dsbook (D1–D7) and Erickson (E22, L3, L5) use "global rebuilding" for the all-at-once version. The reel keeps dsbook's usage for step 10 and names Overmars at step 11; the Deep dive states both senses. Erickson L10 also credits Overmars with lazy balanced trees "in the early 1980s" (L1, L9). Overmars's book itself was not opened |
| 29 | Nodes hold key and two pointers; root holds size and max-size | Confirmed; quote added | G2, G3, G27 |
| 30 | α-weight-/α-height-balanced; ½ ≤ α < 1; loosely h ≤ h_α + 1; deep node triggers | **Confirmed with a correction to the range** | Page image p. 166: the weight-balance definition allows 1/2 ≤ α < 1, but the scheme fixes "1/2 < α < 1" (strict). At α = ½ an unbalanced node can have \|left − right\| = 2, so its potential isn't Θ(size). The loose bound (3.4) is for trees with deletes (Lemma 5.10). With inserts only, Theorem 5.1 (image p. 168) gives h(T) ≤ h_α(n) |
| 31 | h_α(n) = ⌊log_{1/α} n⌋ | **Verified** | Page image p. 166, the display "h_α(n) = ⌊log_(1/α) n⌋". Lemma 5.1's proof ends "at most log_(1/α) size[T]" (image p. 167; G41 in text). Figure 1: α = 0.57, h(17) = h(18) = 5 (recomputed: 5, 5). W1, W2 give the same formula in clean text (a lead only) |
| 32 | Insert as BST; if deep, climb to the first α-weight-unbalanced ancestor; rebuild ½-weight-balanced | Confirmed; OCR fixed | G11, G12, G15; G13's "l/a" is "1/2" on the image; G28 |
| 33 | Sizes computed on the way up; finding costs O(size) | Confirmed | G17; (4.5) read on the image. The image's "size(x₀) = 0" for the new leaf is a slip in the paper (a leaf has size 1); `examples.py` uses 1 |
| 34 | Alternative rule (4.6), preferred in their experiments | Confirmed; quotes added | G31–G33. **New:** on the step-12 example, (4.6) picks **31**, not 87. The checks: i = 4 at 87 with h(6) = 4 is not > 4; i = 5 at 31 with h(7) = 4 is. It rebuilds 7 nodes (insert cost 8). On a million sorted keys: 19.50 writes per insert, max 596,467, height 34. The Deep dive says so; step 13's question states the first-ancestor rule explicitly, so it stays correct |
| 35 | Rebuild O(size) time, space ∝ height; non-recursive 25–30% faster | Confirmed; quote added | G22, G23, G34 |
| 36 | Potential Δ(x) = \|size(left) − size(right)\| if ≥ 2; "accounting fiction"; rebuilt subtree 0 | Confirmed; quotes added | G18, G29, G30 |
| 37 | O(log n) amortized insert and delete; O(log k) worst-case search; searches don't restructure | Confirmed | G1, G19, G21, G10, G16 |
| 38 | Delete: if size[T] < α · max-size[T], rebuild all, reset max-size | **Verified** | Page image p. 167, (4.7) is strict "<"; G40 for the reset. Wikipedia writes "≤" (W3) and must not be followed: with "≤" the step-15 example would rebuild at size 6, after 3 deletes |
| 39 | Example tree, scapegoat 87, rebuild 6, delete rebuild 5, 333,334 / 666,666 | Confirmed | sim: depths 22:0, 18:1, 31:1, 87:2, 54:3, 51:4, 80:4, 63:5; h(8) = h(9) = 5; 69 at depth 6; shares 1/2, 2/3, 3/5, 5/6, 6/7, 7/9; insert cost 7; after the rebuild 63:2, 51:3, 80:3, 54:4, 69:4, 87:4, height 4. Deletes 18, 51, 69, 87 cost [1, 1, 1, 6], max-size reset to 5. **Convention:** this is the lower middle (root at index ⌊(s − 1)/2⌋). The paper's BUILD-TREE (image p. 170) gives the left subtree ⌈(n − 1)/2⌉ nodes, so its root is the upper middle, 69. Both are ½-weight-balanced and of height 4 here. The outline now fixes the lower middle and says so |
| 40 | Million sorted, α = 2/3: 28.24 per insert, p50 5, p99 246, **p99.9 2,463**, max 751,333 at 900,961; height 33; **depth ≤ 35**; random order 1.04, max 191, p99 1 | **Two corrections** | (a) The exact nearest-rank **p99.9 is 2,460** (2,463 is rank 999,001, the same off-by-one as claim 4). (b) The search bound is **depth ≤ 34** = h(10⁶). With inserts only, Theorem 5.1 keeps the tree α-height-balanced, and in the run a tracked upper bound on the height never exceeds h(n) after any insert (also in the 100,000-key sweep at all three α); "≤ 35" is the looser bound for trees with deletes. Everything else matches exactly (total 28,240,382; height 33; random: 1.043, max 191, p99 1, height 34). These numbers hold for the lower-middle build only. With the paper's upper-middle build they are 27.37 per insert, p50 1, max 851,156 at insert 917,094, height 32 |
| 41 | α sweep: larger α, fewer writes, taller | Confirmed; **the "to verify" resolved** | sim at 100,000 sorted: 55.74 / 19 / 15.76; 22.81 / 27 / 20.09; 17.04 / 40 / 27.09. The paper's Figures 4 and 5 (image pp. 173–174) agree with this: inserts get faster as α rises (uniform 1K: 9.46 → 3.83 s; sorted 1K: 21.25 → 13.94 s), and on uniform keys searches and deletes get slower (1.65 → 1.87 s, 3.49 → 6.88 s). The sentence G25 says the reverse of the paper's own tables: never cite it. W4 states the tables' direction |
| 42 | Sorted inserts noticeably slower than red-black and splay | Confirmed; quote added | G35 |
| 43 | Red-black: one extra bit, worst-case O(log n); splay: no worst-case search bound | Confirmed; quote added | G36, G6 |
| 44 | Technique generalises to k-d trees and other trees | Confirmed; **source corrected** | G24 doesn't say it; G38, G39 do |
| 45 | Average-case analysis left open | Confirmed, **dated** | G37: "open" as of 1993; not checked since. The Deep dive says "Galperin and Rivest left open (1993)" |
| 46 | No opened source gives a worst-case scapegoat tree | Stands as stated | The recipe applied, labelled as such |
| 47 | Andersson's general balanced trees | **Verified as a citation; paper not opened** | L1, L2, L8: Erickson credits scapegoat trees to "Arne Andersson in 1989" (WADS, LNCS 382) and "independently" to Galperin and Rivest in 1993, and cites "General balanced trees. J. Algorithms 30:1–28, 1999" (no issue number given). The Deep dive may name Andersson as the first discoverer through Erickson. It says nothing about the paper's content |
| 48 | Background activity and compaction cause spikes; queueing amplifies | Confirmed; quote added | TS6–TS8, TS25 |
| 49 | Remedies; Google's Web search time-slicing | Confirmed; quote added | TS17, TS19, TS26 |
| 50 | Variability can't be eliminated; tail-tolerant | Confirmed | TS4, TS5, TS21, TS22 |
| 51 | TZ frontier "cannot be made worst-case unless r = 2, because background rebuilding needs room for two copies: deamortization impossible" | **Corrected** | TZ23–TZ25, TZ19: the result needs N + O(N^{1−1/r}) temporary space during resizing (missing from the outline). "Cannot be made worst-case" is the authors' statement with their own reason, "Since background rebuilding cannot be used". The paper proves the Ω(r) amortized lower bound, not a worst-case impossibility. The planner's "room for two copies" reason and "impossible" are not in the source. Brodnik et al. "items are never moved" is TZ22 (TZ17 is only the first half of the sentence) |
| 52 | Ehrlich 1973, constant worst-case Gray-code increment | Confirmed; quotes added | E19, E26, E27. sim of Erickson's pseudo-code at n = 4: all 16 codes in his order, one bit per step, F trace equal to his, at most 4 array writes per increment |
| 53 | Amortized: no probability, worst-case total | Confirmed | E5, E8 |
| 54 | Persistence breaks amortization; scheduling recovers worst case | Confirmed | OK10, OK11 (this topic's own quotes now) |
| 55 (new) | Insert-only scapegoat trees are α-height-balanced (Theorem 5.1); loose +1 only with deletes | Added | image p. 168; sim checkpoints |
| 56 (new) | In Overmars's sense global rebuilding yields worst-case bounds; batched rebuilding is the amortized one | Added | OK1, OK3, OK10 |
| 57 (new) | Scapegoat trees: Andersson 1989, Galperin and Rivest 1993 independently | Added | L1, L2; W5 |

Other numbers, all recomputed and confirmed:

- Vector traces:
  - plain 16: [1, 2, 3, 1, 5, 1, 1, 1, 9, 1 × 7] = 31;
  - incremental 16: [1, 2, 3, 1, 3, 3, 1, 1, 3, 3, 3, 3, 1, 1, 1, 1] = 31;
  - appends 9–12: [9, 1, 1, 1] and [3, 3, 3, 3].
- The race after append 9: left 6, free 7; then left 4, 2, 0 and free 6, 5, 4.
- After append 10: n 10, k 4, m 8; get(1) = 2 from new, get(5) = 6 from old, get(9) = 10 from new.
- After append 9: k 2, the buggy get(5) is an empty slot; index 5 moves on append 11. A buggy set below m is overwritten by the later move.
- Rate 1 ends at 16 of 16.
- Space:
  - 3,145,728 slots = 24 MiB, n = 1,572,864;
  - billion: copies 1,073,741,823, total 2,073,741,823, largest plain append 536,870,913.
- Math checks:
  - h₀.₈(9) = 9, no rebuild in the α = 0.8 run;
  - log₁.₅ 9 = 5.42; 1.5⁵ = 7.59, 1.5⁶ = 11.39;
  - h(10⁶) = 34;
  - 11/28 = 0.393, 4/17 = 0.235.
- More questions (d): 1 − (1 − 0.349515)¹⁰⁰ = 1 − 2·10⁻¹⁹, which is "essentially every request".

## Red team: attempts and outcomes

1. **Percentile ranks (broken, fixed).** Both p99.9 values in the outline (521,292 and 2,463) sit one rank too high. `examples.py` must compute rank = ⌈p·N/100⌉ with integers (for p = 99.9: (999·N + 999) // 1000) or `Fraction`, never with a float. The test is the queue's arithmetic progression 524,289 − 3j, which pins the right value.
2. **Pop paths and shrink interaction (holds).**
   - *Pop finishing a migration and then starting a shrink:* a pop that finishes a migration and starts a shrink in the same operation would cost 1 + 2 + 2 = 5. The exhaustive search shows it never happens: after a grow at c the copy ends within (c − 2)/2 operations while a shrink needs over c/2 pops, and symmetrically after a shrink.
   - *Pops during a migration:* a pop of an unmoved key lowers m. A key popped and pushed again lands in the new buffer at index n, above m, so the read rule `k ≤ i < m` stays right; the random runs compare every read.
   - *Popping to empty:* freeing at n = 0 while migrating works, since m = 0 ends the migration first.
3. **Reads during the copy (holds; one hole is already guarded).** The read rule is right for `get`. `set` must use the same rule, or the next move overwrites it (executed). A migration-aware iterator must too (Deep dive). An off-by-one at the frontier (`k < i` instead of `k ≤ i`) would read index k from the new buffer before it is moved; `examples.py` should assert `get(k)` during a migration.
4. **Off-by-one in the 2-moves schedule (holds).** The append that starts the migration moves 2 at once (append 9 costs 3), so the copy of c ends on append c + c/2, at n = 1.5c. If the first moves started one append later, the copy would end at 1.5c + 1; still in time, but the step-5 strip (3, 3, 3, 3) and step 7's "12 of 16" would change. The storyboards match the header design.
5. **"Why 2 and not 1?" (gap, fixed).** A learner who reads step 7's explain ("1 per append would end exactly at full") can infer that 1 suffices, with a worst case of 2 instead of 3. That is correct (claim 12a). The Deep dive now says so and gives the reasons for 2. Prove it 1's distractor "1,048,576 appends; 2 writes" describes that valid design. Its explanation already says "not this one", which is right.
6. **Scapegoat ties and the α range (holds; caption sharpened).**
   - At 80, 2 of 3 = α exactly is allowed (3.1 uses ≤); `examples.py` uses exact fractions.
   - At α = ½ the scheme isn't covered by the analysis (claim 30).
   - At α = 0.8 nothing is deep in the example, which the More question uses.
   - With (4.6) the scapegoat is 31 (claim 34). Step 13's question names its rule, so its answer 87 is right.
   - The "54 looks lopsided" distractor holds: 3 of 5 = 0.6 < 2/3.
7. **Deletes in the scapegoat tree (caption fixed).** "Deletes never make a node too deep" is false in the paper's terms. A delete moves no node down, but it shrinks n and so h_α(n), and a node at depth h_α(n) can become deep. That is exactly why (3.4) has "+ 1" and why max-size exists (Lemma 5.10). The caption now says "never push a node deeper". The example's four deletes and the reset to 5 are confirmed.
8. **Tombstone queries (broken, fixed).** With half the slots tombstones, "binary search, then step to the nearest live key" is not O(log n). Delete keys smallest first and a predecessor query walks a run of up to 39% of the slots (in the background design) or 50% (amortized). A tombstone keeps its key, so *membership* stays O(log n). Step 10's query is now a lookup; the Deep dive states the predecessor walk as a cost tombstones hide.
9. **Background-rebuild accounting (broken, fixed).** See claim 24: the log entry is a write. The proof's work bound is unchanged.
10. **Predict 1 (step 2).** Tested whether "about 2" could be defended as a percentile: no, it is the mean. "524,289" is the max (p100). The answer 1 holds for p99.99 too (rank 999,900 < 999,981). The correct option is not the longest.
11. **Predict 2 (step 7).** 12 holds. "It overflows first" is wrong even at rate 1 (claim 12a). "16" is the rate-1 answer, which the explain names.
12. **Predict 3 (step 13).** Holds under the stated rule. A pedant's objection: the paper's preferred rule gives 31. This is answered in the Deep dive, not the question.
13. **Prove it 1.** 524,288 appends and 3 writes hold. The window is appends 1,048,577 … 1,572,864, both buffers 3,145,728 slots = 24 MiB. Distractor 4 (4 keys per append: 262,144 appends, 5 writes) holds.
14. **Prove it 2.** Holds: new slots 2–7 are empty and slot 8 holds key 9. "An index error" is wrong because the new buffer has 16 slots.
15. **Prove it 3.** Holds within the model. Tried: "the incremental version halves peak memory": false, both peak at 3c, the incremental one holds it c/2 appends longer. "Reads get slower" is one comparison per read; it stays in the correct option as stated. 2³⁰ − 1 copies either way confirmed.
16. **Time model (labelled).** Every request number comes from this topic's model (one server, arrival order, a request every 4 ticks, one tick per element write, allocation free). The outline already says so. Step 1's caption now says "a model service", so no reader takes 494,289 ticks for a measurement. The gap-3 and gap-8 runs show the qualitative result doesn't depend on the gap.
17. **Fan-out (step 4).** 63% assumes independent servers. The source's scenario is hypothetical and its own Table 1 is the measured case; the Deep dive keeps that distinction.

## Outdated or superseded items

- Tarjan and Zwick: arXiv v2 (29 May 2023) is still the latest version (the abs page lists v1 and v2).
- Galperin and Rivest's open problem (average case) is from 1993; it is stated as theirs, dated, and not claimed open today.
- JLS: the current edition (Java SE 26) was used.
- Erickson's lecture notes are Fa'13 (© 2018). They are cited only for history and for the global and partial rebuilding rules, which have not changed.
- Wikipedia (revision 1378893949) is a lead only, and differs from the paper on the delete trigger (≤ vs <).
- Terminology: "global rebuilding" has two meanings in the sources. That is not outdated, but it must not be blurred (claim 28).

## Length

- The outline has 20 steps, about 14 minutes. CHAPTER.md asks for about 13.
- The last two reels have 19 steps each, with 1,495 and 1,734 narration words (about 10 and 11.6 minutes of narration plus reveals).
- This topic carries more mechanisms.
- Steps 5 and 8 show the same thing (spiky plain strip, flat 2-moves strip, equal totals) at two zoom levels.
- The outline now tells the builder to build 19 steps (about 13 minutes) by merging step 8 ("Same 31 writes, no spike") into step 5. The merged step shows the 16-append strips with the gauge draining over appends 9–12; its storyboard and caption are written out in the outline.
- Fallback if the narration still runs over about 1,750 words: fold step 15 ("Deletes rebuild the whole tree") into step 16's caption and the Deep dive.
- Steps 4, 10 and 11 must not be cut: they carry the syllabus's p99 clause and both forms of global rebuilding.
- See "Length (fact-check)" in `OUTLINE.md`. Its step numbers elsewhere refer to the planner's 20-step numbering unless noted.

## Corrections applied to `OUTLINE.md`

1. Header:
   - the design's "why 2" and rate-1 note;
   - the 17,570 state key;
   - the time model said on screen as a model.
2. Outcome 2: 10 writes. Outcome 3: ½ < α < 1; depth bound.
3. The problem paragraph unchanged (numbers confirmed).
4. Step 1 caption: "a model service".
5. Steps 3 and 17: p99.9 521,289.
6. Step 7 explain: rate 1 works with zero slack, so the topic's 2 is a choice.
7. Step 9: the zeroing line dropped.
8. Step 10:
   - lookups, not predecessor queries;
   - a tombstone keeps its key.
9. Step 11:
   - costs 1, 1, 1, 7, 8, 4;
   - dashed line at 10;
   - caption names Overmars and says 10;
   - real values updated.
10. Step 12: α strictly between ½ and 1; n counts the new node.
11. Step 14: the lower-middle convention named (63, not the paper's 69).
12. Step 15: caption "never push a node deeper" (kept as a step; the fallback fold into step 16 is described in "Length (fact-check)").
13. Step 16:
    - p99.9 2,460;
    - depth ≤ 34 (Theorem 5.1);
    - caption updated;
    - the rebuild convention and the paper-convention numbers noted.
13a. Steps 5 and 8: merged into one step 5 (storyboard and caption written in "Length (fact-check)"); old step 8's title retired from the coverage plan.
14. Deep dive:
    - percentiles (exact ranks, 521,289);
    - incremental copying (rate 1, g = 1.5 zero slack at every resize, allocation and JLS, frontier);
    - global rebuilding (two meanings, Overmars through Okasaki and Erickson, Erickson's ¾ rule, the tombstone predecessor walk);
    - background (10 writes, Okasaki §5.2 verified);
    - scapegoat (h_α and (4.7) verified from the page images, ½ < α < 1, Theorem 5.1, (4.6) picks 31, BUILD-TREE convention, the α tables vs the sentence, Andersson);
    - spreading (Andersson through Erickson);
    - frontier (TZ's temporary-space condition and wording, the 1993 open problem dated);
    - Build, break, measure (Break it 1 rewritten);
    - More questions (a), (b), (d);
    - Sources.
15. Examples:
    - exact percentile ranks;
    - p99.9 values;
    - 10-write bound and costs;
    - g = 1.5 zero slack at every resize;
    - rate-1 exhaustive check;
    - height ≤ h(n) for insert-only runs;
    - (4.6) on the example;
    - lower-middle build;
    - `get(k)` during a migration.
16. Claims list: rows 4, 6, 12, 16, 17, 22, 24, 27, 28, 30, 31, 32, 34, 38, 40, 41, 44, 47, 51, 52 updated; rows 55–57 added; quote ids extended.
17. Lexicon: Overmars (verified), Andersson, Okasaki added.
18. "Length (fact-check)" section and Progress entry added.

## Notes

- `sources/` holds duplicate caches under short names (`galperin-rivest.txt`, …) and URL-derived names. `sources.mjs check` uses the URL-derived ones. The texts are identical.
- Overmars's book (LNCS 156), Andersson's papers, Brodnik et al. (WADS 1999) and Sitarski (1996) were not opened. Each is cited only through an opened source (Okasaki, Erickson L10, Tarjan and Zwick).
- Open Data Structures' scapegoat chapter was fetched as a candidate clean source. Its formulas are images in the HTML, and its variant (a counter q ≥ n, log_{3/2} q, rebuild when q > 2n) is not Galperin and Rivest's, so it is not cited.
- The page images were read at 150 dpi from `GR93.pdf` and are not committed. Anyone re-checking can run `pdftoppm -r 150 -f 2 -l 10 -png GR93.pdf p` on the URL in `SOURCES.md`.
