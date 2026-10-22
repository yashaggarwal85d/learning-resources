<section data-section="outcomes">

## Outcomes

Data mesh reverses who hosts analytical data: each domain hosts and serves its own, rather than
a central team extracting it into a shared lake. That domain data only counts as a genuine
product once it meets a specific, named standard — discoverable through a registry, addressable
at a stable location, trustworthy through an honest stated quality guarantee, and inter-operable
through shared cross-domain standards — not by simply being made available. Distributing
ownership without a shared self-serve platform underneath it duplicates specialized
infrastructure effort and skill in every domain; the platform principle exists specifically to
remove that cost. Federated computational governance keeps the resulting mesh interoperable
rather than fragmented: domain-local autonomy for most decisions, a small set of global rules
enforced automatically by the platform. All four principles are stated as collectively necessary
and sufficient — adopting some without the others, especially the platform, doesn't produce a
working mesh; it produces every domain paying the missing principle's cost on its own.

</section>

<section data-section="lab">

## Lab

This topic has no lab of its own (`CHAPTER.md`). Every claim traces to a quote from Zhamak
Dehghani's own two originating articles on data mesh (`SOURCES.md`).

</section>

<section data-section="production">

## Production failures this topic warns about

**A company that announced "domain ownership" and handed each team its own pipeline, with no
shared platform behind it.** Every domain now separately re-learns and re-builds the specialized
skill of operating analytical infrastructure — the exact duplicated-effort cost Dehghani names,
paid in full by every domain at once, rather than built once and shared.

**A domain that calls its dataset a "data product" because it's technically reachable by other
teams.** Reachable isn't the same as discoverable, addressable, trustworthy, and
inter-operable — the four qualities are a checklist a dataset either meets or doesn't, not a
label a team can claim for itself.

</section>

<section data-section="frontier">

## Frontier

Dehghani's own writing stops short of prescribing one specific platform technology or one
specific governance tool — the principles are meant to outlive any particular implementation.
Later industry practice (data contracts enforced in CI, semantic/metrics layers, dbt's own
model-level governance) is one concrete way organizations have since tried to build the
self-serve platform and federated governance principles into actual, running tooling. Evaluating
those specific tools is outside this topic's own scope, but they're attempts to answer the same
two principles this topic names, not new principles of their own.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Federated governance assumed each domain team actually honors its own data's contract with the
rest of the mesh. Next: data contracts themselves, the concrete artifact that enforcement
actually happens against.

</section>
