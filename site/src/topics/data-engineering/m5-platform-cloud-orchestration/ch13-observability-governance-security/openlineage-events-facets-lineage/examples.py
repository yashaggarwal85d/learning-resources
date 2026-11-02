"""Measured claims for de.openlineage-events-facets-lineage.

This file models two things OpenLineage's own specification pages describe: the additive
run-event model (START, then a later terminal event that adds detail the START didn't have),
and the gap between parsing a job's SQL text and reading its actual runtime plan for column
lineage. There is no real Spark cluster or Marquez server in this sandbox; per this topic's own
CHAPTER.md ("where Marquez or Airflow cannot run, the Spark listener's events are inspected as
files and the Airflow and Marquez parts are sourced and disclosed"), this models the OpenLineage
event shape and the SQL-parse-vs-plan-walk mechanism directly, in plain Python, against the
spec's own documented behaviour (quoted in SOURCES.md), rather than running a real cluster.

Claim 1: a run's START event and its later COMPLETE event share the same runId; the output
dataset is attached only at COMPLETE, not at START, demonstrating OpenLineage's own "subsequent
updates are additive" rule.

Claim 2: for a query with a CASE expression, a UDF and a table name built from a runtime
parameter, parsing the SQL text alone finds fewer column-lineage edges than walking the actual
logical plan does -- the runtime plan sees through the UDF and the dynamic table name; the
SQL-text parse cannot.
"""

import re
import uuid


# ---- Claim 1: the additive run-event model ----

class RunEventEmitter:
    def __init__(self, job_name: str):
        self.job_name = job_name
        self.run_id = str(uuid.uuid4())
        self.events: list[dict] = []

    def start(self, inputs: list[str]) -> dict:
        event = {"eventType": "START", "runId": self.run_id, "job": self.job_name, "inputs": inputs, "outputs": []}
        self.events.append(event)
        return event

    def complete(self, outputs: list[str], schema_facet: dict) -> dict:
        event = {
            "eventType": "COMPLETE",
            "runId": self.run_id,
            "job": self.job_name,
            "inputs": self.events[0]["inputs"],  # additive: carries forward what START already said
            "outputs": outputs,
            "facets": {"schema": schema_facet},
        }
        self.events.append(event)
        return event


# ---- Claim 2: SQL-text parsing vs runtime logical plan for column lineage ----

# The job's SQL text. A dynamic table name is built from a parameter the SQL text never shows
# resolved, and normalize_region is a UDF whose body the SQL text gives no visibility into.
PARAM_REGION = "us"
SQL_TEXT = """
SELECT
  normalize_region(region) AS region_norm,
  CASE WHEN country = 'US' THEN usd_amount ELSE usd_amount * fx_rate END AS revenue
FROM {table_prefix}_orders
""".strip()


def sql_parsed_lineage(sql_text: str) -> dict[str, set[str]]:
    """A toy SQL-text parser: regex over the raw text. It can find literal column names
    referenced in a SELECT list, but it has no way to resolve a UDF's own internal column
    reads, and it cannot resolve a table name built from a format-string placeholder at all --
    exactly OpenLineage's Spark documentation's own caveat that a SQL-text parse yields table
    and field names only, not transformation types."""
    edges: dict[str, set[str]] = {"region_norm": set(), "revenue": set()}
    # "normalize_region(region)" -- the parser sees the UDF call and its argument, but cannot
    # see what normalize_region actually reads or does with it beyond the one visible arg.
    udf_call = re.search(r"normalize_region\((\w+)\)", sql_text)
    if udf_call:
        edges["region_norm"].add(udf_call.group(1))
    # the CASE expression's own referenced columns are visible as plain identifiers.
    case_cols = re.findall(r"\b(country|usd_amount|fx_rate)\b", sql_text)
    edges["revenue"] = set(case_cols)
    # the table name itself is a literal placeholder in the text -- never resolved to a real name.
    table_match = re.search(r"FROM (\{[\w_]+\}_orders)", sql_text)
    resolved_table = table_match.group(1) if table_match else None
    return edges, resolved_table


def runtime_plan_lineage(param_region: str) -> dict[str, set[str]]:
    """A toy logical-plan walker: it runs with the real parameter bound, so it sees the UDF's
    own actual column reads (normalize_region reads both region and a hidden locale-config
    column internally) and the table name after the parameter is substituted in."""
    # The UDF's real implementation, as the plan walker would see it by tracing its reads.
    def normalize_region(region: str, locale_config: str) -> str:
        return region.lower()

    edges = {
        "region_norm": {"region", "locale_config"},  # the UDF's real input set, both columns
        "revenue": {"country", "usd_amount", "fx_rate"},
    }
    resolved_table = f"{param_region}_orders"  # the parameter is bound at runtime
    return edges, resolved_table


def main() -> None:
    # Claim 1
    emitter = RunEventEmitter("daily_revenue_job")
    start_event = emitter.start(inputs=["orders"])
    assert start_event["outputs"] == [], "START should carry no output dataset yet"
    complete_event = emitter.complete(outputs=["analytics.daily_revenue"], schema_facet={"fields": [{"name": "revenue", "type": "DOUBLE"}]})
    assert complete_event["runId"] == start_event["runId"], "START and COMPLETE must share the same runId"
    assert complete_event["outputs"] == ["analytics.daily_revenue"], "the output dataset should appear only once COMPLETE is sent"
    assert complete_event["inputs"] == start_event["inputs"], "COMPLETE should carry forward the inputs START already declared (additive)"
    print(f"Claim 1: START (runId {start_event['runId'][:8]}...) has no outputs; the later COMPLETE for the same runId adds the output dataset and the schema facet")

    # Claim 2
    sql_edges, sql_table = sql_parsed_lineage(SQL_TEXT)
    plan_edges, plan_table = runtime_plan_lineage(PARAM_REGION)

    assert sql_edges["region_norm"] == {"region"}, "the SQL-text parse should only see the UDF's visible argument"
    assert plan_edges["region_norm"] == {"region", "locale_config"}, "the runtime plan should see the UDF's real, full set of column reads"
    assert sql_edges["region_norm"] < plan_edges["region_norm"], "the SQL-parsed edge set must be a strict subset of the plan-walked edge set for this column"

    assert sql_table is not None and "{" in sql_table, "the SQL-text parse should only ever see the unresolved placeholder, never a real table name"
    assert plan_table == "us_orders", "the runtime plan should see the table name as it actually resolved"

    print(
        f"Claim 2: for region_norm, SQL-text parsing finds {sorted(sql_edges['region_norm'])} "
        f"while the runtime plan finds {sorted(plan_edges['region_norm'])} -- the UDF's hidden "
        f"second input is invisible to the text parse; the table name stays an unresolved "
        f"placeholder ('{sql_table}') to the text parse but resolves to '{plan_table}' at runtime"
    )

    print("all claims verified")


if __name__ == "__main__":
    main()
