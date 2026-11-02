<section data-section="outcomes">

## Outcomes

This topic stands up a real local REST catalog server and client in this sandbox, implementing a
real subset of the Apache Iceberg REST Catalog OpenAPI spec -- config negotiation, a load, and a
commit with a requirement assertion -- over real HTTP. It names the protocol's larger surface
(multi-table transactions, the views and register endpoints, credential vending and remote
signing, server-side scan planning, SQL UDFs, the deprecated OAuth2 endpoint) from the spec's own
text, without rebuilding all of it.

</section>

<section data-section="deep-dive">

## Deep-dive

The protocol's requirement-and-commit pattern is the same optimistic-commit shape this chapter
built at the single-table level, now standardized as an HTTP contract: a client states the exact
condition it read, and the server -- whichever catalog implementation stands behind it -- checks
that condition against its own real state before applying anything. That's what lets five
different engines, none of which share any code, agree on how to commit against the same table
safely.

</section>

<section data-section="production">

## Production

Config negotiation exists because real deployments don't all agree on defaults: a catalog
operator can redirect every client to the correct warehouse location or client-pool size without
touching a single client's own configuration file. And a 409 that names the exact failed
requirement, rather than a bare conflict, is what lets a client's retry logic reload and resolve
automatically instead of surfacing an opaque error to a human.

</section>

<section data-section="frontier">

## Frontier

Credential vending over this exact protocol is what lets a query engine get real, scoped,
temporary access to a table's underlying storage without ever holding a long-lived cloud
credential of its own -- the mechanism this topic names but can't run in this sandbox.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every mechanism this section needed now exists, built directly or sourced precisely. What's left
is the practical question these topics were really in service of: which table format, and which
catalog, do you actually pick?

</section>
