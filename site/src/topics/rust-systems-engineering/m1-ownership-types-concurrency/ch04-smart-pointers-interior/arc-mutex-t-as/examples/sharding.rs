// The identical total work, split so that no two threads ever touch the same lock: each thread
// gets its own shard of the counter, with its own independent Mutex. Measured the same way as
// mutex_contention.rs, for a direct comparison.
use std::sync::{Arc, Barrier, Mutex};
use std::thread;
use std::time::Instant;

const TOTAL_OPS: usize = 4_000_000;
const THREADS: usize = 4;

fn main() {
    let shards: Vec<Arc<Mutex<u64>>> = (0..THREADS).map(|_| Arc::new(Mutex::new(0u64))).collect();
    let per_thread = TOTAL_OPS / THREADS;
    let barrier = Arc::new(Barrier::new(THREADS));

    let start = Instant::now();
    let handles: Vec<_> = shards
        .iter()
        .map(|shard| {
            let shard = Arc::clone(shard);
            let b = Arc::clone(&barrier);
            thread::spawn(move || {
                b.wait();
                for _ in 0..per_thread {
                    let mut guard = shard.lock().unwrap();
                    *guard += 1;
                }
            })
        })
        .collect();
    for h in handles {
        h.join().unwrap();
    }
    let sharded = start.elapsed();

    let total: u64 = shards.iter().map(|s| *s.lock().unwrap()).sum();
    let correct = total == TOTAL_OPS as u64;
    println!("{} {}", correct, sharded.as_nanos());
}
