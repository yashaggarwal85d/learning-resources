# Fact-check — de.multi-region-analytical-platform

## Claims re-derived against the source

1. **GDPR Article 5(1)(e) requires personal data to be kept in a form permitting
   identification for no longer than necessary.** SOURCES.md's quote supports this directly.
   Checked step 3's placement decision doesn't overclaim that storage limitation alone decides
   residency — it is cited as the principle behind retention per class, which topic 4 already
   applies; this topic applies the same principle per region, not a new legal theory.

2. **GDPR Article 5(2) makes the controller responsible for, and able to demonstrate compliance
   with, the Article 5(1) principles.** SOURCES.md's quote supports this directly. Checked the
   topic's own "state what the design does not claim about legal compliance" framing matches
   this accountability principle precisely — the design documents its own reasoning rather than
   asserting compliance, which is what Article 5(2) actually requires (the controller must be
   *able to demonstrate*, not simply assert).

3. **GDPR Article 25(1) requires appropriate technical and organisational measures, such as
   pseudonymisation, by design and by default.** SOURCES.md's quote supports this directly.
   Checked step 5's "the aggregates-only compromise, designed in" doesn't claim Article 25
   mandates aggregation specifically — the quote names pseudonymisation as one example measure
   among others the article leaves unspecified; the topic treats aggregation as *a* measure
   that satisfies the design-by-default principle, not *the* measure the article requires.

4. **GDPR Article 44 permits a transfer of personal data to a third country only if the
   conditions in GDPR Chapter V are met.** SOURCES.md's quote supports this directly. Checked
   step 3's "EU personal-data chips cannot cross the line" doesn't overclaim an absolute ban —
   Article 44's own text is conditional ("only if... the conditions... are complied with"), so
   the topic frames the gate as "a real, binding constraint that this design does not resolve
   on its own" rather than an unconditional prohibition, and names the legal mechanism (Chapter
   V's conditions) rather than asserting what satisfies it.

5. **AWS documents that S3 Replication Time Control replicates most objects in seconds, and
   99.9 percent within 15 minutes.** SOURCES.md's quote supports this directly — `CHAPTER.md`
   itself names this exact guarantee as required to quote and re-verify. Checked step 5's
   "bounded, paid consistency lag" framing matches the quote's own 15-minute bound exactly, not
   an invented tighter or looser number.

6. **AWS's pricing page states the Europe (Ireland) data-transfer-out-to-internet rate as $0.09
   per GB.** SOURCES.md's quote supports this directly, with the fetch date recorded
   (2026-10-31). Checked `examples.py`'s egress calculation uses this exact rate and states it
   as a single-region example price, not a universal cross-provider or cross-region figure —
   the page itself gives no general inter-region rate, so the topic is explicit that this is
   one region's example, used to illustrate the arithmetic, not a definitive global price.

7. **This topic states explicitly what it does not claim about legal compliance.** Checked
   against `CHAPTER.md`'s own outcome line directly — every GDPR-sourced claim above (1-4) is
   phrased as what the article's text states, with a separate, explicit note (in `post-notes.md`
   and step 3's own framing) that whether a specific design satisfies that text is counsel's
   determination, never asserted as "compliant" by this topic.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("a faster replication tool") is a genuine,
  plausible-sounding first instinct — faster replication does reduce consistency lag — but it's
  ruled out because it doesn't touch the actual problem the hook describes: *which* rows crossed
  the border at all, not how fast they did. Checked the correct option's "per-dataset residency
  rule" against claim 4 directly: Article 44's transfer restriction is about whether a transfer
  is permitted, not how quickly it completes, so a faster tool makes a potentially-impermissible
  transfer happen faster, which is not an improvement.
- **Predict 2 (step 10, "Prove it"):** checked that excluding the new region and saying so
  (option a) is the design's own honest default, consistent with claim 7's own framing — but the
  option is marked "defensible... but only if the stalest-region rule is stated for the viewer"
  because silently excluding data is its own kind of misleading global figure; option (b)
  blending unmarked partial data is ruled out directly against step 8's own takeaway (a global
  figure carries the freshness of its stalest region, which requires *marking* which part is
  catching up, not hiding it).

## Illustrative numbers (figs for steps 1, 4, 6, 7, 8, 10)

The hook's "over a weekend," the shop's specific events-versus-aggregates volumes used in the
egress comparison (multiplied against the real, cited $0.09/GB rate), the RPO/RTO numbers per
data class, and the third-region backfill timing in step 10 are illustrative, stated lab numbers
for the storyboard and the arithmetic in `examples.py`, not cited real-world incident figures —
no claim is made about any specific company's actual cross-region incident or cost history. The
$0.09/GB rate itself is the one real, dated, cited figure in the calculation; everything it is
multiplied against is the shop's own illustrative volume.

## Outcome

No open findings. Every GDPR-sourced claim traces to one of SOURCES.md's three verbatim quotes
from GDPR's own articles; the S3 Replication Time Control guarantee and the egress price each
trace to AWS's own documentation, fetched and dated; the placement, failover, and
stalest-region design decisions rest on `CHAPTER.md`'s own stated scope and this topic's own
derived arithmetic, not an unsourced factual claim; both predicts are checked against the
topic's own cited mechanisms rather than invented reasoning.
