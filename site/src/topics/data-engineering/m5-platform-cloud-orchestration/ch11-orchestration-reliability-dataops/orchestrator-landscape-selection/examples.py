"""
This topic makes no new mechanism of its own (CHAPTER.md: "Lab: none of its own") -- it compares
tools taught earlier in this chapter against tools that are sourced only. What follows is not a
live experiment; it is a direct verification that every number this topic puts on screen is the
number AWS's and Google's own documentation actually states, quoted word for word in SOURCES.md
and checked again here against the raw fetched page text in sources/.
"""
from __future__ import annotations

from pathlib import Path

SOURCES_DIR = Path(__file__).parent / "sources"


def _read(name: str) -> str:
    return (SOURCES_DIR / name).read_text()


def verify_standard_workflow_duration_and_semantics() -> dict:
    """Standard Workflows: up to one year, exactly-once."""
    text = _read("standard-vs-express.txt")
    assert "Standard Workflows are ideal for long-running (up to one\n year" in text, "duration claim not found verbatim"
    assert "Standard Workflows follow an\n exactly-once model" in text, "exactly-once claim not found verbatim"
    return {"standard_max_duration": "one year", "standard_semantics": "exactly-once"}


def verify_express_workflow_duration_and_semantics() -> dict:
    """Express Workflows: up to 5 minutes, at-least-once."""
    text = _read("standard-vs-express.txt")
    assert "They can run for up to five minutes." in text, "duration claim not found verbatim"
    assert "Express Workflows use an at-least-once model" in text, "at-least-once claim not found verbatim"
    out = {"express_max_duration_minutes": 5, "express_semantics": "at-least-once"}
    assert out["express_max_duration_minutes"] == 5, out
    return out


def verify_distributed_map_fanout() -> dict:
    """Distributed Map: up to 10,000 parallel child workflow executions, each with its own history."""
    text = _read("distributed-map.txt")
    assert "Step Functions runs 10,000 parallel child workflow executions" in text, "fan-out ceiling not found verbatim"
    assert "Each child workflow execution has its own, separate execution history" in text, "isolation claim not found verbatim"
    out = {"distributed_map_default_max_concurrency": 10_000}
    assert out["distributed_map_default_max_concurrency"] == 10_000, out
    return out


def verify_lakeflow_rename_and_scale() -> dict:
    """Databricks Workflows, renamed Lakeflow Jobs at GA, running over 110 million jobs a week."""
    text = _read("lakeflow-ga.txt")
    assert "we’re evolving Workflows into Lakeflow Jobs" in text, "rename claim not found verbatim"
    assert "over 110 million jobs every week" in text, "scale claim not found verbatim"
    return {"lakeflow_jobs_per_week_millions": 110}


def verify_prefect_version() -> dict:
    """Prefect 3.0, released in 2024, open-sourced the events/automations backend."""
    text = _read("prefect.txt")
    assert "With our release of Prefect 3.0 in 2024" in text, "version claim not found verbatim"
    return {"prefect_major_version": 3}


def verify_maestro_scale() -> dict:
    """Netflix Maestro: hundreds of thousands of workflows, millions of jobs, every day."""
    text = _read("netflix-maestro.txt")
    assert "schedules hundreds of thousands of workflows, millions of jobs every day" in text, "scale claim not found verbatim"
    return {"maestro_jobs_per_day": "millions"}


if __name__ == "__main__":
    standard = verify_standard_workflow_duration_and_semantics()
    express = verify_express_workflow_duration_and_semantics()
    print(
        f"Standard: up to {standard['standard_max_duration']}, "
        f"{standard['standard_semantics']}. Express: up to "
        f"{express['express_max_duration_minutes']} minutes, {express['express_semantics']}."
    )

    dist_map = verify_distributed_map_fanout()
    print(f"\nDistributed Map's default ceiling: {dist_map['distributed_map_default_max_concurrency']:,} parallel child executions.")

    lakeflow = verify_lakeflow_rename_and_scale()
    prefect = verify_prefect_version()
    maestro = verify_maestro_scale()
    print(f"\nPrefect {prefect['prefect_major_version']}.0, per Prefect's own docs.")
    print(
        f"\nLakeflow Jobs (renamed from Databricks Workflows at GA): "
        f"{lakeflow['lakeflow_jobs_per_week_millions']} million jobs a week, per Databricks' own announcement."
    )
    print(f"Netflix Maestro: {maestro['maestro_jobs_per_day']} of jobs a day, per Netflix's own README.")
    print("OK: every sourced number verified word for word against the fetched source text.")
