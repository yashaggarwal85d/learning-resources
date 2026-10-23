// Two locks, two threads, each acquiring them in the OPPOSITE order: the
// classic lock-inversion deadlock. Thread A holds lock_a and waits for
// lock_b; thread B holds lock_b and waits for lock_a. Neither ever proceeds.
// This program is expected to hang forever; examples.py proves that by
// running it under a short wall-clock timeout and asserting it times out.
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

fn main() {
    let lock_a = Arc::new(Mutex::new(0u32));
    let lock_b = Arc::new(Mutex::new(0u32));

    let (a1, b1) = (Arc::clone(&lock_a), Arc::clone(&lock_b));
    let t1 = thread::spawn(move || {
        let _ga = a1.lock().unwrap();
        thread::sleep(Duration::from_millis(50)); // widen the window so t2 is guaranteed to be waiting on lock_b
        let _gb = b1.lock().unwrap();
    });

    let (a2, b2) = (Arc::clone(&lock_a), Arc::clone(&lock_b));
    let t2 = thread::spawn(move || {
        let _gb = b2.lock().unwrap();
        thread::sleep(Duration::from_millis(50));
        let _ga = a2.lock().unwrap();
    });

    t1.join().unwrap();
    t2.join().unwrap();
    println!("never reached");
}
