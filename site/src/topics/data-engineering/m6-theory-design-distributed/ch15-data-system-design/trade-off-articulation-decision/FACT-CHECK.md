# Fact-check — de.trade-off-articulation-decision

## Claims re-derived against the source

1. **Large, valueless specification documents go unread and unmaintained; small, modular records
   stay current.** SOURCES.md's first Nygard quote supports this directly ("Nobody ever reads
   large documents, either..."). Checked step 5's "short, numbered, easy to digest" framing
   points at this reasoning directly, without overclaiming any specific page-count threshold
   Nygard's post doesn't itself state.

2. **An ADR's five parts each have a stated purpose, and a reversed decision is marked superseded
   rather than edited away.** SOURCES.md's second, third and fourth Nygard quotes support this
   directly (Decision in active voice; superseded, not erased; Consequences listing all effects,
   not only favorable ones). Checked step 7's "superseded, not edited" reveal matches Nygard's own
   stated reasoning (the old decision "is still relevant to know... but is no longer the
   decision") rather than inventing a stronger claim about version-control mechanics.

3. **An ADR captures a single architectural decision and its rationale, including trade-offs and
   consequences.** SOURCES.md's ADR-GitHub-organization quote supports this directly. Checked
   step 5 doesn't claim the ADR-GitHub site's own Y-statement format or its seven-template
   comparison as material this topic teaches — those stay unclaimed, named only as "more reading"
   if at all.

4. **The three-alternatives-with-costs decision card and the 10× scaling frame are this chapter's
   own established method.** Not an independent citation — `CHAPTER.md`'s own scope line states
   both directly, reusing topics 3 and 5's own decision-card pattern and naming the 10× frame as
   "the chapter's own." Presented as the chapter's own method, not a cited authority's finding.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("a more detailed architecture diagram, with every
  component labeled") is a genuine, tempting first reaction — more detail *feels* like more
  rigor — rather than a strawman. The hook's first engineer already had a diagram; the actual gap
  is a different kind of artifact (priced alternatives plus a revisit trigger), not more detail
  in the same kind. The correct option follows directly from what the second engineer is shown
  having that the first didn't.
- **Predict 2 (step 10, "Prove it"):** checked that a fixed 45-minute budget genuinely forces an
  early overrun to show up later — this follows from the session's own stated time allocation
  (`CHAPTER.md`'s own pacing clause), not a new citation; the point is that losing time to an
  early diagram isn't "free," since every block's budget is fixed and deep dives (the chapter's
  own dominant-risk discussion, topics 6-8) are what a real candidate most often loses to it.

## Illustrative numbers (figs for steps 1, 8, 10)

The specific cost-per-thousand-orders figures in the hook, the exact overflow point in the 10×
frame, and the exact minutes lost in the "Prove it" scenario are illustrative, stated lab numbers
for the storyboard, not cited real-world figures — no source claim is made about any specific
project's actual costs or session timings.

## Outcome

No open findings. Every claim about ADR structure or purpose traces to one of SOURCES.md's six
verbatim quotes across two sources; the decision-card and 10×-frame method rests on `CHAPTER.md`'s
own stated scope, not an unsourced factual claim; both predicts are checked against definitions
already established in the storyboard itself.
