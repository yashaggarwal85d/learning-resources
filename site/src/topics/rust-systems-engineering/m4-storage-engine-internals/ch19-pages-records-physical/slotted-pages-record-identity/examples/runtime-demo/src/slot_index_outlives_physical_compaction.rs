// A real slotted page: topic 48's page format with one deliberate addition,
// an indirection layer (the slot array) between a record's own stable,
// logical identity (its slot index) and its physical offset inside the
// page. Line pointers grow from just after the header; tuple data grows
// from the end of the page downward, matching PostgreSQL's own reference
// layout directly.
const PAGE_SIZE: usize = 4096;
const HEADER_LEN: usize = 4; // slot_count: u16, data_end: u16
const SLOT_LEN: usize = 4; // offset: u16, len: u16 (0, 0 = a freed slot)

struct SlottedPage {
    bytes: [u8; PAGE_SIZE],
}

impl SlottedPage {
    fn new() -> Self {
        let mut bytes = [0u8; PAGE_SIZE];
        bytes[0..2].copy_from_slice(&0u16.to_le_bytes());
        bytes[2..4].copy_from_slice(&(PAGE_SIZE as u16).to_le_bytes());
        SlottedPage { bytes }
    }

    fn slot_count(&self) -> u16 {
        u16::from_le_bytes(self.bytes[0..2].try_into().unwrap())
    }

    fn data_end(&self) -> u16 {
        u16::from_le_bytes(self.bytes[2..4].try_into().unwrap())
    }

    fn slot_entry(&self, slot: usize) -> (u16, u16) {
        let off = HEADER_LEN + slot * SLOT_LEN;
        let offset = u16::from_le_bytes(self.bytes[off..off + 2].try_into().unwrap());
        let len = u16::from_le_bytes(self.bytes[off + 2..off + 4].try_into().unwrap());
        (offset, len)
    }

    fn set_slot_entry(&mut self, slot: usize, offset: u16, len: u16) {
        let off = HEADER_LEN + slot * SLOT_LEN;
        self.bytes[off..off + 2].copy_from_slice(&offset.to_le_bytes());
        self.bytes[off + 2..off + 4].copy_from_slice(&len.to_le_bytes());
    }

    // Allocates a new slot and writes the record into the free space just
    // below the current data region, returning the record's own, permanent
    // slot index -- never its physical offset.
    fn insert(&mut self, data: &[u8]) -> Option<usize> {
        let slot_count = self.slot_count();
        let slot_array_end = HEADER_LEN + (slot_count as usize + 1) * SLOT_LEN;
        let needed = data.len() as u16;
        let new_data_end = self.data_end().checked_sub(needed)?;
        if (new_data_end as usize) < slot_array_end {
            return None; // no room left between the slot array and the data region
        }
        let start = new_data_end as usize;
        self.bytes[start..start + data.len()].copy_from_slice(data);
        let new_slot = slot_count as usize;
        self.set_slot_entry(new_slot, new_data_end, needed);
        self.bytes[0..2].copy_from_slice(&(slot_count + 1).to_le_bytes());
        self.bytes[2..4].copy_from_slice(&new_data_end.to_le_bytes());
        Some(new_slot)
    }

    fn get(&self, slot: usize) -> Option<&[u8]> {
        let (offset, len) = self.slot_entry(slot);
        if len == 0 {
            return None;
        }
        let start = offset as usize;
        Some(&self.bytes[start..start + len as usize])
    }

    fn delete(&mut self, slot: usize) {
        self.set_slot_entry(slot, 0, 0);
    }

    // Physically rewrites the tuple region to close the gap a freed slot
    // left behind, rewriting each live slot's own offset field to its new
    // physical location. No slot's own index ever changes here.
    fn compact(&mut self) {
        let slot_count = self.slot_count() as usize;
        let mut live: Vec<(usize, Vec<u8>)> = Vec::new();
        for slot in 0..slot_count {
            let (offset, len) = self.slot_entry(slot);
            if len != 0 {
                let start = offset as usize;
                live.push((slot, self.bytes[start..start + len as usize].to_vec()));
            }
        }
        let mut cursor = PAGE_SIZE as u16;
        for (slot, data) in live {
            let new_offset = cursor - data.len() as u16;
            let start = new_offset as usize;
            self.bytes[start..start + data.len()].copy_from_slice(&data);
            self.set_slot_entry(slot, new_offset, data.len() as u16);
            cursor = new_offset;
        }
        self.bytes[2..4].copy_from_slice(&cursor.to_le_bytes());
    }
}

fn main() {
    // 1. Insert three variable-length records; each one's own content reads
    // back correctly through its own slot index alone.
    let mut page = SlottedPage::new();
    let a = page.insert(b"first record, short").unwrap();
    let b = page.insert(b"second record, a fair bit longer than the first one").unwrap();
    let c = page.insert(b"third").unwrap();
    let all_round_trip = page.get(a) == Some(&b"first record, short"[..])
        && page.get(b) == Some(&b"second record, a fair bit longer than the first one"[..])
        && page.get(c) == Some(&b"third"[..]);
    println!("insert_and_round_trip_by_slot {}", all_round_trip);

    // 2. Delete the middle record and compact: the surviving records' own
    // physical offsets change, even though their own slot index does not.
    let (a_offset_before, _) = page.slot_entry(a);
    let (c_offset_before, _) = page.slot_entry(c);
    page.delete(b);
    page.compact();
    let (a_offset_after, _) = page.slot_entry(a);
    let (c_offset_after, _) = page.slot_entry(c);
    let offsets_changed = a_offset_before != a_offset_after || c_offset_before != c_offset_after;
    println!("physical_offset_changed_after_compaction {}", offsets_changed);
    println!("slot_indices_unchanged {}", a == 0 && c == 2);

    // 3. Despite the physical move, reading by the same slot index still
    // returns the exact same content as before compaction.
    let content_still_correct =
        page.get(a) == Some(&b"first record, short"[..]) && page.get(c) == Some(&b"third"[..]);
    println!("content_correct_after_compaction {}", content_still_correct);

    // 4. A record too large for the page's own remaining free space is
    // rejected cleanly, with the page left genuinely uncorrupted -- the real
    // trigger for moving a value out of line in a real system.
    let too_big = vec![b'x'; PAGE_SIZE];
    let rejected = page.insert(&too_big).is_none();
    println!("oversized_insert_rejected_cleanly {}", rejected);
    let still_readable = page.get(a) == Some(&b"first record, short"[..]) && page.get(c) == Some(&b"third"[..]);
    println!("page_still_readable_after_rejected_insert {}", still_readable);
}
