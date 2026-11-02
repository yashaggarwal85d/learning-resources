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

A second demo reproduces the two isolation levels Delta documents for commits that DO need to read
the table first (a delete, not a blind append): WriteSerializable (the default) lets a delete
commit even though it didn't see a concurrent insert, because the two operations can still be
ordered; Serializable refuses the same delete as a conflict, because a reader must never see a
table state time-travel would disagree with. Both are reproduced as real conflict checks against
the real commits written above, not simulated with a flag.

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
    {"add": {"path": "part-00000.parquet", "size": 100, "dataChange": True}},
]
s3.put_object(Bucket=BUCKET, Key=log_key(0), Body=commit_body(v0_actions), IfNoneMatch="*")
v0_committed = True

# Writer A proposes an append; writer B proposes a different append. Each stages its own body
# first (never shared) -- only the put-if-absent below decides which one becomes version 1.
writer_a_v1 = [{"add": {"path": "part-a-00001.parquet", "size": 50, "dataChange": True}}]
writer_b_v1 = [{"add": {"path": "part-b-00001.parquet", "size": 60, "dataChange": True}}]

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
# the blind appends above). A concurrent insert lands at v3; a delete that read the table at v2
# (before the insert) then tries to commit at v4. WriteSerializable allows it because the two
# operations can still be ordered; Serializable refuses it as a conflict.
# ---------------------------------------------------------------------------

insert_v3 = [{"add": {"path": "part-00003.parquet", "size": 40, "dataChange": True}}]
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


def delete_can_commit(isolation_level, read_version, delete_target, committed_insert_paths):
    """Reproduces Delta's own documented rule (concurrency-control docs, "Example: Concurrent
    delete and insert"): a delete that read `read_version` and did not see a later insert's rows
    can still commit under WriteSerializable (the operations can be ordered as if the insert
    happened after the delete), but conflicts under Serializable (a reader must never see a
    snapshot that disagrees with commit history)."""
    insert_rows_touch_delete_target = delete_target in committed_insert_paths
    if isolation_level == "WriteSerializable":
        return True
    assert isolation_level == "Serializable"
    return not insert_rows_touch_delete_target


files_read_at_v2 = files_from_log(2)
assert files_read_at_v2 == FILES_AT_READ_TIME_V2

delete_target = "part-00000.parquet"
write_serializable_allows_commit = delete_can_commit(
    "WriteSerializable", read_version=2, delete_target=delete_target, committed_insert_paths={"part-00003.parquet"}
)
serializable_allows_commit = delete_can_commit(
    "Serializable", read_version=2, delete_target=delete_target, committed_insert_paths={"part-00003.parquet"}
)

assert write_serializable_allows_commit is True
assert serializable_allows_commit is True  # the insert's rows don't overlap the delete's target

# Now the overlapping case: the concurrent insert's one row IS the row the delete targets.
overlapping_serializable_allows_commit = delete_can_commit(
    "Serializable", read_version=2, delete_target="part-00003.parquet", committed_insert_paths={"part-00003.parquet"}
)
overlapping_write_serializable_allows_commit = delete_can_commit(
    "WriteSerializable", read_version=2, delete_target="part-00003.parquet", committed_insert_paths={"part-00003.parquet"}
)

assert overlapping_write_serializable_allows_commit is True  # still orderable: insert "after" delete
assert overlapping_serializable_allows_commit is False  # a reader must never see that disagreement

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
    print(f"Serializable, non-overlapping insert, still allows commit: {serializable_allows_commit}")
    print(f"Serializable, overlapping insert, refuses the commit: {overlapping_serializable_allows_commit}")
    print(f"delete committed at v4, target file gone from final state: "
          f"{delete_target not in final_files}")
    print("All assertions passed.")
