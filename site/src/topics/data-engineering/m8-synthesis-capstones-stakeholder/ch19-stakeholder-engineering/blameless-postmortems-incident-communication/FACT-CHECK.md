# Fact-check — de.blameless-postmortems-incident-communication

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Daniel Schauenberg's own account of Etsy's postmortem process: the process focuses on the conditions and context that influenced decisions and actions, not on the action itself as the most prominent apparent cause. | Daniel Schauenberg, "Practical Postmortems at Etsy" (InfoQ) | Verified, quoted |
| 2 | Google's SRE book: writing a postmortem is a learning opportunity, not punishment. | Google SRE book, "Postmortem Culture" | Verified, quoted |
| 3 | Google's SRE book: a blameless postmortem identifies contributing causes without indicting any individual or team, assuming everyone involved had good intentions. | Google SRE book, "Postmortem Culture" | Verified, quoted |
| 4 | (This course) a simulated one-hour staleness incident on the medium tier produces a computed stale-row count and a named list of affected plant decisions, checked mechanically against the incident's own stated parameters. | This topic's own examples.py (computed, illustrative) | Computed in this topic's own disclosed model |
| 5 | (This course) a blameless post-mortem with two or more non-person contributing factors and owned, system-targeted action items passes a mechanical check that a one-factor, person-blaming post-mortem fails. | This topic's own examples.py (computed, illustrative) | Computed in this topic's own disclosed model |

## Currency check

- The InfoQ article is read from its current hosted copy at research time (2026-10-30); it
  describes a long-standing, internal practice (Etsy's own postmortem process, iterated on for
  years per the article's own account), not a result likely to have changed meaning recently.
- The SRE book quotes are read from Google's own current hosted copy at research time; the
  blameless-postmortem chapter describes a long-standing, widely cited practice, not a result that
  could go stale.

## Red team

1. **Does citing an InfoQ article by an Etsy engineer, rather than John Allspaw's original 2011
   Code as Craft post that coined "blameless postmortems," risk citing the wrong originating
   source?** This sandbox could not fetch etsy.com directly (HTTP 403, the same class of gated-
   host limitation as sec.gov and some `.edu` hosts; see Problem Solving). The InfoQ article is
   itself written by an Etsy engineer and postmortem facilitator describing Etsy's own process,
   including its own reference to the "New View" of systems safety that the original post also
   draws on, so it remains a real, documented account of the originating practice named in
   CHAPTER.md, not a third-party retelling.
2. **Is the simulated incident's "stale rows" count and the named plant decisions presented as
   real, measured data, risking an overclaim about any actual incident?** No — examples.py's own
   docstring states this is a simulated incident built for the chapter's own fictional dashboard
   scenario, and claim 4 is checked against the model's own stated parameters (rows per minute,
   incident duration), not against any real system's logs.
3. **Does the check_blameless function's own rule (fewer than two factors fails) risk teaching
   that any one-factor post-mortem is automatically wrong, even when an incident genuinely has
   only one real contributing condition?** The rule is stated in this topic's own worked example
   as a heuristic for this chapter's own teaching purpose (a signal that the investigation may
   have stopped too early), not as a universal rule asserted to apply to every real incident;
   FACT-CHECK.md's own Frontier section frames it as a sign worth noticing, not a hard law.
4. **Is naming "platform on-call engineer" and "data platform team" as action-item owners in the
   blameless post-mortem a sourced claim?** No, explicitly — these are this topic's own worked
   illustration, reusing the same role names topic 1's own examples.py already established for
   this fictional shop, not a claim about any real organization's actual staffing.

## Problem Solving

The originating Etsy postmortem blog post (etsy.com/codeascraft/blameless-postmortems) returned an
HTTP 403 when fetched by `sources.mjs check` in this sandbox, the same class of gated-host
limitation documented for sec.gov and some `.edu` hosts in earlier topics. Substituted with the
InfoQ article "Practical Postmortems at Etsy" by Daniel Schauenberg, an Etsy engineer and
postmortem facilitator, which fetched cleanly and independently documents the same originating
practice and reasoning; documented the substitution here and in SOURCES.md.
