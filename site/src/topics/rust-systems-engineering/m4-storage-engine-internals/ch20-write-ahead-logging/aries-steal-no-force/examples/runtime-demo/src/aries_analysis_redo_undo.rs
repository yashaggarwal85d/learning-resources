use std::collections::HashMap;

#[derive(Clone, Copy, PartialEq, Debug)]
enum Kind {
    Update,
    Commit,
    Clr,
}

#[derive(Clone, Copy)]
struct Record {
    lsn: u64,
    kind: Kind,
    txn_id: u32,
    page_id: usize,
    before: u8,
    after: u8,
    // This record's own transaction's immediately preceding log record, or 0 for none.
    // CLR-only: where undo should resume once this CLR's own undo is considered done.
    prev_lsn: u64,
    undo_next_lsn: u64,
}

struct Wal {
    records: Vec<Record>,
    next_lsn: u64,
}

impl Wal {
    fn new() -> Self {
        Wal { records: Vec::new(), next_lsn: 1 }
    }
    fn push(&mut self, mut r: Record) -> u64 {
        let lsn = self.next_lsn;
        self.next_lsn += 1;
        r.lsn = lsn;
        self.records.push(r);
        lsn
    }
    fn get(&self, lsn: u64) -> Record {
        *self.records.iter().find(|r| r.lsn == lsn).expect("lsn must exist")
    }
}

#[derive(Clone, Copy, Default)]
struct Page {
    value: u8,
    lsn: u64,
}

fn log_update(wal: &mut Wal, last_lsn: &mut HashMap<u32, u64>, txn_id: u32, page_id: usize, before: u8, after: u8) -> u64 {
    let prev_lsn = *last_lsn.get(&txn_id).unwrap_or(&0);
    let lsn = wal.push(Record { lsn: 0, kind: Kind::Update, txn_id, page_id, before, after, prev_lsn, undo_next_lsn: 0 });
    last_lsn.insert(txn_id, lsn);
    lsn
}

fn log_commit(wal: &mut Wal, last_lsn: &mut HashMap<u32, u64>, txn_id: u32) -> u64 {
    let prev_lsn = *last_lsn.get(&txn_id).unwrap_or(&0);
    let lsn = wal.push(Record { lsn: 0, kind: Kind::Commit, txn_id, page_id: 0, before: 0, after: 0, prev_lsn, undo_next_lsn: 0 });
    last_lsn.remove(&txn_id); // committed: no longer a candidate for undo
    lsn
}

// Redo is the same idempotent rule the previous topic measured: a page already at or
// past a record's own LSN is left alone. Only records at or after `start_lsn` are even
// considered, which is what lets a checkpoint bound how much of the log redo must visit.
fn redo_from(wal: &Wal, start_lsn: u64, pages: &mut HashMap<usize, Page>) -> usize {
    let mut visited = 0;
    for r in wal.records.iter().filter(|r| r.lsn >= start_lsn && (r.kind == Kind::Update || r.kind == Kind::Clr)) {
        visited += 1;
        let page = pages.entry(r.page_id).or_insert(Page::default());
        if page.lsn < r.lsn {
            page.value = r.after;
            page.lsn = r.lsn;
        }
    }
    visited
}

// Analysis: scan the whole log, and for every transaction that never committed, report
// the LSN of its own most recent record (an Update, or a CLR if undo already started on
// a previous recovery attempt) — exactly the point undo needs to resume from.
fn analysis(wal: &Wal) -> (std::collections::HashSet<u32>, HashMap<u32, u64>) {
    let mut committed = std::collections::HashSet::new();
    let mut last_lsn: HashMap<u32, u64> = HashMap::new();
    for r in &wal.records {
        match r.kind {
            Kind::Commit => {
                committed.insert(r.txn_id);
                last_lsn.remove(&r.txn_id);
            }
            Kind::Update | Kind::Clr => {
                last_lsn.insert(r.txn_id, r.lsn);
            }
        }
    }
    (committed, last_lsn)
}

// Undo a loser transaction, following its own chain of prior records backward. A CLR
// encountered along the way is never itself undone (ARIES's own rule): it just points
// undo onward to whatever still needs undoing, which is what bounds the work across a
// second crash instead of repeating it.
fn undo_one_txn(wal: &mut Wal, txn_id: u32, start_cursor: u64, pages: &mut HashMap<usize, Page>) -> u32 {
    let mut cursor = start_cursor;
    let mut clrs_written = 0;
    while cursor != 0 {
        let rec = wal.get(cursor);
        match rec.kind {
            Kind::Clr => {
                cursor = rec.undo_next_lsn;
            }
            Kind::Update => {
                let page = pages.entry(rec.page_id).or_insert(Page::default());
                page.value = rec.before;
                let clr_lsn = wal.push(Record {
                    lsn: 0,
                    kind: Kind::Clr,
                    txn_id,
                    page_id: rec.page_id,
                    before: rec.after,
                    after: rec.before,
                    prev_lsn: cursor,
                    undo_next_lsn: rec.prev_lsn,
                });
                page.lsn = clr_lsn;
                clrs_written += 1;
                cursor = rec.prev_lsn;
            }
            Kind::Commit => unreachable!("a committed transaction is never undone"),
        }
    }
    clrs_written
}

fn main() {
    // ---- Build the log: T1 commits; T2 never does. ----
    let mut wal = Wal::new();
    let mut last_lsn: HashMap<u32, u64> = HashMap::new();
    const T1: u32 = 1;
    const T2: u32 = 2;
    const PAGE_A: usize = 1;
    const PAGE_B: usize = 2;
    const PAGE_C: usize = 3;

    log_update(&mut wal, &mut last_lsn, T1, PAGE_A, 0, 9); // lsn 1
    log_commit(&mut wal, &mut last_lsn, T1); // lsn 2 — T1's page A is now durably flushed
    let checkpoint_redo_lsn = wal.next_lsn; // the fuzzy checkpoint: no dirty pages remain, so redo need not look before here
    log_update(&mut wal, &mut last_lsn, T2, PAGE_B, 0, 5); // lsn 3
    log_update(&mut wal, &mut last_lsn, T2, PAGE_C, 0, 7); // lsn 4
    // Crash. T2 never commits.

    // ---- Claim 1: redo reapplies every update, committed or not; only undo removes a loser's. ----
    let mut pages_full: HashMap<usize, Page> = HashMap::new();
    pages_full.insert(PAGE_A, Page { value: 0, lsn: 0 }); // pretend nothing is known to be on disk yet
    let full_scan_visited = redo_from(&wal, 1, &mut pages_full);
    let redo_reapplies_the_losers_updates_too =
        pages_full[&PAGE_A].value == 9 && pages_full[&PAGE_B].value == 5 && pages_full[&PAGE_C].value == 7;

    // ---- Claim 2 setup: a fuzzy checkpoint lets redo skip already-durable, older records. ----
    let mut pages_bounded: HashMap<usize, Page> = HashMap::new();
    pages_bounded.insert(PAGE_A, Page { value: 9, lsn: 1 }); // this IS what's actually on disk already
    let bounded_scan_visited = redo_from(&wal, checkpoint_redo_lsn, &mut pages_bounded);
    let checkpoint_bounded_redo_visited_fewer_records = bounded_scan_visited < full_scan_visited;
    let checkpoint_bounded_redo_reached_the_identical_state = pages_bounded[&PAGE_A].value == pages_full[&PAGE_A].value
        && pages_bounded[&PAGE_B].value == pages_full[&PAGE_B].value
        && pages_bounded[&PAGE_C].value == pages_full[&PAGE_C].value;

    // ---- Claim 3: a second crash partway through undo doesn't repeat or skip any of it. ----
    // First analysis identifies T2 as the one loser, resuming from its own last record.
    let (_, losers) = analysis(&wal);
    let t2_cursor = losers[&T2];
    // Undo one step only (page C), then "crash": the in-memory pages are discarded, but
    // the CLR already written to the log survives.
    let mut pages_for_undo = pages_full.clone();
    let clrs_first_attempt = undo_one_txn_bounded(&mut wal, T2, t2_cursor, &mut pages_for_undo, 1);
    drop(pages_for_undo); // the crash: this in-memory page state is gone

    // A fresh recovery from scratch: redo the now-longer log, then resume T2's own undo.
    let mut pages_after_second_crash: HashMap<usize, Page> = HashMap::new();
    pages_after_second_crash.insert(PAGE_A, Page { value: 0, lsn: 0 });
    redo_from(&wal, 1, &mut pages_after_second_crash);
    let (_, losers_again) = analysis(&wal);
    let t2_resume_cursor = losers_again[&T2];
    let clrs_second_attempt = undo_one_txn(&mut wal, T2, t2_resume_cursor, &mut pages_after_second_crash);

    let total_clrs_for_t2 = clrs_first_attempt + clrs_second_attempt;
    let undo_was_not_repeated_or_skipped = total_clrs_for_t2 == 2; // exactly T2's own two updates, once each
    let page_c_has_exactly_one_clr = wal.records.iter().filter(|r| r.kind == Kind::Clr && r.page_id == PAGE_C).count() == 1;
    let final_state_matches_an_uninterrupted_undo = pages_after_second_crash[&PAGE_A].value == 9
        && pages_after_second_crash[&PAGE_B].value == 0
        && pages_after_second_crash[&PAGE_C].value == 0;

    println!("redo_reapplies_the_losers_updates_too {}", redo_reapplies_the_losers_updates_too);
    println!("checkpoint_bounded_redo_visited_fewer_records {}", checkpoint_bounded_redo_visited_fewer_records);
    println!("checkpoint_bounded_redo_reached_the_identical_state {}", checkpoint_bounded_redo_reached_the_identical_state);
    println!("undo_was_not_repeated_or_skipped {}", undo_was_not_repeated_or_skipped);
    println!("page_c_has_exactly_one_clr {}", page_c_has_exactly_one_clr);
    println!("final_state_matches_an_uninterrupted_undo {}", final_state_matches_an_uninterrupted_undo);
}

// Like undo_one_txn, but stops after writing `max_steps` CLRs, standing in for a crash
// that interrupts undo partway through.
fn undo_one_txn_bounded(wal: &mut Wal, txn_id: u32, start_cursor: u64, pages: &mut HashMap<usize, Page>, max_steps: u32) -> u32 {
    let mut cursor = start_cursor;
    let mut clrs_written = 0;
    while cursor != 0 && clrs_written < max_steps {
        let rec = wal.get(cursor);
        match rec.kind {
            Kind::Clr => {
                cursor = rec.undo_next_lsn;
            }
            Kind::Update => {
                let page = pages.entry(rec.page_id).or_insert(Page::default());
                page.value = rec.before;
                let clr_lsn = wal.push(Record {
                    lsn: 0,
                    kind: Kind::Clr,
                    txn_id,
                    page_id: rec.page_id,
                    before: rec.after,
                    after: rec.before,
                    prev_lsn: cursor,
                    undo_next_lsn: rec.prev_lsn,
                });
                page.lsn = clr_lsn;
                clrs_written += 1;
                cursor = rec.prev_lsn;
            }
            Kind::Commit => unreachable!("a committed transaction is never undone"),
        }
    }
    clrs_written
}
