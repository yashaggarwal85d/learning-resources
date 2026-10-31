## Cognitect — "Documenting Architecture Decisions" (Michael Nygard, 2011-11-15)

URL: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
Version: original 2011 blog post, fetched 2026-10-30

> We will use a format with just a few parts, so each document is easy to digest.

> Status A decision may be "proposed" if the project stakeholders haven't agreed with it yet, or "accepted" once it is agreed. If a later ADR changes or reverses a decision, it may be marked as "deprecated" or "superseded" with a reference to its replacement.

> Consequences This section describes the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future.

Used for: the originating, four-part ADR format (context, decision, status, consequences) this
topic cites directly for its own worked ADR, and the status/superseded convention CHAPTER.md's
own §18.2 rubric point names explicitly.

## Industrial Empathy — "Design Docs at Google" (Malte Ubl)

URL: https://www.industrialempathy.com/posts/design-docs-at-google/
Version: author's own republished essay, fetched 2026-10-30

> This section should start with an overview and then go into details.

> non-goals aren't negated goals like "The system shouldn't crash", but rather things that could reasonably be goals, but are explicitly chosen not to be goals.

Used for: a real, documented design-doc-structure practice's own context/goals-non-goals/
design/alternatives sections, cited structurally, and specifically its own distinction between a
non-goal and a negated goal. This source's own practice has no named "estimates" or "risks"
section; this topic's own worked design doc adds those two sections itself, disclosed as such in
FACT-CHECK.md rather than attributed to this source.

## rust-lang/rfcs — README (the Rust RFC process)

URL: https://raw.githubusercontent.com/rust-lang/rfcs/master/README.md
Version: current README on the `master` branch, fetched 2026-10-30

> The "RFC" (request for comments) process is intended to provide a consistent and controlled path for changes to Rust (such as new features) so that all stakeholders can be confident about the direction of the project.

> The FCP lasts ten calendar days, so that it is open for at least 5 business days.

> Before actually entering FCP, *all* members of the subteam must sign off; this is often the point at which many subteam members first review the RFC in full depth.

Used for: a real, publicly documented cross-team review process (a time-boxed, widely-advertised
final comment period that every relevant sub-team must sign off on before a decision is final),
cited for what an RFC review adds over a design doc read by one team alone.
