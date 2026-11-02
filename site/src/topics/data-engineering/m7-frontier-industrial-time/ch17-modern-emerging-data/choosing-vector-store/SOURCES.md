## pgvector — GitHub README

URL: https://raw.githubusercontent.com/pgvector/pgvector/master/README.md

> Open-source vector similarity search for Postgres

> An HNSW index creates a multilayer graph. It has better query performance than IVFFlat (in terms of speed-recall tradeoff), but has slower build times and uses more memory.

## pgvectorscale — GitHub README (Timescale)

URL: https://raw.githubusercontent.com/timescale/pgvectorscale/main/README.md

> pgvectorscale complements [pgvector][pgvector], the open-source vector data extension for PostgreSQL, and introduces the following key innovations for pgvector data:

> A new index type called StreamingDiskANN, inspired by the [DiskANN](https://github.com/microsoft/DiskANN) algorithm, based on research from Microsoft.

## Milvus — GitHub README

URL: https://raw.githubusercontent.com/milvus-io/milvus/master/README.md

> is a high-performance vector database built for scale. It powers AI applications by efficiently organizing and searching vast amounts of unstructured data, such as text, images, and multi-modal information.

> Milvus can scale horizontally, handle tens of thousands of search queries on billions of vectors, and keep data fresh with real-time streaming updates.

## Qdrant — GitHub README

URL: https://raw.githubusercontent.com/qdrant/qdrant/master/README.md

> Qdrant is tailored for extended filtering support, making it useful for all sorts of neural-network or semantic-based matching, faceted search, and other applications.

> Qdrant is written in Rust

## Weaviate documentation — Hybrid search

URL: https://docs.weaviate.io/weaviate/search/hybrid

> Hybrid search combines the results of a vector search and a keyword (BM25F) search by fusing the two result sets.

## Pinecone — "How Pinecone Works"

URL: https://www.pinecone.io/how-pinecone-works/

> Pinecone uses a serverless architecture built on object storage (such as Amazon S3) with a Log-Structured Merge (LSM) tree-based storage system.

> Pods are Pinecone's legacy architecture. The current Pinecone architecture is serverless, built on object storage with decoupled storage and compute.

## Encore — "Best Vector Databases in 2026: Complete Comparison Guide" (independent, dated 9 March 2026)

URL: https://encore.dev/articles/best-vector-databases

> pgvector is the default recommendation for teams that already have Postgres in their stack. It avoids the operational complexity of a second data store and gives you transactional consistency that dedicated vector databases can't match.

> Your workload exceeds what a single Postgres instance handles comfortably (hundreds of millions of vectors, high concurrent query throughput, or requirements for auto-scaling and per-tenant isolation).
