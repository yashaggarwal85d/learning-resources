<section data-section="outcomes">

## Outcomes

The shop's "about two million orders a day, with some clicks" resolves through one estimate
chain into a design rate, a daily byte volume, and a storage figure — each row a real
multiplication (events per order, divide by seconds a day, the peak ratio, bytes per event,
retention and replication) rather than a single read of the headline number. Running the chain
at the mean rate versus the design rate shows exactly what the peak-to-average ratio changes: not
what the system is expected to do on an average day, but what it must be provisioned to survive
on a busy one. Little's Law (`L = λW`) turns the design rate and a processing time into a real
in-flight count, which divides down into an actual number of consumers, connections or queue
slots to provision — not a number picked by feel. Three reference numbers (a 2014 single-producer
Kafka benchmark, the current AWS S3 per-prefix request floor, and a warehouse scan rate measured
directly on this sandbox's own machine) are each carried with an explicit tag for what they are
not, and the topic shows the same benchmark number used once wrongly (as a direct capacity claim)
and once correctly (as the narrow, bounded claim it actually supports).

</section>

<section data-section="internals">

## Internals

Little's Law holds for any stable queueing system, not just this one: for any system where
arrivals and departures balance over the long run (the stability condition — arrival rate below
service rate), the average number of items present equals the arrival rate times the average time
each item spends in the system, regardless of the arrival process's distribution, the service
time's distribution, or the number of servers. That generality is exactly why it's useful here: it
applies identically to events sitting in a queue, connections held open in a pool, or requests
in flight between a client and a server, without needing a different formula for each.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` is the method's lab (topic 9 hosts the chapter's own assigned
lab). `capacity_chain()` and `little_s_law_sizing()` run the full chain as data and assert every
number the reel shows; `measure_warehouse_scan_rate()` is a real measurement against this
sandbox's own DuckDB, not a quoted figure. Try changing one shop constant (the peak ratio, the
events-per-order count, the retention window) and see which row of the chain moves the final
answer the most — it usually isn't the one that looks biggest on its own.

</section>

<section data-section="production">

## Production failures this topic warns about

**Provisioning directly off a blog post's number.** A benchmark like the 2014 Kafka post is a
real, valuable upper-bound illustration — on specific, now-old hardware, under a specific
workload. Treating "eight hundred thousand records a second" as a capacity promise for a brand
new cluster, rather than as evidence that one partition alone won't bottleneck a much smaller
design rate, is exactly the mistake step 8's two side-by-side uses of the same number are built
to make visible.

**Sizing for the mean instead of the peak.** The estimate chain's single most consequential
multiplier for most systems is the peak-to-average ratio, not the mean rate itself — and it's the
easiest row to accidentally skip, because the mean rate is usually the number a stakeholder states
first ("about two million orders a day"), while the peak ratio has to be asked for separately.

</section>

<section data-section="frontier">

## Frontier

None claimed. Little's Law is from 1961 and the capacity-estimation discipline this topic teaches
is decades old and stable; nothing here is an emerging technique. What does change, continuously,
are the dated reference numbers themselves — cloud request limits and prices move with provider
announcements, which is exactly why this topic insists every one of them carries its own date and
source rather than being memorized as a constant.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

With the load known, the first structural choice is when work happens: continuously as data
arrives, in scheduled batches, or some mix. The freshness SLO from the first topic and the
volumes from this one decide it. The next topic is choosing the data-flow shape.

</section>
