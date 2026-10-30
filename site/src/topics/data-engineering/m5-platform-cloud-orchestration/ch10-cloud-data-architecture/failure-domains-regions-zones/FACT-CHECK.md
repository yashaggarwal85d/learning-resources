# FACT-CHECK: Failure domains: regions, zones, cells

Self-review, fact-check and red team, 2026-10-30. Each row re-derives the claim from the fetched source text in `sources/`, checks the quote actually supports it, and tries to break it with an edge case.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Each AWS Region has a minimum of three isolated, physically separate AZs. | Confirmed | `sources/aws-regions-az.txt` line 425, quoted verbatim in `SOURCES.md`. Re-read in context: the sentence is unconditional ("Each AWS Region consists of a minimum of three..."), not a typical-case claim, so stating it as a flat fact is correct. |
| 2 | An AZ is one or more discrete data centers with redundant power, networking and connectivity. | Confirmed | Same source, line 431. |
| 3 | AZs are many kilometers apart but all within 100 km (60 miles) of each other. | Confirmed | Same source, line 431, exact phrase "within 100 km (60 miles) of each other." Red-team check: this is AWS's own stated design bound, not a measured average — the reel's caption says "within," not "typically," so it matches the source's own framing. |
| 4 | Cross-AZ data transfer within one AWS Region is billed at $0.01/GB in each direction, for EC2/RDS/Redshift/DAX/ElastiCache/ENIs. | Confirmed | `sources/aws-ec2-pricing.txt` line 423 area, quoted verbatim. Red-team check: the quote names a specific service list; the reel's caption says "in every major cloud" only for the *existence* of a cross-AZ charge, not this exact number — Azure's and GCP's own cross-AZ rates are **not** sourced in this topic (that would need their pricing pages, out of scope for a 5-minute refresher) so the reel and post-notes are worded to price only the AWS number concretely and name the other two clouds' equivalent charge as existing, not quantified. Corrected in `OUTLINE.md`/`post-notes.md` wording accordingly. |
| 5 | A cell-based architecture isolates faults to one cell's customers rather than the whole system, via independent fixed-size cells, a routing layer and a rebalancer. | Confirmed | `sources/aws-cell.txt`, quoted verbatim ("independent replicas of the system," "fault isolation... with individual users... in different failure domains"). Red-team check: this source is AWS's own prescriptive *Guidance* (a reference architecture to deploy), not a report on an existing AWS service — the reel is worded as "a cell-based design," a pattern, not as a claim that a specific AWS product works this way internally. |
| 6 | Google Cloud resources are zonal, regional, or multi-regional, each with a stated availability trade-off. | Confirmed | `sources/gcp-regions.txt`, quoted verbatim for all three tiers. |
| 7 | Azure availability zones are separated datacenter groups with independent power/cooling/networking; a zone-redundant resource using two or more zones is resilient to a single zone failure. | Confirmed | `sources/azure-az.txt`, quoted verbatim for both parts. |

## Red team on the predict question (step 2)

Edge case tried: could a learner correctly object that an object-storage *request* can still fail if the zone hosting the gateway/edge the request landed on is down, even though the *data* survives? Checked against the AWS and GCP sources: both describe the regional service's data and redundancy, not a guarantee that every possible network path is unaffected by a single zone's failure. Fix: the step's explain text is worded "keeps serving reads" (the object survives and remains readable through the service's other healthy paths), not "nothing about this request chain can ever be affected by this outage," which is the honest, source-supported claim.

## Outcome
No claim dropped. One claim (4) narrowed to the AWS-specific number, with the other two clouds' equivalent charge named but not quantified, since quantifying them was out of scope for the sources fetched for this refresher. Applied to `OUTLINE.md` and carried into `post-notes.md`.
