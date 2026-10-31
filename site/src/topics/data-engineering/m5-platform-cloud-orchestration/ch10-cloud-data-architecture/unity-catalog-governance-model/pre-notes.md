# Pre-notes: Unity Catalog governance model

- **Metastore.** The top-level Unity Catalog container registered per Databricks region; every catalog in an account is registered to exactly one metastore.
- **Securable.** Any object Unity Catalog can grant privileges on directly — a catalog, schema, table, view, volume, function, or model, each addressed by its place in the `catalog.schema.object` namespace.
- **Volume.** A securable governing access to non-tabular files (not rows and columns) inside a schema, permissioned the same way a table is.
- **ABAC (attribute-based access control).** A policy matched by an object's tag rather than by its name, so it applies automatically to any object carrying that tag — including one created after the policy was written.
- **Column-level lineage.** Tracking that records which output column was derived from which input columns, captured automatically and aggregated across every workspace on the metastore.
- **Delta Sharing.** An open protocol for giving a recipient read access to a table without that recipient needing an account on the sharer's platform — authenticated by a bearer token, with data delivered via pre-signed file URLs or temporary cloud credentials.
