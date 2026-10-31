# Fact-check — de.lambda-vs-kappa-one

## Claims re-derived against the source

1. **Maintaining code that must produce the same result in two complex distributed systems is,
   in Kreps's own stated view, exactly as painful as it sounds, and not a fixable problem.**
   SOURCES.md's first Kreps quote supports this directly — `CHAPTER.md` itself names this exact
   sentence as required to quote. Checked step 5's "will drift" claim stays at the level Kreps
   himself states (an unfixed, structural cost of two code paths), not an invented severity.

2. **Kreps's own proposed alternative to Lambda is retaining the full log for as long as
   reprocessing might be needed, and replaying it through a second instance of the same,
   improved code when reprocessing is required.** SOURCES.md's second Kreps quote supports this
   directly. Checked step 3's Kappa design ("one streaming program over a retained log, replay
   as the only reprocessing path") matches this mechanism exactly — the log-retention and
   second-instance-replay approach Kreps himself describes, not an invented variant.

3. **Apache Flink documents that a single DataStream program executed over bounded input
   produces the same final result whether run in streaming or batch execution mode.**
   SOURCES.md's Flink quote supports this directly. Checked step 6's "a unified engine reduces
   drift without removing the second path" doesn't overclaim that a unified engine eliminates
   the second mode entirely — the quote is specifically about result equivalence between modes
   of the same program, which still requires choosing and running a mode; the claim respects
   that distinction.

4. **The reprocessing-cost crossover, the planted-edge-case drift measurement, and the
   four-condition batch-layer decision are this chapter's own established method and this
   topic's own derived design.** Not an independent citation beyond claims 1–3 —
   `CHAPTER.md`'s own scope line states the crossover computation, the measured-discrepancy
   method, and the four named conditions (billing-grade, very-large reprocessing, huge
   historical-dimension joins, compliance restatements) as this topic's own worked design, not
   re-derived here.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("always right, since one code path can never drift
  from itself") is a genuine, plausible-sounding first guess — a single code path trivially
  can't disagree with itself — but it's ruled out because it ignores the real costs claim 2's
  own mechanism carries: a retained log has a real, finite retention window and a real
  reprocessing cost that grows with how much history must replay, which is exactly what the
  correct option's "falls under computable thresholds" framing checks for.
- **Predict 2 (step 10, "Prove it"):** checked that "check this request against the four
  conditions directly" follows from claim 4's own four named conditions — the
  huge-historical-dimension join is explicitly one of them, so the second pipeline's situation
  maps onto an existing threshold rather than needing new reasoning. "Extend the log's retention
  window" is ruled out because retention length trades directly against storage and throughput
  (per the chapter's own established crossover method from claim-adjacent reasoning), and
  because a replay still can't join against a dimension table the log was never built to hold —
  a fundamentally different problem from "replay further back."

## Illustrative numbers (figs for steps 1, 4, 6, 10)

The hook's "a small fraction of a percent," "several days," the reprocessing-cost crossover's
specific retention lengths and frequencies, the planted edge-case's exact discrepancy size, and
the second pipeline's "three years" request in step 10 are illustrative, stated lab numbers for
the storyboard and the simulation in `examples.py`, not cited real-world incident figures — no
claim is made about any specific company's actual reconciliation discrepancy or incident
history.

## Outcome

No open findings. Every claim about dual-logic drift, the Kappa replay mechanism, and unified
batch/stream execution traces to one of SOURCES.md's three verbatim quotes across two sources
(Kreps's own article, Flink's own documentation); the reprocessing-cost crossover, the drift
measurement, and the four-condition decision rest on `CHAPTER.md`'s own stated scope, not an
unsourced factual claim; both predicts are checked against the chapter's own established
mechanisms rather than invented reasoning.
