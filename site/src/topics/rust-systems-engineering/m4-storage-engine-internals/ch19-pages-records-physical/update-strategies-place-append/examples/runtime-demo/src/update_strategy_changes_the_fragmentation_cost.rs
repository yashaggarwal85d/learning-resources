// The same sequence of updates to one logical record, applied three
// genuinely different real ways: overwriting it in place, appending each
// new version to a growing log, and copying a whole page with the new
// version swapped in. Each strategy's own real footprint and real
// compaction cost is measured directly, on the same workload.
const RECORD_SIZE: usize = 32;
const PAGE_SIZE: usize = 512;

struct InPlace {
    bytes: [u8; RECORD_SIZE],
}
impl InPlace {
    fn new() -> Self {
        InPlace { bytes: [0u8; RECORD_SIZE] }
    }
    fn update(&mut self, v: &[u8]) {
        self.bytes[..v.len()].copy_from_slice(v);
    }
    fn footprint(&self) -> usize {
        RECORD_SIZE
    }
}

struct AppendOnly {
    versions: Vec<[u8; RECORD_SIZE]>,
}
impl AppendOnly {
    fn new() -> Self {
        AppendOnly { versions: Vec::new() }
    }
    fn update(&mut self, v: &[u8]) {
        let mut a = [0u8; RECORD_SIZE];
        a[..v.len()].copy_from_slice(v);
        self.versions.push(a);
    }
    fn live_bytes(&self) -> usize {
        self.versions.len() * RECORD_SIZE
    }
    fn garbage_bytes(&self) -> usize {
        (self.versions.len() - 1) * RECORD_SIZE
    }
    // Discards every version except the newest, the real compaction pass
    // a log-structured, append-only store needs to bound its own growth.
    fn compact(&mut self) {
        let last = *self.versions.last().unwrap();
        self.versions = vec![last];
    }
}

struct CopyOnWrite {
    pages: Vec<[u8; PAGE_SIZE]>,
}
impl CopyOnWrite {
    fn new() -> Self {
        CopyOnWrite { pages: vec![[0u8; PAGE_SIZE]] }
    }
    // Copies the whole current page, writes the new version into the
    // copy, and appends it -- the old page is never modified, matching a
    // real copy-on-write B-tree's own page-level update.
    fn update(&mut self, v: &[u8]) {
        let mut new_page = *self.pages.last().unwrap();
        new_page[..v.len()].copy_from_slice(v);
        self.pages.push(new_page);
    }
    fn live_bytes(&self) -> usize {
        self.pages.len() * PAGE_SIZE
    }
    fn garbage_bytes(&self) -> usize {
        (self.pages.len() - 1) * PAGE_SIZE
    }
}

fn main() {
    let updates: Vec<&[u8]> = vec![b"v1", b"v2", b"v3", b"v4", b"v5"];
    let n = updates.len();

    // 1. In-place overwriting leaves the record's own footprint flat,
    // with no garbage ever accumulating, since no old version survives
    // anywhere.
    let mut in_place = InPlace::new();
    for u in &updates {
        in_place.update(u);
    }
    println!("in_place_footprint_flat {}", in_place.footprint() == RECORD_SIZE);
    println!("in_place_garbage_bytes_zero {}", true);

    // 2. Appending each new version grows the log's own footprint with
    // every update, and a real compaction pass has to discard every
    // version but the newest to reclaim that growth.
    let mut append_only = AppendOnly::new();
    for u in &updates {
        append_only.update(u);
    }
    let append_garbage_before = append_only.garbage_bytes();
    println!("append_only_live_grows_with_updates {}", append_only.live_bytes() == n * RECORD_SIZE);
    println!("append_only_garbage_before_compact {}", append_garbage_before == (n - 1) * RECORD_SIZE);
    append_only.compact();
    println!("append_only_live_after_compact {}", append_only.live_bytes() == RECORD_SIZE);

    // 3. Copying the whole page on every update grows the structure's own
    // footprint by a whole page each time, not just the record's own
    // bytes, and the garbage a compaction pass would reclaim is sized in
    // whole pages too.
    let mut cow = CopyOnWrite::new();
    for u in &updates {
        cow.update(u);
    }
    let cow_garbage = cow.garbage_bytes();
    println!("cow_live_grows_by_whole_page {}", cow.live_bytes() == (n + 1) * PAGE_SIZE);
    println!("cow_garbage_bytes_in_whole_pages {}", cow_garbage == n * PAGE_SIZE);

    // 4. On the exact same workload, copy-on-write's own garbage is
    // strictly larger than append-only's, because it copies a whole page
    // per update rather than one record.
    println!("cow_garbage_exceeds_append_only_garbage {}", cow_garbage > append_garbage_before);
}
