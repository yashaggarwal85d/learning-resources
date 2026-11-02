<section data-section="outcomes">

## Outcomes

This topic states the four real things a table catalog does -- namespace management, a
current-metadata pointer moved by compare-and-swap, access control, and credential issuance --
and builds a real minimal catalog in this sandbox performing all four against a local filesystem.
It names the legacy options (Hive Metastore, AWS Glue Data Catalog, a JDBC catalog) and their real,
sourced limits for a multi-engine, multi-cloud estate.

</section>

<section data-section="deep-dive">

## Deep-dive

A catalog's compare-and-swap is the same shape every earlier commit protocol in this chapter has
used: a conditional write that only one caller can win. What changes
at the catalog layer is scope -- instead of one table's own commit log, a catalog's pointer move
decides which table a whole fleet of engines agree is current, which is why Iceberg's own spec
describes it as the basis for serializable isolation across readers, not just across writers of
one table.

</section>

<section data-section="production">

## Production

Access control enforced before a write is attempted, not merely rejected after, matters
operationally: it means an unauthorized caller can't even probe whether a table exists or what its
current state is by attempting a write and reading the failure. Credential vending matters for a
different reason -- without it, every engine needs its own long-lived, broadly scoped credentials
to touch storage directly, which is both a security liability and an operational one (rotating one
shared credential across every engine that touches a lakehouse).

</section>

<section data-section="frontier">

## Frontier

The Iceberg REST catalog protocol's own "vended credentials" endpoint formalizes exactly the
credential-issuance job this topic built by hand, as a real HTTP API any engine can call -- that
protocol is this chapter's next topic.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A minimal catalog proves the idea works. A real, vendor-neutral protocol for it -- one that lets
five different engines agree on how to talk to any catalog at all -- is next: the Iceberg REST
catalog.

</section>
