# Sources — de.source-side-interrogation

`CHAPTER.md` names the Open Data Contract Standard and a payments provider's public
API-reliability documentation "as examples of what a source's stated guarantees look like
(named, fetched)." Reis and Housley's *Fundamentals of Data Engineering* is named as framing
only, not a fetched/quoted source, and is not quoted here. Chapter 8's ingestion/CDC topics,
Chapter 3's data-contract topic, and Chapter 13 topic 4 are prior topics in this same site,
referenced via `uses`/`declared`, not external sources.

## Open Data Contract Standard, "Definition: Open Data Contract Standard (ODCS)"

URL: https://bitol-io.github.io/open-data-contract-standard/latest/
Fetched: 2026-10-30.

Quotes:
> This document describes the keys and values expected in a YAML data contract, per the Open Data Contract Standard.

Items: a source's schema can be stated as a structured, checkable document — keys and values —
rather than left to an email thread or a shared doc, which is what "who owns the schema and the
right to change it" is asking a source to produce.

## Open Data Contract Standard, "Fundamentals"

URL: https://bitol-io.github.io/open-data-contract-standard/latest/fundamentals/
Fetched: 2026-10-30.

Quotes:
> Current status of the data contract. Examples are "proposed", "draft", "active", "deprecated", "retired".

> Current version of the data contract.

Items: a contract that states its own `status` and `version` fields gives the consumer a
named, checkable answer to "how much notice do I get" before a source changes — the contract's
own lifecycle is itself specified, not left for the consumer to infer from a changelog.

## Stripe, "Receive Stripe events in your webhook endpoint"

URL: https://docs.stripe.com/webhooks
Fetched: 2026-10-30.

Quotes:
> Stripe doesn't guarantee the delivery of events in the order that they're generated.

> Webhook endpoints might occasionally receive the same event more than once. You can guard against duplicated event receipts by logging the event IDs you've processed, and then not processing already-logged events.

> Stripe attempts to deliver events to your destination for up to three days with an exponential back off in live mode.

Items: (1) a source that pushes events states plainly that order is not guaranteed, which is
exactly the kind of fact an interview question has to surface rather than assume; (2) the same
source states that duplicates happen and names the fix (track IDs, not timestamps) — a source's
own documentation can hand the interviewer the dedup key directly; (3) a stated retry window
("up to three days") turns "what happens when you're down" into a measured number instead of a
guess.
