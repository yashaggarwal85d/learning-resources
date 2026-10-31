"""
Runs a real, local S3-compatible HTTP server (moto's ThreadedMotoServer) and issues real boto3
requests against it over HTTP -- not mocked Python calls, a real request/response cycle with real
HTTP status codes. Demonstrates the conditional-write primitive (If-None-Match, If-Match) actually
rejecting a conflicting write with a real 412 Precondition Failed, demonstrates that a "rename" on
object storage is really two separate requests (copy, then delete) with no atomicity between them,
and measures how LIST's request cost scales with the number of objects in a prefix.

moto's own consistency and latency characteristics are a local in-memory simulation, not AWS's
real network behavior -- disclosed in FACT-CHECK.md. What this topic verifies for real is the
*protocol-level* behavior every cloud provider's S3-compatible API actually implements: a
conditional header either commits the write or the server rejects it with 412, and a "rename" is
never a single atomic call.
"""

import time

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
BUCKET = "demo-bucket"
s3.create_bucket(Bucket=BUCKET)


# ---------------------------------------------------------------------------
# Conditional create: If-None-Match: * commits only if the key doesn't exist yet -- the primitive
# that lets two writers race for the same commit with no external lock service.
# ---------------------------------------------------------------------------

s3.put_object(Bucket=BUCKET, Key="commit-001", Body=b"writer-a's version", IfNoneMatch="*")
first_writer_committed = True

conflicting_write_rejected = False
conflicting_write_status = None
try:
    s3.put_object(Bucket=BUCKET, Key="commit-001", Body=b"writer-b's version", IfNoneMatch="*")
except ClientError as e:
    conflicting_write_rejected = True
    conflicting_write_status = e.response["ResponseMetadata"]["HTTPStatusCode"]
    conflicting_write_code = e.response["Error"]["Code"]

assert first_writer_committed is True
assert conflicting_write_rejected is True
assert conflicting_write_status == 412
assert conflicting_write_code == "PreconditionFailed"

committed_body = s3.get_object(Bucket=BUCKET, Key="commit-001")["Body"].read()
assert committed_body == b"writer-a's version"  # the loser's write never landed


# ---------------------------------------------------------------------------
# Conditional update: If-Match on the current ETag is a real compare-and-swap. A write against a
# stale ETag (one that's no longer current) is rejected the same way.
# ---------------------------------------------------------------------------

s3.put_object(Bucket=BUCKET, Key="counter", Body=b"0")
etag_v0 = s3.head_object(Bucket=BUCKET, Key="counter")["ETag"].strip('"')

s3.put_object(Bucket=BUCKET, Key="counter", Body=b"1", IfMatch=etag_v0)
etag_v1 = s3.head_object(Bucket=BUCKET, Key="counter")["ETag"].strip('"')
assert etag_v1 != etag_v0  # the update really changed the object's ETag

stale_update_rejected = False
try:
    s3.put_object(Bucket=BUCKET, Key="counter", Body=b"2", IfMatch=etag_v0)  # etag_v0 is now stale
except ClientError as e:
    stale_update_rejected = True
    stale_update_status = e.response["ResponseMetadata"]["HTTPStatusCode"]

assert stale_update_rejected is True
assert stale_update_status == 412

final_counter = s3.get_object(Bucket=BUCKET, Key="counter")["Body"].read()
assert final_counter == b"1"  # the stale write never landed either


# ---------------------------------------------------------------------------
# No atomic rename: a "rename" on object storage is really CopyObject followed by DeleteObject --
# two separate requests. Stop after the copy (simulating a crash mid-rename) and both the original
# and the copy exist at once; nothing enforces that only one of them does.
# ---------------------------------------------------------------------------

s3.put_object(Bucket=BUCKET, Key="table/data/part-00000.parquet", Body=b"real parquet bytes")
s3.copy_object(
    Bucket=BUCKET,
    CopySource={"Bucket": BUCKET, "Key": "table/data/part-00000.parquet"},
    Key="table/data/part-00000-renamed.parquet",
)
# A process crash here (before the matching delete) is a real, reachable state.
keys_after_copy = sorted(
    o["Key"] for o in s3.list_objects_v2(Bucket=BUCKET, Prefix="table/data/")["Contents"]
)
assert keys_after_copy == [
    "table/data/part-00000-renamed.parquet",
    "table/data/part-00000.parquet",
]
BOTH_OBJECTS_EXIST_AFTER_COPY_BEFORE_DELETE = len(keys_after_copy) == 2
assert BOTH_OBJECTS_EXIST_AFTER_COPY_BEFORE_DELETE is True


# ---------------------------------------------------------------------------
# LIST cost scales with the number of objects enumerated: a paginated listing of 250 objects at
# 50 keys per page takes 5 real round trips, not 1 -- the real mechanism behind "LIST cost and
# latency" as a budgeted expense, not a free operation.
# ---------------------------------------------------------------------------

LIST_OBJECT_COUNT = 250
PAGE_SIZE = 50
for i in range(LIST_OBJECT_COUNT):
    s3.put_object(Bucket=BUCKET, Key=f"listing-prefix/{i:05d}", Body=b"x")

t0 = time.monotonic()
paginator = s3.get_paginator("list_objects_v2")
list_calls = 0
objects_seen = 0
for page in paginator.paginate(
    Bucket=BUCKET, Prefix="listing-prefix/", PaginationConfig={"PageSize": PAGE_SIZE}
):
    list_calls += 1
    objects_seen += len(page.get("Contents", []))
list_elapsed_seconds = time.monotonic() - t0

assert objects_seen == LIST_OBJECT_COUNT
assert list_calls == LIST_OBJECT_COUNT // PAGE_SIZE
assert list_calls == 5


server.stop()


if __name__ == "__main__":
    print(f"conditional create: writer A committed, writer B's conflicting write rejected with "
          f"{conflicting_write_status} {conflicting_write_code}")
    print(f"conditional update: etag {etag_v0[:8]}... -> {etag_v1[:8]}..., stale update rejected "
          f"with {stale_update_status}")
    print(f"no atomic rename: {len(keys_after_copy)} objects exist after copy, before delete")
    print(f"LIST cost: {objects_seen} objects enumerated across {list_calls} real HTTP round "
          f"trips ({PAGE_SIZE} objects/page), {list_elapsed_seconds:.3f}s on this local server")
    print("All assertions passed.")
