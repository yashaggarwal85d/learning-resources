# Outline — de.choosing-vector-store

## Outcomes (from CHAPTER.md)

Place pgvector/pgvectorscale, Milvus, Qdrant, Weaviate, Pinecone and a hybrid search engine by
what operational and architectural trade-off each represents, not by a benchmark number; walk the
six-axis decision procedure (corpus size, filter complexity, update rate, tenancy, latency SLO,
operational ownership) on a stated corpus and justify a choice; redo the same procedure on a
different, larger corpus on paper and reach a different, justified answer; name "benchmark
marketing" and say what about a vendor's own published number should and shouldn't be trusted.

## 10-step storyboard

1. **Hook.** Two teams both need vector search: one has ten thousand support tickets and a
   Postgres database already; the other has two billion product images across a thousand tenants
   with strict per-tenant isolation.
2. **Predict: is there one "best" vector database for both teams.** (Correct: no — the two teams
   need different answers, and naming "the best" is the wrong question before the six axes are
   even named.)
3. **Reveal: the six axes.** Corpus size, filter complexity, update rate, tenancy, latency SLO,
   operational ownership — criteria, not a score. No takeaway (reel test's reference step).
4. **Reveal: pgvector and pgvectorscale.** A Postgres extension, so a team already running
   Postgres gets vector search without a new system to operate; pgvectorscale's disk-backed
   StreamingDiskANN index closes the scale gap when HNSW no longer fits in memory. Takeaway.
5. **Reveal: the dedicated engines.** Milvus for the largest, sharded deployments at real
   operational cost; Qdrant for strong filtered search and straightforward self-hosting; Weaviate
   for hybrid search as a first-class feature; Pinecone as the managed, low-ops option whose cost
   is a vendor bill instead of ops time. Takeaway naming every vendor number as that vendor's own
   benchmark.
6. **Reveal: search engines and lakehouse-native options.** A text-search engine with vectors
   added, useful when hybrid search was already the main need; a lakehouse-native vector format as
   the "no separate database at all" option, at the cost of query latency. Takeaway.
7. **Reveal: walking the six axes on the shop's own corpus.** Small corpus, moderate update rate,
   a simple tenant model, a latency SLO well above what any option struggles with — the procedure
   lands on pgvector because of the shop's numbers, not because pgvector "won." Takeaway.
8. **Reveal: the same procedure on a different corpus.** A hypothetical billion-vector,
   high-update, multi-tenant corpus, walked through the identical six axes on paper, lands
   somewhere else entirely. Takeaway on the procedure being the lesson, not either answer.
9. **Recap.**
10. **Prove it.** A vendor publishes a benchmark showing their engine beats every competitor at
    every scale. What should and shouldn't be trusted about that number? (Correct: the number
    itself, at the vendor's own tested configuration, may be real — what shouldn't be trusted is
    that it transfers to a different corpus, update rate or tenancy model without rerunning the
    same six-axis procedure on your own numbers.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7, 8 (five takeaways).

## Post-notes headings

Outcomes; Internals (what each store is built for, by its own documentation); Lab (none of its
own — the worked decision procedure is its own evidence); Production failures this topic warns
about; Frontier (the independent comparison write-up, read as secondary); Where this goes next
(the warehouse and who it serves).

## Bridge / handoff

Bridge (answers topic 6's handoff verbatim): "Fresh vectors still have to live somewhere a query
can search. This topic is not which index algorithm to run — the syllabus does not ask for that
here — but which kind of store to run it in at all, decided from the shape of your corpus and your
traffic rather than a benchmark chart: pgvector inside Postgres, a dedicated engine, a search
engine with vectors added, or a lakehouse-native option."

Handoff (leads into topic 8): "This chapter leaves the model's side of the platform here — the
syllabus's own next three subsections (production RAG, reverse ETL, graph data) are not taught in
this course. What does continue is the warehouse underneath all of it, and the question of who it
actually serves: the analysts and dashboards this course has built toward since Chapter 3, and the
contract that decides where data engineering's job ends and theirs begins."

## Concept ledger

Introduces: `vector-store-decision-axes`, `pgvector-vs-dedicated-engine-tradeoff`,
`benchmark-marketing-skepticism`.
Uses: `embedding-batch-throughput-cost`, `content-hash-incremental-reembed`,
`vector-delete-tombstone-propagation`, `dual-index-model-backfill` (topic 6); storage-engine
vocabulary from Chapter 5 (§5.1-§5.2, not yet live — referenced by name only).
Declared: none beyond topic 6.

## Claims list (for FACT-CHECK.md)

1. pgvector's own README: "Open-source vector similarity search for Postgres."
2. pgvector's own README on HNSW: better query performance than IVFFlat (speed-recall trade-off),
   slower build times, more memory.
3. pgvectorscale's own README: complements pgvector, introduces StreamingDiskANN, inspired by
   Microsoft's DiskANN research.
4. Milvus's own README: a high-performance vector database built for scale, horizontally
   scalable, handling tens of thousands of search queries on billions of vectors.
5. Qdrant's own README: tailored for extended filtering support; written in Rust.
6. Weaviate's own documentation: hybrid search combines a vector search and a keyword (BM25F)
   search by fusing the two result sets.
7. Pinecone's own "How Pinecone Works" page: a serverless architecture built on object storage
   with an LSM-tree-based storage system; pods are its legacy architecture, serverless is current.
8. Encore's independent, dated (9 March 2026) comparison: pgvector is the default recommendation
   for teams already running Postgres, avoiding a second data store's operational complexity.
9. Encore's independent comparison: dedicated engines become the better choice once a workload
   exceeds what a single Postgres instance handles comfortably (hundreds of millions of vectors,
   high concurrent throughput, auto-scaling or per-tenant isolation needs).
10. (This course) the six-axis decision procedure, walked on the shop's own stated corpus and on a
    hypothetical larger one, reaching two different, justified answers from the same procedure.
