// A real toy partitioned log: several partitions, each its own ordered,
// append-only vector of entries, and a real key-based partitioning function
// routing each write by hash(key) % N. Measures that per-key order is
// genuinely preserved only as long as a key keeps mapping to the identical
// partition, and that changing N genuinely re-routes existing keys.

#[derive(Clone, Debug, PartialEq, Eq)]
struct Entry {
    key: String,
    global_seq: u64,
    value: u64,
}

// A plain, deterministic string hash (FNV-1a), so partition routing is
// stable across runs and platforms rather than depending on a std hasher
// whose output is explicitly not guaranteed stable across versions.
fn fnv1a_hash(key: &str) -> u64 {
    let mut hash: u64 = 0xcbf29ce484222325;
    for byte in key.as_bytes() {
        hash ^= *byte as u64;
        hash = hash.wrapping_mul(0x100000001b3);
    }
    hash
}

fn partition_for(key: &str, partition_count: usize) -> usize {
    (fnv1a_hash(key) % partition_count as u64) as usize
}

struct PartitionedLog {
    partitions: Vec<Vec<Entry>>,
}

impl PartitionedLog {
    fn new(partition_count: usize) -> Self {
        PartitionedLog { partitions: vec![Vec::new(); partition_count] }
    }

    fn partition_count(&self) -> usize {
        self.partitions.len()
    }

    // A real append: route by the key, then push onto that partition's own
    // ordered, append-only vector. Returns the partition index it landed in.
    fn append(&mut self, key: &str, global_seq: u64, value: u64) -> usize {
        let idx = partition_for(key, self.partition_count());
        self.partitions[idx].push(Entry { key: key.to_string(), global_seq, value });
        idx
    }

    fn entries_for_key(&self, key: &str, partition_idx: usize) -> Vec<&Entry> {
        self.partitions[partition_idx].iter().filter(|e| e.key == key).collect()
    }
}

fn main() {
    // ---- Scenario A: many writes to the same keys, interleaved, all land ----
    // ---- in the identical partition every time, in the identical relative ----
    // ---- order they were written. ----
    let initial_partition_count = 4usize;
    let mut log = PartitionedLog::new(initial_partition_count);
    let keys = ["order-77", "order-81", "order-14", "order-39", "order-02"];
    let writes_per_key = 20u64;

    let mut routed_partition: Vec<usize> = Vec::new();
    let mut global_seq = 0u64;
    for round in 0..writes_per_key {
        for key in keys.iter() {
            let idx = log.append(key, global_seq, round);
            global_seq += 1;
            if round == 0 {
                routed_partition.push(idx);
            }
        }
    }

    let scenario_a_same_key_always_same_partition = keys.iter().enumerate().all(|(i, key)| {
        let expected = routed_partition[i];
        (0..writes_per_key).all(|_| partition_for(key, initial_partition_count) == expected)
    });

    let scenario_a_relative_order_preserved = keys.iter().enumerate().all(|(i, key)| {
        let entries = log.entries_for_key(key, routed_partition[i]);
        entries.len() as u64 == writes_per_key
            && entries.windows(2).all(|pair| pair[0].global_seq < pair[1].global_seq)
            && entries.iter().enumerate().all(|(j, e)| e.value == j as u64)
    });

    // ---- Scenario B: changing the partition count genuinely re-routes at ----
    // ---- least one existing key to a different partition. ----
    let new_partition_count = 6usize;
    let reroute: Vec<(String, usize, usize)> = keys
        .iter()
        .enumerate()
        .map(|(i, key)| {
            let old_idx = routed_partition[i];
            let new_idx = partition_for(key, new_partition_count);
            (key.to_string(), old_idx, new_idx)
        })
        .collect();

    let scenario_b_at_least_one_key_is_rerouted = reroute.iter().any(|(_, old_idx, new_idx)| old_idx != new_idx);
    let rerouted_key = reroute.iter().find(|(_, old_idx, new_idx)| old_idx != new_idx).cloned();

    // ---- Scenario C: continuing to write for a rerouted key under the new ----
    // ---- partition count genuinely splits that key's own history across ----
    // ---- two different partitions, breaking the single-partition order ----
    // ---- guarantee it had before the partition count changed. ----
    let scenario_c_rerouted_key_history_splits_across_partitions = match &rerouted_key {
        Some((key, old_idx, new_idx)) => {
            let mut log_after_resize = PartitionedLog::new(new_partition_count);
            // Re-point the old partition's own prior entries into the new
            // log's own identical old index, exactly as a real system would
            // leave already-written segments in place on a resize.
            log_after_resize.partitions[*old_idx] = log.partitions[*old_idx].clone();
            let pre_change_count = log_after_resize.entries_for_key(key, *old_idx).len();

            log_after_resize.append(key, global_seq, 999);
            global_seq += 1;
            log_after_resize.append(key, global_seq, 1000);

            let post_change_in_old_partition = log_after_resize.entries_for_key(key, *old_idx).len();
            let post_change_in_new_partition = log_after_resize.entries_for_key(key, *new_idx).len();

            pre_change_count as u64 == writes_per_key
                && post_change_in_old_partition as u64 == writes_per_key // no new entry reached the old partition
                && post_change_in_new_partition == 2 // the new writes landed in a different partition instead
                && old_idx != new_idx
        }
        None => false,
    };

    println!("initial_partition_count {}", initial_partition_count);
    println!("new_partition_count {}", new_partition_count);
    println!("scenario_a_same_key_always_same_partition {}", scenario_a_same_key_always_same_partition);
    println!("scenario_a_relative_order_preserved {}", scenario_a_relative_order_preserved);
    println!("scenario_b_at_least_one_key_is_rerouted {}", scenario_b_at_least_one_key_is_rerouted);
    println!(
        "scenario_c_rerouted_key_history_splits_across_partitions {}",
        scenario_c_rerouted_key_history_splits_across_partitions
    );

    let a_per_key_order_is_genuinely_preserved_while_partition_count_is_fixed =
        scenario_a_same_key_always_same_partition && scenario_a_relative_order_preserved;
    let b_changing_partition_count_genuinely_reroutes_at_least_one_existing_key = scenario_b_at_least_one_key_is_rerouted;
    let c_a_rerouted_key_genuinely_loses_its_single_partition_order_guarantee = scenario_c_rerouted_key_history_splits_across_partitions;

    println!(
        "a_per_key_order_is_genuinely_preserved_while_partition_count_is_fixed {}",
        a_per_key_order_is_genuinely_preserved_while_partition_count_is_fixed
    );
    println!(
        "b_changing_partition_count_genuinely_reroutes_at_least_one_existing_key {}",
        b_changing_partition_count_genuinely_reroutes_at_least_one_existing_key
    );
    println!(
        "c_a_rerouted_key_genuinely_loses_its_single_partition_order_guarantee {}",
        c_a_rerouted_key_genuinely_loses_its_single_partition_order_guarantee
    );
}
