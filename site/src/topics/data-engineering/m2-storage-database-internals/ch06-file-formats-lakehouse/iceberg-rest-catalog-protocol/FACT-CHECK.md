# FACT-CHECK — de.iceberg-rest-catalog-protocol

## Claims

| # | Claim | Source | Verified |
|---|---|---|---|
| 1 | GET /v1/config is the first call a REST client makes, returning config the client must apply | REST Catalog OpenAPI Spec | Yes, quoted verbatim |
| 2 | Config merge order: defaults applied first, then client config, then server overrides last | REST Catalog OpenAPI Spec | Yes, quoted verbatim |
| 3 | A commit's requirements are assertions validated before the commit's updates are applied | REST Catalog OpenAPI Spec | Yes, quoted verbatim |
| 4 | The commitTransaction endpoint commits updates to multiple tables in one atomic operation | REST Catalog OpenAPI Spec | Yes, quoted verbatim |
| 5 | The register endpoint registers a table using a given metadata file location | REST Catalog OpenAPI Spec | Yes, quoted verbatim |
| 6 | The views endpoint returns view identifiers under a namespace | REST Catalog OpenAPI Spec | Yes, quoted verbatim |
| 7 | X-Iceberg-Access-Delegation signals which delegated-access mechanisms a client supports; the server may supply any or none | REST Catalog OpenAPI Spec | Yes, quoted verbatim |
| 8 | A client can signal it needs no access delegation mechanism at all via the value `none` | REST Catalog OpenAPI Spec | Yes, quoted verbatim |
| 9 | Clients must check storage-credentials before falling back to config for vended credentials | REST Catalog OpenAPI Spec | Yes, quoted verbatim |
| 10 | Server-side scan planning: clients MUST use the planTableScan endpoint when the server mode requires it | REST Catalog OpenAPI Spec | Yes, quoted verbatim |
| 11 | Server-side scan planning shipped as a real feature in Iceberg 1.11.0 (released May 19, 2026) | Apache Iceberg Releases page | Yes, quoted verbatim |
| 12 | SQL UDFs have a portable metadata format as part of the protocol | REST Catalog OpenAPI Spec | Yes, quoted verbatim |
| 13 | The oauth/tokens endpoint is marked deprecated for removal in the spec itself, discouraged from implementation | REST Catalog OpenAPI Spec | Yes, quoted verbatim |
| 14 | A real local REST catalog server performs config negotiation, a load, and a commit with a requirement assertion over real HTTP | This script, run and asserted | Yes, executed |

## Red team

- This script implements only three endpoints (config, load table, commit table) of the REST
  catalog spec's much larger surface. Every other feature in the syllabus clause -- multi-table
  transactions, views, register, credential vending, remote signing, server-side scan planning,
  SQL UDFs, OAuth2 deprecation -- is named and sourced from the spec's own text, not built.
- Credential vending and remote signing are deliberately out of scope for the code: issuing real,
  down-scoped cloud credentials needs a real cloud provider's STS-equivalent service, which this
  sandbox cannot run. CHAPTER.md's own outcomes line states this boundary explicitly.
- The commit demo's `assert-current-snapshot-id` requirement is a real requirement type the spec
  itself names (in the same sentence as `assert-ref-snapshot-id`); this script implements the
  check for that one requirement type, not the full set the spec defines.
- No deltalake/delta-rs/iceberg-python/pyiceberg library is used -- the server and client are both
  this script's own code (Python's stdlib `http.server` and `http.client`), a real, independent
  HTTP implementation of a real subset of the spec, not a wrapper around an existing library.
- The config-negotiation demo's "warehouse" override and the commit demo's snapshot IDs are this
  script's own invented values, not literal values from the spec (the spec defines the protocol
  shape, not specific property values a server must return).

## Scope boundary

This topic hand-builds a real local HTTP server implementing a real subset of the REST catalog
OpenAPI spec (config negotiation, load, commit-with-requirements) and a real HTTP client against
it, and names the rest of the protocol's surface (multi-table transactions, views, register,
credential vending, remote signing, server-side scan planning, SQL UDFs, the deprecated OAuth2
endpoint) with sourced quotes from the spec and Iceberg's own release notes. It does not stand up
a full reference REST catalog server (Polaris/Lakekeeper), issue real cloud credentials, or
implement the spec's full endpoint surface.
