"""A disclosed, structural reproduction of three documented GDPR-by-design mechanisms: a
machine-readable purpose tag enforced at query time, a retention job that actually deletes data
on schedule, and an Article 30 record of processing assembled automatically from lineage and
purpose-tag metadata. No real regulator, production pipeline or OpenLineage-integrated system
runs in this sandbox; the dataset and event log below are synthetic.
"""
import json
from datetime import date, timedelta

RETENTION_DAYS = {"marketing_consent": 30, "fraud_detection": 365, "support_ticket": 90}


def purpose_tag_check(record_purpose, query_purpose):
    """GDPR Art. 5(1)(b): data collected for a specified purpose may not be further processed
    in a manner incompatible with it. A query for a different purpose than the one a record was
    tagged with at ingestion is mechanically blocked."""
    return {"allowed": record_purpose == query_purpose, "record_purpose": record_purpose, "query_purpose": query_purpose}


def purpose_tag_worked_example():
    allowed = purpose_tag_check(record_purpose="fraud_detection", query_purpose="fraud_detection")
    blocked = purpose_tag_check(record_purpose="fraud_detection", query_purpose="marketing_campaign")
    result = {"allowed": allowed, "blocked": blocked}
    assert result == {
        "allowed": {"allowed": True, "record_purpose": "fraud_detection", "query_purpose": "fraud_detection"},
        "blocked": {"allowed": False, "record_purpose": "fraud_detection", "query_purpose": "marketing_campaign"},
    }
    return result


def minimise_at_ingestion(raw_record, purpose):
    """GDPR Art. 5(1)(c): data minimisation as an ingestion-time choice, not a retrofit. A
    marketing-consent record never needs a phone number, so it is dropped before storage."""
    if purpose == "marketing_consent":
        return {k: v for k, v in raw_record.items() if k != "phone"}
    return dict(raw_record)


def minimisation_worked_example():
    raw = {"email": "a@example.com", "phone": "+1-555-0100", "consent_ts": "2026-01-01"}
    stored = minimise_at_ingestion(raw, purpose="marketing_consent")
    assert stored == {"email": "a@example.com", "consent_ts": "2026-01-01"}
    return stored


def retention_job(records, today):
    """GDPR Art. 5(1)(e): storage limitation enforced as a scheduled deletion job tied to each
    record's purpose tag, not a policy nobody checks."""
    kept, deleted = [], []
    for r in records:
        expiry = date.fromisoformat(r["ingested"]) + timedelta(days=RETENTION_DAYS[r["purpose"]])
        (deleted if today > expiry else kept).append(r["id"])
    return {"kept": kept, "deleted": deleted}


def retention_job_worked_example():
    records = [
        {"id": "r1", "purpose": "marketing_consent", "ingested": "2026-01-01"},
        {"id": "r2", "purpose": "fraud_detection", "ingested": "2026-01-01"},
        {"id": "r3", "purpose": "marketing_consent", "ingested": "2026-10-20"},
    ]
    result = retention_job(records, today=date(2026, 10, 31))
    assert result == {"kept": ["r2", "r3"], "deleted": ["r1"]}
    return result


def art30_record_from_lineage(jobs, datasets, purpose_tags):
    """GDPR Art. 30: a record of processing activities, assembled from OpenLineage-shaped Job
    and Dataset metadata plus purpose tags already attached at ingestion, rather than maintained
    by hand in a separate document."""
    record = []
    for job in jobs:
        record.append({
            "job": job["name"],
            "purposes": sorted({purpose_tags[d] for d in job["outputs"] if d in purpose_tags}),
            "categories_of_data": sorted({datasets[d]["category"] for d in job["outputs"] if d in datasets}),
            "retention_days": sorted({RETENTION_DAYS[purpose_tags[d]] for d in job["outputs"] if d in purpose_tags}),
        })
    return record


def art30_worked_example():
    jobs = [{"name": "ingest_signups", "outputs": ["signups"]}, {"name": "score_fraud", "outputs": ["fraud_scores"]}]
    datasets = {"signups": {"category": "contact_details"}, "fraud_scores": {"category": "behavioural"}}
    purpose_tags = {"signups": "marketing_consent", "fraud_scores": "fraud_detection"}
    result = art30_record_from_lineage(jobs, datasets, purpose_tags)
    assert result == [
        {"job": "ingest_signups", "purposes": ["marketing_consent"], "categories_of_data": ["contact_details"], "retention_days": [30]},
        {"job": "score_fraud", "purposes": ["fraud_detection"], "categories_of_data": ["behavioural"], "retention_days": [365]},
    ]
    return result


def dpia_trigger_check(scale, category):
    """GDPR Art. 35's three named triggering categories, checked structurally rather than left
    as a vague 'do one for everything.'"""
    triggers = {
        "large_scale_profiling": scale == "large" and category == "automated_profiling_with_legal_effect",
        "large_scale_special_category": scale == "large" and category == "special_category_or_criminal",
        "large_scale_public_monitoring": scale == "large" and category == "public_area_monitoring",
    }
    return {"dpia_required": any(triggers.values()), "triggers": triggers}


def dpia_worked_examples():
    small_marketing = dpia_trigger_check(scale="small", category="automated_profiling_with_legal_effect")
    large_profiling = dpia_trigger_check(scale="large", category="automated_profiling_with_legal_effect")
    result = {"small_marketing": small_marketing, "large_profiling": large_profiling}
    assert result["small_marketing"]["dpia_required"] is False
    assert result["large_profiling"]["dpia_required"] is True
    return result


def breach_notification_clock(discovered_at_hour, notified_at_hour):
    """GDPR Art. 33: the 72-hour clock starts from awareness of the breach, not from when the
    breach itself occurred."""
    hours_elapsed = notified_at_hour - discovered_at_hour
    return {"hours_elapsed": hours_elapsed, "within_window": hours_elapsed <= 72, "needs_delay_reason": hours_elapsed > 72}


def breach_worked_examples():
    on_time = breach_notification_clock(discovered_at_hour=0, notified_at_hour=48)
    late = breach_notification_clock(discovered_at_hour=0, notified_at_hour=96)
    result = {"on_time": on_time, "late": late}
    assert result == {
        "on_time": {"hours_elapsed": 48, "within_window": True, "needs_delay_reason": False},
        "late": {"hours_elapsed": 96, "within_window": False, "needs_delay_reason": True},
    }
    return result


def main():
    print(json.dumps(purpose_tag_worked_example(), indent=2))
    print(json.dumps(minimisation_worked_example(), indent=2))
    print(json.dumps(retention_job_worked_example(), indent=2))
    print(json.dumps(art30_worked_example(), indent=2))
    print(json.dumps(dpia_worked_examples(), indent=2))
    print(json.dumps(breach_worked_examples(), indent=2))


if __name__ == "__main__":
    main()
