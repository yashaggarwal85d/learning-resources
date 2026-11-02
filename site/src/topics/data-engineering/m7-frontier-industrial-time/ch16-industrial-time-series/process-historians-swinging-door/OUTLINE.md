# Outline

## Scope mapped to steps

1. Hook: a historian stores a year of a temperature tag; a data scientist's own mean comes out six degrees off the plant's own reported average.
2. Predict: what would give the right mean, and what should the extraction have recorded?
3. Reveal: exception (deadband) filtering drops points before anything reaches the archive, conserving bandwidth and cutting events.
4. Reveal: swinging-door compression keeps only the knees needed to reconstruct the signal within a stated error band.
5. Reveal: the error-band guarantee holds, measured — every discarded point stays within the compression deviation of the stored line.
6. Reveal: a flat hold compresses to almost nothing while a short, volatile stretch forces many knees — so a plain average over knees is biased.
7. Reveal: a true time-weighted average, or an interpolated value at every timestamp, gets it right.
8. Reveal: a step signal needs step interpolation, not a straight line, or the reconstruction is badly wrong.
9. Recap.
10. ProveIt (second predict: if an extraction carries only values and no compression metadata, can a later analyst tell a recorded point from an interpolated one?).

## Why this topic's hook carries the first Predict

CHAPTER.md's own hook already poses the question this topic answers ("What would have given the
right mean, and what should the extraction have recorded?"), so the first Predict sits right after
the Hook (step 2, index 1) rather than after three Reveal steps — still within the first four steps
the build's engagement rule requires.

## No registry gaps this topic

Every id in CHAPTER.md's `uses` line for this topic was verified present in some topic's
`introduces` array in `registry.ts` before writing this topic's own `uses` list — the first topic
in this chapter's §16.3 run with no gap to disclose.

## The swinging-door source: a patent, not the original 1990 paper

Bristol's original paper ("Swinging Door Trending: Adaptive Trend Recording?", ISA National
Conference Proceedings, 1990) could not be found at any fetchable full-text URL at research time —
it predates open digital publishing. Bristol's own US Patent 4,669,097, granted in 1987 and
describing the identical door/pivot/slope mechanism in his own words, is used instead and the
substitution is disclosed in `SOURCES.md`.

## AVEVA's own PI Data Archive documentation pages, confirmed still unreachable

As CHAPTER.md's own planning text anticipated, `docs.aveva.com`'s PI Data Archive pages are a
client-rendered single-page app and return only an empty shell when fetched directly (confirmed
again at research time). Two AVEVA training workbooks (PDFs, real fetchable text) and the 2023
conference deck are used instead, and this is disclosed in `SOURCES.md`.

## Two signals in `examples.py`, each built for a different claim

The main signal (smooth ramps connecting flat holds, like a kettle being brought up and down in
temperature) is used for the compression-ratio and error-band claims, where a straight line between
knees is a fair approximation of what happened in between. A second, deliberately lopsided signal
(a long quiet hold followed by a short, volatile excursion) is used only for the
recorded-vs-time-weighted-average claim, because the first signal's symmetric ramps turned out not
to bias a plain knee average enough to demonstrate the hook's own claim — the lopsided signal
reproduces the exact shape of the hook (long flat periods with few points, a short excursion with
many). A third, genuinely step-shaped signal demonstrates why a step series needs step
interpolation rather than a straight line, per CHAPTER.md's own clause on step signals (topic 8).

## What this topic leaves out (per CHAPTER.md)

Exception reporting at the OPC UA subscription (topic 16's deadband, mentioned as the same idea);
lossless codecs (topic 11); the historian's archive file structure and licensing; PI AF asset
framework in depth (topic 20 and topic 1); other historians (named only, claims sourced).
