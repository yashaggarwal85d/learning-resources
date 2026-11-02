<section data-section="outcomes">

## Outcomes

Name the real mechanism underneath "zero-ETL" (log-based CDC, managed) and state what is actually
removed (operated pipeline code) versus what is not (the mechanism itself); reproduce the shape of
a managed zero-ETL integration's cadence and prerequisites (an initial load, then a fixed
incremental window, point-in-time recovery required) against this sandbox's own Postgres; name the
three costs of giving up pipeline control (schema-change timing, filtering limits, vendor billing)
and decide, for a stated freshness requirement, whether a documented zero-ETL cadence can meet it.

</section>

<section data-section="internals">

## Internals

AWS's own Redshift documentation lists the sources this pattern currently supports: "Amazon
Aurora MySQL," "Amazon Aurora PostgreSQL," "Amazon DynamoDB," three RDS engines, and
"Oracle Database@AWS," among others. DynamoDB's own developer guide states its cadence plainly:
"On activation, the integration exports the full DynamoDB table to populate the Amazon Redshift
database... The zero-ETL integration then incrementally replicates updates from DynamoDB to
Amazon Redshift every 15-30 minutes using DynamoDB incremental exports," and requires that "your
source DynamoDB table to have Point-in-time recovery (PITR) enabled." Microsoft's own Fabric
documentation describes the comparable pattern: "Mirroring starts upon creation of your SQL
database in Fabric with no user action required. There are no settings to configure mirroring,"
with mirrored data "stored as delta parquet files in OneLake."

</section>

<section data-section="lab">

## Lab

A real reproduction of the documented cadence against this sandbox's own Postgres, not the
managed service itself. `examples.py` checks a point-in-time-recovery-style prerequisite
(`wal_level = logical`), runs an initial full export into a mirror table, creates a logical
replication slot, and drains it on a fixed cycle to catch up whatever changed since the last
drain — the same shape DynamoDB's own incremental exports use. A fraud-flagged order inserted
between cycles is asserted invisible in the mirror until the next cycle runs, and the topic's
closing arithmetic (a twenty-minute requirement against a documented fifteen-to-thirty-minute
window) is asserted directly: the window's worst case does not meet the requirement.

</section>

<section data-section="production">

## Production failures this topic warns about

**Adopting a "zero-ETL" integration without reading its documented window as a freshness SLA.**
The hook's fraud-detection scenario has no bug anywhere in it — the integration is working exactly
as its own documentation says it would. The failure is adopting it against a requirement the
documented window was never going to meet.

**Assuming a requirement inside a documented range is automatically met by it.** A range states
uncertainty, not a guarantee; what has to be checked against a requirement is the range's own
worst case, not its midpoint or best case.

</section>

<section data-section="frontier">

## Frontier

The three named costs (schema-change timing, filtering limits, vendor billing) come as a package
with giving up pipeline code — a team cannot adopt a managed integration for the operational
relief while selectively keeping control over just one of the three.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

That closes this chapter's look at where the data stack is heading. Everything in it, from a
point-in-time join to a managed zero-ETL feed, is a claim someone has to be able to test, not just
trust. The next chapter is the method for testing claims like that honestly: how to benchmark a
system so the number you report is the number that's actually true.

</section>
