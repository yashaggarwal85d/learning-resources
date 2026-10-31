"""Real object-storage mechanics, run against a local S3-compatible server.

Engine of record: `moto`'s `ThreadedMotoServer` driven by real `boto3` S3 calls, standing in for
Amazon S3 (MinIO's own release channel is archived and no longer served, confirmed at research
time — see OUTLINE.md's "Changes from the chapter plan"). Every assertion below is a real HTTP
round trip to that local server, except the hot-prefix throttle, which is a disclosed local
simulation of the sourced per-prefix request-rate baseline, not a measurement of real S3.
"""

import boto3
from botocore.exceptions import ClientError
from moto.server import ThreadedMotoServer

BUCKET = "learnshop-commits"


def start_server():
    server = ThreadedMotoServer(port=0)
    server.start()
    port = server._server.server_address[1]
    client = boto3.client(
        "s3",
        endpoint_url=f"http://127.0.0.1:{port}",
        aws_access_key_id="test",
        aws_secret_access_key="test",
        region_name="us-east-1",
    )
    client.create_bucket(Bucket=BUCKET)
    return server, client


def naive_check_then_put_loses_a_write(client):
    """Two clients both see the key absent, both PUT with no precondition: the second write
    silently wins, with no error from either call. Reproduces the hook (step 1)."""
    key = "naive/commit-log"
    # Client A checks, sees nothing, decides to write.
    exists_for_a = _key_exists(client, key)
    # Client B checks too, also sees nothing.
    exists_for_b = _key_exists(client, key)
    assert exists_for_a is False and exists_for_b is False

    r_a = client.put_object(Bucket=BUCKET, Key=key, Body=b"A's commit")
    r_b = client.put_object(Bucket=BUCKET, Key=key, Body=b"B's commit")
    assert r_a["ResponseMetadata"]["HTTPStatusCode"] == 200
    assert r_b["ResponseMetadata"]["HTTPStatusCode"] == 200

    final = client.get_object(Bucket=BUCKET, Key=key)["Body"].read()
    assert final == b"B's commit"  # A's commit is gone, with no error anywhere.
    return {"a_status": 200, "b_status": 200, "survivor": final.decode()}


def if_none_match_create_if_absent(client):
    """Two clients race to create the same new key with If-None-Match: *.
    The first succeeds; the second gets a real 412. Reproduces step 2's reveal and step 5."""
    key = "cas/commit-log-entry-1"
    first = client.put_object(Bucket=BUCKET, Key=key, Body=b"first writer", IfNoneMatch="*")
    assert first["ResponseMetadata"]["HTTPStatusCode"] == 200

    try:
        client.put_object(Bucket=BUCKET, Key=key, Body=b"second writer", IfNoneMatch="*")
        raised = False
        status = None
    except ClientError as e:
        raised = True
        status = e.response["ResponseMetadata"]["HTTPStatusCode"]

    assert raised is True
    assert status == 412

    survivor = client.get_object(Bucket=BUCKET, Key=key)["Body"].read()
    assert survivor == b"first writer"
    return {"first_status": 200, "second_status": status, "survivor": survivor.decode()}


def if_match_update_if_unchanged(client):
    """A lease key updated with If-Match: <current ETag> succeeds; a second update using the
    now-stale ETag gets a real 412 instead of clobbering the lease holder's write."""
    key = "lease/worker-7"
    r1 = client.put_object(Bucket=BUCKET, Key=key, Body=b"held-by: worker-7, until: t+30s")
    etag1 = r1["ETag"].strip('"')

    r2 = client.put_object(Bucket=BUCKET, Key=key, Body=b"held-by: worker-7, until: t+60s", IfMatch=etag1)
    assert r2["ResponseMetadata"]["HTTPStatusCode"] == 200
    etag2 = r2["ETag"].strip('"')
    assert etag2 != etag1

    try:
        # A second renewal using the now-stale first ETag.
        client.put_object(Bucket=BUCKET, Key=key, Body=b"held-by: worker-12, until: t+30s", IfMatch=etag1)
        raised = False
        status = None
    except ClientError as e:
        raised = True
        status = e.response["ResponseMetadata"]["HTTPStatusCode"]

    assert raised is True
    assert status == 412

    final = client.get_object(Bucket=BUCKET, Key=key)["Body"].read()
    assert final == b"held-by: worker-7, until: t+60s"
    return {"renew_status": 200, "stale_renew_status": status, "final": final.decode()}


def immediate_read_after_write(client, trials=20):
    """A PUT followed immediately by a GET on the same key returns the just-written bytes, every
    time across repeated trials. The local server's own strong-consistency behaviour."""
    key = "consistency/probe"
    hits = 0
    for i in range(trials):
        body = f"value-{i}".encode()
        client.put_object(Bucket=BUCKET, Key=key, Body=body)
        seen = client.get_object(Bucket=BUCKET, Key=key)["Body"].read()
        if seen == body:
            hits += 1
    assert hits == trials
    return {"trials": trials, "immediate_hits": hits}


def rename_is_copy_then_delete(client):
    """There is no atomic rename call. A rename is a copy_object followed by a delete_object:
    two separate requests, with a real window in between where both keys exist at once."""
    src, dst = "warehouse/_tmp/part-00000.parquet", "warehouse/final/part-00000.parquet"
    client.put_object(Bucket=BUCKET, Key=src, Body=b"parquet-bytes")

    client.copy_object(Bucket=BUCKET, CopySource={"Bucket": BUCKET, "Key": src}, Key=dst)
    # Window: both keys exist simultaneously, which an atomic rename would never allow.
    both_exist = _key_exists(client, src) and _key_exists(client, dst)
    assert both_exist is True

    client.delete_object(Bucket=BUCKET, Key=src)
    src_gone = not _key_exists(client, src)
    dst_present = _key_exists(client, dst)
    assert src_gone is True and dst_present is True
    return {"window_had_both_keys": both_exist, "operations": 2}


class TokenBucketPrefixLimiter:
    """Simulates AWS's own documented per-prefix request-rate baseline for one instantaneous
    burst (no wall-clock refill within the burst). Disclosed as a local simulation (see
    OUTLINE.md) — this is not real S3 throttling behaviour."""

    def __init__(self, rate_per_sec):
        self.tokens = rate_per_sec

    def try_acquire(self):
        if self.tokens > 0:
            self.tokens -= 1
            return True
        return False


def hot_prefix_throttle_simulation():
    """A burst against one prefix that exceeds the sourced write baseline (3,500/sec) throttles;
    the same burst spread across several prefixes, each under its own limiter, does not."""
    write_rate = 3500
    burst_size = 4000

    one_prefix = TokenBucketPrefixLimiter(write_rate)
    throttled_single = sum(1 for _ in range(burst_size) if not one_prefix.try_acquire())
    assert throttled_single == burst_size - write_rate  # 500 excess requests get 503 Slow Down.

    num_prefixes = 4
    per_prefix_burst = burst_size // num_prefixes  # 1000 requests to each of 4 prefixes.
    limiters = [TokenBucketPrefixLimiter(write_rate) for _ in range(num_prefixes)]
    throttled_sharded = sum(
        1 for limiter in limiters for _ in range(per_prefix_burst) if not limiter.try_acquire()
    )
    assert throttled_sharded == 0  # 1,000/sec per prefix is well under the 3,500/sec baseline.

    return {
        "write_rate_per_prefix": write_rate,
        "burst_size": burst_size,
        "throttled_single_prefix": throttled_single,
        "num_prefixes_sharded": num_prefixes,
        "throttled_after_sharding": throttled_sharded,
    }


def _key_exists(client, key):
    try:
        client.head_object(Bucket=BUCKET, Key=key)
        return True
    except ClientError as e:
        if e.response["ResponseMetadata"]["HTTPStatusCode"] == 404:
            return False
        raise


def main():
    server, client = start_server()
    try:
        results = {}
        results["naive_check_then_put_loses_a_write"] = naive_check_then_put_loses_a_write(client)
        results["if_none_match_create_if_absent"] = if_none_match_create_if_absent(client)
        results["if_match_update_if_unchanged"] = if_match_update_if_unchanged(client)
        results["immediate_read_after_write"] = immediate_read_after_write(client)
        results["rename_is_copy_then_delete"] = rename_is_copy_then_delete(client)
        results["hot_prefix_throttle_simulation"] = hot_prefix_throttle_simulation()
        for name, value in results.items():
            print(f"{name}: {value}")
        print("\nAll examples passed.")
    finally:
        server.stop()


if __name__ == "__main__":
    main()
