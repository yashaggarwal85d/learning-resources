# Fact-check — de.embedding-pipelines-at-scale

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | "The Embedder's Dilemma" measures maximum-throughput token processing on an H100 80GB at sequence length 512 (largest fitting batch), cost = $2.49/hr (Lambda Labs H100 spot, March 2026) divided by tokens per hour. | arXiv 2608.12875 (COLM 2026) | Verified, quoted |
| 2 | The paper's Table 18 benchmarks 26 embedding models at sequence length 512 with maximum batch size, reporting throughput and cost per million tokens for each. | arXiv 2608.12875 | Verified, quoted |
| 3 | The paper's measured costs range from $0.00016/MTok (mE5-small, 4.3M tok/s) to $0.047/MTok (F2LLM-v2-14B, 14.7K tok/s). | arXiv 2608.12875 | Verified, quoted |
| 4 | A caller's usage tier determines how high OpenAI's own API rate-limit caps are set, and those caps rise automatically with usage and spend. | OpenAI API docs, text-embedding-3-large model page | Verified, quoted |
| 5 | OpenAI's text-embedding-3-large "Build" usage tier caps at 1,000,000 tokens per minute (TPM). | OpenAI API docs, text-embedding-3-large model page | Verified, read from the tier table |
| 6 | Qdrant implements deletions as soft deletes using a bitmask, so the index is not rebuilt after each deletion. | Qdrant documentation, Qdrant Fundamentals FAQ | Verified, quoted |
| 7 | Qdrant: after a delete operation, the point is immediately inaccessible via the API. | Qdrant documentation, Qdrant Fundamentals FAQ | Verified, quoted |
| 8 | Qdrant: queries continue to be served by the old index until a rebuilt index is complete, so there is no downtime. | Qdrant documentation, Qdrant Fundamentals FAQ | Verified, quoted |
| 9 | A real, CPU-bound numpy encoder stand-in, timed on this build machine at batch size 32 and sequence length 512, measures ~840K-880K tokens/sec; applying the paper's own $2.49/hr formula to that throughput gives ~$0.0008/MTok (disclosed as illustrative only, not a GPU estimate). | This topic's own examples.py (measured) | Measured in this sandbox |
| 10 | At that measured throughput, a 50M-token backlog is compute-bound on this machine (~1 minute) but rate-limit-bound through OpenAI's own 1,000,000 TPM ceiling (~50 minutes) — the API case is bound by the rate limit, not by compute. | This topic's own examples.py (measured) | Measured in this sandbox |
| 11 | One edited ticket out of a 400-chunk synthetic corpus triggers exactly one re-embedded chunk by content-hash comparison, the other 399 skipped. | This topic's own examples.py (measured) | Measured in this sandbox |
| 12 | A deleted document's own vector no longer matches itself in search after being tombstoned (it matched before the delete). | This topic's own examples.py (measured) | Measured in this sandbox |
| 13 | Two independently-initialized "models'" vectors for the identical chunk show cosine similarity near zero (no meaningful alignment), demonstrating that vectors from different models are not comparable. | This topic's own examples.py (measured) | Measured in this sandbox |
| 14 | During a simulated dual-index backfill, the old index answers every query issued while the new model's index is being built for the whole corpus — no query goes unanswered. | This topic's own examples.py (measured) | Measured in this sandbox |

## Currency check

- "The Embedder's Dilemma" is a COLM 2026 paper; its $2.49/hr Lambda Labs H100 spot rate is
  explicitly dated "March 2026" in the paper's own text, and this topic quotes it with that date
  attached rather than presenting it as a current price.
- OpenAI's rate-limit tier table (RPM/TPM by tier) is read from the live model documentation page
  at research time (30 October 2026); the topic names the specific tier ("Build") and number
  (1,000,000 TPM) it uses rather than treating the whole table as static, since OpenAI's own page
  states these limits "automatically increase" with usage.
- Qdrant's FAQ describes its *own* current implementation (soft-delete bitmask, background vacuum
  optimizer, HNSW rebuild-without-downtime via a minimal `ef_construct` change) — this topic
  presents it as how Qdrant specifically works, not as how every vector store necessarily works;
  CHAPTER.md's scope line asks for "a vector-database vendor's own documentation... read for its
  worked pattern," which is exactly how it's used here.

## Red team

1. **Is the throughput number ($840K-880K tok/sec) misleadingly compared to the paper's real GPU
   benchmark numbers (14.7K-4.3M tok/sec on an H100)?** No — the topic states explicitly, in the
   narration and in examples.py's own docstring, that this is a CPU-bound numpy stand-in on the
   build machine, not a real embedding model on real GPU hardware, and that the cost figure derived
   from it is illustrative of the *formula* only. It is never presented as a GPU-scale estimate or
   compared numerically against the paper's own Table 18 figures.
2. **Does the API-vs-GPU rate-limit comparison cherry-pick a corpus size (50M tokens) that makes
   the API look artificially slow?** The comparison's point is structural, not about a specific
   crossover size: an API's TPM ceiling is a fixed cap regardless of how much spare GPU compute
   exists elsewhere, so *some* large-enough backlog will always be rate-limit-bound through an API
   even when the identical token volume would be compute-bound on a GPU. 50M tokens is simply large
   enough to make that structural point visible and measurable in this sandbox.
3. **Does "two different models' vectors are not comparable" overclaim from one randomly
   initialized pair of toy encoders?** The claim is stated at the level CHAPTER.md itself states it
   ("stated here as a fact this topic's backfill section depends on, not re-derived") — the real
   mechanism (why two trained models' embedding spaces differ) is the *(skipped)* "Embedding models
   and versioning" topic. This topic's own measurement (near-zero cosine similarity between two
   independently-initialized stand-ins) demonstrates the *consequence* concretely without claiming
   to derive the underlying mechanism.
4. **Is calling Qdrant's `ef_construct`-bump rebuild a "dual index" accurate, or is this topic
   inventing a different mechanism than what Qdrant actually does?** The topic is explicit that its
   own dual-index simulation (old and new model index kept fully separate, serving different
   models' vectors, with an explicit cut-over) is this topic's own simplified teaching construction,
   built from the *pattern* Qdrant's FAQ shows (queries served by the old index until a new one is
   complete) — not a claim that Qdrant internally runs two full indexes for a model swap specifically
   (its own rebuild is same-model, different HNSW parameters).
5. **Does the content-hash experiment's 400x saving number generalize, or is it an artifact of
   this topic's own synthetic corpus having exactly one edited ticket?** The topic states the
   number as what was measured on this corpus, not as a universal ratio — the real claim (and the
   one CHAPTER.md asks for) is structural: skipped work scales with the number of *unchanged*
   chunks, so the saving ratio is corpus-shape-dependent and would differ on a corpus with a higher
   edit rate.

## Problem Solving

No source substitutions were needed; all three primary sources (the arXiv paper, OpenAI's model
page, Qdrant's FAQ) were fetched live and quoted word-for-word on the first attempt. The real
engineering problem was the complete absence of an embedding-model library or GPU in this sandbox:
rather than fabricate throughput numbers, examples.py builds a real, CPU-bound numpy matrix-
multiply stand-in for an encoder layer, times it for real, and applies the published paper's own
cost formula to that honestly-smaller-scale measurement, with the illustrative-only caveat stated
directly in both the code's docstring and its printed output.
