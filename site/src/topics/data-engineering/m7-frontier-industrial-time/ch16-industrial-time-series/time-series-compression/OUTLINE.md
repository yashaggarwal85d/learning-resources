# Outline

## Scope mapped to steps

1. Hook: a colleague's "Gorilla gets twelve times" promise measures 1.4x on this plant's own data.
2. Reveal: Gorilla's two encoders — delta-of-delta timestamps and XOR'd floats — reproducing the paper's own 9-bit and 14-bit worked examples exactly.
3. Predict: whether the same encoder gives the same ratio on a different kind of signal.
4. Reveal: it doesn't — the same Gorilla encoder measured on three different synthetic regimes gives very different bytes-per-point.
5. Reveal: Chimp's trailing-zero threshold and Chimp128's wider match window, and where the wider window actually helps.
6. Reveal: ALP's decimal-aware approach and why a noisy decimal signal favors it (and even plain Zstd) over bit-pattern codecs.
7. Reveal: dictionary/RLE for tags, and why compressed size is dominated by values, not labels.
8. Recap.
9. ProveIt.

## Why the ratio claim needed its own encoder, not just the paper's number

CHAPTER.md is explicit that the topic should measure rather than quote the 12x. `examples.py` implements the Gorilla paper's exact bit-level rules (§4.1.1, §4.1.2) and reproduces its own two worked examples (a delta-of-delta of −2 in 9 bits; an 11-leading-zero, 1-meaningful-bit XOR in 14 bits) exactly, confirmed by direct assertion — not by trusting the paper's prose. The same encoder is then run on three built-from-scratch synthetic regimes (regular/slow, noisy, decimal) to show the ratio is a property of the data.

## The Chapter 15 gap (edge-buffer-sizing-from-outage, manufacturing-telemetry-platform-design)

CHAPTER.md's `uses` line names Chapter 15 topic 24's ids, noting "the 1.37 bytes quoted there, now taught." As of this topic's build, Chapter 15 (Data-System Design) only extends through §15.3 in `registry.ts` (verified by grep before writing this file) — topic 24 doesn't exist yet. This topic omits those ids from its own `uses` list rather than claiming a topic that hasn't shipped; same handling as topic 6's Chapter 10/11 gap and topic 10's Chapter 5 sketch-id gap.

## Simplified Chimp implementation, disclosed

`examples.py`'s `chimp_encode` implements only the paper's trailing-zero threshold refinement (§4.1.3) and the wider `window` comparison that's Chimp128's own idea (§4.2) — it does not implement reusing the previous block's leading-zero count (§4.1.4), which the paper identifies as a further, separate refinement. Because of this, the single-previous-value Chimp encoder in this file does not reliably beat Gorilla's own encoder on every regime (header overhead from storing a fresh leading-zero count every time can outweigh the trailing-zero saving) — only Chimp128's wider match window shows a clear, asserted win, specifically on the decimal regime's repeating pattern. This is disclosed rather than forcing an assertion that doesn't hold for the simplified implementation.

## What this topic leaves out (per CHAPTER.md)

Parquet encodings in general (Chapter 6 §6.2, built on only); the storage engine applying these codecs per block (topic 13); swinging-door and deadband mechanics (topics 16 and 18, pointer only); general-purpose codecs' internals (Chapter 6, skipped); GPU or FPGA compression.
