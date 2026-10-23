// "Arc::clone is cheap" stops being true under contention: every clone and drop is an atomic
// read-modify-write on a shared cache line. This measures real wall-clock time for the identical
// total number of clone/drop pairs on the identical Arc, once done by a single thread (uncontended)
// and once split across several threads all hitting the same shared count at once (contended), and
// checks that splitting the work did not come anywhere near the speedup more threads would promise
// if the refcount were free to touch.
use std::sync::{Arc, Barrier};
use std::thread;
use std::time::Instant;

const TOTAL_OPS: usize = 8_000_000;
const THREADS: usize = 4;

fn clone_drop_loop(shared: &Arc<u8>, ops: usize) {
    for _ in 0..ops {
        let c = Arc::clone(shared);
        drop(c);
    }
}

fn main() {
    let shared = Arc::new(0u8);

    // Uncontended: one thread, alone, touching the count TOTAL_OPS times.
    let start = Instant::now();
    clone_drop_loop(&shared, TOTAL_OPS);
    let uncontended = start.elapsed();

    // Contended: the identical TOTAL_OPS split across THREADS threads, all on the same Arc,
    // released together by a Barrier so they genuinely race for the same cache line.
    let barrier = Arc::new(Barrier::new(THREADS));
    let per_thread = TOTAL_OPS / THREADS;
    let start = Instant::now();
    let handles: Vec<_> = (0..THREADS)
        .map(|_| {
            let s = Arc::clone(&shared);
            let b = Arc::clone(&barrier);
            thread::spawn(move || {
                b.wait();
                clone_drop_loop(&s, per_thread);
            })
        })
        .collect();
    for h in handles {
        h.join().unwrap();
    }
    let contended = start.elapsed();

    let ideal_contended = uncontended / THREADS as u32;
    println!(
        "{} {} {}",
        uncontended.as_nanos(),
        contended.as_nanos(),
        ideal_contended.as_nanos()
    );
}
