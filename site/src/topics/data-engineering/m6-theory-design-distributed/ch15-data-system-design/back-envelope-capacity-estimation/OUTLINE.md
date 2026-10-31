# OUTLINE: Back-of-envelope capacity estimation (`de.back-envelope-capacity-estimation`)

## Learning outcomes
1. Take a business volume to events/second, bytes/day and storage/year with replication and compaction overhead, in an estimate sheet with units.
2. Apply a peak-to-average ratio and say what it changes.
3. Use Little's Law to size consumers, a queue and a connection pool.
4. State the dated reference numbers (Kafka per-partition throughput, S3 request limits, a measured warehouse scan rate) and say what each is *not* (a limit, a benchmark, a price).

## Shop constants fixed here (reused by every later design topic)
- Orders per day: 2,000,000 (the hook's own number).
- Peak-to-average ratio: 5× (the hook's own number).
- Clickstream events per order: 10 (the hook's own number).
- Bytes per event: 500 (a modest JSON clickstream event).
- Replication factor: 3× (the hook's own number).
- Compaction/write-amplification overhead: 1.3× (illustrative, named as a planning value, not a measurement of a specific engine — real amplification is Chapter 5's own subject).
- Retention (events): 90 days hot/queryable (topic 4 will add warm/cold tiers).
All fixed and asserted in `examples.py`; every later design topic imports these, per `CHAPTER.md`'s own rule.

## Engagement arc
- Hook: step 1 (the "twenty-three orders a second, a laptop could do it" vs. "we need a cluster" disagreement).
- Predict: step 2, within the first four steps (which single multiplication the first estimate left out).
- Surprising number: peak-ratio and replication together move the design rate and storage by more than an order of magnitude from the naive "orders per second" read.
- Takeaways: step 4 (peak-to-average changes what you buy, not just what you expect), step 6 (Little's Law sizes real infrastructure, not just a formula), step 8 (a reference number is only useful with its own ceiling named).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the shop is told "about two million orders a day, with some clicks" — one engineer says a laptop could do it, another says the opposite; who's right?
- **On screen:** the estimate sheet, empty, with the raw ask ("two million orders a day") at the top.
- **Narrator's line of thought:** she doesn't resolve it yet — she names exactly which number the "laptop" reading used (orders per second, mean) and which the "cluster" reading implied (clicks, peak, replication), and leaves the gap between them open.

### 2. Predict
- **fig:** which single multiplication did the "a laptop could do it" estimate leave out that changes the answer by more than an order of magnitude?
- **Options:** (a) it forgot to divide by seconds per day [wrong — that's the one step it got right]; (b) it counted orders, not the clickstream events each order carries, and never applied the peak ratio or replication [correct].

### 3. Reveal — the estimate chain, one row per beat
- **fig:** orders per day → events per day (×10 clicks) → mean rate (÷86,400) → design rate (×5 peak) → bytes/day (×500) → storage with retention and replication.
- **Moves:** the estimate sheet fills one row per beat, the dominant row (the one that moved the answer most — replication × retention, not the mean rate) lit and counted up at the end.
- **Values:** every number from `examples.py`'s `capacity_chain()`.

### 4. Reveal — the peak-to-average ratio, isolated
- **fig:** the same chain, run once at the mean rate and once at the design rate — side by side, what does the five-times difference actually change (what you provision, not just what you expect on an average Tuesday)?
- **takeaway:** "A system sized for the mean falls over on an ordinary busy afternoon — the peak-to-average ratio is what you actually provision for."

### 5. Reveal — Little's Law
- **fig:** the design rate, times a stated processing time per event, equals the number of events in flight at any instant (`L = λW`) — drawn as a pipe filling to that count.
- **Narrator's line of thought:** she derives what "in flight" means operationally (buffer memory, open connections, live consumer slots) before naming the formula, so the formula lands as a consequence, not a definition to memorize.

### 6. Reveal — sizing consumers and a connection pool from Little's Law
- **fig:** the in-flight count, divided by what one consumer or one pooled connection can actually hold, gives the real count to provision — not a round number picked by feel.
- **takeaway:** "Little's Law isn't a formula to memorize — it's how many consumers, connections or queue slots this design rate actually requires."

### 7. Reveal — the reference numbers, each with its own ceiling named
- **fig:** three dated numbers side by side — a 2014 single-producer Kafka benchmark, today's S3 per-prefix request floor, and a scan rate measured right here on this machine's own DuckDB — each tagged "this is a ... not a ...".
- **Narrator's line of thought:** she insists on the tag for each one (a decade-old benchmark upper bound, not a planning figure; a floor, not a ceiling; a local measurement, not a vendor claim) because conflating any of the three is the exact mistake a design built on borrowed numbers makes.

### 8. Reveal — using a reference number correctly vs. incorrectly
- **fig:** two uses of the Kafka number side by side: "our cluster will do 800K events/sec" (wrong — that benchmark's own machines, not this design's) vs. "a single partition won't bottleneck us at this design rate" (right — the actual, bounded claim the number supports).
- **takeaway:** "A reference number answers one narrow question (does this bottleneck us) — it never substitutes for measuring your own system."

### 9. Recap
- **fig:** the full chain from orders to storage, the peak ratio's effect, Little's Law sizing consumers, and the three reference numbers each with its ceiling.

### 10. Prove it
- **fig:** a second business tells the shop's own engineer "we get about the same order volume, but every order is reviewed by three different approval services before it ships" — what does that change in the estimate chain, and where does the answer move the most?
- **predict options:** (a) it changes the events-per-order multiplier (three approval-service calls become three new events per order) and the dominant mover is still the chain's multiplication, not a new kind of arithmetic [correct]; (b) it requires an entirely new formula, since approvals aren't clicks [wrong, tempting because "approval" sounds qualitatively different from "clickstream"].

## Post-notes headings
- **Internals:** Little's Law's own derivation sketch (why it holds for any stable queueing system, not just this one), and why the stability condition (arrival rate below service rate) matters.
- **Lab:** this topic's own `examples.py` — exercise: change one shop constant and watch which row of the chain moves most.
- **Production:** the "reference number without its ceiling" failure mode — provisioning directly off a blog post's number is this topic's own named anti-pattern.
- **Frontier:** none claimed; these are stable, decades-old techniques (Little's Law is from 1961).
- **Where this goes next:** hands off to choosing the data-flow shape (topic 3), which needs this topic's design rate and the freshness SLO together.

## Concept ledger
- **Introduces:** `capacity-estimate-chain`, `peak-to-average-sizing`, `littles-law-inflight-sizing`, `dated-reference-numbers`.
- **Uses:** `ask-to-slo-translation`, `six-dimension-requirement-checklist` (topic 1, this chapter). `latency-percentiles` (Chapter 1, live).
- **Declared (not yet live anywhere in `registry.ts` to resolve against):** `littles-law`, `bandwidth-delay-product`, `throughput-vs-latency`, `latency-numbers`, `memory-hierarchy`, `latency-bandwidth-cost`, `transfer-pricing` (chapter plan names these as Chapter 1 ids, but Chapter 1's own registry entries use different concept-id spellings that don't match — see Changes below), `read-write-amplification`, `lsm-compaction-rum` (Chapter 5 — chapter 5 is partially live but these exact ids weren't found), `connection-pool-sizing` (Chapter 4), `object-storage-billing-model` (Chapter 3). A seam pass should re-resolve these once a full id audit runs.

## Changes from the chapter plan
`CHAPTER.md`'s `uses` list names several Chapter 1/3/4/5 concept ids by their descriptive role (e.g. "amplification multipliers," "pool sizing") rather than registry spelling, and this topic could not confirm an exact id match for several of them without risking a wrong guess (SKILL.md §1: cross-chapter ids are "not guessed"). All moved to `declared` with this note, rather than asserting an unverified `uses` id. No scope was cut.

## Claims list (for fact-check)
1. LinkedIn (2014): the benchmark's own hardware (six-core 2.5GHz Xeon, six 7200RPM SATA drives JBOD, 32GB RAM, 1Gb Ethernet, three machines). — SOURCES.md §1.
2. LinkedIn (2014): single-producer, no-replication throughput of 821,557 records/sec. — SOURCES.md §1.
3. LinkedIn (2014): single-producer, 3x async-replication throughput of 786,980 records/sec — barely lower per client. — SOURCES.md §1.
4. LinkedIn (2014): "the total data written to network or disk is three times higher" under 3x replication, even though per-client throughput barely drops. — SOURCES.md §1.
5. AWS S3: at least 3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD requests/sec per partitioned prefix, no limit on prefixes per bucket. — SOURCES.md §2.
6. AWS S3: ten prefixes can parallelize to 55,000 reads/sec (the guide's own worked example). — SOURCES.md §2.
7. A warehouse scan rate of roughly 1.4 billion rows/second, measured directly in `examples.py` against this sandbox's own in-memory DuckDB summing a 64-bit column over 20 million rows — disclosed as an in-memory, single-column-scan ceiling on this specific machine, not a disk-backed or vendor figure.
8. Little's Law (`L = λW`): the average number of items in a stable system equals the arrival rate times the average time each spends in it — framing only (J. D. C. Little, 1961), not independently re-derived here.
