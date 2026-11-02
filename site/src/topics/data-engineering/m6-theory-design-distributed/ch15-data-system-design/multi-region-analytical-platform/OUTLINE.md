# OUTLINE: Multi-region analytical platform (`de.multi-region-analytical-platform`)

## Learning outcomes
1. Design the shop's two-region platform with an SLO set and a per-dataset placement from
   classification.
2. Make a replicate-versus-federate decision per query class, with a dated egress estimate for
   both.
3. Produce a regional-failover plan covering pipelines, catalog and keys with RPO and RTO per
   class.
4. State a rule for consistent global metrics, say what the design does not claim about legal
   compliance, and name the next bottleneck at ten times.

## Engagement arc
- Hook: step 1 (the US team replicates the whole events lake to the EU "for performance" over a
  weekend; the privacy officer asks which EU customers' data is now in the US; separately the
  EU catalog database fails and the replicated buckets have no usable table metadata).
- Predict: step 2, within the first four steps (the placement rule that would have prevented
  the first problem, and the failover component bucket replication omits for the second).
- Takeaways: step 4 (replication and federation are each a cost and a risk, not a default),
  step 6 (bucket replication alone is not failover), step 8 (a global figure carries the
  freshness of its stalest region).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the US team replicates the whole events lake to the EU "for performance" over a
  weekend. Monday: the privacy officer asks which EU customers' data is now stored in the US.
  Separately, the EU region's catalog database fails, and the replicated buckets have no usable
  table metadata.
- **On screen:** a bucket crossing a border with no gate, and a second bucket standing alone
  with its catalog missing.

### 2. Predict
- **fig:** which two decisions, made at design time, would have prevented both?
- **Options:** (a) a faster replication tool, since the problem was really about speed [wrong —
  the privacy problem is which rows crossed the border at all, and the catalog problem is that
  bucket replication never copies the catalog database]; (b) a per-dataset residency rule for
  the first, and a catalog backup and restore plan as part of failover for the second [correct].

### 3. Reveal — the placement decision
- **fig:** a world strip with two regions and a border line; datasets drawn as chips tagged by
  classification — EU personal-data chips cannot cross the line (a closed gate), a de-identified
  aggregate chip crosses freely, global reference data starts on both sides.
- **Moves:** each chip slides to its allowed side(s); the EU personal-data chip visibly stops at
  the gate.

### 4. Reveal — replicate vs federate, priced
- **fig:** two query paths for "global revenue": replicate (a thick, recurring egress arrow
  moving rows every day) versus federate (thin per-query arrows fanning out to each region and
  merging), with the shop's events-versus-aggregates volumes multiplied against AWS's own dated
  per-GB egress price.
- **takeaway:** "Replication and federation are each a cost and a risk computed from the query, not a default choice."

### 5. Reveal — the aggregates-only compromise
- **fig:** a de-identified aggregate chip replicating freely where the rows themselves could
  not, with S3 Replication Time Control's own 15-minute guarantee drawn as a bounded, paid lag
  on top of it.
- **Narrator's line of thought:** she treats "replicate the aggregate, never the rows" as the
  design's actual answer to the privacy officer's question, not a hedge.

### 6. Reveal — failover beyond bucket replication
- **fig:** a failure strip kills one region: the buckets survive (replicated), but the catalog
  database, the encryption keys, and the pipelines' checkpoints do not — each drawn missing in
  red until a backup-and-restore plan is added for each.
- **takeaway:** "Bucket replication alone is not failover; the catalog, the keys and the pipeline state each need their own plan."

### 7. Reveal — RPO and RTO per data class
- **fig:** the shop's data classes (orders, events, aggregates) each get a named recovery point
  and recovery time objective, drawn as two clocks per class, tied to topic 7's own method.
- **Narrator's line of thought:** she treats the RPO/RTO numbers as the design's own stated
  promise, not an afterthought bolted onto a failover plan already built.

### 8. Reveal — one consistent global number
- **fig:** regional partials for "global revenue" combining into one figure that is explicitly
  only as fresh as its stalest region's last update, drawn as the global number's own clock
  pinned to the slowest regional clock.
- **takeaway:** "A global figure carries the freshness of its stalest region; a cross-region strongly consistent counter costs a round trip the shop chose not to pay."

### 9. Recap
- **fig:** the placement gate, the replicate-versus-federate price card, the aggregates-only
  compromise, the failover plan's four pieces, and the stalest-region rule, side by side.

### 10. Prove it
- **fig:** the shop opens a third region. A query needs "global revenue including the new
  region" the same minute the new region's pipeline backfills its first week of history.
- **predict options:** (a) exclude the new region from the global figure until its backfill
  finishes, and say so [defensible, and the honest default — but only if the stalest-region rule
  is stated for the viewer, not silently applied]; (b) include it immediately with its
  partial, catching-up numbers blended in unmarked [wrong — this breaks the stalest-region
  promise by hiding which part of the figure is still catching up].

## Post-notes headings
- **Internals:** none claimed independently — the cloud regions, networking and residency
  regulations (Chapter 10 §10.1–§10.5) are built on; replication mechanics (Chapter 5 §5.3,
  Chapter 9's MirrorMaker and cluster linking, Chapter 6's table replication) and the DR
  mechanics themselves (Chapter 11 §11.3) are each named only as a choice pointing to its home
  chapter; the consistency theory (Chapter 14) and tenant isolation (topic 19) are each
  referenced, not re-taught.
- **Lab:** none of its own as a syllabus lab leg; the egress estimate for replicating rows
  versus aggregates (with the dated AWS price) and the failover completeness checklist are this
  topic's executable evidence.
- **Production:** the hook's own two-part scenario (an unplanned weekend replication, a region
  lost with no catalog backup) as the concrete shape "residency and failover, found out the
  hard way" takes in practice.
- **Frontier:** none claimed — residency-constrained placement, replicate-versus-federate, and
  cross-region consistency tradeoffs are each established practice (AWS's own RTC product,
  GDPR's own transfer chapter), not an emerging technique.
- **Where this goes next:** a region is one kind of boundary inside a platform. Another is the
  customer: when the platform's users are themselves businesses, each with their own data,
  budget and expectations, isolating them and charging each fairly become design problems. The
  next design is multi-tenant analytics with cost attribution.

## Concept ledger
- **Introduces:** `multi-region-platform-design`, `replicate-vs-federate-decision`,
  `region-failover-beyond-bucket-replication`, `global-metric-stalest-region`.
- **Uses:** the method concepts as in topic 12 (`ask-to-slo-translation`,
  `capacity-estimate-chain`, `littles-law-inflight-sizing`, `data-flow-shape-decision`,
  `layout-from-dominant-access-path`, `engine-choice-by-state-latency-skill`,
  `correction-window-late-data`, `replay-backfill-as-first-class-path`,
  `failure-table-blast-radius`, `cost-waterfall-dominant-lever`, `three-alternatives-with-costs`,
  `ten-x-next-bottleneck`), plus `sensitivity-tier-and-category`, `dek-kek-envelope-hierarchy`,
  `customer-managed-byok-external-keys`, `system-of-record-vs-derived`,
  `tiering-retention-designed-up-front`, `rpo-rto-per-data-class`, `semantic-layer-metric-compilation`,
  `cap-theorem-formal-statement`, `pacelc-else-branch`, `effectively-ca-meaning`, `cap-pacelc`,
  `distributed-sql-architecture`, `transfer-pricing`, `bandwidth-delay-product` — all confirmed
  live via a Node.js script parsing `registry.ts`'s `introduces` arrays.
- **Declared:** `abac-tag-based-policy` (Chapter 13 remains entirely unplanned; this placeholder
  id is already used by prior topics for the identical gap) and
  `pseudonymised-vs-anonymised-data` (same gap, new id — Chapter 13's classification material
  this distinction belongs to is not live).

## Changes from the chapter plan
`CHAPTER.md` lists `pseudonymised-vs-anonymised-data` and `abac-tag-based-policy` among this
topic's `uses`; both resolve to Chapter 13, which remains entirely unplanned, so both move to
`declared`. `abac-tag-based-policy` reuses the exact placeholder id already introduced by the
destination-side-interrogation topic (topic 11) for the same gap; `pseudonymised-vs-anonymised-data`
is a new placeholder, since no prior topic has needed this exact distinction. Every other named
`uses` id is confirmed live via the same script. No scope cut — this topic still leaves out the
cloud regions and residency regulations themselves, replication and DR mechanics, consistency
theory, and tenant isolation, per `CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. GDPR Article 5(1)(e) requires personal data to be "kept in a form which permits
   identification of data subjects for no longer than is necessary." — SOURCES.md (GDPR Art. 5).
2. GDPR Article 5(2) makes the controller responsible for, and able to demonstrate compliance
   with, the Article 5(1) principles. — SOURCES.md (GDPR Art. 5).
3. GDPR Article 25(1) requires the controller to implement appropriate technical and
   organisational measures, such as pseudonymisation, by design and by default. — SOURCES.md
   (GDPR Art. 25).
4. GDPR Article 44 permits a transfer of personal data to a third country only if the
   conditions in GDPR Chapter V are met. — SOURCES.md (GDPR Art. 44).
5. AWS documents that S3 Replication Time Control replicates most objects in seconds, and 99.9
   percent of objects within 15 minutes. — SOURCES.md (AWS S3 RTC).
6. AWS's own pricing page states the Europe (Ireland) data-transfer-out-to-internet rate as
   $0.09 per GB, as of the date this topic was researched. — SOURCES.md (AWS S3 pricing).
7. This topic states explicitly what it does not claim about legal compliance (GDPR's text is
   quoted and cited; whether a specific design satisfies it is counsel's determination, not
   this topic's), per `CHAPTER.md`'s own outcome.
