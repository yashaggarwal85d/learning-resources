# Review — de.query-based-vs-log

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 8's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line
(PostgreSQL logical decoding internals).

1. **Flow.** The bridge answers topic 8's handoff ("One failure the section kept returning to
   has no fix inside a cursor... The source database already records every change") and this
   topic's own handoff matches `CHAPTER.md`'s own handoff into topic 10 (what the log contains
   and how a consumer holds a place in it depends on the engine). Checked all four named `uses`
   ids via the registry-parsing script: `cursor-miss-modes`, `high-watermark-cursor`,
   `wal-lsn-fsync` and `physical-vs-logical-replication` all resolve live.
2. **Pre-notes.** 7 bullets (CDC, polling, trigger, write amplification, intermediate state,
   replication log, before-image — `CHAPTER.md`'s own syllabus terms for this topic), each under
   the per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` §8.2) splits into the two
   clauses it actually contains: polling and triggers (load, missed deletes, missed
   intermediate states, write amplification) versus reading the replication log (complete,
   ordered, low overhead, but operationally coupled). `coverage.json`'s `syllabus` array matches
   this two-clause breakdown exactly, copied verbatim from the raw syllabus file.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against this topic's own measured facts (PostgreSQL's real trigger-firing semantics, the
   Debezium quote on WAL purging), not invented reasoning. Every measured claim traces to a
   specific function in `examples.py`, run against this sandbox's own real PostgreSQL cluster
   and the identical `orders` table earlier topics in this chapter use — not a mock or an
   in-process stand-in, since this topic's whole point is the real database's own log.
5. **Engagement.** Hook (step 1, a four-second state sequence a poll samples once); predict
   within the first four steps (step 2, whether a trigger sees the gap a poll misses); three
   takeaways across the reveal steps (steps 4, 6, 8); recap (step 9) names the trade the rest of
   8.2 manages; "Prove it" (step 10) names the one cost log-based capture carries that the hook
   and reveals haven't shown yet, setting up topic 10's own subject directly.
6. **Narration teaches.** Checked narration lines against description/body text by hand: every
   step's narration explains *why* a measurement comes out the way it does (why a trigger fires
   per statement, not per transaction; why a poll can't distinguish never-existed from deleted;
   why a slot's own position, not the read itself, is what costs something) rather than reading
   the figure's own on-screen labels back. No digits appear in `reel.tsx`, `scenes.tsx` or
   `narration.json`; one stray digit in a `reel.tsx` code comment (not visible text) was caught
   and fixed proactively before the build ran.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

1. Every `scenes.tsx` `Row` label/value pair was written at 1-3 words from the first draft;
   `grep` for digits returns no matches.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before narration: two of four takeaways (21 and 22 words) needed
   trimming down to 19 and 18; the other two (20, 19) needed no change.
3. `examples.py` was run to completion (`python3 examples.py` → "all checks passed") against
   this sandbox's own real PostgreSQL cluster before writing the reel, so every figure on screen
   matches a number that was actually measured against a live database, not estimated. Test
   rows (ids nine hundred thousand and above) were confirmed cleaned up after each run, and the
   `orders` table's own row count was confirmed unchanged afterward.

Final build: `cd site && npm run build` completed clean. The unrelated `npm run test:editor`
check is a known pre-existing sandbox limitation (see team memory
`learning-resources-recurring-bugs`), unrelated to anything this topic touches. The held-topic
reel smoke test was run with `REEL_DEVICES=desktop` and `REEL_DEVICES=phone` as two separate
invocations, per the sandbox-level Playwright flakiness noted in topic 7's own review.
