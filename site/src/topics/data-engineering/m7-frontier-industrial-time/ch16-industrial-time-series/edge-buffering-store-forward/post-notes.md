<section data-section="outcomes">

## Outcomes

A durable, fsynced append-only buffer confirmed to survive a simulated restart, with buffer-size
arithmetic worked for a ten-minute and a four-hour outage at the same rate. A wider per-source
sequence key, in place of Sparkplug's own narrow one, shown to resolve a duplicate resend, a true
gap and a reordering in a single simulated replay. A catch-up throttle sized by Little's law so a
drained backlog never swamps live traffic. Drop-oldest, drop-newest and degrade buffer-full
policies compared under a fixed overflow with a safety-alarm priority rule, confirming a full
buffer never refuses its own source's write. A local rollup shown to extend the outage length a
fixed buffer can survive. A drifted device clock corrected on reconnect from an estimated offset.

</section>

<section data-section="lab">

## Lab

`examples.py` runs nine checks in sequence. `DurableBuffer` fsyncs every append to a plain file and
is read back, intact, by a freshly constructed object standing in for a restarted process.
`buffer_bytes_needed` confirms a four-hour outage needs exactly 24 times the bytes a ten-minute one
does at the same point rate. `replay_idempotent`, given a 50-message send that duplicates one point,
drops a different one entirely, and swaps two others out of order, delivers the 49 real points
exactly once, flags the hole left by the missing one, and fixes the reordering. `catchup_time_seconds`
and `throttled_replay_rate` apply Little's law to a 3,000-point backlog. `apply_drop_policy` compares
drop-oldest, drop-newest and degrade on a 120-point overflow against a 100-point capacity with ten
safety-alarm points scattered through it; degrade keeps every alarm, the age-based policies do not.
`rolled_up_points_for_outage` confirms a mergeable rollup turns the same four-hour outage's 72,000
raw points into 240 records. `estimate_clock_offset` and `correct_drifted_batch` recover a batch's
true gateway-frame time from a 90-second device-clock drift.

</section>

<section data-section="production">

## Production failures this topic warns about

**A sequence number too narrow for its own replay.** Sparkplug's own message sequence number is a
single byte, 0 to 255, and wraps every 256 messages — far too small to dedupe a buffered replay
spanning tens of thousands of points, which is exactly why this topic's own key widens it.

**A drop policy that ignores priority under real backpressure.** Drop-oldest and drop-newest treat
every point the same regardless of what it represents; when the buffer that just overflowed held a
safety alarm among ordinary readings, an age-only policy can discard the alarm while a routine
quality metric survives.

</section>

<section data-section="frontier">

## Frontier

AWS IoT Greengrass's Stream Manager is the one real edge-gateway product fetched and quoted at
research time, specifically its "Manage data streams on Greengrass core devices" page; an earlier
attempt at its component-reference page turned out to be mostly a changelog with no usable
conceptual quotes, so the richer conceptual page was used instead. Three registry ids this topic's
own `uses` list would otherwise cite — `edge-buffer-sizing-from-outage`, `plant-autonomy-and-catch-up`,
and `manufacturing-telemetry-platform-design` — are not introduced by any shipped topic yet, all
traceable to Chapter 15 topic 24 (the manufacturing telemetry platform design), which has not
shipped; they are omitted from `uses` and disclosed in `SOURCES.md`, the same recurring gap already
disclosed in topic 17. No real MQTT broker, Greengrass core or physical gateway was run; `examples.py`
simulates the buffer, replay and clock-correction mechanics directly from the sources' own described
behaviour.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A gateway can make a reading arrive intact, in order and late. It still arrives as a number with a
tag. The last topic of the chapter is how a machine is described to the outside world: the Asset
Administration Shell, its standardised submodels, and the role it plays in EU data spaces and the
digital product passport.

</section>
