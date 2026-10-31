## Content review

- Every claim traces to a direct quote in `SOURCES.md` / `FACT-CHECK.md` (KIP-848, Kafka's own
  "Consumer Rebalance Protocol" operations page, the design doc's Static Membership section, and
  the Streams developer guide's "Streams Rebalance Protocol" page). Unlike topics 3 and 4, both
  of `CHAPTER.md`'s version claims (KIP-848 GA in 4.0, KIP-1071 default-on in 4.2) are directly
  confirmed by current Kafka documentation, not just the proposing KIPs — no version correction
  needed.
- `examples.py`'s sticky-reassignment model is explicitly disclosed (in `FACT-CHECK.md`) as an
  approximation, not a port of any real Kafka assignor — it isolates the one claim this topic
  needs (a membership change doesn't have to move every assignment) without claiming to model a
  specific real balancing algorithm.
- `coverage.json`'s four syllabus clauses collectively cover every non-stop-word of the exact
  syllabus scope line (`syllabus/data-engineering.md`), including "classic being phased out",
  mapped to the broker-side reveal step after adding one sourced sentence to that step's body in
  `reel.tsx`. Expert list has 10 items, written independently of the build.
- No findings.

## Looks review

- Reviewed all 10 desktop and 10 phone screenshots from the real `--topic` reel test run.
- Every `Row` label/value in `scenes.tsx` was kept to 1-3 words each from the start. The
  automated reel smoke test passed clean on the first run: "1 live reel(s) at desktop and phone
  sizes."
- No text overlap, truncation, or layout issue on either viewport.
- No findings.
