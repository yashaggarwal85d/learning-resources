"""de.communicating-tradeoffs-decision-makers — executable evidence.

This chapter has no system under test (CHAPTER.md's "Engine of record"): its lab is a written
artifact, not a measured number against a real database. This file takes topic 1's own three
priced SLO tiers, restates their cost in the terms a decision-maker weighs rather than the terms
that built them, computes which single factor dominates the cost gap, and builds the one-page
executive summary and the longer engineering deep dive for the same recommended tier — checking
both against a stated shape rather than just asserting they exist.
"""

# topic 1's own tier model, reproduced here rather than imported: CHAPTER.md's cross-topic rule
# is that each topic's lab is a standalone, disclosed artifact, not a shared library.
TIERS = {
    "fast": {"freshness_minutes": 5, "non_goal": "not guaranteed below five minutes during a shift change"},
    "medium": {"freshness_minutes": 60, "non_goal": "not intended for real-time alerting"},
    "slow": {"freshness_minutes": 1440, "non_goal": "not refreshed intraday under any circumstance"},
}

BASE_INFRA_COST_PER_DAY = 40.0
COST_PER_RECOMPUTE = 6.0
STREAMING_SURCHARGE_PER_DAY = 150.0

RECOMMENDED_TIER = "medium"
WRONG_NUMBER_RISK_PER_BREACH = 500.0  # illustrative: one plant decision made on stale data


def runs_per_day(freshness_minutes):
    return (24 * 60) / freshness_minutes


def tier_daily_cost(tier_name):
    tier = TIERS[tier_name]
    runs = runs_per_day(tier["freshness_minutes"])
    cost = BASE_INFRA_COST_PER_DAY + runs * COST_PER_RECOMPUTE
    if tier["freshness_minutes"] <= 15:
        cost += STREAMING_SURCHARGE_PER_DAY
    return cost


def cost_lever_breakdown(tier_name):
    """Splits a tier's own cost into its two levers: the base infra floor, and the
    recompute-frequency cost (which is where the streaming surcharge also lands)."""
    tier = TIERS[tier_name]
    runs = runs_per_day(tier["freshness_minutes"])
    recompute_cost = runs * COST_PER_RECOMPUTE
    if tier["freshness_minutes"] <= 15:
        recompute_cost += STREAMING_SURCHARGE_PER_DAY
    return {"base_infra": BASE_INFRA_COST_PER_DAY, "recompute_and_streaming": recompute_cost}


def dominant_lever(tier_name, other_tier_name):
    """Names which single lever accounts for the larger share of the cost gap between two tiers."""
    a, b = cost_lever_breakdown(tier_name), cost_lever_breakdown(other_tier_name)
    gaps = {lever: a[lever] - b[lever] for lever in a}
    total_gap = sum(gaps.values())
    lever, gap = max(gaps.items(), key=lambda kv: kv[1])
    return {"lever": lever, "share_of_total_gap": gap / total_gap}


def business_terms_summary(tier_name):
    """Restates one tier's cost in business terms: a daily dollar figure and the risk of a
    wrong number reaching a plant manager, rather than compute/storage/pipeline terms."""
    daily_cost = tier_daily_cost(tier_name)
    freshness_minutes = TIERS[tier_name]["freshness_minutes"]
    # a staler tier carries a real chance a plant manager acts on a number that's already wrong
    staleness_risk_per_day = (freshness_minutes / 60.0) * WRONG_NUMBER_RISK_PER_BREACH * 0.02
    return {
        "tier": tier_name,
        "dollars_per_day": round(daily_cost, 2),
        "wrong_number_risk_per_day": round(staleness_risk_per_day, 2),
    }


def executive_summary(tier_name):
    lever = dominant_lever("fast", tier_name)
    cost = tier_daily_cost(tier_name)
    fast_cost = tier_daily_cost("fast")
    lines = [
        f"Recommendation: the {tier_name} tier.",
        f"Cost: {cost:.2f} dollars per day, versus {fast_cost:.2f} for the fast tier.",
        f"Dominant cost lever: {lever['lever']}, {lever['share_of_total_gap']:.0%} of the gap to fast.",
        f"Non-goal: {TIERS[tier_name]['non_goal']}.",
    ]
    return lines


def engineering_deep_dive(tier_name):
    lines = list(executive_summary(tier_name))
    for name in TIERS:
        bt = business_terms_summary(name)
        lines.append(
            f"Tier {name}: {bt['dollars_per_day']} dollars/day, "
            f"{bt['wrong_number_risk_per_day']} wrong-number risk/day, "
            f"non-goal: {TIERS[name]['non_goal']}"
        )
    lines.append("Error-budget math (topic 1): see de.negotiating-data-contracts-slos/examples.py.")
    return lines


def run():
    print("Business-terms restatement of topic 1's three tiers:")
    for name in TIERS:
        bt = business_terms_summary(name)
        print(f"  {bt}")
    assert business_terms_summary("fast")["dollars_per_day"] > business_terms_summary("medium")["dollars_per_day"]
    assert business_terms_summary("medium")["dollars_per_day"] > business_terms_summary("slow")["dollars_per_day"]

    lever = dominant_lever("fast", "medium")
    print(f"\nDominant cost lever between fast and medium: {lever}")
    assert lever["lever"] == "recompute_and_streaming"
    assert lever["share_of_total_gap"] > 0.5

    summary = executive_summary(RECOMMENDED_TIER)
    deep_dive = engineering_deep_dive(RECOMMENDED_TIER)
    print("\nOne-page executive summary:")
    for line in summary:
        print(f"  {line}")
    print("\nEngineering deep dive:")
    for line in deep_dive:
        print(f"  {line}")

    # the one-pager stays short and still names the recommendation, the cost and the lever
    assert len(summary) <= 6
    assert any("Recommendation" in line for line in summary)
    assert any("Dominant cost lever" in line for line in summary)
    # the deep dive is strictly longer and recommends the identical tier
    assert len(deep_dive) > len(summary)
    assert summary[0] == deep_dive[0]


if __name__ == "__main__":
    run()
