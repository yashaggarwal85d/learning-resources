# Fact-check — de.lambda-vs-kappa-architectures

This topic has no lab of its own (`CHAPTER.md`). Every claim traces to a direct, word-for-word
quote from each architecture's own originator (`SOURCES.md`, verified by
`scripts/sources.mjs check`). No numeric claim is made beyond what the sources state
qualitatively.

## Claims

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Lambda runs batch and stream processing in parallel on the same input, merging results at query time | Marz quote 1; Kreps quote 6 | Confirmed, both originators' own words agree |
| 2 | Lambda's realtime layer uses incremental algorithms and read/write databases, a different reasoning model than the batch layer's pure functions | Marz quotes 2, 4 | Confirmed |
| 3 | The realtime layer's results are always eventually overridden by the batch layer, making the realtime layer's own complexity transient | Marz quote 3 | Confirmed |
| 4 | Lambda's actual named cost is maintaining the same transformation logic in two complex distributed systems, which Kreps calls not fixable | Kreps quote 7 | Confirmed |
| 5 | Reprocessing (re-deriving output when code changes) is the real shared challenge both architectures answer | Kreps quote 8 | Confirmed |
| 6 | Kappa's mechanism is a single stream-processing pipeline that reprocesses by replaying a fully-retained log through a second instance of the same job | Kreps quote 9 | Confirmed |
| 7 | Kreps himself named this "the Kappa Architecture" | Kreps quote 10 | Confirmed |
| 8 | The efficiency trade-off between the two approaches is a wash, not a one-sided win for either | Kreps quote 11 | Confirmed |
| 9 | Kreps's own stated reason to prefer Kappa is operating a single framework, not raw efficiency | Kreps quote 12 | Confirmed |

## Red-team: the three predicts

- **Step 3** (merging two independently-computed layers risks disagreement): the plausible wrong
  answer is "no, because the merge is just arithmetic." The reveal at step 5 corrects this — the
  two layers are not computed the same way, and the batch layer's authority over the realtime
  layer (quote 3) is exactly what prevents a permanent disagreement; the risk is real but
  resolved by design, not absent.
- **Step 6** (is "run logic twice" the expensive part, or the merge step?): the plausible wrong
  answer is "the merge step, since that's where the two systems actually touch." Kreps's own
  words (quote 7) correct this directly — the cost he names explicitly is maintaining the same
  logic in two systems, not the merge arithmetic itself, which is comparatively simple.
- **Step 9** (could one stream-only pipeline reprocess history without a separate batch system,
  given a full retained log?): the plausible wrong answer is "no, streaming can only see new
  data, not history." Kreps's own words (quote 9) correct this — a stream processor's "position"
  in a retained log is just an offset, so restarting from offset zero reprocesses the full
  history through the same code path used for new data.

## This topic's own closing claim (step 13, "Prove it")

The exception CHAPTER.md asks for ("when a batch correction layer still earns its cost") is not
claimed as a new fact from either source — it is this topic's own reasoned extension of quote 3
(batch corrects realtime) and quote 9 (reprocessing-by-replay cost scales with retained-log
size): if replaying the full log takes long enough that a stream-only pipeline cannot
reprocess inside the latency the system actually needs, the role Marz's batch layer played
(a slower, independently-correct layer that the fast layer can lean on) still has a reason to
exist. This is flagged in `coverage.json`'s expert block as the topic's own reasoning, not a
primary-source quote.

## Checks run

- `node scripts/sources.mjs check` — 13/13 quotes verified word for word, 0 problems.
- `python3 examples.py` — pass.
