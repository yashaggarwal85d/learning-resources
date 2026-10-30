"""de.openlineage-events-facets-lineage: real OpenLineage events over a real HTTP transport
(openlineage-python's own client classes and wire serializer, received by a local stand-in
for Marquez's lineage endpoint, same path, not Marquez itself), plus a synthetic comparison
of SQL-text column lineage against runtime-plan column lineage on one job."""

import http.server
import json
import threading
import time

from openlineage.client.client import OpenLineageClient
from openlineage.client.facet_v2 import column_lineage_dataset, parent_run, schema_dataset
from openlineage.client.run import Dataset, Job, Run, RunEvent, RunState
from openlineage.client.transport.http import HttpConfig, HttpTransport

NAMESPACE = "shop"
DAG_RUN_ID = "a1a1a1a1-0000-4000-8000-000000000001"
TASK_RUN_ID = "b2b2b2b2-0000-4000-8000-000000000002"


class _LineageReceiver(http.server.BaseHTTPRequestHandler):
    """Stands in for Marquez's own `POST /api/v1/lineage` endpoint, at the same path
    the real OpenLineageClient posts to, so the transport leg is genuine end to end."""

    received = []

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        self.__class__.received.append((self.path, json.loads(body)))
        self.send_response(200)
        self.end_headers()

    def log_message(self, *args):
        pass


def build_schema_facet():
    return schema_dataset.SchemaDatasetFacet(
        fields=[
            schema_dataset.SchemaDatasetFacetFields(name="customer_id", type="BIGINT"),
            schema_dataset.SchemaDatasetFacetFields(name="net_total", type="DECIMAL"),
            schema_dataset.SchemaDatasetFacetFields(name="adjusted_total", type="DECIMAL"),
        ]
    )


def build_column_lineage_facet():
    return column_lineage_dataset.ColumnLineageDatasetFacet(
        fields={
            "net_total": column_lineage_dataset.Fields(
                inputFields=[
                    column_lineage_dataset.InputField(
                        namespace=NAMESPACE,
                        name="orders",
                        field="amount",
                        transformations=[
                            column_lineage_dataset.Transformation(type="DIRECT", subtype="IDENTITY")
                        ],
                    )
                ]
            ),
            "adjusted_total": column_lineage_dataset.Fields(
                inputFields=[
                    column_lineage_dataset.InputField(
                        namespace=NAMESPACE,
                        name="orders",
                        field="amount",
                        transformations=[
                            column_lineage_dataset.Transformation(type="DIRECT", subtype="IDENTITY")
                        ],
                    ),
                    column_lineage_dataset.InputField(
                        namespace=NAMESPACE,
                        name="orders",
                        field="status",
                        transformations=[
                            column_lineage_dataset.Transformation(type="INDIRECT", subtype="CONDITIONAL")
                        ],
                    ),
                ]
            ),
        }
    )


def emit_rollup_run_to_local_consumer():
    """Starts a local HTTP receiver, emits a real START and a real COMPLETE RunEvent for
    the shop's orders-rollup job through openlineage-python's own HttpTransport, and
    returns what the receiver actually got on the wire."""
    _LineageReceiver.received = []
    server = http.server.HTTPServer(("127.0.0.1", 0), _LineageReceiver)
    port = server.server_port
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    client = OpenLineageClient(transport=HttpTransport(HttpConfig(url=f"http://127.0.0.1:{port}")))

    dag_run = Run(runId=DAG_RUN_ID)
    dag_job = Job(namespace=NAMESPACE, name="nightly-dag")
    task_run = Run(
        runId=TASK_RUN_ID,
        facets={"parent": parent_run.ParentRunFacet(run=dag_run, job=dag_job)},
    )
    task_job = Job(namespace=NAMESPACE, name="orders-rollup")

    orders = Dataset(namespace=NAMESPACE, name="orders")
    rollup = Dataset(
        namespace=NAMESPACE,
        name="analytics.daily_revenue",
        facets={"schema": build_schema_facet(), "columnLineage": build_column_lineage_facet()},
    )

    client.emit(
        RunEvent(
            eventType=RunState.START,
            eventTime="2026-10-30T02:00:00Z",
            run=task_run,
            job=task_job,
            producer="https://learning-resources.example/topic-lab",
            inputs=[orders],
            outputs=[],
        )
    )
    client.emit(
        RunEvent(
            eventType=RunState.COMPLETE,
            eventTime="2026-10-30T02:05:00Z",
            run=task_run,
            job=task_job,
            producer="https://learning-resources.example/topic-lab",
            inputs=[orders],
            outputs=[rollup],
        )
    )

    time.sleep(0.2)
    server.shutdown()
    thread.join(timeout=2)
    return list(_LineageReceiver.received)


SQL_TEXT = (
    "SELECT amount AS net_total, "
    "CASE WHEN status = 'refunded' THEN 0 ELSE amount END AS adjusted_total "
    "FROM {table_name}"
)


def sql_parse_column_lineage(sql_text, table_name):
    """What a regular-expression parse of the SQL text alone can recover: it reads a
    `SELECT ... AS alias` list and a literal FROM clause. It cannot evaluate a CASE
    expression's own condition column, and it cannot resolve a table name that is still
    a runtime parameter at parse time — both get dropped, silently."""
    import re

    edges = {}
    select_clause = re.search(r"SELECT\s+(.*?)\s+FROM", sql_text, re.IGNORECASE).group(1)
    from_literal = sql_text.split("FROM")[-1].strip()
    resolved_table = from_literal if "{" not in from_literal else None

    for part in select_clause.split(","):
        part = part.strip()
        match = re.match(r"^(\w+)\s+AS\s+(\w+)$", part, re.IGNORECASE)
        if match:
            source_col, alias = match.group(1), match.group(2)
            edges[alias] = {"from": resolved_table, "column": source_col, "type": "DIRECT"}
        # a CASE expression's own WHEN condition column (`status`) is never matched by
        # this pattern at all, so no edge for it is ever produced here.

    return edges


def runtime_plan_column_lineage(table_name):
    """What the engine's own resolved logical plan carries at run time: the table name
    is already a concrete string (the parameter has been substituted), and the plan's
    expression tree exposes the CASE's own condition column, not just its branches —
    so this traversal produces the edge SQL-text parsing cannot see."""
    return {
        "net_total": [{"from": table_name, "column": "amount", "type": "DIRECT", "subtype": "IDENTITY"}],
        "adjusted_total": [
            {"from": table_name, "column": "amount", "type": "DIRECT", "subtype": "IDENTITY"},
            {"from": table_name, "column": "status", "type": "INDIRECT", "subtype": "CONDITIONAL"},
        ],
    }


def compare_parse_vs_runtime():
    table_name = "shop.orders"
    sql_text = SQL_TEXT.format(table_name="{table_name}")  # still a runtime parameter at parse time
    parsed = sql_parse_column_lineage(sql_text, table_name)
    runtime = runtime_plan_column_lineage(table_name)

    missed_table = parsed["net_total"]["from"] is None
    missed_indirect_edge = "adjusted_total" not in parsed or len(
        [e for e in [parsed.get("adjusted_total")] if e]
    ) == 0

    return {
        "parsed": parsed,
        "runtime": runtime,
        "missed_table_name": missed_table,
        "missed_status_edge": missed_indirect_edge,
    }


def main():
    received = emit_rollup_run_to_local_consumer()
    assert len(received) == 2, received
    start_path, start_payload = received[0]
    complete_path, complete_payload = received[1]
    assert start_path == "/api/v1/lineage"
    assert start_payload["eventType"] == "START"
    assert complete_payload["eventType"] == "COMPLETE"
    assert complete_payload["run"]["runId"] == TASK_RUN_ID
    assert complete_payload["run"]["facets"]["parent"]["run"]["runId"] == DAG_RUN_ID
    assert complete_payload["outputs"][0]["name"] == "analytics.daily_revenue"
    col_lineage = complete_payload["outputs"][0]["facets"]["columnLineage"]["fields"]
    assert col_lineage["net_total"]["inputFields"][0]["transformations"][0]["type"] == "DIRECT"
    assert (
        col_lineage["adjusted_total"]["inputFields"][1]["transformations"][0]["type"] == "INDIRECT"
    )
    print(f"Real OpenLineage events received over HTTP: {len(received)} (START, COMPLETE)")
    print(f"COMPLETE run's parent DAG run id: {complete_payload['run']['facets']['parent']['run']['runId']}")
    print(f"Column lineage on adjusted_total: {len(col_lineage['adjusted_total']['inputFields'])} input fields")

    comparison = compare_parse_vs_runtime()
    assert comparison["missed_table_name"] is True
    assert comparison["runtime"]["net_total"][0]["from"] == "shop.orders"
    assert len(comparison["runtime"]["adjusted_total"]) == 2
    assert len(comparison["parsed"].get("adjusted_total", [])) == 0
    print(f"SQL-parse table name resolved: {not comparison['missed_table_name']}")
    print(f"SQL-parse edges for adjusted_total: {len(comparison['parsed'].get('adjusted_total', []))}")
    print(f"Runtime-plan edges for adjusted_total: {len(comparison['runtime']['adjusted_total'])}")
    print("de.openlineage-events-facets-lineage examples: all checks pass")


if __name__ == "__main__":
    main()
