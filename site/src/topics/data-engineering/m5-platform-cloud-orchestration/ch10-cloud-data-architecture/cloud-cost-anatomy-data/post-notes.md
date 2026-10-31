---
id: de.cloud-cost-anatomy-data
title: 'Cloud cost anatomy for data workloads'
---

<section data-section="outcomes">

## Outcomes

- Name the four cost dimensions of a cloud data workload and place any new line item on one of them.
- Diagnose a small-file request-cost storm and fix it.
- Price cross-AZ, cross-region and egress traffic for a given design.
- Produce a worked cost teardown for one job.

</section>

<section data-section="internals">

## Internals

- **A LIST call costs exactly as much as a PUT.** AWS's own pricing page states it directly: "LIST requests for any storage class are charged at the same rate as S3 Standard PUT, COPY, and POST requests." A directory listing isn't free just because it isn't a write.
- **The NAT gateway fee is three charges stacked on one gigabyte.** An hourly fee for the gateway existing, a per-GB processing fee for traffic through it, and whatever ordinary transfer charge already applied to that traffic — all three apply to the same byte at once, by AWS's own worked example.
- **Azure's inter-region rate isn't one number.** Transfer within North America is priced at $0.02/GB; the same operation to or within South America is $0.16/GB — an eight-times spread for moving the same byte the same conceptual distance, by region pair alone.
- **GCP and AWS price the same boundary under different names, and sometimes the same number.** GCP's cross-zone VM-to-VM rate ($0.01/GiB) lands on AWS's cross-AZ rate ($0.01/GB); GCP's Cloud NAT processing fee ($0.045/GiB) happens to match AWS's NAT gateway processing fee ($0.045/GB) too — a coincidence this topic flags rather than treats as a rule, since nothing in either vendor's pricing model requires the two numbers to agree.
- **Correctness and cost are different axes.** This topic's own lab measures it directly: the conditional-write race that loses zero commits makes more real, counted requests than the naive race that loses nineteen of twenty — being safe isn't automatically being cheap, and being cheap isn't automatically being safe.

</section>

<section data-section="production">

## Production

A team ships a pipeline that writes one row per file because it's simpler to reason about than batching writes. Storage looks cheap — the bytes are the same bytes either way. The bill that actually arrives is dominated by requests: a million tiny PUTs to write it, and a LIST that has to page through a million keys every time anything needs to find a file. The fix isn't a smaller instance or a different region; it's writing fewer, larger objects, which is exactly the diagnosis this topic's small-file demonstration walks through with real measured numbers.

</section>

<section data-section="frontier">

## Frontier

This topic's four-dimension model and its worked teardown feed directly into the chapter's own 10.1 lab, which prices a real conditional-write race and a real hot-prefix throttle fix using nothing but the numbers this topic defines.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Those four dimensions are universal, but every cloud sells the services that generate them under a different name. The next section is a map: the same mechanism under three vendors' three different product names.

</section>
