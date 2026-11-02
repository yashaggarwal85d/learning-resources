# OUTLINE: Multi-tenant analytics with cost attribution (`de.multi-tenant-analytics-cost`)

## Learning outcomes
1. Design multi-tenant analytics for the shop's marketplace with an isolation level chosen from
   three alternatives by tenant count and compliance.
2. Design a noisy-neighbour control with a fairness rule; simulate a tenant at ten times load
   and show the effect on a neighbour with and without the control.
3. Design per-tenant retention and an erasure plan, coupled to the isolation choice.
4. Build a metering-and-allocation model with a stated policy for the unattributable remainder;
   compute per-tenant cost from one engine's attribution view; state the next bottleneck at ten
   times the tenant count.

## Engagement arc
- Hook: step 1 (4,000 sellers share one warehouse; one seller's nightly report scans the whole
  fact table and every other seller's dashboard slows to a crawl; finance asks what each seller
  costs and the answer is "the warehouse is mostly idle, we have no per-seller number").
- Predict: step 2, within the first four steps (which two controls, designed in, would have
  prevented the slowdown and produced the number).
- Takeaways: step 4 (the isolation spectrum's cost and blast radius trade off, not a free
  choice), step 6 (a quota without a fairness rule just moves who gets starved), step 8 (the
  unattributable remainder is a policy decision, not a rounding error).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** 4,000 sellers share one warehouse. One seller's nightly report scans the whole fact
  table; every other seller's dashboard slows to a crawl. At month end, finance asks what each
  seller costs, and the answer is "the warehouse is mostly idle, we have no per-seller number."
- **On screen:** one lane spiking, every other lane slowing, and a bill with no names on it.

### 2. Predict
- **fig:** which two controls, designed in, would have prevented the slowdown and produced the
  number?
- **Options:** (a) a bigger warehouse, since more compute fixes slow queries [wrong — a bigger
  warehouse still lets one tenant consume the whole thing, and still produces no per-tenant
  number]; (b) a per-tenant limit on heavy queries, and a metering view that attributes cost per
  query [correct].

### 3. Reveal — the isolation spectrum, priced
- **fig:** a horizontal ladder: shared table with row-level security (cheapest, weakest blast
  radius), schema or catalog per tenant (a middle), account or project per tenant (strongest,
  most overhead) — each priced for the shop's marketplace at a small and a large tenant count.
- **Moves:** the ladder's three rungs each gain a cost bar and a blast-radius bar.

### 4. Reveal — what forces a tenant up the spectrum
- **fig:** a regulated tenant and a noisy tenant each pushed up one rung from the cheapest
  default, with the specific constraint named next to each push.
- **takeaway:** "The isolation spectrum trades cost against blast radius; nothing on it is free, including the cheapest rung."

### 5. Reveal — noisy-neighbour control, simulated
- **fig:** tenant lanes on shared compute; one lane spikes to many times its normal load; the
  neighbours' latency bars climb without a control, and stay flat with a quota and a fairness
  rule in place.
- **Narrator's line of thought:** she treats fairness itself as a design choice (equal shares,
  weighted shares, burst-with-credit), not a side effect of whichever quota number gets picked.

### 6. Reveal — fairness is the actual design question
- **fig:** the same spike under three fairness rules side by side: an equal share starves a
  large legitimate tenant, a weighted share favours whoever pays more, burst-with-credit lets a
  short spike through but caps a sustained one.
- **takeaway:** "A quota without a fairness rule just moves who gets starved; the fairness rule is the real design choice."

### 7. Reveal — retention and erasure, coupled to isolation
- **fig:** a tenant stored under its own key or in its own schema erases cheaply (one key
  deleted, or one schema dropped); the same tenant in a shared table needs a scan and rewrite —
  the erasure cost is drawn directly from the isolation rung already chosen.
- **Narrator's line of thought:** she treats this as a consequence already paid for by step 3's
  choice, not a separate decision.

### 8. Reveal — metering, allocation and the remainder
- **fig:** a bill split into per-tenant slices from the engine's own metering view, plus a grey
  "idle and shared" remainder that the three slices don't cover; three policy cards (charge it
  proportionally, charge it as a flat platform fee, absorb it) sit under the remainder.
- **takeaway:** "The unattributable remainder is a policy decision stated up front, not a rounding error left unexplained."

### 9. Recap
- **fig:** the priced isolation ladder, the fairness-rule comparison, the isolation-coupled
  erasure cost, and the metering split with its remainder policy, side by side.

### 10. Prove it
- **fig:** the marketplace grows from 4,000 sellers to ten times that. The cheapest isolation
  rung's per-tenant cost barely moves, but the metering view's own per-query overhead starts
  showing up as a real line on the bill.
- **predict options:** (a) move every tenant up a rung preemptively, since more tenants means
  more risk [wrong — the rung choice was already driven by the constraint, not the count, and
  moving everyone up multiplies cost for tenants that triggered no constraint]; (b) watch the
  metering overhead itself as the next bottleneck, and widen the granularity (less frequent,
  coarser attribution) before it outgrows what it was measuring [correct].

## Post-notes headings
- **Internals:** none claimed independently — the isolation-spectrum theory, tenant-level keys
  and compliance (the skipped Chapter 13 multi-tenant topic) and row/column security mechanisms
  (Chapter 13 topic 8) are each named only as a choice pointing to its home chapter; FinOps
  practice and cloud cost models (Chapter 10 §10.4, topic 8) and the engines' resource-governance
  internals (Chapter 6 §6.5) are referenced, not re-taught; the Chapter 13 erasure mechanisms are
  referenced.
- **Lab:** none of its own; the noisy-neighbour simulation (a tenant at ten times load with and
  without a quota and a fairness rule), the isolation cost comparison at two tenant counts, and
  the per-tenant attribution from a metering extract are this topic's executable evidence.
- **Production:** the hook's own scenario (one tenant's heavy query degrading every neighbour,
  with no per-tenant number at month end) as the concrete shape "no isolation, no attribution"
  takes in practice.
- **Frontier:** none claimed — tenant isolation spectrums, noisy-neighbour quotas, and
  usage-based cost attribution are each established practice (Snowflake's and BigQuery's own
  metering products), not an emerging technique.
- **Where this goes next:** isolation and attribution are about who sees and who pays. One
  tenant's request can also be about who must be forgotten. A deletion has to reach the
  lakehouse, the topics, the replicas and the backups, with proof. The next design composes
  everything Chapter 13 built into one process: GDPR erasure across lakehouse and backups.

## Concept ledger
- **Introduces:** `multi-tenant-isolation-decision`, `noisy-neighbor-fairness-rule`,
  `usage-metering-cost-attribution`, `unattributable-remainder-policy`.
- **Uses:** the method concepts as in topic 12, plus `compute-storage-separation`,
  `noisy-neighbor-isolation`, `bytes-scanned-vs-compute-time-billing`,
  `object-storage-billing-model`, `cost-per-business-unit`, `cost-waterfall-dominant-lever`,
  `layout-from-dominant-access-path`, `tiering-retention-designed-up-front`,
  `connection-pool-sizing` — all confirmed live via a Node.js script parsing `registry.ts`'s
  `introduces` arrays.
- **Declared:** `engine-enforced-row-column-security`, `abac-tag-based-policy`,
  `policy-bypass-paths`, `per-subject-crypto-shredding-cost` and
  `erasure-vs-time-travel-snapshot-expiry` (each an existing placeholder, already introduced by
  prior topics for the identical Chapter 13 gap) and `dynamic-masking-at-query-time` (same gap,
  new id — no prior topic has needed this exact distinction).

## Changes from the chapter plan
`CHAPTER.md` lists `Declared: none`, but `engine-enforced-row-column-security`,
`abac-tag-based-policy`, `policy-bypass-paths`, `dynamic-masking-at-query-time`,
`per-subject-crypto-shredding-cost` and `erasure-vs-time-travel-snapshot-expiry` all resolve to
Chapter 13, which remains entirely unplanned, so all six move to `declared`. Five reuse the
exact placeholder ids already introduced by prior topics (topics 11 and 4) for the identical
gap; `dynamic-masking-at-query-time` is a new placeholder. `crypto-shredding-key-deletion` is
confirmed live (introduced elsewhere) and stays in `uses`. Every other named `uses` id is
confirmed live via the same script. No scope cut — this topic still leaves out the
isolation-spectrum theory, row/column security mechanisms, FinOps practice, engine
resource-governance internals, and the Chapter 13 erasure mechanisms, per `CHAPTER.md`'s own
"Leaves out" line.

## Claims list (for fact-check)
1. Snowflake's `QUERY_ATTRIBUTION_HISTORY` view can be used to determine the compute cost of a
   given query run on a warehouse. — SOURCES.md (Snowflake).
2. Snowflake documents `CREDITS_ATTRIBUTED_COMPUTE` as the number of credits attributed to a
   query, excluding warehouse idle time. — SOURCES.md (Snowflake).
3. Google Cloud documents BigQuery's `INFORMATION_SCHEMA.JOBS.total_bytes_billed`,
   `total_slot_ms` and `labels` fields as stated. — SOURCES.md (BigQuery).
4. The isolation-spectrum pricing, the noisy-neighbour simulation under three fairness rules,
   the retention-coupled-to-isolation framing, and the unattributable-remainder policy are this
   chapter's own established method and this topic's own derived design, not an independent
   citation beyond claims 1-3.
