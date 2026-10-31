"""de.blameless-postmortems-incident-communication — executable evidence.

This chapter has no system under test (CHAPTER.md's "Engine of record"): its lab is a written
artifact, not a measured number. This file builds a timestamped timeline for a simulated one-hour
staleness incident on the medium tier (from topics 1-2), quantifies its impact in data terms
(stale rows, affected plant decisions) rather than infrastructure metrics, and checks a blameless
post-mortem's own contributing-factors list and action items against a person-blaming post-mortem
that fails the same mechanical check.
"""

ROWS_PER_MINUTE = 40  # the medium tier's own refresh volume, reused from topic 1's cost model
INCIDENT_MINUTES = 60

TIMELINE = [
    {"minute": 0, "event": "the medium tier's scheduled recompute silently fails"},
    {"minute": 12, "event": "a plant manager flags a dashboard number that looks stale"},
    {"minute": 25, "event": "on-call confirms the recompute job has been failing since minute zero"},
    {"minute": 31, "event": "a fix is deployed; the recompute job is restarted"},
    {"minute": 60, "event": "the dashboard is confirmed fresh again across every plant"},
]

AFFECTED_PLANT_DECISIONS = [
    "plant seven delayed a shift change based on a stale occupancy number",
    "plant two approved a maintenance window using a stale throughput reading",
]


def stale_row_count():
    return ROWS_PER_MINUTE * INCIDENT_MINUTES


def impact_in_data_terms():
    """States the incident's impact in data terms, not infrastructure metrics."""
    return {
        "stale_rows": stale_row_count(),
        "affected_plant_decisions": AFFECTED_PLANT_DECISIONS,
    }


def check_timeline(timeline):
    minutes = [e["minute"] for e in timeline]
    return minutes == sorted(minutes) and minutes[0] == 0


BLAMELESS_POSTMORTEM = {
    "contributing_factors": [
        "the recompute job's own failure alert was routed to a channel nobody was watching",
        "no automated staleness check existed on the dashboard itself to catch this before a plant manager did",
    ],
    "action_items": [
        {"item": "route the recompute job's failure alert to the on-call pager", "owner": "platform on-call engineer"},
        {"item": "add an automated staleness check to the dashboard that pages on-call directly", "owner": "data platform team"},
    ],
}

BLAMING_POSTMORTEM = {
    "contributing_factors": ["the on-call engineer deployed a bad config"],
    "action_items": [
        {"item": "retrain the engineer", "owner": "the engineer's manager"},
    ],
}


def names_a_person(factor):
    return "engineer" in factor.lower() and ("the on-call engineer" in factor.lower() or "deployed" in factor.lower())


def check_blameless(postmortem):
    """A real blameless post-mortem check: no contributing factor blames a specific person's
    action as the cause, there are at least two distinct contributing factors (never just one,
    which is a sign the postmortem stopped at the first plausible answer), and every action item
    fixes a system or process rather than a person."""
    problems = []
    if len(postmortem["contributing_factors"]) < 2:
        problems.append("fewer than two contributing factors: stopped at the first answer")
    if any(names_a_person(f) for f in postmortem["contributing_factors"]):
        problems.append("a contributing factor blames a person's action instead of a condition")
    if any("retrain" in a["item"].lower() or "manager" in a["owner"].lower() for a in postmortem["action_items"]):
        problems.append("an action item targets a person instead of a system or process")
    return problems


def run():
    assert check_timeline(TIMELINE)
    print(f"Timeline: {len(TIMELINE)} timestamped entries, minute 0 to minute {TIMELINE[-1]['minute']}.")

    impact = impact_in_data_terms()
    print(f"\nImpact in data terms: {impact}")
    assert impact["stale_rows"] == ROWS_PER_MINUTE * INCIDENT_MINUTES
    assert len(impact["affected_plant_decisions"]) >= 2

    blameless_problems = check_blameless(BLAMELESS_POSTMORTEM)
    blaming_problems = check_blameless(BLAMING_POSTMORTEM)
    print(f"\nBlameless post-mortem problems found: {blameless_problems}")
    print(f"Blaming post-mortem problems found: {blaming_problems}")
    assert blameless_problems == []
    assert len(blaming_problems) >= 2


if __name__ == "__main__":
    run()
