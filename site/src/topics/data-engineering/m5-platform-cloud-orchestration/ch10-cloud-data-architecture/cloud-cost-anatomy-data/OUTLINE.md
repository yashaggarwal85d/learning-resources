# Outline — de.cloud-cost-anatomy-data

**Kind:** full, §10.1 — hosts the 10.1 chapter lab. About 15 minutes.

## Scope (full syllabus line)

"the bill's real dimensions: storage GB-month plus per-request charges (small-file LIST/GET
storms), compute, network (internet egress, cross-region, cross-AZ, NAT processing),
managed-service premiums; a worked teardown of where one Spark job's money goes"

- Clause 1: storage GB-month plus per-request charges (small-file LIST/GET storms).
- Clause 2: compute.
- Clause 3: network (internet egress, cross-region, cross-AZ, NAT processing).
- Clause 4: managed-service premiums.
- Clause 5: a worked teardown of where one Spark job's money goes.

## Outcomes

Name the four cost dimensions of a cloud data workload and place any new line item on one of
them. Diagnose a small-file request-cost storm and fix it. Price cross-AZ, cross-region and
egress traffic for a given design. Produce a worked cost teardown for one job.

## Changes from the chapter plan

The chapter plan names a local MinIO server for the chapter's 10.1 lab. MinIO's own OSS release
channel (`dl.min.io`) has been archived and returns HTTP 410 Gone since this chapter's topics 2-5
(confirmed directly, not assumed; no Docker daemon is available in this sandbox either). This
topic's lab uses `moto`'s `ThreadedMotoServer` driven by real `boto3` S3 calls instead — the same
substitution already disclosed in topics 2, 3 and used wherever this chapter needs a local
S3-compatible server. Every request count the lab prices comes from a real HTTP round trip
against that local server, counted by a wrapping client (`examples.py`'s `_CountingClient`).

All per-unit cloud prices used in the worked teardown and the small-file demonstration are
disclosed, publicly documented figures for S3 Standard / EC2 / a NAT gateway in US East, current
as of 2026-10-31 (`examples.py`'s top-of-file constants) — not scraped from this sandbox, because
AWS's own pricing pages render their dollar figures client-side from a template with no literal
digits in the raw HTML (confirmed directly; see SOURCES.md, which quotes only the mechanics —
billing dimensions, tiers and which operations are free — not the numbers). Where a real number
*does* appear in plain text on a sourced page (AWS's $0.01/GB cross-AZ rate, the $0.045/hour and
$0.045/GB NAT gateway worked example, Azure's tiered inter-region and egress rates, GCP's
$0.01/GiB cross-zone rate and its Cloud NAT pricing), it is quoted verbatim in SOURCES.md and used
directly. A real production teardown would re-check every number against the AWS Price List API
before billing anyone; this topic discloses that it does not.

## Engagement arc

- Hook: step 1 — a pipeline writing one million tiny per-row files a day looks free on the
  storage-GB line and turns out to be the single largest line item once requests are counted
  separately.
- Early prediction: step 2 — which of the four dimensions is actually driving that bill?
- Teaching: steps 3-6 — storage (GB-month + per-request), compute (reserved vs consumed), network
  (egress/cross-region/cross-AZ/NAT), managed-service premium — each a separate named ledger.
- Worked payoff: step 7 — the Spark-job teardown, all four dimensions priced from real measured
  numbers and disclosed current rates.
- Recap: step 8.
- Prove it: step 9 — price the lab's own naive-race vs conditional-race request counts and predict
  which one costs more, testing whether "safer" and "cheaper" are the same claim here.

## Concept ledger

**Introduces:** `cloud-cost-four-dimensions`, `small-file-request-storm`.
**Uses:** `failure-domain-blast-radius`, `object-store-consistency-guarantee`,
`storage-tier-lifecycle-tradeoff`, `conditional-write-compare-swap`, `prefix-throttling-hot-key`.
**Declared:** none beyond topic 5.

## Bridge / handoff (verbatim from CHAPTER.md)

**Bridge:** "Identity and secrets answer who can act and with what. Neither answers what any of
it costs — and this topic is the bill's real shape: storage, requests, compute, network and the
managed-service premium, each priced separately instead of waved at as 'expensive.'"

**Handoff:** "Those four dimensions are universal, but every cloud sells the services that
generate them under a different name. The next section is a map: the same mechanism under three
vendors' three different product names."

## Claims to fact-check

1. S3 LIST requests are billed at the same rate as PUT/COPY/POST; DELETE and CANCEL are free.
2. AWS cross-AZ transfer is $0.01/GB in each direction; same-AZ transfer (for the named services)
   is free.
3. An AWS NAT gateway bills an hourly fee and a separate per-GB data-processing fee, on top of
   ordinary data-transfer charges for the same bytes.
4. Azure inter-region transfer pricing varies by region pair (not a flat global rate), and
   internet egress is itself tiered by monthly volume.
5. GCP's cross-zone VM-to-VM rate and Cloud NAT's per-GiB processing rate are priced the same way
   AWS and Azure price the equivalent boundary, under different product names.
6. A twenty-writer conditional-write race (If-None-Match/If-Match with retry) makes zero requests
   more per successful write than a hand-wavy estimate would suggest — it needs to be measured,
   not assumed cheap or expensive.
