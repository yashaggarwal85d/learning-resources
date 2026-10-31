## Content review

- Every claim traces to a direct quote in `SOURCES.md` / `FACT-CHECK.md` (the Kafka 4.4 topic
  config reference and design doc, both already-verified-clean page sources from topics 1-3). No
  unconfirmed version numbers in this topic's scope line — all claims directly sourced.
- `examples.py`'s four toy models (segment-age deletion, dirty-ratio trigger, compaction-lag
  window, tombstone visibility) each isolate exactly the sourced rule this topic teaches, red-
  teamed in `FACT-CHECK.md` for what they do and don't model (no real cleaner-thread timing or
  disk I/O).
- `coverage.json`'s two syllabus clauses collectively cover every non-stop-word of the exact
  syllabus scope line. Expert list has 10 items, written independently of the build.
- No findings.

## Looks review

- Reviewed all 10 desktop and 10 phone screenshots from the real `--topic` reel test run.
- Every `Row` label/value in `scenes.tsx` was kept to 1-3 words each from the start (one caught
  and fixed during drafting: "caught up in time" was 4 words, shortened to "fast catch-up"). The
  automated reel smoke test passed clean on the first run: "1 live reel(s) at desktop and phone
  sizes."
- No text overlap, truncation, or layout issue on either viewport.
- No findings.
