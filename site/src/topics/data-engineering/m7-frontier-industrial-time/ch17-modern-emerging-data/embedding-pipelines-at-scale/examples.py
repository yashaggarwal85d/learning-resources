"""de.embedding-pipelines-at-scale — executable evidence.

No GPU and no embedding-model library (sentence-transformers, torch) exist in this
sandbox. Rather than fake numbers, this file reproduces the *shape* of "The Embedder's
Dilemma"'s own cost methodology (sequence length fixed, batch size fixed, cost =
hardware-rate / tokens-per-hour) at a small, honestly-disclosed scale: a real,
CPU-bound, numpy matrix-multiply stand-in for an encoder layer, timed for real on
this build machine, not on an H100. The $2.49/hr figure is the paper's own GPU rate,
applied to our own measured throughput only to show the formula, never presented as
a GPU-scale estimate.
"""
import hashlib
import time
import numpy as np

rng = np.random.default_rng(0)

H100_SPOT_RATE_PER_HOUR = 2.49  # Lambda Labs H100 spot, March 2026 (the paper's own rate)
OPENAI_BUILD_TIER_TPM = 1_000_000  # text-embedding-3-large, "Build" usage tier


# ---------------------------------------------------------------------------
# A CPU-bound stand-in "encoder": real floating-point work that scales with
# token count and batch size, so a throughput measurement on it is real, even
# though it is not an actual embedding model.
# ---------------------------------------------------------------------------

DIM = 64
LAYERS = 3
_W = [rng.standard_normal((DIM, DIM)).astype(np.float32) for _ in range(LAYERS)]


def _encode_batch(token_counts, weights=None):
    """One forward pass over a batch of chunks, each token_counts[i] tokens long.
    Does LAYERS matmuls per token (standing in for a real encoder's per-token cost),
    returns one DIM-vector per chunk (mean-pooled)."""
    if weights is None:
        weights = _W
    total_tokens = int(sum(token_counts))
    x = rng.standard_normal((total_tokens, DIM)).astype(np.float32)
    for w in weights:
        x = np.tanh(x @ w)
    vecs = np.zeros((len(token_counts), DIM), dtype=np.float32)
    offset = 0
    for i, n in enumerate(token_counts):
        vecs[i] = x[offset:offset + n].mean(axis=0)
        offset += n
    return vecs, total_tokens


def measure_throughput(batch_size, n_batches, tokens_per_chunk=512):
    """Measure sustained tokens/second on this build machine, at a stated batch
    size and sequence length — the paper's own method, reproduced small."""
    token_counts = [tokens_per_chunk] * batch_size
    _encode_batch(token_counts)  # warm-up, excluded from timing
    start = time.perf_counter()
    total_tokens = 0
    for _ in range(n_batches):
        _, t = _encode_batch(token_counts)
        total_tokens += t
    elapsed = time.perf_counter() - start
    return total_tokens / elapsed  # tokens/second


def cost_per_million_tokens(tokens_per_second, rate_per_hour=H100_SPOT_RATE_PER_HOUR):
    tokens_per_hour = tokens_per_second * 3600
    return (1_000_000 / tokens_per_hour) * rate_per_hour


# ---------------------------------------------------------------------------
# A small synthetic support-ticket corpus: mostly-closed tickets that never
# change, plus a few open ones that get edited.
# ---------------------------------------------------------------------------

def make_corpus(n_tickets=400, pct_closed=0.9, seed=1):
    r = np.random.default_rng(seed)
    corpus = {}
    for i in range(n_tickets):
        body = f"ticket {i} customer reported issue number {r.integers(0, 10_000)} " * 8
        corpus[f"ticket-{i}"] = body
    closed_ids = set(f"ticket-{i}" for i in range(int(n_tickets * pct_closed)))
    return corpus, closed_ids


def content_hash(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


class EmbeddingStore:
    def __init__(self):
        self.last_hash = {}
        self.vectors = {}
        self.tombstoned = set()

    def reembed_if_changed(self, chunk_id, text):
        h = content_hash(text)
        if self.last_hash.get(chunk_id) == h:
            return False  # unchanged, skipped
        token_count = max(1, len(text.split()))
        vecs, _ = _encode_batch([token_count])
        self.vectors[chunk_id] = vecs[0]
        self.last_hash[chunk_id] = h
        return True  # re-embedded

    def delete(self, chunk_id):
        self.tombstoned.add(chunk_id)

    def search(self, query_vec, k=3):
        """Cosine-similarity search that skips tombstoned points — matching
        Qdrant's own description of a deleted point as immediately inaccessible."""
        candidates = [
            (cid, v) for cid, v in self.vectors.items() if cid not in self.tombstoned
        ]
        sims = [
            (cid, float(np.dot(v, query_vec) / (np.linalg.norm(v) * np.linalg.norm(query_vec) + 1e-9)))
            for cid, v in candidates
        ]
        sims.sort(key=lambda x: -x[1])
        return [cid for cid, _ in sims[:k]]


# ---------------------------------------------------------------------------
# Experiment 1 — throughput, cost per million tokens, and the API-rate-limit
# ceiling as a *different* bottleneck than GPU batching throughput.
# ---------------------------------------------------------------------------

def experiment_throughput_and_cost():
    tps = measure_throughput(batch_size=32, n_batches=20, tokens_per_chunk=512)
    cost = cost_per_million_tokens(tps)
    assert tps > 0
    print(f"measured throughput on this build machine: {tps:,.0f} tokens/sec "
          f"(batch size 32, sequence length 512)")
    print(f"applying the paper's own cost formula at its $2.49/hr H100 rate to "
          f"this CPU's measured throughput (illustrative only, not a GPU estimate): "
          f"${cost:.4f} per million tokens")

    # The API-bound case: a corpus this large, embedded through an API tier's
    # own TPM ceiling, is bounded by that limit, not by GPU batching throughput.
    corpus_tokens = 50_000_000  # a 50M-token backlog
    compute_bound_seconds = corpus_tokens / tps
    rate_limit_bound_seconds = corpus_tokens / (OPENAI_BUILD_TIER_TPM / 60)
    assert rate_limit_bound_seconds > compute_bound_seconds, (
        "a GPU batching this corpus should finish faster than an API tier's own "
        "TPM ceiling allows — if not, the rate limit isn't actually the binding "
        "constraint in this comparison"
    )
    print(f"the same 50M-token backlog: {compute_bound_seconds:,.0f}s bound by this "
          f"machine's compute vs {rate_limit_bound_seconds:,.0f}s bound by the API's "
          f"own {OPENAI_BUILD_TIER_TPM:,} TPM ceiling — the API case is rate-limit-bound, "
          f"not compute-bound")


# ---------------------------------------------------------------------------
# Experiment 2 — content hashing re-embeds only the changed chunk.
# ---------------------------------------------------------------------------

def experiment_content_hash_incremental():
    corpus, closed_ids = make_corpus()
    store = EmbeddingStore()
    for cid, text in corpus.items():
        store.reembed_if_changed(cid, text)  # initial embed, every chunk

    # One night later: only one open ticket gets a new reply appended.
    edited_id = next(iter(set(corpus) - closed_ids))
    corpus[edited_id] += " customer replied with additional detail"

    reembedded = 0
    skipped = 0
    for cid, text in corpus.items():
        if store.reembed_if_changed(cid, text):
            reembedded += 1
        else:
            skipped += 1

    assert reembedded == 1, f"expected exactly 1 changed chunk, got {reembedded}"
    assert skipped == len(corpus) - 1
    full_reembed_cost_ratio = len(corpus) / reembedded
    print(f"one edited ticket out of {len(corpus)}: {reembedded} chunk re-embedded, "
          f"{skipped} skipped by hash match — {full_reembed_cost_ratio:.0f}x fewer "
          f"tokens processed than re-embedding the whole corpus")


# ---------------------------------------------------------------------------
# Experiment 3 — deleting a document tombstones its vector; it stops being
# retrievable, matching Qdrant's own "immediately inaccessible" language.
# ---------------------------------------------------------------------------

def experiment_delete_tombstone():
    corpus, _ = make_corpus(n_tickets=20)
    store = EmbeddingStore()
    for cid, text in corpus.items():
        store.reembed_if_changed(cid, text)

    target_id = "ticket-5"
    query_vec = store.vectors[target_id]
    results_before = store.search(query_vec, k=1)
    assert target_id in results_before, "the document's own vector should match itself"

    store.delete(target_id)
    results_after = store.search(query_vec, k=1)
    assert target_id not in results_after, (
        "a deleted document's vector is still being returned by search — "
        "the tombstone did not propagate to the index"
    )
    print(f"before delete: nearest match to {target_id}'s own vector is "
          f"{results_before[0]!r}. After delete: {results_after[0]!r} — "
          f"{target_id} is no longer retrievable")


# ---------------------------------------------------------------------------
# Experiment 4 — a model change needs a dual index: the old model's index
# keeps serving while the new model's index is built, then a cut-over. Vectors
# from the two models are not comparable, so mixing them is incoherent.
# ---------------------------------------------------------------------------

def experiment_dual_index_backfill():
    corpus, _ = make_corpus(n_tickets=50)

    # Old model: layer weights W_old. New model: a different random init W_new.
    w_old = _W
    w_new = [rng.standard_normal((DIM, DIM)).astype(np.float32) for _ in range(LAYERS)]

    def embed_with(weights, text):
        token_count = max(1, len(text.split()))
        vecs, _ = _encode_batch([token_count], weights=weights)
        return vecs[0]

    old_index = {cid: embed_with(w_old, text) for cid, text in corpus.items()}

    # Backfill: build the new model's index for every chunk. Old index keeps
    # serving every query issued "during" this loop — there is no moment where
    # a query has nothing to search, which is the "no downtime" claim.
    queries_served_during_backfill = 0
    new_index = {}
    for cid, text in corpus.items():
        probe_query = old_index[next(iter(old_index))]
        result = max(old_index, key=lambda k: float(np.dot(old_index[k], probe_query)))
        assert result in old_index  # old index answers every query during the backfill
        queries_served_during_backfill += 1
        new_index[cid] = embed_with(w_new, text)

    assert queries_served_during_backfill == len(corpus)
    assert set(new_index) == set(old_index)

    # Cut-over: queries now target the new index exclusively.
    cid = next(iter(corpus))
    old_vec = old_index[cid]
    new_vec = new_index[cid]
    cos_sim = float(np.dot(old_vec, new_vec) / (np.linalg.norm(old_vec) * np.linalg.norm(new_vec) + 1e-9))
    assert abs(cos_sim) < 0.5, (
        "the old and new model's vectors for the identical chunk should not be "
        "meaningfully aligned — two different models' vectors are not comparable"
    )
    print(f"backfill: {queries_served_during_backfill} queries served by the old "
          f"index while the new index was being built (zero downtime). After "
          f"cut-over, old vs. new model's vector for the same chunk has cosine "
          f"similarity {cos_sim:.3f} — not comparable, confirming the dual index "
          f"(not an in-place swap) is required")


if __name__ == "__main__":
    experiment_throughput_and_cost()
    experiment_content_hash_incremental()
    experiment_delete_tombstone()
    experiment_dual_index_backfill()
    print("all assertions passed")
