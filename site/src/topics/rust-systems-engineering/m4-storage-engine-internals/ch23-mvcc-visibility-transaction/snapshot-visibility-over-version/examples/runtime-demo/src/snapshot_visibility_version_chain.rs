use std::collections::HashSet;

type TxnId = u64;

#[derive(Clone, Debug, PartialEq)]
struct Version {
    xmin: TxnId,
    xmax: Option<TxnId>,
    value: i64,
}

#[derive(Clone)]
struct Snapshot {
    xid: TxnId,
    committed: HashSet<TxnId>,
}

impl Snapshot {
    fn visible(&self, v: &Version) -> bool {
        let xmin_visible = v.xmin == self.xid || self.committed.contains(&v.xmin);
        if !xmin_visible {
            return false;
        }
        match v.xmax {
            None => true,
            Some(xmax) => {
                if xmax == self.xid {
                    false
                } else {
                    !self.committed.contains(&xmax)
                }
            }
        }
    }
}

struct VersionChain {
    versions: Vec<Version>,
}

impl VersionChain {
    fn new() -> Self {
        Self { versions: Vec::new() }
    }

    fn insert(&mut self, xmin: TxnId, value: i64) {
        self.versions.push(Version { xmin, xmax: None, value });
    }

    // A logical update never mutates an existing version's own fields (beyond
    // stamping xmax on the one it supersedes): it marks the current undeleted
    // version as deleted by this transaction, then appends a brand-new version.
    fn update(&mut self, deleter: TxnId, new_value: i64) {
        if let Some(v) = self.versions.iter_mut().rev().find(|v| v.xmax.is_none()) {
            v.xmax = Some(deleter);
        }
        self.versions.push(Version { xmin: deleter, xmax: None, value: new_value });
    }

    fn visible_version(&self, snap: &Snapshot) -> Option<&Version> {
        self.versions.iter().rev().find(|v| snap.visible(v))
    }

    fn newest_value(&self) -> i64 {
        self.versions.last().unwrap().value
    }
}

struct TxnManager {
    next_xid: TxnId,
    committed: HashSet<TxnId>,
}

impl TxnManager {
    fn new() -> Self {
        Self { next_xid: 1, committed: HashSet::new() }
    }

    fn begin(&mut self) -> TxnId {
        let id = self.next_xid;
        self.next_xid += 1;
        id
    }

    fn commit(&mut self, xid: TxnId) {
        self.committed.insert(xid);
    }

    fn snapshot(&self, xid: TxnId) -> Snapshot {
        Snapshot { xid, committed: self.committed.clone() }
    }
}

fn main() {
    // Claim: visibility is a function of version metadata plus the reader's
    // snapshot, never "the newest row" — a reader holding an older snapshot
    // keeps seeing an older version even while a newer, uncommitted version
    // already sits at the end of the chain.
    let mut txns = TxnManager::new();
    let mut chain = VersionChain::new();

    let t1 = txns.begin();
    chain.insert(t1, 100);
    txns.commit(t1);

    let reader = txns.begin();
    let reader_snapshot = txns.snapshot(reader);

    let t2 = txns.begin();
    chain.update(t2, 200);
    // t2 has NOT committed yet: the chain's own newest row already reads 200,
    // but no committed transaction has made that version visible to anyone.
    let newest_before_commit = chain.newest_value();
    let reader_sees_before_commit =
        chain.visible_version(&reader_snapshot).map(|v| v.value).unwrap();

    txns.commit(t2);
    let reader_sees_after_commit =
        chain.visible_version(&reader_snapshot).map(|v| v.value).unwrap();

    let fresh_after_commit = txns.begin();
    let fresh_snapshot = txns.snapshot(fresh_after_commit);
    let fresh_sees = chain.visible_version(&fresh_snapshot).map(|v| v.value).unwrap();

    let visibility_tracks_snapshot_not_newest_row = newest_before_commit != reader_sees_before_commit
        && reader_sees_before_commit == 100
        && reader_sees_after_commit == 100
        && fresh_sees == 200;

    // Claim: a writer creates a brand-new version instead of overwriting the
    // one an existing reader may still need; the superseded version's own
    // xmin and value are never touched, only its xmax is stamped.
    let superseded_before = chain.versions[0].clone();
    let chain_len_before_second_update = chain.versions.len();

    let t3 = txns.begin();
    chain.update(t3, 300);
    txns.commit(t3);

    let superseded_after = chain.versions[0].clone();
    let chain_len_after_second_update = chain.versions.len();

    let old_version_never_overwritten = superseded_before.xmin == superseded_after.xmin
        && superseded_before.value == superseded_after.value
        && chain_len_after_second_update == chain_len_before_second_update + 1;

    // Claim: a reader's snapshot, once taken, keeps returning the identical,
    // correct version across any number of further commits, so a long-lived
    // reader never has to block a writer and never sees a value "jump".
    let reader_sees_still = chain.visible_version(&reader_snapshot).map(|v| v.value).unwrap();
    let t4 = txns.begin();
    chain.update(t4, 400);
    txns.commit(t4);
    let reader_sees_after_two_more_commits =
        chain.visible_version(&reader_snapshot).map(|v| v.value).unwrap();
    let fresh_now = txns.begin();
    let fresh_now_snapshot = txns.snapshot(fresh_now);
    let fresh_now_sees = chain.visible_version(&fresh_now_snapshot).map(|v| v.value).unwrap();

    let long_lived_reader_stable = reader_sees_still == 100
        && reader_sees_after_two_more_commits == 100
        && fresh_now_sees == 400;

    println!("newest_before_commit {}", newest_before_commit);
    println!("reader_sees_before_commit {}", reader_sees_before_commit);
    println!("reader_sees_after_commit {}", reader_sees_after_commit);
    println!("fresh_sees {}", fresh_sees);
    println!("a_visibility_tracks_snapshot_not_newest_row {}", visibility_tracks_snapshot_not_newest_row);
    println!("b_old_version_never_overwritten {}", old_version_never_overwritten);
    println!("chain_len_before_second_update {}", chain_len_before_second_update);
    println!("chain_len_after_second_update {}", chain_len_after_second_update);
    println!("c_long_lived_reader_stable {}", long_lived_reader_stable);
    println!("reader_sees_after_two_more_commits {}", reader_sees_after_two_more_commits);
    println!("fresh_now_sees {}", fresh_now_sees);
}
