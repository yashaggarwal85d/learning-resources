# FACT-CHECK: Feature stores and online/offline consistency

## Claims

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | An offline store is an interface over historical, time-series feature values, used to build training sets and materialize into an online store. | Feast docs, "Offline store" | Confirmed, quoted verbatim |
| 2 | Only one offline store is active at a time; offline stores aren't universally data-source-compatible. | Feast docs, same page | Confirmed, quoted verbatim |
| 3 | An online store is populated by materialization and keeps only the latest value per entity key (no history). | Feast docs, "Online store" | Confirmed, quoted verbatim |
| 4 | Hopsworks' online store keeps only latest values (backed by RonDB); its offline store keeps history for training/batch scoring. | Hopsworks docs | Confirmed, quoted verbatim |
| 5 | Databricks announced acquiring Tecton on August 22, 2025, to unite Tecton's real-time data serving with Agent Bricks. | Databricks Blog | Confirmed, quoted verbatim, dateline on the page itself |
| 6 | Tecton self-describes as a real-time enterprise feature store for fraud detection, risk scoring, personalization. | Databricks Blog (quoting Tecton) | Confirmed, quoted verbatim |
| 7 | The three measured skew rates (different code path, different join, stale value) are each nonzero and each driven to zero by removing their root cause. | This topic's own `examples.py`, to be executed | Confirmed, to be executed |
| 8 | Topic 1's as-of join and post-outcome-leakage material is reused, not re-derived. | This course, topic 1 | Confirmed by construction |

## Currency check

- Feast docs: v0.63-branch, "Last updated 5 months ago" per both pages — current stable branch at research time (2026-10-30); no newer major-version split of the offline/online store architecture is claimed.
- Hopsworks docs: "latest" branch — current at research time; RonDB named as the online store's backing engine per that page, not assumed from an older version.
- Databricks/Tecton: the blog post itself carries an August 22, 2025 dateline and describes the deal as "will soon join" — i.e., announced, not necessarily closed, at the post's own writing; this topic states it as an announced acquisition with that date, not as a completed, closed transaction, matching the source's own wording.
- No claim in this topic depends on a specific Feast/Hopsworks release number surviving past research time; the two-store architectural split (offline for history/training, online for latest-value/low-latency serving) is the stable claim, independently confirmed by two vendors.

## Red team

1. **Is "feature store" collapsed into "online store" anywhere in the reel?** No — every step that shows the architecture draws both pipes from one definition box; the online store alone is never called "the feature store."
2. **Does the topic claim a feature store prevents all three skew causes?** No — step 5's reveal and step 10's "Prove it" both explicitly show a feature store *not* preventing a different join or a bypassed code path; only cause 1 (when all code genuinely goes through the store) is prevented, and even that assumes nothing recomputes the feature outside it (step 10).
3. **Is the Tecton/Databricks fact over-claimed as "complete" rather than "announced"?** Checked against the source's own tense ("will soon join," "is joining") — the topic's wording below will match, stating the announcement date, not a closing date.
4. **Are the three skew-cause measurements independent of each other, or could one experiment accidentally produce all three numbers from the same underlying bug?** No — `examples.py` isolates each cause by changing exactly one condition at a time (code path, join type, request-arrival timing) while holding the other two at their non-buggy baseline, so each measured rate is attributable to its own named cause.
5. **Does "freshness SLA" get a concrete number, or is it left vague ("fresh enough")?** The outline's step 6 and step 7 both use a stated interval (thirty minutes) and a stated request-arrival offset, matching the syllabus clause's own demand ("stated as a number... not 'fresh enough'").

## Problem Solving

No blockers hit during research; both vendor docs and the Databricks announcement fetched and quoted cleanly on the first attempt.
