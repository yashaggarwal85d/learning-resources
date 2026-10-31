# Fact-check — de.communicating-tradeoffs-decision-makers

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Amazon's own 2017 letter to shareholders: Amazon does not use slide-oriented presentations; it writes narratively structured six-page memos, read silently at the start of each meeting. | Amazon.com, Inc., 2017 Letter to Shareholders | Verified, quoted |
| 1b | Dan McKinley's own essay: a boring choice's failure modes are well understood, and the long-term cost of keeping a system reliable vastly exceeds the inconvenience of building it with something less exciting. | Dan McKinley, "Choose Boring Technology" | Verified, quoted |
| 2 | (This course) topic 1's own three priced tiers, restated in business terms (dollars per day and a wrong-number-risk figure), rank fast > medium > slow in cost, computed directly from topic 1's own cost model. | This topic's own examples.py (computed, illustrative) | Computed in this topic's own disclosed model |
| 3 | (This course) of the cost gap between the fast and medium tiers, the recompute-and-streaming lever accounts for the entire measured gap, since the base-infrastructure lever is identical across tiers. | This topic's own examples.py (computed, illustrative) | Computed in this topic's own disclosed model |
| 4 | (This course) a one-page executive summary and a longer engineering deep dive, both generated from the identical tier recommendation, differ in length but never in which tier they recommend. | This topic's own examples.py (computed, illustrative) | Computed in this topic's own disclosed model |

## Currency check

- The Amazon shareholder-letter quote is read from Amazon's own current company-news
  republication of the letter at research time (2026-10-30); the letter itself is a fixed,
  dated historical document (dated April 2018, describing a practice adopted in 2004) that
  cannot have changed meaning since, only possibly moved pages, which is why the republication
  was used in place of the original SEC filing (see Problem Solving, below).
- The business-terms, dominant-lever and document-shape claims are this topic's own computed
  artifact, re-run at research time; nothing here depends on an external claim that could age.

## Red team

1. **Does citing Amazon's own narrative-memo practice risk implying this topic's one-page/deep-dive
   split reproduces Amazon's own six-page format?** No — SOURCES.md's own "Used for" note and
   post-notes.md both state explicitly that this topic borrows only the shape of the split
   (a short, conclusion-first document paired with a longer one), not Amazon's own page count or
   its silent "study hall" reading ritual, which examples.py's own one-pager (at most six lines)
   does not reproduce.
2. **Is the "wrong-number risk" dollar figure in examples.py presented as a real, sourced cost of a
   bad decision, risking an overclaim about what a stale dashboard number actually costs a plant?**
   No — examples.py's own docstring states the figure is "illustrative"; the claim actually made
   (claim 2) is about the *ranking* of risk across tiers (staler tiers carry more risk, computed
   proportionally to staleness), not about any specific dollar amount being a real, measured cost.
3. **Does naming "recompute_and_streaming" as the sole dominant lever overstate a result that's an
   artifact of this topic's own simplified two-lever cost model (only two levers exist at all)?**
   Partially a modeling choice, stated plainly — examples.py's own `cost_lever_breakdown` only
   models two levers because topic 1's own cost model only has two cost terms; the claim this
   topic makes (claim 3) is checked mechanically (`share_of_total_gap > 0.5`) against exactly the
   model topic 1 already built and disclosed, not against a claim of real-world completeness.
4. **Is recommending the medium tier as "the boring choice" itself a sourced claim, or this
   course's own editorial framing?** This course's own framing, stated as such — `RECOMMENDED_TIER`
   is set directly in examples.py as a worked choice for the shop's own fictional scenario, not
   a citation to any real organization's actual tier decision.

5. **Does citing McKinley's own essay for "the boring choice" risk implying the medium tier is
   boring in McKinley's own specific technology sense (an unproven database, a new language)?**
   No — SOURCES.md's own "Used for" note states the citation is for the general argument (a
   well-understood choice's failure modes are known, and that is worth more than avoided
   inconvenience), not for any specific technology McKinley discusses; the medium tier is "boring"
   only in the sense of not being the newest or fastest option on offer.

## Problem Solving

The SEC's own primary filing (Exhibit 99.1 to Amazon's 2018 Form 8-K) returned an HTTP 403 when
fetched by `sources.mjs check` in this sandbox — the same recurring, domain-wide fetch limitation
documented for other gated hosts in earlier topics, not something specific to this quote. Fixed by
substituting Amazon's own company-news republication of the identical letter
(aboutamazon.com/news/company-news/2017-letter-to-shareholders), confirmed word-for-word identical
to the SEC filing's own "Six-Page Narratives" section text, and documenting the substitution here
and in SOURCES.md.
