# Outline: Hybrid connectivity, egress and latency (`de.hybrid-connectivity-egress-latency`)

## Changes from the chapter plan

CHAPTER.md's scope quote for this topic matches `syllabus/data-engineering.md` line 657
word for word — confirmed by direct read of the syllabus file. No discrepancy to disclose.

Two disclosed departures from a literal reading of "run it":

- **Bandwidth-delay product / single-stream-vs-parallel-streams demo** is run as a structural
  simulation: a local TCP-like link with an injected, artificial round-trip delay (`time.sleep`
  on each simulated packet, not a real WAN). Real `tc`/`netem` kernel-level traffic shaping
  needs root and a network namespace this sandbox does not grant; the shape of the result
  (parallel streams saturate a delayed link where a single stream cannot) is the same either
  way, and the simulation is disclosed as such in `examples.py` and post-notes.md.
- **Cross-WAN replication buffer-and-ordering drill** uses a local, in-process queue standing
  in for the WAN link and MirrorMaker 2's own buffering behaviour, per CHAPTER.md's own Lab
  description ("a local queue standing in for the WAN link"). This is the lab as specified, not
  a shortcut.

The lab's ADR (architecture-decision record) for the fictional 3-plant German manufacturer is
written as prose inside this file's "Lab" section below, reel.tsx's lab steps, and
post-notes.md's Production section — not as a separate LAB.md/ADR.md file. Confirmed by
checking topics 16 and 18 (the chapter's other two lab-hosting topics): both use the same
12-file set with the lab's reasoning in prose and its mechanism in `examples.py`, no separate
document file exists anywhere in the repo for a topic lab.

## Claims to fact-check

1. AWS Direct Connect: speeds from 50 Mbps to 400 Gbps; dedicated connections use 1/10/100/400
   Gbps Ethernet ports; hosted connections (via a Direct Connect Partner) run 50 Mbps-25 Gbps.
2. AWS Direct Connect pricing has three factors for connecting to a region or local zone:
   capacity, port hours, and data transfer out (DTO); data transfer **in** is $0.00/GB.
3. EC2 egress: 100 GB/month free to the internet (aggregated across services/regions, excluding
   China/GovCloud); cross-AZ transfer is $0.01/GB in each direction (both reused from topic 6's
   already-fact-checked sources).
4. Kafka's MirrorMaker 2 replicates consumer groups (with offsets), preserves partitioning, and
   is fault-tolerant and horizontally scalable; it is built on the Kafka Connect framework;
   inter-cluster replication is a different mechanism from intra-cluster replication; filtering
   aborted-transaction records on the mirrored side requires `isolation.level=read_committed`.
5. Bandwidth-delay product (Wikipedia, citing the standard networking definition): the product
   of a link's capacity (bits/second) and round-trip delay (seconds), equal to the maximum data
   in flight (sent but unacknowledged) at any instant; a sender that doesn't keep enough data in
   flight relative to the BDP leaves the link underutilised; the TCP window-scale option exists
   because the unscaled window is capped at 65,535 bytes.
6. Topic 21's data-gravity reasons (`data_gravity`, `ot_proximity`, `sovereignty`,
   `steady_utilisation`) and topic 20's OT edge-buffer isolation mechanism are reused, not
   re-derived, as the `uses` list states.

## Engagement arc

- **Hook:** a cross-WAN replication link is cut for four hours during planned maintenance
  nobody told the data team about. When it reconnects, the question that matters is not "did we
  lose data" but "can we prove, with numbers, that we didn't" — which this topic's drill answers
  rather than assumes.
- **Early prediction (within first 4 steps):** before showing the buffered-catch-up proof, ask
  which of a few plausible outcomes the reconnection actually produces (e.g. does order survive,
  does anything duplicate).
- **Mechanism steps:** interconnect-vs-VPN tradeoff; bandwidth-delay product and the
  single-vs-parallel-stream throughput demo; the WAN-failure buffered-catch-up drill itself
  (doubling as the chapter's closing lab mechanism); latency-budget allocation; the data-gravity
  decision rule as the closing synthesis.
- **Takeaways (≥3, ≤20 words each):** on BDP/parallel streams, on what MirrorMaker-2-style
  replication buffers and guarantees across a failure, on latency-budget allocation.
- **Recap + Prove it:** recap ties the ADR's four prior-topic threads together; prove-it predict
  revisits the drill's row-count/ordering proof under a changed parameter.

## Concept ledger

- **Introduces:** `bandwidth-delay-product`, `cross-wan-replication-failure-buffer`,
  `latency-budget-allocation`.
- **Uses:** `cloud-cost-four-dimensions` (topic 6), `on-prem-modern-stack` and
  `data-gravity-on-prem-tradeoff` (topic 21), `ot-edge-buffer-backpressure-isolation` (topic 20),
  `residency-sovereignty-localisation` (topic 18), `sap-extraction-mechanism-choice` (topic 19),
  `short-lived-federated-credential` (topic 4, `de.workload-identity-least-privilege`),
  `dynamic-short-lived-db-credential` (topic 5, `de.secrets-management-pipelines`).
- **Declared:** none beyond topic 21, per CHAPTER.md.

## Lab: the ADR and the failure drill

**Setting (fictional, no real company):** a 3-plant German manufacturer, the shop's B2B
customer introduced in topics 19-21. The ADR records four decisions already taught by the
chapter and pulls them into one design:

1. **SAP extraction path** (topic 19): chosen under SAP Note 3255746's licensing-and-limits
   constraint — a trigger- or log-based delta mechanism, not plain OData, because the OData
   layer can silently miss deletes.
2. **OT ingestion** (topic 20): plant-floor data crosses the IT/OT boundary through an
   industrial DMZ with an edge buffer that isolates the OT source from IT-side backpressure.
3. **Hybrid split and cost** (topic 21, reused here): the steady, always-on analytics load
   stays on-prem (data gravity plus a lower steady-state cost per topic 21's own worked
   comparison); bursty, non-sensitive reporting loads burst to an EU-region cloud leg.
4. **Residency and works-council constraints** (topic 18's Deep dive): EU-resident personal
   data (plant HR/attendance feeds) must not cross to a non-EU region, and works-council
   co-determination rights apply to any system processing employee data — both named as
   binding constraints on where the cloud leg may legally sit, not re-derived here.

**The connection itself (this topic's own contribution):** a dedicated interconnect (not a
VPN) between the primary plant and the EU-region cloud leg, sized from the steady-state
replication volume; its bandwidth-delay product computed and used to justify parallel-stream
replication instead of a single stream; a latency budget derived backward from the near-real-time
OEE dashboard's end-to-end SLO, leaving the WAN hop its share and the rest for processing.

**The drill:** a local queue stands in for the WAN link. The replication producer keeps writing
ordered, numbered records while the link (queue) is cut for a simulated four-hour outage; the
producer continues buffering locally (bounded, per MirrorMaker-2's own buffering behaviour)
instead of blocking; on reconnection the buffered backlog drains in order. `examples.py` asserts,
by row count and ordering, that nothing sent before or during the outage is lost or duplicated by
the time the catch-up finishes.
