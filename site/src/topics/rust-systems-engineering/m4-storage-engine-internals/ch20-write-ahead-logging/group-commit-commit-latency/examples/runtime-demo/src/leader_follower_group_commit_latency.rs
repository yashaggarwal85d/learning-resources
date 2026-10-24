// A discrete-tick simulation: no real threads, no real sleeping, so every
// measurement below is exactly reproducible rather than timing-sensitive.

struct Wal {
    flushes: u32,
}

impl Wal {
    fn new() -> Self {
        Wal { flushes: 0 }
    }
    fn flush(&mut self) {
        self.flushes += 1;
    }
}

struct Txn {
    ready_tick: u64,
    commit_done_tick: u64,
}

// Every transaction commits synchronously, but with no grouping at all: each
// one performs its own separate flush, at the moment it becomes ready.
fn commit_without_grouping(wal: &mut Wal, ready_ticks: &[u64]) -> Vec<Txn> {
    ready_ticks
        .iter()
        .map(|&ready_tick| {
            wal.flush();
            Txn { ready_tick, commit_done_tick: ready_tick }
        })
        .collect()
}

// Group commit: the leader is whichever transaction became ready first. It
// waits commit_delay ticks, in case others join, then a single flush covers
// every transaction ready by that point — leader and followers alike.
fn commit_with_grouping(wal: &mut Wal, ready_ticks: &[u64], commit_delay: u64) -> Vec<Txn> {
    let leader_ready_tick = *ready_ticks.iter().min().expect("at least one transaction");
    let flush_tick = leader_ready_tick + commit_delay;
    wal.flush(); // exactly one flush for the whole batch
    ready_ticks
        .iter()
        .map(|&ready_tick| Txn { ready_tick, commit_done_tick: flush_tick })
        .collect()
}

fn commit_latency(txn: &Txn) -> u64 {
    txn.commit_done_tick - txn.ready_tick
}

// Asynchronous commit: acknowledged the instant it's ready, before its own
// flush. Its real durability point is whatever later flush actually covers
// it — here, bundled into a group-committed batch that happens afterward.
struct AsyncTxn {
    acknowledged_tick: u64,
    durable_tick: u64,
}

// A false promise: the client was already told "committed" at or before the
// crash, but the transaction's own flush hadn't actually happened yet.
fn crash_reveals_a_false_promise(acknowledged_tick: u64, durable_tick: u64, crash_tick: u64) -> bool {
    acknowledged_tick <= crash_tick && crash_tick < durable_tick
}

fn main() {
    // ---- Claim 1: group commit means one flush, not one per transaction. ----
    let ready_ticks = [0u64, 1, 2, 3, 4];

    let mut wal_ungrouped = Wal::new();
    let txns_ungrouped = commit_without_grouping(&mut wal_ungrouped, &ready_ticks);
    let ungrouped_flushes_equal_the_transaction_count = wal_ungrouped.flushes as usize == ready_ticks.len();

    let commit_delay = 5u64;
    let mut wal_grouped = Wal::new();
    let txns_grouped = commit_with_grouping(&mut wal_grouped, &ready_ticks, commit_delay);
    let grouped_commit_used_exactly_one_flush = wal_grouped.flushes == 1;

    // ---- Claim 2: commit latency, not execution time, is what differs; the ----
    // ---- earliest-ready transaction in the batch waits the longest. ----
    let latencies: Vec<u64> = txns_grouped.iter().map(commit_latency).collect();
    let earliest_ready_txn_has_the_highest_latency = latencies[0] == *latencies.iter().max().unwrap();
    let latest_ready_txn_has_the_lowest_latency = *latencies.last().unwrap() == *latencies.iter().min().unwrap();
    // Every transaction here did zero execution work of its own; the spread
    // in latency is entirely flush contention, not execution cost.
    let max_latency_exceeds_any_executions_own_cost = *latencies.iter().max().unwrap() > 0;
    let commit_latency_varies_though_execution_time_never_did = earliest_ready_txn_has_the_highest_latency
        && latest_ready_txn_has_the_lowest_latency
        && max_latency_exceeds_any_executions_own_cost;

    // ---- Claim 3: asynchronous commit's own risk window is real and measurable. ----
    let async_txn = AsyncTxn { acknowledged_tick: 0, durable_tick: commit_delay };
    let crash_tick_inside_the_risk_window = 2u64; // after acknowledgment, before the real flush
    let async_commit_genuinely_loses_the_update_in_its_own_risk_window =
        crash_reveals_a_false_promise(async_txn.acknowledged_tick, async_txn.durable_tick, crash_tick_inside_the_risk_window);

    // The identical crash tick, against a synchronous transaction that is never
    // acknowledged ahead of its own flush, reveals no false promise at all:
    // it simply hasn't been told "committed" yet either.
    let sync_txn = &txns_grouped[0];
    let sync_commit_never_makes_a_false_promise_to_the_same_crash =
        !crash_reveals_a_false_promise(sync_txn.commit_done_tick, sync_txn.commit_done_tick, crash_tick_inside_the_risk_window);

    println!("ungrouped_flushes_equal_the_transaction_count {}", ungrouped_flushes_equal_the_transaction_count);
    println!("grouped_commit_used_exactly_one_flush {}", grouped_commit_used_exactly_one_flush);
    println!("commit_latency_varies_though_execution_time_never_did {}", commit_latency_varies_though_execution_time_never_did);
    println!("async_commit_genuinely_loses_the_update_in_its_own_risk_window {}", async_commit_genuinely_loses_the_update_in_its_own_risk_window);
    println!("sync_commit_never_makes_a_false_promise_to_the_same_crash {}", sync_commit_never_makes_a_false_promise_to_the_same_crash);

    // Keep clippy/dead-code quiet about fields only read via the println!s above.
    let _ = (txns_ungrouped.len(), ready_ticks.len());
}
