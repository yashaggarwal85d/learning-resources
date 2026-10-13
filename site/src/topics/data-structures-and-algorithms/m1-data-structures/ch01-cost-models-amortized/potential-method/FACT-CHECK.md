# FACT-CHECK: The potential method (`dsa.potential-method`)

Fact-check of `OUTLINE.md` (ROUTINE.md section 2, step 2.3), 2026-10-12, by an agent that did not write the plan. Every claim was re-derived from the raw texts in `sources/` (Tarjan 1985, Erickson Lecture 9, Blum CMU 15-451 Lecture 7, Waterloo CS466, Sleator and Tarjan 1985, Wayne's Kleinberg–Tardos Fibonacci-heap slides, Okasaki's thesis, Lambert et al. 2023). One further page was fetched with `scripts/sources.mjs` (the arXiv abstract page of 2308.09021, to check for a newer version: only v1 exists, so the paper is not superseded). Every number was recomputed by an independent Python simulation (exact `Fraction` arithmetic) written for this check, not by `examples.py` (which does not exist yet).

**Result:** 7 corrections applied to `OUTLINE.md`, 15 quotes added to `SOURCES.md` (74 → 89; `node scripts/sources.mjs check` passes: 89 found word for word, 0 problems). Everything else holds.

Verdicts: **OK** (verified as stated), **FIXED** (wrong or overstated; corrected in `OUTLINE.md`), **NOTE** (true, with a caveat the builder must keep).

## Corrections (applied to OUTLINE.md)

1. **The ½-shrink's amortized cost.** Claim: "the ½-shrink's ĉ = cap/2 − 2 (30, 62, 126 for cap 32, 64, 128)" (step 13 real values, DD "Thrashing", claim 29, ex 10). **FIXED.** Evidence: from (cap/2, cap) the pop costs cap/2 and lands at (cap/2 − 1, cap/2) with Φ = cap/2 − 2, so ĉ = cap/2 + (cap/2 − 2) − 0 = **cap − 2** (simulated: 6, 14, 30, 62, 126, 254, 510, 4,094 for cap 8 … 4,096). The listed values 30, 62, 126 were right; the formula gave 14, 30, 62. Correction: "ĉ = cap − 2, cap the capacity before the shrink".
2. **ex 16, a = ½ "254 at capacity 512".** **FIXED.** BFS to capacity 512 under shrink-at-½ gives a maximum pop ĉ of **510** (the shrink from (256, 512)); 254 is the shrink from capacity 256. Correction: "cap − 2: 510 for the shrink from capacity 512, 4,094 from 4,096".
3. **Step 12 footnote `capacities 0, 1, 2: ĉ ≤ 2`.** **FIXED.** False as written: the grow (1, 1) → (2, 2) and the push (1, 2) → (2, 2) have ĉ = 3. Only the four edge transitions (first push 2; push into an empty capacity 1, 3/2; shrink 2 → 1, 3/2; pop that frees capacity 1, 0) are ≤ 2. Correction: `edge cases at capacities 0–2: ĉ ≤ 2`, with the four transitions named for the builder.
4. **"Just after every resize Φ = 2"** (step 8 caption "2 then", DD, claim 15, ex 1). **FIXED.** After append 1 (cap 0 → 1, n = 1) Φ = 2·1 − 1 = **1**; Φ = 2 only after a grow that copies (appends 2, 3, 5, 9, …). An `examples.py` assert "just after == 2" over every resize would fail on append 1. Step 8 caption now says "2 just after a grow, n when full"; DD and ex 1 say "every copying grow (1 after append 1)".
5. **Tarjan 1975's union–find variant** (DD "union by rank with path compression"). **FIXED.** Tarjan 1985, describing his own [29] = J. ACM 22 (1975), says "we use union by size" and "Union by size was proposed by Galler and Fischer [11]; Mcllroy and Morris devised path compression [2]" (T22–T23, added). The Waterloo notes state the theorem for union by rank; Lambert et al. use union by size (L15). Correction: "union by size with path compression (Tarjan 1985's description; Waterloo states it for union by rank)", plus Tarjan 1985's "assuming m = Ω(n)".
6. **Lambert et al.'s O(α(n)) potential "without an explicit Ackermann function"** (DD, claim 38). **FIXED.** Their Section 6 is titled "Proof Using the Original Definition of Ackermann Functions" and the paper says it gives the O(α(n)) bound "using the more classical recursive definitions in Section 6" (L10, added); its potential is built on r(p) = ⌊log Sizemax(p)⌋ and summed over Ackermann levels (L11–L12). The "no explicit definitions" sentence (L6) describes the size-based route (Section 5, through log** n via the iterated-log characterization), and beyond log* n their potentials involve "both a node and its parent" (L13). Correction applied in the DD and claims 38–39.
7. **Erickson exercise 9 "worst observed about 2.6"** (More questions (a), ex 17). **FIXED** (not reproduced). With minimum capacity 4, insert/delete 1 and a rebuild costing the n elements reinserted, pure insertions reach 292 writes in 97 operations (3.01 per operation; the ratio approaches 3); 300 seeded random sequences of 3,000 operations peak at 3.01 over prefixes. The bound "at most 4" holds. Correction: "pure insertions approach 3 (97 insertions: 292 = 3.01 per operation)".

Smaller wording fixes, also applied: step 6 caption "Tarjan's paper opens with this stack" → "Tarjan's opening stack (pops, then a push, per operation) gets the same bound" (the reel's multipop stack is not Tarjan's operation: T21); outcome 4 "first analysed by Tarjan in 1975" → "given its first precise analysis" (Waterloo's words; Lambert et al. cite earlier analyses such as [HU73]); step 14 "about a quarter of the capacity from both thresholds" → "at least about a quarter" (from (17, 32) the grow is 16 pushes away, half the capacity); step 18's "2.1 million counts only the first round's copies" → "assumes only the first round resizes" (matches ex 14's 2,097,155 + 3,996); the DD's Tarjan formula is marked as reconstructed from the garbled extraction; Fibonacci Φ attributed as "the potential Wayne's slides use to prove the theorem they credit to Fredman and Tarjan (dated 1986 on the slide)" rather than as Fredman and Tarjan's own wording (FH8, added).

## Claims list, one by one

| # | Claim (short) | Verdict | Evidence | Correction |
|---|---|---|---|---|
| 1 | ĉᵢ = cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁), Φ of the whole state | OK | E2 verbatim "ai = ci + Φi − Φi−1"; E1 "a function of the entire data structure"; T8 prose (symbols lost in extraction) | DD marks Tarjan's formula as reconstructed |
| 2 | Telescoping: total actual = total amortized + net decrease | OK | T9 "plus the net decrease in potential"; ST2 same words; B6; simulated Σc = Σĉ + Φ₀ − Φₘ on every run | — |
| 3 | Φ₀ = 0, Φ ≥ 0 ⇒ bound; = banker's with no borrowing | OK | T10 verbatim incl. "(This corresponds to the banker's view of amortization with no borrowing.)"; E5, B5, O2 | — |
| 4 | Erickson validity Φᵢ − Φ₀ ≥ 0; Blum's seed | OK | E3, B7 | — |
| 5 | Bound holds after every prefix | OK | T5 ("any initial part of a sequence"), derived (a prefix is a sequence) | — |
| 6 | Physicist's view proposed by Sleator; "entirely equivalent"; fractions | OK | T11 "proposed by D. Sleator (private communication)"; T14 verbatim | — |
| 7 | Banker's view: coin-operated credits; accounting device | OK | T4, T6 | — |
| 8 | Okasaki: Tarjan describes both; conversion; equivalent | OK | O1 ("describes", not "introduced"), O3, O4; okasaki.txt l. 965 for banker → physicist | — |
| 9 | Potential argues globally; = unspent taxes for the counter | OK | E6 | — |
| 10 | Good Φ rises a little, falls a lot; no general technique; different Φ, different bounds | OK | E7 | — |
| 11 | Counter Φ = 1 bits, ĉ = 2 | OK | E4, B8; simulated 16 increments Σc 31, Σĉ 32; 00111 → 01000 c 4, Φ 3 → 1, ĉ 2 | — |
| 12 | ± counter Θ(k) alternating; (P, N) ĉ ≤ 2 | OK | E8, E9; 15 ↔ 16 flips 5 bits | — |
| 13 | Tarjan's opening stack | OK / FIXED wording | T3, T12, T13 and T21 (added: "each composed of zero or more pops followed by a push") | step 6 caption no longer calls the multipop stack "this stack" |
| 14 | Multipop: push 2, pop/multipop 0 | OK | derived; simulated costs [1×6, 4, 1, 1, 4] = 16, Φ [1..6, 2, 3, 4, 0], ĉ [2×6, 0, 2, 2, 0] | — |
| 15 | Φ = 2n − cap; ĉ 3 (first 2); Φ = n before, 2 after a resize | FIXED | B4 "twice the number of elements in the array after the midpoint"; simulated Φ after append 1 = 1 | "2 after every copying grow, 1 after append 1" |
| 16 | 2n − cap = bank 2n − cap + 1 minus the spare | OK | derived: bank = 3n − (n + cap − 1) | — |
| 17 | 16-append trace; 10⁶ numbers | OK | simulated: costs 1, 2, 3, 1, 5, 1, 1, 1, 9, 1×7 = 31; Φ list as stated; Σĉ 47; at 10⁶: Φ 951,424, Σĉ 2,999,999, Σc 2,048,575 (copies 1,048,575 = 2²⁰ − 1), Φ ≥ 0 and ĉ ≤ 3 throughout | — |
| 18 | ĉ₉ = 10, 16, 3, 17 | OK | simulated; Φ = n gives 2ᵏ + 2 for the append copying 2ᵏ | — |
| 19 | Growth factor g: Φ_g, ĉ ≤ 1 + g/(g − 1); 2n − cap fails for 1.5 | OK | simulated with ⌈g·cap⌉: caps 1, 2, 3, 5, 8, 12, 18, 27, 41; 2n − cap: ĉ 9, 12, 16 at appends 13, 19, 28; 3n − 2cap: max ĉ 4, min Φ 1 over 10⁶; Φ_g max ĉ 3 and 4, min Φ 1. No opened source states a g-potential (gap, as the OUTLINE says) | — |
| 20 | 2n − cap negative with pops | OK | simulated Φ 2, 0, −2 … −16; after pop 2 Σc 50, Σĉ 48; the shrink 8 → 7 then gets ĉ 22 | — |
| 21 | Blum's "$−1 per pop" = 2n − cap's ĉ, valid only while α ≥ ½ | OK | B9 verbatim; push, push, pop, pop: costs 1, 2, 1, 1 = 5 > 4, Φ 1, 2, 0, −2 | — |
| 22 | α = n/cap; Φ = max(2n − cap, cap/2 − n) ≥ 0 | OK | derived; BFS min Φ = 0 over all 6,158 states; cap 32: 32, 0, 8. "CLRS's form" not verifiable (book not opened), as the OUTLINE says | — |
| 23 | Push ≤ 3, pop ≤ 2 under ¼; ≤ 3m | OK | BFS from empty to capacity 4,096: **6,158 states**; push ĉ {0, 3/2, 3} without resize, {2, 3} with; pop ĉ {−1, 2} without, {0, 1, 3/2} with a shrink — exactly as ex 8 says | step 12 footnote fixed (correction 3) |
| 24 | Shrinking pop (8, 32) → (7, 16): c 8, ĉ 1 | OK | simulated | — |
| 25 | Rounds 1, 16, 1, 17 = 35; 2C + 3 / 2C − 1; 49 ops 328 vs 80, 279 vs 31 | OK | simulated for C = 4 … 4,096 (2C + 3 every time); C = 16: ½ total 328, copies 279, rounds 280; ¼ total 80, copies 31, rounds 32; fill + push 3C writes, 2C − 1 copies; pushes 33, pops 16, bound 131; ¼ Σĉ 82 = 80 + 2; ¼ gauge 16, 2, then 0, 1, 0, 2 | — |
| 26 | (2C + 3)/4 = 8.75, 512.75, 524,288.75 | OK | arithmetic | — |
| 27 | C²/2 + 15C/4; ≈ m²/8; 4C under ¼ | OK | 3C + (C/4)(2C + 3) = C²/2 + 15C/4; simulated C = 1,024: 528,128 and 4,096; C = 2²⁰: 549,759,746,048 and 4,194,304; ratio to m²/8: 1.0063 at 1,024 (within 1%) | — |
| 28 | Alternation: strict rule 24, "at most half" 136 | OK | simulated [17, 1×7] and [17×8] | — |
| 29 | ½-shrink ĉ; no valid Φ rescues ½ | FIXED | correction 1; the impossibility argument is sound (valid Φ ⇒ Σĉ ≥ Σc, rounds cost (2C + 3)/4 per op) | cap − 2 |
| 30 | Hysteresis landings and gaps | OK | simulated: from (17, 32) ¼: 10th pop / 16th push; from (7, 16): 4th pop / 10th push; ½: 2nd pop from (17, 32), 2nd push from (15, 16) | step 14 "at least about a quarter" |
| 31 | Φ_a, k = max(1, (3a − ½)/(½ − a)), pop ≤ 1 + k | OK | BFS to 4,096 for a = ⅛, ¼, ⅓, ⅜, 7/16: k 1, 1, 3, 5, 13; max push 3, max pop 2, 2, 4, 6, 14 (attained), min Φ 0. More questions (d) a = ⅓ ⇔ k ≤ 3 checked | — |
| 32 | Erickson exercise 9 thresholds; no potentials hint | OK / FIXED number | E10 verbatim | correction 7 |
| 33 | Splay potential, access lemma, binary logs | OK | ST3, ST4, ST5, ST1; ST6 added ("Throughout this paper we use binary logarithms.") | — |
| 34 | Tarjan 1985 unit-weight form | OK | T20: "sum over all internal nodes x of log w(x)", w = number of internal-node descendants including x (Tarjan does not state the base; Sleator–Tarjan's footnote does) | — |
| 35 | Fibonacci Φ and per-operation ΔΦ | OK / NOTE | FH1–FH6; FH7 added ("ΔΦ ≤ c + 2 ⋅ (-c + 2) = 4 – c"); FH8 added: the slides credit the *theorem* to "[Fredman–Tarjan 1986]"; they do not say the Φ is worded as in the paper | attribution wording in DD |
| 36 | Galler–Fischer 1964; Tarjan 1975 first precise analysis; O(m·α(m, n)); α ≤ 4 | FIXED | W2, W4, W5; T22–T23 added (union by size; McIlroy–Morris path compression); Tarjan 1985 adds "assuming m = Ω(n)" | correction 5; "first precise", not "first" |
| 37 | Tarjan [29] = 1975, "debits as well as credits" | OK | T17, T18; T24 added (reference line "[29] R. E. TARJAN, Efficiency of a good but not linear set union algorithm, J. ACM, 22 (1975), pp. 215-225.") | — |
| 38 | Lambert et al. four bounds, √Size, O(n) increase, "no explicit Ackermann", simpler only log log / log* | FIXED | L1, L2, L3, L6, L7 hold; L10 (added) shows Section 6 uses the classical Ackermann definitions | correction 6 |
| 39 | log* potential Size/(3 + log Size)²; rank-based α(n) potential; open question | OK (quotes added) | L8–L9 (log* form, base 2), L11–L12 (r(p) and "define its potential as"; the double sum is garbled, so describe it in words), L13–L14 (node-and-parent; open question on Size-only potentials for log** n) | — |
| 40 | log(Size) potentials in tree structures | OK | L4 | — |
| 41 | MTF inversions potential | OK | T15 | — |
| 42 | Okasaki persistence caveats | OK | O5–O8 | — |
| 43 | Not average-case | OK | B10 | — |
| 44 | CLRS dynamic tables | NOTE | not opened: framing only, as the OUTLINE already says | — |

Other numbers in the steps, all reproduced: step 2 options (4, 19 = 1 + 16 + 1 + 1, 35, 64); step 3 3 × 49 = 147; step 9 header (9 pops, 17 → 8); step 11 options 8 / 1 / 0 / 15; step 13 path values (Φ 8 → 1, ĉ 1; Φ 0 → 14, ĉ 30; Φ 16 → 2, ĉ 3) and the ½ round's ĉ [−1, 30, 3, 3] (the ¼ round's is [−1, 2, 0, 3]); step 17 (Φ 12 → 8, ĉ 9; 3n − 2cap gives 4); step 18 (2,097,155,000 writes, 2,097,151,000 copies; C² = 1,099,511,627,776; lab rows 35,000 / 31,000 and 2,051,000 / 2,047,000); prerequisite self-check (bank after 16 appends with charge 3: 48 − 31 = 17).

## SOURCES.md: do the quotes support what they are cited for?

- All 74 original quotes are found word for word and support their claims, with three wording notes: the note on T11 says "and the stack potential", which is in T12, not T11; the note on B2 says it supports "the cost model", which is in Blum's preceding sentence (not quoted; the cost model, insert 1 and resize = elements moved, matches the chapter's unit, blum.txt l. 74–75); W2 supports "union by rank" only through the notes' own context (Data Structure V), which Tarjan 1985 contradicts (now noted in the Waterloo section).
- 15 quotes added (T21–T24, ST6, FH7–FH8, L8–L15), each after its source's original quotes so the 74 ids in OUTLINE.md keep their meaning. The OUTLINE's five "add quote" items are all covered (Tarjan stack wording T21, reference [29] T24, Sleator "binary logarithms" ST6, Lambert log* form L8 and the §6 α(n) potential L10–L12), plus FH7 (ΔΦ ≤ 4 − c), which the OUTLINE asked for if the Deep dive shows it.

## Attributions (opened text only)

- **Physicist's and banker's views:** Tarjan 1985 opened; both names, "proposed by D. Sleator (private communication)", "entirely equivalent". OK. (The last reel's "through Okasaki" can now cite Tarjan directly, as the OUTLINE's Changes 6 notes.)
- **Tarjan 1975 union–find:** not opened; tied to Tarjan 1985's [29] by the reference line (T24); Tarjan 1985 calls the proof "a complicated amortized analysis that uses debits as well as credits". "Tarjan 1975 uses no potential" is correctly *not* claimed.
- **Fredman–Tarjan potential:** paper not opened; the Φ is the slides'. The slides credit the theorem to "Fredman–Tarjan 1986"; the J. ACM paper (first page reproduced on the slide) is 1987. The topic must not quote the Φ as the paper's own.
- **Sleator–Tarjan splay potential:** opened; weights, sizes, rank = log₂ s(x) (footnote), sum of ranks, access lemma. OK.
- **CLRS:** not opened; framing only. OK.
- **Outdated or superseded:** none found. Lambert et al. arXiv has only v1 (abstract page checked); Wayne's slides "Last updated on 7/25/17"; Erickson's notes "[Fa'13]", © 2018 (the current jeffe.cs.illinois.edu file).

## Red team: edge cases tried against the explanations

- **`<` vs `≤` at ½:** the two-piece Φ is continuous at α = ½ (both pieces 0), so the case split does not matter for Φ; for the *shrink rule* it matters, and Prove it 3 states it correctly (strict: 24; at most half: 136).
- **Capacities 0, 1, 2 and shrink to 0:** (1, 1) → pop → (0, 0) costs 1, ĉ 0; (1, 2) → (0, 1) under ¼ (0 < ½), Φ ½, ĉ 3/2; (1, 4) → (0, 2), Φ 1 → 1, ĉ 1. A pop on empty is excluded. All within push ≤ 3, pop ≤ 2; only the step 12 footnote was wrong (correction 3).
- **Shrink-at-¼ rounding:** capacities are 0 or powers of two, so cap/4 is exact from 4 up; for cap 1 and 2 the strict test only fires at n = 0. No off-by-one found.
- **Pop of the last element:** costs 1 (no keys to copy), consistent with "1 plus the keys left".
- **Φ ≥ 0:** holds in every reachable state (BFS), and Φ = ½ occurs (capacity 1, no keys), so fractions are needed; More questions (c) is right that Σc is an integer ≤ Σĉ.
- **"Φ = how far from just after the last expensive operation":** this is CHAPTER.md's intuition, not a source's. It is true as distance in *state* (Φ is 2 after a grow, 1 after a ¼-shrink, and grows as the state moves away), false as a count of operations (after a grow, a push then a pop puts Φ back at 2). The DD now carries that caveat; step 8's caption was reworded to "how far the vector is from where a grow leaves it".
- **Step 7's "every append but the first" costs 3:** true (append 2: Φ 1 → 2, c 2, ĉ 3).
- **Step 2 "the round ends where it began":** true, (17, 32) → (17, 32), so the 35 repeats exactly.
- **Θ(n²) claim:** correctly limited to C proportional to n; with C fixed it is Θ(C) per operation. Not broken.
- **Hysteresis "any fixed fraction below ½":** holds for 0 < a < ½ with doubling (BFS for five values); a → 0 never shrinks, which is still O(1) but wastes memory, as the trade-off note says.
- **Not facts, but for the builder:** captions of step 3 (about 64 words) and step 13 (about 61) are over the 30–55-word convention (they were before this check); step 6's caption is 52 words after the fix and step 8's 55.
