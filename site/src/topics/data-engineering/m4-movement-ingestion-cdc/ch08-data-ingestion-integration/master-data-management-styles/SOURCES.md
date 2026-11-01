# Sources — de.master-data-management-styles

## Wikipedia: Master data management (the four named styles)

URL: https://en.wikipedia.org/wiki/Master_data_management
Fetched: 2026-11-01.

Quotes:
> There are several models for implementing a technology solution for master data management.

Items: the four named styles (registry, consolidation, coexistence, transaction/centralized)
this topic teaches, read secondary per CHAPTER.md's own "Sources" line, which names Microsoft's
Azure architecture MDM page as the vendor-neutral backup — that page returned HTTP 404 again at
build time (re-checked 2026-11-01), confirming CHAPTER.md's own plan-time finding; no current
vendor-neutral primary architecture reference was found to replace it, disclosed here and in
`REVIEW.md` rather than left unexplained.

## Wikipedia: Master data management (data consolidation, transmission)

URL: https://en.wikipedia.org/wiki/Master_data_management
Fetched: 2026-11-01.

Quotes:
> Data consolidation – The process of capturing master data from multiple sources and integrating it into a single hub (operational data store) for replication to other destination systems.

Items: the consolidation mechanism's own definition, named directly in the reveal step on the
consolidation style.

## Profisee: Master Data Management (MDM) Implementation Styles, Explained

URL: https://profisee.com/blog/master-data-management-implementation-styles/
Fetched: 2026-11-01.

Quotes:
> Source systems continue to manage their own data, while downstream applications rely on master data in the MDM platform for golden records.

> Updates are not pushed back to source systems in a Consolidation style.

> Master data resides in the hub, but source systems retain operational data and handle transactions.

> All transactions and updates occur within the hub, and data is then distributed to operational systems.

Items: who writes and where the master copy lives for each of the four styles — registry,
consolidation, coexistence and centralized — a vendor's own description, used alongside
Wikipedia's named list rather than in place of a neutral primary source, per the disclosed
substitution above.
