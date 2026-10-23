use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    const WORKERS: u64 = 4;
    const PER_WORKER: u64 = 50_000;

    let counter: Arc<Mutex<u64>> = Arc::new(Mutex::new(0));
    let mut handles = Vec::new();
    for _ in 0..WORKERS {
        let c = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            for _ in 0..PER_WORKER {
                let mut guard = c.lock().unwrap();
                *guard += 1;
            }
        }));
    }
    for h in handles {
        h.join().unwrap();
    }
    println!("{}", *counter.lock().unwrap());
}
