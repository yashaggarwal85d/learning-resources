// Atomicity alone does not give ordering. One thread stores a value and then
// a "ready" flag, both Relaxed; the other thread checks the flag and, if it's
// set, reads the value. Every individual access is atomic (no torn update),
// but Relaxed gives no happens-before edge between the two threads, so the
// reader is allowed to see the flag before it sees the value. loom explores
// every legal interleaving the memory model permits (not just the ones that
// happen to occur on this one run) and panics if that bad interleaving
// actually exists among them. examples.py runs this binary and asserts it
// panics, rather than asserting a specific interleaving "happened" to occur.
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
            r1.store(true, Ordering::Relaxed);
        });

        if ready.load(Ordering::Relaxed) {
            assert_eq!(data.load(Ordering::Relaxed), 42);
        }
    });
    println!("no violation found");
}
