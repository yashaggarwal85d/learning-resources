// The identical two locks and the identical two threads, except both threads
// now acquire them in the SAME order (lock_a, then lock_b). The circular wait
// the deadlock needed can no longer form, so this always finishes.
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

fn main() {
    let lock_a = Arc::new(Mutex::new(0u32));
    let lock_b = Arc::new(Mutex::new(0u32));

    let (a1, b1) = (Arc::clone(&lock_a), Arc::clone(&lock_b));
    let t1 = thread::spawn(move || {
        let _ga = a1.lock().unwrap();
        thread::sleep(Duration::from_millis(50));
        let _gb = b1.lock().unwrap();
    });

    let (a2, b2) = (Arc::clone(&lock_a), Arc::clone(&lock_b));
    let t2 = thread::spawn(move || {
        let _ga = a2.lock().unwrap(); // same order as t1: lock_a, then lock_b
        thread::sleep(Duration::from_millis(50));
        let _gb = b2.lock().unwrap();
    });

    t1.join().unwrap();
    t2.join().unwrap();
    println!("done");
}
