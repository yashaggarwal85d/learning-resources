"""de.negotiating-data-contracts-slos — executable evidence.

This chapter has no system under test (CHAPTER.md's "Engine of record"): its lab is a written
artifact, not a measured number against a real database. This file makes that artifact's own
numbers concrete and checkable rather than purely asserted: a simple, disclosed, illustrative cost
model (not sourced real pricing) that prices three SLO tiers for the shop's own dashboard request,
and a worked error-budget calculation in the SRE book's own style, applied to one of those tiers.
"""

TIERS = {
    "fast": {
        "freshness_minutes": 5,
        "non_goal": "not guaranteed below the five-minute tier during a plant's own shift change",
        "owner": "platform on-call engineer",
    },
    "medium": {
        "freshness_minutes": 60,
        "non_goal": "not intended for real-time alerting; use the fast tier for that",
        "owner": "data platform team",
    },
    "slow": {
        "freshness_minutes": 1440,
        "non_goal": "not refreshed intraday under any circumstance",
        "owner": "nightly batch pipeline owner",
    },
}

BASE_INFRA_COST_PER_DAY = 40.0
COST_PER_RECOMPUTE = 6.0
STREAMING_SURCHARGE_PER_DAY = 150.0


def runs_per_day(freshness_minutes):
    return (24 * 60) / freshness_minutes


def tier_daily_cost(tier_name):
    """An illustrative, disclosed cost model: a fixed daily base, a per-recompute cost scaling
    with how often the tier refreshes, and a streaming surcharge once refreshes are frequent
    enough to need a dedicated streaming pipeline rather than a scheduled batch job."""
    tier = TIERS[tier_name]
    runs = runs_per_day(tier["freshness_minutes"])
    cost = BASE_INFRA_COST_PER_DAY + runs * COST_PER_RECOMPUTE
    if tier["freshness_minutes"] <= 15:
        cost += STREAMING_SURCHARGE_PER_DAY
    return cost


def quarterly_error_budget_minutes(slo_percent, quarter_days=90):
    """The SRE book's own worked style: an SLO stated as a percentage of time the tier's own
    freshness promise must be met, turned into an allowed number of breach minutes per quarter."""
    quarter_minutes = quarter_days * 24 * 60
    allowed_failure_share = (100 - slo_percent) / 100
    return quarter_minutes * allowed_failure_share


def budget_consumed_by_breach(slo_percent, breach_minutes, quarter_days=90):
    budget = quarterly_error_budget_minutes(slo_percent, quarter_days)
    return (breach_minutes / budget) * 100


def run():
    costs = {name: tier_daily_cost(name) for name in TIERS}
    print("daily cost per tier (illustrative, disclosed, not real pricing data):")
    for name, cost in costs.items():
        print(f"  {name}: {TIERS[name]['freshness_minutes']} minute freshness, ${cost:.2f} per day")

    assert costs["fast"] > costs["medium"] > costs["slow"], "the three tiers should strictly price fast > medium > slow"
    assert costs["fast"] > costs["medium"] * 3, "the fast tier's streaming surcharge should make it dramatically more expensive, not just marginally"

    for name, tier in TIERS.items():
        assert tier["non_goal"], f"tier {name} is missing its own stated non-goal"
        assert tier["owner"], f"tier {name} is missing a named breach owner"
    print("\nevery tier states its own non-goal and a named breach owner")

    fast_slo_percent = 99.9
    breach_minutes = 20
    budget_minutes = quarterly_error_budget_minutes(fast_slo_percent)
    consumed_percent = budget_consumed_by_breach(fast_slo_percent, breach_minutes)
    print(
        f"\nfast tier's quarterly error budget at {fast_slo_percent} percent SLO: "
        f"{budget_minutes:.1f} minutes; a {breach_minutes}-minute breach spends "
        f"{consumed_percent:.1f} percent of that budget"
    )
    assert 0 < consumed_percent < 100, "a single disclosed breach should spend part of the budget, not all or none of it"
    assert TIERS["fast"]["owner"] == "platform on-call engineer", "the fast tier's breach owner should be the one actually paged"

    print("\nall assertions passed")


if __name__ == "__main__":
    run()
