type Key = u32;
type TxnId = u64;

#[derive(Clone)]
struct ReadRecord {
    key: Key,
    value_seen: bool,
}

#[derive(Clone)]
struct WriteRecord {
    key: Key,
    new_value: bool,
}

struct Txn {
    #[allow(dead_code)]
    id: TxnId,
    reads: Vec<ReadRecord>,
    writes: Vec<WriteRecord>,
}

// Snapshot isolation's own commit rule: two transactions conflict only when
// they write the SAME key (first-committer-wins); disjoint writes are let
// through with no further check at all.
fn si_write_write_conflict(a: &Txn, b: &Txn) -> bool {
    a.writes.iter().any(|wa| b.writes.iter().any(|wb| wb.key == wa.key))
}

// The stricter, dependency-graph check (Adya's own formalism): a
// rw-antidependency edge runs from a transaction to the one whose write
// invalidates something it read. Two such edges running in opposite
// directions between the identical pair of transactions form exactly the
// "dangerous structure" write skew produces, and flag the pair as unsafe.
fn rw_antidependency(from: &Txn, to: &Txn) -> bool {
    from.reads
        .iter()
        .any(|r| to.writes.iter().any(|w| w.key == r.key && w.new_value != r.value_seen))
}

fn dangerous_structure(a: &Txn, b: &Txn) -> bool {
    rw_antidependency(a, b) && rw_antidependency(b, a)
}

fn main() {
    // Two on-call doctors; the shared invariant is "at least one of them is
    // on call." Both start on call.
    let db: [bool; 2] = [true, true];

    // Transaction A reads doctor 1's row, decides (correctly, given what it
    // sees) that it's safe to go off call, and writes doctor 0's row.
    let txn_a = Txn {
        id: 1,
        reads: vec![ReadRecord { key: 1, value_seen: db[1] }],
        writes: vec![WriteRecord { key: 0, new_value: false }],
    };
    // Transaction B, concurrently, reads doctor 0's row, makes the identical
    // kind of decision, and writes doctor 1's row.
    let txn_b = Txn {
        id: 2,
        reads: vec![ReadRecord { key: 0, value_seen: db[0] }],
        writes: vec![WriteRecord { key: 1, new_value: false }],
    };

    let mut final_db = db;
    for w in &txn_a.writes {
        final_db[w.key as usize] = w.new_value;
    }
    for w in &txn_b.writes {
        final_db[w.key as usize] = w.new_value;
    }

    let invariant_held_before = db[0] || db[1];
    let invariant_holds_after = final_db[0] || final_db[1];
    let no_write_write_conflict = !si_write_write_conflict(&txn_a, &txn_b);

    // Claim: snapshot isolation genuinely permits this anomaly through.
    let a_write_skew_permitted_under_si =
        no_write_write_conflict && invariant_held_before && !invariant_holds_after;

    // Claim: the stricter, dependency-graph check genuinely detects and
    // would reject this exact history.
    let b_stricter_check_detects_the_anomaly = dangerous_structure(&txn_a, &txn_b);

    // Control: two transactions over entirely independent keys, with no
    // cross-reads at all, should NOT be flagged — confirming the check
    // isn't simply always true.
    let txn_c = Txn {
        id: 3,
        reads: vec![ReadRecord { key: 2, value_seen: true }],
        writes: vec![WriteRecord { key: 2, new_value: false }],
    };
    let txn_d = Txn {
        id: 4,
        reads: vec![ReadRecord { key: 3, value_seen: true }],
        writes: vec![WriteRecord { key: 3, new_value: false }],
    };
    let c_stricter_check_correctly_passes_independent_transactions =
        !dangerous_structure(&txn_c, &txn_d);

    println!("invariant_held_before {}", invariant_held_before);
    println!("invariant_holds_after {}", invariant_holds_after);
    println!("no_write_write_conflict {}", no_write_write_conflict);
    println!("a_write_skew_permitted_under_si {}", a_write_skew_permitted_under_si);
    println!("b_stricter_check_detects_the_anomaly {}", b_stricter_check_detects_the_anomaly);
    println!(
        "c_stricter_check_correctly_passes_independent_transactions {}",
        c_stricter_check_correctly_passes_independent_transactions
    );
}
