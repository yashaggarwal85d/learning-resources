"""Lab for de.multi-tenant-analytics-cost.

The noisy-neighbour simulation (a tenant at ten times load with and
without a quota and a fairness rule), the isolation cost comparison at
two tenant counts, and the per-tenant attribution from a metering
extract are this topic's executable evidence.
"""


ISOLATION_RUNGS = {
    "shared_table_row_security": {"fixed_cost": 500.0, "per_tenant_cost": 2.0, "blast_radius": "all tenants"},
    "schema_per_tenant": {"fixed_cost": 500.0, "per_tenant_cost": 8.0, "blast_radius": "one tenant"},
    "account_per_tenant": {"fixed_cost": 500.0, "per_tenant_cost": 40.0, "blast_radius": "one tenant, fully isolated"},
}


def isolation_total_cost(rung, tenant_count):
    """The fixed platform cost plus each tenant's own marginal cost at
    this isolation rung.
    """
    r = ISOLATION_RUNGS[rung]
    return r["fixed_cost"] + r["per_tenant_cost"] * tenant_count


BASELINE_QUERY_LOAD = 10.0


def neighbour_latency(tenant_load, has_quota, quota_cap=30.0):
    """A neighbour's own latency degrades with total load on shared
    compute; a quota caps one tenant's own contribution to that total.
    """
    effective_load = min(tenant_load, quota_cap) if has_quota else tenant_load
    return BASELINE_QUERY_LOAD * (1 + effective_load / 100.0)


def fairness_allocation(rule, tenant_requested, capacity):
    """Three fairness rules split one shared capacity differently when
    demand exceeds it.
    """
    if rule == "equal_share":
        return capacity / 2
    if rule == "weighted_share":
        return capacity * 0.7  # the paying-more tenant gets the larger share
    if rule == "burst_with_credit":
        return min(tenant_requested, capacity * 0.6)
    raise ValueError(f"unknown fairness rule: {rule}")


def erasure_cost(isolation_rung, rows_to_delete):
    """A tenant isolated by schema or account erases by dropping its
    own container; a tenant in a shared table needs a scan and rewrite
    proportional to the rows touched.
    """
    if isolation_rung == "shared_table_row_security":
        return rows_to_delete * 0.01  # scan-and-rewrite cost grows with rows
    return 5.0  # a flat drop-schema or delete-key cost, independent of row count


def attribute_cost(job_metering, remainder_policy, total_remainder):
    """Allocate each job's own metered cost to its labelled tenant, then
    apply the stated policy to the unattributable remainder.
    """
    per_tenant = {}
    for job in job_metering:
        tenant = job["tenant_label"]
        per_tenant[tenant] = per_tenant.get(tenant, 0) + job["credits_attributed_compute"]

    if remainder_policy == "proportional":
        total_attributed = sum(per_tenant.values())
        for tenant in per_tenant:
            per_tenant[tenant] += total_remainder * (per_tenant[tenant] / total_attributed)
    elif remainder_policy == "flat":
        share = total_remainder / len(per_tenant)
        for tenant in per_tenant:
            per_tenant[tenant] += share
    elif remainder_policy == "platform_absorbed":
        pass  # the remainder is charged to nobody
    else:
        raise ValueError(f"unknown remainder policy: {remainder_policy}")

    return per_tenant


def check():
    small_shared = isolation_total_cost("shared_table_row_security", tenant_count=100)
    small_account = isolation_total_cost("account_per_tenant", tenant_count=100)
    large_shared = isolation_total_cost("shared_table_row_security", tenant_count=100_000)
    large_account = isolation_total_cost("account_per_tenant", tenant_count=100_000)
    assert small_shared < small_account
    assert (large_account - large_shared) > (small_account - small_shared)  # the gap widens with scale

    latency_unthrottled = neighbour_latency(tenant_load=100.0, has_quota=False)
    latency_throttled = neighbour_latency(tenant_load=100.0, has_quota=True)
    assert latency_unthrottled > latency_throttled  # the quota caps the noisy tenant's effect on the neighbour

    equal = fairness_allocation("equal_share", tenant_requested=80, capacity=100)
    weighted = fairness_allocation("weighted_share", tenant_requested=80, capacity=100)
    burst = fairness_allocation("burst_with_credit", tenant_requested=80, capacity=100)
    assert weighted > equal  # the paying-more tenant gets more under a weighted rule
    assert burst == 60.0  # capped at 60% of capacity even though 80 was requested

    shared_erasure = erasure_cost("shared_table_row_security", rows_to_delete=50_000)
    isolated_erasure = erasure_cost("account_per_tenant", rows_to_delete=50_000)
    assert shared_erasure > isolated_erasure  # a shared layout's scan-and-rewrite costs more than dropping a container

    jobs = [
        {"tenant_label": "seller_a", "credits_attributed_compute": 10.0},
        {"tenant_label": "seller_b", "credits_attributed_compute": 30.0},
    ]
    proportional = attribute_cost(jobs, "proportional", total_remainder=20.0)
    flat = attribute_cost(jobs, "flat", total_remainder=20.0)
    absorbed = attribute_cost(jobs, "platform_absorbed", total_remainder=20.0)
    assert round(proportional["seller_b"], 2) == 45.0  # seller_b gets 3x seller_a's share of the remainder too
    assert flat["seller_a"] == 20.0 and flat["seller_b"] == 40.0  # each gets an equal 10-credit remainder share regardless of usage
    assert absorbed["seller_a"] == 10.0 and absorbed["seller_b"] == 30.0  # nobody is charged the remainder


if __name__ == "__main__":
    check()
    print("de.multi-tenant-analytics-cost: all checks passed")
