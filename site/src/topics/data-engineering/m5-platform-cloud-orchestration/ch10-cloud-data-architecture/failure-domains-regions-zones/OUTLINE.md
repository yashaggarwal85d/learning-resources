# OUTLINE: Failure domains: regions, zones, cells (`de.failure-domains-regions-zones`, refresher, 10.1)

## Learning outcomes
1. Say, for a named cloud service, whether it is zonal, regional or multi-regional, and what survives a single-zone outage.
2. Price a cross-AZ replication link from its GB volume ($0.01/GB each direction on AWS).
3. Explain what a cell buys over "the whole region" as the unit of blast radius.

## Engagement arc
- Hook: step 1 (a single-AZ database goes dark in a zone outage while multi-AZ/regional services keep running).
- Predict: step 2, within the first four steps (refresher needs at least one).
- Takeaways: steps 4, 5, 6 (three total). Step 3 (first non-predict step after the predict step) carries **no** takeaway — the point goes in its body instead (known Playwright "swipe from the caption" gotcha on phone).
- Recap: step 6.
- No "Prove it" section (refreshers skip it per DESIGN.md / CHAPTER.md's visual-language note).

## Steps

### 1. Opening hook — "One zone goes dark"
- `fig`: `WorldMap` (reused chapter figure, previewed here as its first appearance).
- Visual: a world map with one region shown as a ring of three zone-dots; the AZ dot that failed turns `C.bad`; a single-AZ database icon pinned to it goes dark, while an object-storage icon and a multi-AZ streaming icon (drawn as footprints spanning all three dots) stay lit.
- What moves: the failed dot fades to `C.bad` on a beat; the single-AZ icon's glow cuts to zero at the same beat; the two multi-AZ icons' glow stays constant throughout (drawn as already-spanning, so nothing about them changes — that contrast *is* the point).
- Narrator's line of thought: don't open with the definition. Open with the asymmetry — the same zone outage took one service down cold and left two others completely unaffected, because of a design decision made long before the outage, not during it. That's the whole topic in one picture.
- Real numbers: none yet (set up in step 3).
- Body/caption: a single-AZ managed database goes dark for the length of a zone outage while a regional object store and a multi-AZ streaming cluster keep serving the whole time.
- No takeaway, no predict.

### 2. Predict — "Which of these three keeps serving?"
- `fig`: `WorldMap` reused, now with three candidate services pinned to the same failing zone: a zonal block volume, a single-AZ database instance, and a regional object-storage bucket.
- Predict question: "The zone these three are drawn in just failed. Which one keeps serving reads?" Options: "The block volume" / "The single-AZ database" / "The object-storage bucket" (correct) / "None of them". Wrong-option temptation: a learner who hasn't separated "where a resource is *drawn*" from "where a resource actually *lives*" picks the database, assuming "it's in the picture, so it's affected" — the object store is drawn at the same zone only because that's where the request happened to land, not where its data is replicated.
- Answer/explain: the object-storage bucket, because object storage is a **regional** service replicated by the provider across zones regardless of which zone a given request hits; the block volume and the single-AZ database are each pinned to one zone and go dark with it.
- What moves: on reveal, the block volume and single-AZ database dots freeze dark; the object-storage icon's footprint visibly expands to show the other two zones it was always replicated into (the reveal's whole animation).
- Narrator's line of thought: ask the question as "which one keeps serving," not "which one is zonal" — the learner has to apply the distinction, not recite it. The wrong-answer trap is worth naming out loud: being drawn next to a failure is not the same as being hosted by it.

### 3. "Zonal vs regional vs multi-AZ by design, not by luck" — NO takeaway
- `fig`: `ServiceStrip` — a row of three service cards (a block volume, a managed database instance, a managed streaming cluster), each tagged with its actual default (zonal / configurable multi-AZ / regional) from the sourced docs.
- What moves: each card's tag decodes in (kit `Decode`) one after another, left to right, so the three answers arrive as a sequence rather than all at once.
- Real numbers/facts shown: AWS's own wording that each Region "consists of a minimum of three, isolated, and physically separate AZs" and that AZs are "within 100 km (60 miles) of each other"; the same zonal/regional/multi-regional split named from Google Cloud's and Azure's own docs, so the idea reads as a property of the cloud model, not one vendor's quirk.
- Narrator's line of thought: say plainly that a managed streaming cluster's multi-AZ-ness is a *configuration* someone chose, not a law of nature the way object storage's regional replication is — that distinction is the one an operator actually has to go check, service by service, rather than assume.
- Body/caption: the same three-way split, confirmed across AWS, Google Cloud and Azure's own documentation, so "zonal," "regional" and "multi-AZ" mean the same thing on any of the three.
- No takeaway (gotcha: first non-predict step after the predict step).

### 4. "What a zone outage actually costs to insure against" — takeaway
- `fig`: `CostBar` (the chapter's three-ledger bar, previewed here in miniature as a single network-ledger bar, reused in full in topic 6).
- Visual: a bar labelled "cross-AZ replication traffic," filling to a measured GB total from `examples.py`, with a dollar readout computed at AWS's own published $0.01/GB-each-direction rate.
- What moves: the bar fills left to right as the readout counts up to the final dollar figure.
- Real numbers: a concrete example (e.g. 500 GB replicated both directions over a day) priced at $0.01/GB each way, executed and asserted in `examples.py`.
- Narrator's line of thought: name the trade explicitly — multi-AZ replication is not free insurance, it is a line item, and an operator who turns it on without expecting that line item is the one who gets surprised by the bill, not by the outage.
- Takeaway: "Multi-AZ redundancy is billed, not free: every byte that crosses a zone boundary for replication shows up on the bill."

### 5. "A cell is a smaller blast radius than a whole region" — takeaway
- `fig`: `CellGrid` — a grid of small independent cells (reusing AWS's own cell-based-architecture guidance: a routing layer, independent fixed-size cells each with their own full stack, a central dashboard).
- Visual: one cell turns `C.bad` (a software bug or bad deploy inside it); every other cell's indicator stays lit; a caption counts how many of the grid's customers are affected (one cell's worth, not the whole grid).
- What moves: the bad cell's fill animates to `C.bad` on a beat; a ripple that tries to cross into the neighbouring cell is drawn and stopped dead at the cell boundary (the one deliberate visual beat of the whole step).
- Real numbers: a concrete cell count and the fraction of customers in the one bad cell, computed in `examples.py`.
- Narrator's line of thought: say what a cell is *for*, in one sentence an operator would actually use: it turns "the whole region has a problem" into "one cell, and one cell's customers, has a problem" — the same kind of trade as step 4, deliberately smaller blast radius bought with deliberately added complexity (routing, per-cell duplication).
- Takeaway: "A cell-based design trades a bigger operational surface for a blast radius bounded to one cell's customers, not the whole region."

### 6. Recap — takeaway
- `fig`: `Recap` list (reused pattern from other refreshers).
- Three bullets: the zonal/regional/multi-regional split (step 3); cross-AZ traffic is billed (step 4); a cell bounds blast radius below "the whole region" (step 5).
- Takeaway (final, standalone): "Before trusting any cloud data service with your availability, ask the one question this topic answers: which failure domain does it actually promise to survive?"
- Narrator's line of thought: close by handing back the one operational habit, not a summary of facts: check the failure-domain claim for the exact service, not the cloud in general.

## Post-notes (Deep dive) headings and content
- **Outcomes**: restates the three learning outcomes above.
- **Internals**: how AZs are physically interconnected (AWS's "fully redundant, dedicated metro fiber," "all traffic between AZs is encrypted," synchronous replication is feasible because of the sub-100km distance bound) — one level deeper than the reel's steps, sourced.
- **Production**: a real-shaped failure pattern — a team that assumed a managed database was multi-AZ by default and discovered during an outage that it was deployed single-AZ, because the multi-AZ option is opt-in on that service tier.
- **Frontier**: AWS's own cell-based-architecture guidance in more detail (the routing layer, the rebalancer, canary deploys to a single cell first) as the state of the art for the "blast radius smaller than a region" idea.
- **Where this goes next**: object storage's exact read-after-write and write-atomicity guarantees (topic 2) — "regional" in this topic's sense says nothing yet about what a read sees right after a write, which is the next topic's entire subject.

## Examples to execute (`examples.py`)
- Compute the cross-AZ replication cost for a stated GB volume at $0.01/GB each direction; assert the dollar figure shown on screen.
- Compute a cell-grid blast-radius fraction (bad cells / total cells, and affected customers / total customers assuming even distribution); assert the numbers shown on screen.
- No real cloud API calls (this topic has no cloud account to run against); every number is arithmetic on sourced, stated rates.

## Bridge and handoff
- Bridge (from Milestone 4's close, opening the chapter): see `CHAPTER.md` topic 1 entry, verbatim.
- Handoff: see `CHAPTER.md` topic 1 entry, verbatim.

## Concept ledger
- **Introduces**: `failure-domain-blast-radius`.
- **Uses**: none.
- **Declared**: basic cloud vocabulary (a region, an availability zone, a virtual machine).

## Claims list (source for each)
1. "Each AWS Region consists of a minimum of three, isolated, and physically separate AZs within a geographic area." — AWS Global Infrastructure: Regions and AZs.
2. "An Availability Zone (AZ) is one or more discrete data centers with redundant power, networking, and connectivity." — same source.
3. "AZs are physically separated by a meaningful distance, many kilometers, from any other AZ, although all are within 100 km (60 miles) of each other." — same source.
4. Cross-AZ data transfer within the same AWS Region is billed at $0.01/GB in each direction (named services: EC2, RDS, Redshift, DAX, ElastiCache, ENIs). — AWS EC2 On-Demand Instance Pricing (data transfer section).
5. A cell-based architecture divides a system into independent, fixed-size cells with their own full application logic and storage, isolating faults to one cell's customers instead of the whole system. — AWS Guidance for Cell-Based Architecture on AWS.
6. Google Cloud resources are zonal (single zone, outage can affect some/all resources in it), regional (redundant across zones in a region) or multi-regional (deployed across regions). — Google Cloud: Geography and regions.
7. Azure availability zones are separated datacenter groups within a region with independent power/cooling/networking; a zone-redundant resource is resilient to a zone failure once it spans two or more zones. — Microsoft Learn: What are Azure Availability Zones?
