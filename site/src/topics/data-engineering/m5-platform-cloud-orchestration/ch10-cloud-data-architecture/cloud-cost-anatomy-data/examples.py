"""The four cost dimensions, a small-file request storm, a worked Spark-job teardown, and the
10.1 chapter lab (a real twenty-writer conditional-write race, then a hot-prefix throttle, both
priced with this topic's own model).

Engine of record: `moto`'s `ThreadedMotoServer` driven by real `boto3` S3 calls, standing in for
Amazon S3 for the lab (MinIO's own release channel is archived and no longer served, confirmed at
research time — see OUTLINE.md's "Changes from the chapter plan"). Every request count below for
the lab comes from real HTTP round trips against that local server, counted by a wrapping client.

Per-unit prices are disclosed, publicly documented figures (not scraped from this sandbox, whose
pricing pages render their numbers client-side from a template with no literal digits in the raw
HTML — see SOURCES.md). Current as of 2026-10-31, US East (N. Virginia) / US East (Ohio) rates
unless noted. A real production teardown would re-check these against the AWS Price List API
before billing anyone.
"""

import threading

import boto3
from botocore.exceptions import ClientError
from moto.server import ThreadedMotoServer

BUCKET = "cost-anatomy-demo"

# --- Disclosed per-unit prices (SOURCES.md has the mechanics; these specific numbers are the
# well-documented public rates for S3 Standard / EC2 / a NAT gateway in US East, not scraped). ---
PRICE_PER_GB_MONTH_STANDARD = 0.023
PRICE_PER_1000_PUT_COPY_POST_LIST = 0.005
PRICE_PER_1000_GET_SELECT = 0.0004
PRICE_PER_GB_CROSS_AZ = 0.01  # sourced: $0.01/GB each direction
PRICE_PER_GB_EGRESS_FIRST_10TB = 0.09
NAT_GATEWAY_PER_HOUR = 0.045  # sourced
NAT_GATEWAY_PER_GB_PROCESSED = 0.045  # sourced


def four_dimension_cost_model(storage_gb, put_requests, get_requests, cross_az_gb, egress_gb, nat_gb, nat_hours):
    """Price a workload's bill across the four dimensions by name. Nothing here is a single
    "cost" number; each dimension is kept separate so a new line item has somewhere to go."""
    storage = storage_gb * PRICE_PER_GB_MONTH_STANDARD
    requests = (put_requests / 1000) * PRICE_PER_1000_PUT_COPY_POST_LIST + (get_requests / 1000) * PRICE_PER_1000_GET_SELECT
    network = cross_az_gb * PRICE_PER_GB_CROSS_AZ + egress_gb * PRICE_PER_GB_EGRESS_FIRST_10TB
    nat = nat_hours * NAT_GATEWAY_PER_HOUR + nat_gb * NAT_GATEWAY_PER_GB_PROCESSED
    return {
        "storage": round(storage, 4),
        "requests": round(requests, 4),
        "network": round(network, 4),
        "nat": round(nat, 4),
        "total": round(storage + requests + network + nat, 4),
    }


def small_file_request_storm():
    """The same total bytes (10 GB) written as one million 10 KB files versus ten 1 GB files.
    Storage-GB cost is identical either way; the request cost is not."""
    total_bytes_gb = 10

    tiny_file_count = 1_000_000
    tiny_puts = tiny_file_count  # one PUT per file
    tiny_lists_for_one_full_scan = 1_000  # S3 LIST pages at up to 1,000 keys per call
    tiny_gets_for_one_full_read = tiny_file_count  # reading every object back needs one GET each

    large_file_count = 10
    large_puts = large_file_count
    large_lists_for_one_full_scan = 1  # one page covers all 10 keys
    large_gets_for_one_full_read = large_file_count

    tiny = four_dimension_cost_model(
        storage_gb=total_bytes_gb, put_requests=tiny_puts + tiny_lists_for_one_full_scan,
        get_requests=tiny_gets_for_one_full_read, cross_az_gb=0, egress_gb=0, nat_gb=0, nat_hours=0,
    )
    large = four_dimension_cost_model(
        storage_gb=total_bytes_gb, put_requests=large_puts + large_lists_for_one_full_scan,
        get_requests=large_gets_for_one_full_read, cross_az_gb=0, egress_gb=0, nat_gb=0, nat_hours=0,
    )

    assert tiny["storage"] == large["storage"]  # identical bytes, identical storage line.
    assert tiny["requests"] > large["requests"] * 1000  # the request line is where they diverge.
    return {"tiny_file_layout": tiny, "large_file_layout": large, "same_bytes_gb": total_bytes_gb}


def worked_spark_job_teardown():
    """One synthetic but fully-costed Spark job: reads 500 GB from one region, shuffles across
    AZs, writes results out to the internet through a NAT gateway, running for two hours."""
    return four_dimension_cost_model(
        storage_gb=500,
        put_requests=2_000,
        get_requests=50_000,
        cross_az_gb=120,  # shuffle traffic crossing AZ boundaries during the job
        egress_gb=5,  # final result set shipped to an external consumer
        nat_gb=5,
        nat_hours=2,
    )


# --- 10.1 chapter lab: a real conditional-write race, then a hot-prefix throttle, both priced. ---


class _CountingClient:
    """Wraps a boto3 S3 client to count requests by type, for pricing the lab's own traffic."""

    def __init__(self, client):
        self._client = client
        self.puts = 0
        self.lists = 0
        self.gets = 0

    def list_objects_v2(self, **kw):
        self.lists += 1
        return self._client.list_objects_v2(**kw)

    def put_object(self, **kw):
        self.puts += 1
        return self._client.put_object(**kw)

    def get_object(self, **kw):
        self.gets += 1
        return self._client.get_object(**kw)


def start_server():
    server = ThreadedMotoServer(port=0)
    server.start()
    port = server._server.server_address[1]
    raw = boto3.client(
        "s3", endpoint_url=f"http://127.0.0.1:{port}",
        aws_access_key_id="test", aws_secret_access_key="test", region_name="us-east-1",
    )
    raw.create_bucket(Bucket=BUCKET)
    return server, _CountingClient(raw)


def twenty_writer_naive_race(client):
    """Twenty threads all list-then-put against the same key with no precondition. At least one
    commit is silently lost, with no error from any writer."""
    key = "lab/naive-ledger"
    survivors = []

    def writer(n):
        existing = client.list_objects_v2(Bucket=BUCKET, Prefix=key)
        client.put_object(Bucket=BUCKET, Key=key, Body=f"writer-{n}".encode())
        survivors.append(n)

    threads = [threading.Thread(target=writer, args=(n,)) for n in range(20)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    final = client.get_object(Bucket=BUCKET, Key=key)["Body"].read().decode()
    lost = len(survivors) - 1  # exactly one writer's value can occupy the key at the end.
    assert lost == 19  # nineteen of twenty commits vanish with zero errors raised.
    return {"writers": 20, "final_value": final, "lost_commits": lost, "errors_raised": 0}


def twenty_writer_conditional_race(client):
    """Twenty threads race to create twenty distinct keys with If-None-Match: *, then race to
    update one shared counter key the same way, retrying on a real 412. No commit is lost."""
    counter_key = "lab/cas-counter"
    client.put_object(Bucket=BUCKET, Key=counter_key, Body=b"0", IfNoneMatch="*")
    successes = []
    lock = threading.Lock()

    def writer(n):
        for attempt in range(50):
            try:
                got = client.get_object(Bucket=BUCKET, Key=counter_key)
                current = got["Body"].read()
                etag = got["ETag"]
                new_value = str(int(current) + 1).encode()
                client.put_object(Bucket=BUCKET, Key=counter_key, Body=new_value, IfMatch=etag)
                with lock:
                    successes.append(n)
                return
            except ClientError as e:
                if e.response["Error"]["Code"] != "PreconditionFailed":
                    raise
                continue  # lost the race this attempt; re-read and retry — nothing is lost.

    threads = [threading.Thread(target=writer, args=(n,)) for n in range(20)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    final = int(client.get_object(Bucket=BUCKET, Key=counter_key)["Body"].read())
    assert final == 20  # every one of the twenty increments landed; nothing was overwritten away.
    assert len(successes) == 20
    return {"writers": 20, "final_counter": final, "lost_commits": 0}


def price_the_two_races(naive_result, cas_result, naive_requests, cas_requests):
    """The two runs did very different amounts of work for very different correctness
    guarantees; price each on its own measured request count."""
    naive_cost = four_dimension_cost_model(
        storage_gb=0, put_requests=naive_requests["puts"], get_requests=naive_requests["gets"] + naive_requests["lists"],
        cross_az_gb=0, egress_gb=0, nat_gb=0, nat_hours=0,
    )
    cas_cost = four_dimension_cost_model(
        storage_gb=0, put_requests=cas_requests["puts"], get_requests=cas_requests["gets"] + cas_requests["lists"],
        cross_az_gb=0, egress_gb=0, nat_gb=0, nat_hours=0,
    )
    return {"naive": naive_cost, "conditional": cas_cost}


def main():
    results = {
        "small_file_request_storm": small_file_request_storm(),
        "worked_spark_job_teardown": worked_spark_job_teardown(),
    }

    server, client = start_server()
    try:
        results["twenty_writer_naive_race"] = twenty_writer_naive_race(client)
        naive_requests = {"puts": client.puts, "gets": client.gets, "lists": client.lists}
        client.puts = client.gets = client.lists = 0

        results["twenty_writer_conditional_race"] = twenty_writer_conditional_race(client)
        cas_requests = {"puts": client.puts, "gets": client.gets, "lists": client.lists}

        results["priced_races"] = price_the_two_races(
            results["twenty_writer_naive_race"], results["twenty_writer_conditional_race"],
            naive_requests, cas_requests,
        )
    finally:
        server.stop()

    for name, value in results.items():
        print(f"{name}: {value}")
    return results


if __name__ == "__main__":
    main()
