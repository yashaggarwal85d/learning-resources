// The store-buffering (Dekker-style) litmus test: thread 1 stores to x then
// loads y; thread 2 stores to y then loads x, using Release stores and
// Acquire loads on both sides. Release/Acquire only orders a single pair
// against each other; it establishes no total order across every thread, so
// it does not forbid thread 1's load of y and thread 2's load of x from both
// observing 0 at once, even though every store is a Release and every load
// is an Acquire. loom finds that interleaving and the assertion fails.
use loom::sync::atomic::AtomicUsize;
use loom::sync::Arc;
use loom::thread;
use std::sync::atomic::Ordering;

fn main() {
    loom::model(|| {
        let x = Arc::new(AtomicUsize::new(0));
        let y = Arc::new(AtomicUsize::new(0));

        let x1 = x.clone();
        let y1 = y.clone();
        let t1 = thread::spawn(move || {
            x1.store(1, Ordering::Release);
            y1.load(Ordering::Acquire)
        });

        let x2 = x.clone();
        let y2 = y.clone();
        let t2 = thread::spawn(move || {
            y2.store(1, Ordering::Release);
            x2.load(Ordering::Acquire)
        });

        let r1 = t1.join().unwrap();
        let r2 = t2.join().unwrap();
        assert!(!(r1 == 0 && r2 == 0), "both loads saw 0: store-buffering reorder occurred");
    });
}
