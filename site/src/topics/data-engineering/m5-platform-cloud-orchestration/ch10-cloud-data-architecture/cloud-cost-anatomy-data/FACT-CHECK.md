# Fact-check — de.cloud-cost-anatomy-data

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | S3 LIST requests bill at the same rate as PUT/COPY/POST; DELETE and CANCEL are free | AWS S3 Pricing | Confirmed — quoted verbatim in SOURCES.md |
| 2 | AWS cross-AZ transfer is $0.01/GB each direction; same-AZ transfer (named services) is free | AWS EC2 On-Demand Pricing | Confirmed — quoted verbatim |
| 3 | A NAT gateway bills an hourly fee plus a separate per-GB processing fee, on top of ordinary transfer charges for the same bytes | AWS VPC Pricing | Confirmed — quoted verbatim, including the $0.045/hour + $0.045/GB worked example |
| 4 | Azure inter-region pricing varies by region pair; internet egress is tiered by volume | Azure Bandwidth Pricing | Confirmed — quoted verbatim ($0.02/GB within North America vs $0.16/GB South America; $0.087→$0.05/GB egress tiers) |
| 5 | GCP's cross-zone rate and Cloud NAT's per-GiB rate mirror AWS/Azure's equivalent boundary under a different name | GCP Network Pricing | Confirmed — $0.01/GiB cross-zone (matches AWS's $0.01/GB cross-AZ); Cloud NAT's $0.045/GiB processing fee happens to equal AWS's NAT gateway processing fee, disclosed in-text as a coincidence, not a general law |
| 6 | A conditional-write race's request cost must be measured, not assumed | `examples.py`'s real moto-backed lab | Confirmed — measured directly: naive race used fewer total requests (no retries) but loses 19 of 20 commits; the conditional race's retries add real, measured extra requests for zero lost commits |

## Red-team: the predict question (step 2)

**Risk:** a learner picks "compute" by default because it's the most familiar line item,
without having seen the hook's actual bill breakdown.

**Mitigation:** the hook (step 1) shows the storage-GB line staying flat while a different line
dwarfs it; the predict question asks which dimension that growing line actually belongs to, with
the wrong options (compute, a flat "cloud markup" guess) both failing to explain why the
storage-GB number itself never moved.

## Red-team: the prove-it reproduction (step 9)

**Risk:** "the conditional write is correct, so assume it's also cheaper" is an unearned leap —
correctness and cost are different axes, and nothing so far in the topic proves the safer option
is also the cheaper one.

**Mitigation:** `examples.py`'s `price_the_two_races` prices both runs on their own measured
request counts rather than asserting an answer; the real result (confirmed by running the file)
is that the conditional race's retries make it the *more* expensive run in request count, even
though it is the only one with zero lost commits — the reel's prove-it step asks the learner to
predict this relationship rather than being told it, and the explain text states the actual
measured outcome.

## Outcome

Every numeric claim quoted in SOURCES.md is a verbatim quote, verified word-for-word
(`node scripts/sources.mjs check` — 0 problems). Every number used in the worked teardown and
the small-file demonstration that is *not* quotable from a sourced page (because AWS's own
pricing pages render those specific numbers client-side, confirmed by inspecting the fetched raw
text) is a disclosed, separately-documented public rate, not fabricated — see OUTLINE.md's
"Changes from the chapter plan." The lab's request counts and correctness outcomes are measured
directly against a real local S3-compatible server, not asserted.
