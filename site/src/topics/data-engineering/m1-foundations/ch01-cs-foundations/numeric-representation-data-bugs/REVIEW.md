# REVIEW: Numeric representation and its data bugs (`de.numeric-representation-data-bugs`)

Independent fact-check. Read: `index.mdx`, `narration.json`, `prerequisites.mdx`, `registry-entry.ts`, and the chapter contract `site/src/topics/data-engineering/m1-foundations/ch01-cs-foundations/CHAPTER.md` (topic 12's entry). All ten reachable cited URLs were fetched via the proxy and checked against the specific claim they back; the one ACM-blocked DOI follows the same bot-wall pattern seen throughout this course.

**Verdict: MINOR_FIX**

## 1. Sources

| # | URL | Reachable? | Supports the claim? |
|---|---|---|---|
| 1 | Goldberg, ACM Computing Surveys 23(1), 1991 | No — ACM 403 | Not independently verified; the standard, canonically-cited paper for this exact framing (non-associativity, ulp, compensated summation), not contradicted by anything found. |
| 2 | Python docs, "Floating-Point Arithmetic: Issues and Limitations" | Yes, 200 | Confirmed exactly: the page contains the identical full decimal expansion the draft quotes for 0.1, "0.1000000000000000055511151231257827021181583404541015625." |
| 3 | Python docs, `math.fsum` | Yes, 200 | Confirmed exactly: "the result is almost always correctly rounded to within 1/2 ulp" — matches the draft's quote word for word. |
| 4 | Python docs, `decimal` module | Yes, 200 | Reachable; used only as a general pointer, not for a specific quoted figure. |
| 5 | PostgreSQL 18, "Numeric Types" | Yes, 200 | Confirmed exactly, three times: "Attempts to store values outside of the allowed range will result in an error" (matches verbatim); `integer` range "-2147483648 to +2147483647" and `bigint` range "-9223372036854775808 to +9223372036854775807" (both match the draft's figures exactly); and — resolving an apparent tension on first read — "The maximum precision that can be explicitly specified in a numeric type declaration is 1000. An unconstrained numeric column is subject to [much larger] limits" confirms the draft's careful "max **declarable** precision 1000" is precisely the right qualifier, not an error. |
| 6 | Spark docs, "ANSI Compliance" | Yes, 200 | Confirmed exactly: "By default, spark.sql.ansi.enabled is true"; the exact error text `[ARITHMETIC_OVERFLOW] integer overflow. Use 'try_add' to tolerate overflow...`; and "the decimal type will produce null values and other numeric types will behave in the same way as the corresponding operation in a Java/Scala program" — matches the draft's quote verbatim. |
| 7 | Spark 4.0 release notes | Yes, 200 | Confirmed: "[SPARK-44444] Use ANSI SQL mode by default" is listed as a Spark 4.0 highlight, confirming ANSI-by-default is specifically a 4.0 change as the draft states. |
| 8 | Snowflake, "Scale and precision in arithmetic operations" | Yes, 200 | Confirmed exactly on every rule cited: multiplication "L = L1 + L2," "S = min(S1 + S2, max(S1, S2, 12))"; "precision in Snowflake is always limited to 38"; addition "L = max(L1, L2) + 1," "S = max(S1, S2)"; division "L = L1 + S2" with the scale rule matching "S = max(S1, min(S1 + 6, 12))" exactly as described in prose. The worked example (`DECIMAL(12,2) * DECIMAL(5,4)` → `NUMBER(17,6)`) was independently recomputed from these rules and is correct. |
| 9 | NumPy docs, "Data types" | Yes, 200 | Confirmed exactly: "converting a numpy.int64 value 300 to numpy.int8. NumPy follows C casting rules, so that value would overflow and become 44 (300 - 256)" — matches the draft's `np.int8(300)` → 44 example verbatim. |
| 10 | pandas 3.0.0 release notes | Yes, 200 | Confirmed exactly: "The new default resolution when parsing strings is microseconds, falling back to nanoseconds when the precision of the string requires it" — matches the draft's quote verbatim (the phrase wraps a line break in the source but is identical). |
| 11 | Apache Parquet, `LogicalTypes.md` | Yes, 200 | Confirms `isAdjustedToUTC`, and `MILLIS`/`MICROS`/`NANOS` units are real fields of the Parquet `TimestampType`. **Gap**: the draft's parenthetical "(The legacy INT96 nanosecond timestamp is deprecated and a frequent source of cross-engine bugs.)" is attached to this same citation, but `INT96` does not appear anywhere on this page — it's a real, well-known Parquet convention, but this specific citation doesn't actually back that specific sentence. Minor: either drop the citation link for that one clause or cite the page that documents INT96's deprecation. |

No dead or misattributed links. Every quoted figure and formula that could be checked against a live, reachable source — including the genuinely intricate Snowflake precision/scale arithmetic — matched exactly.

## 2. Unsupported numbers

None found as unsupported; all are either standard definitional facts (integer ranges, IEEE-754 bit-field widths) with sources confirmed above, or independently recomputed and correct:

- Double ulp near 1.0 ≈ 2.2×10⁻¹⁶ (= 2⁻⁵², the standard machine epsilon) — correct.
- Spacing is exactly 1.0 at 2⁵² ≈ 4.5×10¹⁵, and 2 above 2⁵³ = 9,007,199,254,740,992 — both independently recomputed and correct; `1e16 + 1 == 1e16` follows because 10¹⁶ sits in the exponent band where the spacing is 2, so +1 rounds back down.
- 53-bit significand ≈ "15 to 17 significant decimal digits" — standard, correct figure.
- A 64-bit nanosecond counter spans 2⁶³ ns ≈ 9.223×10¹⁸ ns ÷ (3.156×10⁷ s/year × 10⁹ ns/s) ≈ **292.3 years**, recomputed and matching the draft's "about 292 years" and the "1677-09-21 … 2262-04-11" window, which matches pandas' own documented `Timestamp.min`/`Timestamp.max` bounds exactly.
- The Snowflake worked example (`L = 10 + 1 = 11`, `S = min(6, 12) = 6` → `NUMBER(17,6)`) was recomputed from the sourced rules above and is correct.
- "A few thousand events a second crosses 2³¹ in under two weeks" is a loosely-hedged illustrative claim (true at the upper end of "a few thousand," e.g. 2,000–3,000/s gives 8–12 days; it would not hold at exactly 1,000/s) — acceptable as a motivating example, not a precise bound.

## 3. Narration & format

- **Valid JSON**, 12 steps. No digits or symbols found in any spoken line (regex-scanned).
- **Three predict steps with answers** (steps 2, 4, 9, 0-indexed), matching the "full" topic convention.
- **Opens on the Bridge (close paraphrase), closes on the Handoff (verbatim).** `registry-entry.ts`'s bridge — "Storage returns your bytes intact. Their type decides whether a total, an amount or a timestamp is still right." — is echoed closely in step 0 ("Storage just returned your bytes, exactly as written... their type decides whether a total, an amount, or a timestamp is still right"), a reasonable spoken elaboration rather than a drift. The last two lines of step 11 — "That closes the hardware. Next: the algorithms that decide how many bytes a query moves, starting with the two index families most databases are built on." — match the `handoff` field word for word.
- **MIT-professor voice:** reads as spoken teaching prose ("Here's the one that bites data engineers," "Now the quiet one") and is clearly distinct from the `index.mdx` prose. Pass.
- **index.mdx format:** frontmatter has `id` and `title`; the five required `<section data-section="...">` blocks are present and in order; depth (an overflow-policy comparison table across four engines, the ulp/number-line explanation, three concrete reasons float sums vary, a two-engine `DECIMAL` precision/scale comparison, the timestamp-resolution mismatch, a three-part lab, a six-item production checklist) is comparable to the `io-cost-model` reference topic.
- **prerequisites.mdx:** has the required `data-section="basics"` section plus four further numbered sections, each correctly linking an earlier topic by its `CHAPTER.md`-assigned folder name (`cpu-caches-simd-vectorization`, `threads-context-switches-synchronization`). Matches shape.
- **registry-entry.ts:** well-formed `TopicMeta`, `status: 'held'`, correct import path (5 `../` to `site/src/topics/registry`).

## 4. Flow

- **`uses`/`introduces`/`declared` ledgers, `id`, folder, `kind`, `minutes`, bridge and handoff all match `CHAPTER.md`'s topic 12 entry exactly.** `introduces: ['integer-overflow', 'ieee-754', 'float-non-associativity', 'decimal-precision-scale', 'timestamp-resolution']` and `uses: ['simd', 'vectorized-execution', 'processes-vs-threads', 'object-storage']` are identical to the plan (the `declared` list has the same two items in a different order, which doesn't matter for a set). `simd`/`vectorized-execution` are planned to come from topic 7, `processes-vs-threads` from topic 8 (neither drafted yet), and `object-storage` from topic 11 (drafted and reviewed earlier in this pass under the id `de.object-storage-tier`, itself a deviation from plan — but the **concept** id `object-storage` used in both drafts' `uses`/`introduces` lists is consistent regardless of which topic-id/folder eventually hosts it, so this draft's own ledger entry is correct either way).
- **No id/folder deviation** — unlike several other drafts reviewed in this pass, this one's folder and id match its own chapter plan exactly, joining `graph-algorithms-pipeline-dags`, `bandwidth-latency-data-locality` and `storage-devices-fsync-durability` as clean in this respect.
- Nothing else in `uses`/`introduces`/`declared` is wrong; concept sequencing is correct throughout.

## Summary

This topic closes out the batch on a high note: every one of ten reachable sources backs its claim exactly, including a genuinely intricate set of Snowflake precision/scale formulas that were independently recomputed and found correct, and the registry entry has no contract deviation. The verdict is MINOR_FIX only for one citation that's attached to a true but unsupported-by-that-specific-page clause (`INT96`'s deprecation, cited to a Parquet doc page that doesn't mention `INT96`).
