// Atomicity: no torn updates. Eight threads each do many Relaxed fetch_adds
// on the same AtomicU64, with no lock anywhere. Relaxed gives no ordering
// guarantee at all, but it is still atomic: every single increment lands,
// none is lost or half-written, so the final count is exact every run.
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::thread;

const THREADS: u64 = 8;
const PER_THREAD: u64 = 50_000;

fn main() {
    let counter = Arc::new(AtomicU64::new(0));
    let handles: Vec<_> = (0..THREADS)
        .map(|_| {
            let counter = Arc::clone(&counter);
            thread::spawn(move || {
                for _ in 0..PER_THREAD {
                    counter.fetch_add(1, Ordering::Relaxed);
                }
            })
        })
        .collect();
    for h in handles {
        h.join().unwrap();
    }
    println!("{}", counter.load(Ordering::Relaxed));
}
