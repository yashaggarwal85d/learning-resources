# Sources

## MQTT Version 5.0 (OASIS Standard): retained messages (3.3.1.3)

URL: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html
Version: OASIS Standard, 7 March 2019, retrieved 2026-10-31

> If the RETAIN flag is set to 1 in a PUBLISH packet sent by a Client to a Server, the Server MUST replace any existing retained message for this topic and store the Application Message [MQTT-3.3.1-5], so that it can be delivered to future subscribers whose subscriptions match its Topic Name.

> If the RETAIN flag is 0 in a PUBLISH packet sent by a Client to a Server, the Server MUST NOT store the message as a retained message and MUST NOT remove or replace any existing retained message [MQTT-3.3.1-8].

Contents: the exact retained-message rule `demonstrate_retained_and_will` exercises against a real Mosquitto broker: a late subscriber receives the broker's own stored last value, not a replay.

## MQTT Version 5.0 (OASIS Standard): the three QoS levels (3.1)

URL: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html
Version: OASIS Standard, 7 March 2019, retrieved 2026-10-31

> "At most once", where messages are delivered according to the best efforts of the operating environment. Message loss can occur. This level could be used, for example, with ambient sensor data where it does not matter if an individual reading is lost as the next one will be published soon after.

> "At least once", where messages are assured to arrive but duplicates can occur.

> "Exactly once", where messages are assured to arrive exactly once. This level could be used, for example, with billing systems where duplicate or lost messages could lead to incorrect charges being applied.

Contents: the specification's own wording for QoS 0/1/2, including the billing-systems example for QoS 2 that the topic cites directly; `run_qos_experiment` measures QoS 0 and QoS 1's documented loss/duplication behaviour against a real killed connection.

## MQTT Version 5.0 (OASIS Standard): Will Delay Interval (3.1.3.2.2)

URL: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html
Version: OASIS Standard, 7 March 2019, retrieved 2026-10-31

> Followed by the Four Byte Integer representing the Will Delay Interval in seconds. It is a Protocol Error to include the Will Delay Interval more than once. If the Will Delay Interval is absent, the default value is 0 and there is no delay before the Will Message is published.

> If a new Network Connection to this Session is made before the Will Delay Interval has passed, the Server MUST NOT send the Will Message [MQTT-3.1.3-9].

Contents: the Will mechanism `demonstrate_retained_and_will` exercises (default delay 0, so the broker publishes the Will immediately on the ungraceful disconnect this topic simulates by killing the edge node's socket).

## Eclipse Sparkplug Specification, Version 3.0.0: NBIRTH requirements (§6.4.21-ish, Topics)

URL: https://sparkplug.eclipse.org/specification/version/3.0/documents/sparkplug-specification-3.0.0.pdf
Version: Eclipse Sparkplug 3.0.0, retrieved 2026-10-31

> The NBIRTH MUST include every metric the Edge Node will ever report on.

> The bdSeq number MUST start at zero and increment by one on every new MQTT CONNECT packet.

Contents: the NBIRTH completeness rule and the `bdSeq` rule `EdgeNodeState.birth` implements; `bdSeq` is the field the host uses to correlate an NBIRTH to the NDEATH sent as the MQTT Will.

## Eclipse Sparkplug Specification, Version 3.0.0: sequence number wrap (§5.4, Message Flow)

URL: https://sparkplug.eclipse.org/specification/version/3.0/documents/sparkplug-specification-3.0.0.pdf
Version: Eclipse Sparkplug 3.0.0, retrieved 2026-10-31

> This will become the starting sequence number which all following messages will include a sequence number that is one more than the previous up to 255 where it wraps back to zero.

Contents: the exact wrap-around rule `EdgeNodeState.next_data` implements and the test asserts at the 255 → 0 boundary.

## Eclipse Sparkplug Specification, Version 3.0.0: Host Application message ordering and rebirth (§5.9)

URL: https://sparkplug.eclipse.org/specification/version/3.0/documents/sparkplug-specification-3.0.0.pdf
Version: Eclipse Sparkplug 3.0.0, retrieved 2026-10-31

> A message with sequence number 3 MUST arrive before the Reordering Timeout elapses. If a message with sequence number 3 does not arrive before the timeout, a Rebirth Request should be sent to the Edge Node. This ensures that the session state is properly reestablished.

Contents: the gap-triggers-rebirth rule `SequenceGapDetector` reproduces (a skipped sequence number, not merely an out-of-order one still inside the reorder timeout, is what a real host treats as a gap worth a rebirth request).

## Eclipse Sparkplug Specification, Version 3.0.0: Primary Host Application and STATE (§3.5)

URL: https://sparkplug.eclipse.org/specification/version/3.0/documents/sparkplug-specification-3.0.0.pdf
Version: Eclipse Sparkplug 3.0.0, retrieved 2026-10-31

> Sparkplug Host Applications MUST publish STATE messages denoting their online and offline status.

Contents: the Primary Host / STATE mechanism named in the topic's scope line (an Edge Node watches its configured Primary Host's STATE to know when to store data at the edge and when to flush it) — not simulated in `examples.py` (no lab asks for it; §16.3's lab is hosted by topic 19's outage buffer), stated from the specification only.

## HiveMQ: "Architecting a Unified Namespace for IIoT: The Foundations" (secondary, vendor write-up)

URL: https://www.hivemq.com/blog/foundations-of-unified-namespace-architecture-iiot/
Version: retrieved 2026-10-31 (undated blog post)

> The Unified Namespace (UNS) offers an alternative approach to traditional industrial data architecture. Traditional methods typically follow the ISA 95 pyramidal network-and-system architectural model, which relies on propagating data upwards for centralized storage and subsequent analysis. In contrast, the Unified Namespace (UNS) approach externalizes contextualized data across various functional domains into a real-time semantic hierarchy, establishing a hub and spoke model that serves as a single source of truth for your business's current state and events.

> For your UNS, retained messages are critical; they ensure that the latest information on any topic is available for new participants, allowing them to access the current state and events within the UNS immediately upon joining without the need to wait, or in the case of MQTT Sparkplug, query devices and applications across the network.

Contents: as CHAPTER.md states, the Unified Namespace is a vendor-community pattern with no single normative source, so this write-up is used and labelled as a secondary description, not a standard; it is the source for `build_uns_topic_tree`'s shape (one tree, mirroring the equipment hierarchy, holding current retained values) and for the topic's framing of what a UNS replaces (point-to-point integrations) and does not provide (history).

## Disclosed: ISO/IEC 20237:2023 could not be fetched in this sandbox

URL: (none)

CHAPTER.md's Sources line asks for "ISO's ISO/IEC 20237:2023 page" to confirm that Sparkplug is the specification ISO adopted under that number. `https://www.iso.org/standard/86783.html` returned HTTP 403 in this sandbox on every attempt, including through a Wayback Machine mirror (`web.archive.org`, connection reset). The topic therefore cites Sparkplug by its own specification document (Eclipse Sparkplug 3.0.0, above) and states the ISO/IEC 20237:2023 designation as CHAPTER.md's own planning text names it, without independently verifying ISO's page at research time. This is disclosed rather than fabricated, following this chapter's established pattern for unreachable vendor/standards pages (topic 16's companion-specification count, topic 18's AVEVA PI pages).

## Disclosed: registry gaps in this topic's `uses` list

URL: (none)

Two ids this topic would otherwise cite are not yet introduced by any shipped topic in the registry, confirmed by checking every `introduces` array in `registry.ts`:

- `queues-vs-logs` (Chapter 5) — used/declared by several shipped topics (e.g. `de.exactly-once-as-end`, `de.distributed-sql-architecture`) but never itself introduced. Recurs from topic 16's own disclosed gap.
- `manufacturing-telemetry-platform-design` (Chapter 15 topic 24) — the per-signal QoS design choice CHAPTER.md says this topic answers; Chapter 15 topic 24 has not shipped yet.

Both ids are omitted from `registry.ts`'s `uses` list for this topic rather than fabricated or pointed at the wrong topic.
