const PAGE_BYTES: usize = 64;

fn crc(data: &[u8; PAGE_BYTES]) -> u32 {
    data.iter().fold(2166136261u32, |acc, &b| (acc ^ b as u32).wrapping_mul(16777619))
}

#[derive(Clone, Copy)]
struct Page {
    lsn: u64,
    data: [u8; PAGE_BYTES],
    checksum: u32,
}

impl Page {
    fn new() -> Self {
        let data = [0u8; PAGE_BYTES];
        let checksum = crc(&data);
        Page { lsn: 0, data, checksum }
    }
    fn is_torn(&self) -> bool {
        crc(&self.data) != self.checksum
    }
}

struct LogRecord {
    lsn: u64,
    page_id: usize,
    // A full-page write: the record carries the whole new page image, not just a delta,
    // which is exactly what lets recovery fix a page torn by a partial write.
    full_page_image: [u8; PAGE_BYTES],
}

struct Wal {
    records: Vec<LogRecord>,
    next_lsn: u64,
}

impl Wal {
    fn new() -> Self {
        Wal { records: Vec::new(), next_lsn: 1 }
    }
    // Returns the record's own LSN once it has reached its durability point: this call
    // returning IS the record becoming durable (an in-memory Vec push stands in for a
    // real fsync'd append).
    fn append(&mut self, page_id: usize, full_page_image: [u8; PAGE_BYTES]) -> u64 {
        let lsn = self.next_lsn;
        self.next_lsn += 1;
        self.records.push(LogRecord { lsn, page_id, full_page_image });
        lsn
    }
}

// The write-ahead rule, followed correctly: log first, data later.
fn update_log_first(wal: &mut Wal, page: &mut Page, page_id: usize, new_image: [u8; PAGE_BYTES]) {
    let lsn = wal.append(page_id, new_image); // durability point reached first
    // A crash could happen right here, between the log append and the page write below.
    page.data = new_image;
    page.checksum = crc(&new_image);
    page.lsn = lsn;
}

// The rule violated: the page is written before its own change is durable in the log.
fn update_data_first_but_crash_before_logging(page: &mut Page, new_image: [u8; PAGE_BYTES]) {
    page.data = new_image;
    page.checksum = crc(&new_image);
    // A crash happens right here, between the page write above and the log append that
    // never gets to run. Nothing durable now describes this change at all.
}

// Redo is idempotent: a page that already reflects a record's own LSN is left alone.
// Only a record naming this page is a candidate at all.
fn redo(record: &LogRecord, page_id: usize, page: &mut Page) -> bool {
    if record.page_id != page_id || page.lsn >= record.lsn {
        return false;
    }
    page.data = record.full_page_image;
    page.checksum = crc(&record.full_page_image);
    page.lsn = record.lsn;
    true
}

fn crash_discard_page(_page: &mut Page) -> Page {
    // The dirty page, still only in memory, never reached disk before the crash.
    Page::new()
}

fn image(fill: u8) -> [u8; PAGE_BYTES] {
    let mut img = [0u8; PAGE_BYTES];
    for (i, b) in img.iter_mut().enumerate() {
        *b = fill.wrapping_add(i as u8);
    }
    img
}

fn main() {
    // ---- Claim 1: log-first survives the exact crash that data-first loses to. ----
    let mut wal = Wal::new();
    let mut page = Page::new();
    let update = image(10);
    update_log_first(&mut wal, &mut page, 1, update);
    // Crash: the page write never reached disk, but the log record already did.
    let mut page_after_crash = crash_discard_page(&mut page);
    for record in &wal.records {
        redo(record, 1, &mut page_after_crash);
    }
    let log_first_recovers_correctly = page_after_crash.data == update;

    let mut page2 = Page::new();
    let update2 = image(20);
    update_data_first_but_crash_before_logging(&mut page2, update2);
    // Crash: the exact same kind of interruption, but now nothing was ever logged.
    let wal2 = Wal::new();
    let mut page2_after_crash = crash_discard_page(&mut page2);
    for record in &wal2.records {
        redo(record, 1, &mut page2_after_crash);
    }
    let data_first_loses_the_update_silently = page2_after_crash.data != update2;

    // ---- Claim 2: redo is idempotent via page.lsn >= record.lsn. ----
    let mut wal3 = Wal::new();
    let mut page3 = Page::new();
    update_log_first(&mut wal3, &mut page3, 1, image(1));
    update_log_first(&mut wal3, &mut page3, 1, image(2));
    update_log_first(&mut wal3, &mut page3, 1, image(3));
    let state_after_three_updates = (page3.data, page3.lsn);
    // Re-running the already-applied first record changes nothing.
    let first_record = &wal3.records[0];
    let replayed_an_old_record = redo(first_record, 1, &mut page3);
    let page_unchanged_after_replaying_an_old_record =
        !replayed_an_old_record && (page3.data, page3.lsn) == state_after_three_updates;
    // Running the full recovery pass a second time over every record changes nothing either.
    let mut any_record_reapplied = false;
    for record in &wal3.records {
        if redo(record, 1, &mut page3) {
            any_record_reapplied = true;
        }
    }
    let second_recovery_pass_is_a_genuine_no_op =
        !any_record_reapplied && (page3.data, page3.lsn) == state_after_three_updates;

    // ---- Claim 3: a torn page is caught by its checksum, and fixed from a full-page image. ----
    let mut wal4 = Wal::new();
    let mut page4 = Page::new();
    let full_update = image(99);
    update_log_first(&mut wal4, &mut page4, 1, full_update);
    // Tear the page: a crash mid-write leaves half the bytes new, half still the old zeros.
    let mut torn = page4;
    for b in torn.data.iter_mut().take(PAGE_BYTES / 2) {
        *b = 0;
    }
    let torn_page_is_genuinely_caught = torn.is_torn();
    // The fix: recovery replaces the torn page outright from the log's own full-page image,
    // not by trying to patch just the torn half.
    let record = &wal4.records[0];
    torn.data = record.full_page_image;
    torn.checksum = crc(&record.full_page_image);
    torn.lsn = record.lsn;
    let full_page_write_fixes_it = !torn.is_torn() && torn.data == full_update;

    println!("log_first_recovers_correctly {}", log_first_recovers_correctly);
    println!("data_first_loses_the_update_silently {}", data_first_loses_the_update_silently);
    println!("page_unchanged_after_replaying_an_old_record {}", page_unchanged_after_replaying_an_old_record);
    println!("second_recovery_pass_is_a_genuine_no_op {}", second_recovery_pass_is_a_genuine_no_op);
    println!("torn_page_is_genuinely_caught {}", torn_page_is_genuinely_caught);
    println!("full_page_write_fixes_it {}", full_page_write_fixes_it);
}
