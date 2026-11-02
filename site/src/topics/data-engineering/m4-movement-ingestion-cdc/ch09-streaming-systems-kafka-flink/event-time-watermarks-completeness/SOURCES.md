Sources fetched and quoted for `de.event-time-watermarks-completeness`.

## The Dataflow Model (Akidau et al., 2015, VLDB)

URL: https://www.vldb.org/pvldb/vol8/p1792-Akidau.pdf

> most watermarks must be heuristically defined based
> on limited knowledge available.

> watermarks themselves have two
> major shortcomings with respect to correctness:

> They are sometimes too fast, meaning there may be
> late data that arrives behind the watermark.

> For many
> distributed data sources, it is intractable to derive a
> completely perfect event time watermark, and thus impossible to rely on it solely if we want 100% correctness
> in our output data.

## Generating Watermarks (Apache Flink, 1.20 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/event-time/generating_watermarks/

> If one of the input splits/partitions/shards does not carry events for a while
> this means that the WatermarkGenerator also does not get any new information
> on which to base a watermark. We call this an idle input or an idle source.

> In that case, the watermark will be held back, because it is
> computed as the minimum over all the different parallel watermarks.

> a split/partition/shard or
> source may process records very fast and in turn increase its watermark relatively faster than the
> others.

> such operator might need to buffer excessive amount of
> data coming from the fast inputs, as the minimal watermark from all of its inputs is held back by
> the lagging input.

> In order to address the issue, you can enable watermark alignment, which will make sure no
> sources/splits/shards/partitions increase their watermarks too far ahead of the rest.

Notes on this topic's research: the Dataflow Model PDF extracts cleanly except for a few passages
where in-paper figure text interleaves mid-sentence (a known PDF-extraction artifact, not a
sandbox fetch failure); quotes above were chosen to land entirely inside clean, complete
sentences, avoiding any such interleaved break. The specific MillWheel/Dataflow Model lineage and
history is named per CHAPTER.md's own "Leaves out" note (belongs to the Milestone 4 "Systems in
Production" material) rather than retaught here. What a downstream window operator does once a
watermark passes (closing, emitting, waiting for lateness) is topics 18-19's territory, named but
not retaught.
