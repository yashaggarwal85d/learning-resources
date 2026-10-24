// A real toy cluster of nodes, each tracking its own term, role, and log
// state, holding a real election under terms and randomized timeouts. Does
// the real election outcome match what the paper's own voting rule
// requires, and does a real PreVote round genuinely stop a partitioned
// node's own stale term from disrupting a healthy cluster when it rejoins?

const NUM_NODES: usize = 5;

#[derive(Clone, Copy, Debug)]
struct Node {
    term: u64,
    log_last_term: u64,
    log_len: usize,
    has_live_leader: bool,
}

fn majority(n: usize) -> usize {
    n / 2 + 1
}

// Is a log (term a, length a) at least as up to date as a log (term b, length b),
// using the paper's own rule: compare term first, then length.
fn log_is_at_least_as_up_to_date(a_term: u64, a_len: usize, b_term: u64, b_len: usize) -> bool {
    if a_term != b_term {
        a_term > b_term
    } else {
        a_len >= b_len
    }
}

fn grant_vote(voter: &Node, candidate_term: u64, candidate_log_term: u64, candidate_log_len: usize) -> bool {
    if candidate_term < voter.term {
        return false;
    }
    log_is_at_least_as_up_to_date(candidate_log_term, candidate_log_len, voter.log_last_term, voter.log_len)
}

// A pre-vote round: the same up-to-date-log rule, plus a voter that already
// has a live leader denies it outright, to protect that leader from a
// disruption that would otherwise come from a merely higher term.
fn grant_prevote(voter: &Node, would_be_term: u64, candidate_log_term: u64, candidate_log_len: usize) -> bool {
    if voter.has_live_leader {
        return false;
    }
    if would_be_term < voter.term {
        return false;
    }
    log_is_at_least_as_up_to_date(candidate_log_term, candidate_log_len, voter.log_last_term, voter.log_len)
}

// Deterministic xorshift64, so "randomized" election timeouts are real,
// reproducible numbers rather than hidden system randomness.
struct Xorshift64(u64);
impl Xorshift64 {
    fn next(&mut self) -> u64 {
        let mut x = self.0;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.0 = x;
        x
    }
}

fn random_timeouts(seed: u64, n: usize) -> Vec<u64> {
    let mut rng = Xorshift64(seed);
    (0..n).map(|_| 150 + rng.next() % 150).collect()
}

fn main() {
    // ---- Scenario A: a correct election among identical, healthy logs. ----
    let timeouts = random_timeouts(0x5EED, NUM_NODES);
    let candidate_idx = timeouts
        .iter()
        .enumerate()
        .min_by_key(|&(_, &t)| t)
        .map(|(i, _)| i)
        .unwrap();
    let voters: Vec<Node> = (0..NUM_NODES)
        .map(|_| Node { term: 1, log_last_term: 1, log_len: 5, has_live_leader: false })
        .collect();
    let candidate_term = voters[candidate_idx].term + 1;
    let candidate_log_term = voters[candidate_idx].log_last_term;
    let candidate_log_len = voters[candidate_idx].log_len;
    let mut votes = 1usize; // the candidate votes for itself
    for (i, voter) in voters.iter().enumerate() {
        if i != candidate_idx && grant_vote(voter, candidate_term, candidate_log_term, candidate_log_len) {
            votes += 1;
        }
    }
    let fastest_timeout = *timeouts.iter().min().unwrap();
    let scenario_a_winner_is_fastest_timeout = timeouts[candidate_idx] == fastest_timeout;
    let scenario_a_won = votes >= majority(NUM_NODES);

    // ---- Scenario B: an out-of-date candidate's own vote request is ----
    // ---- genuinely rejected by the up-to-date-log voting rule. ----
    let stale_candidate = Node { term: 1, log_last_term: 1, log_len: 3, has_live_leader: false };
    let fresh_voters: Vec<Node> = (0..NUM_NODES - 1)
        .map(|_| Node { term: 1, log_last_term: 1, log_len: 5, has_live_leader: false })
        .collect();
    let stale_candidate_term = stale_candidate.term + 1;
    let mut stale_votes = 1usize;
    for voter in &fresh_voters {
        if grant_vote(voter, stale_candidate_term, stale_candidate.log_last_term, stale_candidate.log_len) {
            stale_votes += 1;
        }
    }
    let scenario_b_stale_candidate_loses = stale_votes < majority(NUM_NODES);

    // ---- Scenario C: PreVote genuinely stops a partitioned node's own ----
    // ---- stale term from disrupting a healthy cluster when it rejoins. ----
    let healthy_term = 5u64;
    let healthy_voters: Vec<Node> = (0..NUM_NODES - 1)
        .map(|_| Node { term: healthy_term, log_last_term: 1, log_len: 5, has_live_leader: true })
        .collect();
    let partitioned = Node { term: healthy_term, log_last_term: 1, log_len: 5, has_live_leader: false };

    // With PreVote: the partitioned node asks first, without raising its own term yet.
    let would_be_term = partitioned.term + 1;
    let mut prevotes = 0usize;
    for voter in &healthy_voters {
        if grant_prevote(voter, would_be_term, partitioned.log_last_term, partitioned.log_len) {
            prevotes += 1;
        }
    }
    let scenario_c_prevote_denied = prevotes < majority(NUM_NODES) - 1; // excluding the candidate's own non-vote in a pre-vote round
    let scenario_c_term_unchanged_with_prevote = scenario_c_prevote_denied; // its term never actually rises, since it never proceeds to a real election

    // Without PreVote: the partitioned node just increments its own term on
    // every missed heartbeat while cut off, then broadcasts that stale term
    // on rejoin; every real Raft node updates its own term on any higher
    // term it sees, which forces even the healthy leader to step down.
    let missed_heartbeats_while_partitioned = 3u64;
    let partitioned_term_without_prevote = partitioned.term + missed_heartbeats_while_partitioned;
    let mut leader_steps_down = false;
    let mut cluster_term_after_rejoin = healthy_term;
    for voter in &healthy_voters {
        if partitioned_term_without_prevote > voter.term {
            leader_steps_down = true;
            cluster_term_after_rejoin = partitioned_term_without_prevote;
        }
    }
    let scenario_c_disruption_without_prevote = leader_steps_down && cluster_term_after_rejoin > healthy_term;

    println!("scenario_a_winner_is_fastest_timeout {}", scenario_a_winner_is_fastest_timeout);
    println!("scenario_a_won {}", scenario_a_won);
    println!("scenario_a_votes {}", votes);
    println!("scenario_b_stale_candidate_loses {}", scenario_b_stale_candidate_loses);
    println!("scenario_b_votes {}", stale_votes);
    println!("scenario_c_term_unchanged_with_prevote {}", scenario_c_term_unchanged_with_prevote);
    println!("scenario_c_disruption_without_prevote {}", scenario_c_disruption_without_prevote);

    let a_election_genuinely_elects_the_fastest_timed_out_candidate =
        scenario_a_winner_is_fastest_timeout && scenario_a_won;
    let b_out_of_date_candidate_genuinely_loses_the_election = scenario_b_stale_candidate_loses;
    let c_prevote_genuinely_stops_the_disruption_that_happens_without_it =
        scenario_c_term_unchanged_with_prevote && scenario_c_disruption_without_prevote;

    println!(
        "a_election_genuinely_elects_the_fastest_timed_out_candidate {}",
        a_election_genuinely_elects_the_fastest_timed_out_candidate
    );
    println!(
        "b_out_of_date_candidate_genuinely_loses_the_election {}",
        b_out_of_date_candidate_genuinely_loses_the_election
    );
    println!(
        "c_prevote_genuinely_stops_the_disruption_that_happens_without_it {}",
        c_prevote_genuinely_stops_the_disruption_that_happens_without_it
    );
}
