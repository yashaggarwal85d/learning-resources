"""One job's resource use converted into five vendors' real billing units, and the
break-even utilisation between a serverless rate and a provisioned cluster's flat
hourly cost, derived from topic 6's three-ledger cost model and solved numerically.

Rates are disclosed public figures (AWS Glue pricing page, $0.44/DPU-hour; a realistic
provisioned-cluster hourly rate used only as the comparison point) or documented unit
definitions (EMR Serverless vCPU/GB-seconds, Dataproc DCUs, Databricks DBUs). BigQuery
is deliberately left out of the billing-unit conversion below: its own documentation
states on-demand billing is by TiB scanned, not slot-time, so it has no per-second rate
comparable to the other four without first buying capacity (see OUTLINE.md).
"""
import json

GLUE_DPU_HOUR_RATE = 0.44
GLUE_VCPU_PER_DPU = 4
GLUE_MEM_GB_PER_DPU = 16

DATAPROC_MIN_DCU_PER_SESSION = 12
DATAPROC_VCPU_TO_DCU = 1  # 4 vCPU : 4 DCU, documented 1:1 for the driver/executor shapes quoted in SOURCES.md
DATAPROC_DCU_HOUR_RATE = 0.06  # Google Cloud Dataproc Serverless pricing's own worked example: "Total compute cost = 12 * 24 * $0.060000 = $17.28"

PROVISIONED_HOURLY_RATE = 0.12  # an always-on reserved cluster sized to this job's own 8 vCPU / 32 GB shape, used only as a comparison point, not quoted from any vendor


def job_shape():
    """One job's real resource use, held constant across every vendor conversion."""
    return {"vcpu": 8, "memory_gb": 32, "runtime_seconds": 600}


def glue_dpu_hours(job):
    dpus = max(job["vcpu"] / GLUE_VCPU_PER_DPU, job["memory_gb"] / GLUE_MEM_GB_PER_DPU)
    billed_seconds = max(job["runtime_seconds"], 60)  # AWS Glue: 1-minute minimum duration per run
    dpu_hours = dpus * (billed_seconds / 3600)
    return {"dpus": dpus, "dpu_hours": round(dpu_hours, 4), "cost_usd": round(dpu_hours * GLUE_DPU_HOUR_RATE, 4)}


def dataproc_dcus(job):
    driver_dcu = 4  # SOURCES.md: "1 Driver: 4 vCPUs and 16 GiB of RAM (consumes 4 DCUs)"
    executor_dcu_per_unit = 4  # SOURCES.md: "4 vCPUs and 16 GiB of RAM per executor (consumes 4 DCUs)" scaled below
    executors_needed = max(1, round((job["vcpu"] - 4) / 4))
    dcus = driver_dcu + executors_needed * executor_dcu_per_unit
    dcus = max(dcus, DATAPROC_MIN_DCU_PER_SESSION)  # documented session floor
    billed_seconds = max(job["runtime_seconds"], 1)
    dcu_hours = dcus * (billed_seconds / 3600)
    return {"dcus": dcus, "dcu_hours": round(dcu_hours, 4), "cost_usd": round(dcu_hours * DATAPROC_DCU_HOUR_RATE, 4)}


def convert_job_across_vendors():
    """The same job's resource use, converted into each vendor's own billing unit."""
    job = job_shape()
    glue = glue_dpu_hours(job)
    dataproc = dataproc_dcus(job)
    assert glue["dpus"] == 2.0 and glue["cost_usd"] == 0.1467
    assert dataproc["dcus"] == 12 and dataproc["cost_usd"] == 0.12
    return {
        "job": job,
        "aws_glue": glue,
        "google_dataproc_serverless": dataproc,
        "note": "EMR Serverless and Databricks DBUs bill by actually-consumed vCPU/memory "
        "or by a workload-driven normalized unit (see SOURCES.md); both scale with the same "
        "job shape above but have no single public flat per-unit rate to multiply, unlike "
        "Glue's published $0.44/DPU-hour, so they are named and sourced rather than priced here.",
    }


def break_even_utilisation(serverless_cost_per_hour_busy, provisioned_hourly_rate=PROVISIONED_HOURLY_RATE):
    """At what fraction of a 24-hour day must the job run before a flat-rate provisioned
    cluster becomes cheaper than paying the serverless per-hour-busy rate for every hour it runs?

    serverless_daily_cost(hours_busy) = serverless_cost_per_hour_busy * hours_busy
    provisioned_daily_cost            = provisioned_hourly_rate * 24   (always-on, flat)
    Break-even hours_busy = provisioned_daily_cost / serverless_cost_per_hour_busy.
    """
    provisioned_daily_cost = provisioned_hourly_rate * 24
    break_even_hours = provisioned_daily_cost / serverless_cost_per_hour_busy
    break_even_fraction = break_even_hours / 24
    return {
        "provisioned_daily_cost": round(provisioned_daily_cost, 2),
        "break_even_hours_per_day": round(break_even_hours, 2),
        "break_even_utilisation_fraction": round(break_even_fraction, 4),
    }


def moved_job_nearly_doubled():
    """Reproduces the hook: a job already running six hours a day moves from provisioned
    to serverless and the bill nearly doubles, because six hours a day is already well
    past this job's own break-even line."""
    job = job_shape()
    glue = glue_dpu_hours(job)
    serverless_cost_per_hour_busy = glue["cost_usd"] * (3600 / job["runtime_seconds"])
    be = break_even_utilisation(serverless_cost_per_hour_busy)

    hours_per_day = 6
    provisioned_daily_cost = PROVISIONED_HOURLY_RATE * 24
    serverless_daily_cost = serverless_cost_per_hour_busy * hours_per_day

    assert hours_per_day > be["break_even_hours_per_day"], (
        "the hook requires the moved job to already be past break-even"
    )
    assert serverless_daily_cost > provisioned_daily_cost

    return {
        "break_even": be,
        "hours_per_day": hours_per_day,
        "provisioned_daily_cost": round(provisioned_daily_cost, 2),
        "serverless_daily_cost": round(serverless_daily_cost, 2),
        "ratio": round(serverless_daily_cost / provisioned_daily_cost, 2),
    }


def main():
    print(json.dumps(convert_job_across_vendors(), indent=2))
    print(json.dumps(moved_job_nearly_doubled(), indent=2))


if __name__ == "__main__":
    main()
