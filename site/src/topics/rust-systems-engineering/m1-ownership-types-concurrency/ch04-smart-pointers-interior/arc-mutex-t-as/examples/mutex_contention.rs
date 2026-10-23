// Arc<Mutex<T>> is correct by construction: every increment is a genuine lock/unlock, so the
// final count is always right. What it hides is that every single access, from every thread,
// is forced through the exact same lock, one at a time, no matter how independent the work
// actually was. Measured with real wall-clock time (std::sync::Barrier + Instant), the same
// technique topic 12 used for Arc's atomic refcount.
use std::sync::{Arc, Barrier, Mutex};
use std::thread;
use std::time::Instant;

const TOTAL_OPS: usize = 4_000_000;
const THREADS: usize = 4;

fn increment_loop(counter: &Arc<Mutex<u64>>, ops: usize) {
    for _ in 0..ops {
        let mut guard = counter.lock().unwrap();
        *guard += 1;
    }
}

fn main() {
    // Correctness: one thread alone, the full total, checked against the exact expected count.
    let counter = Arc::new(Mutex::new(0u64));
    increment_loop(&counter, TOTAL_OPS);
    let correct = *counter.lock().unwrap() == TOTAL_OPS as u64;

    // Uncontended timing: the same single thread, alone, timed.
    let counter = Arc::new(Mutex::new(0u64));
    let start = Instant::now();
    increment_loop(&counter, TOTAL_OPS);
    let uncontended = start.elapsed();

    // Contended: the identical total split across THREADS threads, all on the same Mutex,
    // released together by a Barrier so they genuinely contend for the same lock.
    let counter = Arc::new(Mutex::new(0u64));
    let barrier = Arc::new(Barrier::new(THREADS));
    let per_thread = TOTAL_OPS / THREADS;
    let start = Instant::now();
    let handles: Vec<_> = (0..THREADS)
        .map(|_| {
            let c = Arc::clone(&counter);
            let b = Arc::clone(&barrier);
            thread::spawn(move || {
                b.wait();
                increment_loop(&c, per_thread);
            })
        })
        .collect();
    for h in handles {
        h.join().unwrap();
    }
    let contended = start.elapsed();

    println!("{} {} {}", correct, uncontended.as_nanos(), contended.as_nanos());
}
