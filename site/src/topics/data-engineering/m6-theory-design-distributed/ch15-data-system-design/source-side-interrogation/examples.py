"""Lab for de.source-side-interrogation.

A source-interview checklist simulation: fifteen questions across six
dimensions, each answered as a measurement, an adjective (flagged), or an
explicit unknown; the answers feed the estimate, the shape decision, and the
correctness plan, and connector growth is priced by source count.
"""

SOURCE_INTERVIEW_QUESTIONS = [
    {"id": "schema_owner", "dimension": "origin_format_schema"},
    {"id": "schema_notice", "dimension": "origin_format_schema"},
    {"id": "delivery_format", "dimension": "origin_format_schema"},
    {"id": "average_rate", "dimension": "volume_rate"},
    {"id": "peak_rate", "dimension": "volume_rate"},
    {"id": "burst_cause", "dimension": "volume_rate"},
    {"id": "growth_rate", "dimension": "volume_rate"},
    {"id": "late_how_late", "dimension": "delivery_reliability"},
    {"id": "resends", "dimension": "delivery_reliability"},
    {"id": "drops", "dimension": "delivery_reliability"},
    {"id": "outage_behavior", "dimension": "delivery_reliability"},
    {"id": "pull_or_push", "dimension": "pull_push_connector"},
    {"id": "protocol_auth", "dimension": "protocol_auth_quota"},
    {"id": "rate_limit", "dimension": "protocol_auth_quota"},
    {"id": "residency", "dimension": "encryption_residency_compliance"},
]


def record_answer(question_id, value, is_measurement):
    """An answer is a measurement, an adjective (flagged), or an explicit
    unknown — never silently assumed.
    """
    if value is None:
        return {"question_id": question_id, "status": "unknown", "value": None}
    if not is_measurement:
        return {"question_id": question_id, "status": "adjective", "value": value}
    return {"question_id": question_id, "status": "measured", "value": value}


def run_interview(questions, answers):
    """Run the fifteen-question interview; every question not in ``answers``
    comes back an explicit unknown.
    """
    results = []
    for q in questions:
        qid = q["id"]
        if qid in answers:
            value, is_measurement = answers[qid]
            results.append(record_answer(qid, value, is_measurement))
        else:
            results.append(record_answer(qid, None, False))
    return results


def unanswerable(results):
    """The questions the source genuinely couldn't answer — explicit
    unknowns, not assumptions.
    """
    return [r["question_id"] for r in results if r["status"] == "unknown"]


def adjectives_to_flag(results):
    """Answers given as adjectives, not measurements — 'real time' instead
    of a number.
    """
    return [r["question_id"] for r in results if r["status"] == "adjective"]


def estimate_inputs(results):
    """Pull the estimate's own inputs (rate, peak, growth) out of the
    answered questions.
    """
    by_id = {r["question_id"]: r for r in results}
    needed = ["average_rate", "peak_rate", "growth_rate"]
    return {qid: by_id[qid]["value"] for qid in needed if by_id[qid]["status"] == "measured"}


def shape_decision(results):
    """Push vs pull is read straight off the pull_or_push answer."""
    by_id = {r["question_id"]: r for r in results}
    answer = by_id["pull_or_push"]
    if answer["status"] != "measured":
        return "unknown"
    return answer["value"]


def correctness_plan(results):
    """The four facts the design plans for: late, resend, drop, outage
    behavior.
    """
    by_id = {r["question_id"]: r for r in results}
    plan = {}
    for qid in ("late_how_late", "resends", "drops", "outage_behavior"):
        r = by_id[qid]
        plan[qid] = r["value"] if r["status"] == "measured" else "assume worst case"
    return plan


def connector_growth_cost(source_count, cost_per_connector):
    """The maintenance cost of N connectors: each source is a new connector
    to build, monitor, and upgrade.
    """
    return source_count * cost_per_connector


def top_three_changers(results, weights):
    """The three answers that most change a design, by a stated weight per
    question id.
    """
    scored = [(r["question_id"], weights.get(r["question_id"], 0)) for r in results]
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return [qid for qid, _ in scored[:3]]


def check():
    answers = {
        "schema_owner": ("partner's platform team", True),
        "schema_notice": ("a day's notice, best effort", True),
        "delivery_format": ("JSON events over a webhook", True),
        "average_rate": (1_200, True),
        "peak_rate": (9_000, True),
        "growth_rate": (0.4, True),
        "resends": ("yes, no new event id on resend", True),
        "drops": ("real time", False),
        "pull_or_push": ("push", True),
        "protocol_auth": ("HTTPS, signed secret", True),
    }
    results = run_interview(SOURCE_INTERVIEW_QUESTIONS, answers)

    unknowns = unanswerable(results)
    assert "rate_limit" in unknowns
    assert "residency" in unknowns
    assert "burst_cause" in unknowns
    assert "late_how_late" in unknowns
    assert "outage_behavior" in unknowns

    flagged = adjectives_to_flag(results)
    assert flagged == ["drops"]

    inputs = estimate_inputs(results)
    assert inputs == {"average_rate": 1_200, "peak_rate": 9_000, "growth_rate": 0.4}

    assert shape_decision(results) == "push"

    plan = correctness_plan(results)
    assert plan["resends"] == "yes, no new event id on resend"
    assert plan["late_how_late"] == "assume worst case"

    assert connector_growth_cost(source_count=12, cost_per_connector=3) == 36

    weights = {"rate_limit": 9, "schema_owner": 8, "resends": 7, "drops": 2}
    assert top_three_changers(results, weights) == ["rate_limit", "schema_owner", "resends"]


if __name__ == "__main__":
    check()
    print("de.source-side-interrogation: all checks passed")
