# Review — de.mysql-binlog-other-change

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 10's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line
(replication-slot WAL retention incidents).

1. **Flow.** The bridge answers topic 10's own handoff verbatim-in-spirit ("PostgreSQL gives a
   consumer a slot that remembers its place for it... the next topic is that log") and this
   topic's own handoff matches `CHAPTER.md`'s own handoff into topic 12 (a slot's sharp edge is
   the production disk). Checked all three named `uses` ids via the registry-parsing script:
   `logical-decoding-slot`, `query-vs-log-cdc` and `replica-identity-before-image` all resolve
   live.
2. **Pre-notes.** 7 bullets (binlog, row-based logging, GTID, binlog retention, DDL, redo log,
   change table — `CHAPTER.md`'s own syllabus terms for this topic), each under the per-term
   format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` §8.2, line 511) splits at
   its own semicolons into three clauses: binlog/GTID/retention, DDL and the schema-history
   topic, and Oracle/SQL Server as contrasts. `coverage.json`'s `syllabus` array matches this
   three-clause breakdown exactly, copied verbatim from the raw syllabus file.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the documentation's own wording, not invented reasoning. This sandbox has no MySQL,
   Oracle or SQL Server server — confirmed directly by checking for installed server binaries —
   so every measured claim traces to a Python model of the documented mechanics in
   `examples.py`, disclosed as a model in every function's own docstring, FACT-CHECK.md and
   SOURCES.md, exactly as `CHAPTER.md`'s own "Lab: none of its own" line allows.
5. **Engagement.** Hook (step 1, a connector silently misreading a promoted replica's binlog);
   predict within the first four steps (step 2, whether the connector notices the mismatch);
   three takeaways across the reveal steps (steps 4, 6, 8); recap (step 9) names the trade the
   topic's three measurements feed; "Prove it" (step 10) names what none of that explains about
   DDL, setting up the handoff to topic 12 and naming Oracle/SQL Server directly.
6. **Narration teaches.** Checked narration lines against description/body text by hand: every
   step's narration explains *why* a modelled fact comes out the way it does (why a position is
   only meaningful on the server that wrote it; why a GTID doesn't have that problem; why a
   schema-history topic is a necessity, not a convenience) rather than reading the figure's own
   on-screen labels back. No digits and no underscored identifiers appear in `reel.tsx`,
   `scenes.tsx` or `narration.json`, checked with `grep` after the build caught two underscored
   PostgreSQL identifiers left over from drafting and they were rephrased before the final run.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

1. Every `scenes.tsx` `Row` label/value pair was checked and fixed with a Python script before
   the build ran: four pairs exceeded three words on the first draft and were trimmed; `grep`
   for digits in visible text returns no matches in the final file.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before narration: one of four takeaways (24 words) needed
   trimming down to 20; the other three (20, 18, 20) needed no change.
3. `examples.py` was run to completion (`python3 examples.py` → "all checks passed") before
   writing the reel. This sandbox has no live MySQL, Oracle or SQL Server to measure against, so
   every figure on screen is explicitly a Python model of a documented fact, not a claim of a
   live measurement — disclosed in the reel's own header comment, `FACT-CHECK.md` and
   `SOURCES.md` alike, rather than presented as equivalent to the live PostgreSQL measurements of
   topics 9 and 10.

Final build: `cd site && npm run build` completed clean. The unrelated `npm run test:editor`
check is a known pre-existing sandbox limitation (see team memory
`learning-resources-recurring-bugs`), unrelated to anything this topic touches. The held-topic
reel smoke test was run with `REEL_DEVICES=desktop` and `REEL_DEVICES=phone` as two separate
invocations, per the sandbox-level Playwright flakiness noted in topic 7's own review.
