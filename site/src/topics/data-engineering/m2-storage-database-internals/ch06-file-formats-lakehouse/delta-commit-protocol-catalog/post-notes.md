<section data-section="outcomes">

## Outcomes

Reproduce a real put-if-absent commit of the next Delta log version, reusing the exact
conditional-write primitive topic 10 built, and explain why S3 historically needed an external
DynamoDB coordinator before conditional writes existed. Contrast Delta's WriteSerializable default
isolation with full Serializable on a real example, including the case where they actually
disagree. Trace catalog-managed tables from the 4.0 preview through 4.2-4.3 routing commits and
then all table operations through the catalog, and state why that's the groundwork for
multi-table transactions.

</section>

<section data-section="deep-dive">

## Deep-dive

Filesystem-based access to catalog-managed tables is not supported by design, not by accident: the
spec is explicit that Delta clients are expected to discover and access such tables through the
managing catalog, not by listing the filesystem directly. That's the same shift as the put-if-absent
commit itself, one level up — a single atomic file write already settles "did this commit happen"
without any external service; a catalog-managed table settles the bigger question "is this table's
current state what the catalog says it is" the same way, just with the catalog as the one party
everyone has to ask.

</section>

<section data-section="production">

## Production

WriteSerializable is the default for a reason stated directly in Databricks' own documentation: it
gives "a good balance of data consistency and availability for most common operations." Changing a
table to Serializable is a real trade — stronger guarantees, but appends that never conflict under
WriteSerializable can now conflict under Serializable, so throughput for concurrent writers drops.
The right call depends on whether a downstream process ever reconstructs table contents by
replaying commit history in physical order; if it does, WriteSerializable's "logical order can
differ from physical order" behavior is the wrong default for that table.

</section>

<section data-section="frontier">

## Frontier

Not built here, named only: a real Unity Catalog, a real DynamoDB Commit Coordinator, and any real
multi-table transaction. Also disclosed directly: no `deltalake`/`delta-rs` library is used
anywhere in this topic's script — the put-if-absent commit and the isolation-level demo are both
built from a real local S3 server and raw `boto3` calls, the same from-scratch convention every
topic in this chapter has followed since topic 10.

</section>

<section data-section="next">

## Where this goes next

A commit protocol only matters because of the operations that produce commits in the first place.
The next topic is Delta's own DML: MERGE, UPDATE and DELETE.

</section>
