## Apache Iceberg, Table Spec

URL: https://iceberg.apache.org/spec/
Version: fetched 2026-11-02

> An atomic swap of one table metadata file for another provides the basis for serializable isolation.

> The atomic swap needed to commit new versions of table metadata can be implemented by storing a pointer in a metastore or database that is updated with a check-and-put operation

## Apache Iceberg, REST Catalog API

URL: https://raw.githubusercontent.com/apache/iceberg/main/open-api/rest-catalog-open-api.yaml
Version: fetched 2026-11-02

> Load vended credentials for a table from the catalog.

> The catalog configuration may contain credentials that should be used for subsequent requests for the

> Reference to one or more levels of a namespace

## Apache Hive, Hive Metastore thrift interface

URL: https://raw.githubusercontent.com/apache/hive/master/standalone-metastore/metastore-common/src/main/thrift/hive_metastore.thrift
Version: fetched 2026-11-02

> struct GrantRevokePrivilegeRequest {

> get metastore server delegation token for use from the map/reduce tasks to authenticate

## AWS, What is AWS Lake Formation?

URL: https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation.html
Version: fetched 2026-11-02

> With Lake Formation, you can manage fine-grained access control for your data lake data on Amazon Simple Storage Service (Amazon S3) and its metadata in AWS Glue Data Catalog.

> Lake Formation permission management capabilities simplify securing and managing distributed data lakes across multiple AWS accounts through a centralized approach, providing fine-grained access control to the Data Catalog and Amazon S3 locations.

### Red team

- No deltalake/delta-rs/iceberg-python library is used -- the catalog's pointer, namespace table,
  ACL and credential issuance are all built and run by this script's own code, a local-disk stand-in
  for a metastore row, matching this chapter's established from-scratch convention.
- Hive Metastore's own thrift interface is NOT devoid of access control, correcting what a casual
  read of the syllabus line might imply: it defines real privilege-grant operations
  (`GrantRevokePrivilegeRequest`). What it genuinely lacks is *credential vending* for direct
  cloud-storage access: its own delegation-token methods authenticate a caller to the metastore
  server itself, not to S3 or another object store, per the thrift file's own comment. This topic
  states that distinction precisely rather than claiming Hive Metastore has no access control at
  all.
- AWS Glue Data Catalog's own single-region limit is not independently confirmed by a primary
  source in this topic -- only Lake Formation's cross-account capability (implying a gap it fills)
  is sourced. The single-region claim is narrated as a commonly cited operational limit, not
  asserted as directly documented.
- The REST catalog's "vended credentials" endpoint is part of the Iceberg REST catalog protocol
  (this chapter's next topic, 32) -- cited here only to establish that credential issuance is a
  real, specified catalog responsibility, not to claim this topic builds the REST protocol itself.
- The script's CAS, access-control and credential-issuance demos are real, executed code against a
  real local filesystem; the legacy options' limits (Hive Metastore, Glue Data Catalog, JDBC
  catalog) are named and sourced, not rebuilt, since reproducing a thrift server, a Glue API, or a
  JDBC catalog server is out of scope for a 15-minute topic already building a different real
  catalog.
