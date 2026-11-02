# Sources: Federated governance operating model (`de.federated-governance-operating-model`)

Dehghani's own data-mesh article, Conway's own 1968 paper, the Open Data Contract Standard's
own home page, and Chapter 3's own data-mesh topic.

## Dehghani -- Data Mesh Principles and Logical Architecture

URL: https://martinfowler.com/articles/data-mesh-principles.html
Retrieved 2026-11-02

> decentralized data ownership and architecture, 2) data as a product, 3) self-serve data infrastructure as a platform, and 4) federated computational governance.

> I have intended for the four principles to be collectively necessary and sufficient; to enable scale with resiliency while addressing concerns around siloing of incompatible data or increased cost of operation.

> Many practices of pre-data-mesh governance, as a centralized function, are no longer applicable to the data mesh paradigm.

> A domain dataset only becomes a data product after it locally, within the domain, goes through the process of quality assurance according to the

> they need to comply with the modeling of quality and specification of SLOs based on a global standard, defined by the global federated governance team, and automated by the platform.

Contents: the four principles, the centralized-vs-federated governance contrast, and the
global-standard-defined-centrally/automated-by-the-platform split -- the "domain teams own
data products, a platform team supplies self-serve tooling, central policy is applied
computationally" clause.

## Conway -- How Do Committees Invent? (1968)

URL: https://www.melconway.com/Home/Committees_Paper.html
Retrieved 2026-11-02

> The basic thesis of this article is that organizations which design systems (in the broad sense used here) are constrained to produce designs which are copies of the communication structures of these organizations.

> Primarily, we have found a criterion for the structuring of design organizations: a design effort should be organized according to the need for communication.

Contents: the paper's own thesis statement, in its own words -- the "reverse Conway's law"
clause's source.

## Open Data Contract Standard -- Home

URL: https://bitol-io.github.io/open-data-contract-standard/v3.0.0/home/
Retrieved 2026-11-02

> A data contract defines the agreement between a data producer and consumers.

> Formerly known as the data contract template, this standard is used to implement Data Mesh at PayPal. Starting with v2.2.0, it is maintained by a 501c6 non-profit organization called AIDA User Group (Artificial Intelligence, Data, and Analytics User Group).

Contents: ODCS's own description of itself as the producer/consumer agreement data mesh's
federated governance automates -- framing for the "central policy is applied computationally"
clause, continuing this chapter's earlier use of ODCS (topics 7, 11).

## This course's own measurement

URL: (none — this course's own code, not a fetched source)

`examples.py` builds a self-serve table-registration gate that checks a proposed table against
three centrally-defined rules (a schema requirement, a contract field, a classification tag)
automatically, and shows it admitting a compliant table and rejecting one missing a tag with a
named reason -- the mechanism the "central policy is applied computationally" clause claims,
run rather than merely described.
