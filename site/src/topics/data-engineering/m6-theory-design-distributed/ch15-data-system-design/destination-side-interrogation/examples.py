"""Lab for de.destination-side-interrogation.

A destination-interview checklist simulation: a vague prompt forks into
several consumers, each answered with a serving store, a freshness bound,
and a bet-or-fact flag; export paths are checked as a design input.
"""

CONSUMERS = {
    "plant_lead_dashboard": {"kind": "bi", "grain": "per_line"},
    "quality_report": {"kind": "bi", "grain": "per_batch"},
    "maintenance_model": {"kind": "ml", "grain": "per_machine"},
    "compliance_filing": {"kind": "regulatory", "grain": "per_shift"},
}

SERVING_STORE_BY_KIND = {
    "bi": "warehouse_aggregate",
    "ml": "feature_store_point_in_time",
    "operational_api": "low_latency_kv",
    "regulatory": "immutable_reproducible_report",
}


def list_consumers(dataset_consumers):
    """List every consumer of one dataset, not just the one who asked."""
    return list(dataset_consumers.keys())


def serving_store_per_consumer(dataset_consumers):
    """Each consumer's kind implies its own serving store."""
    return {name: SERVING_STORE_BY_KIND[info["kind"]] for name, info in dataset_consumers.items()}


def sharp_question_answer(consumer, moment_of_use_action):
    """What do you do the moment you see the number — turns a vague
    freshness demand into a concrete one.
    """
    return {"consumer": consumer, "freshness_need": moment_of_use_action}


def record_answer(question_id, value, is_bet):
    """An answer is either a stated fact or an explicit bet about the
    future — never silently treated as the other.
    """
    return {"question_id": question_id, "value": value, "is_bet": is_bet}


def bets_vs_facts(answers):
    """Split answers into facts and bets, so a bet is never mistaken for
    a measurement.
    """
    facts = [a["question_id"] for a in answers if not a["is_bet"]]
    bets = [a["question_id"] for a in answers if a["is_bet"]]
    return {"facts": facts, "bets": bets}


EXPORT_PATHS = {
    "csv_download": {"bypasses_engine_policy": True},
    "bi_extract": {"bypasses_engine_policy": True},
    "api_read": {"bypasses_engine_policy": False},
}


def flag_export_paths(export_paths):
    """An export path that bypasses the engine's own policy is a design
    input, not an afterthought.
    """
    return [name for name, info in export_paths.items() if info["bypasses_engine_policy"]]


def five_answers_that_change_design(answers, weights):
    """The five answers that most change a design, by a stated weight per
    question id.
    """
    scored = [(a["question_id"], weights.get(a["question_id"], 0)) for a in answers]
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return [qid for qid, _ in scored[:5]]


def designs_from_freshness(freshness_need):
    """The two designs a vague prompt forks into, chosen by the sharp
    question's answer.
    """
    if freshness_need == "sub_second":
        return "streaming_operator_display"
    return "fifteen_minute_refresh_aggregate"


def check():
    consumers = list_consumers(CONSUMERS)
    assert consumers == ["plant_lead_dashboard", "quality_report", "maintenance_model", "compliance_filing"]

    stores = serving_store_per_consumer(CONSUMERS)
    assert stores["plant_lead_dashboard"] == "warehouse_aggregate"
    assert stores["maintenance_model"] == "feature_store_point_in_time"
    assert stores["compliance_filing"] == "immutable_reproducible_report"
    assert len(set(stores.values())) >= 3  # several consumers, several stores

    sharp = sharp_question_answer("plant_lead", "walks the floor when the number crosses a line")
    assert "walks the floor" in sharp["freshness_need"]

    answers = [
        record_answer("current_tenant_count", 40, is_bet=False),
        record_answer("current_query_rate", 12, is_bet=False),
        record_answer("retention_years", 3, is_bet=False),
        record_answer("next_year_tenant_count", 80, is_bet=True),
        record_answer("grain_needed", "per_line", is_bet=False),
    ]
    split = bets_vs_facts(answers)
    assert split["bets"] == ["next_year_tenant_count"]
    assert "current_tenant_count" in split["facts"]

    flagged = flag_export_paths(EXPORT_PATHS)
    assert set(flagged) == {"csv_download", "bi_extract"}
    assert "api_read" not in flagged

    weights = {"current_query_rate": 9, "grain_needed": 8, "retention_years": 7, "next_year_tenant_count": 6, "current_tenant_count": 2}
    top5 = five_answers_that_change_design(answers, weights)
    assert top5 == ["current_query_rate", "grain_needed", "retention_years", "next_year_tenant_count", "current_tenant_count"]

    assert designs_from_freshness("sub_second") == "streaming_operator_display"
    assert designs_from_freshness("fifteen_minutes") == "fifteen_minute_refresh_aggregate"


if __name__ == "__main__":
    check()
    print("de.destination-side-interrogation: all checks passed")
