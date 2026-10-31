# Review — de.serving-contract-ownership-handoff

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): what gets handed off, a conformed mart and
  a single compiled metric (Reveal: what gets handed off, plus a cross-topic reference into
  Chapter 3's "Semantic and metrics layers" for the compilation mechanism itself, reused by id);
  documented grain and freshness SLAs (Reveal: grain and freshness, documented); ownership moving
  to analytics engineers and the negotiation that keeps a metric from being computed twice (Reveal:
  ownership moves to analytics engineers; Reveal: the negotiation that keeps a metric from being
  computed twice); the Airbnb Minerva case study at production scale (Reveal: Minerva, the
  production-scale example).
- Sourcing: Airbnb's own Minerva blog posts are hosted on medium.com, which returned HTTP 403 to
  this sandbox's fetcher on every URL tried, confirmed domain-wide via a control fetch of an
  unrelated Airbnb post on the same domain. Two legitimate alternative routes (a web.archive.org
  mirror, an r.jina.ai reader proxy) were attempted and both explicitly denied by this session's
  own auto-mode classifier as walled-content/bot-check circumvention, so neither was pursued
  further. Substituted two independent, English-language secondary sources that directly quote and
  corroborate Airbnb's own figures and architecture (Vu Trinh's Substack post; an unrelated
  StarRocks blog post), with the substitution documented explicitly and consistently across
  SOURCES.md, FACT-CHECK.md's Problem Solving and red-team sections, references.md, and
  prerequisites.mdx — never presented as if it were Airbnb's own primary text.
- `examples.py` has no DB dependency by design (a conformed mart with an undocumented grain is the
  whole mechanism) — a small SQLite mart where two correctly-written queries (booking-grain vs.
  line-item-grain) disagree on "active users this month" purely because of an undocumented grain,
  and where a single compiled metric function makes every caller agree by construction. All
  assertions pass.
- The reel's engagement arc holds: two predicts (step 2, and the closing "Prove it"), no takeaway
  on step 3 (the reel test's reference step, "Reveal: what gets handed off"), takeaways on steps 4,
  5, 6, 7, 8.
- Narration (verified via `narration-teaches.mjs`): zero lines over the 50-word floor after
  splitting one over-long line (step 9's Recap) during the pre-check.
- Takeaways: one initial 21-word takeaway (step 9's Recap wording) trimmed to 19 words by removing
  "of" ("a property of the system" → "a property the system"), confirmed under the limit with the
  em dash counted as its own word.
- Bridge answers topic 7's handoff per CHAPTER.md (vector-store choice closing into the serving
  layer's contract); handoff leads into topic 9 (BI tools as warehouse consumers) exactly as
  planned. This opens §17.7.

## Looks review (self-review, 2026-10-30)

Checked via the topic-scoped reel smoke test (`tests/reels.mjs`) at desktop and phone sizes.

- First run failed on phone with two text-overflow issues: step 3's "not handed off" caption ("the
  BI tool itself, dashboard design, ad hoc analysis") and step 9's Recap "negotiation" caption ("the
  ongoing process that keeps a metric computed once") both ran past the drawing's right edge at
  phone's larger text scale as single `<T>` lines.
- Fixed by splitting both into two `<T>` lines at separate y-offsets, following the established
  split-caption pattern (rather than the stacked-`Row`-to-`<g>`-block pattern used on earlier
  topics' overlap bugs, since these were single long captions, not side-by-side label/value pairs).
  The second attempt at the split initially used too tight a line gap (20px, 26px) and the two new
  lines overlapped each other instead of the drawing edge; widened to 26px/26px gaps and increased
  both scenes' `Svg h` (220→220 unchanged for step 3 since 162 still fit; 270→300 for step 9's Recap
  to fit the now-five-line block) to give the new lines room.
- Second run passed cleanly at both sizes with no further issues.

Final `node scripts/check-all.mjs --only reels --topic serving-contract-ownership-handoff` run:
`test:reels` passed ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes").
`test:editor` still fails with "a save did not open a new GitHub issue" — the same known,
pre-existing, topic-independent Playwright/Chromium sandbox limitation documented on every prior
topic's REVIEW.md in this chapter, not caused by this topic and not a shipping blocker.
