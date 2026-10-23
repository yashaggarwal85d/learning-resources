// Fixing only the write side is not enough: the writer's flag store is
// Release, exactly as in release_acquire_fix.rs, but the reader's flag load
// here stays Relaxed instead of Acquire. A Release store only promises that
// its own earlier writes become visible to a load that is itself Acquire (or
// stronger); a Relaxed load does not ask for that promise, so it is not
// entitled to it. loom still finds the interleaving where the reader sees
// the flag true but the data store has not become visible yet.
use loom::sync::atomic::{AtomicBool, AtomicUsize};
use loom::sync::Arc;
use loom::thread;
use std::sync::atomic::Ordering;

fn main() {
    loom::model(|| {
        let data = Arc::new(AtomicUsize::new(0));
        let ready = Arc::new(AtomicBool::new(false));

        let d1 = data.clone();
        let r1 = ready.clone();
        thread::spawn(move || {
            d1.store(42, Ordering::Relaxed);
            r1.store(true, Ordering::Release);
        });

        if ready.load(Ordering::Relaxed) {
            assert_eq!(data.load(Ordering::Relaxed), 42);
        }
    });
    println!("no violation found");
}
