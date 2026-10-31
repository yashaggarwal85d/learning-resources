# Review — de.negotiating-data-contracts-slos

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): producer/consumer agreements (Reveal:
  what a data contract actually is); pricing freshness/availability tiers (Reveal: pricing three
  tiers on a cost curve); error budgets and breach ownership §11.3 (Reveal: the error budget;
  Reveal: who owns a breach); the negotiation-vs-enforcement scope line (Internals deep dive).
- Sourcing: both sources (dbt Labs' Model contracts docs, Google's SRE book) fetched cleanly on
  the first try. One quote-matching fix: the SRE book's own error-budget sentence has a curly
  apostrophe and a parenthetical cross-reference immediately before the quote's closing period;
  fixed by matching the source's extracted text exactly, documented in FACT-CHECK.md.
- This chapter has no system under test (CHAPTER.md's own "Engine of record" note): the lab is a
  written artifact. `examples.py` computes three priced SLO tiers from a disclosed, illustrative
  cost model (explicitly not sourced real pricing), confirms every tier states a non-goal and
  names a breach owner, and computes a quarterly error budget in the SRE book's own worked style.
  Every number is computed, not hardcoded; the model is deterministic (no database, no
  randomness), so a single run is sufficient — re-ran it anyway to confirm, identical output both
  times.
- The reel's engagement arc holds: one predict (step 2) plus the closing "Prove it," no takeaway
  on step 3 (the reel test's reference step, "Reveal: what a data contract actually is"),
  takeaways on steps 4, 5, 6, 7 (four takeaways).
- Narration (verified via `narration-teaches.mjs`): passed clean, description-overlap under the
  fifty-percent floor on every step. No digits, symbols or code names anywhere in `narration.json`.
- Takeaways: all four checked and kept at or under the twenty-word limit (one landed at exactly
  twenty, counting the dash).
- Bridge answers Chapter 18's handoff verbatim per CHAPTER.md; handoff opens into topic 2's exact
  subject (communicating the chosen tier's trade-off to a decision-maker) as planned.

## Looks review (self-review, 2026-10-30)

Checked via the topic-scoped reel smoke test (`tests/reels.mjs`) at desktop and phone sizes,
using the slug fragment (not the dotted topic id) as `--topic`.

- First run failed on phone twice over: (1) step 4's three tier-ladder labels were drawn directly
  on top of their own semi-transparent colored bars, falling below the minimum text contrast
  ratio; (2) step 8's (Recap's) own caption line ran past the drawing's right edge.
- Fixed (1) by moving each label below its own bar with a clear gap, off the colored fill
  entirely, instead of overlapping it. Fixed (2) by shortening the Recap caption to drop its
  redundant "real-time is" lead-in, keeping the same point.
- Second run passed cleanly at both sizes with no further issues.

Final `node scripts/check-all.mjs --only reels --topic
data-engineering/m8-synthesis-capstones-stakeholder/ch19-stakeholder-engineering/negotiating-data-contracts-slos`
run: `test:reels` passed ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes").
`test:editor` still fails with "a save did not open a new GitHub issue" — the same known,
pre-existing, topic-independent Playwright/Chromium sandbox limitation documented on every prior
topic's REVIEW.md in this project, not caused by this topic and not a shipping blocker.

This opens Chapter 19, the course's own final chapter.
