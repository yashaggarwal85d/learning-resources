const NUM_NODES: usize = 3;
const LEADER: usize = 0;
const WRITE_ID: u64 = 1;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum AckPolicy {
    // accepted by a subset smaller than a quorum: the leader alone.
    AcceptedBySubset,
    // durably recorded by the leader alone, before any replica has a copy.
    DurablyRecordedByLeader,
    // durably persisted by a real quorum: the leader plus enough replicas
    // that any two quorums are guaranteed to overlap.
    PersistedByQuorum,
}

fn quorum_size(num_nodes: usize) -> usize {
    num_nodes / 2 + 1
}

// how many nodes, starting with the leader, must hold a durable copy of
// the write before this policy's own acknowledgement point is reached.
fn ack_threshold(policy: AckPolicy, num_nodes: usize) -> usize {
    match policy {
        AckPolicy::AcceptedBySubset => 1,
        AckPolicy::DurablyRecordedByLeader => 1,
        AckPolicy::PersistedByQuorum => quorum_size(num_nodes),
    }
}

struct Cluster {
    // each node's own durable log of write ids it actually holds.
    logs: Vec<Vec<u64>>,
}

impl Cluster {
    fn new(num_nodes: usize) -> Self {
        Cluster { logs: vec![Vec::new(); num_nodes] }
    }

    // replicate a write to exactly `target_count` nodes, starting with
    // the leader, up to this policy's own acknowledgement threshold; no
    // further propagation happens once the threshold is reached.
    fn replicate_to_threshold(&mut self, write_id: u64, target_count: usize) -> Vec<usize> {
        let mut held_by = Vec::new();
        for node in 0..target_count {
            self.logs[node].push(write_id);
            held_by.push(node);
        }
        held_by
    }

    // a node being destroyed loses everything it held; nothing survives
    // on it afterward.
    fn destroy_node(&mut self, node: usize) {
        self.logs[node].clear();
    }

    fn write_survives(&self, write_id: u64) -> bool {
        self.logs.iter().any(|log| log.contains(&write_id))
    }
}

fn run_policy(policy: AckPolicy) -> (usize, Vec<usize>, bool) {
    let mut cluster = Cluster::new(NUM_NODES);
    let threshold = ack_threshold(policy, NUM_NODES);
    let held_by = cluster.replicate_to_threshold(WRITE_ID, threshold);
    // the leader is destroyed immediately after this policy's own
    // acknowledgement point is reached, before any further replication.
    cluster.destroy_node(LEADER);
    let survives = cluster.write_survives(WRITE_ID);
    (threshold, held_by, survives)
}

fn main() {
    let (subset_threshold, subset_held_by, subset_survives) =
        run_policy(AckPolicy::AcceptedBySubset);
    let (leader_threshold, leader_held_by, leader_survives) =
        run_policy(AckPolicy::DurablyRecordedByLeader);
    let (quorum_threshold, quorum_held_by, quorum_survives) =
        run_policy(AckPolicy::PersistedByQuorum);

    let a_subset_ack_genuinely_loses_the_write_on_leader_destruction = !subset_survives;
    let b_leader_only_durable_ack_also_genuinely_loses_the_write = !leader_survives;
    let c_quorum_persisted_ack_genuinely_survives_leader_destruction = quorum_survives;
    let d_quorum_threshold_matches_real_majority_arithmetic =
        quorum_threshold == quorum_size(NUM_NODES);

    println!("subset_threshold {subset_threshold}");
    println!("subset_held_by {}", subset_held_by.len());
    println!("subset_survives {subset_survives}");
    println!("leader_threshold {leader_threshold}");
    println!("leader_held_by {}", leader_held_by.len());
    println!("leader_survives {leader_survives}");
    println!("quorum_threshold {quorum_threshold}");
    println!("quorum_held_by {}", quorum_held_by.len());
    println!("quorum_survives {quorum_survives}");
    println!(
        "a_subset_ack_genuinely_loses_the_write_on_leader_destruction {a_subset_ack_genuinely_loses_the_write_on_leader_destruction}"
    );
    println!(
        "b_leader_only_durable_ack_also_genuinely_loses_the_write {b_leader_only_durable_ack_also_genuinely_loses_the_write}"
    );
    println!(
        "c_quorum_persisted_ack_genuinely_survives_leader_destruction {c_quorum_persisted_ack_genuinely_survives_leader_destruction}"
    );
    println!(
        "d_quorum_threshold_matches_real_majority_arithmetic {d_quorum_threshold_matches_real_majority_arithmetic}"
    );
}
