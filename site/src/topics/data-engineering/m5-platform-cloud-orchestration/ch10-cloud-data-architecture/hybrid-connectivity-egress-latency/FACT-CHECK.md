# Fact-check: Hybrid connectivity, egress and latency

1. **AWS Direct Connect speed range.** "50 Mbps and scaling up to 400 Gbps" — SOURCES.md,
   AWS Direct Connect Features. Confirmed verbatim.
2. **Dedicated vs hosted connection speeds.** Dedicated: 1/10/100/400 Gbps Ethernet ports.
   Hosted (via a Direct Connect Partner): 50 Mbps-25 Gbps. — SOURCES.md, same page. Confirmed.
3. **Direct Connect pricing factors.** "capacity, port hours, and data transfer out (DTO)"
   when connecting to a region/VPC/Transit Gateway or Local Zone; data transfer in is $0.00/GB.
   — SOURCES.md, AWS Direct Connect Pay-as-you-go Pricing. Confirmed verbatim.
4. **EC2 egress free tier and cross-AZ rate.** 100 GB/month free, $0.01/GB cross-AZ each
   direction — reused from topic 6's own already-fact-checked SOURCES.md entry for the same
   AWS EC2 pricing page; re-verified present verbatim in this topic's own SOURCES.md copy.
5. **MirrorMaker 2 mechanism and guarantees.** Built on Kafka Connect; replicates consumer
   groups with offsets, preserves partitioning, is fault-tolerant and horizontally scalable;
   inter-cluster replication differs from intra-cluster replication; `isolation.level=
   read_committed` is the documented way to filter aborted-transaction records on the mirrored
   side. — SOURCES.md, Apache Kafka Geo-Replication docs (versioned URL, fetched after the
   canonical redirect URL returned only redirect boilerplate — see Errors in session notes).
   Confirmed verbatim.
6. **Bandwidth-delay product definition and TCP window-scale limit.** BDP = capacity (bits/sec)
   x round-trip delay (sec) = max data in flight; insufficient data in flight under-utilises the
   link; unscaled TCP window is capped at 65,535 bytes. — SOURCES.md, Wikipedia
   "Bandwidth-delay product" (a standard networking reference, used per CHAPTER.md's "RFC 1323
   or a standard networking reference" sourcing allowance). Confirmed verbatim, split across two
   blockquotes to avoid a glued footnote-marker artifact in the raw page text.
7. **Reused, not re-derived:** topic 21's `on-prem-modern-stack` / `data-gravity-on-prem-tradeoff`
   (steady, high-utilisation workloads favour on-prem), topic 20's
   `ot-edge-buffer-backpressure-isolation` (an edge buffer isolates OT from IT backpressure),
   topic 19's `sap-extraction-mechanism-choice` (SAP Note 3255746 — trigger/log-based delta
   mechanism over plain OData), topic 18's residency/sovereignty/localisation distinction. None
   re-fetched or re-quoted here; each is cited by its own topic's id/source.

## Red-team

- **Is the BDP demo's "parallel beats single" result just thread-scheduling noise, not the
  real mechanism?** No — the link's `max_in_flight_chunks=8` semaphore caps how many chunks a
  single stream can have in flight at once regardless of thread count, so a lone stream is
  bound by its own one-chunk-at-a-time round trip while 8 parallel streams can each hold a slot
  concurrently; this mirrors the real reason a single TCP stream under-uses a high-BDP link
  without window tuning or parallelism (SOURCES.md, Wikipedia BDP claim 3 in OUTLINE.md).
- **Does the WAN-failure drill's "no loss, no duplication" proof depend on an unrealistic
  unbounded local backlog?** Disclosed as unbounded for the drill's four-hour window; MirrorMaker
  2's real buffering is bounded by configured retention and consumer lag limits, which is named
  as the real system's constraint in post-notes.md rather than claimed to be reproduced exactly.
- **Does "egress pricing" claim 3 overstate by asserting cross-AZ and internet egress are
  priced identically?** No — the EC2 pricing claims used here are the same ones already
  fact-checked for topic 6 and are quoted for the specific transfer types they describe (internet
  egress free tier; cross-AZ rate), not generalized beyond what the quote states.
