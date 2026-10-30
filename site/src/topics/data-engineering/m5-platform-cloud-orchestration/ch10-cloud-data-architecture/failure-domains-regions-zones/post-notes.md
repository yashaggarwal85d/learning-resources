---
id: de.failure-domains-regions-zones
title: 'Failure domains: regions, zones, cells'
---

<section data-section="outcomes">

## Outcomes

- Say, for a named cloud service, whether it is zonal, regional or multi-regional, and what survives a single-zone outage.
- Price a cross-zone replication link from its gigabyte volume.
- Explain what a cell buys over "the whole region" as the unit of blast radius.

</section>

<section data-section="internals">

## Internals

- **A Region is a cluster of Availability Zones, not a single building.** AWS's own documentation: "Each AWS Region consists of a minimum of three, isolated, and physically separate AZs within a geographic area," and each AZ is "one or more discrete data centers with redundant power, networking, and connectivity." That nesting — a Region containing several independent AZs — is the whole shape of "failure domain" this topic teaches.
- **Why synchronous replication between zones is even possible.** AZs are "physically separated by a meaningful distance, many kilometers... although all are within 100 km (60 miles) of each other." That distance bound is small enough that the round trip between zones stays low, which is why a database can replicate synchronously across zones without the latency penalty a cross-region write would pay.
- **The metro-fiber detail.** AWS describes AZs within a Region as connected over "fully redundant, dedicated metro fiber," with all inter-AZ traffic encrypted — the physical layer underneath every "multi-AZ" marketing claim.
- **Multi-regional is a third tier, not a bigger regional.** Google Cloud's own documentation separates zonal, regional and multi-regional resources as three distinct tiers, each with its own blast-radius and latency trade-off; a multi-regional resource survives an entire region's loss, which neither a zonal nor a regional resource promises.
- **The limit this topic doesn't hide.** A region, zone or cell boundary is a human-drawn abstraction over physical infrastructure. It does not, by itself, stop a sufficiently large, correlated physical event — a regional power-grid failure, a submarine-cable cut affecting several regions' connectivity at once — from crossing it. "Multi-region" buys protection against more of these events than "multi-zone" does, at a real latency and consistency cost this course's distributed-systems chapters take up in full.

</section>

<section data-section="production">

## Production

A common, real-shaped incident: a team provisions a managed relational database and assumes, because "the cloud handles availability," that it is deployed across zones by default. On that service's standard tier, multi-zone replication is an explicit, billed, opt-in configuration — the default is a single zone. The team discovers this only during a zone-wide outage, when the database goes dark along with everything else pinned to that zone, while the object storage and the message queue sitting next to it in the architecture diagram keep running without anyone having configured anything for them. The fix is not technical, it is a habit: before trusting a service with availability, read its own documentation's specific failure-domain guarantee for the tier actually provisioned, not for the product name in general.

</section>

<section data-section="frontier">

## Frontier

AWS's own published Guidance for cell-based architecture describes the pattern this topic's closing figure draws from: a routing layer that redirects each client to its assigned cell by an HTTP redirect, with the user-to-cell mapping stored redundantly across a fixed number of independent clusters; a fixed number of independent, fixed-size cells, each holding the full application logic and storage for its slice of users; per-cell monitoring and alerting, aggregated on a central dashboard that tracks how many cells are healthy; automated cell creation and update, with every change deployed first to a single canary cell before the rest; and a rebalancer that can move users between cells and spin up new cells as load grows, leaving a marker on the old cell so a client that still has the old address gets redirected rather than dropped. The guidance frames the whole pattern explicitly as a change in which failure domain a user sits in: instead of every user sharing one business system's failure domain, each user sits in one cell's failure domain, a strictly smaller slice of the whole system.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

"Regional" has carried this whole refresher as a synonym for "survives a zone failure." It says nothing yet about the much more exact question the next topic asks: what does a read actually see the instant after a write to that regional store, and can two objects even be swapped atomically? Object storage's real consistency and write guarantees — and the date they changed — are the floor every table format taught later in this course is built on, and they are the very next topic.

</section>
