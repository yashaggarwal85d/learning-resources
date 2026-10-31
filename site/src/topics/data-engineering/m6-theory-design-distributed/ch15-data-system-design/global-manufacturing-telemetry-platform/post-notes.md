<section data-section="outcomes">

## Outcomes

The shop gets a three-plant manufacturing telemetry platform built from the requirements
interview's own prompt: an SLO set for operator display freshness, history completeness and
outage tolerance; a capacity and cardinality estimate with a cited compression reference point;
three alternatives for the hot store; a store-and-forward and throttled catch-up plan with a
buffer sized from the outage length; a per-signal MQTT delivery choice; an asset-context join
with its own cost; a plant-autonomy design with a recovery target per signal class; a per-site
residency rule; and a failure table. The next bottleneck at ten times the sensor count is named
as the hot store's own cardinality, not the WAN link.

</section>

<section data-section="internals">

## Internals

None claimed independently here. The industrial data model, OPC UA, MQTT and Sparkplug,
historians, time-series compression and storage engines, edge buffering, and sensor-data quality
are each named as a forward pointer to a later chapter, never used as a concept before that
chapter introduces them. The method steps, the requirements interview that elicits this design's
own prompt, the streaming-anomaly design built on top of this platform, and regional-platform
mechanics are each named as built on, not re-derived here.

</section>

<section data-section="lab">

## Lab

None of its own as a separate syllabus lab leg; the requirements interview is a prior topic's
own. The capacity and cardinality estimate, the buffer-sizing arithmetic, and the catch-up
simulation (a buffered outage replayed with and without a throttle) are this topic's executable
evidence. `examples.py`'s own lab: `fleet_event_rate()` and `storage_bytes_per_year()` build the
capacity estimate; `buffer_size_bytes()` sizes the edge buffer; `series_cardinality()` sizes the
hot store's own limit; `catch_up_peak_rate()` compares a throttled catch-up against an
unthrottled one.

</section>

<section data-section="production">

## Production failures this topic warns about

**A design that never planned for the link going down.** A cloud-only pipeline treats the WAN
link as always available, so the first real outage blanks every plant's dashboard with nothing
local to fall back on.

**A catch-up with no throttle.** Replaying an entire outage's backlog as fast as the network
allows just moves the outage's own damage from the outage itself to the moment the link comes
back.

</section>

<section data-section="frontier">

## Frontier

None claimed. Store-and-forward edge buffering, per-signal delivery levels, and throttled
idempotent catch-up are each established practice, not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A platform that collects and stores the readings is half the system. The other half decides, as
the readings arrive, whether a line is drifting out of spec, for hundreds of thousands of series
with no human watching each one. That is the last design of the chapter: real-time quality and
anomaly monitoring.

</section>
