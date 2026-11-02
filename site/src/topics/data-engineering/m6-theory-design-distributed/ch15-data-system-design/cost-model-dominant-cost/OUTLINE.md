# OUTLINE: Cost model and dominant cost lever (`de.cost-model-dominant-cost`)

## Learning outcomes
1. Price a design's cost per unit of business volume across compute, storage, egress, request
   and licence, from dated provider prices.
2. Build a cost waterfall ranking those five classes and name the one that dominates the bill.
3. For scan volume, cross-AZ traffic, and idle compute, give the design lever that moves it and
   its measured ratio.
4. State each lever's second-order cost.
5. Say what price change would make the dominating lever a different one.

## Engagement arc
- Hook: step 1 (the shop's bill doubles while orders grow a fifth; a month of cluster tuning
  saves little; one query scanning the whole table every few minutes turns out to dominate).
- Predict: step 2, within the first four steps (which cost class actually dominates, before the
  waterfall is drawn).
- Takeaways: step 4 (one term usually dominates a bill, and optimizing the others first is
  wasted effort), step 6 (a lever's saving is a measured ratio, not a guess), step 8 (every lever
  has a second-order cost of its own).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the shop's analytics bill doubles in a quarter while orders grow by a fifth; a month
  of cluster tuning saves little; one query, scanning the whole events table every few minutes
  for a dashboard nobody has looked at since launch, turns out to be most of the bill.
- **On screen:** a month of tuning effort next to one query's actual share of the bill.

### 2. Predict
- **fig:** which cost class does the waterfall actually show dominating?
- **Options:** (a) compute, since the team spent a month tuning cluster sizes [wrong — tempting,
  since that's where the effort went, but effort spent isn't evidence of where the cost sits];
  (b) requests, from one query scanning the whole table repeatedly [correct — scan volume, billed
  per byte read, is what one unwatched dashboard query turns into].

### 3. Reveal — five cost classes, priced per unit of business
- **fig:** compute, storage, egress, requests and licence, each re-expressed per thousand orders
  so designs and scales are comparable, each priced from a dated provider page.
- **Moves:** five bars rise side by side, each labeled with its per-unit price.

### 4. Reveal — the waterfall finds the one term that dominates
- **fig:** the five bars re-sorted into a waterfall by shares of the bill; one bar — the query's
  own scan volume — towers over the rest.
- **takeaway:** "A bill is usually dominated by one term, and optimizing the others first is
  wasted effort."

### 5. Reveal — three recurring dominators
- **fig:** scan volume (bytes read per query), cross-AZ traffic (replication and shuffles
  crossing zones), and idle compute (clusters sized for the peak, idle off it) named as the three
  shapes a dominating bar usually takes.
- **Narrator's line of thought:** she treats naming the dominator's *shape* as the actual
  diagnostic step — a bill rarely needs five separate fixes, it needs one.

### 6. Reveal — a lever, and its measured ratio
- **fig:** a layout-and-pruning lever lands on the scan-volume bar; the bar shrinks by a measured
  factor, with the exact ratio and the saving per thousand orders shown.
- **takeaway:** "A lever's saving is a measured ratio against the actual bill, not a guess."

### 7. Reveal — cross-AZ and idle-compute levers
- **fig:** the same waterfall redrawn for a design dominated instead by cross-AZ traffic (fixed
  by locality and rack awareness) and one dominated by idle compute (fixed by autoscaling or
  suspension), each with its own measured ratio.
- **Narrator's line of thought:** she treats the lever as specific to the dominator, not a
  generic "optimize everything" response — the same lever that fixes scan volume does nothing
  for idle compute.

### 8. Reveal — every lever has a second-order cost
- **fig:** the scan-volume lever's saving bar, with a thin second bar growing beside it in a
  marked color: pre-aggregation's own write amplification, the cost the lever itself introduced.
- **takeaway:** "Every lever that lowers one cost has a second-order cost of its own."

### 9. Recap
- **fig:** five cost classes priced per unit of business, the waterfall finding the one that
  dominates, a lever with its measured ratio, and that lever's own second-order cost — four
  pieces of the same method.

### 10. Prove it
- **fig:** a second price sheet, a few months later, with cross-AZ transfer prices cut sharply —
  does the same waterfall, run again, still show the same bar dominating?
- **predict options:** (a) yes — the dominator a design has doesn't change just because one
  provider's price sheet changed [wrong — the waterfall ranks by actual billed share, which moves
  when any one price moves]; (b) no, not necessarily — a large enough price cut to one class can
  drop it below another class that didn't change at all, so the waterfall has to be re-run, not
  assumed [correct].

## Post-notes headings
- **Internals:** none claimed independently — provider billing internals (how a warehouse
  actually meters scanned bytes, how a cloud bills cross-AZ transfer) are named, not re-derived;
  Chapter 10 §10.4's FinOps practice and Chapter 6 §6.5's warehouse internals are the anchors.
- **Lab:** this topic's own `examples.py` — a cost-waterfall simulation (ranking five cost
  classes and finding the dominator) and a lever simulation (a measured saving ratio against its
  own second-order cost).
- **Production:** the shop's own hook (a month of tuning effort misdirected at the wrong class)
  as the concrete shape "optimizing before measuring" takes in practice.
- **Frontier:** none claimed — cost-per-unit pricing and waterfall analysis are established FinOps
  practice, not an emerging technique. Provider price sheets themselves change often, which is why
  the method re-runs rather than memorizes a dominator.
- **Where this goes next:** hands off to trade-off articulation and decision records (topic 9),
  the final method topic, since every topic so far has produced one piece of a design that now
  needs to be put in front of someone and defended.

## Concept ledger
- **Introduces:** `cost-per-business-unit`, `cost-waterfall-dominant-lever`, `lever-with-second-order-effect`.
- **Uses:** `capacity-estimate-chain` (this chapter, topic 2), `amplification-ledger`,
  `serving-store-by-query-shape`, `pre-aggregation-vs-on-query` (this chapter, topic 5),
  `layout-from-dominant-access-path` (this chapter, topic 4), `object-storage-billing-model`,
  `bytes-scanned-vs-compute-time-billing` (Chapter 3), `compute-storage-separation`,
  `noisy-neighbor-isolation` (Chapter 3), `transfer-pricing`, `bandwidth-delay-product` (Chapter 1).
- **Declared (chapter-plan ids not yet resolvable in `registry.ts` — Chapters 10, 12 not live for
  these):** FinOps/infrastructure-as-code ids from Chapter 10 §10.4, cloud-warehouse billing
  mechanics from Chapter 6 §6.5 beyond what's already live, autoscaling-mechanics ids from the
  skipped Chapter 12 topic (named, not taught).

## Changes from the chapter plan
`CHAPTER.md`'s own chapter-plan `uses` list names Chapter 10 §10.4 and Chapter 6 §6.5 as sources
to "look up their introduces ids in registry.ts" — checked both chapters are not live yet, so no
ids from them are available to use; this topic's own ids instead draw entirely from this chapter
(topics 2, 4, 5) and the already-live Chapter 1 and Chapter 3 ids, all confirmed live via `grep`
on `registry.ts`'s own `introduces` arrays. No scope cut — this topic still leaves out FinOps
practice, cloud pricing models and infrastructure-as-code, layout/pruning mechanics, autoscaling
mechanics, and per-tenant cost attribution, per `CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. BigQuery's on-demand pricing bills by bytes processed per query, not by cluster size or time
   running, and a clustered table's column-filtered query prunes the blocks actually scanned. —
   SOURCES.md (Google Cloud).
2. Amazon S3's cost is split across six distinct components (storage, request/retrieval,
   transfer, data-management, replication, transform/query), and storage itself is priced by
   object size, duration stored, and storage class together. — SOURCES.md (AWS).
3. The cost-waterfall method (rank cost classes by share of the bill, find the one that
   dominates) and the three recurring dominators (scan volume, cross-AZ traffic, idle compute)
   are this chapter's own established reasoning (per `CHAPTER.md`'s own scope line), not an
   independent citation.
