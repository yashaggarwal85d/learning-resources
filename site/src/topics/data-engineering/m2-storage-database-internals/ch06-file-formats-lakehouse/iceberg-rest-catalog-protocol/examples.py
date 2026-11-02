"""
Runs a real local HTTP server implementing a real subset of the Iceberg REST catalog OpenAPI
spec -- config negotiation, loading a table, and committing to a table with a requirement
assertion -- and a real HTTP client issuing real requests against it, not a mocked call.

Demo 1 is config negotiation: the client sends its own warehouse config to GET /v1/config; the
server returns real override values the client must apply on top of its own config, exactly the
merge order the spec itself describes (defaults, then the client's config, then overrides, each
layer replacing the one before it where they conflict). Demo 2 is a real load: GET the table's
current state over HTTP, exactly as a query engine would before planning a scan. Demo 3 is a real
commit with a requirement assertion: two engines read the table at the same snapshot, each
proposes a commit whose request body names the exact snapshot it read as a requirement; the
server checks that requirement against its own current state for real, accepts the first and
returns a real 409 Conflict for the second, naming which requirement failed -- and the loser
reloads and retries successfully against the new state.

Not reproduced in code, only sourced and narrated (SOURCES.md, FACT-CHECK.md): multi-table
transactions, the views and register endpoints; credential vending and remote signing
(X-Iceberg-Access-Delegation), since issuing real down-scoped cloud credentials is outside what
this sandbox can run; server-side scan planning (Iceberg 1.11) and SQL UDFs; and why the
protocol's own built-in OAuth2 token endpoint is now deprecated in favor of external identity
providers.
"""

import http.client
import json
import threading
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

STATE = {
    "namespaces": set(),
    "tables": {},  # (ns, table) -> {"uuid":..., "snapshot-id":..., "metadata-location":...}
}
LOCK = threading.Lock()


class CatalogHandler(BaseHTTPRequestHandler):
    def _json(self, status, body):
        payload = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length)) if length else {}

    def do_GET(self):
        if self.path.startswith("/v1/config"):
            # Config negotiation: the server returns overrides the client must apply over its
            # own config, naming the warehouse it actually assigned this session.
            self._json(
                200,
                {
                    "defaults": {"clients": "4"},
                    "overrides": {"prefix": "warehouse/analytics", "warehouse": "s3://lakehouse/analytics"},
                },
            )
            return
        parts = self.path.strip("/").split("/")
        if len(parts) == 5 and parts[0:2] == ["v1", "namespaces"] and parts[3] == "tables":
            ns, table = parts[2], parts[4]
            with LOCK:
                t = STATE["tables"].get((ns, table))
            if t is None:
                self._json(404, {"error": {"message": f"no such table: {ns}.{table}"}})
                return
            self._json(
                200,
                {
                    "metadata-location": t["metadata-location"],
                    "metadata": {"table-uuid": t["uuid"], "current-snapshot-id": t["snapshot-id"]},
                },
            )
            return
        self._json(404, {"error": {"message": "not found"}})

    def do_POST(self):
        parts = self.path.strip("/").split("/")
        if len(parts) == 3 and parts[0:2] == ["v1", "namespaces"]:
            ns = self._read_json()["namespace"][0]
            with LOCK:
                if ns in STATE["namespaces"]:
                    self._json(409, {"error": {"message": f"namespace already exists: {ns}"}})
                    return
                STATE["namespaces"].add(ns)
            self._json(200, {"namespace": [ns]})
            return
        if len(parts) == 4 and parts[0:2] == ["v1", "namespaces"] and parts[3] == "tables":
            ns = parts[2]
            body = self._read_json()
            table = body["name"]
            table_uuid = str(uuid.uuid5(uuid.NAMESPACE_URL, f"{ns}.{table}"))
            with LOCK:
                STATE["tables"][(ns, table)] = {
                    "uuid": table_uuid,
                    "snapshot-id": 0,
                    "metadata-location": f"s3://lakehouse/{ns}/{table}/metadata/v0.json",
                }
            self._json(200, {"metadata": {"table-uuid": table_uuid, "current-snapshot-id": 0}})
            return
        if len(parts) == 5 and parts[0:2] == ["v1", "namespaces"] and parts[3] == "tables":
            ns, table = parts[2], parts[4]
            body = self._read_json()
            with LOCK:
                t = STATE["tables"].get((ns, table))
                if t is None:
                    self._json(404, {"error": {"message": f"no such table: {ns}.{table}"}})
                    return
                for req in body.get("requirements", []):
                    if req["type"] == "assert-current-snapshot-id" and req["snapshot-id"] != t["snapshot-id"]:
                        self._json(
                            409,
                            {
                                "error": {
                                    "message": (
                                        f"requirement failed: assert-current-snapshot-id expected "
                                        f"{req['snapshot-id']}, table is at {t['snapshot-id']}"
                                    )
                                }
                            },
                        )
                        return
                new_snapshot_id = t["snapshot-id"] + 1
                t["snapshot-id"] = new_snapshot_id
                t["metadata-location"] = f"s3://lakehouse/{ns}/{table}/metadata/v{new_snapshot_id}.json"
            self._json(200, {"metadata": {"table-uuid": t["uuid"], "current-snapshot-id": new_snapshot_id}})
            return
        self._json(404, {"error": {"message": "not found"}})

    def log_message(self, *args):
        pass


def get(conn, path):
    conn.request("GET", path)
    r = conn.getresponse()
    return r.status, json.loads(r.read())


def post(conn, path, body):
    data = json.dumps(body).encode()
    conn.request("POST", path, body=data, headers={"Content-Type": "application/json"})
    r = conn.getresponse()
    return r.status, json.loads(r.read())


server = ThreadingHTTPServer(("127.0.0.1", 0), CatalogHandler)
server_thread = threading.Thread(target=server.serve_forever, daemon=True)
server_thread.start()
HOST, PORT = server.server_address

if __name__ == "__main__":
    conn = http.client.HTTPConnection(HOST, PORT)

    # Demo 1: config negotiation. The client's own config is overridden by what the server
    # returns, per the spec's own merge order (defaults, then client config, then overrides).
    status, config = get(conn, "/v1/config?warehouse=client-default")
    client_config = {"warehouse": "client-default"}
    merged = {**config["defaults"], **client_config, **config["overrides"]}
    assert status == 200
    assert merged["warehouse"] == "s3://lakehouse/analytics"
    assert merged["clients"] == "4"
    print(f"config negotiation: server overrides {config['overrides']}, merged warehouse = {merged['warehouse']}, merged clients = {merged['clients']}")

    # Demo 2: a real load. Create a namespace and a table, then load it back over real HTTP.
    post(conn, "/v1/namespaces", {"namespace": ["analytics"]})
    status, created = post(conn, "/v1/namespaces/analytics/tables", {"name": "events"})
    status, loaded = get(conn, "/v1/namespaces/analytics/tables/events")
    assert status == 200
    assert loaded["metadata"]["current-snapshot-id"] == 0
    print(f"load: table-uuid {loaded['metadata']['table-uuid']}, current-snapshot-id {loaded['metadata']['current-snapshot-id']}")

    # Demo 3: a real commit with a requirement assertion. Two engines both read the table at
    # snapshot 0; engine A commits first and wins; engine B's requirement no longer matches the
    # server's real state, so the server rejects it with a real 409 naming the mismatch, and
    # engine B reloads and retries successfully.
    engine_a_status, engine_a_result = post(
        conn,
        "/v1/namespaces/analytics/tables/events",
        {"requirements": [{"type": "assert-current-snapshot-id", "snapshot-id": 0}]},
    )
    engine_b_status, engine_b_result = post(
        conn,
        "/v1/namespaces/analytics/tables/events",
        {"requirements": [{"type": "assert-current-snapshot-id", "snapshot-id": 0}]},
    )
    assert engine_a_status == 200
    assert engine_a_result["metadata"]["current-snapshot-id"] == 1
    assert engine_b_status == 409
    print(f"engine A committed: snapshot {engine_a_result['metadata']['current-snapshot-id']}")
    print(f"engine B's stale requirement rejected: {engine_b_status} {engine_b_result['error']['message']}")

    status, reloaded = get(conn, "/v1/namespaces/analytics/tables/events")
    engine_b_retry_status, engine_b_retry = post(
        conn,
        "/v1/namespaces/analytics/tables/events",
        {"requirements": [{"type": "assert-current-snapshot-id", "snapshot-id": reloaded["metadata"]["current-snapshot-id"]}]},
    )
    assert engine_b_retry_status == 200
    assert engine_b_retry["metadata"]["current-snapshot-id"] == 2
    print(f"engine B reloaded and retried: snapshot {engine_b_retry['metadata']['current-snapshot-id']}")

    print("All assertions passed.")
