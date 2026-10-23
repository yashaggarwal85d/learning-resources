// A fence can carry the Acquire/Release half of the handoff instead of the
// atomic operation itself. The spinlock here compare-exchanges its flag with
// Relaxed orderings only; the Acquire side of the handoff is a separate
// fence(Acquire) right after the lock is won, and the Release side is the
// flag store in unlock. The fence pairs with the next locker's fence the
// same way a Release store pairs with an Acquire load: it orders everything
// before it (in program order, on this thread) before everything after a
// matching Acquire-or-stronger fence or operation on the next thread that
// observes the release. That is enough to protect the plain, non-atomic
// counter the lock guards: four threads each take the lock many times and
// increment it, and the final value is exact.
use std::sync::atomic::{fence, AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;

struct SpinLock {
    flag: AtomicBool,
    counter: std::cell::UnsafeCell<u64>,
}

unsafe impl Sync for SpinLock {}

impl SpinLock {
    fn new() -> Self {
        SpinLock { flag: AtomicBool::new(false), counter: std::cell::UnsafeCell::new(0) }
    }

    fn with_lock(&self, f: impl FnOnce(&mut u64)) {
        while self.flag.compare_exchange_weak(false, true, Ordering::Relaxed, Ordering::Relaxed).is_err() {}
        fence(Ordering::Acquire);
        unsafe { f(&mut *self.counter.get()) };
        self.flag.store(false, Ordering::Release);
    }
}

fn main() {
    let lock = Arc::new(SpinLock::new());
    let handles: Vec<_> = (0..4)
        .map(|_| {
            let lock = Arc::clone(&lock);
            thread::spawn(move || {
                for _ in 0..25_000 {
                    lock.with_lock(|c| *c += 1);
                }
            })
        })
        .collect();
    for h in handles {
        h.join().unwrap();
    }
    lock.with_lock(|c| println!("{c}"));
}
