# Review — de.from-warehouse-lake-lakehouse

## Content summary

13 steps covering the architectural history of §3.3: a coupled, compute-and-storage MPP warehouse
(the first generation), a cheap schema-on-read data lake with a downstream warehouse still doing
the important BI (the second generation), the swamp risk that comes with a lake lacking
transactions and governance by default, the two-tier lake-plus-warehouse shape becoming dominant
industry-wide, and the lakehouse — an open table format (Delta Lake, Apache Iceberg) giving the
lake transactions back without recoupling storage to one engine. The running thread is one
capability, ACID transactions, tracked present → absent → present again across the three stages,
each time by a different mechanism. Three predicts (first at step 3, within the first four),
three takeaways, closing with a "Prove it" that asks which stage actually fits a workload with no
multi-engine requirement, testing whether the lakehouse's cost is understood as conditional rather
than unconditionally best.

This topic has no lab of its own (`CHAPTER.md`). The one number on screen (one pipeline step for
a direct load, two for lake-then-warehouse) is explicitly disclosed everywhere — `examples.py`,
`FACT-CHECK.md`, `coverage.json` — as this topic's own count derived from the paper's description
of the two architectures, not a statistic the paper states outright. Every other claim traces to
a direct quote.

## Sources

The Lakehouse paper (Armbrust, Ghodsi, Xin, Zaharia, CIDR 2021) plus the Databricks "Introduction
to Data Lakes" glossary page. 6 quotes total, verified word for word
(`node scripts/sources.mjs check`, 0 problems). A third candidate source (Stonebraker's CACM "data
swamp" post) could not be fetched (403 on the live page, 404 on an archived path) and was
deliberately dropped rather than forced in; the Databricks quote covers the same claim.

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (added a third on the swamp-risk reveal, step 5, after the build's coverage
  check caught the first draft at only 2).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 13
  steps well under the flag threshold, max 38%, step 12's recap).
- No literal digits appear in `reel.tsx` at all (every quantity spelled in words — "one step,"
  "two steps" — so the digit-on-screen check has nothing to flag).

## Fixes made during this build

- `coverage.json`'s syllabus mapping initially left the parenthetical "(internals in Ch.6)" of
  the syllabus line uncovered, which the build's coverage check caught by name
  (`no clause covers: internals, ch, 6`); added a clause for it, mapped to post-notes.md's new
  Internals section, which already discusses the Chapter 6 handoff.
- The reel's initial draft had only 2 takeaways; the build's topic-file check requires at least 3
  — added one to the swamp-risk reveal (step 5) rather than inflating an existing one.
- Wrote `coverage.json`'s 11-item expert list and all `at.step` values copied verbatim from the
  final `reel.tsx` step titles from the start this time (the recurring bug from topics 14 and 15),
  so no step-title or expert-count fix was needed after the fact.
- No Playwright phone/desktop text-overflow fixes were needed — `scenes.tsx` was written with the
  short 1–3-word Row label/value pattern from the start and passed clean on the first run.

## Checks run

- `node scripts/sources.mjs check` — 6/6 quotes verified word for word.
- `python3 examples.py` — pass, "from-warehouse-lake-lakehouse examples: all numbers check out".
- `node scripts/check-all.mjs --skip reels,links --topic from-warehouse-lake-lakehouse` — pass
  (locked, docs, sources, build, narration) after the two coverage/takeaway fixes above.
- `node scripts/narration-teaches.mjs .../from-warehouse-lake-lakehouse` — pass, all 13 steps
  under the description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; none from this one).
- `node scripts/check-all.mjs --only reels --topic from-warehouse-lake-lakehouse` — pass,
  Playwright desktop and phone, clean on the first run.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
