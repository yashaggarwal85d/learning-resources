# Review — Bellman-Ford and negative cycles

## Pass 1 — content

- Scope: all three syllabus clauses (|V|−1 relaxation rounds, negative-cycle detection and extraction via currency arbitrage, the queue-based SPFA variant and its worst case) delivered and mapped in `coverage.json`.
- Sources: Wikipedia's "Bellman–Ford algorithm" article covers the algorithm's own mechanism, the general negative-cycle claim, and the Moore/SPFA variant's description, all with verified verbatim quotes; "Shortest path problem" restates Dijkstra's restriction for contrast. No source was found connecting currency arbitrage specifically to Bellman-Ford (checked three Wikipedia articles) — the arbitrage graph is this topic's own worked example, built from the general mechanism the primary source documents, as CHAPTER.md anticipated.
- `examples.py`: a worst-order chain confirms the relaxation-round bound is tight (needs all 4 of 4 rounds); a currency-arbitrage graph (USD/EUR/GBP, weighted by negative log of exchange rate) is detected as a negative cycle and the actual cycle extracted; SPFA beats plain Bellman-Ford on a favourable star graph but is beaten by it on a constructed six-stage adversarial "diamond chain" — found only after an earlier dense-DAG construction gave a flat 0.5 ratio on both favourable and adversarial graphs, demonstrating nothing (documented in `FACT-CHECK.md`'s corrections).
- Fact-check: 6 claims, all confirmed; no claim found incorrect, one implementation-construction issue (the weak adversarial graph) caught and fixed before shipping.
- Bridge is topic 63's handoff verbatim; handoff is this topic's own CHAPTER.md-stated handoff to topic 65, verbatim.

## Pass 2 — looks and mechanics

- `reel.tsx`: 7 steps, 2 predicts (PredictNegativeCycle within the first four steps, SPFAPredict), 4 takeaways, each ≤20 words. Fixed an escaped-apostrophe bug in the Recap step (title and body) before any build attempt.
- `scenes.tsx`: 7 functions on two shared layouts (a 5-vertex chain, a 3-currency triangle); no leftover code artifacts.
- No literal digits in `reel.tsx` outside `duration:` lines — "|V| minus one" and "four of four" spelled out in words throughout.
- `narration.json`: fixed one step that spoke its own description sentence verbatim instead of teaching, caught by the build's own narration-quality check.
- `prerequisites.mdx`: the linked title ("Dijkstra's algorithm") verified byte-identical against `registry.ts`.
- `registry.ts`: title/syllabusTitle corrected to the syllabus's own en-dash "Bellman–Ford" (not a hyphen) — caught by the build's own topic-lookup check.

## Checks run

- `python3 examples.py` — all assertions pass.
- `node scripts/sources.mjs check` — 11/11 quotes verified.
- `npm run build` (from `site/`) — passes.
- `npx tsc --noEmit` — no errors from `registry.ts`.
- `node scripts/check-all.mjs --skip narration --changed` — locked/docs/sources/build/reels/links all pass except the pre-existing `test:editor` sandbox failure (unrelated to this topic, documented repo-wide).

This closes topic 64. Next: topic 65, Floyd-Warshall and Johnson's algorithm.
