# Fact-check: Asymptotic notation and logarithms (plan stage)

Adversarial fact-check of `OUTLINE.md` and `SOURCES.md` (ROUTINE.md 2.3), 12 October 2026, by an agent that did not write the plan. Every claim was re-derived from the raw source text in `sources/` (never a summary). Every number the reel shows was recomputed in python3 (CPython 3.11.17 locally; the float results quoted are IEEE-754 double behaviour, the same in 3.15). All corrections are already applied to `OUTLINE.md` and `SOURCES.md`. `node scripts/sources.mjs check` passes: 94 quotes, 0 problems (79 before).

Versions in force on 12 October 2026: PostgreSQL "current" docs = 18 (the fetched page announces 19 Beta 4, 24 September 2026); PostgreSQL headers from REL_18_STABLE; Python docs 3.15.0; DLMF 1.2.8 (2026-09-15); MIT 6.006 Spring 2020 (still the OCW edition); Knuth 1976 and Vitter 2008 are fixed publications. Nothing cited is renamed or superseded.

## Claims checked

| # | Verdict | Note / correction | Source |
|---|---|---|---|
| 1 | CONFIRMED | MIT: "Non-negative function g(n) is in O(f(n)) if and only if there exists a positive real number c and positive integer n0 such that g(n) ≤ c · f(n) for all n ≥ n0", and "upper bounds … for sufficiently large n". | MIT 6.006 S20 R01 p.3 |
| 2 | CONFIRMED | Ω definition word for word. | MIT R01 p.3 |
| 3 | CONFIRMED | Θ = O ∩ Ω; "tight bound". | MIT R01 p.3 |
| 4 | CONFIRMED | Both quotes are in the Efficiency and Asymptotic Notation paragraphs. | MIT R01 pp.2–3 |
| 5 | CONFIRMED | MIT "set containment"; Knuth "speaking about sets of functions", "The equal sign here really means" followed by ⊂ ("set inclusion") and one-way equality. | MIT R01 p.3; Knuth 1976 p.20 |
| 6 | CONFIRMED, quote added | Knuth: O "upper-bounded by a constant times f(n), for all large n"; "need a corresponding notation for lower-bounded functions"; misuse "when they reject a particular sorting method 'because its running time is O(n²)'". Step 3's explain quotes "because its running time is O(n²)", so that fragment is now quoted in SOURCES.md (the OCR prints "O(n 2)"). | Knuth 1976 p.18 |
| 7 | CONFIRMED (derived) | From the two definitions with c ↔ 1/c (n₀ unchanged). | claims 1–2 |
| 8 | CONFIRMED | Ratio 3 + 8/log₂n: 11.00, 5.00, 4.00, 3.50, 3.301 → "3.30". g(128) = 3,712 > 3,584; g(256) = 8,192 = 4·256·8. The least integer n with 8n ≤ n·log₂n is 256. The dot passes n₀ at 7/25.58 = 27% of the log₂ axis, so 1.26 s ≈ "1.3 s". | arithmetic |
| 9 | CORRECTED | g(10⁸) = 8,772,627,427.73 → 8,772,627,428 ✓. But 10¹⁶ / g(10⁸) = **1,139,909**, not 1,139,912 (step 3 real values and `examples.py` #2 fixed). g ≤ 11n² for every n ≥ 1 ✓ (max g/n² is 8, at n = 1). | arithmetic |
| 10 | CONFIRMED | "Linear time is often necessary … where the entire input must be read". | MIT R01 p.3 |
| 11 | CONFIRMED | Table order constant, logarithmic, linear, quadratic, polynomial, exponential. | MIT R01 p.3 |
| 12 | CONFIRMED, note added | The PDF says "log n ≈ 10¹"; the extracted text reads "101", so the quote stops before the exponent. Note added to SOURCES.md. | MIT R01 p.3 |
| 13 | CONFIRMED | Exercise 5. | MIT R01 p.6 |
| 14 | CONFIRMED | "can be solved in logarithmic time via binary search". | MIT R01 p.3 |
| 15 | CONFIRMED | Steps 1,000 / 9,966 / 1,000,000; 1,000,000 / 19,931,569 / 10¹²; 10⁸ / 2,657,542,476 / 10¹⁶. Times 1 µs / 9.97 µs / 1 ms; 1 ms / 19.9 ms / 1,000 s (16.7 min → "17 min"); 0.1 s / 2.66 s / 10⁷ s (115.7 days → "116 days"). Doubling ratio of n·log₂n at 10⁸ is 2.0753 → "×2.08". | arithmetic |
| 16 | CONFIRMED | DLMF 4.2.8 "With a,b≠0 or 1, log_a z = ln z / ln a". The plan's narrower "a, z positive, a ≠ 1" is a subset. | DLMF §4.2(ii) |
| 17 | CONFIRMED | 4.2.9, 4.2.10; MIT "loga b = log b/ log a". | DLMF §4.2(ii); MIT R01 p.6 |
| 18 | CONFIRMED, quote added | ln 10 = 2.30258 50929…, log₁₀ e = 0.43429 44819… (4.2.17 now quoted), ln e = 1. | DLMF 4.2.12, 4.2.17, 4.2.18 |
| 19 | CONFIRMED (derived) | b^k = exp(k ln b) = x ⇔ k = ln x / ln b (4.2.25, 4.2.26/4.2.28, 4.2.27). A log is a whole number of divisions only when x is a power of b; otherwise "divisions down to 1" is approximate, which the reel shows with 29.9 and 2.14. | DLMF §4.2(iii)–(iv) |
| 20 | CONFIRMED | Product, power and change-of-base rules in exercise 3's solution. DLMF §4.2 does not state them (SOURCES.md says so). | MIT R01 p.6 |
| 21 | CONFIRMED | log₂ 1,000 = 9.966; log₂ 10⁹ = 29.897; 2²⁹ = 536,870,912 < 10⁹ ≤ 2³⁰ = 1,073,741,824. After 10, 20, 29, 30 halvings: 976,562.5, 953.67, 1.86, 0.93, so 30. The Git topic (branch `topic/de.git-branching-history-workflows`, `index.mdx`): "1,000 linear commits took 10 tests (and 9 or 10 for every culprit position tried in the fact-check)". | arithmetic; Git topic |
| 22 | CONFIRMED | log₁₀₀₀ 10⁹ = 3 (1000³ = 10⁹); log₁₆,₃₈₄ 10⁹ = 2.1355 → 2.14 (10⁹ // 16,384 = 61,035; 10⁹ / 16,384² = 3.73); log₁₆,₃₈₄ 10⁶ = 1.4237 → 1.42 < 1.5. Matches the held topic's Prerequisites 01 ("under 1.5"; "Answer: 3, since 1000³ = 10⁹"). | arithmetic; io-cost-model `prerequisites.mdx` |
| 23 | CONFIRMED | 1 / log₁₀ 2 = 3.3219 → 3.32; 3.32 × 9 = 29.88 → 29.9. | DLMF 4.2.9 + arithmetic |
| 24 | QUALIFIED | True only for a fixed base. When the base is a problem parameter (fan-out B, M/B), log_B N = log N / log B, and dropping the base loses a non-constant factor. Claim, step 6 caption, Deep dive and Common slips now say so. | claims 16–17, 25 |
| 25 | CONFIRMED | All three Vitter quotes are verbatim; his reason is "the terms can have a significant effect in practice". | Vitter 2008 Ch. 3 |
| 26 | CONFIRMED | "degree … Θ(B)", "height … roughly logB N", "Splittings can thus propagate up to the root, which is how the tree grows in height". | Vitter 2008 Ch. 11 |
| 27 | CONFIRMED | §65.1.4.1, all three quotes. With fan-out ≈ 400 the leaf share is about 1 − 1/400 = 99.75%, consistent with "over 99%". | PostgreSQL 18 docs §65.1 |
| 28 | CONFIRMED | 8 kB, 24-byte header, 4 bytes per item identifier. | PostgreSQL 18 docs §66.6 |
| 29 | CONFIRMED | IndexTupleData = t_tid (ItemPointerData, "designed to be six bytes long") + `unsigned short t_info`; key values "beginning at a MAXALIGN boundary". | REL_18_STABLE `itup.h`, `itemptr.h` |
| 30 | CORRECTED (minor) | 8 (header) + 8 (key) + 4 (line pointer) = 20 bytes ✓. The plan left out the b-tree special space: (8,192 − 24 − 16) / 20 = 407, still "about 400". It is now stated, and the question says "a full 8 KB page". | §66.6; `nbtree.h` |
| 30a | NEW | `nbtree.h`: BTPageOpaqueData is 16 bytes on common builds. Default leaf fillfactor is 90% and upper pages a fixed 70%, applied at build and on rightmost-page splits (where an ascending `order_id` inserts). That is about 366 per leaf and 285 per internal page: 273,225 leaves → 959 → 4 → root, **still 4 levels**. | REL_18_STABLE `nbtree.h` (fetched and quoted) |
| 31 | CONFIRMED | 400³ = 64,000,000 < 10⁸ ≤ 400⁴; log₄₀₀ 10⁸ = 3.074 → 3.07. Integer level loop: 99 → 5, 100 → 4 (100⁴ = 10⁸ exactly), 464 → 4 (464³ = 99,897,344), 465 → 3 (465³ = 100,544,625). Binary ⌈26.58⌉ = 27. The held topic asserts `round(math.log(10**8, 100)) == 4`. | arithmetic |
| 32 | CONFIRMED | "there are N/M = n/m (sorted) runs", "merge groups of R runs", "At most R = Θ(m) runs … O(logm n)". | Vitter 2008 Ch. 5.2 |
| 33 | CONFIRMED | N = 10¹⁰, M = 10⁷, B = 10⁴ → n = 10⁶, m = 10³, log_m n = 2. | Vitter 2008 Ch. 3 |
| 34 | CONFIRMED, wording aligned | 2⁴⁰/2²⁰ = 1,048,576; 2³⁴/2²⁰ = 16,384; runs 64; fan-in 16,383; log = 20/14 = 1.4286; 1 + ⌈log₁₆,₃₈₃ 64⌉ = 2; two-way 1 + 6 = 7. Matches `io-cost-model/examples.py` (`passes(1 TiB, 16 GiB, 1 MiB) == (2, 64, 16_383)`). See "Sort-pass wording" below. | io-cost-model `index.mdx`, `reel.tsx`, `examples.py` |
| 35 | CONFIRMED | "The nonlinear I/O bound Θ(n logm n) usually indicates that multiple or extra passes over the data are required." | Vitter 2008 Ch. 3 |
| 36 | CONFIRMED | "w > log2 n bits"; MIT adds that a byte-addressable 64-bit Word-RAM allows inputs up to about 10¹⁰ GB. | MIT R01 p.4 |
| 37 | CONFIRMED | All four quotes in the Python 3.15.0 `math` page. New in 3.15: a `math.integer` module, with the old integer aliases (`math.isqrt` and others) soft-deprecated. It has no integer log, so the Try-it advice to use loops or `bit_length()` stands. | docs.python.org/3/library/math.html |
| 38 | CONFIRMED, extended | `math.log(1000, 10)` = 2.9999999999999996 → int 2. Also `math.log(10**9, 10)` = 8.999999999999998 → int 8, and the ceil trap `math.log(125, 5)` = 3.0000000000000004 → ceil 4 (284 of the (b, e) pairs with b < 500, e ≤ 7 fail `ceil(log(b**e, b)) == e`). Added to Try it, Common slips and `examples.py` #9. | executed |
| 39 | CONFIRMED (ranges) | `random.Random(5)` shuffles of 2¹⁴/2¹⁵/2¹⁶: 208,032 / 448,963 / 963,153 comparisons, all < n·log₂n (229,376 / 491,520 / 1,048,576); ratios 2.158 and 2.145, inside 2.0–2.3. 2¹⁴·(2¹⁴ − 1)/2 = 134,209,536. The exact counts depend on the CPython version, so ranges only, as planned. | executed (CPython 3.11) |
| 40 | CONFIRMED | Follows from claims 4 and 25; no tier latency is shown, as CHAPTER.md requires. | claims 4, 25 |

## Corrections made

In `OUTLINE.md`:

1. **Step 3, real values and `examples.py` #2:** 10¹⁶ / g(10⁸) = 1,139,909 (was 1,139,912).
2. **Step 3, options:** "No: O means exact growth" duplicated option 1's misconception. It is now "No: O(n²) is for the worst case", which tests expert-list item 1, and the explain adds that a bound is not a case. A red-team line says why each wrong option is wrong; none of them is defensible.
3. **Step 3, answer frame:** the log₁₀ axis now starts at 1 billion. Starting at 1, the job's bar would be 62% of the n² bar and the "million times" gap would vanish. Now it is about 1/7.
4. **Step 3, question frame:** the Θ note is written "Theta" (the step's serif is already the O). The house rule claimed only steps 2 and 11 draw Θ, but steps 3 and 10 also mention it; the rule now says they write it out.
5. **Step 2, narration:** "settles … after two hundred fifty six" became "from two hundred fifty six on" (equality holds at 256).
6. **Step 4:** the time axis starts at 100 ns, not 1 µs. The n lane at n = 1,000 is exactly 1 µs and would have drawn as a zero-length bar.
7. **Step 5:** added a red-team note. "About 20" is log₂ of a million. Binary search's "at most 30" holds for both comparison styles. "Down to one" means 1 or below (after 29 halvings it is still 1.86).
8. **Step 6 caption:** "Fixed bases differ only by a constant factor … and so does a base that is itself a parameter, like a page's fan-out."
9. **Step 7:** the base-2 tower is 29 steps plus a 0.9 sliver (269 units), so its height matches its "29.9" label, as the 2.14 tower's sliver already does.
10. **Step 8:** the question says "a full 8 KB index page". Real values add the 16-byte special space (407), PostgreSQL's 90%/70% default fill (366/285, still 4 levels) and the fan-out 99 → 5 boundary. A red-team note explains each distractor (3 = forgot the ceiling, 8 = log₁₀, 27 = binary).
11. **Step 9, outcome 3 and caption:** the plan said "Passes are whole, so 1.43 rounds up to 2". It now uses the held topic's logic: one run-formation pass, and since the fan-in (up to 16,383) is at least 64, one merge pass. The cinnamon tower's steps are labelled as passes (2 against 7, not 1.43 against 7).
12. **Deep dive:** n₀ is paired with c (c = 5 → 16, c = 11 → 2, and no c works at n = 1 because n·log₂n = 0 there). The base disappears only when fixed. Special space and fillfactor are added, and the sensitivity table gains 99 → 5.
13. **Try it #1, Common slips, `examples.py` #4, #5, #7, #9:**
    - The integer halving loop must round up: `x //= 2` gives 29 = ⌊log₂ 10⁹⌋.
    - Assert displayed counts with `round()`, never `int()` (`math.log(10**9)/math.log(10)` = 8.999999999999998).
    - The ceil trap `math.log(125, 5)`.
    - The `bit_length` off-by-one: `n.bit_length()` = ⌊log₂ n⌋ + 1 but `(n − 1).bit_length()` = ⌈log₂ n⌉ (11 vs 10 at 1,024).
    - The level function must be an integer loop.
14. **Claims list:** claims 6, 18, 24, 30 and 34 are amended, and claim 30a is new.

In `SOURCES.md`:

- Knuth: added the quote "because its running time is", and a note that the Θ line's "<" is an OCR artefact for ≤.
- MIT: a note on the "10¹" superscript.
- DLMF: the 4.2.17 quote (log₁₀ e).
- A new source section, PostgreSQL REL_18_STABLE `nbtree.h`, with 13 quotes. Its text is cached in `sources/`.

## Sort-pass wording against the held topic (`io-cost-model`)

The held topic never rounds the whole logarithm. Its Deep dive reads: "log_{M/B}(N/B) = 1 + log_{M/B}(N/M): one pass cuts the input into N/M memory-sized runs, and the rest is merging. Merge sort with fan-in M/B − 1 … takes 1 + ⌈log_{M/B−1}(N/M)⌉ passes … log_{M/B}(N/B) ≈ 1.43 and the sort takes 2 passes". Its reel reads: "Pass one writes 64 runs. The merge can take up to 16,383 runs at once, so a single pass finishes: 2 passes, 4 TiB of I/O. Merging two at a time would take 7 passes."

The plan's "1.43 rounds up to 2" gives the same number here. It isn't the held formula, though, and it is one pass short whenever (M/B − 1)^k < N/M ≤ (M/B)^k. For example, with 16,384 runs and M/B = 16,384, ⌈log_{M/B}(N/B)⌉ = 2 but there are 3 passes. Step 9's visual notes, caption and outcome 3 now follow the held wording. The Deep dive already stated the exact formula and the differ-by-one case. Numbers (64 runs, 16,383, 1.43, 2, 7) and the "1.42 vs 1.43" separation agree with the held topic.

## Remaining caveats

- **Fan-out is an estimate.** It assumes MAXALIGN = 8, no deduplication, no NULLs, and a single bigint key. The 4-level answer holds for any fan-out from 100 to 464, and at PostgreSQL's default fill. Measuring a real index (`pageinspect`'s `bt_metap` level) belongs to topic 13, not here.
- **BlockNumber's width.** The 4-byte size comes from `block.h`, which was not fetched, so the 16-byte special space is stated as "on common builds".
- **PostgreSQL 19** was at Beta 4 on the fetch date and may become "current" before the build. Re-run `sources.mjs check`: the §65.1 and §66.6 wording is expected to be unchanged, but verify it.
- **Comparison counts** (Try it #3) were run on CPython 3.11 locally. The `test:examples` interpreter may differ; the plan asserts ranges only, which keeps this safe.
- **Float log results** are IEEE-754 double results from CPython's `log(x)/log(base)`, and are stable across versions in practice. They are asserted, not reasoned, as planned.
- **Θ glyph.** The build must keep Θ out of JetBrains Mono everywhere except the serif tspans (steps 2 and 11). Steps 3 and 10 write "Theta".
- **Concept ids.** DSA's live reel introduces `big-o-theta-omega`, while this topic introduces `big-o`. The ids differ across domains; the coverage step (2.4) should confirm that the seam check accepts this.
- **`uses: ['git-bisect']`.** The Git topic is not yet merged to main (it lives on its topic branch). If it isn't live when this releases, apply the outline's fallback (Changes #5).
