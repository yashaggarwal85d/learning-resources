"""de.choosing-vector-store — executable evidence.

This topic's own lab is the six-axis decision procedure itself (CHAPTER.md: "none of its own,
by design... this topic's worked decision procedure is its own evidence"). Rather than leave the
procedure as prose, this file encodes it as a real function, run against the shop's own stated
corpus and against a different, larger hypothetical corpus, to show the identical procedure
reaching two different, justified answers.
"""
from dataclasses import dataclass


@dataclass
class Corpus:
    name: str
    vector_count: int
    filter_complexity: str   # "none", "simple", "rich"
    update_rate: str         # "low", "moderate", "high"
    tenancy: str             # "single", "simple", "multi-strict"
    latency_slo_ms: int
    operational_ownership: str  # "own-ops", "managed-preferred"


def recommend(corpus: Corpus) -> tuple[str, list[str]]:
    """Walk the six axes in order and return (recommendation, reasons)."""
    reasons = []

    # Axis 1: corpus size.
    if corpus.vector_count <= 5_000_000:
        size_tier = "small"
        reasons.append(f"corpus size ({corpus.vector_count:,} vectors) is comfortably inside a single Postgres instance's range")
    elif corpus.vector_count <= 200_000_000:
        size_tier = "medium"
        reasons.append(f"corpus size ({corpus.vector_count:,} vectors) is past comfortable single-instance Postgres range")
    else:
        size_tier = "huge"
        reasons.append(f"corpus size ({corpus.vector_count:,} vectors) needs horizontal sharding across many nodes")

    # Axis 2: filter complexity.
    rich_filters = corpus.filter_complexity == "rich"
    if rich_filters:
        reasons.append("filter complexity is rich: joins/subqueries (SQL) or heavily indexed payload filters matter a lot")
    else:
        reasons.append(f"filter complexity is {corpus.filter_complexity}: no strong pull toward a filter-specialized engine")

    # Axis 3: update rate.
    reasons.append(f"update rate is {corpus.update_rate}")

    # Axis 4: tenancy.
    strict_multitenant = corpus.tenancy == "multi-strict"
    if strict_multitenant:
        reasons.append("tenancy requires strict per-tenant isolation at scale")
    else:
        reasons.append(f"tenancy model is {corpus.tenancy}, no strict multi-tenant isolation requirement")

    # Axis 5: latency SLO.
    tight_latency = corpus.latency_slo_ms < 50
    reasons.append(f"latency SLO is {corpus.latency_slo_ms}ms ({'tight' if tight_latency else 'comfortable'} for any of these options)")

    # Axis 6: operational ownership.
    wants_managed = corpus.operational_ownership == "managed-preferred"
    reasons.append(f"operational ownership preference: {corpus.operational_ownership}")

    # Decision: this is the procedure, not a lookup table of "winners."
    if size_tier == "small" and not strict_multitenant and not wants_managed:
        pick = "pgvector (inside the existing Postgres)"
        reasons.append("small enough, simple enough tenancy, team keeps its own ops -> no reason to add a second data store")
    elif wants_managed and not strict_multitenant:
        pick = "Pinecone (managed, low ops)"
        reasons.append("team prefers not to run its own ops -> trade a vendor bill for ops time")
    elif strict_multitenant and size_tier == "huge":
        pick = "Milvus (sharded, multi-tenant dedicated engine)"
        reasons.append("scale and strict per-tenant isolation both demand a sharded, dedicated engine built for exactly this")
    elif rich_filters and not strict_multitenant:
        pick = "Qdrant (self-hosted, filter-specialized)"
        reasons.append("rich filtering need, without the multi-tenant/scale pressure that would push toward Milvus")
    else:
        pick = "Weaviate (hybrid search as first-class)"
        reasons.append("no axis points strongly elsewhere; hybrid search is the deciding factor")

    return pick, reasons


# ---------------------------------------------------------------------------
# The shop's own stated corpus (CHAPTER.md's hook): small, simple, own ops.
# ---------------------------------------------------------------------------

SHOP_CORPUS = Corpus(
    name="the shop's support-ticket search",
    vector_count=10_000,
    filter_complexity="simple",
    update_rate="moderate",
    tenancy="single",
    latency_slo_ms=200,
    operational_ownership="own-ops",
)

# ---------------------------------------------------------------------------
# A hypothetical, much larger corpus: billions of vectors, strict per-tenant
# isolation, high update rate.
# ---------------------------------------------------------------------------

HYPOTHETICAL_CORPUS = Corpus(
    name="a billion-image, thousand-tenant product search",
    vector_count=2_000_000_000,
    filter_complexity="rich",
    update_rate="high",
    tenancy="multi-strict",
    latency_slo_ms=100,
    operational_ownership="own-ops",
)


def run():
    shop_pick, shop_reasons = recommend(SHOP_CORPUS)
    assert shop_pick.startswith("pgvector"), f"expected pgvector for the shop's corpus, got {shop_pick}"
    print(f"{SHOP_CORPUS.name}: recommendation = {shop_pick}")
    for r in shop_reasons:
        print(f"  - {r}")

    big_pick, big_reasons = recommend(HYPOTHETICAL_CORPUS)
    assert big_pick.startswith("Milvus"), f"expected a sharded dedicated engine for the hypothetical corpus, got {big_pick}"
    print(f"\n{HYPOTHETICAL_CORPUS.name}: recommendation = {big_pick}")
    for r in big_reasons:
        print(f"  - {r}")

    assert shop_pick != big_pick, (
        "the identical six-axis procedure should reach two different answers on two "
        "different corpora, or the procedure is not actually sensitive to the axes"
    )

    # A third, intermediate corpus: not huge, not simple-tenant, wants low ops.
    managed_corpus = Corpus(
        name="a mid-size team that doesn't want to run infrastructure",
        vector_count=20_000_000,
        filter_complexity="simple",
        update_rate="moderate",
        tenancy="simple",
        latency_slo_ms=150,
        operational_ownership="managed-preferred",
    )
    managed_pick, managed_reasons = recommend(managed_corpus)
    assert managed_pick.startswith("Pinecone"), f"expected the managed option, got {managed_pick}"
    print(f"\n{managed_corpus.name}: recommendation = {managed_pick}")
    for r in managed_reasons:
        print(f"  - {r}")

    assert len({shop_pick, big_pick, managed_pick}) == 3, "three distinct corpora should not collapse onto the same recommendation"
    print("\nall assertions passed")


if __name__ == "__main__":
    run()
