# Sources

## AWS IoT Greengrass: "Manage data streams on Greengrass core devices"

URL: https://docs.aws.amazon.com/greengrass/v2/developerguide/manage-data-streams.html
Version: AWS IoT Greengrass V2 Developer Guide, retrieved 2026-10-31

The chosen real edge-gateway/broker-bridge product for this topic (per CHAPTER.md's sourcing
requirement: "the documentation of one real edge-gateway or broker-bridge product selected and
verified at research time"). An earlier attempt at the "Stream manager" component reference
page (.../stream-manager-component.html) fetched but was mostly a changelog/version-history
page with no usable conceptual quotes, so this page was used instead.

> Stream manager works in environments with intermittent or limited connectivity. You can define bandwidth use, timeout behavior, and how the AWS IoT Greengrass Core handles stream data when it is connected or disconnected.

> You can also set priorities to control the order in which the AWS IoT Greengrass Core exports streams to the AWS Cloud. This makes it possible for you to handle critical data sooner than other data.

> Data at rest. Stream data is stored locally in a storage directory.

Contents: a real gateway's own documentation of buffering under intermittent connectivity,
per-stream export priority (the basis for this topic's drop-by-priority policy), and local
disk persistence of buffered data (the basis for this topic's durable on-disk buffer).

## MQTT Version 5.0 (OASIS Standard)

URL: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html
Version: OASIS Standard, 7 March 2019, retrieved 2026-10-31

> If the Session Expiry Interval is absent the value 0 is used. If it is set to 0, or is absent, the Session ends when the Network Connection is closed.

> If the Session Expiry Interval is 0xFFFFFFFF (UINT_MAX), the Session does not expire.

> If present, the Four Byte value is the lifetime of the Application Message in seconds. If the Message Expiry Interval has passed and the Server has not managed to start onward delivery to a matching subscriber, then it MUST delete the copy of the message for that subscriber

Contents: Session Expiry Interval (§3.1.2.11.2) bounds how long a broker keeps a disconnected
client's session state; Message Expiry Interval (§3.3.2.3.3) is a separate, per-message
time-to-live. Together they are the basis for this topic's point that a buffer's own retention
policy is distinct from, and must be set independently of, any transport-level expiry.

## Eclipse Sparkplug 3.0.0 Specification

URL: https://sparkplug.eclipse.org/specification/version/3.0/documents/sparkplug-specification-3.0.0.pdf
Version: Eclipse Sparkplug 3.0.0, retrieved 2026-10-31

> an Edge Node may store data at the edge until a Primary Host Application comes back online. When the Primary Host Application publishes a new STATE message denoting it is online, the Edge Node can resume publishing data and also flush any historical data that it may have stored while offline.

Contents: the store-and-forward statement this topic's edge gateway implements directly — an
Edge Node buffering while its Primary Host is offline and flushing on reconnect. (Sparkplug's
own message sequence number is also referenced in this topic's scope, per CHAPTER.md, as too
small on its own for idempotent replay — its single byte, 0-255, wrapping counter is a design
constraint this topic's own wider `(source, t_device, seq)` key is built to avoid, not a claim
quoted from the spec.)

## Disclosed: registry ids not yet introduced by any shipped topic

URL: (none)

Three ids this topic's `uses` list would otherwise cite are not introduced by any shipped
topic yet, all traceable to Chapter 15 topic 24 (`manufacturing-telemetry-platform-design`),
which has not shipped:

- `edge-buffer-sizing-from-outage`
- `plant-autonomy-and-catch-up`
- `manufacturing-telemetry-platform-design`

All three are omitted from this topic's `uses` list in `registry.ts` rather than cited against
a topic that does not exist. `manufacturing-telemetry-platform-design` is the same recurring
gap already disclosed in topic 17's SOURCES.md/OUTLINE.md.

## Disclosed: in-course anchors named by CHAPTER.md are not external fetches

URL: (none)

CHAPTER.md's own Sources line names Chapter 15 topic 24 (`manufacturing-telemetry-platform-design`)
and Chapter 14 topic 13 (`de.exactly-once-as-end`, "Exactly-once as an end-to-end property") as
in-course anchors for this topic, not sources to fetch and quote externally. Chapter 14 topic 13
has shipped and is linked directly in `prerequisites.mdx`. Chapter 15 topic 24 has not shipped yet
(see the disclosed-gap section above), so it cannot be linked and is covered by that disclosure
instead.
