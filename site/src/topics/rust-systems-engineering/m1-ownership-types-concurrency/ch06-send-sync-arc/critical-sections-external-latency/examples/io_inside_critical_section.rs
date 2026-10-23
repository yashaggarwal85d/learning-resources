// Four threads each do a simulated 40ms "network call" while HOLDING the lock.
// Only one thread can be inside the critical section at a time, so the lock
// serializes the external latency: total wall time is close to 4 * 40ms, not 40ms.
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
                let mut guard = lock.lock().unwrap();
                fake_network_call(); // the mistake: I/O while holding the lock
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
