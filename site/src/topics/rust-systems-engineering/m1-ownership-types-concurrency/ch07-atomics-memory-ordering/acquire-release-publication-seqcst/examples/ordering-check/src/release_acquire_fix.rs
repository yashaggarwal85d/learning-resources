// Chapter 7's previous topic broke this exact pattern with Relaxed: a writer
// stores a value and then a ready flag, a reader checks the flag and, if set,
// reads the value, and loom found an interleaving where the reader saw the
// flag before the value. Here the writer's flag store is Release and the
// reader's flag load is Acquire. Release orders every earlier operation on
// the writer's thread (including the Relaxed data store) before the flag
// store; Acquire orders every later operation on the reader's thread after a
// flag load that observes it. The pairing establishes a happens-before edge
// between the two threads, so loom cannot find an interleaving where the
// reader sees the flag true but the data still 0.
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

        if ready.load(Ordering::Acquire) {
            assert_eq!(data.load(Ordering::Relaxed), 42);
        }
    });
    println!("no violation found");
}
