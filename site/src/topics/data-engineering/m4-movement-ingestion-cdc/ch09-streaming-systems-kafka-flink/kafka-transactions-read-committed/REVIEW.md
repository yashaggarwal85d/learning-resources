# Review: Kafka transactions and read-committed (de.kafka-transactions-read-committed)

## Automated checks

`npm run build` from `site/`: clean, 337 pages built.
`node scripts/check-all.mjs --only reels --topic data-engineering/m4-movement-ingestion-cdc/ch09-streaming-systems-kafka-flink/kafka-transactions-read-committed`:
reel smoke test passed, "1 live reel(s) at desktop and phone sizes." The `test:editor` failure
("a save did not open a new GitHub issue") is the known, pre-existing, topic-independent sandbox
limitation reconfirmed on every topic this session — not a regression.

## Content review

- All 10 steps screenshotted at desktop and phone sizes.
- Hook, setup, 2 predict/reveal pairs, consume-transform-produce reveal, newer-KIPs reveal,
  Prove it, and Recap all render with correct titles, body text, and figures.
- 3 takeaways present, each ≤20 words (counted with the em dash as its own word): the
  read-committed-filtering takeaway (19 words), the consume-transform-produce takeaway (20
  words after trimming "the moment" to "once"), and the KIP-890/939 takeaway (19 words, newly
  added to meet the ≥3 minimum).
- No literal digits in `reel.tsx`; duration values are the only numbers and are exempt.
- All Row label/value pairs in `scenes.tsx` are 1-3 words each.
- Found and fixed before this review: an escaped apostrophe inside a single-quoted predict-option
  string (`'No — Kafka deletes an aborted transaction\'s records immediately'`), the same gotcha
  pattern hit on topics 9 and 10 — converted to a double-quoted string.

## Screenshots reviewed

Desktop and phone, all 10 steps: hook, setup, both predict steps (with their reveal states),
both main reveals, the consume-transform-produce reveal, the newer-KIPs reveal (shown above),
prove-it, and recap. No layout overflow, no truncated text beyond the intentional phone "MORE"
collapse, no visual regressions.

## Findings

None.
