use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let m: Arc<Mutex<u64>> = Arc::new(Mutex::new(7));
    let m2 = Arc::clone(&m);
    let handle = thread::spawn(move || {
        let _guard = m2.lock().unwrap();
        panic!("boom while holding the lock");
    });
    let _ = handle.join();

    let poisoned = m.lock().is_err();
    let recovered = *m.lock().unwrap_err().into_inner();

    println!("{} {}", poisoned, recovered);
}
