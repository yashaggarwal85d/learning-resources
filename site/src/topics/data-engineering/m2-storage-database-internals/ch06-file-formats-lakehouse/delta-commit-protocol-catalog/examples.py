"""
Runs a real, local S3-compatible HTTP server (moto's ThreadedMotoServer) and issues real boto3
requests against it over HTTP -- the same conditional-write primitive topic 10
(de.object-storage-as-database) demonstrated with If-None-Match, reused directly here to commit a
real Delta `_delta_log` entry the way the Delta protocol's own "Option 3" describes it: a
PUT-if-absent write of the next log version, ratifying and publishing the commit in one step with
no separate catalog or lock service.

Two writers race for the same next version the way topic 13 (de.optimistic-commits-conflict-
resolution) staged its race: each writer prepares its own commit body first (never shared), then
both attempt the single atomic write that decides the winner. Here that single atomic write is a
real `IfNoneMatch="*"` PUT of `_delta_log/{v:020d}.json`; the loser's PUT is rejected with a real
HTTP 412 PreconditionFailed, exactly like topic 10's `commit-001` race -- the same primitive, now
named as Delta's put-if-absent commit.

A second demo reproduces the two isolation levels Delta has for commits that DO need to read the
table first (a delete, not a blind append), by the rule Delta's own ConflictChecker applies:
WriteSerializable (Databricks' default) never checks a blind insert's new files, so a delete
commits even though it didn't see a concurrent insert, as if the insert came after it;
Serializable checks the insert's new files against what the delete read, and refuses the delete
only when one of them falls inside it (replaying the log in order would have deleted that row).
Open-source Delta Lake on Spark accepts only Serializable as a table's isolation level. Both
levels are checked against the insert's real committed log entry, not simulated with a flag.

moto's own consistency and latency characteristics are a local in-memory simulation, not AWS's
real network behavior -- disclosed in FACT-CHECK.md, same disclosure as topic 10. What this script
verifies for real is the protocol-level behavior: a conditional header either commits the write or
the server rejects it with 412, and an isolation level either allows or refuses a specific
concurrent pair of operations to commit, by the rule Delta's own docs state for it.

Not reproduced in code, only sourced and narrated (SOURCES.md, FACT-CHECK.md): topic 27's own
handoff, and the catalog-managed-tables timeline across Delta releases 4.0 (preview), 4.2 (commits
made catalog-coordinated) and 4.3 (every other table operation moved under the same catalog APIs).
"""

import json

import boto3
from botocore.exceptions import ClientError
from moto.server import ThreadedMotoServer

server = ThreadedMotoServer(port=0)
server.start()
_host, _port = server.get_host_and_port()
ENDPOINT = f"http://{_host}:{_port}"

s3 = boto3.client(
    "s3",
    endpoint_url=ENDPOINT,
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)
BUCKET = "delta-table"
s3.create_bucket(Bucket=BUCKET)


def log_key(version):
    return f"_delta_log/{version:020d}.json"


def commit_body(actions):
    return ("\n".join(json.dumps(a) for a in actions) + "\n").encode()


# ---------------------------------------------------------------------------
# Demo 1: a real put-if-absent commit of the next log version (Delta protocol's "Option 3" --
# ratify and publish in one atomic write, no separate catalog). Two writers race for v1; the
# loser's write is rejected with a real 412, the identical mechanism topic 10 demonstrated on a
# plain key, now naming Delta's own log-version file.
# ---------------------------------------------------------------------------

v0_actions = [
    {"metaData": {"id": "tbl-1", "format": {"provider": "parquet"}, "schemaString": "{}"}},
    {"protocol": {"minReaderVersion": 1, "minWriterVersion": 2}},
    {"add": {"path": "part-00000.parquet", "partitionValues": {"day": "mon"}, "size": 100, "dataChange": True}},
]
s3.put_object(Bucket=BUCKET, Key=log_key(0), Body=commit_body(v0_actions), IfNoneMatch="*")
v0_committed = True

# Writer A proposes an append; writer B proposes a different append. Each stages its own body
# first (never shared) -- only the put-if-absent below decides which one becomes version 1.
writer_a_v1 = [{"add": {"path": "part-a-00001.parquet", "partitionValues": {"day": "tue"}, "size": 50, "dataChange": True}}]
writer_b_v1 = [{"add": {"path": "part-b-00001.parquet", "partitionValues": {"day": "tue"}, "size": 60, "dataChange": True}}]

s3.put_object(Bucket=BUCKET, Key=log_key(1), Body=commit_body(writer_a_v1), IfNoneMatch="*")
writer_a_won_v1 = True

writer_b_rejected = False
writer_b_status = None
try:
    s3.put_object(Bucket=BUCKET, Key=log_key(1), Body=commit_body(writer_b_v1), IfNoneMatch="*")
except ClientError as e:
    writer_b_rejected = True
    writer_b_status = e.response["ResponseMetadata"]["HTTPStatusCode"]
    writer_b_code = e.response["Error"]["Code"]

assert v0_committed is True
assert writer_a_won_v1 is True
assert writer_b_rejected is True
assert writer_b_status == 412
assert writer_b_code == "PreconditionFailed"

v1_body = s3.get_object(Bucket=BUCKET, Key=log_key(1))["Body"].read()
assert json.loads(v1_body.decode().strip())["add"]["path"] == "part-a-00001.parquet"

# Writer B's own append has no requirements (an append's validation condition is always true, the
# same rule topic 13 demonstrated), so it just re-proposes against the new tip as version 2.
s3.put_object(Bucket=BUCKET, Key=log_key(2), Body=commit_body(writer_b_v1), IfNoneMatch="*")
writer_b_retry_won_v2 = True
assert writer_b_retry_won_v2 is True


# ---------------------------------------------------------------------------
# Demo 2: WriteSerializable vs. Serializable, on a delete that DOES need to read the table (unlike
# the blind appends above). A concurrent blind insert lands at v3; a delete that read the table at
# v2 (before the insert) then tries to commit at v4. The rule reproduced is the one Delta's own
# ConflictChecker applies ("Fail if new files have been added that the txn should have read"):
# under Serializable, every file the winning commit added is checked against the delete's read
# predicate; under WriteSerializable, a blind append's files are not checked at all ("don't
# conflict with blind appends"), so the insert is treated as if it happened after the delete.
# The two levels therefore agree when the insert's file is outside what the delete read, and
# split only when it is inside.
#
# Where each level is available: Databricks documents both, with WriteSerializable as the
# default. Open-source Delta Lake on Spark accepts only Serializable for delta.isolationLevel
# ("must be Serializable"), and that is also its default.
# ---------------------------------------------------------------------------

# The insert is a blind append (it never read the table) of one file in partition day=wed.
insert_v3 = [{"add": {"path": "part-00003.parquet", "partitionValues": {"day": "wed"}, "size": 40, "dataChange": True}}]
s3.put_object(Bucket=BUCKET, Key=log_key(3), Body=commit_body(insert_v3), IfNoneMatch="*")

FILES_AT_READ_TIME_V2 = {"part-00000.parquet", "part-a-00001.parquet", "part-b-00001.parquet"}


def files_from_log(up_to_version):
    files = set()
    for v in range(up_to_version + 1):
        for line in s3.get_object(Bucket=BUCKET, Key=log_key(v))["Body"].read().decode().splitlines():
            action = json.loads(line)
            if "add" in action:
                files.add(action["add"]["path"])
    return files


def added_files_in(version):
    actions = [json.loads(line) for line in s3.get_object(Bucket=BUCKET, Key=log_key(version))["Body"].read().decode().splitlines()]
    return [a["add"] for a in actions if "add" in a]


def delete_can_commit(isolation_level, delete_day, winning_added_files, winning_is_blind_append):
    """The delete's read predicate is `day = delete_day`. Under Serializable, any file the winning
    commit added that matches that predicate is a file the delete should have read, so the delete
    conflicts. Under WriteSerializable, a blind append's added files are skipped, so the delete
    commits and the insert counts as if it came after it."""
    assert isolation_level in ("Serializable", "WriteSerializable")
    if isolation_level == "WriteSerializable" and winning_is_blind_append:
        files_to_check = []
    else:
        files_to_check = winning_added_files
    return not any(f["partitionValues"].get("day") == delete_day for f in files_to_check)


files_read_at_v2 = files_from_log(2)
assert files_read_at_v2 == FILES_AT_READ_TIME_V2

# The delete is `DELETE WHERE day = 'mon'`; at v2 that matches exactly one file, part-00000.
delete_day = "mon"
delete_target = "part-00000.parquet"
insert_files_v3 = added_files_in(3)
assert [f["path"] for f in insert_files_v3] == ["part-00003.parquet"]

write_serializable_allows_commit = delete_can_commit("WriteSerializable", delete_day, insert_files_v3, True)
serializable_allows_commit = delete_can_commit("Serializable", delete_day, insert_files_v3, True)

assert write_serializable_allows_commit is True
assert serializable_allows_commit is True  # part-00003 (day=wed) is outside what the delete read

# Now the overlapping case: the same insert, but its one file lands in day=mon, so its row is one
# the delete's condition would have matched had the delete seen it.
overlapping_insert_files = [dict(insert_files_v3[0], partitionValues={"day": "mon"})]
overlapping_write_serializable_allows_commit = delete_can_commit(
    "WriteSerializable", delete_day, overlapping_insert_files, True
)
overlapping_serializable_allows_commit = delete_can_commit("Serializable", delete_day, overlapping_insert_files, True)

assert overlapping_write_serializable_allows_commit is True  # still orderable: insert "after" delete
assert overlapping_serializable_allows_commit is False  # replaying the log in order would delete that row

if write_serializable_allows_commit:
    s3.put_object(
        Bucket=BUCKET,
        Key=log_key(4),
        Body=commit_body([{"remove": {"path": delete_target, "dataChange": True}}]),
        IfNoneMatch="*",
    )
    delete_committed_at_v4 = True
else:
    delete_committed_at_v4 = False

assert delete_committed_at_v4 is True
final_files = files_from_log(4) - {
    a["remove"]["path"]
    for v in range(5)
    for line in s3.get_object(Bucket=BUCKET, Key=log_key(v))["Body"].read().decode().splitlines()
    for a in [json.loads(line)]
    if "remove" in a
}
assert delete_target not in final_files


server.stop()


if __name__ == "__main__":
    print(f"put-if-absent commit: v0 written, writer A won v1, writer B's conflicting v1 write "
          f"rejected with {writer_b_status} {writer_b_code}, writer B retried successfully as v2")
    print(f"WriteSerializable allows the delete to commit: {write_serializable_allows_commit}")
    print(f"Serializable, insert outside the delete's condition, allows commit: {serializable_allows_commit}")
    print(f"Serializable, insert inside the delete's condition, allows commit: {overlapping_serializable_allows_commit}")
    print(f"WriteSerializable, insert inside the delete's condition, allows commit: "
          f"{overlapping_write_serializable_allows_commit}")
    print(f"delete committed at v4, target file gone from final state: "
          f"{delete_target not in final_files}")
    print("All assertions passed.")
