# Sources — de.data-quality-monitoring-platform

`CHAPTER.md` names Chapter 13 topics 3, 11, 12 and 14 as in-course anchors, dbt's, GX Core's,
Soda's and Deequ's documentation for the check layer, and the Google SRE book's chapters on
monitoring and on alerting from SLOs as candidates. This topic quotes dbt's own documentation
(the check-execution layer this topic's declarative-rule checks are built on) and the Google SRE
book's "Monitoring Distributed Systems" chapter (the actionable-alert principle and the
ticket/email/page alert taxonomy this topic's suppression and routing design is built on) — two
sources, satisfying the ≥2-source rule. Chapter 13's quality-framework, lineage, and burn-rate
material (declarative checks, incremental metrics, lineage-based blast radius, multi-window
alerting) are prior topics on this same site and this chapter's own established method, used and
not re-taught, not external sources.

## dbt Labs documentation, "Data tests"

URL: https://docs.getdbt.com/docs/build/data-tests
Fetched: 2026-10-31. Covers dbt's v1 (1.10.5+) and v2 release tracks.

Quotes:
> Data tests are assertions you make about your models and other resources in your dbt project

> If the data test returns zero failing rows, it passes, and your assertion has been validated.

> Out of the box, dbt ships with four generic data tests already defined

Items: (1) the declarative-check layer's own definition — a check is an assertion compiled to a
query that returns its failing rows; (2) the pass/fail rule this topic's check-execution design
runs on; (3) the four built-in generic checks this topic's rule layer composes from, rather than
reinventing.

## Google, "Site Reliability Engineering" (the SRE book), "Monitoring Distributed Systems"

URL: https://sre.google/sre-book/monitoring-distributed-systems/
Fetched: 2026-10-31.

Quotes:
> Every page should be actionable.

> A notification intended to be read by a human and that is pushed to a system such as a bug or ticket queue

> Email alerts are of very limited value and tend to easily become overrun with noise

Items: (1) the actionable-page test this topic's alert-routing and suppression design must pass;
(2) the alert/ticket/page taxonomy behind the incident-workflow step; (3) the warning against
email-style alerting this topic's suppression design is built to avoid repeating.
