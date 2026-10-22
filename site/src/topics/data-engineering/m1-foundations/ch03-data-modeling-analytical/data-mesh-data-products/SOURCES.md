# Sources — de.data-mesh-data-products

Both quotes sources are Zhamak Dehghani's own data mesh writing, matching CHAPTER.md's
attribution instruction. This topic has no lab of its own (`CHAPTER.md`).

## Zhamak Dehghani, "How to Move Beyond a Monolithic Data Lake to a Distributed Data Mesh"

URL: https://martinfowler.com/articles/data-monolith-to-mesh.html
Fetched: 2026-10-22.

Quotes:
> Instead of flowing the data from domains into a centrally owned data lake or platform, domains need to host and serve their domain datasets in an easily consumable way.

> A data product must be easily discoverable. A common implementation is to have a registry, a data catalogue, of all available data products with their meta information such as their owners, source of origin, lineage, sample datasets, etc.

> A data product, once discovered, should have a unique address following a global convention that helps its users to programmatically access it.

> No one will use a product that they can't trust. In the traditional data platforms it's acceptable to extract and onboard data that has errors, does not reflect the truth of the business and simply can't be trusted.

> One of the main concerns in a distributed domain data architecture, is the ability to correlate data across domains and stitch them together in wonderful, insightful ways; join, filter, aggregate, etc. The key for an effective correlation of data across domains is following certain standards and harmonization rules.

> One of the main concerns of distributing the ownership of data to the domains is the duplicated effort and skills required to operate the data pipelines' technology stack and infrastructure in each domain.

Items: (1) domain ownership itself — domains host and serve their own datasets, rather than flowing data into a centrally owned lake; (2) the data-as-a-product standard's own named qualities: discoverable, addressable, trustworthy and truthful, inter-operable; (3) the specific cost of decentralizing ownership without a shared platform — duplicated effort and specialized skill in every domain, the platform-maturity precondition's own origin.

## Zhamak Dehghani, "Data Mesh Principles and Logical Architecture"

URL: https://martinfowler.com/articles/data-mesh-principles.html
Fetched: 2026-10-22.

Quotes:
> there are four underpinning principles that any data mesh implementation embodies to achieve the promise of scale, while delivering quality and integrity guarantees needed to make data usable : 1) domain-oriented decentralized data ownership and architecture, 2) data as a product, 3) self-serve data infrastructure as a platform, and 4) federated computational governance.

> I have intended for the four principles to be collectively necessary and sufficient; to enable scale with resiliency while addressing concerns around siloing of incompatible data or increased cost of operation.

> the skills needed to provision this infrastructure are specialized and would be difficult to replicate in each domain. Most importantly, the only way that teams can autonomously own their data products is to have access to a high-level abstraction of infrastructure that removes complexity and friction of provisioning and managing the lifecycle of data products. This calls for a new principle, Self-serve data infrastructure as a platform to enable domain autonomy.

> I call this a federated computational governance. A decision making model led by the federation of domain data product owners and data platform product owners, with autonomy and domain-local decision making power, while creating and adhering to a set of global rules — rules applied to all data products and their interfaces — to ensure a healthy and interoperable ecosystem.

Items: (1) the four principles, named by Dehghani herself, collectively necessary and sufficient — no single one substitutes for the others; (2) the self-serve platform's own stated reason to exist: the specialized infrastructure skill domain ownership would otherwise require in every domain; (3) federated computational governance's own precise definition — domain-local autonomy plus a small set of globally enforced, platform-automated rules.

### Disclosure

No numeric claim is made anywhere in this topic beyond what these two primary sources state
qualitatively — neither source gives a reproducible number for the cost of skipping the
self-serve platform, and this topic has no lab to measure one independently. The failure mode
this topic names (mesh adopted before the platform exists) is drawn directly from Dehghani's own
stated reason for the self-serve platform principle: without it, each domain pays the full,
specialized infrastructure cost of operating its own data product, which is exactly the
duplicated-effort problem her first article names.
