// A real, minimal B+-tree over fixed-size byte buffers playing the role
// of disk pages, each page a self-describing header plus a fixed-size
// entry array (continuing this milestone's own page-and-slot pattern).

const PAGE_BYTES: usize = 64;
const HEADER_BYTES: usize = 8;
const ENTRY_BYTES: usize = 8;
const CAPACITY: usize = (PAGE_BYTES - HEADER_BYTES) / ENTRY_BYTES; // 7

const LEAF: u8 = 0;
const INTERNAL: u8 = 1;

struct PageStore {
    pages: Vec<[u8; PAGE_BYTES]>,
}

impl PageStore {
    fn new() -> Self {
        PageStore { pages: Vec::new() }
    }

    fn alloc(&mut self, page_type: u8, leftmost_child: u32) -> u32 {
        let mut buf = [0u8; PAGE_BYTES];
        buf[0] = page_type;
        buf[1] = 0; // num_entries
        buf[4..8].copy_from_slice(&leftmost_child.to_be_bytes());
        self.pages.push(buf);
        (self.pages.len() - 1) as u32
    }

    fn page_type(&self, id: u32) -> u8 {
        self.pages[id as usize][0]
    }

    fn num_entries(&self, id: u32) -> usize {
        self.pages[id as usize][1] as usize
    }

    fn leftmost_child(&self, id: u32) -> u32 {
        u32::from_be_bytes(self.pages[id as usize][4..8].try_into().unwrap())
    }

    fn entry(&self, id: u32, slot: usize) -> (u32, u32) {
        let off = HEADER_BYTES + slot * ENTRY_BYTES;
        let page = &self.pages[id as usize];
        let a = u32::from_be_bytes(page[off..off + 4].try_into().unwrap());
        let b = u32::from_be_bytes(page[off + 4..off + 8].try_into().unwrap());
        (a, b)
    }

    fn set_entry(&mut self, id: u32, slot: usize, a: u32, b: u32) {
        let off = HEADER_BYTES + slot * ENTRY_BYTES;
        let page = &mut self.pages[id as usize];
        page[off..off + 4].copy_from_slice(&a.to_be_bytes());
        page[off + 4..off + 8].copy_from_slice(&b.to_be_bytes());
    }

    fn set_num_entries(&mut self, id: u32, n: usize) {
        self.pages[id as usize][1] = n as u8;
    }

    // Insert a (key, second) pair into a page's sorted entry array at the
    // correct position, shifting later entries right. Caller must have
    // already checked there is room (num_entries < CAPACITY).
    fn insert_sorted(&mut self, id: u32, key: u32, second: u32) {
        let n = self.num_entries(id);
        let mut pos = n;
        for i in 0..n {
            let (k, _) = self.entry(id, i);
            if key < k {
                pos = i;
                break;
            }
        }
        let mut i = n;
        while i > pos {
            let prev = self.entry(id, i - 1);
            self.set_entry(id, i, prev.0, prev.1);
            i -= 1;
        }
        self.set_entry(id, pos, key, second);
        self.set_num_entries(id, n + 1);
    }
}

/// Splits an overflowing page's `CAPACITY + 1` logical entries (the stored
/// `CAPACITY` entries plus one more, all passed in sorted) into a left and
/// right half. `fill_factor` decides how much of the overflowing page's
/// entries stay on the left: a higher fill factor packs the left side
/// fuller and leaves the right side with more room to absorb further
/// sequential inserts before its own next split.
fn split_point(fill_factor: f64) -> usize {
    let total = CAPACITY + 1;
    let left = ((total as f64) * fill_factor).floor() as usize;
    left.clamp(1, total - 1)
}

struct SplitUp {
    separator: u32,
    new_right_page: u32,
}

fn insert_into_leaf(
    store: &mut PageStore,
    page_id: u32,
    key: u32,
    value: u32,
    fill_factor: f64,
) -> Option<SplitUp> {
    let n = store.num_entries(page_id);
    if n < CAPACITY {
        store.insert_sorted(page_id, key, value);
        return None;
    }

    // Overflow: gather all CAPACITY + 1 entries in sorted order, then split.
    let mut all: Vec<(u32, u32)> = (0..n).map(|i| store.entry(page_id, i)).collect();
    let pos = all.partition_point(|&(k, _)| k < key);
    all.insert(pos, (key, value));

    let left_count = split_point(fill_factor);
    let right_entries = &all[left_count..];
    let separator = right_entries[0].0;

    let right_id = store.alloc(LEAF, 0);
    for (i, &(k, v)) in right_entries.iter().enumerate() {
        store.set_entry(right_id, i, k, v);
    }
    store.set_num_entries(right_id, right_entries.len());

    for (i, &(k, v)) in all[..left_count].iter().enumerate() {
        store.set_entry(page_id, i, k, v);
    }
    store.set_num_entries(page_id, left_count);

    Some(SplitUp {
        separator,
        new_right_page: right_id,
    })
}

fn insert_into_internal(
    store: &mut PageStore,
    page_id: u32,
    separator: u32,
    new_right_page: u32,
    fill_factor: f64,
) -> Option<SplitUp> {
    let n = store.num_entries(page_id);
    if n < CAPACITY {
        store.insert_sorted(page_id, separator, new_right_page);
        return None;
    }

    let mut all: Vec<(u32, u32)> = (0..n).map(|i| store.entry(page_id, i)).collect();
    let pos = all.partition_point(|&(k, _)| k < separator);
    all.insert(pos, (separator, new_right_page));

    let left_count = split_point(fill_factor);
    let pushed_up = all[left_count].0;
    let right_leftmost_child = all[left_count].1;
    let right_entries = &all[left_count + 1..];

    let right_id = store.alloc(INTERNAL, right_leftmost_child);
    for (i, &(k, c)) in right_entries.iter().enumerate() {
        store.set_entry(right_id, i, k, c);
    }
    store.set_num_entries(right_id, right_entries.len());

    for (i, &(k, c)) in all[..left_count].iter().enumerate() {
        store.set_entry(page_id, i, k, c);
    }
    store.set_num_entries(page_id, left_count);

    Some(SplitUp {
        separator: pushed_up,
        new_right_page: right_id,
    })
}

/// Walks down from `root_id` to the child that `key` belongs in, returning
/// the chain of (internal_page_id, slot_to_insert_at) from root to just
/// above the leaf, and the leaf's own page id.
fn find_leaf_path(store: &PageStore, root_id: u32, key: u32) -> (Vec<u32>, u32) {
    let mut path = Vec::new();
    let mut cur = root_id;
    while store.page_type(cur) == INTERNAL {
        path.push(cur);
        let n = store.num_entries(cur);
        let mut child = store.leftmost_child(cur);
        for i in 0..n {
            let (sep, c) = store.entry(cur, i);
            if key >= sep {
                child = c;
            } else {
                break;
            }
        }
        cur = child;
    }
    (path, cur)
}

/// Inserts `key` -> `value`, splitting and propagating up the path as
/// needed, and returns the tree's root page id (unchanged unless the old
/// root itself split, in which case a brand-new root is returned).
fn insert(store: &mut PageStore, root_id: u32, key: u32, value: u32, fill_factor: f64) -> u32 {
    let (path, leaf_id) = find_leaf_path(store, root_id, key);
    let mut up = insert_into_leaf(store, leaf_id, key, value, fill_factor);

    for &parent_id in path.iter().rev() {
        let split = match up.take() {
            Some(s) => s,
            None => return root_id,
        };
        up = insert_into_internal(store, parent_id, split.separator, split.new_right_page, fill_factor);
    }

    match up {
        None => root_id,
        Some(split) => {
            let new_root = store.alloc(INTERNAL, root_id);
            store.set_entry(new_root, 0, split.separator, split.new_right_page);
            store.set_num_entries(new_root, 1);
            new_root
        }
    }
}

fn lookup(store: &PageStore, root_id: u32, key: u32) -> Option<u32> {
    let (_, leaf_id) = find_leaf_path(store, root_id, key);
    let n = store.num_entries(leaf_id);
    for i in 0..n {
        let (k, v) = store.entry(leaf_id, i);
        if k == key {
            return Some(v);
        }
    }
    None
}

fn tree_height(store: &PageStore, root_id: u32) -> u32 {
    let mut height = 1;
    let mut cur = root_id;
    while store.page_type(cur) == INTERNAL {
        height += 1;
        cur = store.leftmost_child(cur);
    }
    height
}

/// Builds a tree by inserting `keys` in order with the given fill factor,
/// returning the final root id, the store, and the total number of real
/// page splits (leaf or internal) that occurred along the way.
fn build_tree(keys: &[u32], fill_factor: f64) -> (PageStore, u32, usize) {
    let mut store = PageStore::new();
    let mut root = store.alloc(LEAF, 0);
    let mut splits = 0usize;
    for &k in keys {
        let before = store.pages.len();
        root = insert(&mut store, root, k, k * 10, fill_factor);
        let after = store.pages.len();
        // Every new page allocated beyond the very first root is a split.
        splits += after - before;
    }
    (store, root, splits)
}

// ---- Claim C: prefix/suffix truncation on a multi-attribute key ----
// A separator key only needs to carry attributes up to and including the
// first one that actually distinguishes the left page's last key from
// the right page's first key; later attributes can be truncated away
// (they implicitly compare as "negative infinity"), the way PostgreSQL's
// nbtree truncates pivot tuples on a leaf page split.
fn truncate_separator(left_last: [u8; 4], right_first: [u8; 4]) -> Vec<u8> {
    let mut i = 0;
    while i < 4 && left_last[i] == right_first[i] {
        i += 1;
    }
    // Keep attributes 0..=i (the first differing one included).
    right_first[..=i.min(3)].to_vec()
}

/// A truncated separator still has to route correctly: any key less than
/// it belongs left, any key greater-or-equal belongs right. We compare a
/// truncated separator against the same full-length keys it was built
/// from by padding it back out with zero ("negative infinity") bytes.
fn routes_right(separator: &[u8], key: [u8; 4]) -> bool {
    let mut padded = [0u8; 4];
    padded[..separator.len()].copy_from_slice(separator);
    key >= padded
}

fn main() {
    // ---- Claim A: inserting past a page's own fill factor genuinely
    // triggers a real split, propagating a new separator key into the
    // parent. ----
    let fill_factor = 0.8;
    let mut store = PageStore::new();
    let root = store.alloc(LEAF, 0);
    let mut cur_root = root;
    for k in 0..CAPACITY as u32 {
        cur_root = insert(&mut store, cur_root, k, k * 10, fill_factor);
    }
    let root_before_overflow = cur_root;
    let page_count_before = store.pages.len();
    let was_single_leaf_before = store.page_type(root_before_overflow) == LEAF
        && store.num_entries(root_before_overflow) == CAPACITY;

    cur_root = insert(&mut store, cur_root, CAPACITY as u32, (CAPACITY as u32) * 10, fill_factor);
    let page_count_after = store.pages.len();
    let a_split_actually_allocated_a_new_page = page_count_after > page_count_before;
    let a_root_became_internal_with_a_real_separator =
        store.page_type(cur_root) == INTERNAL && store.num_entries(cur_root) == 1;
    let mut a_every_original_key_still_found_after_the_split = true;
    for k in 0..=(CAPACITY as u32) {
        if lookup(&store, cur_root, k) != Some(k * 10) {
            a_every_original_key_still_found_after_the_split = false;
        }
    }

    // ---- Claim B: the tree's own depth stays small even as the number
    // of inserted records grows into the thousands. ----
    let n_records: u32 = 4000;
    let keys: Vec<u32> = (0..n_records).collect();
    let (big_store, big_root, _) = build_tree(&keys, fill_factor);
    let height = tree_height(&big_store, big_root);
    let b_depth_stayed_within_a_handful_of_levels = height <= 5;
    let mut b_every_record_is_still_correctly_found = true;
    for k in (0..n_records).step_by(37) {
        if lookup(&big_store, big_root, k) != Some(k * 10) {
            b_every_record_is_still_correctly_found = false;
        }
    }

    // ---- Fill factor: a higher fill factor genuinely reduces the number
    // of splits over the same sequential-insert workload, by packing the
    // left side fuller and leaving the right side more room to absorb
    // further appends before its own next split. ----
    let (_, _, splits_high_fill_factor) = build_tree(&keys, 0.9);
    let (_, _, splits_low_fill_factor) = build_tree(&keys, 0.5);
    let fill_factor_smooths_the_rate_of_splits = splits_high_fill_factor < splits_low_fill_factor;

    // ---- Claim C: a separator key stored with prefix/suffix truncation
    // genuinely takes less space than one stored in full, and still
    // correctly routes lookups. ----
    let left_last = [6u8, 0, 0, 9];
    let right_first = [6u8, 1, 0, 0];
    let full_separator = right_first.to_vec();
    let truncated = truncate_separator(left_last, right_first);
    let c_truncated_separator_is_genuinely_smaller = truncated.len() < full_separator.len();

    let test_keys = [
        [5u8, 9, 9, 9], // belongs left
        [6, 0, 9, 9],   // belongs left
        [6, 1, 0, 0],   // belongs right (the boundary key itself)
        [6, 2, 0, 0],   // belongs right
        [7, 0, 0, 0],   // belongs right
    ];
    let mut c_truncated_separator_routes_identically_to_the_full_one = true;
    for &k in &test_keys {
        if routes_right(&truncated, k) != routes_right(&full_separator, k) {
            c_truncated_separator_routes_identically_to_the_full_one = false;
        }
    }

    println!("a_split_actually_allocated_a_new_page {}", a_split_actually_allocated_a_new_page);
    println!("a_root_became_internal_with_a_real_separator {}", a_root_became_internal_with_a_real_separator);
    println!("a_every_original_key_still_found_after_the_split {}", a_every_original_key_still_found_after_the_split);
    println!("was_single_leaf_before {}", was_single_leaf_before);
    println!("b_depth_stayed_within_a_handful_of_levels {}", b_depth_stayed_within_a_handful_of_levels);
    println!("b_every_record_is_still_correctly_found {}", b_every_record_is_still_correctly_found);
    println!("fill_factor_smooths_the_rate_of_splits {}", fill_factor_smooths_the_rate_of_splits);
    println!("c_truncated_separator_is_genuinely_smaller {}", c_truncated_separator_is_genuinely_smaller);
    println!(
        "c_truncated_separator_routes_identically_to_the_full_one {}",
        c_truncated_separator_routes_identically_to_the_full_one
    );
}
