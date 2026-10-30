<section data-section="outcomes">

## Outcomes

Place pgvector/pgvectorscale, Milvus, Qdrant, Weaviate, Pinecone and a hybrid search engine by
what operational and architectural trade-off each represents, not by a benchmark number; walk the
six-axis decision procedure (corpus size, filter complexity, update rate, tenancy, latency SLO,
operational ownership) on a stated corpus and justify a choice; redo the same procedure on a
different, larger corpus on paper and reach a different, justified answer; name "benchmark
marketing" and say what about a vendor's own published number should and shouldn't be trusted.

</section>

<section data-section="internals">

## Internals

Each system's own documentation describes a different architectural bet. pgvector's own README
calls itself "open-source vector similarity search for Postgres," with its HNSW index offering
"better query performance than IVFFlat... but... slower build times and uses more memory" —
pgvectorscale's own README describes itself as complementing pgvector by introducing
"StreamingDiskANN, inspired by the DiskANN algorithm, based on research from Microsoft," a
disk-backed index for when HNSW no longer fits in memory. Milvus's own README describes itself as
built to "scale horizontally, handle tens of thousands of search queries on billions of vectors,"
at real operational cost (etcd, object storage, a message queue as its own dependencies). Qdrant's
own README states it is "written in Rust" and "tailored for extended filtering support." Weaviate's
own documentation describes hybrid search as combining "the results of a vector search and a
keyword (BM25F) search by fusing the two result sets" as a first-class capability. Pinecone's own
"How Pinecone Works" page describes its current architecture as "serverless, built on object
storage with decoupled storage and compute," noting plainly that "pods are Pinecone's legacy
architecture."

</section>

<section data-section="lab">

## Lab

This topic hosts no lab of its own, by design: the syllabus's full §17.1.1 lab needs the
*(skipped)* index-mechanism topics. This topic's own six-axis decision procedure is coded as a
real function in `examples.py` and run against three distinct corpora: the shop's own small,
simple, own-ops corpus (lands on pgvector), a hypothetical two-billion-vector, high-update,
strictly multi-tenant corpus (lands on a sharded dedicated engine), and a mid-size,
managed-preference corpus (lands on the managed option) — three different, justified answers from
the identical procedure.

</section>

<section data-section="production">

## Production failures this topic warns about

**Picking a vector store from a benchmark chart instead of your own numbers.** A vendor's
published number is real at the configuration that vendor tested; nothing about it says whether it
transfers to a different corpus size, update rate, filter complexity or tenancy model.

**Treating "best" as if it were a property of the engine rather than of the fit.** The same engine
that is the obvious right answer for a ten-thousand-vector corpus can be the wrong one entirely for
a two-billion-vector, multi-tenant corpus, and vice versa — the six axes, not the engine's
reputation, decide.

</section>

<section data-section="frontier">

## Frontier

One independent, dated comparison write-up (Encore, 9 March 2026) is read here explicitly as a
secondary, vendor-adjacent source: it agrees with this topic's own procedure that "pgvector is the
default recommendation for teams that already have Postgres in their stack," and that a dedicated
engine becomes the better choice "once a workload exceeds what a single Postgres instance handles
comfortably." It is cited for confirming the general guidance exists independently, not as a
primary benchmark the way each vendor's own architecture documentation is primary for its own
system.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This chapter leaves the model's side of the platform here — the syllabus's own next three
subsections (production RAG, reverse ETL, graph data) are not taught in this course. What does
continue is the warehouse underneath all of it, and the question of who it actually serves: the
analysts and dashboards this course has built toward since Chapter 3, and the contract that
decides where data engineering's job ends and theirs begins.

</section>
