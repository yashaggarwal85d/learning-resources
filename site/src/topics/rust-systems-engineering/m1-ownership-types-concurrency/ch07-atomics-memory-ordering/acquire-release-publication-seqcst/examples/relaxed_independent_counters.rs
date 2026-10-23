// Not every atomic needs ordering at all. Eight threads each add to their own
// independent counter, Relaxed, with no publication between threads and no
// data being handed off through the increments. Relaxed guarantees the
// increments are atomic (no torn updates, no lost updates), which is the only
// property this program needs: each counter's own final value only depends
// on operations on that same counter, so there is nothing for a stronger
// ordering to add.
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::thread;

fn main() {
    let counters: Vec<Arc<AtomicUsize>> = (0..8).map(|_| Arc::new(AtomicUsize::new(0))).collect();
    let handles: Vec<_> = counters
        .iter()
        .cloned()
        .map(|c| {
            thread::spawn(move || {
                for _ in 0..50_000 {
                    c.fetch_add(1, Ordering::Relaxed);
                }
            })
        })
        .collect();
    for h in handles {
        h.join().unwrap();
    }
    let total: usize = counters.iter().map(|c| c.load(Ordering::Relaxed)).sum();
    println!("{total}");
}
