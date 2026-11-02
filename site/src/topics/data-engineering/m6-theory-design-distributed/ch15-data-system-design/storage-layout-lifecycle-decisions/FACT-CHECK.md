# Fact-check — de.storage-layout-lifecycle-decisions

## Claims re-derived against the source

1. **GDPR Art. 5: personal data must not be kept, in identifiable form, longer than its processing
   purpose requires.** SOURCES.md's Article 5 quote supports this directly ("kept in a form which
   permits identification of data subjects for no longer than is necessary for the purposes for
   which the personal data are processed"). Checked the reel (step 7) doesn't overclaim this as an
   absolute ban on long retention — the source itself carves out an archiving/research exception,
   which the reel doesn't contradict by omission (it simply doesn't claim the rule is absolute).

2. **GDPR Art. 25(1): protective measures must be designed in at the time of determining the
   means of processing, not retrofitted.** SOURCES.md's first Article 25 quote supports this
   exactly ("both at the time of the determination of the means for processing and at the time of
   the processing itself"). Step 8's takeaway ("designed in... or retrofitted, it costs a
   rewrite") matches the source's own two-moments framing (design time and processing time) rather
   than inventing a design-vs-retrofit dichotomy not in the text.

3. **GDPR Art. 25(2): storage period and accessibility are named explicitly among what must
   default to the minimum necessary.** SOURCES.md's second Article 25 quote supports this exactly
   ("That obligation applies to the amount of personal data collected, the extent of their
   processing, the period of their storage and their accessibility"). Step 6/7's tiering-and-
   retention reveal ties directly to this clause, not to Article 5 alone — checked that the reel
   doesn't attribute the "accessibility" half of this clause to a claim it doesn't make (the reel
   only uses the retention-period half; accessibility is left to Chapter 13's own sensitivity-tier
   topic, declared, not re-taught).

4. **The dominant-access-path reasoning.** Not an independent citation — this is the chapter's own
   established method (topic 3's decision card applies the same "pick the design that serves the
   cost that actually matters" logic to data-flow shape; here it's applied to partition keys). No
   source risk: the claim is presented as reasoning from an access pattern, not as a cited
   authority's finding.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("a bigger cluster would absorb the slow job, and
  deletion is unrelated") is a genuine, common first instinct (scale the compute, don't touch the
  schema) rather than a strawman — many teams really do try to out-provision a bad layout before
  revisiting the partition key. The correct option matches the hook's own two symptoms tracing to
  one cause.
- **Predict 2 (step 8):** checked the claim that a customer's rows are "scattered across every
  date partition they ever appeared in" under date-partitioning is a straightforward consequence
  of partitioning by date rather than by customer — not a claim requiring its own citation, since
  it follows directly from what a date partition key means (rows group by date, not by customer).

5. **Table format choice follows the same access-path reasoning, with interoperability and
   catalog consequences as the one decisive cost.** This is `CHAPTER.md`'s own framing for this
   topic's "table format and file layout" clause, added after an initial storyboard draft left
   this syllabus clause uncovered — not an independent citation, since Chapter 6 (which owns the
   formats' own mechanics) isn't built yet and this topic only names the *decision*, not the
   formats' internals, per `CHAPTER.md`'s "Leaves out" line.

## Illustrative numbers (step 5 fig)

The "forty million tiny files" and "few thick blocks" comparison in the hook and step 5's reveal
are illustrative orderings (one layout produces vastly more, smaller files than the other for the
same data), not a cited real-world figure from any vendor — no source claim is made about a
specific system's file count. `examples.py`'s own `layout_comparison()` computes the actual
modeled file counts and pruned-byte fractions for the two layouts from the shop's own constants,
so the on-screen comparison is backed by a real computation, matching this topic's own "Lab"
section plan.

## Outcome

No open findings. Every claim about the legal requirement traces to one of SOURCES.md's four
verbatim GDPR quotes; the access-path and predict reasoning rest on the chapter's own established
method, not an unsourced factual claim.
