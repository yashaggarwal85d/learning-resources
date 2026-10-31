---
id: de.unity-catalog-governance-model
title: 'Unity Catalog governance model'
---

<section data-section="outcomes">

## Outcomes

- Explain why Unity Catalog's namespace needs a third level, and name all four securable types.
- State the difference between a privilege grant's inheritance and a tag-based ABAC policy's own matching rule.
- Identify column-level lineage and the audit log as queryable system tables, not a separate UI.
- Decide what Lakehouse Federation and Delta Sharing each let a query reach, and on what terms.

</section>

<section data-section="internals">

## Internals

- **The third namespace level isn't ceremony — it's what lets one metastore hold more than one environment.** A two-level `schema.object` namespace has exactly one namespace per account; `catalog.schema.object` lets `prod` and `staging` share a metastore without a single table name colliding.
- **Privilege inheritance and tag-based ABAC solve "cover the next object" differently.** Inheritance walks up a fixed tree from the object to an ancestor that holds the grant. ABAC never looks at the tree — it checks whether the object itself carries a tag, which means a policy covers an object anywhere in the namespace the moment that object is tagged, not only its descendants.
- **A tag has to actually reach the object before an ABAC policy applies to it.** `examples.py`'s own simulation shows this directly: a brand-new table under a tagged schema is *not* automatically governed until the tag itself is inherited onto it — the policy checks the tag, not the parent.
- **Lineage and the audit log are ordinary system tables, which is itself the design decision worth noticing.** Making them queryable like any other table, rather than data locked inside a dashboard, is what lets a learner (or a real operator) join lineage against the audit log instead of reconciling two separate tools by hand.
- **Federation and Delta Sharing solve different problems that look superficially similar.** Federation reaches into another system live, for your own users, governed as if the foreign catalog were native. Delta Sharing hands your own tables to someone outside your account entirely, authenticated by nothing but a bearer token.

</section>

<section data-section="production">

## Production

A platform team tags every table containing customer PII with `pii-restricted` the day they stand up the schema, confident the ABAC policy covers anything built on top of it forever after. Eighteen months later, an analyst clones a PII table into a new schema for a one-off report — the clone doesn't inherit the tag, because `CREATE TABLE ... AS SELECT` across schemas copies data, not tags, and the policy that was supposed to be unforgettable never touches the copy at all.

</section>

<section data-section="frontier">

## Frontier

Lakehouse Federation's supported source systems and Delta Sharing's supported access modes both keep expanding past what this topic's sources captured as of research time — Databricks' own documentation marks several connectors and sharing modes as newer additions. The governance mechanisms this topic teaches (three-level namespace, inheritance, tag-driven ABAC, lineage/audit as system tables, the bearer-token sharing protocol) are the stable layer underneath that continues to apply as the supported-systems list grows.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Databricks is one lakehouse platform among several a learner will actually have to choose between, on real criteria: who owns the storage, how open the format really is, and what the exit cost looks like — which closes this section.

</section>
