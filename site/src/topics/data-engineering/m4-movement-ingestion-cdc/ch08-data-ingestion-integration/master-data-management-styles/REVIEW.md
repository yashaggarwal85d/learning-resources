# Review — de.master-data-management-styles

## Content review, self-review, 2026-11-01

Read cold: `CHAPTER.md`'s entry for this topic, topic 22's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (Semantic
integration: schemas, codes and units).

1. **Flow.** The bridge answers topic 22's own handoff verbatim ("Transport is solved: a row and
   every change to it reach the analytical side, in order, once in effect... who owns the
   truth") and this topic's own handoff matches `CHAPTER.md`'s own handoff into topic 24
   verbatim. Checked all four named `uses` ids via `grep -n "introduces: \[.*'<id>'"` against
   `registry.ts`: `query-vs-log-cdc`, `cdc-landing-strategies`, `conformed-dimension` and
   `scd-type-2` all resolve live.
2. **Pre-notes.** 8 bullets (master data, golden record, registry, hub, steward, survivorship,
   ERP, CRM — `CHAPTER.md`'s own syllabus terms for this topic), each under the per-term format,
   no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` line 529) splits at its
   own two semicolons into three clauses: the four named styles; match-merge pipelines and
   stewardship workflows; and customer/product/plant master consistency across ERP/CRM (with the
   SAP cross-reference, including its own §10.5 typo). `coverage.json`'s `syllabus` array
   matches this three-clause breakdown exactly, copied word for word from the raw syllabus file
   including the typo, confirmed by a direct substring check that leaves zero characters
   uncovered. The expert list has 10 items on the first draft, meeting the required minimum
   without needing a second pass.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against each style's own documented definition, not invented reasoning: the first against
   which styles never write back to a source (registry, consolidation), the second against the
   centralized style's own defining property directly contradicting the scenario's own
   requirement.
5. **Engagement.** Hook (step 1, a customer with two keys and two credit limits across a CRM and
   an ERP, double counted in a report); predict within the first four steps (step 2, whether
   fixing this always means rewriting a source); three takeaways (steps 6, 7, 9 — meeting the
   build's own minimum-of-three rule); "Prove it" (step 10) generalizes the "who writes" axis to
   a new scenario, directly reusing the consolidation-versus-centralized distinction from steps
   4 and 6 to rule out the wrong answer.
6. **Narration teaches.** Checked every narration line against the reel's own description/body
   text by hand before the build ran: every step explains *why* a style behaves the way it does
   (why registry and consolidation never touch a source; why centralized's own control comes at
   the cost of every other system's freedom) rather than reading the figure's own on-screen
   labels or restating the predict question verbatim. The build's own narration-teaches check
   passed after one fix (moving a misplaced "answer" block for a non-predict step into its own
   lines). No digits and no underscored identifiers appear in `reel.tsx`'s or `scenes.tsx`'s
   visible text or in `narration.json` — one digit-bearing comment in `reel.tsx` ("the 8.3 lab's")
   was caught by the build's own file-wide digit check and reworded; every narration line is
   confirmed at or under the 50-word-per-line ceiling by a Python script (longest line: 37
   words).

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-11-01

1. Every `scenes.tsx` `Row` label/value pair was written to stay within the house style's usual
   one-to-three-word guideline per side; `grep` for digits in visible text returns no matches in
   the final file.
2. Takeaway word counts (em dash and colon-joined clauses counted word by word) checked with a
   Python script against `reel.tsx`'s own source text: all three takeaways (20, 18, 16 words)
   passed after two length fixes — the first drafts for steps 6 and 9 ran to 22 and 21 words and
   were trimmed without losing either claim.
3. This topic has no `examples.py`, per `CHAPTER.md`'s own "Lab" line: the 8.3 lab's
   record-linkage half is not hosted, since matching and survivorship algorithms are three
   skipped syllabus topics. This absence is disclosed in the reel's own leading comment, in
   `SOURCES.md`, in `coverage.json`'s expert list, and here, rather than left unexplained.
4. No vendor-neutral primary architecture reference for the four MDM styles could be found
   reachable: CHAPTER.md's own plan already found Microsoft's Azure architecture MDM page
   returning HTTP 404, and a direct re-fetch at build time (2026-11-01) confirms it still is.
   `node scripts/sources.mjs check <folder>` passed (6/6 quotes word for word) against
   Wikipedia's own named list (read secondary, exactly as CHAPTER.md's own "Sources" line
   specifies) backed by Profisee's own vendor description — disclosed as a vendor source, not
   presented as neutral, in both `SOURCES.md` and here. Two quotes needed a small fix on the
   first check: the sentence-ending punctuation in the actual fetched text was a comma, not the
   period my first draft quoted, in two of the four Profisee quotes.
5. A build-time coverage-check fix was needed: the third syllabus clause's own "at" array
   initially carried both reel steps and an "out" entry disclosing the SAP cross-reference's own
   typo, which the build's own coverage checker rejects (a syllabus clause may never be marked
   "out," only sources and expert items may). Fixed by moving that disclosure into the expert
   list instead, where "out" entries are allowed, leaving the syllabus clause itself covered
   only by its two reveal steps.

Final build: `cd site && npm run build` completed clean (238 pages), after three fixes during
development — the coverage-check fix above, a misplaced "answer" block on a non-predict
narration step (QUALITY.md's own narration check), and a digit-bearing leading comment in
`reel.tsx` reworded to remove it. `node scripts/sources.mjs check <folder>` passed (6/6 quotes
word for word, after the two Profisee punctuation fixes above). `PREVIEW_HELD=1 npm run build`
completed clean; the held-topic reel smoke test was run with `REEL_DEVICES=desktop` and passed
on the third attempt (two prior attempts hit the same Playwright timeout waiting for the
Pause/Play control, confirmed transient — a direct Playwright check against the topic's own page
found the reel and its button present throughout, and the agent network proxy logged unrelated
connection failures during the same window), reporting both desktop and phone sizes.
