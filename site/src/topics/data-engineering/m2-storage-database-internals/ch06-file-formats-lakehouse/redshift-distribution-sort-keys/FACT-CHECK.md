# Fact-check — de.redshift-distribution-sort-keys

| # | Claim | Checked against |
|---|---|---|
| 1 | A cluster is composed of one or more compute nodes; with two or more, a leader node coordinates them and handles external communication | Yes, quoted verbatim, Redshift docs "Data warehouse system architecture" |
| 2 | The leader node manages client communications, parses queries, and develops execution plans | Yes, quoted verbatim, same source |
| 3 | A compute node is partitioned into slices, each allocated a portion of the node's memory and disk space | Yes, quoted verbatim, same source |
| 4 | Data is stored in a separate tier, Redshift Managed Storage (RMS), scaling to petabytes using Amazon S3 | Yes, quoted verbatim, same source |
| 5 | A table can designate one of four distribution styles: AUTO, EVEN, KEY, or ALL | Yes, quoted verbatim, Redshift docs "Distribution styles" |
| 6 | AUTO distribution assigns an optimal style based on table data size | Yes, quoted verbatim, same source |
| 7 | EVEN distribution places rows across slices round-robin, regardless of column values | Yes, quoted verbatim, same source |
| 8 | KEY distribution places matching values on the same node slice, based on one column | Yes, quoted verbatim, same source |
| 9 | ALL distribution copies the entire table to every node | Yes, quoted verbatim, same source |
| 10 | The query optimizer redistributes rows to compute nodes as needed to perform joins and aggregations | Yes, quoted verbatim, Redshift docs "Data distribution for query optimization" |
| 11 | Data redistribution can account for a substantial portion of a query plan's cost, and its network traffic can slow overall system performance | Yes, quoted verbatim, same source |
| 12 | A table can specify a compound or interleaved sort key; a compound key is more selective, an interleaved key gives equal weight to each column | Yes, quoted verbatim, Redshift docs "Working with sort keys" |
| 13 | Redshift tracks the minimum and maximum column values stored on each block and can skip blocks that don't apply to the predicate range | Yes, quoted verbatim, Redshift docs "Choose the best sort key" |
| 14 | RA3 (and RG) nodes with managed storage let you scale and pay for compute and storage independently | Yes, quoted verbatim, Redshift docs "Amazon Redshift provisioned clusters" |
| 15 | Managed storage uses high-performance SSDs for fast local storage and Amazon S3 for longer-term durable storage | Yes, quoted verbatim, same source |
| 16 | Redshift Serverless measures capacity in Redshift Processing Units (RPUs) | Yes, quoted verbatim, Redshift docs "Compute capacity for Amazon Redshift Serverless" |
| 17 | One RPU provides 16 GB of memory | Yes, quoted verbatim, same source |
| 18 | With automatic WLM, Redshift manages query concurrency and memory allocation | Yes, quoted verbatim, Redshift docs "Implementing automatic WLM" |
| 19 | With concurrency scaling enabled, Redshift automatically adds additional cluster capacity to process an increase in concurrent queries | Yes, quoted verbatim, same source |
| 20 | Automatic table optimization is a self-tuning capability that optimizes table design by applying sort and distribution keys without administrator intervention | Yes, quoted verbatim, Redshift docs "Automatic table optimization" |
| 21 | Automatic table optimization continuously observes how queries interact with tables | Yes, quoted verbatim, same source |
| 22 | Redshift Spectrum lets you query and retrieve data from files in S3 without loading it into Redshift tables | Yes, quoted verbatim, Redshift docs "Amazon Redshift Spectrum" |
| 23 | Spectrum queries employ massive parallelism and multiple clusters can concurrently query the same S3 dataset without copies | Yes, quoted verbatim, same source |

### Red team

This topic is disclosed as sourced-only throughout, the same pattern as topics 37 and 38: this
sandbox has no Redshift or AWS account, so no claim here is independently executed or measured.
The term "zone map" itself does not appear on Redshift's current sort-key documentation pages
(confirmed via grep); the mechanism it names is instead quoted from the "Choose the best sort
key" page's own min/max block-skipping description, and the reel avoids presenting "zone map" as
a quoted phrase. `reel.tsx` spells every number as words, since no `examples.py` exists to back a
raw digit on screen.

### Scope boundary

In scope and sourced directly from Amazon's own current Redshift documentation: leader/compute
node and slice architecture, Redshift Managed Storage, the four distribution styles and the real
redistribution cost a join imposes, compound vs. interleaved sort keys and the block-skipping
mechanism, RA3 managed storage, Serverless RPUs, automatic WLM and concurrency scaling, Spectrum's
ability to query S3 directly, and automatic table optimization.

Not independently demonstrated, by design: every claim in this topic, since no Redshift/AWS
account exists in this sandbox (unlike the §6.4 engine topics, each of which ran a real local
engine). The parallel to topic 37's micro-partition pruning and topic 38's partitioning/clustering
is drawn conceptually in the reveal and recap, not run side by side against a live comparison.
