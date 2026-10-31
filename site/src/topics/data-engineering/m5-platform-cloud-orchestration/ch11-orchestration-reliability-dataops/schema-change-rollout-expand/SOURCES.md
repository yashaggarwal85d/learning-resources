# Sources

## Schema Evolution and Compatibility (Confluent Platform Documentation)

URL: https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html
Version: Confluent Platform, current (fetched 2026-10-31)

> BACKWARD compatibility means that consumers using the new schema can read data produced with the last schema.

> FORWARD compatibility means that data produced with a new schema can be read by consumers using the last schema, even though they may not be able to use the full capabilities of the new schema.

> FULL compatibility means schemas are both backward and forward compatible.

> The Confluent Schema Registry default compatibility type is BACKWARD, not BACKWARD_TRANSITIVE.

## Parallel Change (Martin Fowler's bliki)

URL: https://martinfowler.com/bliki/ParallelChange.html
Version: martinfowler.com (fetched 2026-10-31)

> Parallel change, also known as expand and contract, is a pattern to implement backward-incompatible changes to an interface in a safe manner, by breaking the change into three distinct phases: expand, migrate, and contract.

> In the expand phase you augment the interface to support both the old and the new versions.

> During the migrate phase you update all clients using the old version to the new version.

> Once all usages have been migrated to the new version, you perform the contract phase to remove the old version and change the interface so that it only supports the new version.

## Database migration: Concepts and principles (Part 1) (Google Cloud Architecture Center)

URL: https://cloud.google.com/architecture/database-migration-concepts-principles-part-1
Version: Google Cloud Architecture Center (fetched 2026-10-31)

> To have the source and target database receive the same changes, a common approach is to have clients write to both the source and target databases instead of using a data migration system. This approach has several pitfalls. One pitfall is that two database writes are two separate transactions; you might encounter a failure after the first finishes and before the second finishes.
