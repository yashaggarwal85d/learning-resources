## dbt Labs — Model contracts (Developer Hub documentation)

URL: https://docs.getdbt.com/docs/collaborate/govern/model-contracts
Version: dbt Developer Hub, fetched 2026-10-30

> It's better to define a set of upfront "guarantees" that define the shape of your model. We call this set of guarantees a "contract."

> When comparing to a previous project state, dbt will look for breaking changes that could impact downstream consumers.

Used for: a real, documented data-contract practice's own definition of a contract (an upfront set
of guarantees about a dataset's shape) and its own stated reason a contract exists (so a breaking
change can be caught before it reaches a downstream consumer) — the mechanism this topic's own
producer/consumer negotiation is built around.

## Google — Site Reliability Engineering (the SRE book), "Embracing Risk"

URL: https://sre.google/sre-book/embracing-risk/
Version: Google SRE book, fetched 2026-10-30

> the two teams jointly define a quarterly error budget based on the service’s service level objective, or SLO (see Service Level Objectives). The error budget provides a clear, objective metric that determines how unreliable the service is allowed to be within a single quarter.

> An error budget aligns incentives and emphasizes joint ownership between SRE and product development.

Used for: the SRE book's own definition of an error budget (jointly defined, tied to a stated
SLO) and its own stated reason for joint ownership between the team providing a service and the
team consuming it — this topic's own citation for why an SLO breach needs a named, agreed owner
rather than an undifferentiated "the system failed."
