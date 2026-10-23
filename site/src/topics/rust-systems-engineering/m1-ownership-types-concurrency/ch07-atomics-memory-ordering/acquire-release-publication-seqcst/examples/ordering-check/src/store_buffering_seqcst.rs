// The same store-buffering litmus test as store_buffering_acqrel.rs, with
// every access upgraded to SeqCst. SeqCst's extra guarantee, beyond
// Acquire/Release, is that every thread agrees on one single global order of
// every SeqCst operation. Under that total order, one of the two stores must
// come first, and whichever load runs after it is entitled to see it, so
// "both loads see 0" is no longer reachable. loom explores every legal
// interleaving and finds none that violates the assertion.
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
            x1.store(1, Ordering::SeqCst);
            y1.load(Ordering::SeqCst)
        });

        let x2 = x.clone();
        let y2 = y.clone();
        let t2 = thread::spawn(move || {
            y2.store(1, Ordering::SeqCst);
            x2.load(Ordering::SeqCst)
        });

        let r1 = t1.join().unwrap();
        let r2 = t2.join().unwrap();
        assert!(!(r1 == 0 && r2 == 0), "both loads saw 0 under SeqCst, which should be unreachable");
    });
    println!("no violation found");
}
