# Outline — de.embedding-pipelines-at-scale

## Outcomes (from CHAPTER.md)

Measure one local embedding model's throughput and derive its cost per million tokens at a
stated batch size and hardware; re-embed only the chunks whose content hash changed after an
edit and show the cost saved against re-embedding the whole corpus; propagate a document
deletion to a tombstoned vector and show it is no longer retrievable; design a dual-index
backfill for a simulated embedding-model change with no downtime.

## 10-step storyboard

1. **Hook.** The shop's support-ticket search re-embeds its entire corpus every night, and the
   bill keeps climbing as the corpus grows even though most tickets never change once closed.
2. **Predict: what single change cuts that bill the most, without touching correctness.**
   (Correct: hashing each chunk and re-embedding only the ones whose hash changed — the
   overwhelming majority of nights, for a mostly-closed corpus, re-embed nothing at all.)
3. **Reveal: content hashing, the mechanism.** Hash each chunk's content, compare to the hash
   stored at last embedding; an edit relights exactly one chunk's tag. No takeaway (reel test's
   reference step).
4. **Reveal: throughput and cost per million tokens.** A published benchmark's own method
   (sequence length 512, maximum batch size, a stated GPU spot rate) reproduced at this build
   machine's own, honestly smaller scale. Takeaway on reading a benchmark's method, not its
   number.
5. **Reveal: the API-bound case.** An API embedding service is bounded by its own rate limit
   (tokens per minute), a different ceiling than a GPU's compute — the same corpus can be
   compute-bound on a GPU and rate-limit-bound through an API. Takeaway on naming the actual
   bottleneck before optimizing the wrong one.
6. **Reveal: deletes and tombstones.** Removing a source document must remove or tombstone its
   vector too, or a deleted record keeps being retrievable — correctness, not cleanup. Takeaway.
7. **Reveal: why a model change can't be an in-place swap.** Two different models' vectors are
   not comparable — stated as a fact this topic depends on, not re-derived. Takeaway.
8. **Reveal: the dual-index backfill.** The old model's index keeps serving every query while the
   new model's index is built in full for the whole corpus; a cut-over switches the query target
   only once the new index is complete. Takeaway on "no downtime" meaning no moment without an
   answer, not meaning instant completion.
9. **Recap.**
10. **Prove it.** A team moves from an API embedding service to a local GPU. Which of this
    topic's four techniques (hashing, tombstones, dual index, rate-limit awareness) changes
    because of that move, and which stays identical? (Correct: the rate-limit ceiling disappears
    — the GPU is compute-bound instead — but hashing, tombstones and the dual-index backfill are
    unchanged; none of them depend on which kind of ceiling is binding.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7, 8 (five takeaways).

## Post-notes headings

Outcomes; Internals (the throughput/cost formula, the hashing and tombstone mechanics, the
dual-index backfill); Lab (none of its own — this topic's measurements are its own executable
evidence, at a disclosed smaller scale); Production failures this topic warns about; Frontier
(what the *(skipped)* embedding-model-choice and chunking topics would add); Where this goes next
(choosing a vector store to hold what this topic keeps fresh).

## Examples.py spec

No GPU and no embedding-model library exist in this sandbox, so a real, CPU-bound numpy
matrix-multiply stand-in for an encoder layer (fixed dimension, fixed depth) is timed for real on
the build machine, reproducing the paper's own method (sequence length 512, maximum batch size)
honestly at a smaller scale — never presented as a GPU-scale estimate. Four experiments: (1)
measured throughput and cost per million tokens via the paper's own cost formula, plus a
corpus-size comparison showing the same backlog is compute-bound on this machine but
rate-limit-bound through an API tier's own TPM ceiling; (2) a synthetic mostly-closed support-
ticket corpus, where one edited ticket triggers exactly one re-embedded chunk by content-hash
comparison, the rest skipped; (3) a delete/tombstone test showing a deleted document's own vector
no longer matches itself in search, matching Qdrant's own "immediately inaccessible" language; (4)
a dual-index backfill where the old model's index answers every query while the new model's index
is built for the whole corpus, followed by a cut-over, with the old and new model's vectors for
the identical chunk shown to have no meaningful cosine alignment — confirming they are not
comparable and an in-place swap would be incoherent.

## Bridge / handoff

Bridge (answers topic 5's handoff verbatim): "Everything in this section assumed a feature is a
number or a category. An embedding is a feature too — a few hundred numbers standing for a
document — and it drifts exactly the same way, except re-embedding the whole corpus to fix it is
not free. This topic is what keeping embeddings fresh actually costs at scale: throughput and its
price, hashing to avoid redoing untouched work, tombstones for what should no longer be found, and
the backfill a model change forces."

Handoff (leads into topic 7): "Fresh vectors still have to live somewhere a query can search. The
last question before this chapter leaves embeddings behind is not which index algorithm to run —
the syllabus does not ask for that here — but which kind of store to run it in at all, decided
from the shape of your corpus and your traffic rather than a benchmark chart."

## Concept ledger

Introduces: `embedding-batch-throughput-cost`, `content-hash-incremental-reembed`,
`vector-delete-tombstone-propagation`, `dual-index-model-backfill`.
Uses: `data-drift-vs-concept-drift`, `schema-and-null-rate-drift` (topic 5: an embedding is a
feature, and it drifts the same way, at a different cost).
Declared: basic familiarity with hashing and with what an embedding vector is (not how one is
computed).

## Claims list (for FACT-CHECK.md)

1. "The Embedder's Dilemma" measures maximum-throughput token processing on an H100 80GB at
   sequence length 512 (largest fitting batch), cost = $2.49/hr (Lambda Labs H100 spot, March
   2026) divided by tokens per hour.
2. The paper's Table 18 benchmarks 26 embedding models at sequence length 512 with maximum batch
   size and reports throughput and cost per million tokens for each.
3. The paper's measured costs range from $0.00016/MTok (mE5-small, 4.3M tok/s) to $0.047/MTok
   (F2LLM-v2-14B, 14.7K tok/s).
4. OpenAI's own rate-limit documentation: usage tier determines request/token caps, and those
   caps rise automatically with usage and spend.
5. OpenAI's text-embedding-3-large "Build" usage tier caps at 1,000,000 tokens per minute (TPM).
6. Qdrant implements deletions as soft deletes using a bitmask, so the index is not rebuilt after
   each deletion.
7. Qdrant: after a delete operation, the point is immediately inaccessible via the API.
8. Qdrant: queries continue to be served by the old index until a rebuilt index is complete, so
   there is no downtime.
9. (This course, measured) a real CPU-bound encoder stand-in's throughput and derived
   cost-per-million-tokens via the paper's own formula, disclosed as a smaller, non-GPU scale.
10. (This course, measured) one edited chunk out of a 400-chunk corpus triggers exactly one
    re-embed by content-hash comparison.
11. (This course, measured) a deleted document's own vector no longer matches itself in search
    after being tombstoned.
12. (This course, measured) two independently-initialized "models'" vectors for the identical
    chunk show no meaningful cosine alignment, demonstrating incomparability across models.
