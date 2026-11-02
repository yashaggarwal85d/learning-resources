"""Lab for de.data-quality-monitoring-platform.

The check-execution cost estimate, the lineage-grouped routing, the
week-of-alerts simulation (with and without grouping and suppression), and
the alert-precision calculation are this topic's executable evidence.
"""


def check_cost(kind, rows_scanned=0, metric_updates=0):
    """A declarative or statistical check's own running cost: a full scan,
    an incremental metric update, or a metadata-only lookup that scans
    nothing at all.
    """
    if kind == "full_scan":
        return rows_scanned * 0.001
    if kind == "incremental_metric":
        return metric_updates * 0.0005
    if kind == "metadata_only":
        return 0.0
    raise ValueError(kind)


def route_by_lineage(root_cause, downstream_map):
    """A failing root-cause table's downstream dependents, found by
    walking the lineage graph, all collapse under one alert routed to the
    root table's own owner rather than each dependent's.
    """
    downstream = downstream_map.get(root_cause, [])
    return {"alert_count": 1, "owner": root_cause, "grouped_consequences": downstream}


def simulate_week(root_cause_failures, downstream_map, grouped, suppressed_windows=()):
    """A week of alerts: each root-cause failure either floods one alert
    per downstream table (ungrouped) or one alert total (grouped by
    lineage), and a suppressed window's failures are dropped entirely.
    """
    alerts = []
    for day, cause in root_cause_failures:
        if day in suppressed_windows:
            continue
        if grouped:
            alerts.append(route_by_lineage(cause, downstream_map))
        else:
            downstream = downstream_map.get(cause, [])
            for _ in range(len(downstream) + 1):
                alerts.append({"alert_count": 1, "owner": cause, "grouped_consequences": []})
    return alerts


def alert_precision(alerts, acted_on_causes):
    """The platform's own SLO: the share of alerts that corresponded to a
    real, acted-on failure, not an alert that fired and was ignored.
    """
    if not alerts:
        return 1.0
    acted = sum(1 for a in alerts if a["owner"] in acted_on_causes)
    return acted / len(alerts)


def check():
    downstream_map = {
        "orders_raw": ["orders_daily", "orders_weekly", "finance_close"] + [f"dep_{i}" for i in range(37)],
    }

    full = check_cost("full_scan", rows_scanned=1_000_000)
    incremental = check_cost("incremental_metric", metric_updates=1_000_000)
    metadata = check_cost("metadata_only")
    assert full > incremental > metadata == 0.0  # a full scan costs the most; a metadata-only check costs nothing

    routed = route_by_lineage("orders_raw", downstream_map)
    assert routed["alert_count"] == 1
    assert len(routed["grouped_consequences"]) == 40  # forty downstream tables collapse into one alert

    failures = [(1, "orders_raw"), (2, "orders_raw"), (3, "orders_raw")]
    ungrouped = simulate_week(failures, downstream_map, grouped=False)
    grouped = simulate_week(failures, downstream_map, grouped=True)
    assert len(ungrouped) == 3 * 41  # each failure floods one alert per downstream table plus the root
    assert len(grouped) == 3  # the same three failures collapse to one alert each

    suppressed = simulate_week(failures, downstream_map, grouped=True, suppressed_windows=(2,))
    assert len(suppressed) == 2  # day 2's planned-change window suppresses that day's alert entirely

    precision_grouped = alert_precision(grouped, acted_on_causes={"orders_raw"})
    precision_ungrouped = alert_precision(ungrouped, acted_on_causes={"orders_raw"})
    assert precision_grouped == 1.0  # every grouped alert traces to a real, acted-on cause
    assert precision_ungrouped == 1.0  # same owner on every flooded alert, but the flood itself is the problem grouping fixes
    assert len(grouped) < len(ungrouped)  # grouping cuts alert volume without losing precision

    ten_x_downstream = {"orders_raw": [f"dep_{i}" for i in range(400)]}
    ten_x_routed = route_by_lineage("orders_raw", ten_x_downstream)
    assert ten_x_routed["alert_count"] == 1  # the routing still collapses to one alert at ten times the table count
    assert len(ten_x_routed["grouped_consequences"]) == 400


if __name__ == "__main__":
    check()
    print("de.data-quality-monitoring-platform: all checks passed")
