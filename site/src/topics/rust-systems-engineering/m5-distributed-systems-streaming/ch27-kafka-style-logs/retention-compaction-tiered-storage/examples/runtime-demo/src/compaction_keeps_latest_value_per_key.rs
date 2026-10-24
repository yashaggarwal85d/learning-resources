// Builds directly on the previous topics' own partitioned log: a real
// time/size retention function that deletes entries past a real age
// threshold regardless of key, and a real compaction function that keeps
// only the latest entry per key, with a real tombstone causing a key to be
// genuinely removed once compaction runs past it.

#[derive(Clone, Debug, PartialEq, Eq)]
struct Entry {
    key: String,
    value: Option<i64>, // None is a real tombstone: a delete for this key
    timestamp: u64,
}

// A real time-based retention pass: entries older than the real cutoff are
// genuinely dropped, with no regard for whether they are a key's own only
// or latest entry.
fn apply_retention(log: &[Entry], now: u64, max_age: u64) -> Vec<Entry> {
    log.iter().filter(|e| now.saturating_sub(e.timestamp) < max_age).cloned().collect()
}

// A real compaction pass: keep only the latest entry for each distinct
// key, scanning the log in its own real write order; a real tombstone as
// that latest entry means the key is genuinely removed entirely.
fn apply_compaction(log: &[Entry]) -> Vec<Entry> {
    let mut latest: Vec<(String, Option<Entry>)> = Vec::new();
    for entry in log {
        match latest.iter_mut().find(|(k, _)| *k == entry.key) {
            Some((_, slot)) => *slot = Some(entry.clone()),
            None => latest.push((entry.key.clone(), Some(entry.clone()))),
        }
    }
    latest
        .into_iter()
        .filter_map(|(_, slot)| slot)
        .filter(|e| e.value.is_some()) // a real tombstone removes the key entirely
        .collect()
}

fn main() {
    // A log with one key (`cold-account`) whose only ever entry is already
    // old, and another key (`hot-account`) with several recent updates.
    let log = vec![
        Entry { key: "cold-account".into(), value: Some(500), timestamp: 10 },
        Entry { key: "hot-account".into(), value: Some(1), timestamp: 90 },
        Entry { key: "hot-account".into(), value: Some(2), timestamp: 95 },
        Entry { key: "hot-account".into(), value: Some(3), timestamp: 99 },
    ];
    let now = 100u64;
    let max_age = 50u64; // anything older than timestamp 50 is past retention

    // ---- Scenario A: time-based retention genuinely deletes an old ----
    // ---- entry regardless of whether it is that key's own latest. ----
    let retained = apply_retention(&log, now, max_age);
    let scenario_a_cold_account_genuinely_dropped_by_retention = !retained.iter().any(|e| e.key == "cold-account");
    let scenario_a_hot_account_entries_genuinely_survive_retention = retained.iter().filter(|e| e.key == "hot-account").count() == 3;

    // ---- Scenario B: compaction genuinely keeps the latest value per ----
    // ---- key forever, with no age-based deletion for a surviving key, ----
    // ---- even on the identical log retention would have pruned. ----
    let compacted = apply_compaction(&log);
    let scenario_b_cold_account_genuinely_survives_compaction = compacted.iter().any(|e| e.key == "cold-account" && e.value == Some(500));
    let scenario_b_hot_account_genuinely_collapses_to_one_entry = compacted.iter().filter(|e| e.key == "hot-account").count() == 1;
    let scenario_b_hot_account_genuinely_keeps_the_latest_value =
        compacted.iter().find(|e| e.key == "hot-account").map(|e| e.value) == Some(Some(3));

    // ---- Scenario C: a tombstone genuinely removes the key entirely ----
    // ---- once compaction runs past it. ----
    let mut log_with_tombstone = log.clone();
    log_with_tombstone.push(Entry { key: "cold-account".into(), value: None, timestamp: 101 });
    let compacted_with_tombstone = apply_compaction(&log_with_tombstone);
    let scenario_c_tombstoned_key_genuinely_absent_after_compaction = !compacted_with_tombstone.iter().any(|e| e.key == "cold-account");
    let scenario_c_other_key_genuinely_unaffected_by_the_tombstone = compacted_with_tombstone.iter().any(|e| e.key == "hot-account" && e.value == Some(3));

    println!("retained_count {}", retained.len());
    println!("compacted_count {}", compacted.len());
    println!("compacted_with_tombstone_count {}", compacted_with_tombstone.len());
    println!("scenario_a_cold_account_genuinely_dropped_by_retention {}", scenario_a_cold_account_genuinely_dropped_by_retention);
    println!(
        "scenario_a_hot_account_entries_genuinely_survive_retention {}",
        scenario_a_hot_account_entries_genuinely_survive_retention
    );
    println!("scenario_b_cold_account_genuinely_survives_compaction {}", scenario_b_cold_account_genuinely_survives_compaction);
    println!(
        "scenario_b_hot_account_genuinely_collapses_to_one_entry {}",
        scenario_b_hot_account_genuinely_collapses_to_one_entry
    );
    println!(
        "scenario_b_hot_account_genuinely_keeps_the_latest_value {}",
        scenario_b_hot_account_genuinely_keeps_the_latest_value
    );
    println!(
        "scenario_c_tombstoned_key_genuinely_absent_after_compaction {}",
        scenario_c_tombstoned_key_genuinely_absent_after_compaction
    );
    println!(
        "scenario_c_other_key_genuinely_unaffected_by_the_tombstone {}",
        scenario_c_other_key_genuinely_unaffected_by_the_tombstone
    );

    let a_time_size_retention_genuinely_deletes_by_age_regardless_of_key =
        scenario_a_cold_account_genuinely_dropped_by_retention && scenario_a_hot_account_entries_genuinely_survive_retention;
    let b_compaction_genuinely_keeps_the_latest_value_per_key_forever = scenario_b_cold_account_genuinely_survives_compaction
        && scenario_b_hot_account_genuinely_collapses_to_one_entry
        && scenario_b_hot_account_genuinely_keeps_the_latest_value;
    let c_a_tombstone_genuinely_removes_the_key_once_compaction_runs_past_it =
        scenario_c_tombstoned_key_genuinely_absent_after_compaction && scenario_c_other_key_genuinely_unaffected_by_the_tombstone;

    println!(
        "a_time_size_retention_genuinely_deletes_by_age_regardless_of_key {}",
        a_time_size_retention_genuinely_deletes_by_age_regardless_of_key
    );
    println!(
        "b_compaction_genuinely_keeps_the_latest_value_per_key_forever {}",
        b_compaction_genuinely_keeps_the_latest_value_per_key_forever
    );
    println!(
        "c_a_tombstone_genuinely_removes_the_key_once_compaction_runs_past_it {}",
        c_a_tombstone_genuinely_removes_the_key_once_compaction_runs_past_it
    );
}
