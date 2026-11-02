Last verified: 30 October 2026. Expert sign-off: pending. Four real measured experiments run in
this sandbox (`examples.py`): a CPU-bound encoder stand-in's throughput and cost per million
tokens via the published benchmark's own formula, plus a compute-bound-vs-rate-limit-bound
comparison on the same backlog; one edited ticket out of a 400-chunk corpus triggering exactly one
re-embedded chunk; a deleted document's vector tombstoned and no longer retrievable; and a
dual-index backfill where the old index answers every query during the build, with the old and
new model's vectors for the identical chunk shown not to be comparable.

- "The Embedder's Dilemma: LLMs Are Better, but at What Cost?" (COLM 2026): [arxiv.org/abs/2608.12875](https://arxiv.org/abs/2608.12875). Its own embedding-throughput benchmark method and per-million-token cost formula, quoted directly.
- OpenAI API documentation, "text-embedding-3-large Model": [developers.openai.com](https://developers.openai.com/api/docs/models/text-embedding-3-large). Its own usage-tier rate limits, quoted and read from the tier table.
- Qdrant documentation, "Qdrant Fundamentals" (FAQ): [qdrant.tech](https://qdrant.tech/documentation/faq/qdrant-fundamentals/). Its own soft-delete, tombstone and zero-downtime reindex description, quoted directly.
- This course's own topic 5, "Drift and label-delay monitoring" (`de.drift-label-delay-monitoring`, held): the drift vocabulary this topic reuses by id, applied here to an embedding instead of a scalar feature.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=embedding-pipelines-at-scale:%20).
