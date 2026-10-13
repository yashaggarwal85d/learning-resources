# Fact-check: Aggregate and accounting methods (2026-10-12, against raw source texts)

Adversarial re-check of `OUTLINE.md` (claims list, storyboard, Deep dive plan, examples plan) by an agent that did not write it (ROUTINE.md 2.3). Each claim was re-derived from the raw texts in `sources/`: Erickson Lecture 9 (`erickson-amortize.txt`), CMU 15-451 Lecture 7 (`cmu451-amortized.txt`), Sedgewick and Wayne §1.3 (`algs4-13stacks.txt`), and Okasaki's thesis (`www_cs_cmu_edu_rwh_students_okasaki_pdf.txt`, fetched by this check with `node scripts/sources.mjs fetch`). Every number was recomputed by independent Python simulations of the chapter's rule (`grow(cap, g) = 1 if cap == 0 else max(ceil(g·cap), cap + 1)`, g = 1.5 as `Fraction(3, 2)`, one unit = one element write): the small trace, g = 2 and g = 1.5 at n = 1,000,000, every bank under charges 2, 3 and 4, the partner coin scheme cell by cell to n = 2¹⁷, the counter (plain, wrapping, weighted, with decrement), the multipop stack on 2,000 seeded random sequences, multipush, additive growth, and the Deep dive extras. `sources.mjs check`: 85 quotes, 0 problems (62 before, 23 added by this check). CLRS and Tarjan 1985 could not be opened; Tarjan appears only as Okasaki credits him.

## Claims

| # | Claim (OUTLINE.md claims list) | Verdict | Source / evidence |
|---|---|---|---|
| 1 | Amortized cost = total of n operations ÷ n, worst-case total over any sequence | Confirmed | M Definition 7.1 (total ÷ n); E "Summation Method ... T(n) be the worst-case running time for a sequence of n operations" supplies "worst-case" |
| 2 | "Aggregate method" is the textbook name | Confirmed | E: "Most textbooks call this particular technique "the aggregate method"" |
| 3 | No probability; averaging over a sequence | Confirmed, sharpened | E "There is no probability involved"; M "just averaging over time". Red team: bounds can combine both (SW: "constant expected amortized time"), so the Deep dive now says "amortized" alone means no probability (claim 28 added) |
| 4 | Worst case per operation too pessimistic when expensive ops are set up by cheap ones | Confirmed | M 7.1 quote |
| 5 | Doubling: copies ≤ 2n − 1, total < 3n, amortized < 3 | Confirmed | M 7.3 quote; executed: copies < 2n and total < 3n for every n ≤ 2²⁰; exact form (n − 1 at powers of two, 2^(k+1) − 1 ≤ 2n − 3 otherwise) holds for every n < 2²⁰ |
| 6 | 16-append trace 1, 2, 3, 1, 5, 1, 1, 1, 9, seven 1s = 31; at 10⁶: 1,048,575 copies, 20 resizes, last 524,288 at append 524,289, total 2,048,575, final capacity 1,048,576, 999,980 appends of cost 1 | Confirmed | executed |
| 7 | Charge 3 = 1 write + 2 banked; L-copy paid by ≥ L/2 pushes since the last resize | Confirmed, made precise | M 7.4 quotes; under the chapter rule the L/2 pushes include the resizing push (appends 5–8 for L = 8). Partner scheme executed: after appends 8 and 16 every key holds one coin, spare 1, bank = 2n − cap + 1 for every append (to 2¹⁷). M "the potential is twice the number of elements in the array after the midpoint" (= 2n − cap) quoted and added |
| 8 | Bank must never go negative; drifting negative breaks the proof | Confirmed | M quotes; executed banks for charges 2, 3 (below) |
| 9 | Accounting = taxation; tight schedules "barely stay in the black" | Confirmed | E quotes |
| 10 | Seed when the bank does not start at 0; bounds are from a start state | Confirmed | M "seed" quote and "at most cn plus the initial seed amount"; executed: from a full 16-key vector the first append costs 17 > 3 |
| 11 | Grow-by-one n(n + 1)/2, (n + 1)/2 per op; fixed steps quadratic | Confirmed | M 7.3 quote; executed: 500,000,500,000 (k = 1), 500,500,000 (k = 1,000), within 0.1% of n²/(2k) + n |
| 12 | Growth factor g: < g/(g − 1) copies per append, trough about 1/(g − 1), charge 1 + g/(g − 1); g = 1.5 counts | Confirmed by derivation and execution, one value corrected | No opened source states it (gap kept). Executed: copies/n < g/(g − 1) at every n ≤ 10⁶ for both g (max 1.99999, 2.99997); g = 1.5: 2,099,719 copies, 33 resizes, last 699,912 at 699,913, final capacity 1,049,868, capacities 1, 2, 3, 5, 8, 12, 18, 27, 41, 62. Charge 1 + g/(g − 1) valid for g = 5/4, 3/2, 2, 3 (min bank 5, 3, 2, 1.5); proof: c' ≤ c/g even with rounding up, so at least c(g − 1)/g appends each banked g/(g − 1) since the last resize. **Corrected:** the g = 1.5 peak for n ≥ 1,024 is above 2.98, not 2.99 (2.9878 at append 1,066; above 2.99 from append 1,599). Troughs above 0.99 and 1.99 confirmed (min 0.99902, 1.99061) |
| 13 | SW's resizing stack doubles when full, starts with an array of 1 | Confirmed | SW quotes |
| 14 | Counter: bit i flips ⌊n/2ⁱ⌋ times; exactly 2n − #1(n); O(log n) worst, O(1) amortized; naive O(n log n) | Confirmed | E quotes; executed to n = 10⁵; 1,999,993 at 10⁶ (popcount 7) |
| 15 | Counter accounting 2 per increment; each increment sets exactly one bit | Confirmed (unbounded counter) | E "Increment Revenue Service"; M "exactly one 0 → 1 flip". Red team: false for the increment that wraps a fixed-width counter (sets none); Deep dive now says so |
| 16 | 16 increments flip 31; vector's 16 appends also 31; both 2^(k+1) − 1 at 2ᵏ | Confirmed | executed for k ≤ 12 (and analytically for all k) |
| 17 | Multipop: n ops cost ≤ 2 × pushes ≤ 2n; charge push 2, others 0 | Confirmed | math; executed on 2,000 seeded sequences (bank = stack size on every prefix, total ≤ 2n − 2 for n ≥ 2). Gap kept: no opened source works it; E 6(a) MultiPull quote added to SOURCES.md |
| 18 | MultiPush + MultiPull force Ω(n) amortized | Confirmed with scope | E 6(b) quotes added. Red team: E 6(c) asks for a structure that makes both O(1) amortized, possible because E's MultiPush inserts k **copies** of x; the topic's multipush of k given keys must write each, so its answer stands; Deep dive now distinguishes them |
| 19 | Charging overestimates the total, so the bound holds for any sequence | Confirmed | E 9.2.3 quote |
| 20 | Accounting fits costs attached to components; methods equivalent; bounds not unique | Confirmed; **CMU footnote dropped as false** | E quotes. M footnote "$3 per push and $−1 per successful pop" is word for word but false in its own cost model: push, push, pop, pop costs 5 > 4; pushing 1,025 keys and popping them all costs 4,097 > 2,050. Replaced by executed valid pairs (3, 1), (4, 0), (5, −1), each checked on every prefix of 3,000 seeded push/pop sequences |
| 21 | Decrement breaks the counter (alternate 2ᵏ and 2ᵏ − 1) | Confirmed | E 9.3 quote; executed: 5-bit counter at 15, 8 alternating ops, 40 flips |
| 22 | Reusing an old version breaks an amortized bound | Confirmed with scope; source added | Okasaki: "Traditional methods of amortization break down when old versions ... are available", "savings can only be spent once"; but lazy evaluation restores amortized bounds under persistence (same source). Now said of credit proofs, not every amortized structure. Executed: 10 appends to one full 16-key version cost 170 |
| 23 | 100 × 1 + 100: 200/101 < 2 | Confirmed | M quote; 1.980 |
| 24 | Weighted counter (bit k costs 2ᵏ): total ≤ n(lg n + 1), O(log n) amortized | Confirmed, quoted | M 7.6 quotes added ("at most n(lg n + 1)", "actually 2n − 1"); executed: 80 at n = 16, dearest increment 31, bound holds to n = 4,096 |
| 25 | Gray-code counter in constant worst-case time | Corrected (scope and credit) | E 9.4: the constant-time algorithm is Ehrlich's (1973) and "only handles increments"; the naive Gray-code increment is Θ(log n). The Deep dive had named the Gray-code counter as a fix for increment **and** decrement: removed |
| 26 | Amortization applies to any sequence of numbers | Confirmed | E 9.5 quote |
| 27 | Names "banker's" and "physicist's" | Resolved by a new source | Okasaki: "Tarjan [Tar85] describes ... the banker's method and the physicist's method", credits "associated with individual locations", "the two methods are in fact equivalent". The topic may now say "Okasaki credits them to Tarjan (1985)"; "banker's view" (CHAPTER.md's wording) appears in no opened source, so "method" is used |
| 28 | (added) "expected amortized" combines both | Confirmed | SW exercise quote |
| 29 | (added) Θ(k) when the first k bits (the trailing 1s) are 1; charging resets to sets; exercise numbers 1(c), 6, 11(a) | Confirmed, one number corrected | E quotes added; the queue from two stacks is exercise **11(a)**, not 10 |

## Quotes in SOURCES.md against the claims they back

All quotes support the claims they are cited for, with three exceptions: the CMU footnote on pops (true quote, false claim: dropped, warning added next to it in SOURCES.md); Erickson's "use the aggregate method here, because we don't know what the sequence of operations looks like" is about his double counter, and is read as "summing directly is awkward", not as a limit on the definition (the Deep dive now says so); Erickson's Gray-code quote is about increments only (scope added). Quotes the outline asked the fact-check to add are added (claims 18, 24, 25), plus new ones for 7, 22, 27–29.

## Corrections made (OUTLINE.md, each marked "Fact-check" in place)

1. Outcome 3: "reached just after a resize" → approached, never reached (the bound is strict).
2. Step 5 caption: "one append can still cost n + 1" → "one of them can still cost n" (n is the number of appends; the dearest is append n when n − 1 is a power of two).
3. Step 6: append 9's own charge also leaves coins on key 9 and key 1; the plan showed none and labelled its whole charge as paying its write.
4. Step 7: four ticks (appends 2, 3, 5, 9), not three; the bank is exactly 3 just after every resize.
5. Step 8 caption: "Only geometric growth ..." overclaimed → "Growing by a constant factor makes the copies a geometric series that sums to O(n)".
6. Step 9: one scale (last copy 160 units) from the question frame on; tile separators drawn inside tiles (2-unit gaps would push the g = 1.5 row to about x 540).
7. Step 10 and examples item 9: g = 1.5 peak above 2.98 (not 2.99) for n ≥ 1,024.
8. Step 14: the vector's spike is set up by 4 appends (5–8), 2 coins each, not "8 appends".
9. Step 16 visual: the coins come from the 262,144 appends since the previous resize plus the spare, not from "the 524,288 earlier appends".
10. Deep dive "The doubling vector": CMU's pop footnote replaced by executed valid charges; CMU's potential quote linked to the bank formula.
11. Deep dive "The binary counter": wrap counter's bank (popcount + 2 per wrap); Gray code is not an increment-and-decrement fix, Ehrlich's algorithm is increment-only; Erickson's "can't use the aggregate method" scoped.
12. Deep dive "The multipop stack": k > size, empty multipop, a per-call-cost variant (still ≤ 2n), tightness (2n − 2), Erickson 6(a)–(c) and why copies differ from given keys.
13. Deep dive "Choosing a method" and "The frontier": names credited through Okasaki; persistence remark scoped to credit proofs, lazy evaluation as Chapter 13's repair; Ehrlich credited.
14. Deep dive "The definition": "expected amortized" exists (SW).
15. Step 16 caption's last sentence and the bridge note: the shrinking vector lacks a place for its pops' savings, not "loses the coins on the keys it pops".
16. More questions: exercise 11(a); answers (a) 12,277 at n = 1,024 and (c) 699,051 recorded.
17. Examples plan: bank 3 after every resize; push/pop charge pairs; float vs Fraction capacities; lab prediction table values; weighted counter's dearest increment; wrapping counter.
18. Claims list, coverage plan (Okasaki as a fourth source), "Changes from the chapter plan" item 2 (attribution) and new item 5, Progress.

## Red team

| Attack | Result |
|---|---|
| g = 1.5 rounding: does `ceil` change the counts or the bound? | Capacities 1, 2, 3, 5, 8, 12, 18, 27, 41, 62, …; rounding up only makes the ratio between capacities ≥ 1.5, so the bound stays strict and charge 4 still holds (min bank 3). Float `1.5 * cap` gives the same capacities as `Fraction(3, 2)` for 60 resizes. The empty fraction just after a resize ranges 0.25–0.33 for capacities ≥ 8 (within one slot of a third): "a third empty" is right as an approximation only |
| First appends and capacity 0 | Append 1 costs 1 (allocation not counted), no copies; its third unit has no old half (the spare). Bank after append 1 is 2, the minimum for every n ≤ 10⁶ |
| Charge validity for g = 1.5 | Charge 3 first negative at append 9 (bank −1) and drifts to −699,893 by append 699,913; charge 4 never negative (min 3); charge 2 negative from append 4 |
| Charge 2 for g = 2 (Prove it 1) | First negative at append 5 (−2), +1 at every power of two, minimum −524,286 at append 524,289: all confirmed. "The 3rd" (exactly 0) is a fair distractor |
| Multipop with k > size, k = 0, empty stack | min(k, size) handles all; cost 0 on empty under the key-in-or-out unit; with a per-call cost the per-operation O(1) still holds (total ≤ n + pushes ≤ 2n) but "≤ 2 × pushes" does not: now in the Deep dive |
| Counter overflow (fixed width) | The wrap increment resets every bit and sets none; bank stays ≥ 0 (executed, 3 bits, 100 increments) but exceeds the number of 1 bits by 2 per wrap; step 12's "coins = number of 1 bits" is for the unbounded counter, which the reel uses |
| "No probability" | Holds for "amortized" as defined (E, M); broken only by the explicit combination "expected amortized" (SW), now mentioned |
| Persistence remark | Holds for credit and potential proofs (Okasaki's queue: n² + n when one version is reused); Okasaki's lazy structures keep amortized bounds under persistence, so the statement is now scoped |
| Step 14 "8 appends set up append 9" | Broken: only 4 appends' coins reach append 9 (appends 1–4's were spent at append 5). Fixed |
| Step 16 "a vector that shrinks loses the coins on the keys it pops" | Weak: a popped key's coin can pay for that pop; what a shrink lacks is a place for the pops' savings (the problem statement's "nowhere to keep the coins"). Reworded |
| Step 5 "one append can still cost n + 1" | Broken with n = number of appends. Fixed |
| Prove it 3: is "No" right? Could a smarter structure save multipush? | Not for k given keys (each must be written); yes for k copies of one item (Erickson 6(c)). The topic's wording is k keys, so the answer stands |
| Step 2 distractors | 1,000,000 × 524,289 = 524,289,000,000 and 1,000,000 × 20 = 20,000,000 confirmed; "True as an upper bound" for 524 billion is right (every append costs ≤ 524,289 within the first million) |
| Prove it 2 | 3 × 699,912 = 2,099,736, within 0.001% of 2,099,719; no resize between 699,914 and 1,000,000 (next at 1,049,869) |
| More questions (c) | 699,051 (first n with 1,048,575 / n < 1.5) |
| Step 10 "1.05" and "2.10" | 1.0486 and 2.0997, both round as shown. Lab prediction table: g = 2: 1.02, 1.64, 1.31, 1.05; g = 1.5: 2.12, 2.43, 2.76, 2.10 at n = 10³…10⁶ |
| Additive growth | Grow-by-1,000 starts at capacity 1,000 (the plan's choice); with the chapter's "first append allocates 1" it would be 1, 1,001, …, and the total changes slightly. The plan states its choice, so no change; the builder must keep "first allocation 1,000" in the code |
| Step 1 drawing | 20 resizing appends at 2ᵏ + 1, k = 0…19; spike heights at 190 units for 524,289 give 95, 47.5, 23.7, 11.9: "only the last four or five visible" holds |
| Pixel arithmetic (steps 2, 3, 7, 8, 9, 11–13, 15, 18) | Rechecked: 2,048,575 → x 368; log positions 496 / 256 / 65; 1,000,000 bar 229 units in step 18; all inside x ≤ 536 except step 9's gaps (fixed) |

## Currency

- Erickson's notes: the fetched PDF is the file now served at the URL (Lecture 9 [Fa'13], © 2018); its footer sends readers to the course page "for the most recent revision", and no other revision of this lecture was looked for, so the version is cited as fetched.
- CMU 15-451 Lecture 7 is the Fall 2011 handout; later offerings exist but nothing quoted is superseded. Its pop footnote is wrong (above) and is not used.
- Sedgewick and Wayne booksite §1.3: current page, nothing outdated for this topic.
- Okasaki's thesis (1996) is the original of the 1998 book; the quoted passages are the thesis's. No newer claim depends on it.
- No library, language or system behaviour is claimed, so no version-dependent facts.
