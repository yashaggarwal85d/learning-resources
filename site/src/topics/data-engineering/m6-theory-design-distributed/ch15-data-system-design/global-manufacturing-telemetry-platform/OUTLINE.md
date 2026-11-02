# OUTLINE: Global manufacturing telemetry platform (`de.global-manufacturing-telemetry-platform`)

## Learning outcomes
1. Build a capacity and cardinality estimate for a three-plant sensor fleet, with a stated
   compression reference point.
2. Design edge gateways with store-and-forward and size their buffer from an outage's length.
3. Choose a per-signal MQTT delivery level and an ingest path into a durable log.
4. Design plant-local autonomy with a throttled, idempotent catch-up, and a per-site residency
   rule.

## Engagement arc
- Hook: step 1 (a cloud-only streaming pipeline goes blank for every plant during a four-hour WAN
  outage, then floods on reconnect and stays stale for the rest of the afternoon).
- Predict: step 2, within the first four steps (which two design decisions would have kept the
  plants running and made the catch-up boring).
- Takeaways: step 4 (the buffer size comes from the outage length), step 7 (plant autonomy is a
  degraded mode with its own RPO and RTO), step 8 (catch-up without a throttle just moves the
  outage's damage to reconnect time).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the shop-floor lead asked for real-time dashboards; the platform team built a
  cloud-only streaming pipeline. A four-hour WAN outage blanks every plant's dashboard; on
  reconnect, the backlog floods the platform and the dashboards stay stale for the rest of the
  afternoon.
- **On screen:** a plant's dashboard going dark for the outage's full length, then a backlog
  spike on reconnect that keeps the dashboard stale well past when the link actually recovered.

### 2. Predict
- **fig:** which two design decisions, absent from the first version, would have kept the plants
  running and made the catch-up boring?
- **Options:** (a) a bigger WAN link, so the outage itself happens less often [wrong — a bigger
  link doesn't help once the link is actually down, and doesn't fix the reconnect flood either];
  (b) plant-local autonomy during the outage, and a throttled, idempotent catch-up on reconnect
  [correct].

### 3. Reveal — the capacity and cardinality estimate
- **fig:** events per second per plant and in total, the peak-to-average from a shift change or a
  line restart, bytes per event, a year of storage with replication, and the compression a
  published reference point suggests — stated as a reference, not a promise for this data.
- **Moves:** a per-plant rate building into a total, a storage bar shrinking once the stated
  compression reference is applied.

### 4. Reveal — the edge gateway's buffer, sized from the outage
- **fig:** a gateway buffers readings durably through a WAN outage and forwards them, in order,
  once the link returns; the buffer size is the outage length times the rate, with a stated
  drop-first policy once the buffer fills.
- **takeaway:** "The buffer size is a straight multiplication: an outage's length times the rate it has to hold."

### 5. Reveal — the protocol boundary and the delivery level
- **fig:** sensors speak OPC UA and MQTT; the design chooses where to translate (gateway or
  cloud) and the MQTT delivery level per signal class, then ingests into a durable log that
  decouples every plant from every consumer.
- **Moves:** a signal class matched against its own delivery-level choice, each landing in the
  same durable log regardless.

### 6. Reveal — two stores, a cardinality limit, and where the asset joins in
- **fig:** a hot time-series database for operators querying seconds-old data sits beside a
  lakehouse for history and analytics; cardinality is named as the hot store's own limiting
  resource, and each reading joins its asset-hierarchy context either early (at ingest) or late
  (at read).
- **takeaway:** "Joining the asset context early costs storage on every event; joining it late costs a lookup on every query."
- **Moves:** a query-shape decision card contrasting the TSDB, the warehouse and the lakehouse,
  with the early-versus-late join priced beside it.

### 7. Reveal — plant-local autonomy, and residency per site
- **fig:** the plant keeps its own local broker, a short-retention store and local alert rules
  alive without the cloud, with an RPO and RTO stated per signal class — a safety alarm held to a
  tighter bound than a quality metric; some sites' own data stays local by rule, with only an
  aggregate replicated upward.
- **takeaway:** "Plant-local autonomy during an outage is a degraded mode with its own recovery target per signal class, not an afterthought."

### 8. Reveal — the throttled, idempotent catch-up
- **fig:** on reconnect, the buffered backlog replays through the same idempotent ingest, with a
  throttle that keeps the catch-up from swamping the platform the moment the link returns.
- **takeaway:** "A catch-up with no throttle just moves the outage's own damage from the outage itself to the moment the link comes back."

### 9. Recap
- **fig:** the capacity and cardinality estimate, the buffer sized from the outage, the per-signal
  delivery choice, the hot-store-versus-lakehouse split, plant autonomy, and the throttled
  catch-up, side by side.

### 10. Prove it
- **fig:** the sensor count grows tenfold across the same three plants. What's the next
  bottleneck?
- **predict options:** (a) the WAN link itself, since more sensors means more data to send [wrong
  — the link's own bandwidth matters, but the design already buffers through an outage; the
  bottleneck shows up somewhere that doesn't buffer]; (b) the hot store's own cardinality, since
  ten times the sensors means ten times the series count against the same label-driven limit
  [correct].

## Post-notes headings
- **Internals:** none claimed independently — the industrial data model, OPC UA, MQTT and
  Sparkplug, historians, time-series compression and storage engines, edge buffering, and
  sensor-data quality are each named as a forward pointer to Chapter 16, never used as a concept
  before it is introduced there; the method steps (topics 1-9), the requirements interview
  (topic 11), the streaming-anomaly design on top (topic 25), and regional-platform mechanics
  (topic 18) are named as built on, not re-derived here.
- **Lab:** none of its own as a syllabus lab leg (the requirements interview is topic 11's own).
  The capacity and cardinality estimate, the buffer-sizing arithmetic, and the catch-up simulation
  (a four-hour buffer replayed with and without a throttle) are this topic's executable evidence.
- **Production:** the hook's own scenario (a cloud-only pipeline that blanks every plant on a WAN
  outage, then floods on reconnect) as the concrete shape "the design never planned for the link
  going down" takes in practice.
- **Frontier:** none claimed — store-and-forward buffering, per-signal delivery levels, and
  throttled idempotent catch-up are each established practice, not an emerging technique.
- **Where this goes next:** a platform that collects and stores the readings is half the system.
  The other half decides, as the readings arrive, whether a line is drifting out of spec, for
  hundreds of thousands of series with no human watching each one. That is the last design of the
  chapter: real-time quality and anomaly monitoring.

## Concept ledger
- **Introduces:** `manufacturing-telemetry-platform-design`, `edge-buffer-sizing-from-outage`,
  `asset-context-join-early-vs-late`, `plant-autonomy-and-catch-up`.
- **Uses:** the method concepts as in topic 12, plus `destination-interrogation-checklist` and
  `five-answers-that-change-the-design`, `multi-region-platform-design`,
  `replicate-vs-federate-decision` and `region-failover-beyond-bucket-replication`,
  `degraded-mode-design`, `rpo-rto-per-data-class`, `chunk-idempotent-checkpoint` and
  `throttle-backoff-signal`, `serving-store-by-query-shape`, `tiering-retention-designed-up-front`,
  `amplification-ledger`, `scd-type-2`, `pipeline-golden-signals` and `push-vs-pull-metrics` — all
  confirmed live via a Node.js script parsing `registry.ts`'s `introduces` arrays.
- **Declared:** `queues-vs-logs`, `hyperloglog-distinct-counting` — both Chapter 5 topics that
  remain unplanned; each reuses an exact placeholder id already introduced by prior topics for
  the identical gap, confirmed by grep. Neither is from Chapter 16, so `CHAPTER.md`'s own
  "Declared: nothing from Chapter 16" is unaffected; these two are separately unplanned.

## Changes from the chapter plan
`CHAPTER.md` states `Declared: nothing from Chapter 16`, meaning Chapter 16's own mechanisms are
forward pointers, never declared concepts. Two named `uses` ids from Chapter 5
(`queues-vs-logs`, `hyperloglog-distinct-counting`) resolve to a chapter that remains unplanned
on this site and so move to `declared`, consistent with the convention used for every other
topic's unplanned `uses` ids this session. No scope cut — this topic still treats every Chapter
16 mechanism strictly as a named forward pointer, per `CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. Facebook's monitoring systems generated more than two billion unique time series of counters,
   with about twelve million data points added per second, as of spring 2015. — SOURCES.md
   (Gorilla paper).
2. At sixteen bytes per point, the resulting storage volume would be too resource-intensive for
   practical deployment. — SOURCES.md (Gorilla paper).
3. A two-hour block let Gorilla achieve a compression ratio of 1.37 bytes per data point, about a
   twelve-times reduction from the sixteen-byte baseline. — SOURCES.md (Gorilla paper).
4. Prometheus's own guidance says to use labels to differentiate the characteristics of the thing
   being measured. — SOURCES.md (Prometheus docs).
5. Every unique combination of key-value label pairs represents a new time series, by Prometheus's
   own definition. — SOURCES.md (Prometheus docs).
6. Prometheus's own guidance warns against labels with high cardinality, such as user IDs or other
   unbounded value sets. — SOURCES.md (Prometheus docs).
