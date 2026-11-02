# Fact-check — de.correctness-under-replay-late

## Claims re-derived against the source

1. **The Dataflow Model's own four questions.** SOURCES.md's Dataflow Model quote supports this
   directly and completely ("Decomposes pipeline implementation across four related dimensions...
   What results are being computed. Where in event time... When in processing time... How earlier
   results relate to later refinements."). Checked the reel (step 5's watermark framing, step 8's
   versioned-outputs framing) uses this four-question structure only as organizing scaffolding,
   not as a re-teaching of watermark/trigger mechanics, which `CHAPTER.md` explicitly leaves to
   Chapter 9.

2. **Iceberg's own stated basis for snapshots.** SOURCES.md's first Iceberg quote supports this
   directly ("Snapshots are fundamental in Iceberg as they are the basis for reader isolation and
   time travel queries"). Step 8's "a consumer can pin a version" claim points at this mechanism
   by name without re-deriving how a snapshot or time-travel query actually works internally —
   checked the reel doesn't claim to teach Iceberg's own snapshot mechanics, matching `CHAPTER.md`'s
   "Leaves out" line for table-format snapshot mechanics (Chapter 6).

3. **Iceberg's own stated use case for tagging: historical-snapshot retention for auditing.**
   SOURCES.md's second Iceberg quote supports this directly ("Branching and tagging can be used
   for handling GDPR requirements and retaining important historical snapshots for auditing").
   Step 8's "an auditor can reconstruct what was reported, when" claim matches this exactly —
   checked the reel doesn't claim Iceberg tagging is the *only* way to achieve this, only that
   it's a named, real mechanism for it.

4. **Deterministic-plus-idempotent as the two properties that make a re-run trustworthy.** Not an
   independent citation — this is `CHAPTER.md`'s own framing for this topic's "idempotent writes,
   deterministic transforms" clause, built on Chapter 14 topic 13's exactly-once argument
   (`declared`, not re-taught). No source risk: presented as this chapter's own reasoning, not as
   a cited authority's finding requiring its own fetch.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("the bug fix itself must have silently changed some
  upstream data too") is a genuine, common first reaction (assume the input changed, since the
  output did) rather than a strawman — the hook explicitly states the input is confirmed
  identical, so the correct option (hidden non-determinism) is the only one consistent with the
  stated premise, not an arbitrarily eliminated distractor.
- **Predict 2 (step 10, "Prove it"):** checked the claim that pipeline-level idempotence doesn't
  automatically protect an external side effect (an email receipt) is a straightforward
  consequence of what "idempotent write" means (a write the pipeline itself controls and can key
  deterministically) — an external system outside that write path has no such guarantee unless it
  independently implements one. Not a claim requiring its own citation; it follows from the
  definition already established in step 3.

## Illustrative numbers (step 7 fig)

The late-data rate used to size the correction window is an illustrative, stated lab number (the
shop's own measured rate), not a cited real-world industry figure — no source claim is made about
any specific system's actual late-data rate. `examples.py`'s own `size_correction_window()`
computes the actual modeled window width and its state cost from that stated rate, so the on-
screen comparison is backed by a real computation, matching this topic's own "Lab" section plan.

## Outcome

No open findings. Every claim about the Dataflow Model's framing or Iceberg's own mechanisms
traces to one of SOURCES.md's seven verbatim quotes; the determinism/idempotence reasoning and
both predicts rest on this chapter's own established method and a definition already given in the
reel itself, not an unsourced factual claim.
