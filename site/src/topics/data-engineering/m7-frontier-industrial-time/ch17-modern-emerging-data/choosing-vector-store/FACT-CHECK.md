# Fact-check — de.choosing-vector-store

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | pgvector's own README describes it as "open-source vector similarity search for Postgres." | pgvector GitHub README | Verified, quoted |
| 2 | pgvector's own README on HNSW: better query performance than IVFFlat (speed-recall trade-off), but slower build times and more memory. | pgvector GitHub README | Verified, quoted |
| 3 | pgvectorscale's own README: it complements pgvector and introduces StreamingDiskANN, inspired by Microsoft's DiskANN research. | pgvectorscale GitHub README | Verified, quoted |
| 4 | Milvus's own README: a high-performance vector database built for scale, able to scale horizontally and handle tens of thousands of search queries on billions of vectors. | Milvus GitHub README | Verified, quoted |
| 5 | Qdrant's own README: tailored for extended filtering support; written in Rust. | Qdrant GitHub README | Verified, quoted |
| 6 | Weaviate's own documentation: hybrid search combines a vector search and a keyword (BM25F) search by fusing the two result sets. | Weaviate documentation, Hybrid search | Verified, quoted |
| 7 | Pinecone's own "How Pinecone Works" page: a serverless architecture built on object storage with an LSM-tree-based storage system; pods are legacy, serverless is current. | Pinecone, How Pinecone Works | Verified, quoted |
| 8 | An independent, dated (9 March 2026) comparison: pgvector is the default recommendation for teams already running Postgres, avoiding a second data store's operational complexity. | Encore, Best Vector Databases in 2026 | Verified, quoted; labeled as one independent write-up, not a primary benchmark |
| 9 | The same comparison: a dedicated engine becomes the better choice once a workload exceeds what a single Postgres instance handles comfortably (hundreds of millions of vectors, high concurrent throughput, auto-scaling, or per-tenant isolation needs). | Encore, Best Vector Databases in 2026 | Verified, quoted |
| 10 | (This course) a six-axis decision procedure, coded as a real function and run against the shop's own stated corpus, a hypothetical billion-vector multi-tenant corpus, and a mid-size managed-preference corpus, reaches three distinct, justified recommendations. | This topic's own examples.py (measured) | Measured in this sandbox |

## Currency check

- Every vendor documentation quote (pgvector, pgvectorscale, Milvus, Qdrant, Weaviate, Pinecone)
  is read from each project's own live GitHub README or documentation page at research time (30
  October 2026), not from a cached or historical snapshot; each is presented as that vendor's own
  description of its own system, never as an independently verified performance claim.
- The Encore comparison write-up is dated 9 March 2026 on its own byline, read and labeled
  explicitly in this topic (FACT-CHECK and SOURCES.md) as "independent, dated," per CHAPTER.md's
  own sourcing instruction, not as a primary benchmark the way the vendor pages are primary for
  their own architecture claims.
- CHAPTER.md's own scope line is explicit that "every specific latency/recall number a vendor or
  benchmark publishes is treated as 'that vendor's own benchmark,' never repeated as a fact about
  the category" — this topic follows that instruction by quoting only architectural/design claims
  from vendor pages (what each system is built for, how it stores and serves vectors), never a
  vendor's own latency or recall number, and by naming the one independent comparison's own
  latency figures in FACT-CHECK's red team (below) specifically as unverified and not reused in
  the reel.

## Red team

1. **Does naming Milvus, Qdrant, Weaviate and Pinecone's "strengths" risk repeating vendor
   marketing as fact?** The topic is careful to source each claim to that vendor's own
   architecture documentation describing what the system is *built for* (filtering, hybrid search,
   managed serverless storage), never a comparative performance number. CHAPTER.md's own
   instruction — treat every vendor-published number as "that vendor's own benchmark" — is
   followed by not quoting any vendor's own latency/recall figures at all in this topic's claims.
2. **Is the six-axis decision procedure's outcome (pgvector for the shop, Milvus for the
   hypothetical corpus) just a restatement of "pgvector wins small, Milvus wins big"?** No — the
   procedure in examples.py checks all six axes independently and a third test case (a mid-size,
   managed-preference corpus) lands on neither pgvector nor Milvus but on Pinecone, specifically
   because of the operational-ownership axis, not size alone. This demonstrates the procedure is
   sensitive to more than just corpus size.
3. **Is it fair to search for latency figures (e.g., "12ms Qdrant, 16ms Weaviate") during research
   and then exclude them from the topic?** Yes, deliberately — those figures appeared only in
   uncredentialed blog posts with no stated methodology (confirmed during research), which is
   exactly the "benchmark marketing" this topic warns against trusting. Excluding them is the
   topic's own lesson applied to its own sourcing, not an oversight.
4. **Does quoting pgvectorscale's README risk conflating what pgvectorscale changes vs. what base
   pgvector already does?** The topic is explicit in Internals (post-notes.md) that
   pgvectorscale's own README describes itself as *complementing* pgvector with a new,
   disk-backed index type — not replacing or redefining pgvector's own HNSW/IVFFlat indexes, which
   are quoted from pgvector's own README separately.
5. **Could the encore.dev comparison's own recommendation (pgvector as "default" for Postgres
   teams) be circular with this topic's own six-axis conclusion on the shop's corpus?** The two
   are independent: this topic's own procedure (examples.py) reaches its pgvector recommendation
   from the six stated axes applied to the shop's specific numbers, not by citing the comparison
   write-up's general advice — the write-up is used only as one named, dated source confirming
   that the same general guidance exists independently in the wild, exactly as CHAPTER.md's
   sourcing line asks for ("one independent, dated comparison write-up... labelled explicitly as a
   secondary, vendor-adjacent source rather than a primary benchmark").

## Problem Solving

Direct `github.com` URLs for pgvector, pgvectorscale and Qdrant returned HTTP 403 in this sandbox
(a recurring, domain-wide GitHub web-page limitation, not specific to any one repository);
substituted `raw.githubusercontent.com` URLs for the same files, which fetched cleanly — the same
workaround already documented for GitHub wiki pages in this project's tooling notes. Direct
`milvus.io` documentation pages returned HTTP 302 redirect loops in this sandbox; substituted
Milvus's own GitHub README (also primary, also Milvus's own words) for the same architectural
claims rather than a third-party description. All six vendor sources and the one independent
comparison were otherwise fetched and quoted word-for-word on the first attempt; no claim
required a substitution of content, only of URL.
