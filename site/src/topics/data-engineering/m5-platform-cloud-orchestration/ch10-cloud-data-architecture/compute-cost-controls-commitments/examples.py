"""A disclosed, structural reproduction of five documented cost-control mechanisms (SOURCES.md):
a max-bytes-billed guardrail, a resource-monitor-style credit quota, a spot/preemptible job's
checkpoint-and-resume behavior, a committed-use break-even calculation, and a cost-regression CI
gate. No real BigQuery, Snowflake, Databricks or Compute Engine account runs in this sandbox;
the dollar/credit figures below are illustrative, chosen to be the right order of magnitude for
each platform's documented billing unit, not quoted prices.
"""
import json

BQ_RATE_USD_PER_TIB = 6.25  # illustrative, same order of magnitude as topic 14's on-demand rate
ON_DEMAND_RATE_USD_PER_HOUR = 1.00
COMMITTED_RATE_USD_PER_HOUR = 0.60
COMMITMENT_HOURS = 730  # illustrative hours in a committed term's billing window


def max_bytes_billed_guardrail(estimated_tib, max_tib_billed):
    """SOURCES.md: 'the number of bytes that the query reads is estimated before the query
    execution. If the number of estimated bytes is beyond the limit, then the query fails
    without incurring a charge.'"""
    if estimated_tib > max_tib_billed:
        return {"blocked": True, "cost_usd": 0.0}
    return {"blocked": False, "cost_usd": round(estimated_tib * BQ_RATE_USD_PER_TIB, 2)}


def runaway_query_vs_guarded_query():
    runaway = max_bytes_billed_guardrail(estimated_tib=50, max_tib_billed=10)
    guarded = max_bytes_billed_guardrail(estimated_tib=5, max_tib_billed=10)
    result = {"runaway": runaway, "guarded": guarded}
    assert result == {
        "runaway": {"blocked": True, "cost_usd": 0.0},
        "guarded": {"blocked": False, "cost_usd": 31.25},
    }
    return result


def resource_monitor_check(warehouse_credits, cloud_services_credits, credit_quota):
    """Reproduces SOURCES.md's own worked example exactly: a 1000-credit quota, 700 credits from
    the warehouse and 300 from cloud services, triggers an alert at exactly the quota."""
    total = warehouse_credits + cloud_services_credits
    return {"total_credits": total, "quota": credit_quota, "alert_triggered": total >= credit_quota}


def resource_monitor_worked_example():
    result = resource_monitor_check(warehouse_credits=700, cloud_services_credits=300, credit_quota=1000)
    assert result == {"total_credits": 1000, "quota": 1000, "alert_triggered": True}
    return result


def spot_job_checkpoint_and_resume(total_units, checkpoint_interval, preempted_at_unit):
    """A spot/preemptible job that checkpoints every `checkpoint_interval` units. Preemption
    loses only the work since the last checkpoint, not the whole job — SOURCES.md's own
    'fault-tolerant workloads' framing, reproduced structurally."""
    last_checkpoint = (preempted_at_unit // checkpoint_interval) * checkpoint_interval
    units_redone = preempted_at_unit - last_checkpoint
    units_lost_if_no_checkpoint = preempted_at_unit
    return {
        "last_checkpoint": last_checkpoint,
        "units_redone": units_redone,
        "units_lost_if_no_checkpoint": units_lost_if_no_checkpoint,
    }


def preemption_worked_example():
    result = spot_job_checkpoint_and_resume(total_units=100, checkpoint_interval=10, preempted_at_unit=47)
    assert result == {"last_checkpoint": 40, "units_redone": 7, "units_lost_if_no_checkpoint": 47}
    return result


def commitment_breakeven():
    """The same break-even-utilisation logic as topic 10 (serverless vs provisioned), applied to
    a committed-use discount instead of a single job's hourly rate."""
    committed_cost = round(COMMITMENT_HOURS * COMMITTED_RATE_USD_PER_HOUR, 2)
    breakeven_hours = round(committed_cost / ON_DEMAND_RATE_USD_PER_HOUR, 2)
    breakeven_utilization_pct = round(100 * breakeven_hours / COMMITMENT_HOURS, 2)
    result = {
        "committed_cost_usd": committed_cost,
        "breakeven_hours": breakeven_hours,
        "breakeven_utilization_pct": breakeven_utilization_pct,
    }
    assert result == {
        "committed_cost_usd": 438.0,
        "breakeven_hours": 438.0,
        "breakeven_utilization_pct": 60.0,
    }
    return result


def cost_regression_gate(baseline_usd, measured_usd, threshold_pct):
    """A cost regression failing a CI run exactly like a correctness or performance regression
    would — a minimal, disclosed reproduction of the documented practice, not a real CI system."""
    increase_pct = round(100 * (measured_usd - baseline_usd) / baseline_usd, 2)
    return {"increase_pct": increase_pct, "ci_passes": increase_pct <= threshold_pct}


def cost_regression_worked_examples():
    within_budget = cost_regression_gate(baseline_usd=100, measured_usd=110, threshold_pct=20)
    over_budget = cost_regression_gate(baseline_usd=100, measured_usd=135, threshold_pct=20)
    result = {"within_budget": within_budget, "over_budget": over_budget}
    assert result == {
        "within_budget": {"increase_pct": 10.0, "ci_passes": True},
        "over_budget": {"increase_pct": 35.0, "ci_passes": False},
    }
    return result


def main():
    print(json.dumps(runaway_query_vs_guarded_query(), indent=2))
    print(json.dumps(resource_monitor_worked_example(), indent=2))
    print(json.dumps(preemption_worked_example(), indent=2))
    print(json.dumps(commitment_breakeven(), indent=2))
    print(json.dumps(cost_regression_worked_examples(), indent=2))


if __name__ == "__main__":
    main()
