# Fact-check — de.negotiating-data-contracts-slos

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | dbt's own documentation: a data contract is an upfront set of guarantees that define the shape of a model's returned dataset. | dbt Labs, Model contracts | Verified, quoted |
| 2 | dbt's own documentation: dbt checks a previous project state for breaking changes that could impact downstream consumers. | dbt Labs, Model contracts | Verified, quoted |
| 3 | Google's SRE book: an error budget is jointly defined by two teams, quarterly, based on a stated service level objective (SLO). | Google SRE book, "Embracing Risk" | Verified, quoted |
| 4 | Google's SRE book: an error budget aligns incentives and emphasizes joint ownership between the team providing a service and the team consuming it. | Google SRE book, "Embracing Risk" | Verified, quoted |
| 5 | (This course) a simple, disclosed, illustrative cost model prices a five-minute freshness tier dramatically higher than a sixty-minute tier, which in turn prices higher than a next-day tier. | This topic's own examples.py (computed, illustrative) | Computed in this topic's own disclosed model |
| 6 | (This course) a quarterly error budget computed from a stated SLO percentage, in the SRE book's own worked style, is partially but not fully consumed by one disclosed twenty-minute breach. | This topic's own examples.py (computed, illustrative) | Computed in this topic's own disclosed model |

## Currency check

- The dbt documentation quotes are read from the current Developer Hub page at research time
  (2026-10-30); dbt's own model-contracts feature and its stated purpose are a stable, documented
  part of the product, not something likely to have changed meaning recently.
- The SRE book quotes are read from Google's own current hosted copy of the book at research
  time; the error-budget chapter describes a long-standing, widely cited practice (first
  published in the 2016 print edition), not a result that could go stale.

## Red team

1. **Are the dollar figures in examples.py's cost model presented as real, sourced pricing data,
   risking an overclaim about what a dashboard tier actually costs in production?** No —
   examples.py's own docstring and every printed line state the model is "illustrative, disclosed,
   not real pricing data"; the claim this topic actually makes (claim 5) is about the *shape* of
   the cost curve (fast tiers cost dramatically more, mainly from a streaming-infrastructure
   surcharge), not about any specific dollar amount being a real, benchmarked cost.
2. **Does citing dbt's own model contracts feature as "a data contract" risk conflating one
   product's specific implementation with the general industry concept the syllabus names?** The
   topic cites dbt's own definition explicitly as one real, documented example of the practice
   (its own "Used for" note in SOURCES.md says exactly this), not as the universal or only
   definition of a data contract; the general concept (a producer's upfront guarantee to a
   consumer) is stated in the topic's own words, with dbt's implementation as the concrete,
   citable instance of it.
3. **Is assigning "platform on-call engineer" as the fast tier's breach owner an invented detail
   rather than a sourced fact?** Yes, explicitly — this is this topic's own worked example for
   the shop's fictional dashboard request, not a claim about any real organization's actual
   on-call structure; it is presented as a worked illustration of the SRE book's own
   joint-ownership principle (claim 4), not as a sourced fact itself.
4. **Does the error-budget calculation's own "20-minute breach" number need its own citation?**
   No — it is a deliberately chosen, round illustrative number picked to land meaningfully
   between zero and the full budget (claim 6's own assertion checks exactly this: `0 <
   consumed_percent < 100`), not a claim about any real incident's duration.

## Problem Solving

Both sources fetched and quoted cleanly on the first try. One quote-matching fix was needed: the
SRE book's own error-budget quote spans a sentence containing a curly right single-quote
character (`service’s`) and a parenthetical cross-reference ("(see Service Level Objectives)")
immediately before the quote's own closing period; the first draft of the SOURCES.md quote used a
straight apostrophe and dropped the parenthetical, both of which made `sources.mjs check` report
"not found word for word." Fixed by matching the source's own extracted text exactly, including
the curly apostrophe and the parenthetical cross-reference.
