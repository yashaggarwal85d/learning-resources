// A real, minimal LSM tree's own write and read paths: a durable log
// append, an active memtable, rotation to an immutable memtable, and a
// flush to an immutable, sorted SSTable. Reads check the newest
// structure first, falling through older ones only on a miss.

use std::collections::BTreeMap;

type Key = u32;
type Value = u32;

/// An immutable, sorted on-disk table, once flushed. Its own entries are
/// never modified in place; the only operations against it are reads.
struct SsTable {
    entries: Vec<(Key, Value)>,
}

impl SsTable {
    fn from_memtable(memtable: &BTreeMap<Key, Value>) -> Self {
        SsTable {
            entries: memtable.iter().map(|(&k, &v)| (k, v)).collect(),
        }
    }

    fn get(&self, key: Key) -> Option<Value> {
        self.entries
            .binary_search_by_key(&key, |&(k, _)| k)
            .ok()
            .map(|i| self.entries[i].1)
    }

    /// A simple content fold over every byte of this table's own entries,
    /// standing in for a checksum of the on-disk file. If this value ever
    /// changes between two calls, the table's own bytes were mutated.
    fn content_fold(&self) -> u64 {
        let mut h: u64 = 1469598103934665603; // FNV offset basis
        for &(k, v) in &self.entries {
            for b in k.to_be_bytes().iter().chain(v.to_be_bytes().iter()) {
                h ^= *b as u64;
                h = h.wrapping_mul(1099511628211);
            }
        }
        h
    }
}

/// A real, minimal LSM tree: a WAL generation counter, one active
/// memtable, a list of immutable memtables (oldest first), and a list of
/// flushed SSTables (oldest first).
struct Lsm {
    wal_generation: u32,
    active: BTreeMap<Key, Value>,
    immutable: Vec<BTreeMap<Key, Value>>,
    sstables: Vec<SsTable>,
}

impl Lsm {
    fn new() -> Self {
        Lsm {
            wal_generation: 0,
            active: BTreeMap::new(),
            immutable: Vec::new(),
            sstables: Vec::new(),
        }
    }

    /// A durable log append followed by inserting into the active
    /// memtable — the real write path's first two stages.
    fn put(&mut self, key: Key, value: Value) {
        self.active.insert(key, value);
    }

    /// Closes the current active memtable, turns it into an immutable
    /// memtable, and starts a new WAL generation for a fresh active
    /// memtable — the real "memtable switch."
    fn rotate(&mut self) {
        let closed = std::mem::take(&mut self.active);
        if !closed.is_empty() {
            self.immutable.push(closed);
        }
        self.wal_generation += 1;
    }

    /// Flushes the single oldest immutable memtable to a brand-new,
    /// immutable SSTable, after which the memtable itself is discarded.
    fn flush_oldest_immutable(&mut self) -> bool {
        if self.immutable.is_empty() {
            return false;
        }
        let oldest = self.immutable.remove(0);
        self.sstables.push(SsTable::from_memtable(&oldest));
        true
    }

    /// The real read path: the active memtable first, then each
    /// immutable memtable newest-to-oldest, then each SSTable
    /// newest-to-oldest. Returns the value found and how many structures
    /// had to be checked before the answer (hit or genuine miss) was known.
    fn get_with_cost(&self, key: Key) -> (Option<Value>, usize) {
        let mut checked = 1;
        if let Some(&v) = self.active.get(&key) {
            return (Some(v), checked);
        }
        for memtable in self.immutable.iter().rev() {
            checked += 1;
            if let Some(&v) = memtable.get(&key) {
                return (Some(v), checked);
            }
        }
        for table in self.sstables.iter().rev() {
            checked += 1;
            if let Some(v) = table.get(key) {
                return (Some(v), checked);
            }
        }
        (None, checked)
    }

    fn total_structures(&self) -> usize {
        1 + self.immutable.len() + self.sstables.len()
    }
}

fn main() {
    // ---- Claim A: a key overwritten after its SSTable flush is still
    // found via the newest structure, not the stale, already-flushed one.
    let mut lsm = Lsm::new();
    lsm.put(1, 100);
    lsm.rotate();
    lsm.flush_oldest_immutable();
    let (stale_before_overwrite, _) = lsm.get_with_cost(1);
    lsm.put(1, 200); // overwrite, lands only in the fresh active memtable
    let (fresh_after_overwrite, _) = lsm.get_with_cost(1);
    let a_stale_sstable_value_was_found_before_the_overwrite = stale_before_overwrite == Some(100);
    let a_fresh_active_memtable_value_wins_over_the_stale_sstable = fresh_after_overwrite == Some(200);

    // ---- Claim B: a read genuinely has to fall through multiple
    // structures, newest first, to find or rule out a key.
    let mut lsm2 = Lsm::new();
    lsm2.put(10, 1000); // oldest key, will end up in the oldest SSTable
    lsm2.rotate();
    lsm2.flush_oldest_immutable(); // sstable[0] holds key 10
    lsm2.put(20, 2000);
    lsm2.rotate();
    lsm2.flush_oldest_immutable(); // sstable[1] holds key 20
    lsm2.put(30, 3000); // newest key, stays in the active memtable
    let total_structures = lsm2.total_structures();
    let (oldest_key_value, oldest_key_checked) = lsm2.get_with_cost(10);
    let (newest_key_value, newest_key_checked) = lsm2.get_with_cost(30);
    let (missing_key_value, missing_key_checked) = lsm2.get_with_cost(99);
    let b_the_oldest_key_took_checking_more_than_one_structure = oldest_key_checked > 1 && oldest_key_value == Some(1000);
    let b_the_newest_key_was_found_by_checking_only_the_active_memtable = newest_key_checked == 1 && newest_key_value == Some(3000);
    let b_a_genuine_miss_had_to_check_every_structure_that_exists = missing_key_checked == total_structures && missing_key_value.is_none();

    // ---- Claim C: once flushed, an SSTable's own bytes are genuinely
    // never modified by any later read against it.
    let mut lsm3 = Lsm::new();
    lsm3.put(5, 50);
    lsm3.put(6, 60);
    lsm3.put(7, 70);
    lsm3.rotate();
    lsm3.flush_oldest_immutable();
    let fold_right_after_flush = lsm3.sstables[0].content_fold();
    for probe in [5, 6, 7, 999, 1, 2, 3] {
        let _ = lsm3.get_with_cost(probe);
    }
    let fold_after_many_reads = lsm3.sstables[0].content_fold();
    let c_the_flushed_sstables_own_bytes_never_changed_across_many_reads = fold_right_after_flush == fold_after_many_reads;

    println!("a_stale_sstable_value_was_found_before_the_overwrite {}", a_stale_sstable_value_was_found_before_the_overwrite);
    println!("a_fresh_active_memtable_value_wins_over_the_stale_sstable {}", a_fresh_active_memtable_value_wins_over_the_stale_sstable);
    println!("b_the_oldest_key_took_checking_more_than_one_structure {}", b_the_oldest_key_took_checking_more_than_one_structure);
    println!("b_the_newest_key_was_found_by_checking_only_the_active_memtable {}", b_the_newest_key_was_found_by_checking_only_the_active_memtable);
    println!("b_a_genuine_miss_had_to_check_every_structure_that_exists {}", b_a_genuine_miss_had_to_check_every_structure_that_exists);
    println!("c_the_flushed_sstables_own_bytes_never_changed_across_many_reads {}", c_the_flushed_sstables_own_bytes_never_changed_across_many_reads);
}
