# Fact-check — de.global-manufacturing-telemetry-platform

## Claims re-derived against the source

1. **Facebook's monitoring systems generated more than two billion unique time series of
   counters, with about twelve million data points added per second, as of spring 2015.**
   SOURCES.md's quote supports this directly. Checked step 3's capacity-estimate reveal cites this
   as the scale the published compression figure comes from, never presented as this topic's own
   manufacturing-platform numbers.
2. **At sixteen bytes per point, the resulting storage volume would be too resource-intensive for
   practical deployment.** SOURCES.md's quote supports this directly. Checked step 3 treats this
   as the uncompressed baseline the compression figure is measured against, not an assumed
   number.
3. **A two-hour block let Gorilla achieve a compression ratio of 1.37 bytes per data point, about
   a twelve-times reduction from the sixteen-byte baseline.** SOURCES.md's quote supports this
   directly. Checked step 3's reveal states this explicitly as a reference point for what
   telemetry compression can achieve, and explicitly not a promise for this topic's own signals —
   matching `CHAPTER.md`'s own instruction to quote it "not as a promise for this data."
4. **Prometheus's own guidance says to use labels to differentiate the characteristics of the
   thing being measured.** SOURCES.md's quote supports this directly. Checked step 6's reveal
   treats a label as exactly this: a characteristic of a measured signal, such as which asset it
   came from, not an arbitrary tag.
5. **Every unique combination of key-value label pairs represents a new time series, by
   Prometheus's own definition.** SOURCES.md's quote supports this directly. Checked step 6's
   cardinality-limit reveal defines series count exactly this way, not as a vaguer "lots of
   data" claim.
6. **Prometheus's own guidance warns against labels with high cardinality, such as user IDs or
   other unbounded value sets.** SOURCES.md's quote supports this directly. Checked step 6's
   reveal uses this warning as the reason the asset hierarchy's own identifiers are sized and
   bounded (by plant, line and machine count) rather than treated as an unbounded label.
7. **The capacity and cardinality estimate, the buffer-sizing arithmetic, the MQTT delivery-level
   choice, the plant-autonomy design, and the throttled catch-up are this chapter's own
   established method and this topic's own derived design.** Not an independent citation beyond
   claims 1-6 — `CHAPTER.md`'s own scope line states these as this topic's own worked design, not
   re-derived here.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("a bigger WAN link") is a genuine, plausible first
  instinct — more bandwidth sounds like it should help — but it's ruled out directly: a bigger
  link doesn't help once the link is actually down for four hours, and it does nothing for the
  reconnect flood either. The correct option names the two decisions the hook's own scenario
  lacked: plant-local autonomy during the outage, and a throttled, idempotent catch-up on
  reconnect.
- **Predict 2 (step 10, "Prove it"):** checked that "the WAN link itself" is ruled out against
  claim 1's own scale: the design already buffers through an outage regardless of link capacity,
  so the link's bandwidth isn't where ten times the sensor count actually bites first. The
  correct option (the hot store's own cardinality) follows directly from claim 5's definition —
  ten times the sensors means ten times the series count against the same label-driven limit.

## Illustrative numbers (figs for steps 1, 3, 4, 7, 10)

The hook's four-hour outage length and ninety-minute post-reconnect staleness, the per-plant
event rate and peak-to-average figures, the buffer-size arithmetic, the per-signal RPO and RTO
values, and the tenfold sensor-count growth in "Prove it" are illustrative, stated lab numbers for
the storyboard and the simulation in `examples.py`, not cited real-world figures from any
specific manufacturer's telemetry platform.

## Outcome

No open findings. Every claim about Facebook's own Gorilla system and Prometheus's own labeling
and cardinality rules traces to one of SOURCES.md's six verbatim quotes across two sources (the
Gorilla VLDB paper, Prometheus's own documentation); the capacity estimate, buffer sizing,
delivery-level choice, plant-autonomy, and catch-up designs rest on `CHAPTER.md`'s own stated
scope, not an unsourced factual claim; both predicts are checked against the topic's own cited
mechanisms rather than invented reasoning.
