# Fact-check — de.cost-model-dominant-cost

## Claims re-derived against the source

1. **BigQuery's on-demand pricing bills by bytes processed per query, and a clustered table's
   column-filtered query prunes the blocks actually scanned.** SOURCES.md's two BigQuery quotes
   support this directly ("you are charged for the number of bytes processed by each query" /
   "BigQuery uses the filter expression to prune the blocks scanned by the query"). Checked the
   reel's scan-volume framing (steps 1, 2, 5, 6) uses this only as the mechanism behind "scan
   volume" as a cost class — not a re-teaching of BigQuery's own query planner internals, which
   stays with Chapter 6 §6.5's warehouse topic, not this one.

2. **Amazon S3's cost is split across six distinct components, and storage itself is priced by
   object size, duration stored, and storage class together.** SOURCES.md's two S3 quotes support
   this directly. Checked the reel's five-cost-class framing (step 3) doesn't claim S3's own six
   components as the universal cost taxonomy — this topic's own five classes (compute, storage,
   egress, requests, licence) are the chapter's stated scope, with S3's components as one
   concrete, citable instance of "storage pricing has its own internal structure."

3. **The cost-waterfall method and the three recurring dominators (scan volume, cross-AZ traffic,
   idle compute) are this chapter's own reasoning.** Not an independent citation — `CHAPTER.md`'s
   own scope line states the waterfall method and the three dominators directly; this is
   presented as the chapter's own method, not a cited authority's finding. The amplification
   ledger (topic 5) and layout-from-dominant-access-path (topic 4) are `uses`, confirmed live, not
   re-derived here.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("compute, since the team spent a month tuning
  cluster sizes") is a genuine, tempting first reaction — effort naturally feels like evidence of
  where a problem sits — rather than a strawman. The hook explicitly states the team's month of
  tuning saved little, which is consistent only with the dominator sitting in a different class
  entirely (requests, from the unwatched query's scan volume).
- **Predict 2 (step 10, "Prove it"):** checked that a steep, isolated price cut to one class
  (cross-AZ transfer) genuinely can move the waterfall's ranking without the design itself
  changing at all — this follows directly from the waterfall's own definition (rank by billed
  share) rather than requiring a new citation; the point is that the method re-runs on fresh
  prices, not that any particular provider's price actually moved by this much in reality.

## Illustrative numbers (figs for steps 1, 3, 4, 6, 7, 8)

The specific dollar amounts in `examples.py`'s `COST_CLASSES_BEFORE`, the pruning-lever reduction
fraction, and the second-order write-amplification cost are illustrative, stated lab numbers for
the simulation, not cited real-world provider prices — no source claim is made about any specific
system's actual bill composition. The two source quotes establish the *billing mechanism* (bytes
processed, cost-component structure), not a specific dollar figure.

## Outcome

No open findings. Every claim about BigQuery's or S3's own billing mechanism traces to one of
SOURCES.md's four verbatim quotes across two sources; the waterfall method and dominator framing
rest on `CHAPTER.md`'s own stated scope, not an unsourced factual claim; both predicts are checked
against definitions already established in the storyboard itself.
