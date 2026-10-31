# Review: Deduplication keys and idempotent consumers (de.deduplication-idempotent-consumers)

## Automated checks

`npm run build` from `site/`: clean, 343 pages built.
`node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/deduplication-idempotent-consumers`:
reel smoke test passed, "1 live reel(s) at desktop and phone sizes." The `test:editor` failure
("a save did not open a new GitHub issue") is the known, pre-existing, topic-independent sandbox
limitation reconfirmed on every topic this session — not a regression.

## Content review

- All 10 steps screenshotted at desktop and phone sizes.
- Hook, setup, 2 predict/reveal pairs (late redelivery, Bloom-filter error direction), the
  bound-choice reveal, the derived-id reveal, Prove it, and Recap all render with correct titles,
  body text, and figures.
- 3 takeaways present, each ≤20 words (counted with the em dash as its own word) — two takeaways
  initially drafted at 21 words each and trimmed before this review.
- No literal digits in `reel.tsx`; duration values are the only numbers and are exempt.
- All Row label/value pairs in `scenes.tsx` are 1-3 words each.
- One takeaway sits on the step immediately after a predict step (step 4, right after the first
  predict at step 3) — screenshotted at phone size to confirm no "swipe from caption" overlap;
  renders clean, matching the same pattern already shipped on topic 11.

## Screenshots reviewed

Desktop and phone, all 10 steps including both predict screens (with their option/reveal states)
and the bound-choice, derived-id, prove-it, and recap steps. No layout overflow, no truncated
text beyond the intentional phone "MORE" collapse, no visual regressions.

## Findings

None.
