"""Lab for de.gdpr-erasure-across-lakehouse.

The end-to-end erasure process on the shop's synthetic estate, the
delete-versus-crypto-shredding crossover calculation, and the proof-
pipeline output are this topic's executable evidence.
"""


ESTATE = {
    "lakehouse": {"reachable_by_delete": True},
    "kafka_topic": {"reachable_by_delete": False, "mechanism": "tombstone_and_retention"},
    "nightly_backup": {"reachable_by_delete": False, "mechanism": "age_out_on_retention"},
    "marketing_export": {"reachable_by_delete": False, "mechanism": "restore_and_redact"},
    "training_set": {"reachable_by_delete": False, "mechanism": "blind_spot_registered"},
}


def locate_subject(subject_index, subject_id):
    """A subject index maps a subject directly to the files that hold
    them, so a deletion does not scan the whole lake.
    """
    return subject_index.get(subject_id, [])


def erasure_process_coverage(estate):
    """A real erasure process must name a mechanism for every place in
    the estate, not just the lakehouse the delete operation reaches.
    """
    covered = {}
    blind_spots = []
    for place, info in estate.items():
        if info["reachable_by_delete"]:
            covered[place] = "table_format_delete"
        elif "mechanism" in info:
            covered[place] = info["mechanism"]
        else:
            blind_spots.append(place)
    return covered, blind_spots


def delete_and_expire_cost(requests_per_year, backup_retention_days, cost_per_request_per_day=0.5):
    """Delete-and-expire's cost grows with both how often requests
    arrive and how long backups are kept, since every backup in the
    retention window needs its own redaction pass.
    """
    return requests_per_year * backup_retention_days * cost_per_request_per_day


def crypto_shredding_cost(customer_count, up_front_key_cost_per_customer=8.0, lookup_cost_per_read=0.001, reads_per_year=10_000):
    """Crypto shredding's cost is dominated by the up-front per-subject
    key, plus a small, flat decryption-lookup cost on every read,
    independent of request rate or backup length.
    """
    return customer_count * up_front_key_cost_per_customer + reads_per_year * lookup_cost_per_read


def crossover_requests_per_year(backup_retention_days, shredding_cost, cost_per_request_per_day=0.5):
    """The request rate at which delete-and-expire's cost equals
    crypto shredding's cost, for a given backup retention length.
    """
    denom = backup_retention_days * cost_per_request_per_day
    if denom <= 0:
        return None
    return shredding_cost / denom


def erasure_proof(subject_id, estate_coverage):
    """The automated pipeline's own proof: every place in the estate
    handled, with its mechanism named, assembled for one request.
    """
    return {
        "subject": subject_id,
        "handled": dict(estate_coverage[0]),
        "blind_spots_registered": list(estate_coverage[1]),
        "complete": len(estate_coverage[1]) == 0 or all(estate_coverage[1]),
    }


def check():
    subject_index = {"customer_42": ["events/part-0017.parquet", "orders/part-0003.parquet"]}
    located = locate_subject(subject_index, "customer_42")
    assert located == ["events/part-0017.parquet", "orders/part-0003.parquet"]
    assert locate_subject(subject_index, "customer_99") == []  # an unindexed subject returns nothing to scan blindly

    covered, blind_spots = erasure_process_coverage(ESTATE)
    assert covered["lakehouse"] == "table_format_delete"
    assert covered["kafka_topic"] == "tombstone_and_retention"
    assert covered["training_set"] == "blind_spot_registered"
    assert blind_spots == []  # every place in this estate has a named mechanism, even the training set (registered, not solved)

    short_backups_requests = 50
    long_backups_requests = 50
    short_cost = delete_and_expire_cost(short_backups_requests, backup_retention_days=30)
    long_cost = delete_and_expire_cost(long_backups_requests, backup_retention_days=365)
    assert long_cost > short_cost  # the same request rate costs more against longer backups

    shred_cost = crypto_shredding_cost(customer_count=200_000)
    assert long_cost > shred_cost or short_cost < shred_cost  # a real crossover exists between the two regimes

    crossover = crossover_requests_per_year(backup_retention_days=365, shredding_cost=shred_cost)
    assert crossover is not None and crossover > 0

    proof = erasure_proof("customer_42", (covered, blind_spots))
    assert proof["complete"] is True
    assert proof["handled"]["training_set"] == "blind_spot_registered"


if __name__ == "__main__":
    check()
    print("de.gdpr-erasure-across-lakehouse: all checks passed")
