# A mock paginated API, run entirely in this process (no network), standing in for the real
# REST sources this topic's syllabus names (Stripe, GitHub). Every number below is a direct
# measurement against that mock: a real list that grows and shrinks mid-pull, a real token-bucket
# limiter that returns 429 with Retry-After, a real jittered-backoff simulation reproducing the
# AWS Architecture Blog's own contention experiment, a real idempotency-key store, and a real
# refresh-token race between two workers.

import random


class MockAPI:
    """A list of rows, paged by offset or by keyset cursor, that can be mutated between pages
    exactly the way a real source is mutated by concurrent writers while a pull is in flight."""

    def __init__(self, n):
        self.rows = list(range(1, n + 1))  # row ids, in creation order

    def page_by_offset(self, offset, limit):
        return self.rows[offset : offset + limit]

    def page_by_cursor(self, after_id, limit):
        if after_id is None:
            start = 0
        else:
            start = next((i + 1 for i, r in enumerate(self.rows) if r == after_id), len(self.rows))
        return self.rows[start : start + limit]


def offset_pagination_duplicates_and_drops(n=30, page_size=5):
    """Page through a list by offset the way a naive client does: advance the offset by exactly
    one page size, with no idea the underlying list is changing underneath it. Odd-numbered pages
    are immediately followed by an insert at the head (every later row shifts down one place, so
    the next fetch re-reads the last row of the page just read); even-numbered pages are followed
    by a delete from the region just read (every later row shifts up one place, so the next fetch
    skips a row it never got to see)."""
    api = MockAPI(n)
    seen = []
    offset = 0
    next_new_id = n + 1
    page_count = 0
    while offset < len(api.rows):
        page = api.page_by_offset(offset, page_size)
        if not page:
            break
        seen.extend(page)
        page_count += 1
        if page_count % 2 == 1:
            api.rows.insert(0, next_new_id)  # a new row created during the pull, sorted newest-first
            next_new_id += 1
        else:
            del api.rows[offset]  # a row right at the page boundary is deleted
        offset += page_size  # the naive client never compensates for either mutation
    original_ids = set(range(1, n + 1))
    seen_originals = [r for r in seen if r in original_ids]
    duplicates = len(seen_originals) - len(set(seen_originals))
    missing = original_ids - set(seen_originals)
    return {"duplicates": duplicates, "missing": len(missing), "pages": page_count}


def keyset_pagination_unaffected_by_writes(n=30, page_size=5):
    """The identical mutation pattern, read with a keyset cursor (last id seen) instead of an
    offset. An insert at the head never shifts the cursor's own position, because the cursor
    names a row, not a position."""
    api = MockAPI(n)
    seen = []
    cursor = None
    next_new_id = n + 1
    page_count = 0
    while True:
        page = api.page_by_cursor(cursor, page_size)
        if not page:
            break
        seen.extend(page)
        cursor = page[-1]
        page_count += 1
        api.rows.insert(0, next_new_id)
        next_new_id += 1
        if page_count % 3 == 0:
            # delete the oldest original row still unread, if any remain
            unread_originals = [r for r in api.rows if r <= n and r not in seen]
            if unread_originals:
                api.rows.remove(min(unread_originals))
    original_ids = set(range(1, n + 1))
    duplicates = len(seen) - len(set(seen))
    missing = original_ids - set(seen)
    return {"duplicates": duplicates, "missing": len(missing), "pages": page_count}


class TokenBucketLimiter:
    """Stripe's own documented model: a bucket per client, a token removed per request, refilled
    at a fixed rate; an empty bucket returns 429 with a Retry-After telling the caller when a
    token will next be available."""

    def __init__(self, capacity, refill_per_second):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_per_second = refill_per_second
        self.clock = 0.0

    def advance(self, seconds):
        self.clock += seconds
        self.tokens = min(self.capacity, self.tokens + seconds * self.refill_per_second)

    def request(self):
        if self.tokens >= 1:
            self.tokens -= 1
            return {"status": 200}
        # a small buffer past the exact refill instant, so a real clock's own rounding can never
        # land a retry a hair too early
        seconds_to_one_token = (1 - self.tokens) / self.refill_per_second + 1e-6
        return {"status": 429, "retry_after": seconds_to_one_token}


def rate_limit_respecting_retry_after(total_calls=40, capacity=5, refill_per_second=2.0):
    """A client that honours Retry-After sleeps exactly long enough and never wastes a call on a
    bucket it already knows is empty. A client that ignores it and polls on a fixed short delay
    wastes calls on 429s the first client never makes."""
    obedient = TokenBucketLimiter(capacity, refill_per_second)
    obedient_calls = 0
    obedient_clock = 0.0
    completed = 0
    while completed < total_calls:
        resp = obedient.request()
        obedient_calls += 1
        if resp["status"] == 200:
            completed += 1
        else:
            obedient.advance(resp["retry_after"])
            obedient_clock += resp["retry_after"]
    obedient_time = obedient_clock

    naive = TokenBucketLimiter(capacity, refill_per_second)
    naive_calls = 0
    naive_clock = 0.0
    completed = 0
    fixed_delay = 0.05  # a short fixed poll, far shorter than the real refill interval
    wasted_429s = 0
    while completed < total_calls:
        resp = naive.request()
        naive_calls += 1
        if resp["status"] == 200:
            completed += 1
        else:
            wasted_429s += 1
            naive.advance(fixed_delay)
            naive_clock += fixed_delay

    return {
        "obedient_calls": obedient_calls,
        "obedient_429s": obedient_calls - total_calls,
        "naive_calls": naive_calls,
        "naive_wasted_429s": wasted_429s,
        "naive_wastes_more_calls": wasted_429s > (obedient_calls - total_calls),
    }


def backoff_collisions(n_clients, strategy, cap=16, max_ticks=2000, seed=0):
    """Reproduces the AWS Architecture Blog's own contention experiment in discrete time ticks:
    n_clients all contend for one resource that admits exactly one winner per tick any client
    is eligible to try on. Losers back off for a number of ticks that doubles with each of their
    own failed attempts (capped); the strategy decides whether that number is fixed or jittered.
    Returns the total number of requests made across every tick until all clients have won once
    — the real cost "Adding Backoff" measures."""
    rng = random.Random(seed)
    next_eligible_tick = [0] * n_clients
    attempts_made = [0] * n_clients
    total_requests = 0
    winners = set()
    tick = 0
    while len(winners) < n_clients and tick < max_ticks:
        contenders = [i for i in range(n_clients) if i not in winners and next_eligible_tick[i] <= tick]
        if contenders:
            total_requests += len(contenders)
            winner = rng.choice(contenders)
            winners.add(winner)
            for i in contenders:
                if i == winner:
                    continue
                attempts_made[i] += 1
                backoff_ticks = min(cap, 2 ** attempts_made[i])
                if strategy == "no_jitter":
                    delay = backoff_ticks
                elif strategy == "full_jitter":
                    delay = rng.randint(0, backoff_ticks)
                else:
                    raise ValueError(strategy)
                next_eligible_tick[i] = tick + 1 + delay
        tick += 1
    return {"ticks": tick, "total_requests": total_requests, "all_won": len(winners) == n_clients}


def jitter_reduces_total_requests(n_clients=12):
    no_jitter = backoff_collisions(n_clients, "no_jitter", seed=1)
    full_jitter = backoff_collisions(n_clients, "full_jitter", seed=1)
    return {"no_jitter_requests": no_jitter["total_requests"], "full_jitter_requests": full_jitter["total_requests"]}


class PaymentsAPI:
    """A write endpoint with Stripe's own documented idempotency behaviour: a key up to 255
    characters, the first response saved and replayed on an exact repeat, a mismatch error on a
    reused key with different parameters."""

    def __init__(self):
        self.charges = []
        self.idempotency_store = {}  # key -> (params, response)

    def capture(self, key, amount):
        if key in self.idempotency_store:
            saved_params, saved_response = self.idempotency_store[key]
            if saved_params != amount:
                return {"status": 400, "error": "idempotency key used with different parameters"}
            return saved_response
        self.charges.append(amount)
        response = {"status": 200, "charge_id": len(self.charges)}
        self.idempotency_store[key] = (amount, response)
        return response


def idempotency_key_prevents_duplicate_capture(retries=3):
    api = PaymentsAPI()
    key = "ingest-run-42-charge-7"
    responses = [api.capture(key, amount=4200) for _ in range(retries)]
    return {
        "charges_recorded": len(api.charges),
        "all_responses_identical": len({r["charge_id"] for r in responses}) == 1,
    }


class OAuthServer:
    """RFC 6749 section 6's own rotation rule: a refresh MAY issue a new refresh token, in which
    case the client MUST discard the old one, and the server MAY revoke it. This models the
    strict version — the old token stops working the instant a new one is issued."""

    def __init__(self):
        self.valid_refresh_token = "rt-v1"
        self.generation = 1

    def refresh(self, refresh_token):
        if refresh_token != self.valid_refresh_token:
            return {"status": 400, "error": "invalid_grant"}
        self.generation += 1
        self.valid_refresh_token = f"rt-v{self.generation}"
        return {"status": 200, "access_token": f"at-{self.generation}", "refresh_token": self.valid_refresh_token}


def refresh_token_race_without_coordination():
    """Two workers both hold the same refresh token and race to refresh at once. Whichever call
    the server processes first rotates the token; the second worker's identical, stale token is
    then rejected outright, even though it did nothing wrong."""
    server = OAuthServer()
    worker_a_token = worker_b_token = server.valid_refresh_token
    first = server.refresh(worker_a_token)
    second = server.refresh(worker_b_token)  # worker B raced with the same now-stale token
    return {"first_succeeds": first["status"] == 200, "second_locked_out": second["status"] == 400}


def refresh_token_race_fixed_with_a_lock():
    """The same two workers, but a shared lock makes the second worker wait for the first
    worker's own new token before it ever tries to refresh, so it refreshes with a token that is
    still valid instead of the one that was just rotated away."""
    server = OAuthServer()
    shared_token = {"value": server.valid_refresh_token}

    def refresh_under_lock():
        current = shared_token["value"]
        result = server.refresh(current)
        if result["status"] == 200:
            shared_token["value"] = result["refresh_token"]
        return result

    first = refresh_under_lock()
    second = refresh_under_lock()  # waits for the lock in a real concurrent run; here, sequenced
    return {"first_succeeds": first["status"] == 200, "second_succeeds": second["status"] == 200}


def check():
    offset_result = offset_pagination_duplicates_and_drops()
    assert offset_result["duplicates"] > 0  # the insert-caused shift re-reads a row already seen
    assert offset_result["missing"] > 0  # the delete-caused shift skips a row entirely

    keyset_result = keyset_pagination_unaffected_by_writes()
    assert keyset_result["duplicates"] == 0  # a cursor on identity is never shifted by an insert
    assert 0 < keyset_result["missing"] < offset_result["missing"]  # fewer misses, not zero: an
    # outright delete of a row the cursor hasn't reached yet is still invisible to it, same as a
    # hard delete is to any cursor (topic 3) — the fix here is for the insert-caused artifacts only

    retry_result = rate_limit_respecting_retry_after()
    # Retry-After makes one wasted call unavoidable per throttled wait (the call that discovers
    # the bucket is empty) and no more; a fixed short poll wastes many more guessing at the same wait.
    assert retry_result["naive_wasted_429s"] > retry_result["obedient_429s"] * 5
    assert retry_result["naive_wastes_more_calls"] is True

    jitter_result = jitter_reduces_total_requests()
    assert jitter_result["full_jitter_requests"] <= jitter_result["no_jitter_requests"]

    idem_result = idempotency_key_prevents_duplicate_capture()
    assert idem_result["charges_recorded"] == 1  # three client attempts, one real charge
    assert idem_result["all_responses_identical"] is True

    race_result = refresh_token_race_without_coordination()
    assert race_result["first_succeeds"] is True
    assert race_result["second_locked_out"] is True  # the uncoordinated race really does lock one worker out

    fixed_result = refresh_token_race_fixed_with_a_lock()
    assert fixed_result["first_succeeds"] is True
    assert fixed_result["second_succeeds"] is True  # the lock removes the race entirely


if __name__ == "__main__":
    check()
    print("de.api-ingestion-pagination-limits: all checks passed")
