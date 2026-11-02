# Outline

## Scope mapped to steps

1. Hook: an edge node loses power mid-shift; the dashboard keeps showing 211 for twenty minutes, then the node restarts and every metric is recorded twice.
2. Predict: what two Sparkplug fields tell a consumer the node died and that it restarted?
3. Reveal: QoS 0 loses messages with no duplicates; QoS 1 loses nothing but can duplicate — measured against a real killed connection to a real Mosquitto broker.
4. Reveal: the retained message is why the dashboard trusted a dead node; the Will is the death certificate the broker publishes on an ungraceful disconnect.
5. Reveal: a real Sparkplug B Protobuf NBIRTH carries every metric and sequence 0; NDATA's sequence number increments and wraps 255 back to 0; `bdSeq` correlates a birth to its death.
6. Reveal: a host that sees a skipped sequence number detects a gap and asks for a rebirth.
7. Reveal: the Unified Namespace is one topic tree, mirroring the equipment hierarchy, where every system publishes to one place and every consumer reads from one place.
8. Reveal: a broker holds only the current retained value — no history, no replay — so a durable log has to sit behind it.
9. Recap.
10. ProveIt (second predict: given only a broker's retained values and no durable log behind it, can a consumer that joins after an outage recover what it missed?).

## Why Predict is at step 2, not step 4

CHAPTER.md's own hook already poses the question this topic answers ("what two Sparkplug fields
tell a consumer that the node died and that it restarted?"), so the first Predict is placed
immediately after the Hook rather than after three Reveal steps — still within the first four
steps (index 1) the build's engagement rule requires. Topic 16 used the same placement for the
same reason (a hook that poses its own question).

## The two registry gaps this topic's `uses` list omits (tenth and eleventh of this chapter)

CHAPTER.md's `uses` line names ten ids. Verified by checking every topic's `introduces` array in
`registry.ts` before writing this topic's own `uses` list:

- `queues-vs-logs` (Chapter 5) — still not introduced by any shipped topic. Recurs from topic 16's
  own disclosed gap (same id, re-checked, still missing).
- `manufacturing-telemetry-platform-design` (Chapter 15 topic 24) — the per-signal QoS choice that
  topic deferred to here; Chapter 15 topic 24 has not shipped yet.

Both ids are omitted from `registry.ts`'s `uses` list and disclosed in `SOURCES.md` rather than
pointed at a topic that hasn't shipped.

## Sandbox check this topic made that most of this chapter couldn't

Unlike every TSDB/historian engine and OPC UA library in this chapter (all sourced-only or
hand-built-structure-only), Mosquitto (the MQTT broker), `paho-mqtt` and `protoc`/`protobuf` are
all installable in this sandbox — confirmed directly with `apt-get`/`pip` before assuming
otherwise, per the standing instruction left after topic 16. `examples.py` therefore runs a real
local Mosquitto broker as a subprocess and measures QoS 0/1 loss and duplication, retained
delivery and Will delivery against it, rather than simulating broker behaviour from a description.

## The real Sparkplug B schema, not a guessed structure

The Sparkplug B Protobuf payload (`sparkplug_b.proto`, `sparkplug_b_pb2.py`) is the genuine,
fetched Eclipse Tahu reference schema (EPL-2.0), compiled with `protoc`, not a hand-guessed
message shape. `build_nbirth`/`build_ndata` construct real `spb.Payload()` messages with real
`metrics`, so the NBIRTH/NDATA structure in this topic is byte-for-byte what a conformant edge
node would publish.

## What this topic leaves out (per CHAPTER.md)

OPC UA's model (topic 16, used as the upstream); edge buffering mechanics, the 10-minute WAN
outage and ordered replay (topic 19, which hosts that leg of the §16.3 lab); the process historian
(topic 18, which hosts the swinging-door leg); Kafka internals (Chapter 9); MQTT-over-WebSocket and
broker clustering internals; Sparkplug's full state machine beyond birth, death, sequence and
rebirth (DBIRTH/DDATA/DDEATH and the Primary Host's own `STATE` mechanics are named from the
specification but not simulated — no lab in this topic asks for them).
