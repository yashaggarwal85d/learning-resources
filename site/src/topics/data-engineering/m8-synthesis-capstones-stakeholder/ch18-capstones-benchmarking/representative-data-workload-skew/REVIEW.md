# Review — de.representative-data-workload-skew

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): uniform toy data hides hot keys (Reveal:
  the uniform baseline, confirmed flat); Zipfian key distributions (Reveal: Zipfian key
  generation, reproduced); cross-column correlations breaking cardinality estimators (Reveal:
  correlated columns breaking a cardinality estimator); scale factors (Reveal: an explicit scale
  factor); the seeded data generator as a committed artifact (Reveal: the seeded generator as a
  committed artifact).
- Sourcing: PostgreSQL's planner-stats docs, YCSB's `workloads/workloada`, and YCSB's
  `ZipfianGenerator.java` all fetched cleanly from raw/docs URLs on the first try; TPC-H's
  Standard Specification PDF fetched cleanly as well. One real catch before anything shipped:
  grepping YCSB's fetched `CoreWorkload.java` directly (rather than trusting the syllabus's
  "(the YCSB default)" parenthetical) showed the code-level fallback distribution is `uniform`,
  not `zipfian` — resolved by citing Workload A's own shipped configuration file instead and
  phrasing SOURCES.md's note precisely, documented in FACT-CHECK.md's Problem Solving section.
  `sources.mjs check` also initially failed on the `ZipfianGenerator.java` quote until the
  source's own Javadoc `" * "` line-continuation prefix was matched literally in the second quote
  line.
- This topic's lab is real measurement, not a simulated number: `examples.py` builds a uniform
  baseline and confirms no hot-key effect; rebuilds the identical shop schema with a seeded
  Zipfian generator and measures a real hot-key latency effect on the busiest customer; builds a
  correlated-columns table and an independent-columns table of identical size and measures each
  one's `EXPLAIN`-estimated row count against its own actual count; and hashes two independent
  runs of the same seeded generator call to confirm byte-identical output. All assertions passed
  on three separate runs against this sandbox's real, shared Postgres, with naturally varying
  absolute millisecond numbers but a stable qualitative shape each time (flat uniform baseline;
  a consistently far-larger correlated-column estimate error; identical digests).
- The reel's engagement arc holds: one predict (step 2) plus the closing "Prove it," no takeaway
  on step 3 (the reel test's reference step, "Reveal: the uniform baseline, confirmed flat"),
  takeaways on steps 4, 5, 6, 7 (four takeaways).
- Narration (verified via `narration-teaches.mjs`): passed clean, description-overlap well under
  the floor on every step. No digits, symbols or code names anywhere in `narration.json`.
- Takeaways: all four checked and kept at or under the twenty-word limit.
- Bridge answers topic 2's handoff verbatim per CHAPTER.md; handoff opens into topic 4's exact
  subject (analytical benchmark suites) as planned.

## Looks review (self-review, 2026-10-30)

Checked via the topic-scoped reel smoke test (`tests/reels.mjs`) at desktop and phone sizes.

- First run used the dotted topic id (`de.representative-data-workload-skew`) as the `--topic`
  filter, which does not match `tests/reels.mjs`'s own slug-substring match and silently tested
  zero reels ("0 live reel(s)") — re-confirmed the project's own documented gotcha that `--topic`
  must be a slug fragment, not the dotted id, and re-ran with the correct slug.
- With the correct slug, the first real run failed on phone: step 5, 6 and 7's own single-line
  caption each ran past the drawing's right edge at phone's larger text scale.
- Fixed by shortening all three captions to tighter phrases, keeping each scene's own point intact
  ("independence is assumed; correlation breaks it"; "the same convention industry benchmarks
  declare out loud"; "committed once, not a one-off script").
- Second run passed cleanly at both sizes with no further issues.

Final `node scripts/check-all.mjs --only reels --topic
data-engineering/m8-synthesis-capstones-stakeholder/ch18-capstones-benchmarking/representative-data-workload-skew`
run: `test:reels` passed ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes").
`test:editor` still fails with "a save did not open a new GitHub issue" — the same known,
pre-existing, topic-independent Playwright/Chromium sandbox limitation documented on every prior
topic's REVIEW.md in this domain, not caused by this topic and not a shipping blocker.
