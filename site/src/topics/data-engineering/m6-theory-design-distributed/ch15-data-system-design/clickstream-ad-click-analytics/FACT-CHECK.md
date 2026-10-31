# Fact-check — de.clickstream-ad-click-analytics

## Claims re-derived against the source

1. **A session window closes on a gap of inactivity, not a fixed clock boundary.**
   SOURCES.md's first Flink quote supports this directly. Checked step 4's "a session is defined
   by a gap, not a clock window" claim matches Flink's own mechanism exactly, without claiming
   this is the only possible sessionisation implementation — the topic names it as the
   mechanism this design's pipeline uses, per `CHAPTER.md`'s own "Chapter 9's session windows,
   named" framing.

2. **A late event is dropped once the watermark has passed the window's end, unless the design
   states an explicit allowed lateness.** SOURCES.md's second Flink quote supports this directly.
   Checked step 5's "dropped by default, kept only if lateness is explicitly allowed" claim
   doesn't overclaim Flink's own default (zero lateness) as a universal streaming-engine
   default — it's presented as this engine's own documented behavior, used as the mechanism
   behind the hook's billing gap.

3. **Running the same transformation twice, in a stream engine and a batch engine, carries a
   real, unfixable maintenance cost.** SOURCES.md's first Kreps quote supports this directly.
   Checked step 7's "the problem isn't fixable, only budgeted for" claim matches Kreps's own
   stated conclusion, not a softened or strengthened version of it.

4. **A streaming path's weaker guarantee is a property of today's tooling, not a law of
   streaming itself.** SOURCES.md's second Kreps quote supports this directly. Checked step 6
   doesn't claim this design's own streaming path achieves a batch-equivalent guarantee — it
   states only that the gap is a tooling property, which is why the design still needs the
   batch override for anything billed, exactly matching Kreps's own point.

5. **The clickstream pipeline strip, the three-alternative decision cards, and the
   stream-for-speed/batch-for-record rule are this chapter's own established method.** Not an
   independent citation — `CHAPTER.md`'s own scope line states this directly. Presented as the
   chapter's own method, not a cited authority's finding.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("duplicates inflate the streaming count, so the
  smaller number is right") is a genuine, tempting first guess — duplicates are a real failure
  mode this chapter already teaches (topic 6's correction window, topic 7's retry storms) — but
  it points the wrong direction: a duplicate would make the *smaller* number (the stream) too
  high, not too low, which rules it out once the actual direction of the gap is checked. The
  correct option follows directly from the correction-window mechanism (Flink's own allowed-
  lateness behavior) and the direction of the gap stated in the hook.
- **Predict 2 (step 10, "Prove it"):** checked that a retry storm's duplicate burst, absorbed by
  the stream's idempotent keying but briefly double-counted by a batch recount run before the
  dedup window closed, is a genuinely different failure mode from the hook's late-event gap —
  not a repeat of the same cause relabeled. This follows from the chapter's own established
  correctness toolkit (topic 7's duplicate-burst failure mode, this topic's idempotent-upsert
  design), not a new citation.

## Illustrative numbers (figs for steps 1, 8, 10)

The hook's exact click counts and percentage gap, the estimate sheet's specific events-per-second
and storage figures, and the second dispute's exact cause are illustrative, stated lab numbers
for the storyboard, not cited real-world figures — no claim is made about any specific ad
platform's actual billing numbers or incident history.

## Outcome

No open findings. Every claim about session windows or late-event handling traces to one of
SOURCES.md's two verbatim Flink quotes; every claim about the cost of running two logic paths
traces to one of SOURCES.md's two verbatim Kreps quotes; the pipeline-strip method and the
stream-for-speed/batch-for-record rule rest on `CHAPTER.md`'s own stated scope, not an unsourced
factual claim; both predicts are checked against the chapter's own established correctness
toolkit (topics 6-7) rather than invented reasoning.
