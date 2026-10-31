# Review: End-to-end exactly-once with external sinks (de.end-to-end-exactly-once-sinks)

## Automated checks

`npm run build` from `site/`: clean, 340 pages built (after fixing coverage.json's expert list
from 8 to 10 items — the build's own PROJECT_PLAN.md Rule #6 coverage check caught the shortfall
before any manual review).
`node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/end-to-end-exactly-once-sinks`:
reel smoke test passed, "1 live reel(s) at desktop and phone sizes." The `test:editor` failure
("a save did not open a new GitHub issue") is the known, pre-existing, topic-independent sandbox
limitation reconfirmed on every topic this session — not a regression.

## Content review

- All 10 steps screenshotted at desktop and phone sizes.
- Hook, setup, 2 predict/reveal pairs (crash recovery, the three failure modes), the upsert
  reveal, the offset-atomicity reveal, Prove it, and Recap all render with correct titles, body
  text, and figures.
- 3 takeaways present, each ≤20 words (counted with the em dash as its own word).
- No literal digits in `reel.tsx`; duration values are the only numbers and are exempt — checked
  explicitly this topic since an early takeaway draft referenced "topic 9" by number and had to
  be reworded.
- All Row label/value pairs in `scenes.tsx` are 1-3 words each (one Row value, "no loss or dup",
  caught at 4 words and shortened to "clean, no dupes" before the reel test ran).

## Screenshots reviewed

Desktop and phone, all 10 steps including the predict screens (both with their option/reveal
states) and the final three reveal/prove-it/recap steps. No layout overflow, no truncated text
beyond the intentional phone "MORE" collapse, no visual regressions.

## Findings

None.
