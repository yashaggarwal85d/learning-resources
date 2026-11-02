"""A worked, disclosed-illustrative reproduction of the four platforms' own documented billing
mechanisms (DBUs, Snowflake credits, Fabric CU-smoothing, BigQuery slots vs on-demand) applied to
one representative daily workload, plus a minimal exit-cost model contrasting open-format,
customer-owned storage against a vendor's internally-optimized proprietary format. The specific
dollar rates below are illustrative, chosen to be the right order of magnitude for each platform's
publicly documented pricing structure (SOURCES.md), not quoted prices — no real account in any of
the four platforms runs in this sandbox.
"""
import json

DBU_RATE_USD = 0.22            # illustrative $/DBU, Jobs Compute tier order of magnitude
CREDIT_PRICE_USD = 3.00        # illustrative $/Snowflake credit
FABRIC_CU_RATE_USD = 0.36      # illustrative $/Fabric capacity-unit-hour
BQ_ON_DEMAND_RATE_USD = 6.25   # illustrative $/TiB scanned, on-demand
BQ_SLOT_RATE_USD = 0.04        # illustrative $/slot-hour
EXPORT_RATE_USD_PER_GB = 0.05  # illustrative cost of a bulk unload out of proprietary storage


def databricks_daily_cost(dbus=100):
    return round(dbus * DBU_RATE_USD, 2)


def snowflake_daily_cost(credits=20):
    return round(credits * CREDIT_PRICE_USD, 2)


def fabric_smoothed_cost(reserved_cu=2, spike_cu=4, spike_hours=1, window_hours=24):
    """Reproduces SOURCES.md's own worked example: a 2-CU reservation that spikes to 4 CU for
    one hour has its usage spread across the 24-hour smoothing window, billed on the average
    rather than the peak."""
    normal_hours = window_hours - spike_hours
    total_cu_hours = reserved_cu * normal_hours + spike_cu * spike_hours
    smoothed_avg_cu = total_cu_hours / window_hours
    return {
        "total_cu_hours": total_cu_hours,
        "smoothed_avg_cu": round(smoothed_avg_cu, 4),
        "cost_usd": round(total_cu_hours * FABRIC_CU_RATE_USD, 2),
    }


def bigquery_on_demand_cost(tib_scanned=2):
    return round(tib_scanned * BQ_ON_DEMAND_RATE_USD, 2)


def bigquery_slots_cost(slot_hours=50):
    return round(slot_hours * BQ_SLOT_RATE_USD, 2)


def four_platform_comparison():
    """One representative nightly workload, priced through each platform's own documented
    billing unit. The point is the unit each one bills by, not which number is biggest."""
    result = {
        "databricks_usd": databricks_daily_cost(),
        "snowflake_usd": snowflake_daily_cost(),
        "fabric_usd": fabric_smoothed_cost()["cost_usd"],
        "bigquery_on_demand_usd": bigquery_on_demand_cost(),
        "bigquery_slots_usd": bigquery_slots_cost(),
    }
    assert result == {
        "databricks_usd": 22.0,
        "snowflake_usd": 60.0,
        "fabric_usd": 18.0,
        "bigquery_on_demand_usd": 12.5,
        "bigquery_slots_usd": 2.0,
    }
    return result


def exit_cost_estimate(open_format, data_gb=500):
    """Open-format storage in a bucket the customer already owns (Databricks' UniForm, a
    BigQuery Iceberg managed table): the data is already readable by anything, so leaving costs
    nothing beyond stopping payment. A proprietary, internally-optimized format (a plain
    Snowflake table's own compressed columnar storage) needs a bulk unload into an open format
    before it's usable anywhere else, which costs compute and time proportional to data volume."""
    if open_format:
        return 0.0
    return round(data_gb * EXPORT_RATE_USD_PER_GB, 2)


def exit_cost_comparison():
    result = {
        "open_format_exit_usd": exit_cost_estimate(open_format=True),
        "proprietary_format_exit_usd": exit_cost_estimate(open_format=False),
    }
    assert result == {
        "open_format_exit_usd": 0.0,
        "proprietary_format_exit_usd": 25.0,
    }
    return result


def main():
    print(json.dumps(four_platform_comparison(), indent=2))
    print(json.dumps(fabric_smoothed_cost(), indent=2))
    print(json.dumps(exit_cost_comparison(), indent=2))


if __name__ == "__main__":
    main()
