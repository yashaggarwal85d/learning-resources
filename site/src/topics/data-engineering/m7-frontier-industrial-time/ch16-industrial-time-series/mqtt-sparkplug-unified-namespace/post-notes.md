<section data-section="outcomes">

## Outcomes

QoS 0 and QoS 1 measured against a real Mosquitto broker under a killed connection: QoS 0 loses
messages with no duplicates, QoS 1 loses nothing but redelivers once. A retained message delivered
to a late subscriber and a Will message delivered on an ungraceful disconnect, both against the
same real broker. A real Sparkplug B NBIRTH, NDATA and the topic namespace built from the genuine,
compiled Eclipse Tahu Protobuf schema, with correct sequence numbers, `bdSeq`, and the 255-to-0
wrap. A host-side sequence-gap detector that triggers a rebirth request on exactly one skipped
number and stays silent on an unbroken run. A Unified Namespace topic tree sketched onto the
equipment hierarchy, and the broker's own limit stated: current value only, no history, no replay.

</section>

<section data-section="lab">

## Lab

`examples.py` starts a real Mosquitto broker as a subprocess. `run_qos_experiment` subscribes with
a persistent session, kills the raw socket the instant the first message arrives (before the
client can send its PUBACK), publishes the rest of the stream, then reconnects to see what
actually made it through — run at QoS 0 and QoS 1 and asserted both ways. `demonstrate_retained_and_will`
publishes a retained value, confirms a late subscriber receives it, then registers a Will and kills
an edge client's socket to confirm the broker publishes it. The Sparkplug section builds real
`spb.Payload()` messages (compiled from the fetched `sparkplug_b.proto`) through `EdgeNodeState`,
asserting NBIRTH's sequence 0 and metric completeness, NDATA's increment and 255→0 wrap, and the
topic namespace string. `SequenceGapDetector` is asserted against both a gapped and a clean
sequence. `build_uns_topic_tree` sketches a three-node UNS tree and asserts no node holds a
history list, only a current value.

</section>

<section data-section="production">

## Production failures this topic warns about

**Reading a retained value as if it were a live one.** The hook is the production shape of this
failure: a broker answers instantly with its last stored value whether or not the publisher is
still alive, which is exactly why a dashboard can trust a dead node for as long as nobody checks
for a Will or a sequence gap.

**Treating a Unified Namespace as a substitute for a durable log.** A broker's retained value is
the current state, not a record of what changed; a consumer that only reads the broker and goes
offline during an outage has no way to recover what it missed, because nothing in MQTT is keeping
that history for it.

</section>

<section data-section="frontier">

## Frontier

Unlike the rest of this chapter's vendor tools, Mosquitto, `paho-mqtt` and `protoc`/`protobuf` are
all installable in this sandbox, so this topic's MQTT and Sparkplug measurements run against a real
local broker and a real, compiled Protobuf schema rather than a from-scratch simulation. The
Sparkplug B schema is the genuine Eclipse Tahu reference implementation (EPL-2.0), not a guessed
structure. ISO's own ISO/IEC 20237:2023 catalogue page returned HTTP 403 in this sandbox (and
through a Wayback Machine mirror), so the ISO designation is stated from CHAPTER.md's own text,
not independently verified against ISO's page; the specification's normative content comes
directly from the Eclipse Sparkplug 3.0.0 PDF instead, fetched and quoted. The Unified Namespace
pattern has no single normative source (CHAPTER.md's own framing); this topic cites one vendor
write-up (HiveMQ) and labels it secondary. The Primary Host Application's own `STATE` mechanism is
named from the specification but not exercised in `examples.py` — no lab in this topic calls for it.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A broker carries the current value; a historian keeps the past. The next topic is the process
historian, the system that has stored plant data for decades, and the compression it applies
before it stores a single point: exception filtering, then swinging-door.

</section>
