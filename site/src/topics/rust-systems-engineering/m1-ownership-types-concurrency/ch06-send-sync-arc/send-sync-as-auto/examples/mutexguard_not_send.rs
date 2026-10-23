use std::sync::Mutex;
use std::thread;

fn main() {
    let m: Mutex<u64> = Mutex::new(0);
    let guard = m.lock().unwrap();
    let handle = thread::spawn(move || {
        drop(guard);
    });
    handle.join().unwrap();
}
