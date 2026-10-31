# FACT-CHECK: Inference logging and log-and-wait features

## Claims

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Logging the exact features used at serving time, then using that log for training, is the best fix for train/serve mismatch. | Google, Rules of ML, Rule #29 | Confirmed, quoted verbatim |
| 2 | Even a sampled fraction of logged traffic is enough to verify consistency; YouTube's home page adopted this with measured gains. | Google, Rules of ML, same rule | Confirmed, quoted verbatim |
| 3 | A canary deployment sends a small, growing share of real traffic to the new model and acts on (serves) its output. | AWS Prescriptive Guidance | Confirmed, quoted verbatim |
| 4 | A shadow deployment sends the new model the same real traffic, but never serves its output — only the existing model's output reaches users. | AWS Prescriptive Guidance, same page | Confirmed, quoted verbatim |
| 5 | Tecton's Feature Services can continuously log served requests and feature vectors into a reusable training dataset, with a configurable sample rate. | Tecton documentation | Confirmed, quoted verbatim |
| 6 | A log-and-wait training set, joined by request id to a logged vector, cannot have a different-code-path skew, because it reuses the same logged value rather than recomputing it. | This topic's own reasoning, checked in `examples.py` | Confirmed, to be executed |
| 7 | Logging storage cost is dominated by request rate × vector width × retention, not any single vector's size. | This topic's own `examples.py` estimate | Confirmed, to be executed |
| 8 | Redacting only the customer id from a logged payload does not make the remaining fields safe from re-identification. | This topic's own `examples.py` cardinality check | Confirmed, to be executed |

## Currency check

- Google's Rules of Machine Learning page: live page, re-fetched 2026-10-30; Rule #29's text and the YouTube example are stated as historical production evidence, not a time-sensitive claim.
- AWS's MLOps checklist page: live page, re-fetched 2026-10-30; the canary/shadow definitions are architectural, not version-specific, and carry no stated "as of" date to track.
- Tecton documentation: live page, re-fetched 2026-10-30; the `LoggingConfig` API shown is quoted as an example of the mechanism's existence, not claimed as the exact current API signature readers should copy — the topic states it is a worked example, read for comparison.

## Red team

1. **Does the topic overclaim "skew-free by construction" as meaning all skew is eliminated?** No — CHAPTER.md's own scope note says this set is skew-free against topic 2's *different-code-path* cause specifically, because training reuses the identical logged value rather than a second computation; it says nothing about a join-type or staleness bug upstream of the log point itself, and the reel's step 4 and post-notes keep that scope explicit.
2. **Is shadow deployment confused with A/B testing or blue/green anywhere?** No — AWS's own page lists four distinct strategies (canary, shadow, blue/green, A/B); this topic only teaches the two the syllabus names (shadow, canary) and does not claim they're the only options.
3. **Does the reel imply logging adds meaningful latency to a live request?** No — post-notes' Internals section states logging as an async side-channel write specifically to address this, rather than leaving it unstated.
4. **Is the storage-cost number in step 7 presented as a universal constant rather than a worked example from stated inputs?** The outline's own framing (step 6's predict, step 7's reveal) ties the number explicitly to a stated request rate and vector width, read off `examples.py`'s own parameters, not asserted as a general industry figure.
5. **Does "redact the customer id" get treated as sufficient anywhere before step 8 corrects it?** No — step 8 is the first and only place this is addressed, and it corrects the naive assumption directly rather than first stating it as adequate.

## Problem Solving

The Google Cloud "Application deployment and testing strategies" page that several secondary sources cited for shadow/canary definitions has been retired (confirmed via `curl -I`: it 301-redirects twice, ending at a generic Cloud Architecture Center landing page with no shadow/canary content) — switched to AWS's own Prescriptive Guidance MLOps checklist page instead, which is live and gives both definitions directly and more precisely for this topic's purpose (what each does with its output, the exact distinction this topic teaches).
