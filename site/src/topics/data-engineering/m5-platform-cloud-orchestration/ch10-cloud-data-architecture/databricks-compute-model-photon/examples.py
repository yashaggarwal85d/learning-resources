"""The all-purpose-vs-job-compute billing gap, modeled from Databricks' own documented lifecycle
rules (SOURCES.md): all-purpose compute keeps running, and billing, through the gaps between jobs
until its auto-termination timeout fires; a new job compute terminates the moment its one job ends
and is unavailable for restarting. No real Databricks workspace can run in this sandbox, so this
reproduces the documented *lifecycle rule itself* against a synthetic job schedule, not a live
account's real DBU bill.
"""
import json

AUTO_TERMINATION_MINUTES = 30  # a commonly configured inactivity timeout; disclosed as illustrative, not a vendor-fixed default


def all_purpose_billed_minutes(job_schedule, auto_termination_minutes=AUTO_TERMINATION_MINUTES):
    """All-purpose compute stays up (and billed) through idle gaps shorter than the
    auto-termination timeout; it only stops billing once a gap exceeds that timeout."""
    if not job_schedule:
        return 0
    start = job_schedule[0]["start"]
    end = job_schedule[0]["start"] + job_schedule[0]["duration"]
    for job in job_schedule[1:]:
        gap = job["start"] - end
        if gap > auto_termination_minutes:
            end = job["start"] + job["duration"]  # treated as a fresh autostart, billing resets
        else:
            end = job["start"] + job["duration"]
    return end - start


def job_compute_billed_minutes(job_schedule):
    """Job compute bills only the exact runtime of each job; it terminates when the job ends
    and does not bill the gaps between jobs at all."""
    return sum(job["duration"] for job in job_schedule)


def compare_lifecycles(job_schedule):
    all_purpose = all_purpose_billed_minutes(job_schedule)
    job_compute = job_compute_billed_minutes(job_schedule)
    return {
        "all_purpose_billed_minutes": all_purpose,
        "job_compute_billed_minutes": job_compute,
        "idle_minutes_all_purpose_pays_for": all_purpose - job_compute,
    }


def a_day_of_scheduled_etl_jobs():
    """Four short jobs spread across a day, each separated by a gap shorter than the
    auto-termination window — exactly the shape where all-purpose compute quietly bills
    for the idle time between runs, and job compute doesn't."""
    jobs = [
        {"start": 0, "duration": 10},
        {"start": 25, "duration": 10},
        {"start": 50, "duration": 10},
        {"start": 75, "duration": 10},
    ]
    result = compare_lifecycles(jobs)
    assert result["job_compute_billed_minutes"] == 40
    assert result["all_purpose_billed_minutes"] == 85
    assert result["idle_minutes_all_purpose_pays_for"] == 45
    return result


def main():
    print(json.dumps(a_day_of_scheduled_etl_jobs(), indent=2))


if __name__ == "__main__":
    main()
