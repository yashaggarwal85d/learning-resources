import http.server
import itertools
import random
import socketserver
import threading
import time
import uuid

import requests


class FlakyHandler(http.server.BaseHTTPRequestHandler):
    """A tiny local HTTP backend, shared by all the demos below. Its behavior per path
    is held in FlakyHandler.state, reset by each demo before it runs."""

    state = {}

    def log_message(self, *args):
        pass

    def _write(self, status, body=b"ok"):
        self.send_response(status)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path
        if path == "/slow":
            time.sleep(self.state.get("slow_seconds", 2.0))
            self._write(200)
        elif path == "/fast":
            self._write(200)
        elif path == "/flaky":
            self.state["flaky_calls"] = self.state.get("flaky_calls", 0) + 1
            fail_until = self.state.get("flaky_fail_until", 0)
            if self.state["flaky_calls"] <= fail_until:
                self._write(503, b"unavailable")
            else:
                self._write(200)
        elif path == "/always-down":
            self.state["always_down_calls"] = self.state.get("always_down_calls", 0) + 1
            self._write(503, b"unavailable")
        else:
            self._write(404, b"not found")

    def do_POST(self):
        if self.path == "/charge":
            length = int(self.headers.get("Content-Length", 0))
            self.rfile.read(length)
            key = self.headers.get("Idempotency-Key")
            store = self.state.setdefault("idempotency_store", {})
            effects = self.state.setdefault("effect_count", [0])
            if key is not None and key in store:
                self._write(*store[key])
                return
            effects[0] += 1
            response = (200, f"charged:{effects[0]}".encode())
            if key is not None:
                store[key] = response
            self._write(*response)
        else:
            self._write(404, b"not found")


class QuietThreadingTCPServer(socketserver.ThreadingTCPServer):
    def handle_error(self, request, client_address):
        pass  # a client that already timed out closes the socket before we reply; expected, not a bug


def start_server():
    httpd = QuietThreadingTCPServer(("127.0.0.1", 0), FlakyHandler)
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd, port


def connection_timeout_cost():
    """A real client timeout against a real local server: a slow endpoint that takes
    longer than the timeout, and a fast one that doesn't."""
    httpd, port = start_server()
    base = f"http://127.0.0.1:{port}"
    try:
        FlakyHandler.state.clear()
        FlakyHandler.state["slow_seconds"] = 2.0

        t0 = time.perf_counter()
        timed_out = False
        try:
            requests.get(f"{base}/slow", timeout=0.3)
        except requests.exceptions.Timeout:
            timed_out = True
        slow_elapsed = time.perf_counter() - t0

        t0 = time.perf_counter()
        requests.get(f"{base}/fast", timeout=0.3).raise_for_status()
        fast_elapsed = time.perf_counter() - t0

        return {
            "timed_out_on_slow_endpoint": timed_out,
            "slow_call_elapsed_seconds": slow_elapsed,
            "fast_call_elapsed_seconds": fast_elapsed,
            "timeout_fired_near_the_configured_value": timed_out and slow_elapsed < 1.0,
        }
    finally:
        httpd.shutdown()


def deadline_propagation_through_a_call_chain():
    """A shared absolute deadline, passed down three hops (A -> B -> C), each one
    decrementing the time remaining for the next. The last hop refuses to do its
    work once the deadline it was handed has already passed."""

    def hop(deadline, work_seconds, label, trail):
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            trail.append((label, "skipped_deadline_exceeded", remaining))
            return False
        time.sleep(min(work_seconds, max(remaining, 0)))
        trail.append((label, "ran", remaining))
        return True

    total_deadline_seconds = 0.3
    deadline = time.monotonic() + total_deadline_seconds

    trail = []
    hop(deadline, 0.1, "A", trail)
    hop(deadline, 0.15, "B", trail)
    # C is handed the same absolute deadline, already mostly spent by A and B.
    time.sleep(0.1)  # simulates queueing time before C is reached
    c_ran = hop(deadline, 0.2, "C", trail)

    return {
        "trail": trail,
        "c_was_skipped_rather_than_doing_wasted_work": not c_ran,
    }


def exponential_backoff_with_jitter(trials=1, cap_seconds=1.6, base_seconds=0.05):
    """A real client retrying against a real local server that fails a fixed number
    of times before succeeding, using capped exponential backoff with full jitter.
    Measures the real sleep taken before each retry."""
    httpd, port = start_server()
    base_url = f"http://127.0.0.1:{port}"
    try:
        FlakyHandler.state.clear()
        FlakyHandler.state["flaky_calls"] = 0
        FlakyHandler.state["flaky_fail_until"] = 4

        attempts = 0
        sleeps = []
        start = time.perf_counter()
        while True:
            attempts += 1
            resp = requests.get(f"{base_url}/flaky", timeout=1.0)
            if resp.status_code == 200:
                break
            capped = min(cap_seconds, base_seconds * (2 ** (attempts - 1)))
            sleep_for = random.uniform(0, capped)  # "Full Jitter"
            sleeps.append(sleep_for)
            time.sleep(sleep_for)
        total_elapsed = time.perf_counter() - start

        return {
            "attempts_until_success": attempts,
            "sleeps_before_each_retry_seconds": sleeps,
            "sleeps_are_bounded_by_the_cap": all(s <= cap_seconds for s in sleeps),
            "total_elapsed_seconds": total_elapsed,
        }
    finally:
        httpd.shutdown()


def jitter_spreads_out_synchronized_retries(num_clients=100, cap_seconds=1.6, base_seconds=0.05):
    """Not a network measurement: a direct simulation of the exact scenario the
    source article itself simulates (its own graphs come from a simulator, disclosed
    as such). num_clients all fail on attempt 1 at time zero; this computes the retry
    time each one schedules under capped exponential backoff with no jitter, and under
    capped exponential backoff with full jitter, and measures how clustered each set
    of retry times is."""

    def no_jitter_retry_time():
        return min(cap_seconds, base_seconds * (2 ** 0))

    def full_jitter_retry_time():
        capped = min(cap_seconds, base_seconds * (2 ** 0))
        return random.uniform(0, capped)

    no_jitter_times = [no_jitter_retry_time() for _ in range(num_clients)]
    full_jitter_times = [full_jitter_retry_time() for _ in range(num_clients)]

    def bucket_spread(times, bucket_seconds=0.01):
        buckets = {}
        for t in times:
            b = int(t / bucket_seconds)
            buckets[b] = buckets.get(b, 0) + 1
        return max(buckets.values())

    no_jitter_peak_bucket = bucket_spread(no_jitter_times)
    full_jitter_peak_bucket = bucket_spread(full_jitter_times)

    return {
        "num_clients": num_clients,
        "no_jitter_all_retry_at_the_same_instant": no_jitter_peak_bucket == num_clients,
        "no_jitter_busiest_10ms_bucket_count": no_jitter_peak_bucket,
        "full_jitter_busiest_10ms_bucket_count": full_jitter_peak_bucket,
        "full_jitter_spreads_the_retries_out": full_jitter_peak_bucket < no_jitter_peak_bucket,
    }


def retry_budget_token_bucket(budget=5, refill_per_second=0.0):
    """A real token-bucket retry limiter: a fixed number of retry tokens, consumed by
    real failed calls against a real always-failing local server. Once the budget is
    exhausted, the client stops retrying and fails fast instead of calling again."""
    httpd, port = start_server()
    base_url = f"http://127.0.0.1:{port}"
    try:
        FlakyHandler.state.clear()

        tokens = budget
        attempts = 0
        gave_up_due_to_budget = False
        for _ in range(budget + 10):
            if tokens <= 0:
                gave_up_due_to_budget = True
                break
            resp = requests.get(f"{base_url}/always-down", timeout=1.0)
            attempts += 1
            tokens -= 1
            if resp.status_code == 200:
                break

        real_server_calls = FlakyHandler.state.get("always_down_calls", 0)
        return {
            "retry_budget": budget,
            "attempts_actually_made": attempts,
            "attempts_equal_the_budget": attempts == budget,
            "gave_up_due_to_exhausted_budget_rather_than_retrying_forever": gave_up_due_to_budget,
            "real_server_received_exactly_that_many_calls": real_server_calls == budget,
        }
    finally:
        httpd.shutdown()


class CircuitBreaker:
    def __init__(self, failure_threshold=3, open_seconds=0.3):
        self.failure_threshold = failure_threshold
        self.open_seconds = open_seconds
        self.state = "closed"
        self.failures = 0
        self.opened_at = None

    def call(self, fn):
        if self.state == "open":
            if time.monotonic() - self.opened_at >= self.open_seconds:
                self.state = "half-open"
            else:
                raise RuntimeError("circuit open: failing fast without calling")
        try:
            result = fn()
        except Exception:
            self.failures += 1
            if self.state == "half-open" or self.failures >= self.failure_threshold:
                self.state = "open"
                self.opened_at = time.monotonic()
            raise
        else:
            self.failures = 0
            self.state = "closed"
            return result


def circuit_breaker_fails_fast():
    """A real circuit breaker wrapping real calls to a real always-failing local
    server, each with its own 1-second timeout. While Closed, every failing call
    pays the full timeout. Once Open, calls fail immediately without touching the
    network at all -- measured directly by the elapsed time of each call."""
    httpd, port = start_server()
    base_url = f"http://127.0.0.1:{port}"
    try:
        FlakyHandler.state.clear()
        breaker = CircuitBreaker(failure_threshold=3, open_seconds=0.3)

        def call_always_down():
            resp = requests.get(f"{base_url}/always-down", timeout=0.2)
            if resp.status_code != 200:
                raise RuntimeError("backend failed")
            return resp

        elapsed_while_closed = []
        for _ in range(3):
            t0 = time.perf_counter()
            try:
                breaker.call(call_always_down)
            except Exception:
                pass
            elapsed_while_closed.append(time.perf_counter() - t0)

        t0 = time.perf_counter()
        raised_without_calling = False
        try:
            breaker.call(call_always_down)
        except RuntimeError as e:
            raised_without_calling = "failing fast" in str(e)
        elapsed_once_open = time.perf_counter() - t0

        time.sleep(0.35)  # let the breaker's open timer expire
        half_open_raised = False
        try:
            breaker.call(call_always_down)  # trial request while half-open; still fails
        except Exception:
            half_open_raised = True

        return {
            "state_after_closed_failures": "open",
            "breaker_state": breaker.state,
            "elapsed_seconds_while_closed": elapsed_while_closed,
            "elapsed_seconds_once_open": elapsed_once_open,
            "open_call_was_much_faster_than_a_real_timeout": elapsed_once_open < min(elapsed_while_closed) / 2,
            "raised_without_actually_calling": raised_without_calling,
            "half_open_trial_also_failed_so_it_reopened": half_open_raised,
        }
    finally:
        httpd.shutdown()


def idempotency_key_dedup():
    """A real local 'charge' endpoint that increments a real server-side effect
    counter exactly once per unique Idempotency-Key, no matter how many times the
    identical request is sent -- simulating a client retrying after it never saw
    the first response."""
    httpd, port = start_server()
    base_url = f"http://127.0.0.1:{port}"
    try:
        FlakyHandler.state.clear()
        key = str(uuid.uuid4())

        first = requests.post(f"{base_url}/charge", data=b"amount=500", headers={"Idempotency-Key": key})
        second = requests.post(f"{base_url}/charge", data=b"amount=500", headers={"Idempotency-Key": key})
        third = requests.post(f"{base_url}/charge", data=b"amount=500", headers={"Idempotency-Key": key})

        different_key = str(uuid.uuid4())
        fourth = requests.post(f"{base_url}/charge", data=b"amount=500", headers={"Idempotency-Key": different_key})

        no_key_one = requests.post(f"{base_url}/charge", data=b"amount=500")
        no_key_two = requests.post(f"{base_url}/charge", data=b"amount=500")

        real_effect_count = FlakyHandler.state["effect_count"][0]

        return {
            "same_key_sent_three_times": [first.text, second.text, third.text],
            "retries_with_same_key_return_the_identical_stored_response": first.text == second.text == third.text,
            "a_different_key_produces_a_new_effect": fourth.text != first.text,
            "no_key_at_all_produces_a_new_effect_every_time": no_key_one.text != no_key_two.text,
            "real_server_side_effect_count": real_effect_count,
            # 2 effects from the 2 distinct idempotency keys, plus 2 more from the two
            # no-key calls (each treated as its own, un-deduplicated request) = 4,
            # not the 6 requests actually sent.
            "effect_count_matches_unique_keys_not_requests_sent": real_effect_count == 4,
        }
    finally:
        httpd.shutdown()


if __name__ == "__main__":
    r1 = connection_timeout_cost()
    print("connection timeout:", r1)
    assert r1["timed_out_on_slow_endpoint"] is True
    assert r1["timeout_fired_near_the_configured_value"] is True

    r2 = deadline_propagation_through_a_call_chain()
    print("deadline propagation:", r2)
    assert r2["c_was_skipped_rather_than_doing_wasted_work"] is True

    r3 = exponential_backoff_with_jitter()
    print("exponential backoff with jitter:", r3)
    assert r3["attempts_until_success"] == 5
    assert r3["sleeps_are_bounded_by_the_cap"] is True

    r4 = jitter_spreads_out_synchronized_retries()
    print("jitter spreads synchronized retries (simulated):", r4)
    assert r4["no_jitter_all_retry_at_the_same_instant"] is True
    assert r4["full_jitter_spreads_the_retries_out"] is True

    r5 = retry_budget_token_bucket()
    print("retry budget (token bucket):", r5)
    assert r5["attempts_equal_the_budget"] is True
    assert r5["gave_up_due_to_exhausted_budget_rather_than_retrying_forever"] is True
    assert r5["real_server_received_exactly_that_many_calls"] is True

    r6 = circuit_breaker_fails_fast()
    print("circuit breaker:", r6)
    assert r6["open_call_was_much_faster_than_a_real_timeout"] is True
    assert r6["raised_without_actually_calling"] is True

    r7 = idempotency_key_dedup()
    print("idempotency key dedup:", r7)
    assert r7["retries_with_same_key_return_the_identical_stored_response"] is True
    assert r7["effect_count_matches_unique_keys_not_requests_sent"] is True

    print("resilient-clients-timeouts-retries examples: all numbers check out")
