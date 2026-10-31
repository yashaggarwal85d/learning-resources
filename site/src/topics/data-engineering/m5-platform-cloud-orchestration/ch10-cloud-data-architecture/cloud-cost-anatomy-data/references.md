---
id: de.cloud-cost-anatomy-data
title: 'Cloud cost anatomy for data workloads'
---

Last verified: 2026-10-31
Expert sign-off: pending

- AWS, "S3 Pricing" — https://aws.amazon.com/s3/pricing/
- AWS, "Amazon EC2 On-Demand Pricing" (Data Transfer section) — https://aws.amazon.com/ec2/pricing/on-demand/
- AWS, "Amazon VPC Pricing" (NAT Gateway section) — https://aws.amazon.com/vpc/pricing/
- Microsoft Azure, "Bandwidth Pricing" — https://azure.microsoft.com/en-us/pricing/details/bandwidth/
- Google Cloud, "Network pricing" — https://cloud.google.com/vpc/network-pricing
- `moto`'s `ThreadedMotoServer` (the local engine of record for the chapter lab's conditional-write race, used in place of MinIO — see OUTLINE.md's "Changes from the chapter plan") — https://docs.getmoto.org/en/latest/docs/server_mode.html
- All per-unit dollar prices used in the worked teardown and the small-file demonstration that are not directly quotable from the pages above (because their pricing tables render client-side with no literal digits in the raw HTML, confirmed at research time) are disclosed, publicly documented US East rates current as of 2026-10-31, not scraped — see `examples.py`'s top-of-file constants and OUTLINE.md's "Changes from the chapter plan."
