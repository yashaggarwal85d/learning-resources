use parking_lot::Mutex;
use std::sync::Arc;
use std::thread;

fn main() {
    let m: Arc<Mutex<u64>> = Arc::new(Mutex::new(7));
    let m2 = Arc::clone(&m);
    let handle = thread::spawn(move || {
        let _guard = m2.lock();
        panic!("boom while holding the lock");
    });
    let _ = handle.join();

    // No Result at all: parking_lot's lock() hands back the guard directly, never poisoned.
    let value = *m.lock();
    println!("{}", value);
}
