# Outline

## Scope mapped to steps

1. Hook: the same machine, two plants — one onboards in months, the other in days.
2. Predict: what did the typed model carry that the tag list didn't?
3. Reveal: nodes joined by typed references, browsed down to one variable's value, unit and type.
4. Reveal: a companion specification makes that same path the same at any plant.
5. Reveal: a monitored item's absolute deadband reports far fewer notifications than polling the same signal.
6. Reveal: PubSub decouples publisher from subscriber, so its message count doesn't scale with subscribers the way client/server's does.
7. Reveal: security mode None is a finding, not a default — the spec's own default exists to stop it being accidental.
8. Recap.
9. ProveIt (second predict: given only the browsed model's own fields, can the plant's equipment hierarchy be rebuilt from it?).

## Why this topic has 9 steps, not 10

This topic has no lab of its own (CHAPTER.md: "none of its own; the browse and subscribe
measurements feed topic 17's lab inputs"), and its own prediction belongs right after the hook
(CHAPTER.md's own hook already poses it), so the Predict step is placed second rather than fourth —
still within the first four steps the build's engagement rule requires. A ninth step, Prove It,
supplies the second predict a full topic needs.

## The registry gap (ninth of this chapter, same handling each time)

CHAPTER.md's `uses` line names `queues-vs-logs` (Chapter 5). Verified by grep before writing this
file: the id doesn't exist in any topic's `introduces` array in `registry.ts` yet — Chapter 5's own
queues-vs-logs topic hasn't shipped. This topic omits it from its own `uses` list rather than
claiming a topic that hasn't shipped — the same pattern as topics 6, 10, 11, 12, 14 and 15's prior
gaps.

## The "150+" companion specification count

CHAPTER.md attributes a "150+" count to the OPC Foundation's own landing page. That figure wasn't
found at a stable, fetchable URL at research time (see `SOURCES.md`); this topic states only that
OPC UA has multiple companion specifications, backed by the one example it actually fetched and
dated (OPC 40501-1, Machine Tools, v1.02.0, 2024-11-01), rather than repeating an unverified count.

## What this topic leaves out (per CHAPTER.md)

The message layer above (MQTT, Sparkplug, Unified Namespace: topic 17); the historian (topic 18);
edge buffering (topic 19); the Asset Administration Shell (topic 20); the OPC UA binary and JSON
encodings and the full service set; certificate PKI operations.
