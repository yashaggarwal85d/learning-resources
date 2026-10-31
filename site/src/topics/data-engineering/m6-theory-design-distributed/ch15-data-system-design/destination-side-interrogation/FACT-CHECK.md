# Fact-check — de.destination-side-interrogation

## Claims re-derived against the source

1. **The same service's stated guarantees fit one consumer's use case and not another's.**
   SOURCES.md's SRE book quotes support this directly (the photo-sharing versus archival-records
   example). Checked step 4's "one dataset, several consumers, several stores" claim stays scoped
   to the source's own point — that published guarantees are use-case relative — rather than
   inventing a stronger claim about any specific storage product's actual trade-offs.

2. **Freshness is defined against a stated time threshold, ideally weighted by actual access.**
   SOURCES.md's first SRE workbook quote supports this directly. Checked step 5's "before the
   next floor walk" framing treats this as an instance of a stated threshold, not a new
   definition — the source's own point (weight by access, not raw record count) is the reason a
   vague "real time" demand needs to be replaced by a number tied to what the consumer actually
   does.

3. **A critical user journey is the unit to organize SLO/interview questions around, not a
   component.** SOURCES.md's second SRE workbook quote supports this directly. Checked step 3's
   "list every consumer, not just the one who asked" doesn't overclaim the source's own online
   shopping example as data-engineering-specific — it's used here as the general principle
   (journey over component) applied to a different domain.

4. **The fifteen-minute destination interview and "what do you do the moment you see it" are
   this chapter's own established method.** Not an independent citation — `CHAPTER.md`'s own
   scope line, hook, and outcomes state this directly. Presented as the chapter's own method,
   not a cited authority's finding.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("ask for more detail on what real-time means
  technically") is a genuine, tempting first move for an engineer — pin down the jargon — rather
  than a strawman. The hook's own plant lead isn't an engineer and has no technical definition in
  mind; the actual fork is behavioral (what they do with the number), which only the correct
  option reaches.
- **Predict 2 (step 10, "Prove it"):** checked that "a single view of the customer" is genuinely
  as vague as the hook's own prompt — it names a noun, not a freshness, a consumer, or a grain —
  so skipping straight to building repeats the hook's own failure mode rather than testing a
  different lesson.

## Illustrative numbers (figs for steps 1, 7, 10)

The plant lead's exact phrasing, the four consumers' specific grains, and the second prompt's
exact five questions are illustrative, stated lab scenarios for the storyboard, not cited
real-world figures — no claim is made about any specific company's actual plant floor or CRM
project.

## Outcome

No open findings. Every claim about SLO guarantees, freshness, or user journeys traces to one of
SOURCES.md's four verbatim quotes across two SRE sources; the fifteen-minute interview method
rests on `CHAPTER.md`'s own stated scope, not an unsourced factual claim; both predicts are
checked against the hook's own established scenario and the design method already taught.
