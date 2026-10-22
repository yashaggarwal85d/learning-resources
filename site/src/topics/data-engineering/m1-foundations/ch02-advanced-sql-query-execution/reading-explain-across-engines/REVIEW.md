# Content and looks review, 2026-10-22

## Content review

**Flow.** Hook (a real, locally-measured version-dated default change) → predict (why would a newer version show more?) → three reveals building the per-engine vocabulary (Buffers default, estimated-vs-actual rows and loops, spill/memory indicators recapped from topic 23) → a second predict pivoting to the cross-engine question → Spark's own split between plan-text estimate and UI/API actual (with a genuine forced spill) → a third predict isolating shuffle-bytes from spill-bytes → three sourced-only reveals for Trino, Snowflake and BigQuery → Recap stating the fixed triage order → two closing "Prove it" checks. Three predicts, three takeaways (steps 4, 8, 12), matching the engagement-arc convention from topics 25-26.

**Pre-notes accuracy.** All three pre-notes terms (cardinality estimation, work_mem spill, adaptive query execution) are used as described in the reveals that follow; added a fourth term (loops) after the first pre-notes draft only had three, which failed the 4-14 term-count build check.

**Gaps.** None open in `coverage.json`'s `gapReview`. The honest-gap pattern from topics 25-26 is carried forward explicitly for Trino, Snowflake and BigQuery (sourced-only, disclosed in FACT-CHECK.md and in the reel's own wording, e.g. "sourced; no Trino installed" reasoning never appears as "we measured").

**Expert-reader depth.** `coverage.json`'s expert items (10) go beyond the syllabus line itself: the PG16-vs-PG18 side-by-side install methodology, the precise Spark plan-text/UI split with an independently queried REST endpoint, the specific field-level vocabulary quoted from Snowflake's and BigQuery's own docs, and the disclosed reasoning for why three of the five engines' claims are sourced rather than measured.

**Engagement arc.** Verified: hook (step 1) is a real measured contrast, not a hypothetical; first predict at step 2; three predicts total (2, 6, 9); three takeaways (4, 8, 12); recap (13); two closing checks (14-15).

**Does the narration teach?** `narration-teaches.mjs` initially flagged steps 6, 8 and 13 as echoing the description's own sentences verbatim — fixed by rewriting those lines as the professor's own framing of the question ("where should your eye actually land first?", "what that plan text can't tell you...", "every new engine you meet is just a new set of field names...") rather than restating the description. Final overlap: 2-21% across all steps except step 4 at 43%, still under the 50% floor and judged acceptable since step 4's narration explains *why* the comparison matters (the universal check across engines) rather than just restating the numbers.

## Looks review

Playwright (`check-all.mjs --only reels --topic reading-explain-across-engines`) failed once on first run: phone layout, step 5 ("Reveal: spill and memory indicators") — `RevealSpillRecap`'s two Row labels/values overflowed and overlapped on the narrow viewport ("this chapter already measured" / "Batches, spill (topic 23)" and "every engine answers this" / "somewhere in its output"). Fixed by shortening both labels ("already measured", "every engine") and reflowing the second value ("answers this somewhere"). Re-ran clean: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes." Editor test also passed on the same run.

No swipe-test/takeaway interaction (QUALITY.md #64) risk: this reel's first takeaway lands on step 4, not step 3 (the test's own "from" step, since step 2 is this reel's first predict and step 3 is a plain reveal with no takeaway) — confirmed safe by the clean Playwright run above.
