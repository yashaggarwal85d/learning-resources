# Review — de.metadata-platforms-active-catalogs

## Content review, self-review, 2026-10-30

1. **No declared cross-chapter gap.** This is the first topic of §13.3, opening new ground; its
   concept ledger carries only `introduces` ids (`metadata-graph-entities-relationships`,
   `crawl-vs-push-ingestion`, `technical-vs-business-catalog`), no `uses` and no `declared` gap.
   The open-catalog protocol and table-format mechanics a technical catalog like Polaris or Unity
   Catalog sits on top of (Chapter 6 §6.3.4) are assumed, named only in the prerequisites panel as
   background reading, not as a structural `uses` dependency.
2. **Gap hunt against the syllabus line:** all four clauses (the graph architecture — pull
   crawlers vs. push/event ingestion, search, usage stats, glossary; open source vs. enterprise,
   including the Polaris-graduation aside; technical vs. business catalog; Amundsen's low-activity
   status) mapped in `coverage.json`; no clause left unmapped.
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic. Coverage (10 expert items,
   above the 10-item floor confirmed from `site/src/lib/coverage.ts`) and topic-file checks both
   pass on the clean build.
4. **A sourcing limitation, handled explicitly, not silently.** The syllabus names Amundsen's own
   GitHub repo as the primary source for its low-activity status. This session's GitHub access is
   scoped to `yashaggarwal85d/learning-resources` only, and `github.com` fetches outside that scope
   returned HTTP 403 to both `sources.mjs`'s own checker and direct `curl` — even `api.github.com`.
   `WebFetch`'s separate rendering path could still read the page. Rather than claim a quote
   `sources.mjs` can never independently verify, the repo's archive-banner text ("archived by the
   owner on Sep 29, 2026," "due to inactivity") is recorded as a directly-observed, dated fact in
   `FACT-CHECK.md` with an explicit note on the access limitation, referenced (not as a numbered,
   machine-checked source) in `references.md` and `OUTLINE.md`'s own research-note section — and
   is explicitly flagged there as not equivalent in confidence to the other five sources, which
   `sources.mjs check` verified word for word.
5. **Engagement:** hook on step 1; predict on step 2 (within the first four). Three takeaways at
   steps 4, 7, 8 — step 4 falls before this reel's own midpoint (step 5 of 10), earlier than this
   session's usual placement convention for a 10-step reel; this is a stylistic habit from earlier
   topics, not a build requirement (confirmed by reading `site/src/lib/topic-checks.ts`, which
   checks only count, wording and word-count, never placement), so it stands as written — the
   crawl-vs-push distinction earns its takeaway the moment it's drawn, not held back. A second
   predict at step 10 ("Prove it") tests a scenario (tables pushed, dashboards still crawled) from
   the opposite angle of step 2's own predict. Recap at step 9, immediately before Prove It.
6. **Narration teaches, not reads:** clean after one fix — step 5's narration line initially ran
   53 words, over the `narration-teaches.mjs` 50-word cap; split into two lines within the same
   step. Clean on recheck, 0–13% description overlap across all 10 steps.
7. **Numbers checked against `examples.py`:** a Wednesday change under a weekly crawl stays stale
   for 96 hours until the next crawl; the same change under push is stale for 0 hours; a
   usage-ranked search returns `table.customers` (420 queries) and `table.orders` (180) ahead of
   `table.customers_old` (3 queries, 4000 hours stale) despite the old one being the one someone
   might assume is "certified"; a technical-catalog answer and a business-catalog answer pulled
   from the same entity return genuinely different fields (`kind`/`freshness_hours` vs.
   `owner`/`glossary_terms`) — every claim in `reel.tsx` prose traces to an asserted value, with no
   literal digits in the prose itself.

### Checks run

- `node scripts/sources.mjs check site/src/topics/.../metadata-platforms-active-catalogs`: 13
  quotes found word for word, 0 problems (after removing the unfetchable Amundsen GitHub source
  and fixing one OpenMetadata quote that had been truncated before a continuing parenthetical).
- `python3 examples.py`: all asserts pass (two staleness functions, a `MetadataGraph` class with
  `add_entity`/`add_relationship`/`relationships_from`/`search_by_usage`, a sample graph builder,
  a technical-vs-business answer function, one `main`) — clean, no fixes needed at the code level.
- `node scripts/narration-teaches.mjs site/src/topics/.../metadata-platforms-active-catalogs`:
  clean after splitting one overlong (53-word) step-5 line into two; 0–13% overlap on recheck.
- `node scripts/check-all.mjs` (via `npm run build`): clean, no fixes needed during the build
  itself — the coverage expert-item count (initially 8, under the confirmed 10-item minimum from
  `site/src/lib/coverage.ts`) and the 5 `scenes.tsx` row-length violations were both caught and
  fixed before this build ran. 238 pages built.
- `node scripts/check-all.mjs --only reels --topic metadata-platforms-active-catalogs`: reel
  smoke test run; see looks review below for the screenshots it produced.

## Looks review, self-review, 2026-10-30

Three phone screenshots read and visually confirmed clean:

- `phone-metadata-platforms-active-catalogs-02.png` (Predict, step 2 of 10): both option cards
  render fully alongside the body text and the "NOT QUITE" explain block beneath.
- `phone-metadata-platforms-active-catalogs-07.png` (technical-vs-business reveal, step 7 of 10):
  the row pair renders with no overlap, the "MORE" truncation control and the takeaway panel both
  render fully and are visually separated by a divider, "TAP TO CONTINUE" is visible beneath.
- `phone-metadata-platforms-active-catalogs-10.png` (Prove it, step 10 of 10): both predict option
  cards for the second predict question render fully, alongside the top-of-screen summary rows
  ("tables" / "push, current", "dashboards" / "not yet revealed").

No overlap, clipping, or crowding in any of the three; predict panels render cleanly; every
reveal states its point in words, not through brightness alone.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**

## Fixes made during drafting

- **OpenMetadata quote mismatch:** the drafted quote ended in an artificial period
  ("...holds the type of the Relationship.") where the source continues mid-sentence into a
  parenthetical ("...holds the type of the Relationship (e.g., contains, uses, follows…)."). Fixed
  by extending the quote through the full parenthetical.
- **Amundsen source access limitation:** `github.com/amundsen-io/amundsen` returned HTTP 403 to
  this session's GitHub tools and to direct `curl` (scoped elsewhere per this session's repository
  scope), even though `WebFetch` could independently read the page. Resolved by moving the claim
  out of `SOURCES.md` (which `sources.mjs check` could never verify) into a directly-observed,
  dated, explicitly-caveated fact in `FACT-CHECK.md`, `OUTLINE.md`'s research note, and
  `references.md`.
- **Storyboard step-count mismatch:** `OUTLINE.md` was first drafted assuming an 11-step reel with
  a folded-in step that didn't end up existing separately in `reel.tsx`, which came out to 10 real
  steps. Fixed by correcting the storyboard header, removing the phantom bullet, and renumbering
  the Prove-It and "Engagement placement" references from 11 to 10.
- **Row lengths (`scenes.tsx`):** 5 separate 4+ word values/labels caught while writing the file,
  two needing a second pass after the first fix still ran long — all shortened to 1–3 words per
  the house rule before the build ran.
- **`narration.json` step 5 over the 50-word line cap:** split into two lines within the same step.
- **`coverage.json` under the 10-item expert minimum:** initially written with 8 items; 2 more
  added (the open-source/enterprise naming-without-feature-claim scope limit; Polaris and Unity
  Catalog OSS sitting on an open table format as what makes them technical catalogs) to meet the
  confirmed ≥10 floor.
