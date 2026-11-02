## "The Embedder's Dilemma: LLMs Are Better, but at What Cost?" (COLM 2026)

URL: https://arxiv.org/pdf/2608.12875

> We measure maximum-throughput token processing on an H100 80GB at sequence length 512 (largest fitting batch) and compute cost as rGPU /T, where rGPU = $2.49/hr (Lambda Labs H100 spot, March 2026) and T is tokens per hour.

> Table 18 reports the throughput (tokens/second) and derived cost per million tokens for each of the 26 embedding models, benchmarked on a single NVIDIA H100 80GB HBM3 GPU at sequence length 512 with maximum batch size.

> Costs range from $0.00016/MTok (mE5-small, 118M parameters, 4.3M tok/s) to $0.047/MTok (F2LLM-v2-14B, 14.7K tok/s).

## OpenAI API documentation — text-embedding-3-large Model

URL: https://developers.openai.com/api/docs/models/text-embedding-3-large

> Rate limits ensure fair and reliable access to the API by placing specific caps on requests, tokens, audio duration, or other usage within a given time period.

> Your usage tier determines how high these limits are set and automatically increases as you send more requests and spend more on the API.

## Qdrant documentation — Qdrant Fundamentals (FAQ)

URL: https://qdrant.tech/documentation/faq/qdrant-fundamentals/

> Qdrant implements deletions as soft deletes using a bitmask, so the index is not rebuilt after each deletion.

> After a delete operation, the point is immediately inaccessible via the API.

> Queries continue to be served by the old index until the new index is complete, so there is no downtime.
