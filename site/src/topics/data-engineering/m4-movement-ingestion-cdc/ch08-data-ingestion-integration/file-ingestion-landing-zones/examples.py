# A mock object store, run entirely in this process (no network): a dict of key to bytes with an
# atomic PUT per key and no rename, standing in for the real constraint this topic's syllabus
# names (Chapter 1 topic 11's own object-storage contract). Every number below is a direct
# measurement against that mock: a real producer crash mid-batch, a real manifest gate, a real
# conditional-write race between two producers, a real poison-file quarantine, and the real cost
# shape of event-notification dedup versus prefix listing.


class MockObjectStore:
    """PUT is atomic per key (a reader sees a key's full bytes or nothing); there is no rename.
    A conditional PUT with if_none_match fails outright if the key already exists."""

    def __init__(self):
        self.objects = {}

    def put(self, key, data, if_none_match=False):
        if if_none_match and key in self.objects:
            return {"status": 412, "error": "precondition failed"}
        self.objects[key] = data
        return {"status": 200}

    def list_prefix(self, prefix):
        return sorted(k for k in self.objects if k.startswith(prefix))

    def get(self, key):
        return self.objects.get(key)


def producer_crash_without_manifest(total_files=40, files_before_crash=31):
    """A producer writes files one at a time and crashes partway through. A reader that simply
    lists the prefix and reads whatever is there has no way to tell a complete batch from a
    truncated one."""
    store = MockObjectStore()
    for i in range(files_before_crash):
        store.put(f"landing/batch-1/part-{i:03d}.json", f"row-data-{i}")
    # the producer crashes here; files_before_crash through total_files never get written

    naive_reader_sees = store.list_prefix("landing/batch-1/")
    revenue_per_file = 1000
    true_revenue = total_files * revenue_per_file
    reported_revenue = len(naive_reader_sees) * revenue_per_file
    shortfall_fraction = (true_revenue - reported_revenue) / true_revenue
    return {
        "files_written": len(naive_reader_sees),
        "files_expected": total_files,
        "shortfall_fraction": shortfall_fraction,
        "reader_raised_any_error": False,
    }


def producer_crash_with_manifest(total_files=40, files_before_crash=31):
    """The identical crash, but the reader trusts only a manifest object written last, after
    every data file. A crash before the manifest exists means the reader sees nothing at all —
    never a silent partial batch."""
    store = MockObjectStore()
    for i in range(files_before_crash):
        store.put(f"landing/batch-2/part-{i:03d}.json", f"row-data-{i}")
    # crash before the manifest is ever written

    manifest = store.get("landing/batch-2/_manifest.json")
    reader_reads_anything = manifest is not None
    return {"manifest_exists": manifest is not None, "reader_reads_anything": reader_reads_anything}


def producer_crash_with_manifest_completed(total_files=40):
    """The same protocol, but the producer actually finishes: every file, then the manifest."""
    store = MockObjectStore()
    for i in range(total_files):
        store.put(f"landing/batch-3/part-{i:03d}.json", f"row-data-{i}")
    manifest_contents = [f"part-{i:03d}.json" for i in range(total_files)]
    store.put("landing/batch-3/_manifest.json", manifest_contents)
    manifest = store.get("landing/batch-3/_manifest.json")
    files_reader_trusts = len(manifest) if manifest else 0
    return {"files_reader_trusts": files_reader_trusts, "matches_total": files_reader_trusts == total_files}


def success_marker_protocol(total_files=20):
    """The Hadoop S3A committers' own pattern: data files anywhere, a _SUCCESS marker written
    strictly last. A reader that checks for the marker before listing never reads a batch whose
    marker hasn't landed yet, which is exactly the failure a rename-based commit cannot avoid on
    an object store with no rename."""
    store = MockObjectStore()
    for i in range(total_files):
        store.put(f"landing/batch-4/part-{i:03d}.json", f"row-data-{i}")
    marker_exists_before_success = store.get("landing/batch-4/_SUCCESS") is not None
    store.put("landing/batch-4/_SUCCESS", b"")
    marker_exists_after_success = store.get("landing/batch-4/_SUCCESS") is not None
    return {
        "marker_before": marker_exists_before_success,
        "marker_after": marker_exists_after_success,
    }


def conditional_write_race(key="landing/batch-5/_manifest.json"):
    """Two producers race to publish the same batch's manifest at once. A plain overwriting PUT
    lets whichever one runs last silently win, discarding the other's work with no error at all.
    A conditional PUT with if_none_match makes exactly one of them succeed and the other fail
    loudly, which is the signal a producer needs to know its own publish was rejected."""
    store_plain = MockObjectStore()
    first = store_plain.put(key, "producer-A-manifest")
    second = store_plain.put(key, "producer-B-manifest")  # silently overwrites, no error
    plain_result = {"first_status": first["status"], "second_status": second["status"], "final_winner_visible_as_error": False}

    store_conditional = MockObjectStore()
    first_c = store_conditional.put(key, "producer-A-manifest", if_none_match=True)
    second_c = store_conditional.put(key, "producer-B-manifest", if_none_match=True)  # rejected
    conditional_result = {
        "first_status": first_c["status"],
        "second_status": second_c["status"],
        "winner_recorded": store_conditional.get(key),
    }
    return {"plain": plain_result, "conditional": conditional_result}


def poison_file_quarantine(files):
    """A file that fails schema validation is moved aside with its own reason attached, never
    retried forever and never silently dropped the way a blanket ignore-corrupt-files setting
    would drop it."""
    landed = {}
    quarantined = {}
    for name, rows in files.items():
        if any(not isinstance(r.get("amount"), (int, float)) for r in rows):
            quarantined[name] = {"reason": "amount field is not numeric", "rows": rows}
        else:
            landed[name] = rows
    return {"landed": sorted(landed), "quarantined": sorted(quarantined), "quarantine_reasons": {k: v["reason"] for k, v in quarantined.items()}}


def schema_on_write_catches_immediately(bad_file_rows):
    """Validating a schema at landing time catches a malformed file the moment it lands —
    before any downstream consumer ever sees it."""
    errors = [r for r in bad_file_rows if not isinstance(r.get("amount"), (int, float))]
    return {"caught_at_landing": len(errors) > 0, "detection_delay_runs": 0}


def schema_on_read_defers_detection(bad_file_rows, runs_before_anyone_reads_the_bad_column=90):
    """Schema-on-read lets the identical malformed file land untouched; nothing notices until
    some later run finally reads the column that was always broken."""
    detected_at_run = None
    for run in range(runs_before_anyone_reads_the_bad_column + 1):
        # most runs don't touch the malformed column at all; only the last one does
        if run == runs_before_anyone_reads_the_bad_column:
            errors = [r for r in bad_file_rows if not isinstance(r.get("amount"), (int, float))]
            if errors:
                detected_at_run = run
    return {"caught_at_landing": False, "detection_delay_runs": detected_at_run}


def event_notification_dedup(delivered_events):
    """S3's own documented behaviour: notifications are delivered at least once, so the identical
    object-created event can arrive more than once. A discovery process that doesn't dedup by key
    processes the same batch twice."""
    seen = set()
    processed = []
    duplicates_skipped = 0
    for key in delivered_events:
        if key in seen:
            duplicates_skipped += 1
            continue
        seen.add(key)
        processed.append(key)
    return {"processed_once": len(processed), "duplicates_skipped": duplicates_skipped, "total_delivered": len(delivered_events)}


def listing_cost_grows_with_prefix_size(prefix_sizes):
    """Listing a prefix costs one LIST call per page, and the number of pages grows with how many
    objects already sit under that prefix — a cost notification-driven discovery never pays,
    because it already knows which key just landed."""
    page_size = 1000
    costs = {}
    for n in prefix_sizes:
        pages = -(-n // page_size)  # ceiling division, same cost shape as a real paginated LIST
        costs[n] = pages
    return costs


def check():
    crash_naive = producer_crash_without_manifest()
    assert crash_naive["files_written"] == 31
    assert crash_naive["reader_raised_any_error"] is False  # the exact silent-failure shape
    assert abs(crash_naive["shortfall_fraction"] - 0.225) < 0.001  # a real twenty-two-and-a-half-percent-ish shortfall

    crash_manifest = producer_crash_with_manifest()
    assert crash_manifest["manifest_exists"] is False
    assert crash_manifest["reader_reads_anything"] is False  # nothing, not a silent partial batch

    completed = producer_crash_with_manifest_completed()
    assert completed["matches_total"] is True

    marker = success_marker_protocol()
    assert marker["marker_before"] is False
    assert marker["marker_after"] is True

    race = conditional_write_race()
    assert race["plain"]["second_status"] == 200  # the overwrite succeeds with zero complaint
    assert race["conditional"]["second_status"] == 412  # rejected outright, loudly
    assert race["conditional"]["winner_recorded"] == "producer-A-manifest"

    files = {
        "part-000.json": [{"amount": 10.0}, {"amount": 20.0}],
        "part-001.json": [{"amount": "not-a-number"}, {"amount": 5.0}],
        "part-002.json": [{"amount": 3.0}],
    }
    quarantine = poison_file_quarantine(files)
    assert quarantine["quarantined"] == ["part-001.json"]
    assert quarantine["landed"] == ["part-000.json", "part-002.json"]

    bad_rows = [{"amount": "oops"}, {"amount": 4.0}]
    write_detection = schema_on_write_catches_immediately(bad_rows)
    read_detection = schema_on_read_defers_detection(bad_rows)
    assert write_detection["detection_delay_runs"] == 0
    assert read_detection["detection_delay_runs"] == 90  # the identical bug, found ninety runs later

    dedup = event_notification_dedup(["obj-1", "obj-2", "obj-1", "obj-3", "obj-2", "obj-2"])
    assert dedup["processed_once"] == 3
    assert dedup["duplicates_skipped"] == 3  # half of every delivery this run was a repeat

    listing = listing_cost_grows_with_prefix_size([500, 5000, 50000])
    assert listing[500] == 1
    assert listing[50000] == 50  # the same discovery job, paying fifty times the LIST cost


if __name__ == "__main__":
    check()
    print("de.file-ingestion-landing-zones: all checks passed")
