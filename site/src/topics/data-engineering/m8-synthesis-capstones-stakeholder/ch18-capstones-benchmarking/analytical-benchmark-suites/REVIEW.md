# Review — de.analytical-benchmark-suites

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): TPC-H/TPC-DS (Reveal: TPC-H and TPC-DS,
  what each stresses); ClickBench and its blind spots (Reveal: ClickBench and its own stated
  blind spot); the Join Order Benchmark (Reveal: the Join Order Benchmark, for cardinality
  estimation and join ordering); TPC-DI as obsolete (Reveal: TPC-DI, the only TPC ETL
  specification, now obsolete); benchmarketing and DeWitt-clause licence terms (Reveal:
  benchmarketing and the DeWitt clause).
- Sourcing: all six sources fetched cleanly on the first try (TPC-H and TPC-DS PDFs reused from
  earlier research this chapter; ClickBench's README, the Leis et al. PVLDB paper, TPC's own
  current specifications listing, and Wikipedia's "David DeWitt" article all fetched fresh). No
  bot-blocks or substitutions needed this topic. TPC-DI's obsolete status was verified directly
  against TPC's own current specifications page rather than trusted from CHAPTER.md's own
  planning note, per the project's never-guess-a-fact discipline.
- This topic's lab is real measurement, not a simulated number: `examples.py` builds a small,
  disclosed correlated schema and compares joining a large items table against a large
  transactions table in full (fenced with a MATERIALIZED CTE) before a selective filter narrows
  them, against filtering first and joining only the survivors. The first implementation attempt
  used Postgres's own `join_collapse_limit` setting over tiny dimension tables and showed no
  measurable difference, because a selective filter on a small base table gets pushed down
  regardless of join-reordering settings; switched to a MATERIALIZED CTE fence over a schema
  where the fact table is five times larger, which reliably reproduces the cost difference (a
  roughly two-to-one latency ratio, confirmed stable across two separate runs). The topic then
  closes the chapter lab by re-running topics one, two and three's own committed examples.py
  scripts from this one script, confirming all three exit clean on both runs.
- The reel's engagement arc holds: one predict (step 2) plus the closing "Prove it," no takeaway
  on step 3 (the reel test's reference step, "Reveal: TPC-H and TPC-DS, what each stresses"),
  takeaways on steps 4, 5, 6, 7 (four takeaways).
- Narration (verified via `narration-teaches.mjs`): passed clean, description-overlap under the
  fifty-percent floor on every step (highest was forty-three percent on the hook). No digits,
  symbols or code names anywhere in `narration.json`.
- Takeaways: a build-time check initially failed all four takeaways as over the twenty-word
  limit (22, 22, 23 and 26 words); fixed by trimming each one to its core claim while keeping the
  same point, rechecked at or under twenty words.
- Bridge answers topic 3's handoff verbatim per CHAPTER.md; handoff closes the chapter, opening
  into Chapter 19's exact subject (requirements, contracts and stakeholder communication) as
  planned.

## Looks review (self-review, 2026-10-30)

Checked via the topic-scoped reel smoke test (`tests/reels.mjs`) at desktop and phone sizes,
using the slug fragment (not the dotted topic id) as `--topic`, per this project's own documented
gotcha.

- First run failed on phone: step 3 and step 5's own single-line captions each ran past the
  drawing's right edge at phone's larger text scale.
- Fixed by shortening both captions to tighter phrases, keeping each scene's own point intact
  ("the same skew lesson, built at industry size"; "this chapter's own correlated-column lesson,
  at scale").
- Second run passed cleanly at both sizes with no further issues.

Final `node scripts/check-all.mjs --only reels --topic
data-engineering/m8-synthesis-capstones-stakeholder/ch18-capstones-benchmarking/analytical-benchmark-suites`
run: `test:reels` passed ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes").
`test:editor` still fails with "a save did not open a new GitHub issue" — the same known,
pre-existing, topic-independent Playwright/Chromium sandbox limitation documented on every prior
topic's REVIEW.md in this domain, not caused by this topic and not a shipping blocker.

This closes Chapter 18 (§18.1), the chapter's own lab: topic 1's steady-state harness, topic 2's
closed-loop/constant-rate generator, topic 3's seeded data generator, and this topic's own
join-order baseline, now all committed and verified to re-run together end to end from one
script.
