# FACT-CHECK — de.catalogs-as-commit-coordinators

## Claims

| # | Claim | Source | Verified |
|---|---|---|---|
| 1 | An atomic swap of one table metadata file for another provides the basis for serializable isolation | Iceberg Table Spec | Yes, quoted verbatim |
| 2 | The atomic swap can be implemented as a pointer in a metastore/database updated with a check-and-put (compare-and-swap) operation | Iceberg Table Spec | Yes, quoted verbatim |
| 3 | The Iceberg REST catalog protocol has a real endpoint to load vended credentials for a table from the catalog | Iceberg REST Catalog API | Yes, quoted verbatim |
| 4 | Catalog configuration may contain credentials used for subsequent requests for a table | Iceberg REST Catalog API | Yes, quoted verbatim |
| 5 | The REST catalog protocol defines namespaces as references to one or more levels | Iceberg REST Catalog API | Yes, quoted verbatim |
| 6 | Hive Metastore's thrift interface defines real privilege-grant operations (GrantRevokePrivilegeRequest) -- it is not devoid of access control | Hive Metastore thrift interface | Yes, quoted verbatim |
| 7 | Hive Metastore's own delegation tokens authenticate a caller to the metastore server itself, not to cloud storage | Hive Metastore thrift interface's own comment | Yes, quoted verbatim |
| 8 | AWS Lake Formation, a separate bolted-on service, is what provides fine-grained access control for Glue Data Catalog's S3 data and metadata | AWS Lake Formation docs | Yes, quoted verbatim |
| 9 | Lake Formation's own cross-account capability is what simplifies securing distributed data lakes across multiple AWS accounts | AWS Lake Formation docs | Yes, quoted verbatim |
| 10 | A real minimal catalog in this sandbox performs namespace management, CAS pointer moves, access control, and scoped credential issuance | This script, run and asserted | Yes, executed |

## Red team

- **Correction to a naive reading of the syllabus:** Hive Metastore's thrift API is not access-control-free.
  It defines real SQL-standard-style privilege grants. What it genuinely lacks, per its own thrift
  file's comments, is *credential vending* -- issuing temporary cloud-storage credentials (like AWS
  STS tokens) for a client to read/write data files directly. Its own delegation tokens authenticate
  only to the metastore server itself. This topic states that precise distinction instead of
  claiming Hive Metastore lacks access control altogether.
- AWS Glue Data Catalog's single-region limit is narrated, not independently confirmed by a primary
  source quoted in this topic -- only Lake Formation's cross-account capability (which implies a gap
  it fills) is directly sourced.
- The Iceberg REST catalog's "vended credentials" endpoint belongs to the REST catalog protocol,
  which is this chapter's next topic (32) -- cited here only to establish that credential issuance
  is a real, specified catalog responsibility, not to claim this topic builds the REST protocol.
- No deltalake/delta-rs/iceberg-python library is used; the catalog is built entirely from this
  script's own code, a local-disk stand-in for a metastore's row storage, reusing the exact
  put-if-absent CAS primitive this chapter has used since topic 13.
- The credential issued by this script is a real, scoped data structure (principal, storage
  prefix, TTL), not a real AWS STS call -- the mechanism is real, the cloud integration is not.

## Scope boundary

This topic builds a real, minimal catalog performing all four of a catalog's real jobs (namespace,
CAS pointer, access control, credential issuance) against a local filesystem, and names the three
legacy options' real, sourced limits. It does not reproduce a thrift server, Glue's actual API, a
JDBC catalog server, or AWS's own credential-vending machinery (STS) -- those are named and sourced,
not rebuilt.
