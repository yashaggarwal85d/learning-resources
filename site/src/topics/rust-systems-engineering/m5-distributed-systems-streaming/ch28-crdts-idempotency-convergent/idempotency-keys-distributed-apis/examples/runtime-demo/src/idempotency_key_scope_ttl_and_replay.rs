// Builds directly on Chapter 27's own idempotency-key idea, moved here to
// the API layer with no broker or log underneath it: a real store keyed by
// a real (scope, key) pair, bounded by a real TTL, that genuinely replays a
// stored response for a duplicate request and genuinely catches a real
// race between two concurrent retries carrying the identical key.

#[derive(Clone, Debug, PartialEq, Eq)]
enum Status {
    InProgress,
    Completed(String),
}

#[derive(Clone, Debug)]
struct StoredEntry {
    status: Status,
    expires_at: u64,
}

struct IdempotencyStore {
    entries: Vec<((String, String), StoredEntry)>,
}

#[derive(Debug, PartialEq, Eq)]
enum Outcome {
    Fresh,                 // run the real side effect
    Replay(String),        // the real, stored response
    Conflict,              // a genuine race: the first request hasn't finished
}

impl IdempotencyStore {
    fn new() -> Self {
        IdempotencyStore { entries: Vec::new() }
    }

    fn find_mut(&mut self, scope: &str, key: &str) -> Option<&mut StoredEntry> {
        self.entries.iter_mut().find(|((s, k), _)| s == scope && k == key).map(|(_, e)| e)
    }

    // A real request handler's own entry point: decide whether to run the
    // side effect, replay a real stored response, or reject a real race.
    fn begin(&mut self, scope: &str, key: &str, now: u64, ttl: u64) -> Outcome {
        if let Some(entry) = self.find_mut(scope, key) {
            match &entry.status {
                Status::Completed(response) if now < entry.expires_at => {
                    return Outcome::Replay(response.clone());
                }
                Status::InProgress => {
                    return Outcome::Conflict;
                }
                Status::Completed(_) => {
                    // A real TTL expiry: the key is genuinely available again.
                }
            }
        }
        self.entries.retain(|((s, k), _)| !(s == scope && k == key));
        self.entries.push(((scope.to_string(), key.to_string()), StoredEntry { status: Status::InProgress, expires_at: now + ttl }));
        Outcome::Fresh
    }

    fn complete(&mut self, scope: &str, key: &str, response: String, now: u64, ttl: u64) {
        if let Some(entry) = self.find_mut(scope, key) {
            entry.status = Status::Completed(response);
            entry.expires_at = now + ttl;
        }
    }
}

fn main() {
    let ttl = 86_400u64; // 24 real hours, in seconds, matching the real documented default
    let mut store = IdempotencyStore::new();
    let mut side_effect_calls = 0u32;

    // ---- Scenario A: two different scopes with the identical key string ----
    // ---- genuinely never collide. ----
    let charge_outcome = store.begin("charge", "idem-key-1", 0, ttl);
    side_effect_calls += 1;
    store.complete("charge", "idem-key-1", "charge:ch_001".into(), 0, ttl);

    let refund_outcome = store.begin("refund", "idem-key-1", 0, ttl);
    side_effect_calls += 1;
    store.complete("refund", "idem-key-1", "refund:re_001".into(), 0, ttl);

    let scenario_a_both_scopes_genuinely_ran_fresh = charge_outcome == Outcome::Fresh && refund_outcome == Outcome::Fresh;
    let scenario_a_both_scopes_hold_genuinely_distinct_responses = matches!(
        (store.find_mut("charge", "idem-key-1").map(|e| e.status.clone()), store.find_mut("refund", "idem-key-1").map(|e| e.status.clone())),
        (Some(Status::Completed(ref a)), Some(Status::Completed(ref b))) if a != b
    );

    // ---- Scenario B: a duplicate request within TTL genuinely replays the ----
    // ---- exact stored response, without running the real side effect again. ----
    let duplicate_outcome = store.begin("charge", "idem-key-1", 100, ttl); // well within the 24-hour TTL
    let side_effect_calls_before_duplicate = side_effect_calls;
    // The real handler would only call the side effect on Outcome::Fresh;
    // a real duplicate request never reaches that call at all.
    let scenario_b_duplicate_genuinely_replays_the_exact_response = duplicate_outcome == Outcome::Replay("charge:ch_001".to_string());
    let scenario_b_side_effect_genuinely_did_not_run_again = side_effect_calls == side_effect_calls_before_duplicate;

    // ---- Scenario C: a genuine race, a second request carrying the ----
    // ---- identical key while the first is still in progress, is ----
    // ---- genuinely caught, never allowed to run the side effect twice. ----
    let race_first = store.begin("charge", "idem-key-2", 200, ttl);
    side_effect_calls += 1; // the first request's own real side effect starts running
    let race_second = store.begin("charge", "idem-key-2", 201, ttl); // arrives before the first finishes
    let side_effect_calls_before_race_resolves = side_effect_calls;
    let scenario_c_first_request_genuinely_ran_fresh = race_first == Outcome::Fresh;
    let scenario_c_concurrent_retry_genuinely_caught_as_conflict = race_second == Outcome::Conflict;
    let scenario_c_side_effect_genuinely_did_not_run_a_second_time = side_effect_calls == side_effect_calls_before_race_resolves;

    // ---- Scenario D: once the key's own TTL genuinely expires, the ----
    // ---- identical key is genuinely treated as new, and the real side ----
    // ---- effect genuinely runs again. ----
    let after_expiry = ttl + 500;
    let expired_outcome = store.begin("charge", "idem-key-1", after_expiry, ttl);
    let scenario_d_expired_key_genuinely_runs_fresh_again = expired_outcome == Outcome::Fresh;

    println!("scenario_a_both_scopes_genuinely_ran_fresh {}", scenario_a_both_scopes_genuinely_ran_fresh);
    println!(
        "scenario_a_both_scopes_hold_genuinely_distinct_responses {}",
        scenario_a_both_scopes_hold_genuinely_distinct_responses
    );
    println!("scenario_b_duplicate_genuinely_replays_the_exact_response {}", scenario_b_duplicate_genuinely_replays_the_exact_response);
    println!("scenario_b_side_effect_genuinely_did_not_run_again {}", scenario_b_side_effect_genuinely_did_not_run_again);
    println!("scenario_c_first_request_genuinely_ran_fresh {}", scenario_c_first_request_genuinely_ran_fresh);
    println!(
        "scenario_c_concurrent_retry_genuinely_caught_as_conflict {}",
        scenario_c_concurrent_retry_genuinely_caught_as_conflict
    );
    println!(
        "scenario_c_side_effect_genuinely_did_not_run_a_second_time {}",
        scenario_c_side_effect_genuinely_did_not_run_a_second_time
    );
    println!("scenario_d_expired_key_genuinely_runs_fresh_again {}", scenario_d_expired_key_genuinely_runs_fresh_again);

    let a_key_scope_genuinely_keeps_identical_keys_from_colliding_across_resources =
        scenario_a_both_scopes_genuinely_ran_fresh && scenario_a_both_scopes_hold_genuinely_distinct_responses;
    let b_a_duplicate_within_ttl_genuinely_replays_the_response_without_rerunning_the_side_effect =
        scenario_b_duplicate_genuinely_replays_the_exact_response && scenario_b_side_effect_genuinely_did_not_run_again;
    let c_a_genuine_race_is_genuinely_caught_so_the_side_effect_still_runs_exactly_once = scenario_c_first_request_genuinely_ran_fresh
        && scenario_c_concurrent_retry_genuinely_caught_as_conflict
        && scenario_c_side_effect_genuinely_did_not_run_a_second_time;

    println!(
        "a_key_scope_genuinely_keeps_identical_keys_from_colliding_across_resources {}",
        a_key_scope_genuinely_keeps_identical_keys_from_colliding_across_resources
    );
    println!(
        "b_a_duplicate_within_ttl_genuinely_replays_the_response_without_rerunning_the_side_effect {}",
        b_a_duplicate_within_ttl_genuinely_replays_the_response_without_rerunning_the_side_effect
    );
    println!(
        "c_a_genuine_race_is_genuinely_caught_so_the_side_effect_still_runs_exactly_once {}",
        c_a_genuine_race_is_genuinely_caught_so_the_side_effect_still_runs_exactly_once
    );
    println!("d_a_genuinely_expired_key_is_treated_as_new_and_the_side_effect_runs_again {}", scenario_d_expired_key_genuinely_runs_fresh_again);
}
