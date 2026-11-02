# Sources — de.redshift-distribution-sort-keys

This topic is entirely sourced-only: this sandbox has no Redshift/AWS account, and Redshift's
shared-nothing architecture (leader/compute nodes, slices, RMS, RA3, Serverless RPUs) has no
local or embeddable equivalent. Every architectural claim below is a word-for-word quote from
Amazon's own current Redshift documentation, disclosed throughout in FACT-CHECK.md,
coverage.json and references.md.

## Data warehouse system architecture

URL: https://docs.aws.amazon.com/redshift/latest/dg/c_high_level_system_architecture.html
Version: fetched 2026-11-02

> A cluster is composed of one or more compute nodes. If a cluster
 is provisioned with two or more compute nodes, an additional leader
 node coordinates the compute nodes and handles external communication.

> The leader node manages communications with client programs and all communication with
 compute nodes. It parses and develops execution plans to carry out database operations

> A compute node is partitioned into slices. Each slice is allocated a portion of the
 node's memory and disk space, where it processes a portion of the workload assigned to
 the node.

> Data warehouse data is stored in a separate storage tier Redshift Managed Storage
 (RMS). RMS provides the ability to scale your storage to petabytes using Amazon S3 storage.

## Distribution styles

URL: https://docs.aws.amazon.com/redshift/latest/dg/c_choosing_dist_sort.html
Version: fetched 2026-11-02

> When you create a table, you can designate one of the following distribution styles:
 AUTO, EVEN, KEY, or ALL.

> With AUTO distribution, Amazon Redshift assigns an optimal distribution style based on the
 size of the table data.

> The leader node distributes the rows across the slices in a round-robin fashion,
 regardless of the values in any particular column.

> The rows are distributed according to the values in one column. The leader node
 places matching values on the same node slice.

> A copy of the entire table is distributed to every node.

## Data distribution for query optimization

URL: https://docs.aws.amazon.com/redshift/latest/dg/t_Distributing_data.html
Version: fetched 2026-11-02

> When you run a
 query, the query optimizer redistributes the rows to the compute nodes as needed to
 perform any joins and aggregations.

> Data redistribution can account for a substantial portion of the cost of a query
 plan, and the network traffic it generates can affect other database operations and
 slow overall system performance.

## Working with sort keys

URL: https://docs.aws.amazon.com/redshift/latest/dg/t_Sorting_data.html
Version: fetched 2026-11-02

> You can specify either a compound or interleaved sort key. A compound sort key is more

> An interleaved sort key gives equal weight

## Choose the best sort key

URL: https://docs.aws.amazon.com/redshift/latest/dg/c_best-practices-sort-key.html
Version: fetched 2026-11-02

> it tracks the minimum and maximum column values stored on each block and
 can skip blocks that don't apply to the predicate range.

## Amazon Redshift provisioned clusters

URL: https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-clusters.html
Version: fetched 2026-11-02

> RG and RA3 nodes with managed storage enable you to optimize your data warehouse
 by scaling and paying for compute and managed storage independently.

> Amazon Redshift managed storage uses large, high-performance SSDs in each RG and RA3 node for fast local
 storage and Amazon S3 for longer-term durable storage.

## Compute capacity for Amazon Redshift Serverless

URL: https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-capacity.html
Version: fetched 2026-11-02

> Amazon Redshift Serverless measures data warehouse capacity in Redshift Processing Units (RPUs).

> One RPU provides 16 GB of memory.

## Implementing automatic WLM

URL: https://docs.aws.amazon.com/redshift/latest/dg/automatic-wlm.html
Version: fetched 2026-11-02

> With automatic workload management (WLM), Amazon Redshift manages query concurrency and memory
 allocation.

> When concurrency scaling is enabled, Amazon Redshift automatically adds additional cluster
 capacity when you need it to process an increase in concurrent read and write queries.

## Automatic table optimization

URL: https://docs.aws.amazon.com/redshift/latest/dg/t_Creating_tables.html
Version: fetched 2026-11-02

> Automatic table optimization is a self-tuning capability that automatically optimizes the
 design of tables by applying sort and distribution keys without the need for administrator
 intervention.

> Automatic table optimization continuously observes how queries interact with tables.

## Amazon Redshift Spectrum

URL: https://docs.aws.amazon.com/redshift/latest/dg/c-using-spectrum.html
Version: fetched 2026-11-02

> Using Amazon Redshift Spectrum, you can efficiently query and retrieve structured and semi-structured
 data from files in Amazon S3 without having to load the data into Amazon Redshift tables.

### Red team

This topic is disclosed as sourced-only throughout, the same pattern as topics 37 and 38: this
sandbox has no Redshift or AWS account, so no claim here is independently executed or measured.
The "zone map" term itself does not appear verbatim on Redshift's current sort-key documentation
pages (confirmed via grep across every fetched page); the mechanism it names -- per-block
minimum/maximum tracking used to skip blocks -- is instead quoted directly from the "Choose the
best sort key" page, and the reveal avoids presenting "zone map" as a quoted phrase, describing
the mechanism in the reel's own words instead. No `examples.py` exists, so (as on topics 37 and
38) every number in reel.tsx is spelled out as words, nothing backs a digit.

### Scope boundary

In scope and sourced directly from Amazon's own current Redshift documentation: leader/compute
node and slice architecture, Redshift Managed Storage, the four distribution styles and the real
redistribution cost a join imposes, compound vs. interleaved sort keys and the block-skipping
mechanism they enable, RA3 managed storage, Serverless RPUs, automatic WLM and concurrency
scaling, Spectrum's ability to query S3 directly, and automatic table optimization.

Not independently demonstrated, by design: every claim in this topic, since no Redshift/AWS
account exists in this sandbox. The parallel to topic 37's micro-partition pruning and topic 38's
partitioning/clustering is drawn conceptually in the reveal and recap, not run side by side.
