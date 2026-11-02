# Fact-check — de.source-side-interrogation

## Claims re-derived against the source

1. **A data contract can state keys and values in a structured document.** SOURCES.md's ODCS
   overview quote supports this directly. Checked step 5's "a contract's own version and status"
   framing doesn't overclaim any specific YAML syntax or field list beyond what the two fetched
   ODCS pages actually quote.

2. **A data contract's `status` and `version` fields give a checkable answer to how much notice
   a consumer gets before a source changes.** SOURCES.md's ODCS Fundamentals quotes name both
   fields directly ("proposed", "draft", "active", "deprecated", "retired" for status; a current
   version number). Checked step 5 claims only that these fields exist and are checkable, not
   that every real-world source actually keeps them accurate — the gap between a contract
   existing and a contract being kept current is left open, matching what the two short quotes
   actually establish.

3. **Stripe's webhook delivery doesn't guarantee event order, can redeliver the same event, and
   names event ID as the dedup key.** SOURCES.md's three Stripe quotes support this directly.
   Checked step 6's "an event ID beats a timestamp" takeaway matches Stripe's own stated reason
   (distinct events can share a timestamp) rather than inventing a stronger claim about every
   webhook provider's behavior — the claim stays scoped to what Stripe's own documentation says
   about itself, used here as one worked example of "what a source's stated guarantees look
   like," per `CHAPTER.md`'s own framing.

4. **Stripe retries failed webhook deliveries for up to three days with exponential backoff in
   live mode.** SOURCES.md's third Stripe quote supports this directly. Checked step 7 doesn't
   generalize this specific window to other partners or protocols — it's presented as this one
   source's own stated number, the kind of measurement a source interview should ask for rather
   than assume.

5. **The fifteen-question source checklist and "a measurement beats an adjective" are this
   chapter's own established method.** Not an independent citation — `CHAPTER.md`'s own scope
   line and outcomes state this directly. Presented as the chapter's own method, not a cited
   authority's finding.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("ask for a more detailed architecture diagram")
  mirrors the hook's own first failure mode — more diagram detail doesn't surface resend
  behavior, downtime behavior, or schema ownership, which is exactly what the three cracks in
  the hook trace back to. The correct option follows directly from naming the three cracks and
  the question that would have caught each one.
- **Predict 2 (step 10, "Prove it"):** checked that "an unanswered question is an unknown, not a
  guarantee of never happening" is the chapter's own stated posture (an unknown goes into the
  design as an explicit risk, per the design method topics 1-9 already teach, not assumed away);
  this follows from the method already established, not a new citation.

## Illustrative numbers (figs for steps 1, 8, 10)

The payments partner's specific incident timeline (three weeks, a day's notice, an hourly
maintenance window) and the second interview's exact count of unanswerable questions are
illustrative, stated lab numbers for the storyboard, not cited real-world figures — no claim is
made about any specific company's actual partner or incident. The "p99 event delay 40 seconds"
figure in step 4 is likewise illustrative, standing in for "a measured number" generically,
matching `CHAPTER.md`'s own visual-idea text, which gives this exact contrast.

## Outcome

No open findings. Every claim about the Open Data Contract Standard's fields or Stripe's webhook
behavior traces to one of SOURCES.md's six verbatim quotes across three sources; the
fifteen-question checklist and measurement-over-adjective framing rest on `CHAPTER.md`'s own
stated scope, not an unsourced factual claim; both predicts are checked against the hook's own
established scenario and the design method already taught in topics 1-9.
