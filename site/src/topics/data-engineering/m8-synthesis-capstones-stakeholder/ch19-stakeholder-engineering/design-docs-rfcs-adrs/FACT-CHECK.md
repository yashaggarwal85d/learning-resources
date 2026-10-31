# Fact-check — de.design-docs-rfcs-adrs

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Michael Nygard's 2011 post: an ADR uses a few parts so each document is easy to digest; a decision may be "proposed" or "accepted." | Michael Nygard, "Documenting Architecture Decisions" | Verified, quoted |
| 2 | Michael Nygard's 2011 post: all consequences (positive, negative, neutral) are listed, and a reversed decision is marked "deprecated" or "superseded" rather than removed. | Michael Nygard, "Documenting Architecture Decisions" | Verified, quoted |
| 3 | Malte Ubl's account of Google's design docs: non-goals aren't negated goals like "the system shouldn't crash," but things deliberately chosen not to be goals. | Malte Ubl, "Design Docs at Google" | Verified, quoted |
| 4 | The Rust RFC process's own README: the process exists so stakeholders can be confident about the project's direction, and all subteam members must sign off before the final comment period starts. | rust-lang/rfcs README | Verified, quoted |
| 5 | The Rust RFC process's own README: the final comment period lasts ten calendar days. | rust-lang/rfcs README | Verified, quoted |
| 6 | (This course) the shop's own design doc and ADR, checked structurally in examples.py, contain every one of their own required sections/fields, and a second ADR correctly marks the first as superseded rather than removing it. | This topic's own examples.py (computed, illustrative) | Computed in this topic's own disclosed model |

## Currency check

- The Nygard post is a fixed, dated 2011 document describing a format that has not changed since
  (confirmed current at research time, 2026-10-30); its own page states it is dedicated to the
  public domain, so there is no version to track.
- The Ubl "Design Docs at Google" essay is the author's own account of a long-standing internal
  practice, read from its current hosted copy at research time; not a result that could go stale
  in a way that changes this topic's own citation.
- The Rust RFC README is read directly from the `master` branch at research time; it is a living
  document that could change, but the specific mechanics cited here (the subteam sign-off, the
  ten-day FCP) are long-standing, stable parts of the process, not a recent addition.

## Red team

1. **Does citing Google's own design-doc practice (via Ubl's account) for only context, goals,
   non-goals and alternatives, while this topic's own doc also has estimates and risks sections
   not named in that source, risk misattributing those two sections to Google's practice?** No —
   SOURCES.md's own "Used for" note and this file's Internals section both state explicitly that
   estimates and risks are this course's own addition, not attributed to the cited source.
2. **Does citing the Rust RFC process for "cross-team RFC review" risk implying Rust's own
   sub-team structure is the same as the cross-team review CHAPTER.md's syllabus clause names?**
   No — the citation is for the general mechanism (a time-boxed, advertised comment period every
   relevant team must sign off on before a decision is final), not for Rust's own specific
   sub-team organization, which this topic's own worked example doesn't reproduce.
3. **Is the shop's own ADR-2 (adding a fast-tier path for alert-only plants) a real, sourced
   scenario, or an invented detail?** Invented, explicitly — it is this topic's own worked
   illustration of the superseded convention, built to demonstrate claim 6's own mechanical check,
   not a claim about any real organization's actual plant-dashboard history.
4. **Does calling "ACID compliance" a non-goal example risk implying every database design that
   omits it made the same choice for the same reason?** No — the example is reproduced directly
   from the cited source's own illustration of the general non-goal/negated-goal distinction, not
   presented as a claim about this chapter's own fictional dashboard system, which has no database
   consistency requirement under discussion at all.

## Problem Solving

One quote-matching fix was needed: the Ubl design-doc quote about non-goals uses curly double
quotation marks around the embedded phrase "The system shouldn't crash" in the source's own text;
the first draft of the SOURCES.md quote used straight single quotation marks around that phrase
instead, which made `sources.mjs check` report "not found word for word" (a quote-character-type
mismatch, not a wording difference). Fixed by matching the source's own quotation-mark style
exactly (double quotes around the embedded phrase, matching the source after normalization).
