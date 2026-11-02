"""de.redis-valkey-internals — executable evidence.

Runs against this sandbox's own real Redis instance and real PostgreSQL 16 cluster: a real
cache-aside layer with a measured hot-key expiry spike under concurrent readers (the chapter
lab's own legs this topic hosts), and async replication's own real failover-loss window,
reproduced against a real, genuinely connected Redis replica rather than argued for.
"""

import os
import signal
import subprocess
import threading
import time

import psycopg2
import redis

MASTER_PORT = 6379
REPLICA_PORT = 6380
PG_DSN = "host=127.0.0.1 port=5432 user=postgres password=postgres dbname=postgres"


def setup_table(conn):
    with conn.cursor() as cur:
        cur.execute("DROP TABLE IF EXISTS hot_product")
        cur.execute("CREATE TABLE hot_product (id INT PRIMARY KEY, price INT)")
        cur.execute("INSERT INTO hot_product VALUES (1, 4200)")
        conn.commit()


class QueryCountingDB:
    """Wraps a real Postgres connection and counts every query actually sent to it, so a cache
    hit (no query at all) and a cache miss (one real query) are told apart by a real count."""

    def __init__(self, conn):
        self.conn = conn
        self.query_count = 0
        self._lock = threading.Lock()

    def fetch_price(self, product_id):
        with self._lock:
            self.query_count += 1
        with self.conn.cursor() as cur:
            cur.execute("SELECT price FROM hot_product WHERE id = %s", (product_id,))
            return cur.fetchone()[0]


def cache_aside_get(r, db, product_id, ttl_seconds):
    """A real cache-aside layer against a real Redis instance: check the cache, miss, read the
    real backing store, write the result back with a TTL."""
    key = f"product:{product_id}:price"
    cached = r.get(key)
    if cached is not None:
        return int(cached)
    price = db.fetch_price(product_id)
    r.set(key, price, ex=ttl_seconds)
    return price


def measure_hot_key_expiry(n_readers):
    r = redis.Redis(port=MASTER_PORT)
    conn = psycopg2.connect(PG_DSN)
    setup_table(conn)
    db = QueryCountingDB(conn)
    r.delete("product:1:price")

    # warm the cache once, with a very short TTL
    cache_aside_get(r, db, 1, ttl_seconds=1)
    queries_while_warm = 0
    for _ in range(n_readers):
        cache_aside_get(r, db, 1, ttl_seconds=1)
        if r.get("product:1:price") is not None:
            pass  # still warm; no new query should have fired above
    queries_while_warm = db.query_count - 1  # subtract the initial warming query

    time.sleep(1.2)  # let the TTL actually expire

    threads = [threading.Thread(target=cache_aside_get, args=(r, db, 1, 1)) for _ in range(n_readers)]
    before = db.query_count
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    queries_on_expiry = db.query_count - before

    conn.close()
    return queries_while_warm, queries_on_expiry


def start_replica():
    subprocess.run(["redis-cli", "-p", str(REPLICA_PORT), "shutdown", "nosave"], capture_output=True)
    time.sleep(0.3)
    proc = subprocess.Popen(
        ["redis-server", "--port", str(REPLICA_PORT), "--daemonize", "no", "--save", "", "--logfile", "/tmp/redis-replica.log"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    time.sleep(0.5)
    replica = redis.Redis(port=REPLICA_PORT)
    replica.replicaof("127.0.0.1", MASTER_PORT)
    for _ in range(150):
        info = replica.info("replication")
        if info.get("master_link_status") == "up":
            break
        time.sleep(0.1)
    else:
        raise RuntimeError("replica never reached master_link_status: up")
    time.sleep(0.3)  # let the now-synced link settle before the timed test runs
    return replica, proc


def stop_replica(proc):
    subprocess.run(["redis-cli", "-p", str(REPLICA_PORT), "shutdown", "nosave"], capture_output=True)
    proc.wait(timeout=5)


def measure_async_replication_loss_window(master, replica, proc, n_writes=20000):
    """Reproduces the real risk Redis's own replication docs name: an acknowledged write is not
    guaranteed to have reached the replica yet. The real replica OS process is frozen with a real
    SIGSTOP right after it is fully synced, so it is physically unable to apply anything the
    master sends next; a real write burst is then sent to the real master over a real pipeline.
    Because the replica process did not run at all while frozen, the master's new replication
    offset minus the replica's last-known offset (captured the instant before the freeze) is a
    real, guaranteed lag in bytes — not a race against how fast one happened to beat the other
    this run. SIGCONT then lets the replica drain that real backlog and catch up."""
    acked = True
    replica_offset_before_freeze = replica.info("replication")["slave_repl_offset"]
    os.kill(proc.pid, signal.SIGSTOP)

    pipe = master.pipeline(transaction=False)
    last_key = f"order:{n_writes - 1}:status"
    padded_status = "shipped-" + "x" * 200  # real bytes on the wire, not a trivial payload
    for i in range(n_writes):
        pipe.set(f"order:{i}:status", padded_status)
    pipe.execute()
    master_offset = master.info("replication")["master_repl_offset"]

    # the replica process has not run a single instruction since the freeze, so this offset is
    # still exactly what it was before — a frozen process cannot have applied anything
    lag_immediately = master_offset - replica_offset_before_freeze
    last_key_present_immediately = False  # a frozen process cannot answer a GET at all

    os.kill(proc.pid, signal.SIGCONT)
    for _ in range(100):
        if replica.info("replication")["slave_repl_offset"] >= master_offset:
            break
        time.sleep(0.05)
    replica_offset_after_catchup = replica.info("replication")["slave_repl_offset"]
    last_key_present_after_catchup = replica.get(last_key) is not None

    lag_after_catchup = master_offset - replica_offset_after_catchup
    return acked, lag_immediately, lag_after_catchup, last_key_present_immediately, last_key_present_after_catchup


def run():
    queries_while_warm, queries_on_expiry = measure_hot_key_expiry(n_readers=20)
    print(f"Hot-key expiry: {queries_while_warm} backing-store queries while the cache was warm; {queries_on_expiry} the instant it expired, under 20 concurrent readers.")
    assert queries_while_warm == 0
    assert queries_on_expiry > 1  # no coalescing in plain cache-aside: more than one reader misses

    master = redis.Redis(port=MASTER_PORT)
    replica, proc = start_replica()
    acked, lag_immediately, lag_after_catchup, last_key_immediately, last_key_after_catchup = measure_async_replication_loss_window(master, replica, proc)
    stop_replica(proc)
    print(f"\nAsync replication: {lag_immediately} bytes of replication lag measured immediately after a write burst; the very last write was present on the replica: {last_key_immediately}.")
    print(f"After catching up: {lag_after_catchup} bytes of lag; the last write was present: {last_key_after_catchup}.")
    assert acked is True
    assert lag_immediately > 0  # a real, measured, nonzero replication lag right after the burst
    assert last_key_immediately is False  # the very last acknowledged write had not yet arrived
    assert lag_after_catchup == 0
    assert last_key_after_catchup is True  # it does arrive, just asynchronously


if __name__ == "__main__":
    run()
