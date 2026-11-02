# Review — de.semantic-integration-schemas-codes

## Content review, self-review, 2026-11-01

Read cold: `CHAPTER.md`'s entry for this topic, topic 23's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then Chapter 9's own first bridge line
(Kafka's internals).

1. **Flow.** The bridge answers topic 23's own handoff verbatim ("Choosing a style decides where
   the master lives, not what its fields mean...") and this topic's own handoff matches
   `CHAPTER.md`'s own chapter-closing handoff verbatim, including the specific instruction that
   Chapter 9's own first topic must open from "the partitioned log that carries a stream of
   events" (per CHAPTER.md's own "Notes for the release run," item 3). Checked all six named
   `uses` ids via `grep -n "'<id>'"` against `registry.ts`: `scd-type-2`,
   `backdated-fact-scd2-mapping`, `decimal-precision-scale`, `timestamp-resolution`,
   `dbt-tests-data-unit` and `mdm-styles` all resolve live.
2. **Pre-notes.** 7 bullets (schema mapping, crosswalk, reference data, ISO 4217, UCUM, time
   zone database, UTC instant — `CHAPTER.md`'s own syllabus terms for this topic), each under
   the per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` line 530) splits at its
   own three semicolons into four clauses: schema matching; crosswalk tables; units, currencies
   and time zones; and owning the mapping as tested data. `coverage.json`'s `syllabus` array
   matches this four-clause breakdown exactly, copied word for word from the raw syllabus file,
   confirmed by a direct substring check that leaves zero characters uncovered. The expert list
   has 10 items on the first draft, meeting the required minimum without needing a second pass.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the measured mechanism directly: the first against the two bug-reproduction
   functions' own disjoint code paths, the second against the mapping-test function's own
   anti-join genuinely failing and naming the orphan rather than defaulting silently. Every
   measured claim traces to a specific function in `examples.py`: the point-in-time crosswalk
   join, the minor-unit-exponent conversion, the DST-transition comparison (found by scanning,
   not assumed), and the mapping test's own before/after/after-fix sequence.
5. **Engagement.** Hook (step 1, integer cents plus local time against decimals plus UTC, off
   by a hundred and an hour); predict within the first four steps (step 2, whether the two bugs
   share one fix); three takeaways (steps 6, 7, 9 — meeting the build's own minimum-of-three
   rule); "Prove it" (step 10) generalizes the versioned-tested-mapping claim to a fresh
   scenario, directly reusing the measured mapping-test mechanism from step 8 to rule out the
   wrong answer.
6. **Narration teaches.** Checked every narration line against the reel's own description/body
   text by hand before the build ran: every step explains *why* a measurement comes out the way
   it does (why the two bugs stay independent; why a fixed offset fails specifically on
   transition nights) rather than reading the figure's own on-screen labels or restating the
   predict question verbatim. The build's own narration-teaches check passed after one fix
   (moving a misplaced "answer" block for a non-predict step into its own lines, the same class
   of fix needed for topic 23). No digits and no underscored identifiers appear in `reel.tsx`'s
   or `scenes.tsx`'s visible text or in `narration.json`; every narration line is confirmed at
   or under the 50-word-per-line ceiling by a Python script (longest line: 37 words).

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-11-01

1. Every `scenes.tsx` `Row` label/value pair was written to stay within the house style's usual
   one-to-three-word guideline per side; `grep` for digits in visible text returns no matches in
   the final file.
2. Takeaway word counts (em dash and colon-joined clauses counted word by word) checked with a
   Python script against `reel.tsx`'s own source text: all three takeaways (17, 20, 17 words)
   passed after two length fixes — the first drafts for steps 6 and 9 ran to 22 and 23 words and
   were trimmed without losing either claim.
3. `examples.py` was run to completion three times (`python3 examples.py` → "all checks passed"
   every time) against this sandbox's own real PostgreSQL 16 cluster before writing the reel,
   including two fixes caught during development: the DST-comparison function initially
   subtracted a naive-offset interval from a timestamp without time zone and compared it
   directly against a `timestamptz` result (a `TypeError`, fixed by wrapping the naive result in
   its own `AT TIME ZONE 'UTC'`), and the "day before the transition" check initially picked the
   calendar day immediately preceding the detected index, which — since the real transition
   happens within that very day, not at its midnight boundary — was already past the jump by
   the chosen wall-clock hour; fixed by stepping back one additional day. Every scratch table
   this topic creates is confirmed dropped after each run (`tables []` via a direct Python
   check), and the shared `orders` table is confirmed unchanged at 50001 rows throughout.
4. Two disclosed access barriers, neither worked around silently: Rahm and Bernstein's own
   schema-matching survey sits behind a Springer sign-in wall, and its own secondary mirror
   (`pubs.dbs.uni-leipzig.de`) refused a direct fetch on a TLS certificate mismatch — confirming
   CHAPTER.md's own plan-time note that the PDF route returned HTTP 404 — so its taxonomy is
   named from secondary summaries rather than quoted, disclosed in `SOURCES.md` and here. ISO
   4217's own iso.org page returned HTTP 403 to a direct fetch, so that clause is read via
   Wikipedia instead, also disclosed. `node scripts/sources.mjs check <folder>` passed (6/6
   quotes word for word) against the sources that were reachable.
5. One genuine design choice, disclosed rather than hidden: the DST-transition date is found by
   the code itself scanning real `AT TIME ZONE` output across a span of days, rather than
   hard-coded from a calendar lookup, so the claim stays correct even if this topic is
   re-verified in a year whose own transition date differs.

Final build: `cd site && npm run build` completed clean (238 pages), after one fix during
development — a misplaced "answer" block on a non-predict narration step (QUALITY.md's own
narration check), the same class of fix needed for the previous topic in this chapter.
`node scripts/sources.mjs check <folder>` passed (6/6 quotes word for word). `PREVIEW_HELD=1
npm run build` completed clean; the held-topic reel smoke test was run with
`REEL_DEVICES=desktop` and passed on the third attempt (two prior attempts hit the same
Playwright timeout waiting for the Pause/Play control seen on the previous topic in this
chapter too, confirmed transient by a direct Playwright check finding the reel and its button
present throughout, with the agent network proxy again logging unrelated connection failures
during the same window), reporting both desktop and phone sizes.

This is the last topic of DE Chapter 8. All 24 topics (sections 8.1 through 8.3) are now built
and shipped as `status: 'held'`.
