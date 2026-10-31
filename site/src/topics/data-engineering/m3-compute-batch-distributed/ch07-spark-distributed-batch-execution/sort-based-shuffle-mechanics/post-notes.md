<section data-section="outcomes">

## Outcomes

Draw the shuffle grid for a given M (map tasks) by R (reduce partitions): one sorted data file
plus one index file per map task, and M times R logical blocks fetched across the network to
assemble it on the reduce side. Given a slow-shuffle symptom, say which of the four cost sources —
disk I/O, network transfer, serialisation, or the sheer count of small blocks — it most likely
points to, instead of treating "the shuffle" as one undifferentiated cost.

</section>

<section data-section="internals">

## Bounded in-flight fetch requests

A reducer does not fetch its M blocks all at once. Spark's `ShuffleBlockFetcherIterator` bounds how
many requests and how many bytes can be outstanding at a time (`spark.reducer.maxReqsInFlight` and
the matching bytes-in-flight setting), precisely because an unbounded fan-out across M times R small
blocks would itself overwhelm a handful of map-side executors' connections. This is the same cost
this topic names in the abstract — too many small blocks — showing up as a concrete scheduling
decision on the fetch side, not just a disk-write decision on the map side.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating "the shuffle is slow" as one cause.** This topic's own grid names four separate costs —
disk, network, serialisation, small-block count — that can each dominate independently. A team that
throws more executor memory at a shuffle bottlenecked on small-block request overhead will see
nothing change, because memory was never the constrained resource.

**Growing reduce partitions without noticing the multiplication.** Doubling `spark.sql.shuffle.partitions`
does not double shuffle cost — it multiplies the existing map-task count by it. This topic's own
measured jump (four map tasks, ninety-seven buckets, three hundred eighty-eight blocks) is the
smallest demonstration of a cost that grows fast once either dimension gets large in production.

</section>

<section data-section="frontier">

## Frontier

Push-based shuffle (server-side pre-merging of small blocks before a reducer ever fetches them) and
the external shuffle service both exist specifically to blunt the O(M×R) small-block cost this topic
names directly. Neither is built here; they are named as the mechanism's own answer to the problem
this topic measures, for whichever later topic or chapter takes them up.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This topic measured what a shuffle writes and how a reducer finds it, but said nothing about which
executor actually gets assigned to run which task, or how evenly the scheduler spreads that work.
The next topic is exactly that: locality levels, delay scheduling, and the two parallelism settings
that decide how many tasks a stage actually runs.

</section>
