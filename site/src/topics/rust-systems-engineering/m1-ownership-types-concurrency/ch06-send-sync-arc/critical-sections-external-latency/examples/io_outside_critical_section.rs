// The same four threads and the same simulated 40ms "network call", but the
// call happens BEFORE the lock is taken. The lock now only protects the one
// memory write, so all four calls run concurrently: total wall time is close
// to 40ms, not 4 * 40ms.
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};

fn fake_network_call() {
    thread::sleep(Duration::from_millis(40));
}

fn main() {
    let lock = Arc::new(Mutex::new(0u32));
    let start = Instant::now();
    let handles: Vec<_> = (0..4)
        .map(|_| {
            let lock = Arc::clone(&lock);
            thread::spawn(move || {
                fake_network_call(); // the fix: do the I/O first, lock only for the memory write
                let mut guard = lock.lock().unwrap();
                *guard += 1;
            })
        })
        .collect();
    for h in handles {
        h.join().unwrap();
    }
    let elapsed_ms = start.elapsed().as_millis();
    println!("{}", elapsed_ms);
}
