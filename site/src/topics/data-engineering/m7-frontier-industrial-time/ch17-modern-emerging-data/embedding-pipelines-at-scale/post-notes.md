<section data-section="outcomes">

## Outcomes

Measure one local embedding model's throughput and derive its cost per million tokens at a
stated batch size and hardware; re-embed only the chunks whose content hash changed after an
edit and show the cost saved against re-embedding the whole corpus; propagate a document
deletion to a tombstoned vector and show it is no longer retrievable; design a dual-index
backfill for a simulated embedding-model change with no downtime.

</section>

<section data-section="internals">

## Internals

"The Embedder's Dilemma" states its own cost method plainly: "We measure maximum-throughput token
processing on an H100 80GB at sequence length 512 (largest fitting batch) and compute cost as
rGPU /T, where rGPU = $2.49/hr (Lambda Labs H100 spot, March 2026) and T is tokens per hour,"
benchmarking 26 embedding models this way and reporting costs that "range from $0.00016/MTok
(mE5-small, 118M parameters, 4.3M tok/s) to $0.047/MTok (F2LLM-v2-14B, 14.7K tok/s)." This topic's
own `examples.py` applies that identical formula to a real, CPU-bound numpy encoder stand-in timed
on the build machine — never claimed as a GPU-scale measurement, only as the same method at a
smaller, disclosed scale. An API-based service bounds throughput differently: OpenAI's own
documentation states that "your usage tier determines how high these limits are set," with its
text-embedding-3-large "Build" tier capped at 1,000,000 tokens per minute — a cap that binds
regardless of how much idle compute sits elsewhere, unlike a GPU's throughput ceiling. On deletes,
Qdrant's own FAQ describes "soft deletes using a bitmask, so the index is not rebuilt after each
deletion," with the point "immediately inaccessible via the API" right after; its background
optimizer later performs physical cleanup. A model-change backfill follows the same no-downtime
shape Qdrant describes for an HNSW rebuild: "queries continue to be served by the old index until
the new index is complete, so there is no downtime" — except a model change needs two full,
separate indexes (the old model's vectors are not comparable to the new model's), not one index
rebuilt in place.

</section>

<section data-section="lab">

## Lab

This topic hosts no lab of its own, by design: the syllabus's full embedding/index lab needs the
*(skipped)* mechanism topics (embedding models and versioning, chunking, the vector index itself).
This topic's own `examples.py` measurements are its executable evidence, run on a synthetic
400-chunk, mostly-closed support-ticket corpus: a real CPU-bound encoder stand-in's measured
throughput, applied to the paper's own cost formula at a disclosed smaller scale; a comparison
showing the same large backlog is compute-bound on this machine but rate-limit-bound through an
API tier's own cap; one edited ticket triggering exactly one re-embedded chunk out of four hundred
by content-hash comparison; a deleted document's vector no longer matching itself in search after
being tombstoned; and a simulated dual-index backfill where the old index answers every query
during the build, followed by a cut-over, with the old and new model's vectors for the identical
chunk showing no meaningful cosine alignment.

</section>

<section data-section="production">

## Production failures this topic warns about

**Quoting a benchmark's headline number without its method.** A cost-per-million-tokens figure
means nothing detached from the sequence length, batch size and hardware rate it was measured
against — the same model on different hardware, or a different batch size, produces a different
number entirely.

**Deleting the document but not the vector.** A search index that still returns a document's
vector after the document itself is gone is not a performance problem; it is the exact same
correctness failure as data that should not be visible staying visible.

</section>

<section data-section="frontier">

## Frontier

The *(skipped)* "Embedding models and versioning" topic would explain *why* two models' vectors
are incomparable in the first place (different training, different coordinate spaces) — this
topic states the consequence plainly and builds the backfill procedure on top of it, without
re-deriving the mechanism. Chunking strategy and the vector index's own recall/latency/memory
trade-offs are likewise *(skipped)*; topic 7 picks a store without teaching index internals.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Fresh vectors still have to live somewhere a query can search. The last question before this
chapter leaves embeddings behind is not which index algorithm to run — the syllabus does not ask
for that here — but which kind of store to run it in at all, decided from the shape of your
corpus and your traffic rather than a benchmark chart.

</section>
