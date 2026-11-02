# Sources — de.destination-side-interrogation

`CHAPTER.md` names Reis and Housley's *Fundamentals of Data Engineering* (requirements
gathering, stakeholders) as framing only, not a fetched/quoted source. Chapter 3's modelling and
Chapter 13's access-control topics, and Chapter 15 topics 1 and 10, are "in-course anchors" —
prior topics on this same site, referenced via `uses`, not external sources. The Google SRE book
is named as the one source to fetch and quote, split here across its two chapters already
fetched for topic 1 (different quotes this time, chosen for the destination-side questions this
topic actually asks).

## Google SRE Book, "Service Level Objectives" (Chapter 4)

URL: https://sre.google/sre-book/service-level-objectives/
Fetched: 2026-10-30.

Quotes:
> Publishing SLOs sets expectations for system behavior. Users (and potential users) often want to know what they can expect from a service in order to understand whether it's appropriate for their use case.

> For instance, a team wanting to build a photo-sharing website might want to avoid using a service that promises very strong durability and low cost in exchange for slightly lower availability, though the same service might be a perfect fit for an archival records management system.

Items: the same service's own stated guarantees fit one consumer's use case and not another's —
exactly why "list every consumer and what each does with it" has to be the first question
asked, rather than a single guarantee assumed to fit all of them.

## Google SRE Workbook, "Implementing SLOs" (Chapter 2)

URL: https://sre.google/workbook/implementing-slos/
Fetched: 2026-10-30.

Quotes:
> The proportion of the data that was updated more recently than some time threshold. Ideally this metric counts how many times a user accessed the data, so that it most accurately reflects the user experience.

> You can use critical user journeys to help capture the experience of your customers. A critical user journey is a sequence of tasks that is a core part of a given user's experience and an essential aspect of the service.

Items: (1) freshness is defined against a threshold and, done well, weighted by actual access —
the question "how stale is too stale, and measured where" has a stated, checkable shape; (2) a
critical user journey, not a component, is the unit a destination-side interview should
organize its questions around — which consumer, doing what, is the question that forks the
design.
