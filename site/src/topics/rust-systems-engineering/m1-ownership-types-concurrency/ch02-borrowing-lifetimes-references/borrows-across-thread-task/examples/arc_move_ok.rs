// A cloned, owned Arc<Mutex<i32>> moved into thread::spawn (no scope) satisfies 'static for
// free: the Arc owns its data, so the closure borrows nothing. The spawned thread is allowed
// to run past the end of the function that spawned it.
use std::sync::{Arc, Mutex};
use std::thread;

fn spawn_incrementer(counter: Arc<Mutex<i32>>) -> thread::JoinHandle<()> {
    let counter = Arc::clone(&counter);
    thread::spawn(move || {
        let mut guard = counter.lock().unwrap();
        *guard += 1;
    })
}

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let handle = spawn_incrementer(Arc::clone(&counter));
    handle.join().unwrap();
    println!("{}", *counter.lock().unwrap());
}
