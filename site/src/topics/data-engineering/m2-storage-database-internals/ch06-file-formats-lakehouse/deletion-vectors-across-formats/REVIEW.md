# Review — de.deletion-vectors-across-formats

## What this topic does

Builds a real deletion vector in this sandbox as a simplified RoaringBitmap-style container
(array container under the real 4,096-element threshold, fixed-size bitset above it), measures
the real read-time cost of applying it versus a plain scan, and measures a real compaction pass
paying that cost back. Compares the mechanism across Delta, Iceberg v3 (which share the actual
bitmap format, per the Puffin spec's own stated compatibility reason) and Hudi (which uses a
different, non-bitmap mechanism).

## Fixes made during the build

- **Digit-provenance design decision.** `examples.py` was deliberately written with the deletion
  counts (1,200; 5,000) and the derived sizes (2,400 bytes; 8,192 bytes) as literal constants or
  literal-asserted values rather than computed from a fraction, specifically so every on-screen
  number in `reel.tsx` traces to executed truth the build's digit-provenance check can find —
  avoided having to retrofit this after a failed check.
- **Takeaway word-count overage.** Step 6's takeaway was 21 words (limit 20); shortened by a few
  words and the build check passed clean on the next run.
- **Escaped apostrophes in `reel.tsx`.** Caught proactively from the known gotcha hit in topic 14
  — three single-quoted strings with escaped apostrophes (`fig`, a predict `label`, a `takeaway`)
  were rewritten as double-quoted strings before running any checks, avoiding the raw-text-match
  failure topic 14 hit.

## Checks

- `sources.mjs check`: 15/15 quotes verified word-for-word on first try (4 Iceberg, 3 Puffin
  spec, 5 Delta, 1 Hudi, 2 RoaringFormatSpec).
- `python3 examples.py`: verified robust across 5 consecutive runs, all passing with consistent
  ordering (deletion-vector-applied scan slowest, baseline and compacted scans faster).
- `narration-teaches.mjs`: clean on first run — 0-2% description overlap per step, longest line
  36 words, all under the 50-word cap.
- `check-all.mjs --skip reels,links,narration`: failed once on the takeaway word-count overage;
  clean after the fix.
- `check-links.mjs`: 0 broken (107 pre-existing blocked/title-mismatch entries across the site,
  unrelated to this topic).
- `check-all.mjs --only reels`: reel smoke test passed clean (desktop + phone) on first run.

## Screenshot review

All 24 screenshots (12 desktop incl. 2 `-q` predict-state variants, 12 phone incl. 2 `-q`
variants) reviewed clean via the Read tool — text fits within the drawing, predict options render
correctly, takeaways appear only on steps 4, 6, 8, and all on-screen counts (1,200; 5,000; 50,000;
2,400 bytes; 8,192 bytes; 4,096) trace to literal or literal-asserted values in `examples.py`.
Phone step 1 shows the same step-counter cosmetic artifact seen on every prior ch6 topic's phone
step 1 — pre-existing and benign.

## Sourcing notes

The Puffin spec's own text ("Big endian values were chosen for compatibility with existing
deletion vectors in Delta tables") is cited directly to support the claim that Delta and Iceberg
v3 share the actual bitmap format, not merely a similar idea — a stronger claim than this
chapter's earlier "same idea, different names" framing, documented in FACT-CHECK.md's red-team
#3. Hudi is deliberately described as having a different, non-bitmap mechanism (delete markers in
its log files) rather than "an equivalent deletion vector," since its own docs never use that
term — FACT-CHECK.md red-team #4.
