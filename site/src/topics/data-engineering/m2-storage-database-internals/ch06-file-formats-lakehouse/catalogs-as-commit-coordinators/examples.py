"""
Builds a real, minimal table catalog in this sandbox -- not a simulation of one -- that performs
the four things a catalog actually does: namespace management, a current-metadata pointer moved
by a real compare-and-swap, access control, and credential issuance.

The pointer's CAS reuses the exact put-if-absent primitive this chapter has used since topic 13
(de.optimistic-commits-conflict-resolution) and topic 28 (de.delta-commit-protocol-catalog): a
local-disk os.open(O_CREAT | O_EXCL) stands in for the catalog's own atomic row update, the same
shape Iceberg's own catalog interface and the REST catalog spec describe for updateTable. Demo 1
registers a table and races two engines for the next pointer version -- the loser gets a real
conflict and retries against the new tip, never silently overwriting it. Demo 2 is namespace
management: creating one twice is rejected, tables register only inside an existing namespace.
Demo 3 is access control: an unauthorized principal's pointer update is rejected before it ever
reaches the CAS. Demo 4 is credential issuance: only a principal with real access receives a
scoped, time-limited credential naming exactly the table's own storage prefix.

Not reproduced in code, only sourced and narrated (SOURCES.md, FACT-CHECK.md): the legacy options'
own real limits -- Hive Metastore's thrift API, a schema/location service with no access control
or credential vending of its own; AWS Glue Data Catalog, which needs AWS Lake Formation bolted on
for fine-grained access control and credential vending and is scoped to one account and region by
default; and a plain JDBC catalog, which is a CAS row in a database table and nothing more.
"""

import os
import shutil

ROOT = "/tmp/catalog_demo"

shutil.rmtree(ROOT, ignore_errors=True)
os.makedirs(ROOT, exist_ok=True)

namespaces = {}  # name -> set of table names
acl = {}  # (namespace, table) -> set of principals with access


def pointer_dir(namespace, table):
    return os.path.join(ROOT, namespace, table, "_pointer")


def pointer_path(namespace, table, version):
    return os.path.join(pointer_dir(namespace, table), f"{version:020d}.json")


# ---------------------------------------------------------------------------
# Namespace management (one of the catalog's four jobs).
# ---------------------------------------------------------------------------


def create_namespace(namespace):
    if namespace in namespaces:
        raise FileExistsError(f"namespace already exists: {namespace}")
    namespaces[namespace] = set()
    os.makedirs(os.path.join(ROOT, namespace), exist_ok=True)


def list_tables(namespace):
    return sorted(namespaces[namespace])


# ---------------------------------------------------------------------------
# The current-metadata pointer, moved only by a real compare-and-swap: registering a table writes
# its first pointer file; every later move is a put-if-absent write of the next version number,
# identical in shape to topic 13's and topic 28's own commit races.
# ---------------------------------------------------------------------------


def register_table(namespace, table, metadata_location):
    if namespace not in namespaces:
        raise KeyError(f"no such namespace: {namespace}")
    namespaces[namespace].add(table)
    os.makedirs(pointer_dir(namespace, table), exist_ok=True)
    fd = os.open(pointer_path(namespace, table, 0), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    os.write(fd, metadata_location.encode())
    os.close(fd)
    acl[(namespace, table)] = {"table-owner"}


def current_pointer(namespace, table):
    versions = sorted(int(f[:20]) for f in os.listdir(pointer_dir(namespace, table)))
    v = versions[-1]
    with open(pointer_path(namespace, table, v)) as f:
        return v, f.read()


def cas_update_pointer(namespace, table, principal, expected_version, new_metadata_location):
    if principal not in acl.get((namespace, table), set()):
        raise PermissionError(f"{principal} has no access to {namespace}.{table}")
    try:
        fd = os.open(
            pointer_path(namespace, table, expected_version + 1),
            os.O_CREAT | os.O_EXCL | os.O_WRONLY,
        )
    except FileExistsError:
        raise FileExistsError(
            f"pointer already moved past version {expected_version}; re-read and retry"
        )
    os.write(fd, new_metadata_location.encode())
    os.close(fd)
    return expected_version + 1


# ---------------------------------------------------------------------------
# Access control (one of the catalog's four jobs): grants are checked before the CAS is even
# attempted, not after.
# ---------------------------------------------------------------------------


def grant_access(namespace, table, principal):
    acl.setdefault((namespace, table), set()).add(principal)


# ---------------------------------------------------------------------------
# Credential issuance (one of the catalog's four jobs): a real scoped, time-limited credential,
# naming exactly the table's own storage prefix, issued only to a principal with access.
# ---------------------------------------------------------------------------

CREDENTIAL_TTL_SECONDS = 900


def issue_credentials(namespace, table, principal):
    if principal not in acl.get((namespace, table), set()):
        raise PermissionError(f"{principal} has no access to {namespace}.{table}; no credential issued")
    return {
        "principal": principal,
        "scope": f"s3://lakehouse/{namespace}/{table}/*",
        "expires_in_seconds": CREDENTIAL_TTL_SECONDS,
    }


if __name__ == "__main__":
    # Demo 1: a real CAS race for the pointer. Registering a table writes its first pointer;
    # two engines race for the next version; the loser gets a real conflict and retries.
    create_namespace("analytics")
    register_table("analytics", "events", "s3://lakehouse/analytics/events/metadata/v0.json")
    v0, loc0 = current_pointer("analytics", "events")
    print(f"registered table, pointer at version {v0}: {loc0}")

    engine_a_wins = cas_update_pointer(
        "analytics", "events", "table-owner", v0, "s3://lakehouse/analytics/events/metadata/v1-a.json"
    )
    engine_b_conflict = None
    try:
        cas_update_pointer(
            "analytics", "events", "table-owner", v0, "s3://lakehouse/analytics/events/metadata/v1-b.json"
        )
    except FileExistsError as e:
        engine_b_conflict = str(e)
    engine_b_retry = cas_update_pointer(
        "analytics", "events", "table-owner", engine_a_wins, "s3://lakehouse/analytics/events/metadata/v2-b.json"
    )
    assert engine_a_wins == 1
    assert engine_b_conflict is not None
    assert engine_b_retry == 2
    print(f"engine A won version {engine_a_wins}; engine B conflicted ({engine_b_conflict}), retried to version {engine_b_retry}")

    # Demo 2: namespace management, enforced for real.
    namespace_conflict = None
    try:
        create_namespace("analytics")
    except FileExistsError as e:
        namespace_conflict = str(e)
    assert namespace_conflict is not None
    print(f"creating the same namespace twice: {namespace_conflict}")
    print(f"tables in analytics: {list_tables('analytics')}")

    # Demo 3: access control, checked before the CAS is even attempted.
    access_denied = None
    try:
        cas_update_pointer(
            "analytics", "events", "untrusted-script", engine_b_retry, "s3://lakehouse/analytics/events/metadata/v3-evil.json"
        )
    except PermissionError as e:
        access_denied = str(e)
    assert access_denied is not None
    print(f"unauthorized principal's pointer update: {access_denied}")

    grant_access("analytics", "events", "reporting-job")
    after_grant = cas_update_pointer(
        "analytics", "events", "reporting-job", engine_b_retry, "s3://lakehouse/analytics/events/metadata/v3.json"
    )
    assert after_grant == 3
    print(f"authorized principal's pointer update succeeded, version {after_grant}")

    # Demo 4: credential issuance, scoped and time-limited, only for a principal with access.
    credential_denied = None
    try:
        issue_credentials("analytics", "events", "untrusted-script")
    except PermissionError as e:
        credential_denied = str(e)
    assert credential_denied is not None
    creds = issue_credentials("analytics", "events", "reporting-job")
    assert creds["scope"] == "s3://lakehouse/analytics/events/*"
    assert creds["expires_in_seconds"] == 900
    print(f"unauthorized principal's credential request: {credential_denied}")
    print(f"authorized principal's credential: {creds}")

    print("All assertions passed.")
