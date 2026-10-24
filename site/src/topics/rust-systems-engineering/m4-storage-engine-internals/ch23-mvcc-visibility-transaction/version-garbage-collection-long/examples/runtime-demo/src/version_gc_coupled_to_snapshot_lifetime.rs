type TxnId = u64;

#[derive(Clone)]
struct Version {
    #[allow(dead_code)]
    xmin: TxnId,
    xmax: Option<TxnId>,
}

struct VersionChain {
    versions: Vec<Version>,
}

impl VersionChain {
    fn new() -> Self {
        Self { versions: Vec::new() }
    }

    fn insert(&mut self, xmin: TxnId) {
        self.versions.push(Version { xmin, xmax: None });
    }

    fn update(&mut self, deleter: TxnId) {
        if let Some(v) = self.versions.iter_mut().rev().find(|v| v.xmax.is_none()) {
            v.xmax = Some(deleter);
        }
        self.versions.push(Version { xmin: deleter, xmax: None });
    }

    fn len(&self) -> usize {
        self.versions.len()
    }

    // A version is reclaimable once no open snapshot's own horizon could
    // possibly still need it: its own deleting transaction must be older
    // than every currently open snapshot. Returns how many were reclaimed.
    fn gc(&mut self, horizon: TxnId) -> usize {
        let before = self.versions.len();
        self.versions.retain(|v| match v.xmax {
            None => true,
            Some(xmax) => xmax >= horizon,
        });
        before - self.versions.len()
    }
}

struct TxnManager {
    next_xid: TxnId,
}

impl TxnManager {
    fn new() -> Self {
        Self { next_xid: 1 }
    }

    fn begin(&mut self) -> TxnId {
        let id = self.next_xid;
        self.next_xid += 1;
        id
    }
}

// The real xmin horizon: the oldest transaction id any currently open
// snapshot still depends on. With no open snapshots at all, nothing holds
// anything back, so the horizon is simply "everything so far."
fn horizon(open_snapshots: &[TxnId], next_xid: TxnId) -> TxnId {
    *open_snapshots.iter().min().unwrap_or(&next_xid)
}

fn main() {
    // Scenario A: a short-lived reader. It opens a snapshot right after the
    // row is inserted, then closes it again before any further updates run.
    let mut txns_a = TxnManager::new();
    let mut chain_a = VersionChain::new();
    let a1 = txns_a.begin();
    chain_a.insert(a1);
    let reader_a = txns_a.begin();
    let mut open_a: Vec<TxnId> = vec![reader_a];

    let a2 = txns_a.begin();
    chain_a.update(a2);
    // The reader closes here, before any of the remaining updates run.
    open_a.clear();

    let a3 = txns_a.begin();
    chain_a.update(a3);
    let a4 = txns_a.begin();
    chain_a.update(a4);
    let a5 = txns_a.begin();
    chain_a.update(a5);

    let horizon_short = horizon(&open_a, txns_a.next_xid);
    let reclaimed_short = chain_a.gc(horizon_short);
    let retained_short = chain_a.len();

    // Scenario B: the identical workload, but the reader's snapshot never
    // closes at all.
    let mut txns_b = TxnManager::new();
    let mut chain_b = VersionChain::new();
    let b1 = txns_b.begin();
    chain_b.insert(b1);
    let reader_b = txns_b.begin();
    let open_b: Vec<TxnId> = vec![reader_b];

    let b2 = txns_b.begin();
    chain_b.update(b2);
    let b3 = txns_b.begin();
    chain_b.update(b3);
    let b4 = txns_b.begin();
    chain_b.update(b4);
    let b5 = txns_b.begin();
    chain_b.update(b5);

    let horizon_long = horizon(&open_b, txns_b.next_xid);
    let reclaimed_long = chain_b.gc(horizon_long);
    let retained_long = chain_b.len();

    // Claim: while the long-lived reader stays open, nothing newer than it
    // gets reclaimed at all, not even versions it never directly reads.
    let a_long_lived_reader_blocks_all_reclaim = reclaimed_long == 0;

    // Claim: on the identical workload, once that reader closes instead,
    // the dead versions it was pinning genuinely become reclaimable.
    let b_closing_the_reader_frees_dead_versions = reclaimed_short > 0;

    // Claim: the long-lived reader retains genuinely more versions than the
    // short-lived one, on the identical workload.
    let c_long_lived_reader_retains_more_versions = retained_long > retained_short;

    println!("retained_short {}", retained_short);
    println!("retained_long {}", retained_long);
    println!("reclaimed_short {}", reclaimed_short);
    println!("reclaimed_long {}", reclaimed_long);
    println!("a_long_lived_reader_blocks_all_reclaim {}", a_long_lived_reader_blocks_all_reclaim);
    println!("b_closing_the_reader_frees_dead_versions {}", b_closing_the_reader_frees_dead_versions);
    println!("c_long_lived_reader_retains_more_versions {}", c_long_lived_reader_retains_more_versions);
}
