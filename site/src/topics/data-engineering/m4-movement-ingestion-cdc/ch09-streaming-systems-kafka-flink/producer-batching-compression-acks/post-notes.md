<section data-section="outcomes">

## Outcomes

A real toy accumulator, racing a byte-count limit against a linger clock for one thousand
records, issues one thousand requests with no artificial wait at all and five hundred requests
at a five-millisecond wait — half as many requests for the identical data, with average batch
size roughly doubling. The same compressor (`zstandard`), run once on a single synthetic
order-event record and once on a full eighty-record batch of the same shape, shrinks the lone
record by roughly a third and the full batch by better than twelve times over — direct, run
evidence that compression is a batch-level win, not a per-record one. Routing the identical nine
hundred keyless records into the same three partitions either round-robin or sticky (KIP-480's
own default-partitioner behavior) measures average batch sizes of two records and five records
respectively. A toy leader with two followers, each replicating strictly behind it, crashes
after writing two hundred and one records: an `acks=1` producer believed every one of them was
durable and loses eight; an `acks=all` producer never believed more than one hundred and
ninety-three were durable in the first place, and loses none of them — a direct, measured
illustration of why Kafka's own client defaults changed to `acks=all` in version three-oh.

</section>

<section data-section="lab">

## Lab

This topic hosts the producer-side half of the 9.1 chapter lab (`CHAPTER.md`): its batching
numbers feed directly into topic 3's own loss-counting experiment as the write-side baseline.
`examples.py` builds four small, independent simulations — a single-partition accumulator race,
a real compression-ratio comparison using the `zstandard` and `lz4.frame` libraries themselves,
a sticky-vs-round-robin partition-fill comparison, and a toy leader-crash scenario comparing
`acks=1` against `acks=all` — and asserts every number this topic's reel shows, rather than
printing a value that was never checked.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating `linger.ms` as free latency to spend.** Raising it well past a few milliseconds adds
real, felt delay to every record sent while the system is not under load — the producer config
documentation says this outright ("in the absence of load" a larger `linger.ms` is pure added
latency). The win this topic measures shows up specifically when batching reduces request count
enough to offset the wait, which is a load-dependent trade, not a free lunch.

**Assuming `acks=all` alone makes retries safe.** `acks=all` only decides when a write counts as
durable; it says nothing about what happens if the producer retries a write the broker actually
already received. That is `enable.idempotence`'s job (named here, required to be paired with
`acks=all`, taught in full at topic 10) — this topic's acks simulation deliberately does not
model retries at all, to isolate the one claim it needs.

</section>

<section data-section="frontier">

## Frontier

`max.in.flight.requests.per.connection` (Kafka's real default is five concurrent in-flight
requests per connection, not the single in-flight slot this topic's toy accumulator uses) lets
several batches travel at once, which changes the request-count math this topic's simulation
simplifies away — named here as a real knob with real ordering implications once retries are
involved, not measured, since modeling it correctly needs the idempotence mechanism topic 10
teaches in full.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

`acks=all` means waiting for every in-sync replica, not just the leader. What makes a replica
count as in-sync, and what happens when one falls behind or a leader dies, is the next topic.

</section>
