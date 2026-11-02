- **Region**: an isolated geographic deployment of a cloud provider's infrastructure. *Where you
  meet it:* the hook and the placement reveal.
- **Data residency**: a legal or policy requirement that certain data stay within a specific
  geographic boundary. *Where you meet it:* the placement reveal.
- **Replication**: continuously copying data from one region to another ahead of any query.
  *Where you meet it:* the priced reveal and the aggregates-only compromise.
- **Federation**: sending a query to each region and merging the partial results, with no data
  moved ahead of time. *Where you meet it:* the priced reveal.
- **Egress**: data leaving a region or provider, billed per gigabyte. *Where you meet it:* the
  priced reveal.
- **Failover**: switching operation to a surviving region after the primary region is lost.
  *Where you meet it:* the failover-gaps reveal.
- **Catalog**: the metadata service that tracks which table files exist and where. *Where you
  meet it:* the hook and the failover-gaps reveal.
- **RPO**: recovery point objective — how much data loss a failure may cause, stated as a time
  window. *Where you meet it:* the RPO/RTO reveal.
- **RTO**: recovery time objective — how long recovery may take before service must be
  restored. *Where you meet it:* the RPO/RTO reveal.
