use std::alloc::{GlobalAlloc, Layout, System};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Instant;

struct CountingAllocator;

static ALLOCATED: AtomicUsize = AtomicUsize::new(0);

unsafe impl GlobalAlloc for CountingAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        ALLOCATED.fetch_add(layout.size(), Ordering::SeqCst);
        unsafe { System.alloc(layout) }
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        unsafe { System.dealloc(ptr, layout) }
    }
}

#[global_allocator]
static GLOBAL: CountingAllocator = CountingAllocator;

const N_RECORDS: usize = 20_000;
const RECORD_SIZE: usize = 200;

fn checksum(bytes: &[u8]) -> u64 {
    let mut acc: u64 = 0;
    for &b in bytes {
        acc = acc.wrapping_mul(31).wrapping_add(b as u64);
    }
    acc
}

// Borrows each record's own backing buffer directly; the only real
// allocation in the whole function is the one output vector, sized
// once, up front, for the whole real run.
fn transform_move(records: &[Vec<u8>]) -> Vec<u64> {
    let mut out = Vec::with_capacity(records.len());
    for r in records {
        out.push(checksum(r));
    }
    out
}

// Clones each record's own backing buffer before doing the identical
// real work, a real, needless allocation on every single record.
fn transform_clone(records: &[Vec<u8>]) -> Vec<u64> {
    let mut out = Vec::with_capacity(records.len());
    for r in records {
        let cloned = r.clone();
        out.push(checksum(&cloned));
    }
    out
}

fn measure(records: &[Vec<u8>], f: impl Fn(&[Vec<u8>]) -> Vec<u64>) -> (u128, usize, u64) {
    let before = ALLOCATED.load(Ordering::SeqCst);
    let start = Instant::now();
    let out = f(records);
    let elapsed = start.elapsed().as_micros();
    let after = ALLOCATED.load(Ordering::SeqCst);
    let checksum_sum: u64 = out.iter().fold(0u64, |a, &b| a.wrapping_add(b));
    (elapsed, after - before, checksum_sum)
}

fn main() {
    let records: Vec<Vec<u8>> = (0..N_RECORDS)
        .map(|i| vec![(i % 256) as u8; RECORD_SIZE])
        .collect();

    // Warm up both paths once so the real, measured run is not paying
    // for first-touch page faults or allocator warm-up on just one side.
    let _ = measure(&records, transform_move);
    let _ = measure(&records, transform_clone);

    let (move_us, move_bytes, move_sum) = measure(&records, transform_move);
    let (clone_us, clone_bytes, clone_sum) = measure(&records, transform_clone);

    let move_records_per_sec = (N_RECORDS as f64) / (move_us as f64 / 1_000_000.0);
    let clone_records_per_sec = (N_RECORDS as f64) / (clone_us as f64 / 1_000_000.0);

    let move_bytes_per_record = move_bytes / N_RECORDS;
    let clone_bytes_per_record = clone_bytes / N_RECORDS;

    assert_eq!(move_sum, clone_sum, "both transforms must compute the identical result");

    println!("n_records={}", N_RECORDS);
    println!("record_size_bytes={}", RECORD_SIZE);
    println!("move_elapsed_us={}", move_us);
    println!("clone_elapsed_us={}", clone_us);
    println!("move_records_per_sec={}", move_records_per_sec as u64);
    println!("clone_records_per_sec={}", clone_records_per_sec as u64);
    println!("move_bytes_allocated={}", move_bytes);
    println!("clone_bytes_allocated={}", clone_bytes);
    println!("move_bytes_per_record={}", move_bytes_per_record);
    println!("clone_bytes_per_record={}", clone_bytes_per_record);
}
