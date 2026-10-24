// Builds directly on the previous topic's own elected leader: a real,
// AppendEntries-shaped replication call, a real conflict-repair pass that
// backs a divergent follower up to a common prefix, and a real commitment
// rule that only counts replicas from the leader's own current term.

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct LogEntry {
    term: u64,
    value: u64,
}

// A real AppendEntries-shaped call: the leader's own current term, the
// previous entry it assumes the follower already holds, the new entries,
// and the leader's own commit index.
struct AppendEntriesArgs<'a> {
    term: u64,
    prev_log_index: usize,
    prev_log_term: u64,
    entries: &'a [LogEntry],
    leader_commit: usize,
}

fn try_append(follower_log: &mut Vec<LogEntry>, follower_term: &mut u64, follower_commit: &mut usize, args: &AppendEntriesArgs) -> bool {
    if args.term < *follower_term {
        return false;
    }
    if args.prev_log_index > follower_log.len() {
        return false;
    }
    if args.prev_log_index > 0 && follower_log[args.prev_log_index - 1].term != args.prev_log_term {
        return false;
    }
    follower_log.truncate(args.prev_log_index);
    follower_log.extend_from_slice(args.entries);
    *follower_term = args.term;
    *follower_commit = args.leader_commit.min(follower_log.len());
    true
}

// The leader optimistically assumes the follower is fully caught up, and
// backs up to a common prefix one step at a time on each real rejection,
// exactly as the paper's own conflict-repair rule describes.
fn replicate_with_retry(
    leader_log: &[LogEntry],
    leader_term: u64,
    leader_commit: usize,
    follower_log: &mut Vec<LogEntry>,
    follower_term: &mut u64,
    follower_commit: &mut usize,
) -> usize {
    let mut next_index = leader_log.len();
    let mut attempts = 0usize;
    loop {
        attempts += 1;
        let prev_log_term = if next_index > 0 { leader_log[next_index - 1].term } else { 0 };
        let args = AppendEntriesArgs {
            term: leader_term,
            prev_log_index: next_index,
            prev_log_term,
            entries: &leader_log[next_index..],
            leader_commit,
        };
        if try_append(follower_log, follower_term, follower_commit, &args) {
            return attempts;
        }
        next_index = next_index.saturating_sub(1);
    }
}

// Raft's own real commitment rule: walk backward from the end, and commit
// through the highest index whose own entry is from the leader's current
// term and has reached a real majority of replicas; everything before that
// index commits indirectly, by the Log Matching Property.
fn commit_index_after_replica_count(log: &[LogEntry], leader_current_term: u64, replica_counts: &[usize], majority: usize) -> usize {
    for i in (0..log.len()).rev() {
        if log[i].term == leader_current_term && replica_counts[i] >= majority {
            return i + 1;
        }
    }
    0
}

fn main() {
    // ---- Scenario A: conflict repair genuinely finds the real common ----
    // ---- prefix and overwrites the divergent suffix exactly. ----
    let leader_log = vec![
        LogEntry { term: 1, value: 10 },
        LogEntry { term: 1, value: 11 },
        LogEntry { term: 2, value: 12 },
        LogEntry { term: 2, value: 13 },
    ];
    let mut follower_log = vec![
        LogEntry { term: 1, value: 10 },
        LogEntry { term: 1, value: 11 },
        LogEntry { term: 3, value: 99 }, // a genuinely divergent, uncommitted entry
    ];
    let mut follower_term = 1u64;
    let mut follower_commit = 0usize;
    let repair_attempts = replicate_with_retry(&leader_log, 2, leader_log.len(), &mut follower_log, &mut follower_term, &mut follower_commit);
    let scenario_a_follower_matches_leader_exactly = follower_log == leader_log;
    let scenario_a_follower_commit_index_catches_up = follower_commit == leader_log.len();
    let scenario_a_no_index_silently_corrupted = follower_log
        .iter()
        .zip(leader_log.iter())
        .all(|(f, l)| f.term == l.term && f.value == l.value)
        && follower_log.len() == leader_log.len();

    // ---- Scenario B: an entry from a previous term, on a real ----
    // ---- majority, is genuinely not committed by counting replicas ----
    // ---- alone (the Figure 8 hazard). ----
    let majority = 2usize; // of 3 real nodes
    let previous_term_only_log = vec![LogEntry { term: 2, value: 100 }];
    let previous_term_only_replicas = vec![2usize]; // a real majority already holds it
    let leader_current_term = 3u64;
    let commit_b = commit_index_after_replica_count(&previous_term_only_log, leader_current_term, &previous_term_only_replicas, majority);
    let scenario_b_previous_term_entry_not_committed_by_replica_count_alone = commit_b == 0;

    // ---- Scenario C: once the leader also replicates a real entry from ----
    // ---- its own current term to the identical majority, that entry ----
    // ---- commits, and the earlier entry commits indirectly with it. ----
    let full_log = vec![LogEntry { term: 2, value: 100 }, LogEntry { term: 3, value: 200 }];
    let full_log_replicas = vec![2usize, 2usize]; // the identical real majority, now also holding the current-term entry
    let commit_c = commit_index_after_replica_count(&full_log, leader_current_term, &full_log_replicas, majority);
    let scenario_c_current_term_entry_commits_everything_up_to_it = commit_c == full_log.len();

    println!("repair_attempts {}", repair_attempts);
    println!("scenario_a_follower_matches_leader_exactly {}", scenario_a_follower_matches_leader_exactly);
    println!("scenario_a_no_index_silently_corrupted {}", scenario_a_no_index_silently_corrupted);
    println!("scenario_a_follower_commit_index_catches_up {}", scenario_a_follower_commit_index_catches_up);
    println!("commit_b {}", commit_b);
    println!(
        "scenario_b_previous_term_entry_not_committed_by_replica_count_alone {}",
        scenario_b_previous_term_entry_not_committed_by_replica_count_alone
    );
    println!("commit_c {}", commit_c);
    println!(
        "scenario_c_current_term_entry_commits_everything_up_to_it {}",
        scenario_c_current_term_entry_commits_everything_up_to_it
    );

    let a_conflict_repair_genuinely_finds_the_real_common_prefix =
        scenario_a_follower_matches_leader_exactly && scenario_a_no_index_silently_corrupted && scenario_a_follower_commit_index_catches_up;
    let b_a_majority_replicated_previous_term_entry_is_genuinely_not_committed_alone =
        scenario_b_previous_term_entry_not_committed_by_replica_count_alone;
    let c_a_current_term_entry_genuinely_commits_the_earlier_entry_indirectly =
        scenario_c_current_term_entry_commits_everything_up_to_it;

    println!(
        "a_conflict_repair_genuinely_finds_the_real_common_prefix {}",
        a_conflict_repair_genuinely_finds_the_real_common_prefix
    );
    println!(
        "b_a_majority_replicated_previous_term_entry_is_genuinely_not_committed_alone {}",
        b_a_majority_replicated_previous_term_entry_is_genuinely_not_committed_alone
    );
    println!(
        "c_a_current_term_entry_genuinely_commits_the_earlier_entry_indirectly {}",
        c_a_current_term_entry_genuinely_commits_the_earlier_entry_indirectly
    );
}
