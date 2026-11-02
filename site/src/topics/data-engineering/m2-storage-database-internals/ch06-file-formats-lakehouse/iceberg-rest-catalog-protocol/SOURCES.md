## Apache Iceberg, REST Catalog OpenAPI Specification

URL: https://raw.githubusercontent.com/apache/iceberg/main/open-api/rest-catalog-open-api.yaml
Version: fetched 2026-11-02

> All REST clients should first call this route to get catalog configuration properties from the server to configure the catalog and its HTTP client.

> defaults - properties that should be used as default configuration; applied before client configuration

> overrides - properties that should be used to override client configuration; applied after defaults and client configuration

> Requirements are assertions that will be validated before attempting to make and commit changes.

> Commit updates to multiple tables in an atomic operation

> Register a table using given metadata file location.

> Return all view identifiers under this namespace

> Optional signal to the server that the client supports delegated access via a comma-separated list of access mechanisms. The server may choose to supply access via any or none of the requested mechanisms.

> The value `none` signals that the client is able to operate without any access delegation mechanism.

> Clients must first check whether the respective credentials exist in the `storage-credentials` field before checking the `config` for credentials.

> Clients MUST use server-side scan planning via the `planTableScan` endpoint

> Portable UDF metadata format.

> The `oauth/tokens` endpoint is **DEPRECATED for REMOVAL**. It is _not_ recommended to

## Apache Iceberg, Releases

URL: https://iceberg.apache.org/releases/
Version: fetched 2026-11-02

> Apache Iceberg 1.11.0 was released on May 19, 2026.

> REST Scan Planning Task Implementation (#13400)

### Red team

- No deltalake/delta-rs/iceberg-python/pyiceberg library is used -- this topic hand-builds a real
  local HTTP server implementing a real subset of the REST catalog OpenAPI spec (config
  negotiation, load, and commit-with-requirements), and a real HTTP client against it, matching
  this chapter's established from-scratch convention and directly demonstrating "the OpenAPI spec
  as the interop standard" rather than naming it only.
- The server implements only three of the spec's many endpoints (config, load table, commit
  table). Multi-table transactions, the views and register endpoints, credential vending and
  remote signing, server-side scan planning, SQL UDFs, and the OAuth2 token endpoint are all named
  and sourced from the spec's own text, not built -- credential vending specifically because
  issuing real down-scoped cloud credentials is outside what this sandbox can run (the same scope
  boundary CHAPTER.md's own outcomes line states).
- The commit demo's requirement type (`assert-current-snapshot-id`) is a real requirement type
  named in the spec's own commit schema, checked for real against the server's own in-memory
  state -- not a fabricated requirement invented for the demo.
- The "DEPRECATED for REMOVAL" quote is truncated mid-sentence (the full sentence continues past
  "It is not recommended to" with security caveats and a reference to when the removal takes
  effect) -- it is still a genuine, contiguous, word-for-word span of the source text, including
  its own literal `**` emphasis markers around "DEPRECATED for REMOVAL".
